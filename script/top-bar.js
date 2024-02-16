$(document).on("pjax:complete", function() {
    updateNavigationStyle()
})

$(function() {
    updateNavigationStyle()
    $(".navigation>ul>li>a").on("click", function() {
        $(".navigation>ul>li.loading").removeClass("loading")
        $(this).parent().addClass("loading")
    })
})

function updateNavigationStyle() {
    $(".navigation>ul>li").removeClass("active").removeClass("loading")
    var path = location.pathname
    if (path.endsWith("/")) {
        path = path.substring(0, path.length - 1)
    }
    console.log(path)
    if (path == "") {
        $(".navigation>ul>:first-child>a").trigger("click")
    } else {
        $(`.navigation>ul>li>a[href="${path}"]`).parent().addClass("active")
    }
}
