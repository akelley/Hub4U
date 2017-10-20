var userLocation, userDestination;
var directionsDisplay;
var directionsService;
var returnedDirections = {
  1: null,
  2: null,
  3: null
}
var totalDistance = 0;
var totalDuration = 0;
var returnedResponses = [];
var waypoints = [];

function initMap() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var home = new google.maps.LatLng(42.362060 , -71.060257);
  var mapOptions = {
    zoom: 12,
    center: home
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
}

function getRoute() {
  directionsService = new google.maps.DirectionsService();
  //origin1 and origin2 are the values of the search boxes
  userLocation = origin1;
  userDestination = origin2;
  //startingDock and endingDock are taken from the final array in selection.js
  startingDock = new google.maps.LatLng(startBikes[0].station_lat, startBikes[0].station_lng);
  endingDock = new google.maps.LatLng(endDocks[0].station_lat, endDocks[0].station_lng);
  waypoints.push(
    {
      origin: userLocation,
      destination: startingDock,
      travelMode: google.maps.TravelMode.WALKING
    });
  waypoints.push(
    {
      origin: startingDock,
      destination: endingDock,
      travelMode: google.maps.TravelMode.BICYCLING
    });
  waypoints.push(
    {
      origin: endingDock,
      destination: userDestination,
      travelMode: google.maps.TravelMode.WALKING
    });
  getDirections(waypoints);
  directionsDisplay.setPanel(document.getElementById('direction-panel'));
}


function getDirections(waypoints) {
  directionsService.route(waypoints[0], function (response, status) {
    if (status == google.maps.DirectionsStatus.OK) {

      returnedDirections[0] = response.routes[0].legs[0];
      returnedResponses.push(response)
      totalDuration += response.routes[0].legs[0].duration.value;
      totalDistance += response.routes[0].legs[0].distance.value;
      if (returnedDirections[0] && returnedDirections[1] && returnedDirections[2]) {
        displayDirections();
      }
    }
  });
  directionsService.route(waypoints[1], function (response, status) {
    if (status == google.maps.DirectionsStatus.OK) {

      returnedDirections[1] = response.routes[0].legs[0];
      returnedResponses.push(response)
      totalDuration += response.routes[0].legs[0].duration.value;
      totalDistance += response.routes[0].legs[0].distance.value;
      if (returnedDirections[0] && returnedDirections[1] && returnedDirections[2]) {
        displayDirections();
      }
    }
  });
  directionsService.route(waypoints[2], function (response, status) {
    console.log(response);
    if (status == google.maps.DirectionsStatus.OK) {

      returnedDirections[2] = response.routes[0].legs[0];
      returnedResponses.push(response)
      totalDuration += response.routes[0].legs[0].duration.value;
      totalDistance += response.routes[0].legs[0].distance.value;
      if (returnedDirections[0] && returnedDirections[1] && returnedDirections[2]) {
        displayDirections();
      }
    }
  });

}

function displayDirections() {
  var legs = [];
  legs.push(
    returnedDirections[0],
    returnedDirections[1],
    returnedDirections[2]
  )
  var firstResponse = returnedResponses[1];
  firstResponse.routes[0].legs = legs;
  // Display Responses on Map
  directionsDisplay.setDirections(firstResponse);
  var metadata = formatMetaData();
  displayMetaData(metadata);

}


function formatMetaData() {
  return {
    distance: Math.round(totalDistance * 0.000621371),
    duration: Math.round(totalDuration / 60),
  }
}

function displayMetaData(data) {
  $("#details").removeClass("hide").addClass("show");
  $("#routeDetails").removeClass("hide").addClass("show");
  $("#bike-name").html(startBikes[0].station_name);
  $("#num-bikes").html(startBikes[0].bikes_avail);
  $("#distance").html(data.distance);
  $("#duration").html(data.duration);
  $("#dock-name").html(endDocks[0].station_name);
  $("#num-docks").html(endDocks[0].docks_avail);
}