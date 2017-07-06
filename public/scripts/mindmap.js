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

    //
    if (button) button.disabled = !myDiagram.isModified;
    let idx = document.title.indexOf("*");
    if (myDiagram.isModified) {

      if (idx < 0) {
        document.title += "*"
        save();
      }
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
          senddata(obj.part.data);
        }
      }
    );
  // selected nodes show a button for adding children
  myDiagram.nodeTemplate.selectionAdornmentTemplate =
    $(go.Adornment, "Spot",
      $(go.Panel, "Auto",
        // this Adornment has a rectangular blue Shape around the selected node
        $(go.Shape, {
          fill: null,
          stroke: "dodgerblue",
          strokeWidth: 3
        }),
        $(go.Placeholder, {
          margin: new go.Margin(4, 4, 0, 4)
        })
      ),
      // and this Adornment has a Button to the right of the selected node
      $("Button", {
          alignment: go.Spot.Right,
          alignmentFocus: go.Spot.Left,
          click: addNodeAndLink // define click behavior for this Button in the Adornment
        },
        $(go.TextBlock, "+", // the Button content
          {
            font: "bold 8pt sans-serif"
          })
      )
    );

  // the context menu allows users to change the font size and weight,
  // and to perform a limited tree layout starting at that node
  myDiagram.nodeTemplate.contextMenu =
    $(go.Adornment, "Vertical",
      $("ContextMenuButton",
        $(go.TextBlock, "Bigger"), {
          click: function (e, obj) {
            changeTextSize(obj, 1.1);
          }
        }),
      $("ContextMenuButton",
        $(go.TextBlock, "Smaller"), {
          click: function (e, obj) {
            changeTextSize(obj, 1 / 1.1);
          }
        }),
      $("ContextMenuButton",
        $(go.TextBlock, "Bold/Normal"), {
          click: function (e, obj) {
            toggleTextWeight(obj);
          }
        }),
      $("ContextMenuButton",
        $(go.TextBlock, "Layout"), {
          click: function (e, obj) {
            let adorn = obj.part;

            console.log(obj);
            console.log(adorn);
            console.log(adorn.adornedPart);

            adorn.diagram.startTransaction("Subtree Layout");
            layoutTree(adorn.adornedPart);
            adorn.diagram.commitTransaction("Subtree Layout");
          }
        }
      )
    );
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
  myDiagram.contextMenu =
    $(go.Adornment, "Vertical",
      $("ContextMenuButton",
        $(go.TextBlock, "Undo"), {
          click: function (e, obj) {
            e.diagram.commandHandler.undo();
          }
        },
        new go.Binding("visible", "", function (o) {
          return o.diagram && o.diagram.commandHandler.canUndo();
        }).ofObject()),
      $("ContextMenuButton",
        $(go.TextBlock, "Redo"), {
          click: function (e, obj) {
            e.diagram.commandHandler.redo();
          }
        },
        new go.Binding("visible", "", function (o) {
          return o.diagram && o.diagram.commandHandler.canRedo();
        }).ofObject()),
      $("ContextMenuButton",
        $(go.TextBlock, "Save"), {
          click: function (e, obj) {
            save();
          }
        }),
      $("ContextMenuButton",
        $(go.TextBlock, "Load"), {
          click: function (e, obj) {
            load();
          }
        })
    );

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
  myDiagram.model = go.Model.fromJson(data.MindMapData);
  layoutAll()
};

socket.on('getMove', function (data) {
  //console.log(JSON.stringify(data));
  moveDia(data);
});

socket.on('getAdd', function (data) {

  //console.log(JSON.stringify(data));
  addDia(data);

});

socket.on('getDelete', function (data) {

  //console.log(JSON.stringify(data));
  deleteDia(data);

});

socket.on('getChgTxt', function (data) {

  chgtxtDia(data);

});

function layoutMove() {

};

function moveDia(data) {

  let node = myDiagram.findNodeForKey(data.Os.key);
  let nodeData = myDiagram.model.findNodeDataForKey(data.Os.key);

  myDiagram.startTransaction("move Dia");

  if (node !== null) {
    let dats = data.Os;
    let locs = dats.loc;

    console.log(dats.key);

    if (node.data.loc !== locs) {
      node.location = myDiagram.toolManager.draggingTool.computeMove(node, go.Point.parse(locs));
      if (nodeData.dir !== dats.dir) {
        layup(node);
      }
    }
  }

  myDiagram.commitTransaction("move Dia");

};

