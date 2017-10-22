phina.globalize();

var Stat = { v: null, a: null, score: null };

var GAME_TITLE = '迫真ガノフ部\n〜春日エリアの裏技〜';

// わりとすぐ140文字いっちゃう
var SHARE_URL = 'http://iciclize.net:8080';  
var SHARE_MESSAGE = '松美池前にてビーフストロガノフ販売中！\n春日ガノフゲーム(仮称)をプレイしよう！';  
var SHARE_HASH_TAGS = '春日ビーフ2017,筑波大学,雙峰祭';

var SCREEN_WIDTH    = 514;  
var SCREEN_HEIGHT   = 893;  
var MAX_PER_LINE    = 7;  
var OBJECT_SIZE     = 92;  
var BOARD_PADDING   = 10;
var BOARD_WIDTH     = SCREEN_WIDTH - BOARD_PADDING*2;  
var BOARD_HEIGHT    = SCREEN_HEIGHT - BOARD_PADDING*2;
var BOARD_OFFSET_X  = BOARD_PADDING+OBJECT_SIZE/2 - 2;  
var BOARD_OFFSET_Y  = 140;
var GANOFF_WIDTH = 496 * .17;
var GANOFF_HEIGHT = 254 * .17;
var TYPE_INIT  = 0;
var TYPE_BLANK = 1;
var TYPE_BIKE  = 2;
var TYPE_BOMB  = 3;
var TYPE_ONION= 4;
var TYPE_BEEF  = 5;

var PROB_BOMB  = 50;
var PROB_BEEF  = 40;
var PROB_ONION = 10;


const ASSETS = {
  image: {
    'ganoff': './assets/ganoff.png',
    'bike': './assets/bike.png',
    'beef': './assets/beef.png',
    'onion': './assets/onion.png',
    'bomb': './assets/bomb.png',
    'kasubike': './assets/kasubike.jpg',
    'howtoplay': './assets/howtoplay.png'
  },
  sound: {
    'exp': './assets/explosion.mp3',
    'unch': './assets/unchi-kong.mp3'
  }
};

phina.main(function() {  
  var app = GameApp({
    title: GAME_TITLE,
    startLabel: 'Title',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    assets: ASSETS,
    scenes: [{
        className: 'TitleScene',
        label: 'Title',
        nextLabel: 'Main'
      },
      {
        className: 'MainScene',
        label: 'Main',
        nextLabel: 'Result'
      },
      {
        className: 'ResultScene',
        label: 'Result',
        nextLabel: 'Main'
      }
    ]
  });

  app.fps = 30;
  app.enableStats();
  app.run();

  // iOSで音を鳴らすためのコード - https://qiita.com/simiraaaa/items/ba83ce70cb091e8bdfab
  var locked = true;
  var f = function(e){
    if(locked){
      var s = phina.asset.Sound();
      s.loadFromBuffer();
      s.play();
      s.volume=0;
      s.stop();
      locked=false;
      app.domElement.removeEventListener('touchend', f);
    }
  };
  app.domElement.addEventListener('touchend',f);
});
