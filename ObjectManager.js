phina.define('ObjectManager', {
  init: function(grids, map, container, ganoff) {
    this.grids = grids;
    this.ganoff = ganoff;
    this.objects = container;
    this.counter = 0;
    this.map = (function() {
      // もしここでArray.prototype.mapを使うと呼び出し元の変数mapへの参照が切れるのでしてはいけない(戒め)
      for (var i = 0; i < map.length; i++) {
        map[i] = this.arrange(Blank(0, true), i);
      }
      return map;
    }.call(this));
  },
  arrange: function(obj, index) {
    var gx = this.grids.gridX;
    var gy = this.grids.gridY;
    var x = gx.span(index % gx.columns) + BOARD_OFFSET_X;
    var y = gy.span(Math.floor(index / gx.columns)) + BOARD_OFFSET_Y;
    var sx = Math.randint(-7, +7);
    var sy = Math.randint(-7, +7);
    obj.setPosition(x + sx, y + sy).addChildTo(this.objects);
    return obj;
  },
  hit: function(obj) {
    if (this.ganoff.speed == 0) {
      obj.remove();
      this.map[this.map.indexOf(obj)] = this.arrange(Blank(0), this.map.indexOf(obj));
      return false;
    }
    if (obj.type == TYPE_BIKE)
      obj.crashed = true;
    return true;
  },
  update: function() {
    this.map = this.map.map(function(obj, i){
      switch(obj.type) {
        case TYPE_BIKE:
          if (obj.crashed) {
            obj.remove();
            return this.arrange(Blank(), i);
          }
          break;

        case TYPE_BLANK:
          if (obj.tick()) break;
          if (this.ganoff.hitTestElement(obj)) break;
          if (obj.bikeonly) return this.arrange(Bike(), i);
          var p = Math.random() * 10000;
          if (p <= PROB_BOMB) {
            return this.arrange(Bomb(), i);
          } else if (p <= PROB_ONION+ PROB_BOMB) {
            return this.arrange(Onion(), i);
          } else if (p <= PROB_BEEF + PROB_BOMB + PROB_ONION) {
            return this.arrange(Beef(), i);
          } else {
              return this.arrange(Bike(), i);
          }
          break;

        case TYPE_BEEF:
        case TYPE_ONION:
        case TYPE_BOMB:
          if (obj.touched) {
            obj.remove();
            return this.arrange(Blank(), i);
          }
          if (obj.tick()) break;
          obj.remove();
          return this.arrange(Blank(), i);
          break;
      }
      return obj;
    }, this);
  }
});
