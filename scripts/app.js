function shackUp() {
	this.baseURI = document.URL;

	// App state
	this.saved = [];
	this.savedData = [];
	this.queue = listings;
	this.currentItems = [];
	this.searchForm = $( '.filters__form' );
	this.queryString = 'priceMax=500000';

	this.init = function() {
		this.currentPagination = 0;
		this.totalPages = 1; // Assume 1 at default, override with each request.
		shack.registerClickHandlers();
		shack.addListingsToCardStack();
	};

	// Converts HTML entitites like &amp in Gabriels data to the real thing
	this.decodeHTML = function( text ) {
		var e = document.createElement('div');
		e.innerHTML = text;
		return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
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
	 * parses search form + updates query for use in addListingsToCardStack
	 */
	this.getQuery = function() {
		var gabrielsParams = [ 'propertyType', 'bedrooms', 'bathrooms' ];
		var location = $('.filters__zipcode').val().replace(' ', '');
		var paramMap = {
			propertyType: $('.prop-type-options .filter--active'),
			bedrooms: $('.bed-options .filter--active'),
			bathrooms: $('.bath-options .filter--active')
		};

		// get standard form element values
		var queryString = this.searchForm.serialize();
		// apply user location (zip | city) as keyword
		queryString += '&keyword=' + location;
		// get non-standard form element values
		_.each( gabrielsParams, function( param ) {
			if ( paramMap[ param ].length ) { // if there is a value for the current filter
				queryString += '&' + param + '=' + encodeURIComponent( paramMap[ param ][0].innerText );
			}
		});
		shack.queryString = queryString;
		shack.addListingsToCardStack();
	};

	// Starts up a gallery
	this.galleryInit = function( gallery ) {
		gallery.removeClass( 'stopped' );
		if ( ! gallery.hasClass( 'initialized' ) ) {
			gallery.unslider({
				arrows: false,
				autoplay: false,
				speed: 500,
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
		var body = $('body');
		var savedListingNav = $('.listing__nav-button');

		body.on('click', '.saved__item', this.loadSavedListing);
		body.on('click', '.listing__like-button', this.love );
		body.on('click', '.listing__pass-button', this.hate );

		body.on('click', '.listing__close', function() {
			$(this).parents('.listing').detach();
			$('.listing--detailed').show();
		});
		body.on('click', '.listing__nav-button', this.toggleSavedListingState );

		// Listing magic
		body.on('click', '.listing__gallery', function(event) {
			var gallery = $( this );
			var listing = gallery.parents( '.listing' );
			if ( ! listing.hasClass( 'listing--saved' ) ) {
				if ( listing.hasClass( 'listing--detailed' ) ) {
					event.stopPropagation();
					listing.removeClass('listing--detailed listing--contact');
					gallery.unslider('destroySwipe');
					gallery.unslider('destroyKeys');
					shack.initSwipe( $('.listing').last() ); // restore unslider swiping for love/hate
					$('.unslider-nav').css( 'display', 'none');
				} else {
					listing.addClass( 'listing--detailed' );
					listing.unbind(); // unbind unslider swiping in detailed view to allow vertical scrolling
					shack.galleryInit( gallery );
				}
			}
		});
	};

	// Add listings to the card stack
	this.addListingsToCardStack = function() {
		if (shack.currentPagination < shack.totalPages) {
			shack.currentPagination++;
			var listings = shack.getListings(shack.currentPagination, shack.queryString);
			listings.success(shack.displayListings);
		} else {
			$('.error__loading').hide();
		}
	};

	// Reset the pagination to zero and start requesting again
	this.resetListings = function() {
		shack.currentPagination = 0;
		shack.totalPages = 1;
		$( '.listing' ).remove();
		shack.currentItems = [];
		shack.getQuery();
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
		setTimeout( function() {
			$( 'script.listing-template' ).after( listing.markup.addClass('listing--detailed').css({'opacity':'1', 'left':'0'}) ).fadeIn();
			$('.container').removeClass('panel-open'); // we want the overflow
			$('.listing--saved').unbind();
			shack.galleryInit( listing.markup.find( '.listing__gallery' ) );
		}, 100);
		$('.listing--detailed').last().hide();
	};

	// Add listing thumbnails/descriptions to saved listing menu
	this.showSaved = function(data) {
		$('.saved__item').detach(); // Remove old ones
		if (! _.isEmpty(data)) {
			$('.error__emptySavedList').remove();
		}
		var template = _.template(
			$( "script.saved-listing-template" ).html()
		);

		$( "script.saved-listing-template" ).after(
			template( data )
		);
	};


	this.sanitizeListings = function(data) {
		return _.compact(_.map(data.listings, function(listing) {
			// exclude listings w/o images
			if (!listing.photos) { return; }

			listing.city = '';
			listing.agentName = 'Agent Contact';
			listing.agentPhone = '';
			listing.agentEmail = '';
			listing.agentPhoto = './img/profile-placeholder.png';

			// listing city
			if (listing.address.AddrCity) {
				listing.city = listing.address.AddrCity;
			} else if (listing.address.AddrCounty) {
				listing.city = listing.address.AddrCounty;
			}

			// listing agent info
			if (listing.agents[0]) {
				if (listing.agents[0].phones) {
					listing.agentPhone = listing.agents[0].phones[0];
				}
				if (listing.agents[0].photo) {
					listing.agentPhoto = shack.decodeHTML(listing.agents[0].photo);
				}
				if ( listing.agents[0].name ) {
					listing.agentName = listing.agents[0].name;
				}
				if ( listing.agents[0].email ) {
					listing.agentEmail = listing.agents[0].email;
				}
			}

			return listing;
		}));
	};

	/**
	 * Get listings
	 * @return jqXHR results
	 */
	this.getListings = function( pagination, queryString ) {
		var requestURL = apiHost + '/wp-admin/admin-ajax.php?action=gabriels_boston_listings&method=getListings&channel=sales&' + queryString;
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
		// filter/adjustment listing data for template
		var sanitizedListings = shack.sanitizeListings(jqXHR.data);
		// Set total pages so that other requests don't ask for more data when there is none.
		shack.totalPages = jqXHR.data.totalPages;

		if ( sanitizedListings.length ) {
			// Concatenate the current data to the currentItems cache of data
			shack.currentItems = shack.currentItems.concat(sanitizedListings);
			shack.showListings( { data : sanitizedListings } );
			shack.initSwipe( $('.listing').last() );
		} else {
			// show "no results" page here
			$('.error__loading').hide();
			$('.error__no-results').show();
		}
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

	//TODO: Find a place for all this state stuff
	var closeFilters = function() {
		$('.filters-open').removeClass('filters-open');
		$('.overlay').fadeOut( 400, 'linear');
	};

	var closeList = function() {
		$('.saved-open').removeClass('saved-open');
	};

	$('.nav-menu').click(function() {
		var menu = $( this );
		if (menu.hasClass('active')) {
			$('.nav-logo').trigger('click');
		} else {
			menu.siblings().removeClass('active');
			closeList();
			menu.toggleClass('active');
			$( '.filters' ).toggleClass ( 'filters-open' );
			$( '.overlay' ).fadeToggle( 400, 'linear' );
		}
	});

	$('.nav-logo').click(function() {
		var logo = $(this);
		logo.siblings().removeClass('active');
		logo.addClass('active');
		closeList();
		closeFilters();
	});

	$('.nav-list').click(function() {
		var navList = $(this);
		var saved = $('.saved');
		if ( ! saved.hasClass('saved-open') ) {
			shack.showSaved({ data: shack.savedData });
			navList.siblings().removeClass('active');
			navList.addClass('active');
			saved.toggleClass('saved-open');
		} else {
			$('.nav-logo').trigger('click');
		}
		closeFilters();
	});

	$('.overlay').click(function(event) {
		$('.nav-logo').trigger('click');
	});

	$('.refreshListings').click(function() {
		shack.resetListings();
	});

	/**
	 * highlights active search form filters on click
	 * @param event - original click event
	 */
	$('.filters__filter-option').click(function(event) {
		var $eventTarget = $( event.target );
		$eventTarget.siblings( '.filter--active' ).removeClass( 'filter--active' );
		$eventTarget.toggleClass( 'filter--active' );
	});

	/**
	 * submits a search from filter panel then closes panel
	 */
	$('.filters__form').submit(function(event) {
		event.preventDefault();
		shack.resetListings();
		$('.nav-menu').click();
	});

	
});
