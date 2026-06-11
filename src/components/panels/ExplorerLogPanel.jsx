import {useState,useEffect} from "react";
import {DragPanel} from "../DragPanel.jsx";
import {mobileSheet,bClose} from "../../styles/panelStyles.js";
import {EXPLORER_GROUPS,ALL_BODIES,getVisitedMap,computeBadges,nextGoal} from "../../utils/explorerLog.js";
import {explorerShareText,shareOut} from "../../utils/shareCard.js";
import {track} from "../../utils/analytics.js";

/* 探検手帳: 着陸スタンプラリー + 実績バッジ。
   訪問判定はローカル計測(landing イベント)を参照。
   既見バッジは localStorage "solar_badges" に保存し、新規獲得には NEW を表示。 */

export default function ExplorerLogPanel({visible,dispatchPanel,doLanding,lang,isPhone,pn,bF}){
  var[visited,setVisited]=useState(null);
  var[newBadges,setNewBadges]=useState({});
  var[shared,setShared]=useState(null);
  useEffect(function(){
    if(!visible)return;
    var v=getVisitedMap();
    setVisited(v);
    /* 新規獲得バッジ検出: 既見リストとの差分を NEW 表示 + 計測 */
    var seen={};
    try{(JSON.parse(localStorage.getItem("solar_badges")||"[]")).forEach(function(id){seen[id]=1;});}catch(e){}
    var fresh={};
    var earned=computeBadges(v).filter(function(r){return r.earned;}).map(function(r){return r.badge.id;});
    earned.forEach(function(id){if(!seen[id]){fresh[id]=1;track("badge_earned",{badge:id});}});
    setNewBadges(fresh);
    try{localStorage.setItem("solar_badges",JSON.stringify(earned));}catch(e){}
  },[visible]);
  if(!visible||!visited)return null;
  var en=lang==="en";
  var nVisited=ALL_BODIES.filter(function(b){return visited[b.k];}).length;
  var pct=Math.round(nVisited/ALL_BODIES.length*100);
  var badges=computeBadges(visited);
  var nEarned=badges.filter(function(r){return r.earned;}).length;
  var goal=nextGoal(visited,en);

  return <DragPanel style={Object.assign({},pn,{top:80,right:14,width:286,maxWidth:"calc(100vw - 20px)",maxHeight:"78vh",display:"flex",flexDirection:"column"},mobileSheet(isPhone))}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{fontSize:11,fontWeight:"bold",color:"rgba(160,220,170,0.95)"}}>{en?"🧭 Explorer Log":"🧭 探検手帳"}</span>
      <button aria-label={en?"Close":"閉じる"} style={bClose} onClick={function(){dispatchPanel({type:"SET",key:"explorerOpen",value:false});}}>✕</button>
    </div>

    {/* 進捗サマリー */}
    <div style={{marginBottom:4}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"rgba(255,255,255,0.6)",marginBottom:3}}>
        <span>{en?"Worlds visited":"訪問済み天体"}</span>
        <span style={{color:"rgba(160,220,170,0.95)",fontWeight:"bold"}}>{nVisited} / {ALL_BODIES.length}</span>
      </div>
      <div style={{height:7,background:"rgba(255,255,255,0.07)",borderRadius:3,overflow:"hidden"}}>
        <div style={{width:pct+"%",height:"100%",background:"linear-gradient(90deg,rgba(100,200,140,0.7),rgba(160,230,180,0.9))",borderRadius:3}}/>
      </div>
      {goal&&<div style={{fontSize:9,color:"rgba(255,215,120,0.85)",marginTop:4}}>{goal}</div>}
    </div>

    <div style={{overflowY:"auto",flex:1}}>
      {/* 天体スタンプグリッド */}
      {EXPLORER_GROUPS.map(function(g){
        return <div key={g.grp} style={{marginTop:7}}>
          <div style={{fontSize:8,color:"rgba("+g.col+",0.7)",letterSpacing:1,marginBottom:3}}>{en?g.grpE:g.grp}</div>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {g.bodies.map(function(b){
              var done=!!visited[b.k];
              return <button key={b.k} title={done?(en?"Visited — land again":"訪問済み — 再着陸"):(en?"Not yet visited — land now":"未訪問 — 着陸する")}
                onClick={function(){doLanding(b.k);dispatchPanel({type:"SET",key:"explorerOpen",value:false});}}
                style={Object.assign({},bF,{fontSize:9,padding:"3px 7px",
                  border:"1px solid rgba("+(done?g.col:"255,255,255")+","+(done?0.55:0.14)+")",
                  color:done?"rgba("+g.col+",1)":"rgba(255,255,255,0.35)",
                  background:done?"rgba("+g.col+",0.10)":"rgba(255,255,255,0.03)"})}>
                {done?"✓ ":""}{en?b.e:b.j}
              </button>;
            })}
          </div>
        </div>;
      })}

      {/* 実績バッジ */}
      <div style={{fontSize:8,color:"rgba(255,255,255,0.32)",letterSpacing:1,textTransform:"uppercase",marginTop:12,marginBottom:4}}>
        {(en?"🎖 Badges":"🎖 実績バッジ")+" "+nEarned+"/"+badges.length}
      </div>
      {badges.map(function(r){
        var bd=r.badge;
        return <div key={bd.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,opacity:r.earned?1:0.45}}>
          <span style={{fontSize:13,filter:r.earned?"none":"grayscale(1)"}}>{bd.ic}</span>
          <span style={{flex:1,fontSize:9,color:r.earned?"rgba(255,220,140,0.95)":"rgba(255,255,255,0.55)",lineHeight:1.4}}>
            {en?bd.e:bd.j}
            {newBadges[bd.id]&&<span style={{marginLeft:5,fontSize:8,color:"rgba(255,160,80,1)",fontWeight:"bold"}}>NEW!</span>}
          </span>
          <span style={{fontSize:8,color:"rgba(255,255,255,0.4)",flexShrink:0}}>{r.have}/{r.total}</span>
        </div>;
      })}
    </div>

    {/* 実績を共有 */}
    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8,paddingTop:7,borderTop:"1px solid rgba(255,255,255,0.07)"}}>
      <button style={Object.assign({},bF,{fontSize:9,flex:1})} onClick={function(){
        shareOut(explorerShareText(visited,en)).then(function(method){
          if(method){
            track("share_card",{source:"explorer",method:method});
            setShared(method);
            setTimeout(function(){setShared(null);},2500);
          }
        });
      }}>📤 {en?"Share progress":"実績を共有"}</button>
      {shared&&<span style={{fontSize:9,color:"rgba(160,220,170,0.9)",flexShrink:0}}>
        {shared==="clipboard"?(en?"Copied!":"コピーしました！"):(en?"Shared!":"共有しました！")}
      </span>}
    </div>
  </DragPanel>;
}
