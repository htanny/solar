// @ts-check
export var TAU=6.2832;
export var SRR=695,DK=0.08,SK=0.18,TRAIL_LEN=200;
export var J2000=946728000000;/* ms */

/* Canonical Kepler solver — the single source of truth for orbital position.
   Solves M = E − e·sinE by fixed-point iteration and returns both the eccentric
   anomaly E (needed for r = a(1−e·cosE)) and the true anomaly nu.
   8 iterations are enough for every eccentricity in this dataset (max e=0.967 Halley);
   all call sites (orbitState, comets, asteroids, spacecraft, orbital-element panel)
   share this function so rendered positions and computed elements always agree. */
export function solveKepler(M,e){
  var E=M;for(var k=0;k<8;k++){E=M+e*Math.sin(E);}
  return {E:E,nu:2*Math.atan2(Math.sqrt(1+e)*Math.sin(E*0.5),Math.sqrt(1-e)*Math.cos(E*0.5))};
}

/* Kepler orbit state for a body (with optional ecc/peri fields) at sim-time t (days).
   Mean longitude L=(t/p)·2π preserves the old circular timing; for ecc=0 theta reduces
   to L exactly. Returns true anomaly nu, radius factor rf=r/a, and ecliptic angle theta. */
export function orbitState(pl,t){
  var e=pl.ecc||0,peri=(pl.peri||0)*0.0174533;
  if(e===0)return {nu:(t/pl.p)*TAU-peri,rf:1,theta:(t/pl.p)*TAU};
  var nu=solveKepler((t/pl.p)*TAU-peri,e).nu;
  return {nu:nu,rf:(1-e*e)/(1+e*Math.cos(nu)),theta:nu+peri};
}

export var PL=[
  {n:"Mercury",j:"水星",d:58,r:2.4,p:88,ecc:0.206,peri:77.5,c:"rgba(180,180,180,1)",t:0.03,rot:58.6,type:"rock",mass:"3.30×10²³ kg",grav:"3.7 m/s²",moons:0,day:"58.6日",year:"88日",atm:"ほぼ無し",temp:"−180〜430℃",dens:"5.43",esc:"4.3",alb:0.068},
  {n:"Venus",j:"金星",d:108,r:6.0,p:225,ecc:0.007,peri:131.5,c:"rgba(230,180,80,1)",t:177.4,rot:-243,type:"venus",mass:"4.87×10²⁴ kg",grav:"8.9 m/s²",moons:0,day:"243日(逆行)",year:"225日",atm:"CO₂ 96%",temp:"約462℃",dens:"5.24",esc:"10.4",alb:0.65},
  {n:"Earth",j:"地球",d:150,r:6.4,p:365,ecc:0.017,peri:102.9,c:"rgba(70,130,230,1)",t:23.4,rot:1,type:"earth",mass:"5.97×10²⁴ kg",grav:"9.8 m/s²",moons:1,day:"24時間",year:"365.25日",atm:"N₂ 78% O₂ 21%",temp:"平均15℃",dens:"5.51",esc:"11.2",alb:0.37},
  {n:"Mars",j:"火星",d:228,r:3.4,p:687,ecc:0.093,peri:336.0,c:"rgba(210,100,60,1)",t:25.2,rot:1.03,type:"mars",mass:"6.42×10²³ kg",grav:"3.7 m/s²",moons:2,day:"24.6時間",year:"687日",atm:"CO₂ 95%",temp:"平均−63℃",dens:"3.93",esc:"5.0",alb:0.15},
  {n:"Jupiter",j:"木星",d:778,r:71.5,p:4333,ecc:0.048,peri:14.3,c:"rgba(210,170,110,1)",t:3.1,rot:0.41,type:"gas1",mass:"1.90×10²⁷ kg",grav:"24.8 m/s²",moons:95,day:"9.9時間",year:"11.9年",atm:"H₂ 90% He 10%",temp:"−110℃",dens:"1.33",esc:"59.5",alb:0.52},
  {n:"Saturn",j:"土星",d:1427,r:60.3,p:10759,ecc:0.056,peri:93.1,c:"rgba(220,200,150,1)",t:26.7,rot:0.44,type:"gas2",mass:"5.68×10²⁶ kg",grav:"10.4 m/s²",moons:146,day:"10.7時間",year:"29.5年",atm:"H₂ 96% He 3%",temp:"−140℃",dens:"0.69",esc:"35.5",alb:0.47},
  {n:"Uranus",j:"天王星",d:2871,r:25.6,p:30687,ecc:0.046,peri:173.0,c:"rgba(150,220,230,1)",t:97.8,rot:-0.72,type:"ice1",mass:"8.68×10²⁵ kg",grav:"8.9 m/s²",moons:28,day:"17.2時間(逆行)",year:"84年",atm:"H₂ 83% He 15%",temp:"−195℃",dens:"1.27",esc:"21.3",alb:0.51},
  {n:"Neptune",j:"海王星",d:4495,r:24.8,p:60190,ecc:0.009,peri:48.1,c:"rgba(60,100,220,1)",t:28.3,rot:0.67,type:"ice2",mass:"1.02×10²⁶ kg",grav:"11.2 m/s²",moons:16,day:"16.1時間",year:"165年",atm:"H₂ 80% He 19%",temp:"−200℃",dens:"1.64",esc:"23.5",alb:0.41},
];
export var SUNINFO={j:"太陽",mass:"1.99×10³⁰ kg",r:"69.6万km",temp:"表面5,500℃ / 中心1,500万℃",type:"G型主系列星",age:"約46億年",dens:"1.41",esc:"617.7"};
export var MD={oR:18,r:2.5,p:27.3,rd:0.384,rr:1.737};
/* Moon as a landing target: d=150 (~1 AU), p=365.25 (yr), rot=27.32 (sidereal) → solar day ≈ 29.5d */
export var MOON_INFO={n:"Moon",j:"月",e:"Moon",d:150,r:1.737,p:365.25,c:"rgba(200,200,200,1)",t:6.68,rot:27.32,type:"moon",mass:"7.34×10²² kg",grav:"1.62 m/s²",moons:0,day:"29.5日(太陽日)",year:"27.3日(公転)",atm:"なし(真空)",temp:"−173〜+127℃",distEarth:"38.44万km",synPeriod:"29.53日",discovery:"有史以前",landingsInfo:"アポロ11号(1969)〜17号(1972)",dens:"3.34",esc:"2.4",alb:0.12};
/* Apollo manned lunar landing sites (lat/lng in degrees on Moon) */
export var APOLLO_SITES=[
  {n:"Apollo 11",lat:0.67,lng:23.47,date:"1969-07",region:"静かの海",crew:"Armstrong & Aldrin"},
  {n:"Apollo 12",lat:-3.01,lng:-23.42,date:"1969-11",region:"嵐の大洋",crew:"Conrad & Bean"},
  {n:"Apollo 14",lat:-3.65,lng:-17.47,date:"1971-02",region:"フラ・マウロ",crew:"Shepard & Mitchell"},
  {n:"Apollo 15",lat:26.13,lng:3.63,date:"1971-07",region:"ハドリー・アペニン",crew:"Scott & Irwin"},
  {n:"Apollo 16",lat:-8.97,lng:15.50,date:"1972-04",region:"デカルト高地",crew:"Young & Duke"},
  {n:"Apollo 17",lat:20.19,lng:30.77,date:"1972-12",region:"タウルス・リトロー",crew:"Cernan & Schmitt"}
];
/* Major near-side maria (lat/lng deg, ellipse radii deg) — used for HUD mini-map */
export var LUNAR_MARIA=[
  {n:"静かの海",lat:8,lng:31,rLng:13,rLat:7},
  {n:"雨の海",lat:33,lng:-15,rLng:17,rLat:9},
  {n:"危難の海",lat:17,lng:58,rLng:9,rLat:7},
  {n:"嵐の大洋",lat:18,lng:-57,rLng:18,rLat:12},
  {n:"晴れの海",lat:28,lng:18,rLng:8,rLat:6}
];
/* Mars landmarks — IAU longitudes normalized to -180..+180 */
export var MARS_LANDMARKS=[
  {n:"オリンポス山",en:"Olympus Mons",lat:18.4,lng:-133.8,type:"volcano",info:"太陽系最高峰 高さ21km 直径600km"},
  {n:"マリナリス渓谷",en:"Valles Marineris",lat:-13.9,lng:-59.2,type:"canyon",info:"全長4000km 深さ7km 幅200km — 太陽系最大峡谷"},
  {n:"ヘラス平原",en:"Hellas Planitia",lat:-42.7,lng:70.5,type:"basin",info:"直径2300km 深さ7km — 太陽系最大の衝突盆地"},
  {n:"タルシス地域",en:"Tharsis",lat:1.0,lng:-101.0,type:"volcanic",info:"巨大火山台地 高度4km 直径5000km"},
  {n:"エリシウム山",en:"Elysium Mons",lat:25.0,lng:147.2,type:"volcano",info:"タルシス次の大火山 高さ13.9km"},
  {n:"パーサヴィアランス",en:"Perseverance",lat:18.4,lng:77.5,type:"rover",info:"ジェゼロクレーター 2021年着陸 NASAサンプルリターン"},
  {n:"キュリオシティ",en:"Curiosity",lat:-4.6,lng:137.4,type:"rover",info:"ゲールクレーター 2012年着陸 NASAマーズサイエンスラボ"},
  {n:"バイキング1号",en:"Viking 1",lat:22.27,lng:-47.94,type:"rover",info:"クリセ平原 1976年着陸 NASA初の火星軟着陸"},
  {n:"バイキング2号",en:"Viking 2",lat:47.97,lng:134.26,type:"rover",info:"ウトピア平原 1976年着陸 NASA"},
  {n:"パスファインダー",en:"Pathfinder",lat:19.13,lng:-33.22,type:"rover",info:"アレス・ヴァリス 1997年着陸 ソジャーナ搭載"},
  {n:"インサイト",en:"InSight",lat:4.5,lng:135.9,type:"rover",info:"エリシウム平原 2018年着陸 地震計・熱流量計"},
  {n:"祝融",en:"Zhurong",lat:25.07,lng:109.91,type:"rover",info:"ユートピア平原 2021年着陸 中国初の火星ローバー"},
  {n:"北極冠",en:"North Polar Cap",lat:87.0,lng:0.0,type:"ice",info:"CO₂と水の氷 夏に縮小 冬に拡大"},
  {n:"南極冠",en:"South Polar Cap",lat:-87.0,lng:0.0,type:"ice",info:"恒久的な水の氷を保持 CO₂の乾燥氷の層"}
];
/* Venus surface landers (lat N, lng in -180..+180) */
export var VENUS_LANDERS=[
  {n:"ベネラ4号",en:"Venera 4",lat:19.0,lng:38.0,date:"1967-10",info:"初の金星大気in-situ計測 ソビエト探査機"},
  {n:"ベネラ7号",en:"Venera 7",lat:-5.25,lng:-9.0,date:"1970-12",info:"初の他惑星表面からの信号送信 23分稼働"},
  {n:"ベネラ9号",en:"Venera 9",lat:31.7,lng:-68.4,date:"1975-10",info:"初の金星表面写真撮影 53分稼働"},
  {n:"ベネラ13号",en:"Venera 13",lat:-7.5,lng:-57.0,date:"1982-03",info:"127分間稼働 カラー写真撮影"},
  {n:"ベネラ14号",en:"Venera 14",lat:-13.25,lng:-49.9,date:"1982-03",info:"57分稼働 玄武岩質岩盤を確認"},
];
/* Mercury surface/impact sites */
export var MERCURY_SITES=[
  {n:"MESSENGER",en:"MESSENGER",lat:72.2,lng:-28.3,date:"2015-04",info:"NASA水星探査機 4年間観測後に北極近くに衝突"},
];
export var GMOONS=[{name:"イオ",sz:3,orbR:421.7,r:1821,p:1.769,col:"rgba(220,200,100,1)"},{name:"エウロパ",sz:2.5,orbR:671.0,r:1560,p:3.551,col:"rgba(180,170,150,1)"},{name:"ガニメデ",sz:4,orbR:1070.4,r:2634,p:7.155,col:"rgba(160,155,140,1)"},{name:"カリスト",sz:3.5,orbR:1882.7,r:2410,p:16.689,col:"rgba(130,125,115,1)"}];
export var COMETS=[
  {key:"Halley",name:"ハレー彗星",a:17.8*150,ecc:0.967,p:27484,inc:0.05,col:[140,200,255],sz:1.5,tailLen:80,phase0:0.0,info:"周期: 約75.3年\n離心率: 0.967\n近日点: 0.586 AU\n遠日点: 35.1 AU\n発見: 紀元前240年（記録）\nエドモンド・ハレーが周期性を予言"},
  {key:"Encke",name:"エンケ彗星",a:2.22*150,ecc:0.848,p:1204,inc:-0.03,col:[180,220,200],sz:1,tailLen:40,phase0:0.35,info:"周期: 約3.3年\n離心率: 0.848\n近日点: 0.336 AU\n遠日点: 4.09 AU\n既知の彗星で最短周期"},
  {key:"67P",name:"67P/チュリュモフ・ゲラシメンコ",a:3.46*150,ecc:0.641,p:2353,inc:0.12,col:[170,210,180],sz:1,tailLen:30,phase0:0.7,info:"周期: 約6.44年\n離心率: 0.641\n近日点: 1.24 AU\n遠日点: 5.68 AU\n発見: 1969年\nロゼッタ探査機が2014年に周回・フィラエ着陸"},
];
export var PL_MAP={};PL.forEach(function(p){PL_MAP[p.n]=p;});
export var COMET_MAP={};COMETS.forEach(function(c){COMET_MAP[c.key]=c;});
export var DWARFS=[
  {n:"Ceres",j:"ケレス",e:"Ceres",d:414,r:0.47,p:1682,ecc:0.076,peri:73.6,c:"rgba(155,150,143,1)",t:4.0,rot:0.378,type:"rock",mass:"9.39×10²⁰ kg",grav:"0.28 m/s²",moons:0,day:"9.1時間",year:"4.6年",atm:"なし",temp:"約−105℃",dens:"2.16",esc:"0.51",alb:0.09},
  {n:"Pluto",j:"冥王星",e:"Pluto",d:5906,r:1.19,p:90560,ecc:0.249,peri:224.1,c:"rgba(200,185,165,1)",t:122.5,rot:6.39,type:"rock",mass:"1.30×10²² kg",grav:"0.62 m/s²",moons:5,day:"6.39日",year:"248年",atm:"N₂ 微量",temp:"約−230℃",dens:"1.85",esc:"1.2",alb:0.49},
  {n:"Eris",j:"エリス",e:"Eris",d:10120,r:1.16,p:203830,ecc:0.44,peri:151.0,c:"rgba(185,185,188,1)",t:44.0,rot:1.08,type:"rock",mass:"1.66×10²² kg",grav:"0.82 m/s²",moons:1,day:"25.9時間",year:"558年",atm:"なし",temp:"約−240℃",dens:"2.43",esc:"1.4",alb:0.96},
];
export var DWARF_MAP={};DWARFS.forEach(function(p){DWARF_MAP[p.n]=p;});
/* Register Moon in PL_MAP so it works with focus/landing/info systems uniformly */
PL_MAP["Moon"]=MOON_INFO;
/* Pre-parse "rgba(R,G,B,A)" → "R,G,B" once at module load (used in render hot path) */
PL.concat(DWARFS).forEach(function(p){var m=p.c.match(/(\d+),(\d+),(\d+)/);p.cRGB=m?m[1]+","+m[2]+","+m[3]:null;});

