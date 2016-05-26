function shackUp() {
	this.baseURI = document.URL;

	// App state
	this.saved = [];
	this.savedData = [];
	this.queue = listings;
	this.currentItems = [];
	this.searchForm = $( '.filters__form' );

	this.init = function() {
		this.currentPagination = 0;
		this.totalPages = 1; // Assume 1 at default, override with each request.
		shack.addListingsToCardStack();
	};

	this.love = function() {
		var listing = $( this ).parents( '.listing' );
		shack.notify( $('.notification .fa-heart') );
		listing.animate( {
			opacity: 0,
			left: '+=100%',
		}, 500, function() {
			shack.saved.push( { 'id': listing.data('id'), 'markup': listing.detach() } );
			shack.savedData.push(_.findWhere(shack.currentItems, {'id': listing.data('id')}));
			listing.addClass('listing--saved');
			listing.detach();
			if ( $('.listing').length < 4 ) {
				shack.addListingsToCardStack();
			}
			// Set up the next card with swipe handlers
			shack.initSwipe( $('.listing').last() );
		});   
	};

	this.hate = function() {
		shack.notify( $('.notification .fa-times') );
		$( this ).parents( '.listing' ).animate( {
			opacity: 0,
			left: '-=100%',
		}, 500, function() {
			this.remove();
			if ( $('.listing').length < 4 ) {
				shack.addListingsToCardStack();
			}
			// Set up the next card with swipe handlers
			shack.initSwipe( $('.listing').last() );
		});
	};

	// displays the "detailed" state of a listing from the saved list
	this.toggleSavedListingState = function() {
		var target = $( event.target );
		if ( ! target.hasClass( 'listing__nav-button--active' ) ) {
			var parent = target.parents( '.listing' );
			parent.toggleClass('listing--detailed listing--contact');
			shack.navAddActiveState( target );
			//Todo: unbind click out to card
		}
	};

	this.navAddActiveState = function( target ) {
		target.siblings().removeClass('listing__nav-button--active');
		target.addClass('listing__nav-button--active');
	};

	// Takes in a dom reference (hopefully a notification and does an opacity animation
	this.notify = function ( notification ) {
		notification.css( { display: 'block' } );
		notification.animate( { opacity: 100 }, 300, function() {
			$( this ).delay( 100 ).animate( { opacity: 0 }, 400, function() {
				$( '.notification .fa' ).css( { display: 'none', opacity: 0 } );
			});
		});
	};

	// Takes in a dom reference and hooks up a swipe event to that object
	this.initSwipe = function ( swipee ) {
		swipee.bind( 'move', function(e) {
			var el = $(this);
			if ( ! el.hasClass('listing--detailed') ) {
				var width = el.width();
				var startLeft = el.css('left');
				var startPercent = e.startX / $( window ).width();
				
				el.css({ left: e.startX + e.distX - ( width * startPercent )});
				
				// Notification Opacity
				var notifications = $( '.notification .fa' );
				var love = $( '.notification .fa-heart' );
				var hate = $( '.notification .fa-times' );
				notifications.css({
					display: 'block',
				});

				if ( e.distX < 0 ) {
					hate.css( {opacity: Math.abs( e.distX / 150 ) });
					love.css( {opacity: 0} ); // We need this
				} else if ( e.distX > 0 ) {
					love.css( {opacity: e.distX / 150 } );
					hate.css( {opacity: 0} ); // We need this
				} else {
					notifications.css( {opacity: 0} );
				}
			}
		});

		swipee.bind( 'moveend', function(e) {
			var el = $( this );
			if ( ! el.hasClass('listing--detailed') ) {
				var notifications = $( '.notification .fa' );

				if ( e.distX > 150 ) {
					var love = el.find( '.listing__like-button' );
					love.trigger( 'click' );
				} else if ( e.distX  < -150 ) {
					var hate = el.find( '.listing__pass-button' );
					hate.trigger( 'click');
				} else {
					$( this ).animate( {'left':'2.5%'}, 150 );
					notifications.animate( {
						opacity: 0,
					}, 100, function() {
						$( this ).css( {display: 'none'} );
					});       
				}
			}
		});
	};

	/**
	 * parses search filters form, necessary for non-HTML form elements
	 *
	 * @param event - original submit event
	 * @return string - full query string for Gabriels request
	 *
	 */
	this.getQuery = function( event ) {
		event.preventDefault();
		var self = this;
		var saleType = $('.filters__sale-type .filter--active').data('type');
		var gabrielsParams = [ 'propertyType', 'bedrooms', 'bathrooms' ];
		var paramMap = {
			propertyType: $('.prop-type-options .filter--active'),
			bedrooms: $('.bed-options .filter--active'),
			bathrooms: $('.bath-options .filter--active')
		};

		queryString = this.searchForm.serialize() + '&channel=' + saleType;

		_.each( gabrielsParams, function( param ) {
			queryString += '&' + param + '=' + self.buildQueryString( paramMap[ param ] );
		});

		return queryString;
	};

	/**
	 * builds complete query string for Gabriels request
	 *
	 * @param array - array of values for a single filter
	 * @return string - string of values of a filter
	 *
	 */
	this.buildQueryString = function( filter ) {
		var filterValues = _.map( filter, function( filterVal ) {
			return encodeURIComponent( filterVal.innerText );
		});
		return filterValues;
	};

	this.setSaleType = function( event ) {
		var $eventTarget = $( event.target );
		$( '.filters__sale-type-button' ).removeClass( 'filter--active' );
		$eventTarget.addClass( 'filter--active' );
	};

	// Starts up a gallery
	this.galleryInit = function( gallery ) {
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
	};

	this.registerClickHandlers = function() {
		var love = $( '.listing__like-button' );
		var hate = $( '.listing__pass-button' );
		var closeListing = $( '.listing__close');
		var savedListingNav = $( '.listing__nav-button' );
		var searchFilter = $( '.filters__filter-option' );
		var saleType = $( '.filters__sale-type-button' );

		$('body').on( 'click', '.saved__item', this.loadSavedListing );
		
		love.click( this.love );
		hate.click( this.hate );

		closeListing.click( function() {
			$( this ).parents( '.listing' ).detach();
		});

		savedListingNav.click( this.toggleSavedListingState );
		saleType.click( this.setSaleType );
		searchFilter.click( function( event ) {
			var $eventTarget = $( event.target );
			$eventTarget.siblings( '.filter--active' ).removeClass( 'filter--active' );
			$eventTarget.toggleClass( 'filter--active' );
		});
		this.searchForm.submit( this.getQuery.bind( this ) );

		// Listing magic
		$('.listing__gallery').click( function( event ) {
			var gallery = $( this );
			var listing = gallery.parents( '.listing' );
			if ( ! listing.hasClass( 'listing--saved' ) ) {
				if ( listing.hasClass( 'listing--detailed' ) ) {
					event.stopPropagation();
					listing.removeClass('listing--detailed listing--contact');
					gallery.unslider('destroySwipe');
					gallery.unslider('destroyKeys');
					$('.unslider-nav').css( 'display', 'none');
				} else {
					listing.addClass( 'listing--detailed' );
					shack.galleryInit( gallery );
				}
			}
		});
	};

	// Add listings to the card stack
	this.addListingsToCardStack = function() {
		if ( shack.currentPagination < shack.totalPages ) {
			shack.currentPagination++;
			var listings = shack.getListings( shack.currentPagination );
			listings.success( shack.displayListings );	
		} else {
			$('.error__loading').hide();
		}
	};

	// Reset the pagination to zero and start requesting again
	this.resetListings = function() {
		shack.currentPagination = 0;
		shack.addListingsToCardStack();
		$('.error__loading').show();
	};

	// Take the listings from returned ajax data and add them to the bottom of the card stack
	this.showListings = function(data){
		var template = _.template(
			$( "script.listing-template" ).html()
		);

		$( "script.listing-template" ).after( template(data) );
	};

	// Load the saved listing into the top of the card stack, giving it unique classes maybe?
	this.loadSavedListing = function( event ) {
		var $eventTarget = $( event.target );
		var listingID = $eventTarget.attr('data-id') || $eventTarget.parents('.saved__item').attr('data-id');
		var listing = _.findWhere( shack.saved, { id: listingID });
		$( '.container' ).find('.listing').remove();
		setTimeout( function() {
			$( 'script.listing-template' ).after( listing.markup.addClass('listing--detailed').css({'opacity':'1', 'left':'0'}) ).fadeIn();
			shack.galleryInit( listing.markup.find( '.listing__gallery' ) );
		}, 100);
	};

	// Add listing thumbnails/descriptions to saved listing menu
	this.showSaved = function(data) {
		$('.saved__item').detach(); // Remove old ones
		var template = _.template(
			$( "script.saved-listing-template" ).html()
		);

		$( "script.saved-listing-template" ).after(
			template( data )
		);
	};

	/**
	 * Get listings
	 * @return jqXHR results
	 */
	this.getListings = function( pagination, params ) {
		var requestURL = 'http://realestate--bdc-3708.dev.wordpress.boston.com/wp-admin/admin-ajax.php?action=gabriels_boston_listings&method=getListings&locationsSEOPath=somerville-ma-usa&channel=sales';
		if ( pagination ) {
			requestURL += '&results_page=' + pagination;
		}
		var $request = $.ajax({
			type: 'get',
			url: requestURL,
			cache: false,
			dataType: 'json',
		});

		return $request;
	};

	this.displayListings = function( jqXHR ) {
		// Set total pages so that other requests don't ask for more data when there is none.
		shack.totalPages = jqXHR.data.totalPages;
		// Concatenate the current data to the currentItems cache of data
		shack.currentItems = shack.currentItems.concat(jqXHR.data.listings);
		shack.showListings( { data : jqXHR.data.listings } );
		shack.registerClickHandlers();
		shack.initSwipe( $('.listing').last() );
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
		$( '.filters' ).removeClass( 'filters-open' );
		$( '.overlay' ).fadeToggle( 200, 'linear' );
	});

	$('.refreshListings').click(function() {
		shack.resetListings();
	});
	
});
