"use strict";

let step = 0.001;
let current_lng = 0;
let current_lat = 0;
let current_alt;
let accuracy = 0;
let altitude;
let current_heading;

let zoom_level;
let current_zoom_level;
let new_lat = 0;
let new_lng = 0;
let curPos = 0;
let myMarker = "";
let i = 0;
let windowOpen = "map";
let message_body = "";
let openweather_api = "";
let tabIndex = 0;
let debug = false;

let tilesLayer;
let tileLayer;
let myLayer;
let tilesUrl;
let state_geoloc = "not-activ";
let savesearch = false;

let search_current_lng;
let search_current_lat;

let map;
let open_url = false;
let marker_latlng = false;

let file_path;
let storage_name;

$(document).ready(function() {

    document.addEventListener("DOMContentLoaded", () => {
        // request an ad when the DOM is loaded
        getKaiAd({
        publisher: '6c03d2e1-0833-4731-aac0-801acfc4eb6e',
        app: 'Topo Map',
        test: 0,
        onready: ad => {
                ad.call('display')
                ad.on('display', () => document.getElementsByClassName( 'leaflet-control-attribution' )[0].style.display = 'none' )
                ad.on('display', () => document.getElementsByClassName( 'leaflet-control-scale' )[0].style.display = 'none' )
                ad.on('close', () => document.getElementsByClassName( 'leaflet-control-attribution' )[0].style.display = 'block' )
                ad.on('close', () => document.getElementsByClassName( 'leaflet-control-scale' )[0].style.display = 'block' )
        }  
        })
        });
    
    //welcome message
    $('div#message div').text("Welcome");
    setTimeout(function() {
        $('div#message').css("display", "none")
        //get location
        getLocation("init");
        ///set default map
        opentopo_map();
        windowOpen = "map";
    }, 1000);

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

    function opentopo_map() {
        tilesUrl = 'https://tile.opentopomap.org/{z}/{x}/{y}.png'
        tilesLayer = L.tileLayer(tilesUrl, {
            maxZoom: 17,
            attribution: 'Map data © OpenStreetMap contributors, SRTM<div>Imagery: © OpenTopoMap (CC-BY-SA)</div>'
        });

        map.addLayer(tilesLayer);
    }

    ////////////////////
    ////GEOLOCATION/////
    ///////////////////
    //////////////////////////
    ////MARKER SET AND UPDATE/////////
    /////////////////////////

    function getLocation(option) {

        marker_latlng = false;
        if (option == "init" || option == "update_marker") {
        }
        let options = {
            enableHighAccuracy: true,
            timeout: 50000,
            maximumAge: 0
        };

        function success(pos) {
            let crd = pos.coords;
            current_lat = crd.latitude;
            current_lng = crd.longitude;
            current_alt = crd.altitude;
            current_heading = crd.heading;
            if (option == "init") {
                myMarker = L.marker([current_lat, current_lng]).addTo(map);
                $('div#message div').text("");
                return false;
            }
            if (option == "update_marker" && current_lat != "") {
                myMarker.setLatLng([current_lat, current_lng]).update();
                map.flyTo(new L.LatLng(current_lat, current_lng), 14);
                zoom_speed()
            }
        }
        function error(err) {
            toaster("Position not found", 2000);
            return false;
        }
        navigator.geolocation.getCurrentPosition(success, error, options);
    }

    //////////////////////////
    ////SEARCH BOX////////////
    /////////////////////////

    function showSearch() {

        bottom_bar("Position", "SELECT", "About")
        $('div#search-box').css('display', 'block');
        $('div#search-box').find("input").focus();
        $("div#bottom-bar").css("display", "block")
        windowOpen = "search";

    }

    function hideSearch() {
        $("div#bottom-bar").css("display", "none")
        $('div#search-box').css('display', 'none');
        $('div#search-box').find("input").val("");
        $('div#search-box').find("input").blur();
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

    //////////////
    ////LONGPRESS
    /////////////


    function longpress_action(param) {
        switch (param.key) {
            case 'Enter':
                getLocation("update_marker")
                break;
        }
    }


    ///////////////
    ////SHORTPRESS
    //////////////

    function shortpress_action(param) {
        switch (param.key) {

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
                break;

            case 'SoftRight':
                if (windowOpen == "search") {
                    window.open('about.html');
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
                if (windowOpen == "search") {
                    hideSearch();
                    return false;
                }

                break;

            case 'ArrowRight':
                MovemMap("right")
                break;

            case 'ArrowLeft':
                MovemMap("left")
                break;

            case 'ArrowUp':
                MovemMap("up")
                break;

            case 'ArrowDown':
                MovemMap("down")
                break;
        }
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
                longpress_action(evt);
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

    //////////////////////////
    ////BUG OUTPUT////////////
    /////////////////////////
    if (debug) {
        $(window).on("error", function(evt) {
            console.log("jQuery error event:", evt);
            var e = evt.originalEvent; // get the javascript event
            console.log("original event:", e);
            if (e.message) {
                alert("Error:\n\t" + e.message + "\nLine:\n\t" + e.lineno + "\nFile:\n\t" + e.filename);
            } else {
                alert("Error:\n\t" + e.type + "\nElement:\n\t" + (e.srcElement || e.target));
            }
        });
    }

});