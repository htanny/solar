import { useState, useEffect } from "react";
import { track } from "../utils/analytics.js";

/* PWAインストール促進バナー。
   beforeinstallprompt を捕捉し、8秒後に右下に表示（TodayHighlight との衝突回避）。
   localStorage "solar_pwa_dismissed" で非表示化を永続。 */

export default function InstallPrompt({lang}){
  var en=lang==="en";
  var[prompt,setPrompt]=useState(null);
  var[visible,setVisible]=useState(false);
  useEffect(function(){
    try{if(localStorage.getItem("solar_pwa_dismissed"))return;}catch(e){}
    var deferred=null;
    var timer=null;
    var handler=function(e){
      e.preventDefault();
      deferred=e;
      /* 8秒待ってから表示(TodayHighlight が先に処理されるよう) */
      timer=setTimeout(function(){
        try{if(localStorage.getItem("solar_pwa_dismissed"))return;}catch(ex){}
        setPrompt(deferred);
        setVisible(true);
        track("pwa_install",{action:"shown"});
      },8000);
    };
    window.addEventListener("beforeinstallprompt",handler);
    return function(){
      window.removeEventListener("beforeinstallprompt",handler);
      if(timer)clearTimeout(timer);
    };
  },[]);
  if(!visible)return null;
  var dismiss=function(){
    try{localStorage.setItem("solar_pwa_dismissed","1");}catch(e){}
    track("pwa_install",{action:"dismiss"});
    setVisible(false);
  };
  var install=function(){
    if(!prompt)return;
    prompt.prompt();
    prompt.userChoice.then(function(r){
      track("pwa_install",{action:r.outcome==="accepted"?"installed":"declined"});
    });
    try{localStorage.setItem("solar_pwa_dismissed","1");}catch(e){}
    setVisible(false);
  };
  return <div style={{position:"absolute",bottom:84,right:12,zIndex:59,
    background:"rgba(10,14,28,0.94)",border:"1px solid rgba(100,180,255,0.28)",borderRadius:10,
    padding:"9px 12px",maxWidth:220,fontFamily:"system-ui,sans-serif",
    boxShadow:"0 4px 18px rgba(0,0,0,0.5)"}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
      <span style={{fontSize:13}}>📲</span>
      <span style={{fontSize:10,fontWeight:"bold",color:"rgba(100,180,255,0.95)",flex:1}}>
        {en?"Install app":"アプリをインストール"}
      </span>
      <button aria-label={en?"Close":"閉じる"} onClick={dismiss}
        style={{background:"none",border:"none",color:"rgba(255,255,255,0.45)",cursor:"pointer",fontSize:11,padding:"0 2px"}}>✕</button>
    </div>
    <div style={{fontSize:10,color:"rgba(255,255,255,0.72)",lineHeight:1.55,marginBottom:7}}>
      {en?"Add to home screen for offline access":"ホーム画面に追加してオフラインでも使用"}
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",gap:6}}>
      <button onClick={dismiss}
        style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:5,
        color:"rgba(255,255,255,0.6)",fontSize:9,padding:"3px 10px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>
        {en?"Later":"後で"}
      </button>
      <button onClick={install}
        style={{background:"rgba(80,150,255,0.18)",border:"1px solid rgba(80,150,255,0.5)",borderRadius:5,
        color:"rgba(120,180,255,1)",fontSize:9,padding:"3px 12px",cursor:"pointer",fontFamily:"system-ui,sans-serif",fontWeight:"bold"}}>
        {en?"Install":"追加"}
      </button>
    </div>
  </div>;
}
