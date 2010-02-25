//
// http & xhttp (from jsdeferred.userscript.js)
//

function xhttp (opts) {
	var d = Deferred();
	if (opts.onload)  d = d.next(opts.onload);
	if (opts.onerror) d = d.error(opts.onerror);
	opts.onload = function (res) {
		d.call(res);
	};
	opts.onerror = function (res) {
		d.fail(res);
	};
	setTimeout(function () {
		GM_xmlhttpRequest(opts);
	}, 0);
	return d;
}
xhttp.get  = function (url)       { return xhttp({method:"get",  url:url}) };
xhttp.post = function (url, data) { return xhttp({method:"post", url:url, data:data, headers:{"Content-Type":"application/x-www-form-urlencoded"}}) };

function http (opts) {
	var d = Deferred();
	var req = new XMLHttpRequest();
	req.open(opts.method, opts.url, true);
	if (opts.headers) {
		for (var k in opts.headers) if (opts.headers.hasOwnProperty(k)) {
			req.setRequestHeader(k, opts.headers[k]);
		}
	}
	req.onreadystatechange = function () {
		if (req.readyState == 4) d.call(req);
	};
	req.send(opts.data || null);
	d.xhr = req;
	return d;
}
http.get   = function (url)       { return http({method:"get",  url:url}) };
http.post  = function (url, data) { return http({method:"post", url:url, data:data, headers:{"Content-Type":"application/x-www-form-urlencoded"}}) };
http.jsonp = function (url, params) {
	if (!params) params = {};

	var Global = (function () { return this })();
	var d = Deferred();
	var cbname = params["callback"];
	if (!cbname) do {
		cbname = "callback" + String(Math.random()).slice(2);
	} while (typeof(Global[cbname]) != "undefined");

	params["callback"] = cbname;

	url += (url.indexOf("?") == -1) ? "?" : "&";

	for (var name in params) if (params.hasOwnProperty(name)) {
		url = url + encodeURIComponent(name) + "=" + encodeURIComponent(params[name]) + "&";
	}

	var script = document.createElement('script');
	script.type    = "text/javascript";
	script.charset = "utf-8";
	script.src     = url;
	document.body.appendChild(script);

	Global[cbname] = function callback (data) {
		delete Global[cbname];
		document.body.removeChild(script);
		d.call(data);
	};
	return d;
};
/* Header::
 * JSDeferred
 * Copyright (c) 2007 cho45 ( www.lowreal.net )
 *
 * http://coderepos.org/share/wiki/JSDeferred
 *
 * Version:: 0.3.0
 * License:: MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/* Usage (with jQuery)::
 *
 *     $.deferred.define();
 *
 *     $.get("/hoge").next(function (data) {
 *         alert(data);
 *     }).
 *
 *     parallel([$.get("foo.html"), $.get("bar.html")]).next(function (values) {
 *         log($.map(values, function (v) { return v.length }));
 *         if (values[1].match(/nextUrl:\s*(\S+)/)) {
 *             return $.get(RegExp.$1).next(function (d) {
 *                 return d;
 *             });
 *         }
 *     }).
 *     next(function (d) {
 *         log(d.length);
 *     });
 *
 */


/* function Deferred () //=> constructor
 *
 * `Deferred` function is constructor of Deferred.
 *
 * Sample:
 *     var d = new Deferred();
 *     // or this is shothand of above.
 *     var d = Deferred();
 */
/* function Deferred.prototype.next   (fun) //=> Deferred
 *
 * Create new Deferred and sets `fun` as its callback.
 */
/* function Deferred.prototype.error  (fun) //=> Deferred
 *
 * Create new Deferred and sets `fun` as its errorback.
 *
 * If `fun` not throws error but returns normal value, Deferred treats
 * the given error is recovery and continue callback chain.
 */
/* function Deferred.prototype.call   (val) //=> this
 *
 * Invokes self callback chain.
 */
/* function Deferred.prototype.fail   (err) //=> this
 *
 * Invokes self errorback chain.
 */
/* function Deferred.prototype.cancel (err) //=> this
 *
 * Cancels self callback chain.
 */
function Deferred () { return (this instanceof Deferred) ? this.init() : new Deferred() }
Deferred.ok = function (x) { return x };
Deferred.ng = function (x) { throw  x };
Deferred.prototype = {
	init : function () {
		this._next    = null;
		this.callback = {
			ok: Deferred.ok,
			ng: Deferred.ng
		};
		return this;
	},

	next  : function (fun) { return this._post("ok", fun) },
	error : function (fun) { return this._post("ng", fun) },
	call  : function (val) { return this._fire("ok", val) },
	fail  : function (err) { return this._fire("ng", err) },

	cancel : function () {
		(this.canceller || function () {})();
		return this.init();
	},

	_post : function (okng, fun) {
		this._next =  new Deferred();
		this._next.callback[okng] = fun;
		return this._next;
	},

	_fire : function (okng, value) {
		var next = "ok";
		try {
			value = this.callback[okng].call(this, value);
		} catch (e) {
			next  = "ng";
			value = e;
			if (Deferred.onerror) Deferred.onerror(e);
		}
		if (value instanceof Deferred) {
			value._next = this._next;
		} else {
			if (this._next) this._next._fire(next, value);
		}
		return this;
	}
};

