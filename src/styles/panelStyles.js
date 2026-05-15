var pn={position:"absolute",background:"rgba(8,10,20,0.88)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"7px 9px",color:"rgba(255,255,255,0.9)",fontSize:11,fontFamily:"system-ui,sans-serif",zIndex:10,backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",maxWidth:"calc(100vw - 20px)",boxSizing:"border-box"};
var bF={background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,color:"rgba(255,255,255,0.75)",fontSize:10,padding:"4px 8px",cursor:"pointer",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap",outline:"none"};
var bN=Object.assign({},bF,{background:"rgba(70,140,255,0.25)",border:"1px solid rgba(70,140,255,0.45)",color:"rgba(170,210,255,1)"});
var bU=Object.assign({},bF,{background:"rgba(255,170,50,0.25)",border:"1px solid rgba(255,170,50,0.5)",color:"rgba(255,210,140,1)"});
var bD=Object.assign({},bF,{opacity:0.35,cursor:"default"});
var lb={fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:4,textTransform:"uppercase",letterSpacing:1};
var bT=function(c){return Object.assign({},bF,{background:"rgba("+c+",0.25)",border:"1px solid rgba("+c+",0.5)",color:"rgba(255,255,255,0.9)"});};

export { pn, bF, bN, bU, bD, lb, bT };