/* Major moons keyed by parent planet (Earth's Moon and Galilean moons handled separately).
   orbR in 1000 km, p in days (negative = retrograde), r in km. */
export var EXTRA_MOONS={
  Mars:[
    {name:"フォボス",sz:1.5,orbR:9.4,r:11,p:0.319,col:"rgba(140,120,105,1)"},
    {name:"ダイモス",sz:1.2,orbR:23.5,r:6,p:1.262,col:"rgba(150,135,118,1)"}
  ],
  Saturn:[
    {name:"タイタン",sz:3.5,orbR:1222,r:2575,p:15.95,col:"rgba(220,170,90,1)"},
    {name:"エンケラドゥス",sz:1.5,orbR:238,r:252,p:1.37,col:"rgba(240,245,250,1)"},
    {name:"ミマス",sz:1.3,orbR:185,r:198,p:0.94,col:"rgba(220,220,210,1)"},
    {name:"レア",sz:2.2,orbR:527,r:764,p:4.52,col:"rgba(195,190,180,1)"},
    {name:"イアペトゥス",sz:2,orbR:3561,r:735,p:79.32,col:"rgba(150,140,120,1)"}
  ],
  Uranus:[
    {name:"ミランダ",sz:1.3,orbR:129.9,r:236,p:1.41,col:"rgba(180,180,185,1)"},
    {name:"ティタニア",sz:2,orbR:436.3,r:789,p:8.71,col:"rgba(170,165,160,1)"},
    {name:"オベロン",sz:1.9,orbR:583.5,r:761,p:13.46,col:"rgba(160,150,140,1)"}
  ],
  Neptune:[
    {name:"トリトン",sz:2.5,orbR:354.8,r:1353,p:-5.876,col:"rgba(220,210,195,1)"}
  ],
  Pluto:[
    {name:"カロン",sz:2,orbR:19.59,r:606,p:6.387,col:"rgba(180,165,150,1)"}
  ]
};

