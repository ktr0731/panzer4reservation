"use strict";

var fs     = require("fs");

var casper = require("casper").create({
  verbose : true,
  logLevel : "debug"
});

var URL = "http://localhost:8888"

var wishSeats = JSON.parse(fs.read("config.json")).wishSeats;
// var wishSeats = [["F1", "F2"], ["B6", "B5"]];

var t = Date.now();

casper.start(URL, function() {
  this.echo("Title: " + this.getTitle());
  this.echo("Loading time: " + (Date.now() - t) + "ms");
});

casper.thenEvaluate(function(seats) {
  firstLoop : for (var i = 0; i < seats.length; i++) {
    for (var j = 0; j < seats[i].length; j++) {
      if (document.querySelector("#" + seats[i][j] + "_base").className == "reserved") {
        continue firstLoop;
      }
    }

    // All seat are vacancy.
    for (var j = 0; j < seats[i].length; j++) {
      document.querySelector("#" + seats[i][j]).click();
    }
    break;
  }

}, wishSeats);

casper.then(function() {
  this.capture("./img/check-target-seats.png");
});

casper.run();
