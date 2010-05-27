#!/bin/sh

target=nicohtml5.js
tempfile=${target}.tmp.js

cat /dev/null > $tempfile

cat lib/http.js >> $tempfile
cat lib/jsdeferred.js >> $tempfile

cat nicohtml5/NicoHTML5.js >> $tempfile
cat nicohtml5/Player.js >> $tempfile
cat nicohtml5/VideoPlayer.js >> $tempfile
cat nicohtml5/Seekbar.js >> $tempfile
cat nicohtml5/CommentList.js >> $tempfile
cat nicohtml5/CommentEngine.js >> $tempfile
cat nicohtml5/DOMCommentOverlay.js >> $tempfile
cat nicohtml5/CanvasCommentOverlay.js >> $tempfile
cat main.js >> $tempfile

cp $tempfile $target
yuicompressor -o $target $tempfile
rm -f $tempfile

