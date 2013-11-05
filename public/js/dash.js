$(document).ready(function () {

  $('.loading').html("<br><center><img src='/img/loading.gif' width='50'/></center><br><br>");
  
  $('.refresh').hide();

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
	    $.getJSON('http://localhost:3000/user/uploads', function (data) {
	    	$('.loading').hide();
	  		if (data.length == 0) 
	  			$('.files').html('<br><center><div class="alert alert-error" style="margin-left:5%;width:60%;"><button type="button" class="close" data-dismiss="alert">&times;</button> No files uploaded! <a href="/upload">Try uploading one</a>. </div></center><br>');
	  		else {
	  			for (var i = 0; i < data.length; i++) {
	  				var html =  "<tr>";
					html +=        "<td>" + data[i].name + "</td>";
					html +=        "<td>" + (new Date(data[i].timestamp)).toLocaleDateString() + "</td>";
					html +=        "<td><a href='" + data[i].url + "' download>Download</a> &middot; <a href='#'>Edit</a> &middot; <a href='#' onClick='deleteFile(\"" + data[i]._id + "\")'>Delete</a></td>";
					html +=      "</tr>";
				 	$('.tableBody').append(html); 
				}
	  		}
	  		$('.refresh').show();
	    });
    }
}

function deleteFile(fileId) {
	// Use AJAX here to delete file
	$('.loading').show();
	$('.tableBody').empty();
  	$('.loading').html("<br><center><img src='/img/loading.gif' width='50'/></center><br><br>");
	$.ajax({ 
       url: '/deleteFile/' + apiAccessToken,
       type: 'POST',
       cache: false, 
       data: { fileId: fileId }, 
       success: function(data){
		  navigator.geolocation.getCurrentPosition(fetchFromApi);
       }
       , error: function(jqXHR, textStatus, err){
          console.log('Error deleting file.' + err);
		  navigator.geolocation.getCurrentPosition(fetchFromApi);
       }
    });
}

function refresh() {
	$('.refresh').hide();
	navigator.geolocation.getCurrentPosition(fetchFromApi);
}