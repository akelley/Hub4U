//origin 1 is user start address, origin 2 is user end address
var origin1;
var origin2;
//empty arrays to hold google maps distance results
var startArray = [];
var endArray = [];
//empty arrays for stations sorted by distance from origins
var sortedStartArray = [];
var sortedEndArray = [];
//ajax url for station bikes and docks status
var url = "https://gbfs.thehubway.com/gbfs/en/station_status.json";
//empty array to hold ajax results
var responseArray = [];
//array to hold stations from database
var stationArray = [];
//arrays for sorting the stations
var slicedStartArray = [];
var sortedSlicedStartArray = [];
var slicedEndArray = [];
var sortedSlicedEndArray = [];
var startBikes = [];
var endDocks = [];


$("#submit").on("click", function() {
  origin1 = $("#start").val();
  console.log(origin1);
  origin2 = $("#end").val();
  codeAddress1();
  codeAddress2();
})


//get the station info from the database
function getStations() {
  $.get("/api/stations", function (data) {
  }).then(function (data) {
    stationArray = data;
    // console.log("station array", stationArray);
  })
}

getStations();


//api call to get station status from hubway
$.ajax({
  url: url,
  method: "GET"
}).done(function (response) {
  //console.log(response);
  for (var i = 0; i < response.data.stations.length; i++) {
    responseArray.push({
      station_id: response.data.stations[i].station_id,
      bikes_avail: response.data.stations[i].num_bikes_available,
      docks_avail: response.data.stations[i].num_docks_available
    });
  }
});


