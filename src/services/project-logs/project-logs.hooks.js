const { authenticate } = require('feathers-authentication').hooks;

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [

      function (hook) {

        const user = hook.app.services.users.Model;

        hook.params.sequelize =
          {
            attributes: ['id','activityType', 'oldValue', 'newValue', 'createdAt'],
            include: [{
              model: user,
              attributes: ['firstName', 'lastName'],
            }]
          };

      }

    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
