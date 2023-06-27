'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add seed data for roles if needed
    const rolesData = [
      { name: 'Admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Manager', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Staff', createdAt: new Date(), updatedAt: new Date() },
    ];
    await queryInterface.bulkInsert('Roles', rolesData);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Roles');
  }
};
