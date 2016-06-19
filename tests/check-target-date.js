"use strict";

var fs     = require("fs");

var casper = require("casper").create({
  verbose : true,
  logLevel : "debug"
});

var URL = "http://localhost:8888"

var targetDate = JSON.parse(fs.read("config.json")).targetDate;

var t = Date.now();

casper.start(URL, function() {
  this.echo("targetDate: " + targetDate);
  this.echo("Title: " + this.getTitle());
  this.echo("Loading time: " + (Date.now() - t) + "ms");
});

casper.thenEvaluate(function(targetDate) {
  dates = document.querySelectorAll('#rdb ul li');
  dates[0].querySelector("a").click();
  for (var i = 0; i < dates.length; i++) {
    if (dates[i].querySelector(".rdb-day").innerHTML == targetDate + "日") {
      dates[i].querySelector("a").click();
    }
  }

}, targetDate);

casper.then(function() {
  this.capture("./img/check-target-date.png");
});

casper.run();
