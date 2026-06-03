import { DragPanel } from "../DragPanel.jsx";
import { mobileSheet, bClose } from "../../styles/panelStyles.js";

var SAT_GROUPS=[
  {grp:"地球系",grpE:"Earth system",col:"180,210,255",items:[{k:"Moon",j:"月",e:"Moon"}]},
  {grp:"火星系",grpE:"Mars system",col:"200,130,80",items:[{k:"Phobos",j:"フォボス",e:"Phobos"}]},
  {grp:"木星のガリレオ衛星",grpE:"Jupiter (Galilean)",col:"220,200,100",items:[{k:"Io",j:"イオ",e:"Io"},{k:"Europa",j:"エウロパ",e:"Europa"},{k:"Ganymede",j:"ガニメデ",e:"Ganymede"},{k:"Callisto",j:"カリスト",e:"Callisto"}]},
  {grp:"土星系",grpE:"Saturn",col:"218,168,88",items:[{k:"Titan",j:"タイタン",e:"Titan"},{k:"Enceladus",j:"エンケラドゥス",e:"Enceladus"}]},
  {grp:"天王星系",grpE:"Uranus",col:"150,218,225",items:[{k:"Miranda",j:"ミランダ",e:"Miranda"}]},
  {grp:"海王星系",grpE:"Neptune",col:"205,190,178",items:[{k:"Triton",j:"トリトン",e:"Triton"}]},
  {grp:"冥王星系",grpE:"Pluto",col:"195,175,150",items:[{k:"Charon",j:"カロン",e:"Charon"}]},
  {grp:"小惑星",grpE:"Asteroids",col:"168,140,108",items:[{k:"Itokawa",j:"イトカワ",e:"Itokawa"},{k:"Ryugu",j:"リュウグウ",e:"Ryugu"}]},
  {grp:"彗星核",grpE:"Comet nucleus",col:"140,190,255",items:[{k:"HalleyCore",j:"ハレー彗星核",e:"Halley nucleus"}]},
];

export default function SatellitePanel({visible,dispatchPanel,doLanding,isPhone,lang,pn,bF}){
  if(!visible)return null;
  var en=lang==="en";
  return <DragPanel style={Object.assign({},pn,{top:80,left:isPhone?10:240,width:240,maxWidth:"calc(100vw - 20px)",padding:"10px 12px",maxHeight:"70vh",display:"flex",flexDirection:"column"},mobileSheet(isPhone))}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:11,fontWeight:"bold",color:"rgba(180,210,255,0.95)"}}>{en?"🛰 Moons/SSSB → Land":"🛰 衛星・小天体 → 着陸"}</span><button aria-label={en?"Close":"閉じる"} style={bClose} onClick={function(){dispatchPanel({type:"SET",key:"satOpen",value:false});}}>✕</button></div><div style={{overflowY:"auto",flex:1}}>{SAT_GROUPS.map(function(g){return <div key={g.grp} style={{marginBottom:6}}><div style={{fontSize:9,color:"rgba("+g.col+",0.7)",marginBottom:3}}>{en?g.grpE:g.grp}</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{g.items.map(function(it){return <button key={it.k} style={Object.assign({},bF,{fontSize:9,padding:"3px 7px",border:"1px solid rgba("+g.col+",0.45)",color:"rgba("+g.col+",1)"})} onClick={function(){doLanding(it.k);dispatchPanel({type:"SET",key:"satOpen",value:false});}}>{en?(it.e||it.j):it.j}</button>;})}</div></div>;})}</div></DragPanel>;
}
