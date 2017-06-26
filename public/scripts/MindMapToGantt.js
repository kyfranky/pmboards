let viewmodels;

app.authenticate()
  .then(response => {
    return app.passport.verifyJWT(response.accessToken);
  })
  .then(() => {
    app.service('projects').get(getQueryVariable("id"))
      .then(respond => {

        function viewModel() {

          var self = this;

          self.mmid = ko.observable("");
          self.mmparentid = ko.observable("");

          self.mmname = ko.observable("");
          self.datas = ko.observableArray([]).live({id: 'Gantt'});
          self.connecttype = ko.observableArray(["StartStart", "StartFinish", "FinishStart", "FinishFinish"]);

          self.type1 = ko.observableArray([
            "Task",
            "Milestone"
          ]);
          self.type2 = ko.observableArray([
            "Task Group"
          ]);

          self.connectorName = function (id) {
            if (!getParent("" + id)) {
              return "asd";
            }
            return getParent("" + id).name()
          };

          self.setOptionDisable = function (option, item) {
            //console.log(option);
            if (!getParent(self.mmid)) ko.applyBindingsToNode(option, {disable: item.disable}, item);
          };

          self.relationship = ko.observable();
          self.relationshipType = ko.observable("");

          let today = moment().set('hour', 19).set('minute', 0).format("YYYY-MM-DD HH:mm");
          let tommorow = moment().set('hour', 19).set('minute', 0).add(1, 'days').format("YYYY-MM-DD HH:mm");

          self.addItem = function () {

            self.datas.push(
              new Gantt({
                id: self.mmid(),
                parent: self.mmparentid(),
                name: self.mmname(),
                actualStart: today,
                actualEnd: tommorow,
                baselineStart: today,
                baselineEnd: tommorow,
                type: "Task"
              }));

            addLog(self.mmparentid());

          };

          self.removeItem = function (Gantt) {
            self.datas.destroy(Gantt)
          };

          self.firstMatch = ko.dependentObservable(function () {
            let search = self.mmid();
            if (!search) {
              return null;
            } else {
              return ko.utils.arrayFirst(self.datas(), function (Gantt) {
                return Gantt.id() === search
              });
            }
          }, viewModel);

          self.filteredItems = ko.computed(function () {
            var filter = self.mmid();
            if (!filter) {
              return self.datas;
            } else {
              return ko.utils.arrayFilter(self.datas(), function (item) {
                return item.id() !== filter;
              });
            }
          });

          self.checkParents = ko.computed(function () {

            var filter = self.mmparentid();

            if (!filter) {
              return self.datas;
            } else {
              return ko.utils.arrayFilter(self.datas(), function (item) {
                return item.id() === filter;
              });
            }

          });

          self.checkParent = ko.computed(function () {
            if (self.checkParents().length == 0) {
              ////console.log("false");
              return false;
            } else {
              return true;
            }
          });

          self.save = function () {
            //console.log("kirim");

            const dataToSave = ko.toJS(self.datas);

            dataToSave.forEach(function (item) {

              item.actualStart = moment(item.actualStart).set('hour', 19).set('minute', 0).format("YYYY-MM-DD HH:mm");
              item.actualEnd = moment(item.actualEnd).set('hour', 19).set('minute', 0).format("YYYY-MM-DD HH:mm");

              if (item.baselineStart && item.baselineEnd) {
                item.baselineStart = moment(item.baselineStart).set('hour', 19).set('minute', 0).format("YYYY-MM-DD HH:mm");
                item.baselineEnd = moment(item.baselineEnd).set('hour', 19).set('minute', 0).format("YYYY-MM-DD HH:mm");
              }

            });

            app.service('projects').patch(getQueryVariable('id'), {
              GanttChartData: dataToSave,
            }).then(socket.emit("updateGantt", {}))
              .catch(error => console.log(error));
          };

          const frst = respond.GanttChartData;

          const mappedTasks = $.map(respond.GanttChartData, function (item) {
            return new Gantt(item)
          });

          self.datas(mappedTasks);

          self.datas.subscribe(function (a) {

            if (a.length === 0) return;
            //console.log(a)

            let parent = a[a.length - 1].parent();

            //console.log(parent)

            if (getParent(parent)) {
              const parentType = getParent(parent).type();
              if (parentType !== "Task Group") {
                getParent(parent).type("Task Group");
                let temp = self.mmid();
                self.mmid("");
                self.mmid(temp);
              }
            }

          });

          self.checkUpdate = ko.computed(function () {
            return ko.toJSON(self.datas);
          })
            .subscribe(function () {

              if (frst === undefined) return;
              //console.log(ko.toJSON(self.datas));
              ////console.log(JSON.stringify(frst));
              if (JSON.stringify(frst) === ko.toJSON(self.datas)) {
                //console.log("sama")
              }
              else {
                setTimeout(function () {
                  const parent = self.mmparentid().length < 1 ? "0" : self.mmparentid();
                  getShortestDate(parent);
                }, 1000);
                self.save();
              }

            });

          self.getData = function (ID) {

            const search = ID;

            if (search == undefined || search == null) {
              return null;
            } else {
              return ko.utils.arrayFirst(self.datas(), function (Gantt) {
                return Gantt.id() === search
              });
            }

          };

          function getSibling(ID) {
            var filter = ID;
            if (!filter) {
              return self.datas;
            } else {
              return ko.utils.arrayFilter(self.datas(), function (item) {
                return item.parent() === filter;
              });
            }
          };

          function getParent(ID) {

            const search = ID;

            if (search == undefined || search == null) {
              return null;
            } else {
              return ko.utils.arrayFirst(self.datas(), function (Gantt) {
                return Gantt.id() === search
              });
            }

          };

          function getAncestor(ID) {

            let search = ID;

            if (!search) {
              return null;
            } else {
              return ko.utils.arrayFirst(self.datas(), function (Gantt) {
                return Gantt.id() === search
              });
            }


          };

          function getShortestDate(ID) {

            let data = getSibling(ID);

            ////console.log(getSibling(ID));

            let lowestStart = null;
            let highestEnd = null;

            let lowestBStart = null;
            let highestBEnd = null;

            let parent = null;

            if (data.length > 1) {

              for (let i = 0; i < data.length; i++) {

                const Start = moment(data[i].actualStart()).format('YYYY-MM-DD HH:mm');

                if (lowestStart != null) {
                  if (moment(lowestStart).isAfter(Start)) {
                    lowestStart = Start;
                  }
                } else {
                  lowestStart = Start;
                }

                const End = moment(data[i].actualEnd()).format('YYYY-MM-DD HH:mm');

                if (highestEnd != null) {
                  if (moment(highestEnd).isBefore(End)) {
                    highestEnd = End;
                  }
                } else {
                  highestEnd = End;
                }

                const BStart = moment(data[i].baselineStart()).format('YYYY-MM-DD HH:mm');

                if (lowestBStart != null) {
                  if (moment(lowestBStart).isAfter(BStart)) {
                    lowestBStart = BStart;
                  }
                } else {
                  lowestBStart = BStart;
                }

                const BEnd = moment(data[i].baselineEnd()).format('YYYY-MM-DD HH:mm');

                if (highestBEnd != null) {
                  if (moment(highestBEnd).isBefore(BEnd)) {
                    highestBEnd = BEnd;
                  }
                } else {
                  highestBEnd = BEnd;
                }

                parent = data[i].parent();

              }

            } else {

              if (!data[0]) return;

              lowestStart = data[0].actualStart();
              highestEnd = data[0].actualEnd();
              lowestBStart = data[0].baselineStart();
              highestBEnd = data[0].baselineEnd();
              parent = data[0].parent();

            }

            if (!getParent(ID)) return;

            getParent(ID).actualStart(lowestStart);
            getParent(ID).actualEnd(highestEnd);

            getParent(ID).baselineStart(lowestBStart);
            getParent(ID).baselineEnd(highestBEnd);

            if (getAncestor(parent).parent() != null || getAncestor(parent).parent() != undefined) {
              getShortestDate(getAncestor(parent).parent());
            } else {
              ////console.log(lowestStart, highestEnd);
              return
            }
          }

          function addLog(parent) {

            if (parent != 0) {
              const data = ko.toJS(self.datas);
              const parentData = data.filter(function (item) {
                return item.id == parent
              });

              console.log(parentData)

              createLog('Add Task', parentData[0].name, 'Add Task', 2)
            }
            else {
              createLog('Add Task', 'Central Idea', 'Add Task', 2)
            }

          }

        }

        viewmodels = new viewModel();

        ko.utils.socketConnect(0, 0);

        ko.applyBindings(viewmodels);

      })

  });