/* function next (fun) //=> Deferred
 *
 * `next` is shorthand for creating new deferred which
 * is called after current queue.
 */
Deferred.next_default = function (fun) {
	var d = new Deferred();
	var id = setTimeout(function () { d.call() }, 0);
	d.canceller = function () { clearTimeout(id) };
	if (fun) d.callback.ok = fun;
	return d;
};
Deferred.next_faster_way_readystatechange = ((location.protocol == "http:") && !window.opera && /\bMSIE\b/.test(navigator.userAgent)) && function (fun) {
	// MSIE
	var d = new Deferred();
	var t = new Date().getTime();
	if (t - arguments.callee._prev_timeout_called < 150) {
		var cancel = false;
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src  = "javascript:";
		script.onreadystatechange = function () {
			if (!cancel) {
				d.canceller();
				d.call();
			}
		};
		d.canceller = function () {
			if (!cancel) {
				cancel = true;
				script.onreadystatechange = null;
				document.body.removeChild(script);
			}
		};
		document.body.appendChild(script);
	} else {
		arguments.callee._prev_timeout_called = t;
		var id = setTimeout(function () { d.call() }, 0);
		d.canceller = function () { clearTimeout(id) };
	}
	if (fun) d.callback.ok = fun;
	return d;
};
Deferred.next_faster_way_Image = ((typeof(Image) != "undefined") && document.addEventListener) && function (fun) {
	// Modern Browsers
	var d = new Deferred();
	var img = new Image();
	var handler = function () {
		d.canceller();
		d.call();
	};
	img.addEventListener("load", handler, false);
	img.addEventListener("error", handler, false);
	d.canceller = function () {
		img.removeEventListener("load", handler, false);
		img.removeEventListener("error", handler, false);
	};
	img.src = "data:,/ _ / X";
	if (fun) d.callback.ok = fun;
	return d;
};
Deferred.next = Deferred.next_faster_way_readystatechange ||
                Deferred.next_faster_way_Image ||
                Deferred.next_default;

/* function wait (sec) //=> Deferred
 *
 * `wait` returns deferred that will be called after `sec` elapsed
 * with real elapsed time (msec)
 *
 * Sample:
 *     wait(1).next(function (elapsed) {
 *         log(elapsed); //=> may be 990-1100
 *     });
 */
Deferred.wait = function (n) {
	var d = new Deferred(), t = new Date();
	var id = setTimeout(function () {
		d.call((new Date).getTime() - t.getTime());
	}, n * 1000);
	d.canceller = function () { clearTimeout(id) };
	return d;
};

/* function call (fun [, args...]) //=> Deferred
 *
 * `call` function is for calling function asynchronous.
 *
 * Sample:
 *     // like tail recursion
 *     next(function () {
 *         function pow (x, n) {
 *             function _pow (n, r) {
 *                 print([n, r]);
 *                 if (n == 0) return r;
 *                 return call(_pow, n - 1, x * r);
 *             }
 *             return call(_pow, n, 1);
 *         }
 *         return call(pow, 2, 10);
 *     }).
 *     next(function (r) {
 *         print([r, "end"]);
 *     });
 *
 */
Deferred.call = function (f /* , args... */) {
	var args = Array.prototype.slice.call(arguments, 1);
	return Deferred.next(function () {
		return f.apply(this, args);
	});
};

/* function parallel (deferredlist) //=> Deferred
 *
 * `parallel` wraps up `deferredlist` to one deferred.
 * This is useful when some asynchronous resources required.
 *
 * `deferredlist` can be Array or Object (Hash).
 *
 * Sample:
 *     parallel([
 *         $.get("foo.html"),
 *         $.get("bar.html")
 *     ]).next(function (values) {
 *         values[0] //=> foo.html data
 *         values[1] //=> bar.html data
 *     });
 *
 *     parallel({
 *         foo: $.get("foo.html"),
 *         bar: $.get("bar.html")
 *     }).next(function (values) {
 *         values.foo //=> foo.html data
 *         values.bar //=> bar.html data
 *     });
 */
Deferred.parallel = function (dl) {
	if (arguments.length > 1) dl = Array.prototype.slice.call(arguments);
	var ret = new Deferred(), values = {}, num = 0;
	for (var i in dl) if (dl.hasOwnProperty(i)) (function (d, i) {
		d.next(function (v) {
			values[i] = v;
			if (--num <= 0) {
				if (dl instanceof Array) {
					values.length = dl.length;
					values = Array.prototype.slice.call(values, 0);
				}
				ret.call(values);
			}
		}).error(function (e) {
			ret.fail(e);
		});
		num++;
	})(dl[i], i);

	if (!num) Deferred.next(function () { ret.call() });
	ret.canceller = function () {
		for (var i in dl) if (dl.hasOwnProperty(i)) {
			dl[i].cancel();
		}
	};
	return ret;
};

