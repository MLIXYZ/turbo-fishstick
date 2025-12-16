import { Router, Request, Response } from 'express'
import StockKey from '../models/StockKey'
import { Product, Order } from '../models'
import { authenticate, requireAdmin } from '../middleware/auth'

const router = Router()

// Get all stock keys with filters - Admin only
router.get(
    '/',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { product_id, status } = req.query

            const where: any = {}
            if (product_id) where.product_id = product_id
            if (status) where.status = status

            const keys = await StockKey.findAll({
                where,
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'title', 'image_url'],
                    },
                    {
                        model: Order,
                        as: 'order',
                        attributes: ['id', 'order_number', 'billing_email'],
                        required: false,
                    },
                ],
                order: [['created_at', 'DESC']],
            })

            res.json(keys)
        } catch (error) {
            console.error('Error fetching stock keys:', error)
            res.status(500).json({ error: 'Failed to fetch stock keys' })
        }
    }
)

// Get available keys count by product - Admin only
router.get(
    '/availability',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { product_id } = req.query

            const where: any = { status: 'available' }
            if (product_id) where.product_id = product_id

            const count = await StockKey.count({ where })

            res.json({ available: count })
        } catch (error) {
            console.error('Error fetching availability:', error)
            res.status(500).json({ error: 'Failed to fetch availability' })
        }
    }
)

// Add new stock key - Admin only
router.post(
    '/',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { product_id, game_key, notes } = req.body

            if (!product_id || !game_key) {
                res.status(400).json({
                    error: 'Product ID and game key are required',
                })
                return
            }

            // Check if product exists
            const product = await Product.findByPk(product_id)
            if (!product) {
                res.status(404).json({ error: 'Product not found' })
                return
            }

            // Check if key already exists
            const existing = await StockKey.findOne({
                where: { game_key: game_key.trim() },
            })
            if (existing) {
                res.status(409).json({ error: 'This game key already exists' })
                return
            }

            const stockKey = await StockKey.create({
                product_id,
                game_key: game_key.trim(),
                notes: notes || null,
                status: 'available',
            })

            res.status(201).json(stockKey)
        } catch (error) {
            console.error('Error creating stock key:', error)
            res.status(500).json({ error: 'Failed to create stock key' })
        }
    }
)

// Bulk add stock keys - Admin only
router.post(
    '/bulk',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { product_id, game_keys } = req.body

            if (
                !product_id ||
                !Array.isArray(game_keys) ||
                game_keys.length === 0
            ) {
                res.status(400).json({
                    error: 'Product ID and array of game keys are required',
                })
                return
            }

            // Check if product exists
            const product = await Product.findByPk(product_id)
            if (!product) {
                res.status(404).json({ error: 'Product not found' })
                return
            }

            const keysToAdd = game_keys.map((key: string) => ({
                product_id,
                game_key: key.trim(),
                status: 'available' as const,
            }))

            const created = await StockKey.bulkCreate(keysToAdd, {
                ignoreDuplicates: true,
            })

            res.status(201).json({
                message: `${created.length} keys added successfully`,
                created,
            })
        } catch (error) {
            console.error('Error bulk creating stock keys:', error)
            res.status(500).json({ error: 'Failed to create stock keys' })
        }
    }
)

// Assign key to order - Admin only
router.put(
    '/:id/assign',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params
            const { order_id, order_number } = req.body

            const stockKey = await StockKey.findByPk(id)
            if (!stockKey) {
                res.status(404).json({ error: 'Stock key not found' })
                return
            }

            if (stockKey.status !== 'available') {
                res.status(400).json({
                    error: `Cannot assign key with status: ${stockKey.status}`,
                })
                return
            }

            // Verify order exists if order_id provided
            if (order_id) {
                const order = await Order.findByPk(order_id)
                if (!order) {
                    res.status(404).json({ error: 'Order not found' })
                    return
                }
            }

            await stockKey.update({
                status: 'sold',
                order_id: order_id || null,
                order_number: order_number || null,
                assigned_at: new Date(),
            })

            res.json(stockKey)
        } catch (error) {
            console.error('Error assigning stock key:', error)
            res.status(500).json({ error: 'Failed to assign stock key' })
        }
    }
)

// Update stock key - Admin only
router.put(
    '/:id',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params
            const { game_key, status, notes } = req.body

            const stockKey = await StockKey.findByPk(id)
            if (!stockKey) {
                res.status(404).json({ error: 'Stock key not found' })
                return
            }

            const updates: any = {}
            if (game_key !== undefined) updates.game_key = game_key.trim()
            if (status !== undefined) updates.status = status
            if (notes !== undefined) updates.notes = notes

            await stockKey.update(updates)

            res.json(stockKey)
        } catch (error) {
            console.error('Error updating stock key:', error)
            res.status(500).json({ error: 'Failed to update stock key' })
        }
    }
)

// Delete stock key - Admin only
router.delete(
    '/:id',
    authenticate,
    requireAdmin,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params

            const stockKey = await StockKey.findByPk(id)
            if (!stockKey) {
                res.status(404).json({ error: 'Stock key not found' })
                return
            }

            if (stockKey.status === 'sold') {
                res.status(400).json({
                    error: 'Cannot delete a sold key',
                })
                return
            }

            await stockKey.destroy()

            res.json({ message: 'Stock key deleted successfully' })
        } catch (error) {
            console.error('Error deleting stock key:', error)
            res.status(500).json({ error: 'Failed to delete stock key' })
        }
    }
)

export default router
