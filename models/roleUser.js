'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RoleUser extends Model {
    static associate(models) {
      RoleUser.belongsTo(models.User, { foreignKey: 'userId' });
      RoleUser.belongsTo(models.Role, { foreignKey: 'roleId' });
    }
  }

  RoleUser.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'RoleUser'
    }
  );

  return RoleUser;
};