function save() {

  if (myDiagram.isModified) {

    app.service('projects').patch(getQueryVariable('id'), {
      MindMapData: JSON.parse(myDiagram.model.toJson()),
    })
      .catch(error => console.log(error));

    socket.emit("updateMM", {})

  }

  myDiagram.isModified = false;

};

function layup(node) {

  console.log(node.data)

  let rootX = myDiagram.findNodeForKey(0).location.x;
  if (node.data.parent != "0") return; // Only consider nodes connected to the root
  let nodeX = node.location.x;

  if (rootX < nodeX && node.data.dir !== "right") {
    updateNodeDirection(node, "right");
    layoutTree(node);
  } else if (rootX > nodeX && node.data.dir !== "left") {
    updateNodeDirection(node, "left");
    layoutTree(node);
  }

};

function addDia(data) {


  myDiagram.startTransaction("Add Nodes");

  // copy the brush and direction to the new node data

  let addData = data.Ms;
  let oldnode = myDiagram.findNodeForKey(data.Ms.parent);
  let newdata;

  newdata = {
    text: "idea",
    brush: addData.brush,
    dir: addData.dir,
    parent: addData.parent
  };

  myDiagram.model.addNodeData(newdata);
  layoutTree(oldnode);
  myDiagram.commitTransaction("Add Nodes");

};

function deleteDia(data) {

  setTimeout(function () {

    let nodedata = data.Qs;

    let node = myDiagram.findNodeForKey(nodedata.key);

    if (node === null) {
      return;
    }
    ;

    myDiagram.startTransaction("Delete Dia");

    let chl = node.findTreeParts(); // gives us an iterator of the child nodes related to this particular node

    myDiagram.removeParts(chl, true);

    myDiagram.remove(node);

    myDiagram.commitTransaction("Delete Dia");

  }, 150);

};

function chgtxtDia(data) {

  console.log(data);

  setTimeout(function () {

    let nodedata = data;

    let node = myDiagram.model.findNodeDataForKey(nodedata.key);

    if (node === null) {
      return;
    }
    ;

    console.log(node);

    myDiagram.startTransaction("ChgTxt");

    myDiagram.model.setDataProperty(node, 'text', nodedata.text);

    myDiagram.commitTransaction("ChgTxt");

    if (nodedata.key === "0") {
      node = myDiagram.findNodeForKey(0);
      layoutTree(node);
    }


  }, 150);

};

function spotConverter(dir, from) {
  if (dir === "left") {
    return (from ? go.Spot.Left : go.Spot.Right);
  } else {
    return (from ? go.Spot.Right : go.Spot.Left);
  }
};

function changeTextSize(obj, factor) {
  let adorn = obj.part;
  adorn.diagram.startTransaction("Change Text Size");
  let node = adorn.adornedPart;
  let tb = node.findObject("TEXT");
  tb.scale *= factor;
  adorn.diagram.commitTransaction("Change Text Size");
};

function toggleTextWeight(obj) {
  let adorn = obj.part;
  adorn.diagram.startTransaction("Change Text Weight");
  let node = adorn.adornedPart;
  let tb = node.findObject("TEXT");
  // assume "bold" is at the start of the font specifier
  let idx = tb.font.indexOf("bold");
  if (idx < 0) {
    tb.font = "bold " + tb.font;
  } else {
    tb.font = tb.font.substr(idx + 5);
  }
  adorn.diagram.commitTransaction("Change Text Weight");
};

function updateNodeDirection(node, dir) {
  myDiagram.model.setDataProperty(node.data, "dir", dir);
  // recursively update the direction of the child nodes
  let chl = node.findTreeChildrenNodes(); // gives us an iterator of the child nodes related to this particular node
  while (chl.next()) {
    updateNodeDirection(chl.value, dir);
  }
};

function isUnoccupied(r, node) {
  let diagram = node.diagram;

  // nested function used by Layer.findObjectsIn, below
  // only consider Parts, and ignore the given Node and any Links
  function navig(obj) {
    let part = obj.part;
    if (part === node) return null;
    if (part instanceof go.Link) return null;
    return part;
  }

  // only consider non-temporary Layers
  let lit = diagram.layers;
  while (lit.next()) {
    let lay = lit.value;
    if (lay.isTemporary) continue;
    if (lay.findObjectsIn(r, navig, null, true).count > 0) return false;
  }
  return true;
};

