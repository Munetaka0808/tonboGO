var appKey    = "0421a03ce2158bfce26e33c0fc4b16d751f6aef377b3c18eddad5d2b32f7b81a";
var clientKey = "1b5c54952d7a75b06982ea941848ab3fb0aa5a11631e3726f41c9bcabb04a8a3";
var ncmb = new NCMB(appKey, clientKey);


///// Called when app launch
$(function() {
    Qinit();
    $("#Search").click(SearchPoint);
    $("#selectQuestion").click(Selector);
    $("#reset").click(reset);
    
});

var toDoubleDigits = function(num) {
  num += "";
  if (num.length === 1) {
    num = "0" + num;
  }
 return num;     
};

/*   問題をサーバーから取得しそれぞれのページに反映   */
function Qinit() {
    var Start = ncmb.DataStore("Start");
    var Qinit = ncmb.DataStore("Question");
    var Title = ncmb.DataStore("Title");
    
    Start.fetchAll()
         .then(function(result) {
            if (result[0].start) {
                $("#startA").html("");
                $("#startB").html("");
            } else if (result[0].onoff){
                $.mobile.changePage('#waitPage', {transition: 'flip'});
                $("#startTime").html(result[0].time);
                $("#startA").html("スタンプラリー開始時間");
                $("#startB").html("現在時刻");
                var time = setInterval(function() {
                    var now = new Date();
                    var h = toDoubleDigits(now.getHours());
                    var m = toDoubleDigits(now.getMinutes());
                    var Time = (h + " : " + m);
                    $("#nowTime").html(Time);
                    if (result[0].time == Time) {
                        $.mobile.changePage("#QPage", {transition: "flip"});
                        clearInterval(time);
                    }
                }, 1000);
            } else {
                $.mobile.changePage('#waitPage', {transition: 'flip'});
                $("#startA").html("");
                var time = setInterval(function() {
                    var now = new Date();
                    var h = now.getHours();
                    var m = now.getMinutes();
                    var Time = (h + " : " + m);
                    $("#nowTime").html(Time);
                }, 1000);
            }
            
            if (result[0].stoponoff) {
                $("#stopA").html("スタンプラリー終了時刻");
                $("#stopTime").html(result[0].stoptime);
            }
            
            if (result[0].stoponoff) {
                var stop = setInterval(function() {
                    var now = new Date();
                    var h = now.getHours();
                    var m = now.getMinutes();
                    var Time = (h + " : " + m);
                    if (result[0].stoptime == Time) {
                        alert("スタンプラリーを終了します");
                        $ .mobile.changePage("#waitPage", {transition: "flip"});
                        clearInterval(stop);
                    }
                }, 1000);
            }
         });

    
    Title.fetchAll()
         .then(function(result) {
             $(".title").html(result[0].title);
         });
    
    Qinit.order("num")
        .fetchAll()
        .then(function(result) {
            for (var i=0; i<7; i++) {
                $("#Q" + (i+1)).html(result[i].sentence);
            }
        });
    
    if (localStorage.getItem("Clear") == NaN) {
        localStorage.setItem("Clear", "");
    }
    
    var flg = parseInt(localStorage.getItem("Clear"), 10);
    var one, two, three, fore, five, six, seven;
    one = flg%10;
    two = (flg/10)%10;
    three = (flg/100)%10;
    fore = (flg/1000)%10;
    five = (flg/10000)%10;
    six = (flg/100000)%10;
    seven = flg/1000000;
    
    if (one) {
        $("#q" + one).html("Clear");
    }
    if (two) {
        $("#q" + two).html("Clear");
    }
    if (three) {
        $("#q" + three).html("Clear");
    }
    if (fore) {
        $("#q" + fore).html("Clear");
    }
    if (five) {
        $("#q" + five).html("Clear");
    }
    if (six) {
        $("#q" + six).html("Clear");
    }
    if (seven) {
        $("#q" + seven).html("Clear");
    }
    
    var score = localStorage.getItem("Score");
    if(score != null){
        $("#myRank").html(score+"位");
    }
}

function countupTotal(Qnum) {
    var Clear = ncmb.DataStore("Clear");
    
    Clear.equalTo("num", Qnum)
         .fetchAll()
         .then(function(result) {
            var total = result[0].total + 1;
            result[0].set("total", total)
                     .update();
            saveState(Qnum);
         });
}

function saveState(Qnum) {
    var text = localStorage.getItem("Clear");
    text = text + Qnum; 
    localStorage.setItem("Clear", text);
    $("#q" + Qnum).html("Clear");
    
    /*   全問題正解した時の動作   */
    var flg = parseInt(localStorage.getItem("Clear"), 10);
    if (flg >= 1234567) {
        $("#allClearPop").popup("open");
        Ranking();
    } else {
        $("#correctPop").popup("open");
    }
}

function Ranking(){
    var Rank = ncmb.DataStore("Rank");
    
    Rank.fetchAll()
        .then(function (result) {
            if(result[0].onoff){
                var rank = result[0].rank+1;
                alert(rank + "位");    
                result[0].set("rank",rank)
                         .update();
                localStorage.setItem("Score", rank);
                $("#myRank").html(rank+"人目のクリアです！" + "\n" + "おめでとうございます！");
            }
        });
}


function SearchPoint() {
    var Success = function(position) {
        var Qnum = parseInt($("#selectQ").val(), 10);
        var Point = ncmb.DataStore("Point");
        var latiposi = position.coords.latitude;
        var longposi = position.coords.longitude;
        
        if (!Qnum) {
            alert("問題が選択されていません");
        } else {
            Point.equalTo("Num", Qnum)
            .fetchAll()
            .then(function(result) {
                var lati = latiposi - result[0].latitude;
                var long = longposi - result[0].longitude;
                if (lati > 0.00018) {
                    $("#incorrectPop").popup("open");
                } else if (lati < -0.00018) {
                    $("#incorrectPop").popup("open");
                } else if (long > 0.00018) {
                    $("#incorrectPop").popup("open");
                } else if (long < -0.00018) {
                    $("#incorrectPop").popup("open");
                } else {
                    countupTotal(Qnum);
                }
            });
        }
    };
    //位置情報取得に失敗した場合のコールバック
    var onError = function(error){
        console.log("現在位置を取得できませんでした");
    };
    
    /*   すでに正解済みの場合   */
    var num = parseInt($("#selectQ").val(), 10);
    var flg = parseInt(localStorage.getItem("Clear"), 10);
    var clear = [flg%10,
                 (flg/10)%10,
                 (flg/100)%10,
                 (flg/1000)%10,
                 (flg/10000)%10,
                 (flg/100000)%10,
                 flg/1000000];

    for (var i=0; i <=6; i++) {
        if (clear[i] == num) {
            return alert("すでに正解済みの問題です");
        }
    }

    navigator.geolocation.getCurrentPosition(Success, onError, {timeout:30000});
}

function reset() {
    var yesno = confirm("本当にリセットしてもいいですか？");
    
    if (yesno == true) {
        localStorage.clear();
        localStorage.setItem("Clear", "0");
        for (var i = 1; i <= 7; i++) {
            $("#q" + i).html("×");
        }
        alert("リセット完了しました");
    }
}