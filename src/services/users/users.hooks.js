const {authenticate} = require('feathers-authentication').hooks;
const commonHooks = require('feathers-hooks-common');
const {restrictToOwner} = require('feathers-authentication-hooks');

const Sequelize = require('sequelize');

const {hashPassword} = require('feathers-authentication-local').hooks;
const restrict = [
  authenticate('jwt'),
  restrictToOwner({
    idField: 'id',
    ownerField: 'id'
  })
];

module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      checkInclude,
      rawFalse
    ],
    get: [
      authenticate('jwt'),
      //...restrict
    ],
    create: [hashPassword()],
    update: [...restrict, hashPassword()],
    patch: [...restrict, hashPassword()],
    remove: [...restrict]
  },

  after: {
    all: [
      commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('password')
      )
    ],
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
    delete hook.params.query.include;
    const projects = hook.app.services.projects.Model;
    hook.params.sequelize =
      {
        where: {id: hook.params.user.id},
        include: [
          {
            model: projects
          }
        ]
      };
    return hook;
  }
  else if (hook.params.query.includefriends) {

    delete hook.params.query.includefriends;
    const user = hook.app.services.users.Model;

    hook.params.sequelize =
      {
        where: {
          id: hook.params.user.id
        },
        include: [
          {
            model: user,
            as: 'Inviter',
            through: {
              where: {inviterId: hook.params.user.id, status: 1},
              attributes: [],
            },
            where: {},
            attributes: ['firstName', 'lastName','profession','company'],
            required: false
          },
          {
            model: user,
            as: 'Invited',
            through: {
              where: {invitedId: hook.params.user.id, status: 1},
              attributes: [],
            },
            where: {},
            attributes: ['firstName', 'lastName','profession','company'],
            required: false
          }
        ]
      };

    if (hook.params.query.uName) {

      const queryName = hook.params.query.uName;
      delete hook.params.query.uName;

      const test1 = Sequelize.where(Sequelize.fn('concat',
        Sequelize.col('Inviter.firstName'),
        ' ',
        Sequelize.col('Inviter.lastName')),
        {like: queryName}
      );

      const test2 = Sequelize.where(Sequelize.fn('concat',
        Sequelize.col('Invited.firstName'),
        ' ',
        Sequelize.col('Invited.lastName')),
        {like: queryName});

      hook.params.sequelize.include[0].where = test1;
      hook.params.sequelize.include[1].where = test2;

    }
    return hook;
  }
  else if (hook.params.query.includeInvitation) {

    delete hook.params.query.includeInvitation;
    const user = hook.app.services.users.Model;

    hook.params.sequelize =
      {
        where: {
          id: hook.params.user.id
        },
        include: [
          {
            model: user,
            as: 'Invited',
            through: {
              where: {invitedId: hook.params.user.id, status: 0},
              attributes: ['id'],
            },
            attributes: ['firstName', 'lastName', 'id','profession','company'],
            // required: true
          }
        ]
      };

    return hook;
  }
  else if (hook.params.query.includeRequest) {

    delete hook.params.query.includeRequest;

    const user = hook.app.services.users.Model;
    const project = hook.app.services.projects.Model;

    hook.params.sequelize = {
      attributes: ['id', 'firstName', 'lastName','profession','company'],
      where: {id: hook.params.user.id},

      include: [{

        model: project,
        attributes: ['id', 'projectTitle'],

        through: {where: {userId: hook.params.user.id, status: 0}, attributes: ['id']},

        include: [{
          model: user,
          as: 'Owner',
          attributes: ['firstName', 'lastName','profession','company'],
        }]

      }]
    };

    return hook;
  }
  else if (hook.params.query.includefriendsforteam) {

    const projectId = hook.params.query.projectId;

    const user = hook.app.services.users.Model;
    const project = hook.app.services.projects.Model;

    delete hook.params.query.includefriendsforteam;
    delete hook.params.query.projectId;

    hook.params.sequelize =
      {
        where: {
          id: hook.params.user.id
        },
        include: [
          {
            model: user,
            as: 'Inviter',
            through: {
              where: {inviterId: hook.params.user.id, status: 1},
              attributes: [],
            },
            where: {},
            attributes: ['firstName', 'lastName', 'id','profession','company'],
            required: false,

            include: [
              {
                model: project,
                through: {},
                where: {id: projectId},
                required: false
              }
            ]
          },
          {
            model: user,
            as: 'Invited',
            through: {
              where: {invitedId: hook.params.user.id, status: 1},
              attributes: [],
            },
            where: {},
            attributes: ['firstName', 'lastName', 'id','profession','company'],
            required: false,

            include: [
              {
                model: project,
                through: {},
                where: {id: projectId},
                required: false
              }
            ]

          }
        ]
      };

    if (hook.params.query.uName) {

      const queryName = hook.params.query.uName;
      delete hook.params.query.uName;

      const test1 = Sequelize.where(Sequelize.fn('concat',
        Sequelize.col('Inviter.firstName'),
        ' ',
        Sequelize.col('Inviter.lastName')),
        {like: queryName}
      );

      const test2 = Sequelize.where(Sequelize.fn('concat',
        Sequelize.col('Invited.firstName'),
        ' ',
        Sequelize.col('Invited.lastName')),
        {like: queryName});

      hook.params.sequelize.include[0].where = test1;
      hook.params.sequelize.include[1].where = test2;

    }

    return hook;
  }
  else if (hook.params.query.includeProjects) {

    const user = hook.app.services.users.Model;
    const project = hook.app.services.projects.Model;
    const teams = hook.app.services.teams.Model;

    delete hook.params.query.includeProjects;

    hook.params.sequelize =
      {
        where: {
          id: hook.params.user.id
        },
        include: [
          {
            model: project,
            attributes: ['id','projectTitle','startDate','endDate'],
            required: true,
            through: {
              where: {userId: hook.params.user.id, status: 1},
              attributes: [],
            },
            include: [{
              model: user,
              as: 'Owner',
              attributes: ['firstName', 'lastName','profession','company'],
            }]
          }
        ]
      };

    if (hook.params.query.uName) {

      const queryName = hook.params.query.uName;
      delete hook.params.query.uName;

      const test1 = Sequelize.where(Sequelize.fn('concat',
        Sequelize.col('Inviter.firstName'),
        ' ',
        Sequelize.col('Inviter.lastName')),
        {like: queryName}
      );

      const test2 = Sequelize.where(Sequelize.fn('concat',
        Sequelize.col('Invited.firstName'),
        ' ',
        Sequelize.col('Invited.lastName')),
        {like: queryName});

      hook.params.sequelize.include[0].where = test1;
      hook.params.sequelize.include[1].where = test2;

    }

    return hook;
  }

  if (hook.params.query.uName) {

    const user = hook.app.services.users.Model;

    const queryName = hook.params.query.uName;
    delete hook.params.query.uName;

    const test1 = Sequelize.where(Sequelize.fn('concat',
      Sequelize.col('users.firstName'),
      ' ',
      Sequelize.col('users.lastName')),
      {like: queryName}
    );

    hook.params.sequelize =
      {
        attributes: ['firstName', 'lastName', 'id','profession','company'],
        where: [
          {id: {$not: hook.params.user.id}}
        ],
        include: [
          {
            model: user,
            as: 'Inviter',
            through: {
              where: {invitedId: hook.params.user.id},
              attributes: [],
            },
            where: {},
            attributes: ['firstName', 'lastName','profession','company'],
            required: false
          },
          {
            model: user,
            as: 'Invited',
            through: {
              where: {inviterId: hook.params.user.id},
              attributes: [],
            },
            where: {},
            attributes: ['firstName', 'lastName','profession','company'],
            required: false
          }
        ]
      };

    hook.params.sequelize.where.push(test1);

    return hook;

  }
  else {
    return hook;
  }

}
