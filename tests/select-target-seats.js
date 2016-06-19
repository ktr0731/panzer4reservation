"use strict";

var fs     = require("fs");

var casper = require("casper").create({
  verbose : true,
  logLevel : "debug"
});

// var URL = "https://res.cinemacity.co.jp/TicketReserver/studio/movie/510"

var URL = "http://localhost:8888"

var config = JSON.parse(fs.read("config.json"));
// var wishSeats = [["F1", "F2"], ["B6", "B5"]];

var t = Date.now();

casper.start(URL, function() {
  this.echo("Title: " + this.getTitle());
  this.echo("Loading time: " + (Date.now() - t) + "ms");
});

casper.thenEvaluate(function(config) {
  var seats = config.wishSeats;
  var emails = config.emails;

  firstLoop : for (var i = 0; i < seats.length; i++) {
    for (var j = 0; j < seats[i].length; j++) {
      if (document.querySelector("#" + seats[i][j] + "_base").className == "reserved") {
        continue firstLoop;
      }
    }

    // All seat are vacancy.
    for (var j = 0; j < seats[i].length; j++) {
      document.querySelector("#" + seats[i][j]).click();

      if (j != 0) {
        // Set friends information
        document.querySelector("#gender_"    + seats[i][j]).selectedIndex = 1;
        document.querySelector("#age_group_" + seats[i][j]).selectedIndex = 5;
        if (emails[j - 1]) {
          document.querySelector("#discount_" + seats[i][j]).selectedIndex = 1;
          document.querySelector("#address_"  + seats[i][j]).value = emails[j - 1];
        }
      }
    }
    break;
  }

}, config);

casper.then(function() {
  this.capture("./img/check-target-seats.png");
});

casper.run();
