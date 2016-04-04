function shackUp() {
	this.baseURI = document.URL;
	this.pos = 0;
	this.body = $('body');
	// App state
	this.saved = [];
	this.queue = listings;

	this.init = function() {
		this.registerClickHandlers();
		this.showListings(this.queue[0]); // TODO: Greg decides how he wants to display stuff
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

	this.showListings = function(data){
    	var template = _.template(
            $( "script.template2" ).html()
        );

        $(  "script.template2" ).after( template(data) )
    }

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
		showSaved();
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
			listing.removeClass('listing--detailed listing--contact');
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

	function showMinifiedPrice (value) {
    	if ( value.toString().length > 6 ) {
			displayValue = '$' + value/1000000 + 'm';
		} else {
			displayValue = '$' + value/1000 + 'k';
		}
    }

	function showSaved(){
		var template = _.template(
	      $( "script.template" ).html()
	    );

	    $( ".saved__list" ).html(
	      template( shack.queue )
	    );
    }

});
