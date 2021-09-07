class CleanVis{
    constructor(num, width, height, radius, shader_inds){
        this.num = num;
        this.w = width;
        this.h = height;
        this.r = radius;
        this.r_px = this.r*window.innerHeight*window.devicePixelRatio;
        this.sh = {
            lin: shader_inds[0],
            dot: shader_inds[1]
        };
        this.fpv = 2;
        this.offset = [-this.w/2, -this.h/2];

        this.bars = [];
        let max_f = 255;
        let decay = .6;
        for(let i = 0; i < num; i++){
            this.bars.push(new FreqBar(max_f, decay));
        }

        this.lin_buf = new Float32Array(this.num*4*this.fpv);
        this.dot_buf = new Float32Array(this.num*this.fpv);
        this.fsize = this.lin_buf.BYTES_PER_ELEMENT;

        switch_shader(this.sh.lin);
        this.gl_lin_buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_lin_buf);
        gl.bufferData(gl.ARRAY_BUFFER, this.lin_buf, gl.DYNAMIC_DRAW);

        this.a_Pos_lin = gl.getAttribLocation(gl.program, 'a_Pos');
		gl.vertexAttribPointer(this.a_Pos_lin, this.fpv, gl.FLOAT, false, this.fsize*this.fpv, 0);
		gl.enableVertexAttribArray(this.a_Pos_lin);
        gl.uniform2fv(gl.getUniformLocation(gl.program, 'u_Off'), this.offset);

        switch_shader(this.sh.dot);
        this.gl_dot_buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_dot_buf);
        gl.bufferData(gl.ARRAY_BUFFER, this.dot_buf, gl.DYNAMIC_DRAW);

        this.a_Pos_dot = gl.getAttribLocation(gl.program, 'a_Pos');
		gl.vertexAttribPointer(this.a_Pos_dot, this.fpv, gl.FLOAT, false, this.fsize*this.fpv, 0);
		gl.enableVertexAttribArray(this.a_Pos_dot);

        this.u_Radius = gl.getUniformLocation(gl.program, 'u_Radius');
        this.u_IR = gl.getUniformLocation(gl.program, 'u_IR');
        this.u_DevicePixelRatio = gl.getUniformLocation(gl.program, 'u_DevicePixelRatio');
        gl.uniform1f(this.u_DevicePixelRatio, window.devicePixelRatio);
        gl.uniform2fv(gl.getUniformLocation(gl.program, 'u_Off'), this.offset);
    }

    update(elapsed, fft){
        let f_inc = .75/this.num;
        let x_inc = this.w/(this.num - 1);
        let lin_ind = 0;
        let dot_ind = 0;
        for(let i = 0; i < this.num; i++, lin_ind += 8, dot_ind += 2){
            this.bars[i].update(fft.sub_pro(i*f_inc, (i+1)*f_inc), elapsed);
            let x = i*x_inc;

            this.lin_buf[lin_ind + 0] = x;
            this.lin_buf[lin_ind + 1] = this.bars[i].mid*this.h + this.r;
            this.lin_buf[lin_ind + 2] = x;
            this.lin_buf[lin_ind + 3] = Math.max(this.bars[i].top*this.h, this.lin_buf[lin_ind + 1]);
            this.lin_buf[lin_ind + 4] = x;
            this.lin_buf[lin_ind + 5] = this.bars[i].mid*this.h - this.r;
            this.lin_buf[lin_ind + 6] = x;
            this.lin_buf[lin_ind + 7] = Math.min(this.bars[i].bot*this.h, this.lin_buf[lin_ind + 5]);

            this.dot_buf[dot_ind + 0] = x;
            this.dot_buf[dot_ind + 1] = this.bars[i].mid*this.h;
        }
    }

    draw(){
        switch_shader(this.sh.lin);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_lin_buf);
        gl.bufferData(gl.ARRAY_BUFFER, this.lin_buf, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Pos_lin, this.fpv, gl.FLOAT, false, this.fsize*this.fpv, 0);
        gl.drawArrays(gl.LINES, 0, this.lin_buf.length / this.fpv);

        switch_shader(this.sh.dot);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_dot_buf);
        gl.bufferData(gl.ARRAY_BUFFER, this.dot_buf, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Pos_dot, this.fpv, gl.FLOAT, false, this.fsize*this.fpv, 0);
        gl.uniform1f(this.u_Radius, this.r_px);
        gl.uniform1f(this.u_IR, 1 - 1/this.r_px);
        gl.drawArrays(gl.POINTS, 0, this.dot_buf.length / this.fpv);
    }

    resize(){
        this.r_px = this.r*window.innerHeight*window.devicePixelRatio;
        gl.uniform1f(this.u_DevicePixelRatio, window.devicePixelRatio);
    }
}

class FreqBar{
    constructor(max_f, decay){
        this.max_f = max_f;
        this.decay = decay;

        this.top = 0;
        this.mid = 0;
        this.bot = 0;
    }

    update(freq, elapsed){
        this.mid = freq/this.max_f;

        this.top -= (this.top - this.mid) * this.decay * elapsed/1000;
        this.bot += (this.mid - this.bot) * this.decay * elapsed/1000;

        this.top = Math.max(this.mid, this.top);
        this.bot = Math.min(this.mid, this.bot);
    }
}