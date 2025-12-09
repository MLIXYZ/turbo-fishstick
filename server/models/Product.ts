import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database'
import {
    ProductInstance,
    ProductAttributes,
    ProductCreationAttributes,
} from '../types/models'

const Product = sequelize.define<ProductInstance>(
    'Product',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get(): number {
                const value = this.getDataValue('price')
                return value ? parseFloat(value as string) : 0
            },
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'categories',
                key: 'id',
            },
        },
        platform: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        image_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
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
        tableName: 'products',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)

export default Product
export { ProductInstance, ProductAttributes, ProductCreationAttributes }
