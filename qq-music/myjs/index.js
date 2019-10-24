window.onload = function () {

    console.log(1);

    //歌曲列表添加自定义滚动条
    $(".content_musiclist").mCustomScrollbar({
        mouseWheel:{ scrollAmount: 200 }
    });

    //加载歌曲列表
    getMusicList();
    function getMusicList() {
        $.ajax({
            url: "./mymusic/musiclist.json",
            dataType: "json",
            success: function (data) {
                // console.log(data);
                //将数据加入play类
                player.setMusicList(data);
                var $musicList = $(".content_musiclist ul");
                $.each(data, function (index, ele) {
                    // console.log(ele);
                    var $newMusic = createMusicElement(index, ele);
                    $musicList.append($newMusic);
                });
                //初始化右侧音乐信息-显示列表第一首歌的信息
                setMusicInfo(data[0]);
            },
            error: function (e) {
                console.log(e);
            }
        })
    }

    //创建播放对象
    var $audio = $("audio");
    var player = Player($audio);

    //创建音乐进度条对象
    var $musicProgress = $(".music_progress_bottom");
    var $musicProgressLine = $(".music_progress_line");
    var $musicProgressDot = $(".music_progress_dot");
    var musicProgress = Progress($musicProgress, $musicProgressLine, $musicProgressDot);
    //调用进度条的事件方法
    //进度条点击事件
    musicProgress.click(function (percent) {
        player.setMusicProgress(percent);
    });
    //进度条拖动事件
    musicProgress.move(function (percent) {
        player.setMusicProgress(percent);

    });
    //实时获取音乐播放的时间进度并修改进度条以及底部的时间信息
    //并且判断歌曲是否播放完
    player.timeUpdate(function (duration, currentTime, durationStr, currentTimeStr) {
        //设置音乐进度条
        musicProgress.setprogress(currentTime / duration);
        //设置底部音乐时间
        $(".music_progress_time_now").text(currentTimeStr);
        if(player.audio.ended) {
            //歌曲已播放完  播放下一首;
            $(".footer_in .music_next").trigger("click");
        }
    });

    //创建声音进度条对象
    var $voiceProgress = $(".music_voice_progress");
    var $voiceProgressLine = $(".music_voice_line");
    var $voiceProgressDot = $(".music_voice_dot");
    var voiceProgress = Progress($voiceProgress, $voiceProgressLine, $voiceProgressDot);
    player.setVoice(0.6);
    //调用进度条的事件方法
    //进度条点击事件
    voiceProgress.click(function (percent) {
        player.setVoice(percent);
        $(".music_voice .music_voice_icon").removeClass("music_voice_icon2");
    });
    //进度条拖动事件
    voiceProgress.move(function (percent) {
        player.setVoice(percent);
        $(".music_voice .music_voice_icon").removeClass("music_voice_icon2");
    });



    //中间部分-每行音乐控制菜单按钮事件
    musicListEvent();
    function musicListEvent() {
        $list = $(".content_musiclist");
        //监听歌曲列表每行的按钮移入事件
        $list.delegate(".list_music", "mouseenter", function () {
            //显示子菜单按钮
            $(this).find(".list_menu").stop().fadeIn(100);
            $(this).find(".list_time a").stop().fadeIn(100);
            $(this).find(".list_time span").stop().fadeOut(100);
        });
        //监听歌曲列表每行的按钮移除事件
        $list.delegate(".list_music", "mouseleave", function () {
            //隐藏子菜单按钮
            $(this).find(".list_menu").stop().fadeOut(100);
            $(this).find(".list_time a").stop().fadeOut(100);
            $(this).find(".list_time span").stop().fadeIn(100);
        });
        //监听音乐列表每行前的/选中/点击事件
        $list.delegate(".list_check i", "click", function () {
            $(this).toggleClass("checked");
        });
        //监听音乐列表/全选框/点击事件
        $list.delegate(".list_check_all", "click", function () {
            $(this).toggleClass("checked");
            if($(this).hasClass("checked")) {
                $(".list_check i").addClass("checked");
            }else {
                $(".list_check i").removeClass("checked");
            }
        });
        //监听每行歌曲的菜单的/-播放-/按钮点击事件
        $list.delegate(".list_menu .list_menu_play", "click", function () {
            //切换图标
            var $music =  $(this).parents(".list_music");
            $(this).toggleClass("list_menu_play2");
            $music.siblings().find(".list_menu_play").removeClass("list_menu_play2")
            if($(this).hasClass("list_menu_play2")) {
                //同步底部播放按钮
                $(".footer_in .music_play").addClass("music_play2");
                //播放歌曲信息高亮+菜单按钮不隐藏
                $music.addClass("list_music_on");
                //其它歌曲不高亮
                $music.siblings().removeClass("list_music_on")
                //显示菜单
                // 发现delegate委托的动态事件无法使用trigger触发
                // 只能使用临时办法
                // $music.find(".list_menu").stop().fadeIn(100);
                // $music.find(".list_time a").stop().fadeIn(100);
                // $music.find(".list_time span").stop().fadeOut(100);
            }
            else {
                //同步底部播放按钮
                $(".footer_in .music_play").removeClass("music_play2");
                //暂停歌曲不高亮
                $music.removeClass("list_music_on");
            }
            //调用播放函数
            player.playMusic($music.get(0).index, $music.get(0).info);
            //调用设置右侧音乐信息方法
            setMusicInfo($music.get(0).info);
        });
        //监听每行歌曲的菜单的/-删除-/按钮点击事件
        $list.delegate(".list_time .list_menu_del", "click", function () {
            $music = $(this).parents(".list_music");
            //先判断删除的是否是正在播放的歌曲
            if($music.get(0).index == player.musicIndex) {
                $(".footer_in .music_next").trigger("click");
                // setMusicInfo($music.get(0).info);
            }
            //删除歌曲
            $music.remove();
            //同步列表
            player.delMusic($music.get(0).index);
        });
    }



    //底部部分-/控制/按钮事件
    musicControlEvent()
    function musicControlEvent(){
        //监听底部控制按钮-播放按钮
        $(".footer_in .music_play").click(function () {
            //判断有没有播放过
            if(player.musicIndex == -1) {
                //没播放过
                $(".list_music").eq(0).find(".list_menu_play").trigger("click");
            }
            else {
                //播放过
                $(".list_music").eq(player.musicIndex).find(".list_menu_play").trigger("click");
            }
        });
        //监听底部控制按钮-/上一首/按钮
        $(".footer_in .music_pre").click(function () {
            $(".list_music").eq(player.playPre()).find(".list_menu_play").trigger("click");
        });
        //监听底部控制按钮-/下一首/按钮
        $(".footer_in .music_next").click(function () {
            $(".list_music").eq(player.playNext()).find(".list_menu_play").trigger("click");
        });
        //监听底部控制按钮-/循环模式/按钮
        $(".footer_in .music_mode").click(function () {
            $this = this;
            //调用切换播放模式函数
            player.changeModList(function (count) {
                switch(count) {
                    case 1:
                        //全部循环
                        $($this).addClass("music_mode1")
                        $($this).removeClass("music_mode4");
                        break;
                    case 2:
                        //顺序播放
                        $($this).addClass("music_mode2");
                        $($this).removeClass("music_mode1");
                        break;
                    case 3:
                        //随机播放
                        $($this).addClass("music_mode3");
                        $($this).removeClass("music_mode2");
                        break;
                    case 4:
                        //单曲循环
                        $($this).addClass("music_mode4");
                        $($this).removeClass("music_mode3");
                        break;
                }
            });
        });
        //监听底部控制按钮-/收藏/按钮
        $(".footer_in .music_fav").click(function () {
            $(this).toggleClass("music_fav2");
        });
        //监听底部控制按钮-/纯净模式/按钮
        $(".footer_in .music_only").click(function () {
            $(this).toggleClass("music_only2");
        });
        //监听底部控制按钮-/声音模式/按钮
        $(".music_voice .music_voice_icon").click(function () {
            $(this).toggleClass("music_voice_icon2");
            if($(this).hasClass("music_voice_icon2")) {
                //设置静音
                voiceTemp = player.getVoice();
                player.setVoice(0);
            }else {
                //设置不静音
                player.setVoice(voiceTemp);
            }
        });
    }

    //构造设置右侧和底部音乐信息方法
    function setMusicInfo(musicInfo) {
        //右侧信息
        $(".song_info_pic img").attr("src", musicInfo.cover);
        $(".song_info_name a").text(musicInfo.name);
        $(".song_info_singer a").text(musicInfo.singer);
        $(".song_info_album a").text(musicInfo.album);
        // 底部信息
        $(".music_progress_name").text(musicInfo.name);
        $(".music_progress_singer").text(musicInfo.singer);
        $(".music_progress_time_music").text(musicInfo.time);
    }

    //定义创建每条音乐
    function createMusicElement(index, ele) {
        var $newMusic = $(
            " <li class=\"list_music\">\n" +
            "   <div class=\"list_check\"><i class=\"\"></i></div>\n" +
            "   <div class=\"list_number\">" +
            "<i></i><span>" + (index + 1) + "</span></div>\n" +
            "   <div class=\"list_name\">\n" +
            "       <span>" + ele.name + "</span>\n" +
            "       <div class=\"list_menu\">\n" +
            "           <a class=\"list_menu_play\" href=\"javascript:\" title=\"播放\"></a>\n" +
            "           <a class=\"list_menu_add\" href=\"javascript:\" title=\"添加\"></a>\n" +
            "           <a class=\"list_menu_down\" href=\"javascript:\" title=\"下载\"></a>\n" +
            "           <a class=\"list_menu_share\" href=\"javascript:\" title=\"分享\"></a>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            "                        <div class=\"list_singer\"><a href=\"javascript:;\">" + ele.singer + "</a></div>\n" +
            "                        <div class=\"list_time\">\n" +
            "                            <span>" + ele.time + "</span>\n" +
            "                            <a class=\"list_menu_del\" href=\"javascript:;\" title=\"删除\"></a>\n" +
            "                        </div>\n" +
            "                        <i class=\"list_line list_line_bottom\"></i>\n" +
            "                    </li>"
        );
        $newMusic.get(0).index = index;
        $newMusic.get(0).info = ele;
        return $newMusic
    }

};