function addNodeAndLink(e, obj) {

  let adorn = obj.part;
  let diagram = adorn.diagram;
  diagram.startTransaction("Add Node");

  let oldnode = adorn.adornedPart;
  let olddata = oldnode.data;

  // copy the brush and direction to the new node data

  let newdata;

  if (olddata.key == 0) {

    newdata = {
      text: "idea",
      brush: setRandomColor(oldnode),
      dir: setDir(oldnode),
      parent: olddata.key
    };

  } else {

    newdata = {
      text: "idea",
      brush: olddata.brush,
      dir: olddata.dir,
      parent: olddata.key
    };

  }

  diagram.model.addNodeData(newdata);
  layoutTree(oldnode);
  diagram.commitTransaction("Add Node");

};

function setRandomColor(oldnode) {

  let randcolor = go.Brush.randomColor();

  let it = oldnode.findTreeChildrenNodes();

  while (it.next()) {

    var item = it.value;
    var data = item.data;
    var brush = data.brush;

    //console.log(brush);
    //console.log(randcolor);

    if (brush == randcolor) randcolor = go.Brush.randomColor();

  }


  return randcolor;

};

function setDir(oldnode) {

  let it = oldnode.findTreeChildrenNodes();

  let dir;

  if (it.count % 2 == 0) dir = "left";
  else dir = "right";

  return dir;

};

function setKey(oldnode, diagram) {

  let it = oldnode.findTreeChildrenNodes();

  let olddata = oldnode.data;

  let newkey = olddata.key * 10 + 1;
  let keythreshold;

  let flag;

  if (olddata.key == 0) {
    keythreshold = (olddata.key * 10) + 10;
    console.log("keythreshold awal 1 : " + keythreshold);
  } else {

    console.log(">0");
    keythreshold = (olddata.key * 10) + 10;
    console.log("keythreshold awal 2 : " + keythreshold);
  }

  while (it.next()) {

    if (newkey == keythreshold) {

      keythreshold = ((keythreshold - 10) * 10) + 10;

      if (keythreshold == 10) {
        keythreshold = (keythreshold * 10) + 10;
      }

      newkey = keythreshold - 9;

      console.log("keythreshold filter 1 : " + keythreshold);
    }

    flag = diagram.model.findNodeDataForKey(newkey);
    if (flag != null) newkey++;

    if (newkey == keythreshold) {

      keythreshold = ((keythreshold - 10) * 10) + 10;

      if (keythreshold == 10) {
        keythreshold = (keythreshold * 10) + 10;
      }

      newkey = keythreshold - 9;


      console.log("keythreshold filter 1 : " + keythreshold);
    }

    console.log("new key : " + newkey);

  }

  return newkey;

};

function stayInGroup(part, pt, gridpt) {


  let bnds = part.actualBounds;
  let loc = part.location;


  let diagram = part.diagram;
  let node = myDiagram.findNodeForKey(11);

  // kalo sync data yang di drag stop
  if (loc == node.location) {
    return gridpt;
  } else printLoc(part);

  // node.location = diagram.toolManager.draggingTool.computeMove(node, loc);

  // see if the area at the proposed location is unoccupied
  // use PT instead of GRIDPT if you want to ignore any grid snapping behavior
  let x = pt.x - (loc.x - bnds.x);
  let y = pt.y - (loc.y - bnds.y);
  let r = new go.Rect(x, y, bnds.width, bnds.height);
  // maybe inflate R if you want some space between the node and any other nodes
  if (isUnoccupied(r.inflate(-1, -1), part)) return gridpt; // OK
  return new go.Point(x, y)

};

function printLoc(part) {

  //console.log("key : "+part.data.key);
  //console.log("x   : "+part.location.x);
  //console.log("y   : "+part.location.y);

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

function senddata(data) {

  var key = data.key;
  var Pkey = data.parent;

  var txt = data.text;

  $("#key").val(key).change();

  $("#parentkey").val(Pkey).change();

  $("#txt").val(txt).change();

};

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
