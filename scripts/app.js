function shackUp() {
	this.baseURI = document.URL;

	// App state
	this.saved = [];
	this.savedData = [];
	this.queue = listings;
	this.currentItems = [];
	this.searchForm = $( '.filters__form' );

	this.init = function() {
		this.getListings();
		//#hack
		setTimeout(function() { shack.refreshListings(); $('.error__loading').hide(); }, 3000);
		
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
			listing.addClass('saved');
			listing.detach();
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
			// Set up the next card with swipe handlers
			shack.initSwipe( $('.listing').last() );
		});
	};

	// displays the "detailed" state of a listing
	this.showAbout = function() {
		$( event.target )
			.parents( '.listing' )
			.addClass('listing listing--detailed');
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
			return encodeURIComponent(  filterVal.innerText );
		});
		return filterValues;
	};

	this.setSaleType = function( event ) {
		$( '.filters__sale-type-button' ).removeClass( 'filter--active' );
		$( event.target ).addClass( 'filter--active' );
	};

	this.loadSavedListing = function( event ) {
		var listingID = $( event.target ).attr('data-id') || $( event.target ).parents('.saved__item').attr('data-id');
		var listing = _.findWhere( shack.saved, { id: listingID });
		$( '.nav-list' ).click();
		$( '.container' ).find('.listing').remove();
		setTimeout( function() {
			$( 'script.template2' ).after( listing.markup.addClass('listing--contact').css({'opacity':'1', 'left':'2.5%'}) ).fadeIn();
		}, 100);
	};

	this.registerClickHandlers = function() {
		var love = $( '.listing__like-button' );
		var hate = $( '.listing__pass-button' );
		var about = $( '.listing__nav [data-type="about"]' );
		var contact = $( '.listing__nav [data-type="contact"]' );
		var searchFilter = $( '.filters__filter-option' );
		var saleType = $( '.filters__sale-type-button' );

		love.click( this.love );
		hate.click( this.hate );
		about.click( this.showAbout );
		saleType.click( this.setSaleType );
		searchFilter.click( function( event ) {
			var target = $( event.target );
			target.siblings( '.filter--active' ).removeClass( 'filter--active' );
			$(event.target).toggleClass( 'filter--active' );
		});
		this.searchForm.submit( this.getQuery.bind( this ) );
		$('body').on( 'click', '.saved__item', this.loadSavedListing );

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
	};

	this.refreshListings = function() {
		//TO-DO: De-dupe the queue
		this.currentItems = shack.queue.splice(0,10);
		_.shuffle(this.currentItems);
		shack.showListings( { data : this.currentItems } );
		this.registerClickHandlers();
		this.initSwipe( $('.listing').last() );
	};

	this.showListings = function(data){
		$('.listing:not(.saved)').detach();
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

    this.getListings = function(distanceMiles, zipCode) {
    	shack.queue = [];
    	/* Step 1 - figure out where we are */
		var options = {
		  enableHighAccuracy: true,
		  timeout: 5000,
		  maximumAge: 0
		};

		function success(pos) {
		  var crd = pos.coords;

		  console.log('Your current position is:');
		  console.log('Latitude : ' + crd.latitude);
		  console.log('Longitude: ' + crd.longitude);
		  console.log('More or less ' + crd.accuracy + ' meters.');
		};

		function error(err) {
		  console.warn('ERROR(' + err.code + '): ' + err.message);
		};

		navigator.geolocation.getCurrentPosition(success, error, options);
					$.ajax({
						type: 'get',
						url: 'http://realestate--bdc-3708.dev.wordpress.boston.com/wp-admin/admin-ajax.php?action=gabriels_boston_listings&method=getListings&priceMin=400000&priceMax=1000000&propertyType=Single+Family%2CSingle+Family+Home%2CMulti+Family%2CMulti-Family+Home%2C&freetext=Boston%2C+MA&locationsSEOPath=boston-ma-usa&channel=sales&_=1460137103156',
						cache: false,
						success: function(response) {
							var listings = response.data.listings;
							[].push.apply(shack.queue, listings);
							//Dedupe this stuff. #hack
							_.uniq(shack.queue);
						},
						dataType: 'json',
						error: function (error, response) {
							console.log(error);
						}
					});
					$.ajax({
						type: 'get',
						url: 'http://realestate--bdc-3708.dev.wordpress.boston.com/wp-admin/admin-ajax.php?action=gabriels_boston_listings&method=getListings&priceMin=400000&priceMax=1000000&propertyType=Single+Family%2CSingle+Family+Home%2CMulti+Family%2CMulti-Family+Home%2C&freetext=Boston%2C+MA&locationsSEOPath=boston-ma-usa&channel=sales&_=1460137103156&results_page=2',
						cache: false,
						success: function(response) {
							var listings = response.data.listings;
							[].push.apply(shack.queue, listings);
						},
						dataType: 'json',
						error: function (error, response) {
							console.log(error);
						}
					});	
					$.ajax({
						type: 'get',
						url: 'http://realestate--bdc-3708.dev.wordpress.boston.com/wp-admin/admin-ajax.php?action=gabriels_boston_listings&method=getListings&priceMin=400000&priceMax=1000000&propertyType=Single+Family%2CSingle+Family+Home%2CMulti+Family%2CMulti-Family+Home%2C&freetext=Boston%2C+MA&locationsSEOPath=boston-ma-usa&channel=sales&_=1460137103156&results_page=3',
						cache: false,
						success: function(response) {
							var listings = response.data.listings;
							[].push.apply(shack.queue, listings);
						},
						dataType: 'json',
						error: function (error, response) {
							console.log(error);
						}
					});	
				


    	
    }

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
		shack.refreshListings();
	});
	
});
