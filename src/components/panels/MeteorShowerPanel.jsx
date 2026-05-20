import { DragPanel } from "../DragPanel.jsx";
import { MSHW } from "../../data/solarData.js";
import { simDaysToDate } from "../../utils/timeUtils.js";
import { mobileSheet, bClose } from "../../styles/panelStyles.js";

var EN={
  "しぶんぎ座":"Quadrantids","こと座":"Lyrids","みずがめ座η":"η-Aquariids",
  "ペルセウス座":"Perseids","オリオン座":"Orionids","しし座":"Leonids","ふたご座":"Geminids"
};

function dayOfYear(t){
  var ds=simDaysToDate(t),p=ds.split("-");
  var d1=new Date(+p[0],0,1),d2=new Date(+p[0],+p[1]-1,+p[2]);
  return Math.round((d2-d1)/86400000)+1;
}

export default function MeteorShowerPanel({visible,dispatchPanel,S,isPhone,lang,pn,bF}){
  if(!visible)return null;
  var en=lang==="en";
  var now=S.current.t,dy=dayOfYear(now);

  var items=MSHW.map(function(ms){
    var diff=ms.d-dy;
    if(diff<-10)diff+=365;
    return{ms:ms,daysUntil:diff,peakDate:simDaysToDate(now+diff)};
  }).sort(function(a,b){return a.daysUntil-b.daysUntil;});

  return <DragPanel style={Object.assign({},pn,{top:isPhone?160:80,right:isPhone?10:200,width:220,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"},mobileSheet(isPhone))}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{fontSize:11,fontWeight:"bold",color:"rgba(180,220,255,0.95)"}}>{"🌠 "+(en?"Meteor Shower Calendar":"流星群カレンダー")}</span>
      <button aria-label={en?"Close":"閉じる"} style={bClose} onClick={function(){dispatchPanel({type:"SET",key:"meteorOpen",value:false});}}>✕</button>
    </div>
    <div style={{fontSize:8,color:"rgba(180,200,255,0.5)",marginBottom:8}}>{en?"Peak ZHR = max meteors/hour under ideal conditions":"ZHR = 理想条件での1時間あたり最大流星数"}</div>
    <div style={{maxHeight:260,overflowY:"auto"}}>
      {items.map(function(item,i){
        var isNext=i===0&&item.daysUntil>=0;
        var isPast=item.daysUntil<0;
        return <div key={item.ms.n} style={{display:"flex",alignItems:"center",padding:"5px 4px",borderBottom:"1px solid rgba(255,255,255,0.06)",opacity:isPast?0.45:1,background:isNext?"rgba(100,180,255,0.08)":"transparent",borderRadius:isNext?4:0}}>
          <div style={{width:28,textAlign:"center",fontSize:16}}>🌠</div>
          <div style={{flex:1,marginLeft:4}}>
            <div style={{fontSize:9,fontWeight:"bold",color:isNext?"rgba(140,210,255,0.98)":"rgba(220,230,255,0.85)"}}>{en?(EN[item.ms.n]||item.ms.n):item.ms.n+"流星群"}</div>
            <div style={{fontSize:8,color:"rgba(180,200,255,0.55)"}}>{item.peakDate} · ZHR {item.ms.rate}</div>
          </div>
          <div style={{fontSize:8,textAlign:"right",color:isNext?"rgba(100,200,255,0.9)":isPast?"rgba(255,255,255,0.3)":"rgba(200,220,255,0.6)"}}>
            {item.daysUntil>=0?"+"+item.daysUntil+"d":Math.abs(item.daysUntil)+"d ago"}
          </div>
        </div>;
      })}
    </div>
  </DragPanel>;
}
