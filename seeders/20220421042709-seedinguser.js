'use strict';
const { hashPassword } = require('../helper/bcryptjwt')
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    let data = [{
      email: "admin@taphomestest.com",
      password: hashPassword("admin123"),
      role: "admin",
      createdAt: new Date,
      updatedAt: new Date
    }]
    // console.log(data)
    await queryInterface.bulkInsert('Users', data)
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {});
  }
};
