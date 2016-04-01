function shackUp() {
	this.baseURI = document.URL;
	this.pos = 0;
	this.body = $('body');
}

var shack = shack || new shackUp();

$(document).ready( function() {
	// Click handlers
	$('.nav-menu').click( function() {
		$( '.menu' ).toggleClass ( 'menu-open' );
		$( '.overlay' ).fadeToggle( 400, 'linear' );
	});

	$( '.nav-list' ).click( function() {
		$( '.list' ).toggleClass ( 'list-open' );
		$( '.nav-logo').toggleClass( 'active' );
		$( this ).toggleClass ( 'active' );
	});

	$( '.overlay' ).click( function( event ) {
		$( '.menu' ).removeClass( 'menu-open' );
		$( '.overlay' ).fadeToggle( 200, 'linear' );
	});

	// Listing magic
	$('.listing').click( function() {
		// TODO: This should actually happen when the card is generated, then when the card is clicked, 
		// use initKeys / destroyKeys / initSwipe / Destroyswipe
		var self = $( this );
		var gallery = $( '.listing__gallery' );

		if ( ! self.hasClass( 'listing--detailed' ) ) {
			self.addClass( 'listing--detailed' );
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
	$('.listing__gallery').click( function( event ) {
		var gallery = $( this );
		var listing = $('.listing');
		if ( listing.hasClass( 'listing--detailed') ) {
			event.stopPropagation();
			listing.removeClass('listing--detailed');
			gallery.unslider('destroySwipe');
			gallery.unslider('destroyKeys');
			$('.unslider-nav').css( 'display', 'none');
		}
	});

});
