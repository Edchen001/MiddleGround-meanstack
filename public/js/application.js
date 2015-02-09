$(document).ready(function() {

  initializeMapping();

  View.populateField("formatted_address_1", "coords1");
  View.populateField("formatted_address_2", "coords2");

  $('form').on('submit', function(event) {
    event.preventDefault();
    $form = $(event.target);
    $travelMode = $( "#myselect option:selected" ).text();
    Trip.request["origin"] = $form.find('input[name=coords1]').val();
    Trip.request["destination"] = $form.find('input[name=coords2]').val();
    Trip.request["travelMode"] = Trip.travelOptions[$travelMode];
    Trip.calcRoute();

    navigationFn.goToSection('#poi');

  })
    var navigationFn = {
        goToSection: function(id) {
            $('html, body').animate({
                scrollTop: $(id).offset().top
            }, 10);
        }
    }

});

function initializeMapping() {
  var losangeles = new google.maps.LatLng(34.05223, -118.24368);
  var mapOptions = {
    zoom: 13,
    center: losangeles
  };
  directionsDisplay = new google.maps.DirectionsRenderer();
  directionsService = new google.maps.DirectionsService();
  map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
  directionsDisplay.setMap(map);
}


Trip = {
  travelOptions: {
    Driving: google.maps.TravelMode.DRIVING,
    Walking: google.maps.TravelMode.WALKING,
    Bicycling: google.maps.TravelMode.BICYCLING,
    Transit: google.maps.TravelMode.TRANSIT
  },

  request: {
    travelMode: google.maps.TravelMode.DRIVING
  },

  calcRoute: function(responseExtraction) {
    directionsService.route(this.request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        Response.main(response);
      } else {
        View.displayError();
      }
    });
  }
}


Response = {

  main: function(responseFromGoogle) {
    console.log(responseFromGoogle);
    total_time = this.totalTripTime(responseFromGoogle);
    midPointTime = this.midPointTripTime(total_time);

    this.showAllSteps(responseFromGoogle);

    console.log("Total time: " + total_time);
    console.log("Midpoint time: " + midPointTime);

    stepObject = this.findPhysicalMidStep(responseFromGoogle, midPointTime);

    googleMidPointObject = this.findPhysicalMidPoint(stepObject, midPointTime);

    // THIS RETURNS THE PHYSICAL MID POINT BY DRIVING TIME
    console.log(googleMidPointObject);

    View.renderMarker(googleMidPointObject);

    Yelp.main(googleMidPointObject);

  },

  totalTripTime: function(response) {
    return response.routes[0].legs[0].duration.value;
  },

  midPointTripTime: function(total_time) {
    return Math.floor(total_time / 2);
  },

  showAllSteps: function(routeObject) {
    steps = routeObject.routes[0].legs[0].steps;

    counter = 0;
    step_sum = 0;
    for(i = 0; i < steps.length; i++){
      console.log("Step " + counter + " duration:" + steps[i].duration.value);

      step_sum += steps[i].duration.value;
      console.log("Step " + counter + " total duration:" + step_sum);

      counter++;
    }
  },

  findPhysicalMidStep: function(routeObject, midPointTime) {
    steps = routeObject.routes[0].legs[0].steps;
    console.log(steps);

    step_sum = 0;
    next_step_sum = 0;
    for(i = 0; i < steps.length; i++){
      if(step_sum < midPointTime && next_step_sum > midPointTime){
        // console.log("The step that contains midpoint:");
        console.log(steps[i]);
        return {
          step: steps[i],
          step_sum: step_sum
        }
      } else {
        step_sum += steps[i].duration.value;
        next_step_sum = step_sum + steps[i + 1].duration.value;
        // console.log(step_sum);
      }
    }
  },

  findPhysicalMidPoint: function(stepObject, midPointTime) {
    midPointTime_in_step = midPointTime - stepObject.step_sum;
    total_step_time = stepObject.step.duration.value;
    coord_of_midpoint = Math.floor((midPointTime_in_step * stepObject.step.path.length) / total_step_time);

    return stepObject.step.path[coord_of_midpoint];
  }

}

Yelp = {
  main: function(coordinatesObject) {
    coordinates = {
      latitude: coordinatesObject.k,
      longitude:coordinatesObject.D
    }

    this.getYelpResults(coordinates);
  },

  getYelpResults: function(coordinates) {
    $.ajax({
      url: '/poiList',
      type: 'POST',
      dataType: 'JSON',
      data: coordinates
    }).done(function(json_response) {

      console.log(json_response);
      YelpParser.main(json_response);

    });
  }


}


YelpParser = {

  main: function(json_response){
    console.log(this.parseBusinesses(json_response));
    yelp_results = this.parseBusinesses(json_response)


    if(yelp_results.length === 0){
      View.displayNoBusiness();
    } else {
      for(i=0; i < yelp_results.length; i++){
        business = this.parsedBusiness(yelp_results, i)
        console.log(business)
        var myLatLng = new google.maps.LatLng(business.latitude, business.longitude);
        View.renderBusiness(business)
        View.renderMarker(myLatLng)
      }
    }

  },

  businesses: {},

  parseBusinesses: function(json_response) {
    return json_response.businesses
  },

  parsedBusiness: function(yelp_results, index) {
    return this.businesses["name" + index] = {
      name:   yelp_results[index].name,
      rating_url: yelp_results[index].rating_img_url_large,
      url: yelp_results[index].url,
      address: yelp_results[index].location.address[0],
      city: yelp_results[index].location.city,
      state: yelp_results[index].location.state_code,
      phone: yelp_results[index].phone,
      latitude: yelp_results[index].location.coordinate.latitude,
      longitude: yelp_results[index].location.coordinate.longitude
    }

  }
}


View = {
  populateField: function(inputField, populateField) {
    $("input[name=" + inputField + "]").geocomplete().bind("geocode:result", function(event, result){
      coordsObject = result.geometry.location;
      $("input[name=" + populateField + "]").val(coordsObject.k + ", " + coordsObject.D);
      console.log(result.geometry.location);
    });
  },

  renderBusiness: function(business){
    console.log(business.name)
    $('#poi').append('<h3><li><a href ="' + business.url + '">' + business.name + '</a></li></h3>' +
                      '<img style="margin-top: -.75em;"src ="'+business.rating_url+'">' +
                      '<p>' + business.address + '</p>' +
                      '<p>' + business.city + ','+ business.state + '</p>' +
                      '<p>' + business.phone + '</p>'
      )

  },

  displayError: function() {
    $('#poi').append('<h3>That is not a valid route! Try again.</h3>');
  },

  displayNoBusiness: function() {
    $('#poi').append('<h3>No restaurants found.</h3>');
    $('#poi').append('<p>There is no viable middle ground here.</p>');
  },



  renderMarker: function(myLatLng) {
    var contentString = 'Testing';

    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
    var marker = new google.maps.Marker({
      position: myLatLng,
      map: map,
      draggable:true,
      animation: google.maps.Animation.DROP,
      title: "Hello World"
    });
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });

    google.maps.event.addDomListener(window, 'load', initializeMapping);
  }
}