/**
 * author: wangxi
 * desc: manipulate sprite position and its animation
 */

var _spriteDefaults = {

}

$.fn.sprite = function(opts) {
	if(this.data('sprite-called')) return;
	var $this = this;
	var containerWidth = $this.width();

	var arr = [];
	var w = opts.width, h = opts.height;
	var src = opts.src;

	var ratio = containerWidth / w;

	opts.sprite.forEach(function(item, i) {
	    var $div = $('<div>').css({
	        backgroundSize: containerWidth + "px " + h * ratio + "px",
	        backgroundPosition: item[0] * ratio + "px " + item[1] * ratio + "px",
	        position: "absolute",
	        left: -item[0] * ratio,
	        top: -item[1] * ratio,
	        width: Math.floor(item[2] * ratio),
	        height: Math.floor(item[3] * ratio),
	        backgroundImage: "url(" + src + ")",
	        backgroundRepeat: "no-repeat"
	    })
	    $div.hide();        
	    var delay = item[5] || 0;        
	    setTimeout(function () {                
	        $div.show().addClass(item[4] || "");
	    }, delay)
	    
	    arr.push($div);
	    $this.append($div);
	});

	this.data('sprite-called', true);
};