/* Named asteroids — orbital elements in AU/years, displayed as named dots in belt */
export var NAMED_ASTEROIDS=[
  {n:"Vesta",j:"ベスタ",a:2.36,ecc:0.089,p:1325,inc:0.125,col:"rgba(220,210,180,1)",info:"4 Vesta — 小惑星帯第2の大きさ・玄武岩質"},
  {n:"Pallas",j:"パラス",a:2.77,ecc:0.231,p:1684,inc:0.609,col:"rgba(180,180,170,1)",info:"2 Pallas — 軌道傾斜角が大きい・氷岩質"},
  {n:"Eros",j:"エロス",a:1.46,ecc:0.222,p:643,inc:0.193,col:"rgba(190,150,120,1)",info:"433 Eros — 地球近傍小惑星・NEAR探査機が着陸"},
  {n:"Itokawa",j:"イトカワ",a:1.32,ecc:0.28,p:556,inc:0.030,col:"rgba(170,140,110,1)",info:"25143 Itokawa — はやぶさが試料採取した小惑星"}
];

/* Spacecraft trajectories — simplified linear post-launch or elliptical */
/* launchD = J2000-relative day. linear: pos = (dx,dy,dz)*speed*(t-launchD) sim units */
export var SPACECRAFT=[
  {key:"Voyager1",name:"ボイジャー1号",launchD:-8154,col:"rgba(255,200,80,1)",type:"linear",dx:0.60,dy:0.30,dz:0.74,speed:1.46,info:"1977年打ち上げ・最も遠い人工物・地球から167 AU"},
  {key:"Voyager2",name:"ボイジャー2号",launchD:-8170,col:"rgba(255,180,100,1)",type:"linear",dx:-0.40,dy:-0.55,dz:-0.74,speed:1.22,info:"1977年打ち上げ・唯一天王星/海王星を探査"},
  {key:"NewHorizons",name:"ニュー・ホライズンズ",launchD:2210,col:"rgba(180,255,200,1)",type:"linear",dx:0.40,dy:0.0,dz:0.92,speed:1.28,info:"2006年打ち上げ・2015年冥王星接近通過"},
  {key:"Parker",name:"パーカー・ソーラー",launchD:6798,col:"rgba(255,160,80,1)",type:"elliptical",a:58.1,ecc:0.893,p:88,phase0:0,inc:0.07,info:"2018年打ち上げ・太陽コロナへ最接近"}
];

/* Lagrange points — 5 equilibrium positions in Earth-Sun system */
export var LAGRANGE=[
  {n:"L1",info:"地球-太陽 L1（150万km太陽側）SOHO等"},
  {n:"L2",info:"地球-太陽 L2（150万km反太陽側）JWST等"},
  {n:"L3",info:"地球-太陽 L3（太陽の反対側）"},
  {n:"L4",info:"地球-太陽 L4（地球の60°前方・トロヤ群）"},
  {n:"L5",info:"地球-太陽 L5（地球の60°後方）"}
];


