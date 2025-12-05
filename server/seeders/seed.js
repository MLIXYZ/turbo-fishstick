/**
 * Database Seeder
 * Run this file to populate the database with sample data
 * Usage: node seeders/seed.js
 */

const { Category, Product, sequelize } = require('../models');

const categories = [
  { name: 'Action', description: 'Action-packed games' },
  { name: 'Adventure', description: 'Adventure and exploration games' },
  { name: 'RPG', description: 'Role-playing games' },
  { name: 'Strategy', description: 'Strategy and tactics games' },
  { name: 'Sports', description: 'Sports simulation games' },
  { name: 'Puzzle', description: 'Puzzle and brain games' },
  { name: 'Simulation', description: 'Simulation games' }
];

const products = [
  {
    title: 'Epic Adventure Quest',
    description: 'Embark on an epic journey through mystical lands',
    price: 49.99,
    platform: 'PC',
    stock: 100,
    is_active: true
  },
  {
    title: 'Space Warriors 2077',
    description: 'Fight in the ultimate space battle',
    price: 59.99,
    platform: 'PC, PS5, Xbox',
    stock: 150,
    is_active: true
  },
  {
    title: 'Racing Legends',
    description: 'The most realistic racing experience',
    price: 39.99,
    platform: 'PC, PS5',
    stock: 80,
    is_active: true
  },
  {
    title: 'Mystery Manor',
    description: 'Solve puzzles in a haunted mansion',
    price: 29.99,
    platform: 'PC',
    stock: 120,
    is_active: true
  },
  {
    title: 'Kingdom Builder',
    description: 'Build and manage your medieval kingdom',
    price: 44.99,
    platform: 'PC, Xbox',
    stock: 90,
    is_active: true
  }
];

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create categories
    const createdCategories = await Category.bulkCreate(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Assign random categories to products
    const productsWithCategories = products.map((product, index) => ({
      ...product,
      category_id: createdCategories[index % createdCategories.length].id
    }));

    // Create products
    const createdProducts = await Product.bulkCreate(productsWithCategories);
    console.log(`Created ${createdProducts.length} products`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder if called directly
if (require.main === module) {
  seed();
}

module.exports = seed;
