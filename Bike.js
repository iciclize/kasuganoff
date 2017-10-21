phina.define('Bike', {  
  superClass: 'GameObject',
  init: function() {
    this.superInit(TYPE_BIKE, 'bike');
    this.crashed = false;
  }
});