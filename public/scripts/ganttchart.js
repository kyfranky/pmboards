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
          title.fontSize(18);

          var padding = title.padding();
          padding.top(10);

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
            .title('Planned Periods')
            .setColumnFormat('basePeriods', 'integer')
            .cellTextSettings().hAlign("center");

          dataGrid.column(5)
            .title('Actual Start')
            .setColumnFormat('actualStart', 'dateIso8601')
            .cellTextSettings().hAlign("center");

          dataGrid.column(6)
            .title('Actual End')
            .setColumnFormat('actualEnd', 'dateIso8601')
            .cellTextSettings().hAlign("center")
            .width(500);

          dataGrid.column(7)
            .title('Actual Periods')
            .setColumnFormat('actualPeriods', 'integer')
            .cellTextSettings().hAlign("center");

          dataGrid.column(2).width(150);
          dataGrid.column(3).width(150);
          dataGrid.column(4).width(150);
          dataGrid.column(5).width(150);
          dataGrid.column(6).width(150);
          dataGrid.column(7).width(150);

          dataGrid.column(8)
            .title('Type')
            .setColumnFormat('type', 'text')
            .cellTextSettings().hAlign("center");

          dataGrid.column(8).enabled(false);

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
            return "Planned Start : " + moment(this.item.get("baselineStart")).format('YYYY-MMMM-DD') + "\n" +
              "Planned End   : " + moment(this.item.get("baselineEnd")).format('YYYY-MMMM-DD') + "\n" +
              "Planned Durations    : " + this.item.get("basePeriods") + " Days" + "\n" +
              "Actual Start  : " + moment(this.item.get("actualStart")).format('YYYY-MMMM-DD') + "\n" +
              "Actual End    : " + moment(this.item.get("actualEnd")).format('YYYY-MMMM-DD') + "\n" +
              "Actual Durations    : " + this.item.get("actualPeriods") + " Days" + "\n" +
              "Progress  : " + this.item.get("progressValue") + "\n"
          });

          tooltipDG.format(function () {
            return "Planned Start : " + moment(this.item.get("baselineStart")).format('YYYY-MMMM-DD') + "\n" +
              "Planned End   : " + moment(this.item.get("baselineEnd")).format('YYYY-MMMM-DD') + "\n" +
              "Actual Start  : " + moment(this.item.get("actualStart")).format('YYYY-MMMM-DD') + "\n" +
              "Actual End    : " + moment(this.item.get("actualEnd")).format('YYYY-MMMM-DD') + "\n" +
              "Durations    : " + this.item.get("progressValue") + " Days" + "\n" +
              "Progress  : " + this.item.get("progressValue") + "\n"
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

          // create button for live editing
          var editButton = document.createElement("div");

          var outerBox = document.createElement("div");
          outerBox.className = "anychart-inline-block anychart-toolbar-button-outer-box";

          var innerBox = document.createElement("div");
          innerBox.innerHTML = "Enable Live Edit";
          innerBox.className = "anychart-inline-block anychart-toolbar-button-inner-box";

          outerBox.appendChild(innerBox);
          editButton.appendChild(outerBox);
          domToolbar.appendChild(editButton);

          var editButton7 = document.createElement("div");

          var outerBox7 = document.createElement("div");
          outerBox7.className = "anychart-inline-block anychart-toolbar-button-outer-box";

          var innerBox7 = document.createElement("div");
          innerBox7.innerHTML = "Edit Name";
          innerBox7.className = "anychart-inline-block anychart-toolbar-button-inner-box";

          domToolbar.appendChild(separator5);
          outerBox7.appendChild(innerBox7);
          editButton7.appendChild(outerBox7);
          domToolbar.appendChild(editButton7);

          var editButton2 = document.createElement("div");

          var outerBox2 = document.createElement("div");
          outerBox2.className = "anychart-inline-block anychart-toolbar-button-outer-box";

          var innerBox2 = document.createElement("div");
          innerBox2.innerHTML = "Add Data";
          innerBox2.className = "anychart-inline-block anychart-toolbar-button-inner-box";

          domToolbar.appendChild(separator);
          outerBox2.appendChild(innerBox2);
          editButton2.appendChild(outerBox2);
          domToolbar.appendChild(editButton2);

          var editButton3 = document.createElement("div");

          var outerBox3 = document.createElement("div");
          outerBox3.className = "anychart-inline-block anychart-toolbar-button-outer-box";

          var innerBox3 = document.createElement("div");
          innerBox3.innerHTML = "Remove Data";
          innerBox3.className = "anychart-inline-block anychart-toolbar-button-inner-box";

          domToolbar.appendChild(separator2);
          outerBox3.appendChild(innerBox3);
          editButton3.appendChild(outerBox3);
          domToolbar.appendChild(editButton3);

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
          editButton.className = buttonClasses.join(" ");
          editButton.setAttribute("role", "button");

          // manage button visual appearance
          editButton.addEventListener("mouseover", function () {
            editButton.className = hoverClasses.join(" ");
          });
          editButton.addEventListener("mouseout", function () {
            editButton.className = buttonClasses.join(" ");
          });
          editButton.addEventListener("mousedown", function () {
            editButton.className = clickClasses.join(" ");
          });
          editButton.addEventListener("mouseup", function () {
            editButton.className = hoverClasses.join(" ");
          });

          // set default class names for tooltip button
          editButton2.className = buttonClasses.join(" ");
          editButton2.setAttribute("role", "button");

          editButton2.addEventListener("mouseover", function () {
            editButton2.className = hoverClasses.join(" ");
          });
          editButton2.addEventListener("mouseout", function () {
            editButton2.className = buttonClasses.join(" ");
          });
          editButton2.addEventListener("mousedown", function () {
            editButton2.className = clickClasses.join(" ");
          });
          editButton2.addEventListener("mouseup", function () {
            editButton2.className = hoverClasses.join(" ");
          });

          // set default class names for tooltip button
          editButton3.className = buttonClasses.join(" ");
          editButton3.setAttribute("role", "button");

          editButton3.addEventListener("mouseover", function () {
            editButton3.className = hoverClasses.join(" ");
          });
          editButton3.addEventListener("mouseout", function () {
            editButton3.className = buttonClasses.join(" ");
          });
          editButton3.addEventListener("mousedown", function () {
            editButton3.className = clickClasses.join(" ");
          });
          editButton3.addEventListener("mouseup", function () {
            editButton3.className = hoverClasses.join(" ");
          });

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

          // set default class names for tooltip button
          editButton7.className = buttonClasses.join(" ");
          editButton7.setAttribute("role", "button");

          editButton7.addEventListener("mouseover", function () {
            editButton7.className = hoverClasses.join(" ");
          });
          editButton7.addEventListener("mouseout", function () {
            editButton7.className = buttonClasses.join(" ");
          });
          editButton7.addEventListener("mousedown", function () {
            editButton7.className = clickClasses.join(" ");
          });
          editButton7.addEventListener("mouseup", function () {
            editButton7.className = hoverClasses.join(" ");
          });

          // add action on button click
          editButton.addEventListener("click", function () {

            if (timeLine.editing()) {
              innerBox.innerHTML = "Enable Live Edit"
            }
            else {
              innerBox.innerHTML = "Disable Live Edit"
            }

            timeLine.editing(!timeLine.editing());

          });
          editButton2.addEventListener("click", function () {

            $("#menu1").toggleClass("showing");

          });
          editButton3.addEventListener("click", function () {
            removeData()
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
          editButton7.addEventListener("click", function () {
            editTaskName();
          });

          chart.listen('rowSelect', function (e) {
            selectedItem = e['item'];
          });

          chart.listen(anychart.enums.EventType.BEFORE_CREATE_CONNECTOR, function (e) {

            let source = e["source"];
            let target = e["target"];
            let sourceConnector = source.get("connector");

            let compareData = {connectTo: e["target"].Ga.id, connectorType: e["connectorType"]};

            for (var i = 0; i < sourceConnector.length; i++) {
              if (compareData.connectorType.toLocaleLowerCase() === sourceConnector[i].connectorType.toLocaleLowerCase() &&
                compareData.connectTo === sourceConnector[i].connectTo) {
                console.log("sama");
                e.preventDefault();
                return;
              }
            }

          });

          treeData.listen(anychart.enums.EventType.TREE_ITEM_MOVE, function (e) {
            console.log("The " + e.itemIndex + " item was moved");
          });

          treeData.listen(anychart.enums.EventType.TREE_ITEM_UPDATE, function (e) {

            let updateItem = e["item"];
            let updateField = e["field"];
            let updateValue = e["value"];
            let updatePath = e["path"];

            if (updateField === 'actual' || updateField === 'progress' || updateField === 'milestone') return;

            if (typeof updateValue === 'object') {

              const target = treeData.search("id", updateValue.connectTo);

              if (target) {

                let sourceConnector = updateItem.Ga.connector;

                saveGantt();

                socket.emit('sendConnectorUpdate', {
                  itemid: updateItem.Ga.id,
                  field: updateField,
                  values: sourceConnector
                });

                const compare = sourceConnector.filter(function (item) {
                  return item.connectTo === updateValue.connectTo && item.connectorType === updateValue.connectorType
                });

                if (compare.length === 0) {
                  createLog("Delete " + updateField, updateItem.Ga.name, target.Ga.name, 2);
                }
                else {
                  createLog("Create " + updateField, updateItem.Ga.name, target.Ga.name, 2);
                }

                console.log("GUA KIRIM");

              }


              //updateConnector(updateItem, updatePath, updateValue);

            }
            else {
              if (updateField === "actualStart" || updateField === "actualEnd" || updateField === "baselineStart" || updateField === "baselineEnd") {

                if (updateValue !== moment(updateValue).format('YYYY-MM-DD HH:mm')) {
                  let a = moment(updateValue).format("YYYY-MM-DD");
                  a = moment(a).set('hour', 19).format("YYYY-MM-DD HH:mm");
                  updateItem.set(updateField, a);
                  saveGantt();
                  socket.emit('sendDataUpdate', {itemid: updateItem.Ga.id, field: updateField, values: a});

                  createLog(updateField, updateItem.Ga.name, moment(a).format("YYYY-MM-DD"), 2);

                  console.log("Kirim");
                  return;
                }

                if (updateItem.get("id") === "0") {

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

                  // console.log(ae, as);

                  updateItem.set("basePeriods", moment(be, "YYYY-MM-DD").diff(moment(bs, "YYYY-MM-DD"), 'days'))
                  updateItem.set("actualPeriods", moment(ae, "YYYY-MM-DD").diff(moment(as, "YYYY-MM-DD"), 'days'))

                }
                else {
                  saveGantt();
                  console.log(updateField, updateValue);
                  socket.emit('sendDataUpdate', {itemid: updateItem.Ga.id, field: updateField, values: updateValue});
                  console.log("GUA KIRIM")
                }

                if (updateItem.getParent() == null) {
                  return;
                }
                else {

                  if (updateField == 'baselineStart' || updateField == 'baselineEnd') {
                    updateDurationBasline(updateItem.getParent().get("id"));
                  }
                  else {
                    updateDuration(updateItem.getParent().get("id"));
                  }

                }

              }
              else {
                if (updateField === "periods" || updateField === "baselineperiods" || updateField === "type") return;

                saveGantt();

                socket.emit('sendDataUpdate', {itemid: updateItem.Ga.id, field: updateField, values: updateValue});

                createLog(updateField, updateItem.Ga.name, updateValue, 2);

                console.log("GUA KIRIM")
              }
            }

          });

          treeData.listen(anychart.enums.EventType.TREE_ITEM_CREATE, function (e) {

            console.log("created");
            let updateItem = e["item"];

            if (updateItem.getParent() == null) {
              return
            }
            else {
              updateDurationBasline(updateItem.getParent().get("id"));
              updateDuration(updateItem.getParent().get("id"));
            }

          });

          treeData.listen(anychart.enums.EventType.TREE_ITEM_REMOVE, function (e) {
            console.log("deleted");
          });

          socket.on('setConnector', function (data) {
            updateData(data.itemid, data.field, data.values);
          });

          socket.on('setData', function (data) {
            updateData(data.itemid, data.field, data.values)
          });

          socket.on('getCreatedGantt', function (data) {
            let destination = treeData.search("id", data.destinationID);
            destination.addChild(data.dataAdd);
          });

          socket.on('getDeletedGantt', function (data) {
            var item = treeData.search("id", data);
            item.remove();
          });

          function updateData(updateItemID, updateField, updateValue) {
            var updateItem = treeData.search("id", updateItemID);
            let sourceConnector = updateItem.get("connector");
            if (JSON.stringify(sourceConnector) === JSON.stringify(updateValue)) return;
            updateItem.set(updateField, updateValue);
          }

          function updateDuration(ID) {

            var dataItem = treeData.search("id", ID);
            var childrenList = dataItem.getChildren(); // get children of data item
            var item = {};

            let lowestStart = null;
            let highestEnd = null;

            for (var i = 0; i < childrenList.length; i++) {

              item = childrenList[i];

              let SD = item.get("actualStart");
              let Start = moment(SD).format('YYYY-MM-DD');

              if (lowestStart != null) {
                if (moment(lowestStart).isAfter(Start)) {
                  lowestStart = Start;
                }
              }
              else {
                lowestStart = Start;
              }

              let ED = item.get("actualEnd");
              let End = moment(ED).format('YYYY-MM-DD');

              if (highestEnd != null) {
                if (moment(highestEnd).isBefore(End)) {
                  highestEnd = End;
                }
              }
              else {
                highestEnd = End;
              }

              let days = moment(End, 'YYYY-MM-DD').diff(moment(Start, 'YYYY-MM-DD'), 'day');

              if (item.get("actualPeriods") != days) {
                item.set("actualPeriods", days)
              }

            }

            if (lowestStart != null && highestEnd != null) {

              let SD = moment(lowestStart).set('hour', 19).format('YYYY-MM-DD HH:mm');
              let ED = moment(highestEnd).set('hour', 19).format('YYYY-MM-DD HH:mm');

              dataItem.set("actualStart", SD);
              dataItem.set("actualEnd", ED);

            }

          }

          function updateDurationBasline(ID) {

            var dataItem = treeData.search("id", ID);
            var childrenList = dataItem.getChildren(); // get children of data item
            var item = {};

            let lowestStart = null;
            let highestEnd = null;

            for (var i = 0; i < childrenList.length; i++) {

              item = childrenList[i];

              let SD = item.get("baselineStart");
              let Start = moment(SD).format('YYYY-MM-DD');

              if (lowestStart != null) {
                if (moment(lowestStart).isAfter(Start)) {
                  lowestStart = Start;
                }
              }
              else {
                lowestStart = Start;
              }

              let ED = item.get("baselineEnd");
              let End = moment(ED).format('YYYY-MM-DD');

              if (highestEnd != null) {
                if (moment(highestEnd).isBefore(End)) {
                  highestEnd = End;
                }
              }
              else {
                highestEnd = End;
              }

              let days = moment(End, 'YYYY-MM-DD').diff(moment(Start, 'YYYY-MM-DD'), 'day');

              if (item.get("basePeriods") != days) {
                item.set("basePeriods", days)
              }

            }

            if (lowestStart != null && highestEnd != null) {

              let SD = moment(lowestStart).set('hour', 19).format('YYYY-MM-DD HH:mm');
              let ED = moment(highestEnd).set('hour', 19).format('YYYY-MM-DD HH:mm');

              dataItem.set("baselineStart", SD);
              dataItem.set("baselineEnd", ED);

            }

          }

          function editTaskName() {

            if (!selectedItem) {
              alert("Select Task First")
              return false;
            }

            const root = treeData.search("id", "0");
            const destination = selectedItem ? selectedItem : root;

            $("#tName").val(destination.get('name'));
            document.getElementById("chgData").disabled = true;
            $("#menu2").toggleClass("showing");

          }

          function addData() {

            const root = treeData.search("id", "0");
            const destination = selectedItem ? selectedItem : root;

            const type = $("#type").val();
            const name = $("#taskName").val();
            let start = $("#startDate").val();
            let end = $("#endDate").val();
            const msdate = $("#msDate").val();

            let itemToBeAdded;

            if (type === "Task") {
              if (!name || !start || !end) return;
              if (end < start) return;

              var id = Math.random() * 100 << 16;

              start = moment(start).format('YYYY-MM-DD HH:mm');
              end = moment(end).set('hour', 19).format('YYYY-MM-DD HH:mm');

              itemToBeAdded = {
                "id": parseInt(id),
                "name": name,
                "actualStart": start,
                "actualEnd": end,
                "baselineStart": start,
                "baselineEnd": end,
                "type": type,
                "parent": destination.get("id"),
                "connector": []
              };

            }
            else {
              if (!name || !msdate) return;

              start = moment(msdate).set('hour', 19).format('YYYY-MM-DD HH:mm');
              end = moment(msdate).set('hour', 19).format('YYYY-MM-DD HH:mm');

              var id = Math.random() * 100 << 16;

              itemToBeAdded = {
                "id": parseInt(id),
                "name": name,
                "actualStart": start,
                "actualEnd": end,
                "type": type,
                "parent": destination.get("id"),
                "progressValue": 0,
                "connector": []
              };

            }

            if (destination.get("type") !== "Task Group") {
              destination.set("type", "Task Group");
            }

            destination.addChild(itemToBeAdded);

            $("#menu1").toggleClass("showing");
            $("input[type=text]").val("");
            $("input[type=date]").val("");


            app.service('projects').get(getQueryVariable("id"))
              .then(respond => {

                const data = respond.MindMapData;
                let color;
                let dirs;

                if (destination.get("id") == 0) {
                  color = randomColor();

                  if (data.nodeDataArray.length % 2 === 0) {
                    dirs = 'left';
                  }
                  else {
                    dirs = 'right';
                  }

                }
                else {
                  let colors = data.nodeDataArray.filter(function (item) {
                    return item.key == destination.get("id")
                  })
                  color = colors[0].brush;
                  dirs = colors[0].dirs;
                }

                const newdata = {
                  'key': id,
                  'parent': destination.get("id"),
                  'text': name,
                  'brush': color,
                  'dir': dirs,
                  'loc': '0 0'
                }

                data.nodeDataArray.push(newdata);
                data.nodeDataArray.sort(function (a, b) {
                  return a.key - b.key;
                });

                app.service('projects').patch(getQueryVariable('id'), {
                  MindMapData: data,
                }).then(socket.emit("updateMM", {}));

                saveGantt();

                socket.emit('sendCreatedGantt', {dataAdd: itemToBeAdded, destinationID: destination.get("id")});

                if (destination !== root) {
                  createLog("Add Task", destination.get("name"), name, 2);
                  createLog("Add Node", destination.get("name"), name, 1)
                }
                else {
                  createLog("Add Task", 'central Idea', name, 2);
                  createLog("Add Node", 'central Idea', name, 1)
                }

                console.log("GUA KIRIM")

              })

          };

          function removeData() {

            if (selectedItem) {

              if (selectedItem.get("id") == 0) return;

              let parent = selectedItem.getParent();

              let selectedId = selectedItem.get("id");

              selectedItem.remove();

              if (parent.numChildren() === 0) parent.set("type", "Task");

              updateDuration(parent.get("id"));
              updateDurationBasline(parent.get("id"));

              saveGantt();
              saveMindMap(selectedId);

              socket.emit('sendDeletedGantt', selectedItem.get("id"));

              createLog("Delete Task", parent.get("name"), selectedItem.get("name"), 2);
              createLog("Delete Node", parent.get("name"), selectedItem.get("name"), 1);

              console.log("GUA KIRIM")

            }
          }

          function cleanData(data, rootkey) {

            let rootMM;
            let result = [];

            rootMM = data.filter(function (filter) {
              return filter.parent == rootkey
            });

            if (rootMM.length !== 0) {

              result = result.concat(rootMM);

              rootMM.forEach(function (item) {
                const filterResult = cleanData(data, item.key);
                if (!filterResult) return result;
                result = result.concat(filterResult)
              });

              return result

            }
            else {
              return
            }

          }

          function getDats(data) {
            if (data.numChildren() <= 0) return pure;
            let temp = data.getChildren();
            for (let i = 0; i < data.numChildren(); i++) {
              let parent = temp[i].getParent();
              let rowData = temp[i].Ga;
              rowData.id = rowData.id + "";

              if (parent != null) rowData["parent"] = parent.Ga.id;
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
              let dataProcess = {id: item.id + "", duration: item.basePeriods, predecessors: []};
              //tempData[dataProcess.id] = dataProcess
              tempData.push(dataProcess);
            });

            GanttData.forEach(function (item) {
              if (item.connector.length !== 0) {

                item.connector.forEach(function (connector) {

                  let index = tempData.findIndex(function (item) {
                    return item.id === connector.connectTo
                  });

                  if (index) {
                    tempData[index].predecessors.push(item.id);
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
                data.set('baseline', makeItRed);
                data.set('progress', redTaskProgress);
              }
              else if (data.get('type') === 'Milestone') {
                data.set('milestone', makeItRed);
              }
              //treeData.search("id", item.id).set('connector', {'fill': 'red'})

            });

            console.log(longest)

            CPMdata = longest;
            CPMon = true;

          }

          function cpmoff() {
            pure = [];
            CPMon = false;
            CPMdata.forEach(function (item) {
              treeData.search("id", item.id).set('baseline', '')
              treeData.search("id", item.id).set('progress', '')
              treeData.search("id", item.id).set('milestone', '')
            });
            CPMdata = null;
          }

          function saveGantt() {
            pure = [];
            let saveData = getDats(treeData);

            if (CPMon === true) cpm();

            app.service('projects').patch(getQueryVariable('id'), {
              GanttChartData: saveData,
            }).then(socket.emit("updateGantt", {}));

            console.log('data has been save');

          }

          function saveMindMap(selectedId) {
            app.service('projects').get(getQueryVariable("id"))
              .then(respond => {

                let data = respond.MindMapData;

                let tempdata = data.nodeDataArray.filter(function (item) {
                  return item.key != selectedId
                });
                tempdata = tempdata.filter(function (item) {
                  return item.parent != selectedId
                });

                let ancestor = data.nodeDataArray.filter(function (item) {
                  return item.key == 0
                });

                tempdata = cleanData(tempdata, 0);
                tempdata = tempdata.concat(ancestor);

                tempdata.sort(function (a, b) {
                  return a.key - b.key
                });

                delete data.nodeDataArray;
                data.nodeDataArray = tempdata;

                app.service('projects').patch(getQueryVariable('id'), {
                  MindMapData: data,
                }).then(socket.emit("updateMM", {}));

                // console.log(JSON.stringify(data));
                selectedItem = null;
              });
          }

          $("#addDat").click(function () {
            addData();
          });

          $("#chgData").click(function () {

            selectedItem.set('name', $("#tName").val());
            nameChange = false;

          });

          $("#tName").keypress(function () {
            console.log("a");
            nameChange = true;
            document.getElementById('chgData').disabled = false;
          });


        })
    })

});

$("#msDate").css("display", "none");

function hideMenu() {
  $("#menu1").toggleClass("showing");
}

function hideMenu2() {
  $("#menu2").toggleClass("showing");
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
