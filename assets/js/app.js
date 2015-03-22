var MapMarker = function(name, marker, location) {
    this.name = name;
    this.marker = marker;
    this.location = location;
}

var GrpnPlace = function(data) {
    this.name = ko.observable(data.merchant.name);
    this.location = ko.observable(data.options[0].redemptionLocations[0]);
    this.lat = ko.observable(this.location().lat);
    this.lng = ko.observable(this.location().lng);
    this.loc = new google.maps.LatLng(this.lat(),this.lng());
    this.neighborhood = ko.observable(this.location().neighborhood);
    this.address = ko.observable(this.location().streetAddress1);
    this.city = ko.observable(this.location().city);
    this.postal = ko.observable(this.location().postal);
    this.phone = ko.observable(this.location().phoneNumber);
    this.rating = ko.observable(data.grouponRating);
    this.grpnUrl = ko.observable(data.dealUrl)



}

var ViewModel = function() {
    var self = this;
    var map, infowindow;
    var gpn_api = "6a9c8bea8dea2420ee2bda9fffaa761a86c7ba9e";
    var lat = ko.observable(38.538232);
    var lng = ko.observable(-121.761712);
    var auto = {}
    self.markers = ko.observableArray([]);
    self.venues = ko.observableArray([]);
    self.picks = ko.observableArray(self.venues());
    self.neighborhood = ko.observable("Sacramento");

    self.grpnPlaceList = ko.observableArray([]);

    self.init = function() {
        //self.initMap();
        self.getComplete();
       
        $('.menu-icon-link').on('click', function() {
            $('.menu').toggle("slow");
        });
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
                })

                $("#neigh").autocomplete({
                    source: Object.keys(auto),
                    select: function( event, ui ){
                        self.neighborhood(ui.item.label);
                        self.getDeals();
                    }
                });

                console.log(auto[self.neighborhood()])

                self.getDeals();
            }
        });

    };

    self.getVenues = function() {
        var urlPre = "https://api.foursquare.com/v2/venues/explore?client_id=MG5AI4G2VTZ04J4EVB4QTXZRBA55KXQNE14ESESTXQPK23TU&client_secret=CXAQRGU5TPCRXLGN4AHRTALO42OCSVEGPJBGKMF5U1CDOAL1&ll="
        $.ajax({
            type: "get",
            url: urlPre + lat() + "," + lng() + "&v=20150217&",
            // test url: https://api.foursquare.com/v2/venues/search?ll=38.538232,-121.761712&client_id=MG5AI4G2VTZ04J4EVB4QTXZRBA55KXQNE14ESESTXQPK23TU&client_secret=CXAQRGU5TPCRXLGN4AHRTALO42OCSVEGPJBGKMF5U1CDOAL1&v=20150217&query=food
            success: function(data) {
                
                self.venues(data.response.groups[0].items);

                $.each(self.venues(), function() {
                    var phone, category, address, rating,
                        venue = this.venue;
                    var dataHTML = "";
                    phone = venue.contact.formattedPhone ? "Phone: " + venue.contact.formattedPhone : "";
                    category = venue.categories[0] ? venue.categories[0].name : "";
                    address = venue.location.address ? "<p>" + venue.location.address + "</p>" : "";
                    rating = venue.rating ? venue.rating : "";
                    //dataHTML += "<div class='venue'><b>" + venue.name + " " + category + " " + rating + "</b>" + address + phone + "</div>";
                    //$(".menu").append(dataHTML);
                });
                self.getStars();
            }
        });
    };

    self.getNeighborhood = function() {
        console.log(self.neighborhood())
        self.formattedNeighborhood = ko.computed(function(){
            return auto[self.neighborhood()];
        })
        self.getDeals();
    }

    self.getDeals = function() {
        var urlPre = "https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_203765_212556_0";
        self.grpnPlaceList.removeAll();
        self.formattedNeighborhood = ko.computed(function() {
            return auto[self.neighborhood()];
        })

        $.ajax({
            type: "get",
            url: urlPre + "&offset=0&limit=10&filters=category:food-and-drink&division_id=" + self.formattedNeighborhood(),
            dataType: 'jsonp',
            // test url: https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_203765_212556_0&offset=0&limit=10&filters=category:food-and-drink&division_id=sacramento
            success: function(data) {
                self.venues(data.deals);

                $.each(data.deals, function() {
                    dataHTML = "";
                    if (this.options[0].redemptionLocations === undefined || this.options[0].redemptionLocations.length == 0) {
                        // This will skip any "delivery" groupons w/o an address
                        return true;
                    } else {
                        self.grpnPlaceList.push( new GrpnPlace(this));
                    }
                });
                self.getStars();
            }
        });
    };

    self.getStars = function() {
        $.fn.stars = function() {
            return $(this).each(function() {
                // Get the value
                var val = parseFloat($(this).html());
                val = Math.round(val * 4) / 8;
                // Make sure that the value is in 0 - 5 range, multiply to get width
                var size = Math.max(0, (Math.min(5, val))) * 16;
                // Create stars holder
                var $span = $('<span />').width(size);
                // Replace the numerical value with stars
                $(this).html($span);
            });
        }

        $(function() {
            $('span.stars').stars();
        });
    };

    self.initMap = function() {
        var mapOptions = {
            zoom: 14,
            disableDefaultUI: true
        }

        $("#mapDiv").height($(window).height());

        map = new google.maps.Map(document.querySelector("#mapDiv"), mapOptions);
        infowindow = new google.maps.InfoWindow();
    }

    self.init();

    // self.createMarker = function(venue) {
    //     var name = venue.merchant.name;
    //     var location = venue.options[0].redemptionLocations[0];
    //     var lat = location.lat;
    //     var lng = location.lng;
    //     var loc = new google.maps.LatLng(lat, lng);
    //     var neighborhood = location.neighborhood;
    //     var address = location.streetAddress1;
    //     var city = location.city;
    //     var postal = location.postal;
    //     var phone = location.phoneNumber;
    //     var rating = venue.rating;

    //     var marker = new google.maps.Marker({
    //         map: map,
    //         position: loc,
    //         title: name
    //     });

    //     self.markers.push(new MapMarker(name, marker, location));

    //     var infowinDiv = $("<div />", {
    //         "class": 'infowindow'
    //     });
    //     var infowinName = $("<p />", {
    //         text: name
    //     });
    //     var infowinAddress = $("<p />", {
    //         text: address
    //     });
    //     var infowinContact = $("<p />", {
    //         text: phone
    //     });

    //     var infowinUrl = $("<a />", {
    //         "href": "www.google.com",
    //         text: "cool"
    //     });

        //console.log(venue)
    // };

    self.getNeighborhoodInfo = function() {

    };

    self.cb = function(res, stat) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            getNeighborhoodInfo(res[0]);
        }
    }

    // self.getNeighborhood = function(neighborhood) {
    //     var requesr = {
    //         query: neighborhood
    //     };
    //     var service = new google.maps.places.PlacesService(map);
    //     service.textSearch(request, cb);
    // }
};








