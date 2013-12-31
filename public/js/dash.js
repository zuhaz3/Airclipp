var progress = 0.15;
$(document).ready(function () {

  $('.loading').html("<br><center><img src='/img/loading.gif' width='50'/></center><br><br>");
  $('body').loadie();
  $('body').loadie(progress);
  
  $('.refresh').attr('disabled', 'disabled');

  fetchFromApi();

});

function fetchFromApi() {
	$('.tableBody').empty();
  	$('.loading').html("<br><center><img src='/img/loading.gif' width='50'/></center><br><br>");
    $.getJSON('http://localhost:3000/user/uploads', function (data) {
    	$('.loading').hide();
    	progress += 0.1;
	  	$('body').loadie(progress);
  		if (data.length == 0) {
  			$('.files').html('<br><center><div class="alert alert-error" style="margin-left:5%;width:60%;"><button type="button" class="close" data-dismiss="alert">&times;</button> No files uploaded! <a href="/upload">Try uploading one</a>. </div></center><br>');
  			progress = 1;
	  		$('body').loadie(progress);
  		} else {
  			for (var i = 0; i < data.length; i++) {
  				progress += 0.1;
  				$('body').loadie(progress);
  				var html =  "<tr>";
				html +=        "<td>" + data[i].name + "</td>";
				// html +=        "<td>" + (new Date(data[i].timestamp)).toLocaleDateString() + "</td>";
        html +=        "<td class='timeago' title='" + data[i].timestamp + "'></td>";
				html +=        "<td><a href='" + data[i].url + "' download>Download</a> &middot; <a href='/map/" + data[i]._id + "'>View Map</a> &middot; <a href='/edit/" + data[i]._id + "'>Edit</a> &middot; <a href='#' onClick='deleteFile(\"" + data[i]._id + "\")'>Delete</a></td>";
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

function deleteFile(fileId) {
	// Use AJAX here to delete file
	$('.refresh').attr('disabled', 'disabled');
	$('.loading').show();
	$('body').loadie();
	progress = 0.15;
	$('body').loadie(progress);
	$('.tableBody').empty();
  	$('.loading').html("<br><center><img src='/img/loading.gif' width='50'/></center><br><br>");
	$.ajax({ 
       url: '/deleteFile/' + apiAccessToken,
       type: 'POST',
       cache: false, 
       data: { fileId: fileId }, 
       success: function(data){
		  fetchFromApi();
		  progress = 1;
		  $('body').loadie(progress);
       }
       , error: function(jqXHR, textStatus, err){
          console.log('Error deleting file.' + err);
		  fetchFromApi();
		  progress = 1;
		  $('body').loadie(progress);
       }
    });
}

function refresh() {
	$('body').loadie();
	progress = 0.15;
	$('body').loadie(progress);
	$('.refresh').attr('disabled', 'disabled');
	$('.refresh').text('Refreshing...');
	setTimeout(function(){
		fetchFromApi();
	}, 200);
}