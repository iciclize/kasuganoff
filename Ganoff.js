phina.define('Ganoff', {
  superClass: 'Sprite',
  init: function() {
    this.superInit('ganoff', 500, 500);
    this.width = GANOFF_WIDTH;
    this.height =GANOFF_HEIGHT;
    this.setPosition(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    this.speed = 0;
    this.deceleration = Ganoff.brakeFn;
    this.direction = Vector2(0, 1).normalize();
  },

  update: function() {
    (this.speed).times(function() {
      this.move();
      this.wallReflection();
    }, this);
    this.speed -= this.deceleration(this.speed);
  },

  wallReflection: function() {
    if (this.left < 0) {
      this.left = 0;
      this.direction.x *= -1;
    } else if (this.right > SCREEN_WIDTH) {
      this.right = SCREEN_WIDTH;
      this.direction.x *= -1;
    }
    if (this.top < BOARD_OFFSET_Y - 50) {
      this.top = BOARD_OFFSET_Y - 50;
      this.direction.y *= -1;
    } else if (this.bottom > SCREEN_HEIGHT) {
      this.bottom = SCREEN_HEIGHT;
      this.direction.y *= -1;
    }
  },

  move: function() {
    this.x += this.direction.x;
    this.y += this.direction.y;
  },

  setVector: function(vector) {
    this.speed = vector.length() * 1.2;
    this.direction = vector.normalize();
  }, 
  _static: {
    brakeFn: function(speed) {
      return .003 * speed + .01;
    }
  }

});
