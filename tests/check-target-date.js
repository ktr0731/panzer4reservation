"use strict";
var system = require("system");

/**
 *  1. ページを開く
 *  2. 目的の日付をクリックする
 *  3. 空いている席の内、最も指定した席に近いものを指定する
 *  4. 申し込む
 */

var casper = require("casper").create();
var URL = "https://res.cinemacity.co.jp/TicketReserver/login"

var t = Date.now();

casper.start(URL, function() {
  this.echo("Title: " + this.getTitle());
  this.echo("Loading time: " + (Date.now() - t) + "ms");
});

casper.thenEvaluate(function(email, password) {
  document.querySelector("input#login_email_address").value = email;
  document.querySelector("input#login_password").value = password;
  document.querySelector("#login_button").click();
}, system.env.EMAIL, system.env.PASSWORD);

casper.then(function() {
  this.capture("./img/login1.png");
})

casper.thenOpen("https://res.cinemacity.co.jp/TicketReserver/mypage", function() {
  this.capture("./img/login2.png");
});

casper.run();