/* function earlier (deferredlist) //=> Deferred
 *
 * Continue process when one deferred in `deferredlist` has completed. Others will cancel.
 * parallel ('and' processing) <=> earlier ('or' processing)
 */
Deferred.earlier = function (dl) {
	var ret = new Deferred(), values = {}, num = 0;
	for (var i in dl) if (dl.hasOwnProperty(i)) (function (d, i) {
		d.next(function (v) {
			values[i] = v;
			if (dl instanceof Array) {
				values.length = dl.length;
				values = Array.prototype.slice.call(values, 0);
			}
			ret.canceller();
			ret.call(values);
		}).error(function (e) {
			ret.fail(e);
		});
		num++;
	})(dl[i], i);

	if (!num) Deferred.next(function () { ret.call() });
	ret.canceller = function () {
		for (var i in dl) if (dl.hasOwnProperty(i)) {
			dl[i].cancel();
		}
	};
	return ret;
};


/* function loop (n, fun) //=> Deferred
 *
 * `loop` function provides browser-non-blocking loop.
 * This loop is slow but not stop browser's appearance.
 *
 * Sample:
 *     //=> loop 1 to 100
 *     loop({begin:1, end:100, step:10}, function (n, o) {
 *         for (var i = 0; i < o.step; i++) {
 *             log(n+i);
 *         }
 *     });
 *
 *     //=> loop 10 times
 *     loop(10, function (n) {
 *         log(n);
 *     });
 */
Deferred.loop = function (n, fun) {
	var o = {
		begin : n.begin || 0,
		end   : (typeof n.end == "number") ? n.end : n - 1,
		step  : n.step  || 1,
		last  : false,
		prev  : null
	};
	var ret, step = o.step;
	return Deferred.next(function () {
		function _loop (i) {
			if (i <= o.end) {
				if ((i + step) > o.end) {
					o.last = true;
					o.step = o.end - i + 1;
				}
				o.prev = ret;
				ret = fun.call(this, i, o);
				if (ret instanceof Deferred) {
					return ret.next(function (r) {
						ret = r;
						return Deferred.call(_loop, i + step);
					});
				} else {
					return Deferred.call(_loop, i + step);
				}
			} else {
				return ret;
			}
		}
		return (o.begin <= o.end) ? Deferred.call(_loop, o.begin) : null;
	});
};


/* function repeat (n, fun) //=> Deferred
 *
 * Loop `n` tiems with `fun`.
 * This function automatically return control to browser, if loop time over 20msec.
 * This is useful for huge loop  not to block browser UI.
 *
 * Sample::
 *     repeat(10, function (i) {
 *         i //=> 0,1,2,3,4,5,6,7,8,9
 *     });
 */
Deferred.repeat = function (n, f) {
	var i = 0, end = {}, ret = null;
	return Deferred.next(function () {
		var t = (new Date()).getTime();
		divide: {
			do {
				if (i >= n) break divide;
				ret = f(i++);
			} while ((new Date()).getTime() - t < 20);
			return Deferred.call(arguments.callee);
		}
	});
};

/* function Deferred.register (name, fun) //=> void 0
 *
 * Register `fun` to Deferred prototype for method chain.
 *
 * Sample::
 *     // Deferred.register("loop", loop);
 *
 *     // Global Deferred function
 *     loop(10, function (n) {
 *         print(n);
 *     }).
 *     // Registered Deferred.prototype.loop
 *     loop(10, function (n) {
 *         print(n);
 *     });
 */
Deferred.register = function (name, fun) {
	this.prototype[name] = function () {
		var a = arguments;
		return this.next(function () {
			return fun.apply(this, a);
		});
	};
};

Deferred.register("loop", Deferred.loop);
Deferred.register("wait", Deferred.wait);

/* Deferred.connect (func [, opts: { ok : 0, ng : null, target: null} ]) //=> Function //=> Deferred
 *
 * Connect a function with Deferred.  That is, transform a function
 * that takes a callback into one that returns a Deferred object.
 *
 * Sample::
 *     var timeout = Deferred.connect(setTimeout, { target: window, ok: 0 });
 *     timeout(1).next(function () {
 *         alert('after 1 sec');
 *     });
 */
// Allow to pass multiple values to next.
Deferred.Arguments = function (args) { this.args = Array.prototype.slice.call(args, 0) }
Deferred.connect = function (func, obj) {
	if (!obj) obj = {};
	var callbackArgIndex  = obj.ok;
	var errorbackArgIndex = obj.ng;
	var target            = obj.target;

	return function () {
		var d = new Deferred();

		d.next = function (fun) { return this._post("ok", function () {
			fun.apply(this, (arguments[0] instanceof Deferred.Arguments) ? arguments[0].args : arguments);
		}) };

		var args = Array.prototype.slice.call(arguments, 0);
		if (!(isFinite(callbackArgIndex) && callbackArgIndex !== null)) {
			callbackArgIndex = args.length;
		}
		var callback = function () { d.call(new Deferred.Arguments(arguments)) };
		args.splice(callbackArgIndex, 0, callback);
		if (isFinite(errorbackArgIndex) && errorbackArgIndex !== null) {
			var errorback = function () { d.fail(arguments) };
			args.splice(errorbackArgIndex, 0, errorback);
		}
		Deferred.next(function () { func.apply(target, args) });
		return d;
	}
}

