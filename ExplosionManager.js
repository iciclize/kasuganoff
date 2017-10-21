var PARTICLE_HUE_RANGE_BEGIN  = 0;
var PARTICLE_HUE_RANGE_END    = 30;
var PARTICLE_VELOCITY_RANGE   = 14;
var PARTICLE_RADIUS           = 7;
var PARTICLE_NOIZE_RANGE      = 12;
var PARTICLE_NUM = 4;

phina.define('ExplosionManager', {
  init: function(display) {
    this.explosions = [];
    this.display = display;
  },

  fire: function(x, y) {
    var explosion = Explosion(x, y, this.display);
    this.explosions.push(explosion);
  },

  update: function() {
    this.explosions = this.explosions.filter(function(e) {
      return e.update();
    });
  }

});

phina.define('Explosion', {

  init: function(x, y, display) {
    this.particles = DisplayElement().addChildTo(display);
    this.x = x;
    this.y = y;
    this.emitted = 0;
  },

  update: function() {
    if (this.emitted >= PARTICLE_NUM && this.particles.children.length <= 0) {
      return false;
    }

    var emit = Math.min(2, PARTICLE_NUM - this.emitted);
    (emit).times(function() {
      var p = Particle(this.x, this.y);
      p.addChildTo(this.particles);
    }, this);
    this.emitted += emit;
    
    return true;
  }

});

phina.define('Particle', {  
  superClass: 'CircleShape',

  init: function(x, y) {
    this.superInit({
      stroke: false,
      radius: PARTICLE_RADIUS,
    });

    this.hue = Math.randint(PARTICLE_HUE_RANGE_BEGIN, PARTICLE_HUE_RANGE_END);
    
    this.gradients = (function() {
      var _gradients = [];

      var fire = this.canvas.context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
      fire.addColorStop(0, 'hsla({0}, 75%, 60%, 1.0)'.format(Math.randint(PARTICLE_HUE_RANGE_BEGIN, PARTICLE_HUE_RANGE_END)));
      fire.addColorStop(1, 'hsla({0}, 75%, 60%, 0.0)'.format(Math.randint(PARTICLE_HUE_RANGE_BEGIN, PARTICLE_HUE_RANGE_END)));
      
      var ash1 = this.canvas.context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
      ash1.addColorStop(0, 'hsla({0}, {1}%, {2}%, 1.0)'.format(this.hue, 20, 30) );
      ash1.addColorStop(1, 'hsla({0}, {1}%, {2}%, 0.0)'.format(this.hue, 20, 30) );

      var ash2 = this.canvas.context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
      ash2.addColorStop(0, 'hsla({0}, {1}%, {2}%, 1.0)'.format(this.hue, 0, 10) );
      ash2.addColorStop(1, 'hsla({0}, {1}%, {2}%, 0.0)'.format(this.hue, 0, 10) );
      
      _gradients.push(fire, ash1, ash2);

      return _gradients;
    }).call(this);

    this.blendMode = 'lighter';
    this.fill = this.gradients[0];
    this.velocity = Vector2();
    this.x = Math.randint(x - PARTICLE_NOIZE_RANGE, x + PARTICLE_NOIZE_RANGE);
    this.y = Math.randint(y - PARTICLE_NOIZE_RANGE, y + PARTICLE_NOIZE_RANGE);
    this.velocity = Vector2.random(0, 360, Math.randfloat(0, PARTICLE_VELOCITY_RANGE));
    this.scaleX = 6.4;
    this.scaleY = 6.4;
    this.a = 0;
  },

  update: function() {
    this.a += .16;
    this.position.add(this.velocity);
    this.velocity = this.velocity.fromDegree(this.velocity.toDegree(), this.velocity.length() * .8);
    this.scaleX -= this.a;
    this.scaleY -= this.a;

    if (this.scaleX <= 1.4) {
      if (this.fill != this.gradients[2])
        this.fill = this.gradients[2];
    } else if (this.scaleX <= 5.7) {
      if (this.fill != this.gradients[1])
        this.fill = this.gradients[1];
    }

    if (this.scaleX < 0) {
      this.remove();
    }
  },

});
