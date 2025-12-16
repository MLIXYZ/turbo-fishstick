import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database'
import {
    OrderItemInstance,
    OrderItemAttributes,
    OrderItemCreationAttributes,
} from '../types/models'

const OrderItem = sequelize.define<OrderItemInstance>(
    'OrderItem',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'orders',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id',
            },
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get(): number {
                const value = this.getDataValue('price')
                return value ? Number(value) : 0
            },
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get(): number {
                const value = this.getDataValue('subtotal')
                return value ? Number(value) : 0
            },
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'order_items',
        timestamps: false,
    }
)

export default OrderItem
export { OrderItemInstance, OrderItemAttributes, OrderItemCreationAttributes }
