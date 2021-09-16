class CleanVis{
    constructor(point_size, point_space, border_size, shader_inds, c){
        let DPR = window.devicePixelRatio;
        this.num = Math.floor((c.width - 2*border_size*DPR)/(point_size*DPR + point_space*DPR));
        this.w = c.width - 2*border_size*DPR;
        this.h = c.height - 2*border_size*DPR;
        this.d = point_size*DPR;
        this.r = this.d/2;
        this.sh = {
            lin: shader_inds[0],
            dot: shader_inds[1]
        };
        this.fpv = 2;
        this.offset = [Math.floor(border_size*DPR), Math.floor(border_size*DPR)];
        this.scr_width = c.width;

        this.bars = [];
        let max_f = 255;
        let memory = 500;
        for(let i = 0; i < this.num; i++){
            this.bars.push(new FreqBar(max_f, memory));
        }

        this.lin_buf = new Float32Array(this.num*4*this.fpv);
        this.dot_buf = new Float32Array(this.num*this.fpv);
        this.fsize = this.lin_buf.BYTES_PER_ELEMENT;

        let proj_matrix = mat4.ortho(mat4.create(), 0, c.width, 0, c.height, -1, 1);
        this.proj_test = proj_matrix;

        switch_shader(this.sh.lin);
        this.gl_lin_buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_lin_buf);
        gl.bufferData(gl.ARRAY_BUFFER, this.lin_buf, gl.DYNAMIC_DRAW);

        this.a_Pos_lin = gl.getAttribLocation(gl.program, 'a_Pos');
		gl.vertexAttribPointer(this.a_Pos_lin, this.fpv, gl.FLOAT, false, this.fsize*this.fpv, 0);
		gl.enableVertexAttribArray(this.a_Pos_lin);
        gl.uniform2fv(gl.getUniformLocation(gl.program, 'u_Off'), this.offset);
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'u_Proj'), false, proj_matrix);

        switch_shader(this.sh.dot);
        this.gl_dot_buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_dot_buf);
        gl.bufferData(gl.ARRAY_BUFFER, this.dot_buf, gl.DYNAMIC_DRAW);

        this.a_Pos_dot = gl.getAttribLocation(gl.program, 'a_Pos');
		gl.vertexAttribPointer(this.a_Pos_dot, this.fpv, gl.FLOAT, false, this.fsize*this.fpv, 0);
		gl.enableVertexAttribArray(this.a_Pos_dot);

        this.u_Radius = gl.getUniformLocation(gl.program, 'u_Radius');
        this.u_IR = gl.getUniformLocation(gl.program, 'u_IR');
        gl.uniform2fv(gl.getUniformLocation(gl.program, 'u_Off'), this.offset);
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.program, 'u_Proj'), false, proj_matrix);
    }

    update(elapsed, fft){
        let f_inc = .7/this.num;
        let x_inc = this.w/(this.num - 1);
        let lin_ind = 0;
        let dot_ind = 0;
        for(let i = 0; i < this.num; i++, lin_ind += 8, dot_ind += 2){
            this.bars[i].update(fft.sub_pro(i*f_inc, (i+1)*f_inc), elapsed);
            let x = Math.floor(i*x_inc) + .5;

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
        switch_shader(this.sh.dot);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_dot_buf);
        gl.bufferData(gl.ARRAY_BUFFER, this.dot_buf, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Pos_dot, this.fpv, gl.FLOAT, false, this.fsize*this.fpv, 0);
        gl.uniform1f(this.u_Radius, this.d);
        gl.uniform1f(this.u_IR, 1 - 1/this.d);
        gl.drawArrays(gl.POINTS, 0, this.dot_buf.length / this.fpv);

        switch_shader(this.sh.lin);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_lin_buf);
        gl.bufferData(gl.ARRAY_BUFFER, this.lin_buf, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(this.a_Pos_lin, this.fpv, gl.FLOAT, false, this.fsize*this.fpv, 0);
        gl.drawArrays(gl.LINES, 0, this.lin_buf.length / this.fpv);
    }
}

class FreqBar{
    constructor(max_f, memory){
        this.max_f = max_f;
        this.memory = memory;

        this.top = 0;
        this.mid = 0;
        this.bot = 0;
        this.freqs = new Map();
        this.t0 = Date.now();
    }

    update(freq){
        this.mid = freq/this.max_f;

        let timestamp = Date.now() - this.t0;
        this.freqs.set(timestamp, freq/this.max_f);

        let min_time = timestamp - this.memory
        for(const key of this.freqs.keys()){
            if(key < min_time){ this.freqs.delete(key); }
        }

        this.top = Math.max(.9*this.top + .1*Math.max(...this.freqs.values()), this.mid);
        this.bot = Math.min(.9*this.bot + .1*Math.min(...this.freqs.values()), this.mid);
    }
}