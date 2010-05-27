//
//
// NicoHTML5.Player
//
//
NicoHTML5.Player = function() {
    this.initialize.apply(this, arguments);
};

NicoHTML5.Player.prototype = {  

    initialize: function(video_id, target, options) {
	this.video_id  = video_id;
	this.target = target;
	this.options = {
	    overlaytype: "canvas",
	    commentInterval: 200,
	    videoInfo: {
		duration: 0,
		viewCount: 0,
		commentCount: 0,
		mylistCount: 0,
		thumbnail: null
	    }
	};
	if(options != undefined) {
	    for(var key in options)
		this.options[key] = options[key];
	}

	this.info = {};
	this.logData = "";
    },

    createPlayer: function() {
	var self = this;
	var width = 512, height = 384;
	var maxShow = 24;

	// player
	var pl = document.createElement("div");
	pl.className = "nicohtml5_player";
	this.player = pl;

	// video player
	var vp = document.createElement("div");
	vp.className = "videoplayer";
	this.videoPlayer = new NicoHTML5.VideoPlayer(vp, {
	    width: width,
	    height: height,
	    onPlay: function() { self.onPlay(); },
	    onPause: function() { self.onPause(); },
	    onEnded: function() { self.onPause(); },
	    onSeek: function() { self.onSeek(); },
	    onFailed: function(code, msg) { alert(msg); }
	});
	var vv = this.videoPlayer.video;
	var vc = this.videoPlayer.videoContainer;

	// comment overlay
	if(this.options.overlaytype == "canvas") {
	    var co = document.createElement("canvas");
	    co.className = "commentoverlay";
	    this.commentOverlay = new NicoHTML5.CanvasCommentOverlay(co, width, height);
	} else {
	    var co = document.createElement("div");
	    co.className = "commentoverlay";
	    this.commentOverlay = new NicoHTML5.DOMCommentOverlay(co, width, height, maxShow/2);
	}

	vc.appendChild(co);

	// comment engine
	this.commentEngine = new NicoHTML5.CommentEngine(width, height, maxShow, {
	    calculateCommentSize: function(c)  { self.commentOverlay.calculateCommentSize(c); },
	    showComments:         function(cs) { self.commentOverlay.showComments(cs); },
	    setShowComment:       function(c)  { self.commentOverlay.setShowComment(c); },
	    removeShowComment:    function(c)  { self.commentOverlay.removeShowComment(c); }
	});

	// comment list
	var cl = document.createElement("div");
	cl.className = "commentlist";
	this.commentList = new NicoHTML5.CommentList(cl, {});

	// comment box
	var form = document.createElement("form");
	form.className = "commentbox";
	form.onsubmit = function() { alert("('A`)"); return false; };
	var mlin = document.createElement("input");
	mlin.type = "text";
	mlin.className = "commentbox_mail";
	var coin = document.createElement("input");
	coin.type = "text";
	coin.className = "commentbox_comment";
	var sbin = document.createElement("input");
	sbin.value = "コメント";
	sbin.type = "submit";
	sbin.className = "commentbox_submit";

	form.appendChild(mlin);
	form.appendChild(coin);
	form.appendChild(sbin);

	// options
	var options = document.createElement("form");
	options.className = "options";
	var scin_label = document.createElement("label");
	var scin = document.createElement("input");
	scin.type = "checkbox"
	scin.className = "options_autoscroll";
	scin.checked = true;
	var scin_title = document.createTextNode("再生に合わせてスクロールする");

	this.autoScrollCheck = scin;
	scin_label.appendChild(scin);
	scin_label.appendChild(scin_title);
	options.appendChild(scin_label);

	// infomation
	var infobox = document.createElement("div");
	infobox.className = "infobox";
	this.infobox = infobox;

	// ads
	var ads = document.createElement("div");
	ads.className = "adsbar";

	// log
	var logbox = document.createElement("textarea");
	logbox.className = "logbox";
	logbox.readonly = true;
	this.logbox = logbox;
	
	pl.appendChild(vp);
	pl.appendChild(cl);
	pl.appendChild(form);
	pl.appendChild(options);
	pl.appendChild(infobox);
	pl.appendChild(logbox);
	pl.appendChild(ads);

	this.updateInfo();

	this.target.appendChild(pl);
    },

    openDialog: function() {
	var self = this;

	var dlg = document.createElement("div");
	dlg.className = "dialog";
	
	var ifrm = document.createElement("iframe");
	ifrm.className = "dialog_iframe";
	ifrm.src = "http://flapi.nicovideo.jp/api/getflv/" + this.video_id;

	var desc = document.createElement("div");
	desc.className = "dialog_description";
	desc.innerHTML = "上記の内容をコピーして再生ボタンをタップしてください";

	var btn = document.createElement("button");
	btn.className = "dialog_playbutton"
	btn.innerHTML = "再生";
	btn.addEventListener("click", function(e) { 
	    var body = prompt("コピーした内容をペーストしてください", "");
	    var ret = self.parseInfo(body);
	    if(ret.st) {
		self.info = ret.info;
		self.start();
	    } else {
		alert(ret.msg);
	    }
	});

	dlg.appendChild(ifrm);
	dlg.appendChild(desc);
	dlg.appendChild(btn);

	this.player.appendChild(dlg);
    },

    closeDialog: function() {
	var dlgs = this.player.getElementsByClassName("dialog");
	for(var i=0; i<dlgs.length; i++)
	    this.player.removeChild(dlgs[i]);
    },

    updateInfo: function() {
	var videoInfo = this.options.videoInfo;

	var createLine = function(title, content) {
	    var e = document.createElement("p");
	    e.className = "infobox_line";

	    var t = document.createElement("span");
	    t.className = "infobox_line_title";
	    t.innerHTML = title;
	    e.appendChild(t);

	    var c = document.createElement("span");
	    c.className = "infobox_line_content";
	    c.innerHTML = content;
	    e.appendChild(c);
	    return e;
	}

	if(this.infobox) {
	    this.infobox.innerHTML = "";
	    this.infobox.appendChild(createLine("再生数",       videoInfo.viewCount));
	    this.infobox.appendChild(createLine("コメント数",   videoInfo.commentCount));
	    this.infobox.appendChild(createLine("マイリスト数", videoInfo.mylistCount));
	}
    },

    log: function(msg) {
	this.logData = this.logData + msg + "\n";
	if(this.logbox) {
	    this.logbox.innerHTML = this.logData;
	    this.logbox.scrollTop = this.logbox.scrollHeight;
	}
    },

    parseInfo: function(body) {
	var info = {};
	    
	var datas = body.split("&");
	for(var i=0; i<datas.length; i++) {
	    var expr = datas[i].split("=");
	    info[expr[0]] = decodeURIComponent(expr[1]);			 
	}
	
	if(info.url == undefined)
	    return { st: false, msg: "cannot get video url." };
	
	if(/http:\/\/[^/]+\/smile\?(v|m|s)=/.test(info.url)) {
	    if(RegExp.$1 != 'm')
		return { st: false, msg: "this video is not supported." };
	} else 
	    return { st: false, msg: "unknown video url" };

	return { st: true, info: info };
    },

    getVideo: function() {
	var self = this;

        self.info = {};
	return http.get("http://flapi.nicovideo.jp/api/getflv/" + self.video_id).next(function(req) {
	    if(req.status != 200)
		throw "response failed.";

	    var ret = self.parseInfo(req.responseText);

	    if(ret.st)
		self.info = ret.info;
	    else
		throw ret.msg;
        });
    },

    getNGList: function() {
	var self = this;

	return http.get("/api/configurengclient?mode=get").next(function(req) {
	    if(req.status != 200)
		return;
	    
	    var xml = req.responseXML;
	    if(xml.getElementsByTagName("response_ngclient")[0].attributes.status.value != "ok")
		return;

	    self.ngusers = [];
	    self.ngwords = [];
	    
	    var ngclients = xml.getElementsByTagName("ngclient");
	    for(var i=0; i<ngclients.length; i++) {
		var ngclient = {
		    source: ngclients[i].getElementsByTagName("source")[0].textContent,
		    registered: ngclients[i].getElementsByTagName("register_time")[0].textContent
		};
		
		if(ngclients[i].getElementsByTagName("type")[0].textContent =="id")
		    self.ngusers.push(ngclient);
		else
		    self.ngwords.push(ngclient);
	    }
	});
    },
    
    getComment: function() {
	var self = this;

	var res_from = 200;
	if(this.options.videoInfo.duration) {
	    if(this.options.videoInfo.duration >= 300)
		res_from = 500;
	    if(this.options.videoInfo.duration >= 600)
		res_from = 1000;
	}

	return http.jsonp("https://commentproxy.appspot.com/getcomment", {
	    ms: self.info.ms,
	    t: self.info.thread_id,
	    res_from: res_from
	}).next(function(data) {
	    if(data.status == "ok") {
		self.info.ticket   = data.thread.ticket;
		self.info.last_res = data.thread.last_res;
		
		self.comments = data.comments.sort(function(a, b) { return a.vpos - b.vpos; });
	    }
	});	    
    },

    onPlay: function() {
	var self = this;

	if(this.commentUpdate == null) {
	    this.commentUpdate = setInterval(function() { self.main(); }, this.options.commentInterval);
	}
    },

    onPause: function() {
	clearInterval(this.commentUpdate);
	this.commentUpdate = null;
    },

    onSeek: function() {
	var currentTime = this.videoPlayer.video.currentTime;
	this.commentEngine.jump(currentTime);
	if(this.commentUpdate == null)
	    this.main();
    },

    main: function() {
	var currentTime = this.videoPlayer.video.currentTime;

	this.commentEngine.moveComments(currentTime);

	if(this.autoScrollCheck.checked) {
	    var vpos = Math.floor(currentTime * 100.0);
	    this.commentList.scrollToVpos(vpos);
	}
    },

    prepare: function() {
	this.createPlayer();
	this.log("createplayer() ok");

	this.openDialog();
    },

    start: function() {
	var self = this;

	this.closeDialog();

	Deferred.next(function() {
	    self.log("getvideo() ok");
	    return self.getComment();
	}).next(function() {
	    self.log("getComment() ok");
	    self.commentList.setComments(self.comments);
	    self.commentEngine.setComments(self.comments);

	    self.options.videoInfo.commentCount = self.info.last_res;
	    self.updateInfo();

	    return self.getNGList();
	}).next(function() {
	    self.log("getNGList() ok");
	    if(self.ngwords) 
		self.commentEngine.setNGWords(self.ngwords);
	    if(self.ngusers)
		self.commentEngine.setNGUsers(self.ngusers);

	    self.log("loading video : " + self.info.url + " ...");
	    self.videoPlayer.load(self.info.url);

	    self.log("ready.");
	}).error(function(e) {
	    self.log("error : " + e);
	    alert(e);
	});
    }
};
