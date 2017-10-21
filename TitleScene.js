phina.define("TitleScene", {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit({
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT
    });
    this.backgroundColor = 'white';
    var background = Sprite('kasubike', 728, 970).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());
    var ganoff = Sprite('ganoff', 496 * .7, 254 * .7).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(3));
    var label = LabelArea({
      text: GAME_TITLE,
      fontSize: 48,
      width: SCREEN_WIDTH - 20,
      height: 120,
      align: 'center',
      fill: 'white',
      backgroundColor: 'hsla(0, 0%, 0%, .5)'
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(6));
  },
  onenter: function(app) {
    var howtoplay = Button({
      x: this.gridX.center(),
      y: this.gridY.span(12) - 40,
      width: 470,
      height: 70,
      text: "あそびかた - How to Play",
      fontSize: 32,
      fontColor: 'white',
      cornerRadius: 8,
      fill: 'hsla(30, 60%, 50%, .9)',
    }).addChildTo(this).on('pointend', function() {
      app.app.pushScene(HowToPlayScene())
    });
    var self = this;
    var start = Button({
      x: this.gridX.center(),
      y: this.gridY.span(13) - 10,
      width: 470,
      height: 70,
      text: "スタート - Start",
      fontSize: 32,
      fontColor: 'white',
      cornerRadius: 8,
      fill: 'hsla(30, 60%, 50%, .9)',
    }).addChildTo(this)
    .on('pointend', function() {
      self.exit();
    });

  }
});

phina.define('HowToPlayScene', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
    Sprite('howtoplay', 514, 893).setPosition(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2).addChildTo(this);
    var self = this;
    Button({
      x: this.gridX.center(),
      y: 840,
      width: 470,
      height: 70,
      text: "OK",
      fontSize: 36,
      fontColor: 'white',
      cornerRadius: 8,
      fill: 'hsla(30, 60%, 50%, .9)',
    }).addChildTo(this)
    .on('pointend', function() {
      self.exit();
    });

  }
});
