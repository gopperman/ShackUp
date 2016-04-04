function shackUp() {
	this.baseURI = document.URL;

	// App state
	this.saved = [];
	this.savedData = [];
	this.queue = listings;
	this.searchForm = $( '.filters__form' );

	this.init = function() {
		this.refreshListings();
	};

	this.love = function() {
		var listing = $( this ).parents( '.listing' );
		listing.animate( {
			opacity: 0,
			left: '+=100%',
		}, 300, function() {

			shack.saved.push( listing.detach() );
			shack.savedData.push(_.findWhere(shack.queue, {'id': listing.data('id')}));
			// Set up the next card with swipe handlers
			shack.initSwipe( $('.listing').last() );
		});		
	};

	this.hate = function() {
		$( this ).parents( '.listing' ).animate( {
			opacity: 0,
			left: '-=100%',
		}, 300, function() {
			this.remove();
			// Set up the next card with swipe handlers
			shack.initSwipe( $('.listing').last() );
		});
	};

	// displays the "detailed" state of a listing
	this.showAbout = function() {
		$( event.target )
			.parents( '.listing' )
			.removeClass()
			.addClass('listing listing--detailed');
	};

	// Takes in a dom reference and hooks up a swipe event to that object
	this.initSwipe = function ( swipee ) {
		swipee.on( 'swipeleft', function() {
			var el = $(this);
			if ( ! el.hasClass( 'listing--detailed' ) ) {
				var hate = $(this).find( '.listing__pass-button' );
				hate.trigger( 'click' );
			}
		});
		swipee.on( 'swiperight', function() {
			var el = $(this);
			if ( ! el.hasClass( 'listing--detailed' ) ) {
				var love = $(this).find( '.listing__like-button' );
				love.trigger( 'click' );
			}
		});
	};

	this.getQuery = function( event ) {
		event.preventDefault();
		var query = this.searchForm.serialize();
		var proptypes = $('.filters__options--prop-type .filter--active');
		var beds = $('.filters__options--beds .filter--active');
		var baths = $('.filters__options--baths .filter--active');
		console.log( beds, baths, proptypes );
	};

	this.registerClickHandlers = function() {
		var love = $( '.listing__like-button' );
		var hate = $( '.listing__pass-button' );
		var about = $( '.listing__nav [data-type="about"]' );
		var contact = $( '.listing__nav [data-type="contact"]' );
		var searchFilter = $( '.filters__filter-option' );
		

		love.click( this.love );
		hate.click( this.hate );
		about.click( this.showAbout );
		searchFilter.click( function() {$(event.target).toggleClass( 'filter--active' );});
		this.searchForm.submit( this.getQuery.bind( this ) );
	};

	this.refreshListings = function() {
		//TO-DO: De-dupe the queue
		shack.showListings( { data : this.queue } );
		this.registerClickHandlers();
		this.initSwipe( $('.listing').last() );
	};

	this.showListings = function(data){
    	var template = _.template(
            $( "script.template2" ).html()
        );

        $(  "script.template2" ).after( template(data) );
    };

    this.showSaved = function(data) {
    	$('.saved__item').detach(); // Remove old ones
		var template = _.template(
	      $( "script.template" ).html()
	    );

	    $(  "script.template" ).after(
	      template( data )
	    );
    };

}

var shack = shack || new shackUp();

$(document).ready( function() {
	Number.prototype.formatMoney = function(c, d, t){
		var n = this, 
		    c = isNaN(c = Math.abs(c)) ? 2 : c, 
		    d = d == undefined ? "." : d, 
		    t = t == undefined ? "," : t, 
		    s = n < 0 ? "-" : "", 
		    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
		    j = (j = i.length) > 3 ? j % 3 : 0;
		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	};

	// Click handlers
	shack.init();

	$('.nav-menu').click( function() {
		$( '.filters' ).toggleClass ( 'filters-open' );
		$( '.overlay' ).fadeToggle( 400, 'linear' );
	});

	$('.nav-logo').click( function() {
		$( '.panel-open' ).removeClass('panel-open' );
		$( '.filters-open' ).removeClass('filters-open' );
		$( '.overlay' ).fadeOut( 400, 'linear' );
	});

	$( '.nav-list' ).click( function() {
		var saved = $( '.saved' );
		if ( ! saved.hasClass('saved-open') ) {
			shack.showSaved( { data: shack.savedData } );
		}
		saved.toggleClass ( 'saved-open' );
		$( '.container' ).toggleClass( 'panel-open' );
		$( '.nav-logo' ).toggleClass( 'active' );
		$( this ).toggleClass ( 'active' );
	});

	$( '.overlay' ).click( function( event ) {
		$( '.menu' ).removeClass( 'menu-open' );
		$( '.overlay' ).fadeToggle( 200, 'linear' );
	});

	$('.refreshListings').click(function() {
		shack.refreshListings();
	});

	// Listing magic
	$('.listing__gallery').click( function( event ) {
		var gallery = $( this );
		var listing = gallery.parents( '.listing' );
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
				gallery.unslider('initSwipe');
				gallery.unslider('initKeys');
				$('.unslider-nav').css( 'display', 'block' );
			}
		}
	});
});
