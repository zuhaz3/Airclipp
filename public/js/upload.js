$(document).ready(function () {
      
  filepicker.setKey('AmNzzMPMVTSO3t7QyoIwdz');

  $(".uploadBtn").click(function() {
    filepicker.pick(function(filePicked) {
      $("#imgUrl").attr('value',filePicked.url);
      $(".uploadBtn").html('<img src="img/upload.png" width="100"><br>Uploaded ' + filePicked.filename);
      if ($('#name').val() == '') {
        var split = filePicked.filename.split('.');
        $('#name').val(split[0]);
      }
    });
  });

  $(".uploadMultipleBtn").click(function() {
    filepicker.pickMultiple(function(filesPicked) {
      console.log(filesPicked);
      $("#imgUrl").attr('value',filesPicked.url);
      $(".uploadBtn").html('<img src="img/upload.png" width="100"><br>Uploaded ');
      if (filesPicked.length > 4) 
        $(".uploadBtn").html('<img src="img/upload.png" width="100"><br>Uploaded ' + filesPicked.length + ' files');
      else {
        for (var i = 0; i < filesPicked.length; i++) {
          if (i == filesPicked.length - 1)
            $(".uploadBtn").append('' + filesPicked[i].filename);  
          else 
            $(".uploadBtn").append('' + filesPicked[i].filename + ', ');
        }
      }
      if ($('#name').val() == '') {
        var split = filesPicked[0].filename.split('.');
        $('#name').val(split[0]);
      }
    });
  });

  if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(appendPosition);
  else {
    $('.upload').hide();
    $('.files').html('<p>Sorry, but geolocation is unsupported on this device. View files around you <a href="/">here</a>.</p>');
  }

  function appendPosition(position) {
    $('#latlng').val(position.coords.latitude+','+position.coords.longitude);
  }

  $('#submitUpload').click(function() {
    if ($('#imgUrl').val() == '') {
      alert("Please choose a file to upload!");
    } else if ($('#name').val() != '') {
      $('#timestamp').val((new Date()).format("isoDateTime"));
      $('.uploadForm').submit();
    } else {
      alert("Please enter a name for your file!");
    }
  });
});