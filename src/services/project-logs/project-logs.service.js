// Initializes the `projectLogs` service on path `/project-logs`
const createService = require('feathers-sequelize');
const createModel = require('../../models/project-logs.model');
const hooks = require('./project-logs.hooks');
const filters = require('./project-logs.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'project-logs',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/project-logs', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('project-logs');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
