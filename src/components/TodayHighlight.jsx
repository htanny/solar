import { useState, useEffect } from "react";
import { track } from "../utils/analytics.js";
import { pickSuggestion } from "../utils/todayHighlight.js";

/* 「今日のみどころ」カード。提案ロジックは utils/todayHighlight.js を参照。
   1日1回表示（localStorage "solar_today" に最終表示日を保存）。 */

export default function TodayHighlight({lang,S,doLanding}){
  var en=lang==="en";
  var todayStr=new Date().toISOString().slice(0,10);
  var[dismissed,setDismissed]=useState(function(){
    try{return localStorage.getItem("solar_today")===todayStr;}catch(e){return false;}
  });
  var[sug]=useState(function(){return dismissed?null:pickSuggestion(S.current.t);});
  useEffect(function(){if(sug)track("today_card",{action:"shown",kind:sug.kind});},[sug]);
  if(dismissed||!sug)return null;
  var close=function(action){
    try{localStorage.setItem("solar_today",todayStr);}catch(e){}
    track("today_card",{action:action,kind:sug.kind});
    setDismissed(true);
  };
  var go=function(){
    if(sug.kind==="event"){S.current.t=sug.ev.t;}
    else{doLanding(sug.s.k);}
    close("go");
  };
  var icon=sug.kind==="event"?sug.ev.ic:"🚀";
  var title=en?"Today's highlight":"今日のみどころ";
  var body=sug.kind==="event"
    ?(en?sug.ev.n+" — "+sug.ev.date:sug.ev.n+"（"+sug.ev.date+"）")
    :(en?sug.s.e:sug.s.j);
  var goLabel=sug.kind==="event"?(en?"Jump to date":"その日へ移動"):(en?"Land now":"着陸する");
  return <div style={{position:"absolute",bottom:84,left:"50%",transform:"translateX(-50%)",zIndex:60,
    background:"rgba(10,14,28,0.94)",border:"1px solid rgba(255,210,100,0.35)",borderRadius:10,
    padding:"9px 12px",maxWidth:340,width:"calc(100vw - 30px)",fontFamily:"system-ui,sans-serif",
    boxShadow:"0 4px 18px rgba(0,0,0,0.5)"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
      <span style={{fontSize:13}}>{icon}</span>
      <span style={{fontSize:10,fontWeight:"bold",color:"rgba(255,215,120,0.95)",flex:1}}>{title}</span>
      <button aria-label={en?"Close":"閉じる"} onClick={function(){close("dismiss");}}
        style={{background:"none",border:"none",color:"rgba(255,255,255,0.45)",cursor:"pointer",fontSize:11,padding:"0 2px"}}>✕</button>
    </div>
    <div style={{fontSize:10,color:"rgba(255,255,255,0.82)",lineHeight:1.55,marginBottom:7}}>{body}</div>
    <div style={{display:"flex",justifyContent:"flex-end",gap:6}}>
      <button onClick={function(){close("dismiss");}}
        style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:5,
        color:"rgba(255,255,255,0.6)",fontSize:9,padding:"3px 10px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>{en?"Later":"また今度"}</button>
      <button onClick={go}
        style={{background:"rgba(255,200,80,0.18)",border:"1px solid rgba(255,200,80,0.5)",borderRadius:5,
        color:"rgba(255,220,130,1)",fontSize:9,padding:"3px 12px",cursor:"pointer",fontFamily:"system-ui,sans-serif",fontWeight:"bold"}}>{goLabel}</button>
    </div>
  </div>;
}
