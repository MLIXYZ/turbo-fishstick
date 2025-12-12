import express, { Request, Response } from 'express'
import path from 'path'
import cors from 'cors'
import dotenv from 'dotenv'
import { Op } from 'sequelize'

dotenv.config()

import { Category, Product, syncDatabase, User, Order } from './models'
import authRoutes from './routes/auth'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

syncDatabase();

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

// for customer profile page
// customer profile info:
app.get('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'username', 'phone', 'avatar_url', 'is_verified', 'balance', 'last_login', 'created_at', 'updated_at']
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
// customer orders
app.get('/api/users/:id/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.findAll({
      order: [['created_at', 'DESC']],
      where: { user_id: req.params.id },
    })
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// admin get products
app.get('/api/admin/products', async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
})
// admin new product
app.post('/api/admin/products', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price, category_id, platform, image_url, stock } = req.body;
    const product = await Product.create({
      title, description, price, category_id, platform, image_url, stock, is_active: true
    });
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
})
// admin update product
app.put('/api/admin/products/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const { title, description, price, category_id, platform, image_url, stock, is_active } = req.body;
    await product.update({ title, description, price, category_id, platform, image_url, stock, is_active });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
})
// admin delete product
app.delete('/api/admin/products/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
