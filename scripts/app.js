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
	//Gallery
	$('.listing__gallery').unslider({
		speed: 500,               //  The speed to animate each slide (in milliseconds)
		delay: 0,              //  The delay between slide animations (in milliseconds)
		complete: function() {},  //  A function that gets called after every slide animation
		keys: true,               //  Enable keyboard (left, right) arrow shortcuts
		dots: true,               //  Display dot navigation
		fluid: false              //  Support responsive design. May break non-responsive designs
	});
});
