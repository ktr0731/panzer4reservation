"use strict";

var fs = require("fs");

fs.readFile("./example.html", "utf8", function(error, content) {
  if (error) {
    throw error;
  }

  var parser = new DOMParser();
  document = parser.parserFromString(content, "text/html");

  e = document.querySelector("#studio");

  console.log(e);

});