export var FL=[{k:"all",l:"全体",e:"All"},{k:"sun",l:"太陽",e:"Sun"},{k:"Mercury",l:"水星",e:"Mercury"},{k:"Venus",l:"金星",e:"Venus"},{k:"Earth",l:"地球",e:"Earth"},{k:"Moon",l:"月",e:"Moon"},{k:"Mars",l:"火星",e:"Mars"},{k:"Jupiter",l:"木星",e:"Jupiter"},{k:"Saturn",l:"土星",e:"Saturn"},{k:"Uranus",l:"天王星",e:"Uranus"},{k:"Neptune",l:"海王星",e:"Neptune"},{k:"Ceres",l:"ケレス",e:"Ceres"},{k:"Pluto",l:"冥王星",e:"Pluto"},{k:"Eris",l:"エリス",e:"Eris"},{k:"Halley",l:"ハレー彗星",e:"Halley"},{k:"Encke",l:"エンケ彗星",e:"Encke"},{k:"67P",l:"67P彗星",e:"67P"}];
export var SP=[0.5,1,4,15,50,100];
export var ZS=[0.00002,0.00005,0.00012,0.0003,0.0007,0.002,0.005,0.012,0.025,0.04,0.07,0.1,0.15,0.22,0.35,0.5,0.7,1,1.5,2.2,3.5,5,8,13,22,40,70,120,200,350,600,1100,2000,4000,8000,16000,35000,70000,150000];
export var TOUR_SEQ=["sun","Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune","Halley","Encke"];
export var TOUR_NAMES=["太陽","水星","金星","地球","火星","木星","土星","天王星","海王星","ハレー彗星","エンケ彗星"];
export var TOUR_NAMES_EN=["Sun","Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune","Halley","Encke"];
export var TOUR_HOLD=6;
/* TOUR_DESC/EXAM: 既存=中級（"intermediate"）。初級/上級は別配列で提供 */
export var TOUR_DESC=["太陽系全質量の99.9%を占める恒星","最小・公転最速・昼夜の温度差最大","最高温度・逆方向に自転する惑星","液体の水と生命が存在する惑星","赤い惑星・太陽系最高峰の山を持つ","最大・最重・大赤斑は巨大な嵐","美しいリング・密度は水より軽い","自転軸が98°傾く青緑の氷惑星","計算で予測・超音速の風が吹く","約75年周期・次回接近は2061年","最短公転周期3.3年の周期彗星"];
export var TOUR_EXAM=[["主系列星（G型黄色矮星）","表面温度約5800K","半径は地球の約109倍"],["衛星なし・大気ほぼなし","1日が1年より長い","温度差は約610℃"],["表面温度約460℃（温室効果）","地球とは逆方向に自転","明けの明星・宵の明星"],["太陽系で唯一液体の水が存在","衛星1個（月）","8惑星で5番目の大きさ"],["オリンポス山：高さ約27km","衛星2個（フォボス・ダイモス）","赤色は地表の酸化鉄"],["太陽系で最大・最重の惑星","大赤斑は地球2個分の大きさ","衛星は95個以上"],["平均密度0.69g/cm³（水より軽）","リングは主に氷と岩の粒子","衛星は145個以上"],["自転軸の傾きが97.8°（横倒し）","氷惑星（メタン・水・アンモニア）","細いリングが13本"],["存在を数学的計算で予測された","風速は時速約2000km","衛星16個"],["公転周期75〜76年","前回近日点1986年・次回2061年","核の長径約15km"],["太陽系最短公転周期（3.3年）","1786年エンケが発見","核の直径約5km"]];
/* 初級ツアー: シンプルな1行紹介・キーワード3つ */
export var TOUR_DESC_BEG=["太陽系の中心・恒星","太陽に最も近い惑星","太陽系で最も熱い惑星","私たちの故郷の惑星","赤い砂漠の惑星","太陽系最大の惑星","美しい輪を持つ惑星","横倒しに回る氷の惑星","遠くて青い氷の惑星","75年周期の有名な彗星","3.3年周期の最短彗星"];
export var TOUR_EXAM_BEG=[["太陽","光と熱の源","地球の109倍"],["小さい","速い","暑い/寒い"],["雲に覆われている","重い大気","非常に熱い"],["水と生命","青い惑星","月がある"],["赤い","砂嵐","2つの月"],["巨大","ガスの惑星","大赤斑"],["美しい輪","氷の粒","145個以上の月"],["横倒し","氷の惑星","薄い輪"],["遠い","青色","強い風"],["長い尾","次は2061年","氷と塵"],["短い周期","小さな核","3.3年で回る"]];
/* 上級ツアー: 物理量・観測史を含む解説 */
export var TOUR_DESC_ADV=["主系列G2V型恒星・年齢約46億年・光度3.828×10²⁶ W","近日点歳差が一般相対論で説明された惑星","D/H比は地球の100倍以上・初期の海洋蒸発の証拠","プレートテクトニクス・磁場ダイナモを持つ唯一の岩石惑星","液体の水の証拠（ガリー・周期的斜面線）・薄い大気","木星質量＝1.898×10²⁷ kg・太陽系全惑星質量の70%以上","リング（B環）の厚みは10-100m・年齢は約1億年（若い）","赤道傾斜97.8°・季節1サイクル≈84年・極夜は42年続く","内部熱の発生機構が未解明・ボイジャー2号(1989)が唯一の接近","非重力効果が大きく軌道予測が難しい・近日点でCO/CN放出","近日点0.336 AU・直近近日点2023年10月・おうし座流星群の母天体"];
export var TOUR_EXAM_ADV=[["太陽風 400-800 km/s","太陽振動 5分振動","ニュートリノ年間 6×10¹⁰/cm²s"],["近日点歳差 43″/世紀","核内部固化・磁場存在","氷の影に水氷確認(2012)"],["大気上層 SO₂ 100ppm","クラウド頂高度 65km","表面風速 0.3-1m/s"],["コア半径 1220 km","双極子磁場 25-65μT","プレート速度 数 cm/年"],["地殻厚 平均50km","水氷北極キャップ","CO₂氷季節変動 25%"],["内部熱放射>受熱","金属水素層 80GPa","磁気圏 太陽20倍長"],["A環 B環間隙(カッシーニ)","E環 = エンケラドス起源","リング質量 = ミマス1個分"],["L点に5衛星トロヤ","オベロン・チタニア","氷火山 トリトン跡"],["大暗斑 1989-1994消滅","海王星3:2 共鳴(冥王星)","NASA計画 2030s打上"],["近日点0.586 AU","非重力減速 4日/周","太陽系起源論争"],["離心率 e=0.848","Jupiter族短周期彗星","おうし座流星群と関連"]];
export var TOUR_DESC_EN=["The star at the center of our solar system","Smallest planet, fastest orbit, extreme temperature swings","Hottest planet, rotates backward","The only planet with liquid water and life","The Red Planet, home of the tallest mountain","Largest and most massive, Great Red Spot is a vast storm","Beautiful rings, density lower than water","Tilted 98°, blue-green ice giant","Predicted by math, supersonic winds","~75-year period, next return in 2061","Shortest periodic comet (3.3 yr)"];
export var TOUR_EXAM_EN=[["G-type main-sequence star","Surface temp ~5800 K","Radius ~109× Earth"],["No moons, almost no atmosphere","Day longer than year","~610°C temperature range"],["Surface ~460°C (greenhouse)","Rotates retrograde","Morning/evening star"],["Only world with surface water","One moon","5th largest planet"],["Olympus Mons: ~27 km tall","Two moons (Phobos, Deimos)","Red color from iron oxide"],["Largest, most massive","Great Red Spot ~2× Earth","95+ moons"],["Density 0.69 g/cm³ (floats!)","Rings: ice + rock","145+ moons"],["Axial tilt 97.8°","Methane-water-ammonia ice","13 narrow rings"],["Predicted mathematically","Winds up to ~2000 km/h","16 moons"],["Period 75-76 years","Last perihelion 1986, next 2061","Nucleus ~15 km long"],["Shortest period (3.3 yr)","Discovered by Encke (1786)","Nucleus ~5 km wide"]];
export var LAND_SP=[
  {v:1/86400,l:"実速"},{v:60/86400,l:"1分/s"},
  {v:3600/86400,l:"1時/s"},{v:1,l:"1日/s"},
  {v:30,l:"1月/s"},{v:365,l:"1年/s"}
];
export var MAP_CTNS=[
  [[10,-35],[36,-35],[52,-8],[55,12],[42,37],[18,37],[2,32],[-5,22],[-18,15],[-18,-5],[10,-35]],
  [[-10,35],[40,35],[40,52],[28,60],[20,71],[5,71],[-5,62],[-10,52],[-10,35]],
  [[25,5],[100,5],[145,12],[150,50],[145,62],[90,75],[50,75],[25,65],[25,5]],
  [[-170,65],[-55,65],[-52,47],[-52,10],[-80,8],[-90,22],[-120,5],[-170,40],[-170,65]],
  [[-82,12],[-35,5],[-34,-30],[-52,-56],[-70,-56],[-82,12]],
  [[114,-10],[154,-10],[154,-39],[114,-39]],
  [[-72,60],[-18,60],[-18,84],[-72,82]],
  [[-180,-65],[180,-65],[180,-90],[-180,-90]],
];
export var NAMED_STARS=[
  {n:"シリウス",    ra:101.3,dec:-16.7,col:"rgba(200,220,255,"},
  {n:"カノープス",  ra:95.9, dec:-52.7,col:"rgba(255,255,220,"},
  {n:"アークトゥルス",ra:213.9,dec:19.2,col:"rgba(255,220,150,"},
  {n:"ベガ",        ra:279.2,dec:38.8, col:"rgba(220,230,255,"},
  {n:"カペラ",      ra:79.2, dec:46.0, col:"rgba(255,240,200,"},
  {n:"リゲル",      ra:78.6, dec:-8.2, col:"rgba(200,220,255,"},
  {n:"プロキオン",  ra:114.8,dec:5.2,  col:"rgba(255,250,230,"},
  {n:"ベテルギウス",ra:88.8, dec:7.4,  col:"rgba(255,180,120,"},
  {n:"アルタイル",  ra:297.7,dec:8.9,  col:"rgba(240,250,255,"},
  {n:"アルデバラン",ra:69.0, dec:16.5, col:"rgba(255,200,130,"},
  {n:"アンタレス",  ra:247.4,dec:-26.4,col:"rgba(255,160,100,"},
  {n:"スピカ",      ra:201.3,dec:-11.2,col:"rgba(200,220,255,"},
  {n:"デネブ",      ra:310.4,dec:45.3, col:"rgba(240,250,255,"},
  {n:"フォーマルハウト",ra:344.4,dec:-29.6,col:"rgba(230,240,255,"},
  {n:"北極星",      ra:37.9, dec:89.3, col:"rgba(255,255,255,"},
];
export var CONST_LINES=[
  {n:"オリオン",s:[[88.79,7.41],[78.63,-8.20],[81.28,6.35],[83.00,-0.30],[84.05,-1.20],[85.19,-1.94],[76.96,-9.67],[83.78,9.93]],
   l:[[7,0],[7,2],[0,2],[0,5],[2,3],[3,4],[4,5],[1,3],[6,5]]},
  {n:"おおぐま",s:[[165.93,61.75],[165.46,56.38],[178.46,53.69],[183.86,57.03],[193.51,55.96],[200.98,54.93],[206.89,49.31]],
   l:[[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]]},
  {n:"カシオペア",s:[[2.29,59.15],[10.13,56.54],[14.18,60.72],[21.45,60.24],[28.60,63.67]],
   l:[[0,1],[1,2],[2,3],[3,4]]},
  {n:"さそり",s:[[247.35,-26.43],[241.36,-19.81],[240.08,-22.62],[252.54,-34.29],[263.40,-37.10],[264.33,-43.00],[255.99,-39.03]],
   l:[[1,2],[2,0],[0,3],[3,6],[6,4],[4,5]]},
  {n:"しし",s:[[152.09,11.97],[177.26,14.57],[154.99,19.84],[168.53,20.52],[171.13,15.43],[146.46,23.77]],
   l:[[0,2],[2,5],[2,3],[3,4],[4,1],[0,4]]},
  {n:"はくちょう",s:[[310.36,45.28],[305.56,40.26],[292.68,27.96],[311.55,33.97],[296.24,45.13]],
   l:[[0,1],[1,2],[0,3],[4,1]]},
  {n:"みなみじゅうじ",s:[[186.65,-63.10],[191.93,-59.69],[187.79,-57.11],[183.79,-58.75]],
   l:[[0,2],[3,1]]},
  {n:"おうし",s:[[69.0,16.5],[84.41,21.14],[81.57,28.61],[56.87,24.11],[67.15,19.18]],
   l:[[0,1],[1,2],[0,4],[0,3]]},
];
export var ZODIAC=[[0,"おひつじ","♈"],[30,"おうし","♉"],[60,"ふたご","♊"],[90,"かに","♋"],
  [120,"しし","♌"],[150,"おとめ","♍"],[180,"てんびん","♎"],[210,"さそり","♏"],
  [240,"いて","♐"],[270,"やぎ","♑"],[300,"みずがめ","♒"],[330,"うお","♓"]];
export var ZODIAC_BASE=(79/365)*TAU+Math.PI;

export var SURF={
  Mercury:{atm:0,sunSz:6.7,g:"rgba(105,100,90,1)",skyTop:"0,0,0",skyBot:"5,5,8"},
  Venus:{atm:3,sunSz:1.9,g:"rgba(110,85,45,1)",skyTop:"160,120,50",skyBot:"140,100,40"},
  Earth:{atm:1,sunSz:1,g:"rgba(45,110,40,1)",skyTop:"70,140,255",skyBot:"140,190,255",skyNT:"3,5,18",skyNB:"8,15,40"},
  Mars:{atm:0.3,sunSz:0.43,g:"rgba(155,85,45,1)",skyTop:"160,110,75",skyBot:"190,140,95"},
  Jupiter:{atm:2,sunSz:0.037,g:"rgba(155,125,85,1)",skyTop:"150,120,80",skyBot:"170,140,100"},
  Saturn:{atm:2,sunSz:0.011,g:"rgba(175,155,115,1)",skyTop:"170,150,110",skyBot:"185,165,130"},
  Uranus:{atm:1.5,sunSz:0.0027,g:"rgba(130,175,180,1)",skyTop:"60,110,120",skyBot:"90,150,160"},
  Neptune:{atm:1.5,sunSz:0.0011,g:"rgba(35,55,135,1)",skyTop:"15,25,90",skyBot:"30,50,130"},
  Ceres:{atm:0,sunSz:0.13,g:"rgba(100,95,88,1)",skyTop:"0,0,0",skyBot:"3,3,5"},
  Pluto:{atm:0,sunSz:0.0025,g:"rgba(165,145,125,1)",skyTop:"0,0,0",skyBot:"2,2,4"},
  Eris:{atm:0,sunSz:0.0007,g:"rgba(155,155,158,1)",skyTop:"0,0,0",skyBot:"1,1,3"},
  Moon:{atm:0,sunSz:1,g:"rgba(135,130,122,1)",skyTop:"0,0,0",skyBot:"3,3,6",showEarth:true},
  Io:{atm:0.05,sunSz:0.037,g:"rgba(210,185,68,1)",skyTop:"3,0,0",skyBot:"12,5,0"},
  Europa:{atm:0,sunSz:0.037,g:"rgba(215,212,225,1)",skyTop:"0,0,4",skyBot:"4,6,14"},
  Ganymede:{atm:0,sunSz:0.037,g:"rgba(148,140,128,1)",skyTop:"0,0,0",skyBot:"3,3,5"},
  Callisto:{atm:0,sunSz:0.037,g:"rgba(72,68,62,1)",skyTop:"0,0,0",skyBot:"2,2,3"},
  Titan:{atm:3.5,sunSz:0.011,g:"rgba(118,92,52,1)",skyTop:"175,108,38",skyBot:"155,86,28"},
  Enceladus:{atm:0.01,sunSz:0.011,g:"rgba(230,238,246,1)",skyTop:"0,0,0",skyBot:"3,4,7"},
  Miranda:{atm:0,sunSz:0.006,g:"rgba(105,95,88,1)",skyTop:"0,0,0",skyBot:"2,2,3"},
  Itokawa:{atm:0,sunSz:0.13,g:"rgba(132,114,90,1)",skyTop:"0,0,0",skyBot:"2,2,2"},
  Ryugu:{atm:0,sunSz:0.13,g:"rgba(20,17,14,1)",skyTop:"0,0,0",skyBot:"1,1,1"},
  Triton:{atm:0.02,sunSz:0.0011,g:"rgba(195,170,150,1)",skyTop:"0,0,0",skyBot:"3,2,4"},
  Charon:{atm:0,sunSz:0.0025,g:"rgba(140,128,118,1)",skyTop:"0,0,0",skyBot:"2,2,3"},
  HalleyCore:{atm:0,sunSz:0.5,g:"rgba(18,15,12,1)",skyTop:"0,0,0",skyBot:"1,1,2"},
  Phobos:{atm:0,sunSz:0.43,g:"rgba(105,88,72,1)",skyTop:"0,0,0",skyBot:"2,1,2"},
};

