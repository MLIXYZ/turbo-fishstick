import { sequelize } from '../config/database';
import Category from './Category';
import Product from './Product';
import User from './User';
import Order from './Order';
import Transaction from './Transaction';
import DiscountCodeLog from './DiscountCodeLog';

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

export const syncDatabase = async (): Promise<void> => {
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

export {
  sequelize,
  Category,
  Product,
  User,
  Order,
  Transaction,
  DiscountCodeLog
};
