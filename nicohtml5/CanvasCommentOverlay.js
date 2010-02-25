//
// NicoHTML5.CanvasCommentOverlay
//
//

NicoHTML5.CanvasCommentOverlay = function() {
    this.initialize.apply(this, arguments);
};

NicoHTML5.CanvasCommentOverlay.prototype = {

    initialize: function(canvas, width, height) {
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");

	this.setOverlaySize(width, height);
    },

    setOverlaySize: function(width, height) {
	this.canvas.width = width;
	this.canvas.height = height;

	this.fonts = [];
	this.lineHeights = [];

	var fontspace = [16, 20, 12]; // normal, small, big
	for(var i=0; i<fontspace.length; i++) {
	    var size = Math.floor(height / fontspace[i]);
	    this.fonts.push("bold " + size + "px " + 
                            "'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', " +
                            "'メイリオ', Meiryo," +
		            "'ＭＳ Ｐゴ シック', sans-serif");
	    this.lineHeights.push(size+6);
	}
    },
    
    calculateCommentSize: function(c) {
	this.ctx.font = this.fonts[c.fontSize];
	var metrix = this.ctx.measureText(c.c.content);
	c.size.width = metrix.width;
	c.size.height = this.lineHeights[c.fontSize];
    },

    showComments: function(showComments) {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	
	for(var i=0; i<showComments.length; i++) {
	    var c = showComments[i];
	    this.ctx.font = this.fonts[c.fontSize];
	    this.ctx.textBaseline = "top";
	    this.ctx.textAlign = "left";
	    this.ctx.fillStyle = c.color;

	    this.ctx.shadowColor = "#000";
	    this.ctx.shadowBlur = 2;
	    this.ctx.shadowOffsetY = 0;

	    this.ctx.fillText(c.c.content, c.pos.x, c.pos.y, this.canvas.width);
	}
    },

    setShowComment: function(c) {},
    removeShowComment: function(c) {}
};
