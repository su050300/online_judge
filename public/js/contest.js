// animate the information of contest

$(document).ready(function() {
    $(window).scroll(function() {
        var scrollHeight = $(window).scrollTop();
        console.log(scrollHeight);
        if (scrollHeight >= 424) {
            $(".about").css("visibility", "visible");
            $(".about").css("animation", "transfer 0.5s ease-in-out");
        }
        if (scrollHeight >= 950) {
            $(".rule").css("visibility", "visible");
            $(".rule").css("animation", "transrules 0.5s ease-in-out");
        }
    });
});