function init() {
  if (window.goSamples) goSamples(); // init for these samples -- you don't need to call this
  let $ = go.GraphObject.make;

  myDiagram =
    $(go.Diagram, "myDiagramDiv", {
      // when the user drags a node, also move/copy/delete the whole subtree starting with that node
      "commandHandler.copiesTree": true,
      "commandHandler.deletesTree": true,
      "draggingTool.dragsTree": true,
      initialContentAlignment: go.Spot.Center, // center the whole graph
      "undoManager.isEnabled": true,
    });
  // when the document is modified, add a "*" to the title and enable the "Save" button
  myDiagram.addDiagramListener("Modified", function (e) {
    let button = document.getElementById("SaveButton");
    if (button) button.disabled = !myDiagram.isModified;
    let idx = document.title.indexOf("*");
    if (myDiagram.isModified) {
      if (idx < 0) document.title += "*";
    } else {
      if (idx >= 0) document.title = document.title.substr(0, idx);
    }
  });

  myDiagram.addModelChangedListener(function (evt) {
    // ignore unimportant Transaction events
    if (!evt.isTransactionFinished) return;
    let txn = evt.object; // a Transaction
    if (txn === null) return;
    // iterate over all of the actual ChangedEvents of the Transaction
    txn.changes.each(function (e) {
      // record node insertions and removals
      if (e.change === go.ChangedEvent.Property) {
        if (e.modelChange === "linkFromKey") {
          console.log(evt.propertyName + " changed From key of link: " +
            e.object + " from: " + e.oldValue + " to: " + e.newValue);
        } else if (e.modelChange === "linkToKey") {
          console.log(evt.propertyName + " changed To key of link: " +
            e.object + " from: " + e.oldValue + " to: " + e.newValue);
        }
      } else if (e.change === go.ChangedEvent.Insert && e.modelChange === "linkDataArray") {
        console.log(evt.propertyName + " added link: " + e.newValue);
      } else if (e.change === go.ChangedEvent.Remove && e.modelChange === "linkDataArray") {
        console.log(evt.propertyName + " removed link: " + e.oldValue);
      }
    });
  });

  myDiagram.grid.visible = true;

  myDiagram.isReadOnly = true;

  myDiagram.initialContentAlignment = go.Spot.Center;

  // a node consists of some text with a line shape underneath
  myDiagram.nodeTemplate =
    $(go.Node, "Vertical",
      //new go.Binding("location", "loc", toLocation).makeTwoWay(fromLocation),
      {
        selectionObjectName: "TEXT"
      },
      $(go.TextBlock, {
          name: "TEXT",
          minSize: new go.Size(30, 15),
          editable: true,
        },
        // remember not only the text string but the scale and the font in the node data
        new go.Binding("text", "text").makeTwoWay(),
        new go.Binding("scale", "scale").makeTwoWay(),
        new go.Binding("font", "font").makeTwoWay(),
      ),
      $(go.Shape, "LineH", {
          stretch: go.GraphObject.Horizontal,
          strokeWidth: 3,
          height: 3,
          // this line shape is the port -- what links connect with
          portId: "",
          fromSpot: go.Spot.LeftRightSides,
          toSpot: go.Spot.LeftRightSides
        },
        new go.Binding("stroke", "brush"),
        // make sure links come in from the proper direction and go out appropriately
        new go.Binding("fromSpot", "dir", function (d) {
          return spotConverter(d, true);
        }),
        new go.Binding("toSpot", "dir", function (d) {
          return spotConverter(d, false);
        })),
      // remember the locations of each node in the node data
      //new go.Binding("location", "loc", toLocation).makeTwoWay(fromLocation),
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      // make sure text "grows" in the desired direction
      new go.Binding("locationSpot", "dir", function (d) {
        return spotConverter(d, false);
      }),
      new go.Binding("deletable", "deletable").makeTwoWay(),
      new go.Binding("movable", "movable").makeTwoWay(), {
        //dragComputation: stayInGroup,
        click: function (e, obj) {
          //console.log("click on mind map key : "+obj.part.data.key);
        }
      }
    );


  // the context menu allows users to change the font size and weight,
  // and to perform a limited tree layout starting at that node

  // a link is just a Bezier-curved line of the same color as the node to which it is connected
  myDiagram.linkTemplate =
    $(go.Link, {
        curve: go.Link.Bezier,
        fromShortLength: -2,
        toShortLength: -2,
        selectable: false
      },
      $(go.Shape, {
          strokeWidth: 3
        },
        new go.Binding("stroke", "toNode", function (n) {
          if (n.data.brush) return n.data.brush;
          return "black";
        }).ofObject())
    );
  // the Diagram's context menu just displays commands for general functionality


  myDiagram.addDiagramListener("SelectionMoved", function (e) {
    let rootX = myDiagram.findNodeForKey(0).location.x;

    myDiagram.selection.each(function (node) {

      console.log(node.data.parent, node.data.parent != "0")

      if (node.data.parent != "0") return; // Only consider nodes connected to the root
      let nodeX = node.location.x;

      if (rootX < nodeX && node.data.dir !== "right") {
        updateNodeDirection(node, "right");
      } else if (rootX > nodeX && node.data.dir !== "left") {
        updateNodeDirection(node, "left");
      }
      layoutTree(node);

    });

  });

  myDiagram.addModelChangedListener(function (e) {

    if (e.isTransactionFinished) {

      var tx = e.object;

      console.log("" + tx);

      if (e.oldValue === "Layout") return;
      if (e.oldValue === "Initial Layout") return;

      if (tx instanceof go.Transaction && window.console) {

        let txarr = tx.changes.o;
        const arrays = [];

        for (let i = 0; i < txarr.length; i++) {

          let c = txarr[i];
          let hold = 0;

          if (c.model) {

            var txname = (tx !== null ? e.object.name : "");

            switch (txname) {

              case "Move":

                if (c.object.key === undefined || c.object.key === null) return;
                if (c.oldValue === "left" || c.oldValue === "right") return;

                let filter = arrays.filter(function (item) {
                  return item === c.object.key
                });

                if (filter.length !== 0) {
                  console.log("Sama");
                  return false;
                }

                save();

                socket.emit('sendMove', c);
                const old = myDiagram.model.findNodeDataForKey(c.Os.parent).text;

                if (c.Os.parent != 0) {
                  createLog('Move Node', old, c.Os.text, 1);
                }
                else {
                  createLog('Move Node', 'Central Idea', c.Os.text, 1);
                }

                arrays.push(c.object.key);
                break;

              case "Add Node":

                if (c.Ms.key === undefined) return;

                let data = c.Ms;

                //console.log(JSON.stringify(c));
                save();
                socket.emit('sendAdd', c);

                const value = myDiagram.model.findNodeDataForKey(c.Ms.parent).text;

                if (c.Ms.parent != 0) {
                  createLog('Add Node', value, 'New Node', 1);
                }
                else {
                  createLog('Add Node', 'Central Idea', 'New Node', 1);
                }

                break;

              case "Delete":

                //if (c.Qs.key === undefined) return;

                if (JSON.stringify(c.Os) !== hold) {

                  let data = c.Qs;

                  console.log("delete node key :" + data.key);
                  hold = JSON.stringify(c.Os);

                  if (c.Qs.key !== undefined) {
                    save();
                    socket.emit('sendDelete', c);
                    checkGanttData(data.key);
                    const value = c.Qs.text;
                    createLog('Delete Node', value, 'Delete Node', 1);
                  }

                }

                break;

              case "TextEditing": {
                save();
                socket.emit('sendChgTxt', c.Os);
                const Oldvalue = c.oldValue;
                const Newvalue = c.newValue;
                createLog('Change Node Text', Oldvalue, Newvalue, 1);
                checkGanttName(c.Os);
                break;
              }

              case "move Dia": {
                if (c.object.parent !== 0) return;
                layoutMove();
                break;
              }

              default: {
                break;
              }


            }
            ;

          }

        }

      }

    }

  });

  load();

};