//find the latitude and longitude of the start address provided by the user
function codeAddress1() {
  geocoder = new google.maps.Geocoder();
  var address = origin1;
  geocoder.geocode({'address': address}, function (results, status) {
    if (status == 'OK') {
      var userLat = results[0].geometry.location.lat();
      var userLong = results[0].geometry.location.lng();
      findDistStart(userLat, userLong);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

//use the haversine formula to calculate estimated distance between user start address and each hubway station
function findDistStart(lat, lon) {
  for (var i = 0; i < stationArray.length; i++) {
    var lat1 = lat;
    var lon1 = lon;
    var lat2 = stationArray[i].lat;
    var lon2 = stationArray[i].lng;
    var R = 3963; // Radius of the earth in miles
    var dLat = (lat2 - lat1) * (Math.PI / 180);
    var dLon = (lon2 - lon1) * (Math.PI / 180);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1) * (Math.PI / 180)) * Math.cos((lat2) * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in miles
    startArray.push({
      station_id: stationArray[i].station_id,
      station_name: stationArray[i].name,
      station_lat: stationArray[i].lat,
      station_lng: stationArray[i].lng,
      distance_miles: d
    });
  }
  // console.log("startArray", startArray);
  sortFunctionStart();
}


//sort the resulting array by distance, lowest to highest
function sortFunctionStart() {
  sortedStartArray = startArray.sort(function (obj1, obj2) {
    return obj1.distance_miles - obj2.distance_miles;
  });
  findDistSlice1();
  // console.log("sorted start", sortedStartArray);
}

//keep only the ten lowest distances and find the street distances with google maps
function findDistSlice1() {
  slicedStartArray = sortedStartArray.slice(0, 10);
  for (var i = 0; i < slicedStartArray.length; i++) {
    var destination = new google.maps.LatLng(slicedStartArray[i].station_lat, slicedStartArray[i].station_lng);
    var service = new google.maps.DistanceMatrixService();
    (function (e) {
      service.getDistanceMatrix(
        {
          origins: [origin1],
          destinations: [destination],
          travelMode: 'WALKING',
          unitSystem: google.maps.UnitSystem.IMPERIAL
        }, function (response, status) {
          var distance = response.rows[0].elements[0].distance.text;
          var distanceNumOnly = distance.substr(0, distance.length - 3);
          slicedStartArray[e].gmaps_miles = parseFloat(distanceNumOnly);
        });
    })(i);
  }
  sortStartTwo();
}


//re-sort the array according to the new google maps street distances, lowest to highest
function sortStartTwo() {
  sortedSlicedStartArray = slicedStartArray.sort(function (obj1, obj2) {
    return obj1.gmaps_miles - obj2.gmaps_miles;
  });
  matchStarts();
  // console.log("sorted sliced", sortedSlicedStartArray);
}


//match stations in sortedSlicedStartArray with those in the responseArray from the hubway api to add bikes and docks
// available to the info for each station
function matchStarts() {
  var counter = 0;
  for (var i = 0; i < sortedSlicedStartArray.length; i++) {
    for (var j = 0; j < responseArray.length; j++) {
      if (sortedSlicedStartArray[i].station_id === responseArray[j].station_id) {
        counter++;
        sortedSlicedStartArray[i].bikes_avail = responseArray[j].bikes_avail;
        sortedSlicedStartArray[i].docks_avail = responseArray[j].docks_avail;
      }
    }
  }
  console.log("sorted sliced", sortedSlicedStartArray);
  hasBikes();
}

//check each station to make sure it has docks available.  if it does, add it to a new array.  the station at index
// 0 in this array will be used for getting directions in maps.js
function hasBikes() {
  console.log("made it");
  for (var i = 0; i < sortedSlicedStartArray.length; i++) {
    if (sortedSlicedStartArray[i].bikes_avail > 0) {
      startBikes.push(sortedSlicedStartArray[i]);
    }
  }
  console.log("startBikes", startBikes);
}







//*********  this section of code is for the end address provided by the user *********

//find the latitude and longitude of the end address provided by the user
function codeAddress2() {
  geocoder = new google.maps.Geocoder();
  var address = origin2;
  geocoder.geocode({'address': address}, function (results, status) {
    if (status == 'OK') {
      var userLat = results[0].geometry.location.lat();
      var userLong = results[0].geometry.location.lng();
      findDistEnd(userLat, userLong);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}


//use the haversine formula to calculate estimated distance between user destination and each hubway station
function findDistEnd(lat, lon) {
  for (var i = 0; i < stationArray.length; i++) {
    var lat1 = lat;
    var lon1 = lon;
    var lat2 = stationArray[i].lat;
    var lon2 = stationArray[i].lng;
    var R = 3963; // Radius of the earth in miles
    var dLat = (lat2 - lat1) * (Math.PI / 180);
    var dLon = (lon2 - lon1) * (Math.PI / 180);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1) * (Math.PI / 180)) * Math.cos((lat2) * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in miles
    endArray.push({
      station_id: stationArray[i].station_id,
      station_name: stationArray[i].name,
      station_lat: stationArray[i].lat,
      station_lng: stationArray[i].lng,
      distance_miles: d
    });
  }
  sortFunctionEnd();
}

//sort the resulting array by distance, lowest to highest
function sortFunctionEnd() {
  // if (counterFDE < stationArray.length) return;
  sortedEndArray = endArray.sort(function (obj1, obj2) {
    return obj1.distance_miles - obj2.distance_miles;
  });
  console.log("sortedEndArray", sortedEndArray);
  findDistSlice2();
}

var counter = 0;

//keep only the ten lowest distances and find the street distances with google maps
function findDistSlice2() {
  slicedEndArray = sortedEndArray.slice(0, 10);
  for (var i = 0; i < slicedEndArray.length; i++) {
    var destination = new google.maps.LatLng(slicedEndArray[i].station_lat, slicedEndArray[i].station_lng);
    var service = new google.maps.DistanceMatrixService();
    (function (e) {
      service.getDistanceMatrix(
        {
          origins: [origin2],
          destinations: [destination],
          travelMode: 'WALKING',
          unitSystem: google.maps.UnitSystem.IMPERIAL
        }, function (response, status) {
          counter++
          var distance = response.rows[0].elements[0].distance.text;
          var distanceNumOnly = distance.substr(0, distance.length - 3);
          slicedEndArray[e].gmaps_miles = parseFloat(distanceNumOnly);
          sortEndTwo();
        });
    })(i);
  }
}


//re-sort the array according to the new google maps street distances, lowest to highest
function sortEndTwo() {
  if (counter < 10) return;
  sortedSlicedEndArray = slicedEndArray.sort(function (obj1, obj2) {
    return obj1.gmaps_miles - obj2.gmaps_miles;
  });
  matchEnds();
}

//match stations in sortedSlicedEndArray with those in the responseArray from the hubway api to add bikes and docks
// available to the info for each station
function matchEnds() {
  var counter = 0;
  for (var i = 0; i < sortedSlicedEndArray.length; i++) {
    for (var j = 0; j < responseArray.length; j++) {
      if (sortedSlicedEndArray[i].station_id === responseArray[j].station_id) {
        counter++;
        sortedSlicedEndArray[i].bikes_avail = responseArray[j].bikes_avail;
        sortedSlicedEndArray[i].docks_avail = responseArray[j].docks_avail;
      }
    }
  }
  console.log("sorted sliced end", sortedSlicedEndArray);
  hasDocks();
}

//check each station to make sure it has docks available.  if it does, add it to a new array. the station at index
// 0 in this array will be used for getting directions in maps.js
function hasDocks() {
  for (var i = 0; i < sortedSlicedEndArray.length; i++) {
    if (sortedSlicedEndArray[i].docks_avail >= 1) {
      endDocks.push(sortedSlicedEndArray[i]);
    }
  }
  console.log("endDocks", endDocks);
  getRoute();
}