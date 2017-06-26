let viewModels;

app.authenticate()
  .then(response => {
    return app.passport.verifyJWT(response.accessToken);
  })
  .then(payload => {
    return app.service('users').get(payload.userId);
  })
  .then(user => {
    app.set('user', user);
    app.service('projects').get(getQueryVariable("id"))
      .then(respond => {

        function viewModel() {

          var self = this;

          self.auth = function () {

            if (respond.creatorId === app.get('user').id) {
              return true;
            }
            else {
              return false
            }

          };

          self.show = function (a, b) {

            if (self.auth()) {

              if (a) {
                return true
              }
              else {
                return false
              }

            }
            else {

              if (a && b) {
                return true
              }
              else {
                return false
              }

            }

          };

          self.projecttitle = ko.observable('').live();
          self.pmname = ko.observable('').live();
          self.startdate = ko.observable('').live();
          self.enddate = ko.observable('').live();
          self.projectdesc = ko.observable('').live();
          self.productdesc = ko.observable('').live();

          self.showPD = ko.observable('').live();
          self.showSH = ko.observable('').live();
          self.showMBR = ko.observable('').live();
          self.showDLV = ko.observable('').live();
          self.showOBJ = ko.observable('').live();
          self.showREQ = ko.observable('').live();
          self.showRSK = ko.observable('').live();
          self.showSGN = ko.observable('').live();

          self.PDpublic = ko.observable('').live();
          self.SHpublic = ko.observable('').live();
          self.MBRpublic = ko.observable('').live();
          self.DLVpublic = ko.observable('').live();
          self.OBJpublic = ko.observable('').live();
          self.REQpublic = ko.observable('').live();
          self.RSKpublic = ko.observable('').live();
          self.SGNpublic = ko.observable('').live();

          self.SH = ko.observableArray([]).live();
          self.MBR = ko.observableArray([]).live();
          self.DLV = ko.observableArray([]).live();
          self.OBJ = ko.observableArray([]).live();
          self.REQ = ko.observableArray([]).live();
          self.RSK = ko.observableArray([]).live();
          self.SGN = ko.observableArray([]).live();

          self.addSH = function () {
            self.SH.push(new Stakeholders("a", "a"));
          };

          self.removeSH = function (a) {
            self.SH.remove(a)
          };

          self.addMBR = function () {
            self.MBR.push(new Members("", ""));
          };
          self.removeMBR = function (a) {
            self.MBR.remove(a)
          };

          self.addDLV = function () {
            self.DLV.push(new Deliverable("", 0));
          };
          self.removeDLV = function (a) {
            self.DLV.remove(a)
          };

          self.addOBJ = function () {
            self.OBJ.push(new Objects(""));
          };
          self.removeOBJ = function (a) {
            self.OBJ.remove(a)
          };

          self.addREQ = function () {
            self.REQ.push(new Requirments(""));
          };
          self.removeREQ = function (a) {
            self.REQ.remove(a)
          };

          self.addRSK = function () {
            self.RSK.push(new Risks(""));
          };
          self.removeRSK = function (a) {
            self.RSK.remove(a)
          };

          self.addSGN = function () {
            self.SGN.push(new Signatures("", ""));
          };
          self.removeSGN = function (a) {
            self.SGN.remove(a)
          };

          self.save = function () {

            const data = ko.toJS(self);

            if (data.__ko_mapping__) delete data.__ko_mapping__;

            app.service('projects').patch(getQueryVariable('id'), {
              CharterData: data,
            })
              .catch(error => console.log(error));
          };

        }

        viewModels = new viewModel();

        ko.mapping.fromJS(respond.CharterData, {}, viewModels);

        ko.utils.socketConnect(0, 0);

        // Activates knockout.js
        ko.applyBindings(viewModels);

      })
  });

function syncToDB() {

  setTimeout(function (a) {
    viewModels.save();
  }, 100)

}

function Stakeholders(name, role) {

  var self = this;

  self.SHname = ko.observable(name).live();
  self.SHrole = ko.observable(role).live();

}

function Members(name, role) {

  var self = this;

  self.MBRname = ko.observable(name).live();
  self.MBRrole = ko.observable(role).live();
}

function Deliverable(name, duedate) {

  var self = this;

  self.DLVname = ko.observable(name).live();
  self.DLVdue = ko.observable(new Date(duedate)).live();
}

function Objects(name) {

  var self = this;

  self.OBJvalue = ko.observable(name).live();
}

function Requirments(name) {

  var self = this;

  self.REQvalue = ko.observable(name).live();
}

function Risks(name) {

  var self = this;

  self.RSKvalue = ko.observable(name).live();
}

function Signatures(name, role) {

  var self = this;

  self.SGNname = ko.observable(name).live();
  self.SGNrole = ko.observable(role).live();
}

let is;


