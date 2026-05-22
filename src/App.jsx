import { useState, useReducer, useRef, useEffect, useCallback } from "react";
import { version as APP_VERSION } from "../package.json";
import { useRefSync } from "./hooks/useRefSync.js";
import { useKeyboard } from "./hooks/useKeyboard.js";
import { PL, MD, GMOONS, EXTRA_MOONS, NAMED_ASTEROIDS, SPACECRAFT, COMETS, PL_MAP, COMET_MAP, DWARFS, DWARF_MAP, SRR, DK, SK, TRAIL_LEN, TAU, FL, SP, ZS, TOUR_SEQ, TOUR_NAMES, TOUR_NAMES_EN, TOUR_HOLD, TOUR_DESC, TOUR_DESC_BEG, TOUR_DESC_ADV, TOUR_DESC_EN, TOUR_EXAM, TOUR_EXAM_BEG, TOUR_EXAM_ADV, TOUR_EXAM_EN, LAND_SP, ZODIAC, ZODIAC_BASE, J2000 } from "./data/solarData.js";
import { oR, pRf, sRf, mOf, mRf, RX, RY, pj, fillCirc, sphereShade, dC } from "./render/utils.js";
import { dOb, dRi, dRiUranus, dSh, dAx, drawPlanetBody, drawEarthInteriorOverlay, drawSun, sSP, SD, NB, AST, TROJAN, KUIPER, drawEarthCityLights, drawMoonDetail } from "./render/drawBodies.js";
import { drawOverlays, drawCompareMode } from "./render/drawOverlays.js";
import { drawGalaxyView, drawGalaxyInfo } from "./render/drawGalaxyView.js";
import { drawDateReadout, drawScaleBar, drawMiniMap, drawFps, drawEclipseAlert, drawConjunctionAlert } from "./render/drawScreenHUD.js";
import { drawTourHUD } from "./render/drawTourHUD.js";
import { drawLanding } from "./render/drawLanding.js";
import { startLandSound, stopLandSound } from "./audio/landAudio.js";
import { dateToSimDays, simDaysToDate, scanEvents } from "./utils/timeUtils.js";
import { DragPanel } from "./components/DragPanel.jsx";
import { initNBody } from "./utils/computations.js";
import { PANEL_INIT, panelReducer } from "./utils/panelReducer.js";
import { pn, bF, bN, bU, bD, lb, bT, bFM, bNM } from "./styles/panelStyles.js";
import InfoPanel from "./components/panels/InfoPanel.jsx";
import LandingQuickJump from "./components/LandingQuickJump.jsx";
import CompareTablePanel from "./components/panels/CompareTablePanel.jsx";
import QuizPanel from "./components/panels/QuizPanel.jsx";
import TourPickerPanel from "./components/panels/TourPickerPanel.jsx";
import EventsPanel from "./components/panels/EventsPanel.jsx";
import ExoplanetPanel from "./components/panels/ExoplanetPanel.jsx";
import SatellitePanel from "./components/panels/SatellitePanel.jsx";
import BookmarkPanel from "./components/panels/BookmarkPanel.jsx";
import NightSkyPanel from "./components/panels/NightSkyPanel.jsx";
import SearchPanel from "./components/panels/SearchPanel.jsx";
import MoonCalendarPanel from "./components/panels/MoonCalendarPanel.jsx";
import MeteorShowerPanel from "./components/panels/MeteorShowerPanel.jsx";
import OrbitalElementsPanel from "./components/panels/OrbitalElementsPanel.jsx";
import EarthInteriorPanel from "./components/panels/EarthInteriorPanel.jsx";
import HelpPanel from "./components/panels/HelpPanel.jsx";

