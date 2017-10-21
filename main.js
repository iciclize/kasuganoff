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
        nextLabel: 'Title'
      }
    ]
  });

  app.fps = 30;
  app.enableStats();
  app.run();
});