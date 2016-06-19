"use strict";

var system = require("system");
var fs     = require("fs");

var config = JSON.parse(fs.read("config.json"));

var casper = require("casper").create({
  verbose : true,
  logLevel : "debug"
});

var GUP_URL= "https://res.cinemacity.co.jp/TicketReserver/studio/movie/510";
// var GUP_URL= "http://localhost:8888";
var LOGIN_URL = "https://res.cinemacity.co.jp/TicketReserver/login";
var MYPAGE_URL = "https://res.cinemacity.co.jp/TicketReserver/mypage";

// Start
casper.start(LOGIN_URL, function() {
  this.echo("Title: " + this.getTitle());
});

// Login to Tachikawa cinema city
casper.thenEvaluate(function(email, password) {
  document.querySelector("input#login_email_address").value = email;
  document.querySelector("input#login_password").value      = password;
  document.querySelector("#login_button").click();
}, system.env.EMAIL, system.env.PASSWORD);

casper.then(function() {
  this.capture("./img/login1.png");
})

// Capture screen shot for test
casper.thenOpen(MYPAGE_URL, function() {
  this.capture("./img/login2.png");
});

// Go to GuP page and select target date
casper.thenOpenAndEvaluate(GUP_URL, function(targetDate) {
  dates = document.querySelectorAll('#rdb ul li');
  for (var i = 0; i < dates.length; i++) {
    if (dates[i].querySelector(".rdb-day").innerHTML == targetDate + "日") {
      dates[i].querySelector("a").click();
    }
  }
}, config.targetDate);

casper.then(function() {
  this.capture("./img/select-target-date.png");
});

// Select wish seats
// casper.thenOpen(GUP_URL, function(seats) {
casper.thenEvaluate(function(seats) {
  firstLoop : for (var i = 0; i < seats.length; i++) {
    for (var j = 0; j < seats[i].length; j++) {
      if (document.querySelector("#" + seats[i][j] + "_base").className == "reserved") {
        continue firstLoop;
      }
    }

    // All seat are vacancy
    for (var j = 0; j < seats[i].length; j++) {
      document.querySelector("#" + seats[i][j]).click();
    }
    break;
  }

}, config.wishSeats);

casper.then(function() {
  this.capture("./img/select-target-seats.png");
});

casper.run();
