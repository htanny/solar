import { DragPanel } from "../DragPanel.jsx";
import { EXOPLANETS } from "../../data/solarData.js";
import { mobileSheet, bClose } from "../../styles/panelStyles.js";

export default function ExoplanetPanel({visible,dispatchPanel,doLanding,isPhone,lang,pn,bF}){
  if(!visible)return null;
  var en=lang==="en";
  return <DragPanel style={Object.assign({},pn,{top:80,left:isPhone?10:240,width:260,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"},mobileSheet(isPhone))}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
      <span style={{fontSize:11,fontWeight:"bold",color:"rgba(255,180,120,0.95)"}}>{en?"🪐 Exoplanets":"🪐 系外惑星"}</span>
      <button aria-label={en?"Close":"閉じる"} style={bClose} onClick={function(){dispatchPanel({type:"SET",key:"exoOpen",value:false});}}>✕</button>
    </div>
    <div style={{fontSize:8,color:"rgba(255,210,170,0.5)",marginBottom:8}}>{en?"Teleport to nearby exoplanet surfaces":"近隣の系外惑星地表へ瞬間移動"}</div>
    {EXOPLANETS.map(function(ex){
      return <div key={ex.n} style={{background:"rgba(255,255,255,0.04)",borderRadius:5,marginBottom:8,padding:"7px 8px",border:"1px solid rgba(255,180,100,0.12)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <div>
            <div style={{fontSize:10,fontWeight:"bold",color:"rgba(255,200,160,0.98)"}}>{en?ex.e:ex.j}</div>
            <div style={{fontSize:8,color:"rgba(255,180,130,0.55)"}}>{en?ex.j:ex.e}</div>
          </div>
          {ex.hab&&<span style={{fontSize:8,background:"rgba(80,200,120,0.15)",color:"rgba(100,230,140,0.85)",borderRadius:3,padding:"1px 4px",border:"1px solid rgba(80,200,100,0.2)"}}>{en?"HZ":"ＨＺ"}</span>}
        </div>
        <div style={{fontSize:8,color:"rgba(200,180,160,0.6)",marginBottom:5}}>{en?ex.starInfoE:ex.starInfo}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 8px",marginBottom:5}}>
          {[
            [en?"Mass":"質量", en?ex.masse:ex.mass],
            [en?"Period":"公転周期", en?ex.yeare:ex.year],
            [en?"Gravity":"重力", ex.grav],
            [en?"Day":"自転", en?ex.daye:ex.day],
            [en?"Temp":"気温", ex.temp],
            [en?"Atmosphere":"大気", en?ex.atme:ex.atm],
          ].map(function(row,ri){return <div key={ri} style={{display:"flex",gap:3}}>
            <span style={{color:"rgba(200,180,160,0.4)",fontSize:7,whiteSpace:"nowrap",minWidth:30}}>{row[0]}</span>
            <span style={{color:"rgba(230,210,190,0.75)",fontSize:7,flex:1,overflowWrap:"break-word"}}>{row[1]}</span>
          </div>;})}
        </div>
        <button style={Object.assign({},bF,{width:"100%",fontSize:9,padding:"4px 0"})} onClick={function(){doLanding(ex.n);dispatchPanel({type:"SET",key:"exoOpen",value:false});}}>
          {en?"🚀 Land on Surface":"🚀 地表に着陸"}
        </button>
      </div>;
    })}
  </DragPanel>;
}
