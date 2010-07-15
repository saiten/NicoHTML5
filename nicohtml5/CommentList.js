
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
	    var dt = new Date();
	    dt.setTime(comments[i].date * 1000);
	    var datestr = (dt.getMonth()+1) + "/" + dt.getDate() + " " 
                        + dt.getHours() + ":" + dt.getMinutes();
	    li_dt.innerHTML = "<p>" + datestr + "</p>";

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
	    this.list.scrollTop = 0;
	else
	    this.list.scrollTop = offset - this.list.offsetHeight;
    }
};
