/*
 * runstant
 */

phina.globalize();

var SHARE_URL = 'http://phiary.me/phina-js-breakout/';  
var SHARE_MESSAGE = 'phina.js でブロック崩しを作ろう!!\nSCORE:{score}';  
var SHARE_HASH_TAGS = 'breakout,phina_js';

var SCREEN_WIDTH    = 514;  
var SCREEN_HEIGHT   = 893;  
var MAX_PER_LINE    = 7;  
var BIKE_SIZE      = 92;  
var BIKE_NUM       = MAX_PER_LINE * Math.ceil(SCREEN_HEIGHT / BIKE_SIZE);  
var BOARD_PADDING   = 10;

var BOARD_SIZE      = SCREEN_WIDTH - BOARD_PADDING*2;  
var BOARD_OFFSET_X  = BOARD_PADDING+BIKE_SIZE/2;  
var BOARD_OFFSET_Y  = 120;

const ASSETS = {
  image: {
    "ganoff": "./assets/ganoff.png",
    "bike": "./assets/bike.png"
  }
};

phina.define("MainScene", {  
  superClass: 'DisplayScene',

  init: function(options) {
    this.superInit(options);

    // スコアラベル
    this.scoreLabel = Label('0').addChildTo(this);
    this.scoreLabel.x = this.gridX.center();
    this.scoreLabel.y = this.gridY.span(1);
    this.scoreLabel.fill = 'black';

    // グループ
    this.bikes = DisplayElement().addChildTo(this);

    var gridX = Grid(BOARD_SIZE, MAX_PER_LINE);
    var gridY = Grid(BOARD_SIZE, MAX_PER_LINE);

    var self = this;

    (BIKE_NUM).times(function(i) {
      // グリッド上でのインデックス
      var xIndex = i%MAX_PER_LINE;
      var yIndex = Math.floor(i/MAX_PER_LINE);
      var angle = (360)/BIKE_NUM*i;
      var bike = Bike(angle).addChildTo(this.bikes).setPosition(100, 100);

      bike.x = gridX.span(xIndex) + BOARD_OFFSET_X;
      bike.y = gridY.span(yIndex)+BOARD_OFFSET_Y;
    }, this);

    // タッチでゲーム開始
    this.one('pointend', function() {

    });

    // スコア
    this.score = 0;
    // 時間
    this.time = 0;
    // コンボ
    this.combo = 0;
    
    var label = phina.display.Label(320).addChildTo(this);
    label.setPosition(60, 40);
    this.label = label;

    let ganoff = Ganoff().addChildTo(this);
    this.ganoff = ganoff;

    this.explosionManager = ExplosionManager(this);
  },

  update: function(app) {

    this.explosionManager.update();

    // タイムを加算
    this.time += app.deltaTime;

    // ブロックがすべてなくなったらクリア
    if (this.bikes.children.length <= 0) {
      this.gameclear();
    }

    var pointer = app.pointer;
    
    if (pointer.getPointingEnd()) {
      this.label.text = pointer.flickVelocity.toAngle().toDegree().floor();
      let input = Vector2(pointer.fx, pointer.fy);
      this.ganoff.setVector(input);
    }

    if (pointer.getPointingStart()) {
      this.explosionManager.fire(app.pointer.x, app.pointer.y);
    }

    this.bikes.children.each(function(bike) {
      if (this.ganoff.hitTestElement(bike)) {
        if (!bike.broken) {
          bike.broken = true;
          this.explosionManager.fire(bike.x, bike.y);
          bike.remove();
        }
      }
    }, this);

  },

  checkHit: function() {
    this.bikes.children.some(function(bike) {
        return true;
    }, this);
  },

  gameclear: function() {
    // add clear bonus
    var bonus = 2000;
    this.score += bonus;

    // add time bonus
    var seconds = (this.time/1000).floor();
    var bonusTime = Math.max(60*10-seconds, 0);
    this.score += (bonusTime*10);

    this.gameover();
  },

  gameover: function() {
    this.exit({
      score: this.score,
      message: SHARE_MESSAGE,
      url: SHARE_URL,
      hashtags: SHARE_HASH_TAGS
    });
  },

  _accessor: {
    score: {
      get: function() {
        return this._score;
      },
      set: function(v) {
        this._score = v;
        this.scoreLabel.text = v;
      },
    },
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
    this.direction = Vector2(0, 1).normalize();
  },

  update: function() {
    (this.speed).times(function() {
      this.move();
      this.wallReflection();
    }, this);
    this.speed -= this._static.brakeFn(this.speed);
  },

  wallReflection: function() {
    if (this.left < 0) {
      this.left = 0;
      this.direction.x *= -1;
    } else if (this.right > SCREEN_WIDTH) {
      this.right = SCREEN_WIDTH;
      this.direction.x *= -1;
    }
    if (this.top < 0) {
      this.top = 0;
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

/*
 * ブロック
 */
phina.define('Bike', {  
  superClass: 'Sprite',

  init: function() {
    this.superInit('bike', 500, 500);
    this.width = BIKE_SIZE -5;
    this.height = BIKE_SIZE -5;
    this.broken = false;
  }

});

/*
 * コンボラベル
 */
phina.define('ComboLabel', {  
  superClass: 'Label',
  init: function(num) {
    this.superInit(num + ' combo!');

    this.stroke = 'black';
    this.strokeWidth = 8;

    // 数によって色とサイズを分岐
    if (num < 5) {
      this.fill = 'hsl(40, 60%, 60%)';
      this.fontSize = 16;
    }
    else if (num < 10) {
      this.fill = 'hsl(120, 60%, 60%)';
      this.fontSize = 32;
    }
    else {
      this.fill = 'hsl(220, 60%, 60%)';
      this.fontSize = 48;
    }

    // フェードアウトして削除
    this.tweener
      .by({
        alpha: -1,
        y: -50,
      })
      .call(function() {
        this.remove();
      }, this)
      ;
  },
});

phina.define('ExplosionManager', {
  init: function(display) {
    this.explosions = [];
    this.display = display;
  },

  fire: function(x, y) {
    this.explosions.push(Explosion(x, y, this.display));
  },

  update: function() {
    this.explosions = this.explosions.filter(function(e) {
      return e.update();
    });
  }

});

var PARTICLE_NUM = 10;
phina.define('Explosion', {

  init: function(x, y, display) {
    this.particles = DisplayElement().addChildTo(display);
    this.x = x;
    this.y = y;
    this.emitted = 0;
  },

  update: function() {
    if (this.emitted >= PARTICLE_NUM && this.particles.children.length <= 0)
      return false;

    var emit = Math.min(2, PARTICLE_NUM - this.emitted);

    (emit).times(function() {
      var p = Particle(this.x, this.y);
      p.on('disappear', p.remove);
      p.addChildTo(this.particles);
    }, this);
    this.emitted += emit;
    
    return true;
  }

});

var PARTICLE_HUE_RANGE_BEGIN  = 0;
var PARTICLE_HUE_RANGE_END    = 30;
var PARTICLE_VELOCITY_RANGE   = 14;
var PARTICLE_RADIUS           = 28;
var PARTICLE_NOIZE_RANGE      = 18;

phina.define('Particle', {  
  superClass: 'CircleShape',

  init: function(x, y) {
    this.superInit({
      stroke: false,
      radius: PARTICLE_RADIUS,
    });

    this.blendMode = 'lighter';
    this.hue = Math.randint(PARTICLE_HUE_RANGE_BEGIN, PARTICLE_HUE_RANGE_END);
    this.fill = (function() {
      var g = this.canvas.context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
      g.addColorStop(0, 'hsla({0}, 75%, 50%, 1.0)'.format(Math.randint(PARTICLE_HUE_RANGE_BEGIN, PARTICLE_HUE_RANGE_END)));
      g.addColorStop(1, 'hsla({0}, 75%, 50%, 0.0)'.format(Math.randint(PARTICLE_HUE_RANGE_BEGIN, PARTICLE_HUE_RANGE_END)));
      return g;
    }).call(this);

    this.velocity = Vector2();
    this.x = Math.randint(x - PARTICLE_NOIZE_RANGE, x + PARTICLE_NOIZE_RANGE);
    this.y = Math.randint(y - PARTICLE_NOIZE_RANGE, y + PARTICLE_NOIZE_RANGE);
    this.velocity = Vector2.random(0, 360, Math.randfloat(0, PARTICLE_VELOCITY_RANGE));
    this.scaleX = 1.4;
    this.scaleY = 1.4;
    this.a = 0;
  },

  update: function() {
    this.a += .04;
    this.position.add(this.velocity);
    this.velocity = this.velocity.fromDegree(this.velocity.toDegree(), this.velocity.length() * .8);
    this.scaleX -= this.a;
    this.scaleY -= this.a;
    if (this.scaleX <= 1.16) {
    this.fill = (function() {
        var g = this.canvas.context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        g.addColorStop(0, 'hsla({0}, {1}%, {2}%, 1.0)'.format(this.hue, 40 * this.scaleX, 30 * this.scaleX));
        g.addColorStop(1, 'hsla({0}, {1}%, {2}%, 0.0)'.format(this.hue, 40 * this.scaleX, 30 * this.scaleX));
        return g;
      }).call(this);
    }

    if (this.scaleX < 0) {
      this.flare('disappear');
    }
  }
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
