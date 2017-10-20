var axios = require("axios");
var db = require("./models");

axios
  .get("https://gbfs.thehubway.com/gbfs/en/station_information.json")
  .then(function(res) {
    var stations = res.data.data.stations.map(function(station) {
      return {
        station_id: station.station_id,
        short_name: station.short_name,
        name: station.name,
        lat: station.lat,
        lng: station.lon
      };
    });
    return db.Station.bulkCreate(stations, { updateOnDuplicate: true });  });

// when we load into heroku, there is a scheduling option we'll need to set up
// the command to point to "seed": "node getStationData.js" is "npm run seed"
// "seed": "node getStationData.js" should be in package.json