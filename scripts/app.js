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
});
