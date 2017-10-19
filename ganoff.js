/*
 * runstant
 */

// ガノフが範囲外を飛んでいる

phina.globalize();

var SHARE_URL = 'http://iciclize.net:8080';  
var SHARE_MESSAGE = 'やったぜ。';  
var SHARE_HASH_TAGS = '春日ビーフストロガノフ,春日ビーフ,雙峰祭,筑波大学,雙峰祭';

var SCREEN_WIDTH    = 514;  
var SCREEN_HEIGHT   = 893;  
var MAX_PER_LINE    = 7;  
var OBJECT_SIZE     = 92;  
var BOARD_PADDING   = 10;
var BOARD_WIDTH     = SCREEN_WIDTH - BOARD_PADDING*2;  
var BOARD_HEIGHT    = SCREEN_HEIGHT - BOARD_PADDING*2;
var BOARD_OFFSET_X  = BOARD_PADDING+OBJECT_SIZE/2 - 2;  
var BOARD_OFFSET_Y  = 140;
var TYPE_INIT  = 0;
var TYPE_BLANK = 1;
var TYPE_BIKE  = 2;
var TYPE_BOMB  = 3;
var TYPE_BREAD = 4;
var TYPE_BEEF  = 5;

var PROB_BOMB  = 50;
var PROB_BEEF  = 40;
var PROB_BREAD = 10;


const ASSETS = {
  image: {
    'ganoff': './assets/ganoff.png',
    'bike': './assets/bike.png',
    'beef': './assets/beef.png',
    'bread': './assets/bread.png',
    'bomb': './assets/bomb.png'
  },
  sound: {
    'exp': './explosion.mp3'
  }
};

phina.define("MainScene", {  
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit(options);

    var gameObjects = DisplayElement().addChildTo(this);
    var board = {
      gridX: Grid( BOARD_WIDTH, Math.ceil(BOARD_WIDTH / OBJECT_SIZE) + 1 ),
      gridY: Grid( BOARD_HEIGHT - BOARD_OFFSET_Y, Math.ceil(BOARD_HEIGHT / OBJECT_SIZE) )
    };
    var ganoff = Ganoff().addChildTo(this);
    var explosionManager = ExplosionManager(this);
    var map = Array.apply(null, Array(board.gridY.columns * board.gridX.columns)).map(function(){ return TYPE_INIT });
    var objectManager = ObjectManager(board, map, gameObjects, ganoff);

    this.gameObjects = gameObjects;
    this.board = board;
    this.ganoff = ganoff;
    this.explosionManager = explosionManager;
    this.map = map;
    this.objectManager = objectManager;
    
    this.scoreLabel = Label('0').setPosition(this.gridX.center(), this.gridY.span(1) - 10).addChildTo(this);
    this.scoreLabel.fill = 'black';

    this.score = 0;

    this.flag = false;
  },

  update: function(app) {
    this.explosionManager.update();
    
    this.gameObjects.children.each(function(obj) {
      if (obj.touched) {
        if (obj.type == TYPE_BEEF) this.big();
        else if (obj.type == TYPE_BREAD) this.fast();
        else if (obj.type == TYPE_BOMB) this.bomb();
      }
    }, this);
    
    this.objectManager.update();

    this.gameObjects.children.each(function(obj) {
      if (this.ganoff.hitTestElement(obj))
        if (obj.type == TYPE_BIKE)
          if (this.objectManager.hit(obj)) {
            SoundManager.play('exp');
            this.explosionManager.fire(obj.x, obj.y);
            this.score += 1;
          }
    }, this);

    var pointer = app.pointer;
    
    if (pointer.getPointingEnd()) {
      if (this.flag) return;
      let input = Vector2(pointer.fx, pointer.fy);
      this.ganoff.setVector(input);
      this.flag = true;
    }

    if (this.flag)
      if (this.ganoff.speed <= 0) this.gameover();

  },
  bomb: function() {
    this.gameObjects.children.each(function(obj) {
      if (obj.type == TYPE_BIKE) {
        this.explosionManager.fire(obj.x, obj.y);
        this.objectManager.hit(obj);
        this.score += 1;
      }
    }, this);
  },
  _bigNum: 0,
  big: function() {
    /* 随分乱暴な書き方をしてるけど動くからま、多少はね？ */
    this._bigNum++;
    if (this._bigNum > 1) return;
    var o = { width: this.ganoff.width, height: this.ganoff.height };
    var self = this;
    this.ganoff.tweener
      .to({ width: o.width * 3, height: o.height * 3 }, 300)
      .wait(4000)
      .call(check).play();
    function check() {
      self._bigNum--;
      if (self._bigNum > 0)
        self.ganoff.tweener.wait(4000).call(check).play();
      else
        self.ganoff.tweener.to({ width: o.width, height: o.height }, 300).play();
    }
  },
  _fastNum: 0,
  fast: function() {
    this._fastNum++;
    if (this._fastNum > 1) return;
    var o = { speed: this.ganoff.speed, deceleration: this.ganoff.deceleration };
    var self = this;
    this.ganoff.speed = 170;
    this.ganoff.deceleration = function() { return 0; };
    this.ganoff.tweener2 = phina.accessory.Tweener().attachTo(this.ganoff);
    this.ganoff.tweener2.wait(4000).call(check).play();
    function check() {
      self._fastNum--;
      if (self._fastNum > 0) {
        self.ganoff.tweener2.wait(4000).call(check).play();
      } else {
        self.ganoff.speed = o.speed;
        self.ganoff.deceleration = o.deceleration;
      }
    }
  },

  gameover: function() {
    this.exit({
      score: this.score + '点',
      message: SHARE_MESSAGE,
      url: SHARE_URL,
      hashtags: SHARE_HASH_TAGS
    });
  },

  _accessor: {
    score: {
      get: function() { return this._score; },
      set: function(v) {
        this._score = v;
        this.scoreLabel.text = v;
      },
    },
  }

});

