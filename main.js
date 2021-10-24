//get canvas object
let canvas = document.getElementById('c');
canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;

//initialize audio analyser variable
let fft = new FFT();

//initialize menu object
let file = 'Petit Biscuit - Memories.mp3'
let menu = new Menu();
menu.add_item(file.substring(0, file.lastIndexOf('.')), file);
menu.select_item(0);

//visualization parameters
//sizes in px
let point_size = 30;
let point_space = 12;
let border_size = 200;
let vis = null;

function main(){
	//setup gl and uniforms
	setup_gl();

	//initialize visualization
	vis = new CleanVis(point_size, point_space, border_size, [0, 1], canvas);

	//start drawing loop
	let last_t = Date.now();
	var tick = function(){
		//find elapsed time
		let this_t = Date.now();
		let elapsed = this_t - last_t;
		last_t = this_t;

		//update and draw visualizations
		if(elapsed < 500){
			if(fft.actx){ fft.get_data(); }
			menu.update(elapsed);
			vis.update(elapsed, fft, canvas);

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
	canvas.width = window.innerWidth * devicePixelRatio;
	canvas.height = window.innerHeight * devicePixelRatio;
	menu.resize();
	if(gl){
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
	if(vis){
		vis = new CleanVis(point_size, point_space, border_size, [0, 1], canvas);
	}
}