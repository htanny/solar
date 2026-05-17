import { DragPanel } from "../DragPanel.jsx";
import { EXOPLANETS } from "../../data/solarData.js";

export default function ExoplanetPanel({visible,dispatchPanel,doLanding,isPhone,pn,bF}){
  if(!visible)return null;
  return <DragPanel style={Object.assign({},pn,{top:80,left:isPhone?10:240,width:240,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"})}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:11,fontWeight:"bold",color:"rgba(255,180,120,0.95)"}}>🪐 系外惑星 → 着陸</span><button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){dispatchPanel({type:"SET",key:"exoOpen",value:false});}}>✕</button></div><div style={{fontSize:9,color:"rgba(255,210,170,0.6)",marginBottom:6}}>近隣の系外惑星地表へ瞬間移動</div>{EXOPLANETS.map(function(ex){return <button key={ex.n} style={Object.assign({},bF,{width:"100%",textAlign:"left",marginBottom:4,padding:"5px 8px",lineHeight:1.4})} onClick={function(){doLanding(ex.n);dispatchPanel({type:"SET",key:"exoOpen",value:false});}}><div style={{color:"rgba(255,200,160,0.95)",fontWeight:"bold"}}>{ex.j}</div><div style={{fontSize:8,color:"rgba(220,200,180,0.65)"}}>{ex.e}</div><div style={{fontSize:8,color:"rgba(200,180,160,0.55)"}}>{ex.starInfo} · {ex.temp}</div></button>;})}</DragPanel>;
}
