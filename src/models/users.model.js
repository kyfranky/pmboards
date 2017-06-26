// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.define('users', {

    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    company: {
      type: Sequelize.STRING,
      allowNull: false,
    },


  }, {
    classMethods: {
      associate (models) { // eslint-disable-line no-unused-vars
        // Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/

        users.belongsToMany(models.projects, {through: models.teams});

        users.belongsToMany(users, {through: models.friends, as: 'Inviter', foreignKey: 'inviterId'});
        users.belongsToMany(users, {through: models.friends, as: 'Invited', foreignKey: 'invitedId'});

        users.hasMany(models.friends, {foreignKey: 'inviterId'});
        users.hasMany(models.friends, {foreignKey: 'invitedId'});

        users.hasMany(models.teams, {foreignKey: 'userId'});

      }
    }
  });

  return users;
};
