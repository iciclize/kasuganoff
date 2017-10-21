phina.globalize();

var GAME_TITLE = '迫真ガノフ部\n〜春日エリアの裏技〜';

var SHARE_URL = 'http://iciclize.net:8080';  
var SHARE_MESSAGE = '※音量注意';  
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

var ASSETS = {
  image: {
    'ganoff': './assets/ganoff.png',
    'bike': './assets/bike.png',
    'beef': './assets/beef.png',
    'bread': './assets/bread.png',
    'bomb': './assets/bomb.png',
    'kasubike': './assets/kasubike.jpg'
  },
  sound: {
    'exp': './assets/explosion.mp3'
  }
};
