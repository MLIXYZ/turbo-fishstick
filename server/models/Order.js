const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Order = sequelize.define(
    'Order',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        order_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
            defaultValue: 'pending',
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        tax: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.0,
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.0,
        },
        discount_code: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        payment_status: {
            type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
            defaultValue: 'pending',
        },
        billing_email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        billing_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at',
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'updated_at',
        },
    },
    {
        tableName: 'orders',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)

module.exports = Order
