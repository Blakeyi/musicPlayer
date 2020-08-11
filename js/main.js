/*
  1:歌曲搜索接口
    请求地址:https://autumnfish.cn/search
    请求方法:get
    请求参数:keywords(查询关键字)
    响应内容:歌曲搜索结果

  2:歌曲url获取接口
    请求地址:https://autumnfish.cn/song/url
    请求方法:get
    请求参数:id(歌曲id)
    响应内容:歌曲url地址
  3.歌曲详情获取
    请求地址:https://autumnfish.cn/song/detail
    请求方法:get
    请求参数:ids(歌曲id)
    响应内容:歌曲详情(包括封面信息)
  4.热门评论获取
    请求地址:https://autumnfish.cn/comment/hot?type=0
    请求方法:get
    请求参数:id(歌曲id,地址中的type固定为0)
    响应内容:歌曲的热门评论
  5.mv地址获取
    请求地址:https://autumnfish.cn/mv/url
    请求方法:get
    请求参数:id(mvid,为0表示没有mv)
    响应内容:mv的地址
*/
var mAudio;
var app = new Vue({
    el: "#player",
    data: {
        // 查询关键字
        query: "",
        // 歌曲数组
        musicList: [],
        // 歌词数组
        lyricList: [],
        lyricListShow: [],
        //歌词时间
        timeList: [],
        // 歌曲地址
        musicUrl: "",
        // 歌曲封面
        musicCover: "images/cover.png",
        // 搜索历史列表
        searchHistory: [],
        // 歌曲评论
        hotComments: [],
        // 动画播放状态
        isPlaying: false,
        coverUrl: '',
        // 显示视频播放
        showVideo: false,
        // 歌词 
        lrc1: "",
        lrc2: "",
        // mv地址
        mvUrl: "",
        timerFlag: false,
        //播放歌词的定时器
        mInterval: "",
        //中间部分显示控制
        center_content:1
    },
    methods: {
        // 歌曲搜索
        searchMusic: function () {
            var that = this;
            that.searchHistory.push(this.query);
            that.searchHistory = Array.from(new Set(that.searchHistory));
            console.log(that.searchHistory);
            axios.get("https://autumnfish.cn/search?keywords=" + that.query).then(
                function (response) {
                    console.log(response);
                    that.musicList = response.data.result.songs;
                    console.log(response.data.result.songs);
                },
                function (err) { }
            );
        },
        // 歌曲播放
        playMusic: function (musicId) {
            console.log(musicId);
            var that = this;
            // 获取歌曲地址
            axios.get("https://autumnfish.cn/song/url?id=" + musicId).then(
                function (response) {
                    // console.log(response);
                    // console.log(response.data.data[0].url);
                    that.musicUrl = response.data.data[0].url;
                },
                function (err) { }
            );

            // 歌曲详情获取
            axios.get("https://autumnfish.cn/song/detail?ids=" + musicId).then(
                function (response) {
                    // console.log(response);
                    // console.log(response.data.songs[0].al.picUrl);
                    that.musicCover = response.data.songs[0].al.picUrl;
                },
                function (err) { }
            );

            // 歌曲歌词获取
            axios.get("https://autumnfish.cn/lyric?id=" + musicId).then(
                function (response) {
                    var lyricTemp = response.data.lrc.lyric;
                    var medisArray = new Array();   // 定义一个新的数组
                    var medisArray1 = new Array();   // 定义一个新的数组
                    // console.log(lyricTemp);
                    var temp = lyricTemp.split("\n");
                    for (var i in temp) {
                        medisArray[i] = temp[i].substring(temp[i].indexOf("[") + 1, temp[i].indexOf("]"));
                        medisArray1[i] = temp[i].substring(temp[i].indexOf("]") + 1, temp[i].length);
                        //console.log(medisArray1[i].length, medisArray1[i]);
                        medisArray1[i] = medisArray1[i].replace(/\s*/g,'');
                        //console.log(medisArray1[i].length, medisArray1[i]);
                        var timeT = medisArray[i].split(".")[0];
                        var timeT1 = timeT.split(":");
                        // console.log(Number(timeT1[0]),Number(timeT1[1]));
                        var time1 = Number(timeT1[0]) * 60 + Number(timeT1[1]);
                        medisArray[i] = time1;
                        // console.log(typeof(medisArray[i]),medisArray[i]);
                    }
                    that.lyricList = medisArray1;
                    that.timeList = medisArray;
                },
                function (err) { }
            );

            // 歌曲评论获取
            axios.get("https://autumnfish.cn/comment/hot?type=0&id=" + musicId).then(
                function (response) {
                    // console.log(response);
                    // console.log(response.data.hotComments);
                    that.hotComments = response.data.hotComments;
                },
                function (err) { }
            );
        },
        switch_content: function(num) {
            console.log(num,typeof(num));
            this.center_content = num;
            console.log(this.center_content);
        },

        changColor: function (num, srcContent, internal) {
            if (srcContent.length == 0) {
                return;
            }
            var that = this;
            var len = 0;
            // 获取源内容
            //var srcContent = document.getElementById(classID).innerText; 
            //console.log(srcContent, srcContent.length);
            // 前半部分
            var front = "";
            // 后半部分
            var rear = srcContent;
            //定时器输出
            that.mInterval = setInterval(function () {
               // console.log(len,front.length,rear.length);
                if (len > srcContent.length-1|| !that.isPlaying) {
                   // console.log(len,srcContent.length-1);
                    that.timerFlag = false;
                    clearInterval(that.mInterval);
                    that.mInterval="";
                    
                }
                front += srcContent[len];
                rear = srcContent.slice(len+1,srcContent.length);
                len++;
               // console.log(len,front.length,rear.length);
                if(num % 2 == 0) { //偶数显示下面那一句
                   that.lrc2 = '<b style="color: #1eacda">' + front + '</b> <b>' + rear + '</b>';
                    //that.lrc2 = '<b style="color: #1eacda">'+that.lyricListShow[i]+'</b>'
                    //console.log(that.lrc2);
                } else {
                    that.lrc1 = '<b style="color: #1eacda">' + front + '</b> <b>' + rear + '</b>'; 
                   // console.log(that.lrc1);
                }
                //document.getElementById(classID).innerHTML = '<p v-show="isPlaying">' + front + '</p>' + rear + '</div>';
                //document.getElementById(classID).innerHTML = '<p id="lrc1" class="lrc1" v-show="isPlaying"></p>';id="lrc1" class="lrc1" v-show="isPlaying"
            }, 900 * internal / srcContent.length);//每个字的速度可以稍微快一些
        },
        
        // 歌曲播放
        play: function () {
            var that = this;
            this.isPlaying = true;
            that.lrc1 = "";
            that.lrc2 = "";
            // myaudio这个ID要能在HTML上可以找到
            var audio = document.getElementById("myaudio");
            var i = 0;
           console.log(this.lyricList);
            audio.ontimeupdate = function () {  
                this.isPlaying = true;
                if (i<6) {
                    that.lyricListShow=that.lyricList.slice(0,11);
                    that.lyricListShow[i]='<p style="color: #1eacda;text-align:center">'+that.lyricListShow[i]+'</p>';
                } else {
                    console.log(i-5,i+6,that.lyricListShow)
                    that.lyricListShow=that.lyricList.slice(i-5,6+i);
                    that.lyricListShow[5]='<p style="color: #1eacda;font-size:17px;text-align: center">'+that.lyricListShow[5]+'</p>';
                }
                //console.log(that.lyricListShow[i]);
                console.log(i, that.lyricListShow[i]);
               // console.log(that.lyricListShow[i]);
                if (that.isPlaying) {
                    var timeDisplay = audio.currentTime;
                   // console.log(i, that.timerFlag, timeDisplay, that.timeList[i + 1]);
                    // 注意判断的时候 两边的数据类型
                    if (timeDisplay > that.timeList[i] && timeDisplay < that.timeList[i + 1]) {
                        // 上面一行
                        if (!that.timerFlag && timeDisplay > that.timeList[i] && timeDisplay < that.timeList[i + 1]) {
                            //console.log(that.lrc1);
                            that.timerFlag = true;
                            that.changColor(i, that.lyricList[i], that.timeList[i + 1] - that.timeList[i]);
                            //console.log(i, that.lyricList[i],that.timeList[i + 1] - that.timeList[i]);
                        } 

                    } else {
                        i++;
                        that.timerFlag = false;
                        clearInterval(that.mInterval);
                    }
                }else {
                    that.timerFlag = false;
                    clearInterval(that.mInterval);
                }
            };
        },
        // 歌曲暂停
        pause: function () {
            // console.log("pause");
            this.isPlaying = false;
        },
        // 播放mv
        playMv: function (mvid) {
            var that = this;
            axios.get("https://autumnfish.cn/mv/url?id=" + mvid).then(
                function (response) {
                    // console.log(response);
                    console.log(response.data.data.url);
                    that.showVideo = true;
                    that.mvUrl = response.data.data.url;
                },
                function (err) { }
            );
        },
        // 关闭mv界面
        closeMv: function () {
            this.showVideo = false
            this.$refs.video.pause()
        },
        // 搜索历史记录中的歌曲
        historySearch(history) {
            this.query = history
            this.searchMusic()
            this.showHistory = false;
        }
    },
});
