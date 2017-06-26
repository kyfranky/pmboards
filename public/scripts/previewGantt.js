anychart.onDocumentReady(function () {

  app.authenticate()
    .then(response => {
      return app.passport.verifyJWT(response.accessToken);
    })
    .then(() => {
      app.service('projects').get(getQueryVariable("id"))
        .then(respond => {

          var selectedItem;
          var nameChange;
          var CPMon = false;
          var CPMdata;
          let pure = [];

          const GantData = respond.GanttChartData.sort(function (a, b) {
            var dateA = new Date(a.actualStart);
            var dateB = new Date(b.actualStart);
            return dateA - dateB;
          });

          // create data tree on our data
          var treeData = anychart.data.tree(GantData, anychart.enums.TreeFillingMethod.AS_TABLE);

          // create project gantt chart
          chart = anychart.ganttProject();


          let as = treeData.search("id", "0").get("actualStart");
          let bs = treeData.search("id", "0").get("baselineStart");

          let ae = treeData.search("id", "0").get("actualEnd");
          let be = treeData.search("id", "0").get("baselineEnd");

          if (as > bs) {
            chart.xScale().minimum(moment(bs).subtract(30, 'days'));
          }
          else {
            chart.xScale().minimum(moment(as).subtract(30, 'days'));
          }

          if (ae > be) {
            chart.xScale().maximum(moment(ae).add(30, 'days'));
          }
          else {
            chart.xScale().maximum(moment(be).add(30, 'days'));
          }

          // set data for the chart
          chart.data(treeData);

          // set start splitter position settings
          chart.splitterPosition(300);

          // get chart data grid link to set column settings
          var dataGrid = chart.dataGrid();

          var title = chart.title();
          title.enabled(true);
          title.text(respond.projectTitle);

          // set first column settings
          var firstColumn = dataGrid.column(0);
          firstColumn.title("#");
          firstColumn.width(30);
          firstColumn.cellTextSettings().hAlign("center");

          // set second column settings
          var secondColumn = dataGrid.column(1);
          secondColumn.cellTextSettings().hAlign("left");
          secondColumn.width(250);

          dataGrid.column(2)
            .title('Planned Start')
            .setColumnFormat('baselineStart', 'dateIso8601')
            .cellTextSettings().hAlign("center");

          dataGrid.column(3)
            .title('Planned End')
            .setColumnFormat('baselineEnd', 'dateIso8601')
            .cellTextSettings().hAlign("center")
            .width(500);

          dataGrid.column(4)
            .title('Actual Start')
            .setColumnFormat('actualStart', 'dateIso8601')
            .cellTextSettings().hAlign("center");

          dataGrid.column(5)
            .title('Actual End')
            .setColumnFormat('actualEnd', 'dateIso8601')
            .cellTextSettings().hAlign("center")
            .width(500);

          dataGrid.column(2).width(150);
          dataGrid.column(3).width(150);
          dataGrid.column(4).width(150);
          dataGrid.column(5).width(150);

          dataGrid.column(6)
            .title('Durations')
            .setColumnFormat('periods', 'integer')
            .cellTextSettings().hAlign("center");

          dataGrid.column(7)
            .title('Type')
            .setColumnFormat('type', 'text')
            .cellTextSettings().hAlign("center");

          dataGrid.column(7).enabled(false);


          // enable Gantt toolbar
          var toolbar = anychart.ui.ganttToolbar();
          toolbar.container("container");
          toolbar.target(chart); // sets target
          toolbar.draw();

          var timeLine = chart.getTimeline();
          // disable Gantt editing
          timeLine.editing(false);

          var tooltipTL = timeLine.tooltip();
          var tooltipDG = dataGrid.tooltip();

          tooltipTL.format(function () {
            return "Planned Start : " + moment(this.item.La.baselineStart).format('YYYY-MMMM-DD') + "\n" +
              "Planned End   : " + moment(this.item.La.baselineEnd).format('YYYY-MMMM-DD') + "\n" +
              "Actual Start  : " + moment(this.item.La.actualStart).format('YYYY-MMMM-DD') + "\n" +
              "Actual End    : " + moment(this.item.La.actualEnd).format('YYYY-MMMM-DD') + "\n" +
              "Progress  : " + this.item.La.progressValue + "\n" +
              "Durations    : " + this.item.La.periods + " Days"
          });

          tooltipDG.format(function () {
            return "Planned Start : " + moment(this.item.La.baselineStart).format('YYYY-MMMM-DD') + "\n" +
              "Planned End   : " + moment(this.item.La.baselineEnd).format('YYYY-MMMM-DD') + "\n" +
              "Actual Start  : " + moment(this.item.La.actualStart).format('YYYY-MMMM-DD') + "\n" +
              "Actual End    : " + moment(this.item.La.actualEnd).format('YYYY-MMMM-DD') + "\n" +
              "Progress  : " + this.item.La.progressValue + "\n" +
              "Durations    : " + this.item.La.periods + " Days"
          });

          tooltipDG.width(200);
          tooltipDG.height(100);
          tooltipDG.maxFontSize(20);
          tooltipDG.adjustFontSize(true);

          chart.defaultRowHeight(30);

          // set container id for the chart
          chart.container("container");

          chart.getTimeline().lineMarker(0).value(anychart.enums.GanttDateTimeMarkers.CURRENT);
          chart.getTimeline().textMarker(0).value(anychart.enums.GanttDateTimeMarkers.CURRENT).text('TODAY').fontSize(15);

          // initiate chart drawing
          chart.draw();

          // zoom chart to specified date
          chart.fitAll();

          // get current toolbar
          var domToolbar = document.getElementsByClassName("anychart-toolbar")[0];

          // dispose all buttons in toolbar
          domToolbar.innerHTML = "";
          // change buttons alignment
          domToolbar.style.textAlign = "right";

          var separator = document.createElement("div");
          separator.className = "anychart-toolbar-separator anychart-toolbar-separator-disabled anychart-inline-block";
          separator.innerHTML = "&nbsp;";
          separator.setAttribute("role", "separator");
          separator.setAttribute("arial-disabled", "true");

          var separator2 = document.createElement("div");
          separator2.className = "anychart-toolbar-separator anychart-toolbar-separator-disabled anychart-inline-block";
          separator2.innerHTML = "&nbsp;";
          separator2.setAttribute("role", "separator");
          separator2.setAttribute("arial-disabled", "true");

          var separator3 = document.createElement("div");
          separator3.className = "anychart-toolbar-separator anychart-toolbar-separator-disabled anychart-inline-block";
          separator3.innerHTML = "&nbsp;";
          separator3.setAttribute("role", "separator");
          separator3.setAttribute("arial-disabled", "true");

          var separator4 = document.createElement("div");
          separator4.className = "anychart-toolbar-separator anychart-toolbar-separator-disabled anychart-inline-block";
          separator4.innerHTML = "&nbsp;";
          separator4.setAttribute("role", "separator");
          separator4.setAttribute("arial-disabled", "true");

          var separator5 = document.createElement("div");
          separator5.className = "anychart-toolbar-separator anychart-toolbar-separator-disabled anychart-inline-block";
          separator5.innerHTML = "&nbsp;";
          separator5.setAttribute("role", "separator");
          separator5.setAttribute("arial-disabled", "true");

          var editButton4 = document.createElement("div");

          var outerBox4 = document.createElement("div");
          outerBox4.className = "anychart-inline-block anychart-toolbar-button-outer-box";

          var innerBox4 = document.createElement("div");
          innerBox4.innerHTML = "Zoom In";
          innerBox4.className = "anychart-inline-block anychart-toolbar-button-inner-box";

          domToolbar.appendChild(separator3);
          outerBox4.appendChild(innerBox4);
          editButton4.appendChild(outerBox4);
          domToolbar.appendChild(editButton4);

          var editButton5 = document.createElement("div");

          var outerBox5 = document.createElement("div");
          outerBox5.className = "anychart-inline-block anychart-toolbar-button-outer-box";

          var innerBox5 = document.createElement("div");
          innerBox5.innerHTML = "Zoom Out";
          innerBox5.className = "anychart-inline-block anychart-toolbar-button-inner-box";

          outerBox5.appendChild(innerBox5);
          editButton5.appendChild(outerBox5);
          domToolbar.appendChild(editButton5);

          var editButton6 = document.createElement("div");

          var outerBox6 = document.createElement("div");
          outerBox6.className = "anychart-inline-block anychart-toolbar-button-outer-box";

          var innerBox6 = document.createElement("div");
          innerBox6.innerHTML = "Critical Path";
          innerBox6.className = "anychart-inline-block anychart-toolbar-button-inner-box";

          domToolbar.appendChild(separator4);
          outerBox6.appendChild(innerBox6);
          editButton6.appendChild(outerBox6);
          domToolbar.appendChild(editButton6);


          // create class lists for different states of edit button
          var buttonClasses = ["anychart-inline-block", "anychart-toolbar-button"];
          var hoverClasses = ["anychart-inline-block", "anychart-toolbar-button", "anychart-toolbar-button-hover"];
          var clickClasses = ["anychart-inline-block", "anychart-toolbar-button", "anychart-toolbar-button-hover", "anychart-toolbar-button-active"];

          // set default class names for tooltip button
          editButton4.className = buttonClasses.join(" ");
          editButton4.setAttribute("role", "button");

          editButton4.addEventListener("mouseover", function () {
            editButton4.className = hoverClasses.join(" ");
          });
          editButton4.addEventListener("mouseout", function () {
            editButton4.className = buttonClasses.join(" ");
          });
          editButton4.addEventListener("mousedown", function () {
            editButton4.className = clickClasses.join(" ");
          });
          editButton4.addEventListener("mouseup", function () {
            editButton4.className = hoverClasses.join(" ");
          });

          // set default class names for tooltip button
          editButton5.className = buttonClasses.join(" ");
          editButton5.setAttribute("role", "button");

          editButton5.addEventListener("mouseover", function () {
            editButton5.className = hoverClasses.join(" ");
          });
          editButton5.addEventListener("mouseout", function () {
            editButton5.className = buttonClasses.join(" ");
          });
          editButton5.addEventListener("mousedown", function () {
            editButton5.className = clickClasses.join(" ");
          });
          editButton5.addEventListener("mouseup", function () {
            editButton5.className = hoverClasses.join(" ");
          });

          // set default class names for tooltip button
          editButton6.className = buttonClasses.join(" ");
          editButton6.setAttribute("role", "button");

          editButton6.addEventListener("mouseover", function () {
            editButton6.className = hoverClasses.join(" ");
          });
          editButton6.addEventListener("mouseout", function () {
            editButton6.className = buttonClasses.join(" ");
          });
          editButton6.addEventListener("mousedown", function () {
            editButton6.className = clickClasses.join(" ");
          });
          editButton6.addEventListener("mouseup", function () {
            editButton6.className = hoverClasses.join(" ");
          });

          editButton4.addEventListener("click", function () {
            chart.zoomIn()
          });
          editButton5.addEventListener("click", function () {
            chart.zoomOut()
          });
          editButton6.addEventListener("click", function () {
            if (!CPMon) {
              cpm();
            }
            else {
              cpmoff();
            }
          });

          function getDats(data) {
            if (data.numChildren() <= 0) return pure;
            let temp = data.getChildren();
            for (let i = 0; i < data.numChildren(); i++) {
              var parent = temp[i].getParent();
              var rowData = temp[i].La;
              rowData.id = rowData.id + "";
              if (parent != null) rowData["parent"] = parent.La.id;
              delete rowData.actual;
              delete rowData.progress;
              delete rowData.milestone;
              pure.push(rowData);
              getDats(temp[i]);
            }
            return pure;
          }

          function cpm() {

            pure = [];

            let GanttData = getDats(treeData);
            let tempData = [];

            GanttData = GanttData.filter(function (item) {
              if (item.type === "Task Group") {
                return false;
              }
              return true;
            });

            GanttData.forEach(function (item) {
              let dataProcess = {id: item.id + "", duration: item.periods, predecessors: []};
              tempData[dataProcess.id] = dataProcess
            });

            GanttData.forEach(function (item) {
              if (item.connector.length !== 0) {
                item.connector.forEach(function (connector) {
                  if (tempData[connector.connectTo]) {
                    tempData[connector.connectTo].predecessors.push(item.id);
                  }
                });
              }
            });

            const cpm = [];

            tempData.forEach(function (item) {
              cpm.push(calcCPM(tempData, item.id))
            });

            const makeItRed = {"fill": "red"};
            const redTaskProgress = {"fill": {"color": "black", "opacity": 0.3}};

            let longest = [{'eet': 0}];

            for (var i = 0; i < cpm.length; i++) {
              if (cpm[i][0].eet > longest[0].eet) {
                longest = cpm[i];
              }
            }

            longest.forEach(function (item) {
              let data = treeData.search("id", item.id);
              if (data.get('type') === 'Task') {
                data.set('actual', makeItRed);
                data.set('progress', redTaskProgress);
              }
              else if (data.get('type') === 'Milestone') {
                data.set('milestone', makeItRed);
              }
              //treeData.search("id", item.id).set('connector', {'fill': 'red'})
            });

            CPMdata = longest;
            CPMon = true;

          }

          function cpmoff() {
            pure = [];
            CPMon = false;
            CPMdata.forEach(function (item) {
              treeData.search("id", item.id).set('actual', '')
              treeData.search("id", item.id).set('progress', '')
              treeData.search("id", item.id).set('milestone', '')
            });
            CPMdata = null;
          }

        })
    })

});
