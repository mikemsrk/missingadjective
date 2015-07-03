/*
 * The Team class is for everyone other player in the game outside of the user
 * Inherits functions and properties of Player superclass
 * Username, position, player, team ID, flag status, and radius are defined server side and passed to players upon joining the game.
 * Team Id is either 0 or 1
 * Position is an Object with x and y values eg: {x: 50, y:230}
 * canvasContext refers to global canvas node
 */

var Team = function(username, id, position, canvasContext, teamId, radius, model) {
  Player.apply(this, arguments);
  this.team = teamId;
  this.model = createPlayerModel(teamId, username);
  this.model.position.x = this.position.x;
  this.model.position.y = 10;
  this.model.position.z = this.position.y;
  scene.add(this.model);
};

Team.prototype = Object.create(Player.prototype);
Team.prototype.constructor = Team;
var $teamStatus = $('#team-status');


var redTeam = new THREE.MeshBasicMaterial( {color: 0xff0000} );
var blueTeam = new THREE.MeshBasicMaterial( {color: 0x0000ff} );

var createPlayerModel = function(teamId, username) {
  var theText = username;
  var nameCenter = String(username).length * 2.5;

  var hash = document.location.hash.substr( 1 );

  if ( hash.length !== 0 ) {
    theText = hash;
  }

  var text3d = new THREE.TextGeometry( theText, {
    size: 7,
    height: 1,
    curveSegments: 2,
    font: "helvetiker"
  });

  for (var i = 0; i < text3d.vertices.length; i++) {
    text3d.vertices[i].y += 10;
    text3d.vertices[i].x -= nameCenter;
  }

  var nameMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
  var textMesh = new THREE.Mesh(text3d, nameMaterial);

  var geometry = new THREE.SphereGeometry( 5, 32, 32 );
  geometry.merge(text3d);

  if (teamId === 0) {
    // $teamStatus.text("you're on the blue team");
    // $teamStatus.css('color','blue');
    $('.scoreboard').removeClass('scoreboard-red');
    $('.scoreboard').addClass('scoreboard-blue');
    var material = redTeam;
  } else {
    // $teamStatus.text("you're on the red team");
    // $teamStatus.css('color','red');
    $('.scoreboard').removeClass('scoreboard-blue');
    $('.scoreboard').addClass('scoreboard-red');
    var material = blueTeam;
  }

  var sphere = new THREE.Mesh( geometry, material );
  return sphere;
};
