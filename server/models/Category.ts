import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database'
import {
    CategoryInstance,
    CategoryAttributes,
    CategoryCreationAttributes,
} from '../types/models'

const Category = sequelize.define<CategoryInstance>(
    'Category',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
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
        tableName: 'categories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)

export default Category
export { CategoryInstance, CategoryAttributes, CategoryCreationAttributes }
