import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { DiscountCodeLogInstance, DiscountCodeLogAttributes, DiscountCodeLogCreationAttributes } from '../types/models';

const DiscountCodeLog = sequelize.define<DiscountCodeLogInstance>('DiscountCodeLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'used', 'expired', 'disabled'),
    allowNull: false,
    defaultValue: 'active'
  },
  used_on: {
    type: DataTypes.DATE,
    allowNull: true
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  percent_off: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    get(): number {
      const value = this.getDataValue('percent_off');
      return value ? parseFloat(value as any) : 0;
    }
  }
}, {
  tableName: 'discount_code_logs',
  timestamps: false
});

export default DiscountCodeLog;
export { DiscountCodeLogInstance, DiscountCodeLogAttributes, DiscountCodeLogCreationAttributes };
