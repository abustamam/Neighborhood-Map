var GrpnPlace = function(data, self) {
    this.name = ko.observable(data.merchant.name);
    this.location = ko.observable(data.options[0].redemptionLocations[0]);
    this.lat = ko.observable(this.location().lat);
    this.lng = ko.observable(this.location().lng);
    this.loc = ko.observable(new google.maps.LatLng(this.lat(),this.lng()));
    this.neighborhood = ko.observable(this.location().neighborhood);
    this.address = ko.observable(this.location().streetAddress1);
    this.city = ko.observable(this.location().city);
    this.postal = ko.observable(this.location().postal);
    this.phone = ko.observable(this.location().phoneNumber);
    this.rating = ko.observable(data.grouponRating);
    this.grpnUrl = ko.observable(data.dealUrl);

    this.content =  "<a href=" + this.grpnUrl() + " target='_blank'><h3>" + this.name() + "</h3></a>" + 
                    "<p>" + this.address() + "</p>" +
                    "<p>" + this.phone() + "</p>";

    this.marker = new google.maps.Marker({
        position: this.loc(),
        map: self.map
    });

    self.markers.push(this.marker);

    google.maps.event.addListener(this.marker, "click", (function(marker, content, infowindow) {
        return function(){
            infowindow.setContent(content);
            self.map.panTo(marker.getPosition());
            infowindow.open(self.map, marker);
        };
    })(this.marker, this.content, self.infowindow));

    this.onClick = function(){
        $(".menu-icon-link").trigger('click');
        google.maps.event.trigger(this.marker, 'click');
    };
}; 

