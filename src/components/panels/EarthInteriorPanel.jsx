import { DragPanel } from "../DragPanel.jsx";

var LAYERS=[
  {ja:"内核（インナーコア）",  en:"Inner Core",     dFrom:0,    dTo:1220,  temp:"~5,400°C",     state:{ja:"固体",en:"solid"},           comp:{ja:"Fe-Ni 合金（固体）",        en:"solid Fe-Ni alloy"},              col:"rgba(255,220,30,1)"},
  {ja:"外核（アウターコア）",  en:"Outer Core",     dFrom:1220, dTo:3485,  temp:"4,000–5,000°C", state:{ja:"液体",en:"liquid"},          comp:{ja:"液体 Fe-Ni（ダイナモ効果→地磁場）",en:"liquid Fe-Ni (dynamo→magnetic field)"},col:"rgba(255,90,15,1)"},
  {ja:"下部マントル",          en:"Lower Mantle",   dFrom:3485, dTo:5701,  temp:"2,000–4,000°C", state:{ja:"固体（塑性流動）",en:"solid (plastic flow)"},comp:{ja:"ペロブスカイト・フェロペリクレース",en:"perovskite, ferropericlase"},col:"rgba(155,38,5,1)"},
  {ja:"上部マントル",          en:"Upper Mantle",   dFrom:5701, dTo:6340,  temp:"300–2,000°C",   state:{ja:"固体/部分融解",en:"solid/partly molten"},   comp:{ja:"橄欖岩（ペリドタイト）",    en:"peridotite (olivine)"},          col:"rgba(200,75,10,1)"},
  {ja:"地殻",                  en:"Crust",          dFrom:6340, dTo:6371,  temp:"0–1,000°C",     state:{ja:"固体",en:"solid"},           comp:{ja:"珪酸塩岩（花崗岩・玄武岩）", en:"silicate rock (granite / basalt)"},col:"rgba(85,85,85,1)"},
];

/* Exaggerated display fractions so thin layers remain visible in the SVG */
var SVG_FR=[0,0.22,0.52,0.78,0.92,1.0];
var ABBR_JA=["内核","外核","下M","上M","殻"];
var ABBR_EN=["IC","OC","LM","UM","Cr"];

