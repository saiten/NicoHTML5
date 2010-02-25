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
