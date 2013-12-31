var progress = 0.15;
$(document).ready(function () {

  $('.loading').html("<br><center><img src='/img/loading.gif' width='50'/></center><br><br>");
  $('body').loadie();
  $('body').loadie(progress);

  $('.refresh').attr('disabled', 'disabled');

  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(fetchFromApi);
  else {
    $('.files').html('<p>Sorry, but geolocation is unsupported on this device. Please try another device.</p>');
    progress = 1;
    $('body').loadie(progress);
  }

});

function fetchFromApi(position) {
	$('.tableBody').empty();
  	$('.loading').html("<br><center><img src='/img/loading.gif' width='50'/></center><br><br>");
  	if (position == null) {
  		$('.files').html('<p>Sorry, but geolocation is unsupported on this device. Please try another device.</p>');
  		progress = 1;
	  	$('body').loadie(progress);
  	} else {
	    $.getJSON('http://localhost:3000/files/' + position.coords.latitude + '/' + position.coords.longitude + '/' + apiAccessToken, function (data) {
	    	$('.loading').hide();
	    	progress += 0.1;
	  		$('body').loadie(progress);
	  		if (data.length == 0){ 
	  			$('.files').html('<br><center><div class="alert alert-error" style="margin-left:5%;width:60%;"><button type="button" class="close" data-dismiss="alert">&times;</button> No files in your area right now. <a href="/upload">Try uploading one</a>. </div></center><br>');
	  			progress = 1;
	  			$('body').loadie(progress);
	  		} else {
	  			for (var i = 0; i < data.length; i++) {
	  				progress += 0.1;
	    			$('body').loadie(progress);
	  				var html =  "<tr>";
					html +=        "<td>" + data[i].name + "</td>";
					html +=        "<td>" + data[i].author + "</th>";
					// html +=        "<td>" + (new Date(data[i].timestamp)).toLocaleDateString() + "</td>";
					html +=        "<td class='timeago' title='" + data[i].timestamp + "'></td>";
					html +=        "<td><a href='" + data[i].url + "' download>Download</a> &middot; <a href='/map/" + data[i]._id + "'>View Map</a></td>";
					// html +=        "<td><i class='icon-download'></i> <a href='" + data[i].url + "' download>Download</a></td>";
					html +=      "</tr>";
				 	$('.tableBody').append(html); 
				}
	  		}
	  		$("td.timeago").timeago();
	  		progress = 1;
	  		$('body').loadie(progress);
	  		$('.refresh').removeAttr('disabled');
	  		$('.refresh').text('Refresh');
	    });
    }
}

function refresh() {
	$('body').loadie();
	progress = 0.15;
	$('body').loadie(progress);
	$('.refresh').attr('disabled', 'disabled');
	$('.refresh').text('Refreshing...');
	setTimeout(function(){
		navigator.geolocation.getCurrentPosition(fetchFromApi);
	}, 200);
}