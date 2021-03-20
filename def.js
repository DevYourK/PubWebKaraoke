/* C O N S O L E */
console.log('%c%s', "width:100%; font-size:18px; background-color:white; color:black;","WebKaraokePlayer@y0ur_1c");
console.log("✔ source load to loadSource('json url', 'mr audio url')\n▶ play to play([var])\n🎞 background video bkgvideo('url')\n🖼 background picture bkgpic('url')");

/* lyrics function */
const lyricsFunc = (id, lyrics, high) => {
    /* logging lyrics text */
        //console.log(`${lyrics}${(typeof(high) != 'undefined')?`(${high})`:''}`);
    
    /* return html script of lyrics */
        var lyrics_high = `<div class='high'><div class='title'>${high}</div><div class='effect' id=high_${id}>${high}</div></div>`
        var lyrics_low = `<div><div class='title'>${lyrics}</div><div class='effect' id=${id}>${lyrics}</div></div>`
        
        //high의 typeof를 구분해 자동 return
        return `<div>${(typeof(high) != 'undefined')?`${lyrics_high}`:``}${lyrics_low}</div>`
}

/* div container editor */
const editor = (level, lyrics_box, accent) => {
    //level = 0, top | level = 1, bottom
    console.log((level)?"bottom":"top");
    document.getElementById((level)?"bottom":"top").innerHTML = `<div class="txtgroup">${lyrics_box}</div>${(typeof(accent) != 'undefined')?`<div class="korean">${accent}</div>`:'<div class="korean">&nbsp;</div>'}`;
}

/* effect lyrics */
const effecter = (id, time, code) => {
    if($(`#high_${id}`).length > 0) {
        $(`#high_${id}`).css("transition", `width ${time/1000}s`);
        $(`#high_${id}`).css("width", "105%");
    }
    $(`#${id}`).css("transition", `width ${time/1000}s linear`);
    $(`#${id}`).css("width", "105%");
}

/* 2021. 01. 02 work~ */

let count = 0;
let lyObject = new Array;
let accObject = new Array;
let TimeObject = new Array;
let acc = false;

/* json to div box */
function translator(lyrics) {
    count = 0;
    lyObject = new Array();
    TimeObject = new Array();

    /* Accent Check */
    acc = (lyrics.info.accent == true);

    /* Lyrics */
    lyrics.text.forEach((e, i) => {
        lyrics_decomp = e.lyrics[0][0].split(",");
        if(lyrics_decomp.length == e.lyrics[1].length) {
            l_count=true;
            /* 가사 분 */
            ly_arr = new Array();
            lyrics_decomp.forEach((k, j) => {
                // delay eff
                if(k.charAt(0)=='-') {
                    k = " ";
                    ly_arr.push("-Delay");
                } else {
                    // special-char text eff - 사용불가, 제작 안해둠..
                    if(k.charAt(0)=='*') {
                        k=k.substring(k.indexOf(')')+1, k.length);
                        //ly_arr.push(k.substring(0, k.indexOf(')')+1))
                    }
                    // kanji-hira subtitle
                    if(k.charAt(k.length-1)==')') {
                        high = k.substring(k.lastIndexOf('(')+1, k.length-1);
                        k=k.substring(0, k.lastIndexOf('('));
                        ly_arr.push(lyricsFunc(count, k, high));
                    } else {
                        ly_arr.push(lyricsFunc(count, k))
                    }
                    count++;
                }
            });
            e.lyrics[1].forEach(k => {
                TimeObject.push(k);
            });
            /* accent */
            if(acc == true) {
                accObject.push(e.lyrics_s)
            }


            lyObject.push([ly_arr, e.playtime]);            
        } else {
            throw("Time-Lyrics Sync ERROR");
        }

        
    });
}

let l_count;

/* player */
function play() {
    /* 저작권 안내 */
    $("#copyright").css('width', '100%');
    $("#songinfo").css('width', '0%');
    $("#screen").css('width', '0%');
    $("#screen").css('opacity', '0');

    /* 반주 시작 */
    setTimeout(()=>{
        $("#songinfo").css('opacity', '100%');
        $("#copyright").css('width', '0%');
        $("#songinfo").css('width', '100%');
        $("#screen").css('width', '0%');

        document.getElementById("kara").volume = 0.4;
        document.getElementById("kara").play();

        time = 0;
        
        let l_time = TimeObject.shift();
        TimeObject.forEach((i, c)=>{
            setTimeout(()=>{
                effecter(c, i);
                console.log(`EFFECT : ${c}`);
            }, l_time);
            l_time += i;
        });
    
        lyObject.forEach((i, cnt)=>{
            setTimeout(()=>{
                if(i[0] == "-Delay") {
                    /* 더미 발음 초기화 */
                    accObject.shift();

                    /* 가사 초기화 */
                    editor(0, "");
                    editor(1, "");
                    l_count = false;
    
                    // 지정 시간의 절반 후에 가사 지정
                    setTimeout(()=>{
                        /* TOP */ editor(0, lyObject[cnt+1][0].join(''), accObject.shift());
                        /* LOW */ editor(1, lyObject[cnt+2][0].join(''), accObject.shift());
                    }, (i[1]/4));
    
                } else {
                    setTimeout(()=>{
                        //console.log(`${cnt+2}, ${lyObject.length}`)
                        editor(l_count, (cnt+2>=lyObject.length)?(lyricsFunc(null, "")):(lyObject[cnt+2][0].join('')), accObject.shift());
                    }, (i[1]+(lyObject[cnt+1][1]/2)));
                    /* 위, 아래 설정 */
                    l_count = (l_count==true)?false:true;
                }
    
                //console.log(`Delay Time ${i[1]}`)
                //console.log(i[0]);
            }, time);
            time += i[1];
        });
    }, 3000);

    setTimeout(()=>{
        $("#copyright").css('width', '0%');
        $("#songinfo").css('transition', 'opacity 0.2s');
        setTimeout(()=>{
            /* SongInfo opacity 0 */
            $("#songinfo").css('opacity', '0%');
        }, 1000);
        /* Lyrics Fade In */
        $("#screen").css('width', '100%');
        $("#screen").css('transition', 'opacity 0.2s');
        $("#screen").css('opacity', '1');      
    }, 5000);
}