var _MAX=500;
var _KEY="solar_analytics";

function _load(){try{return JSON.parse(localStorage.getItem(_KEY)||"{}");}catch(e){return{};}}
function _save(d){try{localStorage.setItem(_KEY,JSON.stringify(d));}catch(e){}}

export function track(ev,payload){
  var d=_load();
  if(!d.events)d.events=[];
  d.events.push(Object.assign({ev:ev,ts:Date.now()},payload||{}));
  if(d.events.length>_MAX)d.events=d.events.slice(-_MAX);
  _save(d);
}

export function getAnalytics(){return _load();}

export function clearAnalytics(){try{localStorage.removeItem(_KEY);}catch(e){}}
