const CELL_SIZE = 20;
const CANVAS_SIZE = 600;
const REDRAW_INTERVAL = 50;
const WIDTH = CANVAS_SIZE / CELL_SIZE;
const HEIGHT = CANVAS_SIZE / CELL_SIZE;
const DIRECTION = {
	LEFT: 0,
	RIGHT: 1,
	UP: 2,
	DOWN: 3,
};

const moveInterval = 120;
let currentMoveInterval = moveInterval;
let level = 1;
let life = 3;
let score = 0;
let highscore = localStorage.getItem('highscore') ?? 0;

// declare assets
let lifeImg = new Image();
let obstacleImg = new Image();
lifeImg.src = './assets/life.png';
obstacleImg.src = './assets/obstacle.png';
let audioGameOver = new Audio();
let audioAppleBite = new Audio();
let audioGameComplete = new Audio();
let audioBlockHit = new Audio();
audioGameOver.src = './assets/game-over.mp3';
audioAppleBite.src = './assets/apple-bite.mp3';
audioGameComplete.src = './assets/game-complete.wav';
audioBlockHit.src = './assets/block-hit.wav';

let dataObstacle = [];

let ObstaclePerLevel = {
	2: [
		{
			x: 3,
			y: 14,
			length: 24,
			direction: 'horizontal',
		},
	],
	3: [
		{
			x: 3,
			y: 10,
			length: 24,
			direction: 'horizontal',
		},
		{
			x: 3,
			y: 20,
			length: 24,
			direction: 'horizontal',
		},
	],
	4: [
		{
			x: 3,
			y: 10,
			length: 24,
			direction: 'horizontal',
		},
		{
			x: 3,
			y: 15,
			length: 24,
			direction: 'horizontal',
		},
		{
			x: 3,
			y: 20,
			length: 24,
			direction: 'horizontal',
		},
	],
	5: [
		{
			x: 8,
			y: 3,
			length: 24,
			direction: 'vertical',
		},
		{
			x: 20,
			y: 3,
			length: 24,
			direction: 'vertical',
		},
	],
};
let blinkCount = 0;

let snake1 = initSnake();

let apples = [
	{
		position: initPosition(),
	},
	{
		position: initPosition(),
	},
];

let health = {
	appear: false,
	position: initPosition(),
};

function levelUp() {
	level++;
	if (currentMoveInterval > 40) {
		currentMoveInterval -= 20;
	} else {
		currentMoveInterval = 40;
	}

	audioGameComplete.play();
	alert(`Selamat anda Naik level ${level}`);
	updateHtml();
}

function updateHtml() {
	let levelHtml = document.getElementById('level');
	levelHtml.innerText = level;
	let speedHtml = document.getElementById('speed');
	speedHtml.innerText = currentMoveInterval;
}

function initPosition(snake) {
	let x = Math.floor(Math.random() * WIDTH);
	let y = Math.floor(Math.random() * HEIGHT);
	while (checkCollisionObstacle(x, y, snake)) {
		x = Math.floor(Math.random() * WIDTH);
		y = Math.floor(Math.random() * HEIGHT);
	}
	return {
		x,
		y,
	};
}

function initHeadAndBody() {
	let head = initPosition();
	let body = [{ x: head.x, y: head.y }];
	return {
		head: head,
		body: body,
	};
}

function initDirection() {
	return Math.floor(Math.random() * 4);
}

function initSnake() {
	return {
		...initHeadAndBody(),
		direction: initDirection(),
	};
}

function updateLifeHtml() {
	let lifeElement = document.getElementById('life');
	lifeElement.innerHTML = '';
	for (var i = 0; i < life; i++) {
		let node = document.createElement('IMG');
		node.src = './assets/life.png';
		lifeElement.appendChild(node);
	}
}

