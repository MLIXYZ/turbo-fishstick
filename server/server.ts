import express, { Request, Response } from 'express'
import path from 'path'
import cors from 'cors'
import dotenv from 'dotenv'
import { Op, WhereOptions } from 'sequelize'

dotenv.config()

import {
    Category,
    Product,
    syncDatabase,
    User,
    Order,
    DiscountCodeLog,
} from './models'
import authRoutes from './routes/auth'
import {
    authenticate,
    requireAdmin,
    requireOwnerOrAdmin,
} from './middleware/auth'

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

app.get('/api/products', async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, search } = req.query
        const where: WhereOptions = { is_active: true }

        if (category) {
            where.category_id = category
        }

        if (search) {
            Object.assign(where, {
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                ],
            })
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

// for customer profile page
// customer profile info - requires authentication, user can only view their own profile or admin can view any
app.get(
    '/api/users/:id',
    authenticate,
    requireOwnerOrAdmin('id'),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await User.findByPk(req.params.id, {
                attributes: [
                    'id',
                    'email',
                    'first_name',
                    'last_name',
                    'username',
                    'phone',
                    'avatar_url',
                    'is_verified',
                    'last_login',
                    'created_at',
                    'updated_at',
                ],
            })
            if (!user) {
                res.status(404).json({ error: 'User not found' })
                return
            }
            res.json(user)
        } catch (error) {
            console.error('Error fetching users:', error)
            res.status(500).json({ error: 'Failed to fetch users' })
        }
    }
)
// customer orders - requires authentication, user can only view their own orders or admin can view any
app.get(
    '/api/users/:id/orders',
    authenticate,
    requireOwnerOrAdmin('id'),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const orders = await Order.findAll({
                order: [['created_at', 'DESC']],
                where: { user_id: req.params.id },
            })
            res.json(orders)
        } catch (error) {
            console.error('Error fetching orders:', error)
            res.status(500).json({ error: 'Failed to fetch orders' })
        }
    }
)

// admin get products - requires admin authentication
app.get(
    '/api/admin/products',
    authenticate,
    requireAdmin,
    async (_req: Request, res: Response): Promise<void> => {
        try {
            const products = await Product.findAll({
                order: [['created_at', 'DESC']],
            })
            res.json(products)
        } catch (error) {
            console.error('Error fetching products:', error)
            res.status(500).json({ error: 'Failed to fetch products' })
        }
    }
)
// admin new product - requires admin authentication
app.post(
    '/api/admin/products',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                title,
                description,
                price,
                category_id,
                platform,
                image_url,
                stock,
            } = req.body
            const product = await Product.create({
                title,
                description,
                price,
                category_id,
                platform,
                image_url,
                stock,
                is_active: true,
            })
            res.json(product)
        } catch (error) {
            console.error('Error creating product:', error)
            res.status(500).json({ error: 'Failed to create product' })
        }
    }
)
// admin update product - requires admin authentication
app.put(
    '/api/admin/products/:id',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const product = await Product.findByPk(req.params.id)
            if (!product) {
                res.status(404).json({ error: 'Product not found' })
                return
            }
            const {
                title,
                description,
                price,
                category_id,
                platform,
                image_url,
                stock,
                is_active,
            } = req.body
            await product.update({
                title,
                description,
                price,
                category_id,
                platform,
                image_url,
                stock,
                is_active,
            })
            res.json(product)
        } catch (error) {
            console.error('Error updating product:', error)
            res.status(500).json({ error: 'Failed to update product' })
        }
    }
)
// admin delete product - requires admin authentication
app.delete(
    '/api/admin/products/:id',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const product = await Product.findByPk(req.params.id)
            if (!product) {
                res.status(404).json({ error: 'Product not found' })
                return
            }
            await product.destroy()
            res.json({ message: 'Product deleted' })
        } catch (error) {
            console.error('Error deleting product:', error)
            res.status(500).json({ error: 'Failed to delete product' })
        }
    }
)

// Admin user management endpoints
// Get all users - requires admin authentication
app.get(
    '/api/admin/users',
    authenticate,
    requireAdmin,
    async (_req: Request, res: Response): Promise<void> => {
        try {
            const users = await User.findAll({
                attributes: [
                    'id',
                    'email',
                    'first_name',
                    'last_name',
                    'username',
                    'phone',
                    'role',
                    'is_verified',
                    'is_active',
                    'created_at',
                    'last_login',
                ],
                order: [['created_at', 'DESC']],
            })
            res.json(users)
        } catch (error) {
            console.error('Error fetching users:', error)
            res.status(500).json({ error: 'Failed to fetch users' })
        }
    }
)

