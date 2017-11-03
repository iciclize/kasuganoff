var AWARDS = [
  [0, 'まずいですよ！'],
  [24, '24点、赤点です。'],
  [25, '春日国民怒りのシュプレヒコール'],
  [50, '留年'],
  [100, 'かろうじてガノフだったもの'],
  [150, 'ガノフ見習い'],
  [200, 'ビーフストロガノフのクズ'],
  [250, '春日の姫'],
  [300, '絶望の起床'],
  [334, 'なんでや！'],
  [335, '珍料理、大発見！'],
  [400, 'ガノフ見っけ！いただきまーす！ '],
  [450, 'あ～もうめちゃくちゃだよ'],
  [500, '僕は今日、昨日のガノフとビーフする'],
  [550, '君のガノフを食べたい'],
  [600, '紅の牛'],
  [650, '打ち上げガノフ、スプーンから食べるか？器から食べるか？'],
  [680, 'ビーフストロガノフをかける少女'],
  [730, '親の顔より見たガノフ'],
  [760, '黒塗りのガノフ'],
  [810, 'ガノフと化した先輩'],
  [811, 'ガノフ地獄'],
  [850, '14万3000円のビーフストロガノフ'],
  [900, '二人は幸せなビーフストロガノフを食べて終了'],
  [931, 'ビーフストロガノフまみれ'],
  [932, 'ビーフストロガノフの鑑'],
  [980, 'ビーフストロガノフは神'],
  [1050, 'うまいビーフストロガノフ屋の屋台'],
  [1100, 'ビーフ！ビーフ！'],
  [1145, 'いいよ！来いよ！'],
  [1146, 'やりますねぇ！'],
  [1200, '落合◯一'],
  [1250, 'たった一度のあやまち'],
  [1300, 'なんだこれは…たまげたなぁ…'],
  [1350, 'ビーフストロガノフこわれる'],
  [1400, 'ガノフってそうなのー？'],
  [1450, '真夏の夜のガノフ'],
  [1500, 'イキスギストロガノフ'],
  [1550, '世にも奇妙なストロガノフ'],
  [1600, '世界のガノフ'],
  [1650, 'ビーフストロガノフには気をつけよう！'],
  [1700, '超絶怒涛のビーフストロガノフ'],
  [1750, 'ビーフストロガノフエバンジェリスト'],
  [1800, '1級ビーフストロガノフ士'],
  [1850, 'ストロガノフ職人'],
  [1900, 'プロ'],
  [1950, '114514爆発'],
  [2000, '語り継がれし者'],
  [2050, '人間国宝'],
  [2100, '限界'],
  [2150, '限界突破'],
  [2200, 'ガノフをたずねて三千里'],
  [2300, 'フランガノフの犬'],,
  [2350, '春日脅迫！かすガノフの逆襲'],
  [2400, '春日反撃！食されるかすガノフ'],
  [2500, '未来を想え'],
  [2600, 'IMAGINE THE FUTURE.']
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
      y: 100,
      fill: 'black'
    }).addChildTo(this);

    if (isHighScore) {

    Label({
      text: '新記録！',
      fontSize: 24,
      x: this.gridX.center(),
      y: 138,
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
      y: 310,
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
      text: '松美池前でビーフストロガノフ販売します！\nツイートしてね！',
      fontSize: 42,
      x: this.gridX.center(),
      y: 650,
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
      text: 'タイトルに戻る - Return',
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