function drawImagePixel(ctx, x, y, img) {
	ctx.drawImage(img, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawScore(snake) {
	let scoreCanvas, highscoreCanvas;
	scoreCanvas = document.getElementById('score1Board');
	highscoreCanvas = document.getElementById('highscore');
	let scoreCtx = scoreCanvas.getContext('2d');

	scoreCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
	scoreCtx.font = '30px Arial';
	scoreCtx.fillText(score, 10, scoreCanvas.scrollHeight / 2);
	scoreCtx.fillText(highscore, 300, highscoreCanvas.scrollHeight / 2);
}

function drawHighscore(snake) {
	let highscoreCanvas;
	highscoreCanvas = document.getElementById('highscore');
	let scoreCtx = highscoreCanvas.getContext('2d');

	scoreCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
	scoreCtx.font = '30px Arial';
	scoreCtx.fillText(highscore, 40, highscoreCanvas.scrollHeight / 2 + 20);
	scoreCtx.font = '20px Arial';
	scoreCtx.fillText("highscore", 10, highscoreCanvas.scrollHeight / 2 - 10);
}

function obstacle(ctx) {
	let currentObstacle = ObstaclePerLevel[level] ?? [];
	currentObstacle.forEach(obstacle => {
		drawObstacle(ctx, obstacle.x, obstacle.y, obstacle.length, obstacle.direction);
	});
}

function drawObstacle(ctx, x, y, length, direction) {
	let tmpArray = [];
	if (direction === 'vertical') {
		for (let i = y; i < y + length; i++) {
			tmpArray.push({ x: x, y: i });
			drawImagePixel(ctx, x, i, obstacleImg);
		}
	} else if (direction === 'horizontal') {
		for (let i = x; i < x + length; i++) {
			tmpArray.push({ x: i, y: y });
			drawImagePixel(ctx, i, y, obstacleImg);
		}
	}
	dataObstacle.push(tmpArray);
}

function draw() {
	setInterval(function () {
		let snakeCanvas = document.getElementById('snakeBoard');
		let ctx = snakeCanvas.getContext('2d');

		ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

		var img = document.getElementById('head');
		drawImagePixel(ctx, snake1.head.x, snake1.head.y, img);

		for (let i = 1; i < snake1.body.length; i++) {
			if (i == snake1.body.length - 1) {
				var img = document.getElementById('tail');
				drawImagePixel(ctx, snake1.body[i].x, snake1.body[i].y, img);
			} else {
				var img = document.getElementById('body');
				drawImagePixel(ctx, snake1.body[i].x, snake1.body[i].y, img);
			}
		}

		for (let i = 0; i < apples.length; i++) {
			let apple = apples[i];
			var img = document.getElementById('apple');
			drawImagePixel(ctx, apple.position.x, apple.position.y, img);
		}

		if (health.appear && !(blinkCount % 15 === 0)) {
			drawImagePixel(ctx, health.position.x, health.position.y, lifeImg);
		}
		blinkCount++;

		obstacle(ctx);

		drawScore(snake1);
		drawHighscore();
	}, REDRAW_INTERVAL);
}

function teleport(snake) {
	if (snake.head.x < 0) {
		snake.head.x = CANVAS_SIZE / CELL_SIZE - 1;
	}
	if (snake.head.x >= WIDTH) {
		snake.head.x = 0;
	}
	if (snake.head.y < 0) {
		snake.head.y = CANVAS_SIZE / CELL_SIZE - 1;
	}
	if (snake.head.y >= HEIGHT) {
		snake.head.y = 0;
	}
}

function eat(snake, apples) {
	for (let i = 0; i < apples.length; i++) {
		let apple = apples[i];
		if (snake.head.x == apple.position.x && snake.head.y == apple.position.y) {
			apple.position = initPosition(snake);
			audioAppleBite.play();
			score++;
			if (score > highscore) {
				highscore = score;
				localStorage.setItem('highscore', score);
			}
			snake.body.push({ x: snake.head.x, y: snake.head.y });
			health.appear = isPrimeNumber(score);
			health.position = initPosition(snake);
			if (level < 5) {
				if (score % 5 === 0) {
					dataObstacle = [];
					levelUp();
				}
			}
		}
	}
}

function eatLife(snake) {
	if (health.appear == true && snake.head.x == health.position.x && snake.head.y == health.position.y) {
		life++;
		score++;
		if (score > highscore) {
			highscore = score;
			localStorage.setItem('highscore', score);
		}
		updateLifeHtml();
		health.appear = isPrimeNumber(score);
		health.position = initPosition(snake);
		if (level < 5) {
			if (score % 5 === 0) {
				dataObstacle = [];
				levelUp();
			}
		}
	}
}

function isPrimeNumber(score) {
	if (score === 1) {
		return false;
	}

	for (let i = 2; i < score; i++) {
		if (score % i == 0) {
			return false;
		}
	}
	return true;
}

function moveLeft(snake) {
	snake.head.x--;
	teleport(snake);
	eat(snake, apples);
	eatLife(snake);
}

function moveRight(snake) {
	snake.head.x++;
	teleport(snake);
	eat(snake, apples);
	eatLife(snake);
}

function moveDown(snake) {
	snake.head.y++;
	teleport(snake);
	eat(snake, apples);
	eatLife(snake);
}

function moveUp(snake) {
	snake.head.y--;
	teleport(snake);
	eat(snake, apples);
	eatLife(snake);
}

function checkCollisionObstacle(x, y, snake) {
	let isCollide = false;
	//this
	if (snake) {
		console.log(snake);
		if (x == snake.head.x && y == snake.head.y) {
			isCollide = true;
		}

		for (let k = 1; k < snake.body.length; k++) {
			if (x == snake.body[k].x && y == snake.body[k].y) {
				isCollide = true;
			}
		}
	}

	for (let j = 0; j < dataObstacle.length; j++) {
		for (let k = 0; k < dataObstacle[j].length; k++) {
			if (x == dataObstacle[j][k].x && y == dataObstacle[j][k].y) {
				isCollide = true;
			}
		}
	}

	return isCollide;
}

function checkCollision(snakes) {
	let isCollide = false;
	//this
	for (let i = 0; i < snakes.length; i++) {
		for (let j = 0; j < snakes.length; j++) {
			for (let k = 1; k < snakes[j].body.length; k++) {
				if (snakes[i].head.x == snakes[j].body[k].x && snakes[i].head.y == snakes[j].body[k].y) {
					isCollide = true;
				}
			}
		}
	}

	for (let i = 0; i < snakes.length; i++) {
		for (let j = 0; j < dataObstacle.length; j++) {
			for (let k = 0; k < dataObstacle[j].length; k++) {
				if (snakes[i].head.x == dataObstacle[j][k].x && snakes[i].head.y == dataObstacle[j][k].y) {
					isCollide = true;
					audioBlockHit.play();
				}
			}
		}
	}

	if (isCollide) {
		snake1 = initSnake();
		life--;
		if (life < 1) {
			audioGameOver.play();
			alert('Game over');
			life = 3;
			score = 0;
			currentMoveInterval = moveInterval;
			level = 1;
			updateHtml();
			dataObstacle = [];
		} else {
			alert(`Nyawa anda tersisa ${life}`);
		}
		updateLifeHtml();
	}
	return isCollide;
}

function move(snake) {
	switch (snake.direction) {
		case DIRECTION.LEFT:
			moveLeft(snake);
			break;
		case DIRECTION.RIGHT:
			moveRight(snake);
			break;
		case DIRECTION.DOWN:
			moveDown(snake);
			break;
		case DIRECTION.UP:
			moveUp(snake);
			break;
	}
	moveBody(snake);
	if (!checkCollision([snake1])) {
		setTimeout(function () {
			move(snake);
		}, currentMoveInterval);
	} else {
		initGame();
	}
}

function moveBody(snake) {
	snake.body.unshift({ x: snake.head.x, y: snake.head.y });
	snake.body.pop();
}

function turn(snake, direction) {
	const oppositeDirections = {
		[DIRECTION.LEFT]: DIRECTION.RIGHT,
		[DIRECTION.RIGHT]: DIRECTION.LEFT,
		[DIRECTION.DOWN]: DIRECTION.UP,
		[DIRECTION.UP]: DIRECTION.DOWN,
	};

	if (direction !== oppositeDirections[snake.direction]) {
		snake.direction = direction;
	}
}

document.addEventListener('keydown', function (event) {
	if (event.key === 'ArrowLeft') {
		turn(snake1, DIRECTION.LEFT);
	} else if (event.key === 'ArrowRight') {
		turn(snake1, DIRECTION.RIGHT);
	} else if (event.key === 'ArrowUp') {
		turn(snake1, DIRECTION.UP);
	} else if (event.key === 'ArrowDown') {
		turn(snake1, DIRECTION.DOWN);
	}
});

function initGame() {
	move(snake1);
}

initGame();
