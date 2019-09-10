$(document).ready(function() {
    $(window).scroll(function() {
        var scrollHeight = $(window).scrollTop();
        console.log(scrollHeight);
        if (scrollHeight >= 424) {
            $(".about").css("visibility", "visible");
            $(".about").css("animation", "transfer 2s ease-in-out");
        }
        if (scrollHeight >= 1047) {
            $(".rule").css("visibility", "visible");
            $(".rule").css("animation", "transrules 2s ease-in-out");
        }
    });
});