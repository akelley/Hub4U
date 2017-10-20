var express = require("express");
var bodyParser = require("body-parser");
// var methodOverride = require("method-override");
var router = express.Router();

var PORT = process.env.PORT || 3000;

var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Set body-parser middleware to handle forms and json data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Override with POST having ?_method=DELETE
// app.use(methodOverride("_method"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use('/', require("./routes/frontend/html-routes.js"));
// app.use('/api/stations/', require("./routes/api/api-routes.js"));
// require("./routes/api/api-routes.js")(app);
app.use('/api', require("./routes/api/api-routes.js"));
app.use(router);

// Requiring our models for syncing
var db = require("./models");
//
// var schedule = require('node-schedule');
// var rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(0, 6)];

db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});
