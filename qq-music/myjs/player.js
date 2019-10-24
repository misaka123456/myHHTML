(function (window) {

    function Player($audio) {
        return new Player.prototype.init($audio);

    }
    Player.prototype = {
        constructor: Player,
        //保存歌曲信息
        musicList: [],
        modList: [],
        modCount: 0,
        //保存歌曲索引
        index: -1,
        musicIndex: -1,
        init: function ($audio) {
            this.$audio = $audio;
            this.audio = $audio.get(0);
        },
        //获取音乐信息
        setMusicList: function (data) {
            this.musicList = data;
            this.changeModList(function (count) {});
        },
        //修改播放模式
        changeModList: function (callback) {
            this.modCount = this.modCount + 1;
            if(this.modCount == 5){
                this.modCount = 1;
            }
            this.audio.loop = false;
            switch (this.modCount) {
                case 1:
                    //全部循环
                    for(var i = 0; i <this.musicList.length; i++) {
                        this.modList[i] = i;
                    }
                    this.index = this.modList.indexOf(this.musicIndex);
                    break;
                case 2:
                    // 顺序播放
                    break;
                case 3:
                    // 随机播放
                    this.modList.sort(function() {
                        return .5 - Math.random();
                    });
                    this.index = this.modList.indexOf(this.musicIndex);
                    break;
                case 4:
                    // 单曲循环
                    this.modList = [];
                    this.index = 0;
                    this.modList[0] = this.musicIndex;
                    this.audio.loop = true;
                    console.log(this.musicIndex, this.index);
                    break;
            }
            console.log("循环模式", this.modCount);
            console.log(this.modList);
            return callback(this.modCount);
        },
        //播放音乐
        playMusic: function (musicIndex, music) {
            console.log(musicIndex);
            if(this.musicIndex == musicIndex) {
                //同一首
                if(this.audio.paused) {
                    this.audio.play();
                }
                else {
                    this.audio.pause();
                }
            }else {
                //不同歌曲
                this.index = this.modList.indexOf(musicIndex);
                this.musicIndex = musicIndex;
                this.$audio.attr("src", music.link_url);
                this.audio.play();
                console.log("正在播放", music.name, "序号：", this.musicIndex, this.index);
            }
        },
        //播放上一首
        playPre: function () {
            var index = this.index - 1;
            if(index < 0) {
                index = this.musicList.length - 1;
            }
            return this.modList[index];
        },
        //播放下一首
        playNext: function () {
            var index = this.index + 1;
            if(index > this.musicList.length - 1) {
                index = 0;
            }
            return this.modList[index];
        },
        //删除音乐
        delMusic: function (musicIndex) {
            this.musicList.splice(musicIndex, 1);
            //同步序号
            $(".list_music").each(function (index, ele) {
                ele.index = index;
                $(ele).find(".list_number span").text(index + 1);
            })

            //判断删除歌曲是否在播放歌曲前
            // if(musicIndex < this.modList[this.currentIndex]){
            //     this.currentIndex = this.currentIndex - 1;
            // }
        },
        //获取音乐的时间信息
        timeUpdate: function (callback) {
            var $this = this;
            this.$audio.on("timeupdate", function () {
                //总时长
                var duration = $this.audio.duration;
                //当前时长
                var currentTime = $this.audio.currentTime;
                //总时长  分：秒格式
                var durationStr = $this.toMusicTime(duration);
                //当前时长  分：秒格式
                var currentTimeStr = $this.toMusicTime(currentTime);
                callback(duration, currentTime, durationStr, currentTimeStr);
            });
        },
        //根据传入的值设置播放进度
        setMusicProgress: function (percent) {
            // this.audio.currentTime = this.audio.duration * percent;
        },
        //获取音乐音量
        getVoice: function () {
          return this.audio.volume;
        },
        //设置音乐音量
        setVoice: function (percent) {
            this.audio.volume = percent;
        },
        //秒转化为（分：秒）格式
        toMusicTime: function (time) {
            if(isNaN(time)) {
                time = 0;
            }
            var minute = parseInt(time / 60);
            var second = parseInt(time % 60);
            if(minute < 10) {
                var minuteStr = '0' + minute.toString();
            }
            else {
                var minuteStr = minute.toString();
            }
            if(second < 10) {
                var secondStr = '0' + second.toString();
            }
            else {
                var secondStr = second.toString();
            }
            return minuteStr + ":" + secondStr;
        },
    };
    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);