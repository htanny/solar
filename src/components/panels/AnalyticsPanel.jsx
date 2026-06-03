import {useState,useEffect} from "react";
import {DragPanel} from "../DragPanel.jsx";
import {getAnalytics,clearAnalytics} from "../../utils/analytics.js";
import {mobileSheet,bClose} from "../../styles/panelStyles.js";

var PANEL_LBL_JA={showEvents:"📅 天文イベント",searchOpen:"🔍 検索",exoOpen:"🪐 系外惑星",nightSkyOpen:"🌙 今夜の空",bookOpen:"🔖 ブックマーク",moonCal:"🌙 月相",meteorOpen:"🌠 流星群",orbElemOpen:"📊 軌道要素",compareTable:"📊 比較表",satOpen:"🛰 衛星",helpOpen:"⌨ ヘルプ",tourPick:"🎓 ツアー",analyticsOpen:"📈 分析"};
var PANEL_LBL_EN={showEvents:"📅 Events",searchOpen:"🔍 Search",exoOpen:"🪐 Exoplanets",nightSkyOpen:"🌙 Tonight",bookOpen:"🔖 Bookmarks",moonCal:"🌙 Phases",meteorOpen:"🌠 Meteors",orbElemOpen:"📊 Orbit",compareTable:"📊 Compare",satOpen:"🛰 Moons",helpOpen:"⌨ Help",tourPick:"🎓 Tour",analyticsOpen:"📈 Analytics"};
var FEAT_LBL_JA={orbits:"軌道",trails:"軌跡",belt:"小惑星帯",trojan:"トロヤ群",kuiper:"カイパー帯",nasteroid:"準惑星名",tilt:"地軸",moon:"月",labels:"ラベル",planets:"惑星",lagrange:"L点",spacecraft:"探査機",cme:"CME",distbar:"距離バー"};
var FEAT_LBL_EN={orbits:"Orbits",trails:"Trails",belt:"Belt",trojan:"Trojans",kuiper:"Kuiper",nasteroid:"Dwarf names",tilt:"Axis",moon:"Moon",labels:"Labels",planets:"Planets",lagrange:"L points",spacecraft:"Probes",cme:"CME",distbar:"Dist bar"};

function _topN(obj,n){return Object.keys(obj).sort(function(a,b){return obj[b]-obj[a];}).slice(0,n);}
function _counts(events,filterFn,keyFn){var c={};events.filter(filterFn).forEach(function(e){var k=keyFn(e);c[k]=(c[k]||0)+1;});return c;}

export default function AnalyticsPanel({visible,dispatchPanel,lang,isPhone,pn,bF}){
  var[data,setData]=useState(null);
  useEffect(function(){if(visible)setData(getAnalytics());},[visible]);
  if(!visible)return null;
  var en=lang==="en";
  var events=(data&&data.events)||[];
  var sessions=events.filter(function(e){return e.ev==="session_start";}).length;
  var landC=_counts(events,function(e){return e.ev==="landing";},function(e){return e.planet||"?";});
  var panC=_counts(events,function(e){return e.ev==="panel_toggle";},function(e){return e.panel||"?";});
  var featC=_counts(events,function(e){return e.ev==="feature_toggle";},function(e){return e.feature||"?";});
  var landKeys=_topN(landC,8),panKeys=_topN(panC,7),featKeys=_topN(featC,7);
  var landMax=landKeys.length?landC[landKeys[0]]:1,panMax=panKeys.length?panC[panKeys[0]]:1,featMax=featKeys.length?featC[featKeys[0]]:1;
  var PLBL=en?PANEL_LBL_EN:PANEL_LBL_JA,FLBL=en?FEAT_LBL_EN:FEAT_LBL_JA;

  function Bar(key,count,max,label){
    var pct=max>0?Math.round(count/max*100):0;
    return <div key={key} style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
      <span style={{width:106,fontSize:9,color:"rgba(180,210,255,0.82)",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",flexShrink:0}}>{label||key}</span>
      <div style={{flex:1,height:7,background:"rgba(255,255,255,0.07)",borderRadius:2,overflow:"hidden"}}>
        <div style={{width:pct+"%",height:"100%",background:"rgba(100,180,255,0.52)",borderRadius:2}}/>
      </div>
      <span style={{width:22,fontSize:9,textAlign:"right",color:"rgba(255,255,255,0.42)",flexShrink:0}}>{count}</span>
    </div>;
  }

  function Heading(label){
    return <div style={{fontSize:8,color:"rgba(255,255,255,0.32)",letterSpacing:1,textTransform:"uppercase",marginTop:10,marginBottom:4}}>{label}</div>;
  }

  return <DragPanel style={Object.assign({},pn,{top:80,right:14,width:272,maxWidth:"calc(100vw - 20px)"},mobileSheet(isPhone))}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <span style={{fontSize:11,fontWeight:"bold",color:"rgba(130,200,255,0.95)"}}>{en?"📈 Analytics":"📈 利用分析"}</span>
      <button aria-label={en?"Close":"閉じる"} style={bClose} onClick={function(){dispatchPanel({type:"SET",key:"analyticsOpen",value:false});}}>✕</button>
    </div>

    <div style={{display:"flex",gap:16,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:20,fontWeight:"bold",color:"rgba(100,200,255,0.92)"}}>{sessions}</div>
        <div style={{fontSize:8,color:"rgba(255,255,255,0.38)"}}>{en?"sessions":"セッション"}</div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:20,fontWeight:"bold",color:"rgba(100,200,255,0.92)"}}>{events.length}</div>
        <div style={{fontSize:8,color:"rgba(255,255,255,0.38)"}}>{en?"events total":"イベント総数"}</div>
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:20,fontWeight:"bold",color:"rgba(100,200,255,0.92)"}}>{Object.keys(landC).length}</div>
        <div style={{fontSize:8,color:"rgba(255,255,255,0.38)"}}>{en?"planets landed":"着陸天体数"}</div>
      </div>
    </div>

    {events.length===0&&<div style={{color:"rgba(255,255,255,0.32)",fontSize:9,textAlign:"center",padding:"14px 0"}}>{en?"No data yet — start exploring!":"データなし。探索を始めよう！"}</div>}

    {landKeys.length>0&&<div>
      {Heading(en?"🚀 Landing Destinations":"🚀 着陸先ランキング")}
      {landKeys.map(function(k){return Bar(k,landC[k],landMax,k);})}
    </div>}

    {panKeys.length>0&&<div>
      {Heading(en?"🗂 Panel Usage":"🗂 パネル使用頻度")}
      {panKeys.map(function(k){return Bar(k,panC[k],panMax,PLBL[k]||k);})}
    </div>}

    {featKeys.length>0&&<div>
      {Heading(en?"🔧 Feature Toggles":"🔧 機能トグル")}
      {featKeys.map(function(k){return Bar(k,featC[k],featMax,FLBL[k]||k);})}
    </div>}

    <div style={{display:"flex",gap:4,marginTop:10}}>
      <button style={Object.assign({},bF,{fontSize:9,flex:1})} onClick={function(){setData(getAnalytics());}}>🔄 {en?"Refresh":"更新"}</button>
      <button style={Object.assign({},bF,{fontSize:9,flex:1,color:"rgba(255,120,100,0.8)"})} onClick={function(){clearAnalytics();setData({});}}>🗑 {en?"Clear all":"全消去"}</button>
    </div>
  </DragPanel>;
}
