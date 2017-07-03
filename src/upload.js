const {authenticate} = require('feathers-authentication').hooks;
const multer = require('multer');
const multipartMiddleware = multer();
const AWS = require('aws-sdk');
const dauria = require('dauria');
const BlobService = require('feathers-blob');
const S3BlobStore = require('s3-blob-store');

module.exports = function () {

  console.log(port);

  const app = this;

  const port = app.get('database_url');

  const s3 = new AWS.S3({
    accessKeyId: 'AKIAJZ2WTZOO3GRGPH2A',
    secretAccessKey: '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'
  });

  const blobStore = S3BlobStore({
    client: s3,
    bucket: 'pmboard'
  });

  const blobService = BlobService({
    Model: blobStore
  });

  const blob = {
    uri: dauria.getBase64DataURI(new Buffer('hellssssso world'), 'text/plain')
  };

  app.use('/uploads',
    multipartMiddleware.single('uri'),
    function (req, res, next) {
      req.feathers.file = req.file;
      req.feathers.roomId = req.body.roomId;
      console.log(req.body);
      next();
    },
    blobService
  );

  app.service('/uploads').before({
    all: [],
    create: [authenticate('jwt'),check, makePublic],
  });

  app.service('/uploads').after({
    create: [HooktoDB]
  });

  app.service('/uploads').create(blob).then(function (result) {
    console.log('Stored blob with id', result.id);
  }).catch(err => {
    console.error(err);
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

  function makePublic(hook) {
    hook.params.s3 = {ACL: 'public-read'};
  }

  function HooktoDB(hook) {
    console.log(hook.params);
    if (hook.params.file) {
      app.service('documents').create({
        FileName: hook.params.file.originalname,
        documentId: hook.result.id,
        projectId: hook.params.roomId
      })
    }
  }

};
