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
	    if(typeof NicoHTML5_OverlayType != 'undefined')
		overlayType = NicoHTML5_OverlayType;

	    var commentInterval = 120;
	    if(typeof NicoHTML5_CommentInterval != 'undefined')
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
	    
	    nicohtml5_player.prepare();
	}	
    } else {
	alert("Sorry, Your browser is not supported.")
    }

})();
