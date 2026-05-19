import { DragPanel } from "../DragPanel.jsx";
import { bClose, mobileSheet } from "../../styles/panelStyles.js";

/* キーボードショートカット・ジェスチャ一覧。? キーまたはヘルプボタンで開閉 */
export default function HelpPanel({visible,dispatchPanel,lang,isPhone,pn,bF}){
  if(!visible)return null;
  var en=lang==="en";
  var keys=[
    {k:"Space",j:"再生 / 一時停止",e:"Play / Pause"},
    {k:"← →",j:"再生速度 -/+",e:"Speed -/+"},
    {k:"0",j:"全体表示",e:"Show all"},
    {k:"S",j:"太陽フォーカス",e:"Focus Sun"},
    {k:"1-8",j:"惑星フォーカス（水〜海王星）",e:"Focus planet (Mercury–Neptune)"},
    {k:"9",j:"ハレー彗星",e:"Halley's Comet"},
    {k:"E",j:"エンケ彗星",e:"Encke's Comet"},
    {k:"+ / -",j:"ズーム拡大 / 縮小（着陸時はFOV）",e:"Zoom in / out (FOV in landing)"},
    {k:"G",j:"銀河ビュー ↔ 太陽系ビュー",e:"Galaxy ↔ Solar system view"},
    {k:"L",j:"着陸 / 離陸",e:"Land / Liftoff"},
    {k:"T",j:"学習ツアー開始 / 停止",e:"Tour start / stop"},
    {k:"C",j:"惑星サイズ比較モード",e:"Compare planets mode"},
    {k:"M",j:"BGM 切替",e:"BGM toggle"},
    {k:"Esc",j:"着陸を抜ける",e:"Exit landing"},
    {k:"?",j:"このヘルプを開閉",e:"Toggle this help"},
  ];
  var gestures=[
    {g:en?"Drag":"ドラッグ",d:en?"Rotate camera (orbit) / Look around (landing)":"視点回転（軌道）/ 見回し（着陸）"},
    {g:en?"Wheel / Pinch":"ホイール / ピンチ",d:en?"Zoom (orbit) / FOV (landing)":"ズーム（軌道）/ FOV（着陸）"},
    {g:en?"3-finger swipe":"3本指スワイプ",d:en?"Next / previous focus":"次/前の天体にフォーカス"},
    {g:en?"Click body":"天体クリック",d:en?"Focus + show info":"フォーカス + 情報表示"},
  ];
  var rowS={display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:9,lineHeight:1.4};
  var kbdS={fontFamily:"monospace",background:"rgba(100,180,255,0.18)",border:"1px solid rgba(100,180,255,0.35)",borderRadius:3,padding:"1px 5px",color:"rgba(180,220,255,0.95)",fontSize:9,minWidth:38,textAlign:"center",flexShrink:0};
  var secS={fontSize:9,color:"rgba(180,220,255,0.7)",marginTop:8,marginBottom:3,letterSpacing:1};
  return <DragPanel style={Object.assign({},pn,{top:isPhone?60:60,left:"50%",transform:"translateX(-50%)",width:300,maxWidth:"calc(100vw - 20px)",maxHeight:"calc(100vh - 120px)",overflowY:"auto",padding:"10px 12px",zIndex:30},mobileSheet(isPhone))}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{fontSize:11,fontWeight:"bold",color:"rgba(180,220,255,0.95)"}}>{en?"⌨ Keyboard / Gestures":"⌨ ショートカット一覧"}</span>
      <button aria-label={en?"Close":"閉じる"} style={bClose} onClick={function(){dispatchPanel({type:"SET",key:"helpOpen",value:false});}}>✕</button>
    </div>
    <div style={secS}>{en?"KEYBOARD":"キーボード"}</div>
    {keys.map(function(it){return <div key={it.k} style={rowS}>
      <span style={kbdS}>{it.k}</span>
      <span style={{flex:1,marginLeft:8,color:"rgba(255,255,255,0.78)"}}>{en?it.e:it.j}</span>
    </div>;})}
    <div style={secS}>{en?"MOUSE / TOUCH":"マウス / タッチ"}</div>
    {gestures.map(function(it){return <div key={it.g} style={rowS}>
      <span style={Object.assign({},kbdS,{minWidth:80})}>{it.g}</span>
      <span style={{flex:1,marginLeft:8,color:"rgba(255,255,255,0.78)"}}>{it.d}</span>
    </div>;})}
  </DragPanel>;
}
