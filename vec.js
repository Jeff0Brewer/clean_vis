//multiply vector by scalar
function mult_scalar(vec, s){ 
	let o = vec.slice();
	for(let i = 0; i < o.length; i++)
		o[i] = o[i]*s;
	return o;
}

//find sum of two vectors
function add(a, b){
	let o = [];
	for(let i = 0; i < a.length; i++)
		o.push(a[i]+b[i]);
	return o;
}

//find difference of two vectors
function sub(a, b){
	let o = [];
	for(let i = 0; i < a.length; i++)
		o.push(a[i]-b[i]);
	return o;
}

//find magnitude of vector
function mag(vec){ 
	let s = 0;
	for(let i = 0; i < vec.length; i++)
		s += Math.pow(vec[i], 2);
	return Math.sqrt(s);
}

//find normal of vector
function norm(vec){ 
	return mult_scalar(vec, 1/mag(vec));
}

//set vector magnitude
function resize(vec, l){
	return mult_scalar(vec, l/mag(vec));
}

//find midpoint of two vectors
function midpoint(a, b){ 
	let o = [];
	for(let i = 0; i < a.length; i++)
		o.push((a[i] + b[i])/2);
	return o;
}

//find dot product of two vectors
function dot(a, b){
	let o = 0;
	for(let i = 0; i < a.length; i++)
		o += a[i]*b[i];
	return o;
}

//find cross product of 3d vectors
function cross3(a, b){
	return [a[1]*b[2] - a[2]*b[1],
			a[2]*b[0] - a[0]*b[2],
			a[0]*b[1] - a[1]*b[0]];
}

//check if two vectors are equal
function vec_equal(a, b){
	for(let i = 0; i < a.length; i++){
		if(a[i] != b[i]) 
			return false;
	}
	return true;
}

//find average value of vector elements
function vec_avg(vec){
	let s = 0;
	for(let i = 0; i < vec.length; i++)
		s += vec[i];
	return s/vec.length;
}
