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