/* Deferred.retry(retryCount, func [, options = { wait : 0 } ])
 *
 * Try func (returns Deferred) max `retryCount`.
 *
 * Sample::
 *     Deferred.retry(3, function () {
 *         return http.get(...);
 *     }).
 *     next(function (res) {
 *         res //=> response if succeeded
 *     }).
 *     error(function (e) {
 *         e //=> error if all try failed
 *     });
 */
Deferred.retry = function (retryCount, funcDeferred/* funcDeferred() return Deferred */, options) {
	if (!options) options = {};

	var wait = options.wait || 0;
	var d = new Deferred();
	var retry = function () {
		var m = funcDeferred(retryCount);
		m.
			next(function (mes) {
				d.call(mes);
			}).
			error(function (e) {
				if (--retryCount <= 0) {
					d.fail(['retry failed', e]);
				} else {
					setTimeout(retry, wait * 1000);
				}
			});
	};
	setTimeout(retry, 0);
	return d;
}

Deferred.define = function (obj, list) {
	if (!list) list = ["parallel", "wait", "next", "call", "loop", "repeat"];
	if (!obj)  obj  = (function getGlobal () { return this })();
	for (var i = 0; i < list.length; i++) {
		var n = list[i];
		obj[n] = Deferred[n];
	}
	return Deferred;
};

//
//
// NicoHTML5
//
//
if(!NicoHTML5) var NicoHTML5 = {};

