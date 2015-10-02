function init() {
	main = new Main();
	main.mainMenu = new MainMenu();
}

function update(){
	// scroller.moveViewportXBy(5);
	
	renderer.render(stage);
	requestAnimFrame(update);
}