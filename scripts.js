
const canvas = document.getElementById('game');
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;
const context = canvas.getContext('2d');
const gameStart = document.getElementById('startScreen');
const gameoverscreen = document.getElementById('gameover');

var paddleSpeed = 6;
var ballSpeed = 0;
var score1 = 0;
var score2 = 0;
//Added Vars - Taitt Estes
var gameOverScreen;
var gg = "Game Over"; 
var animation;
//var playAgain = "Play Again? (Y)";

var wallSound = new Audio('pong.mp3');
var gameoverSound = new Audio('Game over.mp3');
var paddleSound = new Audio('hit.mp3');
var speedMultiplier = .5;

const leftPaddle = {
  // start in the middle of the game on the left side
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};
const rightPaddle = {
  // start in the middle of the game on the right side
  x: canvas.width - grid * 3,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};
const ball = {
  // start in the middle of the game
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: grid,
  height: grid,

  // keep track of when need to reset the ball position
  resetting: false,

  // ball velocity (start going to the top-right corner)
  dx: ballSpeed,
  dy: -ballSpeed
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

function startGame(a){
  gameStart.style.display = "none";
  gameoverscreen.style.display = "none";
  canvas.style.display = "flex";
  ballSpeed = 5;
	
  if(a == 1){
    speedMultiplier = .6;
  }
  if(a == 2){
    speedMultiplier = .75;
  }
  if(a == 3){
    speedMultiplier = .9;
  }
  score1 = 0;
  score2 = 0;
}

// game loop
function loop() {
  animation = requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);

  //add gameover tool. - Taitt Estes
  if(score1 === 7 || score2 === 7){
  	cancelAnimationFrame(animation);
    gameoverSound.play();
  	gameover();
  }

  // move paddles by their velocity
 
  //New Code is the BOT's functions to attempt tracing the ball. - Taitt Estes
  if(leftPaddle.y < ball.y){
    leftPaddle.dy = speedMultiplier*paddleSpeed;
  }
  	if(leftPaddle.y > ball.y){
      leftPaddle.dy = -speedMultiplier*paddleSpeed;
  }  
  leftPaddle.y += leftPaddle.dy;
  
  rightPaddle.y += rightPaddle.dy;

  // prevent paddles from going through walls
  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  }
  else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  }
  else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }
  
  // draw paddles
  context.fillStyle = 'pink';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // move ball by its velocity
  ball.x += ball.dx;
  ball.y += ball.dy;

  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  }
  else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }

  //sound
  if (ball.x < 0 || ball.x > canvas.width) {
    wallSound.play();
    ball.vx = -ball.vx;
  }
  

  // reset ball if it goes past paddle (but only if we haven't already done so)
  if ( (ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;
    // if player 1 hits ball past player 2
       if(ball.x > canvas.width){
          score1++;
       }  
       // if player 2 hits ball by player 1
       else if(ball.x < 0){
          score2++;
       }
    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 400);
  }

  // check to see if ball collides with paddle. if they do change x velocity
  if (collides(ball, leftPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = leftPaddle.x + leftPaddle.width;
    paddleSound.play();
  }
  else if (collides(ball, rightPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = rightPaddle.x - ball.width;
    paddleSound.play();
  }

  // score
  context.font = '65px serif';
  context.fillText(score1, 100, 70);
  context.fillText(score2, 660, 70);
  
  // draw ball
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // draw walls
  context.fillStyle = 'rgb(255, 127, 80)';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

  // draw dotted line down the middle
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}

// listen to keyboard events to move the paddles
document.addEventListener('keydown', function(e) {

  // up arrow key
  if (e.which === 38) {
    rightPaddle.dy = -paddleSpeed;
  }
  // down arrow key
  else if (e.which === 40) {
    rightPaddle.dy = paddleSpeed;
  }
});

// listen to keyboard events to stop the paddle if key is released
document.addEventListener('keyup', function(e) {
  if (e.which === 38 || e.which === 40) {
    rightPaddle.dy = 0;
  }

  if (e.which === 83 || e.which === 87) {
    leftPaddle.dy = 0;
  }
});
// start the game
animation = requestAnimationFrame(loop);

//Added Gameover Function after 7 scores from either.
function gameover(){
    canvas.style.display = 'none';
    gameoverscreen.style.display = 'block';
  //	context.fillStyle = 'blue';
  	//context.fillRect(91, 147, 560, 293);
    ballSpeed = 0;
  
    context.fillStyle = 'White';
  	context.font = '65px serif';
  	context.fillText(gg, 230, 270);
    context.fillText(playAgain,170,350);
    document.addEventListener('keydown', function(e) {
    
  	if (e.which === 89) {
    		location.reload();
    	}
	});
}
