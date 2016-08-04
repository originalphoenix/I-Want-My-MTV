(function($) {
	"use strict";

	// Var
	var body = $('body');
	var btHomeLayer = $('.home-layer');
	var btLayer = $('.bt-layer');
	var navToggle = $('.nav-toggle');
	var overlayNav = $('.overlay-nav');
	var pageOverlay = $('.page-overlay .page-o');
	var navOverlay = $('.nav-overlay .nav-o');

	var navLayer_timeout;
	var navLayer_timeout_2;
	var openHome_timeout;

	// BOOTSTRAP FIX FOR WINPHONE 8 AND IE10
	if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
		var msViewportStyle = document.createElement('style');
		msViewportStyle.appendChild(
			document.createTextNode(
				'@-ms-viewport{width:auto!important}'
			)
		);
		document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
	}

	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		$('body').addClass('mobile');
	}

	function detectIE() {
		if (navigator.userAgent.indexOf('MSIE') != -1)
			var detectIEregexp = /MSIE (\d+\.\d+);/ // test for MSIE x.x
		else // if no "MSIE" string in userAgent
			var detectIEregexp = /Trident.*rv[ :]*(\d+\.\d+)/ // test for rv:x.x or rv x.x where Trident string exists

		if (detectIEregexp.test(navigator.userAgent)){ // if some form of IE
			var ieversion=new Number(RegExp.$1) // capture x.x portion and store as a number
			if (ieversion >= 9) {
				return true;
			}
		}
		return false;
	}

	function getWindowWidth() {
		return Math.max( $(window).width(), window.innerWidth);
	}

	function getWindowHeight() {
		return Math.max( $(window).height(), window.innerHeight);
	}

	function isTouchSupported() {
		var msTouchEnabled = window.navigator.msMaxTouchPoints;
		var generalTouchEnabled = "ontouchstart" in document;
		if (msTouchEnabled || generalTouchEnabled) {
			return true;
		}
		return false;
	}

	jQuery.fn.setAllToMaxHeight = function(){
		return this.css({ 'height' : '' }).height( Math.max.apply(this, jQuery.map( this , function(e){ return jQuery(e).height() }) ) );
	};


	// Preloader
	function initPreloader() {
		var preloaderDelay = 350;
		var	preloaderFadeOutTime = 800;

		function hidePreloader() {
			var preloader = $('#preloader');

			preloader.delay(preloaderDelay).fadeOut(preloaderFadeOutTime);
		}

		hidePreloader();
	}


	// Animations
	function initAnimations() {
		var windowWidth = getWindowWidth();

		if(windowWidth <=991 || $('body').hasClass('mobile')) {
			$('.animated').css({
				'display':'block',
				'visibility':'visible'
			});
		} else {
			if( detectIE() ) {
				$('.animated').css({
					'display':'block',
					'visibility':'visible'
				});
			} else {
				$('.animated').on('appear', function() {
					var elem = $(this);
					var animation = elem.data('animation');
					if ( !elem.hasClass('visible') ) {
						var animationDelay = elem.data('animation-delay');
						if ( animationDelay ) {
							setTimeout(function(){
								elem.addClass( animation + ' visible' );
							}, animationDelay);
						} else {
							elem.addClass( animation + ' visible' );
						}
					}
				});

				/* Starting Animation on Load */
				$(window).load(function() {
					$('.onstart').each( function() {
						var elem = $(this);
						if ( !elem.hasClass('visible') ) {
							var animationDelay = elem.data('animation-delay');
							var animation = elem.data('animation');
							if ( animationDelay ) {
								setTimeout(function(){
									elem.addClass( animation + " visible" );
								}, animationDelay);
							} else {
								elem.addClass( animation + " visible" );
							}
						}
					});
				});
			}
		}
	}


	// Fullscreen Elements
	function initFullscreenElements() {
		$('.fullscreen-element').each(function(){
			$(this).css('min-height', getWindowHeight());
		});
		$('.equal-section').each(function(){
			$(this).find('.equal-col').setAllToMaxHeight();
		});
	}


	// Background
	function initPageBackground() {

		// Youtube Video Background
		if($('body').hasClass('youtube-background')) {
			$('.player').each(function() {
				$('.player').mb_YTPlayer();
			});
		}
	}


	// Plugins
	function initPlugins() {
		// Responsive Video - FitVids
		$('.video-container').fitVids();

		// Placeholder
		$('input, textarea').placeholder();

		// Tooltip
		$('[data-toggle="tooltip"]').tooltip();

		// Popover
		$('[data-toggle="popover"]').popover();

	}

	// WINDOW.LOAD FUNCTION
	$(window).load(function() {
		initPreloader();
	});

	// DOCUMENT.READY FUNCTION
	jQuery(document).ready(function($) {
		initFullscreenElements();
		initAnimations();
		initPageBackground();
		initPlugins();
	});

	// WINDOW.RESIZE FUNCTION
	$(window).on('resize', function () {
		initAnimations();
		initFullscreenElements();
	});



})(jQuery);
