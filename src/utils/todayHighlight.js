import { scanEvents } from "./timeUtils.js";
import { getAnalytics } from "./analytics.js";

/* 「今日のみどころ」提案ロジック（純粋ロジック層 — UIは components/TodayHighlight.jsx） */

export var LAND_SUGGEST=[
  {k:"Europa",j:"エウロパ — 厚い氷殻の下に地下海が眠る世界に着陸",e:"Europa — land on the icy shell hiding a subsurface ocean"},
  {k:"Titan",j:"タイタン — メタンの湖と橙色の空を持つ唯一の衛星",e:"Titan — methane lakes under an orange haze"},
  {k:"Phobos",j:"フォボス — 空の40°を赤い火星が占める衛星",e:"Phobos — where Mars fills 40 degrees of the sky"},
  {k:"Miranda",j:"ミランダ — 高さ20km・太陽系最大の断崖がそびえる",e:"Miranda — home of the tallest cliff in the solar system"},
  {k:"Enceladus",j:"エンケラドゥス — 氷の間欠泉が宇宙へ噴き出す純白の衛星",e:"Enceladus — ice geysers erupting into space"},
  {k:"Io",j:"イオ — 500以上の活火山が絶えず噴火する灼熱の衛星",e:"Io — 500+ volcanoes in constant eruption"},
  {k:"Triton",j:"トリトン — 逆行軌道を回る最果ての氷衛星",e:"Triton — the retrograde ice moon of Neptune"},
  {k:"Charon",j:"カロン — 冥王星と永遠に見つめ合う双子衛星",e:"Charon — Pluto's tidally-locked twin"},
  {k:"HalleyCore",j:"ハレー彗星核 — 漆黒の氷塊から昇華ジェットを見上げる",e:"Halley's nucleus — sublimation jets from pitch-black ice"},
  {k:"Mars",j:"火星 — ローバーの足跡が残る赤い大地を歩く",e:"Mars — walk the red plains among the rovers"},
];

/* 優先順位: ①30日以内の天文イベント → ②未訪問の着陸先（ローカル計測の landing 履歴と照合）
   → ③日替わりローテーション。nowMs はテスト用に注入可能。 */
export function pickSuggestion(t,nowMs){
  var evs=scanEvents(t);
  for(var i=0;i<evs.length;i++){
    if(evs[i].t>=t&&evs[i].t<=t+30)return{kind:"event",ev:evs[i]};
  }
  var visited={};
  var an=getAnalytics();
  (an.events||[]).forEach(function(e){if(e.ev==="landing"&&e.planet)visited[e.planet]=1;});
  var unvis=LAND_SUGGEST.filter(function(s){return!visited[s.k];});
  var pool=unvis.length?unvis:LAND_SUGGEST;
  var dayIdx=Math.floor((nowMs||Date.now())/86400000)%pool.length;
  return{kind:"land",s:pool[dayIdx],fresh:unvis.length>0};
}
