import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database'
import {
    StockKeyInstance,
    StockKeyAttributes,
    StockKeyCreationAttributes,
} from '../types/models'

const StockKey = sequelize.define<StockKeyInstance>(
    'StockKey',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id',
            },
        },
        game_key: {
            type: DataTypes.STRING(500),
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.ENUM('available', 'sold', 'reserved'),
            allowNull: false,
            defaultValue: 'available',
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'orders',
                key: 'id',
            },
        },
        order_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        assigned_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'stock_keys',
        timestamps: false,
    }
)

export default StockKey
export { StockKeyInstance, StockKeyAttributes, StockKeyCreationAttributes }
