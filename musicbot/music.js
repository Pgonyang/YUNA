//npm 사용 선언
const Discord = require('discord.js');
const axios = require("axios");
const cheerio = require("cheerio");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
//discord client 선언
const client = new Discord.Client();
const key = require('./key/key.js');
const fs = require('fs');
//db 연동
/*
const sequelize = new Sequelize(
    'YUNA', // 데이터베이스 이름
    'root', // 유저 명
    key.db_pw, // 비밀번호
    {
        'host': 'localhost', // 데이터베이스 호스트
        'dialect': 'mariadb', // 사용할 데이터베이스 종류
    }
);
*/
/*
//테이블 정의
const user = sequelize.define('user', {
    user_name: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    }
});
user.sync()
*/
//디스코드 메세지를 받을 경우
client.on('message', msg => {
	if (msg.content.slice(0, 4) == "!가사 ") {
        let save_data = [];
		let name = msg.content.slice(4);
		var link;
        const getHtml = async () => {
            try {
                url = encodeURI("https://www.genie.co.kr/search/searchMain?query="+ name);
                return await axios.get(url);
            } catch (error) {
                msg.reply("웹 크롤링 에러입니다");
                console.error(error);
            }
        };
        getHtml()
            .then(html => {
                const $ = cheerio.load(html.data);
                const $bodyList = $("tbody").children("tr.list");
                $bodyList.each(function(i, elem) {
                    save_data[i] = {
						text: $(this).find("a.btn-basic.btn-info").attr('onclick')
                    };
                });
				link = save_data[0].text.toString().replace(/[^0-9]/g,"")
				msg.reply("https://www.genie.co.kr/detail/songInfo?xgnm=" + link);
            })
			/*
        const getHtml2 = async () => {
					try {
						url = encodeURI("https://www.genie.co.kr/detail/songInfo?xgnm=" + link);
						console.log(url)
						return await axios.get(url);
					} catch (error) {
						msg.reply("웹 크롤링 에러입니다");
						console.error(error);
					}
				};
				getHtml()
					.then(html => {
						const $ = cheerio.load(html.data);
						const $bodyList = $("pre");
						$bodyList.each(function(i, elem) {
							save_data[i] = {
								text: $(this).find("p")
							};
						});
					})
			*/
    }
})
client.on('ready', () => {
	//client.user.setActivity('날로 먹고싶어');
    console.log(`${client.user.tag}으로 접속되었습니다!`);
});
//디스코드 앱 인증 키
client.login(key.key_value);