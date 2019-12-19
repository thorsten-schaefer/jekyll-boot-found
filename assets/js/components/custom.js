$(function(){
    var navMain = $("#navbarResponsive");
    navMain.on("click", "a", null, function () {
        navMain.collapse('hide');
    });
});
