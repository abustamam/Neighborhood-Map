Neighborhood-Map
================

## How to use

### Cloning and deploying

First, run `npm install` in order to install any necessary dependencies. (You will need node.js)

In order to deploy, you can run `gulp deploy` which will automatically minify and deploy to the gh-pages branch of your repository. 

Open up `index.html` in Chrome (Firefox is not compatible due to usage of webp). 

### "Just Running" the app

Click [here](http://abustamam.github.io/Neighborhood-Map) in order to open the app. Remember to use Chrome.

If Groupon is in your area, the app should automatically detect your location. If not, simply type in a major metropolitan area (e.g. San Francisco) in the search box at the top. 

Once the list is populated with locations, you can now search within locations at the top of the menu (you may need to click on the menu button on the top-left corner).

Have fun saving money!

## version 0.1

### Features

-Search for Groupons in a specific area
-Click on markers to center and see groupon URL

## To do

- Add more info about the groupon (price, discounts, etc)
- Fix the rating-to-star feature when filtering locations
- Add all groupons (not just food and drink), and ability to filter between categories
- Add other services (living social, foursquare, etc)
- Optimize gulpfile (e.g., compiling all css into one css file)

## Resources

- [Google Maps API](https://developers.google.com/maps/documentation/javascript/tutorial)
- ["Boilerplate" code](http://stackoverflow.com/questions/12722925/google-maps-and-knockoutjs)
- [KnockoutJS Docs](http://knockoutjs.com/documentation/custom-bindings.html)
- [Creative use of Foursquare API to get list of places](https://github.com/greg-colin/greg-colin.github.io)
- [Inspiration to use Groupon API](https://github.com/sheryllun/Project5-NeighborhoodMap)
- [Stack Overflow](http://stackoverflow.com/questions/28976956/sidebar-is-extending-past-viewport) for menu styling
- [Stack Overflow](http://stackoverflow.com/questions/1987524/turn-a-number-into-star-rating-display-using-jquery-and-css) for star styling
- [Auto-Complete Plugin](https://www.devbridge.com/sourcery/components/jquery-autocomplete/)
- [Start Bootstrap Sidebar](http://startbootstrap.com/template-overviews/simple-sidebar/)
- [Search Navbar](http://www.mentful.com/2014/06/22/fixed-search-navbar-with-bootstrap-3-0/)
- [Additional GMAPS tutorial](http://www.w3schools.com/googleapi/google_maps_events.asp)
- [Google maps div resize](http://stackoverflow.com/questions/9458215/google-maps-not-working-in-jquery-tabs)
- [Continuous centering of map](http://stackoverflow.com/questions/8792676/center-google-maps-v3-on-browser-resize-responsive)
