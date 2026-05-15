var PANEL_INIT={showEvents:false,showDate:false,searchOpen:false,dispColl:false,exoOpen:false,nightSkyOpen:false,bookOpen:false,moonCal:false,orbElemOpen:false,importMode:false};
function panelReducer(state,action){if(action.type==="TOGGLE")return Object.assign({},state,{[action.key]:!state[action.key]});if(action.type==="SET")return Object.assign({},state,{[action.key]:action.value});return state;}

export { PANEL_INIT, panelReducer };
