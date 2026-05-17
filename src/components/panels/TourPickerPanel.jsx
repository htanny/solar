import { DragPanel } from "../DragPanel.jsx";

export default function TourPickerPanel({visible,dispatchPanel,startTourLv,lang,pn,bF}){
  if(!visible)return null;
  var en=lang==="en";
  var levels=[
    {k:"beg",j:"初級",e:"Beginner",col:"100,220,150",desc:"惑星のシンプル紹介。子供・入門に",dEn:"Simple intro to each planet"},
    {k:"int",j:"中級",e:"Intermediate",col:"100,180,255",desc:"標準コース。物理量・衛星数など",dEn:"Standard tour with key facts"},
    {k:"adv",j:"上級",e:"Advanced",col:"255,150,90",desc:"物理量・観測史・最新の研究",dEn:"Physics, observation history, research"},
  ];
  return <DragPanel style={Object.assign({},pn,{top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:340,maxWidth:"calc(100vw - 20px)",padding:"14px 16px",zIndex:30})}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <span style={{fontSize:12,fontWeight:"bold",color:"rgba(200,100,255,0.95)"}}>{en?"🎓 Pick Tour Level":"🎓 学習ツアー · レベル選択"}</span>
      <button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){dispatchPanel({type:"SET",key:"tourPick",value:false});}}>✕</button>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>{levels.map(function(L){return <button key={L.k} style={Object.assign({},bF,{background:"rgba("+L.col+",0.18)",border:"1px solid rgba("+L.col+",0.45)",textAlign:"left",padding:"8px 12px",fontSize:11})} onClick={function(){startTourLv(L.k);dispatchPanel({type:"SET",key:"tourPick",value:false});}}>
      <div style={{fontWeight:"bold",fontSize:11,color:"rgba("+L.col+",1)"}}>{en?L.e:L.j}</div>
      <div style={{fontSize:9,color:"rgba(255,255,255,0.6)",marginTop:2,lineHeight:"13px"}}>{en?L.dEn:L.desc}</div>
    </button>;})}</div>
    <div style={{marginTop:10,fontSize:8,color:"rgba(255,255,255,0.35)",lineHeight:"12px"}}>{en?"Tour visits Sun → 8 planets → 2 comets in sequence, with explanatory text at each stop.":"太陽→8惑星→2彗星の順に巡り、各地点で解説が表示されます。"}</div>
  </DragPanel>;
}
