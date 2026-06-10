import { getAnalytics } from "./analytics.js";

/* 探検手帳ロジック（純粋ロジック層 — UIは components/panels/ExplorerLogPanel.jsx）
   着陸可能な全天体のリスト・訪問判定・実績バッジ計算。 */

export var EXPLORER_GROUPS=[
  {grp:"惑星",grpE:"Planets",col:"120,190,255",bodies:[
    {k:"Mercury",j:"水星",e:"Mercury"},
    {k:"Venus",j:"金星",e:"Venus"},
    {k:"Earth",j:"地球",e:"Earth"},
    {k:"Mars",j:"火星",e:"Mars"},
    {k:"Jupiter",j:"木星",e:"Jupiter"},
    {k:"Saturn",j:"土星",e:"Saturn"},
    {k:"Uranus",j:"天王星",e:"Uranus"},
    {k:"Neptune",j:"海王星",e:"Neptune"},
  ]},
  {grp:"準惑星",grpE:"Dwarf planets",col:"200,180,150",bodies:[
    {k:"Ceres",j:"ケレス",e:"Ceres"},
    {k:"Pluto",j:"冥王星",e:"Pluto"},
    {k:"Eris",j:"エリス",e:"Eris"},
  ]},
  {grp:"衛星",grpE:"Moons",col:"180,210,255",bodies:[
    {k:"Moon",j:"月",e:"Moon"},
    {k:"Phobos",j:"フォボス",e:"Phobos"},
    {k:"Io",j:"イオ",e:"Io"},
    {k:"Europa",j:"エウロパ",e:"Europa"},
    {k:"Ganymede",j:"ガニメデ",e:"Ganymede"},
    {k:"Callisto",j:"カリスト",e:"Callisto"},
    {k:"Titan",j:"タイタン",e:"Titan"},
    {k:"Enceladus",j:"エンケラドゥス",e:"Enceladus"},
    {k:"Miranda",j:"ミランダ",e:"Miranda"},
    {k:"Triton",j:"トリトン",e:"Triton"},
    {k:"Charon",j:"カロン",e:"Charon"},
  ]},
  {grp:"小天体",grpE:"Small bodies",col:"170,200,180",bodies:[
    {k:"Itokawa",j:"イトカワ",e:"Itokawa"},
    {k:"Ryugu",j:"リュウグウ",e:"Ryugu"},
    {k:"HalleyCore",j:"ハレー彗星核",e:"Halley nucleus"},
  ]},
  {grp:"系外惑星",grpE:"Exoplanets",col:"255,160,110",bodies:[
    {k:"ProximaB",j:"プロキシマb",e:"Proxima b"},
    {k:"Trappist1e",j:"トラピスト1e",e:"TRAPPIST-1e"},
    {k:"Kepler22b",j:"ケプラー22b",e:"Kepler-22b"},
    {k:"HD189733b",j:"HD189733b",e:"HD 189733 b"},
  ]},
];

export var ALL_BODIES=EXPLORER_GROUPS.reduce(function(a,g){return a.concat(g.bodies);},[]);

function keysOf(grp){
  for(var i=0;i<EXPLORER_GROUPS.length;i++)if(EXPLORER_GROUPS[i].grp===grp)
    return EXPLORER_GROUPS[i].bodies.map(function(b){return b.k;});
  return[];
}

export var BADGES=[
  {id:"first",ic:"👣",j:"最初の一歩 — はじめての着陸",e:"First Steps — your first landing",need:null,min:1},
  {id:"rocky",ic:"🪨",j:"岩石惑星マスター — 水星〜火星を制覇",e:"Rocky Planets — Mercury to Mars",need:["Mercury","Venus","Earth","Mars"]},
  {id:"giants",ic:"🌀",j:"巨大惑星マスター — 木星〜海王星を制覇",e:"Giant Planets — Jupiter to Neptune",need:["Jupiter","Saturn","Uranus","Neptune"]},
  {id:"galilean",ic:"🔭",j:"ガリレオの目 — ガリレオ衛星4つを制覇",e:"Galilean Eyes — all 4 Galilean moons",need:["Io","Europa","Ganymede","Callisto"]},
  {id:"dwarfs",ic:"❄️",j:"準惑星ハンター — ケレス・冥王星・エリス",e:"Dwarf Hunter — Ceres, Pluto, Eris",need:keysOf("準惑星")},
  {id:"moons",ic:"🌙",j:"衛星コレクター — 全11衛星を制覇",e:"Moon Collector — all 11 moons",need:keysOf("衛星")},
  {id:"hopper",ic:"🛸",j:"小惑星ホッパー — イトカワとリュウグウ",e:"Asteroid Hopper — Itokawa & Ryugu",need:["Itokawa","Ryugu"]},
  {id:"comet",ic:"☄️",j:"彗星の核心 — ハレー彗星核に立った",e:"Comet Core — stood on Halley's nucleus",need:["HalleyCore"]},
  {id:"interstellar",ic:"🌌",j:"恒星間旅行者 — 系外惑星4つを制覇",e:"Interstellar — all 4 exoplanets",need:keysOf("系外惑星")},
  {id:"grandtour",ic:"🏆",j:"グランドツアー — 全天体制覇！",e:"Grand Tour — every world visited!",need:ALL_BODIES.map(function(b){return b.k;})},
];

/* analytics の landing イベントから {天体キー: 初訪問ts} を構築。
   an はテスト用に注入可能（省略時は localStorage から読む）。 */
export function getVisitedMap(an){
  var visited={};
  ((an||getAnalytics()).events||[]).forEach(function(ev){
    if(ev.ev==="landing"&&ev.planet&&!visited[ev.planet])visited[ev.planet]=ev.ts||1;
  });
  return visited;
}

/* 各バッジの獲得状況: [{badge, earned, have, total}] */
export function computeBadges(visited){
  var nVisited=ALL_BODIES.filter(function(b){return visited[b.k];}).length;
  return BADGES.map(function(bd){
    if(bd.need===null)return{badge:bd,earned:nVisited>=bd.min,have:Math.min(nVisited,bd.min),total:bd.min};
    var have=bd.need.filter(function(k){return visited[k];}).length;
    return{badge:bd,earned:have===bd.need.length,have:have,total:bd.need.length};
  });
}

/* 完成にもっとも近い未獲得バッジ → 「あとN天体で○○！」（候補がなければ null）。
   grandtour のような大物より残り数の少ないものを優先。 */
export function nextGoal(visited,en){
  var best=null;
  computeBadges(visited).forEach(function(r){
    if(r.earned||r.badge.need===null)return;
    var left=r.total-r.have;
    if(r.have>0&&(!best||left<best.left))best={left:left,badge:r.badge};
  });
  if(!best)return null;
  var name=(en?best.badge.e:best.badge.j).split("—")[0].trim();
  return en
    ?best.left+" more to earn “"+name+"” "+best.badge.ic
    :"あと"+best.left+"天体で「"+name+"」"+best.badge.ic;
}
