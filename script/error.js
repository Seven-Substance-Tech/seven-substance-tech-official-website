function showError(message) {
    var element = $(`<div class="error">${message}<div class="button">×</div></div>`)
    element.find(".button").on("click", function() {
        element.remove()
    })
    $(".errors").append(element)
    setTimeout(function() {
        element.remove()
    }, 10000)
}

function showHttpError(data) {
    var {url, method, status, message} = data
    showError(`HTTP 请求失败：${method} ${url}：${status} (${message})`)
}

$(function() {
    $("body").append(`<div class="errors"></div>`)
})
