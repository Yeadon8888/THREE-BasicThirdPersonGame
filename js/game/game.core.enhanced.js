/*
 * Game Core - Enhanced Version
 *
 * Enhanced version with collectibles, moving platforms, score system, and better gameplay
 */

window.game = window.game || {};

window.game.core = function () {
	var _game = {
		// Attributes
		player: {
			// Attributes
			model: null,
			mesh: null,
			shape: null,
			rigidBody: null,
			mass: 3,

			orientationConstraint: null,
			isGrounded: false,
			jumpHeight: 45,

			// Enhanced player stats
			speed: 2.2,
			speedMax: 55,
			rotationSpeed: 0.008,
			rotationSpeedMax: 0.045,
			rotationRadians: new THREE.Vector3(0, 0, 0),
			rotationAngleX: null,
			rotationAngleY: null,
			damping: 0.91,
			rotationDamping: 0.82,
			acceleration: 0,
			rotationAcceleration: 0,

			// Player stats
			score: 0,
			collectedItems: 0,
			playerColor: 0x00ff88,

			playerAccelerationValues: {
				position: {
					acceleration: "acceleration",
					speed: "speed",
					speedMax: "speedMax"
				},
				rotation: {
					acceleration: "rotationAcceleration",
					speed: "rotationSpeed",
					speedMax: "rotationSpeedMax"
				}
			},

			// Enhanced camera
			playerCoords: null,
			cameraCoords: null,
			cameraOffsetH: 280,
			cameraOffsetV: 160,

			controlKeys: {
				forward: "w",
				backward: "s",
				left: "a",
				right: "d",
				jump: "space"
			},

			// Methods
			create: function() {
				_cannon.playerPhysicsMaterial = new CANNON.Material("playerMaterial");

				// Create enhanced player model with custom colors
				_game.player.model = _three.createModel(window.game.models.player, 14, [
					new THREE.MeshLambertMaterial({ color: _game.player.playerColor, shading: THREE.FlatShading }),
					new THREE.MeshLambertMaterial({ color: 0x44ff44, shading: THREE.FlatShading })
				]);

				_game.player.shape = new CANNON.Box(_game.player.model.halfExtents);
				_game.player.rigidBody = new CANNON.RigidBody(_game.player.mass, _game.player.shape, _cannon.createPhysicsMaterial(_cannon.playerPhysicsMaterial));
				_game.player.rigidBody.position.set(0, 0, 50);
				_game.player.mesh = _cannon.addVisual(_game.player.rigidBody, null, _game.player.model.mesh);

				// Enhanced orientation constraint
				_game.player.orientationConstraint = new CANNON.HingeConstraint(_game.player.rigidBody, new CANNON.Vec3(0, 0, 0), new CANNON.Vec3(0, 0, 1), _game.player.rigidBody, new CANNON.Vec3(0, 0, 1), new CANNON.Vec3(0, 0, 1));
				_cannon.world.addConstraint(_game.player.orientationConstraint);

				_game.player.rigidBody.postStep = function() {
					_game.player.rigidBody.angularVelocity.z = 0;
					_game.player.updateOrientation();
				};

				// Enhanced collision detection for collectibles
				_game.player.rigidBody.addEventListener("collide", function(event) {
					if (!_game.player.isGrounded) {
						_game.player.isGrounded = (new CANNON.Ray(_game.player.mesh.position, new CANNON.Vec3(0, 0, -1)).intersectBody(event.contact.bi).length > 0);
					}

					// Check for collectible collisions
					_game.level.checkCollectibleCollision(_game.player.mesh.position);
				});
			},
			update: function() {
				_game.player.processUserInput();
				_game.player.accelerate();
				_game.player.rotate();
				_game.player.updateCamera();

				// Enhanced game logic
				_game.level.updateMovingPlatforms();
				_game.player.checkGameOver();
				_game.player.updatePlayerEffects();
			},
			updateCamera: function() {
				_game.player.cameraCoords = window.game.helpers.polarToCartesian(_game.player.cameraOffsetH, _game.player.rotationRadians.z);

				_three.camera.position.x = _game.player.mesh.position.x + _game.player.cameraCoords.x;
				_three.camera.position.y = _game.player.mesh.position.y + _game.player.cameraCoords.y;
				_three.camera.position.z = _game.player.mesh.position.z + _game.player.cameraOffsetV;

				_three.camera.lookAt(_game.player.mesh.position);
			},
			updateAcceleration: function(values, direction) {
				if (direction === 1) {
					if (_game.player[values.acceleration] > -_game.player[values.speedMax]) {
						if (_game.player[values.acceleration] >= _game.player[values.speedMax] / 2) {
							_game.player[values.acceleration] = -(_game.player[values.speedMax] / 3);
						} else {
							_game.player[values.acceleration] -= _game.player[values.speed];
						}
					} else {
						_game.player[values.acceleration] = -_game.player[values.speedMax];
					}
				} else {
					if (_game.player[values.acceleration] < _game.player[values.speedMax]) {
						if (_game.player[values.acceleration] <= -(_game.player[values.speedMax] / 2)) {
							_game.player[values.acceleration] = _game.player[values.speedMax] / 3;
						} else {
							_game.player[values.acceleration] += _game.player[values.speed];
						}
					} else {
						_game.player[values.acceleration] = _game.player[values.speedMax];
					}
				}
			},
			processUserInput: function() {
				if (_events.keyboard.pressed[_game.player.controlKeys.jump]) {
					_game.player.jump();
				}

				if (_events.keyboard.pressed[_game.player.controlKeys.forward]) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.position, 1);
					if (!_cannon.getCollisions(_game.player.rigidBody.index)) {
						_game.player.rigidBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), _game.player.rotationRadians.z);
					}
				}

				if (_events.keyboard.pressed[_game.player.controlKeys.backward]) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.position, -1);
				}

				if (_events.keyboard.pressed[_game.player.controlKeys.right]) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.rotation, 1);
				}

				if (_events.keyboard.pressed[_game.player.controlKeys.left]) {
					_game.player.updateAcceleration(_game.player.playerAccelerationValues.rotation, -1);
				}
			},
			accelerate: function() {
				_game.player.playerCoords = window.game.helpers.polarToCartesian(_game.player.acceleration, _game.player.rotationRadians.z);
				_game.player.rigidBody.velocity.set(_game.player.playerCoords.x, _game.player.playerCoords.y, _game.player.rigidBody.velocity.z);

				if (!_events.keyboard.pressed[_game.player.controlKeys.forward] && !_events.keyboard.pressed[_game.player.controlKeys.backward]) {
					_game.player.acceleration *= _game.player.damping;
				}
			},
			rotate: function() {
				_cannon.rotateOnAxis(_game.player.rigidBody, new CANNON.Vec3(0, 0, 1), _game.player.rotationAcceleration);

				if (!_events.keyboard.pressed[_game.player.controlKeys.left] && !_events.keyboard.pressed[_game.player.controlKeys.right]) {
					_game.player.rotationAcceleration *= _game.player.rotationDamping;
				}
			},
			jump: function() {
				if (_cannon.getCollisions(_game.player.rigidBody.index) && _game.player.isGrounded) {
					_game.player.isGrounded = false;
					_game.player.rigidBody.velocity.z = _game.player.jumpHeight;
				}
			},
			updateOrientation: function() {
				_game.player.rotationRadians = new THREE.Euler().setFromQuaternion(_game.player.rigidBody.quaternion);
				_game.player.rotationAngleX = Math.round(window.game.helpers.radToDeg(_game.player.rotationRadians.x));
				_game.player.rotationAngleY = Math.round(window.game.helpers.radToDeg(_game.player.rotationRadians.y));

				if ((_cannon.getCollisions(_game.player.rigidBody.index) &&
					((_game.player.rotationAngleX >= 90) ||
						(_game.player.rotationAngleX <= -90) ||
						(_game.player.rotationAngleY >= 90) ||
						(_game.player.rotationAngleY <= -90)))
				) {
					_game.player.rigidBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), _game.player.rotationRadians.z);
				}
			},
			updatePlayerEffects: function() {
				// Update player color based on score
				if (_game.player.collectedItems > 0) {
					var hue = (_game.player.collectedItems * 30) % 360;
					_game.player.playerColor = new THREE.Color().setHSL(hue / 360, 0.8, 0.5);

					// Update player mesh color
					if (_game.player.mesh && _game.player.mesh.material) {
						if (Array.isArray(_game.player.mesh.material)) {
							_game.player.mesh.material[0].color = _game.player.playerColor;
						} else {
							_game.player.mesh.material.color = _game.player.playerColor;
						}
					}
				}
			},
			checkGameOver: function () {
				if (_game.player.mesh.position.z <= -1000) {
					_game.destroy();
				}
			}
		},
		level: {
			// Enhanced level attributes
			collectibles: [],
			movingPlatforms: [],
			score: 0,

			// Methods
			create: function() {
				_cannon.solidMaterial = _cannon.createPhysicsMaterial(new CANNON.Material("solidMaterial"), 0, 0.1);

				var floorSize = 1000;
				var floorHeight = 20;

				// Enhanced floor with better material
				_cannon.createRigidBody({
					shape: new CANNON.Box(new CANNON.Vec3(floorSize, floorSize, floorHeight)),
					mass: 0,
					position: new CANNON.Vec3(0, 0, -floorHeight),
					meshMaterial: new THREE.MeshLambertMaterial({ color: 0x333333 }),
					physicsMaterial: _cannon.solidMaterial
				});

				// Enhanced level design with more platforms
				_game.level.createEnhancedPlatforms();
				_game.level.createCollectibles();
				_game.level.createMovingPlatforms();

				// Enhanced grid
				var grid = new THREE.GridHelper(floorSize, floorSize / 10);
				grid.position.z = 0.5;
				grid.rotation.x = window.game.helpers.degToRad(90);
				_three.scene.add(grid);
			},
			createEnhancedPlatforms: function() {
				// Create a series of challenging platforms
				var platforms = [
					{ pos: [-280, -200, 30], size: [40, 40, 40], color: 0x4CAF50 },
					{ pos: [-350, -280, 90], size: [35, 35, 35], color: 0x2196F3 },
					{ pos: [-200, -150, 150], size: [30, 30, 30], color: 0xFF9800 },
					{ pos: [-100, -50, 210], size: [45, 45, 45], color: 0x9C27B0 },
					{ pos: [0, 50, 270], size: [40, 40, 40], color: 0xF44336 },
					{ pos: [120, 180, 330], size: [35, 35, 35], color: 0x00BCD4 },
					{ pos: [250, 320, 390], size: [50, 50, 50], color: 0xFFEB3B },
					{ pos: [-150, 100, 450], size: [40, 40, 40], color: 0x795548 },
					{ pos: [300, -100, 510], size: [45, 45, 45], color: 0x607D8B },
					{ pos: [-400, 50, 570], size: [35, 35, 35], color: 0xE91E63 }
				];

				platforms.forEach(function(platform) {
					_cannon.createRigidBody({
						shape: new CANNON.Box(new CANNON.Vec3(platform.size[0], platform.size[1], platform.size[2])),
						mass: 0,
						position: new CANNON.Vec3(platform.pos[0], platform.pos[1], platform.pos[2]),
						meshMaterial: new THREE.MeshLambertMaterial({ color: platform.color }),
						physicsMaterial: _cannon.solidMaterial
					});
				});
			},
			createCollectibles: function() {
				// Create collectible items
				var collectiblePositions = [
					{ pos: [-280, -200, 80], value: 10 },
					{ pos: [-350, -280, 140], value: 15 },
					{ pos: [-200, -150, 200], value: 20 },
					{ pos: [-100, -50, 260], value: 25 },
					{ pos: [0, 50, 320], value: 30 },
					{ pos: [120, 180, 380], value: 35 },
					{ pos: [250, 320, 440], value: 40 },
					{ pos: [-150, 100, 500], value: 50 },
					{ pos: [300, -100, 560], value: 45 },
					{ pos: [-400, 50, 620], value: 60 }
				];

				collectiblePositions.forEach(function(collectible, index) {
					var geometry = new THREE.CubeGeometry(15, 15, 15);
					var material = new THREE.MeshLambertMaterial({
						color: 0xFFD700,
						emissive: 0xFFD700,
						emissiveIntensity: 0.2
					});
					var mesh = new THREE.Mesh(geometry, material);
					mesh.position.set(collectible.pos[0], collectible.pos[1], collectible.pos[2]);
					mesh.userData = {
						type: 'collectible',
						value: collectible.value,
						collected: false,
						rotationSpeed: 0.02 + (index * 0.005)
					};

					_three.scene.add(mesh);
					_game.level.collectibles.push(mesh);
				});
			},
			createMovingPlatforms: function() {
				// Create moving platforms
				var movingPlatformData = [
					{ start: [-200, 0, 100], end: [200, 0, 100], speed: 0.5 },
					{ start: [0, -300, 200], end: [0, 300, 200], speed: 0.3 },
					{ start: [-300, -200, 300], end: [300, 200, 300], speed: 0.4 }
				];

				movingPlatformData.forEach(function(platformData, index) {
					var platform = {
						startPos: new THREE.Vector3(platformData.start[0], platformData.start[1], platformData.start[2]),
						endPos: new THREE.Vector3(platformData.end[0], platformData.end[1], platformData.end[2]),
						speed: platformData.speed,
						direction: 1,
						progress: 0
					};

					var rigidBody = _cannon.createRigidBody({
						shape: new CANNON.Box(new CANNON.Vec3(60, 20, 10)),
						mass: 0,
						position: new CANNON.Vec3(platformData.start[0], platformData.start[1], platformData.start[2]),
						meshMaterial: new THREE.MeshLambertMaterial({ color: 0xFF5722 }),
						physicsMaterial: _cannon.solidMaterial
					});

					platform.rigidBody = rigidBody;
					_game.level.movingPlatforms.push(platform);
				});
			},
			updateMovingPlatforms: function() {
				_game.level.movingPlatforms.forEach(function(platform) {
					platform.progress += platform.speed * 0.01;

					if (platform.progress >= 1) {
						platform.progress = 0;
						platform.direction *= -1;
					}

					var t = platform.direction > 0 ? platform.progress : 1 - platform.progress;
					var currentPos = platform.startPos.clone();
					currentPos.lerp(platform.endPos, t);

					platform.rigidBody.position.copy(currentPos);
				});

				// Animate collectibles
				_game.level.collectibles.forEach(function(collectible) {
					if (!collectible.userData.collected) {
						collectible.rotation.y += collectible.userData.rotationSpeed;
						collectible.position.z += Math.sin(Date.now() * 0.001) * 0.1;
					}
				});
			},
			checkCollectibleCollision: function(playerPos) {
				_game.level.collectibles.forEach(function(collectible) {
					if (!collectible.userData.collected) {
						var distance = playerPos.distanceTo(collectible.position);
						if (distance < 25) {
							collectible.userData.collected = true;
							_game.player.score += collectible.userData.value;
							_game.player.collectedItems++;

							// Remove from scene
							_three.scene.remove(collectible);

							// Show collection effect
							_game.level.showCollectEffect(collectible.userData.value);

							// Update score display
							document.getElementById('scoreValue').textContent = _game.player.score;
						}
					}
				});
			},
			showCollectEffect: function(value) {
				var effect = document.createElement('div');
				effect.className = 'collect-effect';
				effect.textContent = '+' + value;
				document.body.appendChild(effect);

				setTimeout(function() {
					document.body.removeChild(effect);
				}, 1000);
			}
		},

		// Methods
		init: function(options) {
			_game.initComponents(options);
			_game.player.create();
			_game.level.create();
			_game.loop();
		},
		destroy: function() {
			window.cancelAnimationFrame(_animationFrameLoop);
			_cannon.destroy();
			_cannon.setup();
			_three.destroy();
			_three.setup();

			// Reset game state
			_game.player.score = 0;
			_game.player.collectedItems = 0;
			_game.level.collectibles = [];
			_game.level.movingPlatforms = [];
			document.getElementById('scoreValue').textContent = '0';

			_game.player = window.game.helpers.cloneObject(_gameDefaults.player);
			_game.level = window.game.helpers.cloneObject(_gameDefaults.level);

			_game.player.create();
			_game.level.create();
			_game.loop();
		},
		loop: function() {
			_animationFrameLoop = window.requestAnimationFrame(_game.loop);
			_cannon.updatePhysics();
			_game.player.update();
			_three.render();
		},
		initComponents: function (options) {
			_events = window.game.events();
			_three = window.game.three();
			_cannon = window.game.cannon();
			_ui = window.game.ui();

			// Enhanced lighting
			_three.setupLights = function () {
				var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.7);
				hemiLight.position.set(0, 0, -1);
				_three.scene.add(hemiLight);

				var pointLight = new THREE.PointLight(0xffffff, 0.8);
				pointLight.position.set(0, 0, 600);
				_three.scene.add(pointLight);

				var ambientLight = new THREE.AmbientLight(0x404040, 0.3);
				_three.scene.add(ambientLight);
			};

			_three.init(options);
			_cannon.init(_three);
			_ui.init();
			_events.init();

			_events.onKeyDown = function () {
				if (!_ui.hasClass("infoboxIntro", "fade-out")) {
					_ui.fadeOut("infoboxIntro");
				}
			};
		}
	};

	// Internal variables
	var _events;
	var _three;
	var _cannon;
	var _ui;
	var _animationFrameLoop;
	var _gameDefaults = {
		player: window.game.helpers.cloneObject(_game.player),
		level: window.game.helpers.cloneObject(_game.level)
	};

	return _game;
};
