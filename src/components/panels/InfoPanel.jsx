import { DragPanel } from "../DragPanel.jsx";
import { SUNINFO } from "../../data/solarData.js";
import { bClose } from "../../styles/panelStyles.js";

export default function InfoPanel({visible,info,lang,touring,doLanding,setInfo,moonGeoData,planetGeoData,pn,bF,bT,bD,isPhone}){
  if(!visible||!info)return null;
  var en=lang==="en";
  var L={
    mass:en?"Mass":"質量",
    radius:en?"Radius":"半径",
    temp:en?"Surface temp":"表面温度",
    type:en?"Class":"分類",
    age:en?"Age":"年齢",
    grav:en?"Gravity":"重力",
    solDay:en?"Solar day":"太陽日",
    sidMonth:en?"Sidereal month":"恒星月",
    synMonth:en?"Synodic month":"朔望月",
    distEarth:en?"Avg dist from Earth":"地球からの平均距離",
    atm:en?"Atmosphere":"大気",
    airTemp:en?"Temperature":"気温",
    tilt:en?"Axial tilt":"地軸傾斜",
    ecl:en?"1.54° to ecliptic":"公転面に対し1.54°",
    landings:en?"Crewed landings":"有人着陸",
    live:en?"Live data":"現在のデータ",
    phase:en?"Phase":"月相",
    moonAge:en?"Moon age":"月齢",
    illum:en?"Illumination":"輝面比",
    dist:en?"Distance":"距離",
    angSize:en?"Angular diameter":"視直径",
    mag:en?"Magnitude":"等級",
    rot:en?"Rotation":"自転",
    orbit:en?"Orbital period":"公転",
    moons:en?"Moons":"衛星",
    sunDist:en?"Sun distance":"太陽距離",
    physical:en?"Physical data":"地学データ",
    dens:en?"Density":"密度",
    esc:en?"Escape velocity":"脱出速度",
    alb:en?"Albedo":"アルベド",
    fromEarth:en?"From Earth (live)":"地球から（現在）",
    ltt:en?"Light travel":"光の到達",
    ph:en?"Phase":"位相",
    phAng:en?"phase angle":"位相角",
    stopTour:en?"🚀 Stop Tour First":"🚀 ツアー停止後に着陸可",
    landMoon:en?"🚀 Land on Moon":"🚀 月面に着陸",
    land:en?"🚀 Land":"🚀 着陸",
  };
  var unitMoons=en?"":"個";
  var unitMkm=en?" Mkm":"百万km";
  function fmtLtt(s){
    if(en){if(s<60)return s.toFixed(0)+" s";if(s<3600)return (s/60).toFixed(1)+" min";return (s/3600).toFixed(1)+" h";}
    if(s<60)return s.toFixed(0)+"秒";if(s<3600)return (s/60).toFixed(1)+"分";return (s/3600).toFixed(1)+"時間";
  }
  var title=info.type==="sun"?(en?"Sun":SUNINFO.j):info.type==="comet"?info.cm.name:(en?info.pl.n:info.pl.j);
  return <DragPanel style={Object.assign({},pn,{top:isPhone?160:80,right:10,width:isPhone?170:180,maxWidth:"calc(100vw - 20px)",maxHeight:isPhone?"calc(100vh - 240px)":"none",overflowY:isPhone?"auto":"visible",padding:"10px 12px"})}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{fontSize:13,fontWeight:"bold",color:"rgba(255,255,255,0.95)"}}>{title}</span>
      <button aria-label={en?"Close":"閉じる"} style={bClose} onClick={function(){setInfo(null);}}>✕</button>
    </div>
    {info.type==="sun"?<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)"}}>
      <div>{L.mass}: {SUNINFO.mass}</div>
      <div>{L.radius}: {SUNINFO.r}</div>
      <div>{L.temp}: {SUNINFO.temp}</div>
      <div>{L.type}: {SUNINFO.type}</div>
      <div>{L.age}: {SUNINFO.age}</div>
    </div>:info.type==="comet"?<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)",whiteSpace:"pre-line"}}>{info.cm.info}</div>:info.pl.n==="Moon"?<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)"}}>
      <div>{L.mass}: {info.pl.mass}</div>
      <div>{L.radius}: {(info.pl.r*1000).toLocaleString()} km</div>
      <div>{L.grav}: {info.pl.grav}</div>
      <div>{L.solDay}: {info.pl.day}</div>
      <div>{L.sidMonth}: {info.pl.year}</div>
      <div>{L.synMonth}: {info.pl.synPeriod}</div>
      <div>{L.distEarth}: {info.pl.distEarth}</div>
      <div>{L.atm}: {info.pl.atm}</div>
      <div>{L.airTemp}: {info.pl.temp}</div>
      <div>{L.tilt}: {info.pl.t}°（{L.ecl}）</div>
      <div style={{fontSize:8,color:"rgba(255,255,255,0.45)",marginTop:3,lineHeight:"13px"}}>{L.landings}: {info.pl.landingsInfo}</div>
      {(function(){var m=moonGeoData();return <>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",margin:"6px 0 4px",paddingTop:6,fontSize:9,color:"rgba(220,220,180,0.85)"}}>{L.live}</div>
        <div>{L.phase}: {m.phaseName}</div>
        <div>{L.moonAge}: {m.age.toFixed(1)}{en?" d":"日"}</div>
        <div>{L.illum}: {(m.phaseFrac*100).toFixed(0)}%</div>
        <div>{L.dist}: {(m.distKm/10000).toFixed(2)}{en?"×10⁴ km":"万km"}</div>
        <div>{L.angSize}: {m.angSizeDeg.toFixed(3)}°</div>
        <div>{L.mag}: {m.mag.toFixed(1)}{en?" mag":"等"}</div>
      </>;})()}
      <button style={Object.assign({},touring?bD:bT("180,180,200"),{marginTop:8,width:"100%",fontSize:11,padding:"6px"})} disabled={touring} onClick={function(){if(!touring)doLanding("Moon");}}>{touring?L.stopTour:L.landMoon}</button>
    </div>:<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)"}}>
      <div>{L.mass}: {info.pl.mass}</div>
      <div>{L.radius}: {(info.pl.r*1000).toLocaleString()} km</div>
      <div>{L.grav}: {info.pl.grav}</div>
      <div>{L.rot}: {info.pl.day}</div>
      <div>{L.orbit}: {info.pl.year}</div>
      <div>{L.moons}: {info.pl.moons}{unitMoons}</div>
      <div>{L.atm}: {info.pl.atm}</div>
      <div>{L.airTemp}: {info.pl.temp}</div>
      <div>{L.tilt}: {info.pl.t}°</div>
      <div>{L.sunDist}: {info.pl.d}{unitMkm}</div>
      {info.pl.dens&&<>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",margin:"6px 0 4px",paddingTop:6,fontSize:9,color:"rgba(150,220,180,0.8)"}}>{L.physical}</div>
        <div>{L.dens}: {info.pl.dens} g/cm³</div>
        <div>{L.esc}: {info.pl.esc} km/s</div>
        <div>{L.alb}: {(info.pl.alb*100).toFixed(0)}%</div>
      </>}
      {(function(){var g=planetGeoData(info.pl);return <>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.1)",margin:"6px 0 4px",paddingTop:6,fontSize:9,color:"rgba(255,220,140,0.8)"}}>{L.fromEarth}</div>
        <div>{L.dist}: {g.au.toFixed(2)} AU ({g.d.toFixed(0)}{unitMkm})</div>
        <div>{L.ltt}: {fmtLtt(g.lt)}</div>
        <div>{L.angSize}: {g.ang.toFixed(1)}″</div>
        <div>{L.mag}: {g.mag.toFixed(1)}{en?" mag":"等"}</div>
        {(info.pl.n==="Mercury"||info.pl.n==="Venus")&&<div>{L.ph}: {(g.phaseFrac*100).toFixed(0)}%（{L.phAng} {g.phaseDeg.toFixed(0)}°）</div>}
      </>;})()}
      <button style={Object.assign({},touring?bD:bT("100,180,255"),{marginTop:8,width:"100%",fontSize:11,padding:"6px"})} disabled={touring} onClick={function(){if(!touring)doLanding(info.pl.n);}}>{touring?L.stopTour:L.land}</button>
    </div>}
  </DragPanel>;
}
