app.service('uploads').on('created', function (file) {
  //console.log(file)
  //showing(file.uri)
});

Dropzone.options.myAwesomeDropzone = {
  paramName: "uri",
  uploadMultiple: false,
  acceptedFiles: ".pdf",
  maxFilesize: 5, // MB
  parallelUploads: 5,
  dictDefaultMessage: 'Drag or Click Here to Upload',
  //addRemoveLinks: true,
  //autoProcessQueue: false,
  maxFiles: 1,
  init: function () {

    var myDropzone = this;

    this.on('uploadprogress', function (file, progress) {
      console.log('progresss', progress);
    });

    this.on('error', function (a, b) {

      setTimeout(function () {
        myDropzone.removeFile(a);
      }, 3000);

    });

    this.on("removedfile", function (file) {
      //console.log(file);
    });

    this.on("sending", function (a, b, c) {
      c.append('roomId', app.get('roomId'));
      c.append('accessToken', app.get('accessToken'));
    });

    this.on("success", function (file) {

      setTimeout(function () {
        myDropzone.removeFile(file);
      }, 3000);

    });

    $('#buts').on("click", function () {
      if (myDropzone.getQueuedFiles().length > 0) {
        myDropzone.processQueue()
      }
    });

    $('#download').on("click", function () {
      console.log("asd")
    });

  }
};
