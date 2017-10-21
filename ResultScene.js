var AWARDS = [
  ['称号名', 0],
  ['', 100]
];

phina.define('ResultScene', {
  superClass: 'phina.display.DisplayScene',
  
  init: function(params) {
    this.superInit(params);
    if (!docCookies.getItem('highscore')) docCookies.setItem('highscore', 0);
    var self = this;
    var isHighScore = ResultScene.isHighScore(params.score);
    var award = 'こ↑こ↓ に称号を返す関数を入れるゾ＾〜';
    this.backgroundColor = 'hsl(30, 60%, 100%)';
    Label({
      text: 'Score',
      fontSize: 36,
      x: this.gridX.center(),
      y: 80,
      fill: 'black'
    }).addChildTo(this);

    if (isHighScore) {

    Label({
      text: '新記録！',
      fontSize: 24,
      x: this.gridX.center(),
      y: 128,
      fill: 'red'
    }).addChildTo(this);
    ResultScene.setNewHighScore(params.score);

    }

    Label({
      text: params.score,
      fontSize: 56,
      x: this.gridX.center(),
      y: 190,
      fill: 'black'
    }).addChildTo(this);
    Label({
      text: '称号',
      fontSize: 36,
      x: this.gridX.center(),
      y: 290,
      fill: 'black'
    }).addChildTo(this);
    LabelArea({
      text: award,
      fontSize: 32,
      x: this.gridX.center(),
      y: 520,
      width: 400,
      fill: 'black'
    }).addChildTo(this);
    LabelArea({
      text: '大学会館前でビーフストロガノフ販売中！\nツイートしてね！',
      fontSize: 42,
      x: this.gridX.center(),
      y: 620,
      width: 480,
      fill: 'black'
    }).addChildTo(this);
    Button({
      text: '結果をツイートする',
      width: 480,
      height: 78,
      fontColor: 'white',
      fontSize: 44,
      cornerRadius: 10,
      x: this.gridX.center(),
      y: 710,
      fill: '#55acee'  
    }).addChildTo(this)
    // onclickじゃないとポップアップブロックされるらしい
    .onclick = function() {
      var text = '{0} Score: {1}\n称号: {2}\n{3}'.format(isHighScore ? '【新記録】' : '', params.score, award, params.message);
      var url = phina.social.Twitter.createURL({
        text: text,
        hashtags: params.hashtags,
        url: params.url,
      });
      window.open(url, 'share window', 'width=480, height=320');
    };
    Button({
      text: 'もう一度遊ぶ - Play again',
      width: 480,
      height: 78,
      fontColor: 'white',
      fontSize: 32,
      cornerRadius: 10,
      x: this.gridX.center(),
      y: 810,
      fill: 'hsl(330, 100%, 67%)'
    }).addChildTo(this)
    .on('pointend', function() {
      self.exit();
    });
  },
  _static: {
    isHighScore: function(score) {
      return score > docCookies.getItem('highscore');
    },
    setNewHighScore: function(score) {
      docCookies.setItem('highscore', score);
    }
  }
});
