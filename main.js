"use strict";

/**
 *  1. ページを開く
 *  2. 目的の日付をクリックする
 *  3. 空いている席の内、最も指定した席に近いものを指定する
 *  4. 申し込む
 */

// var topPage = require("webpage").create();
var casper = require("casper").create();
// var GUP_URL= "https://res.cinemacity.co.jp/TicketReserver/studio/movie/510";

// For test
var GUP_URL= "http://localhost:8888";

var t = Date.now();

casper.start(GUP_URL);
casper.then(function() {
  this.echo("Title: " + this.getTitle());
  this.echo("Loading time: " + (Date.now() - t) + "ms");
  this.click("#F13");
  this.capture("./img/ss.png");
});

casper.run();
