jQuery.fn.extend({
    pjax: function(selector=".page") {
        this.on("click", function(event) {
            event.preventDefault()
            if ($.pjaxxhrs) {
                $.pjaxxhrs.forEach(function(xhr) {
                    xhr.abort()
                })
            }
            var page, title, content
            var element = $(this)
            $.pjaxxhrs = [$.get(element.attr("href"), function(data) {
                $.pjaxxhrs = []
                data = data
                    .replace("<!DOCTYPE html>", "")
                    .replace("<html>", "<div class=\"html\">")
                    .replace("<head>", "<div class=\"head\">")
                    .replace("<body>", "<div class=\"body\">")
                    .replace("</html>", "</div>")
                    .replace("</head>", "</div>")
                    .replace("</body>", "</div>")
                page = $(data)
                title = page.find("title").text()
                content = page.find(selector)
                var elements = content.find("*")
                for (let i = 0; i < elements.length; i++) {
                    let element = elements.eq(i)
                    if (element.is("link")) {
                        if (element.attr("rel") == "stylesheet") {
                            $.pjaxxhrs.push($.ajax({
                                url: element.attr("href"),
                                type: "GET",
                                success: function(data) {
                                    element.replaceWith(`<style>${data}</style>`)
                                    checkComplete()
                                },
                                error: function() {
                                    checkComplete()
                                }
                            }))
                        }
                    }
                    else if (element.is("script")) {
                        if (element.attr("src")) {
                            $.pjaxxhrs.push($.ajax({
                                url: element.attr("src"),
                                type: "GET",
                                dataType: "text",
                                success: function(data) {
                                    element.replaceWith(`<script>${data}</script>`)
                                    checkComplete()
                                },
                                error: function() {
                                    checkComplete()
                                }
                            }))
                        }
                    }
                }
                if ($.pjaxxhrs.length == 0) {
                    complete()
                }
            })]
            var completeNumber = 0
            function complete() {
                history.pushState({selector: selector, page: content.html()}, title, element.attr("href"))
                document.title = title
                $(selector).replaceWith(content)
                $(document).trigger("pjax:complete")
            }
            function checkComplete() {
                if (++completeNumber >= $.pjaxxhrs.length) {
                    complete()
                }
            }
            event.preventDefault()
        })
    }
})

$(window).on("popstate", function(event) {
    if (event.state) {
        var {selector, page} = event.state
        if (selector && page) {
            $(selector).html(page)
            $(document).trigger("pjax:complete")
        }
    }
})

$(function() {
    $("a[href^=\"/\"]").pjax()
})