export var IO_INFO={n:"Io",j:"イオ",e:"Io",d:778,r:1.821,p:365.25,c:"rgba(220,200,100,1)",t:0,rot:1.769,type:"io",mass:"8.93×10²² kg",grav:"1.80 m/s²",moons:0,day:"1.77日(公転=自転)",year:"木星を1.77日",atm:"SO₂ 極微量",temp:"−143〜+1650℃",dens:"3.53",esc:"2.56",alb:0.63};
export var EUROPA_INFO={n:"Europa",j:"エウロパ",e:"Europa",d:778,r:1.560,p:365.25,c:"rgba(195,188,178,1)",t:0,rot:3.551,type:"europa",mass:"4.80×10²² kg",grav:"1.32 m/s²",moons:0,day:"3.55日",year:"木星を3.55日",atm:"O₂ 極微量",temp:"−160℃",dens:"3.01",esc:"2.03",alb:0.67};
export var GANYMEDE_INFO={n:"Ganymede",j:"ガニメデ",e:"Ganymede",d:778,r:2.634,p:365.25,c:"rgba(162,158,145,1)",t:0,rot:7.155,type:"ganymede",mass:"1.48×10²³ kg",grav:"1.43 m/s²",moons:0,day:"7.16日",year:"木星を7.16日",atm:"O₂ 極微量",temp:"−163℃",dens:"1.94",esc:"2.74",alb:0.43};
export var CALLISTO_INFO={n:"Callisto",j:"カリスト",e:"Callisto",d:778,r:2.410,p:365.25,c:"rgba(128,122,112,1)",t:0,rot:16.689,type:"callisto",mass:"1.08×10²³ kg",grav:"1.24 m/s²",moons:0,day:"16.69日",year:"木星を16.69日",atm:"CO₂ 極微量",temp:"−139℃",dens:"1.83",esc:"2.44",alb:0.17};
export var TITAN_INFO={n:"Titan",j:"タイタン",e:"Titan",d:1427,r:2.575,p:365.25,c:"rgba(218,168,88,1)",t:0,rot:15.945,type:"titan",mass:"1.35×10²³ kg",grav:"1.35 m/s²",moons:0,day:"15.95日(公転=自転)",year:"土星を15.95日",atm:"N₂ 95% CH₄ 5%",temp:"−179℃",dens:"1.88",esc:"2.64",alb:0.22};
export var ITOKAWA_INFO={n:"Itokawa",j:"イトカワ",e:"25143 Itokawa",d:230,r:0.000165,p:556,c:"rgba(168,140,108,1)",t:0,rot:0.5,type:"asteroid",mass:"3.58×10¹⁰ kg",grav:"0.00009 m/s²",moons:0,day:"12.1時間",year:"1.52年",atm:"なし",temp:"−90〜+60℃",dens:"1.90",esc:"0.0015",alb:0.18};
export var RYUGU_INFO={n:"Ryugu",j:"リュウグウ",e:"162173 Ryugu",d:231,r:0.000448,p:474,c:"rgba(28,22,18,1)",t:0,rot:0.319,type:"asteroid",mass:"4.50×10¹¹ kg",grav:"0.00012 m/s²",moons:0,day:"7.63時間",year:"1.30年",atm:"なし",temp:"−93〜+52℃",dens:"1.19",esc:"0.003",alb:0.045};
export var TRITON_INFO={n:"Triton",j:"トリトン",e:"Triton",d:4495,r:1.353,p:365.25,c:"rgba(205,190,178,1)",t:0,rot:-5.877,type:"triton",mass:"2.14×10²² kg",grav:"0.78 m/s²",moons:0,day:"5.88日(逆行・潮汐固定)",year:"海王星を5.88日",atm:"N₂ 極希薄",temp:"−235℃",dens:"2.06",esc:"1.46",alb:0.76};
export var CHARON_INFO={n:"Charon",j:"カロン",e:"Charon",d:5906,r:0.606,p:90560,c:"rgba(155,142,130,1)",t:0,rot:6.39,type:"charon",mass:"1.52×10²¹ kg",grav:"0.29 m/s²",moons:0,day:"6.39日(潮汐固定)",year:"冥王星を6.39日",atm:"なし",temp:"−220℃",dens:"1.70",esc:"0.58",alb:0.35};
export var ENCELADUS_INFO={n:"Enceladus",j:"エンケラドゥス",e:"Enceladus",d:1427,r:0.252,p:365.25,c:"rgba(230,238,246,1)",t:0,rot:1.370,type:"enceladus",mass:"1.08×10²⁰ kg",grav:"0.11 m/s²",moons:0,day:"1.37日(潮汐固定)",year:"土星を1.37日",atm:"ほぼ無し（間欠泉起源の水蒸気）",temp:"−201℃",dens:"1.61",esc:"0.24",alb:0.99};
export var MIRANDA_INFO={n:"Miranda",j:"ミランダ",e:"Miranda",d:2871,r:0.236,p:365.25,c:"rgba(180,178,175,1)",t:0,rot:1.413,type:"miranda",mass:"6.59×10¹⁹ kg",grav:"0.08 m/s²",moons:0,day:"1.41日(潮汐固定)",year:"天王星を1.41日",atm:"なし",temp:"−213℃",dens:"1.20",esc:"0.19",alb:0.32};
export var HALLEY_CORE_INFO={n:"HalleyCore",j:"ハレー彗星核",e:"1P/Halley nucleus",d:2660,r:0.011,p:27484,c:"rgba(22,18,15,1)",t:0,rot:2.2,type:"comet",mass:"2.2×10¹⁴ kg",grav:"0.0005 m/s²",moons:0,day:"52.8時間",year:"75.3年",atm:"昇華ガス(H₂O・CO)",temp:"−170〜+47℃",dens:"0.60",esc:"0.001",alb:0.04};
export var PHOBOS_INFO={n:"Phobos",j:"フォボス",e:"Phobos",d:228,r:0.01127,p:686.97,c:"rgba(138,115,92,1)",t:0,rot:0.3189,type:"phobos",mass:"1.07×10¹⁶ kg",grav:"0.006 m/s²",moons:0,day:"7.65時間(潮汐固定)",year:"火星を7.65時間",atm:"なし",temp:"−40〜+27℃",dens:"1.876",esc:"0.011",alb:0.07};
/* Europa geological landmarks (Galileo/Voyager) */
export var EUROPA_FEATURES=[
  {n:"コナマラ混沌地形",en:"Conamara Chaos",lat:9,lng:274,info:"板状氷塊が漂流して再凍結 地下海の動証拠"},
  {n:"プウィル・クレーター",en:"Pwyll",lat:-26,lng:271,info:"最若い大型クレーター 直径26km 明るい放射状エジェクタ"},
  {n:"テラ・マキュラ",en:"Thera Macula",lat:-47,lng:181,info:"赤褐色の混沌地形 液体水が地表近くに上昇した証拠"},
  {n:"ラダマンティス・リネア",en:"Rhadamanthys Linea",lat:-5,lng:178,info:"幅2km 長さ1500kmの二重峰リネア 硫黄化合物が峰を形成"},
  {n:"タラ地域",en:"Tara Regio",lat:-6,lng:213,info:"大規模な混沌地形 近年の地殻活動で生成された可能性"},
];
/* Io volcanic landmarks (Voyager / Galileo / New Horizons) */
export var IO_FEATURES=[
  {n:"ロキ・パテラ",en:"Loki Patera",lat:13,lng:309,info:"直径200kmの溶岩湖 太陽系最強の火山 イオ全熱放射の10%"},
  {n:"ペレ",en:"Pele",lat:-18,lng:255,info:"高度300kmの噴煙プルーム 直径1200kmの赤い硫黄リング"},
  {n:"プロメテウス",en:"Prometheus",lat:-2,lng:153,info:"「イオの忠実な火山」1979年から噴火継続 高度100kmプルーム"},
  {n:"トヴァシュタル・パテラ",en:"Tvashtar Paterae",lat:62,lng:122,info:"ニューホライズンズが撮影した高度330kmの巨大プルーム"},
  {n:"ボオサウレ山",en:"Boösaule Montes",lat:-4,lng:270,info:"高さ17.5km 太陽系で最も高い山のひとつ 非火山性隆起"},
];
/* Ganymede geological landmarks (Voyager / Galileo) */
export var GANYMEDE_FEATURES=[
  {n:"ガリレオ地域",en:"Galileo Regio",lat:35,lng:145,info:"直径3200kmの暗い古地形 太陽系最大級の暗領域 40億年前の地殻"},
  {n:"ウルク・スルクス",en:"Uruk Sulcus",lat:0,lng:160,info:"明るい溝状地形 平行な尾根と溝の帯 テクトニクス活動の痕跡"},
  {n:"エンキ・カテナ",en:"Enki Catena",lat:38,lng:13,info:"13個の連鎖クレーター 分裂彗星(SL9型)の衝突列 全長160km"},
  {n:"トロス・クレーター",en:"Tros",lat:11,lng:27,info:"明るい放射状エジェクタを持つ若いクレーター 直径94km"},
  {n:"ニコルソン地域",en:"Nicholson Regio",lat:-20,lng:0,info:"暗い古地形 明るい溝状地形との境界が明瞭 地殻進化の記録"},
];
/* Callisto geological landmarks (Voyager / Galileo) */
export var CALLISTO_FEATURES=[
  {n:"ヴァルハラ盆地",en:"Valhalla Basin",lat:16,lng:10,info:"直径3800kmの多重リング衝突盆地 太陽系最大の衝突構造 外輪まで4000km超"},
  {n:"アスガルド盆地",en:"Asgard Basin",lat:30,lng:218,info:"直径1400kmの多重リング構造 ヴァルハラに次ぐ第2の大衝突盆地"},
  {n:"バール・クレーター",en:"Burr",lat:35,lng:155,info:"直径72kmの明るい放射状クレーター 古い地形に輝く比較的若い衝突痕"},
  {n:"アディンダ環",en:"Adlinda",lat:-58,lng:22,info:"南半球の多重リング構造 直径1600km ヴォイジャー2号が撮影"},
  {n:"ティール・マクラ",en:"Tyr Macula",lat:23,lng:215,info:"明るい斑点状古地形 古代の地殻変動の痕跡 40億年前の表面"},
];
/* Ceres geological landmarks (Dawn 2015-2018) */
export var CERES_FEATURES=[
  {n:"オッカトル・クレーター",en:"Occator",lat:19.8,lng:239,info:"直径92km 中央輝点ケレアリア・ファクラは炭酸ナトリウム塩 地下塩水の噴出痕"},
  {n:"アフナ山",en:"Ahuna Mons",lat:-10.5,lng:316,info:"高さ4kmの孤立氷火山 太陽系で最も若いクリオボルケーノのひとつ"},
  {n:"ケルワン盆地",en:"Kerwan",lat:-10.8,lng:124,info:"直径280kmの最大クレーター 浅く緩和した古い衝突盆地"},
  {n:"ハウラニ・クレーター",en:"Haulani",lat:5.8,lng:11,info:"直径34kmの若いクレーター 青みがかった明るいエジェクタ"},
  {n:"ヤロード盆地",en:"Yalode",lat:-42.6,lng:293,info:"直径260kmの衝突盆地 南半球の古地形 ウルヴァラ盆地と隣接"},
];
/* Eris landmarks (spacecraft未到達・Hubble観測ベースの推定地形) */
export var ERIS_FEATURES=[
  {n:"ゼナ高地",en:"Xena Highlands",lat:28,lng:62,info:"発見時の愛称Xenaに因む 明るいメタン霜で覆われた丘陵 アルベド0.96"},
  {n:"ダイズノミア展望地",en:"Dysnomia Rise",lat:-14,lng:148,info:"衛星ダイズノミアが最大視直径で見える地点 表面の暗帯がHubbleで確認"},
  {n:"ニクテウス平原",en:"Nyctelius Planum",lat:4,lng:275,info:"均一なメタン氷の広大な平原 太陽まで96AU 太陽は−16等の明星として輝く"},
];
/* Triton geological landmarks */
export var TRITON_FEATURES=[
  {n:"カンタロウプ地形",en:"Cantaloupe Terrain",lat:15,lng:30,info:"メロンの皮状の凹凸地形 直径25-35kmの円形構造が密集"},
  {n:"窒素間欠泉",en:"Nitrogen Geysers",lat:-50,lng:-10,info:"高度8kmまで噴出する窒素ガスのプルーム"},
];
/* Miranda geological landmarks (Voyager 2) */
export var MIRANDA_FEATURES=[
  {n:"ベローナ断崖",en:"Verona Rupes",lat:-43,lng:167,info:"太陽系最高の断崖 高さ約20km — 低重力のため落下に約12分かかる"},
  {n:"アーデンコロナ",en:"Arden Corona",lat:-30,lng:32,info:"直径318kmの複合地形 古い地殻が再活性化したテクトニックな特異地形"},
  {n:"インバネスコロナ",en:"Inverness Corona",lat:18,lng:326,info:"直径246kmの滑らかな平原 クレーター密集地帯に囲まれる"},
];
/* Enceladus geological landmarks (Cassini) */
export var ENCELADUS_FEATURES=[
  {n:"虎縞地形",en:"Tiger Stripes",lat:-80,lng:0,info:"南極の4本の平行な裂け目 地下海の水が間欠泉として宇宙へ噴出"},
  {n:"ダマスクス溝",en:"Damascus Sulcus",lat:-78,lng:-32,info:"最も活発な噴出源 塩を含む水蒸気プルームを放出"},
  {n:"サマルカンド溝",en:"Samarkand Sulci",lat:12,lng:82,info:"北半球の古い溝状地形 クレーターと滑らかな氷平原"},
];
/* Pluto major regions (New Horizons 2015) */
export var PLUTO_FEATURES=[
  {n:"スプートニク平原",en:"Sputnik Planitia",lat:25,lng:175,info:"心臓型の窒素氷平原 直径約1000km 対流セルが存在"},
  {n:"クトゥルフ地域",en:"Cthulhu Macula",lat:-10,lng:30,info:"赤褐色のトーリン（有機物）が堆積した暗黒帯"},
  {n:"トンボー領域",en:"Tombaugh Regio",lat:25,lng:180,info:"発見者クライド・トンボーに因む心臓型の領域"},
];
/* Charon major regions */
export var CHARON_FEATURES=[
  {n:"モルドール斑",en:"Mordor Macula",lat:85,lng:0,info:"北極の赤褐色領域 冥王星から逃れた窒素・メタンが凍結"},
  {n:"セレニティ・カスマ",en:"Serenity Chasma",lat:-15,lng:30,info:"赤道沿いの巨大な裂け目 全長1800km"},
];
/* New Horizons / Halley probe sites */
export var OUTER_PROBES=[
  {n:"ニュー・ホライズンズ最接近",en:"New Horizons closest approach",body:"Pluto",lat:11.5,lng:178.7,date:"2015-07",info:"NASA NH 12,500kmまで接近 スプートニク平原を撮影"},
  {n:"ジオット最接近",en:"Giotto flyby",body:"HalleyCore",lat:0,lng:0,date:"1986-03",info:"ESA Giotto 596kmまで接近 ハレー彗星核を初撮影"},
];
/* Titan probe site */
export var TITAN_PROBES=[
  {n:"ホイヘンス",en:"Huygens",lat:-10.3,lng:167.6,date:"2005-01",info:"ESAのタイタン大気突入プローブ ホイヘンス 72分間送信"},
];
/* Phobos geological landmarks (Viking/MRO/Mars Express) */
export var PHOBOS_FEATURES=[
  {n:"スティックニー",en:"Stickney",lat:1,lng:37,info:"直径9km — フォボス半径の80%に及ぶ巨大衝突クレーター"},
  {n:"ロシュ",en:"Roche",lat:-44,lng:122,info:"直径5km クレーター 最もくっきりした輪郭を持つ"},
  {n:"モノリス",en:"Phobos Monolith",lat:41,lng:338,info:"高さ約90mの孤立岩塊 バイキング1号が撮影した謎の巨大岩"},
  {n:"ケプラー背斜",en:"Kepler Dorsum",lat:35,lng:192,info:"火星潮汐力が刻んだ平行な亀裂群 フォボス崩壊の前兆とも"},
];
/* Titan geographic landmarks (Cassini-Huygens mapping) */
export var TITAN_FEATURES=[
  {n:"リゲイア海",en:"Ligeia Mare",lat:79,lng:249,info:"北極のメタン湖 面積約126,000km²"},
  {n:"クラーケン海",en:"Kraken Mare",lat:68,lng:310,info:"最大のメタン海 南北1,170km"},
  {n:"シャングリラ",en:"Shangri-La",lat:-5,lng:200,info:"赤道付近の有機物砂丘帯 暗黒炭化水素の砂で覆われる"},
  {n:"アディリ高地",en:"Adiri",lat:-15,lng:210,info:"ホイヘンス着陸域の西に広がる明るい高地"},
];
/* Asteroid probe sites */
export var HAYABUSA_SITES=[
  {n:"はやぶさ（Muses-C）",en:"Hayabusa",body:"Itokawa",lat:0.0,lng:0.0,date:"2005-11",info:"JAXA はやぶさ 表面接触・試料採取"},
  {n:"はやぶさ2（TD1）",en:"Hayabusa2 TD1",body:"Ryugu",lat:11.0,lng:228.0,date:"2019-02",info:"JAXA はやぶさ2 第1回タッチダウン"},
];

