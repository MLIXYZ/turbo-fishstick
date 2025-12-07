const { sequelize } = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');
const User = require('./User');
const Order = require('./Order');
const Transaction = require('./Transaction');
const DiscountCodeLog = require('./DiscountCodeLog');

// Product - Category relationship
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
});

// Order - User relationship
Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders'
});

// Transaction - User relationship
Transaction.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(Transaction, {
  foreignKey: 'user_id',
  as: 'transactions'
});

// Transaction - Order relationship
Transaction.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

Order.hasMany(Transaction, {
  foreignKey: 'order_id',
  as: 'transactions'
});

// DiscountCodeLog - User relationship
DiscountCodeLog.belongsTo(User, {
  foreignKey: 'by',
  as: 'creator'
});

User.hasMany(DiscountCodeLog, {
  foreignKey: 'by',
  as: 'discount_codes'
});

const syncDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // alter: true will update tables without dropping them
      await sequelize.sync({ alter: true });
      console.log('Database synchronized successfully');
    }
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  Category,
  Product,
  User,
  Order,
  Transaction,
  DiscountCodeLog,
  syncDatabase
};