var ViewModel = function() {
    var self = this;
    var auto = {};
    self.markers = ko.observableArray([]);
    self.venues = ko.observableArray([]);
    self.picks = ko.observableArray(self.venues());
    self.neighborhood = ko.observable("San Francisco");
    self.dealType = ko.observable("food-and-drink");

    self.channels = ko.observableArray(['automotive', 'beauty-and-spas','food-and-drink',
        'health-and-fitness','home-improvement','local-services','shopping','things-to-do']);

    self.grpnPlaceList = ko.observableArray([]);
    self.filter = ko.observable();

    // Sets the map on all markers in the array.
    self.setAllMap = function(map) {
        ko.utils.arrayForEach(self.markers(), function(marker){
            marker.setMap(map);
        });
    };

    // Removes the markers from the map, but keeps them in the array.
    self.clearMarkers = function(){
        self.setAllMap(null);
    };

    // Shows any markers currently in the array.
    self.showMarkers = function() {
        self.setAllMap(self.map);
    };

    // Deletes all markers in the array by removing references to them.
    self.deleteMarkers = function() {
        self.clearMarkers();
        self.markers.removeAll();
    };

    // filtered list for search
    self.filteredList = ko.computed(function(){
        if (!self.filter()) {
            self.showMarkers();
            // TODO: ensure that 'get stars' works when filtering
            //self.getStars();
            return self.grpnPlaceList();

        } else {
            var places = [];
            self.clearMarkers();
            ko.utils.arrayForEach(self.grpnPlaceList(), function(place){
                if (place.name().toLowerCase().indexOf(self.filter().toLowerCase()) >= 0) {
                    places.push(place);
                    // show only markers that are filtered
                    place.marker.setMap(self.map);
                }
            });
            //self.getStars();
            return places;
        }
    }, this);

    self.init = function() {
        self.initMap();
        self.getComplete();
       
        $('.menu-icon-link').click(function(event) {
            event.preventDefault();
            $('#wrapper').toggleClass("toggled");
            $("#sidebar-wrapper").toggleClass("toggled");
            $("#page-content-wrapper").toggleClass("toggled");
        });

        // Resize map and maintain center
        google.maps.event.addDomListener(self.map, 'idle', function() {
          self.calculateCenter();
        });
        google.maps.event.addDomListener(window, 'resize', function() {
          self.map.setCenter(self.center);
        });
        self.dealType.subscribe(function(val){
            self.getDeals();
        });
    };

    self.initMap = function() {

        if (typeof google == 'undefined') {
            $("#mapDiv").html("<h1>There was an error loading Google Maps</h1><h1>Please check your internet or firewall</h1>");
            return;
        }

        var mapOptions = {
            zoom: 10,
            disableDefaultUI: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        self.map = new google.maps.Map(document.querySelector("#mapDiv"), mapOptions);
        self.infowindow = new google.maps.InfoWindow();
    };

    self.getComplete = function() {
        $.ajax({
            type: "get",
            dataType: "jsonp",
            url: "https://partner-api.groupon.com/division.json",
            success: function(data) {
                $.each(data.divisions, function() {
                    auto[this.name] = this.id;
                });

                self.formattedNeighborhood = ko.computed(function() {
                    return auto[self.neighborhood()];
                });

                $("#neigh").autocomplete({
                    source: Object.keys(auto),
                    select: function( event, ui ){
                        $("#grpnHeaderElem").text("Loading deals");
                        self.neighborhood(ui.item.label);
                        self.getDeals();
                    }
                });

                self.getDeals();
            },
            error: function(xhr, status, err) {
                $("#loading").hide();
                console.log(err);
            }
        });

    };

    self.getDeals = function() {
        var urlPre = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_203765_212556_0";
        self.grpnPlaceList.removeAll();
        self.deleteMarkers();

        self.formattedNeighborhood = ko.computed(function(){
            return "&division_id=" + auto[self.neighborhood()];    
        }, self);

        $("#loading").show();
        $("#filter").hide();

        $.ajax({
            type: "get",
            url: urlPre + "&offset=0&limit=20&filters=category:" + self.dealType() + self.formattedNeighborhood(),
            dataType: 'jsonp',
            // test url: https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_203765_212556_0&offset=0&limit=10&filters=category:food-and-drink&division_id=sacramento
            timeout: 5000
        }).done(function(data){
            $("#loading").hide();
            $("#filter").show();
            var bounds = new google.maps.LatLngBounds();
            $.each(data.deals, function() {
                dataHTML = "";
                var redLoc = this.options[0].redemptionLocations;
                if (redLoc === undefined || redLoc.length === 0) {
                    // This will skip any "delivery" groupons w/o an address
                    return true;
                } else {
                    self.grpnPlaceList.push( new GrpnPlace(this, self));

                    // Extend bounds for each location
                    bounds.extend(new google.maps.LatLng(redLoc[0].lat, redLoc[0].lng));
                }
            });
            self.map.fitBounds(bounds);
            self.map.setCenter(bounds.getCenter());
            if (self.neighborhood() === "") {
                self.neighborhood("San Francisco");
            }
            //console.log(self.markerList());
            // self.getStars();
            $("#grpnHeaderElem").text("Showing deals near " + self.neighborhood());
        }).fail(function(xhr, status, err){
            $("#grpnHeaderElem").text('Unable to load deals.');
        }).always(function(){
            $("#loading").hide();
        });
    };


    self.getStars = function() {
        $.fn.stars = function() {
            return $(this).each(function() {
                // Get the value
                var val = parseFloat($(this).html());
                val = Math.round(val*4)/4;
                // Make sure that the value is in 0 - 5 range, multiply to get width
                var size = Math.max(0, (Math.min(5, val))) * 16;
                // Create stars holder
                var $span = $('<span />').width(size);
                // Replace the numerical value with stars
                $(this).html($span);
            });
        };

        $(function() {
            $('span.stars').stars();
        });
    };

    // Aux function for calculating center
    self.calculateCenter = function() {
        self.center = self.map.getCenter();
    };

    self.init();

    // self.getVenues = function() {
    //     var urlPre = "https://api.foursquare.com/v2/venues/explore?client_id=MG5AI4G2VTZ04J4EVB4QTXZRBA55KXQNE14ESESTXQPK23TU&client_secret=CXAQRGU5TPCRXLGN4AHRTALO42OCSVEGPJBGKMF5U1CDOAL1&ll="
    //     $.ajax({
    //         type: "get",
    //         url: urlPre + lat() + "," + lng() + "&v=20150217&",
    //         // test url: https://api.foursquare.com/v2/venues/search?ll=38.538232,-121.761712&client_id=MG5AI4G2VTZ04J4EVB4QTXZRBA55KXQNE14ESESTXQPK23TU&client_secret=CXAQRGU5TPCRXLGN4AHRTALO42OCSVEGPJBGKMF5U1CDOAL1&v=20150217&query=food
    //         success: function(data) {
                
    //             self.venues(data.response.groups[0].items);

    //             $.each(self.venues(), function() {
    //                 var phone, category, address, rating,
    //                     venue = this.venue;
    //                 var dataHTML = "";
    //                 phone = venue.contact.formattedPhone ? "Phone: " + venue.contact.formattedPhone : "";
    //                 category = venue.categories[0] ? venue.categories[0].name : "";
    //                 address = venue.location.address ? "<p>" + venue.location.address + "</p>" : "";
    //                 rating = venue.rating ? venue.rating : "";
    //                 //dataHTML += "<div class='venue'><b>" + venue.name + " " + category + " " + rating + "</b>" + address + phone + "</div>";
    //                 //$(".menu").append(dataHTML);
    //             });
    //             self.getStars();
    //         }
    //     });
    // };

};

$(document).ready(function(){
   ko.applyBindings(new ViewModel()); 
});