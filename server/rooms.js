//rooms.js
//this module builds the game rooms and sets the properties of the rooms
//this module is needed for matchmaker.js and score.js


//required modules
var Defaults = require('./defaults.js'); //for default settings
var Reposition = require('./reposition.js'); //for choosing a random position to place a player


//function to initialize the room
module.exports.initRoom = function(roomId, roomProperties) {

  //make a new room object for the roomId
  roomProperties[roomId] = {};

  //make an object that will store the players in the room
  //the key is the player id (which is the socket id automatically generated by socket io)
  roomProperties[roomId].players = {};

  //initialize the number of players in the room to zero
  roomProperties[roomId].numPlayers = 0;

  //an object that will keep track of the number of players for each team
  //the key is the team number (ie. 0 and 1)
  roomProperties[roomId].teamNumPlayers = {};

  //initialize number of players for each team to zero
  for(var i = 0; i < Defaults.NUM_TEAMS; ++i) {
    roomProperties[roomId].teamNumPlayers[i] = 0;
  }

  //an object that will keep track of the scores for the different teams
  //the key is the team number (ie. 0 and 1)
  roomProperties[roomId].teamScores = {};

  //initialize scores for each team to zero
  for(var i = 0; i < Defaults.NUM_TEAMS; ++i) {
    roomProperties[roomId].teamScores[i] = 0;
  }

  //put the flag in the default starting position
  roomProperties[roomId].flag = {position : Defaults.OBJECT_DEFAULT_COORDINATES['flag'], radius : Defaults.FLAG_RADIUS};

  //put base0 in the default starting position
  roomProperties[roomId].base0 = {position : Defaults.OBJECT_DEFAULT_COORDINATES['base0'], radius : Defaults.BASE_RADIUS};

  //put base1 in the default starting position
  roomProperties[roomId].base1 = {position : Defaults.OBJECT_DEFAULT_COORDINATES['base1'], radius : Defaults.BASE_RADIUS};

};


//function to reset the room
module.exports.resetRoom = function(roomId, roomProperties) {

  //reset team scores to zero
  roomProperties[roomId].teamScores = {};
  for(var i = 0; i < Defaults.NUM_TEAMS; ++i) {
    roomProperties[roomId].teamScores[i] = 0;
  }

  //reset flag position
  roomProperties[roomId].flag.position = Defaults.OBJECT_DEFAULT_COORDINATES['flag'];
  roomProperties[roomId].flag.position.y = (Math.random() * Defaults.FLAG_RANGE) + Defaults.FLAG_OFFSET_Y; //random position along gameboard on flag reset

  //reset player positions
  //reset players to not have the flag
  var player;
  for(var playerId in roomProperties[roomId].players) {
    player = roomProperties[roomId].players[playerId];
    // player.position = Defaults.PLAYER_DEFAULT_COORDINATES[player.team]; //old way that puts every player on same team in same position     
    Reposition.getLocation(player, roomProperties); //put player in random position that isn't occupied
    player.hasFlag = false;
  }

};
