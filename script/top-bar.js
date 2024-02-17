$(document).on("pjax:success", function() {
    updateNavigationStyle()
})
$(document).on("pjax:fail", function() {
    $(".navigation>ul>li.loading").removeClass("loading")
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
    if (path == "") {
        replacePage($(".navigation>ul>:first-child>a").attr("href"))
    } else {
        $(`.navigation>ul>li>a[href="${path}"]`).parent().addClass("active")
    }
}
