//npm 사용 선언
const Discord = require('discord.js');
const axios = require("axios");
const cheerio = require("cheerio");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const pad = require('pad')
//discord client 선언
const client = new Discord.Client();
const key = require('./key/key.js');
//db 연동
const sequelize = new Sequelize(
    'YUNA', // 데이터베이스 이름
    'root', // 유저 명
    key.db_pw, // 비밀번호
    {
        'host': 'localhost', // 데이터베이스 호스트
        'dialect': 'mariadb', // 사용할 데이터베이스 종류
    }
);
//테이블 정의
const user = sequelize.define('user', {
    user_name: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    user_discord: {
        type: Sequelize.STRING,
        allowNull: false
    },
	user_chara: {
		type: Sequelize.STRING,
		allowNull: false
	},
	user_simbol_1_lv: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_1_cnt: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_1_default: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 14
	},
	user_simbol_2_lv: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_2_cnt: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_2_default: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 15
	},
	user_simbol_3_lv: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_3_cnt: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_3_default: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 10
	},
	user_simbol_4_lv: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_4_cnt: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_4_default: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 10
	},
	user_simbol_5_lv: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_5_cnt: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_5_default: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 8
	},
	user_simbol_6_lv: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_6_cnt: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	user_simbol_6_default: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 8
	},
	user_mon: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	user_tue: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	user_wed: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	user_thu: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	user_fri: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	user_sat: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	user_sun: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 0
	}
}, {
    classMethods: {},
    tableName: 'user',
    freezeTableName: true,
    underscored: true,
    timestamps: false
});
user.sync()

const boss = sequelize.define('boss', {
    boss_code: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    boss_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    boss_diff: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    boss_money: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
	if_weekly: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
}, {
    classMethods: {},
    tableName: 'boss',
    freezeTableName: true,
    underscored: true,
    timestamps: false
});
boss.sync();

const cnt_boss = sequelize.define('cnt_boss', {
    boss_code: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    user_name: {
        type: Sequelize.STRING,
		primaryKey: true,
        allowNull: false
    },
	create_at: {
        type: Sequelize.DATEONLY,
		allowNull: false,
		defaultValue: Sequelize.NOW
    }
}, {
    classMethods: {},
    tableName: 'cnt_boss',
    freezeTableName: true,
    underscored: true,
    timestamps: false
});
cnt_boss.sync()
boss.hasMany(cnt_boss, {as : "cnts"});

const shr = sequelize.define('shr', {
    origin: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    word: {
        type: Sequelize.STRING,
		primaryKey: true,
        allowNull: false
    }
}, {
    classMethods: {},
    tableName: 'shr',
    freezeTableName: true,
    underscored: true,
    timestamps: false
});
shr.sync()

