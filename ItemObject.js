phina.define('ItemObject', {
  superClass: 'GameObject',
  init: function(type, sprite) {
    this.superInit(type, sprite);
    this.timer = 60;
    this.setInteractive(true);
    this.touched = false;
    this.on('pointstart', function() {
      this.touched = true;
    }, this);
  },
  tick: function() {
    return (--this.timer > 0) ? true : false;
  }
});