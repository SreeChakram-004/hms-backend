'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    static associate(models) {
      Department.belongsToMany(models.User, {
        through: models.DepartmentUser,
        foreignKey: 'departmentId',
        otherKey: 'userId'
      });
    }
  }

  Department.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      created_by_id: {
        type: DataTypes.INTEGER,
      },
      updated_by_id: {
        type: DataTypes.INTEGER,
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
      }
    },
    {
      sequelize,
      modelName: 'Department',
    }
  );

  return Department;
};
