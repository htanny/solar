import { useState, useRef, useEffect, useCallback } from "react";
import { useRefSync } from "./hooks/useRefSync.js";
import { PL, SUNINFO, MD, GMOONS, EXTRA_MOONS, NAMED_ASTEROIDS, SPACECRAFT, LAGRANGE, COMETS, PL_MAP, COMET_MAP, DWARFS, DWARF_MAP, SRR, DK, SK, TRAIL_LEN, TAU, FL, SP, ZS, TOUR_SEQ, TOUR_NAMES, TOUR_HOLD, LAND_SP, MAP_CTNS, NAMED_STARS, CONST_LINES, ZODIAC, ZODIAC_BASE, SURF, MSHW, J2000, EXOPLANETS } from "./data/solarData.js";
import { oR, pRf, sRf, mOf, mRf, RX, RY, pj, clipCirc, fillCirc, sphereShade, dC, seedR, lerpColor } from "./render/utils.js";
import { dOb, dRi, dSh, dAx, drawPlanetBody, drawSun, sSP, SD, NB, AST, GAL, GAL_COLS, GAL_R, SUN_GAL_R, SUN_GAL_ANG, NEAR_STARS, drawEarthCityLights, drawMoonDetail } from "./render/drawBodies.js";
import { drawLanding } from "./render/drawLanding.js";
import { startLandSound, stopLandSound } from "./audio/landAudio.js";
import { dateToSimDays, simDaysToDate, scanEvents } from "./utils/timeUtils.js";
import { DragPanel } from "./components/DragPanel.jsx";

/* N-body: initialize planet state from Kepler positions at time t */
function initNBody(t){var GM=2.959e-4;return PL.map(function(pl){var r=pl.d/150,ang=(t/pl.p)*TAU,v=Math.sqrt(GM/r);return{pl:pl,x:Math.cos(ang)*r,z:Math.sin(ang)*r,vx:-Math.sin(ang)*v,vz:Math.cos(ang)*v,m:{Mercury:1.65e-7,Venus:2.45e-6,Earth:3.00e-6,Mars:3.23e-7,Jupiter:9.55e-4,Saturn:2.86e-4,Uranus:4.37e-5,Neptune:5.15e-5}[pl.n]||1e-7};})}
/* Tonight's sky: compute planet visibility from observer position */
function computeNightSky(t,lat,lng){var lstD=((280.46+360.98565*t+(lng||0))%360+360)%360,latR=(lat||35)*TAU/360;var ea=(t/365.25)*TAU,ex=Math.cos(ea)*150,ez=Math.sin(ea)*150;var sunEclLng=(ea*180/Math.PI+360)%360,sunHr=(lstD-sunEclLng)*TAU/360,sunSA=Math.cos(latR)*Math.cos(sunHr),sunAlt=Math.round(Math.asin(Math.max(-1,Math.min(1,sunSA)))*180/Math.PI);var isNight=sunAlt<-6;var items=PL.map(function(pl){var ang=(t/pl.p)*TAU,px=Math.cos(ang)*pl.d,pz=Math.sin(ang)*pl.d,dx=px-ex,dz=pz-ez;var eclLng=(Math.atan2(dz,dx)*180/Math.PI+360)%360;var hr=(lstD-eclLng)*TAU/360,sinAlt=Math.cos(latR)*Math.cos(hr),alt=Math.round(Math.asin(Math.max(-1,Math.min(1,sinAlt)))*180/Math.PI);var baseMag={Mercury:0.0,Venus:-4.4,Earth:99,Mars:-0.5,Jupiter:-2.7,Saturn:0.5,Uranus:5.7,Neptune:7.9}[pl.n]||5;return{name:pl.j,alt:alt,vis:alt>5&&pl.n!=="Earth",mag:baseMag.toFixed(1)};});return{items:items,isNight:isNight,sunAlt:sunAlt};}

