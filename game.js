function init() {
	main = new Main();
}

function update(){
	// scroller.moveViewportXBy(5);
	
	renderer.render(stage);
	requestAnimFrame(update);
}