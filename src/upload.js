const {authenticate} = require('feathers-authentication').hooks;

const multer = require('multer');
const multipartMiddleware = multer();
const dauria = require('dauria');

const blobService = require('feathers-blob');

const fs = require('fs-blob-store');
const blobStorage = fs(__dirname + '/uploads');

module.exports = function () {
  const app = this;

  app.use('/uploads',
    multipartMiddleware.single('uri'),
    function (req, res, next) {
      req.feathers.file = req.file;
      req.feathers.roomId = req.body.roomId;
      next();
    },
    blobService({
      Model: blobStorage
    })
  );

  app.service('/uploads').before({
    all: [],
    create: [authenticate('jwt'), check],
  });

  app.service('/uploads').after({
    create: [HooktoDB]
  });

  function check(hook) {
    if (!hook.data.uri && hook.params.file) {
      const file = hook.params.file;
      const uri = dauria.getBase64DataURI(file.buffer, file.mimetype);
      hook.data = Object.assign({}, hook.data, {
        uri: uri
      });
    }
  }

  function HooktoDB(hook) {

    console.log(hook.params)

    app.service('documents').create({
      FileName: hook.params.file.originalname,
      documentId: hook.result.id,
      projectId: hook.params.roomId
    })

  }

};
