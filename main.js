//get canvas object
let canvas = document.getElementById('c');
canvas.width = window.innerWidth*window.devicePixelRatio;
canvas.height = window.innerHeight*window.devicePixelRatio;

//initialize audio analyser variable
let fft = new FFT();

//initialize menu control object
let file = 'Petit Biscuit - Memories.mp3'
let menu = new Menu();
menu.add_item(file.substring(0, file.lastIndexOf('.')), file);
menu.select_item(0);

//units in px
let point_size = 25;
let point_space = 10;
let border_size = 200;
let vis = null;
const init_vis = () => {
	let DPR = window.devicePixelRatio;
	let num = Math.floor((canvas.width - 2*border_size*DPR)/(point_size*DPR + point_space*DPR));
	let width = 2*(canvas.width - 2*border_size*DPR)/canvas.width;
	let height = 2*(canvas.height - 2*border_size*DPR)/canvas.height;
	let radius = point_size*DPR/canvas.height;
	vis = new CleanVis(num, width, height, radius, [0, 1], canvas);
};

function main(){
	//setup gl and uniforms
	setup_gl();

	//initialize visualization
	init_vis();

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
	canvas.width = window.innerWidth*window.devicePixelRatio;
	canvas.height = window.innerHeight*window.devicePixelRatio;
	menu.resize();
	if(gl){
		gl.viewport(0, 0, canvas.width, canvas.height);
	}
	init_vis();
}