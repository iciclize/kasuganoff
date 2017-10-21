var AWARDS = [
  [0, 'カス'],
  [50, 'ガノフの端くれ'],
  [100, 'かろうじてガノフだったもの'],
  [150, 'ガノフ見習い'],
  [200, 'ビーフストロガノフのクズ'],
  [300, 'ガノフ星人'],
  [400, 'ガノフに選ばれし者'],
  [500, 'ガノフバンザイ！'],
  [600, 'ガノフ大爆発'],
  [700, 'ガノフマスター'],
  [810, 'ビーフストロガノフ先輩'],
  [932, 'ビーフストロガノフの鑑'],
  [999, 'ビーフストロガノフまみれ'],
  [1144, 'やったぜ。'],
  [1200, 'イキスギストロガノフ'],
  [1300, '僕は今日、昨日のガノフとビーフする'],
  [1400, '君のガノフを食べたい'],
  [1500, '打ち上げガノフ、パンから食べるか？器から食べるか？'],
  [1550, 'ガノフ・フォール'],
  [1600, 'ガノフの惑星'],
  [1650, '親の顔より見たガノフ'],
  [1700, '黒塗りのガノフ'],
  [1750, 'ガノフと化した先輩'],
  [1800, 'ガノフ地獄'],
  [1850, 'ビーフストロガノフこわれる'],
  [1919, '二人は幸せなビーフストロガノフを食べて終了'],
  [2001, '2017年ビーフストロガノフの度'],
  [2050, 'ビーフストロガノフ感じるんでしたよね？']
];

phina.define('ResultScene', {
  superClass: 'phina.display.DisplayScene',
  
  init: function(params) {
    this.superInit(params);
    if (!docCookies.getItem('highscore')) docCookies.setItem('highscore', 0);
    var self = this;
    var isHighScore = ResultScene.isHighScore(params.score);
    var award = ResultScene.getAward(params.score);
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
      fill: 'black',
      align: 'center'
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
    },
    getAward: function(score) {
      for (var i = AWARDS.length - 1; i >= 0; --i) {
        var rangeBegin = AWARDS[i][0];
        var award = AWARDS[i][1];
        if (score >= rangeBegin) return award;
      }
      return 'おや？';
    }
  }
});
