var ViewModel = function() {
    var self = this;
    var id = "MG5AI4G2VTZ04J4EVB4QTXZRBA55KXQNE14ESESTXQPK23TU";
    var secret = "CXAQRGU5TPCRXLGN4AHRTALO42OCSVEGPJBGKMF5U1CDOAL1";
    var lat = ko.observable(38.538232);
    var lng = ko.observable(-121.761712);

    self.venues = ko.observableArray([]);

    self.init = function() {
        self.getVenues();

        $('.menu-icon-link').on('click', function() {
            $('.menu').toggle("slow");
        });
    };

    self.getVenues = function() {
        var urlPre = "https://api.foursquare.com/v2/venues/search?ll="
        $.ajax({
            type: "get",
            url: urlPre + lat() + "," + lng() + "&client_id=" + id + "&client_secret=" + secret + "&v=20150217&query=food&radius=10000",
            // test url: https://api.foursquare.com/v2/venues/search?ll=38.538232,-121.761712&client_id=MG5AI4G2VTZ04J4EVB4QTXZRBA55KXQNE14ESESTXQPK23TU&client_secret=CXAQRGU5TPCRXLGN4AHRTALO42OCSVEGPJBGKMF5U1CDOAL1&v=20150217&query=food
            success: function(data) {
                var dataHTML = "";
                self.venues(data.response.venues);

                $.each(self.venues(), function() {
                    var phone, category, address, rating;
                    phone = this.contact.formattedPhone ? "Phone: " + this.contact.formattedPhone : "";
                    category = this.categories[0] ? this.categories[0].name : "";
                    address = this.location.address ? "<p>" + this.location.address + "</p>" : "";
                    rating = this.rating ? "<span>" + this.rating + "</span>" : "";
                    dataHTML += "<div class='venue'><h2><span>" + this.name + category + rating + "</span></h2>" + address + phone + "</p></div>";
                });
                $(".menu").html(dataHTML);
            }
        });
    };

    self.init();
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

ko.applyBindings(new ViewModel());