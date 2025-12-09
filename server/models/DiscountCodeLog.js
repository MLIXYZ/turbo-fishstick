const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const DiscountCodeLog = sequelize.define(
    'DiscountCodeLog',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at',
        },
        by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        status: {
            type: DataTypes.ENUM('active', 'used', 'expired', 'disabled'),
            allowNull: false,
            defaultValue: 'active',
        },
        used_on: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        order_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        percent_off: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
        },
    },
    {
        tableName: 'discount_code_logs',
        timestamps: false,
    }
)

module.exports = DiscountCodeLog
