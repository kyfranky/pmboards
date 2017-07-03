const {authenticate} = require('feathers-authentication').hooks;
const multer = require('multer');
const multipartMiddleware = multer();
const AWS = require('aws-sdk');
const dauria = require('dauria');
const BlobService = require('feathers-blob');
const S3BlobStore = require('s3-blob-store');

module.exports = function () {



  const app = this;

  const port = app.get('database_url');
  const accskey = app.get('AWS_access_key_id');
  const scrtkey = app.get('AWS_secret_key');

  console.log("ini dbase : ",port);
  console.log("ini access : ",accskey);
  console.log("ini secret : ",scrtkey);

  const s3 = new AWS.S3({
    accessKeyId: accskey,
    secretAccessKey: scrtkey
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

  app.service('/uploads').error({
    all: [showerror]
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

  function showerror(hook) {
    hook.params.s3 = {ACL: 'public-read'};
  }

  function HooktoDB(hook) {
    if (hook.params.file) {
      app.service('documents').create({
        FileName: hook.params.file.originalname,
        documentId: hook.result.id,
        projectId: hook.params.roomId
      })
    }
  }

};
