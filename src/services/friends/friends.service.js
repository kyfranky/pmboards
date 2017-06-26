// Initializes the `friends` service on path `/friends`
const createService = require('feathers-sequelize');
const createModel = require('../../models/friends.model');
const hooks = require('./friends.hooks');
const filters = require('./friends.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'friends',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/friends', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('friends');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
