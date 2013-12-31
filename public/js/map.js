$(document).ready(function () {
      
  $('.loading').html("<br><br><center><img src='/img/loading.gif' width='50'/></center><br><br>");

  getDataFromAPI();

  function getDataFromAPI() {
    $.getJSON('http://localhost:3000/fileInfoForMap/' + document.URL.split('map/')[1].replace('/full', '').replace('/', '') + '/' + apiAccessToken, function (data) {
      if (data.error || data.name == "CastError") {
        $('.load').hide();
        $('.didLoad').show();
        if (data.error)
          $('.files').html('<p>' + data.error +'</p>');
        if (data.name)
          $('.files').html('<p>The specified file was not found</p>');
      }
      else {    
        initialize(data);
        $('#name').text(data.name);
        $('.load').hide();
        $('.didLoad').show();
      }
    });
  }

});

function initialize(data) {
  var split = data.latlng.split(',');
  var myLatlng = new google.maps.LatLng(parseFloat(split[0]),parseFloat(split[1]));
  var mapOptions = {
    zoom: 14,
    center: myLatlng
    // styles: [
    //           {
    //             featureType: "road.highway",
    //             elementType: "geometry.fill",
    //             stylers: [
    //               { color: "#4f07c8" }
    //             ]
    //           },{
    //             featureType: "road.arterial",
    //             elementType: "geometry.fill",
    //             stylers: [
    //               { color: "#4f07c8" }
    //             ]
    //           },{
    //             featureType: "road.local",
    //             elementType: "geometry.fill",
    //             stylers: [
    //               { color: "#4f07c8" }
    //             ]
    //           },{
    //             featureType: 'landscape',
    //             elementType: 'geometry',
    //             stylers: [
    //               { hue: '#4f07c8' },
    //               { gamma: 1.4 },
    //               { saturation: 82 },
    //               { lightness: 96 }
    //             ]
    //           },{
    //             featureType: "natural",
    //               stylers: [
    //                   { hue: '#4f07c8' }
    //               ]
    //           }
    //         ]
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var contentString = data.name + "<hr style='margin-top:5px;margin-bottom:5px;'><a href=" + data.url + " download >Download</a>";

  var infowindow = new google.maps.InfoWindow({
      content: contentString
  });

  var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: data.name
  });
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker);
  });
}