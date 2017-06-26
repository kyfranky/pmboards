/**
 * Created by franky on 4/10/2017.
 */
'use strict';

const socketio = require('feathers-socketio');

module.exports = function () {
  const app = this;

  // Set up socketio
  app.configure(socketio(function (io) {

    const clients = [];
    const clientsData = {roomType: '', roomId: ''};

    const charterdata = [{knockoutObjects: {}}];
    const mindmapdata = [{knockoutObjects: {}}];
    const ganttdata = [{}];
    const presentationdata = [];

    const roomclients = {clients: {}};
    const syncObjs = {knockoutObjects: {}};
    const syncDocs = {Documents: '', Page: ""};

    io.on('connection', function (socket) {

      console.log(`${socket.id} "connect"`);

      clients[socket.id] = socket;

      socket.emit("message", syncObjs);

      socket.on('joinRoom', function (datas) {

        var room = "Room " + (datas.roomId).toString();

        socket.join(room);

        clients[socket.id].roomId = room;

        console.log(socket.id + " join room : " + room);

        socket.emit('whereareyou', {});

        //socket.to(getRoom()).emit('onlineMember', {socket.user});

      });

      socket.on('ListMe', function (data) {
        data.socketId = socket.id;
        socket.to(getRoom()).emit('ListMe', data);
      })

      socket.on('ImIn', function (data) {

        if (data.value === 'MindMap') {

          console.log(ganttdata[getRoom()])

          if (!ganttdata[getRoom()]) {
            clients[socket.id].roomType = data.value;
            if (!mindmapdata[getRoom()]) {
              console.log("Creating Room Data")
              mindmapdata[getRoom()] = syncObjs;
            }
            else {
              socket.emit("message", mindmapdata[getRoom()]);
            }
          }
          else {
            socket.emit("exitMM", {})
          }

        }

        else if (data.value === 'Gantt') {
          if (!mindmapdata[getRoom()]) {
            clients[socket.id].roomType = data.value;
            if (!ganttdata[getRoom()]) {
              console.log("Creating Room Data")
              ganttdata[getRoom()] = {haveGuest: true};
              return
            }
          }
          else {
            socket.emit("exitGantt", {})
          }
        }

        else if (data.value === 'Charter') {

          clients[socket.id].roomType = data.value;

          if (!charterdata[getRoom()]) {
            console.log("Creating Room Data")
            charterdata[getRoom()] = syncObjs;
          }
          socket.emit("message", charterdata[getRoom()]);
        }

        else if (data.value === 'Presentation') {

          clients[socket.id].roomType = data.value;

          if (!presentationdata[getRoom()]) {
            console.log("Creating Room Data")
            presentationdata[getRoom()] = {Documents: '', Page: ""};
            return
          }

          console.log(presentationdata[getRoom()])
          socket.emit("updateDocs", presentationdata[getRoom()]);

        }

      });

      socket.on('radio', function (blob) {
        // can choose to broadcast it to whoever you want
        socket.to(getRoom()).emit('voice', blob, socket.feathers.payload.userId);
      });

      socket.on('sendMessages', function (data) {
        socket.to(getRoom()).emit("getMessages", data, socket.feathers.payload.userId);
      });

      socket.on('checkroom', function () {

        console.log(socket.rooms);

        socket.to(getRoom()).emit("salam", "halo");

      });

      socket.on('sendMove', function (data) {

        console.log("Move");
        socket.to(getRoom()).emit("getMove", data);

      });
      socket.on('sendAdd', function (data) {

        console.log("Add");
        socket.to(getRoom()).emit("getAdd", data);

      });
      socket.on('sendDelete', function (data) {

        console.log("Delete");
        socket.to(getRoom()).emit("getDelete", data);

      });
      socket.on('sendChgTxt', function (data) {

        console.log("Change Text");
        socket.to(getRoom()).emit("getChgTxt", data);

      });

      socket.on('sendConnectorUpdate', function (data) {
        console.log("Change Connector");
        socket.to(getRoom()).emit("setConnector", data);
      });
      socket.on('sendDataUpdate', function (data) {
        console.log("Change Data");
        socket.to(getRoom()).emit("setData", data);
      });
      socket.on('sendCreatedGantt', function (data) {
        console.log("Create Gant");
        socket.to(getRoom()).emit("getCreatedGantt", data);
      });
      socket.on('sendDeletedGantt', function (data) {
        console.log("Delete Gantt");
        socket.to(getRoom()).emit("getDeletedGantt", data);
      });

      socket.on('message', function (message) {

        const room = clients[socket.id].roomId;
        const roomtype = clients[socket.id].roomType;

        //roomdata[room].knockoutObjects[message.id] = message.value;
        //socket.to(room).emit("message", message);

        if (roomtype === 'MindMap') {
          mindmapdata[room].knockoutObjects[message.id] = message.value;
          socket.to(room).emit("message", message);
        }

        if (roomtype === 'Charter') {
          charterdata[room].knockoutObjects[message.id] = message.value;
          socket.to(room).emit("message", message);
        }

      });

      socket.on('updateDocs', function (data) {
        presentationdata[getRoom()].Documents = data.documentId;
        presentationdata[getRoom()].Page = 1;
        socket.to(getRoom()).emit("updateDocs", presentationdata[getRoom()]);
      })

      socket.on('updatePage', function (data) {
        presentationdata[getRoom()].Page = data.page;
        socket.to(getRoom()).emit("updatePage", presentationdata[getRoom()]);
      })

      socket.on('checkRoom', function (a) {

        console.log(socket.adapter.rooms[getRoom()].length)

        if (socket.adapter.rooms[getRoom()].length === 1) {
          socket.emit("resRoom", {text: 'lucky you'});
        }
        else {
          socket.emit("resRoom", {text: ''});
        }

      });

      socket.on('updateMM', function () {
        console.log("asdasdasdsadasd")
        socket.to(getRoom()).emit("updateMM",{})
      });

      socket.on('updateGantt', function () {
        console.log("asdasdasdsadasd")
        socket.to(getRoom()).emit("updateGantt",{})
      });


      socket.on('disconnect', function () {

        if (clients[socket.id]) {

          const room = [clients[socket.id].roomId];
          const roomId = clients[socket.id].roomId;
          const roomtype = clients[socket.id].roomType;

          socket.to(room).emit("unListMe", {socketId: socket.id});

          io.sockets.adapter.clients(room, function (err, client) {

            let flag = true;

            client.forEach(function (a) {

              if (clients[a].roomType == roomtype) {
                flag = false;
              }

            })

            if (flag) {

              if (roomtype === 'MindMap') {
                delete mindmapdata[roomId]
                console.log("data mindmapdata[" + roomId + "] has been deleted");
              }
              if (roomtype === 'Charter') {
                delete charterdata[roomId]
                console.log("data charter[" + roomId + "] has been deleted");
              }
              if (roomtype === 'Presentation') {
                delete presentationdata[roomId]
                console.log("data presentationdata[" + roomId + "] has been deleted");
              }
              if (roomtype === 'Gantt') {
                delete ganttdata[roomId]
                console.log("data ganttdata[" + roomId + "] has been deleted");
              }

            }
            else {
              console.log("abort task !!!")
              console.log("total clients in " + roomId + ": %d", client.length);
            }

          })

        }

        console.log('/// disconnected client /////////////>', socket.id);
        socket.to(clients[socket.id].roomId).emit(`${socket.id} "is disconnected"`);
        delete clients[socket.id];

      });

      function getRoom() {

        var data = Object.values(socket.rooms)

        for (let i = 0; i < data.length; i++) {
          if (data[i].includes("Room ") == true) {
            return data[i];
            break;
          }
        }

      }

    });

  }));

  console.log("socket ready !");

};
