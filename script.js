var ctx = myCanvas.getContext('2d');
var FPS = 40;
var jump_amount = -10;
var max_fall_speed = +10;
var acceleration = 1;
var pipe_speed = -2;
var game_mode = 'prestart';
var time_game_last_running;
var bottom_bar_offset = 0;
var pipes = [];
var pipeWidthGap = 150;
var numOfPipes = 15;
var pipeXcoordinatePlace = 500;

function MySprite(img_url) {
  this.x = 0;
  this.y = 0;
  this.visible = true;
  this.velocity_x = 0;
  this.velocity_y = 0;
  this.MyImg = new Image();
  this.MyImg.src = img_url || '';
  this.angle = 0;
  this.flipV = false;
  this.flipH = false;
}

MySprite.prototype.Do_Frame_Things = function () {
  ctx.save();
  ctx.translate(this.x + this.MyImg.width / 2, this.y + this.MyImg.height / 2);
  ctx.rotate((this.angle * Math.PI) / 180);
  if (this.flipV) ctx.scale(1, -1);
  if (this.flipH) ctx.scale(-1, 1);
  if (this.visible)
    ctx.drawImage(this.MyImg, -this.MyImg.width / 2, -this.MyImg.height / 2);
  this.x = this.x + this.velocity_x;
  this.y = this.y + this.velocity_y;
  ctx.restore();
};

function ImagesTouching(thing1, thing2) {
  if (!thing1.visible || !thing2.visible) return false;
  if (
    thing1.x >= thing2.x + thing2.MyImg.width ||
    thing1.x + thing1.MyImg.width <= thing2.x
  )
    return false;
  if (
    thing1.y >= thing2.y + thing2.MyImg.height ||
    thing1.y + thing1.MyImg.height <= thing2.y
  )
    return false;
  return true;
}

function Got_Player_Input(MyEvent) {
  switch (game_mode) {
    case 'prestart': {
      game_mode = 'running';
      break;
    }
    case 'running': {
      bird.velocity_y = jump_amount;
      break;
    }
    case 'over':
      if (new Date() - time_game_last_running > 1000) {
        reset_game();
        game_mode = 'running';
        break;
      }
  }
  MyEvent.preventDefault();
}

addEventListener('touchstart', Got_Player_Input);
addEventListener('mousedown', Got_Player_Input);
addEventListener('keydown', Got_Player_Input);

function make_bird_slow_and_fall() {
  if (bird.velocity_y < max_fall_speed) {
    bird.velocity_y = bird.velocity_y + acceleration;
  }
  if (bird.y > myCanvas.height - bird.MyImg.height) {
    bird.velocity_y = 0;
    game_mode = 'over';
  }
  if (bird.y < 0 - bird.MyImg.height) {
    bird.velocity_y = 0;
    game_mode = 'over';
  }
}

function add_pipe(x_pos, top_of_gap, gap_width) {
  var top_pipe = new MySprite();
  top_pipe.MyImg = pipe_piece;
  top_pipe.x = x_pos;
  top_pipe.y = top_of_gap - pipe_piece.height;
  top_pipe.velocity_x = pipe_speed;
	pipes.push(top_pipe);
	
  var bottom_pipe = new MySprite();
  bottom_pipe.MyImg = pipe_piece;
  bottom_pipe.flipV = true;
  bottom_pipe.x = x_pos;
  bottom_pipe.y = top_of_gap + gap_width;
  bottom_pipe.velocity_x = pipe_speed;
  pipes.push(bottom_pipe);
}

function make_bird_tilt_appropriately() {
  if (bird.velocity_y < 0) {
    bird.angle = -15;
  } else if (bird.angle < 70) {
    bird.angle = bird.angle + 4;
  }
}

function show_the_pipes() {
  for (var i = 0; i < pipes.length; i++) {
    pipes[i].Do_Frame_Things();
  }
}

function check_for_end_game() {
  for (var i = 0; i < pipes.length; i++)
    if (ImagesTouching(bird, pipes[i])) game_mode = 'over';
}

function display_intro_instructions() {
  ctx.font = '25px Arial';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Press, touch or click to start',
    myCanvas.width / 2,
    myCanvas.height / 4
  );
}

function display_game_over() {
  var score = 0;
  for (var i = 0; i < pipes.length; i++)
    if (pipes[i].x < bird.x) score = score + 0.5;
  ctx.font = '30px Arial';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', myCanvas.width / 2, 100);
  ctx.fillText('Score: ' + score, myCanvas.width / 2, 150);
  ctx.font = '20px Arial';
  ctx.fillText('Click, touch, or press to play again', myCanvas.width / 2, 300);
}

function display_bar_running_along_bottom() {
  if (bottom_bar_offset < -23) bottom_bar_offset = 0;
  ctx.drawImage(
    bottom_bar,
    bottom_bar_offset,
    myCanvas.height - bottom_bar.height
  );
}

function reset_game() {
  bird.y = myCanvas.height / 2;
  bird.angle = 0;
  pipes = []; // erase all the pipes from the array
  add_all_my_pipes(); // and load them back in their starting positions
}

function getRndInteger(minValue, maxValue){
	return Math.floor(Math.random() * (maxValue-minValue+1)) + minValue;
}

function add_all_my_pipes() {
	for(let i=0;i<=numOfPipes;++i){
		add_pipe(pipeXcoordinatePlace, getRndInteger(30, 300), pipeWidthGap-(i*6)); // I used decrement 6 value cause it works totally Fine!
		pipeXcoordinatePlace += getRndInteger(200, 300); // this gives a random next location for pipes...making it even more challenging!
	}

	var finish_line = new MySprite('http://s2js.com/img/etc/flappyend.png');
	finish_line.x = pipeXcoordinatePlace + getRndInteger(300, 400);
	finish_line.velocity_x = pipe_speed;
	pipes.push(finish_line);

	pipeXcoordinatePlace = 500; // Again reset the value for next Run
}

var pipe_piece = new Image();
pipe_piece.onload = add_all_my_pipes;
pipe_piece.src = 'http://s2js.com/img/etc/flappypipe.png';

function Do_a_Frame() {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  bird.Do_Frame_Things();
  display_bar_running_along_bottom();
  switch (game_mode) {
    case 'prestart': {
      display_intro_instructions();
      break;
    }
    case 'running': {
      time_game_last_running = new Date();
      bottom_bar_offset = bottom_bar_offset + pipe_speed;
      show_the_pipes();
      make_bird_tilt_appropriately();
      make_bird_slow_and_fall();
      check_for_end_game();
      break;
    }
    case 'over': {
      make_bird_slow_and_fall();
      display_game_over();
      break;
    }
  }
}

var bottom_bar = new Image();
bottom_bar.src = 'http://s2js.com/img/etc/flappybottom.png';

var bird = new MySprite('flappy.png');
bird.x = myCanvas.width / 3;
bird.y = myCanvas.height / 2;

setInterval(Do_a_Frame, 1000 / FPS);
var flapSound = document.getElementById("flapSound");

function flapBird() {
  // Play the flap sound when the bird flaps
  flapSound.play();
  // Other code for bird flapping
}

var flapSound = new Audio("flap.mp3");
var scoreSound = new Audio("score.mp3");
var collisionSound = new Audio("collision.mp3");

// Preload audio
flapSound.load();
scoreSound.load();
collisionSound.load();
