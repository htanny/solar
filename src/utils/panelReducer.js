var PANEL_INIT={showEvents:false,showDate:false,searchOpen:false,dispColl:false,exoOpen:false,nightSkyOpen:false,bookOpen:false,moonCal:false,meteorOpen:false,orbElemOpen:false,importMode:false,compareTable:false,satOpen:false,tourPick:false,helpOpen:false,analyticsOpen:false,explorerOpen:false,examOpen:false};
/* Mutually-exclusive panel set: only one open at a time (used on phone) */
var EXCLUSIVE_KEYS=["showEvents","searchOpen","exoOpen","nightSkyOpen","bookOpen","moonCal","meteorOpen","orbElemOpen","compareTable","satOpen","tourPick","helpOpen","analyticsOpen","explorerOpen","examOpen"];
function panelReducer(state,action){
  if(action.type==="TOGGLE")return Object.assign({},state,{[action.key]:!state[action.key]});
  if(action.type==="SET")return Object.assign({},state,{[action.key]:action.value});
  if(action.type==="TOGGLE_EX"){
    var next=Object.assign({},state),val=!state[action.key];
    if(val){for(var i=0;i<EXCLUSIVE_KEYS.length;i++){var k=EXCLUSIVE_KEYS[i];if(k!==action.key)next[k]=false;}}
    next[action.key]=val;return next;
  }
  if(action.type==="CLOSE_ALL"){var n2=Object.assign({},state);for(var j=0;j<EXCLUSIVE_KEYS.length;j++)n2[EXCLUSIVE_KEYS[j]]=false;return n2;}
  return state;
}

export { PANEL_INIT, panelReducer };
