const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');

const signup = require('./signup');

module.exports = function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters, `notFound` and
  // the error handler have to go last.
  const app = this;

  app.post('/signup', signup(app));

  app.use(notFound());
  app.use(handler());
};
