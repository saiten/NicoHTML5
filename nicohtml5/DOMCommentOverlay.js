//
//
// NicoHTML5.DOMCommentOverlay
//
//

NicoHTML5.DOMCommentOverlay = function() {
    this.initialize.apply(this, arguments);
};

NicoHTML5.DOMCommentOverlay.prototype = {    

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
	    layer.style.visibility = "hidden";
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
	    c.layer.style.visibility = "visible";
	}
    },
    
    removeShowComment: function(c) {
	if(c.layer) {
	    c.layer._isUse = false;
	    c.layer.innerHTML = "";
	    c.layer.style.visibility = "hidden";
	}
    },

    showComments: function(showComments) {
	for(var i=0; i<showComments.length; i++) {
	    var c = showComments[i];
	    if(c.layer) {
		c.layer.style.top = c.pos.y + "px";
		c.layer.style.left = c.pos.x + "px";
	    }
	}
    },
};