phina.define('ObjectManager', {
  init: function(grids, map, container, ganoff) {
    this.grids = grids;
    this.ganoff = ganoff;
    this.objects = container;
    this.counter = 0;
    this.map = (function() {
      // もしここでArray.prototype.mapを使うと呼び出し元の変数mapへの参照が切れるのでしてはいけない(戒め)
      for (var i = 0; i < map.length; i++) {
        map[i] = this.arrange(Blank(0, true), i);
      }
      return map;
    }.call(this));
  },
  arrange: function(obj, index) {
    var gx = this.grids.gridX;
    var gy = this.grids.gridY;
    var x = gx.span(index % gx.columns) + BOARD_OFFSET_X;
    var y = gy.span(Math.floor(index / gx.columns)) + BOARD_OFFSET_Y;
    var sx = Math.randint(-7, +7);
    var sy = Math.randint(-7, +7);
    obj.setPosition(x + sx, y + sy).addChildTo(this.objects);
    return obj;
  },
  hit: function(obj) {
    if (this.ganoff.speed == 0) {
      obj.remove();
      this.map[this.map.indexOf(obj)] = this.arrange(Blank(0), this.map.indexOf(obj));
      return false;
    }
    if (obj.type == TYPE_BIKE)
      obj.crashed = true;
    return true;
  },
  update: function() {
    this.map = this.map.map(function(obj, i){
      switch(obj.type) {
        case TYPE_BIKE:
          if (obj.crashed) {
            obj.remove();
            return this.arrange(Blank(), i);
          }
          break;

        case TYPE_BLANK:
          if (obj.tick()) break;
          if (this.ganoff.hitTestElement(obj)) break;
          if (obj.bikeonly) return this.arrange(Bike(), i);
          var p = Math.random() * 10000;
          if (p <= PROB_BOMB) {
            return this.arrange(Bomb(), i);
          } else if (p <= PROB_BREAD + PROB_BOMB) {
            return this.arrange(Bread(), i);
          } else if (p <= PROB_BEEF + PROB_BOMB + PROB_BREAD) {
            return this.arrange(Beef(), i);
          } else {
              return this.arrange(Bike(), i);
          }
          break;

        case TYPE_BEEF:
        case TYPE_BREAD:
        case TYPE_BOMB:
          if (obj.touched) {
            obj.remove();
            return this.arrange(Blank(), i);
          }
          if (obj.tick()) break;
          obj.remove();
          return this.arrange(Blank(), i);
          break;
      }
      return obj;
    }, this);
  }
});

phina.define('Ganoff', {
  superClass: 'Sprite',
  init: function() {
    this.superInit('ganoff', 500, 500);
    this.width = 496 * .17;
    this.height = 254 * .17;
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


phina.define('GameObject', {
  superClass: 'Sprite',
  init: function(type, sprite) {
    this.superInit(sprite, 500, 500);
    this.type = type;
    this.width = OBJECT_SIZE - 5;
    this.height = OBJECT_SIZE - 5;
  }
});

phina.define('Blank', {
  superClass: 'phina.app.Object2D',
  init: function(time, bikeonly) {
    this.superInit();
    this.type = TYPE_BLANK;
    this.width = OBJECT_SIZE - 5;
    this.height = OBJECT_SIZE - 5;
    this.bikeonly = (typeof(bikeonly)) ? bikeonly : false;
    this.timer = (Blank.isNumeric(time)) ? time : 30;
  },
  tick: function() {
    return (--this.timer > 0) ? true : false;
  },
  _static: {
    isNumeric: function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
  }
});

phina.define('ItemObject', {
  superClass: 'GameObject',
  init: function(type, sprite) {
    this.superInit(type, sprite);
    this.timer = 60;
    this.setInteractive(true);
    this.touched = false;
    this.on('pointstart', function() {
      this.touched = true;
    }, this);
  },
  tick: function() {
    return (--this.timer > 0) ? true : false;
  }
});

phina.define('Bike', {  
  superClass: 'GameObject',
  init: function() {
    this.superInit(TYPE_BIKE, 'bike');
    this.crashed = false;
  }
});

phina.define('Beef', {
  superClass: 'ItemObject',
  init: function() {
    this.superInit(TYPE_BEEF, 'beef');
  }
});

phina.define('Bomb', {
  superClass: 'ItemObject',
  init: function() {
    this.superInit(TYPE_BOMB, 'bomb');
  }
});

phina.define('Bread', {
  superClass: 'ItemObject',
  init: function() {
    this.superInit(TYPE_BREAD, 'bread');
  }
});

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

var PARTICLE_NUM = 5;
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

var PARTICLE_HUE_RANGE_BEGIN  = 0;
var PARTICLE_HUE_RANGE_END    = 30;
var PARTICLE_VELOCITY_RANGE   = 14;
var PARTICLE_RADIUS           = 7;
var PARTICLE_NOIZE_RANGE      = 12;

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



phina.main(function() {  
  var app = GameApp({
    title: 'Breakout',
    startLabel: location.search.substr(1).toObject().scene || 'title',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    assets: ASSETS
  });

  app.fps = 30;

  app.enableStats();

  app.run();
});
