"use strict";

function toaster(text, time) {

    $("div#toast").html("<div>" + text + "</div>")
    $("div#toast").animate({ top: "0px" }, 1000, "linear", function() {
        $("div#toast").delay(3000).animate({ top: "-100px" }, time);
    });


}

function toaster_new(text, time, pos) {

    $("div#toast").html("<div>" + text + "</div>")
    $("div#toast").animate({ pos: "0px" }, 1000, "linear", function() {
        $("div#toast").delay(3000).animate({ pos: "-100px" }, time);
    });


}

//bottom bar
function bottom_bar(left, center, right) {
    $("div#bottom-bar div#button-left").text(left)
    $("div#bottom-bar div#button-center").text(center)
    $("div#bottom-bar div#button-right").text(right)
}