(function() {

    if(navigator.userAgent.indexOf('AppleWebKit/') > -1) {
        if(/watch\/([^/]+)$/.test(location.href)) {
	    var video_id = RegExp.$1;
	    document.getElementById("old_flash_player_warning").innerHTML = "";
	    
	    var container = document.getElementById("flvplayer_container");
	    container.innerHTML = "";

	    var cssUrl = "http://labs.isidesystem.net/nicoh5/nicohtml5.css";
	    if(typeof NicoHTML5_StyleSheet != 'undefined')
		cssUrl = NicoHTML5_StyleSheet;
	    
	    var videoPlayer = 'video';
	    if(typeof NicoHTML5_VideoPlayer != 'undefined')
		videoPlayer = NicoHTML5_VideoPlayer;

	    var enableXHttp = false;
	    if(typeof NicoHTML5_EnableXHttp != 'undefined')
		enableXHttp = NicoHTML5_EnableXHttp;
	    
	    var overlayType = 'canvas';
	    if(typeof NicoHTML5_OverlayType != 'undefined')
		overlayType = NicoHTML5_OverlayType;

	    var commentInterval = 120;
	    if(typeof NicoHTML5_CommentInterval != 'undefined')
		commentInterval = NicoHTML5_CommentInterval;

	    var css = document.createElement("link");
	    css.rel = "stylesheet";
	    css.href = cssUrl;
	    css.type = "text/css";
	    document.getElementsByTagName("head")[0].appendChild(css);
	    
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
		videoplayer: videoPlayer,
		overlaytype: overlayType, 
		commentInterval: commentInterval,
		enableXHttp: enableXHttp,
		videoInfo: videoInfo
	    });
	    
	    nicohtml5_player.prepare();
	}	
    } else {
	alert("Sorry, Your browser is not supported.")
    }

})();
