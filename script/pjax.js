jQuery.fn.extend({
    pjax: function(selector) {
        selector ||= ".page"
        this.on("click", function(event) {
            event.preventDefault()
            changePage($(this).attr("href"), selector)
        })
    }
})

function changePage(path, selector) {
    selector ||= ".page"
    pjaxLoadPage(path, selector, function(page, title) {
        if (history) {
            history.pushState({selector: selector, page: page.html()}, title, path)
        }
        writePage(page, title, selector)
    })
}

function replacePage(path, selector) {
    selector ||= ".page"
    pjaxLoadPage(path, selector, function(page, title) {
        if (history) {
            history.replaceState({selector: selector, page: page.html()}, title, path)
        }
        writePage(page, title, selector)
    })
}

function pjaxLoadPage(path, selector, successCallback, errorCallback, failCallback) {
    $.pjaxAbort()
    loadPage(path, selector, function(page, title) {
        if (successCallback) {
            successCallback(page, title)
        }
        $(document).trigger("pjax:success")
    }, function(data) {
        if (errorCallback) {
            errorCallback(data)
        }
        $(document).trigger("pjax:error", data)
    }, function(data) {
        if (failCallback) {
            failCallback(data)
        }
        $(document).trigger("pjax:fail", data)
    })
}

function writePage(page, title, selector) {
    document.title = title
    $(selector).replaceWith(page)
}

function loadPage(path, selector, successCallback, errorCallback, failCallback) {
    $.pjaxAbort()
    var page, title, content
    $.pjaxXHRs = [$.ajax({
        url: path,
        type: "GET",
        success: function(data) {
            $.pjaxXHRs = []
            data = replaceDocumentTag(data)
            page = $(data)
            title = page.find("title").text()
            content = page.find(selector)
            var elements = content.find("*")
            for (let i = 0; i < elements.length; i++) {
                let element = elements.eq(i)
                if (element.is("link")) {
                    if (element.attr("rel") == "stylesheet") {
                        $.pjaxXHRs.push($.ajax({
                            url: element.attr("href"),
                            type: "GET",
                            success: function(data) {
                                element.replaceWith(`<style>${data}</style>`)
                                checkComplete()
                            },
                            error: function(XHR, status, message) {
                                if (message != "abort") {
                                    if (errorCallback) {
                                        errorCallback({
                                            url: element.attr("href"),
                                            method: "GET",
                                            status: XHR.status,
                                            message: message
                                        })
                                    }
                                    checkComplete()
                                }
                            }
                        }))
                    }
                }
                else if (element.is("script")) {
                    if (element.attr("src")) {
                        $.pjaxXHRs.push($.ajax({
                            url: element.attr("src"),
                            type: "GET",
                            dataType: "text",
                            success: function(data) {
                                element.replaceWith(`<script>${data}</script>`)
                                checkComplete()
                            },
                            error: function(XHR, status, message) {
                                if (message != "abort") {
                                    if (errorCallback) {
                                        errorCallback({
                                            url: element.attr("src"),
                                            method: "GET",
                                            status: XHR.status,
                                            message: message
                                        })
                                    }
                                    checkComplete()
                                }
                            }
                        }))
                    }
                }
            }
            if ($.pjaxXHRs.length == 0) {
                complete()
            }
        },
        error: function(XHR, status, message) {
            if (message != "abort") {
                var data = {
                    url: path,
                    method: "GET",
                    status: XHR.status,
                    message: message
                }
                if (errorCallback) {
                    errorCallback(data)
                }
                if (failCallback) {
                    failCallback(data)
                }
            }
        }
    })]
    var completeNumber = 0
    function complete() {
        if (successCallback) {
            successCallback(content, title)
        }
    }
    function checkComplete() {
        if (++completeNumber >= $.pjaxXHRs.length) {
            complete()
        }
    }
}

function replaceDocumentTag(document) {
    return document
        .replace("<!DOCTYPE html>", "")
        .replace("<html>", "<div class=\"html\">")
        .replace("<head>", "<div class=\"head\">")
        .replace("<body>", "<div class=\"body\">")
        .replace("</html>", "</div>")
        .replace("</head>", "</div>")
        .replace("</body>", "</div>")
}

$.pjaxAbort = function() {
    if ($.pjaxXHRs) {
        $.pjaxXHRs.forEach(function(xhr) {
            xhr.abort()
        })
    }
}

$(window).on("popstate", function(event) {
    if (event.state) {
        var {selector, page} = event.state
        if (selector && page) {
            $(selector).html(page)
            $(document).trigger("pjax:success")
        } else {
            replacePage(location.path)
        }
    } else {
        replacePage(location.path)
    }
})

$(function() {
    $("a[href^=\"/\"]").pjax()
})

$(document).on("pjax:error", function(event, data) {
    showHttpError(data)
})