/* Exoplanets - rendered only in landing mode (not in solar view) */
export var EXOPLANETS=[
  {n:"ProximaB",j:"プロキシマb",e:"Proxima Centauri b",d:0,r:7.0,p:11.2,c:"rgba(165,90,55,1)",t:0,rot:11.2,type:"rock",
   mass:"≈1.07 地球",masse:"≈1.07 Earth",grav:"≈11 m/s²",moons:0,
   day:"潮汐固定",daye:"Tidally locked",year:"11.2日",yeare:"11.2 days",
   atm:"未確認",atme:"Unconfirmed",temp:"−39℃ (推定)",
   starInfo:"M型赤色矮星 (4.24 ly)",starInfoE:"M-type red dwarf (4.24 ly)",hab:true},
  {n:"Trappist1e",j:"トラピスト1e",e:"TRAPPIST-1e",d:0,r:5.8,p:6.1,c:"rgba(125,80,65,1)",t:0,rot:6.1,type:"rock",
   mass:"0.69 地球",masse:"0.69 Earth",grav:"≈9.1 m/s²",moons:0,
   day:"潮汐固定",daye:"Tidally locked",year:"6.1日",yeare:"6.1 days",
   atm:"水検出可能性",atme:"Possible water",temp:"−21℃ (推定)",
   starInfo:"M型超低温矮星 (40 ly)",starInfoE:"Ultra-cool M dwarf (40 ly)",hab:true},
  {n:"Kepler22b",j:"ケプラー22b",e:"Kepler-22b",d:0,r:15.4,p:289.9,c:"rgba(60,110,140,1)",t:0,rot:24,type:"rock",
   mass:"≈9 地球",masse:"≈9 Earth",grav:"未確認",moons:0,
   day:"未確認",daye:"Unknown",year:"289.9日",yeare:"289.9 days",
   atm:"未確認",atme:"Unknown",temp:"22℃ (推定)",
   starInfo:"G型恒星 (600 ly)",starInfoE:"G-type star (600 ly)",hab:true},
  {n:"HD189733b",j:"HD189733b",e:"HD 189733 b",d:0,r:80.5,p:2.2,c:"rgba(50,40,110,1)",t:0,rot:2.2,type:"hotgas",
   mass:"1.13 木星",masse:"1.13 Jupiter",grav:"≈22 m/s²",moons:0,
   day:"潮汐固定",daye:"Tidally locked",year:"2.2日",yeare:"2.2 days",
   atm:"H₂・シリケート粒子（ガラスの雨）",atme:"H₂, silicate rain",temp:"930℃",
   starInfo:"K型 (64.5 ly)",starInfoE:"K-type (64.5 ly)",hab:false},
];
export var EXO_MAP={};EXOPLANETS.forEach(function(p){EXO_MAP[p.n]=p;PL_MAP[p.n]=p;});
/* Register Galilean moons + Titan + asteroids as landing targets */
PL_MAP["Io"]=IO_INFO;PL_MAP["Europa"]=EUROPA_INFO;PL_MAP["Ganymede"]=GANYMEDE_INFO;PL_MAP["Callisto"]=CALLISTO_INFO;
PL_MAP["Titan"]=TITAN_INFO;PL_MAP["Itokawa"]=ITOKAWA_INFO;PL_MAP["Ryugu"]=RYUGU_INFO;
PL_MAP["Triton"]=TRITON_INFO;PL_MAP["Charon"]=CHARON_INFO;PL_MAP["HalleyCore"]=HALLEY_CORE_INFO;
PL_MAP["Enceladus"]=ENCELADUS_INFO;
PL_MAP["Miranda"]=MIRANDA_INFO;
PL_MAP["Phobos"]=PHOBOS_INFO;
/* 潮汐固定衛星 → 親天体名の共有マップ。drawLanding（太陽位置）・drawLandingSkyBodies（親天体描画）・
   drawLandingHUD（距離表示）の3か所で共用する。Pluto はカロンと相互潮汐固定のため自身を親として
   朔望周期計算に使う特殊エントリ。 */
