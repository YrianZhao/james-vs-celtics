import type { CareerTotals, Honors, PlayerCard } from "./types";

const lineupTop50Url =
  "https://www.lineups.com/articles/top-50-greatest-boston-celtics-players/";
const basketballReferenceCelticsUrl =
  "https://www.basketball-reference.com/teams/BOS/";
const nba75Url = "https://www.nba.com/news/nba-75th-anniversary-team-announced";
const basketballReferenceAwardsUrl = "https://www.basketball-reference.com/awards/";
const hallOfFameUrl = "https://www.hoophall.com/";
const espnNbaUrl = "https://www.espn.com/nba/";
const basketballReferenceBaseUrl = "https://www.basketball-reference.com/players/";

const zeroHonors: Honors = {
  championships: 0,
  mvps: 0,
  finalsMvps: 0,
  allStars: 0,
  allNba: 0,
  allDefense: 0,
  scoringTitles: 0,
  assistTitles: 0,
  reboundTitles: 0,
  dpoy: 0,
  roy: 0,
  hallOfFame: 0,
  nba75: 0
};

const emptyPlayoffs = {
  playoffPoints: null,
  playoffRebounds: null,
  playoffAssists: null
};

function honors(values: Partial<Honors>): Honors {
  return { ...zeroHonors, ...values };
}

function totals(values: Omit<CareerTotals, "playoffPoints" | "playoffRebounds" | "playoffAssists"> & Partial<CareerTotals>): CareerTotals {
  return { ...emptyPlayoffs, ...values };
}

