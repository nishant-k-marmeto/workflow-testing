// twitter @msvaljek
// https://msvaljek.blogspot.com/2013/08/canvas-simple-game.html

// standard shim


function notcamelcase(){
  console.log("i am not a camel case named function");
}
notcamelcase();

window.requestAnimFrame = (function(){
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function( callback ) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

// helper functions
function randomMax(max) {
	return ~~(Math.random() * max);
}
function distance(a, b) {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

var canvas = document.getElementById('mainCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext('2d');

var playerOut = document.getElementById('player');
var enemyOut = document.getElementById('enemy');

var activeKeys = [];
activeKeys['shoot'] = true;

// globals
var twoPi = 2 * Math.PI,
	playerSize = 10,
	playerStartX = 100,
	playerColor = '#0F0',
	playerSpeed = 3,
	bulletSpeed = 5,
	bulletSize = 2,
	bulletColor = '#000',
	bulletTimeout = 500,
	enemySize = 20,
	enemyColor = '#00f',
	enemySpeedX = 5,
	enemySpeedY = 5,
	enemyCreation = 500,

	playerScore = 0,
	enemyScore = 0;

var Player = function (x, y) {
	this.x = x;
	this.y = y;
	this.bullets = [];
	this.lastShot = new Date();
};
Player.prototype.shoot = function () {
	var checkTime = new Date();
	if ((checkTime - this.lastShot) > bulletTimeout) {
		var bullet = {
			y : this.y,
			x : this.x + playerSize
		};
		this.bullets.push(bullet);
		this.lastShot = new Date();
	}
};
Player.prototype.draw = function () {

	if (activeKeys['left']) {
		this.x -= playerSpeed;
	}
	if (activeKeys['right']) {
		this.x += playerSpeed;
	}
	if (activeKeys['up']) {
		this.y -= playerSpeed;
	}
	if (activeKeys['down']) {
		this.y += playerSpeed;
	}
	if (activeKeys['shoot']) {
		this.shoot();
	}

	if (this.x - playerSize < 0) {
		this.x = playerSize;
	}
	if (this.y - playerSize < 0) {
		this.y = playerSize;
	}
	if (this.x + playerSize > canvas.width) {
		this.x = canvas.width - playerSize;
	}
	if (this.y + playerSize > canvas.height) {
		this.y = canvas.height - playerSize;
	}

	ctx.fillStyle = playerColor;
	ctx.beginPath();
	ctx.arc(this.x, this.y, playerSize, 0, twoPi);
	ctx.fill();

	for (var i = 0; i < this.bullets.length; i++) {
		this.bullets[i].x += bulletSpeed;

		ctx.fillStyle = bulletColor;
		ctx.beginPath();
		ctx.arc(this.bullets[i].x, this.bullets[i].y, bulletSize, 0, twoPi);
		ctx.fill();

		if (this.bullets[i].x > canvas.width) {
			this.bullets.splice(i, 1);
		} else {
			for (var k = 0; k < enemies.length; k++) {
				if (this.bullets[i] && enemies[k] && distance (this.bullets[i], enemies[k]) < enemySize) {
					enemies[k].dead = true;
					playerScore++;
					this.bullets.splice(i, 1);
				}
			}
		}
	}
};

var player = new Player(playerStartX, ~~(canvas.height / 2));

var Enemy = function () {
	this.x = canvas.width;
	this.y = randomMax(canvas.height);
	this.fy = Math.random() > 0.5 ? -1 : 1;
	this.dead = false;
	this.touchedPlayer = false;
};
Enemy.prototype.draw = function () {
	this.x -= enemySpeedX;
	this.y += this.fy * enemySpeedY;

	if (this.y - enemySize < 0) {
		this.y = enemySize;
		this.fy *= -1;
	}
	if (this.y + enemySize > canvas.height) {
		this.y = canvas.height - enemySize;
		this.fy *= -1;
	}
	if (this.x < 0) {
		this.dead = true;
	}

	if (!this.touchedPlayer && distance (this, player) < (enemySize + playerSize)) {
		this.touchedPlayer = true;
		enemyScore++;
	}

	ctx.fillStyle = enemyColor;
	ctx.beginPath();
	ctx.arc(this.x, this.y, enemySize, 0, twoPi);
	ctx.fill();
};

var enemies = [];
function createEnemy() {
	enemies.push(new Enemy());

	setTimeout(createEnemy, enemyCreation);
}
setTimeout(createEnemy, enemyCreation);

window.onresize = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

var gui = new dat.GUI();
var f1 = gui.addFolder('Colors');
f1.addColor(window, 'playerColor');
f1.addColor(window, 'bulletColor');
f1.addColor(window, 'enemyColor');
f1.close();

var f2 = gui.addFolder('Sizes');
f2.add(window, 'playerSize').min(2).max(30).step(1);
f2.add(window, 'enemySize').min(2).max(30).step(1);
f2.close();

var f3 = gui.addFolder('Game Play');
f3.add(window, 'playerSpeed').min(1).max(10).step(1);
f3.add(window, 'bulletSpeed').min(1).max(10).step(1);
f3.add(window, 'bulletTimeout').min(100).max(3000).step(1);
f3.add(window, 'enemySpeedX').min(1).max(10).step(1);
f3.add(window, 'enemySpeedY').min(1).max(10).step(1);
f3.add(window, 'enemyCreation').min(100).max(3000).step(1);
f3.open();

function setKeysTo(e, state) {
	if(e.keyCode == 37) {
		activeKeys['left'] = state;
	} else if(e.keyCode == 39) {
		activeKeys['right'] = state;
	}  else if(e.keyCode == 38) {
		activeKeys['up'] = state;
	} else if(e.keyCode == 40) {
		activeKeys['down'] = state;
	} else if (e.keyCode == 32) {
		activeKeys['shoot'] = state;
	}

	return false;
}

document.onkeydown = function(e) {
	return setKeysTo(e, true);
};

document.onkeyup = function(e) {
	return setKeysTo(e, false);
};

(function animloop(){
	requestAnimFrame(animloop);

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	player.draw();

	for (var j = 0; j < enemies.length; j++) {
		enemies[j].draw();
		if (enemies[j].dead) {
			enemies.splice(j, 1);
			j--;
		}
	}

})();

setInterval(function(){
  playerOut.innerHTML = playerScore;
  enemyOut.innerHTML = enemyScore;
}, 300);