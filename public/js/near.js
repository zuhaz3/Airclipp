$(document).ready(function () {

  var gmtHours = (new Date()).getTimezoneOffset()/60;
  console.log("The local time zone is: GMT " + gmtHours);	
  $('.age').age();

  $('.loading').html("<br><center><img src='/img/loading.gif' width='50'/></center><br><br>");

  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(fetchFromApi);
  else 
    $('.files').html('<p>Sorry, but geolocation is unsupported on this device. Please try another device.</p>');

});

function fetchFromApi(position) {
	$('.tableBody').empty();
  	$('.loading').html("<br><center><img src='/img/loading.gif' width='50'/></center><br><br>");
  	if (position == null) 
  		$('.files').html('<p>Sorry, but geolocation is unsupported on this device. Please try another device.</p>');
  	else {
	    $.getJSON('http://localhost:3000/files/' + position.coords.latitude + '/' + position.coords.longitude, function (data) {
	    	$('.loading').hide();
	  		if (data.length == 0) $('.files').html('<br><center><div class="alert alert-error" style="margin-left:5%;width:60%;"><button type="button" class="close" data-dismiss="alert">&times;</button> No files in your area right now. <a href="/upload">Try uploading one</a>. </div></center><br>');
	  		else {
	  			for (var i = 0; i < data.length; i++) {
	  				var html =  "<tr>";
					html +=        "<td>" + data[i].name + "</td>";
					html +=        "<td>" + data[i].author + "</th>"
					html +=        "<td>" + data[i].timestamp + "</td>";
					html +=        "<td><a href='" + data[i].url + "' download>Download</a></td>";
					html +=      "</tr>";
				 	$('.tableBody').append(html); 
				}
	  		}
	    });
    }
}