const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Import Sequelize models
const { sequelize, Category, Product, syncDatabase } = require('./models');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

syncDatabase();

// API Routes
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'description']
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = { is_active: true };

    if (category) {
      where.category_id = category;
    }

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const products = await Product.findAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});