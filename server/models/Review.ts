import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database'
import {
    ReviewInstance,
    ReviewAttributes,
    ReviewCreationAttributes,
} from '../types/models'

const Review = sequelize.define<ReviewInstance>(
    'Review',
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
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'orders',
                key: 'id',
            },
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
            },
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        reviewer_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        reviewer_email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        turnstile_token: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_approved: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        helpful_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
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
        tableName: 'reviews',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)

export default Review
export { ReviewInstance, ReviewAttributes, ReviewCreationAttributes }
