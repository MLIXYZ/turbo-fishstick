import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {
    sequelize,
    Product,
    Order,
    OrderItem,
    Transaction,
    User,
    DiscountCodeLog,
} from '../models'
import { getTaxRateForZip } from '../utils/tax'

const router = express.Router()

const JWT_SECRET =
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
const SALT_ROUNDS = 10

interface CartItem {
    productId: number
    quantity: number
}

interface CheckoutBody {
    cartItems: CartItem[]
    paymentMethod: 'card' | 'crypto' | string
    billing_name: string
    billing_email: string
    billing_zip: string
    discount_code?: string
}

async function getAuthenticatedUserId(req: Request): Promise<number | null> {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null

    try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, JWT_SECRET) as {
            id: number
            email: string
            role: string
        }
        const user = await User.findByPk(decoded.id)
        if (!user || !user.is_active) return null
        return user.id
    } catch {
        return null
    }
}

async function getOrCreateGuestUser(
    name: string,
    email: string
): Promise<number> {
    const existing = await User.findOne({ where: { email } })
    if (existing) return existing.id

    const [first_name, ...rest] = name.trim().split(' ')
    const last_name = rest.join(' ') || 'Guest'
    const usernameBase = email.split('@')[0] || 'guest'
    const randomSuffix = Math.floor(Math.random() * 100000).toString()
    const username = `${usernameBase}_${randomSuffix}`

    const randomPassword = `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const password_hash = await bcrypt.hash(randomPassword, SALT_ROUNDS)

    const user = await User.create({
        email,
        password_hash,
        first_name: first_name || 'Guest',
        last_name,
        username,
        phone: null,
        date_of_birth: null,
        role: 'customer',
        is_verified: false,
        is_active: true,
        balance: 0,
    })

    return user.id
}

router.get('/tax', async (req: Request, res: Response): Promise<void> => {
    const zip = (req.query.zip as string | undefined)?.trim()

    if (!zip) {
        res.status(400).json({ error: 'zip is required' })
        return
    }

    try {
        const rate = await getTaxRateForZip(zip)
        res.json({ rate })
    } catch (err) {
        console.error('Tax quote error:', err)
        res.status(500).json({ error: 'Failed to fetch tax rate' })
    }
})

router.get(
    '/validate-discount',
    async (req: Request, res: Response): Promise<void> => {
        const code = (req.query.code as string | undefined)
            ?.trim()
            .toUpperCase()

        if (!code) {
            res.status(400).json({ error: 'Discount code is required' })
            return
        }

        try {
            const discountCode = await DiscountCodeLog.findOne({
                where: { code },
            })

            if (!discountCode) {
                res.status(404).json({
                    valid: false,
                    error: 'Discount code not found',
                })
                return
            }

            if (discountCode.status !== 'active') {
                res.status(400).json({
                    valid: false,
                    error: `This discount code is ${discountCode.status}`,
                })
                return
            }

            res.json({
                valid: true,
                code: discountCode.code,
                percent_off: discountCode.percent_off,
            })
        } catch (err) {
            console.error('Discount validation error:', err)
            res.status(500).json({ error: 'Failed to validate discount code' })
        }
    }
)

router.post('/', async (req: Request, res: Response): Promise<void> => {
    const {
        cartItems,
        paymentMethod,
        billing_name,
        billing_email,
        billing_zip,
        discount_code,
    } = req.body as CheckoutBody

    try {
        if (!billing_name || !billing_email || !billing_zip) {
            res.status(400).json({
                error: 'Billing name, email, and ZIP code are required.',
            })
            return
        }

        // Load products from DB & validate stock
        const productIds = cartItems.map((i) => i.productId)
        const products = await Product.findAll({
            where: { id: productIds },
        })

        const productMap = new Map<number, InstanceType<typeof Product>>()
        for (const p of products) {
            productMap.set(p.id as number, p)
        }

        let subtotal = 0

        for (const item of cartItems) {
            const product = productMap.get(item.productId)
            if (!product || !product.is_active) {
                res.status(400).json({
                    error: `Product ${item.productId} is not available.`,
                })
                return
            }

            const requestedQty = item.quantity
            if (requestedQty < 1) {
                res.status(400).json({
                    error: `Invalid quantity for product ${item.productId}.`,
                })
                return
            }

            if (product.stock < requestedQty) {
                res.status(409).json({
                    error: `Insufficient stock for product ${product.title}.`,
                    productId: product.id,
                    availableStock: product.stock,
                })
                return
            }

            const price = Number(product.price)
            subtotal += price * requestedQty
        }

        // Validate and apply discount code if provided
        let discount = 0
        let discountCodeRecord = null
        if (discount_code && discount_code.trim()) {
            const code = discount_code.trim().toUpperCase()
            discountCodeRecord = await DiscountCodeLog.findOne({
                where: { code },
            })

            if (!discountCodeRecord) {
                res.status(400).json({
                    error: `Discount code '${code}' not found.`,
                })
                return
            }

            if (discountCodeRecord.status !== 'active') {
                res.status(400).json({
                    error: `Discount code '${code}' is ${discountCodeRecord.status}.`,
                })
                return
            }

            // Calculate discount
            const percentOff = Number(discountCodeRecord.percent_off)
            discount = +(subtotal * (percentOff / 100)).toFixed(2)
        }

        const taxRate = await getTaxRateForZip(billing_zip)
        const afterDiscount = subtotal - discount
        const tax = +(afterDiscount * taxRate).toFixed(2)
        const total = +(afterDiscount + tax).toFixed(2)

        const authUserId = await getAuthenticatedUserId(req)
        const userId =
            authUserId ??
            (await getOrCreateGuestUser(billing_name, billing_email))

        const result = await sequelize.transaction(async (t) => {
            const orderNumber = `GK-${Date.now()}-${Math.floor(
                Math.random() * 1000
            )
                .toString()
                .padStart(3, '0')}`

            const order = await Order.create(
                {
                    user_id: userId,
                    order_number: orderNumber,
                    status: 'completed',
                    subtotal,
                    tax,
                    discount,
                    discount_code: discountCodeRecord?.code || null,
                    total,
                    payment_method: paymentMethod,
                    payment_status: 'paid',
                    billing_email,
                    billing_name,
                    ip_address:
                        (req.headers['x-forwarded-for'] as string) ||
                        req.socket.remoteAddress ||
                        null,
                    user_agent: req.headers['user-agent'] || null,
                    notes: null,
                    completed_at: new Date(),
                },
                { transaction: t }
            )

            // Create order items and decrease stock
            for (const item of cartItems) {
                const product = productMap.get(item.productId)!
                const price = Number(product.price)
                const itemSubtotal = price * item.quantity

                // Create order item record
                await OrderItem.create(
                    {
                        order_id: order.id,
                        product_id: product.id,
                        quantity: item.quantity,
                        price: price,
                        subtotal: itemSubtotal,
                    },
                    { transaction: t }
                )

                // Decrease stock
                const newStock = product.stock - item.quantity
                if (newStock < 0) {
                    throw new Error(
                        `Stock race condition for product ${product.id}`
                    )
                }

                await product.update({ stock: newStock }, { transaction: t })
            }

            // Record transaction
            const transactionId = `TX-${Date.now()}-${Math.floor(
                Math.random() * 100000
            )
                .toString()
                .padStart(5, '0')}`

            const transaction = await Transaction.create(
                {
                    user_id: userId,
                    order_id: order.id,
                    transaction_id: transactionId,
                    type: 'payment',
                    amount: total,
                    currency: 'USD',
                    status: 'success',
                    payment_method: paymentMethod,
                    payment_gateway: 'internal',
                    gateway_response: null,
                    description: `Payment for order ${orderNumber}`,
                    metadata: {
                        cartItems,
                        subtotal,
                        discount,
                        discount_code: discountCodeRecord?.code || null,
                        tax,
                        total,
                    },
                },
                { transaction: t }
            )

            return { order, transaction }
        })

        res.status(201).json({
            message: 'Order placed successfully.',
            order: result.order,
            transaction: result.transaction,
            totals: {
                subtotal,
                discount,
                tax,
                total,
            },
            isGuestCheckout: !authUserId,
        })
    } catch (error) {
        console.error('Checkout error:', error)
        res.status(500).json({ error: 'Checkout failed.' })
    }
})

export default router
