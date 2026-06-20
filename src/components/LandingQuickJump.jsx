// @ts-check
import { QUICK_JUMP_CONFIG } from "../data/solarData.js";

/**
 * @param {Object} props
 * @param {string} props.landing 現在の着陸先英名
 * @param {(v:number)=>void} props.setLandLat
 * @param {(v:number)=>void} props.setLandLng
 * @param {{current:number}} props.landLatR
 * @param {{current:number}} props.landLngR
 * @param {boolean} [props.isPhone] スマホ時はタップターゲットを拡大
 */
export default function LandingQuickJump({landing,setLandLat,setLandLng,landLatR,landLngR,isPhone}){
  var cfg=QUICK_JUMP_CONFIG.find(function(c){return c.match(landing);});
  if(!cfg)return null;
  var sites=cfg.filter?cfg.sites.filter(function(s){return cfg.filter(s,landing);}):cfg.sites;
  var setLatLng=function(la,lo){var laR=Math.round(la*100)/100,loR=Math.round(lo*100)/100;setLandLat(laR);landLatR.current=laR;setLandLng(loR);landLngR.current=loR;};
  var btnStyle=function(col,textCol){return {fontSize:isPhone?11:8,padding:isPhone?"6px 10px":"2px 6px",minHeight:isPhone?30:0,background:"rgba("+col+",0.12)",border:"1px solid rgba("+col+",0.45)",borderRadius:3,color:"rgba("+textCol+",0.95)",cursor:"pointer",fontFamily:"system-ui",flexShrink:0};};
  return <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4,flexWrap:"wrap"}}>
    <span style={{color:"rgba("+cfg.col+",0.7)",fontSize:9,flexShrink:0}}>{cfg.label}</span>
    {sites.map(function(s,si){return <button key={si} onClick={function(){setLatLng(s.lat,s.lng);}} style={btnStyle(cfg.col,cfg.textCol)}>
      {cfg.getKey(s,si)}
    </button>;})}
    {cfg.extras&&cfg.extras.map(function(ex,xi){return <button key={"ex"+xi} onClick={function(){setLatLng(ex.lat,ex.lng);}} style={btnStyle(ex.col,ex.textCol)}>{ex.label}</button>;})}
  </div>;
}
