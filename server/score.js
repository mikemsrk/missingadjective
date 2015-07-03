//score.js
//this module updates the score, checks for win, and handles the win
//this module is needed for gameLogic.js
//if using events.js, then this module will instead be needed for that


//required modules
var Defaults = require('./defaults.js'); //for default settings
var Rooms = require('./rooms.js'); //for creating and resetting rooms
var SendObject = require('./sendObject.js'); //for creating sendable objects to the clients


//function to perform the appropriate action after a win
var handleWin = function(player, roomProperties, io) {

  //reset the room after a win
  //scores, flag position, and player positions will be reset
  // Rooms.resetRoom(player.room, roomProperties);

  //send object containing the winning team and the updated room properties to the clients
  var winObject = SendObject.createSendWinObj(player, roomProperties);
  console.log('winObject: ', JSON.stringify(winObject));

  io.sockets.in(player.room).emit('winReset', JSON.stringify(winObject));
};




//function to check for a win
var checkForWin = function(player, roomProperties, io) {

  //only the scoring team can possibly be the winning team
  //check if the incremented score is the default win score
  //if so, then handle win
  if(roomProperties[player.room].teamScores[player.team] === Defaults.WIN_SCORE) {
    handleWin(player, roomProperties, io);
  }
  else {
    //put the flag in the default starting position
    roomProperties[player.room].flag = {position : Defaults.OBJECT_DEFAULT_COORDINATES['flag'], radius : Defaults.FLAG_RADIUS};
    // var rand = Math.random();
    // var randX;
    // var randY;
    // if(rand <= 0.5){
    //   randX = (Math.random() * -Defaults.FLAG_RANGE) + Defaults.FLAG_OFFSET_Y;
    //   randY = (Math.random() * -Defaults.FLAG_RANGE) + Defaults.FLAG_OFFSET_Y;
    // }else{
    //   randX = (Math.random() * Defaults.FLAG_RANGE) + Defaults.FLAG_OFFSET_Y;
    //   randY = (Math.random() * Defaults.FLAG_RANGE) + Defaults.FLAG_OFFSET_Y;
    // }
    // roomProperties[player.room].flag.position.x = randX;
    // roomProperties[player.room].flag.position.y = randY;

    //send object containing updated score and flag position to clients
    var scoreAndFlagObject = SendObject.createSendScoreAndFlagObj(player, roomProperties);
    io.sockets.in(player.room).emit('updateScoreFlag', JSON.stringify(scoreAndFlagObject));
  }

};


//function to update the score and call check for win function
module.exports.updateScore = function(player, roomProperties, io) {

  //increment the score for the team that the player is on
  roomProperties[player.room].teamScores[player.team]++;

  //check for win
  checkForWin(player, roomProperties, io);

  if (player.team === 0) {
    io.sockets.in(player.room).emit('redScores');
  } else {
    io.sockets.in(player.room).emit('blueScores');
  }


};

// MIKE
module.exports.resetGame = function(player,roomProperties,io){

  roomProperties[player.room].flag = {position : Defaults.OBJECT_DEFAULT_COORDINATES['flag'], radius : Defaults.FLAG_RADIUS};
  roomProperties[player.room].flag.position.y = 0; //random position along gameboard on flag reset
  roomProperties[player.room].flag.position.x = 0; //random position along gameboard on flag reset

  //send object containing updated score and flag position to clients
  var scoreAndFlagObject = SendObject.createResetScoreAndFlagObj(player, roomProperties);
  io.sockets.in(player.room).emit('updateScoreFlag', JSON.stringify(scoreAndFlagObject));

};
