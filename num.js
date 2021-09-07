//maps a value from range a into range b
function map(v, a, b){
	return (v - a[0])/(a[1] - a[0])*(b[1] - b[0]) + b[0];
}

//maps a value from range a into range b with exponential factor e
function exp_map(v, a, b, e){
	return Math.pow((v - a[0])/(a[1] - a[0]), e)*(b[1] - b[0]) + b[0];
}

//find maximum of two scalars
function max_sclr(a, b){
	return a > b ? a : b;
}

//find minimum of two scalars
function min_sclr(a, b){
	return a < b ? a : b;
}