NicoHTML5.sec2MinSec = function(tm) {
    var m = "000" + Math.floor(tm / 60);
    var s = "00" + Math.floor(tm % 60);
    return m.substr(m.length-3, 3) + ":" + s.substr(s.length-2, 2);
};
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
	    commentInterval: 80,
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

	// video player
	var vp = document.createElement("div");
	vp.className = "videoplayer";
	vp.style.zIndex = 0;
	this.videoPlayer = new NicoHTML5.VideoPlayer(vp, {
	    width: width,
	    height: height,
	    onPlay: function() { self.onPlay(); },
	    onPause: function() { self.onPause(); },
	    onEnded: function() { self.onPause(); },
	    onSeek: function() { self.onSeek(); },
	    onFailed: function(code, msg) { alert(msg); }
	});
	var vc = this.videoPlayer.videoContainer;

	// comment overlay
	if(this.options.overlaytype == "canvas") {
	    var co = document.createElement("canvas");
	    co.className = "commentoverlay";
	    co.style.zIndex = 1;
	    this.commentOverlay = new NicoHTML5.CanvasCommentOverlay(co, width, height);
	} else {
	    var co = document.createElement("div");
	    co.className = "commentoverlay";
	    co.style.zIndex = 1;
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

    getVideo: function() {
	var self = this;

        self.info = {};
	return http.get("/api/getflv/" + self.video_id).next(function(req) {
	    if(req.status != 200)
		throw "response failed.";
	    
	    var info = self.info;
	    
	    var datas = req.responseText.split("&");
	    for(var i=0; i<datas.length; i++) {
		var expr = datas[i].split("=");
		info[expr[0]] = decodeURIComponent(expr[1]);			 
	    }
	    
	    if(info.url == undefined)
		throw "cannot get video url.";
		
	    if(/http:\/\/[^/]+\/smile\?(v|m|s)=/.test(info.url)) {
		if(RegExp.$1 != 'm')
		    throw "this video is not supported.";
	    } else 
		throw "unknown video url";		
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

	return http.jsonp("http://commentproxy.appspot.com/getcomment", {
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

    start: function() {
	var self = this;

	Deferred.next(function() {
	    return self.getVideo();
	}).next(function() {
	    self.log("getvideo() ok");

	    self.createPlayer();
	    self.log("createplayer() ok");

	    self.videoPlayer.load(self.info.url);

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

	    self.log("ready.");
	}).error(function(e) {
	    self.log("error : " + e);
	    alert(e);
	});
    }
};
//
//
// NicoHTML5.VideoPlayer
//
//

NicoHTML5.VideoPlayer = function() {
    this.initialize.apply(this, arguments);
};

NicoHTML5.VideoPlayer.prototype = {

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
	
	var v = document.createElement("video");
	v.className = "videoplayer_video";
	v.width = this.options.width;
	v.height = this.options.height;
	v.autoplay = false;
	v.autobuffer = false;
	
	if(!!navigator.userAgent.match(/iPad/))
	    v.controls = true;
	else
	    v.controls = false;

	v.addEventListener("error",          function() { self.onError(); });
	v.addEventListener("progress",       function() { self.onProgress(); });
	v.addEventListener("loadedmetadata", function() { self.onLoadedMetaData(); });
	v.addEventListener("loadeddata",     function() { self.onLoadedData(); });
	v.addEventListener("canplay",        function() { self.onCanPlay(); });
	v.addEventListener("play",           function() { self.onPlay(); });
	v.addEventListener("playing",        function() { self.onPlaying(); });
	v.addEventListener("seek",           function() { self.onSeek(); });
	v.addEventListener("pause",          function() { self.onPause(); });
	v.addEventListener("ended",          function() { self.onEnded(); });
	//v.addEventListener("volumechange",   function() { self.onVolumeChange(); });
	this.video = v;

	vc.appendChild(v);

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
	
	cc.appendChild(pb);
	cc.appendChild(bb);
	cc.appendChild(sb);
	cc.appendChild(tb);
	cc.appendChild(vbc);

	this.target.appendChild(vc);
	this.target.appendChild(cc);	
    },

    pressPlayButton: function() {
	if(this.video.paused)
	    this.play();
	else
	    this.pause();
    },

    pressBackButton: function() {
	if(this.video.currentTime > 0.0) {
	    this.onSeek(0.0);
	}
    },

    play: function() {
	if(this.video.currentSrc == undefined || this.video.currentSrc == "")
	    return;
	if(this.video.readyState <= 1) // HAVE_METADATA = 1
	    return;

	this.video.play();
    },

    pause: function() {
	this.video.pause();
    },

    load: function(src) {
	this.video.src = src;
	this.video.load();
	if(this.loadTimer) {
	    clearInterval(this.loadTimer);
	    this.laodTimer = null;
	}
    },

    onProgress: function() {
    },

    onLoadedMetaData: function() {
	this.seekbar.setDuration(this.video.duration);
	this.volumebar.setPosition(this.video.volume);
	this.onUpdate();
	
	var self = this;
	if(this.loadTimer == null)
	    this.loadTimer = setInterval(function() { self.onLoadedData(); }, 500);
    },

    onLoadedData: function() {
	if(this.video.buffered.length > 0) {
	    var b = this.video.buffered.end(0);
	    this.seekbar.setBuffered(b);
	}
    },

    onCanPlay: function() {
	if(this.autoplay)
	    this.play();
    },

    onPlay: function() {
    },

    onUpdate: function() {
	this.timeElm.innerHTML = NicoHTML5.sec2MinSec(this.video.currentTime) + 
                                 " / " + 
                                 NicoHTML5.sec2MinSec(this.video.duration);
	this.seekbar.setPosition(this.video.currentTime, false);
    },

    onPlaying: function() {
	var self = this;
	if(this.playTimer == null)
	    this.playTimer = setInterval(function() { self.onUpdate(); }, 100);

	if(this.options.onPlay)
	    this.options.onPlay();
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
	this.video.currentTime = seekTime;	
	this.onUpdate();

	if(this.options.onSeek)
	    this.options.onSeek(seekTime);
    },

    onVolumeChange: function(volume) {
	this.video.volume = volume;
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

//
//
// NicoHTML5.CommentList
//
//

NicoHTML5.CommentList = function() {
    this.initialize.apply(this, arguments);
};

NicoHTML5.CommentList.prototype = {

    initialize: function(target) {
	this.target = target;
	this.createList();	
    },

    createList: function() {
	var head = document.createElement("div");
	head.className = "commentlist_head";

	var head_tm = document.createElement("div");
	head_tm.className = "commentlist_head_time";
	head_tm.innerHTML = "再生時";
	var head_co = document.createElement("div");
	head_co.className = "commentlist_head_comment";
	head_co.innerHTML = "コメント";
	var head_dt = document.createElement("div");
	head_dt.className = "commentlist_head_date";
	head_dt.innerHTML = "書込日時";
	var head_no = document.createElement("div");
	head_no.className = "commentlist_head_no";
	head_no.innerHTML = "コメ番";
	
	head.appendChild(head_tm);
	head.appendChild(head_co);
	head.appendChild(head_dt);
	head.appendChild(head_no);

	var list = document.createElement("ul");
	list.className = "commentlist_list";
	this.list = list;

	this.target.appendChild(head);
	this.target.appendChild(list);
    },

    setComments: function(comments) {
	this.listIndex = [];

	for(var i=0; i < comments.length; i++) {

	    var li = document.createElement("li");
	    li.className="commentlist_comment";
	    
	    var li_tm = document.createElement("div");
	    li_tm.className = "commentlist_comment_time";
	    li_tm.innerHTML = "<p>" + NicoHTML5.sec2MinSec(comments[i].vpos / 100) + "</p>";
	    var li_co = document.createElement("div");
	    li_co.className = "commentlist_comment_comment";
	    li_co.innerHTML = "<p>" + comments[i].content + "</p>";
	    var li_dt = document.createElement("div");
	    li_dt.className = "commentlist_comment_date";
	    li_dt.innerHTML = "<p>" + comments[i].date + "</p>";
	    var li_no = document.createElement("div");
	    li_no.className = "commentlist_comment_no";
	    li_no.innerHTML = "<p>" + comments[i].no + "</p>";

	    li.appendChild(li_tm);
	    li.appendChild(li_co);
	    li.appendChild(li_dt);
	    li.appendChild(li_no);
	    
	    this.list.appendChild(li);
	    this.listIndex.push({vpos: comments[i].vpos, li:li});
	}
    },

    scrollToVpos: function(vpos) {
	var offset = 0;
	for(var i=0; i < this.listIndex.length; i++) {
	    if(this.listIndex[i].vpos > vpos) {
		offset = this.listIndex[i].li.offsetTop;
		break;
	    }
	}

	if(offset - this.list.offsetHeight < 0)
	    this.list.scrollTop + 0;
	else
	    this.list.scrollTop = offset - this.list.offsetHeight;
    }
};
//
//
// NicoHTML5.CommentEngine
//
//

NicoHTML5.CommentEngine = function() {
    this.initialize.apply(this, arguments);
};

NicoHTML5.CommentEngine.prototype = {

    SPEED: 500,
    STOP_SPEED: 300,

    TYPE_NORMAL: 0,
    TYPE_TOP:    1,
    TYPE_BOTTOM: 2,

    SIZE_NORMAL: 0,
    SIZE_SMALL:  1,
    SIZE_BIG:    2,
    
    COLOR: [
	"#FFFFFF",
	"#FF0000",
	"#FF8080",
	"#FFCC00",
	"#FFFF00",
	"#00FF00",
	"#00FFFF",
	"#0000FF",
	"#CC00FF",

	"#CCCC99",
	"#CC0033",
	"#FF6600",
	"#999900",
	"#00CC66",
	"#33FFFC",
	"#6633CC",
	"#000000"
    ],

    initialize: function(width, height, maxShow, callbacks) {
	this.screenWidth = width;
	this.screenHeight = height;
	this.maxShow = maxShow

	this.callbacks = {
	    calculateCommentSize: null,
	    showComments: null,
	    setShowComment: null,
	    removeShowComment: null,
	};
	
	if(callbacks != undefined) {
	    for(var key in callbacks)
		this.callbacks[key] = callbacks[key];
	}

	this.ngUsersRegExp = null;
	this.ngWordsRegExp = null;
	this.comments = null;
	this.showComments = [];
	this.commentPointer = 0;
    },

    createPattern: function(ngclients) {
	if(ngclients == undefined || ngclients.length <= 0) {
	    return "";
	}
	
	var pattern = "(" + ngclients[0].source;
	for(var i=1; i<ngclients.length; i++) {
	    pattern = pattern + "|" + ngclients[i].source;
	}
	pattern = pattern + ")";
	return pattern;
    },

    setNGUsers: function(ngusers) {
	var pattern = this.createPattern(ngusers);
	if(pattern.length > 0)
	    this.ngUsersRegExp = new RegExp("^" + pattern + "$");
	else
	    this.ngUsersRegExp = null;
    },

    setNGWords: function(ngwords) {
	var pattern = this.createPattern(ngwords);
	if(pattern.length > 0)
	    this.ngWordsRegExp = new RegExp(pattern, "i");
	else
	    this.ngWordsRegExp = null;
    },

    setComments: function(comments) {
	this.comments = comments.sort(function(a, b) { return a.vpos - b.vpos; });
	this.commentPointer = 0;
	this.showComments = [];
    },

    getCommentType: function(mail) {
	var type = this.TYPE_NORMAL;
	if(mail) {	
	    if(mail.match(/\bue\b/i))
		type = this.TYPE_TOP;
	    else if(mail.match(/\bshita\b/i))
		type = this.TYPE_BOTTOM;
	}
	return type;
    },
    
    getCommentFontSize: function(mail) {
	var fontSize = this.SIZE_NORMAL;
	if(mail) {
	    if(mail && mail.match(/\bsmall\b/i))
		fontSize = this.SIZE_SMALL;
	    else if(mail && mail.match(/\bbig\b/i))
		fontSize = this.SIZE_BIG;
	}
	return fontSize;
    },

    getCommentColor: function(mail) {
	color = 0; // white
	if(mail) {
	    if(mail.match(/\bred\b/i))
		color = 1;
	    else if(mail.match(/\bpink\b/i))
		color = 2;
	    else if(mail.match(/\borange\b/i))
		color = 3;
	    else if(mail.match(/\byellow\b/i))
		color = 4;
	    else if(mail.match(/\bgreen\b/i))
		color = 5;
	    else if(mail.match(/\bcyan\b/i))
		color = 6;
	    else if(mail.match(/\bblue\b/i))
		color = 7;
	    else if(mail.match(/\bpurple\b/i))
		color = 8;
	    else if(mail.match(/\b(niconicowhite|white2)\b/i))
		color = 9;
	    else if(mail.match(/\b(truered|red2)\b/i))
		color = 10;
	    else if(mail.match(/\b(passionorange|orange2)\b/i))
		color = 11;
	    else if(mail.match(/\b(madyellow|yellow2)\b/i))
		color = 12;
	    else if(mail.match(/\b(elementalgreen|green2)\b/i))
		color = 13;
	    else if(mail.match(/\b(marinblue|blue2)\b/i))
		color = 14;
	    else if(mail.match(/\b(nobleviolet|purple2)\b/i))
		color = 15;
	    else if(mail.match(/\bblack\b/i))
		color = 16;
	}
	return this.COLOR[color];
    },

    isNGComment: function(comment) {
	if(this.ngUsersRegExp && comment.user_id.match(this.ngUsersRegExp))
	    return true;
	if(this.ngWordsRegExp && comment.content.match(this.ngWordsRegExp))
	    return true;
	return false;
    },

    removeShowComment: function(c) {
	for(var i=0; i<this.showComments.length; i++) {
	    if(this.showComments[i] == c) {
		if(this.callbacks.removeShowComment)
		    this.callbacks.removeShowComment(c);
		this.showComments.splice(i, 1);
		return;
	    }
	}
    },

    removeAllShowComments: function() {
	for(var i=0; i<this.showComments.length; i++) {
	    if(this.callbacks.removeShowComment)
		this.callbacks.removeShowComment(this.showComments[i]);
	}
	this.showComments = [];
    },

    setShowComment: function(comment, vpos) {
	if(this.isNGComment(comment))
	    return;

	var type     = this.getCommentType(comment.mail);
	var fontSize = this.getCommentFontSize(comment.mail);
	var color    = this.getCommentColor(comment.mail);

	var firevpos = comment.vpos;
	firevpos += (type == 0 ? this.SPEED : this.STOP_SPEED);
	if(firevpos < vpos)
	    return;

	if(this.showComments.length > this.maxShow)
	    return;

	var c = {
	    c :       comment,
	    type:     type,
	    fontSize: fontSize,
            color:    color,
	    pos:      { x: 0, y: 0 },
	    size:     { width: 0, height: 0 },
	    speed:    0.0,
	    isMine:   false,
	};

	if(this.callbacks.calculateCommentSize)
	    this.callbacks.calculateCommentSize(c);

	this.showComments.push(c);

	// set beginning position
	switch(type) {
	case this.TYPE_NORMAL: 
	    this.setPositionNormal(c, vpos); break;
	case this.TYPE_TOP: 
	    this.setPositionTop(c); break;
	case this.TYPE_BOTTOM: 
	    this.setPositionBottom(c); break;
	}

	this.checkDanmaku(c);

	if(this.callbacks.setShowComment)
	    this.callbacks.setShowComment(c);
    },

    checkDanmaku: function(c) {
	if(c.pos.y + c.size.height > this.screenHeight || c.pos.y < 0)
	    c.pos.y =  Math.floor( Math.random * (this.screenHeight - c.size.height) );
    },

    getPositionAtVpos: function (vpos, screenx, startpos, speed) {
	return Math.floor( (screenx - ( speed * (vpos - startpos) )) - (screenx * 0.2) );
    },

    checkCollisionWidth: function(c1, c2, vpos, screenx) {
	var c1x = this.getPositionAtVpos(vpos, screenx, 
					   c1.c.vpos, c1.speed);
	var c2x = this.getPositionAtVpos(vpos, screenx, 
					   c2.c.vpos, c2.speed);

	if(c1.c.vpos <= c2.c.vpos) {
	    if(c1x + c1.size.width + 10 > c2x)
		return true;
	} else {
	    if(c2x + c2.size.width + 10 > c1x)
		return true;
	}
	return false;
    },

    checkCollisionHeight: function(c1, c2) {
	var c1_top = c1.pos.y;
	var c1_bottom = c1.pos.y + c1.size.height;
	var c2_top = c2.pos.y;
	var c2_bottom = c2.pos.y + c2.size.height;

	var b1 = (c1_top >= c2_top && c1_top <= c2_bottom) ||
	         (c1_bottom >= c2_top && c1_bottom <= c2_bottom);
	var b2 = (c2_top >= c1_top && c2_top <= c1_bottom) ||
	         (c2_bottom >= c1_top && c2_bottom <= c1_bottom);

	return (b1 || b2);
    },

    setPositionNormal: function(c, vpos) {
	c.speed = (this.screenWidth + c.size.width * 2) / this.SPEED;
	c.pos.x = this.getPositionAtVpos(vpos, this.screenWidth, c.c.vpos, c.speed);
	c.pos.y = 0;

	var repeat;
	do {
	    var ty = 0;
	    repeat = false;

	    for(var i=0; i<this.showComments.length; i++) {
		var other = this.showComments[i];
		if(c == other)
		    continue;
		if(c.type != other.type)
		    continue;
		
		if(this.checkCollisionHeight(c, other)) {
		    if(this.checkCollisionWidth(c, other, vpos + this.SPEED, this.screenWidth) ||
                       this.checkCollisionWidth(c, other, vpos + (this.SPEED/2), this.screenWidth) ||
		       this.checkCollisionWidth(c, other, vpos, this.screnWidth)) {
			if(ty < other.size.height)
			    ty = other.size.height;
			repeat = true;
		    }
		}
	    }
	    
	    if(repeat)
		c.pos.y += ty + 1;
	    
	} while(c.pos.y + c.size.height < this.screenHeight && repeat);
    },

    setPositionTop: function(c) {
	c.pos.x = (this.screenWidth - c.size.width) / 2;
	c.pos.y = 0;

	var repeat;
	do {
	    var ty = 0;
	    repeat = false;

	    for(var i=0; i<this.showComments.length; i++) {
		var other = this.showComments[i];
		if(c == other)
		    continue;
		if(c.type != other.type)
		    continue;
		
		if(this.checkCollisionHeight(c, other)) {
		    if(ty < other.size.height)
			ty = other.size.height;
		    repeat = true;
		}
	    }
	    
	    if(repeat)
		c.pos.y += ty + 1;

	} while(c.pos.y + c.size.height < this.screenHeight && repeat);
    },

    setPositionBottom: function(c) {
	c.pos.x = (this.screenWidth - c.size.width) / 2;
	c.pos.y = this.screenHeight - c.size.height;

	var repeat;
	do {
	    var ty = 0;
	    repeat = false;

	    for(var i=0; i<this.showComments.length; i++) {
		var other = this.showComments[i];
		if(c == other)
		    continue;
		if(c.type != other.type)
		    continue;
		
		if(this.checkCollisionHeight(c, other)) {
		    if(ty < other.size.height)
			ty = other.size.height;
		    repeat = true;
		}
	    }
	    
	    if(repeat)
		c.pos.y -= ty + 1;

	} while(c.pos.y > 0 && repeat);	
    },

    moveComments: function(currentTime) {
	var vpos = Math.floor(currentTime * 100.0);

	// move comments
	for(var i=0; i<this.showComments.length; i++) {
	    var c = this.showComments[i];

	    if(c.type == this.TYPE_NORMAL)
		c.pos.x = this.getPositionAtVpos(vpos, this.screenWidth, c.c.vpos, c.speed);
	    
	    var expire = vpos - c.c.vpos;
	    if((expire > this.SPEED      && c.type == this.TYPE_NORMAL) ||
	       (expire > this.STOP_SPEED && c.type != this.TYPE_NORMAL))
		this.removeShowComment(c);
	}

	// create comment layer
	var count = 0;
	if(this.commentPointer < this.comments.length) {
	    var comment = this.comments[this.commentPointer];
	    while(comment.vpos <= vpos) {
		this.setShowComment(comment, vpos);

		this.commentPointer++;
		if(this.commentPointer >= this.comments.length)
		    break;

		comment = this.comments[this.commentPointer];
		if(++count > 8)
		    break;
	    }
	}

	if(this.callbacks.showComments)
	    this.callbacks.showComments(this.showComments);

    },

    jump: function(currentTime) {
	this.removeAllShowComments();

	var vpos = Math.floor(currentTime * 100.0);

	this.commentPointer = 0;
	for(var i=0; i<this.comments.length; i++) {
	    if(this.comments[i].vpos < vpos - 500)
		this.commentPointer++;
	    else
		break;
	}	    
    }
};
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
(function() {

    if(navigator.userAgent.indexOf('AppleWebKit/') > -1) {
        if(/watch\/([^/]+)$/.test(location.href)) {
	    var video_id = RegExp.$1;
	    document.getElementById("old_flash_player_warning").innerHTML = "";
	    
	    var container = document.getElementById("flvplayer_container");
	    container.innerHTML = "";
	    
	    var css = document.createElement("link");
	    css.rel = "stylesheet";
	    css.href = "http://labs.isidesystem.net/nicoh5/nicohtml5.css";
	    css.type = "text/css";
	    document.getElementsByTagName("head")[0].appendChild(css);
	    
	    var overlayType = 'canvas';
	    if(NicoHTML5_OverlayType)
		overlayType = NicoHTML5_OverlayType;

	    var commentInterval = 50;
	    if(NicoHTML5_CommentInterval)
		commentInterval = NicoHTML5_CommentInterval;

	    var videoInfo = {};
	    if(Video) {
		videoInfo = {
		    duration: Video.length,		    
		    viewCount: Video.viewCount,
		    commentCount: 0,
		    mylistCount: Video.mylistCount,
		    thumbnail: Video.thumbnail
		    };
	    }

	    nicohtml5_player = new NicoHTML5.Player(video_id, container, { 
		overlaytype: overlayType, 
		commentInterval: commentInterval,
		videoInfo: videoInfo
	    });
	    
	    nicohtml5_player.start();
	}	
    } else {
	alert("Sorry, Your browser is not supported.")
    }

})();
