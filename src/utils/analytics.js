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

/* グロース施策(v2.51〜v2.54)のイベントを集計（純粋関数 — テスト対象）。
   today_card / pwa_install / share_card / badge_earned のファネルデータを返す。 */
export function growthStats(events){
  var today={shown:0,go:0,dismiss:0};
  var pwa={shown:0,installed:0,declined:0,dismiss:0};
  var share={total:0,explorer:0,today:0,webshare:0,clipboard:0};
  var badges=[];
  (events||[]).forEach(function(e){
    if(e.ev==="today_card"){if(today[e.action]!==undefined)today[e.action]++;}
    else if(e.ev==="pwa_install"){if(pwa[e.action]!==undefined)pwa[e.action]++;}
    else if(e.ev==="share_card"){
      share.total++;
      if(share[e.source]!==undefined)share[e.source]++;
      if(share[e.method]!==undefined)share[e.method]++;
    }
    else if(e.ev==="badge_earned"&&e.badge)badges.push(e.badge);
  });
  return{today:today,pwa:pwa,share:share,badges:badges};
}
