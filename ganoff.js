/*
 * runstant
 */

phina.globalize();

var SHARE_URL = 'http://phiary.me/phina-js-breakout/';  
var SHARE_MESSAGE = 'phina.js でブロック崩しを作ろう!!\nSCORE:{score}';  
var SHARE_HASH_TAGS = 'breakout,phina_js';

var SCREEN_WIDTH    = 810;  
var SCREEN_HEIGHT   = 1145;  
var MAX_PER_LINE    = 8;  
var BIKE_NUM       = MAX_PER_LINE*5;  
var BIKE_SIZE      = 64;  
var BOARD_PADDING   = 50;

var BOARD_SIZE      = SCREEN_WIDTH - BOARD_PADDING*2;  
var BOARD_OFFSET_X  = BOARD_PADDING+BIKE_SIZE/2;  
var BOARD_OFFSET_Y  = 150;

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
    this.scoreLabel.fill = 'white';

    // グループ
    this.group = DisplayElement().addChildTo(this);

    var gridX = Grid(BOARD_SIZE, MAX_PER_LINE);
    var gridY = Grid(BOARD_SIZE, MAX_PER_LINE);

    var self = this;

    (BIKE_NUM).times(function(i) {
      // グリッド上でのインデックス
      var xIndex = i%MAX_PER_LINE;
      var yIndex = Math.floor(i/MAX_PER_LINE);
      var angle = (360)/BIKE_NUM*i;
      var block = Bike(angle).addChildTo(this.group).setPosition(100, 100);

      block.x = gridX.span(xIndex) + BOARD_OFFSET_X;
      block.y = gridY.span(yIndex)+BOARD_OFFSET_Y;
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
  },

  update: function(app) {
    // タイムを加算
    this.time += app.deltaTime;

    // ブロックがすべてなくなったらクリア
    if (this.group.children.length <= 0) {
      this.gameclear();
    }

    var pointer = app.pointer;
    
    if (pointer.getPointingEnd()) {
        this.label.text = pointer.flickVelocity.toAngle().toDegree().floor();
        let input = Vector2(pointer.fx, pointer.fy);
        this.ganoff.setVector(input);
    }
  },

  checkHit: function() {
    this.group.children.some(function(block) {
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
    this.superInit('ganoff', 496 * .25, 254 * .25);
    this.width = 496 * .25;
    this.height = 254 * .25;
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
    this.superInit('bike', 500 * .25, 500 * .25);
    this.width = BIKE_SIZE;
    this.height = BIKE_SIZE;
  }

});

/*
 * コンボラベル
 */
phina.define('ComboLabel', {  
  superClass: 'Label',
  init: function(num) {
    this.superInit(num + ' combo!');

    this.stroke = 'white';
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


phina.main(function() {  
  var app = GameApp({
    title: 'Breakout',
    startLabel: location.search.substr(1).toObject().scene || 'title',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#444',
    assets: ASSETS
  });

  app.fps = 50;

  app.enableStats();

  app.run();
});
