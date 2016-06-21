"use strict";

var system = require("system");
var fs     = require("fs");

var config = JSON.parse(fs.read("config.json"));

var casper = require("casper").create({
  verbose : true,
  logLevel : "debug",
  viewportSize: {
    width: 1024,
    height: 768
  }
});
casper.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36");

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
// casper.thenEvaluate(GUP_URL, function(config) {
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
      $("#" + seats[i][j]).trigger("click");

      if (j != 0) {
        // Set friends information
        $("#gender_"    + seats[i][j]).val("1").change();
        $("#age_group_" + seats[i][j]).val("13").change();
        if (emails[j - 1]) {
          document.querySelector("#discount_" + seats[i][j]).selectedIndex = 1;
          $("#discount_" + seats[i][j]).val("1").change();
          $("#address_"  + seats[i][j]).val(emails[j - 1]).change();
        }
      }
    }
    $("#reserve-now-button").trigger("click");
    break;
  }
}, config);

casper.then(function() {
  this.capture("./img/select-target-seats.png");
});

casper.then(function() {
  this.wait(5000, function() {
    this.echo("Title" + this.getTitle());
    this.capture("./img/confirmation.png");

    this.thenEvaluate(function() {
      $("#settle_tickets_with_last_card").trigger("click");
    });
  });
});

casper.then(function() {
  this.wait(2000, function() {
    this.echo("Title" + this.getTitle());
    this.capture("./img/finish.png");
  });
});

casper.run();
