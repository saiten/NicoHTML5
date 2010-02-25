//
//
// NicoHTML5.Seekbar
//
//

NicoHTML5.Seekbar = function() {
    this.initialize.apply(this, arguments);
};

NicoHTML5.Seekbar.prototype = {

    initialize: function(target, callback) {
	this.target   = target;
	this.callback = callback;
	this.isDrag   = false;

	this.createSeekbar();
	this.setEvent();

	this.setDuration(1);	
	this.setBuffered(0);
	this.setPosition(0);
    },

    createSeekbar: function() {
	this.scaleElm = document.createElement("div");
	this.scaleElm.className = "videoplayer_seekbar_scale";
	
	this.bufferedElm = document.createElement("div");
	this.bufferedElm.className = "videoplayer_seekbar_buffered";
	this.unbufferedElm = document.createElement("div");
	this.unbufferedElm.className = "videoplayer_seekbar_unbuffered";

	this.scaleElm.appendChild(this.bufferedElm);
	this.scaleElm.appendChild(this.unbufferedElm);
	
	this.tabElm = document.createElement("div");
	this.tabElm.className = "videoplayer_seekbar_tab";
      
	this.target.className = "videoplayer_seekbar";
	this.target.appendChild(this.scaleElm);
	this.target.appendChild(this.tabElm);
    },
    
    setEvent: function() {
	var self = this;
	
	this.scaleElm.addEventListener("mousedown", function(ev) { self.scaleMouseDown(ev); }, false);
	this.tabElm.addEventListener("mousedown", function(ev) { self.tabMouseDown(ev); }, false);
	document.addEventListener("mousemove", function(ev) { self.mouseMove(ev); }, false);
	document.addEventListener("mouseup",   function(ev) { self.mouseUp(ev); },   false);
    },

    setPosition: function(p, force) {
	if(this.isDrag && !force)
	    return;

	if(p < 0.0) 
	    this.position = 0.0;
	else if(p > this.buffered) 
	    this.position = this.buffered; 
	else 
	    this.position = p;

	var x = this.scaleElm.scrollWidth * (this.position / this.duration);
	this.tabElm.style.left = x + "px";
    },
    
    setBuffered: function(b) {
	if(b < 0.0)
	    this.buffered = 0.0;
	else if(b > this.duration) 
	    this.buffered = this.duration;
	else
	    this.buffered = b;

	var p = Math.round(this.buffered / this.duration * 100);
	this.bufferedElm.style.width = p + "%";
	this.unbufferedElm.style.width = (100 - p) + "%";
    },

    setDuration: function(d) {
	if(d < 0.0) return;

	this.duration = d;
	this.setBuffered(this.buffered);
	this.setPosition(this.position);
    },
    
    changeTabPosition: function(clientX) {
	var offsetLeft = 0;
	var e = this.scaleElm;
	do {
	    offsetLeft += e.offsetLeft || 0;
	    e = e.offsetParent;
	} while(e);

	var ox = window.scrollX + clientX - offsetLeft;
	var p = ox / (this.scaleElm.scrollWidth);
	this.setPosition(this.duration * p, true);
    }, 

    scaleMouseDown: function(ev) {
	var before = this.position;
	this.changeTabPosition(ev.clientX);

	if(this.position != before && this.callback)
	    this.callback(this.position);
    },

    tabMouseDown: function(ev) { 
	this.isDrag = true; 
	this.beforePosition = this.position;
	ev.stopPropagation();
    },    

    mouseUp:   function(ev) {
	if(! this.isDrag) return;
	this.isDrag = false; 

	if(this.callback)
	    this.callback(this.position);
    },

    mouseMove: function(ev) {
	if(! this.isDrag) return;
	this.changeTabPosition(ev.clientX);
    }  
};
