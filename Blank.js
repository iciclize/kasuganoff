phina.define('Blank', {
  superClass: 'phina.app.Object2D',
  init: function(time, bikeonly) {
    this.superInit();
    this.type = TYPE_BLANK;
    this.width = OBJECT_SIZE - 5;
    this.height = OBJECT_SIZE - 5;
    this.bikeonly = (typeof(bikeonly)) ? bikeonly : false;
    this.timer = (Blank.isNumeric(time)) ? time : 30;
  },
  tick: function() {
    return (--this.timer > 0) ? true : false;
  },
  _static: {
    isNumeric: function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
  }
});