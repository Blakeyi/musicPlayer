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
      //歌词时间
      timeList: [],
      // 歌曲地址
      musicUrl: "",
      // 歌曲封面
      musicCover: "",
      // 搜索历史列表
      searchHistory:["123",456],
      // 歌曲评论
      hotComments: [],
      // 动画播放状态
      isPlaying: false,
      coverUrl: '',
     // 显示视频播放
     showVideo: false,
     // 歌词 
     lrc1:"",
     lrc2:"",
      // mv地址
      mvUrl: "",
      timerFlag:false,
      //播放歌词的定时器
      mInterval:""
    },
    methods: {
      // 歌曲搜索
      searchMusic: function() {
        var that = this;
        axios.get("https://autumnfish.cn/search?keywords=" + this.query).then(
          function(response) {
            console.log(response);
            that.musicList = response.data.result.songs;
            console.log(response.data.result.songs);
          },
          function(err) {}
        );
      },
      // 歌曲播放
      playMusic: function(musicId) {
        console.log(musicId);
        var that = this;
        // 获取歌曲地址
        axios.get("https://autumnfish.cn/song/url?id=" + musicId).then(
          function(response) {
            // console.log(response);
            // console.log(response.data.data[0].url);
            that.musicUrl = response.data.data[0].url;
          },
          function(err) {}
        );
  
        // 歌曲详情获取
        axios.get("https://autumnfish.cn/song/detail?ids=" + musicId).then(
          function(response) {
            // console.log(response);
            // console.log(response.data.songs[0].al.picUrl);
            that.musicCover = response.data.songs[0].al.picUrl;
          },
          function(err) {}
        );

        // 歌曲歌词获取
        axios.get("https://autumnfish.cn/lyric?id=" + musicId).then(
          function(response) {
            var lyricTemp = response.data.lrc.lyric;
            var medisArray = new Array();   // 定义一个新的数组
            var medisArray1 = new Array();   // 定义一个新的数组
            // console.log(lyricTemp);
            var temp = lyricTemp.split("\n");
            for (var i in temp) {
                medisArray[i] = temp[i].substring(temp[i].indexOf("[") + 1 ,temp[i].indexOf("]"));
                medisArray1[i] = temp[i].substring(temp[i].indexOf("]") + 1 ,temp[i].length);
                // console.log(medisArray[i]);
                var timeT = medisArray[i].split(".")[0];
                var timeT1 = timeT.split(":");
               // console.log(Number(timeT1[0]),Number(timeT1[1]));
                var time1 = Number(timeT1[0])*60 + Number(timeT1[1]);
                medisArray[i] = time1;
               // console.log(typeof(medisArray[i]),medisArray[i]);
            }
            that.lyricList = medisArray1;
            that.timeList = medisArray;
          },
          function(err) {}
        );
  
        // 歌曲评论获取
        axios.get("https://autumnfish.cn/comment/hot?type=0&id=" + musicId).then(
          function(response) {
            // console.log(response);
            // console.log(response.data.hotComments);
            that.hotComments = response.data.hotComments;
          },
          function(err) {}
        );
    },
    changColor:function(classID, srcContent, internal) {
        var that = this;
        var len = 0;
        // 获取源内容
        //var srcContent = document.getElementById(classID).innerText; 
        console.log(srcContent,srcContent.length);
        // 前半部分
        var front = "";
        // 后半部分
        var rear = srcContent;
        //定时器输出
        this.mInterval = setInterval(function () {
            //console.log(len);
            if (len > srcContent.length -2 || !that.isPlaying) {
                that.timerFlag = false;
                clearInterval(that.mInterval);
            }
            front += srcContent[len];
            if (rear.length == 1) {
                rear = "";
            } else {
                rear = rear.substr(1, rear.length);
            }    
            console.log(front);
            console.log(rear);
            document.getElementById(classID).innerHTML = '<font style="color: #1eacda" v-show="isPlaying">' + front + '</font>' + rear + '</div>';
            //document.getElementById(classID).innerHTML = '<p id="lrc1" class="lrc1" v-show="isPlaying"></p>';id="lrc1" class="lrc1" v-show="isPlaying"
            len++;
        }, 900*internal/srcContent.length);//每个字的速度可以稍微快一些
      },

      // 歌曲播放
      play: function() {
        var that = this;
        this.isPlaying = true;
        that.lrc1 = "";
        that.lrc2 = "";
        // myaudio这个ID要能在HTML上可以找到
        var audio=document.getElementById("myaudio");
        var i = 0;
        console.log(this.lyricList, that.timeList);
        audio.ontimeupdate = function() {
            if (that.isPlaying) {
                var timeDisplay = audio.currentTime;
                console.log(i,that.timerFlag, timeDisplay, that.timeList[i+2]);
                // 注意判断的时候 两边的数据类型
                if (timeDisplay > that.timeList[i] && timeDisplay < that.timeList[i+2]){
                    that.lrc1 = that.lyricList[i];
                    that.lrc2 = that.lyricList[i+1];
                    // 上面一行
                    if (!that.timerFlag &&  timeDisplay > that.timeList[i] && timeDisplay < that.timeList[i+1]) {
                        console.log(that.lrc1);
                        that.timerFlag = true;
                        that.changColor("lrc1",that.lrc1, that.timeList[i+1] - that.timeList[i]);
                        console.log(that.timeList[i+1] - that.timeList[i]);
                    } else if (!that.timerFlag) {
                        console.log(that.lrc2);
                        that.timerFlag = true;
                        that.changColor("lrc2",that.lrc2, that.timeList[i+2] - that.timeList[i+1]);
                        console.log(that.timeList[i+2] - that.timeList[i+1]);
                    }
                } else {
                    i=i+2;
                    that.timerFlag = false;
                    clearInterval(that.mInterval);
                }
            } else {
                return;
            }
        };
    },

      
      // 歌曲暂停
      pause: function() {
        // console.log("pause");
        this.isPlaying = false;
      },
      // 播放mv
      playMv: function(mvid) {
        var that = this;
        axios.get("https://autumnfish.cn/mv/url?id=" + mvid).then(
          function(response) {
            // console.log(response);
            console.log(response.data.data.url);
            that.showVideo = true;
            that.mvUrl = response.data.data.url;
          },
          function(err) {}
        );
      },
      // 关闭mv界面
      closeMv: function() {
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
  