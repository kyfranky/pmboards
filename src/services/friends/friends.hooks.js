const {authenticate} = require('feathers-authentication').hooks;

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [setInviter],
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

function setInviter(hook) {

  const userId = hook.params.user.id;

  hook.data = Object.assign({}, hook.data, {
    inviterId: userId
  });

  return Promise.resolve(hook);

}
