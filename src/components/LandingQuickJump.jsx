// @ts-check
import { APOLLO_SITES, VENUS_LANDERS, MERCURY_SITES, TITAN_PROBES, HAYABUSA_SITES, TRITON_FEATURES, PLUTO_FEATURES, CHARON_FEATURES, OUTER_PROBES } from "../data/solarData.js";

/* 着陸モード下部のクイックジャンプ行設定。
   各天体に対応する着陸地点リストと、ボタンに表示するキー文字列を生成する関数。 */
var APOLLO_LABELS=["11","12","14","15","16","17"];
var VENERA_LABELS=["V4","V7","V9","V13","V14"];

var QUICK_JUMP_CONFIG=[
  {match:function(l){return l==="Moon";},label:"アポロ",col:"255,180,30",textCol:"255,220,80",sites:APOLLO_SITES,getKey:function(_s,i){return "A"+APOLLO_LABELS[i];}},
  {match:function(l){return l==="Venus";},label:"ベネラ",col:"255,160,30",textCol:"255,200,80",sites:VENUS_LANDERS,getKey:function(_s,i){return VENERA_LABELS[i];}},
  {match:function(l){return l==="Mercury";},label:"探査機",col:"180,200,255",textCol:"200,220,255",sites:MERCURY_SITES,getKey:function(s){return s.en;}},
  {match:function(l){return l==="Titan";},label:"探査機",col:"255,180,80",textCol:"255,210,140",sites:TITAN_PROBES,getKey:function(s){return s.en;}},
  {match:function(l){return l==="Triton";},label:"地形",col:"220,205,185",textCol:"240,225,205",sites:TRITON_FEATURES,getKey:function(s){return s.n;}},
  {match:function(l){return l==="Pluto";},label:"地形",col:"255,220,180",textCol:"255,230,200",sites:PLUTO_FEATURES,getKey:function(s){return s.n;},
   extras:[{label:"NH最接近",col:"255,220,80",textCol:"255,230,120",lat:OUTER_PROBES[0].lat,lng:OUTER_PROBES[0].lng}]},
  {match:function(l){return l==="Charon";},label:"地形",col:"255,200,180",textCol:"255,215,200",sites:CHARON_FEATURES,getKey:function(s){return s.n;}},
  {match:function(l){return l==="Itokawa"||l==="Ryugu";},label:"着陸点",col:"160,180,255",textCol:"200,215,255",sites:HAYABUSA_SITES,filter:function(s,landing){return s.body===landing;},getKey:function(s){return s.en;}},
];

/**
 * @param {Object} props
 * @param {string} props.landing 現在の着陸先英名
 * @param {(v:number)=>void} props.setLandLat
 * @param {(v:number)=>void} props.setLandLng
 * @param {{current:number}} props.landLatR
 * @param {{current:number}} props.landLngR
 */
export default function LandingQuickJump({landing,setLandLat,setLandLng,landLatR,landLngR}){
  var cfg=QUICK_JUMP_CONFIG.find(function(c){return c.match(landing);});
  if(!cfg)return null;
  var sites=cfg.filter?cfg.sites.filter(function(s){return cfg.filter(s,landing);}):cfg.sites;
  var setLatLng=function(la,lo){var laR=Math.round(la*100)/100,loR=Math.round(lo*100)/100;setLandLat(laR);landLatR.current=laR;setLandLng(loR);landLngR.current=loR;};
  var btnStyle=function(col,textCol){return {fontSize:8,padding:"2px 6px",background:"rgba("+col+",0.12)",border:"1px solid rgba("+col+",0.45)",borderRadius:3,color:"rgba("+textCol+",0.95)",cursor:"pointer",fontFamily:"system-ui",flexShrink:0};};
  return <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4,flexWrap:"wrap"}}>
    <span style={{color:"rgba("+cfg.col+",0.7)",fontSize:9,flexShrink:0}}>{cfg.label}</span>
    {sites.map(function(s,si){return <button key={si} onClick={function(){setLatLng(s.lat,s.lng);}} style={btnStyle(cfg.col,cfg.textCol)}>
      {cfg.getKey(s,si)}
    </button>;})}
    {cfg.extras&&cfg.extras.map(function(ex,xi){return <button key={"ex"+xi} onClick={function(){setLatLng(ex.lat,ex.lng);}} style={btnStyle(ex.col,ex.textCol)}>{ex.label}</button>;})}
  </div>;
}