const load = async () => {
  let respond = await app.authenticate();
  await app.passport.verifyJWT(respond.accessToken);
  let data = await app.service('projects').get(getQueryVariable("id"));

  console.log(app.get('previewMM'));

  myDiagram.model = go.Model.fromJson(data.MindMapData);
  layoutAll();
};

function layoutAll() {
  let root = myDiagram.findNodeForKey(0);
  if (root === null) return;
  myDiagram.startTransaction("Layout");
  // split the nodes and links into two collections
  let rightward = new go.Set(go.Part);
  let leftward = new go.Set(go.Part);
  root.findLinksConnected().each(function (link) {
    let child = link.toNode;
    if (child.data.dir === "left") {
      leftward.add(root); // the root node is in both collections
      leftward.add(link);
      leftward.addAll(child.findTreeParts());
    } else {
      rightward.add(root); // the root node is in both collections
      rightward.add(link);
      rightward.addAll(child.findTreeParts());
    }
  });
  // do one layout and then the other without moving the shared root node
  layoutAngle(rightward, 0);
  layoutAngle(leftward, 180);
  myDiagram.commitTransaction("Layout");
};

function layoutTree(node) {
  if (node.data.key === 0) { // adding to the root?
    layoutAll(); // lay out everything
  } else { // otherwise lay out only the subtree starting at this parent node
    let parts = node.findTreeParts();
    layoutAngle(parts, node.data.dir === "left" ? 180 : 0);
    // layoutAll();
  }
};

function layoutAngle(parts, angle) {
  let layout = go.GraphObject.make(go.TreeLayout, {
    angle: angle,
    arrangement: go.TreeLayout.ArrangementFixedRoots,
    nodeSpacing: 20,
    layerSpacing: 30,
    setsPortSpot: false, // don't set port spots since we're managing them with our spotConverter function
    setsChildPortSpot: false
  });
  layout.doLayout(parts);
};

function spotConverter(dir, from) {
  if (dir === "left") {
    return (from ? go.Spot.Left : go.Spot.Right);
  } else {
    return (from ? go.Spot.Right : go.Spot.Left);
  }
};


