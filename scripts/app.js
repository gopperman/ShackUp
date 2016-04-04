function shackUp() {
	this.baseURI = document.URL;
	this.pos = 0;
	this.body = $('body');
	// App state
	this.saved = [];
	this.queue = listings;

	this.init = function() {
		this.registerClickHandlers();
	};

	this.love = function() {
		var listing = $( this ).parents( '.listing' );
		listing.animate( {
			opacity: 0,
			left: '+=100%',
		}, 300, function() {
			shack.saved.push( listing.detach() );
		});		
	};

	this.hate = function() {
		$( this ).parents( '.listing' ).animate( {
			opacity: 0,
			left: '-=100%',
		}, 300, function() {
			this.remove();
		});
	};

	this.registerClickHandlers = function() {
		var love = $( '.listing__like-button' );
		var hate = $( '.listing__pass-button' );

		love.click( this.love );
		hate.click( this.hate );
	};

}

var shack = shack || new shackUp();

$(document).ready( function() {
	// Click handlers
	shack.init();

	$('.nav-menu').click( function() {
		$( '.menu' ).toggleClass ( 'menu-open' );
		$( '.overlay' ).fadeToggle( 400, 'linear' );
	});

	$( '.nav-list' ).click( function() {
		$( '.saved' ).toggleClass ( 'saved-open' );
		$( '.container' ).toggleClass( 'panel-open' );
		$( '.nav-logo').toggleClass( 'active' );
		$( this ).toggleClass ( 'active' );
	});

	$( '.overlay' ).click( function( event ) {
		$( '.menu' ).removeClass( 'menu-open' );
		$( '.overlay' ).fadeToggle( 200, 'linear' );
	});

	// Listing magic
	$('.listing__gallery').click( function( event ) {
		var gallery = $( this );
		var listing = $('.listing');
		if ( listing.hasClass( 'listing--detailed') ) {
			event.stopPropagation();
			listing.removeClass('listing--detailed');
			gallery.unslider('destroySwipe');
			gallery.unslider('destroyKeys');
			$('.unslider-nav').css( 'display', 'none');
		} else {
			listing.addClass( 'listing--detailed' );
			gallery.removeClass( 'stopped' );
			if ( ! gallery.hasClass( 'initialized' ) ) {
				gallery.unslider({
					arrows: false,
					autoplay: false,
					speed: 500,
					complete: function() {},
					keys: true,               
					nav: true,               
					fluid: true
				});
				gallery.addClass( 'initialized' );
			} else {
				console.log('ok');
				gallery.unslider('initSwipe');
				gallery.unslider('initKeys');
				$('.unslider-nav').css( 'display', 'block' );
			}
		}
	});

});
