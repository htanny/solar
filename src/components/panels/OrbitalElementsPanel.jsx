import { DragPanel } from "../DragPanel.jsx";
import { computeOrbElem } from "../../utils/computations.js";
import { solveKepler } from "../../data/solarData.js";
import { simDaysToDate } from "../../utils/timeUtils.js";
import { mobileSheet, bClose } from "../../styles/panelStyles.js";

var TAU=Math.PI*2;

/* Compute orbital state for a comet from its raw orbital constants.
   Comet objects use a in sim-units (×150 = AU), so divide back here. */
function cometOrbState(cm,t){
  var a=cm.a/150,e=cm.ecc,T=cm.p;
  /* Same phase convention as the render loop (App.jsx): M=(t/T+phase0)·2π,
     so the perihelion forecast matches the comet's drawn position. */
  var M=(((t/T+cm.phase0)*TAU)%TAU+TAU)%TAU;
  var sk=solveKepler(M,e),nu=sk.nu;
  var r=a*(1-e*Math.cos(sk.E));
  var q=a*(1-e),Q=a*(1+e);
  var GMau=2.959e-4,vAuDay=Math.sqrt(GMau*(2/r-1/a));
  var vKms=vAuDay*1.496e8/86400;
  /* Days to next perihelion: M=0 means at perihelion. M increases with time. */
  var Mdeg=M*180/Math.PI;
  var daysToPeri=((TAU-M)/TAU)*T;
  return{a:a,e:e,T:T,M:Mdeg,nu:nu*180/Math.PI,r:r,v:vKms,q:q,Q:Q,daysToPeri:daysToPeri};
}

export default function OrbitalElementsPanel({visible,dispatchPanel,info,S,lang,isPhone,pn,bF}){
  if(!visible||!info||(info.type!=="planet"&&info.type!=="comet"))return null;
  var en=lang==="en";
  var isComet=info.type==="comet";
  var body=isComet?info.cm:info.pl;
  var bodyName=isComet?body.name:(en?body.n:body.j);

  return <DragPanel style={Object.assign({},pn,{top:isPhone?160:80,right:isPhone?10:200,width:200,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"},mobileSheet(isPhone))}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{fontSize:11,fontWeight:"bold",color:isComet?"rgba(160,210,255,0.95)":"rgba(180,220,255,0.95)"}}>{isComet?(en?"☄ Comet Orbit":"☄ 彗星軌道"):(en?"📊 Orbital Elements":"📊 軌道要素")}</span>
      <button aria-label={en?"Close":"閉じる"} style={bClose} onClick={function(){dispatchPanel({type:"SET",key:"orbElemOpen",value:false});}}>✕</button>
    </div>
    {(function(){
      if(isComet){
        var oe=cometOrbState(body,S.current.t);
        var nextPeri=simDaysToDate(S.current.t+oe.daysToPeri);
        var brightness=Math.max(0,18-2.5*Math.log10(Math.pow(oe.r,4)));
        return <div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.75)"}}>
          <div style={{color:"rgba(180,220,255,0.7)",marginBottom:3,fontSize:8}}>{bodyName}</div>
          <div>a ({en?"semi-major":"長半径"}): {oe.a.toFixed(3)} AU</div>
          <div>e ({en?"eccentricity":"離心率"}): {oe.e.toFixed(3)}</div>
          <div>q ({en?"perihelion":"近日点"}): {oe.q.toFixed(3)} AU</div>
          <div>Q ({en?"aphelion":"遠日点"}): {oe.Q.toFixed(2)} AU</div>
          <div>T ({en?"period":"周期"}): {(oe.T/365.25).toFixed(2)} {en?"yr":"年"}</div>
          <div>r ({en?"current dist":"現在距離"}): {oe.r.toFixed(3)} AU</div>
          <div>v ({en?"velocity":"速度"}): {oe.v.toFixed(2)} km/s</div>
          <div style={{borderTop:"1px solid rgba(160,200,255,0.15)",margin:"6px 0 4px",paddingTop:6,color:"rgba(160,210,255,0.9)"}}>{en?"☄ Perihelion forecast":"☄ 近日点予報"}</div>
          <div>{en?"Next perihelion":"次回近日点"}: {nextPeri}</div>
          <div>{en?"Days until":"残日数"}: {Math.round(oe.daysToPeri)}{en?" d":"日"} ({(oe.daysToPeri/365.25).toFixed(2)}{en?" yr":"年"})</div>
          <div title={en?"Rough estimate from heliocentric distance":"太陽距離からの推定"}>{en?"Magnitude":"推定等級"}: ≈{brightness.toFixed(1)}<sup style={{fontSize:7,color:"rgba(255,255,255,0.4)"}}> mag</sup></div>
          <div style={{marginTop:5,fontSize:8,color:"rgba(180,200,220,0.5)",whiteSpace:"pre-line"}}>{body.info}</div>
        </div>;
      }
      var oeP=computeOrbElem(body,S.current.t);
      return <div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.75)"}}>
        <div style={{color:"rgba(200,220,255,0.6)",marginBottom:3,fontSize:8}}>{bodyName}</div>
        <div>a ({en?"semi-major":"長半径"}): {oeP.a.toFixed(3)} AU</div>
        <div>e ({en?"eccentricity":"離心率"}): {oeP.e.toFixed(4)}</div>
        <div>i ({en?"inclination":"軌道傾斜"}): {oeP.i.toFixed(1)}°</div>
        <div>T ({en?"period":"公転周期"}): {oeP.T.toFixed(2)} {en?"d":"日"}</div>
        <div>M ({en?"mean anomaly":"平均近点角"}): {oeP.M.toFixed(1)}°</div>
        <div>ν ({en?"true anomaly":"真近点角"}): {oeP.nu.toFixed(1)}°</div>
        <div>r ({en?"Sun dist":"太陽距離"}): {oeP.r.toFixed(4)} AU</div>
        <div>v ({en?"velocity":"速度"}): {oeP.v.toFixed(2)} km/s</div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",margin:"6px 0 4px",paddingTop:6,color:"rgba(180,220,255,0.85)"}}>{en?"🔭 Verification":"🔭 地学検算"}</div>
        <div title="ケプラー第3法則: a³/T²＝1（AU・年）">K₃ a³/T²＝{(Math.pow(oeP.a,3)/Math.pow(oeP.T/365.25,2)).toFixed(3)} <span style={{color:"rgba(255,255,255,0.35)"}}>{en?"AU³/yr²":"AU³/年²"}</span></div>
        <div>{(function(){var Te=365.25,Tp=oeP.T;if(Math.abs(Tp-Te)<2)return en?"Synodic: ∞ (vs Earth)":"会合周期: ∞（基準: 地球）";if(Tp<Te)return (en?"Synodic: ":"会合周期: ")+(1/(1/Tp-1/Te)).toFixed(0)+(en?" d (inner)":"日（内惑星）");return (en?"Synodic: ":"会合周期: ")+(1/(1/Te-1/Tp)).toFixed(0)+(en?" d (outer)":"日（外惑星）");})()}</div>
      </div>;
    }())}
  </DragPanel>;
}
