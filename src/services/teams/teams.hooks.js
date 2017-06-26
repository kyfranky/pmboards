const {authenticate} = require('feathers-authentication').hooks;

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      function (hook) {

        if (hook.params.query.include) {

          const switcher = hook.params.query.include;
          delete hook.params.query.include;
          const user = hook.app.services.users.Model;
          const project = hook.app.services.projects.Model;

          switch (switcher) {

            case 1 : {
              hook.params.sequelize =
                { where: {status: 1},
                  include: [{
                    model: project,
                  }]
                };
              break;
            }
            default : {
              break;
            }

          }

          return hook;

        }
        else {
          return hook;
        }

      }
      , rawFalse],
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

function rawFalse(hook) {

  console.log(hook.params.sequelize)

  if (!hook.params.sequelize) hook.params.sequelize = {};
  Object.assign(hook.params.sequelize, {raw: false});
  return hook;
}
