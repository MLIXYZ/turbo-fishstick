import express, { Request, Response } from 'express'
import path from 'path'
import cors from 'cors'
import dotenv from 'dotenv'
import { Op } from 'sequelize'

dotenv.config()
import Order from './models/Order';
import Transaction from './models/Transaction';
import { v4 as uuidv4 } from 'uuid';

import { Category, Product, syncDatabase } from './models'
import authRoutes from './routes/auth'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

syncDatabase()

// Auth routes
app.use('/api/auth', authRoutes)

app.get(
    '/api/categories',
    async (_req: Request, res: Response): Promise<void> => {
        try {
            const categories = await Category.findAll({
                order: [['name', 'ASC']],
                attributes: ['id', 'name', 'description'],
            })
            res.json(categories)
        } catch (error) {
            console.error('Error fetching categories:', error)
            res.status(500).json({ error: 'Failed to fetch categories' })
        }
    }
)

app.post('/api/checkout', async (req, res) => {
    try {
        const {
            cartItems,
            subtotal,
            tax,
            total,
            paymentMethod,
            billing_name,
            billing_email,
        } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        if (!billing_name || !billing_email) {
            return res.status(400).json({ error: 'Missing billing info' });
        }

        // Placeholder userID
        const userId = null;

        const orderNumber = `ORD-${Date.now()}`;

        const order = await Order.create({
            user_id: userId || 1,   // TEMP: point to your demo user if needed
            order_number: orderNumber,
            status: 'pending',
            subtotal: subtotal,
            tax: tax,
            discount: 0,
            total: total,
            payment_method: paymentMethod,
            payment_status: 'pending',
            billing_email,
            billing_name,
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            notes: null,
        });

        await Transaction.create({
            user_id: userId || 1,
            order_id: order.id,
            transaction_id: uuidv4(),
            type: 'payment',
            amount: total,
            currency: 'USD',
            status: 'success', // pretend payment succeeded
            payment_method: paymentMethod,
            payment_gateway: 'placeholder_gateway',
            description: 'Test payment transaction',
            metadata: { cartItems },
        });

        return res.status(201).json({
            message: 'Checkout successful (placeholder)',
            orderId: order.id,
            orderNumber,
        });

    } catch (err) {
        console.error('Checkout API Error:', err);
        return res.status(500).json({ error: 'Checkout failed on server' });
    }
});

app.get('/api/products', async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, search } = req.query
        const where: Record<string, unknown> = { is_active: true }

        if (category) {
            where.category_id = category
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
            ]
        }

        const products = await Product.findAll({
            where,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                },
            ],
            order: [['created_at', 'DESC']],
        })

        res.json(products)
    } catch (error) {
        console.error('Error fetching products:', error)
        res.status(500).json({ error: 'Failed to fetch products' })
    }
})

app.get(
    '/api/products/:id',
    async (req: Request, res: Response): Promise<void> => {
        try {
            const product = await Product.findByPk(req.params.id, {
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name'],
                    },
                ],
            })

            if (!product) {
                res.status(404).json({ error: 'Product not found' })
                return
            }

            res.json(product)
        } catch (error) {
            console.error('Error fetching product:', error)
            res.status(500).json({ error: 'Failed to fetch product' })
        }
    }
)

app.get('/', (_req: Request, res: Response): void => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
