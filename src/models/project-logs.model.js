// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const projectLogs = sequelizeClient.define('project-logs', {
    projectId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    activityType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    oldValue: {
      type: Sequelize.STRING,
      allowNull: false
    },
    newValue: {
      type: Sequelize.STRING,
      allowNull: false
    },
    subProjectId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }

  }, {
    classMethods: {
      associate (models) { // eslint-disable-line no-unused-vars
        // Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/

        projectLogs.belongsTo(models.users, {foreignKey: 'userId'});
        projectLogs.belongsTo(models.projects, {foreignKey: 'projectId'});

      }
    }
  });

  return projectLogs;
};