function Connectors(data) {
  let self = this;
  self.connectTo = ko.observable(data.connectTo);
  self.connectorType = ko.observable(data.connectorType);
}

function Gantt(data) {

  const self = this;

  self.id = ko.observable(data.id);

  self.parent = ko.observable(data.parent);

  self.name = ko.observable(data.name).live({id: ("name " + data.id)});

  self.type = ko.observable(data.type).live({id: ("type " + data.id)});

  self.actualStart = ko.observable(data.actualStart).live({id: ("as " + data.id)});

  self.actualEnd = ko.observable(data.actualEnd).live({id: ("ae " + data.id)});

  if (self.type() !== 'Milestone') {
    self.baselineStart = ko.observable(data.baselineStart).live({id: ("bls " + data.id)});
    self.baselineEnd = ko.observable(data.baselineEnd).live({id: ("ble " + data.id)});
  }

  self.basePeriods = ko.computed(function () {

    if(!self.baselineStart) {
      return 0
    }


    let starts, ends;

    start = moment(self.baselineStart(), 'YYYY-MM-DD HH:mm');
    end = moment(self.baselineEnd(), 'YYYY-MM-DD HH:mm');
    let durationss = end.diff(start, 'days');

    console.log('dur = ',durationss);

    return durationss;
  });

  self.actualPeriods = ko.computed(function () {
    let start, end;
    start = moment(self.actualStart(), 'YYYY-MM-DD HH:mm');
    end = moment(self.actualEnd(), 'YYYY-MM-DD HH:mm');
    let durations = end.diff(start, 'days');
    return durations;
  });

  self.progressValue = ko.observable(data.progressValue);

  self.connector = ko.observableArray([]).live({id: ("con " + data.id)});

  self.addConnectors = function (relationship, relationshipType) {

    if (relationship === undefined || relationshipType === undefined) return;

    self.connector.push(new Connectors({
      connectTo: relationship,
      connectorType: relationshipType
    }))

  };

  self.name.subscribe(function (a) {
    chgtxtDia({key: self.id(), text: a})
  });

  self.type.subscribe(function (newValue) {
    console.log(newValue);

    console.log(newValue === 'Task' && !self.baselineStart);
    console.log(newValue === 'Task' && self.baselineStart);

    if (newValue === 'Task' && !self.baselineStart) {

      console.log("asd")

      self.baselineStart = ko.observable(moment().set('hour', 19).set('minute', 0).format("YYYY-MM-DD HH:mm")).live({id: ("bs " + data.id)});
      self.baselineEnd = ko.observable(moment().set('hour', 19).set('minute', 0).add(1, 'days').format("YYYY-MM-DD HH:mm")).live({id: ("be " + data.id)});
    }
    else if (newValue === 'Milestone') {
      self.actualEnd(self.actualStart());
      delete self.baselineStart;
      delete self.baselineEnd;
    }

  });

  self.actualStart.subscribe(function (a) {
    if (self.type() === 'Milestone') {
      self.actualEnd(self.actualStart());
    }
  });

  self.actualEnd.subscribe(function (a) {
    if (self.type() === 'Milestone') {
      self.actualStart(self.actualEnd());
    }
  });

}

function syncToDB() {

  setTimeout(function (a) {
    viewmodels.save();
  }, 100)

}

function checkGanttData(Id) {

  const id = Id + "";

  if (!viewmodels.getData(id)) return;

  if (viewmodels.mmid() === id) viewmodels.mmid("");

  viewmodels.datas().forEach(function (data) {

    data.connector().forEach(function (dataofData) {
      if (dataofData.connectTo() === id) {
        data.connector.remove(function (datas) {
          return datas.connectTo() === id;
        })
      }
    })
  });

  let oldVal = viewmodels.datas.remove(function (data) {
    return data.id() === id;
  });

  createLog('Delete Task', oldVal[0].name(), 'Delete Data', 2)

}

function checkGanttName(data) {

  if (!viewmodels.getData(data.key + "")) return;

  viewmodels.getData(data.key + "").name(data.text)

}

function createLog(type, oldValue, newValue, id) {

  app.service('project-logs').create({

    projectId: parseInt(getQueryVariable("id")),
    userId: parseInt(app.get('user').id),
    activityType: type,
    oldValue: oldValue,
    newValue: newValue,
    subProjectId: id,
  })
    .catch(error => console.log(error));

}
