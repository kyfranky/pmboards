// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const projects = sequelizeClient.define('projects', {

    creatorId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    projectTitle: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    },
    PmName: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    },
    startDate: {
      type: Sequelize.DATEONLY,
      allowNull: true,
      unique: false,
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: true,
      unique: false
    },
    projectDescription: {
      type: Sequelize.TEXT,
      allowNull: true,
      unique: false
    },
    CharterData: {
      type: Sequelize.JSON,
      allowNull: true,
      unique: false
    },
    MindMapData: {
      type: Sequelize.JSON,
      allowNull: true,
      unique: false
    },
    GanttChartData: {
      type: Sequelize.JSON,
      allowNull: true,
      unique: false
    }

  }, {
    classMethods: {
      associate (models) { // eslint-disable-line no-unused-vars
        // Define associations here
        // See http://docs.sequelizejs.com/en/latest/docs/associations/

        projects.belongsToMany(models.users, { through: models.teams });

        projects.belongsTo(models.users, {as: 'Owner', foreignKey: 'creatorId'});

        projects.hasMany(models.teams);

        projects.hasMany(models.documents);

      }
    }
  });

  return projects;
};