export var PARENT_OF={Moon:"Earth",Io:"Jupiter",Europa:"Jupiter",Ganymede:"Jupiter",Callisto:"Jupiter",Titan:"Saturn",Enceladus:"Saturn",Miranda:"Uranus",Triton:"Neptune",Charon:"Pluto",Pluto:"Pluto",Phobos:"Mars"};
/* Exoplanet surface data - merged into SURF for landing render */
export var EXO_SURF={
  ProximaB:{atm:0.5,sunSz:1.7,g:"rgba(120,75,55,1)",skyTop:"55,18,32",skyBot:"125,55,55",skyNT:"3,2,8",skyNB:"15,8,20",exo:true,starTint:"255,150,90",fixedSun:true},
  Trappist1e:{atm:0.7,sunSz:1.5,g:"rgba(105,80,75,1)",skyTop:"50,22,42",skyBot:"130,65,65",skyNT:"5,3,10",skyNB:"20,10,25",exo:true,starTint:"255,140,80",companions:true},
  Kepler22b:{atm:1,sunSz:0.8,g:"rgba(40,90,110,1)",skyTop:"60,130,180",skyBot:"140,180,210",skyNT:"3,8,18",skyNB:"10,20,40",exo:true,starTint:"255,230,180",ocean:true},
  HD189733b:{atm:3,sunSz:5,g:"rgba(40,30,80,1)",skyTop:"30,10,80",skyBot:"80,30,150",exo:true,starTint:"255,200,140",glassRain:true},
};

