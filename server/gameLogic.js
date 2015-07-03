//gameLogic.js
//this is the primary module that listens for client events and calls other modules to handle those events

//required modules
var Players = require('./players.js'); //for providing actions that a player can do (joining and leaving rooms)
var Matchmaker = require('./matchmaker.js'); //for selecting the room that a player should join
//var Events = require('./events.js'); //not currently being used
var SendObject = require('./sendObject.js'); //for creating sendable objects to the clients
var Score = require('./score.js'); //for updating the score and win checking and handling

//object that will hold the properties associated to each game room
//the key is the roomId
var roomProperties = {};

var flagCarrier = ''; // id of player who has the flag.

//primary function that will listen for client events
//the player is the passed in socket/client
var gameLogic = module.exports = function(io, player) {


  //temp variables used for clarity
  //these temp variables will hold sendable objects that will be used throughout this function
  var playerToSend;
  var environment;


  //handle player join
  player.on('join', function(name) {

    //set the player name equal to the passed in name
    player.name = name;

    //assign the player to the correct room
    Matchmaker.matchmaker(player, roomProperties);

    //create a sendable object containing the room properties of the room that the player 
    //who triggered the join event was assigned to and send it to that player
    environment = SendObject.createSendEnvironmentObj(roomProperties[player.room]);
    player.emit('getEnvironment', JSON.stringify(environment));

    //create a sendable object containing the player properties of the player that triggered the join event
    //and send object to that player and all other players in the room of that player
    playerToSend = SendObject.createSendPlayerObj(player);
    player.emit('createPlayer', JSON.stringify(playerToSend)); //this event is for the client to create its own player
    player.broadcast.to(player.room).emit('newPlayer', JSON.stringify(playerToSend)); //this event is for all other clients already in the room to create the new player
    
    // player.emit('newPlayer', JSON.stringify(playerToSend)); // MIKE

    //when a client joins a room, it needs to not only create its own player, but also all players who are already in the room
    //so get the properties of all players already in the room and send it back to the client that triggered the join event
    var playersInRoom = roomProperties[player.room].players;
    for(var playerId in playersInRoom) {

      //don't send the client's own player to itself again
      if(player.id === playersInRoom[playerId].id) {
        continue;
      }

      //issue event to tell the client to create all other players in the room
      playerToSend = SendObject.createSendPlayerObj(playersInRoom[playerId]);
      player.emit('newPlayer', JSON.stringify(playerToSend));
    }

  });


  //handle player disconnect
  player.on('disconnect', function() {

    //sometimes sockets with undefined properties get sent and disconnected, so need to ignore those
    if(player.name !== undefined
      && player.room !== undefined
      && player.team !== undefined) {

      //have the player leave the room
      Players.leaveRoom(player, roomProperties);

      //delete the room if it is empty
      if(roomProperties[player.room].numPlayers === 0) {
        delete roomProperties[player.room];
      }

      //tell all other clients in the room about the client who disconnected
      playerToSend = SendObject.createSendPlayerObj(player);
      player.broadcast.to(player.room).emit('broadcastPlayerDisconnect', JSON.stringify(playerToSend));

    }

  });

  player.on('flagPickup',function(id){
    flagCarrier = JSON.parse(id);
    // broadcast to all players who has the flag.
    player.broadcast.to(player.room).emit('flagCarrier', JSON.stringify(flagCarrier));
    player.emit('flagCarrier', JSON.stringify(flagCarrier));
  });

  //handle player position update
  player.on('updatePosition', function(position, hasFlag) {

    // position = {x:4,y:3}

    //parse the received data
    player.position = JSON.parse(position);
    player.hasFlag = JSON.parse(hasFlag);

    //if the player has the flag, then update the position of the flag to be the position of the player
    //and tell every other player in the room about the updated flag position
    if(player.id === flagCarrier) {
      roomProperties[player.room].flag.position = player.position;
      player.broadcast.to(player.room).emit('broadcastFlagPosition', JSON.stringify(roomProperties[player.room].flag));
    }

    //create a sendable object containing the player's updated position
    //and tell every other player in the room about the updated player position
    playerToSend = SendObject.createSendPlayerObj(player);
    // player.emit('broadcastPlayerPosition',JSON.stringify(playerToSend)); // MIKE
    player.broadcast.to(player.room).emit('broadcastPlayerPosition', JSON.stringify(playerToSend));

    // //check for events based on new player position
    // Events.checkEvents(player, roomProperties);

  });

  player.on('resetGame',function(){
    Score.resetGame(player,roomProperties,io);
  });


  //handle player scoring
  player.on('playerScores', function() {

    //update the score when a player says that it has scored
    //ideally, there would be server side verification or the server itself would check for scoring, but this logic is not yet implemented
    Score.updateScore(player, roomProperties, io);
    flagCarrier = '';

  });  


};

