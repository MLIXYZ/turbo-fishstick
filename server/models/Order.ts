import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database'
import {
    OrderInstance,
    OrderAttributes,
    OrderCreationAttributes,
} from '../types/models'

const Order = sequelize.define<OrderInstance>(
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
            get(): number {
                const value = this.getDataValue('subtotal')
                return value ? parseFloat(value as string) : 0
            },
        },
        tax: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.0,
            get(): number {
                const value = this.getDataValue('tax')
                return value ? parseFloat(value as string) : 0
            },
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.0,
            get(): number {
                const value = this.getDataValue('discount')
                return value ? parseFloat(value as string) : 0
            },
        },
        discount_code: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get(): number {
                const value = this.getDataValue('total')
                return value ? parseFloat(value as string) : 0
            },
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

export default Order
export { OrderInstance, OrderAttributes, OrderCreationAttributes }
