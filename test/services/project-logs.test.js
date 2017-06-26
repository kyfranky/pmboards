const assert = require('assert');
const app = require('../../src/app');

describe('\'projectLogs\' service', () => {
  it('registered the service', () => {
    const service = app.service('project-logs');

    assert.ok(service, 'Registered the service');
  });
});
