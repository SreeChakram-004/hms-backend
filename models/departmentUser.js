'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DepartmentUser extends Model {
    static associate(models) {
      DepartmentUser.belongsTo(models.User, { foreignKey: 'userId' });
      DepartmentUser.belongsTo(models.Department, { foreignKey: 'departmentId' });
    }
  }

  DepartmentUser.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'DepartmentUser',
      tableName: 'DepartmentUser', // Add this line to specify the correct table name
    }
  );

  return DepartmentUser;
};
