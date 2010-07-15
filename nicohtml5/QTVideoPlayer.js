//
//
// NicoHTML5.QTVideoPlayer
//
//

NicoHTML5.QTVideoPlayer = function() {
    this.initialize.apply(this, arguments);
};

NicoHTML5.QTVideoPlayer.prototype = {

    initialize: function(target, options) {
	this.target = target;
	this.options = {
	    width: 512,
	    height: 384,
	    onLoadStart: null,
	    onFailed: null,
	    onPlay: null,
	    onSeek: null,
	    onPause: null,
	    onEnded: null
	};

	if(options != undefined) {
	    for(var key in options)
		this.options[key] = options[key];
	}

	this.playTimer = null;
	this.createPlayer();
    },

    createPlayer: function() {
	var self = this;
	
	var vc = document.createElement("div");
	vc.className = "videoplayer_video_container";
	this.videoContainer = vc;
	
	var obj = document.createElement("object");
	obj.className = "videoplayer_video";
	obj.type = "video/quicktime";
	obj.width = this.options.width;
	obj.height = this.options.height;
	this.object = obj;

	vc.appendChild(obj);
	
	var cc = document.createElement("div");
	cc.className = "videoplayer_controls_container";

	var pb = document.createElement("div");
	pb.className = "videoplayer_play_button";
	pb.innerHTML = "&nbsp;&nbsp;&nbsp;&#x25B6;&#x2590;";
	pb.addEventListener("mousedown", function() { self.pressPlayButton(); });

	var bb = document.createElement("div");
	bb.className = "videoplayer_back_button";
	bb.innerHTML = "&#x2590;&#x25C0;&nbsp;";
	bb.addEventListener("mousedown", function() { self.pressBackButton(); });	

	var sb = document.createElement("div");
	this.seekbar = new NicoHTML5.Seekbar(sb, function(p) { self.onSeek(p); });
	
	var tb = document.createElement("div");
	tb.className = "videoplayer_time";
	this.timeElm = tb;

	var vbc = document.createElement("div");
	vbc.className = "videoplayer_volumebar";

	var vb = document.createElement("div");
	this.volumebar = new NicoHTML5.Seekbar(vb, function(p) { self.onVolumeChange(p); } );
	this.volumebar.setDuration(1.0);
	this.volumebar.setBuffered(1.0);
	vbc.appendChild(vb);

	var rb = document.createElement("div");
	rb.className = "videoplayer_reload_button";
	rb.innerHTML = "R";
	rb.addEventListener("mousedown", function() { self.pressReloadButton(); });
	
	cc.appendChild(pb);
	cc.appendChild(bb);
	cc.appendChild(sb);
	cc.appendChild(tb);
	cc.appendChild(vbc);
	cc.appendChild(rb);

	this.target.appendChild(vc);
	this.target.appendChild(cc);	
    },

    getCurrentTime: function() {
	return this.qtUtil.currentTime();
    },

    pressPlayButton: function() {
	if(this.qtVideo.GetRate() == 0)
	    this.play();
	else
	    this.pause();
    },

    pressBackButton: function() {
	if(this.qtUtil.currentTime() > 0.0) {
	    this.onSeek(0.0);
	}
    },

    pressReloadButton: function() {
	if(this.qtUtil.currentTime() > 0.0) {
	    this.onSeek(0.0);
	}
	this.reload();
    },

    play: function() {
	var src = this.qtVideo.GetURL();
	if(src == undefined || src == "")
	    return;

	var s = this.qtVideo.GetPluginStatus();
	if(s == 'Playable' || s == 'Complete')
	    this.qtVideo.Play();
    },

    pause: function() {
	this.qtVideo.Stop();
    },

    setEmbed: function(src) {
	var self = this;

	var embed_html = "<embed name='qtVideo' " +
                         "       postdomevents=true enablejavascript=true controller=true" +
	                 "       autoplay=false " +
	                 "       width=" + this.options.width + " height=" + this.options.height + 
                         "       src='" + src + "'></embed>";

	var div = document.createElement("div");
	div.innerHTML = embed_html;

	var embed = div.firstChild;
  
	this.object.appendChild(embed);
	
	this.qtVideo = document.qtVideo;
	this.qtUtil = {
	    currentTime: function(tm) { 
		if(tm)
		    document.qtVideo.SetTime(tm * document.qtVideo.GetTimeScale());

		return document.qtVideo.GetTime() / document.qtVideo.GetTimeScale(); 
	    },
	    duration: function() { return document.qtVideo.GetDuration() / document.qtVideo.GetTimeScale(); },
	    buffered: function() { return document.qtVideo.GetMaxTimeLoaded() / document.qtVideo.GetTimeScale(); },
	    volume: function(vol) { 
		if(vol)
		    document.qtVideo.SetVolume(vol);
		return document.qtVideo.GetVolume(); 
	    }
	};

	this.object.addEventListener("qt_error",            function() { self.onError(); });
	this.object.addEventListener("qt_progress",         function() { self.onProgress(); });
	this.object.addEventListener("qt_loadedmetadata",   function() { self.onLoadedMetaData(); });
	this.object.addEventListener("qt_loadedfirstframe", function() { self.onLoadedData(); });
	this.object.addEventListener("qt_canplay",          function() { self.onCanPlay(); });
	this.object.addEventListener("qt_play",             function() { self.onPlay(); });
	this.object.addEventListener("qt_timechanged",      function() { self.onPlaying(); });
	this.object.addEventListener("qt_",                 function() { self.onSeek(); });
	this.object.addEventListener("qt_pause",            function() { self.onPause(); });
	this.object.addEventListener("qt_ended",            function() { self.onEnded(); });
    },

    load: function(src, type) {
	if(this.qtVideo)
	    this.qtVideo.SetURL(src);
	else
	    this.setEmbed(src);

	if(this.loadTimer) {
	    clearInterval(this.loadTimer);
	    this.laodTimer = null;
	}
    },

    reload: function() {
	if(this.qtVideo.GetURL()) {
	    var src = this.qtVideo.GetURL();
	    this.load(src);	    
	}
    },

    onEvent: function(e) {
	alert(e.type);
    },

    onProgress: function() {
    },

    onLoadedMetaData: function() {
	this.seekbar.setDuration(this.qtUtil.duration());
	this.volumebar.setPosition(this.qtUtil.volume());
	this.onUpdate();
	
	var self = this;
	if(this.loadTimer == null)
	    this.loadTimer = setInterval(function() { self.onLoadedData(); }, 500);
    },

    onLoadedData: function() {
	this.seekbar.setBuffered(this.qtUtil.bufferd);
    },

    onCanPlay: function() {
	if(this.autoplay)
	    this.play();
    },

    onPlay: function() {
	var self = this;
	if(this.playTimer == null)
	    this.playTimer = setInterval(function() { self.onUpdate(); }, 100);

	if(this.options.onPlay)
	    this.options.onPlay();
    },

    onUpdate: function() {
	this.timeElm.innerHTML = NicoHTML5.sec2MinSec(this.qtUtil.currentTime()) + 
                                 " / " + 
                                 NicoHTML5.sec2MinSec(this.qtUtil.duration());
	this.seekbar.setPosition(this.qtUtil.currentTime(), false);
    },

    onPlaying: function() {
    },

    onPause: function() {
	if(this.playTimer)
	    clearInterval(this.playTimer);
	this.playTimer = null;

	if(this.options.onPause)
	    this.options.onPause();
    },

    onEnded: function() {
	if(this.options.onEnded)
	    this.options.onEnded();
    },

    onSeek: function(seekTime) {
	this.qtUtil.currentTime(seekTime);
	this.onUpdate();

	if(this.options.onSeek)
	    this.options.onSeek(seekTime);
    },

    onVolumeChange: function(volume) {
	this.qtUtil.volume(volume);
    },

    onError: function() {
	var  msg = "";
	switch(this.video.error.code) {
	case MediaError.MEDIA_ERR_ABORTED:
	    msg = "process was aborted"; break;
	case MediaError.MEDIA_ERR_NETWORK:
	    msg = "network error"; break;
	case MediaError.MEDIA_ERR_DECODE:
	    msg = "decode error"; break;
	case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
	    msg = "source not supported"; break;
	default:
	    msg = "unknown error"; break;
	}

	if(this.options.onFailed)
	    this.options.onFailed(this.video.error.code, msg);
    }    
};

