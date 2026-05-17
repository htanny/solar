import { DragPanel } from "../DragPanel.jsx";

var SAT_GROUPS=[
  {grp:"地球系",col:"180,210,255",items:[{k:"Moon",j:"月",e:"Moon"}]},
  {grp:"木星のガリレオ衛星",col:"220,200,100",items:[{k:"Io",j:"イオ"},{k:"Europa",j:"エウロパ"},{k:"Ganymede",j:"ガニメデ"},{k:"Callisto",j:"カリスト"}]},
  {grp:"土星系",col:"218,168,88",items:[{k:"Titan",j:"タイタン"}]},
  {grp:"海王星系",col:"205,190,178",items:[{k:"Triton",j:"トリトン"}]},
  {grp:"冥王星系",col:"195,175,150",items:[{k:"Charon",j:"カロン"}]},
  {grp:"小惑星",col:"168,140,108",items:[{k:"Itokawa",j:"イトカワ"},{k:"Ryugu",j:"リュウグウ"}]},
  {grp:"彗星核",col:"140,190,255",items:[{k:"HalleyCore",j:"ハレー彗星核"}]},
];

export default function SatellitePanel({visible,dispatchPanel,doLanding,isPhone,pn,bF}){
  if(!visible)return null;
  return <DragPanel style={Object.assign({},pn,{top:80,left:isPhone?10:240,width:240,maxWidth:"calc(100vw - 20px)",padding:"10px 12px",maxHeight:"70vh",display:"flex",flexDirection:"column"})}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:11,fontWeight:"bold",color:"rgba(180,210,255,0.95)"}}>🛰 衛星・小天体 → 着陸</span><button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){dispatchPanel({type:"SET",key:"satOpen",value:false});}}>✕</button></div><div style={{overflowY:"auto",flex:1}}>{SAT_GROUPS.map(function(g){return <div key={g.grp} style={{marginBottom:6}}><div style={{fontSize:9,color:"rgba("+g.col+",0.7)",marginBottom:3}}>{g.grp}</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{g.items.map(function(it){return <button key={it.k} style={Object.assign({},bF,{fontSize:9,padding:"3px 7px",border:"1px solid rgba("+g.col+",0.45)",color:"rgba("+g.col+",1)"})} onClick={function(){doLanding(it.k);dispatchPanel({type:"SET",key:"satOpen",value:false});}}>{it.j}</button>;})}</div></div>;})}</div></DragPanel>;
}