// Update user - requires admin authentication
app.put(
    '/api/admin/users/:id',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await User.findByPk(req.params.id)
            if (!user) {
                res.status(404).json({ error: 'User not found' })
                return
            }
            const {
                first_name,
                last_name,
                email,
                username,
                phone,
                role,
                is_active,
                is_verified,
            } = req.body
            await user.update({
                first_name,
                last_name,
                email,
                username,
                phone,
                role,
                is_active,
                is_verified,
            })
            res.json(user)
        } catch (error) {
            console.error('Error updating user:', error)
            res.status(500).json({ error: 'Failed to update user' })
        }
    }
)

// Delete user - requires admin authentication
app.delete(
    '/api/admin/users/:id',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await User.findByPk(req.params.id)
            if (!user) {
                res.status(404).json({ error: 'User not found' })
                return
            }
            // Prevent deleting yourself
            if (req.user?.id === user.id) {
                res.status(400).json({
                    error: 'Cannot delete your own account',
                })
                return
            }
            await user.destroy()
            res.json({ message: 'User deleted successfully' })
        } catch (error) {
            console.error('Error deleting user:', error)
            res.status(500).json({ error: 'Failed to delete user' })
        }
    }
)

// Admin order management endpoints
// Get all orders - requires admin authentication
app.get(
    '/api/admin/orders',
    authenticate,
    requireAdmin,
    async (_req: Request, res: Response): Promise<void> => {
        try {
            const orders = await Order.findAll({
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name', 'email'],
                    },
                ],
                order: [['created_at', 'DESC']],
            })
            res.json(orders)
        } catch (error) {
            console.error('Error fetching orders:', error)
            res.status(500).json({ error: 'Failed to fetch orders' })
        }
    }
)

// Get single order details - requires admin authentication
app.get(
    '/api/admin/orders/:id',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const order = await Order.findByPk(req.params.id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: [
                            'id',
                            'first_name',
                            'last_name',
                            'email',
                            'phone',
                        ],
                    },
                ],
            })
            if (!order) {
                res.status(404).json({ error: 'Order not found' })
                return
            }
            res.json(order)
        } catch (error) {
            console.error('Error fetching order:', error)
            res.status(500).json({ error: 'Failed to fetch order' })
        }
    }
)

// Update order status - requires admin authentication
app.put(
    '/api/admin/orders/:id',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const order = await Order.findByPk(req.params.id)
            if (!order) {
                res.status(404).json({ error: 'Order not found' })
                return
            }
            const {
                status,
                payment_status,
                shipping_address,
                tracking_number,
            } = req.body
            await order.update({
                status,
                payment_status,
                shipping_address,
                tracking_number,
            })
            res.json(order)
        } catch (error) {
            console.error('Error updating order:', error)
            res.status(500).json({ error: 'Failed to update order' })
        }
    }
)

// Admin discount code management endpoints
// Get all discount codes - requires admin authentication
app.get(
    '/api/admin/discount-codes',
    authenticate,
    requireAdmin,
    async (_req: Request, res: Response): Promise<void> => {
        try {
            const codes = await DiscountCodeLog.findAll({
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'first_name', 'last_name', 'email'],
                    },
                ],
                order: [['created_at', 'DESC']],
            })
            res.json(codes)
        } catch (error) {
            console.error('Error fetching discount codes:', error)
            res.status(500).json({ error: 'Failed to fetch discount codes' })
        }
    }
)

// Create discount code - requires admin authentication
app.post(
    '/api/admin/discount-codes',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { code, percent_off } = req.body
            const discountCode = await DiscountCodeLog.create({
                code,
                percent_off,
                status: 'active',
                by: req.user!.id,
                created_at: new Date(),
            })
            res.json(discountCode)
        } catch (error) {
            console.error('Error creating discount code:', error)
            res.status(500).json({ error: 'Failed to create discount code' })
        }
    }
)

// Update discount code - requires admin authentication
app.put(
    '/api/admin/discount-codes/:id',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const code = await DiscountCodeLog.findByPk(req.params.id)
            if (!code) {
                res.status(404).json({ error: 'Discount code not found' })
                return
            }
            const { status, percent_off } = req.body
            await code.update({ status, percent_off })
            res.json(code)
        } catch (error) {
            console.error('Error updating discount code:', error)
            res.status(500).json({ error: 'Failed to update discount code' })
        }
    }
)

// Delete discount code - requires admin authentication
app.delete(
    '/api/admin/discount-codes/:id',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const code = await DiscountCodeLog.findByPk(req.params.id)
            if (!code) {
                res.status(404).json({ error: 'Discount code not found' })
                return
            }
            await code.destroy()
            res.json({ message: 'Discount code deleted successfully' })
        } catch (error) {
            console.error('Error deleting discount code:', error)
            res.status(500).json({ error: 'Failed to delete discount code' })
        }
    }
)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
