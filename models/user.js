'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Role, { through: models.RoleUser });
      User.belongsToMany(models.Department, { through: models.DepartmentUser });
    }
  }

  User.init(
    {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      hotel_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phoneNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      favourite_pet: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      favourite_book: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_by_id: {
        type: DataTypes.INTEGER,
      },
      updated_by_id: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );

  return User;
};
