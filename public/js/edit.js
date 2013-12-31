$(document).ready(function () {
      
  $('.loading').html("<br><br><center><img src='/img/loading.gif' width='50'/></center><br><br>");

  getDataFromAPI();

  function getDataFromAPI() {
    $.getJSON('http://localhost:3000/fileInfo/' + document.URL.split('edit/')[1] + '/' + apiAccessToken, function (data) {
      if (data.error || data.name == "CastError") {
        $('.load').hide();
        $('.didLoad').show();
        if (data.error)
          $('.files').html('<p>' + data.error +'</p>');
        if (data.name)
          $('.files').html('<p>The specified file was not found</p>');
      }
      else {    
        $('#name').val(data.name);
        $('#description').val(data.description);
        $('#fileId').val(data._id);
        $('.load').hide();
        $('.didLoad').show();
      }
    });
  }

  $('#submitUpdate').click(function() {
    if ($('#name').val() != '') {
      $('.uploadForm').submit();
    } else {
      alert("Please enter a name for your file!");
    }
  });

});