// var locations = [
//     {
//         "name": "Davis Kumon",
//         "lat": 38.545209,
//         "lng": -121.737826
//     },
//     {
//         "name": "UC Davis",
//         "lat": 38.538232,
//         "lng": -121.761712
//     },
//     {
//         "name": "Folsom Kumon",
//         "lat": 38.6730869,
//         "lng": -121.1489294
//     },
//     {
//         "name": "Home",
//         "lat": 38.451314,
//         "lng": -121.401714
//     }
// ];

// var Marker = function(data) {
//     this.name = ko.observable(data.name);
//     this.lat = ko.observable(data.lat);
//     this.lng = ko.observable(data.lng);
// };

// var ViewModel = function() {
//     var self = this;
//     var lat = ko.observable(38.538232);
//     var lng = ko.observable(-121.761712);
//     var id = "MG5AI4G2VTZ04J4EVB4QTXZRBA55KXQNE14ESESTXQPK23TU";
//     var secret = "CXAQRGU5TPCRXLGN4AHRTALO42OCSVEGPJBGKMF5U1CDOAL1";
//     var location = new google.maps.LatLng(lat(),lng());

//     self.venues = ko.observableArray([]);
//     self.markerList = ko.observableArray([]);
//     self.locationMarker = ko.observable();

//     // self.map = ko.observable({
//     //     lat: ko.observable(38.455),
//     //     lng: ko.observable(-121.406)
//     // });

    // self.init = function () {
    //     var mapOptions = {
    //         disableDefaultUI: false,
    //         center: location,
    //         position: location,
    //         zoom: 11,
    //         mapTypeId: google.maps.MapTypeId.ROADMAP
    //     }
    //     self.map = new google.maps.Map(document.getElementById('mapDiv'), mapOptions);
    //     self.infoWindow = new google.maps.InfoWindow();
    //     self.markLocation();
    //     self.getVenues();
    // };

    // self.markLocation = function() {
    //     self.locationMarker(new google.maps.Marker({
    //         map: self.map,
    //         position: location,
    //         title: "Current Location"
    //     }));
    // };

    // self.createMapMarker = function(placeData) {
    //     var googleLatLng = new google.maps.LatLng(placeData.location.lat, placeData.location.lng);

    //     var marker = new google.maps.Marker({
    //         map: self.map,
    //         position: googleLatLng,
    //         title: placeData.name
    //     });

    //     // google.maps.event.addListener(marker, 'click', (function(marker, map, infoWindow) {
    //     //     return function() {
    //     //         infoWindow.setContent(marker.title + "is here");
    //     //         infoWindow.open(map, marker);
    //     //     }
    //     // })(marker, self.map, self.infoWindow));

    //     self.mapMarkers().push(marker);
    // }


    // self.getVenues = function() {
    //     $.ajax({
    //         type: "get",
    //         url: "https://api.foursquare.com/v2/venues/search?ll=" + lat() + "," + lng() + "&client_id=" + id + "&client_secret=" + secret + "&v=20150217&query=food&radius=10000",
    //         // test url: https://api.foursquare.com/v2/venues/search?ll=38.538232,-121.761712&client_id=MG5AI4G2VTZ04J4EVB4QTXZRBA55KXQNE14ESESTXQPK23TU&client_secret=CXAQRGU5TPCRXLGN4AHRTALO42OCSVEGPJBGKMF5U1CDOAL1&v=20150217&query=food
    //         success: function(data) {
    //             self.venues(data.response.venues);
    //             $("#venues").html("");
    //             $.each(self.venues(), function() {
    //                 var phone, category, address, rating;
    //                 phone = this.contact.formattedPhone ? "Phone: " + this.contact.formattedPhone : "";
    //                 category = this.categories[0] ? this.categories[0].name : "";
    //                 address = this.location.address ? "<p>" + this.location.address + "</p>" : "";
    //                 rating = this.rating ? "<span>" + this.rating + "</span>" : "";
    //                 var dataHTML = "<div class='venue'><h2><span>" + this.name + category + rating + "</span></h2>" + address + phone + "</p></div>";
    //                 var marker = new google.maps.Marker({
    //                     position: new google.maps.LatLng(this.location.lat, this.location.lng),
    //                     title: this.name,
    //                     map: self.map
    //                 });
    //                 google.maps.event.addListener(marker, 'click', function() {
    //                     console.log(self.infoWindow);
    //                     self.infoWindow.setContent(dataHTML);
    //                     self.infoWindow.open(self.map);
    //                 });

    //                 self.markerList.push({
    //                     marker: marker,
    //                     content: dataHTML
    //                 });
    //             });
    //         }
    //     });
    // }

//     self.init();

// }

$(document).ready(function(){
   ko.applyBindings(new ViewModel()); 
});