export default function App(){
  var cR=useRef(null),fR=useRef(0);
  var S=useRef({t:dateToSimDays(new Date().toISOString().slice(0,10))||0,cam:{rx:0.22,ry:0.3,zm:1,tzm:1,fx:0,fy:0,fz:0},dr:null,pi:null,trails:PL.map(function(){return[];}),hitAreas:[],dragged:false});
  var[initCfg]=useState(function(){try{var s=localStorage.getItem("solar_cfg");return s?JSON.parse(s):{};}catch(e){return{};}});
  var[sh,setSh,shR]=useRefSync(Object.assign({orbits:true,tilt:true,moon:true,labels:true,planets:true,trails:true,belt:true,trojan:false,kuiper:false,lagrange:false,spacecraft:false,nasteroid:true,cme:false,distbar:false},initCfg.sh||{}));
  var[spd,setSpd,spR]=useRefSync(initCfg.spd||1);
  var[rSn,setRSn,rsR]=useRefSync(false);var[rPl,setRPl,rpR]=useRefSync(false);var[rDi,setRDi,rdR]=useRefSync(false);var[uni,setUni,unR]=useRefSync(false);
  var[foc,setFoc,foR]=useRefSync("all");var[zi,setZi,ziR]=useRefSync(17);
  var[paused,setPaused,pausR]=useRefSync(false);var[info,setInfo]=useState(null);var[compare,setCompare,cmpR]=useRefSync(false);
  var focTransRef=useRef({active:false});
  var scrubAnchorRef=useRef(null);
  var tourRef=useRef({active:false,idx:0,timer:0,trans:false,lv:"int"});
  /* Pick TOUR_DESC/EXAM/NAMES arrays based on current level + language */
  function tourData(lv,enFlag){
    var names=enFlag?TOUR_NAMES_EN:TOUR_NAMES;
    if(enFlag)return{names:names,desc:TOUR_DESC_EN,exam:TOUR_EXAM_EN};
    if(lv==="beg")return{names:names,desc:TOUR_DESC_BEG,exam:TOUR_EXAM_BEG};
    if(lv==="adv")return{names:names,desc:TOUR_DESC_ADV,exam:TOUR_EXAM_ADV};
    return{names:names,desc:TOUR_DESC,exam:TOUR_EXAM};
  }
  var[touring,setTouring]=useState(false);
  var[panels,dispatchPanel]=useReducer(panelReducer,Object.assign({},PANEL_INIT,typeof window!=="undefined"&&window.innerWidth<640?{dispColl:true}:{}));var eventsRef=useRef([]);
  var cmpStateRef=useRef({offX:0,zm:1});
  var[bgm,setBgm]=useState(false);var audioRef=useRef(null);
  var[dateInput,setDateInput]=useState("");
  var[landing,setLanding]=useState(null);
  var[landYaw,setLandYaw,landYR]=useRefSync(0);
  var[landLat,setLandLat,landLatR]=useRefSync(0);
  var[landLng,setLandLng,landLngR]=useRefSync(0);
  var[landFov,setLandFov,landFovR]=useRefSync(1);
  var[landSpd,setLandSpd,landSpdR]=useRefSync(3600/86400);
  var[landTilt,setLandTilt,landTiltR]=useRefSync(0);
  var[lang,setLang,langR]=useRefSync(initCfg.lang||"ja");
  var[quizState,setQuizState]=useState(null);
  var[cmpSort,setCmpSort]=useState({col:"d",asc:true});
  var[winW,setWinW]=useState(typeof window!=="undefined"?window.innerWidth:1280);
  useEffect(function(){function onResize(){setWinW(window.innerWidth);}window.addEventListener("resize",onResize);return function(){window.removeEventListener("resize",onResize);};},[]);
  var isPhone=winW<640;
  var[searchQ,setSearchQ]=useState("");
  var[habZone,setHabZone,habZR]=useRefSync(false);
  var[helio,setHelio,helioR]=useRefSync(false);
  var[magneto,setMagneto,magnetoR]=useRefSync(false);
  var[nightSkyLat,setNightSkyLat]=useState(35);
  var[nightSkyLng,setNightSkyLng]=useState(135);
  var[bookmarks,setBookmarks]=useState(function(){try{return JSON.parse(localStorage.getItem("solar_bm")||"[]");}catch(e){return[];}});
  var[bookmarkName,setBookmarkName]=useState("");
  var[nBody,setNBody,nBodyR]=useRefSync(false);
  var nBodyStateR=useRef(null);
  var[onboardStep,setOnboardStep]=useState(function(){return localStorage.getItem("solar_ob")?-1:0;});
  var landR=useRef(null);
  var[showConst,setShowConst,showConstR]=useRefSync(true);
  var[hillSphere,setHillSphere,hillR]=useRefSync(false);
  var[shadowCone,setShadowCone,shadowR]=useRefSync(false);
  var[tidalForce,setTidalForce,tidalR]=useRefSync(false);
  var[telescopeMode,setTelescopeMode,teleR]=useRefSync(false);
  var[showEarthInt,setShowEarthInt,earthIntR]=useRefSync(false);
  var[showFps,setShowFps,showFpsR]=useRefSync(false);var fpsFrames=useRef([]);

  useEffect(function(){landR.current=landing;if(landing){startLandSound(landing);}else{stopLandSound();}return function(){stopLandSound();};},[landing]);
  useEffect(function(){try{localStorage.setItem("solar_cfg",JSON.stringify({lang:lang,sh:sh,spd:spd}));}catch(e){};},[lang,sh,spd]);
  useEffect(function(){if(!bgm)return;var ctx2;try{ctx2=new(window.AudioContext||window.webkitAudioContext)();var m=ctx2.createGain();m.gain.value=0;m.connect(ctx2.destination);m.gain.linearRampToValueAtTime(0.22,ctx2.currentTime+2);var b=ctx2.createOscillator();b.type="sine";b.frequency.value=55;var bg=ctx2.createGain();bg.gain.value=0.18;b.connect(bg);bg.connect(m);b.start();var p1=ctx2.createOscillator();p1.type="sine";p1.frequency.value=110;var pg=ctx2.createGain();pg.gain.value=0.06;p1.connect(pg);pg.connect(m);p1.start();var p2=ctx2.createOscillator();p2.type="sine";p2.frequency.value=164.81;var p2g=ctx2.createGain();p2g.gain.value=0.04;p2.connect(p2g);p2g.connect(m);p2.start();var p3=ctx2.createOscillator();p3.type="sine";p3.frequency.value=329.63;var p3g=ctx2.createGain();p3g.gain.value=0.02;p3.connect(p3g);p3g.connect(m);p3.start();var notes=[523.25,659.25,783.99,1046.5,1318.5,1567.98];var si2=setInterval(function(){if(ctx2.state==="closed")return;var o=ctx2.createOscillator();o.type="sine";o.frequency.value=notes[Math.floor(Math.random()*notes.length)];var g2=ctx2.createGain();g2.gain.value=0.02+Math.random()*0.02;o.connect(g2);g2.connect(m);o.start();g2.gain.exponentialRampToValueAtTime(0.001,ctx2.currentTime+3);o.stop(ctx2.currentTime+4);},2500+Math.random()*3000);audioRef.current={ctx:ctx2,master:m,si:si2};}catch(e){}return function(){if(audioRef.current){clearInterval(audioRef.current.si);try{audioRef.current.master.gain.linearRampToValueAtTime(0,audioRef.current.ctx.currentTime+0.5);setTimeout(function(){try{audioRef.current.ctx.close();}catch(e2){}audioRef.current=null;},600);}catch(e3){}};};},[bgm]);

  var dz=useCallback(function(i){var c=Math.max(0,Math.min(ZS.length-1,i));S.current.cam.zm=ZS[c];return c;},[]);
  var zIn=useCallback(function(){setZi(function(p){var n=Math.min(ZS.length-1,p+1);dz(n);S.current.cam.tzm=ZS[n];return n;});},[dz]);
  var zOut=useCallback(function(){setZi(function(p){var n=Math.max(0,p-1);dz(n);S.current.cam.tzm=ZS[n];return n;});},[dz]);
  var tog=useCallback(function(k){setSh(function(p){var o={};for(var x in p)o[x]=p[x];o[k]=!p[k];return o;});},[]);
  function bestZiFor(name,withComet){if(name==="all")return -1;var wr;if(name==="sun"){wr=(SRR/1000)*DK;}else{var pl=PL_MAP[name]||DWARF_MAP[name];if(pl){wr=(pl.r/1000)*DK;}else if(withComet&&COMET_MAP[name]){wr=(1/1000)*DK;}else{return -1;}}var ideal=30/Math.max(wr,0.00001),best=0,bd=1e15;for(var i=0;i<ZS.length;i++){var d=Math.abs(ZS[i]-ideal);if(d<bd){bd=d;best=i;}}return best;}
  function autoZoomVal(name,isUni){if(!isUni)return null;var bi=bestZiFor(name,true);return bi<0?null:ZS[bi];}
  var autoZoom=useCallback(function(name,isUni){if(!isUni)return;var bi=bestZiFor(name,false);if(bi<0)return;S.current.cam.tzm=ZS[bi];ziR.current=bi;setZi(bi);},[]);
  useEffect(function(){if(uni&&foc!=="all"){autoZoom(foc,true);}},[uni,foc,autoZoom]);
  var stopTour=useCallback(function(){setTouring(false);if(tourRef.current)tourRef.current.active=false;},[]);
  var startTourLv=useCallback(function(lv){setLanding(null);stopTour();setTouring(true);tourRef.current={active:true,idx:0,timer:0,trans:false,lv:lv};setFoc("sun");setInfo({type:"sun"});},[stopTour]);
  /* Toggle a panel; on phone, close other exclusive panels at the same time */
  var togglePanel=useCallback(function(key){dispatchPanel({type:isPhone?"TOGGLE_EX":"TOGGLE",key:key});},[isPhone]);
  var startQuiz=useCallback(function(){setQuizState({lv:null});},[]);
  var closeQuiz=useCallback(function(){setQuizState(null);},[]);
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

  useKeyboard({
    setPaused:setPaused,focusOn:focusOn,landR:landR,landFovR:landFovR,setLandFov:setLandFov,
    zIn:zIn,zOut:zOut,spR:spR,setSpd:setSpd,setCompare:setCompare,cmpStateRef:cmpStateRef,
    tourRef:tourRef,stopTour:stopTour,setFoc:setFoc,setInfo:setInfo,setLanding:setLanding,
    setTouring:setTouring,setBgm:setBgm,ziR:ziR,dz:dz,setZi:setZi,foR:foR,doLanding:doLanding,
    dispatchPanel:dispatchPanel,isPhone:isPhone
  });

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
  var[importText,setImportText]=useState("");
  var shareURL=useCallback(function(){
    var s=S.current,c=s.cam,code;
    if(landR.current){
      /* SL = Solar Landing: t|plName|lat|lng|yaw|fov|tilt */
      code="SL|"+s.t.toFixed(1)+"|"+landR.current+"|"+landLatR.current.toFixed(2)+"|"+landLngR.current.toFixed(2)+"|"+landYR.current.toFixed(3)+"|"+landFovR.current.toFixed(2)+"|"+landTiltR.current.toFixed(2);
    }else{
      code="SS|"+s.t.toFixed(1)+"|"+c.rx.toFixed(3)+"|"+c.ry.toFixed(3)+"|"+zi+"|"+foc;
    }
    setShareText(code);
  },[zi,foc]);
  var importState=useCallback(function(code){
    try{
      var p=code.split("|");if(p.length<6)return false;
      /* Exit any special modes first */
      setCompare(false);stopTour();
      if(p[0]==="SL"){
        /* Landing state restore: t|plName|lat|lng|yaw|fov|tilt */
        if(p.length<8)return false;
        var plName=p[2];if(!PL_MAP[plName]&&!DWARF_MAP[plName])return false;
        S.current.t=parseFloat(p[1]);
        var lat2=parseFloat(p[3]),lng2=parseFloat(p[4]),yaw2=parseFloat(p[5]),fov2=parseFloat(p[6]),tilt2=parseFloat(p[7]);
        landLatR.current=lat2;setLandLat(lat2);
        landLngR.current=lng2;setLandLng(lng2);
        landYR.current=yaw2;setLandYaw(yaw2);
        landFovR.current=fov2;setLandFov(fov2);
        landTiltR.current=tilt2;setLandTilt(tilt2);
        setFoc(plName);setInfo(findInfo(plName));
        setLanding(plName);
        return true;
      }
      if(p[0]!=="SS")return false;
      setLanding(null);
      S.current.t=parseFloat(p[1]);
      S.current.cam.rx=parseFloat(p[2]);S.current.cam.ry=parseFloat(p[3]);
      var zv=parseInt(p[4]);if(zv>=0&&zv<ZS.length){setZi(zv);S.current.cam.zm=ZS[zv];}
      var fv=p[5];setFoc(fv);setInfo(fv==="all"?null:findInfo(fv));
      for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];
      return true;
    }catch(e){return false;}
  },[stopTour]);

  /* URL 経由の決定論的初期状態読み込み（テスト・共有用）
     例: ?state=SS|0|0.22|0.3|17|all&paused=1 */
  useEffect(function(){
    try{
      var qs=new URLSearchParams(window.location.search);
      var st=qs.get("state");if(st)importState(st);
      if(qs.get("paused")==="1")setPaused(true);
    }catch(e){}
  },[]);



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
    cv.addEventListener("mousedown",md);window.addEventListener("mousemove",mm);window.addEventListener("mouseup",mu);cv.addEventListener("wheel",wl,{passive:false});cv.addEventListener("touchstart",tst,{passive:false});cv.addEventListener("touchmove",tmv,{passive:false});cv.addEventListener("touchend",ten);
    var sArr=SD.s,sCols=SD.c,nArr=NB;

    function frame(ts2){
      if(!alive)return;var dt=lt?Math.min((ts2-lt)/1000,0.1):0.016;lt=ts2;if(!pausR.current){if(landR.current)sim.t+=dt*landSpdR.current;else sim.t+=dt*spR.current;}
      var pa=cv.parentElement,W=pa.clientWidth,H=pa.clientHeight;if(cv.style.width!==W+"px")rsz();
      /* FPS counter */
      if(showFpsR.current){var fnow=performance.now();fpsFrames.current.push(fnow);fpsFrames.current=fpsFrames.current.filter(function(f){return fnow-f<1000;});}
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
      drawGalaxyView(ctx,W,H,cam,galFade);
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
      /* Precompute Earth entry once — reused by Lagrange, eclipse, conjunction, Hill, tidal */
      var earthPd=null,earthPdIdx=-1;for(var epi=0;epi<pd.length;epi++){if(pd[epi].pl.n==="Earth"){earthPd=pd[epi];earthPdIdx=epi;break;}}

      var cd=[];for(var cci=0;cci<COMETS.length;cci++){var cm0=COMETS[cci],cm0E=cm0.e;var cm0OrbR=_rd||_un?cm0.a*DK:(160+Math.pow((cm0.a-228)/4267,0.55)*280);var cm0M=((t/cm0.p)+cm0.phase0)*TAU;var cm0Ecc=cm0M;for(var ki0=0;ki0<6;ki0++){cm0Ecc=cm0M+cm0E*Math.sin(cm0Ecc);}var cm0V=2*Math.atan2(Math.sqrt(1+cm0E)*Math.sin(cm0Ecc/2),Math.sqrt(1-cm0E)*Math.cos(cm0Ecc/2));var cm0R=cm0OrbR*(1-cm0E*cm0E)/(1+cm0E*Math.cos(cm0V));cd.push({cm:cm0,orbR:cm0OrbR,wx:Math.cos(cm0V+cm0.inc)*cm0R,wy:0,wz:Math.sin(cm0V+cm0.inc)*cm0R});}

      trailTimer+=dt;if(trailTimer>0.05&&!pausR.current&&!tourRef.current.trans){trailTimer=0;for(var ti=0;ti<sim.trails.length;ti++){sim.trails[ti].push({x:pd[ti].wx,z:pd[ti].wz});if(sim.trails[ti].length>TRAIL_LEN)sim.trails[ti].shift();}}

      var tfx=0,tfy=0,tfz=0,hasTarget=false;
      if(fc!=="all"&&fc!=="sun"){if(fc==="Moon"&&earthPd){var moVfc=mOf(_rd,_un),mAngFc=(t/MD.p)*TAU,_mIRf=5.145*0.01745,_mNRf=125.04*0.01745,_cOf=Math.cos(_mNRf),_sOf=Math.sin(_mNRf),_cIf=Math.cos(_mIRf),_sIf=Math.sin(_mIRf),_cUf=Math.cos(mAngFc),_sUf=Math.sin(mAngFc);tfx=earthPd.wx+moVfc*(_cOf*_cUf-_sOf*_sUf*_cIf);tfy=moVfc*_sUf*_sIf;tfz=earthPd.wz+moVfc*(_sOf*_cUf+_cOf*_sUf*_cIf);hasTarget=true;}else{for(var fi=0;fi<pd.length;fi++){if(pd[fi].pl.n===fc){tfx=pd[fi].wx;tfy=pd[fi].wy;tfz=pd[fi].wz;hasTarget=true;break;}}if(!hasTarget){for(var fi2=0;fi2<cd.length;fi2++){if(cd[fi2].cm.key===fc){tfx=cd[fi2].wx;tfy=cd[fi2].wy;tfz=cd[fi2].wz;hasTarget=true;break;}}}}}
      var ft=focTransRef.current;if(ft.active){if(!ft.ready){if(hasTarget){ft.toFx=tfx;ft.toFz=tfz;ft.ready=true;}else if(fc==="sun"||fc==="all"){ft.toFx=0;ft.toFz=0;ft.ready=true;}}if(ft.ready){ft.t=Math.min(1,ft.t+dt/ft.dur);var ease2=ft.t*ft.t*(3-2*ft.t);cam.fx=ft.fromFx+(ft.toFx-ft.fromFx)*ease2;cam.fz=ft.fromFz+(ft.toFz-ft.fromFz)*ease2;var midZm=Math.max(0.0001,Math.min(ft.fromZm,ft.toZm)*0.15);if(ease2<0.5){cam.zm=ft.fromZm+(midZm-ft.fromZm)*(ease2*2);}else{cam.zm=midZm+(ft.toZm-midZm)*((ease2-0.5)*2);}if(ft.t>=1){ft.active=false;cam.fx=ft.toFx;cam.fz=ft.toFz;cam.zm=ft.toZm;}}}else if(hasTarget||fc==="sun"){var gx=tfx-cam.fx,gz=tfz-cam.fz;var lf=Math.min(1,dt*(7+Math.sqrt(gx*gx+gz*gz)*cam.zm*1.5));cam.fx+=gx*lf;cam.fy+=(tfy-cam.fy)*lf;cam.fz+=gz*lf;}else if(fc==="all"){cam.fx*=0.92;cam.fy*=0.92;cam.fz*=0.92;}

      /* sunPj + sun-to-viewport squared distance hoisted: needed by both orbit passes */
      var sunPj=pj(0,0,0,cam);
      var orbMaxR=Math.max(W,H)*20;/* skip orbits >20× viewport: arc would be a near-straight line */
      var snx=Math.max(-W/2,Math.min(W/2,sunPj.x)),sny=Math.max(-H/2,Math.min(H/2,sunPj.y));
      var sd2=(snx-sunPj.x)*(snx-sunPj.x)+(sny-sunPj.y)*(sny-sunPj.y);
      if(show.orbits){for(var oi=0;oi<pd.length;oi++){var osr=pd[oi].oR*cam.zm;if(osr<0.5||osr>orbMaxR||sd2>=osr*osr)continue;dOb(ctx,pd[oi].oR,cam,pd[oi].pl.cRGB,false);}}
      if(show.trails){for(var tri=0;tri<sim.trails.length;tri++){var trail=sim.trails[tri];if(trail.length<3)continue;var cStr=pd[tri].pl.c.replace(",1)","");var bs=Math.max(2,Math.floor(trail.length/10));for(var tb=0;tb<trail.length-1;tb+=bs){var te2=Math.min(tb+bs+1,trail.length),mA=((tb+te2)*0.5/trail.length)*0.5;ctx.beginPath();ctx.strokeStyle=cStr+","+mA.toFixed(2)+")";ctx.lineWidth=1.5;var fp=pj(trail[tb].x,0,trail[tb].z,cam);ctx.moveTo(fp.x,fp.y);for(var tj=tb+1;tj<te2;tj++){var cp=pj(trail[tj].x,0,trail[tj].z,cam);ctx.lineTo(cp.x,cp.y);}ctx.stroke();}}}
      if(show.belt&&!_un){ctx.fillStyle="rgba(160,150,130,0.4)";for(var ai=0;ai<AST.length;ai++){var as2=AST[ai],aR=_rd?as2.rad*0.15*DK:(160+(as2.rad-330)/200*60),aAng=as2.ang+t*as2.spd,ap=pj(Math.cos(aAng)*aR,as2.y*(_rd?0.1:1),Math.sin(aAng)*aR,cam),aSz=Math.max(as2.sz*cam.zm,0.2);ctx.fillRect(ap.x-aSz*0.5,ap.y-aSz*0.5,aSz,aSz);}}
      /* Jupiter Trojans: L4 = +60° ahead, L5 = -60° behind Jupiter */
      if(show.trojan&&!_un){var jupAng=(t/PL[4].p)*TAU;ctx.fillStyle="rgba(180,170,140,0.55)";for(var tji=0;tji<TROJAN.length;tji++){var tj=TROJAN[tji],tjAng=jupAng+(tj.lp===1?TAU/6:-TAU/6)+tj.off,tjR=_rd?tj.rad*0.15*DK:(160+(tj.rad-330)/200*60),tjp=pj(Math.cos(tjAng)*tjR,tj.y*(_rd?0.1:1),Math.sin(tjAng)*tjR,cam),tjSz=Math.max(tj.sz*cam.zm,0.2);ctx.fillRect(tjp.x-tjSz*0.5,tjp.y-tjSz*0.5,tjSz,tjSz);}if(show.labels&&cam.zm<0.5&&cam.zm>0.005){var lpL4=pj(Math.cos(jupAng+TAU/6)*770,0,Math.sin(jupAng+TAU/6)*770,cam),lpL5=pj(Math.cos(jupAng-TAU/6)*770,0,Math.sin(jupAng-TAU/6)*770,cam);ctx.fillStyle="rgba(220,200,160,0.65)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("L4 (Greeks)",lpL4.x,lpL4.y-6);ctx.fillText("L5 (Trojans)",lpL5.x,lpL5.y-6);}}
      /* Kuiper belt: trans-Neptunian objects at 35-50 AU */
      if(show.kuiper&&!_un){ctx.fillStyle="rgba(140,160,180,0.42)";for(var kbi=0;kbi<KUIPER.length;kbi++){var kb=KUIPER[kbi],kbAng=kb.ang+t*kb.spd,kbR=_rd?kb.rad*0.15*DK:(160+(kb.rad-5250)/2250*60+200);if(_rd){kbR=kb.rad*0.15*DK;}else{kbR=380+(kb.rad-5250)/2250*60;}var kbp=pj(Math.cos(kbAng)*kbR,kb.y*(_rd?0.1:1),Math.sin(kbAng)*kbR,cam),kbSz=Math.max(kb.sz*cam.zm,0.2);ctx.fillRect(kbp.x-kbSz*0.5,kbp.y-kbSz*0.5,kbSz,kbSz);}}

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
          if(pdt.pl.n==="Uranus")dRiUranus(ctx,pdt.wx,pdt.wy,pdt.wz,pdt.vr,cam);
          drawPlanetBody(ctx,ppp.x,ppp.y,rr,pdt.pl,pdt.rotAng,cam);
          if(pdt.pl.n==="Earth"&&earthIntR.current&&rr>30&&!cmpR.current){drawEarthInteriorOverlay(ctx,ppp.x,ppp.y,rr,langR.current);}
          dSh(ctx,ppp.x,ppp.y,rr,pdt.wx,pdt.wz,cam);
          if(pdt.pl.n==="Earth"&&rr>8)drawEarthCityLights(ctx,ppp.x,ppp.y,rr,pdt.rotAng,sunPj.x-ppp.x,sunPj.y-ppp.y);
          if(show.tilt)dAx(ctx,ppp.x,ppp.y,rr,pdt.pl.t,cam);
          if(pdt.pl.n==="Earth"&&show.moon){var moV=mOf(_rd,_un),mAng=(t/MD.p)*TAU;/* 月軌道の5.145°傾斜 (昇交点 Ω=125.04°): u を昇交点からの角度として扱い、回転行列で慣性系に変換 */var _mIncR=5.145*0.01745,_mNodeR=125.04*0.01745,_cO=Math.cos(_mNodeR),_sO=Math.sin(_mNodeR),_cI=Math.cos(_mIncR),_sI=Math.sin(_mIncR),_cU=Math.cos(mAng),_sU=Math.sin(mAng);var mx=pdt.wx+moV*(_cO*_cU-_sO*_sU*_cI),my=moV*_sU*_sI,mz=pdt.wz+moV*(_sO*_cU+_cO*_sU*_cI),mp=pj(mx,my,mz,cam),mrV=Math.max(mRf(_rp,_un)*cam.zm,0.3);var moScrR=moV*cam.zm;if(moScrR>3){var moN=Math.min(120,Math.max(40,Math.floor(moScrR*0.5)));ctx.strokeStyle="rgba(200,200,200,0.25)";ctx.lineWidth=0.7;ctx.setLineDash([2,4]);ctx.beginPath();for(var moi=0;moi<=moN;moi++){var moa=(moi/moN)*TAU,_cMa=Math.cos(moa),_sMa=Math.sin(moa),mopp=pj(pdt.wx+moV*(_cO*_cMa-_sO*_sMa*_cI),moV*_sMa*_sI,pdt.wz+moV*(_sO*_cMa+_cO*_sMa*_cI),cam);if(moi===0)ctx.moveTo(mopp.x,mopp.y);else ctx.lineTo(mopp.x,mopp.y);}ctx.stroke();ctx.setLineDash([]);}dC(ctx,mp.x,mp.y,mrV,"rgba(200,200,200,1)");if(mrV>2)drawMoonDetail(ctx,mp.x,mp.y,mrV,mAng);if(mrV>3)sphereShade(ctx,mp.x,mp.y,mrV);dSh(ctx,mp.x,mp.y,mrV,mx,mz,cam);hits.push({n:"Moon",x:mp.x,y:mp.y,r:Math.max(mrV,10)});if(show.labels){ctx.fillStyle="rgba(200,200,200,0.75)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("月",mp.x,mp.y-mrV-4);}}
          if(pdt.pl.n==="Earth"){var issOrb=_un?(6771/1e6)*DK:(_rd?(6771*0.001)*DK:pdt.vr*1.12);var issAng=(t/0.0683)*TAU,issWx=pdt.wx+Math.cos(issAng)*issOrb,issWz=pdt.wz+Math.sin(issAng)*issOrb,issPj2=pj(issWx,0,issWz,cam),issScr=issOrb*cam.zm;if(issScr>3){if(issScr>8){ctx.strokeStyle="rgba(120,200,255,0.25)";ctx.lineWidth=0.6;ctx.setLineDash([1,3]);ctx.beginPath();var issNN=Math.max(20,Math.min(80,Math.floor(issScr*0.4)));for(var iiSS=0;iiSS<=issNN;iiSS++){var iaSS=iiSS/issNN*TAU,ipSS=pj(pdt.wx+Math.cos(iaSS)*issOrb,0,pdt.wz+Math.sin(iaSS)*issOrb,cam);if(iiSS===0)ctx.moveTo(ipSS.x,ipSS.y);else ctx.lineTo(ipSS.x,ipSS.y);}ctx.stroke();ctx.setLineDash([]);}ctx.fillStyle="rgba(200,240,255,0.95)";ctx.fillRect(issPj2.x-1,issPj2.y-1,2,2);hits.push({n:"iss",x:issPj2.x,y:issPj2.y,r:12});if(show.labels&&issScr>16){ctx.fillStyle="rgba(180,230,255,0.8)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("ISS",issPj2.x,issPj2.y-5);}}}
          if(pdt.pl.n==="Jupiter"&&show.moon){for(var gmi=0;gmi<GMOONS.length;gmi++){var gm=GMOONS[gmi],gmOrb=_un?(gm.orbR/1e6)*DK:(_rd?(gm.orbR*0.001)*DK:(12+gmi*5)),gmAng=(t/gm.p)*TAU,gmWx=pdt.wx+Math.cos(gmAng)*gmOrb,gmWz=pdt.wz+Math.sin(gmAng)*gmOrb,gmPj=pj(gmWx,0,gmWz,cam),gmR=Math.max(_un?(gm.r/1e6)*DK*cam.zm:(_rp?gm.r*SK*0.01*cam.zm:(1.2+gmi*0.3)*cam.zm*0.3),0.4);dC(ctx,gmPj.x,gmPj.y,gmR,gm.col);if(gmR>1.5)sphereShade(ctx,gmPj.x,gmPj.y,gmR);dSh(ctx,gmPj.x,gmPj.y,gmR,gmWx,gmWz,cam);if(show.labels&&gmR>0.8){ctx.fillStyle="rgba(200,200,180,0.65)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(gm.name,gmPj.x,gmPj.y-gmR-3);}}}
          if(EXTRA_MOONS[pdt.pl.n]&&show.moon){var emArr=EXTRA_MOONS[pdt.pl.n];for(var emi=0;emi<emArr.length;emi++){var em=emArr[emi],emOrb=_un?(em.orbR/1e6)*DK:(_rd?(em.orbR*0.001)*DK:(pdt.vr+2+emi*1.4)),emAng=(t/em.p)*TAU,emWx=pdt.wx+Math.cos(emAng)*emOrb,emWz=pdt.wz+Math.sin(emAng)*emOrb,emPj=pj(emWx,0,emWz,cam),emR=Math.max(_un?(em.r/1e6)*DK*cam.zm:(_rp?em.r*SK*0.01*cam.zm:em.sz*Math.min(cam.zm*0.5,2.5)),0.4);dC(ctx,emPj.x,emPj.y,emR,em.col);if(emR>1.5)sphereShade(ctx,emPj.x,emPj.y,emR);dSh(ctx,emPj.x,emPj.y,emR,emWx,emWz,cam);if(show.labels&&emR>0.7){ctx.fillStyle="rgba(200,200,180,0.55)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(em.name,emPj.x,emPj.y-emR-3);}}}
          if(pdt.pl.n==="Earth"&&magnetoR.current&&rr>10&&!cmpR.current){var mgSDx=sunPj.x-ppp.x,mgSDy=sunPj.y-ppp.y,mgSL=Math.sqrt(mgSDx*mgSDx+mgSDy*mgSDy)||1;mgSDx/=mgSL;mgSDy/=mgSL;var mgR=rr*7,b1R_=rr*1.5,b2R_=rr*3.5;ctx.save();ctx.globalAlpha=0.3;ctx.strokeStyle="rgba(255,160,60,0.7)";ctx.lineWidth=b1R_*0.32;ctx.beginPath();ctx.arc(ppp.x,ppp.y,b1R_,0,TAU);ctx.stroke();ctx.strokeStyle="rgba(80,150,255,0.5)";ctx.lineWidth=b2R_*0.22;ctx.beginPath();ctx.arc(ppp.x,ppp.y,b2R_,0,TAU);ctx.stroke();ctx.globalAlpha=0.2;ctx.strokeStyle="rgba(80,160,255,0.8)";ctx.lineWidth=1.2;ctx.beginPath();for(var mbi_=0;mbi_<=40;mbi_++){var mba_=mbi_/40*TAU;var mbF_=1-mgSDx*Math.cos(mba_)*0.38-mgSDy*Math.sin(mba_)*0.38;ctx.lineTo(ppp.x+Math.cos(mba_)*mgR*mbF_,ppp.y+Math.sin(mba_)*mgR*mbF_);}ctx.closePath();ctx.stroke();ctx.globalAlpha=0.12;ctx.strokeStyle="rgba(100,180,255,1)";ctx.lineWidth=0.8;for(var mli_=0;mli_<8;mli_++){var mla_=mli_/8*TAU;var mlR_=mgR*(1-mgSDx*Math.cos(mla_)*0.35-mgSDy*Math.sin(mla_)*0.35);ctx.beginPath();ctx.moveTo(ppp.x+Math.cos(mla_)*rr*0.85,ppp.y+Math.sin(mla_)*rr*0.85);ctx.quadraticCurveTo(ppp.x+Math.cos(mla_)*mlR_*0.5,ppp.y+Math.sin(mla_)*mlR_*0.5,ppp.x+Math.cos(mla_)*mlR_,ppp.y+Math.sin(mla_)*mlR_);ctx.stroke();}if(show.labels&&rr>18){ctx.globalAlpha=0.55;ctx.fillStyle="rgba(100,180,255,0.9)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("磁気圏",ppp.x,ppp.y-mgR-4);}ctx.restore();}
          if(pdt.pl.n==="Earth"){var moVe=mOf(_rd,_un),mAnge=(t/MD.p)*TAU,sunAngE=Math.atan2(-pdt.wz,-pdt.wx),cosPhaseE=Math.cos(mAnge-sunAngE),inNode=Math.abs(Math.sin(Math.PI*t/173.31))<0.22;if(inNode){if(cosPhaseE>0.9995)eclipseType="solar";else if(cosPhaseE<-0.9993)eclipseType="lunar";}eclipseEarPj=ppp;eclipseEarRr=rr;}
          if(show.labels){ctx.fillStyle="rgba(255,255,255,0.85)";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(langR.current==="en"?pdt.pl.n:pdt.pl.j,ppp.x,ppp.y-rr-7);if(show.tilt){ctx.fillStyle="rgba(255,255,100,0.45)";ctx.font="8px sans-serif";ctx.fillText(pdt.pl.t+"°",ppp.x,ppp.y+rr+13);}}
        }
      }
      /* Lagrange points (Earth-Sun system) */
      if(show.lagrange&&!_un){if(earthPd){var earthD=earthPd;var ea=Math.atan2(earthD.wz,earthD.wx);var lps=[{n:"L1",x:earthD.wx*0.99,z:earthD.wz*0.99},{n:"L2",x:earthD.wx*1.01,z:earthD.wz*1.01},{n:"L3",x:-earthD.wx,z:-earthD.wz},{n:"L4",x:earthD.oR*Math.cos(ea+TAU/6),z:earthD.oR*Math.sin(ea+TAU/6)},{n:"L5",x:earthD.oR*Math.cos(ea-TAU/6),z:earthD.oR*Math.sin(ea-TAU/6)}];for(var lp=0;lp<5;lp++){var lpp=pj(lps[lp].x,0,lps[lp].z,cam);ctx.strokeStyle="rgba(255,220,120,0.55)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(lpp.x-4,lpp.y);ctx.lineTo(lpp.x+4,lpp.y);ctx.moveTo(lpp.x,lpp.y-4);ctx.lineTo(lpp.x,lpp.y+4);ctx.stroke();if(show.labels){ctx.fillStyle="rgba(255,220,120,0.75)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText(lps[lp].n,lpp.x,lpp.y-7);}hits.push({n:"lag:"+lps[lp].n,x:lpp.x,y:lpp.y,r:8});}}}

      /* Named asteroids in main belt */
      if(show.nasteroid&&!_un){for(var nai=0;nai<NAMED_ASTEROIDS.length;nai++){var na=NAMED_ASTEROIDS[nai];var naOrbR=_rd?(na.a*150)*DK:(160+(na.a*150-330)/200*60);var naM=(t/na.p)*TAU;var naE=naM;for(var nk=0;nk<6;nk++)naE=naM+na.e*Math.sin(naE);var naV=2*Math.atan2(Math.sqrt(1+na.e)*Math.sin(naE/2),Math.sqrt(1-na.e)*Math.cos(naE/2));var naR=naOrbR*(1-na.e*na.e)/(1+na.e*Math.cos(naV));var naX=Math.cos(naV+na.inc)*naR,naZ=Math.sin(naV+na.inc)*naR;var naPj=pj(naX,0,naZ,cam);var naSz=Math.max(1.5,2*Math.min(cam.zm,1));fillCirc(ctx,naPj.x,naPj.y,naSz,na.col);if(show.labels){ctx.fillStyle="rgba(255,220,180,0.7)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(na.j,naPj.x,naPj.y-naSz-3);}hits.push({n:"a:"+na.n,x:naPj.x,y:naPj.y,r:Math.max(naSz*2,10)});}}

      /* Spacecraft trajectories */
      if(show.spacecraft){
        /* Gravity assist trails — piecewise waypoints at historical flybys (sim units = AU×150) */
        var _scTrData=[
          {key:"Voyager1",col:"rgba(255,200,80,",pts:[
            {t:-8154,x:0,z:0,lbl:null},
            {t:-7608,x:-241,z:742,lbl:(langR.current==="en"?"Jupiter '79":"木星 '79")},
            {t:-7007,x:-1409,z:-222,lbl:(langR.current==="en"?"Saturn '80":"土星 '80")},
          ]},
          {key:"Voyager2",col:"rgba(255,180,100,",pts:[
            {t:-8170,x:0,z:0,lbl:null},
            {t:-7470,x:-340,z:700,lbl:(langR.current==="en"?"Jupiter '79":"木星 '79")},
            {t:-6880,x:-1354,z:-438,lbl:(langR.current==="en"?"Saturn '81":"土星 '81")},
            {t:-5105,x:-2002,z:-2071,lbl:(langR.current==="en"?"Uranus '86":"天王星 '86")},
            {t:-3786,x:784,z:-4447,lbl:(langR.current==="en"?"Neptune '89":"海王星 '89")},
          ]},
        ];
        for(var tri_=0;tri_<_scTrData.length;tri_++){
          var _scTr=_scTrData[tri_],_scDat=null;
          for(var tsi_=0;tsi_<SPACECRAFT.length;tsi_++){if(SPACECRAFT[tsi_].key===_scTr.key){_scDat=SPACECRAFT[tsi_];break;}}
          if(!_scDat||t<_scDat.launchD)continue;
          var _vpts=[];for(var _tpi=0;_tpi<_scTr.pts.length;_tpi++){if(_scTr.pts[_tpi].t<=t)_vpts.push(_scTr.pts[_tpi]);}
          var _sct2=t-_scDat.launchD;_vpts.push({x:_scDat.dx*_scDat.speed*_sct2,z:_scDat.dz*_scDat.speed*_sct2,lbl:null});
          if(_vpts.length<2)continue;
          ctx.save();ctx.strokeStyle=_scTr.col+"0.4)";ctx.lineWidth=1;ctx.setLineDash([3,5]);
          ctx.beginPath();for(var _vpi=0;_vpi<_vpts.length;_vpi++){var _vpp=pj(_vpts[_vpi].x,0,_vpts[_vpi].z,cam);if(_vpi===0)ctx.moveTo(_vpp.x,_vpp.y);else ctx.lineTo(_vpp.x,_vpp.y);}
          ctx.stroke();ctx.setLineDash([]);
          if(show.labels){for(var _fli=0;_fli<_vpts.length;_fli++){if(!_vpts[_fli].lbl)continue;var _flpp=pj(_vpts[_fli].x,0,_vpts[_fli].z,cam);ctx.fillStyle=_scTr.col+"0.8)";ctx.beginPath();ctx.arc(_flpp.x,_flpp.y,3,0,TAU);ctx.fill();ctx.fillStyle=_scTr.col+"0.65)";ctx.font="7px sans-serif";ctx.textAlign="left";ctx.fillText(_vpts[_fli].lbl,_flpp.x+4,_flpp.y-2);}}
          ctx.restore();
        }
        for(var sci=0;sci<SPACECRAFT.length;sci++){var sc=SPACECRAFT[sci],scX,scY,scZ,scOK=true;if(sc.type==="linear"){var sct=t-sc.launchD;if(sct<0){scOK=false;}else{scX=sc.dx*sc.speed*sct;scY=sc.dy*sc.speed*sct;scZ=sc.dz*sc.speed*sct;}}else{var scM=((t-sc.launchD)/sc.p)*TAU;var scE=scM;for(var sk=0;sk<6;sk++)scE=scM+sc.e*Math.sin(scE);var scV=2*Math.atan2(Math.sqrt(1+sc.e)*Math.sin(scE/2),Math.sqrt(1-sc.e)*Math.cos(scE/2));var scR=sc.a*(1-sc.e*sc.e)/(1+sc.e*Math.cos(scV));scX=Math.cos(scV+sc.inc)*scR;scY=0;scZ=Math.sin(scV+sc.inc)*scR;}if(scOK){var scPj=pj(scX,scY,scZ,cam);var scSz=Math.max(2,3*Math.min(cam.zm,1));ctx.fillStyle=sc.col;ctx.beginPath();ctx.moveTo(scPj.x,scPj.y-scSz);ctx.lineTo(scPj.x-scSz*0.86,scPj.y+scSz*0.5);ctx.lineTo(scPj.x+scSz*0.86,scPj.y+scSz*0.5);ctx.closePath();ctx.fill();if(show.labels){ctx.fillStyle="rgba(255,255,255,0.7)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(sc.name,scPj.x,scPj.y-scSz-3);}hits.push({n:"sc:"+sc.key,x:scPj.x,y:scPj.y,r:Math.max(scSz*2,12)});}}
      }

      /* Solar wind / CME particles - 8-arm spiral rotating with sun */
      if(show.cme&&!_un){
        /* Parker spiral solar wind — 12 arms, color/intensity varies per arm to suggest fast/slow wind */
        var cmeRot=t*TAU/25;
        for(var caa=0;caa<12;caa++){
          var armA=caa*TAU/12+cmeRot;
          /* Even arms = "fast" (polar) wind blueish, odd arms = "slow" (equatorial) orange */
          var fast=caa%2===0,arBase=fast?[180,210,255]:[255,180,80];
          /* Pulse: each arm flickers at slightly different rate */
          var pulse=0.7+0.3*Math.sin(t*1.5+caa*0.7);
          for(var cbb=0;cbb<18;cbb++){
            var cdist=3+cbb*2.8,ctw=cbb*0.16,cpx=Math.cos(armA+ctw)*cdist,cpz=Math.sin(armA+ctw)*cdist;
            var cppj=pj(cpx,0,cpz,cam),calp=Math.max(0,1-cbb/18)*0.32*pulse;
            if(calp<0.02)continue;
            ctx.fillStyle="rgba("+arBase[0]+","+arBase[1]+","+arBase[2]+","+calp.toFixed(2)+")";
            var psz=fast?1:1.4;
            ctx.fillRect(cppj.x-psz*0.5,cppj.y-psz*0.5,psz,psz);
          }
        }
        /* Occasional CME burst — large blob emanating from sun */
        var burstP=Math.sin(t*0.4)*0.5+0.5;
        if(burstP>0.85){
          var bAng=t*0.7,bDist=8+(burstP-0.85)*40;
          var bpj=pj(Math.cos(bAng)*bDist,0,Math.sin(bAng)*bDist,cam);
          var bAlpha=(1-(burstP-0.85)/0.15)*0.4;
          var bRad=4+(burstP-0.85)*30;
          var bGrad=ctx.createRadialGradient(bpj.x,bpj.y,0,bpj.x,bpj.y,bRad);
          bGrad.addColorStop(0,"rgba(255,200,120,"+bAlpha.toFixed(2)+")");
          bGrad.addColorStop(1,"rgba(255,140,60,0)");
          ctx.fillStyle=bGrad;ctx.beginPath();ctx.arc(bpj.x,bpj.y,bRad,0,TAU);ctx.fill();
        }
      }

      if(show.orbits){for(var oi2=0;oi2<pd.length;oi2++){var osr2=pd[oi2].oR*cam.zm;if(osr2<0.5||osr2>orbMaxR||sd2>=osr2*osr2)continue;dOb(ctx,pd[oi2].oR,cam,pd[oi2].pl.cRGB,true);}}

      /* Distance measurement: draw line + AU label between selected bodies */
      var mPair=measPairR.current;
      if(measMR.current&&mPair.length===2){var lookup=function(n){if(n==="sun")return{x:0,y:0,z:0};for(var li=0;li<pd.length;li++)if(pd[li].pl.n===n)return{x:pd[li].wx,y:0,z:pd[li].wz};for(var lj=0;lj<cd.length;lj++)if(cd[lj].cm.key===n)return{x:cd[lj].wx,y:0,z:cd[lj].wz};if(n.indexOf("lag:")===0&&pd[2]){var ea=Math.atan2(pd[2].wz,pd[2].wx),nm=n.slice(4);if(nm==="L1")return{x:pd[2].wx*0.99,y:0,z:pd[2].wz*0.99};if(nm==="L2")return{x:pd[2].wx*1.01,y:0,z:pd[2].wz*1.01};if(nm==="L3")return{x:-pd[2].wx,y:0,z:-pd[2].wz};if(nm==="L4")return{x:pd[2].oR*Math.cos(ea+TAU/6),y:0,z:pd[2].oR*Math.sin(ea+TAU/6)};if(nm==="L5")return{x:pd[2].oR*Math.cos(ea-TAU/6),y:0,z:pd[2].oR*Math.sin(ea-TAU/6)};}return null;};var b1=lookup(mPair[0]),b2=lookup(mPair[1]);if(b1&&b2){var mdx=b2.x-b1.x,mdy=b2.y-b1.y,mdz=b2.z-b1.z,distM=Math.sqrt(mdx*mdx+mdy*mdy+mdz*mdz),distAU=distM/150,distLT=distM*1e6/299792.458;var p1pj=pj(b1.x,b1.y,b1.z,cam),p2pj=pj(b2.x,b2.y,b2.z,cam);ctx.strokeStyle="rgba(255,180,80,0.75)";ctx.lineWidth=1.2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(p1pj.x,p1pj.y);ctx.lineTo(p2pj.x,p2pj.y);ctx.stroke();ctx.setLineDash([]);var midX=(p1pj.x+p2pj.x)/2,midY=(p1pj.y+p2pj.y)/2;ctx.fillStyle="rgba(0,0,0,0.65)";ctx.fillRect(midX-44,midY-9,88,22);ctx.fillStyle="rgba(255,200,120,1)";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText(distAU.toFixed(2)+" AU",midX,midY+1);ctx.fillStyle="rgba(255,220,160,0.85)";ctx.font="9px sans-serif";ctx.fillText(distLT<60?distLT.toFixed(1)+"秒":distLT<3600?(distLT/60).toFixed(1)+"分":(distLT/3600).toFixed(1)+"時",midX,midY+11);}}

      sim.hitAreas=hits;if(ssFade<1)ctx.globalAlpha=1;ctx.restore();
      if(eclipseType&&!cmpR.current)drawEclipseAlert(ctx,W,H,eclipseType,eclipseEarPj,eclipseEarRr,langR.current==="en");

      /* Conjunction/opposition alert */
      if(!cmpR.current&&!_un&&cam.zm>0.08&&cam.zm<50)drawConjunctionAlert(ctx,W,pd,earthPdIdx);
      /* Distance comparison bar (log-scale planet distances from Sun) */
      if(show.distbar&&!cmpR.current&&fc==="all"){var dbY=H-78,dbW=Math.min(W-40,520),dbX=(W-dbW)/2,minAU=0.3,maxAU=50,lnMin=Math.log(minAU),lnRange=Math.log(maxAU)-lnMin;ctx.fillStyle="rgba(8,10,20,0.78)";ctx.fillRect(dbX-6,dbY-14,dbW+12,28);ctx.strokeStyle="rgba(255,255,255,0.18)";ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(dbX,dbY);ctx.lineTo(dbX+dbW,dbY);ctx.stroke();var ticks=[1,5,10,30];ctx.fillStyle="rgba(255,255,255,0.5)";ctx.font="8px sans-serif";ctx.textAlign="center";for(var dti=0;dti<ticks.length;dti++){var fx=dbX+(Math.log(ticks[dti])-lnMin)/lnRange*dbW;ctx.beginPath();ctx.moveTo(fx,dbY-3);ctx.lineTo(fx,dbY+3);ctx.stroke();ctx.fillText(ticks[dti]+"AU",fx,dbY+11);}for(var dbi=0;dbi<pd.length;dbi++){var dbau=Math.sqrt(pd[dbi].wx*pd[dbi].wx+pd[dbi].wz*pd[dbi].wz)/150;if(dbau<minAU||dbau>maxAU)continue;var dbpos=dbX+(Math.log(dbau)-lnMin)/lnRange*dbW;ctx.fillStyle=pd[dbi].pl.c;ctx.beginPath();ctx.arc(dbpos,dbY,3,0,TAU);ctx.fill();}}

      /* Galaxy info in screen space */
      drawGalaxyInfo(ctx,W,H,galInfoFade,cam);

      if(!cleanR.current)drawDateReadout(ctx,W,t,simDaysToDate(t));
      if(_un||_rd)drawScaleBar(ctx,W,H,cam.zm);
      drawMiniMap(ctx,W,H,t,fc,pd);

      if(tourRef.current.active){
        drawTourHUD(ctx,W,H,{
          tr:tourRef.current,cam:cam,dt:dt,pd:pd,cd:cd,
          tourData:tourData(tourRef.current.lv,langR.current==="en"),
          isEn:langR.current==="en",
          onTourEnd:function(){setTouring(false);setFoc("all");setInfo(null);},
          onAdvance:function(_,tk){setFoc(tk);setInfo(findInfo(tk));}
        });
      }

      /* ======== VISUALIZATION OVERLAYS (Hill / Shadow Cone / Tidal / Telescope) ======== */
      drawOverlays(ctx,{pd:pd,pjArr:pjArr,cam:cam,W:W,H:H,earthPd:earthPd,earthPdIdx:earthPdIdx,eclipseType:eclipseType,eclipseEarPj:eclipseEarPj,eclipseEarRr:eclipseEarRr,compare:cmpR.current,_rd:_rd,_un:_un,t:t,fc:fc,zmStr:zmStr,srScr:srScr,sunPj:sunPj,showHill:hillR.current,showShadow:shadowR.current,showTidal:tidalR.current,showTelescope:teleR.current});

      if(cmpR.current)drawCompareMode(ctx,cmpStateRef.current,W,H,t);

      /* FPS display */
      if(showFpsR.current)drawFps(ctx,H,fpsFrames.current.length);
      fR.current=requestAnimationFrame(frame);
    }
    fR.current=requestAnimationFrame(frame);
    return function(){alive=false;cancelAnimationFrame(fR.current);window.removeEventListener("resize",rsz);cv.removeEventListener("mousedown",md);window.removeEventListener("mousemove",mm);window.removeEventListener("mouseup",mu);cv.removeEventListener("wheel",wl);cv.removeEventListener("touchstart",tst);cv.removeEventListener("touchmove",tmv);cv.removeEventListener("touchend",ten);};
  },[dz,focusOn,stopTour]);

  /* Live tick: re-render info panel each second so distance/mag stay current */
  var[infoTick,setInfoTick]=useState(0);
  useEffect(function(){if(!info)return;var iv=setInterval(function(){setInfoTick(function(p){return p+1;});},1000);return function(){clearInterval(iv);};},[info]);
  /* Geocentric data for planet (distance/mag/ang.size/phase) at current sim time */
  function planetGeoData(pl){var t=S.current.t,ang=(t/pl.p)*TAU,px=Math.cos(ang)*pl.d,pz=Math.sin(ang)*pl.d,ea=(t/365)*TAU,ex=Math.cos(ea)*150,ez=Math.sin(ea)*150,dx=px-ex,dz=pz-ez,r=Math.sqrt(dx*dx+dz*dz),helio=pl.d,sunDx=-px,sunDz=-pz,earDx=ex-px,earDz=ez-pz,sl=Math.sqrt(sunDx*sunDx+sunDz*sunDz)*Math.sqrt(earDx*earDx+earDz*earDz);var phaseAng=sl>0?Math.acos((sunDx*earDx+sunDz*earDz)/sl):0;var phaseFrac=(1+Math.cos(phaseAng))/2;var angSize=2*Math.atan(pl.r*1000/(r*1e6))*206264.8;var H={Mercury:-0.4,Venus:-4.4,Earth:0,Mars:-1.5,Jupiter:-9.4,Saturn:-9.0,Uranus:-7.2,Neptune:-7.0,Ceres:3.4,Pluto:-1.0,Eris:-1.2}[pl.n]||0;var phaseCorr=phaseAng*180/Math.PI*0.04;var mag=H+5*Math.log10(helio/100*r/100)+phaseCorr;return{d:r,au:r/150,lt:r*1e6/299792.458,mag:mag,ang:angSize,phaseFrac:phaseFrac,phaseDeg:phaseAng*180/Math.PI};}
  /* Moon-specific data: phase/age, distance from Earth, sub-solar/observer point */
  function moonGeoData(){var t=S.current.t,syn=29.53059,t0=-5.7;var age=((t-t0)%syn+syn)%syn;var phaseFrac=(1-Math.cos(age/syn*TAU))/2;var pName;if(age<1.84)pName="🌑 新月";else if(age<5.53)pName="🌒 三日月(若)";else if(age<9.22)pName="🌓 上弦";else if(age<12.91)pName="🌔 十三夜";else if(age<16.61)pName="🌕 満月";else if(age<20.30)pName="🌖 居待月";else if(age<23.99)pName="🌗 下弦";else if(age<27.68)pName="🌘 有明月";else pName="🌑 新月";var distKm=384400+Math.sin(t*TAU/27.55)*21000;var angSize=2*Math.atan(1737/(distKm))*206264.8/3600;var sidMonth=27.32166;var sidPhase=((t/sidMonth)%1+1)%1;var mag=-12.7+0.026*Math.abs((age-14.77)/14.77*180);return{age:age,phaseFrac:phaseFrac,phaseName:pName,distKm:distKm,distEarthR:distKm/6378,angSizeDeg:angSize,sidMonth:sidMonth,sidPhase:sidPhase,mag:mag};}

  var curZm=ZS[zi]||1;
  var zmStr=curZm>=10?curZm.toFixed(0)+"x":curZm>=1?curZm.toFixed(1)+"x":curZm>=0.01?curZm.toFixed(2)+"x":curZm.toFixed(5)+"x";
  var zmLabel=curZm<0.003?"銀河":curZm<0.03?"恒星間":"太陽系";

  return(
    <div style={{width:"100%",height:"100dvh",background:"rgba(3,3,10,1)",position:"relative",overflow:"hidden"}}>
      <canvas ref={cR} style={{display:"block",width:"100%",height:"100%",touchAction:"none",cursor:"crosshair"}} onClick={handleClick}/>

      {/* Focus panel */}
      {cleanView===0&&!landing&&!isPhone&&<DragPanel style={Object.assign({},pn,{top:10,left:10,maxWidth:300})}><div style={lb}>{lang==="en"?"Focus ⠿":"フォーカス ⠿"}</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{FL.map(function(f){return <button key={f.k} style={foc===f.k?bN:bF} onClick={function(){focusOn(f.k);}}>{lang==="en"?(f.e||f.l):f.l}</button>;})}</div></DragPanel>}

      {/* Speed panel */}
      {cleanView===0&&!landing&&<DragPanel style={Object.assign({},pn,{top:10,right:10})}><div style={lb}>{lang==="en"?"Speed ⠿":"速度 ⠿"}</div><div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}><button style={Object.assign({},paused?bU:bF,{fontSize:12,padding:"3px 7px"})} onClick={function(){setPaused(function(p){return!p;});}}>{paused?"▶":"⏸"}</button>{SP.map(function(s){return <button key={s} style={spd===s&&!paused?bN:bF} onClick={function(){setSpd(s);setPaused(false);}}>{s}x</button>;})}</div></DragPanel>}

      {/* Toggles panel */}
      {cleanView===0&&!landing&&<DragPanel style={Object.assign({},pn,{bottom:isPhone?60:10,left:10,maxWidth:300,maxHeight:isPhone?"calc(100dvh - 130px)":"none",overflowY:isPhone?"auto":"visible"})}>
        <div style={Object.assign({},lb,{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2})}><span>{lang==="en"?"Display ⠿":"表示 ⠿"}</span><button style={Object.assign({},bF,{fontSize:9,padding:"1px 6px",lineHeight:1.4})} onClick={function(){dispatchPanel({type:"TOGGLE",key:"dispColl"});}}>{panels.dispColl?"▼":"▲"}</button></div><div style={{display:panels.dispColl?"none":"block"}}><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[{k:"orbits",l:"軌道",e:"Orbits"},{k:"trails",l:"軌跡",e:"Trails"},{k:"belt",l:"小惑星帯",e:"Belt"},{k:"trojan",l:"トロヤ群",e:"Trojans"},{k:"kuiper",l:"カイパー帯",e:"Kuiper"},{k:"nasteroid",l:"準惑星名",e:"Dwarf names"},{k:"tilt",l:"地軸",e:"Axis"},{k:"moon",l:"月",e:"Moon"},{k:"labels",l:"ラベル",e:"Labels"},{k:"planets",l:"惑星",e:"Planets"},{k:"lagrange",l:"L点",e:"L points"},{k:"spacecraft",l:"探査機",e:"Probes"},{k:"cme",l:"CME",e:"CME"},{k:"distbar",l:"距離バー",e:"Dist bar"}].map(function(x){return <button key={x.k} style={sh[x.k]?bN:bF} onClick={function(){tog(x.k);}}>{lang==="en"?x.e:x.l}</button>;})}</div>
        <div style={Object.assign({},lb,{marginTop:8,marginBottom:4})}>{lang==="en"?"Real scale":"実スケール"}</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}><button style={uni?bD:(rSn?bN:bF)} onClick={function(){if(!uni)setRSn(function(p){return!p;});}}>{lang==="en"?"Sun":"太陽"}{!uni&&rSn?" ●":""}</button><button style={uni?bD:(rPl?bN:bF)} onClick={function(){if(!uni)setRPl(function(p){return!p;});}}>{lang==="en"?"Planets":"惑星"}{!uni&&rPl?" ●":""}</button><button style={uni?bD:(rDi?bN:bF)} onClick={function(){if(!uni)setRDi(function(p){return!p;});}}>{lang==="en"?"Distance":"距離"}{!uni&&rDi?" ●":""}</button></div>
        <div style={{marginTop:6,display:"flex",gap:3,flexWrap:"wrap"}}><button style={uni?bU:bF} onClick={function(){setUni(function(p){return!p;});}}>{lang==="en"?"Unify":"統一比率"}{uni?" ●":""}</button><button style={compare?bT("100,220,150"):bF} onClick={function(){setCompare(function(p){if(!p)cmpStateRef.current={offX:0,zm:1};return!p;});}}>{lang==="en"?"Compare":"比較"}{compare?" ●":""}</button><button style={touring?bT("200,100,255"):bF} onClick={function(){if(touring){stopTour();setFoc("all");setInfo(null);}else{dispatchPanel({type:"SET",key:"tourPick",value:true});}}}>{touring?(lang==="en"?"Stop Tour":"ツアー停止"):(lang==="en"?"Tour":"学習ツアー")}</button><button style={bgm?bT("80,200,220"):bF} onClick={function(){setBgm(function(p){return!p;});}}>BGM{bgm?" ♪":""}</button><button style={lang==="en"?bT("100,220,180"):bF} onClick={function(){setLang(function(p){return p==="ja"?"en":"ja";});}}>EN/JA</button><button style={measureMode?bT("255,180,80"):bF} onClick={function(){setMeasureMode(function(p){if(p)setMeasurePair([]);return!p;});}}>{measureMode?(lang==="en"?"Measuring":"計測中")+(measurePair.length===0?(lang==="en"?"(1st)":"(1つ目)"):measurePair.length===1?(lang==="en"?"(2nd)":"(2つ目)"):""):(lang==="en"?"📐 Measure":"📐計測")}</button></div>
        <div style={Object.assign({},lb,{marginTop:8,marginBottom:4})}>{lang==="en"?"Tools":"ツール"}</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
          <button style={panels.showDate?bN:bF} onClick={function(){dispatchPanel({type:"TOGGLE",key:"showDate"});}}>{lang==="en"?"Date":"日付移動"}</button>
          <button style={bF} onClick={takeScreenshot}>{lang==="en"?"📷 Capture":"📷 撮影モード"}</button>
          <button style={bF} onClick={shareURL}>{lang==="en"?"🔗 Share":"🔗 共有"}</button>
          <button style={bF} onClick={function(){dispatchPanel({type:"SET",key:"importMode",value:true});}}>{lang==="en"?"📥 Import":"📥 読込"}</button>
          <button style={bF} onClick={function(){S.current.t=dateToSimDays(new Date().toISOString().slice(0,10));for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];}}>{lang==="en"?"Today":"今日"}</button>
          <button style={bF} onClick={function(){for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];}}>{lang==="en"?"Clear trails":"軌跡クリア"}</button>
          <button style={panels.showEvents?bT("255,200,80"):bF} onClick={function(){if(!panels.showEvents){eventsRef.current=scanEvents(S.current.t);}togglePanel("showEvents");}}>{lang==="en"?"📅 Events":"📅 天文イベント"}</button>
          <button style={panels.searchOpen?bT("100,210,255"):bF} onClick={function(){togglePanel("searchOpen");setSearchQ("");}}>{lang==="en"?"🔍 Search":"🔍 検索"}</button>
          <button style={panels.exoOpen?bT("255,150,90"):bF} onClick={function(){togglePanel("exoOpen");}}>{lang==="en"?"🪐 Exoplanets":"🪐 系外惑星"}</button>
          <button style={panels.satOpen?bT("180,210,255"):bF} onClick={function(){togglePanel("satOpen");}}>{lang==="en"?"🛰 Moons/SSSB":"🛰 衛星・小天体"}</button>
          <button style={panels.nightSkyOpen?bT("255,220,80"):bF} onClick={function(){togglePanel("nightSkyOpen");}}>{lang==="en"?"🌙 Tonight":"🌙 今夜の空"}</button>
          <button style={panels.bookOpen?bT("255,220,120"):bF} onClick={function(){togglePanel("bookOpen");setBookmarkName("");}}>{lang==="en"?"🔖 Bookmarks":"🔖 ブックマーク"}</button>
          <button style={bF} onClick={function(){setOnboardStep(0);}}>{lang==="en"?"❓ Guide":"❓ ガイド"}</button>
          <button style={panels.helpOpen?bT("180,220,255"):bF} onClick={function(){togglePanel("helpOpen");}} title={lang==="en"?"Keyboard shortcuts (?)":"ショートカット (?)"}>⌨</button>
          <button style={quizState?bT("255,200,80"):bF} onClick={function(){if(quizState)closeQuiz();else startQuiz();}}>🎯 {quizState?(lang==="en"?"Quit":"クイズ終了"):(lang==="en"?"Quiz":"クイズ")}</button>
          <button style={panels.compareTable?bT("180,255,200"):bF} onClick={function(){togglePanel("compareTable");}} title="全惑星・準惑星の物理量比較表">{lang==="en"?"📊 Compare":"📊 比較表"}</button>
        </div>
        <div style={Object.assign({},lb,{marginTop:6,marginBottom:2})}>{lang==="en"?"Visualization":"可視化"}</div>
        <div style={Object.assign({},lb,{marginTop:2,marginBottom:2,color:"rgba(255,255,255,0.25)",fontSize:8})}>{lang==="en"?"Cosmic structure":"宇宙構造"}</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:4}}>
          <button style={habZone?bN:bF} onClick={function(){setHabZone(function(p){return!p;});}} title="ハビタブルゾーン (0.95–1.37 AU)">🌍 HZ</button>
          <button style={helio?bN:bF} onClick={function(){setHelio(function(p){return!p;});}} title="ヘリオスフィア境界">{lang==="en"?"☀ Heliosphere":"☀ ヘリオ圏"}</button>
          <button style={nBody?bU:bF} onClick={toggleNBody} title="N体重力シミュレーション (統一比率強制)">{lang==="en"?"⚛ N-body":"⚛ N体"}</button>
        </div>
        <div style={Object.assign({},lb,{marginBottom:2,color:"rgba(255,255,255,0.25)",fontSize:8})}>{lang==="en"?"Physics":"物理現象"}</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:4}}>
          <button style={magneto?bN:bF} onClick={function(){setMagneto(function(p){return!p;});}} title="地球磁気圏・ヴァン・アレン帯">{lang==="en"?"🌐 Magnetic":"🌐 磁気圏"}</button>
          <button style={showEarthInt?bN:bF} onClick={function(){setShowEarthInt(function(p){return!p;});}} title={lang==="en"?"Earth interior cross-section overlay":"地球内部構造オーバーレイ"}>{lang==="en"?"🌍 Interior":"🌍 内部構造"}</button>
          <button style={hillSphere?bN:bF} onClick={function(){setHillSphere(function(p){return!p;});}} title="ヒル球（重力圏）">{lang==="en"?"⭕ Hill":"⭕ ヒル球"}</button>
          <button style={shadowCone?bN:bF} onClick={function(){setShadowCone(function(p){return!p;});}} title="日食影錐（日食中のみ）">{lang==="en"?"🌑 Shadow":"🌑 影錐"}</button>
          <button style={tidalForce?bN:bF} onClick={function(){setTidalForce(function(p){return!p;});}} title="地球への潮汐力ベクトル">{lang==="en"?"🌊 Tidal":"🌊 潮汐力"}</button>
        </div>
        <div style={Object.assign({},lb,{marginBottom:2,color:"rgba(255,255,255,0.25)",fontSize:8})}>{lang==="en"?"Observation":"観測ツール"}</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
          <button style={telescopeMode?bT("100,220,150"):bF} onClick={function(){setTelescopeMode(function(p){return!p;});}} title="望遠鏡モード">{lang==="en"?"🔭 Telescope":"🔭 望遠鏡"}</button>
          <button style={panels.moonCal?bT("200,180,255"):bF} onClick={function(){togglePanel("moonCal");}} title="月相カレンダー">{lang==="en"?"🌙 Phases":"🌙 月相"}</button>
          <button style={panels.meteorOpen?bT("180,220,255"):bF} onClick={function(){togglePanel("meteorOpen");}} title="流星群カレンダー">{lang==="en"?"🌠 Meteors":"🌠 流星群"}</button>
          <button style={panels.orbElemOpen?bT("180,220,255"):bF} onClick={function(){togglePanel("orbElemOpen");}} title="軌道要素（惑星選択時）">{lang==="en"?"📊 Orbit":"📊 軌道"}</button>
          <button style={showFps?bT("100,255,100"):bF} onClick={function(){setShowFps(function(p){return!p;});}} title="FPSカウンター表示">⏱ FPS</button>
        </div>
        {panels.showDate&&<div style={{marginTop:6,display:"flex",gap:4,alignItems:"center"}}>
          <input type="date" value={dateInput} onChange={function(e){setDateInput(e.target.value);}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:4,color:"rgba(255,255,255,0.9)",fontSize:10,padding:"3px 6px",fontFamily:"system-ui",outline:"none",colorScheme:"dark"}}/>
          <button style={bN} onClick={function(){if(dateInput)jumpToDate(dateInput);}}>{lang==="en"?"Go":"移動"}</button>
        </div>}
        {panels.showDate&&<div style={{marginTop:4,display:"flex",gap:3,flexWrap:"wrap"}}>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("2061-07-28");}}>{lang==="en"?"Halley 2061":"ハレー彗星 2061"}</button>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("2035-09-02");}}>{lang==="en"?"Eclipse 2035":"日食 2035"}</button>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("1969-07-20");}}>{lang==="en"?"Moon landing":"月面着陸"}</button>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("2006-01-19");}}>{lang==="en"?"New Horizons":"NHニューホライズンズ"}</button>
        </div>}
        {panels.showDate&&<div style={{marginTop:6,paddingTop:4,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={Object.assign({},lb,{fontSize:8,marginBottom:3})}>{lang==="en"?"Relative jump":"相対ジャンプ"}</div>
          <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{[
            {l:"-100y",d:-36525},{l:"-10y",d:-3652},{l:"-1y",d:-365},{l:"-1m",d:-30},{l:"-1d",d:-1},
            {l:"+1d",d:1},{l:"+1m",d:30},{l:"+1y",d:365},{l:"+10y",d:3652},{l:"+100y",d:36525}
          ].map(function(b){return <button key={b.l} style={Object.assign({},bF,{fontSize:8,padding:"2px 4px",minWidth:30})} onClick={function(){S.current.t+=b.d;for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];setPaused(true);setInfo(function(p){return p?Object.assign({},p):p;});}}>{b.l}</button>;})}</div>
          <div style={{marginTop:4,display:"flex",gap:4,alignItems:"center"}}>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.4)",minWidth:18}}>−1y</span>
            <input type="range" min="-365" max="365" defaultValue="0" step="1"
              onPointerDown={function(e){scrubAnchorRef.current=S.current.t;setPaused(true);}}
              onInput={function(e){if(scrubAnchorRef.current!=null){S.current.t=scrubAnchorRef.current+parseInt(e.target.value);for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];}}}
              onPointerUp={function(e){scrubAnchorRef.current=null;e.target.value="0";}}
              onPointerCancel={function(e){scrubAnchorRef.current=null;e.target.value="0";}}
              style={{flex:1,accentColor:"rgba(255,200,80,0.85)"}}
              title={lang==="en"?"Scrub ±1 year":"±1年スクラブ"}
            />
            <span style={{fontSize:8,color:"rgba(255,255,255,0.4)",minWidth:18,textAlign:"right"}}>+1y</span>
          </div>
        </div>}
      </div>
      </DragPanel>}

      {/* Zoom panel */}
      {cleanView===0&&!landing&&<DragPanel style={Object.assign({},pn,{bottom:isPhone?60:10,right:10,display:"flex",flexDirection:"column",alignItems:"center",gap:4})}><div style={lb}>{lang==="en"?"Zoom ⠿":"ズーム ⠿"}</div><button style={Object.assign({},bF,{width:34,height:30,fontSize:18,padding:0,display:"flex",alignItems:"center",justifyContent:"center"})} onClick={zIn}>+</button><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",minWidth:44,textAlign:"center"}}>{zmStr}<br/><span style={{fontSize:7,color:"rgba(255,255,255,0.3)"}}>{zmLabel}</span></div><button style={Object.assign({},bF,{width:34,height:30,fontSize:18,padding:0,display:"flex",alignItems:"center",justifyContent:"center"})} onClick={zOut}>−</button></DragPanel>}

      {/* Event calendar panel */}
      {cleanView===0&&!landing&&<EventsPanel visible={panels.showEvents} eventsRef={eventsRef} dispatchPanel={dispatchPanel} S={S} isPhone={isPhone} lang={lang} pn={pn} bF={bF}/>}

      {cleanView===0&&!landing&&<ExoplanetPanel visible={panels.exoOpen} dispatchPanel={dispatchPanel} doLanding={doLanding} isPhone={isPhone} lang={lang} pn={pn} bF={bF}/>}

      {cleanView===0&&!landing&&<SatellitePanel visible={panels.satOpen} dispatchPanel={dispatchPanel} doLanding={doLanding} isPhone={isPhone} lang={lang} pn={pn} bF={bF}/>}

      {cleanView===0&&!landing&&<BookmarkPanel visible={panels.bookOpen} dispatchPanel={dispatchPanel} bookmarks={bookmarks} bookmarkName={bookmarkName} setBookmarkName={setBookmarkName} saveBM={saveBM} delBM={delBM} importState={importState} S={S} isPhone={isPhone} lang={lang} pn={pn} bF={bF} bN={bN}/>}

      {cleanView===0&&!landing&&<NightSkyPanel visible={panels.nightSkyOpen} dispatchPanel={dispatchPanel} nightSkyLat={nightSkyLat} setNightSkyLat={setNightSkyLat} nightSkyLng={nightSkyLng} setNightSkyLng={setNightSkyLng} S={S} isPhone={isPhone} lang={lang} pn={pn} bF={bF}/>}

      {cleanView===0&&!landing&&<SearchPanel visible={panels.searchOpen} dispatchPanel={dispatchPanel} searchQ={searchQ} setSearchQ={setSearchQ} focusOn={focusOn} lang={lang} isPhone={isPhone} pn={pn} bF={bF}/>}

      {/* Info panel */}
      {cleanView===0&&!landing&&<InfoPanel visible={info!==null} info={info} lang={lang} touring={touring} doLanding={doLanding} setInfo={setInfo} moonGeoData={moonGeoData} planetGeoData={planetGeoData} pn={pn} bF={bF} bT={bT} bD={bD} isPhone={isPhone}/>}

      {/* Landing mode top-right: speed + liftoff */}
      {landing&&<div style={{position:"absolute",top:10,right:10,zIndex:26,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
        <div style={{background:"rgba(0,5,18,0.82)",border:"1px solid rgba(100,160,255,0.2)",borderRadius:6,padding:"6px 8px",display:"flex",flexWrap:"wrap",justifyContent:"flex-end",gap:3,maxWidth:260}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:"100%",marginBottom:2}}>{lang==="en"?"Speed":"速度"}</span>
          <button style={Object.assign({},paused?bT("100,180,255"):bF,{padding:"2px 6px",fontSize:10})} onClick={function(){setPaused(function(p){return!p;})}}>{paused?"▶":"⏸"}</button>
          {LAND_SP.map(function(s){return <button key={s.l} style={Object.assign({},landSpd===s.v&&!paused?bN:bF,{padding:"2px 5px",fontSize:9})} onClick={function(){setLandSpd(s.v);landSpdR.current=s.v;setPaused(false);}}>{s.l}</button>;})}
          <button style={showConst?bT("100,160,255"):bF} onClick={function(){var v=!showConst;setShowConst(v);showConstR.current=v;}}>{lang==="en"?"Constel.":"星座線"}{showConst?" ●":""}</button>
          <button style={Object.assign({},bT("100,230,160"),{padding:"2px 6px",fontSize:9,marginTop:2,width:"100%"})} onClick={function(){
            S.current.t=(Date.now()-J2000)/86400000;setPaused(false);
            if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(pos){var lng2=Math.round(pos.coords.longitude),lat3=Math.round(pos.coords.latitude);setLandLng(lng2);landLngR.current=lng2;setLandLat(lat3);landLatR.current=lat3;},function(){});}
          }}>{lang==="en"?"📍 Now":"📍 今"}</button>
        </div>
        <button style={Object.assign({},bT("255,100,80"),{fontSize:12,padding:"8px 16px"})} onClick={function(){setLanding(null);}}>{lang==="en"?"🚀 Liftoff":"🚀 離陸"}</button>
      </div>}

      {isPhone&&cleanView===0&&!landing&&<div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:20,background:"rgba(8,10,20,0.92)",borderTop:"1px solid rgba(255,255,255,0.08)",padding:"6px 8px",display:"flex",gap:6,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>{FL.map(function(f){return <button key={f.k} style={Object.assign({},foc===f.k?bNM:bFM,{flexShrink:0,padding:"6px 10px",fontSize:11})} onClick={function(){focusOn(f.k);}}>{lang==="en"?(f.e||f.l):f.l}</button>;})}</div>}

      {/* Landing mode control panel — desktop: lat=left vertical, bottom=lng+az+tilt. Phone portrait: lat moved into bottom panel as horizontal slider. */}
      {landing&&!isPhone&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",zIndex:25,background:"rgba(0,5,18,0.82)",borderRight:"1px solid rgba(100,160,255,0.2)",padding:"10px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:6,fontFamily:"system-ui,sans-serif"}}>
        <span style={{color:"rgba(120,150,200,0.5)",fontSize:8}}>N</span>
        <input type="number" min="-90" max="90" step="0.01" value={landLat}
          onChange={function(e){var v=parseFloat(e.target.value);if(!isNaN(v)){var c=Math.max(-90,Math.min(90,v));setLandLat(c);landLatR.current=c;}}}
          style={{width:44,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(100,160,255,0.3)",borderRadius:3,color:"rgba(255,255,255,0.9)",fontSize:9,padding:"2px 3px",outline:"none",fontFamily:"system-ui",textAlign:"center"}}/>
        <span style={{color:"rgba(180,210,255,0.7)",fontSize:9}}>{lang==="en"?"Lat":"緯度"}</span>
        <input type="range" min="-90" max="90" step="0.1" value={landLat}
          style={{writingMode:"vertical-lr",direction:"rtl",height:130,width:24,cursor:"pointer",accentColor:"#64b4ff"}}
          onChange={function(e){var v=+e.target.value;setLandLat(v);landLatR.current=v;}}/>
        <span style={{color:"rgba(120,150,200,0.5)",fontSize:8}}>S</span>
      </div>}
      {landing&&<div style={{position:"absolute",bottom:0,left:isPhone?0:40,right:0,zIndex:25,background:"rgba(0,5,18,0.85)",borderTop:"1px solid rgba(100,160,255,0.2)",padding:"6px 10px 8px",fontFamily:"system-ui,sans-serif"}}>
        <LandingQuickJump landing={landing} setLandLat={setLandLat} setLandLng={setLandLng} landLatR={landLatR} landLngR={landLngR}/>
        {isPhone&&<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:22,flexShrink:0}}>{lang==="en"?"Lat":"緯度"}</span>
          <input type="range" style={{flex:1,height:16,cursor:"pointer",accentColor:"#64b4ff"}} min="-90" max="90" step="0.1" value={landLat}
            onChange={function(e){var v=+e.target.value;setLandLat(v);landLatR.current=v;}}/>
          <input type="number" min="-90" max="90" step="0.01" value={landLat}
            onChange={function(e){var v=parseFloat(e.target.value);if(!isNaN(v)){var c=Math.max(-90,Math.min(90,v));setLandLat(c);landLatR.current=c;}}}
            style={{width:52,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(100,160,255,0.3)",borderRadius:3,color:"rgba(255,255,255,0.9)",fontSize:9,padding:"2px 3px",outline:"none",fontFamily:"system-ui",textAlign:"right",flexShrink:0}}/>
        </div>}
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:22,flexShrink:0}}>{lang==="en"?"Lng":"経度"}</span>
          <input type="range" style={{flex:1,height:16,cursor:"pointer",accentColor:"#64b4ff"}} min="-180" max="180" step="0.1" value={landLng}
            onChange={function(e){var v=+e.target.value;setLandLng(v);landLngR.current=v;}}/>
          <input type="number" min="-180" max="180" step="0.01" value={landLng}
            onChange={function(e){var v=parseFloat(e.target.value);if(!isNaN(v)){var c=Math.max(-180,Math.min(180,v));setLandLng(c);landLngR.current=c;}}}
            style={{width:52,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(100,160,255,0.3)",borderRadius:3,color:"rgba(255,255,255,0.9)",fontSize:9,padding:"2px 3px",outline:"none",fontFamily:"system-ui",textAlign:"right",flexShrink:0}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:22,flexShrink:0}}>{lang==="en"?"Az":"方位"}</span>
          <input type="range" style={{flex:1,height:16,cursor:"pointer",accentColor:"#64b4ff"}} min="0" max="359" step="1"
            value={Math.round(((landYaw*57.296)%360+360)%360)}
            onChange={function(e){var r=(+e.target.value)*0.01745;setLandYaw(r);landYR.current=r;}}/>
          <span style={{color:"rgba(255,255,255,0.85)",fontSize:9,width:46,textAlign:"right",flexShrink:0}}>{(function(){var d=Math.round(((landYaw*57.296)%360+360)%360);var n=d<23?"N":d<68?"NE":d<113?"E":d<158?"SE":d<203?"S":d<248?"SW":d<293?"W":d<338?"NW":"N";return d+"°"+n;})()}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:22,flexShrink:0}}>{lang==="en"?"Tilt":"仰角"}</span>
          <input type="range" style={{flex:1,height:16,cursor:"pointer",accentColor:"#64b4ff"}} min="-40" max="40" step="1" value={landTilt}
            onChange={function(e){var v=+e.target.value;setLandTilt(v);landTiltR.current=v;}}/>
          <span style={{color:"rgba(255,255,255,0.85)",fontSize:9,width:46,textAlign:"right",flexShrink:0}}>{landTilt>=0?"+":""}{landTilt}°</span>
        </div>
      </div>}

      {cleanView===0&&!landing&&!isPhone&&<div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",color:"rgba(255,255,255,0.2)",fontSize:9,fontFamily:"system-ui,sans-serif",pointerEvents:"none",zIndex:10,textAlign:"center"}}>{lang==="en"?"Click: select　Drag: rotate　Pinch: zoom　Panels are draggable":"クリックで選択　ドラッグ：回転　ピンチ：ズーム　パネルはドラッグ移動可能"}</div>}
      {cleanView===0&&!landing&&<MoonCalendarPanel visible={panels.moonCal} dispatchPanel={dispatchPanel} S={S} isPhone={isPhone} lang={lang} pn={pn} bF={bF}/>}
      {cleanView===0&&!landing&&<MeteorShowerPanel visible={panels.meteorOpen} dispatchPanel={dispatchPanel} S={S} isPhone={isPhone} lang={lang} pn={pn} bF={bF}/>}

      {cleanView===0&&!landing&&<OrbitalElementsPanel visible={panels.orbElemOpen} dispatchPanel={dispatchPanel} info={info} S={S} lang={lang} isPhone={isPhone} pn={pn} bF={bF}/>}

      {cleanView===0&&!landing&&<EarthInteriorPanel visible={showEarthInt} onClose={function(){setShowEarthInt(false);}} lang={lang} isPhone={isPhone} pn={pn} bF={bF}/>}

      {cleanView===0&&<HelpPanel visible={panels.helpOpen} dispatchPanel={dispatchPanel} lang={lang} isPhone={isPhone} pn={pn} bF={bF}/>}

      <div style={{position:"absolute",top:4,left:4,color:"rgba(255,255,255,0.35)",fontSize:9,fontFamily:"system-ui,sans-serif",pointerEvents:"none",zIndex:20}}>v{APP_VERSION}</div>

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
      {panels.importMode&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.8)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={function(){dispatchPanel({type:"SET",key:"importMode",value:false});}}>
        <div style={{background:"rgba(15,18,30,0.95)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:16,maxWidth:"90%",width:320}} onClick={function(e){e.stopPropagation();}}>
          <div style={{color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:"bold",marginBottom:8,fontFamily:"system-ui,sans-serif"}}>📥 コード読込</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:9,marginBottom:8,fontFamily:"system-ui,sans-serif"}}>共有された状態コードを貼り付けてください</div>
          <input type="text" value={importText} onChange={function(e){setImportText(e.target.value);}} placeholder="SS|9613.2|..." style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:6,color:"rgba(255,255,255,0.95)",fontSize:11,padding:"8px",fontFamily:"monospace",outline:"none",boxSizing:"border-box",textAlign:"center"}}/>
          <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
            <button onClick={function(){if(importState(importText)){dispatchPanel({type:"SET",key:"importMode",value:false});setImportText("");}}} style={{background:"rgba(70,140,255,0.3)",border:"1px solid rgba(70,140,255,0.5)",borderRadius:6,color:"rgba(170,210,255,1)",fontSize:10,padding:"6px 14px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>復元</button>
            <button onClick={function(){dispatchPanel({type:"SET",key:"importMode",value:false});}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"rgba(255,255,255,0.7)",fontSize:10,padding:"6px 14px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>閉じる</button>
          </div>
        </div>
      </div>}

      {cleanView===0&&!landing&&<CompareTablePanel visible={panels.compareTable} dispatchPanel={dispatchPanel} cmpSort={cmpSort} setCmpSort={setCmpSort} foc={foc} focusOn={focusOn} lang={lang} isPhone={isPhone} pn={pn} bF={bF}/>}

      {cleanView===0&&!landing&&<QuizPanel quizState={quizState} setQuizState={setQuizState} closeQuiz={closeQuiz} startQuiz={startQuiz} lang={lang} pn={pn} bF={bF} bT={bT}/>}

      {cleanView===0&&!landing&&<TourPickerPanel visible={panels.tourPick} dispatchPanel={dispatchPanel} startTourLv={startTourLv} lang={lang} pn={pn} bF={bF}/>}

      {/* Onboarding tour overlay */}
      {onboardStep>=0&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.78)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}} onClick={function(e){e.stopPropagation();}}>
        <div style={{background:"rgba(10,14,28,0.98)",border:"1px solid rgba(100,180,255,0.3)",borderRadius:16,padding:"22px 26px",maxWidth:350,width:"90%",color:"rgba(255,255,255,0.92)"}}>
          <div style={{fontSize:9,color:"rgba(100,180,255,0.5)",letterSpacing:2,marginBottom:7}}>{"STEP "+(onboardStep+1)+" / 5"}</div>
          {onboardStep===0&&<><div style={{fontSize:19,fontWeight:"bold",marginBottom:8}}>🌌 ようこそ</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>太陽系・銀河系・惑星地表を<br/>インタラクティブに探索できる<br/>シミュレーターへようこそ！</div></>}
          {onboardStep===1&&<><div style={{fontSize:17,fontWeight:"bold",marginBottom:8}}>🖱 ナビゲーション</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>・ドラッグ: 視点を回転<br/>・ホイール / ピンチ: ズーム<br/>・クリック: 天体を選択・詳細表示<br/>・[1-8]キー: 惑星選択</div></>}
          {onboardStep===2&&<><div style={{fontSize:17,fontWeight:"bold",marginBottom:8}}>🚀 惑星着陸</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>惑星をクリック→情報パネルの<br/>「着陸」ボタンで地表ビューへ。<br/>星空・日食・オーロラなども<br/>リアルに再現されます。</div></>}
          {onboardStep===3&&<><div style={{fontSize:17,fontWeight:"bold",marginBottom:8}}>🎓 学習ツアー</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>・太陽から海王星まで自動巡回<br/>・各天体の受験頻出ポイントを表示<br/>・中学受験・地学オリンピック対応<br/>・[T]キーでいつでも再開</div></>}
          {onboardStep===4&&<><div style={{fontSize:17,fontWeight:"bold",marginBottom:8}}>✨ さあ出発しよう！</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.7}}>「学習ツアーを開始」を押すと<br/>解説付きの太陽系巡りが始まります。<br/>いつでも [❓ ガイド] で<br/>このガイドを再表示できます。</div></>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:20}}>
            <button style={Object.assign({},bF,{fontSize:9,padding:"3px 10px"})} onClick={function(){setOnboardStep(-1);localStorage.setItem("solar_ob","1");}}>スキップ</button>
            <div style={{display:"flex",gap:5}}>{[0,1,2,3,4].map(function(i){return <div key={i} style={{width:6,height:6,borderRadius:3,background:i===onboardStep?"rgba(100,180,255,1)":"rgba(255,255,255,0.2)"}}/>;})}</div>
            <button style={bN} onClick={function(){var n=onboardStep+1;if(n>=5){setOnboardStep(-1);localStorage.setItem("solar_ob","1");setLanding(null);setTouring(true);tourRef.current={active:true,idx:0,timer:0,trans:false,lv:"beg"};setFoc("sun");setInfo({type:"sun"});}else setOnboardStep(n);}}>{onboardStep===4?"学習ツアーを開始 🚀":"次へ →"}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