export default function App(){
  var cR=useRef(null),fR=useRef(0);
  var S=useRef({t:dateToSimDays(new Date().toISOString().slice(0,10))||0,cam:{rx:0.22,ry:0.3,zm:1,tzm:1,fx:0,fy:0,fz:0},dr:null,pi:null,trails:PL.map(function(){return[];}),hitAreas:[],dragged:false});
  var[sh,setSh,shR]=useRefSync({orbits:true,tilt:true,moon:true,labels:true,planets:true,trails:true,belt:true,lagrange:false,spacecraft:false,nasteroid:true,cme:false,distbar:false});
  var[spd,setSpd,spR]=useRefSync(1);
  var[rSn,setRSn,rsR]=useRefSync(false);var[rPl,setRPl,rpR]=useRefSync(false);var[rDi,setRDi,rdR]=useRefSync(false);var[uni,setUni,unR]=useRefSync(false);
  var[foc,setFoc,foR]=useRefSync("all");var[zi,setZi,ziR]=useRefSync(17);
  var[paused,setPaused,pausR]=useRefSync(false);var[info,setInfo]=useState(null);var[compare,setCompare,cmpR]=useRefSync(false);
  var focTransRef=useRef({active:false});
  var tourRef=useRef({active:false,idx:0,timer:0,trans:false});
  var[touring,setTouring]=useState(false);
  var[showEvents,setShowEvents]=useState(false);var eventsRef=useRef([]);
  var cmpStateRef=useRef({offX:0,zm:1});
  var[bgm,setBgm]=useState(false);var audioRef=useRef(null);
  var[dateInput,setDateInput]=useState("");
  var[showDate,setShowDate]=useState(false);
  var[landing,setLanding]=useState(null);
  var[landYaw,setLandYaw,landYR]=useRefSync(0);
  var[landLat,setLandLat,landLatR]=useRefSync(0);
  var[landLng,setLandLng,landLngR]=useRefSync(0);
  var[landFov,setLandFov,landFovR]=useRefSync(1);
  var[landSpd,setLandSpd,landSpdR]=useRefSync(3600/86400);
  var[landTilt,setLandTilt,landTiltR]=useRefSync(0);
  var[lang,setLang,langR]=useRefSync("ja");
  var[searchOpen,setSearchOpen]=useState(false);
  var[searchQ,setSearchQ]=useState("");
  var[dispColl,setDispColl]=useState(false);
  var[exoOpen,setExoOpen]=useState(false);
  var[habZone,setHabZone,habZR]=useRefSync(false);
  var[helio,setHelio,helioR]=useRefSync(false);
  var[magneto,setMagneto,magnetoR]=useRefSync(false);
  var[nightSkyOpen,setNightSkyOpen]=useState(false);
  var[nightSkyLat,setNightSkyLat]=useState(35);
  var[nightSkyLng,setNightSkyLng]=useState(135);
  var[bookOpen,setBookOpen]=useState(false);
  var[bookmarks,setBookmarks]=useState(function(){try{return JSON.parse(localStorage.getItem("solar_bm")||"[]");}catch(e){return[];}});
  var[bookmarkName,setBookmarkName]=useState("");
  var[nBody,setNBody,nBodyR]=useRefSync(false);
  var nBodyStateR=useRef(null);
  var[onboardStep,setOnboardStep]=useState(function(){return localStorage.getItem("solar_ob")?-1:0;});
  var landR=useRef(null);
  var[showConst,setShowConst,showConstR]=useRefSync(true);
  useEffect(function(){landR.current=landing;if(landing){startLandSound(landing);}else{stopLandSound();}return function(){stopLandSound();};},[landing]);
  useEffect(function(){if(!bgm)return;var ctx2;try{ctx2=new(window.AudioContext||window.webkitAudioContext)();var m=ctx2.createGain();m.gain.value=0;m.connect(ctx2.destination);m.gain.linearRampToValueAtTime(0.22,ctx2.currentTime+2);var b=ctx2.createOscillator();b.type="sine";b.frequency.value=55;var bg=ctx2.createGain();bg.gain.value=0.18;b.connect(bg);bg.connect(m);b.start();var p1=ctx2.createOscillator();p1.type="sine";p1.frequency.value=110;var pg=ctx2.createGain();pg.gain.value=0.06;p1.connect(pg);pg.connect(m);p1.start();var p2=ctx2.createOscillator();p2.type="sine";p2.frequency.value=164.81;var p2g=ctx2.createGain();p2g.gain.value=0.04;p2.connect(p2g);p2g.connect(m);p2.start();var p3=ctx2.createOscillator();p3.type="sine";p3.frequency.value=329.63;var p3g=ctx2.createGain();p3g.gain.value=0.02;p3.connect(p3g);p3g.connect(m);p3.start();var notes=[523.25,659.25,783.99,1046.5,1318.5,1567.98];var si2=setInterval(function(){if(ctx2.state==="closed")return;var o=ctx2.createOscillator();o.type="sine";o.frequency.value=notes[Math.floor(Math.random()*notes.length)];var g2=ctx2.createGain();g2.gain.value=0.02+Math.random()*0.02;o.connect(g2);g2.connect(m);o.start();g2.gain.exponentialRampToValueAtTime(0.001,ctx2.currentTime+3);o.stop(ctx2.currentTime+4);},2500+Math.random()*3000);audioRef.current={ctx:ctx2,master:m,si:si2};}catch(e){}return function(){if(audioRef.current){clearInterval(audioRef.current.si);try{audioRef.current.master.gain.linearRampToValueAtTime(0,audioRef.current.ctx.currentTime+0.5);setTimeout(function(){try{audioRef.current.ctx.close();}catch(e2){}audioRef.current=null;},600);}catch(e3){}};};},[bgm]);

  var dz=useCallback(function(i){var c=Math.max(0,Math.min(ZS.length-1,i));S.current.cam.zm=ZS[c];return c;},[]);
  var zIn=useCallback(function(){setZi(function(p){var n=Math.min(ZS.length-1,p+1);dz(n);S.current.cam.tzm=ZS[n];return n;});},[dz]);
  var zOut=useCallback(function(){setZi(function(p){var n=Math.max(0,p-1);dz(n);S.current.cam.tzm=ZS[n];return n;});},[dz]);
  var tog=useCallback(function(k){setSh(function(p){var o={};for(var x in p)o[x]=p[x];o[k]=!p[k];return o;});},[]);
  function autoZoomVal(name,isUni){if(!isUni)return null;var wr;if(name==="sun"){wr=(SRR/1000)*DK;}else{var pl=PL_MAP[name]||DWARF_MAP[name];if(!pl){var cm=COMET_MAP[name];if(!cm)return null;wr=(1/1000)*DK;}else{wr=(pl.r/1000)*DK;}}var ideal=30/Math.max(wr,0.00001),best=0,bd=1e15;for(var i=0;i<ZS.length;i++){var d=Math.abs(ZS[i]-ideal);if(d<bd){bd=d;best=i;}}return ZS[best];}
  var autoZoom=useCallback(function(name,isUni){if(!isUni)return;var wr;if(name==="sun"){wr=(SRR/1000)*DK;}else if(name==="all"){return;}else{var pl=PL_MAP[name]||DWARF_MAP[name];if(!pl)return;wr=(pl.r/1000)*DK;}var ideal=30/Math.max(wr,0.00001),best=0,bd=1e15;for(var i=0;i<ZS.length;i++){var d=Math.abs(ZS[i]-ideal);if(d<bd){bd=d;best=i;}}S.current.cam.tzm=ZS[best];ziR.current=best;setZi(best);},[]);
  useEffect(function(){if(uni&&foc!=="all"){autoZoom(foc,true);}},[uni,foc,autoZoom]);
  var stopTour=useCallback(function(){setTouring(false);if(tourRef.current)tourRef.current.active=false;},[]);
  var saveBM=useCallback(function(name){var s=S.current,c=s.cam;var code="SS|"+s.t.toFixed(1)+"|"+c.rx.toFixed(3)+"|"+c.ry.toFixed(3)+"|"+zi+"|"+foc;setBookmarks(function(prev){var next=prev.concat({name:name||simDaysToDate(s.t),code:code});try{localStorage.setItem("solar_bm",JSON.stringify(next));}catch(e){}return next;});},[zi,foc]);
  var delBM=useCallback(function(idx){setBookmarks(function(prev){var next=prev.filter(function(_,i2){return i2!==idx;});try{localStorage.setItem("solar_bm",JSON.stringify(next));}catch(e){}return next;});},[]);
  var toggleNBody=useCallback(function(){setNBody(function(prev){if(!prev){nBodyStateR.current=initNBody(S.current.t);setUni(true);unR.current=true;}else{nBodyStateR.current=null;}return!prev;});},[]);

  function findInfo(k){if(k==="sun")return{type:"sun"};var pl=PL_MAP[k]||DWARF_MAP[k];if(pl)return{type:"planet",pl:pl};var cm=COMET_MAP[k];if(cm)return{type:"comet",cm:cm};return null;}
  var focusOn=useCallback(function(k){
    if(k!=="all"&&k!==foR.current&&!landR.current){
      var _c=S.current.cam,_tz=autoZoomVal(k,uni)||_c.zm;
      focTransRef.current={active:true,t:0,dur:2.0,ready:false,fromFx:_c.fx,fromFz:_c.fz,fromZm:_c.zm,toZm:_tz};
    }
    setFoc(k);autoZoom(k,uni);setInfo(k==="all"?null:findInfo(k));
    if(landR.current){if(PL_MAP[k]||DWARF_MAP[k]){landLngR.current=0;setLandLng(0);setLanding(k);setLandYaw(0);setLandLat(0);setLandFov(1);}else{setLanding(null);}}
  },[autoZoom,uni]);

  /* Central landing helper: stops tour, exits galaxy view, focuses planet, lands */
  var doLanding=useCallback(function(plName){
    if(!PL_MAP[plName]&&!DWARF_MAP[plName])return;
    stopTour();
    setFoc(plName);setInfo(findInfo(plName));
    if(ziR.current<10){var ssIdx=17;dz(ssIdx);ziR.current=ssIdx;setZi(ssIdx);}
    setCompare(false);
    landLngR.current=0;setLandLng(0);
    landTiltR.current=0;setLandTilt(0);
    setLanding(plName);setLandYaw(0);setLandLat(0);setLandFov(1);
  },[dz,stopTour]);

  var doTakeoff=useCallback(function(){
    setLanding(null);
  },[]);

  /* Time travel: jump to a specific date */
  var jumpToDate=useCallback(function(ds){
    var d=dateToSimDays(ds);if(d===null)return;
    S.current.t=d;setPaused(true);
    /* Clear trails for clean view at new date */
    for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];
  },[]);

  /* Clean view mode - hide all UI for native screenshot */
  var[cleanView,setCleanView,cleanR]=useRefSync(0);
  var takeScreenshot=useCallback(function(){
    setCleanView(1);
    setTimeout(function(){setCleanView(2);},1500);/* hint disappears after 1.5s */
    setTimeout(function(){setCleanView(0);},8000);/* auto-restore after 8s */
  },[]);

  var[shareText,setShareText]=useState(null);
  var[importMode,setImportMode]=useState(false);
  var[importText,setImportText]=useState("");
  var shareURL=useCallback(function(){
    var s=S.current,c=s.cam;
    var code="SS|"+s.t.toFixed(1)+"|"+c.rx.toFixed(3)+"|"+c.ry.toFixed(3)+"|"+zi+"|"+foc;
    setShareText(code);
  },[zi,foc]);
  var importState=useCallback(function(code){
    try{
      var p=code.split("|");if(p[0]!=="SS"||p.length<6)return false;
      /* Exit any special modes first */
      setLanding(null);setCompare(false);stopTour();
      S.current.t=parseFloat(p[1]);
      S.current.cam.rx=parseFloat(p[2]);S.current.cam.ry=parseFloat(p[3]);
      var zv=parseInt(p[4]);if(zv>=0&&zv<ZS.length){setZi(zv);S.current.cam.zm=ZS[zv];}
      var fv=p[5];setFoc(fv);setInfo(fv==="all"?null:findInfo(fv));
      for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];
      return true;
    }catch(e){return false;}
  },[stopTour]);



  var[measureMode,setMeasureMode,measMR]=useRefSync(false);
  var[measurePair,setMeasurePair]=useState([]);var measPairR=useRef([]);
  useEffect(function(){measPairR.current=measurePair;},[measurePair]);
  var handleClick=useCallback(function(e){if(S.current.dragged)return;var cv=cR.current;if(!cv)return;var rect=cv.getBoundingClientRect(),mx=e.clientX-rect.left-rect.width/2,my=e.clientY-rect.top-rect.height/2;var hits=S.current.hitAreas;for(var i=0;i<hits.length;i++){var h=hits[i],dx=mx-h.x,dy2=my-h.y;if(dx*dx+dy2*dy2<h.r*h.r){if(measMR.current){setMeasurePair(function(p){var np=p.concat([h.n]);if(np.length>2)np=[h.n];return np;});return;}focusOn(h.n);return;}}if(!measMR.current)setInfo(null);},[focusOn]);

  useEffect(function(){
    var cv=cR.current;if(!cv)return;var ctx=cv.getContext("2d"),alive=true,lt=0,sim=S.current,trailTimer=0;
    function rsz(){var d=Math.min(window.devicePixelRatio||1,2),pa=cv.parentElement,w=pa.clientWidth,h=pa.clientHeight;cv.width=w*d;cv.height=h*d;cv.style.width=w+"px";cv.style.height=h+"px";ctx.setTransform(d,0,0,d,0,0);}rsz();window.addEventListener("resize",rsz);
    function md(e){e.preventDefault();sim.dragged=false;if(cmpR.current){sim.cmpDrag={x:e.clientX};return;}sim.dr={x:e.clientX,y:e.clientY};}
    function mm(e){if(sim.cmpDrag){var dx0=e.clientX-sim.cmpDrag.x;cmpStateRef.current.offX+=dx0;sim.cmpDrag.x=e.clientX;sim.dragged=true;return;}if(!sim.dr)return;var dx=e.clientX-sim.dr.x,dy=e.clientY-sim.dr.y;if(Math.abs(dx)+Math.abs(dy)>3)sim.dragged=true;if(!landR.current){sim.cam.ry+=dx*0.005;sim.cam.rx=Math.max(-1.5,Math.min(1.5,sim.cam.rx+dy*0.005));}sim.dr.x=e.clientX;sim.dr.y=e.clientY;}
    function mu(){sim.cmpDrag=null;sim.dr=null;}
    function wl(e){e.preventDefault();if(cmpR.current){cmpStateRef.current.zm=Math.max(0.2,Math.min(5,cmpStateRef.current.zm*(e.deltaY>0?0.9:1.1)));return;}if(landR.current){var f=landFovR.current*(e.deltaY>0?1.1:0.9);f=Math.max(0.3,Math.min(3,f));landFovR.current=f;setLandFov(f);return;}var d2=e.deltaY>0?-1:1,c2=ziR.current,n=Math.max(0,Math.min(ZS.length-1,c2+d2));if(n!==c2){dz(n);ziR.current=n;setZi(n);sim.cam.tzm=ZS[n];}}
    function td3(e){if(e.touches.length<2)return 0;var a=e.touches[0],b=e.touches[1];return Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);}
    function tst(e){if(cmpR.current){e.preventDefault();if(e.touches.length===1){sim.cmpDrag={x:e.touches[0].clientX};sim.dragged=false;}if(e.touches.length===2){sim.cmpPinch=td3(e);sim.cmpDrag=null;}return;}if(e.touches.length===3){sim.triSwipe={x:e.touches[0].clientX};sim.dr=null;return;}if(e.touches.length===1){sim.dr={x:e.touches[0].clientX,y:e.touches[0].clientY};sim.dragged=false;}if(e.touches.length===2){sim.pi=td3(e);sim.dr=null;}}
    function tmv(e){e.preventDefault();if(e.touches.length===3&&sim.triSwipe){var dx3f=e.touches[0].clientX-sim.triSwipe.x;if(Math.abs(dx3f)>55){var foIdx=FL.findIndex(function(f){return f.k===foR.current;});var newFo=FL[(foIdx+(dx3f<0?1:foIdx>0?-1:FL.length-1)+FL.length)%FL.length];focusOn(newFo.k);sim.triSwipe={x:e.touches[0].clientX};}return;}if(cmpR.current){if(e.touches.length===1&&sim.cmpDrag){cmpStateRef.current.offX+=e.touches[0].clientX-sim.cmpDrag.x;sim.cmpDrag.x=e.touches[0].clientX;}if(e.touches.length===2&&sim.cmpPinch){var dp=td3(e),rp=dp/sim.cmpPinch;if(rp>1.01||rp<0.99){cmpStateRef.current.zm=Math.max(0.2,Math.min(5,cmpStateRef.current.zm*rp));sim.cmpPinch=dp;}}return;}if(e.touches.length===1&&sim.dr){var dx=e.touches[0].clientX-sim.dr.x,dy=e.touches[0].clientY-sim.dr.y;if(Math.abs(dx)+Math.abs(dy)>3)sim.dragged=true;if(!landR.current){sim.cam.ry+=dx*0.005;sim.cam.rx=Math.max(-1.5,Math.min(1.5,sim.cam.rx+dy*0.005));}sim.dr.x=e.touches[0].clientX;sim.dr.y=e.touches[0].clientY;}if(e.touches.length===2&&sim.pi){var d3=td3(e),ratio=d3/sim.pi;if(landR.current){var newFov=Math.max(0.3,Math.min(3,landFovR.current/ratio));landFovR.current=newFov;setLandFov(newFov);sim.pi=d3;}else if(ratio>1.06||ratio<0.94){var dir=ratio>1?1:-1,c3=ziR.current,n2=Math.max(0,Math.min(ZS.length-1,c3+dir));if(n2!==c3){dz(n2);ziR.current=n2;setZi(n2);sim.cam.tzm=ZS[n2];}sim.pi=d3;}}}
    function ten(e){if(e.touches.length<2){sim.pi=null;sim.cmpPinch=null;}if(e.touches.length===0){sim.dr=null;sim.cmpDrag=null;}}
    function kd(e){var k=e.key;if(k===" "){e.preventDefault();setPaused(function(p){return!p;});}else if(k==="0"){focusOn("all");}else if(k.toLowerCase()==="s"){focusOn("sun");}else if(k>="1"&&k<="8"){focusOn(PL[parseInt(k)-1].n);}else if(k==="9"){focusOn("Halley");}else if(k.toLowerCase()==="e"){focusOn("Encke");}else if(k==="+"||k==="="){e.preventDefault();zIn();}else if(k==="-"||k==="_"){e.preventDefault();zOut();}else if(k==="ArrowRight"){var ci2=SP.indexOf(spR.current);if(ci2<SP.length-1){setSpd(SP[ci2+1]);setPaused(false);}}else if(k==="ArrowLeft"){var ci3=SP.indexOf(spR.current);if(ci3>0){setSpd(SP[ci3-1]);setPaused(false);}}else if(k.toLowerCase()==="c"){setCompare(function(p){if(!p)cmpStateRef.current={offX:0,zm:1};return!p;});}else if(k.toLowerCase()==="t"){if(tourRef.current.active){stopTour();setFoc("all");setInfo(null);}else{setLanding(null);stopTour();setTouring(true);tourRef.current={active:true,idx:0,timer:0,trans:false};setFoc("sun");setInfo({type:"sun"});}}else if(k.toLowerCase()==="m"){setBgm(function(p){return!p;});}
      else if(k.toLowerCase()==="g"){var galIdx=2;var ssIdx=17;if(ziR.current>9){dz(galIdx);ziR.current=galIdx;setZi(galIdx);setFoc("all");setInfo(null);}else{dz(ssIdx);ziR.current=ssIdx;setZi(ssIdx);}}
      else if(k.toLowerCase()==="l"){if(landR.current){setLanding(null);}else if(foR.current!=="all"&&foR.current!=="sun"){var lpl=PL_MAP[foR.current];if(lpl){doLanding(foR.current);}}}
      else if(k==="Escape"){if(landR.current)setLanding(null);}}
    cv.addEventListener("mousedown",md);window.addEventListener("mousemove",mm);window.addEventListener("mouseup",mu);cv.addEventListener("wheel",wl,{passive:false});cv.addEventListener("touchstart",tst,{passive:false});cv.addEventListener("touchmove",tmv,{passive:false});cv.addEventListener("touchend",ten);window.addEventListener("keydown",kd);
    var sArr=SD.s,sCols=SD.c,nArr=NB;

    function frame(ts2){
      if(!alive)return;var dt=lt?Math.min((ts2-lt)/1000,0.1):0.016;lt=ts2;if(!pausR.current){if(landR.current)sim.t+=dt*landSpdR.current;else sim.t+=dt*spR.current;}
      var pa=cv.parentElement,W=pa.clientWidth,H=pa.clientHeight;if(cv.style.width!==W+"px")rsz();
      var show=shR.current,_rs=rsR.current,_rp=rpR.current,_rd=rdR.current,_un=unR.current,fc=foR.current,cam=sim.cam,t=sim.t;
      if(!focTransRef.current.active&&cam.tzm&&Math.abs(cam.tzm-cam.zm)>0.00005){cam.zm+=(cam.tzm-cam.zm)*Math.min(1,dt*5);}
      ctx.fillStyle="rgba(3,3,10,1)";ctx.fillRect(0,0,W,H);

      /* Landing view mode */
      var _land=landR.current;
      if(_land){
        drawLanding(ctx,W,H,t,_land,landYR.current,landLatR.current,landFovR.current,landLngR.current,landTiltR.current,showConstR.current);
        fR.current=requestAnimationFrame(frame);return;
      }

      ctx.save();ctx.translate(W/2,H/2);

      for(var ni=0;ni<nArr.length;ni++){var nb=nArr[ni],nsp=sSP(nb.th,nb.ph,cam.rx,cam.ry,0);if(nsp.z<-0.1)continue;var nsx=nsp.x*W*0.6,nsy=nsp.y*H*0.6;var ngr=ctx.createRadialGradient(nsx,nsy,0,nsx,nsy,nb.ra);ngr.addColorStop(0,"rgba("+nb.cl[0]+","+nb.cl[1]+","+nb.cl[2]+","+(nb.a*1.2)+")");ngr.addColorStop(0.5,"rgba("+nb.cl[0]+","+nb.cl[1]+","+nb.cl[2]+","+(nb.a*0.4)+")");ngr.addColorStop(1,"rgba("+nb.cl[0]+","+nb.cl[1]+","+nb.cl[2]+",0)");ctx.fillStyle=ngr;ctx.fillRect(nsx-nb.ra,nsy-nb.ra,nb.ra*2,nb.ra*2);}
      for(var si=0;si<sArr.length;si++){var st=sArr[si],sp=sSP(st.th,st.ph,cam.rx,cam.ry,st.l);if(sp.z<-0.2)continue;var sx=sp.x*W*0.7,sy=sp.y*H*0.7;if(sx<-W*0.52||sx>W*0.52||sy<-H*0.52||sy>H*0.52)continue;var al=Math.max(0.03,Math.min(0.95,(st.b+Math.sin(t*1.5+st.tw)*0.12)*(0.6+sp.z*0.4)));ctx.fillStyle="rgba("+sCols[st.ci]+","+al.toFixed(2)+")";ctx.fillRect(sx-st.s*0.5,sy-st.s*0.5,st.s,st.s);}

      /* ===== GALAXY VIEW (when zoomed out far enough) ===== */
      var galFade=cam.zm<0.03?Math.min(1,(0.03-cam.zm)/0.02):0;
      if(galFade>0){
        var galScale=Math.max(cam.zm*30000,W*0.006);
        var sunGX=SUN_GAL_R*Math.cos(SUN_GAL_ANG),sunGZ=SUN_GAL_R*Math.sin(SUN_GAL_ANG);
        /* Galaxy projection: particles in XZ plane, apply camera rotation, no focus offset */
        /* galPj: galaxy coords (gx,gy,gz) -> screen (x,y,z) with depth */
        var crx=cam.rx,cry=cam.ry;
        var cryC=Math.cos(cry),cryS=Math.sin(cry),crxC=Math.cos(crx),crxS=Math.sin(crx);
        function galPj(gx,gy,gz){
          var dx=gx-sunGX,dy=gy,dz=gz-sunGZ;
          /* RY */var rx=dx*cryC+dz*cryS,rz=-dx*cryS+dz*cryC;
          /* RX */var ry=dy*crxC-rz*crxS,rz2=dy*crxS+rz*crxC;
          return{x:rx*galScale,y:ry*galScale,z:rz2};
        }
        /* Bulge thickness for 3D: bulge is ellipsoidal, disk is thin */
        /* Dust lanes */
        ctx.globalAlpha=galFade*0.12;
        for(var gdi=0;gdi<GAL.dust.length;gdi++){var gd2=GAL.dust[gdi];var gp=galPj(gd2.x,0,gd2.y);if(Math.abs(gp.x)>W||Math.abs(gp.y)>H)continue;var dsz=gd2.sz*galScale;ctx.fillStyle="rgba(5,3,15,1)";ctx.fillRect(gp.x-dsz*0.5,gp.y-dsz*0.5,dsz,dsz);}
        /* Central bulge glow */
        var bp=galPj(0,0,0);var bulgeR=8*galScale;
        if(Math.abs(bp.x)<W+bulgeR&&Math.abs(bp.y)<H+bulgeR){
          ctx.globalAlpha=galFade*0.4;
          var bg2=ctx.createRadialGradient(bp.x,bp.y,0,bp.x,bp.y,bulgeR);bg2.addColorStop(0,"rgba(255,240,180,0.6)");bg2.addColorStop(0.3,"rgba(255,220,140,0.2)");bg2.addColorStop(1,"rgba(255,200,100,0)");ctx.fillStyle=bg2;ctx.fillRect(bp.x-bulgeR,bp.y-bulgeR,bulgeR*2,bulgeR*2);
        }
        /* Bulge stars (have vertical extent) */
        ctx.globalAlpha=galFade*0.5;
        for(var gbi=0;gbi<GAL.bulge.length;gbi++){var gb=GAL.bulge[gbi];var gbp=galPj(gb.x,gb.y*0.5,gb.y);if(Math.abs(gbp.x)>W||Math.abs(gbp.y)>H)continue;ctx.fillStyle="rgba(255,235,180,"+gb.b.toFixed(2)+")";ctx.fillRect(gbp.x-gb.s*0.5,gbp.y-gb.s*0.5,gb.s,gb.s);}
        /* Spiral arm stars */
        ctx.globalAlpha=galFade;
        for(var gai=0;gai<GAL.arms.length;gai++){var ga2=GAL.arms[gai];var gap2=galPj(ga2.x,0,ga2.y);if(Math.abs(gap2.x)>W||Math.abs(gap2.y)>H)continue;ctx.fillStyle="rgba("+GAL_COLS[ga2.ci]+","+(ga2.b*galFade).toFixed(2)+")";var gsz=ga2.s*(galScale>5?1.5:1);ctx.fillRect(gap2.x-gsz*0.5,gap2.y-gsz*0.5,gsz,gsz);}
        /* Nearby named stars */
        if(galScale>20){
          for(var nsi=0;nsi<NEAR_STARS.length;nsi++){var ns2=NEAR_STARS[nsi];var nsp2=galPj(ns2.x,0,ns2.y);if(Math.abs(nsp2.x)>W||Math.abs(nsp2.y)>H)continue;ctx.globalAlpha=galFade*ns2.b;ctx.fillStyle="rgba(255,255,255,1)";ctx.fillRect(nsp2.x-1,nsp2.y-1,2,2);if(ns2.name&&galScale>80){ctx.fillStyle="rgba(200,220,255,"+(galFade*0.6).toFixed(2)+")";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(ns2.name,nsp2.x,nsp2.y-5);}}}
        /* Sun marker at origin (camera centered on Sun) */
        ctx.globalAlpha=galFade;
        var smR=Math.max(2,Math.min(6,galScale*0.3));
        fillCirc(ctx,0,0,smR,"rgba(255,220,50,1)");
        var smGlow=ctx.createRadialGradient(0,0,smR,0,0,smR*4);smGlow.addColorStop(0,"rgba(255,200,50,0.3)");smGlow.addColorStop(1,"rgba(255,200,50,0)");ctx.fillStyle=smGlow;ctx.fillRect(-smR*4,-smR*4,smR*8,smR*8);
        if(galScale<50){ctx.fillStyle="rgba(255,220,100,"+(galFade*0.8).toFixed(2)+")";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("☀ 太陽系",0,smR+14);}
        /* Galaxy center label */
        if(galScale<30){ctx.fillStyle="rgba(255,230,160,"+(galFade*0.5).toFixed(2)+")";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("銀河中心 ▸ いて座A*",bp.x,bp.y+bulgeR*0.3+12);}
        /* Galaxy info overlay (fixed on screen, outside translate) */
        ctx.globalAlpha=1;
      }
      /* Info text drawn after ctx.restore, in screen space */
      var galInfoFade=cam.zm<0.005?Math.min(1,(0.005-cam.zm)/0.004):0;
      /* Solar system fade when galaxy visible */
      var ssFade=cam.zm<0.03?Math.max(0.05,cam.zm/0.03):1;
      if(ssFade<1)ctx.globalAlpha=ssFade;

      /* N-body: integrate one sim-frame with sub-stepping */
      if(nBodyR.current&&nBodyStateR.current&&!pausR.current){var nb_=nBodyStateR.current,nb_GM=2.959e-4,nb_dt_=dt*spR.current,nb_subs_=Math.max(1,Math.min(30,Math.ceil(Math.abs(nb_dt_)*5))),nb_sub_=nb_dt_/nb_subs_;for(var nbs_=0;nbs_<nb_subs_;nbs_++){for(var nbi_=0;nbi_<nb_.length;nbi_++){var nbri_=Math.sqrt(nb_[nbi_].x*nb_[nbi_].x+nb_[nbi_].z*nb_[nbi_].z)||0.001;nb_[nbi_]._ax_=-nb_GM*nb_[nbi_].x/(nbri_*nbri_*nbri_);nb_[nbi_]._az_=-nb_GM*nb_[nbi_].z/(nbri_*nbri_*nbri_);for(var nbj_=0;nbj_<nb_.length;nbj_++){if(nbj_===nbi_)continue;var nbdx_=nb_[nbi_].x-nb_[nbj_].x,nbdz_=nb_[nbi_].z-nb_[nbj_].z,nbdr_=Math.sqrt(nbdx_*nbdx_+nbdz_*nbdz_)||0.001;nb_[nbi_]._ax_-=nb_GM*nb_[nbj_].m*nbdx_/(nbdr_*nbdr_*nbdr_);nb_[nbi_]._az_-=nb_GM*nb_[nbj_].m*nbdz_/(nbdr_*nbdr_*nbdr_);}}for(var nbu_=0;nbu_<nb_.length;nbu_++){nb_[nbu_].vx+=nb_[nbu_]._ax_*nb_sub_;nb_[nbu_].vz+=nb_[nbu_]._az_*nb_sub_;nb_[nbu_].x+=nb_[nbu_].vx*nb_sub_;nb_[nbu_].z+=nb_[nbu_].vz*nb_sub_;}}}

      var allBodies=PL.concat(DWARFS);
      var pd=[];for(var i=0;i<allBodies.length;i++){var pl=allBodies[i],oRv=oR(pl,_rd,_un),ang=(t/pl.p)*TAU;pd.push({pl:pl,oR:oRv,wx:Math.cos(ang)*oRv,wy:0,wz:Math.sin(ang)*oRv,vr:pRf(pl,_rp,_un),rotAng:(t/Math.abs(pl.rot))*TAU*(pl.rot<0?-1:1)});}
      /* N-body: override Kepler positions with integrated positions */
      if(nBodyR.current&&nBodyStateR.current){var nbS_=150*DK;for(var nbo_=0;nbo_<nBodyStateR.current.length;nbo_++){for(var pdi_=0;pdi_<pd.length;pdi_++){if(pd[pdi_].pl===nBodyStateR.current[nbo_].pl){pd[pdi_].wx=nBodyStateR.current[nbo_].x*nbS_;pd[pdi_].wz=nBodyStateR.current[nbo_].z*nbS_;break;}}}}

      var cd=[];for(var cci=0;cci<COMETS.length;cci++){var cm0=COMETS[cci],cm0E=cm0.e;var cm0OrbR=_rd||_un?cm0.a*DK:(160+Math.pow((cm0.a-228)/4267,0.55)*280);var cm0M=((t/cm0.p)+cm0.phase0)*TAU;var cm0Ecc=cm0M;for(var ki0=0;ki0<6;ki0++){cm0Ecc=cm0M+cm0E*Math.sin(cm0Ecc);}var cm0V=2*Math.atan2(Math.sqrt(1+cm0E)*Math.sin(cm0Ecc/2),Math.sqrt(1-cm0E)*Math.cos(cm0Ecc/2));var cm0R=cm0OrbR*(1-cm0E*cm0E)/(1+cm0E*Math.cos(cm0V));cd.push({cm:cm0,orbR:cm0OrbR,wx:Math.cos(cm0V+cm0.inc)*cm0R,wy:0,wz:Math.sin(cm0V+cm0.inc)*cm0R});}

      trailTimer+=dt;if(trailTimer>0.05&&!pausR.current&&!tourRef.current.trans){trailTimer=0;for(var ti=0;ti<sim.trails.length;ti++){sim.trails[ti].push({x:pd[ti].wx,z:pd[ti].wz});if(sim.trails[ti].length>TRAIL_LEN)sim.trails[ti].shift();}}

      var tfx=0,tfy=0,tfz=0,hasTarget=false;
      if(fc!=="all"&&fc!=="sun"){for(var fi=0;fi<pd.length;fi++){if(pd[fi].pl.n===fc){tfx=pd[fi].wx;tfy=pd[fi].wy;tfz=pd[fi].wz;hasTarget=true;break;}}if(!hasTarget){for(var fi2=0;fi2<cd.length;fi2++){if(cd[fi2].cm.key===fc){tfx=cd[fi2].wx;tfy=cd[fi2].wy;tfz=cd[fi2].wz;hasTarget=true;break;}}}}
      var ft=focTransRef.current;if(ft.active){if(!ft.ready){if(hasTarget){ft.toFx=tfx;ft.toFz=tfz;ft.ready=true;}else if(fc==="sun"||fc==="all"){ft.toFx=0;ft.toFz=0;ft.ready=true;}}if(ft.ready){ft.t=Math.min(1,ft.t+dt/ft.dur);var ease2=ft.t*ft.t*(3-2*ft.t);cam.fx=ft.fromFx+(ft.toFx-ft.fromFx)*ease2;cam.fz=ft.fromFz+(ft.toFz-ft.fromFz)*ease2;var midZm=Math.max(0.0001,Math.min(ft.fromZm,ft.toZm)*0.15);if(ease2<0.5){cam.zm=ft.fromZm+(midZm-ft.fromZm)*(ease2*2);}else{cam.zm=midZm+(ft.toZm-midZm)*((ease2-0.5)*2);}if(ft.t>=1){ft.active=false;cam.fx=ft.toFx;cam.fz=ft.toFz;cam.zm=ft.toZm;}}}else if(hasTarget||fc==="sun"){var gx=tfx-cam.fx,gz=tfz-cam.fz;var lf=Math.min(1,dt*(7+Math.sqrt(gx*gx+gz*gz)*cam.zm*1.5));cam.fx+=gx*lf;cam.fy+=(tfy-cam.fy)*lf;cam.fz+=gz*lf;}else if(fc==="all"){cam.fx*=0.92;cam.fy*=0.92;cam.fz*=0.92;}

      /* sunPj + sun-to-viewport squared distance hoisted: needed by both orbit passes */
      var sunPj=pj(0,0,0,cam);
      var orbMaxR=Math.max(W,H)*20;/* skip orbits >20× viewport: arc would be a near-straight line */
      var snx=Math.max(-W/2,Math.min(W/2,sunPj.x)),sny=Math.max(-H/2,Math.min(H/2,sunPj.y));
      var sd2=(snx-sunPj.x)*(snx-sunPj.x)+(sny-sunPj.y)*(sny-sunPj.y);
      if(show.orbits){for(var oi=0;oi<pd.length;oi++){var osr=pd[oi].oR*cam.zm;if(osr<0.5||osr>orbMaxR||sd2>=osr*osr)continue;dOb(ctx,pd[oi].oR,cam,pd[oi].pl.cRGB,false);}}
      if(show.trails){for(var tri=0;tri<sim.trails.length;tri++){var trail=sim.trails[tri];if(trail.length<3)continue;var cStr=pd[tri].pl.c.replace(",1)","");var bs=Math.max(2,Math.floor(trail.length/10));for(var tb=0;tb<trail.length-1;tb+=bs){var te2=Math.min(tb+bs+1,trail.length),mA=((tb+te2)*0.5/trail.length)*0.5;ctx.beginPath();ctx.strokeStyle=cStr+","+mA.toFixed(2)+")";ctx.lineWidth=1.5;var fp=pj(trail[tb].x,0,trail[tb].z,cam);ctx.moveTo(fp.x,fp.y);for(var tj=tb+1;tj<te2;tj++){var cp=pj(trail[tj].x,0,trail[tj].z,cam);ctx.lineTo(cp.x,cp.y);}ctx.stroke();}}}
      if(show.belt&&!_un){ctx.fillStyle="rgba(160,150,130,0.4)";for(var ai=0;ai<AST.length;ai++){var as2=AST[ai],aR=_rd?as2.rad*0.15*DK:(160+(as2.rad-330)/200*60),aAng=as2.ang+t*as2.spd,ap=pj(Math.cos(aAng)*aR,as2.y*(_rd?0.1:1),Math.sin(aAng)*aR,cam),aSz=Math.max(as2.sz*cam.zm,0.2);ctx.fillRect(ap.x-aSz*0.5,ap.y-aSz*0.5,aSz,aSz);}}

      /* ======== ZODIAC RING ======== */
      if(!_un&&cam.zm<10){
        var sunEclLng=((((t/365.25)*TAU-(ZODIAC_BASE-Math.PI))*180/Math.PI)%360+360)%360;
        var curZIdx=Math.floor(sunEclLng/30);
        var halfMin=Math.min(W,H)*0.47;
        var maxEdge=Math.min(halfMin,Math.max(440*cam.zm*1.15,Math.min(W,H)*0.28));
        ctx.save();ctx.font="10px sans-serif";ctx.textAlign="center";
        for(var zi2=0;zi2<ZODIAC.length;zi2++){
          var zAng2=ZODIAC_BASE+ZODIAC[zi2][0]*Math.PI/180;
          var zPP=pj(Math.cos(zAng2)*800,0,Math.sin(zAng2)*800,cam);
          var zLen=Math.sqrt(zPP.x*zPP.x+zPP.y*zPP.y);if(zLen<1)continue;
          var lx2=zPP.x/zLen*maxEdge,ly2=zPP.y/zLen*maxEdge;
          var isCur=(zi2===curZIdx);
          ctx.fillStyle=isCur?"rgba(255,220,80,0.85)":"rgba(180,200,255,0.35)";
          ctx.font=(isCur?"bold ":"")+"10px sans-serif";
          ctx.fillText(ZODIAC[zi2][2]+ZODIAC[zi2][1],lx2,ly2);
        }
        ctx.restore();
      }

      /* ======== HABITABLE ZONE ======== */
      if(habZR.current&&!cmpR.current&&cam.zm>0.08&&cam.zm<50){var hzI_=0.95*150,hzO_=1.37*150,hzN_=Math.max(60,Math.min(240,Math.floor(hzO_*cam.zm*0.4)));ctx.beginPath();for(var hzoa_=0;hzoa_<=hzN_;hzoa_++){var hza_=hzoa_/hzN_*TAU;var hzp_=pj(Math.cos(hza_)*hzO_,0,Math.sin(hza_)*hzO_,cam);if(hzoa_===0)ctx.moveTo(hzp_.x,hzp_.y);else ctx.lineTo(hzp_.x,hzp_.y);}for(var hzia_=hzN_;hzia_>=0;hzia_--){var hza2_=hzia_/hzN_*TAU;var hzp2_=pj(Math.cos(hza2_)*hzI_,0,Math.sin(hza2_)*hzI_,cam);ctx.lineTo(hzp2_.x,hzp2_.y);}ctx.closePath();ctx.fillStyle="rgba(80,220,80,0.07)";ctx.fill();ctx.lineWidth=0.8;ctx.strokeStyle="rgba(255,140,60,0.22)";ctx.beginPath();for(var hzib_=0;hzib_<=hzN_;hzib_++){var hzb_=hzib_/hzN_*TAU;var hzpb_=pj(Math.cos(hzb_)*hzI_,0,Math.sin(hzb_)*hzI_,cam);if(hzib_===0)ctx.moveTo(hzpb_.x,hzpb_.y);else ctx.lineTo(hzpb_.x,hzpb_.y);}ctx.stroke();ctx.strokeStyle="rgba(60,140,255,0.22)";ctx.beginPath();for(var hzoc_=0;hzoc_<=hzN_;hzoc_++){var hzc_=hzoc_/hzN_*TAU;var hzpc_=pj(Math.cos(hzc_)*hzO_,0,Math.sin(hzc_)*hzO_,cam);if(hzoc_===0)ctx.moveTo(hzpc_.x,hzpc_.y);else ctx.lineTo(hzpc_.x,hzpc_.y);}ctx.stroke();if(cam.zm>0.3){var hzLbl_=pj(0,0,hzO_*1.08,cam);ctx.fillStyle="rgba(80,220,80,0.6)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("🌍 ハビタブルゾーン 0.95–1.37 AU",hzLbl_.x,hzLbl_.y);}}

      /* ======== HELIOSPHERE BOUNDARY ======== */
      if(helioR.current&&cam.zm<0.012&&!cmpR.current){var hbFade_=Math.min(1,(0.012-cam.zm)/0.009);var hbConf_=[{r:85*150,col:"rgba(210,160,80,",lbl:"末端衝撃波 90 AU"},{r:121*150,col:"rgba(80,180,255,",lbl:"ヘリオポーズ 121 AU"}];for(var hbi_=0;hbi_<hbConf_.length;hbi_++){var hb_=hbConf_[hbi_],hbN_=Math.max(40,Math.min(120,Math.floor(hb_.r*cam.zm*0.4)));ctx.strokeStyle=hb_.col+(0.20*hbFade_)+")";ctx.lineWidth=1.5;ctx.beginPath();for(var hbj_=0;hbj_<=hbN_;hbj_++){var hba_=hbj_/hbN_*TAU,hbp_=pj(Math.cos(hba_)*hb_.r,0,Math.sin(hba_)*hb_.r,cam);if(hbj_===0)ctx.moveTo(hbp_.x,hbp_.y);else ctx.lineTo(hbp_.x,hbp_.y);}ctx.stroke();if(cam.zm<0.005){var hblp_=pj(0,0,hb_.r,cam);ctx.fillStyle=hb_.col+(0.55*hbFade_)+")";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText(hb_.lbl,hblp_.x,hblp_.y);}}var v1pj_=pj(0,0,167*150,cam);ctx.fillStyle="rgba(255,200,80,"+(0.45*hbFade_)+")";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("◆ Voyager1 ~167AU",v1pj_.x,v1pj_.y);}

      /* Sun */
      var srScr=(_rs||_un)?sRf(_rs,_un)*cam.zm:Math.min(sRf(false,false)*Math.pow(cam.zm,0.35),40);
      var hits=[];

      /* Comets */
      for(var cmi=0;cmi<cd.length;cmi++){var cm=cd[cmi].cm,cmE=cm.e,cmOrbR=cd[cmi].orbR;var cmPj=pj(cd[cmi].wx,0,cd[cmi].wz,cam);var cmH=Math.max(cm.sz,0.8),cmZm=Math.pow(cam.zm,0.3);var tdx=cmPj.x-sunPj.x,tdy=cmPj.y-sunPj.y,tl2=Math.sqrt(tdx*tdx+tdy*tdy);if(tl2<0.1){tdx=1;tdy=0;tl2=1;}var tnx=tdx/tl2,tny=tdy/tl2,tpx=-tny,tpy=tnx;var csd=Math.sqrt(cd[cmi].wx*cd[cmi].wx+cd[cmi].wz*cd[cmi].wz),peri=cmOrbR*(1-cmE),tI=Math.max(0.1,Math.min(1.2,peri*3/Math.max(csd,0.1))),tLen=cm.tailLen*tI*cmZm;
        if(tLen>2){for(var tp2=0;tp2<22;tp2++){var tf=tp2/22;ctx.fillStyle="rgba("+cm.col[0]+","+cm.col[1]+","+cm.col[2]+","+((1-tf)*0.42*Math.min(tI,1)).toFixed(3)+")";var tsz=cmH*(0.7+tf*1.3);ctx.fillRect(cmPj.x+tnx*tLen*tf+tpx*Math.sin(tp2*1.7+t*2)*tLen*0.005-tsz*0.5,cmPj.y+tny*tLen*tf+tpy*Math.sin(tp2*1.7+t*2)*tLen*0.005-tsz*0.5,tsz,tsz);}for(var tp3=0;tp3<18;tp3++){var tf2=tp3/18,cv2=tf2*tf2*tLen*0.32;ctx.fillStyle="rgba(255,225,170,"+((1-tf2)*0.28*Math.min(tI,1)).toFixed(3)+")";var tsz2=cmH*(0.7+tf2*1.6);ctx.fillRect(cmPj.x+tnx*tLen*tf2*0.78+tpx*cv2-tsz2*0.5,cmPj.y+tny*tLen*tf2*0.78+tpy*cv2-tsz2*0.5,tsz2,tsz2);}}
        var comaR=cmH*(3+tI*4);var comaG=ctx.createRadialGradient(cmPj.x,cmPj.y,0,cmPj.x,cmPj.y,comaR);var cA=Math.min(0.7,0.2+tI*0.3);comaG.addColorStop(0,"rgba(255,255,255,"+cA.toFixed(2)+")");comaG.addColorStop(0.3,"rgba(200,230,255,"+(cA*0.3).toFixed(2)+")");comaG.addColorStop(1,"rgba(150,200,255,0)");ctx.fillStyle=comaG;ctx.fillRect(cmPj.x-comaR,cmPj.y-comaR,comaR*2,comaR*2);fillCirc(ctx,cmPj.x,cmPj.y,cmH,"rgba(240,250,255,1)");
        hits.push({n:cm.key,x:cmPj.x,y:cmPj.y,r:Math.max(comaR,15)});
        if(show.orbits){var cmosr=cmOrbR*cam.zm;if(cmosr<orbMaxR){ctx.beginPath();ctx.strokeStyle="rgba(100,180,255,0.08)";ctx.lineWidth=0.5;ctx.setLineDash([3,5]);var cmN=Math.max(80,Math.min(600,Math.floor(cmosr*0.25)));for(var cj=0;cj<=cmN;cj++){var cja=(cj/cmN)*TAU,cjr=cmOrbR*(1-cmE*cmE)/(1+cmE*Math.cos(cja)),cjp=pj(Math.cos(cja+cm.inc)*cjr,0,Math.sin(cja+cm.inc)*cjr,cam);if(cj===0)ctx.moveTo(cjp.x,cjp.y);else ctx.lineTo(cjp.x,cjp.y);}ctx.stroke();ctx.setLineDash([]);}}
        if(show.labels){ctx.fillStyle="rgba(150,210,255,0.7)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText(cm.name,cmPj.x,cmPj.y-comaR-5);}
      }

      /* Sort + draw sun/planets */
      var eclipseType=null,eclipseEarPj=null,eclipseEarRr=0;
      var items=[{k:"s",z:sunPj.z}],pjArr=[];for(var di=0;di<pd.length;di++){var pp=pj(pd[di].wx,pd[di].wy,pd[di].wz,cam);pjArr.push(pp);items.push({k:"p",z:pp.z,i:di});}items.sort(function(a,b){return b.z-a.z;});
      hits.push({n:"sun",x:sunPj.x,y:sunPj.y,r:Math.max(srScr,12)});

      for(var dr=0;dr<items.length;dr++){
        var it=items[dr];
        if(it.k==="s"){
          var gr=ctx.createRadialGradient(sunPj.x,sunPj.y,srScr*0.2,sunPj.x,sunPj.y,srScr*3);gr.addColorStop(0,"rgba(255,220,80,0.5)");gr.addColorStop(0.3,"rgba(255,180,50,0.12)");gr.addColorStop(1,"rgba(255,150,30,0)");ctx.fillStyle=gr;ctx.fillRect(sunPj.x-srScr*3,sunPj.y-srScr*3,srScr*6,srScr*6);
          drawSun(ctx,sunPj.x,sunPj.y,srScr,t);
          if(show.labels){ctx.fillStyle="rgba(255,220,100,0.85)";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText(langR.current==="en"?"Sun":"太陽",sunPj.x,sunPj.y-srScr-7);}
        }else if(show.planets){
          var idx=it.i,pdt=pd[idx],ppp=pjArr[idx],rr=Math.max(pdt.vr*cam.zm,0.4);
          hits.push({n:pdt.pl.n,x:ppp.x,y:ppp.y,r:Math.max(rr,10)});
          if(pdt.pl.n==="Saturn")dRi(ctx,pdt.wx,pdt.wy,pdt.wz,pdt.vr,cam,pdt.pl.t);
          drawPlanetBody(ctx,ppp.x,ppp.y,rr,pdt.pl,pdt.rotAng);
          dSh(ctx,ppp.x,ppp.y,rr,pdt.wx,pdt.wz,cam);
          if(pdt.pl.n==="Earth"&&rr>8)drawEarthCityLights(ctx,ppp.x,ppp.y,rr,pdt.rotAng,sunPj.x-ppp.x,sunPj.y-ppp.y);
          if(show.tilt)dAx(ctx,ppp.x,ppp.y,rr,pdt.pl.t);
          if(pdt.pl.n==="Earth"&&show.moon){var moV=mOf(_rd,_un),mAng=(t/MD.p)*TAU,mx=pdt.wx+Math.cos(mAng)*moV,mz=pdt.wz+Math.sin(mAng)*moV,mp=pj(mx,0,mz,cam),mrV=Math.max(mRf(_rp,_un)*cam.zm,0.3);var moScrR=moV*cam.zm;if(moScrR>3){var moN=Math.min(120,Math.max(40,Math.floor(moScrR*0.5)));ctx.strokeStyle="rgba(200,200,200,0.25)";ctx.lineWidth=0.7;ctx.setLineDash([2,4]);ctx.beginPath();for(var moi=0;moi<=moN;moi++){var moa=(moi/moN)*TAU,mopp=pj(pdt.wx+Math.cos(moa)*moV,0,pdt.wz+Math.sin(moa)*moV,cam);if(moi===0)ctx.moveTo(mopp.x,mopp.y);else ctx.lineTo(mopp.x,mopp.y);}ctx.stroke();ctx.setLineDash([]);}dC(ctx,mp.x,mp.y,mrV,"rgba(200,200,200,1)");if(mrV>2)drawMoonDetail(ctx,mp.x,mp.y,mrV,mAng);if(mrV>3)sphereShade(ctx,mp.x,mp.y,mrV);dSh(ctx,mp.x,mp.y,mrV,mx,mz,cam);if(show.labels){ctx.fillStyle="rgba(200,200,200,0.75)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("月",mp.x,mp.y-mrV-4);}}
          if(pdt.pl.n==="Earth"){var issOrb=_un?(6771/1e6)*DK:(_rd?(6771*0.001)*DK:pdt.vr*1.12);var issAng=(t/0.0683)*TAU,issWx=pdt.wx+Math.cos(issAng)*issOrb,issWz=pdt.wz+Math.sin(issAng)*issOrb,issPj2=pj(issWx,0,issWz,cam),issScr=issOrb*cam.zm;if(issScr>3){if(issScr>8){ctx.strokeStyle="rgba(120,200,255,0.25)";ctx.lineWidth=0.6;ctx.setLineDash([1,3]);ctx.beginPath();var issNN=Math.max(20,Math.min(80,Math.floor(issScr*0.4)));for(var iiSS=0;iiSS<=issNN;iiSS++){var iaSS=iiSS/issNN*TAU,ipSS=pj(pdt.wx+Math.cos(iaSS)*issOrb,0,pdt.wz+Math.sin(iaSS)*issOrb,cam);if(iiSS===0)ctx.moveTo(ipSS.x,ipSS.y);else ctx.lineTo(ipSS.x,ipSS.y);}ctx.stroke();ctx.setLineDash([]);}ctx.fillStyle="rgba(200,240,255,0.95)";ctx.fillRect(issPj2.x-1,issPj2.y-1,2,2);hits.push({n:"iss",x:issPj2.x,y:issPj2.y,r:12});if(show.labels&&issScr>16){ctx.fillStyle="rgba(180,230,255,0.8)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("ISS",issPj2.x,issPj2.y-5);}}}
          if(pdt.pl.n==="Jupiter"&&show.moon){for(var gmi=0;gmi<GMOONS.length;gmi++){var gm=GMOONS[gmi],gmOrb=_un?(gm.orbR/1e6)*DK:(_rd?(gm.orbR*0.001)*DK:(12+gmi*5)),gmAng=(t/gm.p)*TAU,gmWx=pdt.wx+Math.cos(gmAng)*gmOrb,gmWz=pdt.wz+Math.sin(gmAng)*gmOrb,gmPj=pj(gmWx,0,gmWz,cam),gmR=Math.max(_un?(gm.r/1e6)*DK*cam.zm:(_rp?gm.r*SK*0.01*cam.zm:(1.2+gmi*0.3)*cam.zm*0.3),0.4);dC(ctx,gmPj.x,gmPj.y,gmR,gm.col);if(gmR>1.5)sphereShade(ctx,gmPj.x,gmPj.y,gmR);dSh(ctx,gmPj.x,gmPj.y,gmR,gmWx,gmWz,cam);if(show.labels&&gmR>0.8){ctx.fillStyle="rgba(200,200,180,0.65)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(gm.name,gmPj.x,gmPj.y-gmR-3);}}}
          if(EXTRA_MOONS[pdt.pl.n]&&show.moon){var emArr=EXTRA_MOONS[pdt.pl.n];for(var emi=0;emi<emArr.length;emi++){var em=emArr[emi],emOrb=_un?(em.orbR/1e6)*DK:(_rd?(em.orbR*0.001)*DK:(pdt.vr+2+emi*1.4)),emAng=(t/em.p)*TAU,emWx=pdt.wx+Math.cos(emAng)*emOrb,emWz=pdt.wz+Math.sin(emAng)*emOrb,emPj=pj(emWx,0,emWz,cam),emR=Math.max(_un?(em.r/1e6)*DK*cam.zm:(_rp?em.r*SK*0.01*cam.zm:em.sz*Math.min(cam.zm*0.5,2.5)),0.4);dC(ctx,emPj.x,emPj.y,emR,em.col);if(emR>1.5)sphereShade(ctx,emPj.x,emPj.y,emR);dSh(ctx,emPj.x,emPj.y,emR,emWx,emWz,cam);if(show.labels&&emR>0.7){ctx.fillStyle="rgba(200,200,180,0.55)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(em.name,emPj.x,emPj.y-emR-3);}}}
          if(pdt.pl.n==="Earth"&&magnetoR.current&&rr>10&&!cmpR.current){var mgSDx=sunPj.x-ppp.x,mgSDy=sunPj.y-ppp.y,mgSL=Math.sqrt(mgSDx*mgSDx+mgSDy*mgSDy)||1;mgSDx/=mgSL;mgSDy/=mgSL;var mgR=rr*7,b1R_=rr*1.5,b2R_=rr*3.5;ctx.save();ctx.globalAlpha=0.3;ctx.strokeStyle="rgba(255,160,60,0.7)";ctx.lineWidth=b1R_*0.32;ctx.beginPath();ctx.arc(ppp.x,ppp.y,b1R_,0,TAU);ctx.stroke();ctx.strokeStyle="rgba(80,150,255,0.5)";ctx.lineWidth=b2R_*0.22;ctx.beginPath();ctx.arc(ppp.x,ppp.y,b2R_,0,TAU);ctx.stroke();ctx.globalAlpha=0.2;ctx.strokeStyle="rgba(80,160,255,0.8)";ctx.lineWidth=1.2;ctx.beginPath();for(var mbi_=0;mbi_<=40;mbi_++){var mba_=mbi_/40*TAU;var mbF_=1-mgSDx*Math.cos(mba_)*0.38-mgSDy*Math.sin(mba_)*0.38;ctx.lineTo(ppp.x+Math.cos(mba_)*mgR*mbF_,ppp.y+Math.sin(mba_)*mgR*mbF_);}ctx.closePath();ctx.stroke();ctx.globalAlpha=0.12;ctx.strokeStyle="rgba(100,180,255,1)";ctx.lineWidth=0.8;for(var mli_=0;mli_<8;mli_++){var mla_=mli_/8*TAU;var mlR_=mgR*(1-mgSDx*Math.cos(mla_)*0.35-mgSDy*Math.sin(mla_)*0.35);ctx.beginPath();ctx.moveTo(ppp.x+Math.cos(mla_)*rr*0.85,ppp.y+Math.sin(mla_)*rr*0.85);ctx.quadraticCurveTo(ppp.x+Math.cos(mla_)*mlR_*0.5,ppp.y+Math.sin(mla_)*mlR_*0.5,ppp.x+Math.cos(mla_)*mlR_,ppp.y+Math.sin(mla_)*mlR_);ctx.stroke();}if(show.labels&&rr>18){ctx.globalAlpha=0.55;ctx.fillStyle="rgba(100,180,255,0.9)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("磁気圏",ppp.x,ppp.y-mgR-4);}ctx.restore();}
          if(pdt.pl.n==="Earth"){var moVe=mOf(_rd,_un),mAnge=(t/MD.p)*TAU,sunAngE=Math.atan2(-pdt.wz,-pdt.wx),cosPhaseE=Math.cos(mAnge-sunAngE),inNode=Math.abs(Math.sin(Math.PI*t/173.31))<0.22;if(inNode){if(cosPhaseE>0.9995)eclipseType="solar";else if(cosPhaseE<-0.9993)eclipseType="lunar";}eclipseEarPj=ppp;eclipseEarRr=rr;}
          if(show.labels){ctx.fillStyle="rgba(255,255,255,0.85)";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(langR.current==="en"?pdt.pl.n:pdt.pl.j,ppp.x,ppp.y-rr-7);if(show.tilt){ctx.fillStyle="rgba(255,255,100,0.45)";ctx.font="8px sans-serif";ctx.fillText(pdt.pl.t+"°",ppp.x,ppp.y+rr+13);}}
        }
      }
      /* Lagrange points (Earth-Sun system) */
      if(show.lagrange&&!_un){var earthD=null;for(var ei=0;ei<pd.length;ei++)if(pd[ei].pl.n==="Earth"){earthD=pd[ei];break;}if(earthD){var ea=Math.atan2(earthD.wz,earthD.wx);var lps=[{n:"L1",x:earthD.wx*0.99,z:earthD.wz*0.99},{n:"L2",x:earthD.wx*1.01,z:earthD.wz*1.01},{n:"L3",x:-earthD.wx,z:-earthD.wz},{n:"L4",x:earthD.oR*Math.cos(ea+TAU/6),z:earthD.oR*Math.sin(ea+TAU/6)},{n:"L5",x:earthD.oR*Math.cos(ea-TAU/6),z:earthD.oR*Math.sin(ea-TAU/6)}];for(var lp=0;lp<5;lp++){var lpp=pj(lps[lp].x,0,lps[lp].z,cam);ctx.strokeStyle="rgba(255,220,120,0.55)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(lpp.x-4,lpp.y);ctx.lineTo(lpp.x+4,lpp.y);ctx.moveTo(lpp.x,lpp.y-4);ctx.lineTo(lpp.x,lpp.y+4);ctx.stroke();if(show.labels){ctx.fillStyle="rgba(255,220,120,0.75)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText(lps[lp].n,lpp.x,lpp.y-7);}hits.push({n:"lag:"+lps[lp].n,x:lpp.x,y:lpp.y,r:8});}}}

      /* Named asteroids in main belt */
      if(show.nasteroid&&!_un){for(var nai=0;nai<NAMED_ASTEROIDS.length;nai++){var na=NAMED_ASTEROIDS[nai];var naOrbR=_rd?(na.a*150)*DK:(160+(na.a*150-330)/200*60);var naM=(t/na.p)*TAU;var naE=naM;for(var nk=0;nk<6;nk++)naE=naM+na.e*Math.sin(naE);var naV=2*Math.atan2(Math.sqrt(1+na.e)*Math.sin(naE/2),Math.sqrt(1-na.e)*Math.cos(naE/2));var naR=naOrbR*(1-na.e*na.e)/(1+na.e*Math.cos(naV));var naX=Math.cos(naV+na.inc)*naR,naZ=Math.sin(naV+na.inc)*naR;var naPj=pj(naX,0,naZ,cam);var naSz=Math.max(1.5,2*Math.min(cam.zm,1));fillCirc(ctx,naPj.x,naPj.y,naSz,na.col);if(show.labels){ctx.fillStyle="rgba(255,220,180,0.7)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(na.j,naPj.x,naPj.y-naSz-3);}hits.push({n:"a:"+na.n,x:naPj.x,y:naPj.y,r:Math.max(naSz*2,10)});}}

      /* Spacecraft trajectories */
      if(show.spacecraft){for(var sci=0;sci<SPACECRAFT.length;sci++){var sc=SPACECRAFT[sci],scX,scY,scZ,scOK=true;if(sc.type==="linear"){var sct=t-sc.launchD;if(sct<0){scOK=false;}else{scX=sc.dx*sc.speed*sct;scY=sc.dy*sc.speed*sct;scZ=sc.dz*sc.speed*sct;}}else{var scM=((t-sc.launchD)/sc.p)*TAU;var scE=scM;for(var sk=0;sk<6;sk++)scE=scM+sc.e*Math.sin(scE);var scV=2*Math.atan2(Math.sqrt(1+sc.e)*Math.sin(scE/2),Math.sqrt(1-sc.e)*Math.cos(scE/2));var scR=sc.a*(1-sc.e*sc.e)/(1+sc.e*Math.cos(scV));scX=Math.cos(scV+sc.inc)*scR;scY=0;scZ=Math.sin(scV+sc.inc)*scR;}if(scOK){var scPj=pj(scX,scY,scZ,cam);var scSz=Math.max(2,3*Math.min(cam.zm,1));ctx.fillStyle=sc.col;ctx.beginPath();ctx.moveTo(scPj.x,scPj.y-scSz);ctx.lineTo(scPj.x-scSz*0.86,scPj.y+scSz*0.5);ctx.lineTo(scPj.x+scSz*0.86,scPj.y+scSz*0.5);ctx.closePath();ctx.fill();if(show.labels){ctx.fillStyle="rgba(255,255,255,0.7)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(sc.name,scPj.x,scPj.y-scSz-3);}hits.push({n:"sc:"+sc.key,x:scPj.x,y:scPj.y,r:Math.max(scSz*2,12)});}}}

      /* Solar wind / CME particles - 8-arm spiral rotating with sun */
      if(show.cme&&!_un){var cmeRot=t*TAU/25;for(var caa=0;caa<8;caa++){var armA=caa*TAU/8+cmeRot;for(var cbb=0;cbb<14;cbb++){var cdist=3+cbb*3.2,ctw=cbb*0.18,cpx=Math.cos(armA+ctw)*cdist,cpz=Math.sin(armA+ctw)*cdist,cppj=pj(cpx,0,cpz,cam),calp=Math.max(0,1-cbb/14)*0.32;if(calp<0.02)continue;ctx.fillStyle="rgba(255,180,80,"+calp.toFixed(2)+")";ctx.fillRect(cppj.x-1,cppj.y-1,2,2);}}}

      if(show.orbits){for(var oi2=0;oi2<pd.length;oi2++){var osr2=pd[oi2].oR*cam.zm;if(osr2<0.5||osr2>orbMaxR||sd2>=osr2*osr2)continue;dOb(ctx,pd[oi2].oR,cam,pd[oi2].pl.cRGB,true);}}

      /* Distance measurement: draw line + AU label between selected bodies */
      var mPair=measPairR.current;
      if(measMR.current&&mPair.length===2){var lookup=function(n){if(n==="sun")return{x:0,y:0,z:0};for(var li=0;li<pd.length;li++)if(pd[li].pl.n===n)return{x:pd[li].wx,y:0,z:pd[li].wz};for(var lj=0;lj<cd.length;lj++)if(cd[lj].cm.key===n)return{x:cd[lj].wx,y:0,z:cd[lj].wz};if(n.indexOf("lag:")===0&&pd[2]){var ea=Math.atan2(pd[2].wz,pd[2].wx),nm=n.slice(4);if(nm==="L1")return{x:pd[2].wx*0.99,y:0,z:pd[2].wz*0.99};if(nm==="L2")return{x:pd[2].wx*1.01,y:0,z:pd[2].wz*1.01};if(nm==="L3")return{x:-pd[2].wx,y:0,z:-pd[2].wz};if(nm==="L4")return{x:pd[2].oR*Math.cos(ea+TAU/6),y:0,z:pd[2].oR*Math.sin(ea+TAU/6)};if(nm==="L5")return{x:pd[2].oR*Math.cos(ea-TAU/6),y:0,z:pd[2].oR*Math.sin(ea-TAU/6)};}return null;};var b1=lookup(mPair[0]),b2=lookup(mPair[1]);if(b1&&b2){var mdx=b2.x-b1.x,mdy=b2.y-b1.y,mdz=b2.z-b1.z,distM=Math.sqrt(mdx*mdx+mdy*mdy+mdz*mdz),distAU=distM/150,distLT=distM*1e6/299792.458;var p1pj=pj(b1.x,b1.y,b1.z,cam),p2pj=pj(b2.x,b2.y,b2.z,cam);ctx.strokeStyle="rgba(255,180,80,0.75)";ctx.lineWidth=1.2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(p1pj.x,p1pj.y);ctx.lineTo(p2pj.x,p2pj.y);ctx.stroke();ctx.setLineDash([]);var midX=(p1pj.x+p2pj.x)/2,midY=(p1pj.y+p2pj.y)/2;ctx.fillStyle="rgba(0,0,0,0.65)";ctx.fillRect(midX-44,midY-9,88,22);ctx.fillStyle="rgba(255,200,120,1)";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText(distAU.toFixed(2)+" AU",midX,midY+1);ctx.fillStyle="rgba(255,220,160,0.85)";ctx.font="9px sans-serif";ctx.fillText(distLT<60?distLT.toFixed(1)+"秒":distLT<3600?(distLT/60).toFixed(1)+"分":(distLT/3600).toFixed(1)+"時",midX,midY+11);}}

      sim.hitAreas=hits;if(ssFade<1)ctx.globalAlpha=1;ctx.restore();
      if(eclipseType&&!cmpR.current){var eTxt=langR.current==="en"?(eclipseType==="solar"?"🌑 Solar Eclipse":"🌕 Lunar Eclipse"):(eclipseType==="solar"?"🌑 日食":"🌕 月食");ctx.save();ctx.font="bold 13px system-ui,sans-serif";ctx.textAlign="center";var etW=ctx.measureText(eTxt).width+24;ctx.fillStyle="rgba(0,0,0,0.72)";ctx.fillRect(W/2-etW/2,H-72,etW,30);ctx.fillStyle=eclipseType==="solar"?"rgba(255,210,80,1)":"rgba(200,150,255,1)";ctx.fillText(eTxt,W/2,H-51);if(eclipseEarPj){ctx.strokeStyle=eclipseType==="solar"?"rgba(255,180,0,0.7)":"rgba(180,120,255,0.7)";ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.arc(eclipseEarPj.x,eclipseEarPj.y,eclipseEarRr+10,0,TAU);ctx.stroke();ctx.setLineDash([]);}ctx.restore();}

      /* Conjunction/opposition alert */
      if(!cmpR.current&&!_un&&cam.zm>0.08&&cam.zm<50){var earthPdIdx=-1;for(var ali0=0;ali0<pd.length;ali0++){if(pd[ali0].pl.n==="Earth"){earthPdIdx=ali0;break;}}if(earthPdIdx>=0){var aex=pd[earthPdIdx].wx,aez=pd[earthPdIdx].wz,aeSL=Math.sqrt(aex*aex+aez*aez);var alertMsg=null,alertIsOpp=false;for(var ali=0;ali<pd.length;ali++){if(ali===earthPdIdx)continue;var tpx2=pd[ali].wx-aex,tpz2=pd[ali].wz-aez,tpL=Math.sqrt(tpx2*tpx2+tpz2*tpz2);if(tpL<0.1||aeSL<0.1)continue;var elongDot=(-aex*tpx2-aez*tpz2)/(aeSL*tpL);var elongDeg=Math.acos(Math.max(-1,Math.min(1,elongDot)))*180/Math.PI;if(elongDeg>174&&!alertIsOpp){alertMsg="🌟 "+pd[ali].pl.j+"が衝 (Opposition)";alertIsOpp=true;}else if(elongDeg<4&&!alertMsg){alertMsg="☀ "+pd[ali].pl.j+"が合 (Conjunction)";}}if(alertMsg){ctx.save();ctx.font="bold 12px system-ui,sans-serif";ctx.textAlign="center";var alW=ctx.measureText(alertMsg).width+24;ctx.fillStyle="rgba(0,0,0,0.75)";ctx.fillRect(W/2-alW/2,8,alW,26);ctx.fillStyle=alertIsOpp?"rgba(100,210,255,1)":"rgba(255,230,80,1)";ctx.fillText(alertMsg,W/2,26);ctx.restore();}}}
      /* Distance comparison bar (log-scale planet distances from Sun) */
      if(show.distbar&&!cmpR.current&&fc==="all"){var dbY=H-78,dbW=Math.min(W-40,520),dbX=(W-dbW)/2,minAU=0.3,maxAU=50,lnMin=Math.log(minAU),lnRange=Math.log(maxAU)-lnMin;ctx.fillStyle="rgba(8,10,20,0.78)";ctx.fillRect(dbX-6,dbY-14,dbW+12,28);ctx.strokeStyle="rgba(255,255,255,0.18)";ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(dbX,dbY);ctx.lineTo(dbX+dbW,dbY);ctx.stroke();var ticks=[1,5,10,30];ctx.fillStyle="rgba(255,255,255,0.5)";ctx.font="8px sans-serif";ctx.textAlign="center";for(var dti=0;dti<ticks.length;dti++){var fx=dbX+(Math.log(ticks[dti])-lnMin)/lnRange*dbW;ctx.beginPath();ctx.moveTo(fx,dbY-3);ctx.lineTo(fx,dbY+3);ctx.stroke();ctx.fillText(ticks[dti]+"AU",fx,dbY+11);}for(var dbi=0;dbi<pd.length;dbi++){var dbau=Math.sqrt(pd[dbi].wx*pd[dbi].wx+pd[dbi].wz*pd[dbi].wz)/150;if(dbau<minAU||dbau>maxAU)continue;var dbpos=dbX+(Math.log(dbau)-lnMin)/lnRange*dbW;ctx.fillStyle=pd[dbi].pl.c;ctx.beginPath();ctx.arc(dbpos,dbY,3,0,TAU);ctx.fill();}}

      /* Galaxy info in screen space */
      if(galInfoFade>0){
        ctx.fillStyle="rgba(255,255,255,"+(galInfoFade*0.35).toFixed(2)+")";ctx.font="12px sans-serif";ctx.textAlign="center";
        ctx.fillText("天の川銀河  Milky Way",W/2,32);ctx.font="9px sans-serif";ctx.fillText("直径: 約10万光年　恒星数: 約1000〜4000億　太陽位置: 中心から約2.6万光年",W/2,48);
        var galSc2=Math.max(cam.zm*30000,W*0.006);var sclLy=10000,sclPx=sclLy/1000*galSc2;
        if(sclPx>20&&sclPx<W*0.4){ctx.strokeStyle="rgba(255,255,255,"+(galInfoFade*0.3).toFixed(2)+")";ctx.lineWidth=1;var sbx2=W/2-sclPx/2,sby2=H-32;ctx.beginPath();ctx.moveTo(sbx2,sby2);ctx.lineTo(sbx2+sclPx,sby2);ctx.moveTo(sbx2,sby2-3);ctx.lineTo(sbx2,sby2+3);ctx.moveTo(sbx2+sclPx,sby2-3);ctx.lineTo(sbx2+sclPx,sby2+3);ctx.stroke();ctx.fillText("1万光年",W/2,sby2-6);}
      }

      var _cl=cleanR.current;var days=Math.floor(t),yrs=t/365.25;var curDate=simDaysToDate(t);if(!_cl){ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="10px sans-serif";ctx.textAlign="right";ctx.fillText(curDate+"  ("+(yrs>=1?(yrs.toFixed(1)+"年 / "):"")+days+"日)",W-16,26);}
      if(_un||_rd){var bPx=80,bW=bPx/cam.zm/DK,bx=W-120,by=H-40;ctx.strokeStyle="rgba(255,255,255,0.35)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+bPx,by);ctx.moveTo(bx,by-4);ctx.lineTo(bx,by+4);ctx.moveTo(bx+bPx,by-4);ctx.lineTo(bx+bPx,by+4);ctx.stroke();ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="9px sans-serif";ctx.textAlign="center";var lbl2;if(bW>=1e6)lbl2=(bW/1e6).toFixed(1)+"億km";else if(bW>=1e4)lbl2=(bW/1e4).toFixed(bW>=1e5?0:1)+"万km";else if(bW>=1)lbl2=Math.round(bW).toLocaleString()+"km";else lbl2=Math.round(bW*1000)+"m";ctx.fillText(lbl2,bx+bPx/2,by-8);}

      if(fc!=="all"){var mmSz=90,mmX=W-mmSz-55,mmY=H-mmSz-55;ctx.fillStyle="rgba(5,5,15,0.75)";ctx.fillRect(mmX-2,mmY-2,mmSz+4,mmSz+4);ctx.strokeStyle="rgba(255,255,255,0.15)";ctx.lineWidth=1;ctx.strokeRect(mmX-2,mmY-2,mmSz+4,mmSz+4);var mmCx=mmX+mmSz/2,mmCy=mmY+mmSz/2,mmScale=(mmSz*0.45)/oR(PL[7],false,false);ctx.fillStyle="rgba(255,200,50,0.8)";ctx.fillRect(mmCx-1.5,mmCy-1.5,3,3);for(var mmi=0;mmi<pd.length;mmi++){var mmOr=oR(pd[mmi].pl,false,false),mmAng2=(t/pd[mmi].pl.p)*TAU,mmPx=mmCx+Math.cos(mmAng2)*mmOr*mmScale,mmPy=mmCy+Math.sin(mmAng2)*mmOr*mmScale;ctx.fillStyle=pd[mmi].pl.c;var mmDot=pd[mmi].pl.n===fc?2.5:1.2;ctx.fillRect(mmPx-mmDot,mmPy-mmDot,mmDot*2,mmDot*2);if(pd[mmi].pl.n===fc){ctx.strokeStyle="rgba(255,255,255,0.6)";ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(mmPx-4,mmPy);ctx.lineTo(mmPx+4,mmPy);ctx.moveTo(mmPx,mmPy-4);ctx.lineTo(mmPx,mmPy+4);ctx.stroke();}}}

      var tr2=tourRef.current;if(tr2.active){var tBarW=180,tBarX=(W-tBarW)/2,tBarY=H-28;if(tr2.trans){tr2.transT=Math.min(1,(tr2.transT||0)+dt/(tr2.transDur||1.8));var ease=tr2.transT<1?tr2.transT*tr2.transT*(3-2*tr2.transT):1;cam.fx=tr2.fromFx+(tr2.toFx-tr2.fromFx)*ease;cam.fz=tr2.fromFz+(tr2.toFz-tr2.fromFz)*ease;var tdx=tr2.toFx-tr2.fromFx,tdz=tr2.toFz-tr2.fromFz,tdist=Math.sqrt(tdx*tdx+tdz*tdz);var midZm=tdist>0.5?Math.min(W,H)*0.35/tdist:Math.max(1,Math.min(tr2.fromZm,tr2.toZm)*0.5);midZm=Math.max(1,midZm);if(ease<0.5){cam.zm=tr2.fromZm+(midZm-tr2.fromZm)*(ease*2);}else{cam.zm=midZm+(tr2.toZm-midZm)*((ease-0.5)*2);}if(tr2.transT>=1){tr2.trans=false;cam.fx=tr2.toFx;cam.fz=tr2.toFz;cam.zm=tr2.toZm;}var tPanProg=ease;ctx.fillStyle="rgba(8,10,20,0.7)";ctx.fillRect(tBarX-8,tBarY-14,tBarW+16,24);ctx.fillStyle="rgba(255,255,255,0.15)";ctx.fillRect(tBarX,tBarY,tBarW,4);ctx.fillStyle="rgba(255,160,50,0.85)";ctx.fillRect(tBarX,tBarY,tBarW*tPanProg,4);ctx.fillStyle="rgba(255,200,100,0.7)";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText("→ "+TOUR_NAMES[tr2.idx]+" ("+(tr2.idx+1)+"/"+TOUR_SEQ.length+")",W/2,tBarY-3);}else{tr2.timer+=dt;if(tr2.timer>=TOUR_HOLD){tr2.timer=0;var nextIdx=(tr2.idx+1)%TOUR_SEQ.length;if(nextIdx===0){tr2.active=false;setTouring(false);setFoc("all");setInfo(null);}else{tr2.fromFx=cam.fx;tr2.fromFz=cam.fz;tr2.fromZm=cam.zm;var tk2=TOUR_SEQ[nextIdx];var toTarget=null;for(var tfi=0;tfi<pd.length;tfi++){if(pd[tfi].pl.n===tk2){toTarget=pd[tfi];break;}}if(!toTarget){for(var tci=0;tci<cd.length;tci++){if(cd[tci].cm.key===tk2){toTarget=cd[tci];break;}}}tr2.toFx=toTarget?toTarget.wx:0;tr2.toFz=toTarget?toTarget.wz:0;tr2.toZm=cam.zm;tr2.idx=nextIdx;tr2.transT=0;tr2.transDur=1.8;tr2.trans=true;setFoc(tk2);setInfo(findInfo(tk2));}}var tProg=tr2.timer/TOUR_HOLD;ctx.fillStyle="rgba(8,10,20,0.7)";ctx.fillRect(tBarX-8,tBarY-14,tBarW+16,24);ctx.fillStyle="rgba(255,255,255,0.15)";ctx.fillRect(tBarX,tBarY,tBarW,4);ctx.fillStyle="rgba(100,180,255,0.7)";ctx.fillRect(tBarX,tBarY,tBarW*tProg,4);ctx.fillStyle="rgba(255,255,255,0.6)";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText("ツアー: "+TOUR_NAMES[tr2.idx]+" ("+(tr2.idx+1)+"/"+TOUR_SEQ.length+")",W/2,tBarY-3);}}

      if(cmpR.current){var cmpSt=cmpStateRef.current;ctx.fillStyle="rgba(3,3,12,0.92)";ctx.fillRect(0,0,W,H);ctx.fillStyle="rgba(255,255,255,0.5)";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("サイズ比較モード（実比率）",W/2,30);var cmpY=H*0.52;var cmpBaseScale=(H*0.015)/PL[2].r;var cmpScale=cmpBaseScale*cmpSt.zm;var sunPx=SRR*cmpScale,sunCX=-sunPx+50;ctx.save();ctx.beginPath();ctx.rect(0,50,W,H-50);ctx.clip();clipCirc(ctx,sunCX,cmpY,sunPx);ctx.fillStyle="rgba(255,200,50,1)";ctx.fill();ctx.fillStyle="rgba(255,220,100,0.7)";ctx.font="11px sans-serif";ctx.textAlign="left";ctx.fillText("太陽 ☀",Math.max(4,sunCX+sunPx+4),cmpY-sunPx*0.1-4);var allCmp=PL.concat(DWARFS);var cmpXs=[],cx=W*0.1+cmpSt.offX;for(var ci=0;ci<allCmp.length;ci++){cmpXs[ci]=cx;var rC=Math.max(allCmp[ci].r*cmpScale,2);var rN=ci<allCmp.length-1?Math.max(allCmp[ci+1].r*cmpScale,2):0;cx+=Math.max(rC+rN+18*cmpSt.zm,44*cmpSt.zm);}for(var cpi=0;cpi<allCmp.length;cpi++){var cpx=cmpXs[cpi],cpr=Math.max(allCmp[cpi].r*cmpScale,1.5);if(cpx+cpr<0||cpx-cpr>W)continue;drawPlanetBody(ctx,cpx,cmpY,cpr,allCmp[cpi],t/Math.abs(allCmp[cpi].rot)*TAU);if(allCmp[cpi].n==="Saturn")dRi(ctx,cpx,cmpY,0,cpr,{fx:0,fy:0,fz:0,rx:0,ry:0,zm:1},allCmp[cpi].t);ctx.fillStyle="rgba(255,255,255,0.85)";ctx.font="11px sans-serif";ctx.textAlign="center";ctx.fillText(allCmp[cpi].j,cpx,cmpY+cpr+16);ctx.fillStyle="rgba(255,255,255,0.45)";ctx.font="9px sans-serif";ctx.fillText("地球の"+(allCmp[cpi].r/6.4).toFixed(1)+"倍",cpx,cmpY+cpr+29);}ctx.restore();ctx.fillStyle="rgba(255,255,255,0.25)";ctx.font="11px sans-serif";ctx.textAlign="center";ctx.fillText("← ドラッグでスクロール　ピンチ/ホイールでズーム →",W/2,H-12);}

      fR.current=requestAnimationFrame(frame);
    }
    fR.current=requestAnimationFrame(frame);
    return function(){alive=false;cancelAnimationFrame(fR.current);window.removeEventListener("resize",rsz);cv.removeEventListener("mousedown",md);window.removeEventListener("mousemove",mm);window.removeEventListener("mouseup",mu);cv.removeEventListener("wheel",wl);cv.removeEventListener("touchstart",tst);cv.removeEventListener("touchmove",tmv);cv.removeEventListener("touchend",ten);window.removeEventListener("keydown",kd);};
  },[dz,focusOn,stopTour]);

  /* Live tick: re-render info panel each second so distance/mag stay current */
  var[infoTick,setInfoTick]=useState(0);
  useEffect(function(){if(!info)return;var iv=setInterval(function(){setInfoTick(function(p){return p+1;});},1000);return function(){clearInterval(iv);};},[info]);
  /* Geocentric data for planet (distance/mag/ang.size/phase) at current sim time */
  function planetGeoData(pl){var t=S.current.t,ang=(t/pl.p)*TAU,px=Math.cos(ang)*pl.d,pz=Math.sin(ang)*pl.d,ea=(t/365)*TAU,ex=Math.cos(ea)*150,ez=Math.sin(ea)*150,dx=px-ex,dz=pz-ez,r=Math.sqrt(dx*dx+dz*dz),helio=pl.d,sunDx=-px,sunDz=-pz,earDx=ex-px,earDz=ez-pz,sl=Math.sqrt(sunDx*sunDx+sunDz*sunDz)*Math.sqrt(earDx*earDx+earDz*earDz);var phaseAng=sl>0?Math.acos((sunDx*earDx+sunDz*earDz)/sl):0;var phaseFrac=(1+Math.cos(phaseAng))/2;var angSize=2*Math.atan(pl.r*1000/(r*1e6))*206264.8;var H={Mercury:-0.4,Venus:-4.4,Earth:0,Mars:-1.5,Jupiter:-9.4,Saturn:-9.0,Uranus:-7.2,Neptune:-7.0,Ceres:3.4,Pluto:-1.0,Eris:-1.2}[pl.n]||0;var phaseCorr=phaseAng*180/Math.PI*0.04;var mag=H+5*Math.log10(helio/100*r/100)+phaseCorr;return{d:r,au:r/150,lt:r*1e6/299792.458,mag:mag,ang:angSize,phaseFrac:phaseFrac,phaseDeg:phaseAng*180/Math.PI};}

  var pn={position:"absolute",background:"rgba(8,10,20,0.88)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"7px 9px",color:"rgba(255,255,255,0.9)",fontSize:11,fontFamily:"system-ui,sans-serif",zIndex:10,backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",maxWidth:"calc(100vw - 20px)",boxSizing:"border-box"};
  var bF={background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,color:"rgba(255,255,255,0.75)",fontSize:10,padding:"4px 8px",cursor:"pointer",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap",outline:"none"};
  var bN=Object.assign({},bF,{background:"rgba(70,140,255,0.25)",border:"1px solid rgba(70,140,255,0.45)",color:"rgba(170,210,255,1)"});
  var bU=Object.assign({},bF,{background:"rgba(255,170,50,0.25)",border:"1px solid rgba(255,170,50,0.5)",color:"rgba(255,210,140,1)"});
  var bD=Object.assign({},bF,{opacity:0.35,cursor:"default"});
  var lb={fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:4,textTransform:"uppercase",letterSpacing:1};
  var curZm=ZS[zi]||1;
  var zmStr=curZm>=10?curZm.toFixed(0)+"x":curZm>=1?curZm.toFixed(1)+"x":curZm>=0.01?curZm.toFixed(2)+"x":curZm.toFixed(5)+"x";
  var zmLabel=curZm<0.003?"銀河":curZm<0.03?"恒星間":"太陽系";
  var bT=function(c){return Object.assign({},bF,{background:"rgba("+c+",0.25)",border:"1px solid rgba("+c+",0.5)",color:"rgba(255,255,255,0.9)"});};

  return(
    <div style={{width:"100%",height:"100dvh",background:"rgba(3,3,10,1)",position:"relative",overflow:"hidden"}}>
      <canvas ref={cR} style={{display:"block",width:"100%",height:"100%",touchAction:"none",cursor:"crosshair"}} onClick={handleClick}/>

      {/* Focus panel */}
      {cleanView===0&&!landing&&<DragPanel style={Object.assign({},pn,{top:10,left:10,maxWidth:300})}><div style={lb}>{lang==="en"?"Focus ⠿":"フォーカス ⠿"}</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{FL.map(function(f){return <button key={f.k} style={foc===f.k?bN:bF} onClick={function(){focusOn(f.k);}}>{lang==="en"?(f.e||f.l):f.l}</button>;})}</div></DragPanel>}

      {/* Speed panel */}
      {cleanView===0&&!landing&&<DragPanel style={Object.assign({},pn,{top:10,right:10})}><div style={lb}>速度 ⠿</div><div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}><button style={Object.assign({},paused?bU:bF,{fontSize:12,padding:"3px 7px"})} onClick={function(){setPaused(function(p){return!p;});}}>{paused?"▶":"⏸"}</button>{SP.map(function(s){return <button key={s} style={spd===s&&!paused?bN:bF} onClick={function(){setSpd(s);setPaused(false);}}>{s}x</button>;})}</div></DragPanel>}

      {/* Toggles panel */}
      {cleanView===0&&!landing&&<DragPanel style={Object.assign({},pn,{bottom:10,left:10,maxWidth:300})}>
        <div style={Object.assign({},lb,{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2})}><span>表示 ⠿</span><button style={Object.assign({},bF,{fontSize:9,padding:"1px 6px",lineHeight:1.4})} onClick={function(){setDispColl(function(p){return!p;});}}>{dispColl?"▼":"▲"}</button></div><div style={{display:dispColl?"none":"block"}}><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[{k:"orbits",l:"軌道"},{k:"trails",l:"軌跡"},{k:"belt",l:"小惑星帯"},{k:"nasteroid",l:"準惑星名"},{k:"tilt",l:"地軸"},{k:"moon",l:"月"},{k:"labels",l:"ラベル"},{k:"planets",l:"惑星"},{k:"lagrange",l:"L点"},{k:"spacecraft",l:"探査機"},{k:"cme",l:"CME"},{k:"distbar",l:"距離バー"}].map(function(x){return <button key={x.k} style={sh[x.k]?bN:bF} onClick={function(){tog(x.k);}}>{x.l}</button>;})}</div>
        <div style={Object.assign({},lb,{marginTop:8,marginBottom:4})}>実スケール</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}><button style={uni?bD:(rSn?bN:bF)} onClick={function(){if(!uni)setRSn(function(p){return!p;});}}>太陽{!uni&&rSn?" ●":""}</button><button style={uni?bD:(rPl?bN:bF)} onClick={function(){if(!uni)setRPl(function(p){return!p;});}}>惑星{!uni&&rPl?" ●":""}</button><button style={uni?bD:(rDi?bN:bF)} onClick={function(){if(!uni)setRDi(function(p){return!p;});}}>距離{!uni&&rDi?" ●":""}</button></div>
        <div style={{marginTop:6,display:"flex",gap:3,flexWrap:"wrap"}}><button style={uni?bU:bF} onClick={function(){setUni(function(p){return!p;});}}>統一比率{uni?" ●":""}</button><button style={compare?bT("100,220,150"):bF} onClick={function(){setCompare(function(p){if(!p)cmpStateRef.current={offX:0,zm:1};return!p;});}}>比較{compare?" ●":""}</button><button style={touring?bT("200,100,255"):bF} onClick={function(){if(touring){stopTour();setFoc("all");setInfo(null);}else{setLanding(null);stopTour();setTouring(true);tourRef.current={active:true,idx:0,timer:0,trans:false};setFoc("sun");setInfo({type:"sun"});}}}>{touring?"ツアー停止":"ツアー"}</button><button style={bgm?bT("80,200,220"):bF} onClick={function(){setBgm(function(p){return!p;});}}>BGM{bgm?" ♪":""}</button><button style={lang==="en"?bT("100,220,180"):bF} onClick={function(){setLang(function(p){return p==="ja"?"en":"ja";});}}>EN/JA</button><button style={measureMode?bT("255,180,80"):bF} onClick={function(){setMeasureMode(function(p){if(p)setMeasurePair([]);return!p;});}}>{measureMode?"計測中"+(measurePair.length===0?"(1つ目)":measurePair.length===1?"(2つ目)":""):"📐計測"}</button></div>
        <div style={Object.assign({},lb,{marginTop:8,marginBottom:4})}>ツール</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
          <button style={showDate?bN:bF} onClick={function(){setShowDate(function(p){return!p;});}}>日付移動</button>
          <button style={bF} onClick={takeScreenshot}>📷 撮影モード</button>
          <button style={bF} onClick={shareURL}>🔗 共有</button>
          <button style={bF} onClick={function(){setImportMode(true);}}>📥 読込</button>
          <button style={bF} onClick={function(){S.current.t=dateToSimDays(new Date().toISOString().slice(0,10));for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];}}>今日</button>
          <button style={bF} onClick={function(){for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];}}>軌跡クリア</button>
          <button style={showEvents?bT("255,200,80"):bF} onClick={function(){if(!showEvents){eventsRef.current=scanEvents(S.current.t);}setShowEvents(function(p){return!p;});}}>📅 天文イベント</button>
          <button style={searchOpen?bT("100,210,255"):bF} onClick={function(){setSearchOpen(function(p){return!p;});setSearchQ("");}}>🔍 検索</button>
          <button style={exoOpen?bT("255,150,90"):bF} onClick={function(){setExoOpen(function(p){return!p;});}}>🪐 系外惑星</button>
          <button style={nightSkyOpen?bT("255,220,80"):bF} onClick={function(){setNightSkyOpen(function(p){return!p;});}}>🌙 今夜の空</button>
          <button style={bookOpen?bT("255,220,120"):bF} onClick={function(){setBookOpen(function(p){return!p;});setBookmarkName("");}}>🔖 ブックマーク</button>
          <button style={bF} onClick={function(){setOnboardStep(0);}}>❓ ガイド</button>
        </div>
        <div style={Object.assign({},lb,{marginTop:6,marginBottom:3})}>可視化</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          <button style={habZone?bN:bF} onClick={function(){setHabZone(function(p){return!p;});}} title="ハビタブルゾーン (0.95–1.37 AU)">🌍 HZ</button>
          <button style={helio?bN:bF} onClick={function(){setHelio(function(p){return!p;});}} title="ヘリオスフィア境界">☀ ヘリオ圏</button>
          <button style={magneto?bN:bF} onClick={function(){setMagneto(function(p){return!p;});}} title="地球磁気圏・ヴァン・アレン帯">🌐 磁気圏</button>
          <button style={nBody?bU:bF} onClick={toggleNBody} title="N体重力シミュレーション (統一比率強制)">⚛ N体</button>
        </div>
        {showDate&&<div style={{marginTop:6,display:"flex",gap:4,alignItems:"center"}}>
          <input type="date" value={dateInput} onChange={function(e){setDateInput(e.target.value);}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:4,color:"rgba(255,255,255,0.9)",fontSize:10,padding:"3px 6px",fontFamily:"system-ui",outline:"none",colorScheme:"dark"}}/>
          <button style={bN} onClick={function(){if(dateInput)jumpToDate(dateInput);}}>移動</button>
        </div>}
        {showDate&&<div style={{marginTop:4,display:"flex",gap:3,flexWrap:"wrap"}}>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("2061-07-28");}}>ハレー彗星 2061</button>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("2035-09-02");}}>日食 2035</button>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("1969-07-20");}}>月面着陸</button>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("2006-01-19");}}>NHニューホライズンズ</button>
        </div>}
      </div>
      </DragPanel>}

      {/* Zoom panel */}
      {cleanView===0&&!landing&&<DragPanel style={Object.assign({},pn,{bottom:10,right:10,display:"flex",flexDirection:"column",alignItems:"center",gap:4})}><div style={lb}>ズーム ⠿</div><button style={Object.assign({},bF,{width:34,height:30,fontSize:18,padding:0,display:"flex",alignItems:"center",justifyContent:"center"})} onClick={zIn}>+</button><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",minWidth:44,textAlign:"center"}}>{zmStr}<br/><span style={{fontSize:7,color:"rgba(255,255,255,0.3)"}}>{zmLabel}</span></div><button style={Object.assign({},bF,{width:34,height:30,fontSize:18,padding:0,display:"flex",alignItems:"center",justifyContent:"center"})} onClick={zOut}>−</button></DragPanel>}

      {/* Event calendar panel */}
      {cleanView===0&&!landing&&showEvents&&<DragPanel style={Object.assign({},pn,{top:80,left:10,width:260,maxWidth:"calc(100vw - 20px)",padding:"10px 12px",maxHeight:"70vh",display:"flex",flexDirection:"column"})}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:11,fontWeight:"bold",color:"rgba(255,220,80,0.95)"}}>📅 天文イベント（2年先まで）</span>
          <button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){setShowEvents(false);}}>✕</button>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {eventsRef.current.length===0&&<div style={{color:"rgba(255,255,255,0.4)",fontSize:9}}>イベントが見つかりません</div>}
          {eventsRef.current.map(function(ev,ei){return <div key={ei} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            <span style={{fontSize:12,flexShrink:0}}>{ev.ic}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.9)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.n}</div>
              <div style={{fontSize:8,color:"rgba(180,200,255,0.6)"}}>{ev.date}</div>
            </div>
            <button style={Object.assign({},bF,{padding:"2px 5px",fontSize:8,flexShrink:0})} onClick={function(){S.current.t=ev.t;setShowEvents(false);}}>→移動</button>
          </div>;})}
        </div>
      </DragPanel>}

      {/* Exoplanet panel */}
      {cleanView===0&&!landing&&exoOpen&&<DragPanel style={Object.assign({},pn,{top:80,left:240,width:240,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"})}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:11,fontWeight:"bold",color:"rgba(255,180,120,0.95)"}}>🪐 系外惑星 → 着陸</span>
          <button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){setExoOpen(false);}}>✕</button>
        </div>
        <div style={{fontSize:9,color:"rgba(255,210,170,0.6)",marginBottom:6}}>近隣の系外惑星地表へ瞬間移動</div>
        {EXOPLANETS.map(function(ex){return <button key={ex.n} style={Object.assign({},bF,{width:"100%",textAlign:"left",marginBottom:4,padding:"5px 8px",lineHeight:1.4})} onClick={function(){doLanding(ex.n);setExoOpen(false);}}>
          <div style={{color:"rgba(255,200,160,0.95)",fontWeight:"bold"}}>{ex.j}</div>
          <div style={{fontSize:8,color:"rgba(220,200,180,0.65)"}}>{ex.e}</div>
          <div style={{fontSize:8,color:"rgba(200,180,160,0.55)"}}>{ex.starInfo} · {ex.temp}</div>
        </button>;})}
      </DragPanel>}

      {/* Bookmarks panel */}
      {cleanView===0&&!landing&&bookOpen&&<DragPanel style={Object.assign({},pn,{top:80,left:10,width:220,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"})}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:11,fontWeight:"bold",color:"rgba(255,220,120,0.95)"}}>🔖 ブックマーク</span>
          <button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){setBookOpen(false);}}>✕</button>
        </div>
        <div style={{display:"flex",gap:3,marginBottom:6}}>
          <input type="text" placeholder="名前..." value={bookmarkName} onChange={function(e){setBookmarkName(e.target.value);}} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:3,color:"rgba(255,255,255,0.9)",fontSize:9,padding:"3px 5px",outline:"none",fontFamily:"system-ui"}}/>
          <button style={bN} onClick={function(){saveBM(bookmarkName||simDaysToDate(S.current.t));setBookmarkName("");}}>保存</button>
        </div>
        <div style={{maxHeight:180,overflowY:"auto"}}>
          {bookmarks.length===0&&<div style={{fontSize:9,color:"rgba(255,255,255,0.3)",padding:"4px 0"}}>保存されたブックマークなし</div>}
          {bookmarks.map(function(bm,bi){return <div key={bi} style={{display:"flex",alignItems:"center",gap:3,padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
            <button style={Object.assign({},bF,{flex:1,textAlign:"left",fontSize:9,padding:"3px 5px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"})} onClick={function(){importState(bm.code);setBookOpen(false);}}>{bm.name}</button>
            <button style={Object.assign({},bF,{padding:"2px 5px",fontSize:8,color:"rgba(255,100,100,0.7)",flexShrink:0})} onClick={function(){delBM(bi);}}>✕</button>
          </div>;})}
        </div>
      </DragPanel>}

      {/* Tonight's Sky panel */}
      {cleanView===0&&!landing&&nightSkyOpen&&<DragPanel style={Object.assign({},pn,{top:80,left:240,width:230,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"})}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:11,fontWeight:"bold",color:"rgba(255,220,80,0.95)"}}>🌙 今夜の空</span>
          <button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){setNightSkyOpen(false);}}>✕</button>
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.45)"}}>緯度</span>
          <input type="number" min="-90" max="90" value={nightSkyLat} onChange={function(e){setNightSkyLat(+e.target.value);}} style={{width:44,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:3,color:"rgba(255,255,255,0.9)",fontSize:9,padding:"2px 4px",outline:"none",fontFamily:"system-ui"}}/>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.45)"}}>° 経度</span>
          <input type="number" min="-180" max="180" value={nightSkyLng} onChange={function(e){setNightSkyLng(+e.target.value);}} style={{width:44,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:3,color:"rgba(255,255,255,0.9)",fontSize:9,padding:"2px 4px",outline:"none",fontFamily:"system-ui"}}/>
          <button style={Object.assign({},bF,{fontSize:8,padding:"2px 5px"})} onClick={function(){if(navigator.geolocation)navigator.geolocation.getCurrentPosition(function(pos){setNightSkyLat(Math.round(pos.coords.latitude));setNightSkyLng(Math.round(pos.coords.longitude));},function(){});}}>📍</button>
        </div>
        {(function(){var nsd=computeNightSky(S.current.t,nightSkyLat,nightSkyLng);return <div>
          <div style={{fontSize:9,color:nsd.isNight?"rgba(100,180,255,0.85)":"rgba(255,200,80,0.8)",marginBottom:5}}>{nsd.isNight?"🌙 夜間観測適":"☀ 昼間 (太陽 "+nsd.sunAlt+"°)"}</div>
          {nsd.items.filter(function(x){return x.name!=="地球";}).map(function(item){return <div key={item.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.05)",opacity:item.vis?1:0.38}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.88)"}}>{item.vis?"✓ ":""}{item.name}</span>
            <span style={{fontSize:8,color:"rgba(180,200,255,0.6)"}}>{item.alt}° / {item.mag}等</span>
          </div>;})}
        </div>;}())}
      </DragPanel>}

      {/* Search panel */}
      {cleanView===0&&!landing&&searchOpen&&<DragPanel style={Object.assign({},pn,{top:80,left:10,width:220,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"})}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:11,fontWeight:"bold",color:"rgba(100,210,255,0.95)"}}>🔍 天体検索</span>
          <button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){setSearchOpen(false);}}>✕</button>
        </div>
        <input autoFocus type="text" placeholder="惑星名・彗星名..." value={searchQ} onChange={function(e){setSearchQ(e.target.value);}}
          style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:4,color:"rgba(255,255,255,0.9)",fontSize:10,padding:"4px 6px",fontFamily:"system-ui",outline:"none",marginBottom:6}}/>
        <div style={{maxHeight:160,overflowY:"auto"}}>
          {(function(){var q=searchQ.toLowerCase();var results=[];FL.forEach(function(f){var nm=(f.l||"")+(f.e?(" "+f.e):"");if(!q||nm.toLowerCase().indexOf(q)>=0)results.push({k:f.k,label:lang==="en"?(f.e||f.l):f.l});});return results.map(function(r){return <button key={r.k} style={Object.assign({},bF,{width:"100%",textAlign:"left",marginBottom:3,padding:"4px 7px"})} onClick={function(){focusOn(r.k);setSearchOpen(false);}}>{r.label}</button>;});}())}
        </div>
      </DragPanel>}

      {/* Info panel */}
      {cleanView===0&&!landing&&info!==null&&<DragPanel style={Object.assign({},pn,{top:80,right:10,width:180,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"})}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:"bold",color:"rgba(255,255,255,0.95)"}}>{info.type==="sun"?(lang==="en"?"Sun":SUNINFO.j):info.type==="comet"?info.cm.name:(lang==="en"?info.pl.n:info.pl.j)}</span><button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){setInfo(null);}}>✕</button></div>{info.type==="sun"?<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)"}}><div>質量: {SUNINFO.mass}</div><div>半径: {SUNINFO.r}</div><div>表面温度: {SUNINFO.temp}</div><div>分類: {SUNINFO.type}</div><div>年齢: {SUNINFO.age}</div></div>:info.type==="comet"?<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)",whiteSpace:"pre-line"}}>{info.cm.info}</div>:<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)"}}><div>質量: {info.pl.mass}</div><div>半径: {(info.pl.r*1000).toLocaleString()} km</div><div>重力: {info.pl.grav}</div><div>自転: {info.pl.day}</div><div>公転: {info.pl.year}</div><div>衛星: {info.pl.moons}個</div><div>大気: {info.pl.atm}</div><div>気温: {info.pl.temp}</div><div>地軸傾斜: {info.pl.t}°</div><div>太陽距離: {info.pl.d}百万km</div>{(function(){var g=planetGeoData(info.pl);return <><div style={{borderTop:"1px solid rgba(255,255,255,0.1)",margin:"6px 0 4px",paddingTop:6,fontSize:9,color:"rgba(255,220,140,0.8)"}}>{lang==="en"?"From Earth (live)":"地球から（現在）"}</div><div>距離: {g.au.toFixed(2)} AU ({g.d.toFixed(0)}百万km)</div><div>光の到達: {g.lt<60?g.lt.toFixed(0)+"秒":g.lt<3600?(g.lt/60).toFixed(1)+"分":(g.lt/3600).toFixed(1)+"時間"}</div><div>視直径: {g.ang.toFixed(1)}″</div><div>等級: {g.mag.toFixed(1)}等</div>{(info.pl.n==="Mercury"||info.pl.n==="Venus")&&<div>位相: {(g.phaseFrac*100).toFixed(0)}%（位相角{g.phaseDeg.toFixed(0)}°）</div>}</>;})()}<button style={Object.assign({},touring?bD:bT("100,180,255"),{marginTop:8,width:"100%",fontSize:11,padding:"6px"})} disabled={touring} onClick={function(){if(!touring)doLanding(info.pl.n);}}>{touring?(lang==="en"?"🚀 Stop Tour First":"🚀 ツアー停止後に着陸可"):(lang==="en"?"🚀 Land":"🚀 着陸")}</button></div>}</DragPanel>}

      {/* Landing mode top-right: speed + liftoff */}
      {landing&&<div style={{position:"absolute",top:10,right:10,zIndex:26,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
        <div style={{background:"rgba(0,5,18,0.82)",border:"1px solid rgba(100,160,255,0.2)",borderRadius:6,padding:"6px 8px",display:"flex",flexWrap:"wrap",justifyContent:"flex-end",gap:3,maxWidth:260}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:"100%",marginBottom:2}}>速度</span>
          <button style={Object.assign({},paused?bT("100,180,255"):bF,{padding:"2px 6px",fontSize:10})} onClick={function(){setPaused(function(p){return!p;})}}>{paused?"▶":"⏸"}</button>
          {LAND_SP.map(function(s){return <button key={s.l} style={Object.assign({},landSpd===s.v&&!paused?bN:bF,{padding:"2px 5px",fontSize:9})} onClick={function(){setLandSpd(s.v);landSpdR.current=s.v;setPaused(false);}}>{s.l}</button>;})}
          <button style={showConst?bT("100,160,255"):bF} onClick={function(){var v=!showConst;setShowConst(v);showConstR.current=v;}}>星座線{showConst?" ●":""}</button>
          <button style={Object.assign({},bT("100,230,160"),{padding:"2px 6px",fontSize:9,marginTop:2,width:"100%"})} onClick={function(){
            S.current.t=(Date.now()-J2000)/86400000;setPaused(false);
            if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(pos){var lng2=Math.round(pos.coords.longitude),lat3=Math.round(pos.coords.latitude);setLandLng(lng2);landLngR.current=lng2;setLandLat(lat3);landLatR.current=lat3;},function(){});}
          }}>📍 今</button>
        </div>
        <button style={Object.assign({},bT("255,100,80"),{fontSize:12,padding:"8px 16px"})} onClick={function(){setLanding(null);}}>{lang==="en"?"🚀 Liftoff":"🚀 離陸"}</button>
      </div>}

      {/* Landing mode control panel — left: latitude vertical, bottom: lng+az+speed */}
      {landing&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",zIndex:25,background:"rgba(0,5,18,0.82)",borderRight:"1px solid rgba(100,160,255,0.2)",padding:"10px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:6,fontFamily:"system-ui,sans-serif"}}>
        <span style={{color:"rgba(120,150,200,0.5)",fontSize:8}}>N</span>
        <span style={{color:"rgba(255,255,255,0.85)",fontSize:9}}>{landLat>=0?"+":""}{landLat}°</span>
        <span style={{color:"rgba(180,210,255,0.7)",fontSize:9}}>緯度</span>
        <input type="range" min="-90" max="90" step="1" value={landLat}
          style={{writingMode:"vertical-lr",direction:"rtl",height:130,width:24,cursor:"pointer",accentColor:"#64b4ff"}}
          onChange={function(e){var v=+e.target.value;setLandLat(v);landLatR.current=v;}}/>
        <span style={{color:"rgba(120,150,200,0.5)",fontSize:8}}>S</span>
      </div>}
      {landing&&<div style={{position:"absolute",bottom:0,left:40,right:0,zIndex:25,background:"rgba(0,5,18,0.85)",borderTop:"1px solid rgba(100,160,255,0.2)",padding:"6px 10px 8px",fontFamily:"system-ui,sans-serif"}}>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:22,flexShrink:0}}>経度</span>
          <input type="range" style={{flex:1,height:16,cursor:"pointer",accentColor:"#64b4ff"}} min="-180" max="180" step="1" value={landLng}
            onChange={function(e){var v=+e.target.value;setLandLng(v);landLngR.current=v;}}/>
          <span style={{color:"rgba(255,255,255,0.85)",fontSize:9,width:46,textAlign:"right",flexShrink:0}}>{landLng>=0?"+":""}{landLng}°</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:22,flexShrink:0}}>方位</span>
          <input type="range" style={{flex:1,height:16,cursor:"pointer",accentColor:"#64b4ff"}} min="0" max="359" step="1"
            value={Math.round(((landYaw*57.296)%360+360)%360)}
            onChange={function(e){var r=(+e.target.value)*0.01745;setLandYaw(r);landYR.current=r;}}/>
          <span style={{color:"rgba(255,255,255,0.85)",fontSize:9,width:46,textAlign:"right",flexShrink:0}}>{(function(){var d=Math.round(((landYaw*57.296)%360+360)%360);var n=d<23?"N":d<68?"NE":d<113?"E":d<158?"SE":d<203?"S":d<248?"SW":d<293?"W":d<338?"NW":"N";return d+"°"+n;})()}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:22,flexShrink:0}}>仰角</span>
          <input type="range" style={{flex:1,height:16,cursor:"pointer",accentColor:"#64b4ff"}} min="-40" max="40" step="1" value={landTilt}
            onChange={function(e){var v=+e.target.value;setLandTilt(v);landTiltR.current=v;}}/>
          <span style={{color:"rgba(255,255,255,0.85)",fontSize:9,width:46,textAlign:"right",flexShrink:0}}>{landTilt>=0?"+":""}{landTilt}°</span>
        </div>
      </div>}

      {cleanView===0&&!landing&&<div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",color:"rgba(255,255,255,0.2)",fontSize:9,fontFamily:"system-ui,sans-serif",pointerEvents:"none",zIndex:10,textAlign:"center"}}>クリックで選択　ドラッグ：回転　ピンチ：ズーム　パネルはドラッグ移動可能</div>}
      <div style={{position:"absolute",top:4,left:4,color:"rgba(255,255,255,0.35)",fontSize:9,fontFamily:"system-ui,sans-serif",pointerEvents:"none",zIndex:20}}>v2.8.0</div>

      {/* Clean view mode for native screenshot */}
      {cleanView>0&&<div style={{position:"absolute",inset:0,zIndex:200}} onClick={function(){setCleanView(0);}}>
        {cleanView===1&&<div style={{position:"absolute",top:16,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.6)",borderRadius:20,padding:"8px 20px",color:"rgba(255,255,255,0.8)",fontSize:12,fontFamily:"system-ui,sans-serif",textAlign:"center",animation:"none"}}>📷 電源＋音量↓ でスクリーンショット<br/><span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>このテキストは1.5秒で消えます</span></div>}
      </div>}

      {/* Share state code overlay */}
      {shareText&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.8)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={function(){setShareText(null);}}>
        <div style={{background:"rgba(15,18,30,0.95)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:16,maxWidth:"90%",width:320}} onClick={function(e){e.stopPropagation();}}>
          <div style={{color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:"bold",marginBottom:8,fontFamily:"system-ui,sans-serif"}}>🔗 状態コード</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:9,marginBottom:8,fontFamily:"system-ui,sans-serif"}}>このコードを共有すると同じ視点を再現できます</div>
          <input id="share-url-input" type="text" readOnly value={shareText} onFocus={function(e){e.target.select();}} style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:6,color:"rgba(255,255,255,0.95)",fontSize:11,padding:"8px",fontFamily:"monospace",outline:"none",boxSizing:"border-box",textAlign:"center",letterSpacing:0.5}}/>
          <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
            <button onClick={function(){try{var inp=document.querySelector("#share-url-input");if(inp){inp.focus();inp.select();inp.setSelectionRange(0,99999);document.execCommand("copy");}}catch(e){}}} style={{background:"rgba(70,140,255,0.3)",border:"1px solid rgba(70,140,255,0.5)",borderRadius:6,color:"rgba(170,210,255,1)",fontSize:10,padding:"6px 14px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>コピー</button>
            <button onClick={function(){setShareText(null);}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"rgba(255,255,255,0.7)",fontSize:10,padding:"6px 14px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>閉じる</button>
          </div>
        </div>
      </div>}

      {/* Import state code overlay */}
      {importMode&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.8)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={function(){setImportMode(false);}}>
        <div style={{background:"rgba(15,18,30,0.95)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:16,maxWidth:"90%",width:320}} onClick={function(e){e.stopPropagation();}}>
          <div style={{color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:"bold",marginBottom:8,fontFamily:"system-ui,sans-serif"}}>📥 コード読込</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:9,marginBottom:8,fontFamily:"system-ui,sans-serif"}}>共有された状態コードを貼り付けてください</div>
          <input type="text" value={importText} onChange={function(e){setImportText(e.target.value);}} placeholder="SS|9613.2|..." style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:6,color:"rgba(255,255,255,0.95)",fontSize:11,padding:"8px",fontFamily:"monospace",outline:"none",boxSizing:"border-box",textAlign:"center"}}/>
          <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
            <button onClick={function(){if(importState(importText)){setImportMode(false);setImportText("");}}} style={{background:"rgba(70,140,255,0.3)",border:"1px solid rgba(70,140,255,0.5)",borderRadius:6,color:"rgba(170,210,255,1)",fontSize:10,padding:"6px 14px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>復元</button>
            <button onClick={function(){setImportMode(false);}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"rgba(255,255,255,0.7)",fontSize:10,padding:"6px 14px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>閉じる</button>
          </div>
        </div>
      </div>}

      {/* Onboarding tour overlay */}
      {onboardStep>=0&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.78)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}} onClick={function(e){e.stopPropagation();}}>
        <div style={{background:"rgba(10,14,28,0.98)",border:"1px solid rgba(100,180,255,0.3)",borderRadius:16,padding:"22px 26px",maxWidth:350,width:"90%",color:"rgba(255,255,255,0.92)"}}>
          <div style={{fontSize:9,color:"rgba(100,180,255,0.5)",letterSpacing:2,marginBottom:7}}>{"STEP "+(onboardStep+1)+" / 5"}</div>
          {onboardStep===0&&<><div style={{fontSize:19,fontWeight:"bold",marginBottom:8}}>🌌 ようこそ</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>太陽系・銀河系・惑星地表を<br/>インタラクティブに探索できる<br/>シミュレーターへようこそ！</div></>}
          {onboardStep===1&&<><div style={{fontSize:17,fontWeight:"bold",marginBottom:8}}>🖱 ナビゲーション</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>・ドラッグ: 視点を回転<br/>・ホイール / ピンチ: ズーム<br/>・クリック: 天体を選択・詳細表示<br/>・[1-8]キー: 惑星選択</div></>}
          {onboardStep===2&&<><div style={{fontSize:17,fontWeight:"bold",marginBottom:8}}>🚀 惑星着陸</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>惑星をクリック→情報パネルの<br/>「着陸」ボタンで地表ビューへ。<br/>星空・日食・オーロラなども<br/>リアルに再現されます。</div></>}
          {onboardStep===3&&<><div style={{fontSize:17,fontWeight:"bold",marginBottom:8}}>⚙ 豊富な機能</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>・ツアー: 太陽系を自動巡回<br/>・天文イベント: 日食・惑星の合<br/>・N体シミュレーション<br/>・系外惑星着陸・ブックマーク</div></>}
          {onboardStep===4&&<><div style={{fontSize:17,fontWeight:"bold",marginBottom:8}}>✨ 探索を始めよう！</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>表示パネルの [❓ ガイド] で<br/>このチュートリアルをいつでも<br/>再表示できます。<br/>宇宙探索をお楽しみください！</div></>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:20}}>
            <button style={Object.assign({},bF,{fontSize:9,padding:"3px 10px"})} onClick={function(){setOnboardStep(-1);localStorage.setItem("solar_ob","1");}}>スキップ</button>
            <div style={{display:"flex",gap:5}}>{[0,1,2,3,4].map(function(i){return <div key={i} style={{width:6,height:6,borderRadius:3,background:i===onboardStep?"rgba(100,180,255,1)":"rgba(255,255,255,0.2)"}}/>;})}</div>
            <button style={bN} onClick={function(){var n=onboardStep+1;if(n>=5){setOnboardStep(-1);localStorage.setItem("solar_ob","1");}else setOnboardStep(n);}}>{onboardStep===4?"完了 ✓":"次へ →"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
