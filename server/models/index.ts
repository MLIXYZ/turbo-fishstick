import { sequelize } from '../config/database'
import Category from './Category'
import Product from './Product'
import User from './User'
import Order from './Order'
import OrderItem from './OrderItem'
import Transaction from './Transaction'
import DiscountCodeLog from './DiscountCodeLog'
import StockKey from './StockKey'
import Review from './Review'

// Product - Category relationship
Product.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category',
})

Category.hasMany(Product, {
    foreignKey: 'category_id',
    as: 'products',
})

// Order - User relationship
Order.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
})

User.hasMany(Order, {
    foreignKey: 'user_id',
    as: 'orders',
})

// Transaction - User relationship
Transaction.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
})

User.hasMany(Transaction, {
    foreignKey: 'user_id',
    as: 'transactions',
})

// Transaction - Order relationship
Transaction.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
})

Order.hasMany(Transaction, {
    foreignKey: 'order_id',
    as: 'transactions',
})

// DiscountCodeLog - User relationship
DiscountCodeLog.belongsTo(User, {
    foreignKey: 'by',
    as: 'creator',
})

User.hasMany(DiscountCodeLog, {
    foreignKey: 'by',
    as: 'discount_codes',
})

// StockKey - Product relationship
StockKey.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product',
})

Product.hasMany(StockKey, {
    foreignKey: 'product_id',
    as: 'stock_keys',
})

// StockKey - Order relationship
StockKey.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
})

Order.hasMany(StockKey, {
    foreignKey: 'order_id',
    as: 'stock_keys',
})

// OrderItem - Order relationship
OrderItem.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
})

Order.hasMany(OrderItem, {
    foreignKey: 'order_id',
    as: 'items',
})

// OrderItem - Product relationship
OrderItem.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product',
})

Product.hasMany(OrderItem, {
    foreignKey: 'product_id',
    as: 'order_items',
})

// Review - Product relationship
Review.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product',
})

Product.hasMany(Review, {
    foreignKey: 'product_id',
    as: 'reviews',
})

// Review - User relationship (nullable for anonymous reviews)
Review.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
})

User.hasMany(Review, {
    foreignKey: 'user_id',
    as: 'reviews',
})

// Review - Order relationship
Review.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order',
})

Order.hasMany(Review, {
    foreignKey: 'order_id',
    as: 'reviews',
})

export const syncDatabase = async (): Promise<void> => {
    try {
        if (process.env.NODE_ENV === 'development') {
            // alter: true will update tables without dropping them
            await sequelize.sync({ alter: true })
            console.log('Database synchronized successfully')
        }
    } catch (error) {
        console.error('Error synchronizing database:', error)
    }
}

export {
    sequelize,
    Category,
    Product,
    User,
    Order,
    OrderItem,
    Transaction,
    DiscountCodeLog,
    StockKey,
    Review,
}
