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

	var rootUrl = "http://labs.isidesystem.net/nicoh5";

	loader(rootUrl + "/lib/http.js",
	       "window.xhttp", function() {
        loader(rootUrl + "/lib/jsdeferred.js", 
	       "window.Deferred", function() {
			      
        loader(rootUrl + "/nicohtml5/NicoHTML5.js",  
	       "window.NicoHTML5", function() {
	loader(rootUrl + "/nicohtml5/Player.js",      
	       "window.NicoHTML5.Player", function() {
        loader(rootUrl + "/nicohtml5/VideoPlayer.js", 
	       "window.NicoHTML5.VideoPlayer", function() {
        loader(rootUrl + "/nicohtml5/QTVideoPlayer.js", 
	       "window.NicoHTML5.QTVideoPlayer", function() {
        loader(rootUrl + "/nicohtml5/Seekbar.js",     
	       "window.NicoHTML5.Seekbar", function() {
        loader(rootUrl + "/nicohtml5/CommentList.js", 
	       "window.NicoHTML5.CommentList", function() {
        loader(rootUrl + "/nicohtml5/CommentEngine.js", 
	       "window.NicoHTML5.CommentEngine", function() {
        loader(rootUrl + "/nicohtml5/CanvasCommentOverlay.js", 
	       "window.NicoHTML5.CanvasCommentOverlay", function() {
        loader(rootUrl + "/nicohtml5/DOMCommentOverlay.js", 
	       "window.NicoHTML5.DOMCommentOverlay", function() {

            document.title = "[NicoHTML5 DEV]" + document.title;
            NicoHTML5_StyleSheet = "http://labs.isidesystem.net/nicoh5/nicohtml5-dev.css";

	    loader(rootUrl + "/main.js", "false", function() {});

        })})})})})})})})})
        })});
    }
})();