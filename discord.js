//npm 사용 선언
const Discord = require('discord.js');
const axios = require("axios");
const cheerio = require("cheerio");
var Sequelize = require('sequelize');
//discord client 선언
const client = new Discord.Client();
const key = require('./key/key.js');
//db 연동
const sequelize = new Sequelize(
  'yuna', // 데이터베이스 이름
  'root', // 유저 명
  key.db_pw, // 비밀번호
  {
    'host': 'localhost', // 데이터베이스 호스트
    'dialect': 'mariadb', // 사용할 데이터베이스 종류
  }
);
//테이블 정의
const tb = sequelize.define('test_tb', {
  test_name: {
    type: Sequelize.STRING,
    //primaryKey: true,
    allowNull: false
  },
  test_trigger: {
    type: Sequelize.STRING,
    allowNull: false
  },
  test_push: {
    type: Sequelize.STRING,
    allowNull: false
  }
},{
    classMethods: {},
    tableName: 'test_tb',
    freezeTableName: true,
    underscored: true,
    timestamps: false
});
//테이블 생성 (이미 있을 경우 생성 x)
tb.sync()
//tb.create({test_name:"name",test_trigger:"trigger",test_push:"push"})

//디스코드 메세지를 받을 경우
client.on('message', msg => {
    //받은 메세지의 앞부분이 일치할 경우
    if (msg.content.slice(0, 4) == "!정보 ") {
        //변수 선언 let은 var와 const 사이의 느낌
        let save_data = [];
        let save_data2 = [];
        let save_data3 = [];
        let save_data4 = [];
        let save_img = [];
        let save_img2 = [];
        let time;
        let lv;
        let job;
        let pop;
        let url;
        let guild;
        let murung;
        let union;
        //async, await을 사용한 비동기 함수 (순서대로 실행하기 위함)
        const getHtml = async () => {
            try {
                //읽어올 페이지 주소, !정보 이후의 텍스트를 가져와 붙인 뒤, encodeURI를 사용하여 한글을 인코딩시킴
                //axios는 nodeJS와 브라우저를 위한 HTTP통신 js 라이브러리
                url = encodeURI("https://maple.gg/u/" + msg.content.slice(4));
                return await axios.get(encodeURI("https://maple.gg/u/" + msg.content.slice(4)));
            } catch (error) {
                //에러가 날 경우 에러출력
                msg.reply("웹 크롤링 에러입니다");
                console.error(error);
            }
        };
        //바로 위 코드에 물려서 실행되는 코드
        getHtml()
            .then(html => {
                //크롤링 영역
                const $ = cheerio.load(html.data);
                //원하는 항목을 입력
                const $bodyList = $("div.user-summary ul.user-summary-list").children("li.user-summary-item");
                const $bodyList2 = $("div.col-6.col-md-8.col-lg-6");
                const $bodyList3 = $("div.col-lg-8");
                const $bodyList4 = $("div.col-lg-2.col-md-4.col-sm-4.col-12.mt-3");
                const $bodyList5 = $("div.py-0.py-sm-4");
                const $bodyList6 = $("div.pt-3.pb-2.pb-sm-3");

                //정보를 긁어와 배열에 저장
                $bodyList.each(function(i, elem) {
                    save_data[i] = {
                        //레벨, 직업, 인기도
                        text: $(this).text()
                    };
                });
                $bodyList2.each(function(i, elem) {
                    save_img[i] = {
                        //최근 갱신 일, 캐릭터 사진
                        time: $(this).text(),
                        img: $(this).find('img').attr('src')
                    };
                });
                $bodyList3.each(function(i, elem) {
                    save_img2[i] = {
                        //서버 마크
                        img: $(this).find('img').attr('src')
                    };
                });
                $bodyList4.each(function(i, elem) {
                    save_data2[i] = {
                        //길드 이름
                        text: $(this).text()
                    };
                });
                $bodyList5.each(function(i, elem) {
                    save_data3[i] = {
                        //무릉 층수
                        text: $(this).find('h1').text()
                    };
                });
                $bodyList6.each(function(i, elem) {
                    save_data4[i] = {
                        //유니온 레벨
                        text: $(this).find('span').text()
                    };
                });
                //긁어온 데이터에 뛰어쓰기나 들여쓰기가 많으므로 아래에서 잘라주는 작업
                //array형식에선 replace를 사용 못하므로 toString()으로 String으로 변경 후 작업
                guild = save_data2[0].text.toString().replace("\n                            길드\n                                                            ", "");
                lv = save_data[0].text.toString().replace("Lv.", "")
                job = save_data[1].text;
                pop = save_data[2].text.toString().replace("인기도\n                                ", "");
                time = save_img[0].time.toString().replace("\n                            \n                            \n                                                                    ", "");
                time = time.replace("                                일 전", "");
                time = time.replace("마지막 활동일: ", "");
                time = time.replace("\n\n                                    \n                                                            \n                        ", "");
                murung = save_data3[0].text.toString().slice(0, 2);
                union = save_data4[0].text.toString().slice(3, 7);
            })
        //setTimeout으로 실행해야 비동기로 실행되는 윗 코드가 끝난 후 작업이 시작됨
        //시간이 되면 아래도 비동기로 교체해주면 되긴 할 듯?
        setTimeout(function() {
            try {
                //discord embed 기능을 사용하여 유저에게 결과 제공
                const exampleEmbed = new Discord.MessageEmbed()
                    //.setColor('#0099ff') embed 테두리 색
                    .setTitle(msg.content.slice(4)) //닉네임
                    .setURL(url) //maple.gg 캐릭터 상세 링크
                    .setAuthor(guild, save_img2[0].img.toString().replace("https", "http")) //https 형식을 discord 메세지가 출력못해서 http로 변경 작업, 길드 마크
                    .setDescription("LV." + lv + " " + job + "\n인기도 : " + pop) //레벨, 직업, 인기도 출력
                    //.setThumbnail("") //썸네일 이미지 (우측에 나옴)
                    .addField('무릉도장', murung + "층", true) //추가할 항목은 이와 같이
                    .addField('유니온', union, true)
                    .setImage(save_img[0].img.toString().replace("https", "http")) //캐릭터 이미지 출력
                    //.setTimestamp() 타임스탬프 //embed가 제작된 시간
                    .setFooter('마지막 업데이트 : ' + time + "일 전", 'http://maple.gg'); //하단 텍스트 영역, 최근 갱신 일 + maple.gg링크
                msg.reply(exampleEmbed);
            } catch (exception) {
                //만약 페이지 검색 결과가 없거나 서버에 문제가 생길 경우 유저에게 에러 출력
                msg.reply("에러! 일치하는 닉네임이 없거나, 서버 에러입니다");
            }
        }, 2000);
    }
})

client.on('ready', () => {
    //처음 실행 시 디스코드 봇 실행 후 작동
    console.log(`${client.user.tag}으로 접속되었습니다!`);
});

//디스코드 앱 인증 키
client.login(key.key_value);
