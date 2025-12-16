import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database'
import {
    TransactionInstance,
    TransactionAttributes,
    TransactionCreationAttributes,
} from '../types/models'

const Transaction = sequelize.define<TransactionInstance>(
    'Transaction',
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
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'orders',
                key: 'id',
            },
        },
        transaction_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        type: {
            type: DataTypes.ENUM('payment', 'refund', 'deposit', 'withdrawal'),
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            get(): number {
                const value = this.getDataValue('amount')
                return value ? parseFloat(value as unknown as string) : 0
            },
        },
        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'USD',
        },
        status: {
            type: DataTypes.ENUM('pending', 'success', 'failed', 'cancelled'),
            defaultValue: 'pending',
        },
        payment_method: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        payment_gateway: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        gateway_response: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        metadata: {
            type: DataTypes.JSON,
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
        tableName: 'transactions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)

export default Transaction
export {
    TransactionInstance,
    TransactionAttributes,
    TransactionCreationAttributes,
}
