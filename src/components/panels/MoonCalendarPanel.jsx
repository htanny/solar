import { DragPanel } from "../DragPanel.jsx";
import { computeMoonPhases } from "../../utils/computations.js";
import { simDaysToDate } from "../../utils/timeUtils.js";
import { mobileSheet } from "../../styles/panelStyles.js";

export default function MoonCalendarPanel({visible,dispatchPanel,S,isPhone,lang,pn,bF}){
  if(!visible)return null;
  var en=lang==="en";
  return <DragPanel style={Object.assign({},pn,{top:isPhone?160:80,right:isPhone?10:200,width:200,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"},mobileSheet(isPhone))}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:11,fontWeight:"bold",color:"rgba(200,180,255,0.95)"}}>{en?"🌙 Moon Phase Calendar":"🌙 月相カレンダー"}</span><button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){dispatchPanel({type:"SET",key:"moonCal",value:false});}}>✕</button></div><div style={{maxHeight:240,overflowY:"auto"}}>{(function(){var phases=computeMoonPhases(S.current.t),now=S.current.t;return phases.filter(function(ph){return ph.t>=now-5&&ph.t<=now+65;}).map(function(ph,pi){var daysFromNow=ph.t-now;var isFut=daysFromNow>=0;return <div key={pi} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,0.06)",opacity:isFut?1:0.45}}><span style={{fontSize:13}}>{ph.name.slice(0,2)}</span><div style={{flex:1,marginLeft:6}}><div style={{fontSize:9,color:"rgba(255,255,255,0.85)"}}>{ph.name.slice(3)}</div><div style={{fontSize:8,color:"rgba(180,200,255,0.55)"}}>{simDaysToDate(ph.t)}</div></div><span style={{fontSize:8,color:isFut?"rgba(200,220,255,0.7)":"rgba(255,255,255,0.3)"}}>{isFut?"+"+Math.round(daysFromNow)+"d":Math.round(daysFromNow)+"d"}</span></div>;})}())}</div></DragPanel>;
}
