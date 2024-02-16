$(function() {
    var banner = $(".banner").banner({
        interval: 5000
    })
    $(".banner-prev").on("click", function() {
        banner.prev()
    })
    $(".banner-next").on("click", function() {
        banner.next()
    })
})
