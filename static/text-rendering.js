function rgbify(sh) {
    sh = (sh < 0) ? sh + 1 : (sh >= 1) ? sh - 1 : sh;
    if (sh * 6 < 1) return sh * 6;       // [ 0,   1/6 )
    if (sh < 0.5) return 1;              // [ 1/6, 1/2 )
    if (sh * 3 < 2) return 4 - 6 * sh;   // [ 1/2, 2/3 )
    return 0;                            // [ 2/3, 1   )
}
class Text {
    constructor(text="") {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.setText(text)
    }
    setText(text) {
        this.text = text;
        this.ctx.font = "100px Jost";
        this.textWidth = 0.01 * this.ctx.measureText(this.text).width;
    }
    draw(style="black", maxWidth=null, maxHeight=null, cursor=false) {
        if (maxHeight === null) maxHeight = 100;
        if (maxWidth === null) maxWidth = this.textWidth * maxHeight;
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;

        this.ctx.clearRect(0, 0, maxWidth, maxHeight);

        if (this.text) {
            this.ctx.fillStyle = style === "white" ? "#ffffff" : style === "orange" ? "#ff8000" : style === "gray" ? "#808080" : "#000000";

            this.rect = {};
            if (maxWidth / maxHeight > this.textWidth) {
                this.rect.width = maxHeight * this.textWidth;
                this.rect.height = maxHeight;
                this.rect.x1 = 0.5 * (maxWidth - this.rect.width);
                this.rect.y1 = 0;
                this.rect.x2 = 0.5 * (maxWidth + this.rect.width);
                this.rect.y2 = maxHeight;

            }
            else {
                this.rect.width = maxWidth;
                this.rect.height = maxWidth / this.textWidth;
                this.rect.x1 = 0;
                this.rect.y1 = 0.5 * (maxHeight - maxWidth / this.textWidth);
                this.rect.x2 = maxWidth;
                this.rect.y2 = 0.5 * (maxHeight + maxWidth / this.textWidth);
            }

            this.rect.width = Math.floor(this.rect.width);
            this.rect.height = Math.floor(this.rect.height);
            this.rect.x1 = Math.floor(this.rect.x1);
            this.rect.y1 = Math.floor(this.rect.y1);
            this.rect.x2 = Math.floor(this.rect.x2);
            this.rect.y2 = Math.floor(this.rect.y2);

            this.ctx.font = `${this.rect.height}px Jost`;
            this.ctx.textBaseline = "bottom";
            this.ctx.fillText(this.text, this.rect.x1, this.rect.y2);

            if (style === "rainbow") {
                let pixels = this.ctx.getImageData(this.rect.x1, this.rect.y1, this.rect.width, this.rect.height);
                for (let y = 0; y < this.rect.height; y++) {
                    for (let x = 0; x < this.rect.width; x++) {
                        if (pixels.data[4 * (x + y * this.rect.width) + 3]) {
                            let hue = x / this.rect.width;
                            pixels.data[4 * (x + y * this.rect.width)] = Math.floor(rgbify(hue + 1/3) * 256);
                            pixels.data[4 * (x + y * this.rect.width) + 1] = Math.floor(rgbify(hue) * 256);
                            pixels.data[4 * (x + y * this.rect.width) + 2] = Math.floor(rgbify(hue - 1/3) * 256);
                        }
                    }
                }
                this.ctx.putImageData(pixels, this.rect.x1, this.rect.y1);
            }
            if (typeof cursor === "number") {
                this.ctx.fillRect(this.rect.x1 + this.ctx.measureText(this.text.substring(0, cursor)).width, this.rect.y1, 5, this.rect.height);
            }
        }
        else if (cursor) {
            console.log(`(${maxWidth * 0.5}, 0, 5, ${maxHeight})`);
            this.ctx.fillRect(maxWidth * 0.5, 0, 5, maxHeight);
        }

        return this.canvas;
    }
}

let menuScript = document.createElement("script");
menuScript.src = "socketio-test.js";
document.body.appendChild(menuScript);