/* value 삭제
tb.destroy({where: {test_name: 'test'}}).then(function(result) {
    res.json({});
}).catch(function(err) {
    //TODO: error handling
});
*/
//디스코드 메세지를 받을 경우
client.on('message', msg => {
	if (msg.content == "!주간보스") {
		boss.findAll({
			where: {
				if_weekly: true
			},
			raw: true, //dataValues만 사용
			order: [['boss_money', 'ASC']] //정렬
		})
		.then((bs) => {
			var i = 0;
			var text = "\n";
			const boss_embed = new Discord.MessageEmbed().setTitle("주간 보스표")
			.setColor('#0099ff')
			while(true){
				if(bs[i]){
					if(bs[i].boss_diff == 1){
						diff = "이지"
					}
					else if(bs[i].boss_diff == 2){
						diff = "노말"
					}
					else if(bs[i].boss_diff == 3){
						diff = "카오스"
					}
					else if(bs[i].boss_diff == 4){
						diff = "하드"
					}
					//text = text + bs[i].boss_name + " (" + diff + ") " + pad(10,bs[i].boss_money) + "메소 \n" 
					var messo = bs[i].boss_money;
					messo = messo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
					boss_embed.addField(bs[i].boss_name + " (" + diff + ")", messo + "메소", true)
				}
				else {
					//text = text + "(검은 마법사는 월간 보스)"
					msg.reply(boss_embed);	
					//msg.reply(text);
					break
				}
				i++
			}
		});		
	}
	if (msg.content.slice(0, 4) == "!보스 ") {
		var code =  msg.content.slice(4).trim()
		shr.findOne({
				where: {
					word: code
					}
				})
				.then((sc) => {
					if(sc)
						code = sc.origin;
					})
		switch (code) {
			case "이지" :
				code = 1
				break;
			case "노말" :
				code = 2
				break;
			case "카오스" :
				code = 3
				break;
			case "하드" :
				code = 4
				break;
		}
		boss.findAll({
			where: {
				[Op.or] : [{boss_name: code},{boss_code: code}, {boss_diff: code}]
			},
			raw: true, //dataValues만 사용
			order: [['boss_diff', 'ASC']] //정렬
		})
		.then((bs) => {
			var i = 0;
			var text = "\n";
			const boss_embed = new Discord.MessageEmbed().setTitle(msg.content.slice(4).trim() + "의 검색결과")
			.setColor('#0099ff')
			while(true){
				if(bs[i]){
					if(bs[i].boss_diff == 1){
						diff = "이지"
					}
					else if(bs[i].boss_diff == 2){
						diff = "노말"
					}
					else if(bs[i].boss_diff == 3){
						diff = "카오스"
					}
					else if(bs[i].boss_diff == 4){
						diff = "하드"
					}
					var messo = bs[i].boss_money;
					messo = messo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
					boss_embed.addField(bs[i].boss_name + " (" + diff + ")", messo + "메소", true)
				}
				else {
					msg.reply(boss_embed);	
					break
				}
				i++
			}
		});		
	}
	//db 생성
	else if (msg.content.slice(0, 6) == "!계정생성 ") {
		const string = msg.content.slice(6).split(',');
		const name = string[0].trim();
		const chara = string[1].trim();
		user.findOne({
			where: {
				[Op.or] : [{user_name: name},{user_chara: chara}]
			}
		})
		//일치하는 것이 있을 경우
		.then((sc) => {
			if(sc){
				msg.reply("이미 존재하는 이름이에요");
			}
			else {
				user.create({user_name:name,user_chara: chara, user_discord:msg.author.id})
				msg.reply("데이터의 생성이 완료되었어요\n" + "닉네임:" + name + "\n캐릭터 닉네임:" + chara + "\n생성자 id:"+msg.author.id);
			}
		});
	}
	else if (msg.content.slice(0, 6) == "!계정삭제 ") {
		user.findOne({
			where: {
				user_name: msg.content.slice(6), 
				user_discord: msg.author.id
			}
		})
		//일치하는 것이 있을 경우
		.then((sc) => {
			if(sc){
				user.destroy({where: {user_name: msg.content.slice(6), user_discord:msg.author.id}}).then(function(result) {
					msg.reply("데이터의 삭제가 완료되었습니다!");
				}).catch(function(err) {
				});
			}
			else {
				msg.reply("일치하는 닉네임이 없거나, discord id가 일치하지 않습니다.\n디스코드 계정을 변경한 경우, 샤로#0506으로 문의해주세요.");
			}
		})
	}
	else if (msg.content.slice(0, 4) == "!기록 ") {
		try{
			const string = msg.content.slice(4).split(',');
			var name = string[0].trim();
			var code = string[1].trim();
			shr.findOne({
				where: {
					word: code
					}
				})
				.then((sc) => {
					if(sc)
						code = sc.origin;
					})
			user.findOne({
				where: {
					user_name: name,
					user_discord: msg.author.id
				}
			})
			.then((sc) => {
				if(sc){
					boss.findOne({
						where: {
							boss_code: code
						}
					})
					.then((bc) => {
						if(bc){
							cnt_boss.create({user_name:name,boss_code:code})
							msg.reply("user_name:"+name+",boss_code:"+code);
						}
						else {
							msg.reply("잘못된 보스 코드입니다 알맞은 코드를 입력해주세요.");
						}
					})
				}
				else {
					msg.reply("일치하는 계정이 없습니다. 계정 이름을 확인해주세요.");
				}
			})	
		} catch(error) {
			msg.reply("보스 기록 형식 : !기록 계정이름, 보스코드");
		}
	}
	else if (msg.content.slice(0, 4) == "!심볼 ") {
		try{
			const string = msg.content.slice(4).split(',');
			var name = string[0].trim();
			var code = string[1].trim();
			shr.findOne({
				where: {
					word: code
					}
				})
				.then((sc) => {
					if(sc)
						code = sc.origin;
					})
			try {
				var num = string[2].trim();
			}
			catch (error) {
				var num = "none"
			}
			user.findOne({
				where: {
					user_name: name,
					user_discord: msg.author.id
				}
			})
			.then((sc) => {
				if(sc){
					let lv;
					let cnt;
					let text;
					let to_date;
					lv = eval("sc.user_simbol_" + code + "_lv");
					if(num == "none"){
						num = eval("sc.user_simbol_" + code + "_default")
					}	
					cnt = eval("sc.user_simbol_" + code + "_cnt") + Number(num);
					let max_cnt = lv * lv + 11;
					while(true){
						if(cnt >= max_cnt){
							lv = lv + 1;
							cnt = cnt - max_cnt;
							max_cnt = lv * lv + 11;
						}
						else {
							break;
						}
					}
					let to_max = 0;
					for(var i=lv; i<20; i++){
						to_max = to_max + (i*i+11)
					}
					to_date = Math.ceil((to_max-cnt)/(eval("sc.user_simbol_" + code + "_default")))
					switch(code){
						case "1" :
							user.update({user_simbol_1_lv: lv, user_simbol_1_cnt: cnt}, {where: {user_name: name}})
							.then(result => {
								msg.reply("소멸의 여로 심볼 레벨 :" + lv + ", 성장치 : " + cnt + "/" + max_cnt + "\n(만렙까지 앞으로 심볼 " + (to_max-cnt) + "개, " + to_date + "일)");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "2" :
							user.update({user_simbol_2_lv: lv, user_simbol_2_cnt: cnt}, {where: {user_name: name}})
							.then(result => {
								msg.reply("츄츄 아일랜드 심볼 레벨 :" + lv + ", 성장치 : " + cnt + "/" + max_cnt + "\n(만렙까지 앞으로 심볼 " + (to_max-cnt) + "개, " + to_date + "일)");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;		
						case "3" :
							user.update({user_simbol_3_lv: lv, user_simbol_3_cnt: cnt}, {where: {user_name: name}})
							.then(result => {
								msg.reply("레헬른 심볼 레벨 :" + lv + ", 성장치 : " + cnt + "/" + max_cnt + "\n(만렙까지 앞으로 심볼 " + (to_max-cnt) + "개, " + to_date + "일)");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "4" :
							user.update({user_simbol_4_lv: lv, user_simbol_4_cnt: cnt}, {where: {user_name: name}})
							.then(result => {
								msg.reply("아르카나 심볼 레벨 :" + lv + ", 성장치 : " + cnt + "/" + max_cnt + "\n(만렙까지 앞으로 심볼 " + (to_max-cnt) + "개, " + to_date + "일)");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "5" :
							user.update({user_simbol_5_lv: lv, user_simbol_5_cnt: cnt}, {where: {user_name: name}})
							.then(result => {
								msg.reply("모라스 심볼 레벨 :" + lv + ", 성장치 : " + cnt + "/" + max_cnt + "\n(만렙까지 앞으로 심볼 " + (to_max-cnt) + "개, " + to_date + "일)");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;	
						case "6" :
							user.update({user_simbol_6_lv: lv, user_simbol_6_cnt: cnt}, {where: {user_name: name}})
							.then(result => {
								msg.reply("에스페라 심볼 레벨 :" + lv + ", 성장치 : " + cnt + "/" + max_cnt + "\n(만렙까지 앞으로 심볼 " + (to_max-cnt) + "개, " + to_date + "일)");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;	
						default : 
							msg.reply("데이터 업로드 실패");
					}			
				}
				else {
					msg.reply("일치하는 계정이 없습니다. 계정 이름을 확인해주세요.");
				}
			})	
		} catch(error) {
			msg.reply("심볼 추가 형식: !심볼 닉네임,심볼위치,개수(비우면 일일 퀘스트 최대치)");
		}
	}
	else if (msg.content.slice(0, 6) == "!심볼일괄 ") {
		try{
			var name = msg.content.slice(6);
			user.findOne({
				where: {
					user_name: name,
					user_discord: msg.author.id
				}
			})
			.then((sc) => {
				if(sc){
					let to_date = {}
					let max_cnt = {}
					let to_max = Array.apply(null, new Array(6)).map(Number.prototype.valueOf,0);
					let lv={}
					let num={}
					let cnt={}
					let s_name = new Array("소멸의 여로", "츄츄 아일랜드", "레헬른", "아르카나", "모라스", "에스페라")
					const embed = new Discord.MessageEmbed().setTitle(msg.content.slice(6) + "님의 심볼 현황")
					.setColor('#0099ff')
					for(var a = 1; a<7; a++){
						lv[a] = eval("sc.user_simbol_" + a + "_lv");
						num[a] = eval("sc.user_simbol_" + a + "_default")
						cnt[a] = eval("sc.user_simbol_" + a + "_cnt") + Number(num[a]);
						max_cnt[a] = lv[a] * lv[a] + 11;
						while(true){
							if(cnt[a] >= max_cnt[a]){
								lv[a] = lv[a] + 1;
								cnt[a] = cnt[a] - max_cnt[a];
								max_cnt[a] = lv[a] * lv[a] + 11;
							}
							else {
								break;
							}
						}
						for(var i=lv[a]; i<20; i++){
							to_max[a-1] = to_max[a-1] + (i*i+11)
						}
						to_date[a] = Math.ceil((to_max[a-1]-cnt[a])/(eval("sc.user_simbol_" + a + "_default")))
						embed.addField(s_name[a-1] + " (하루 " + num[a] + "개)", lv[a] + "레벨 (" + cnt[a] + "/" + max_cnt[a] + ") 만렙까지 " + to_date[a] + "일", false)
					}						
					user.update({user_simbol_1_lv: lv[1], user_simbol_1_cnt: cnt[1], user_simbol_2_lv: lv[2], user_simbol_2_cnt: cnt[2],user_simbol_3_lv: lv[3], user_simbol_3_cnt: cnt[3],user_simbol_4_lv: lv[4], user_simbol_4_cnt: cnt[4],user_simbol_5_lv: lv[5], user_simbol_5_cnt: cnt[5],user_simbol_6_lv: lv[6], user_simbol_6_cnt: cnt[6]}, {where: {user_name: name}})
					.then(result => {
						msg.reply(embed)
					})
					.catch(err => {
						console.error(err);
						msg.reply("데이터 수정에 실패했어요");
					});	
				}
				else {
					msg.reply("일치하는 계정이 없습니다. 계정 이름을 확인해주세요.");
				}
			})	
		} catch(error) {
			msg.reply("심볼 추가 형식: !심볼 닉네임,심볼위치,개수(비우면 일일 퀘스트 최대치)");
		}
	}
	else if (msg.content.slice(0, 6) == "!심볼설정 ") {
		try{
			const string = msg.content.slice(6).split(',');
			var name = string[0].trim();
			var code = string[1].trim();
			shr.findOne({
				where: {
					word: code
					}
				})
				.then((sc) => {
					if(sc)
						code = sc.origin;
					})
			console.log(code)
			var lv = string[2].trim();
			var num = string[3].trim();
			try {
				var def = string[4].trim();
			}
			catch (error) {
				var def = "none";
			}
			if(lv > 20){
				msg.reply("심볼 레벨은 20이 최대입니다");
			}
			else {
				if(lv == 20){
					num = 0;
				}
				var max = lv * lv + 11
				if (num > max) {
					msg.reply("최대 성장치보다 큰 값이 설정되었습니다.\n" + lv + " 레벨 심볼의 최대 성장치 : " + max);
				}
				else {
					user.findOne({
						where: {
							user_name: name,
							user_discord: msg.author.id
						}
					})
					.then((sc) => {
						if(sc){
							if(def == "none"){
								def = eval("sc.user_simbol_" + code + "_default")
							}	
							let db_text;
							switch (code) {
								case "1":
									db_text = "소멸의 여로";
									user.update({user_simbol_1_lv: lv, user_simbol_1_cnt: num, user_simbol_1_default: def}, {where: {user_name: name}})
									.then(result => {
										msg.reply(db_text + " 심볼 레벨 :" + lv + ", 성장치 : " + num + " 일일 기본 획득량 : " + def + " 로 설정 완료되었습니다.");
									})
									.catch(err => {
										console.error(err);
										msg.reply("데이터 수정에 실패했어요");
									});
									break;
								case "2":							
									db_text = "츄츄 아일랜드";
									user.update({user_simbol_2_lv: lv, user_simbol_2_cnt: num, user_simbol_2_default: def}, {where: {user_name: name}})
									.then(result => {
										msg.reply(db_text + " 심볼 레벨 :" + lv + ", 성장치 : " + num + " 일일 기본 획득량 : " + def + " 로 설정 완료되었습니다.");
									})
									.catch(err => {
										console.error(err);
										msg.reply("데이터 수정에 실패했어요");
									});
									break;
								case "3":								
									db_text = "레헬른";
									user.update({user_simbol_3_lv: lv, user_simbol_3_cnt: num, user_simbol_3_default: def}, {where: {user_name: name}})
									.then(result => {
										msg.reply(db_text + " 심볼 레벨 :" + lv + ", 성장치 : " + num + " 일일 기본 획득량 : " + def + " 로 설정 완료되었습니다.");
									})
									.catch(err => {
										console.error(err);
										msg.reply("데이터 수정에 실패했어요");
									});
									break;
								case "4":								
									db_text = "아르카나";
									user.update({user_simbol_4_lv: lv, user_simbol_4_cnt: num, user_simbol_4_default: def}, {where: {user_name: name}})
									.then(result => {
										msg.reply(db_text + " 심볼 레벨 :" + lv + ", 성장치 : " + num + " 일일 기본 획득량 : " + def + " 로 설정 완료되었습니다.");
									})
									.catch(err => {
										console.error(err);
										msg.reply("데이터 수정에 실패했어요");
									});
									break;
								case "5":							
									db_text = "모라스";
									user.update({user_simbol_5_lv: lv, user_simbol_5_cnt: num, user_simbol_5_default: def}, {where: {user_name: name}})
									.then(result => {
										msg.reply(db_text + " 심볼 레벨 :" + lv + ", 성장치 : " + num + " 일일 기본 획득량 : " + def + " 로 설정 완료되었습니다.");
									})
									.catch(err => {
										console.error(err);
										msg.reply("데이터 수정에 실패했어요");
									});
									break;
								case "6":							
									db_text = "에스페라";
									user.update({user_simbol_6_lv: lv, user_simbol_6_cnt: num, user_simbol_6_default: def}, {where: {user_name: name}})
									.then(result => {
										msg.reply(db_text + " 심볼 레벨 :" + lv + ", 성장치 : " + num + " 일일 기본 획득량 : " + def + " 로 설정 완료되었습니다.");
									})
									.catch(err => {
										console.error(err);
										msg.reply("데이터 수정에 실패했어요");
									});
									break;
								default:
									msg.reply("심볼 코드 입력 오류");
							}
						}
						else {
							msg.reply("일치하는 계정이 없습니다. 계정 이름을 확인해주세요.");
						}
					})	
				}
			}	
		} catch(error) {
			msg.reply("심볼 수정 형식: !심볼설정 닉네임,심볼,심볼 레벨,심볼 성장치");
		}
	}
	else if (msg.content.slice(0, 6) == "!칠요설정 ") {
		try{
			const string = msg.content.slice(6).split(',');
			var name = string[0].trim();
			var code = string[1].trim();
			var num = string[2].trim();
			if(num > 77){
				num = 77;
			}
			user.findOne({
				where: {
					user_name: name,
					user_discord: msg.author.id
				}
			})
			.then((sc) => {
				if(sc){
					switch (code) {
						case "월":
							user.update({user_mon: num}, {where: {user_name: name}})
							.then(result => {
								msg.reply("월요일 몬스터 파크 진행 상황 [" + num + "/77]");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "화":		
							user.update({user_tue: num}, {where: {user_name: name}})
							.then(result => {
								msg.reply("화요일 몬스터 파크 진행 상황 [" + num + "/77]");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "수":						
							user.update({user_wed: num}, {where: {user_name: name}})
							.then(result => {
								msg.reply("수요일 몬스터 파크 진행 상황 [" + num + "/77]");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "목":		
							user.update({user_thu: num}, {where: {user_name: name}})
							.then(result => {
								msg.reply("목요일 몬스터 파크 진행 상황 [" + num + "/77]");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "금":	
							user.update({user_fri: num}, {where: {user_name: name}})
							.then(result => {
								msg.reply("금요일 몬스터 파크 진행 상황 [" + num + "/77]");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "토":	
							user.update({user_sat: num}, {where: {user_name: name}})
							.then(result => {
								msg.reply("토요일 몬스터 파크 진행 상황 [" + num + "/77]");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "일":		
							user.update({user_sun: num}, {where: {user_name: name}})
							.then(result => {
								msg.reply("일요일 몬스터 파크 진행 상황 [" + num + "/77]");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						default:
							msg.reply("심볼 코드 입력 오류");
					}
				}
				else {
					msg.reply("일치하는 계정이 없습니다. 계정 이름을 확인해주세요.");
				}
			})	
		} catch(error) {
			msg.reply("칠요 수정 양식 : !칠요설정 닉네임,요일,횟수");
		}
	}
	else if (msg.content.slice(0, 4) == "!칠요 ") {
		try{
			const string = msg.content.slice(4).split(',');
			var name = string[0].trim();
			try {
				var code = string[1].trim();
				shr.findOne({
				where: {
					word: code
					}
				})
				.then((sc) => {
					if(sc)
						code = sc.origin;
					})
			}
			catch (error) {
				var d = new Date();
				var week = new Array('일','월','화','수','목','금','토');
				var code = week[d.getDay()];
			}
			try {
				var num = Number(string[2].trim());
			}
			catch (error) {
				var num = 2
			}
			user.findOne({
				where: {
					user_name: name,
					user_discord: msg.author.id
				}
			})
			.then((sc) => {
				if(sc){
					let cnt;
					let to_date;
					switch (code) {
						case "월" :
							cnt = Number(sc.user_mon);
							break;
						case "화" :
							cnt = Number(sc.user_tue);
							break;
						case "수" :
							cnt = Number(sc.user_wed);
							break;
						case "목" :
							cnt = Number(sc.user_thu);
							break;
						case "금" :
							cnt = Number(sc.user_fri);
							break;
						case "토" :
							cnt = Number(sc.user_sat);
							break;
						case "일" :
							cnt = Number(sc.user_sun);
							break;
					}
					to_date = Math.ceil((77-(cnt+num))/2)
					switch(code){
						case "월" :
							user.update({user_mon: (cnt+num)}, {where: {user_name: name}})
							.then(result => {
								msg.reply("월요일 몬스터 파크 진행 상황 [" + (cnt+num) + "/77]\n완료까지 " + to_date + "주");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "화" :
							user.update({user_tue: (cnt+num)}, {where: {user_name: name}})
							.then(result => {
								msg.reply("화요일 몬스터 파크 진행 상황 [" + (cnt+num) + "/77]\n완료까지 " + to_date + "주");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;	
						case "수" :
							user.update({user_wed: (cnt+num)}, {where: {user_name: name}})
							.then(result => {
								msg.reply("수요일 몬스터 파크 진행 상황 [" + (cnt+num) + "/77]\n완료까지 " + to_date + "주");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "목" :
							user.update({user_thu: (cnt+num)}, {where: {user_name: name}})
							.then(result => {
								msg.reply("목요일 몬스터 파크 진행 상황 [" + (cnt+num) + "/77]\n완료까지 " + to_date + "주");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "금" :
							user.update({user_fri: (cnt+num)}, {where: {user_name: name}})
							.then(result => {
								msg.reply("금요일 몬스터 파크 진행 상황 [" + (cnt+num) + "/77]\n완료까지 " + to_date + "주");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;
						case "토" :
							user.update({user_sat: (cnt+num)}, {where: {user_name: name}})
							.then(result => {
								msg.reply("토요일 몬스터 파크 진행 상황 [" + (cnt+num) + "/77]\n완료까지 " + to_date + "주");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;	
						case "일" :
							user.update({user_sun: (cnt+num)}, {where: {user_name: name}})
							.then(result => {
								msg.reply("일요일 몬스터 파크 진행 상황 [" + (cnt+num) + "/77]\n완료까지 " + to_date + "주");
							})
							.catch(err => {
								console.error(err);
								msg.reply("데이터 수정에 실패했어요");
							});
							break;	
						default : 
							msg.reply("데이터 업로드 실패");
					}			
				}
				else {
					msg.reply("일치하는 계정이 없습니다. 계정 이름을 확인해주세요.");
				}
			})	
		} catch(error) {
			msg.reply("칠요 기록 방식 : !칠요 닉네임,요일,횟수 (요일,횟수 생략시 오늘의 요일 + 2회 기록)");
		}
	}
	else if (msg.content.slice(0, 6) == "!칠요조회 ") {
		user.findOne({
				where: {
					user_name: msg.content.slice(6)
				}
			})
			.then((sc) => {
				v_0 = sc.user_mon;
				v_1 = sc.user_tue;
				v_2 = sc.user_wed;
				v_3 = sc.user_thu;
				v_4 = sc.user_fri;
 				v_5 = sc.user_sat;
				v_6 = sc.user_sun;
				const week = new Array('월','화','수','목','금','토','일')
				const embed = new Discord.MessageEmbed().setTitle(msg.content.slice(6) + "님의 요일 훈장 현황")
				.setColor('#0099ff')
				for(var a = 0; a < 7; a++){
					embed.addField(week[a] + "요일", eval("v_" + a) + "/77 , 완료까지 " + Math.ceil((77-eval("v_" + a))/2) + "주", false)
				}
				msg.reply(embed);
				//msg.reply("\n월요일 : [" + mon + "/77] " + Math.ceil((77-mon)/2) + "주\n화요일 : [" + tue + "/77] " + Math.ceil((77-tue)/2) + "주\n수요일 : [" + wed + "/77] " + Math.ceil((77-wed)/2) + "주\n목요일 : [" + thu + "/77] " + Math.ceil((77-thu)/2) + "주\n금요일 : [" + fri + "/77] " + Math.ceil((77-fri)/2) + "주\n토요일 : [" + sat + "/77] " + Math.ceil((77-sat)/2) + "주\n일요일 : [" + sun + "/77] " + Math.ceil((77-sun)/2) + "주");
			})
	}
	else if (msg.content.slice(0, 6) == "!심볼조회 ") {
		user.findOne({
				where: {
					user_name: msg.content.slice(6)
				}
			})
			.then((sc) => {
				//user_simbol_1_cnt
				//user_simbol_1_default
				const s_name = new Array('소멸의 여로','츄츄 아일랜드','레헬른','아르카나','모라스','에스페라')
				const embed = new Discord.MessageEmbed().setTitle(msg.content.slice(6) + "님의 심볼 현황")
				.setColor('#0099ff')
				for(var a = 1; a < 7; a++){
					let lv = eval("sc.user_simbol_" + a +"_lv")
					let cnt = eval("sc.user_simbol_" + a +"_cnt")
					let def = eval("sc.user_simbol_" + a + "_default")
					let max_cnt = lv * lv + 11;
					let to_max = 0;
					for(var i=lv; i<20; i++){
						to_max = to_max + (i*i+11)
					}
					let to_date = Math.ceil((to_max-cnt)/(def))
					embed.addField(s_name[a-1] + " (하루 " + def + "개)", lv + "레벨 (" + cnt + "/" + max_cnt + ") 만렙까지 " + to_date + "일", false)
				}
				msg.reply(embed);
				//msg.reply("\n월요일 : [" + mon + "/77] " + Math.ceil((77-mon)/2) + "주\n화요일 : [" + tue + "/77] " + Math.ceil((77-tue)/2) + "주\n수요일 : [" + wed + "/77] " + Math.ceil((77-wed)/2) + "주\n목요일 : [" + thu + "/77] " + Math.ceil((77-thu)/2) + "주\n금요일 : [" + fri + "/77] " + Math.ceil((77-fri)/2) + "주\n토요일 : [" + sat + "/77] " + Math.ceil((77-sat)/2) + "주\n일요일 : [" + sun + "/77] " + Math.ceil((77-sun)/2) + "주");
			})
	}
    //받은 메세지의 앞부분이 일치할 경우
    else if (msg.content.slice(0, 4) == "!정보 ") {
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
		let seed;
        let union;
		let name = msg.content.slice(4);
        //async, await을 사용한 비동기 함수 (순서대로 실행하기 위함)
        const getHtml = async () => {
            try {
                //읽어올 페이지 주소, !정보 이후의 텍스트를 가져와 붙인 뒤, encodeURI를 사용하여 한글을 인코딩시킴
                //axios는 nodeJS와 브라우저를 위한 HTTP통신 js 라이브러리
                url = encodeURI("https://maple.gg/u/" + name);
                return await axios.get(encodeURI("https://maple.gg/u/" + name));
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
                        text: $(this).text(),
						link: $(this).find("a").attr('href')
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
				try{
					guild = save_data2[0].text.toString().replace("\n                            길드\n                                                            ", "");
					guild_link = save_data2[0].link
					lv = save_data[0].text.toString().replace("Lv.", "")
					job = save_data[1].text;
					pop = save_data[2].text.toString().replace("인기도\n                                ", "");
					time = save_img[0].time.toString().replace("\n                            \n                            \n                                                                    ", "");
					time = time.replace("                                일 전", "");
					time = time.replace("마지막 활동일: ", "");
					time = time.replace("\n\n                                    \n                                                            \n                        ", "");
					try{
						murung = save_data3[0].text.toString().slice(0, 2) + "층";
					} catch (exception) {
						murung = "없음"
					}
					try{
						seed = save_data3[1].text.toString().slice(0, 2) + "층";
					} catch (exception) {
						seed = "없음"
					}
					
					try{
						union = save_data4[0].text.toString().slice(3, 7);
						if(save_data4[0].text.toString().slice(0, 2) == "업적"){
							union= "없음"
						}		
					} catch (exception) {
						union = "없음"
					}	
					output()
				}
				catch{
					msg.reply("에러! 일치하는 닉네임이 없거나, 서버 에러입니다");
				}
            })
        function output() {
            try {
                //discord embed 기능을 사용하여 유저에게 결과 제공
                const embed = new Discord.MessageEmbed()
                    //.setColor('#0099ff') embed 테두리 색
                    embed.setTitle(name) //닉네임
                    embed.setURL(url) //maple.gg 캐릭터 상세 링크
                    embed.setAuthor(guild, save_img2[0].img.toString().replace("https", "http"), guild_link) //https 형식을 discord 메세지가 출력못해서 http로 변경 작업, 길드 마크
                    embed.setDescription("LV." + lv + " " + job + "\n인기도 : " + pop) //레벨, 직업, 인기도 출력
                    //.setThumbnail("") //썸네일 이미지 (우측에 나옴)
                    embed.addField('무릉도장', murung, true) //추가할 항목은 이와 같이
					embed.addField('더 시드', seed, true)
                    embed.addField('유니온', union, true)
					user.findOne({
						where: {
							user_chara: name
						}
					})
					.then((sc) => {
						if(sc){
							embed.addField('\u200B', '\u200B')
							const s_name = new Array('소멸의 여로','츄츄 아일랜드','레헬른','아르카나','모라스','에스페라')
							for(var a = 1; a < 7; a++){
								let lv = eval("sc.user_simbol_" + a +"_lv")
								let cnt = eval("sc.user_simbol_" + a +"_cnt")
								let def = eval("sc.user_simbol_" + a + "_default")
								let max_cnt = lv * lv + 11;
								let to_max = 0;
								for(var i=lv; i<20; i++){
									to_max = to_max + (i*i+11)
								}
								let to_date = Math.ceil((to_max-cnt)/(def))
								//embed.addField(s_name[a-1] + " (하루 " + def + "개)", lv + "레벨 (" + cnt + "/" + max_cnt + ") 만렙까지 " + to_date + "일", false)
								embed.addField(s_name[a-1], lv + "레벨 (" + cnt + "/" + max_cnt + ")", true)
							}
						}
						msg.reply(embed);
					})
                    embed.setImage(save_img[0].img.toString().replace("https", "http")) //캐릭터 이미지 출력
                    //.setTimestamp() 타임스탬프 //embed가 제작된 시간
                    embed.setFooter('마지막 업데이트 : ' + time + "일 전", 'http://maple.gg'); //하단 텍스트 영역, 최근 갱신 일 + maple.gg링크
            } catch (exception) {
                //만약 페이지 검색 결과가 없거나 서버에 문제가 생길 경우 유저에게 에러 출력
                msg.reply("에러! 일치하는 닉네임이 없거나, 서버 에러입니다");
            }
        };
    }
})

client.on('ready', () => {
    //처음 실행 시 디스코드 봇 실행 후 작동
    console.log(`${client.user.tag}으로 접속되었습니다!`);
});

//디스코드 앱 인증 키
client.login(key.key_value);