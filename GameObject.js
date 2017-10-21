phina.define('GameObject', {
  superClass: 'Sprite',
  init: function(type, sprite) {
    this.superInit(sprite, 500, 500);
    this.type = type;
    this.width = OBJECT_SIZE - 5;
    this.height = OBJECT_SIZE - 5;
  }
});