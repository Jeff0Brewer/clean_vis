class GradientBg{
    constructor(dom_element, smoothing){
        this.dom = dom_element;
        this.sm = smoothing;
        this.x = 0;
        this.to_pos = val => {
            return (Math.pow(val, 3)*100).toFixed();
        };
    }

    update(fft){
        let bot = fft.sub_pro(0, .2)/255;
        this.x = this.x*this.sm + bot*(1 - this.sm);
        this.dom.style.backgroundPosition = `${this.to_pos(this.x)}%`
    }
}