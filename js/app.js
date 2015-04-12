var ios = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
var sprite = [
    [-205, -37, 232, 105, "feature0", 1500 + 300],
    [-101, -192, 432, 210, "feature1"],
    [-51, -448, 542, 183, "feature2", 600],
    [-138, -709, 357, 75, "feature3", 1500 + 300],
    [-101, -867, 418, 53, "feature4", 2200 + 300],
];

var src = "images/page2-info.png";
var spriteWidth = 640
var spriteHeight = 927
var myScroll;


var reqAnimationFrame = (function() {
    return window[Hammer.prefixed(window, "requestAnimationFrame")] || function(callback) {
        setTimeout(callback, 1000 / 60);
    }
})();

function dirProp(direction, hProp, vProp) {
    return (direction & Hammer.DIRECTION_HORIZONTAL) ? hProp : vProp
}


/**
 * Carousel
 * @param container
 * @param direction
 * @constructor
 */
function HammerCarousel(container, direction) {
    this.container = container;
    this.direction = direction;

    this.panes = Array.prototype.slice.call(this.container.children, 0);
    this.containerSize = this.container[dirProp(direction, 'offsetWidth', 'offsetHeight')];

    this.currentIndex = 0;

    this.hammer = new Hammer.Manager(this.container);
    this.hammer.add(new Hammer.Pan({
        direction: this.direction,
        threshold: 10
    }));
    this.hammer.on("panstart panmove panend pancancel", Hammer.bindFn(this.onPan, this));

    this.show(this.currentIndex);
}


HammerCarousel.prototype = {
    /**
     * show a pane
     * @param {Number} showIndex
     * @param {Number} [percent] percentage visible
     * @param {Boolean} [animate]
     */
    show: function(showIndex, percent, animate) {
        showIndex = Math.max(0, Math.min(showIndex, this.panes.length - 1));
        percent = percent || 0;
        var className = this.container.className;
        if (animate) {
            if (className.indexOf('animate') === -1) {
                this.container.className += ' animate';
            }
        } else {
            if (className.indexOf('animate') !== -1) {
                this.container.className = className.replace('animate', '').trim();
            }
        }

        var scale, scaleStr;

        var paneIndex, pos, translate;
        for (paneIndex = 0; paneIndex < this.panes.length; paneIndex++) {

            pos = (this.containerSize / 100) * (((paneIndex - showIndex) * 100) + percent);

            var modifier = paneIndex === 0 ? .3 : 1;
            translate = 'translate3d(0, ' + pos * modifier + 'px, 0)'
                // tmp:
            var tmp = percent;
            if (this.currentIndex === 1 && percent >= 0) {
                tmp = 100 - percent;
            }
            scale = paneIndex === 0 ? (1 - Math.abs(tmp * 0.002)) : 1;
            console.log('percent and scale is', percent, scale);
            scaleStr = 'scale(' + scale + ')';
            this.panes[paneIndex].style.transform = translate + " " + scaleStr;
            this.panes[paneIndex].style.mozTransform = translate + " " + scaleStr;
            this.panes[paneIndex].style.webkitTransform = translate + " " + scaleStr;
        }

        this.currentIndex = showIndex;


    },

    /**
     * handle pan
     * @param {Object} ev
     */
    onPan: function(ev) {

        var pauseHammer;

        if (this.currentIndex === 1) {
            pauseHammer = true;
            if (myScroll.y === 0 && ev.direction === Hammer.DIRECTION_DOWN) {
                myScroll.disable();
                if (ev.type == "panstart") {
                    this.inTransition = true;
                }
                pauseHammer = false;
            }
            console.log('in onpan', myScroll.y, this.inTransition);
            if (ev.direction != Hammer.DIRECTION_DOWN && this.inTransition) {
                pauseHammer = false;
            }
            if (ev.type == 'panend') {
                this.inTransition = false;
                // very lite, just a prop changed
                myScroll.enable();
            }
        }


        if (pauseHammer) return;
        ev.preventDefault();

        var delta = dirProp(this.direction, ev.deltaX, ev.deltaY);
        var percent = (100 / this.containerSize) * delta || 0;

        var animate = false;
        var shouldChangeIndex;
        if (ev.type == 'panend' || ev.type == 'pancancel') {
            if (Math.abs(percent) > 20 && ev.type == 'panend') {
                if (this.currentIndex === 0 && percent > 0) {
                    percent = 0;
                } else {
                    percent = percent < 0 ? -100 : 100;
                    shouldChangeIndex = true;
                }
            } else {
                percent = 0;
            }
            animate = true;
        }


        this.show(this.currentIndex, percent, animate);
        if (shouldChangeIndex) {
            this.currentIndex += (percent < 0) ? 1 : -1;
            if (this.currentIndex < 0) this.currentIndex = 0;
            if (animate && this.currentIndex === 1) {
                
                setTimeout(function() {
                    $('.upper').sprite({
                        sprite: sprite,
                        width: spriteWidth,
                        height: spriteHeight,
                        src: src
                    });
                }, 100)
            }
        }
    }
};




(function init() {

    var deferred = $.Deferred();
    imgLoadPromise = deferred.promise();
    var imgLoad = imagesLoaded('.img-preload');
    imgLoad.on('always', function() {
        var anythingBroken = imgLoad.images.some(function(img) {
            if (!img.isLoaded) {
                return true;
            }
        })
        if (anythingBroken) return alert("有图死啦，再刷新下试试");
        // we can put reject here as well
        deferred.resolve();
    });

    var outer = new HammerCarousel(document.querySelector(".container"), Hammer.DIRECTION_VERTICAL);
    var pe = new PrintEffect(".words");
    

    var d2 = $.Deferred();
    page2Promise = d2.promise();
    $(window).on('load', function() {
        // temporarily it is a global used by Hammer event
        myScroll = new IScroll('.page2', {
            scrollX: false,
            scrollY: true,
            momentum: true,
            bounce: false
        });
        d2.resolve();
    })

    var d3 = $.Deferred();
    bgMusicPromise = d3.promise();
    var bgMusic = new Howl({
        urls: ["sounds/march.mp3", "sounds/march.ogg"],
        loop:true,
        onload: function() {
            d3.resolve();
        }
    });

    $.when(pe, imgLoadPromise, page2Promise, bgMusicPromise).done(function() {
        $('.mask-layer').hide();
        if (ios) {
            $(".play-mask").show()
            $(document).one('touchstart', function() {
                $('.play-mask').hide();
                play();
            });
        } else {
            setTimeout(function () {
                // body...
                play();

            }, 500)
        }

        function play() {
            pe.play(function() {
                // add arrow indicator
                setTimeout(function() {
                    bgMusic.play();
                    $('.arrow1').show();

                }, 500)
            });
        }
    });

})();






var btn = [117, 2389, 415, 82];