/* Meteor showers - d = day-of-year peak, raD/decD = radiant equatorial coords (deg), rate = ZHR/h */
export var MSHW=[{d:3,n:"しぶんぎ座",raD:230,decD:50,rate:120},{d:112,n:"こと座",raD:271,decD:34,rate:18},{d:125,n:"みずがめ座η",raD:338,decD:-1,rate:60},{d:223,n:"ペルセウス座",raD:48,decD:58,rate:100},{d:294,n:"オリオン座",raD:95,decD:16,rate:25},{d:321,n:"しし座",raD:152,decD:22,rate:15},{d:347,n:"ふたご座",raD:113,decD:33,rate:120}];
/* QUIZ_DATA: lv=1初級, 2中級, 3上級 ／ qe/ae/hinte は英語版 */
export var QUIZ_DATA=[
  /* === 初級 (lv:1) 10問 === */
  {lv:1,q:"太陽系で最大の惑星は？",a:["木星","土星","海王星","地球"],c:0,hint:"質量は地球の約318倍",qe:"Which is the largest planet in the solar system?",ae:["Jupiter","Saturn","Neptune","Earth"],hinte:"~318× Earth's mass"},
  {lv:1,q:"地球から最も近い天体は？",a:["月","金星","火星","太陽"],c:0,hint:"約38万km",qe:"Which body is closest to Earth?",ae:["Moon","Venus","Mars","Sun"],hinte:"~384,000 km"},
  {lv:1,q:"火星の衛星の数は？",a:["2個","1個","3個","0個"],c:0,hint:"フォボスとダイモス",qe:"How many moons does Mars have?",ae:["2","1","3","0"],hinte:"Phobos and Deimos"},
  {lv:1,q:"太陽系で最も小さい惑星は？",a:["水星","火星","金星","冥王星"],c:0,hint:"冥王星は2006年以降は準惑星",qe:"What is the smallest planet?",ae:["Mercury","Mars","Venus","Pluto"],hinte:"Pluto is dwarf planet since 2006"},
  {lv:1,q:"地球の公転周期は？",a:["約365日","約30日","約7日","約100日"],c:0,hint:"1年=地球の公転1周",qe:"Earth's orbital period?",ae:["~365 days","~30 days","~7 days","~100 days"],hinte:"1 year = 1 orbit"},
  {lv:1,q:"赤い惑星と呼ばれているのは？",a:["火星","金星","水星","木星"],c:0,hint:"地表の酸化鉄が赤色の正体",qe:"Which is called the Red Planet?",ae:["Mars","Venus","Mercury","Jupiter"],hinte:"Iron oxide on surface"},
  {lv:1,q:"夜空で最も明るい恒星は？",a:["シリウス","ベガ","ベテルギウス","北極星"],c:0,hint:"おおいぬ座α星",qe:"Brightest star in the night sky?",ae:["Sirius","Vega","Betelgeuse","Polaris"],hinte:"α Canis Majoris"},
  {lv:1,q:"地球の自転周期は？",a:["約24時間","約12時間","約48時間","約8時間"],c:0,hint:"1日の長さ",qe:"Earth's rotation period?",ae:["~24 hours","~12 hours","~48 hours","~8 hours"],hinte:"Length of a day"},
  {lv:1,q:"太陽系で唯一輪が大きく目立つ惑星は？",a:["土星","天王星","木星","海王星"],c:0,hint:"他の3つも実は薄いリングがある",qe:"Planet famous for prominent rings?",ae:["Saturn","Uranus","Jupiter","Neptune"],hinte:"All 4 giants have rings, Saturn's brightest"},
  {lv:1,q:"月の満ち欠けの周期（朔望月）は？",a:["約29.5日","約27.3日","約24日","約31日"],c:0,hint:"新月から新月まで",qe:"Lunar phase cycle (synodic month)?",ae:["~29.5 days","~27.3 days","~24 days","~31 days"],hinte:"New moon to new moon"},
  /* === 中級 (lv:2) 12問 === */
  {lv:2,q:"太陽系で最も密度が低い惑星は？",a:["土星","天王星","木星","海王星"],c:0,hint:"水より軽い（0.69 g/cm³）",qe:"Lowest-density planet?",ae:["Saturn","Uranus","Jupiter","Neptune"],hinte:"Less dense than water (0.69 g/cm³)"},
  {lv:2,q:"地軸傾斜が約98°で「横倒し」になっている惑星は？",a:["天王星","海王星","土星","木星"],c:0,hint:"自転軸が公転面とほぼ水平",qe:"Planet tilted ~98° (lying on its side)?",ae:["Uranus","Neptune","Saturn","Jupiter"],hinte:"Axis nearly parallel to orbital plane"},
  {lv:2,q:"逆行自転（公転と逆方向に自転）はどれ？",a:["金星","水星","火星","天王星"],c:0,hint:"自転周期は−243日",qe:"Which planet rotates retrograde?",ae:["Venus","Mercury","Mars","Uranus"],hinte:"Rotation period: −243 days"},
  {lv:2,q:"金星の表面温度が水星より高い主な理由は？",a:["温室効果","太陽に近い","自転が遅い","密度が高い"],c:0,hint:"CO₂ 96%の厚い大気による",qe:"Why is Venus hotter than Mercury?",ae:["Greenhouse effect","Closer to Sun","Slow rotation","Higher density"],hinte:"96% CO₂ atmosphere"},
  {lv:2,q:"太陽系で最も衛星が多い惑星は？",a:["土星","木星","天王星","海王星"],c:0,hint:"2024年現在で146個以上",qe:"Planet with most moons?",ae:["Saturn","Jupiter","Uranus","Neptune"],hinte:"146+ as of 2024"},
  {lv:2,q:"地球の脱出速度（第二宇宙速度）は？",a:["11.2 km/s","9.8 km/s","7.9 km/s","12.4 km/s"],c:0,hint:"地球引力からの脱出速度",qe:"Earth's escape velocity?",ae:["11.2 km/s","9.8 km/s","7.9 km/s","12.4 km/s"],hinte:"Velocity to escape Earth's gravity"},
  {lv:2,q:"月の恒星月（恒星基準）は約何日？",a:["27.3日","29.5日","24.8日","30.0日"],c:0,hint:"朔望月(29.5日)と恒星月は異なる",qe:"Sidereal month of the Moon?",ae:["27.3 days","29.5 days","24.8 days","30.0 days"],hinte:"Differs from synodic month"},
  {lv:2,q:"ハレー彗星の公転周期は約何年？",a:["75年","11年","165年","250年"],c:0,hint:"次回近日点は2061年",qe:"Halley's Comet period?",ae:["75 years","11 years","165 years","250 years"],hinte:"Next perihelion: 2061"},
  {lv:2,q:"太陽から最も遠い惑星は？",a:["海王星","天王星","冥王星","木星"],c:0,hint:"約30 AU・冥王星は準惑星",qe:"Farthest planet from the Sun?",ae:["Neptune","Uranus","Pluto","Jupiter"],hinte:"~30 AU; Pluto is dwarf"},
  {lv:2,q:"小惑星帯は主にどこにある？",a:["火星と木星の間","地球と火星の間","木星と土星の間","海王星の外側"],c:0,hint:"主帯小惑星は2-3.5 AU",qe:"Main asteroid belt location?",ae:["Between Mars & Jupiter","Earth-Mars","Jupiter-Saturn","Beyond Neptune"],hinte:"~2-3.5 AU"},
  {lv:2,q:"オリンポス山がある惑星は？",a:["火星","金星","地球","水星"],c:0,hint:"太陽系最大の火山（高さ約27km）",qe:"Planet hosting Olympus Mons?",ae:["Mars","Venus","Earth","Mercury"],hinte:"~27 km tall, largest in solar system"},
  {lv:2,q:"光の速度で太陽から地球まで何分？",a:["約8分","約1分","約1時間","約1秒"],c:0,hint:"1 AU = 8.3光分",qe:"Light travel time Sun→Earth?",ae:["~8 minutes","~1 minute","~1 hour","~1 second"],hinte:"1 AU = 8.3 light-minutes"},
  /* === 上級 (lv:3) 8問 === */
  {lv:3,q:"ケプラーの第三法則: 公転周期T²は何に比例する？",a:["軌道長半径a³","軌道長半径a²","軌道長半径a","軌道短半径b²"],c:0,hint:"T²∝a³（全惑星で T²/a³≈1）",qe:"Kepler's 3rd: T² is proportional to?",ae:["a³ (semi-major axis cubed)","a²","a","b²"],hinte:"T²∝a³ (T²/a³≈1 for all planets)"},
  {lv:3,q:"太陽系で最も脱出速度が大きい惑星は？",a:["木星","土星","海王星","天王星"],c:0,hint:"太陽系最大のガス惑星 (59.5 km/s)",qe:"Highest escape velocity?",ae:["Jupiter","Saturn","Neptune","Uranus"],hinte:"59.5 km/s, largest gas giant"},
  {lv:3,q:"土星の平均密度として正しいのは？",a:["水より軽い","水と同程度","水より重い","地球の半分"],c:0,hint:"0.69 g/cm³",qe:"Saturn's average density?",ae:["Less than water","Same as water","More than water","Half of Earth's"],hinte:"0.69 g/cm³"},
  {lv:3,q:"ロッシュ限界とは何か？",a:["衛星が潮汐力で崩壊する距離","軌道速度の上限","重力圏の境界","脱出速度の最小値"],c:0,hint:"土星のリングはこの内側にある",qe:"What is the Roche limit?",ae:["Tidal-breakup distance","Max orbital speed","Hill sphere boundary","Min escape velocity"],hinte:"Saturn's rings lie inside it"},
  {lv:3,q:"地球の公転速度（軌道速度）は約何km/s？",a:["29.8 km/s","11.2 km/s","7.9 km/s","59.5 km/s"],c:0,hint:"1 AU・1年から計算",qe:"Earth's orbital velocity?",ae:["29.8 km/s","11.2 km/s","7.9 km/s","59.5 km/s"],hinte:"Derived from 1 AU & 1 yr"},
  {lv:3,q:"白色矮星の質量上限（チャンドラセカール限界）は？",a:["太陽の約1.4倍","太陽の約3倍","太陽の約0.5倍","太陽の約10倍"],c:0,hint:"これを超えるとIa型超新星",qe:"Chandrasekhar limit (white dwarf max mass)?",ae:["~1.4 M☉","~3 M☉","~0.5 M☉","~10 M☉"],hinte:"Above this → Type Ia supernova"},
  {lv:3,q:"会合周期（地球から見て同じ位相に戻る周期）が最も長い惑星は？",a:["火星","金星","木星","水星"],c:0,hint:"火星は約780日（公転周期687日に近い）",qe:"Longest synodic period from Earth?",ae:["Mars","Venus","Jupiter","Mercury"],hinte:"Mars ~780 days (close to its 687-day year)"},
  {lv:3,q:"L4・L5ラグランジュ点は何度の位置？",a:["公転軌道上で前後60°","前後45°","前後90°","前後120°"],c:0,hint:"主天体と副天体で正三角形を成す",qe:"L4/L5 Lagrange point angle?",ae:["±60° along orbit","±45°","±90°","±120°"],hinte:"Forms equilateral triangle"},
];
