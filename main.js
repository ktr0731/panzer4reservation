"use strict";

// var topPage = require("webpage").create();
var casper = require("casper").create();
var GUP_URL= "https://res.cinemacity.co.jp/TicketReserver/studio/movie/510";

var t = Date.now();

casper.start(GUP_URL);
casper.then(function() {
  this.echo("Title: " + this.getTitle());
  this.echo("Loading time: " + (Date.now() - t) + "ms");
});

casper.run();
