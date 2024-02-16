jQuery.fn.extend({
    banner: function(config) {
        config ||= {}
        this.addClass("banner")
        var element = this
        var ul = this.children("ul")
        var li = ul.children("li")
        var offset = -1
        var total = li.length + 2
        var position = 0
        li.first().before(li.last().clone())
        li.last().after(li.first().clone())
        li = ul.children("li")
        ul.css("width", `${total}00%`)

        var banner = {
            prev: function() {
                position--
                updateCSSPosition()
                stopAutoPlay()
                startAutoPlay()
            },
            next: function() {
                position++
                updateCSSPosition()
                stopAutoPlay()
                startAutoPlay()
            }
        }
        updateCSSPosition()

        var autoPlay
        function startAutoPlay() {
            if (config.interval) {
                autoPlay = setInterval(banner.next, config.interval)
            }
        }
        function stopAutoPlay() {
            clearInterval(autoPlay)
        }
        startAutoPlay()

        var originalPosition, downPosition
        element.on("mousedown touchstart", function(event) {
            element.addClass("dragging")
            stopAutoPlay()
            originalPosition = position
            downPosition = getRelativePosition(event)
        })
        element.on("mousemove touchmove", function(event) {
            if (element.hasClass("dragging")) {
                updatePosition(event)
            }
        })
        element.on("mouseup mouseleave touchend", function() {
            if (element.hasClass("dragging")) {
                element.removeClass("dragging")
                startAutoPlay()
                position = Math.round(position)
                updateCSSPosition()
            }
        })
        function updatePosition(event) {
            updatePositionValue(event)
            updateCSSPosition()
        }
        function updatePositionValue(event) {
            position = originalPosition + downPosition - getRelativePosition(event)
        }
        function getRelativePosition(event) {
            var offset = element.offset()
            var width = element.width()
            var relative = (event.pageX || event.originalEvent.touches[0].pageX) - offset.left
            return relative / width
        }
        function updateCSSPosition() {
            if (position <= offset) {
                offset--
                li.last().remove()
                li.first().before(li.eq(li.length - 3).clone())
                li = ul.children("li")
            } else if (position >= offset + total - 1) {
                offset++
                li.first().remove()
                li.last().after(li.eq(2).clone())
                li = ul.children("li")
            }
            ul.css("transform", `translateX(${offset * 100 / total}%)`)
            li.css("transform", `translateX(${-position * 100}%)`)
            for (var i = 0; i < li.length; i++) {
                li.eq(i).css("opacity", 1 - Math.abs((position + -offset) % total - i))
            }
        }
        return banner
    }
})
