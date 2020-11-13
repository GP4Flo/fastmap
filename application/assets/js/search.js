"use strict";

$(document).ready(function() {
    var ac_selected_station = $('#search').autocomplete({
        serviceUrl: "https://nominatim.openstreetmap.org/search?format=json&limit=12",
        minChars: 2,
        showNoSuggestionNotice: true,
        paramName: 'q',
        lookupLimit: 12,
        deferRequestBy: 1500,
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
            addMarker(lat_lon[0], lat_lon[1])
        }
    })
    //add marker
    function addMarker(lat, lng) {
        L.marker([lat, lng]).addTo(map);
        map.setView([lat, lng], 13);
        current_lat = Number(lat);
        current_lng = Number(lng);
    }
})