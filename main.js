//get canvas object
var canvas = document.getElementById('c');
canvas.width = window.innerWidth*window.devicePixelRatio;
canvas.height = window.innerHeight*window.devicePixelRatio;

//initialize audio analyser variable
var fft = new FFT();

//initialize menu control object
let file = 'Petit Biscuit - Memories.mp3'
var menu = new Menu();
menu.add_item(file.substring(0, file.lastIndexOf('.')), file);
menu.select_item(0);

function main(){
	//setup gl and uniforms
	setup_gl();

	//initialize visualization
	vis = new CleanVis(20, 1, .8, .03, [0, 1]);

	//start drawing loop
	let last_t = Date.now();
	var tick = function(){
		//find elapsed time
		let this_t = Date.now();
		let elapsed = this_t - last_t;
		last_t = this_t;

		//update and draw visualizations
		if(elapsed < 500){
			if(fft.actx != null){
				fft.get_data();
			}
			menu.update(elapsed);
			vis.update(elapsed, fft);

			gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
			vis.draw();
		}
		requestAnimationFrame(tick, canvas);
	}
	tick();
}

//initialize audio analyser
document.body.onmousedown = function(){
	if(fft.actx == null){
		fft.init_ctx(file);
		menu.attach_fft(fft);
	}
}

//handle window resizing
document.body.onresize = function(){
	canvas.width = window.innerWidth*window.devicePixelRatio;
	canvas.height = window.innerHeight*window.devicePixelRatio;
	menu.resize();
	if(gl){
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
	if(vis){ vis.resize(); }
}