function slug(name: string) {
  return name.toLowerCase().replace(/[.']/g, "").replace(/\s+/g, "-");
}

function basketballReferencePlayerUrl(path: string) {
  return `${basketballReferenceBaseUrl}${path}`;
}

function celtic(
  rank: number,
  name: string,
  era: string,
  position: string,
  summaryTags: string[],
  playerHonors: Honors,
  careerTotals: CareerTotals,
  advanced: PlayerCard["advanced"],
  mediaNotes: string[],
  trashTalkLines: string[]
): PlayerCard {
  return {
    id: `bos-${rank}-${slug(name)}`,
    name,
    teamSide: "celtics",
    era,
    position,
    rankSource: {
      rank,
      label: "Lineups Celtics Top 50 inspired card pool",
      url: lineupTop50Url
    },
    summaryTags,
    honors: playerHonors,
    careerTotals,
    advanced,
    mediaNotes,
    sourceUrls: [lineupTop50Url, basketballReferenceCelticsUrl, hallOfFameUrl, espnNbaUrl],
    trashTalkLines
  };
}

interface LegendOptions {
  aliases?: string[];
  sourcePath: string;
  rank: number;
}

function legend(
  options: LegendOptions,
  name: string,
  era: string,
  position: string,
  summaryTags: string[],
  playerHonors: Honors,
  careerTotals: CareerTotals,
  advanced: PlayerCard["advanced"],
  mediaNotes: string[],
  trashTalkLines: string[]
): PlayerCard {
  const playerUrl = basketballReferencePlayerUrl(options.sourcePath);

  return {
    id: `legend-${slug(name)}`,
    name,
    aliases: options.aliases,
    teamSide: "legend",
    era,
    position,
    rankSource: {
      rank: options.rank,
      label: "精选历史球星荣誉池",
      url: nba75Url
    },
    summaryTags,
    honors: playerHonors,
    careerTotals,
    advanced,
    mediaNotes,
    sourceUrls: [nba75Url, basketballReferenceAwardsUrl, playerUrl, hallOfFameUrl, espnNbaUrl],
    trashTalkLines
  };
}

export const lebronJames: PlayerCard = {
  id: "lebron-james",
  name: "LeBron James",
  aliases: ["勒布朗", "詹姆斯", "老詹", "小皇帝", "国王", "King James"],
  teamSide: "james",
  era: "2003-至今",
  position: "SF / PF / PG",
  rankSource: {
    rank: null,
    label: "玩家固定阵营",
    url: "https://www.nba.com/player/2544/lebron-james"
  },
  summaryTags: ["历史得分王", "4x MVP", "4x FMVP", "全能发动机"],
  honors: honors({
    championships: 4,
    mvps: 4,
    finalsMvps: 4,
    allStars: 21,
    allNba: 21,
    allDefense: 6,
    scoringTitles: 1,
    assistTitles: 1,
    roy: 1,
    nba75: 1
  }),
  careerTotals: totals({
    games: 1622,
    points: 43440,
    rebounds: 12095,
    assists: 12016,
    steals: 2417,
    blocks: 1185,
    ppg: 26.8,
    rpg: 7.5,
    apg: 7.4,
    playoffPoints: 8162,
    playoffRebounds: 2549,
    playoffAssists: 2067
  }),
  advanced: {
    dangerLevel: 99,
    clutch: 94,
    legacy: 100,
    celticsAura: 42
  },
  mediaNotes: [
    "公开资料常见口径：历史得分王、四次总冠军、四次 MVP、四次 FMVP。",
    "数据为游戏快照，现役球员后续变化不会自动更新。"
  ],
  sourceUrls: [
    "https://www.nba.com/player/2544/lebron-james",
    "https://www.basketball-reference.com/players/j/jamesle01.html",
    espnNbaUrl
  ],
  trashTalkLines: [
    "国王把数据表摊开，对面先别急着举祖传戒指。",
    "这不是抱团，这是把简历打印成战术板。",
    "你可以讨厌他的选择，但很难讨厌这张统计表。"
  ]
};

export const celticsPlayers: PlayerCard[] = [
  celtic(
    1,
    "Bill Russell",
    "1956-1969",
    "C",
    ["11冠王", "防守神话", "绿军图腾"],
    honors({ championships: 11, mvps: 5, allStars: 12, allNba: 11, reboundTitles: 4, hallOfFame: 1, nba75: 1 }),
    totals({ games: 963, points: 14522, rebounds: 21620, assists: 4100, steals: null, blocks: null, ppg: 15.1, rpg: 22.5, apg: 4.3, playoffPoints: 2673, playoffRebounds: 4104, playoffAssists: 770 }),
    { dangerLevel: 100, clutch: 97, legacy: 100, celticsAura: 100 },
    ["凯尔特人王朝的最高旗帜，冠军数量本身就是一套攻击牌。"],
    ["戒指盒一打开，整个球馆都安静了。", "詹姆斯要打的是球员，系统偏偏抽出了王朝。"]
  ),
  celtic(
    2,
    "Larry Bird",
    "1979-1992",
    "SF / PF",
    ["3x MVP", "冷血射手", "垃圾话宗师"],
    honors({ championships: 3, mvps: 3, finalsMvps: 2, allStars: 12, allNba: 10, allDefense: 3, roy: 1, hallOfFame: 1, nba75: 1 }),
    totals({ games: 897, points: 21791, rebounds: 8974, assists: 5695, steals: 1556, blocks: 755, ppg: 24.3, rpg: 10.0, apg: 6.3, playoffPoints: 3897, playoffRebounds: 1683, playoffAssists: 1062 }),
    { dangerLevel: 98, clutch: 98, legacy: 99, celticsAura: 98 },
    ["被广泛视为凯尔特人队史最伟大球员之一。"],
    ["伯德甚至懒得热身，先把话放进篮筐。", "这张卡的三分线外自带嘲讽范围。"]
  ),
  celtic(
    3,
    "John Havlicek",
    "1962-1978",
    "SF / SG",
    ["8冠", "耐力怪物", "攻防全勤"],
    honors({ championships: 8, finalsMvps: 1, allStars: 13, allNba: 11, allDefense: 8, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1270, points: 26395, rebounds: 8007, assists: 6114, steals: 1127, blocks: 117, ppg: 20.8, rpg: 6.3, apg: 4.8, playoffPoints: 3776, playoffRebounds: 1186, playoffAssists: 825 }),
    { dangerLevel: 94, clutch: 94, legacy: 97, celticsAura: 97 },
    ["队史总得分长期位列绿军前列，攻防两端都有高声量。"],
    ["哈夫利切克一跑起来，连血条都开始喘。", "这不是体能槽，这是永动机授权书。"]
  ),
  celtic(
    4,
    "Bob Cousy",
    "1950-1963",
    "PG",
    ["控卫祖师", "6冠", "传球魔术"],
    honors({ championships: 6, mvps: 1, allStars: 13, allNba: 12, assistTitles: 8, hallOfFame: 1, nba75: 1 }),
    totals({ games: 924, points: 16960, rebounds: 4786, assists: 6955, steals: null, blocks: null, ppg: 18.4, rpg: 5.2, apg: 7.5, playoffPoints: 2018, playoffRebounds: 609, playoffAssists: 937 }),
    { dangerLevel: 91, clutch: 90, legacy: 96, celticsAura: 96 },
    ["早期控卫美学代表，也是绿军王朝发动机之一。"],
    ["库西一抬手，传球路线比弹幕还密。", "这张老卡不靠速度，靠的是时代滤镜和冠军税。"]
  ),
  celtic(
    5,
    "Paul Pierce",
    "1998-2017",
    "SF",
    ["真理", "FMVP", "关键先生"],
    honors({ championships: 1, finalsMvps: 1, allStars: 10, allNba: 4, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1343, points: 26397, rebounds: 7527, assists: 4708, steals: 1752, blocks: 745, ppg: 19.7, rpg: 5.6, apg: 3.5, playoffPoints: 3180, playoffRebounds: 1250, playoffAssists: 616 }),
    { dangerLevel: 90, clutch: 95, legacy: 92, celticsAura: 92 },
    ["21 世纪绿军冠军核心，队史外线代表人物。"],
    ["真理来了，先别问轮椅，问就是心理战。", "这张卡的中距离带着波士顿口音。"]
  ),
  celtic(
    6,
    "Kevin McHale",
    "1980-1993",
    "PF",
    ["低位脚步", "3冠", "最佳第六人"],
    honors({ championships: 3, allStars: 7, allNba: 1, allDefense: 6, hallOfFame: 1, nba75: 1 }),
    totals({ games: 971, points: 17335, rebounds: 7122, assists: 1670, steals: 344, blocks: 1690, ppg: 17.9, rpg: 7.3, apg: 1.7, playoffPoints: 3182, playoffRebounds: 1330, playoffAssists: 306 }),
    { dangerLevel: 89, clutch: 88, legacy: 92, celticsAura: 93 },
    ["80 年代绿军前场核心，低位技术常被反复提起。"],
    ["麦克海尔脚步一晃，防守人开始怀疑地板。", "这不是背身，这是低位迷宫。"]
  ),
  celtic(
    7,
    "Sam Jones",
    "1957-1969",
    "SG",
    ["10冠", "板擦投篮", "王朝火力"],
    honors({ championships: 10, allStars: 5, allNba: 3, hallOfFame: 1, nba75: 1 }),
    totals({ games: 871, points: 15411, rebounds: 4305, assists: 2209, steals: null, blocks: null, ppg: 17.7, rpg: 4.9, apg: 2.5, playoffPoints: 2909, playoffRebounds: 736, playoffAssists: 421 }),
    { dangerLevel: 88, clutch: 92, legacy: 91, celticsAura: 95 },
    ["王朝时期的关键得分手，冠军履历极厚。"],
    ["萨姆琼斯举起板擦投篮，血条被擦掉一段。", "十枚戒指不是装饰，是伤害加成。"]
  ),
  celtic(
    8,
    "Dave Cowens",
    "1970-1983",
    "C",
    ["MVP", "硬派中锋", "篮板猛兽"],
    honors({ championships: 2, mvps: 1, allStars: 8, allNba: 3, allDefense: 3, roy: 1, hallOfFame: 1, nba75: 1 }),
    totals({ games: 766, points: 13516, rebounds: 10444, assists: 2910, steals: 599, blocks: 488, ppg: 17.6, rpg: 13.6, apg: 3.8, playoffPoints: 1665, playoffRebounds: 1404, playoffAssists: 370 }),
    { dangerLevel: 88, clutch: 88, legacy: 91, celticsAura: 91 },
    ["70 年代绿军的硬派核心，MVP 让卡面很有重量。"],
    ["考恩斯不是跳起来抢板，他是把地板一起拔起来。", "硬度溢出，系统自动给对面扣血。"]
  ),
  celtic(
    9,
    "Robert Parish",
    "1976-1997",
    "C",
    ["酋长", "长寿中锋", "4冠"],
    honors({ championships: 4, allStars: 9, allNba: 2, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1611, points: 23334, rebounds: 14715, assists: 2180, steals: 1219, blocks: 2361, ppg: 14.5, rpg: 9.1, apg: 1.4, playoffPoints: 3820, playoffRebounds: 2765, playoffAssists: 435 }),
    { dangerLevel: 87, clutch: 86, legacy: 91, celticsAura: 92 },
    ["生涯长度和稳定性惊人，是 80 年代绿军内线支柱。"],
    ["酋长站在禁区，像一座会打勾手的建筑。", "他的出场数一亮，对面先掉耐心。"]
  ),
  celtic(
    10,
    "Jayson Tatum",
    "2017-至今",
    "SF / PF",
    ["现役门面", "冠军核心", "高产得分"],
    honors({ championships: 1, allStars: 6, allNba: 4, allDefense: 0 }),
    totals({ games: 601, points: 14132, rebounds: 4453, assists: 2328, steals: 661, blocks: 387, ppg: 23.5, rpg: 7.4, apg: 3.9, playoffPoints: 2711, playoffRebounds: 898, playoffAssists: 562 }),
    { dangerLevel: 86, clutch: 84, legacy: 84, celticsAura: 86 },
    ["现役绿军冠军核心，数据仍在增长。"],
    ["塔图姆还在升级，但已经把难度调高了。", "这张卡年轻，血条却一点不年轻。"]
  ),
  celtic(11, "Jo Jo White", "1969-1981", "PG", ["2冠", "FMVP", "稳健后卫"], honors({ championships: 2, finalsMvps: 1, allStars: 7, allNba: 2, hallOfFame: 1 }), totals({ games: 837, points: 14651, rebounds: 3500, assists: 4095, steals: 990, blocks: 130, ppg: 17.2, rpg: 4.0, apg: 4.9 }), { dangerLevel: 84, clutch: 90, legacy: 86, celticsAura: 88 }, ["70 年代冠军后场核心，FMVP 是硬通货。"], ["乔乔怀特不吵，但一张 FMVP 足够响。"]),
  celtic(12, "Tom Heinsohn", "1956-1965", "PF", ["8冠", "ROY", "绿军名宿"], honors({ championships: 8, allStars: 6, allNba: 4, roy: 1, hallOfFame: 1 }), totals({ games: 654, points: 12194, rebounds: 5749, assists: 1318, steals: null, blocks: null, ppg: 18.6, rpg: 8.8, apg: 2.0 }), { dangerLevel: 83, clutch: 86, legacy: 87, celticsAura: 92 }, ["球员和教练身份都深嵌绿军历史。"], ["海因索恩一亮相，老花名册直接变武器。"]),
  celtic(13, "Bill Sharman", "1950-1961", "SG", ["4冠", "神射先驱", "名人堂"], honors({ championships: 4, allStars: 8, allNba: 7, hallOfFame: 1, nba75: 1 }), totals({ games: 711, points: 12665, rebounds: 2779, assists: 2101, steals: null, blocks: null, ppg: 17.8, rpg: 3.9, apg: 3.0 }), { dangerLevel: 82, clutch: 86, legacy: 88, celticsAura: 88 }, ["早期后场得分代表，荣誉履历扎实。"], ["沙曼的投篮像老式钟表，准得让人烦。"]),
  celtic(14, "Dennis Johnson", "1976-1990", "PG / SG", ["3冠", "防守铁闸", "FMVP"], honors({ championships: 3, finalsMvps: 1, allStars: 5, allNba: 2, allDefense: 9, hallOfFame: 1 }), totals({ games: 1100, points: 15535, rebounds: 4249, assists: 5499, steals: 1477, blocks: 675, ppg: 14.1, rpg: 3.9, apg: 5.0 }), { dangerLevel: 82, clutch: 90, legacy: 86, celticsAura: 87 }, ["80 年代绿军后场防守关键牌。"], ["DJ 一贴上来，控球键都变沉了。"]),
  celtic(15, "Rajon Rondo", "2006-2022", "PG", ["助攻王", "季后赛大脑", "2冠"], honors({ championships: 2, allStars: 4, allNba: 1, allDefense: 4, assistTitles: 3, scoringTitles: 0 }), totals({ games: 957, points: 9324, rebounds: 4520, assists: 7584, steals: 1518, blocks: 127, ppg: 9.8, rpg: 4.7, apg: 7.9 }), { dangerLevel: 81, clutch: 87, legacy: 82, celticsAura: 84 }, ["2008 冠军后场组织者，季后赛口碑很强。"], ["隆多不看篮筐，但他看穿了你的防线。"]),
  celtic(16, "Cedric Maxwell", "1977-1988", "SF / PF", ["2冠", "FMVP", "效率锋线"], honors({ championships: 2, finalsMvps: 1 }), totals({ games: 835, points: 10465, rebounds: 5261, assists: 1862, steals: 744, blocks: 574, ppg: 12.5, rpg: 6.3, apg: 2.2 }), { dangerLevel: 78, clutch: 87, legacy: 78, celticsAura: 83 }, ["1981 FMVP 让这张卡有爆冷能力。"], ["麦克斯韦尔把 FMVP 往桌上一拍，谁还敢说配角。"]),
  celtic(17, "K.C. Jones", "1958-1967", "PG", ["8冠", "防守后卫", "王朝拼图"], honors({ championships: 8, hallOfFame: 1 }), totals({ games: 676, points: 5011, rebounds: 2399, assists: 2908, steals: null, blocks: null, ppg: 7.4, rpg: 3.5, apg: 4.3 }), { dangerLevel: 76, clutch: 84, legacy: 82, celticsAura: 91 }, ["冠军数量极重，个人数据朴素。"], ["K.C. 琼斯：数据不吓人，戒指吓人。"]),
  celtic(18, "Satch Sanders", "1960-1973", "F", ["8冠", "防守拼图", "王朝老兵"], honors({ championships: 8, hallOfFame: 1 }), totals({ games: 916, points: 8876, rebounds: 5798, assists: 1026, steals: null, blocks: null, ppg: 9.7, rpg: 6.3, apg: 1.1 }), { dangerLevel: 75, clutch: 82, legacy: 80, celticsAura: 90 }, ["王朝轮换里的硬派防守代表。"], ["桑德斯不刷分，他刷冠军年份。"]),
  celtic(19, "Reggie Lewis", "1987-1993", "SG / SF", ["短暂巅峰", "全明星", "绿军遗憾"], honors({ allStars: 1 }), totals({ games: 450, points: 7902, rebounds: 1938, assists: 1255, steals: 536, blocks: 363, ppg: 17.6, rpg: 4.3, apg: 2.8 }), { dangerLevel: 76, clutch: 79, legacy: 78, celticsAura: 82 }, ["职业生涯短暂但被绿军球迷长期记住。"], ["雷吉刘易斯的卡面短，但火力不短。"]),
  celtic(20, "Antoine Walker", "1996-2008", "PF", ["三分前锋", "3x 全明星", "摇摆时代"], honors({ allStars: 3 }), totals({ games: 893, points: 15647, rebounds: 7170, assists: 3170, steals: 1085, blocks: 389, ppg: 17.5, rpg: 8.0, apg: 3.5 }), { dangerLevel: 77, clutch: 77, legacy: 76, celticsAura: 77 }, ["皮尔斯早期搭档，数据面很有存在感。"], ["沃克一出手，战术板先深呼吸。"]),
  celtic(21, "Jaylen Brown", "2016-至今", "SG / SF", ["FMVP", "冠军侧翼", "现役强卡"], honors({ championships: 1, finalsMvps: 1, allStars: 4, allNba: 1 }), totals({ games: 616, points: 11726, rebounds: 3294, assists: 1486, steals: 610, blocks: 248, ppg: 19.0, rpg: 5.3, apg: 2.4 }), { dangerLevel: 81, clutch: 85, legacy: 80, celticsAura: 84 }, ["现役冠军核心之一，FMVP 提升爆发力。"], ["杰伦布朗不多说，FMVP 直接插队。"]),
  celtic(22, "Al Horford", "2007-至今", "C / PF", ["冠军老将", "空间内线", "稳定先生"], honors({ championships: 1, allStars: 5, allNba: 1, allDefense: 1 }), totals({ games: 1138, points: 14831, rebounds: 8959, assists: 3826, steals: 876, blocks: 1335, ppg: 13.0, rpg: 7.9, apg: 3.4 }), { dangerLevel: 78, clutch: 82, legacy: 79, celticsAura: 80 }, ["冠军阵容里的稳态内线，数据全能。"], ["霍福德不吼，但他能把每个回合都磨平。"]),
  celtic(23, "Tiny Archibald", "1970-1984", "PG", ["得分王", "助攻王", "冠军控卫"], honors({ championships: 1, allStars: 6, allNba: 5, scoringTitles: 1, assistTitles: 1, hallOfFame: 1, nba75: 1 }), totals({ games: 876, points: 16481, rebounds: 2046, assists: 6476, steals: 719, blocks: 81, ppg: 18.8, rpg: 2.3, apg: 7.4 }), { dangerLevel: 82, clutch: 84, legacy: 88, celticsAura: 80 }, ["少见的同季得分王与助攻王履历。"], ["Tiny 名字小，数据一点不小。"]),
  celtic(24, "Don Nelson", "1962-1976", "F", ["5冠", "老派侧翼", "体系拼图"], honors({ championships: 5, hallOfFame: 1 }), totals({ games: 1053, points: 10281, rebounds: 4909, assists: 1526, steals: null, blocks: null, ppg: 9.8, rpg: 4.7, apg: 1.4 }), { dangerLevel: 73, clutch: 79, legacy: 77, celticsAura: 86 }, ["冠军拼图型绿军名宿。"], ["尼尔森的数据不爆炸，履历会慢慢扣血。"]),
  celtic(25, "Bailey Howell", "1959-1971", "F", ["2冠", "6x 全明星", "名人堂"], honors({ championships: 2, allStars: 6, allNba: 1, hallOfFame: 1 }), totals({ games: 950, points: 17770, rebounds: 9383, assists: 1853, steals: null, blocks: null, ppg: 18.7, rpg: 9.9, apg: 2.0 }), { dangerLevel: 76, clutch: 78, legacy: 81, celticsAura: 82 }, ["60 年代末冠军阵容的重要锋线。"], ["豪威尔的篮板数一翻，前场地板都紧张。"]),
  celtic(26, "Frank Ramsey", "1954-1964", "SG / SF", ["7冠", "第六人先驱", "名人堂"], honors({ championships: 7, hallOfFame: 1 }), totals({ games: 623, points: 8378, rebounds: 3410, assists: 1134, steals: null, blocks: null, ppg: 13.4, rpg: 5.5, apg: 1.8 }), { dangerLevel: 74, clutch: 82, legacy: 80, celticsAura: 88 }, ["常被提作早期第六人代表。"], ["拉姆齐替补上场，结果带来主角级伤害。"]),
  celtic(27, "Ed Macauley", "1949-1959", "C / F", ["早期明星", "7x 全明星", "名人堂"], honors({ championships: 1, allStars: 7, allNba: 4, hallOfFame: 1 }), totals({ games: 641, points: 11234, rebounds: 4325, assists: 2079, steals: null, blocks: null, ppg: 17.5, rpg: 6.7, apg: 3.2 }), { dangerLevel: 73, clutch: 77, legacy: 80, celticsAura: 76 }, ["早期明星内线，入选名人堂。"], ["麦考利的年代很远，但全明星次数很近。"]),
  celtic(28, "Jim Loscutoff", "1955-1964", "F", ["7冠", "硬汉", "王朝蓝领"], honors({ championships: 7 }), totals({ games: 511, points: 3505, rebounds: 2901, assists: 344, steals: null, blocks: null, ppg: 6.9, rpg: 5.7, apg: 0.7 }), { dangerLevel: 68, clutch: 75, legacy: 72, celticsAura: 86 }, ["王朝蓝领型球员，冠军履历很厚。"], ["洛斯库托夫不靠漂亮数据，靠让你难受。"]),
  celtic(29, "Don Chaney", "1968-1980", "SG", ["2冠", "防守后卫", "硬派轮换"], honors({ championships: 2, allDefense: 5 }), totals({ games: 790, points: 6638, rebounds: 3147, assists: 1762, steals: 762, blocks: 240, ppg: 8.4, rpg: 4.0, apg: 2.2 }), { dangerLevel: 70, clutch: 76, legacy: 73, celticsAura: 80 }, ["70 年代绿军防守型后卫。"], ["钱尼这张卡不华丽，但防守数值很烦。"]),
  celtic(30, "Danny Ainge", "1981-1995", "SG / PG", ["2冠", "外线火力", "冠军后卫"], honors({ championships: 2, allStars: 1 }), totals({ games: 1042, points: 11964, rebounds: 2768, assists: 4199, steals: 1133, blocks: 132, ppg: 11.5, rpg: 2.7, apg: 4.0 }), { dangerLevel: 72, clutch: 79, legacy: 75, celticsAura: 81 }, ["80 年代绿军后场重要轮换。"], ["安吉一笑，说明这回合可能有点脏。"]),
  celtic(31, "Marcus Smart", "2014-至今", "PG / SG", ["DPOY", "防守灵魂", "绿军悍将"], honors({ dpoy: 1, allDefense: 3 }), totals({ games: 672, points: 7280, rebounds: 2380, assists: 3056, steals: 1100, blocks: 250, ppg: 10.8, rpg: 3.5, apg: 4.5 }), { dangerLevel: 74, clutch: 82, legacy: 74, celticsAura: 82 }, ["现代绿军防守文化代表之一。"], ["斯马特倒地前，先把你的血条骗起来。"]),
  celtic(32, "Isaiah Thomas", "2011-至今", "PG", ["小托马斯", "末节之王", "2x 全明星"], honors({ allStars: 2, allNba: 1 }), totals({ games: 550, points: 9840, rebounds: 1330, assists: 2655, steals: 484, blocks: 58, ppg: 17.9, rpg: 2.4, apg: 4.8 }), { dangerLevel: 74, clutch: 86, legacy: 73, celticsAura: 78 }, ["短暂但爆炸的绿军巅峰期让球迷记忆深刻。"], ["地表最强 175 上线，第四节开始加价。"]),
  celtic(33, "Ray Allen", "1996-2014", "SG", ["历史射手", "2冠", "NBA75"], honors({ championships: 2, allStars: 10, allNba: 2, hallOfFame: 1, nba75: 1 }), totals({ games: 1300, points: 24505, rebounds: 5272, assists: 4361, steals: 1451, blocks: 244, ppg: 18.9, rpg: 4.1, apg: 3.4 }), { dangerLevel: 83, clutch: 92, legacy: 89, celticsAura: 79 }, ["2008 冠军三巨头成员，历史级射手。"], ["雷阿伦跑出空位，扣血声比出手还快。"]),
  celtic(34, "Kevin Garnett", "1995-2016", "PF / C", ["MVP", "DPOY", "冠军防线"], honors({ championships: 1, mvps: 1, allStars: 15, allNba: 9, allDefense: 12, dpoy: 1, hallOfFame: 1, nba75: 1 }), totals({ games: 1462, points: 26071, rebounds: 14662, assists: 5445, steals: 1859, blocks: 2037, ppg: 17.8, rpg: 10.0, apg: 3.7 }), { dangerLevel: 90, clutch: 90, legacy: 93, celticsAura: 87 }, ["2008 冠军防守灵魂，个人履历极强。"], ["KG 一吼，连按钮都想防守。"]),
  celtic(35, "Kyrie Irving", "2011-至今", "PG", ["控运大师", "冠军后卫", "单打核武"], honors({ championships: 1, allStars: 9, allNba: 3, roy: 1 }), totals({ games: 821, points: 19300, rebounds: 3300, assists: 4650, steals: 1040, blocks: 320, ppg: 23.5, rpg: 4.0, apg: 5.7 }), { dangerLevel: 80, clutch: 88, legacy: 80, celticsAura: 58 }, ["绿军时期复杂，但单打能力很适合卡牌战。"], ["欧文运球一多，防守人和剧情都开始拐弯。"]),
  celtic(36, "Pete Maravich", "1970-1980", "SG", ["手枪", "得分艺术", "NBA75"], honors({ allStars: 5, allNba: 4, scoringTitles: 1, hallOfFame: 1, nba75: 1 }), totals({ games: 658, points: 15948, rebounds: 2747, assists: 3563, steals: 587, blocks: 108, ppg: 24.2, rpg: 4.2, apg: 5.4 }), { dangerLevel: 82, clutch: 84, legacy: 88, celticsAura: 62 }, ["生涯末期短暂效力绿军，但个人名气极大。"], ["手枪马拉维奇出牌，动作花到系统都要回放。"]),
  celtic(37, "Dave Bing", "1966-1978", "PG", ["得分控卫", "NBA75", "名人堂"], honors({ allStars: 7, allNba: 2, roy: 1, hallOfFame: 1, nba75: 1 }), totals({ games: 901, points: 18327, rebounds: 3420, assists: 5397, steals: 615, blocks: 64, ppg: 20.3, rpg: 3.8, apg: 6.0 }), { dangerLevel: 78, clutch: 80, legacy: 86, celticsAura: 60 }, ["绿军经历短，但整体生涯荣誉扎实。"], ["戴夫宾不是绿军长篇章，但个人履历够硬。"]),
  celtic(38, "Dominique Wilkins", "1982-1999", "SF", ["人类电影精华", "NBA75", "暴扣之王"], honors({ allStars: 9, allNba: 7, scoringTitles: 1, hallOfFame: 1, nba75: 1 }), totals({ games: 1074, points: 26668, rebounds: 7169, assists: 2677, steals: 1378, blocks: 642, ppg: 24.8, rpg: 6.7, apg: 2.5 }), { dangerLevel: 82, clutch: 82, legacy: 88, celticsAura: 55 }, ["短暂绿军经历，个人得分履历极强。"], ["威尔金斯起飞，卡面都要留出净空。"]),
  celtic(39, "Charlie Scott", "1970-1980", "SG", ["冠军后卫", "ABA/NBA 明星", "得分手"], honors({ championships: 1, allStars: 5, allNba: 2, hallOfFame: 1 }), totals({ games: 717, points: 14115, rebounds: 3126, assists: 3515, steals: 772, blocks: 175, ppg: 19.7, rpg: 4.4, apg: 4.9 }), { dangerLevel: 76, clutch: 78, legacy: 80, celticsAura: 72 }, ["1976 冠军阵容的重要后卫。"], ["查理斯科特把 ABA 味道带进绿军卡池。"]),
  celtic(40, "Paul Silas", "1964-1980", "PF", ["3冠", "篮板硬汉", "防守前锋"], honors({ championships: 3, allStars: 2, allDefense: 5 }), totals({ games: 1254, points: 11782, rebounds: 12357, assists: 2531, steals: 459, blocks: 420, ppg: 9.4, rpg: 9.9, apg: 2.0 }), { dangerLevel: 76, clutch: 80, legacy: 79, celticsAura: 78 }, ["冠军前场硬汉，篮板履历突出。"], ["塞拉斯抢的是篮板，也是对面的心态。"]),
  celtic(41, "Artis Gilmore", "1971-1988", "C", ["巨塔", "名人堂", "篮板怪兽"], honors({ allStars: 11, allNba: 1, reboundTitles: 4, hallOfFame: 1 }), totals({ games: 1329, points: 24941, rebounds: 16330, assists: 3050, steals: 702, blocks: 3178, ppg: 18.8, rpg: 12.3, apg: 2.3 }), { dangerLevel: 82, clutch: 80, legacy: 86, celticsAura: 52 }, ["绿军时间很短，但整体生涯体量巨大。"], ["吉尔摩站进禁区，篮筐像被租下来了。"]),
  celtic(42, "Brian Scalabrine", "2001-2012", "PF", ["白曼巴", "人气卡", "冠军替补"], honors({ championships: 1 }), totals({ games: 520, points: 1594, rebounds: 1034, assists: 426, steals: 160, blocks: 146, ppg: 3.1, rpg: 2.0, apg: 0.8 }), { dangerLevel: 61, clutch: 76, legacy: 70, celticsAura: 78 }, ["人气梗位极高，适合抽卡游戏。"], ["白曼巴登场，数据可以输，节目效果不能输。"]),
  celtic(43, "Walter McCarty", "1996-2006", "SF / PF", ["球迷宠儿", "绿军轮换", "更衣室能量"], honors({}), totals({ games: 593, points: 3135, rebounds: 1539, assists: 613, steals: 358, blocks: 199, ppg: 5.3, rpg: 2.6, apg: 1.0 }), { dangerLevel: 60, clutch: 68, legacy: 62, celticsAura: 74 }, ["在绿军球迷记忆里有特殊位置。"], ["麦卡蒂数值不高，但主场加油声挺满。"]),
  celtic(44, "Kendrick Perkins", "2003-2018", "C", ["2008 冠军", "肉盾中锋", "强硬掩护"], honors({ championships: 1 }), totals({ games: 782, points: 4414, rebounds: 4660, assists: 826, steals: 239, blocks: 922, ppg: 5.4, rpg: 5.8, apg: 1.0 }), { dangerLevel: 66, clutch: 70, legacy: 66, celticsAura: 75 }, ["2008 冠军首发内线之一。"], ["帕金斯不是来秀的，是来堵路的。"]),
  celtic(45, "Avery Bradley", "2010-2022", "SG", ["外线防守", "2x 最佳防守", "绿军后卫"], honors({ allDefense: 2 }), totals({ games: 660, points: 7419, rebounds: 1880, assists: 1196, steals: 677, blocks: 113, ppg: 11.3, rpg: 2.9, apg: 1.8 }), { dangerLevel: 68, clutch: 71, legacy: 67, celticsAura: 72 }, ["现代绿军外线防守代表之一。"], ["布拉德利一贴身，出手键先变小。"]),
  celtic(46, "Tony Allen", "2004-2018", "SG / SF", ["防守悍将", "冠军侧翼", "一防级别"], honors({ championships: 1, allDefense: 6 }), totals({ games: 820, points: 6777, rebounds: 2875, assists: 1080, steals: 1151, blocks: 320, ppg: 8.3, rpg: 3.5, apg: 1.3 }), { dangerLevel: 72, clutch: 74, legacy: 73, celticsAura: 73 }, ["联盟级防守声誉，2008 冠军成员。"], ["托尼阿伦防守上身，对手连吐槽都费劲。"]),
  celtic(47, "Glen Davis", "2007-2015", "PF / C", ["大宝贝", "冠军替补", "能量内线"], honors({ championships: 1 }), totals({ games: 514, points: 4111, rebounds: 2250, assists: 543, steals: 340, blocks: 191, ppg: 8.0, rpg: 4.4, apg: 1.1 }), { dangerLevel: 64, clutch: 68, legacy: 64, celticsAura: 70 }, ["2008 冠军轮换和球迷记忆点。"], ["大宝贝冲进来，禁区突然变拥挤。"]),
  celtic(48, "Dana Barros", "1989-2004", "PG", ["全明星", "外线后卫", "本地情结"], honors({ allStars: 1 }), totals({ games: 850, points: 8892, rebounds: 1612, assists: 2779, steals: 668, blocks: 44, ppg: 10.5, rpg: 1.9, apg: 3.3 }), { dangerLevel: 63, clutch: 69, legacy: 64, celticsAura: 67 }, ["波士顿背景和外线能力让他适合低位卡池。"], ["巴罗斯一抬手，替补席也能有电。"]),
  celtic(49, "Dee Brown", "1990-2002", "PG / SG", ["扣篮冠军", "绿军后卫", "人气瞬间"], honors({}), totals({ games: 608, points: 6758, rebounds: 1559, assists: 2276, steals: 711, blocks: 188, ppg: 11.1, rpg: 2.6, apg: 3.7 }), { dangerLevel: 63, clutch: 68, legacy: 64, celticsAura: 68 }, ["扣篮大赛瞬间是他的高记忆点。"], ["迪布朗蒙眼扣篮的梗，能不能扣血另说，先扣气势。"]),
  celtic(50, "Gerald Henderson", "1979-1992", "PG / SG", ["冠军后卫", "关键抢断", "老派控卫"], honors({ championships: 3 }), totals({ games: 871, points: 7521, rebounds: 1646, assists: 3415, steals: 912, blocks: 96, ppg: 8.9, rpg: 1.9, apg: 4.0 }), { dangerLevel: 65, clutch: 76, legacy: 66, celticsAura: 74 }, ["1984 总决赛关键抢断常被绿军球迷提起。"], ["亨德森的抢断不多解释，直接偷走一回合。"])
];

export const legendPlayers: PlayerCard[] = [
  legend(
    { rank: 1, sourcePath: "j/jordami01.html", aliases: ["乔丹", "MJ", "飞人", "篮球之神"] },
    "Michael Jordan",
    "1984-2003",
    "SG",
    ["6冠6FMVP", "5x MVP", "得分王机器"],
    honors({ championships: 6, mvps: 5, finalsMvps: 6, allStars: 14, allNba: 11, allDefense: 9, scoringTitles: 10, dpoy: 1, roy: 1, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1072, points: 32292, rebounds: 6672, assists: 5633, steals: 2514, blocks: 893, ppg: 30.1, rpg: 6.2, apg: 5.3, playoffPoints: 5987, playoffRebounds: 1152, playoffAssists: 1022 }),
    { dangerLevel: 100, clutch: 100, legacy: 100, celticsAura: 22 },
    ["总决赛 6 次夺冠且 6 次 FMVP，是 GOAT 争论里最常被引用的硬荣誉。"],
    ["乔丹把六枚戒指排成一排，连倒计时都想暂停。", "这一回合空气里全是最后一投的味道。"]
  ),
  legend(
    { rank: 2, sourcePath: "b/bryanko01.html", aliases: ["科比", "黑曼巴", "Kobe", "Mamba"] },
    "Kobe Bryant",
    "1996-2016",
    "SG",
    ["5冠", "曼巴精神", "81分先生"],
    honors({ championships: 5, mvps: 1, finalsMvps: 2, allStars: 18, allNba: 15, allDefense: 12, scoringTitles: 2, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1346, points: 33643, rebounds: 7047, assists: 6306, steals: 1944, blocks: 640, ppg: 25.0, rpg: 5.2, apg: 4.7, playoffPoints: 5640, playoffRebounds: 1119, playoffAssists: 1040 }),
    { dangerLevel: 98, clutch: 98, legacy: 97, celticsAura: 40 },
    ["个人荣誉、长期一阵和防守阵容数量都很厚，球迷讨论热度极高。"],
    ["黑曼巴出手前不会解释，血条自己会懂。", "科比这一击像凌晨四点的投篮机。"]
  ),
  legend(
    { rank: 3, sourcePath: "c/curryst01.html", aliases: ["库里", "萌神", "Stephen Curry", "Curry", "三分王"] },
    "Stephen Curry",
    "2009-至今",
    "PG",
    ["4冠", "2x MVP", "三分革命"],
    honors({ championships: 4, mvps: 2, finalsMvps: 1, allStars: 11, allNba: 11, scoringTitles: 2, nba75: 1 }),
    totals({ games: 1026, points: 25744, rebounds: 4831, assists: 6540, steals: 1544, blocks: 255, ppg: 25.1, rpg: 4.7, apg: 6.4, playoffPoints: 3966, playoffRebounds: 718, playoffAssists: 912 }),
    { dangerLevel: 97, clutch: 95, legacy: 96, celticsAura: 28 },
    ["三分时代的代表人物，MVP 和冠军履历让跨时代比较很有争议度。"],
    ["库里刚过半场，荣誉栏已经开始拉开空间。", "这一击带着三分弧线，落点却是血条。"]
  ),
  legend(
    { rank: 4, sourcePath: "j/johnsma02.html", aliases: ["魔术师", "Magic", "约翰逊"] },
    "Magic Johnson",
    "1979-1996",
    "PG",
    ["5冠", "3x MVP", "控卫天花板"],
    honors({ championships: 5, mvps: 3, finalsMvps: 3, allStars: 12, allNba: 10, assistTitles: 4, hallOfFame: 1, nba75: 1 }),
    totals({ games: 906, points: 17707, rebounds: 6559, assists: 10141, steals: 1724, blocks: 374, ppg: 19.5, rpg: 7.2, apg: 11.2, playoffPoints: 3701, playoffRebounds: 1465, playoffAssists: 2346 }),
    { dangerLevel: 97, clutch: 97, legacy: 99, celticsAura: 68 },
    ["冠军、MVP、FMVP 组合非常完整，是控卫历史地位讨论的核心样本。"],
    ["魔术师把传球路线一画，对手的防守像被拆线。", "这一张 Showtime，连荣誉值都跑快攻。"]
  ),
  legend(
    { rank: 5, sourcePath: "b/birdla01.html", aliases: ["伯德", "大鸟", "Larry Bird"] },
    "Larry Bird",
    "1979-1992",
    "SF / PF",
    ["3连MVP", "3冠", "冷血射手"],
    honors({ championships: 3, mvps: 3, finalsMvps: 2, allStars: 12, allNba: 10, allDefense: 3, roy: 1, hallOfFame: 1, nba75: 1 }),
    totals({ games: 897, points: 21791, rebounds: 8974, assists: 5695, steals: 1556, blocks: 755, ppg: 24.3, rpg: 10.0, apg: 6.3, playoffPoints: 3897, playoffRebounds: 1683, playoffAssists: 1062 }),
    { dangerLevel: 98, clutch: 98, legacy: 99, celticsAura: 98 },
    ["连续三年 MVP 是历史级履历，也是跨时代荣誉对比里的高权重筹码。"],
    ["伯德先把话说完，再让数据替他补刀。", "这不是垃圾话，是附带伤害的预告。"]
  ),
  legend(
    { rank: 6, sourcePath: "r/russebi01.html", aliases: ["拉塞尔", "指环王", "Bill Russell"] },
    "Bill Russell",
    "1956-1969",
    "C",
    ["11冠王", "5x MVP", "防守王朝"],
    honors({ championships: 11, mvps: 5, allStars: 12, allNba: 11, reboundTitles: 4, hallOfFame: 1, nba75: 1 }),
    totals({ games: 963, points: 14522, rebounds: 21620, assists: 4100, steals: null, blocks: null, ppg: 15.1, rpg: 22.5, apg: 4.3, playoffPoints: 2673, playoffRebounds: 4104, playoffAssists: 770 }),
    { dangerLevel: 100, clutch: 97, legacy: 100, celticsAura: 100 },
    ["11 次总冠军让任何荣誉模型都必须认真处理他的冠军权重。"],
    ["拉塞尔打开戒指盒，球场灯光都被反射扣血。", "这一回合不是单挑，是王朝压境。"]
  ),
  legend(
    { rank: 7, sourcePath: "a/abdulka01.html", aliases: ["贾巴尔", "天勾", "Kareem"] },
    "Kareem Abdul-Jabbar",
    "1969-1989",
    "C",
    ["6冠", "6x MVP", "天勾"],
    honors({ championships: 6, mvps: 6, finalsMvps: 2, allStars: 19, allNba: 15, allDefense: 11, scoringTitles: 2, reboundTitles: 1, roy: 1, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1560, points: 38387, rebounds: 17440, assists: 5660, steals: 1160, blocks: 3189, ppg: 24.6, rpg: 11.2, apg: 3.6, playoffPoints: 5762, playoffRebounds: 2481, playoffAssists: 767 }),
    { dangerLevel: 99, clutch: 96, legacy: 100, celticsAura: 45 },
    ["6 个 MVP 是常规赛最高荣誉的顶格筹码，生涯长度也极其惊人。"],
    ["天勾抬手，荣誉模型只能仰头看。", "贾巴尔的履历不是一页，是一卷。"]
  ),
  legend(
    { rank: 8, sourcePath: "c/chambwi01.html", aliases: ["张伯伦", "Wilt", "篮球皇帝"] },
    "Wilt Chamberlain",
    "1959-1973",
    "C",
    ["2冠", "4x MVP", "数据怪兽"],
    honors({ championships: 2, mvps: 4, finalsMvps: 1, allStars: 13, allNba: 10, allDefense: 2, scoringTitles: 7, reboundTitles: 11, assistTitles: 1, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1045, points: 31419, rebounds: 23924, assists: 4643, steals: null, blocks: null, ppg: 30.1, rpg: 22.9, apg: 4.4, playoffPoints: 3607, playoffRebounds: 3913, playoffAssists: 673 }),
    { dangerLevel: 99, clutch: 92, legacy: 98, celticsAura: 30 },
    ["个人数据和单项王数量夸张，和冠军权重之间的争议非常适合 agent 分析。"],
    ["张伯伦的数据一出现，记分牌先申请加宽。", "这一击像 100 分之夜的余震。"]
  ),
  legend(
    { rank: 9, sourcePath: "o/onealsh01.html", aliases: ["奥尼尔", "鲨鱼", "Shaq"] },
    "Shaquille O'Neal",
    "1992-2011",
    "C",
    ["4冠", "3连FMVP", "禁区怪物"],
    honors({ championships: 4, mvps: 1, finalsMvps: 3, allStars: 15, allNba: 14, allDefense: 3, scoringTitles: 2, roy: 1, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1207, points: 28596, rebounds: 13099, assists: 3026, steals: 739, blocks: 2732, ppg: 23.7, rpg: 10.9, apg: 2.5, playoffPoints: 5250, playoffRebounds: 2508, playoffAssists: 582 }),
    { dangerLevel: 98, clutch: 94, legacy: 97, celticsAura: 36 },
    ["三连 FMVP 让他的巅峰统治力在荣誉值里极其突出。"],
    ["鲨鱼沉到低位，连 HP 条都开始后退。", "这不是技能动画，这是禁区施工。"]
  ),
  legend(
    { rank: 10, sourcePath: "d/duncati01.html", aliases: ["邓肯", "石佛", "Tim Duncan"] },
    "Tim Duncan",
    "1997-2016",
    "PF / C",
    ["5冠", "2x MVP", "稳定王朝"],
    honors({ championships: 5, mvps: 2, finalsMvps: 3, allStars: 15, allNba: 15, allDefense: 15, roy: 1, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1392, points: 26496, rebounds: 15091, assists: 4225, steals: 1025, blocks: 3020, ppg: 19.0, rpg: 10.8, apg: 3.0, playoffPoints: 5172, playoffRebounds: 2859, playoffAssists: 764 }),
    { dangerLevel: 97, clutch: 96, legacy: 98, celticsAura: 34 },
    ["冠军、FMVP、一阵和防守阵容数量都非常均衡，是荣誉模型里的稳定高分型球员。"],
    ["邓肯没有表情，但伤害结算很有礼貌。", "石佛一动不动，分差自己动了。"]
  ),
  legend(
    { rank: 11, sourcePath: "d/duranke01.html", aliases: ["杜兰特", "KD", "死神"] },
    "Kevin Durant",
    "2007-至今",
    "SF / PF",
    ["2冠2FMVP", "MVP", "得分机器"],
    honors({ championships: 2, mvps: 1, finalsMvps: 2, allStars: 15, allNba: 11, scoringTitles: 4, roy: 1, nba75: 1 }),
    totals({ games: 1128, points: 30571, rebounds: 7949, assists: 5069, steals: 1191, blocks: 1234, ppg: 27.1, rpg: 7.0, apg: 4.5, playoffPoints: 4985, playoffRebounds: 1240, playoffAssists: 747 }),
    { dangerLevel: 96, clutch: 94, legacy: 94, celticsAura: 24 },
    ["高场均得分与 2 个 FMVP 是核心卖点，队友与路径争议也常被讨论。"],
    ["KD 的出手点太高，防守和争论都够不到。", "死神镰刀一挥，荣誉栏直接掉帧。"]
  ),
  legend(
    { rank: 12, sourcePath: "o/olajuha01.html", aliases: ["奥拉朱旺", "大梦", "Hakeem"] },
    "Hakeem Olajuwon",
    "1984-2002",
    "C",
    ["2冠2FMVP", "MVP+DPOY", "梦幻脚步"],
    honors({ championships: 2, mvps: 1, finalsMvps: 2, allStars: 12, allNba: 12, allDefense: 9, reboundTitles: 2, dpoy: 2, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1238, points: 26946, rebounds: 13748, assists: 3058, steals: 2162, blocks: 3830, ppg: 21.8, rpg: 11.1, apg: 2.5, playoffPoints: 3755, playoffRebounds: 1621, playoffAssists: 458 }),
    { dangerLevel: 95, clutch: 95, legacy: 95, celticsAura: 20 },
    ["1994 年同季 MVP、DPOY、FMVP 的履历很硬，攻防荣誉都完整。"],
    ["大梦一转身，防守者和血条都迷路了。", "梦幻脚步不是脚步，是判定范围。"]
  ),
  legend(
    { rank: 13, sourcePath: "r/roberos01.html", aliases: ["大O", "罗伯特森", "Oscar"] },
    "Oscar Robertson",
    "1960-1974",
    "PG",
    ["三双先驱", "MVP", "冠军控卫"],
    honors({ championships: 1, mvps: 1, allStars: 12, allNba: 11, assistTitles: 6, roy: 1, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1040, points: 26710, rebounds: 7804, assists: 9887, steals: 77, blocks: 4, ppg: 25.7, rpg: 7.5, apg: 9.5, playoffPoints: 1910, playoffRebounds: 633, playoffAssists: 769 }),
    { dangerLevel: 91, clutch: 90, legacy: 94, celticsAura: 25 },
    ["三双和全能控卫叙事非常强，荣誉厚度主要集中在 MVP、全明星和最佳阵容。"],
    ["大 O 把数据填满，表格看起来都更紧了。", "这一回合不是三双，却很像三面夹击。"]
  ),
  legend(
    { rank: 14, sourcePath: "w/westje01.html", aliases: ["韦斯特", "Logo男", "Jerry West"] },
    "Jerry West",
    "1960-1974",
    "PG / SG",
    ["Logo", "FMVP", "关键先生"],
    honors({ championships: 1, finalsMvps: 1, allStars: 14, allNba: 12, allDefense: 5, scoringTitles: 1, assistTitles: 1, hallOfFame: 1, nba75: 1 }),
    totals({ games: 932, points: 25192, rebounds: 5366, assists: 6238, steals: 81, blocks: 23, ppg: 27.0, rpg: 5.8, apg: 6.7, playoffPoints: 4457, playoffRebounds: 855, playoffAssists: 970 }),
    { dangerLevel: 91, clutch: 96, legacy: 94, celticsAura: 46 },
    ["FMVP、最佳阵容和关键球声誉很强，冠军数量是常见争议点。"],
    ["Logo 男一出手，连图标都像在压迫防线。", "韦斯特的关键先生标签开始发烫。"]
  ),
  legend(
    { rank: 15, sourcePath: "e/ervinju01.html", aliases: ["欧文博士", "J博士", "Dr. J", "Julius Erving"] },
    "Julius Erving",
    "1971-1987",
    "SF",
    ["J博士", "冠军", "飞翔美学"],
    honors({ championships: 1, mvps: 1, allStars: 11, allNba: 7, hallOfFame: 1, nba75: 1 }),
    totals({ games: 836, points: 18364, rebounds: 5601, assists: 3224, steals: 1508, blocks: 1293, ppg: 22.0, rpg: 6.7, apg: 3.9, playoffPoints: 3088, playoffRebounds: 920, playoffAssists: 594 }),
    { dangerLevel: 90, clutch: 91, legacy: 93, celticsAura: 38 },
    ["NBA 荣誉之外还有 ABA 履历，本地模型会主要按 NBA 结构化荣誉保守计分。"],
    ["J 博士起飞之后，地心引力也只能旁观。", "这一扣不是扣篮，是时代审美攻击。"]
  ),
  legend(
    { rank: 16, sourcePath: "m/malonmo01.html", aliases: ["摩西马龙", "Moses"] },
    "Moses Malone",
    "1974-1995",
    "C",
    ["3x MVP", "FMVP", "篮板机器"],
    honors({ championships: 1, mvps: 3, finalsMvps: 1, allStars: 12, allNba: 8, allDefense: 2, reboundTitles: 6, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1329, points: 27409, rebounds: 16212, assists: 1796, steals: 1089, blocks: 1733, ppg: 20.6, rpg: 12.2, apg: 1.4, playoffPoints: 2077, playoffRebounds: 1212, playoffAssists: 157 }),
    { dangerLevel: 92, clutch: 92, legacy: 94, celticsAura: 22 },
    ["3 个 MVP 和篮板王数量让他的荣誉值常被低估后重新抬高。"],
    ["摩西马龙一抢前场板，对面像要再防一局。", "这一击来自篮板深处。"]
  ),
  legend(
    { rank: 17, sourcePath: "j/jokicni01.html", aliases: ["约基奇", "小丑", "Jokic"] },
    "Nikola Jokic",
    "2015-至今",
    "C",
    ["3x MVP", "FMVP", "组织中锋"],
    honors({ championships: 1, mvps: 3, finalsMvps: 1, allStars: 7, allNba: 7, nba75: 0 }),
    totals({ games: 745, points: 16140, rebounds: 8109, assists: 5621, steals: 919, blocks: 529, ppg: 21.7, rpg: 10.9, apg: 7.5, playoffPoints: 2167, playoffRebounds: 1056, playoffAssists: 725 }),
    { dangerLevel: 94, clutch: 94, legacy: 91, celticsAura: 18 },
    ["现役荣誉仍在增长，3 个 MVP 已经让他的历史排名争论快速升温。"],
    ["约基奇慢悠悠一传，战术突然变成谜题。", "小丑不加速，但结算很快。"]
  ),
  legend(
    { rank: 18, sourcePath: "a/antetgi01.html", aliases: ["字母哥", "Giannis", "阿德托昆博"] },
    "Giannis Antetokounmpo",
    "2013-至今",
    "PF",
    ["2x MVP", "FMVP", "DPOY"],
    honors({ championships: 1, mvps: 2, finalsMvps: 1, allStars: 9, allNba: 9, allDefense: 5, dpoy: 1, nba75: 1 }),
    totals({ games: 859, points: 20599, rebounds: 8384, assists: 4207, steals: 990, blocks: 1047, ppg: 24.0, rpg: 9.8, apg: 4.9, playoffPoints: 2201, playoffRebounds: 1036, playoffAssists: 481 }),
    { dangerLevel: 93, clutch: 91, legacy: 91, celticsAura: 20 },
    ["MVP、FMVP、DPOY 三件套很完整，现役后续荣誉仍可能改变排序。"],
    ["字母哥从三分线起步，血条从禁区开始紧张。", "这一回合全是长臂带来的压迫感。"]
  ),
  legend(
    { rank: 19, sourcePath: "g/garneke01.html", aliases: ["加内特", "KG", "狼王"] },
    "Kevin Garnett",
    "1995-2016",
    "PF / C",
    ["MVP", "DPOY", "冠军防线"],
    honors({ championships: 1, mvps: 1, allStars: 15, allNba: 9, allDefense: 12, dpoy: 1, hallOfFame: 1, nba75: 1 }),
    totals({ games: 1462, points: 26071, rebounds: 14662, assists: 5445, steals: 1859, blocks: 2037, ppg: 17.8, rpg: 10.0, apg: 3.7, playoffPoints: 2601, playoffRebounds: 1534, playoffAssists: 471 }),
    { dangerLevel: 90, clutch: 90, legacy: 93, celticsAura: 87 },
    ["防守阵容、DPOY 和 MVP 让他在攻防均衡模型里很有优势。"],
    ["KG 一吼，手动按钮都像被贴防。", "狼王上线，场上空气立刻变硬。"]
  )
];

export const opponentPlayers = legendPlayers;

export const allPlayers = [lebronJames, ...legendPlayers, ...celticsPlayers];
