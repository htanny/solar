import { DragPanel } from "../DragPanel.jsx";
import { QUIZ_DATA } from "../../data/solarData.js";
import { bClose } from "../../styles/panelStyles.js";

/* Difficulty selector: pick "all", "1" (beginner), "2" (intermediate), "3" (advanced) */
function pickQuestions(lv,n){
  var pool=lv==="all"?QUIZ_DATA:QUIZ_DATA.filter(function(q){return q.lv===parseInt(lv,10);});
  var sh=pool.slice().sort(function(){return Math.random()-0.5;});
  return sh.slice(0,Math.min(n,sh.length));
}

export default function QuizPanel({quizState,setQuizState,closeQuiz,startQuiz,lang,pn,bF,bT}){
  if(!quizState)return null;
  var en=lang==="en";
  /* level selection screen */
  if(quizState.lv==null){
    var levels=[{k:"1",j:"初級",e:"Beginner",col:"100,220,150",desc:"惑星の基本",dEn:"Basic facts"},{k:"2",j:"中級",e:"Intermediate",col:"100,180,255",desc:"力学・観測",dEn:"Physics & observation"},{k:"3",j:"上級",e:"Advanced",col:"255,150,90",desc:"理論・歴史",dEn:"Theory & history"},{k:"all",j:"ミックス",e:"Mixed",col:"200,150,255",desc:"全難易度",dEn:"All levels"}];
    return <DragPanel style={Object.assign({},pn,{top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:320,maxWidth:"calc(100vw - 20px)",padding:"14px 16px",zIndex:30})}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:12,fontWeight:"bold",color:"rgba(255,220,80,0.95)"}}>{en?"🎯 Quiz · pick difficulty":"🎯 クイズ · 難易度選択"}</span>
        <button aria-label={en?"Close":"閉じる"} style={bClose} onClick={closeQuiz}>✕</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>{levels.map(function(L){var qs=pickQuestions(L.k,8);return <button key={L.k} style={Object.assign({},bT(L.col),{textAlign:"left",padding:"8px 12px",fontSize:11})} onClick={function(){setQuizState({lv:L.k,questions:qs,idx:0,score:0,answered:null});}}>
        <div style={{fontWeight:"bold",fontSize:11}}>{en?L.e:L.j} <span style={{color:"rgba(255,255,255,0.5)",fontSize:9,fontWeight:"normal"}}>· {qs.length}{en?" Q":"問"}</span></div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",marginTop:2}}>{en?L.dEn:L.desc}</div>
      </button>;})}</div>
    </DragPanel>;
  }
  /* main quiz screen */
  return <DragPanel style={Object.assign({},pn,{bottom:60,left:"50%",transform:"translateX(-50%)",width:320,maxWidth:"calc(100vw - 20px)",padding:"14px 16px",zIndex:30})}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <span style={{fontSize:12,fontWeight:"bold",color:"rgba(255,220,80,0.95)"}}>{en?"🎯 Quiz ":"🎯 天体クイズ "}({quizState.idx+1}/{quizState.questions.length})</span>
      <button aria-label={en?"Close":"閉じる"} style={bClose} onClick={closeQuiz}>✕</button>
    </div>
    {quizState.idx<quizState.questions.length?(function(){var q=quizState.questions[quizState.idx],txt=en&&q.qe?q.qe:q.q,opts=en&&q.ae?q.ae:q.a,h=en&&q.hinte?q.hinte:q.hint;return <div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.92)",lineHeight:"17px",marginBottom:10}}>{txt}</div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>{opts.map(function(ans,ai){var isAnswered=quizState.answered!==null,isCorrect=ai===q.c,isChosen=ai===quizState.answered;var btnStyle=Object.assign({},bF,{textAlign:"left",padding:"6px 10px",fontSize:10,background:isAnswered?(isCorrect?"rgba(80,200,100,0.35)":isChosen?"rgba(255,80,80,0.3)":"rgba(255,255,255,0.04)"):"rgba(255,255,255,0.06)",border:isAnswered?(isCorrect?"1px solid rgba(80,200,100,0.6)":isChosen?"1px solid rgba(255,80,80,0.5)":"1px solid rgba(255,255,255,0.08)"):"1px solid rgba(255,255,255,0.15)",cursor:isAnswered?"default":"pointer"});return <button key={ai} style={btnStyle} onClick={function(){if(quizState.answered!==null)return;setQuizState(function(p){return Object.assign({},p,{answered:ai,score:ai===q.c?p.score+1:p.score});});}}>{ans}</button>;})}</div>
      {quizState.answered!==null&&<><div style={{marginTop:8,fontSize:9,color:"rgba(150,220,180,0.85)",lineHeight:"14px"}}>💡 {h}</div><button style={Object.assign({},bT("100,180,255"),{marginTop:8,width:"100%",fontSize:11,padding:"6px"})} onClick={function(){setQuizState(function(p){var next=p.idx+1;return Object.assign({},p,{idx:next,answered:null});});}}>{en?"Next →":"次の問題 →"}</button></>}
    </div>;}()):<div style={{textAlign:"center"}}>
      <div style={{fontSize:22,marginBottom:8}}>{"⭐".repeat(quizState.score)+"☆".repeat(quizState.questions.length-quizState.score)}</div>
      <div style={{fontSize:14,color:"rgba(255,220,80,1)",fontWeight:"bold",marginBottom:6}}>{quizState.score}/{quizState.questions.length} {en?"correct":"正解"}</div>
      <div style={{fontSize:10,color:"rgba(255,255,255,0.6)",marginBottom:12}}>{quizState.score===quizState.questions.length?(en?"Perfect! Earth Science Master 🏆":"完璧！地学マスター🏆"):quizState.score>=quizState.questions.length*0.6?(en?"Well done! ⭐":"よくできました！⭐"):(en?"Try again!":"もう一度チャレンジ！")}</div>
      <div style={{display:"flex",gap:6}}><button style={Object.assign({},bT("100,180,255"),{flex:1,fontSize:11,padding:"7px"})} onClick={startQuiz}>{en?"Again":"もう一度"}</button><button style={Object.assign({},bF,{flex:1,fontSize:11,padding:"7px"})} onClick={closeQuiz}>{en?"Close":"閉じる"}</button></div>
    </div>}
  </DragPanel>;
}
