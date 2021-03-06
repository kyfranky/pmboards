// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const messages = sequelizeClient.define('messages', {
    senderId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    projectId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    messageValue: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate (models) { // eslint-disable-line no-unused-vars
        // Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/

        messages.belongsTo(models.users, {foreignKey: 'senderId'});
        messages.belongsTo(models.projects, {foreignKey: 'projectId'});

      }
    }
  });

  return messages;
};
