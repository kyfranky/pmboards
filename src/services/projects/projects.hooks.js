const {authenticate} = require('feathers-authentication').hooks;

const process = [
  addCreator,
  addCharter,
  addMindMap,
  addGanttChart
];

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      checkInclude,
      rawFalse
    ],
    get: [],
    create: [...process],
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

  if (!hook.params.sequelize) hook.params.sequelize = {};
  Object.assign(hook.params.sequelize, {raw: false});
  return hook;

}

function checkInclude(hook) {

  if (hook.params.query.include) {

    const switcher = hook.params.query.include;

    delete hook.params.query.include;

    const user = hook.app.services.users.Model;
    const team = hook.app.services.teams.Model;

    switch (switcher) {
      case 1 : {
        hook.params.sequelize =
          {
            attributes: ['id', 'creatorId', 'endDate', 'startDate', 'PmName', 'projectDescription', 'projectTitle'],
            include: [{
              model: user,
              through: {
                where: {status: 1}
              },
              attributes: ['firstName', 'lastName', 'profession', 'company'],
            }]
          };
        break;
      }
      case 2 : {
        hook.params.sequelize =
          {
            attributes: ['id', 'creatorId', 'endDate', 'startDate', 'PmName', 'projectDescription', 'projectTitle'],
            include: [{
              model: user,
              through: {
                where: {status: 0}
              },
              attributes: ['firstName', 'lastName', 'profession', 'company'],
            }]
          };
        break;
      }
      case 3 : {
        hook.params.sequelize =
          {
            attributes: ['id', 'creatorId', 'endDate', 'startDate', 'PmName', 'projectDescription', 'projectTitle'],
            include: [{
              model: team,
              where: {status: 1},
              attributes: ['firstName', 'lastName', 'profession', 'company'],
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

function addCreator(hook) {
  const userId = hook.params.user.id;
  const name = hook.params.user.firstName + ' ' + hook.params.user.lastName;

  hook.data = Object.assign({}, hook.data, {
    creatorId: userId,
    PmName: name
  });

  return Promise.resolve(hook);

}

function addCharter(hook) {

  let data = {
    'projecttitle': hook.data.projectTitle,
    'pmname': hook.params.user.firstName,
    'startdate': hook.data.startDate,
    'enddate': hook.data.endDate,
    'projectdesc': hook.data.projectDescription,
    'productdesc': '',
    'SH': [{'SHname': '', 'SHrole': ''}],
    'MBR': [{'MBRname': '', 'MBRrole': ''}],
    'DLV': [{'DLVname': '', 'DLVdue': '1970-01-01T00:00:00.000Z'}],
    'OBJ': [{'OBJvalue': ''}],
    'REQ': [{'REQvalue': ''}],
    'RSK': [{'RSKvalue': ''}],
    'SGN': [{'SGNname': '', 'SGNrole': ''}]
  };

  hook.data = Object.assign({}, hook.data, {
    CharterData: data
  });

  return Promise.resolve(hook);
}

function addGanttChart(hook) {

  // Hooks can either return nothing or a promise
  // that resolves with the `hook` object for asynchronous operations

  let data = [{
    'id': '0',
    'name': hook.data.projectTitle,
    'type': 'Task Group',
    'periods': 0,
    'baselineStart': hook.data.startDate,
    'baselineEnd': hook.data.endDate,
    'actualStart': hook.data.startDate,
    'actualEnd': hook.data.endDate,
    'progressValue': 0,
    'connector': []
  }];

  hook.data = Object.assign({}, hook.data, {
    GanttChartData: data
  });

  return Promise.resolve(hook);

}

function addMindMap(hook) {

  let data =
    {
      'class': 'go.TreeModel',
      'nodeDataArray': [
        {
          'key': 0,
          'text': hook.data.projectTitle,
          'loc': '0 0',
          'movable': false,
          'deletable': false,
          'font': 'Italic small-caps bold 48px Georgia, Serif'
        },
        {
          'key': 1,
          'parent': 0,
          'text': 'Initiation Phase',
          'brush': 'skyblue',
          'dir': 'right',
          'loc': '278.7833404541015 -16.01000099182128'
        },
        {
          'key': 2,
          'parent': 0,
          'text': 'Planning Phase',
          'brush': 'darkseagreen',
          'dir': 'right',
          'loc': '278.7833404541015 86.48999900817873'
        },
        {
          'key': 3,
          'parent': 0,
          'text': 'Execution Phase',
          'brush': 'palevioletred',
          'dir': 'left',
          'loc': '-29.999999999999986 -31.385000991821286'
        },
        {
          'key': 4,
          'parent': 0,
          'text': 'Control Phase',
          'brush': 'coral',
          'dir': 'left',
          'loc': '-27 241.8649990081787'
        },
        {
          'key': 5,
          'parent': 0,
          'text': 'Closing Phase',
          'brush': '#8992f9',
          'dir': 'left',
          'loc': '-27 241.8649990081787'
        },

      ]
    };

  hook.data = Object.assign({}, hook.data, {
    MindMapData: data
  });

  return Promise.resolve(hook);
}
