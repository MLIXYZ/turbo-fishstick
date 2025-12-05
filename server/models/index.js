const { sequelize } = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');

Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
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
  syncDatabase
};
