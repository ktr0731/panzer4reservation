var fs = require("fs");

fs.readFile("config.json", function(err, content) {
  if (err) {
    throw err;
  }

  targetDate = JSON.parse(content).targetDate;
  console.log("target:" + targetDate)
});

