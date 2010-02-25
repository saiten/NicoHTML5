(function() {

    function loader(src, check, next) {
	check = new Function('return !!(' + check + ')');
	if(!check()) {
	    var script = document.createElement('script');
	    script.src = src;
	    script.onload = next;
	    document.body.appendChild(script);
	} else next();
    }

    if(navigator.userAgent.indexOf('AppleWebKit/') > -1) {

	loader("http://labs.isidesystem.net/nicoh5/lib/http.js",       
	       "window.xhttp", function() {
        loader("http://labs.isidesystem.net/nicoh5/lib/jsdeferred.js", 
	       "window.Deferred", function() {
			      
        loader("http://labs.isidesystem.net/nicoh5/nicohtml5/NicoHTML5.js",  
	       "window.NicoHTML5", function() {
	loader("http://labs.isidesystem.net/nicoh5/nicohtml5/Player.js",      
	       "window.NicoHTML5.Player", function() {
        loader("http://labs.isidesystem.net/nicoh5/nicohtml5/VideoPlayer.js", 
	       "window.NicoHTML5.VideoPlayer", function() {
        loader("http://labs.isidesystem.net/nicoh5/nicohtml5/Seekbar.js",     
	       "window.NicoHTML5.Seekbar", function() {
        loader("http://labs.isidesystem.net/nicoh5/nicohtml5/CommentList.js", 
	       "window.NicoHTML5.CommentList", function() {
        loader("http://labs.isidesystem.net/nicoh5/nicohtml5/CommentEngine.js", 
	       "window.NicoHTML5.CommentEngine", function() {
        loader("http://labs.isidesystem.net/nicoh5/nicohtml5/CanvasCommentOverlay.js", 
	       "window.NicoHTML5.CanvasCommentOverlay", function() {
        loader("http://labs.isidesystem.net/nicoh5/nicohtml5/DOMCommentOverlay.js", 
	       "window.NicoHTML5.DOMCommentOverlay", function() {

            if(/watch\/([^/]+)$/.test(location.href)) {
		var video_id = RegExp.$1;
		document.getElementById("old_flash_player_warning").innerHTML = "";
		
		var container = document.getElementById("flvplayer_container");
		container.innerHTML = "";
		
		var css = document.createElement("link");
		css.rel = "stylesheet";
		css.href = "http://labs.isidesystem.net/nicoh5/nicoh5.css";
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

       })})})})})})})})})});

    } else {
	alert("Sorry, Your browser is not supported.")
    }

})();