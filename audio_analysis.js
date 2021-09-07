//audio analyser object
var FFT = function(){
	this.actx = null;
	this.size = 4096;
	this.raw_data = new Uint8Array(this.size).fill(0);
	this.pro_data = new Array(Math.ceil(Math.sqrt(Math.floor(this.raw_data.length*0.7)))).fill(0);
}

//initialize the audio context
FFT.prototype.init_ctx = function(file){
	this.actx = new AudioContext();
	this.audio = new Audio(file);
	this.audio_src = this.actx.createMediaElementSource(this.audio);
	this.analyser = this.actx.createAnalyser();
	this.analyser.fftSize = this.size;
	this.analyser.smoothingTimeConstant = .75;
	this.audio_src.connect(this.analyser);
	this.audio_src.connect(this.actx.destination);
}

//change the audio file
FFT.prototype.change_file = function(file){
	let play = false;
	if(this.audio.paused == false || this.audio.currentTime == this.audio.duration){
		this.audio.pause();
		play = true;
	}

	this.audio = new Audio(file);
	this.audio_src = this.actx.createMediaElementSource(this.audio);
	this.audio_src.connect(this.analyser);
	this.audio_src.connect(this.actx.destination);

	if(play)
		this.audio.play();
	return play;
}

//get data from attached audio object
FFT.prototype.get_data = function(){
	this.analyser.getByteFrequencyData(this.raw_data);
	let trim = this.raw_data.slice(0, Math.floor(this.raw_data.length*0.7));
	for(let i = 0; i < Math.sqrt(trim.length); i++)
		this.pro_data[i] = vec_avg(trim.slice(Math.pow(i, 2), Math.pow(i+1, 2)));
}

//get average of subset of processed data
FFT.prototype.sub_pro = function(s, e){
	s = Math.floor(s*this.pro_data.length);
	e = Math.floor(e*this.pro_data.length);
	if(s == e){
		if(s > 0)
			s--;
		else
			e = min_sclr(e+1, this.pro_data.length - 1);
	}
	let slice = this.pro_data.slice(s, e);
	let sum = 0;
	for(let i = 0; i < slice.length; i++)
		sum += slice[i];
	return sum/slice.length;
}

//play attached audio
FFT.prototype.play_audio = function(){
	this.audio.play();
}

//pause attached audio
FFT.prototype.pause_audio = function(){
	this.audio.pause();
}

//set percentage completion of attached audio
FFT.prototype.set_progress = function(per){
	per = per > 0 ? per : 0;
	per = per < 100 ? per : 100;
	this.audio.currentTime = this.audio.duration*per/100;
}

//get percentage completion of attached audio
FFT.prototype.get_progress = function(){
	return (this.audio.currentTime / this.audio.duration)*100;
}