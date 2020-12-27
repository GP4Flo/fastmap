"use strict";

let step = 0.001;
let current_lng = 0;
let current_lat = 0;
let current_alt;
let current_heading;

let zoom_level = 17;
let current_zoom_level = 17;
let myMarker = "";
let windowOpen = "map";

let tilesLayer;
let overlay;
let overlayshading;
let overlayon = false;
let hillshadingon = false;
let tilesUrl;

let map;
let marker_latlng = false;

$(document).ready(function() {

navigator.serviceWorker.register('assets/js/sw.js');
	
    //KaiAds
    getKaiAd({
    publisher: '6c03d2e1-0833-4731-aac0-801acfc4eb6e',
    app: 'fastmap',
    slot: 'about',
    test: 0,
    h: 152,
    w: 238,
    container: document.getElementById('ad-container'),
    onerror: err => console.error('Custom catch:', err),
    onready: ad => {
        ad.call('display', {
            tabindex: 0,
            navClass: 'items',
            display: 'block',
        })
    }
});

    setTimeout(function() {
        //get location
        getLocation("init");
        ///set default map
        osm_map();
        windowOpen = "map";
    }, 0);

    //leaflet add basic map
    map = L.map('map-container', {
        zoomControl: false,
        dragging: false,
        keyboard: true
    }).fitWorld();
    L.control.scale({ position: 'topright', metric: true, imperial: false }).addTo(map);
  
    ////////////////////
    ////MAPS////////////
    ///////////////////

    function mobileatlas_map() {
        tilesUrl = 'https://{s}.tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png32?apikey=5bd2317851a14fcaa3f0986eb79b8725'
        tilesLayer = L.tileLayer.fallback(tilesUrl, {
            maxZoom: 22,
            attribution: 'Map data © OpenStreetMap contributors, Mobile Atlas tiles style © Thunderforest'
        });
        map.addLayer(tilesLayer);
    }
    
    function osm_map() {
        tilesUrl = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png '
        tilesLayer = L.tileLayer.fallback(tilesUrl, {
            maxZoom: 20,
            attribution: 'Map data © OpenStreetMap contributors, HOT tiles style © Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
        });
        map.addLayer(tilesLayer);
    }
    
    function railway() {
        tilesUrl = 'https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png'
        overlay = L.tileLayer.fallback(tilesUrl, {
            minZoom: 2,
	        maxZoom: 19,
            attribution: 'Railway style: CC-BY-SA 2.0 OpenRailwayMap'
        });
        map.addLayer(overlay);
        overlayon = true;
    }

    function rain() {
        tilesUrl = 'http://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=99d2594c090c1ee9a8ad525fd7a83f85'
        overlay = L.tileLayer.fallback(tilesUrl, {
            maxZoom: 19,
            attribution: 'Rain © OpenWeather'
        });
        map.addLayer(overlay);
        overlayon = true;
    }

    function clouds() {
        tilesUrl = 'http://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=99d2594c090c1ee9a8ad525fd7a83f85'
        overlay = L.tileLayer.fallback(tilesUrl, {
            maxZoom: 19,
            attribution: 'Clouds © OpenWeather'
        });
        map.addLayer(overlay);
        overlayon = true;
    }

    ////////////////////
    ////GEOLOCATION/////
    ///////////////////
    //////////////////////////
    ////MARKER SET AND UPDATE/////////
    /////////////////////////

    function getLocation(option) {
        marker_latlng = false;
        if (option == "init") {
            toaster("Seeking Position. Press the center key to open the menu.", 10000);
            let options = {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: Infinity
              };
            navigator.geolocation.getCurrentPosition(success, error, options);
        }
        if (option == "update_marker") {
            toaster("Seeking Position...", 2000);
            let options = {
                enableHighAccuracy: true,
                timeout: Infinity,
                maximumAge: 0
              };
            navigator.geolocation.getCurrentPosition(success, error, options);
        }
        function success(pos) {
            let crd = pos.coords;
            current_lat = crd.latitude;
            current_lng = crd.longitude;
            current_alt = crd.altitude;
            current_heading = crd.heading;
            if (option == "init") {
                myMarker = L.marker([current_lat, current_lng]).addTo(map);
                map.flyTo(new L.LatLng(current_lat, current_lng), 17, {animate: false});
                zoom_speed();
                return false;
            }
            if (option == "update_marker" && current_lat != "") {
                myMarker.setLatLng([current_lat, current_lng]).update();
                map.panTo(new L.LatLng(current_lat, current_lng), {animate: false});
            }
        }
        function error(err) {
            toaster("Position not found. Press center key to search for a location.", 4000);
            return false;
        }
    }

    //////////////////////////
    ////SEARCH BOX////////////
    /////////////////////////

    function showSearch() {
        bottom_bar("Position", "SELECT", "?/About");
        $('div#search-box').css('display', 'block');
        $('div#search-box').find("input").focus();
        $("div#bottom-bar").css("display", "block");
        windowOpen = "search";
    }
    function hideSearch() {
        $("div#bottom-bar").css("display", "none");
        $('div#search-box').css('display', 'none');
        $('div#search-box').find("input").blur();
        windowOpen = "map";
    }


    // ABOUT
    function showAbout() {
        bottom_bar("Close", "SELECT", "About");
        $('div#search-box').css('display', 'none');
        $("div#toast").css("display", "none");
        $('div#search-box').find("input").blur();
        $('div#about').css('display', 'block');
        $("div#bottom-bar").css("display", "block");
	$("div#map-container").css("display", "none");
        windowOpen = "about";
        nav(1);
    }
    function hideAbout() {
        $("div#bottom-bar").css("display", "none");
        $('div#about').css('display', 'none');
	$("div#map-container").css("display", "block");
        document.activeElement.blur();
        windowOpen = "map";
    }

    /////////////////////
    ////ZOOM MAP/////////
    ////////////////////

    function ZoomMap(in_out) {
        let current_zoom_level = map.getZoom();
        if (windowOpen == "map" && $('div#search-box').css('display') == 'none') {
            if (in_out == "in") {
                current_zoom_level = current_zoom_level + 1
                map.setZoom(current_zoom_level);
            }
            if (in_out == "out") {
                current_zoom_level = current_zoom_level - 1
                map.setZoom(current_zoom_level);
            }
            zoom_level = current_zoom_level;
            zoom_speed();
        }
    }

    function zoom_speed() {
        if (zoom_level < 2) {
            step = 10;
        }
        if (zoom_level > 2) {
            step = 7.5;
        }
        if (zoom_level > 3) {
            step = 5;
        }
        if (zoom_level > 4) {
            step = 1;
        }
        if (zoom_level > 5) {
            step = 0.50;
        }
        if (zoom_level > 6) {
            step = 0.25;
        }
        if (zoom_level > 7) {
            step = 0.1;
        }
        if (zoom_level > 8) {
            step = 0.075;
        }
        if (zoom_level > 9) {
            step = 0.05;
        }
        if (zoom_level > 10) {
            step = 0.025;
        }
        if (zoom_level > 11) {
            step = 0.01;
        }
        if (zoom_level > 12) {
            step = 0.0075;
        }
        if (zoom_level > 13) {
            step = 0.005;
        }
        if (zoom_level > 14) {
            step = 0.0025;
        }
        if (zoom_level > 15) {
            step = 0.001;
        }
        if (zoom_level > 16) {
            step = 0.0005;
        }
        return step;
    }

    /////////////////////
    //MAP NAVIGATION//
    /////////////////////

    function MovemMap(direction) {
        if (!marker_latlng) {
            if (windowOpen == "map") {
                if (direction == "left") {
                    zoom_speed()
                    current_lng = current_lng - step;
                    map.panTo(new L.LatLng(current_lat, current_lng));
                }
                if (direction == "right") {
                    zoom_speed()
                    current_lng = current_lng + step;
                    map.panTo(new L.LatLng(current_lat, current_lng));
                }
                if (direction == "up") {
                    zoom_speed()
                    current_lat = current_lat + step;
                    map.panTo(new L.LatLng(current_lat, current_lng));
                }
                if (direction == "down") {
                    zoom_speed()
                    current_lat = current_lat - step;
                    map.panTo(new L.LatLng(current_lat, current_lng));
                }
            }
        }

        //when marker is not current location
        //to calculate distance between current position and marker
        if (marker_latlng) {
            if (windowOpen == "map") {
                if (direction == "left") {
                    zoom_speed()
                    marker_lng = marker_lng - step;
                    map.panTo(new L.LatLng(marker_lat, marker_lng));
                }
                if (direction == "right") {
                    zoom_speed()
                    marker_lng = marker_lng + step;
                    map.panTo(new L.LatLng(marker_lat, marker_lng));
                }
                if (direction == "up") {
                    zoom_speed()
                    marker_lat = marker_lat + step;
                    map.panTo(new L.LatLng(marker_lat, marker_lng));
                }
                if (direction == "down") {
                    zoom_speed()
                    marker_lat = marker_lat - step;
                    map.panTo(new L.LatLng(marker_lat, marker_lng));
                }
            }
        }

    }


    //////////////////////////////
    ////KEYPAD HANDLER////////////
    //////////////////////////////

    let longpress = false;
    const longpress_timespan = 1000;
    let timeout;

    function repeat_action(param) {
        if (windowOpen == "map"){
        switch (param.key) {
            case 'ArrowUp':
                MovemMap("up")
                break;
            case 'ArrowDown':
                MovemMap("down")
                break;
            case 'ArrowLeft':
                MovemMap("left")
                break;
            case 'ArrowRight':
                MovemMap("right")
                break; 
            case 'Enter':
                break;
        }
    }
    }

    ///////////////
    ////SHORTPRESS
    //////////////

    function shortpress_action(param) {
        switch (param.key) {
            case '1':
                map.removeLayer(tilesLayer)
                if (overlayon) {
                    map.removeLayer(overlay)
                }
                osm_map();
                break;
            case '2':
                map.removeLayer(tilesLayer)
                if (overlayon) {
                    map.removeLayer(overlay)
                }
                mobileatlas_map();
                break;
            case '3':
                if (overlayon) {
                    map.removeLayer(overlay)
                }
                railway();
                break;
            case '0':
                if (overlayon) {
                    map.removeLayer(overlay)
                }
                break;
            case '*':
                if (overlayon) {
                    map.removeLayer(overlay)
                }
                clouds();
                break;
            case '#':
                if (overlayon) {
                    map.removeLayer(overlay)
                }
                rain();
                break;
            case 'EndCall':
                window.close();
                break;
            case 'Backspace':
                param.preventDefault();
                if (windowOpen == "search") {
                    hideSearch();
                    return false;
                }
                if (windowOpen == "map") {
                    window.close();
                }
                break;
            case 'SoftLeft':
                if (windowOpen == "search") {
                    getLocation("update_marker")
                    hideSearch();
                    return false;
                }
                if (windowOpen == "map") {
                    ZoomMap("out");
                    return false;
                }
                if (windowOpen == "about") {
                    hideAbout();
                    return false;
                }
                break;
            case 'SoftRight':
                if (windowOpen == "search") {
                    showAbout();
                    return false;
                }
                if (windowOpen == "about") {
                    window.open('about.html', "new", "menubar,toolbar,scrollbars");
                    return false;
                    }
                if (windowOpen == "map") {
                    ZoomMap("in");
                }
                break;
            case 'Enter':
                if (windowOpen == "map") {
                    showSearch();
                    return false;
                }
                if (windowOpen == "about") {
                    nav(1);
                }
                if (windowOpen == "search") {
                    hideSearch();
                    return false;
                }
                break;
            case 'ArrowRight':
                if (windowOpen == "map") {
                MovemMap("right")
                return false;
                }
                if (windowOpen == "about") {
                nav(1);
                }
                break;
            case 'ArrowLeft':
                if (windowOpen == "map") {
                MovemMap("left")
                return false;
                }
                if (windowOpen == "about") {
                    nav(1);
                }
                break;
            case 'ArrowUp':
                if (windowOpen == "map") {
                MovemMap("up")
                return false;
                }
                if (windowOpen == "about") {
                    nav(1);
                }
                break;
            case 'ArrowDown':
                if (windowOpen == "map") {
                MovemMap("down")
                return false;
                }
                if (windowOpen == "about") {
                nav(1);
                }
                break;
        }
    }

    // D-Pad navigation
    function nav (move) {
        const currentIndex = document.activeElement.tabIndex;
        const next = currentIndex + move;
        const items = document.querySelectorAll('.items');
        const targetElement = items[next];
        targetElement.focus();
      }

    /////////////////////////////////
    ////shortpress / longpress logic
    ////////////////////////////////

    function handleKeyDown(evt) {
        if (!evt.repeat) {
            evt.preventDefault();
            longpress = false;
            timeout = setTimeout(() => {
                longpress = true;
            }, longpress_timespan);
        }
        if (evt.repeat) {
            longpress = false;
            repeat_action(evt);
        }
    }

    function handleKeyUp(evt) {
        evt.preventDefault();
        clearTimeout(timeout);
        if (!longpress) {
            shortpress_action(evt);
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    function toaster(text, time) {
        $("div#toast").html("<div>" + text + "</div>")
        $("div#toast").animate({ top: "0px" }, 1000, "linear", function() {
            $("div#toast").delay(3000).animate({ top: "-100px" }, time);
        });
    }
    
    //bottom bar
    function bottom_bar(left, center, right) {
        $("div#bottom-bar div#button-left").text(left)
        $("div#bottom-bar div#button-center").text(center)
        $("div#bottom-bar div#button-right").text(right)
    }

    //search
    var ac_selected_station = $('#search').autocomplete({
        serviceUrl: "https://nominatim.openstreetmap.org/search?format=json&limit=12",
        minChars: 2,
        showNoSuggestionNotice: true,
        paramName: 'q',
        lookupLimit: 12,
        deferRequestBy: 1000,
        transformResult: function(response) {
            console.log(response);
            var obj = $.parseJSON(response);
            return {
                suggestions: $.map(obj, function(dataItem) {
                    return { value: dataItem.display_name, data_lat: dataItem.lat, data_lon: dataItem.lon };

                })
            }
        },
        onSearchStart: function() {},
        onSearchError: function(query, jqXHR, textStatus, errorThrown) {
            toaster(JSON.stringify(jqXHR), 2000)
        },
        onSelect: function(suggestion) {
            let lat_lon = [suggestion.data_lat, suggestion.data_lon];
        }
    })

    //add marker
    function addMarker(lat, lng) {
        L.marker([lat, lng]).addTo(map);
        map.setView([lat, lng], 14);
        current_lat = Number(lat);
        current_lng = Number(lng);
    }

});
