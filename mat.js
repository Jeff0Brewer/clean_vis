//4x4 matrix object constructor
var Mat4 = function(){
	this.e = new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
}

//multiply by other matrix from the right
Mat4.prototype.mult = function(o){
	for(let i = 0; i < 4; i++){
		let av = [this.e[i+0],this.e[i+4],this.e[i+8],this.e[i+12]];
		this.e[i+0] = dot(av, o.e.slice(0, 4));
		this.e[i+4] = dot(av, o.e.slice(4, 8));
		this.e[i+8] = dot(av, o.e.slice(8, 12));
		this.e[i+12]= dot(av, o.e.slice(12));
	}
}

//reset matrix to identity matrix
Mat4.prototype.set_identity = function(){
	this.e = new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
}

//create persepctive matrix
Mat4.prototype.set_perspective = function(fovy, aspect, near, far){
	fovy = Math.PI*fovy/180/2;
	rd = 1/(far-near);
	ct = Math.cos(fovy)/Math.sin(fovy);

	this.e[0] = ct/aspect;
	this.e[1] = 0;
	this.e[2] = 0;
	this.e[3] = 0;
	this.e[4] = 0;
	this.e[5] = ct;
	this.e[6] = 0;
	this.e[7] = 0;
	this.e[8] = 0;
	this.e[9] = 0;
	this.e[10]= -(far+near)*rd;
	this.e[11]= -1;
	this.e[12]= 0;
	this.e[13]= 0;
	this.e[14]= -2*near*far*rd;
	this.e[15]= 0;
}

//create view matrix
Mat4.prototype.set_camera = function(camera, focus, up){
	let f = norm(sub(focus, camera));
	let s = norm(cross3(f, up));
	let u = cross3(s, f);

	this.e[0] = s[0];
	this.e[1] = u[0];
	this.e[2] = -f[0];
	this.e[3] = 0;
	this.e[4] = s[1];
	this.e[5] = u[1];
	this.e[6] = -f[1];
	this.e[7] = 0;
	this.e[8] = s[2];
	this.e[9] = u[2];
	this.e[10]= -f[2];
	this.e[11]= 0;
	this.e[12]= 0;
	this.e[13]= 0;
	this.e[14]= 0;
	this.e[15]= 1;

	this.translate(-camera[0], -camera[1], -camera[2]);
}

//scale transformation matrix in x, y, z
Mat4.prototype.scale = function(x, y, z){
	this.e[0] *= x;
	this.e[1] *= x;
	this.e[2] *= x;
	this.e[3] *= x;
	this.e[4] *= y;
	this.e[5] *= y;
	this.e[6] *= y;
	this.e[7] *= y;
	this.e[8] *= z;
	this.e[9] *= z;
	this.e[10] *= z;
	this.e[11] *= z;
}

//translate transformation matrix by x, y, z
Mat4.prototype.translate = function(x, y, z){
	this.e[12] += this.e[0]*x + this.e[4]*y + this.e[8]*z;
	this.e[13] += this.e[1]*x + this.e[5]*y + this.e[9]*z;
	this.e[14] += this.e[2]*x + this.e[6]*y + this.e[10]*z;
	this.e[15] += this.e[3]*x + this.e[7]*y + this.e[11]*z;
}

//rotate transformation matrix by angle in degrees on axis [x, y, z]
Mat4.prototype.rotate = function(angle, axis){
	angle = Math.PI/180*angle;
	axis = norm(axis);

	let x = axis[0];
	let y = axis[1];
	let z = axis[2];
	let c = Math.cos(angle);
	let s = Math.sin(angle);
	let nc = 1-c;
	let r = {
		e: new Float32Array([x*x*nc+c, x*y*nc+z*s, z*x*nc-y*s, 0,
							 x*y*nc-z*s, y*y*nc+c, y*z*nc+x*s, 0,
							 z*x*nc+y*s, y*z*nc-x*s, z*z*nc+c, 0,
							 0, 0, 0, 1])
	};

	this.mult(r);
}
