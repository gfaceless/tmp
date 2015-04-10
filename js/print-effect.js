/**
 * author: wangxi
 * not mature yet. under developing. 
 * dependencies: jquery(or zepto with promise support)
 * usage:
 * var foo = new PrintEffect(container, otps);
 * foo.play();
 */

var ios = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

function PrintEffect(container, opts) {
	var $container = $(container);
	var defaults = {
		// text: "摇滚运动会",
		// images: ["../images/01.jpg", "../images/02.jpg", "../images/03.jpg", "../images/04.jpg"],

		animSpan: 250,
		soundUrls: ["sounds/p3.ogg", "sounds/p3.mp3"],
		/*src: "img/sprite.jpg",
		sprite: [
			[-0, -0, 50, 50],
			[-50, -0, 50, 50],
			[-100, -0, 50, 50],
			[-150, -0, 50, 50]
		],
		spriteWidth: 250,
		spriteHeight: 202,*/
		src: "images/words.png",
		sprite: [
			[-80, 0, 159, 128],
			[-241, 0, 159, 128],
			[-400, 0, 163, 128],
			[-14, -212, 121, 108, 800],
			[-135, -212, 119, 108, 200],
			[-255, -212, 120, 108, 200],
			[-375, -212, 120, 108, 200],
			[-496, -212, 122, 108, 200],
			[-113, -148, 414, 39, 1000],
		],
		//tmp, will automatically get this later
		spriteWidth: 640,
		spriteHeight: 321

	};

	opts = $.extend({}, defaults, opts);
	this.opts = opts;
	var containerWidth = $container.width();


	var ratio = containerWidth / opts.spriteWidth;

	// `this.elements` is a jq collection
	var arr = this.elements = [];
	opts.sprite.forEach(function(item, i) {
		var item = opts.sprite[i];
		var $div = $("<div>");
		$div.css({
			backgroundSize: containerWidth + "px " + opts.spriteHeight * ratio + "px",
			backgroundPosition: item[0] * ratio + "px " + item[1] * ratio + "px",
			position: "absolute",
			left: -item[0] * ratio,
			top: -item[1] * ratio,
			width: Math.floor(item[2] * ratio),
			height: Math.floor(item[3] * ratio),
			transform: "translateZ(0)",
			backgroundImage: "url(" + opts.src + ")",
			backgroundRepeat: "no-repeat",
			display: 'none'
		})
		arr.push($div);
		$container.append($div);

	});

	var deferred = $.Deferred();
	deferred.promise(this);

	this.sound = new Howl({
		urls: opts.soundUrls,
		onload: function() {
			deferred.resolve();
		}
	})
	s = this.sound;

}


PrintEffect.prototype.play = function(cb) {
	var pe = this;
	var opts = this.opts;
	var sprite = opts.sprite;
	var elements = pe.elements;
	var sound = this.sound;
	// this.done(_play);
	// we assume by the time this function is called,
	// all prerequisite has been met
	// 

	animate();

	function _play(params) {

		if (ios) {
			$(document).on('touchstart', function() {
				animate();
			})
		} else {
			animate();
		}
	}
	var time1 
	function animate() {
		animate.counter = animate.counter || 0;		
		var lastId;
		var delay;
		if (animate.counter === 0) { 
			delay = 0;
			time1 = Date.now();
			sound.play();
		} else {
			delay = sprite[animate.counter] && sprite[animate.counter][4] || opts.animSpan;
		}
		if(animate.counter === elements.length - 1) {
			var time2 = Date.now();
			console.log(time2 - time1);
		}
		console.log(delay);
		setTimeout(function() {

			// we need iteration go one more time to clip extra sound.
			// as well as trigger the end hook
			if (animate.counter == elements.length) {
				// sound.pause(lastId);
				cb();
				return;
			}

			elements[animate.counter].show()

			// callback: Function (optional) 
			// Fires when playback begins and returns the soundId, which is the unique identifier for this specific playback instance.
			// see #https://github.com/goldfire/howler.js#user-content-methods
			// we give it a callback to get id of the last sound instance

			/*var callback = animate.counter === elements.length - 1 ? _callback : $.noop;

			function _callback(id) {				
				lastId = id;
			}*/
			animate.counter++;
			animate();
		}, delay);

	}
};
