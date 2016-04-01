function reTinder() {
	this.baseURI = document.URL;
	this.pos = 0;
	this.body = $('body');
}

var ret = ret || new reTinder();

$(document).ready( function() {
	// Click handlers
	$('.nav-menu').click( function() {
		$( '.menu' ).toggleClass ( 'menu-open' );
		$( '.overlay' ).fadeToggle( 400, 'linear' );
	});
	$( '.nav-list' ).click( function() {
		$( '.list' ).toggleClass ( 'list-open' );
	});
	$( '.overlay' ).click( function( event ) {
		$( '.menu' ).removeClass( 'menu-open' );
		$( '.overlay' ).fadeToggle( 200, 'linear' );
	});

	// Gallery
	$('.listing__gallery').click( function() {
		// TODO: This should actually happen when the card is generated, then when the card is clicked, 
		// use initKeys / destroyKeys / initSwipe / Destroyswipe
		var self = $(this);
		console.log(this);
		if ( self.hasClass('stopped') ) {
			self.removeClass('stopped');
			self.unslider({
				arrows: false,
				autoplay: false,
				speed: 500,
				complete: function() {},
				keys: true,               
				nav: true,               
				fluid: true
			});
		}
	});

});
