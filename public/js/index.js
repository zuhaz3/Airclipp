$(document).ready(function () {
	$(".rotate").textrotator({
	   animation: "fade",
	   speed: 1000
	});

	$('#copyright').html('&copy; ' + new Date().getFullYear() + ' Airclipp');

	$('.searchFiles.hidden-phone input').focus(function () {
		$(this).animate({"width":"35%"}, 500);
	}).blur(function () {
	    $(this).animate({"width":"206px"}, 500);
	});
});