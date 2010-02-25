//
//
// NicoHTML5.DOMCommentOverlay
//
//

NicoHTML5.DOMCommentOverlay = function() {
    this.initialize.apply(this, arguments);
};

NicoHTML5.DOMCommentOverlay.prototype = {    
    DISABLE_CLIP: "rect(0px 0px 0px 0px)",

    initialize: function(container, width, height, maxShow) {
	this.container = container;

	this.setOverlaySize(width, height);
	this.createCommentLayer(maxShow);
    },

    createCommentLayer: function(maxShow) {
	if(maxShow == undefined)
	    maxShow = 24;

	this.commentLayers = [];
	for(var i=0; i<maxShow; i++) {
	    var layer = document.createElement("div");
	    layer.className = "commentoverlay_comment";
	    layer.style.display = "block";
            layer.style.clip = "rect(0 0 0 0)";
	    layer._isUse = false;

	    this.container.appendChild(layer);
	    this.commentLayers.push(layer);
	}
    },

    setOverlaySize: function(width, height) {
	this.overlayWidth = width;
	this.overlayHeight = height;
	this.container.style.width = width + "px";
	this.container.style.height = height + "px";

	this.fonts = [];
	this.lineHeights = [];
	var fontspace = [16, 20, 12]; // normal, small, big
	for(var i=0; i<fontspace.length; i++) {
	    var size = Math.floor(height / fontspace[i]);
	    this.fonts.push("bold " + size + "px " + 
                            "'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', " +
                            "'メイリオ', Meiryo," +
		            "'ＭＳ Ｐゴ シック', sans-serif");
	    this.lineHeights.push(size + 4);
	}
    },

    clippingLayer: function(layer) {
	if(! layer._isUse) {
	    if(layer.style.clip != this.DISABLE_CLIP)
		layer.style.clip = this.DISABLE_CLIP;
	    return;
	}    

	var top = 0;
	if(layer.offsetTop < 0 && layer.offsetTop + layer.scrollHeight > 0)
	    top = layer.scrollHeight - layer.offsetTop;

	var bottom = layer.scrollHeight;
	if(layer.offsetTop < this.overlayHeight && 
	   layer.offsetTop + layer.scrollHeight > this.overlayHeight)
	    bottom = this.overlayHeight - layer.offsetTop;
	if(layer.offsetTop >= this.overlayHeight)
	    bottom = 0;

	var left = 0;
	if(layer.offsetLeft < 0 && layer.offsetLeft + layer.scrollWidth > 0)
	    left = -layer.offsetLeft;

	var right = layer.scrollWidth;
	if(layer.offsetLeft < this.overlayWidth && 
	   layer.offsetLeft + layer.scrollWidth > this.overlayWidth)
	    right = this.overlayWidth - layer.offsetLeft;
	if(layer.offsetLeft + layer.scrollWidth < 0 || layer.offsetLeft >= this.overlayWidth)
	    bottom = 0;

	var rect = "rect(" + top + "px " + right + "px " + bottom + "px " + left + "px)";
	if(layer.style.clip != rect)
	    layer.style.clip = rect;
    },

    calculateCommentSize: function(c) {
	var layer = null;
	for(var i=0; i<this.commentLayers.length; i++) {
	    if(! this.commentLayers[i]._isUse) {
		layer = this.commentLayers[i];
		break;
	    }	    
	}

	if(layer) {
	    layer.style.color = c.color;
	    layer.style.font = this.fonts[c.fontSize];
	    layer.style.lineHeight = this.lineHeights[c.fontSize] + "px";
	    layer.innerHTML = c.c.content;
	    layer._isUse = true;
	    
	    c.size.width = layer.scrollWidth;
	    c.size.height = layer.scrollHeight;

	    c.layer = layer;
	} else {
	    c.size.width = 0;
	    c.size.height = 0;

	    c.layer = null;
	}
    },

    setShowComment: function(c) {
	if(c.layer) {
	    c.layer.style.top = c.pos.y + "px";
	    c.layer.style.left = c.pos.x + "px";
	    this.clippingLayer(c.layer);
	}
    },
    
    removeShowComment: function(c) {
	if(c.layer) {
	    c.layer._isUse = false;
	    c.layer.innerHTML = "";
	    c.layer.style.top = "-500px";
	    c.layer.style.clip = this.DISABLE_CLIP;
	}
    },

    showComments: function(showComments) {
	for(var i=0; i<showComments.length; i++) {
	    var c = showComments[i];
	    if(c.layer) {
		c.layer.style.top = c.pos.y + "px";
		c.layer.style.left = c.pos.x + "px";
		this.clippingLayer(c.layer);
	    }
	}
    },
};