export default function EarthInteriorPanel({visible,onClose,lang,isPhone,pn,bF}){
  if(!visible)return null;
  var en=lang==="en";
  var SZ=62,SCX=68,SCY=68;

  return(
    <DragPanel style={Object.assign({},pn,{
      top:isPhone?"auto":90,
      left:isPhone?0:330,
      bottom:isPhone?80:"auto",
      maxWidth:isPhone?"100%":340,
      maxHeight:"calc(100dvh - 100px)",
      overflowY:"auto",
      zIndex:30,
    })}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{color:"rgba(100,200,255,0.9)",fontWeight:"bold",fontSize:12}}>
          🌍 {en?"Earth Interior Structure":"地球内部構造"}
        </span>
        <button style={bF} onClick={onClose}>{en?"Close":"閉じる"}</button>
      </div>

      {/* SVG cross-section diagram (exaggerated scale) */}
      <svg width={SCX*2+12} height={SCY*2+24} style={{display:"block",margin:"0 auto 6px",overflow:"visible"}}>
        {/* layers outermost→innermost so inner paints on top */}
        {[4,3,2,1,0].map(function(i){
          return(
            <circle key={i} cx={SCX+6} cy={SCY+6} r={SVG_FR[i+1]*SZ}
              fill={LAYERS[i].col} stroke="rgba(255,255,255,0.15)" strokeWidth={0.5}/>
          );
        })}
        {/* boundary rings */}
        {SVG_FR.slice(1,-1).map(function(f,i){
          return <circle key={i} cx={SCX+6} cy={SCY+6} r={f*SZ} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={0.6}/>;
        })}
        {/* crosshair */}
        <line x1={SCX+6} y1={SCY+6-SZ-3} x2={SCX+6} y2={SCY+6+SZ+3} stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} strokeDasharray="2,3"/>
        <line x1={SCX+6-SZ-3} y1={SCY+6} x2={SCX+6+SZ+3} y2={SCY+6} stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} strokeDasharray="2,3"/>
        {/* abbreviated labels */}
        {[0,1,2,3,4].map(function(i){
          var midF=(SVG_FR[i]+SVG_FR[i+1])*0.5,layW=(SVG_FR[i+1]-SVG_FR[i])*SZ;
          if(layW<10)return null;
          return(
            <text key={i} x={SCX+6+midF*SZ} y={SCY+6+4}
              textAnchor="middle" fill="rgba(255,255,255,0.85)"
              fontSize={Math.min(9,layW*0.52)} fontWeight="bold"
              fontFamily="system-ui,sans-serif">
              {en?ABBR_EN[i]:ABBR_JA[i]}
            </text>
          );
        })}
        <text x={SCX+6} y={SCY+SZ+20} textAnchor="middle"
          fill="rgba(255,255,255,0.25)" fontSize={7} fontFamily="system-ui,sans-serif">
          {en?"(exaggerated scale)":"(スケール誇張)"}
        </text>
      </svg>

      {/* Layer table */}
      <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:6}}>
        {/* header */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 100px 90px 64px",gap:2,marginBottom:3,fontSize:8,color:"rgba(180,210,255,0.5)"}}>
          <div style={{paddingLeft:14}}>{en?"Layer":"層"}</div>
          <div style={{textAlign:"right"}}>{en?"Depth (km)":"深さ (km)"}</div>
          <div style={{textAlign:"right"}}>{en?"Temp":"温度"}</div>
          <div style={{paddingLeft:4}}>{en?"State":"状態"}</div>
        </div>
        {LAYERS.map(function(ly,i){
          return(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 100px 90px 64px",gap:2,alignItems:"center",padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:10,height:10,borderRadius:2,background:ly.col,flexShrink:0}}/>
                <span style={{color:"rgba(255,255,255,0.9)",fontSize:9}}>{en?ly.en:ly.ja}</span>
              </div>
              <div style={{textAlign:"right",fontSize:9,color:"rgba(200,220,255,0.75)"}}>{ly.dFrom.toLocaleString()}–{ly.dTo.toLocaleString()}</div>
              <div style={{textAlign:"right",fontSize:9,color:"rgba(255,190,120,0.85)"}}>{ly.temp}</div>
              <div style={{paddingLeft:4,fontSize:9,color:"rgba(170,220,170,0.8)"}}>{en?ly.state.en:ly.state.ja}</div>
            </div>
          );
        })}
      </div>

      {/* Composition details */}
      <div style={{marginTop:6,borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:6}}>
        <div style={{color:"rgba(180,200,255,0.45)",fontSize:8,marginBottom:4}}>{en?"Composition":"主な組成"}</div>
        {LAYERS.map(function(ly,i){
          return(
            <div key={i} style={{display:"flex",gap:5,alignItems:"flex-start",marginBottom:3}}>
              <div style={{width:8,height:8,borderRadius:1,background:ly.col,flexShrink:0,marginTop:2}}/>
              <span style={{color:"rgba(210,210,210,0.6)",fontSize:8,lineHeight:1.45}}>
                <b style={{color:"rgba(255,255,255,0.72)"}}>{en?ly.en:ly.ja}:</b> {en?ly.comp.en:ly.comp.ja}
              </span>
            </div>
          );
        })}
      </div>

      {/* Key facts */}
      <div style={{marginTop:6,borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:6,color:"rgba(170,190,230,0.42)",fontSize:8,lineHeight:1.65}}>
        {(en
          ?"• Earth radius: 6,371 km\n• Core radius: 3,485 km (54.7% of Earth)\n• Liquid outer core drives Earth's magnetic field (dynamo effect)\n• S-waves blocked by liquid outer core → seismic shadow zone"
          :"• 地球半径: 6,371 km\n• 核の半径: 3,485 km（全体の 54.7%）\n• 液体外核の対流が地球磁場を生成（ダイナモ効果）\n• S 波は液体外核を通過できない→地震波の影ゾーン"
        ).split("\n").map(function(t,i){return <div key={i}>{t}</div>;})}
      </div>
    </DragPanel>
  );
}
