var express = require("express");
var router = express.Router();
var db = require("../../models");

router.get("/stations", function(req, res) {
  db.Station.findAll({}).then(function(dbStation) {
    res.json(dbStation);
  });
});

module.exports = router;