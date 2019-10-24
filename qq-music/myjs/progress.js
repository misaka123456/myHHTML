(function (window) {
    function Progress($progress, $progressLine, $progressDot) {
        return new Progress.prototype.init($progress, $progressLine, $progressDot);
    }
    Progress.prototype = {
        constructor: Progress,
        init: function ($progress, $progressLine, $progressDot) {
            this.$progress = $progress;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot;
            // console.log($progress.width(), $progressLine.width());
        },
        //点击-进度条变化
        click: function (callback) {
            var $this = this;
            //获取进度条位置
            var progressLocation = this.$progress.offset().left;
            //监听进度条点击
            this.$progress.click(function (event) {
                //获取点击位置
                var clickLocation = event.pageX;
                //设置进度条
                $this.$progressLine.css("width", clickLocation - progressLocation);
                //计算进度条的比例
                var percent = (clickLocation - progressLocation) / $this.$progress.width();
                return callback(percent);
            });
        },
        //拖动-进度条变化
        move: function (callback) {
            var $this = this;
            //获取进度条位置
            var progressLocation = this.$progress.offset().left;
            //获取进度条最大长度
            var progressLength = this.$progress.width();
            //监听小白点的鼠标按下事件
            this.$progressDot.mousedown(function () {
                //监听小白点的鼠标移动事件
                $(document).mousemove(function () {
                    //获取点击位置
                    var clickLocation = event.pageX;
                    var dotLength = clickLocation - progressLocation;
                    //防止圆点超出进度条的左侧
                    if(dotLength <= 0) {
                        dotLength = 0;
                    }
                    //防止圆点超出进度条的右侧
                    if(progressLength <= dotLength) {
                        dotLength = progressLength;
                    }
                    $this.$progressLine.css("width", dotLength);
                    //计算进度条的比例
                    var percent = dotLength / $this.$progress.width();
                    return callback(percent);
                })
            });
            //监听小白点的鼠标抬起事件
            $(document).mouseup(function () {
                $(document).off("mousemove");
            })
        },
        setprogress: function (percent) {
            this.$progressLine.css("width", percent * this.$progress.width());
        }
    };

document.getElementById("jp_audio_0").volume =
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window);