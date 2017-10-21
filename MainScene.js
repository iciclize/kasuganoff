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

    this.flag = false; // 1度しかフリック判定をしない
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
      Stat.v = input.length() * 1.2;
      Stat.a = input.toDegree();
      this.ganoff.setVector(input);
      this.flag = true;
    }

    var self = this;
    if (this.flag)
      if (this.ganoff.speed <= 0) setTimeout(function() {
        self.gameover();
      }, 1000);

  },
  bomb: function() {
    SoundManager.play('exp');
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
    var self = this;
    this.ganoff.tweener
      .to({ width: GANOFF_WIDTH * 3, height: GANOFF_HEIGHT * 3 }, 300)
      .wait(4000)
      .call(check).play();
    function check() {
      self._bigNum--;
      if (self._bigNum > 0)
        self.ganoff.tweener.wait(4000).call(check).play();
      else {
        self.ganoff.tweener.to({ width: GANOFF_WIDTH, height: GANOFF_HEIGHT }, 300).play();
      }
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
        self.ganoff.speed = o.speed + 10;
        self.ganoff.deceleration = o.deceleration;
      }
    }
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
      get: function() { return this._score; },
      set: function(v) {
        this._score = v;
        this.scoreLabel.text = v;
      },
    },
  }

});
