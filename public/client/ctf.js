var camera, scene, renderer;
var geometry, material, mesh;
var controls; // player = controls.getObject().position.x & z

var objects = [];

var raycaster;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

  var element = document.body;

  var pointerlockchange = function ( event ) {

    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

      controlsEnabled = true;
      controls.enabled = true;

      blocker.style.display = 'none';

    } else {

      controls.enabled = false;

      blocker.style.display = '-webkit-box';
      blocker.style.display = '-moz-box';
      blocker.style.display = 'box';

      instructions.style.display = '';

    }

  }

  var pointerlockerror = function ( event ) {

    instructions.style.display = '';

  }

  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  instructions.addEventListener( 'click', function ( event ) {

    instructions.style.display = 'none';

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

    if ( /Firefox/i.test( navigator.userAgent ) ) {

      var fullscreenchange = function ( event ) {

        if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

          document.removeEventListener( 'fullscreenchange', fullscreenchange );
          document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

          element.requestPointerLock();
        }

      }

      document.addEventListener( 'fullscreenchange', fullscreenchange, false );
      document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

      element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

      element.requestFullscreen();

    } else {

      element.requestPointerLock();

    }

  }, false );

} else {

  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();
animate();

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

function init() {

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

  var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
  light.position.set( 0.5, 1, 0.75 );
  scene.add( light );

  controls = new THREE.PointerLockControls( camera );
  scene.add( controls.getObject() );

  // stats = new Stats();
	// stats.domElement.style.position = 'absolute';
	// stats.domElement.style.bottom = '0px';
	// stats.domElement.style.zIndex = 100;
	// document.body.appendChild( stats.domElement );

  var onKeyDown = function ( event ) {

    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = true;
        break;

      case 37: // left
      case 65: // a
        moveLeft = true; break;

      case 40: // down
      case 83: // s
        moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        moveRight = true;
        break;

      case 32: // space
        if ( canJump === true ) velocity.y += 150;
        canJump = false;
        break;

      case 86: // v
        toggleVR();
        break;

      case 16: // shift
        soundController.startRecording();
        break;

    }

  };

  var onKeyUp = function ( event ) {

    switch( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = false;
        break;

      case 37: // left
      case 65: // a
        moveLeft = false;
        break;

      case 40: // down
      case 83: // s
        moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        moveRight = false;
        break;

      case 16:
        soundController.stopRecording();

    }

  };

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );

  // FIRE THE LAZOR
  var onClick = function(event) {
    if (controlsEnabled) {
      console.log('pew!')
    }
  }

  document.addEventListener('click', onClick);

  raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

  // floor

  geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
  geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

  for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

    var vertex = geometry.vertices[ i ];
    vertex.x += Math.random() * 20 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

  }

  for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

    var face = geometry.faces[ i ];
    face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
    face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

  }

  // material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
  var floorMaterial = new THREE.MeshBasicMaterial( {color: 0x222222} );


  floorMesh = new THREE.Mesh( geometry, floorMaterial );
  scene.add( floorMesh );

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );


  if ( controlsEnabled ) {
    raycaster.ray.origin.copy( controls.getObject().position );
    raycaster.ray.origin.y -= 10;

    var intersections = raycaster.intersectObjects( objects );

    var isOnObject = intersections.length > 0;

    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * 4.0 * delta;
    velocity.z -= velocity.z * 4.0 * delta;

    velocity.y -= 9.8 * 35.0 * delta; // 35.0 = mass

    var speed = 400.0;

    if (envVariables.player.hasOwnProperty('hasFlag')) {
      if(envVariables.player.hasFlag) speed = 200.0;
    }

    if ( moveForward ) velocity.z -= speed * delta;
    if ( moveBackward ) velocity.z += speed * delta;
    if ( moveLeft ) velocity.x -= speed * delta;
    if ( moveRight ) velocity.x += speed * delta;


    if(moveForward || moveBackward || moveLeft || moveRight){ // IF MOVING
      socket.emit('updatePosition', JSON.stringify({x:controls.getObject().position.x,y:controls.getObject().position.z}), JSON.stringify(envVariables.player.hasFlag)); // sends new valid player position to server and if the player has the flag or not
      // Update the player object's coordinates
      envVariables.player.position.x = controls.getObject().position.x;
      envVariables.player.position.y = controls.getObject().position.z;
      // Collision detection here based on the player position (controls.getObject().position)
      Collisions.flagDetection(envVariables.player, envVariables.flag); // checks to see if player has captured the flag

      // Base Collision Detection
      if(Collisions.baseDetection(envVariables.player, envVariables['base' + envVariables.player.team])) { // returns true if player has flag and entered their own base to score a point
        envVariables.player.score = true; // necessary only allowing 1 scoring condition to be met before server resets
        envVariables.player.hasFlag = null; // player drops the flag before the flag position is reset
        // envVariables.flag.drop(); // drop the flag
        $('#flag-status').text("");

        //adding comment for no reason :D
        socket.emit('playerScores'); // send to data to server about player scoring
      }
    }


    if ( isOnObject === true ) {
      velocity.y = Math.max( 0, velocity.y );

      canJump = true;
      // canJump = false;
    }

    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    // console.log(controls.getObject().position.x + ", " + controls.getObject().position.z);

    if ( controls.getObject().position.y < 10 ) {

      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;
      // canJump = false;
    }

    prevTime = time;

  }

  for (var key in envVariables.playerContainer) {
    envVariables.playerContainer[key].model.rotation.y += 0.05;
  }

  renderer.render( scene, camera );
}
