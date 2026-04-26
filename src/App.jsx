import { useState, useRef, useEffect, useCallback } from "react";
import { useRefSync } from "./hooks/useRefSync.js";
import { PL, SUNINFO, MD, GMOONS, COMETS, PL_MAP, COMET_MAP, DWARFS, DWARF_MAP, SRR, DK, SK, TRAIL_LEN, TAU, FL, SP, ZS, TOUR_SEQ, TOUR_NAMES, TOUR_HOLD, LAND_SP, MAP_CTNS, NAMED_STARS, CONST_LINES, ZODIAC, ZODIAC_BASE, SURF, MSHW, J2000 } from "./data/solarData.js";
import { oR, pRf, sRf, mOf, mRf, RX, RY, pj, clipCirc, fillCirc, dC, seedR, lerpColor } from "./render/utils.js";
import { dOb, dRi, dSh, dAx, drawPlanetBody, drawSun, SD, NB, AST, GAL, GAL_COLS, GAL_R, SUN_GAL_R, SUN_GAL_ANG, NEAR_STARS } from "./render/drawBodies.js";
import { drawLanding } from "./render/drawLanding.js";
import { startLandSound, stopLandSound } from "./audio/landAudio.js";
import { dateToSimDays, simDaysToDate, scanEvents } from "./utils/timeUtils.js";
import { DragPanel } from "./components/DragPanel.jsx";

export default function App(){
  var cR=useRef(null),fR=useRef(0);
  var S=useRef({t:dateToSimDays(new Date().toISOString().slice(0,10))||0,cam:{rx:0.22,ry:0.3,zm:1,tzm:1,fx:0,fy:0,fz:0},dr:null,pi:null,trails:PL.map(function(){return[];}),hitAreas:[],dragged:false});
  var[sh,setSh,shR]=useRefSync({orbits:true,tilt:true,moon:true,labels:true,planets:true,trails:true,belt:true});
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



  var handleClick=useCallback(function(e){if(S.current.dragged)return;var cv=cR.current;if(!cv)return;var rect=cv.getBoundingClientRect(),mx=e.clientX-rect.left-rect.width/2,my=e.clientY-rect.top-rect.height/2;var hits=S.current.hitAreas;for(var i=0;i<hits.length;i++){var h=hits[i],dx=mx-h.x,dy2=my-h.y;if(dx*dx+dy2*dy2<h.r*h.r){focusOn(h.n);return;}}setInfo(null);},[focusOn]);

  useEffect(function(){
    var cv=cR.current;if(!cv)return;var ctx=cv.getContext("2d"),alive=true,lt=0,sim=S.current,trailTimer=0;
    function rsz(){var d=Math.min(window.devicePixelRatio||1,2),pa=cv.parentElement,w=pa.clientWidth,h=pa.clientHeight;cv.width=w*d;cv.height=h*d;cv.style.width=w+"px";cv.style.height=h+"px";ctx.setTransform(d,0,0,d,0,0);}rsz();window.addEventListener("resize",rsz);
    function md(e){e.preventDefault();sim.dragged=false;if(cmpR.current){sim.cmpDrag={x:e.clientX};return;}sim.dr={x:e.clientX,y:e.clientY};}
    function mm(e){if(sim.cmpDrag){var dx0=e.clientX-sim.cmpDrag.x;cmpStateRef.current.offX+=dx0;sim.cmpDrag.x=e.clientX;sim.dragged=true;return;}if(!sim.dr)return;var dx=e.clientX-sim.dr.x,dy=e.clientY-sim.dr.y;if(Math.abs(dx)+Math.abs(dy)>3)sim.dragged=true;if(!landR.current){sim.cam.ry+=dx*0.005;sim.cam.rx=Math.max(-1.5,Math.min(1.5,sim.cam.rx+dy*0.005));}sim.dr.x=e.clientX;sim.dr.y=e.clientY;}
    function mu(){sim.cmpDrag=null;sim.dr=null;}
    function wl(e){e.preventDefault();if(cmpR.current){cmpStateRef.current.zm=Math.max(0.2,Math.min(5,cmpStateRef.current.zm*(e.deltaY>0?0.9:1.1)));return;}if(landR.current){var f=landFovR.current*(e.deltaY>0?1.1:0.9);f=Math.max(0.3,Math.min(3,f));landFovR.current=f;setLandFov(f);return;}var d2=e.deltaY>0?-1:1,c2=ziR.current,n=Math.max(0,Math.min(ZS.length-1,c2+d2));if(n!==c2){dz(n);ziR.current=n;setZi(n);sim.cam.tzm=ZS[n];}}
    function td3(e){if(e.touches.length<2)return 0;var a=e.touches[0],b=e.touches[1];return Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);}
    function tst(e){if(cmpR.current){e.preventDefault();if(e.touches.length===1){sim.cmpDrag={x:e.touches[0].clientX};sim.dragged=false;}if(e.touches.length===2){sim.cmpPinch=td3(e);sim.cmpDrag=null;}return;}if(e.touches.length===1){sim.dr={x:e.touches[0].clientX,y:e.touches[0].clientY};sim.dragged=false;}if(e.touches.length===2){sim.pi=td3(e);sim.dr=null;}}
    function tmv(e){e.preventDefault();if(cmpR.current){if(e.touches.length===1&&sim.cmpDrag){cmpStateRef.current.offX+=e.touches[0].clientX-sim.cmpDrag.x;sim.cmpDrag.x=e.touches[0].clientX;}if(e.touches.length===2&&sim.cmpPinch){var dp=td3(e),rp=dp/sim.cmpPinch;if(rp>1.01||rp<0.99){cmpStateRef.current.zm=Math.max(0.2,Math.min(5,cmpStateRef.current.zm*rp));sim.cmpPinch=dp;}}return;}if(e.touches.length===1&&sim.dr){var dx=e.touches[0].clientX-sim.dr.x,dy=e.touches[0].clientY-sim.dr.y;if(Math.abs(dx)+Math.abs(dy)>3)sim.dragged=true;if(!landR.current){sim.cam.ry+=dx*0.005;sim.cam.rx=Math.max(-1.5,Math.min(1.5,sim.cam.rx+dy*0.005));}sim.dr.x=e.touches[0].clientX;sim.dr.y=e.touches[0].clientY;}if(e.touches.length===2&&sim.pi){var d3=td3(e),ratio=d3/sim.pi;if(landR.current){var newFov=Math.max(0.3,Math.min(3,landFovR.current/ratio));landFovR.current=newFov;setLandFov(newFov);sim.pi=d3;}else if(ratio>1.06||ratio<0.94){var dir=ratio>1?1:-1,c3=ziR.current,n2=Math.max(0,Math.min(ZS.length-1,c3+dir));if(n2!==c3){dz(n2);ziR.current=n2;setZi(n2);sim.cam.tzm=ZS[n2];}sim.pi=d3;}}}
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

      var allBodies=PL.concat(DWARFS);
      var pd=[];for(var i=0;i<allBodies.length;i++){var pl=allBodies[i],oRv=oR(pl,_rd,_un),ang=(t/pl.p)*TAU;pd.push({pl:pl,oR:oRv,wx:Math.cos(ang)*oRv,wy:0,wz:Math.sin(ang)*oRv,vr:pRf(pl,_rp,_un),rotAng:(t/Math.abs(pl.rot))*TAU*(pl.rot<0?-1:1)});}
      var cd=[];for(var cci=0;cci<COMETS.length;cci++){var cm0=COMETS[cci],cm0E=cm0.e;var cm0OrbR=_rd||_un?cm0.a*DK:(160+Math.pow((cm0.a-228)/4267,0.55)*280);var cm0M=((t/cm0.p)+cm0.phase0)*TAU;var cm0Ecc=cm0M;for(var ki0=0;ki0<6;ki0++){cm0Ecc=cm0M+cm0E*Math.sin(cm0Ecc);}var cm0V=2*Math.atan2(Math.sqrt(1+cm0E)*Math.sin(cm0Ecc/2),Math.sqrt(1-cm0E)*Math.cos(cm0Ecc/2));var cm0R=cm0OrbR*(1-cm0E*cm0E)/(1+cm0E*Math.cos(cm0V));cd.push({cm:cm0,orbR:cm0OrbR,wx:Math.cos(cm0V+cm0.inc)*cm0R,wy:0,wz:Math.sin(cm0V+cm0.inc)*cm0R});}

      trailTimer+=dt;if(trailTimer>0.05&&!pausR.current&&!tourRef.current.trans){trailTimer=0;for(var ti=0;ti<sim.trails.length;ti++){sim.trails[ti].push({x:pd[ti].wx,z:pd[ti].wz});if(sim.trails[ti].length>TRAIL_LEN)sim.trails[ti].shift();}}

      var tfx=0,tfy=0,tfz=0,hasTarget=false;
      if(fc!=="all"&&fc!=="sun"){for(var fi=0;fi<pd.length;fi++){if(pd[fi].pl.n===fc){tfx=pd[fi].wx;tfy=pd[fi].wy;tfz=pd[fi].wz;hasTarget=true;break;}}if(!hasTarget){for(var fi2=0;fi2<cd.length;fi2++){if(cd[fi2].cm.key===fc){tfx=cd[fi2].wx;tfy=cd[fi2].wy;tfz=cd[fi2].wz;hasTarget=true;break;}}}}
      var ft=focTransRef.current;if(ft.active){if(!ft.ready){if(hasTarget){ft.toFx=tfx;ft.toFz=tfz;ft.ready=true;}else if(fc==="sun"||fc==="all"){ft.toFx=0;ft.toFz=0;ft.ready=true;}}if(ft.ready){ft.t=Math.min(1,ft.t+dt/ft.dur);var ease2=ft.t*ft.t*(3-2*ft.t);cam.fx=ft.fromFx+(ft.toFx-ft.fromFx)*ease2;cam.fz=ft.fromFz+(ft.toFz-ft.fromFz)*ease2;var midZm=Math.max(0.0001,Math.min(ft.fromZm,ft.toZm)*0.15);if(ease2<0.5){cam.zm=ft.fromZm+(midZm-ft.fromZm)*(ease2*2);}else{cam.zm=midZm+(ft.toZm-midZm)*((ease2-0.5)*2);}if(ft.t>=1){ft.active=false;cam.fx=ft.toFx;cam.fz=ft.toFz;cam.zm=ft.toZm;}}}else if(hasTarget||fc==="sun"){var lf=Math.min(1,dt*7);cam.fx+=(tfx-cam.fx)*lf;cam.fy+=(tfy-cam.fy)*lf;cam.fz+=(tfz-cam.fz)*lf;}else if(fc==="all"){cam.fx*=0.92;cam.fy*=0.92;cam.fz*=0.92;}

      if(show.orbits){for(var oi=0;oi<pd.length;oi++){var _oc=pd[oi].pl.c.match(/(\d+),(\d+),(\d+)/);dOb(ctx,pd[oi].oR,cam,_oc?_oc[1]+","+_oc[2]+","+_oc[3]:null,false);}}
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

      /* Sun */
      var sunPj=pj(0,0,0,cam),srScr=(_rs||_un)?sRf(_rs,_un)*cam.zm:Math.min(sRf(false,false)*Math.pow(cam.zm,0.35),40);
      var hits=[];

      /* Comets */
      for(var cmi=0;cmi<cd.length;cmi++){var cm=cd[cmi].cm,cmE=cm.e,cmOrbR=cd[cmi].orbR;var cmPj=pj(cd[cmi].wx,0,cd[cmi].wz,cam);var cmH=Math.max(cm.sz,0.8),cmZm=Math.pow(cam.zm,0.3);var tdx=cmPj.x-sunPj.x,tdy=cmPj.y-sunPj.y,tl2=Math.sqrt(tdx*tdx+tdy*tdy);if(tl2<0.1){tdx=1;tdy=0;tl2=1;}var tnx=tdx/tl2,tny=tdy/tl2,tpx=-tny,tpy=tnx;var csd=Math.sqrt(cd[cmi].wx*cd[cmi].wx+cd[cmi].wz*cd[cmi].wz),peri=cmOrbR*(1-cmE),tI=Math.max(0.1,Math.min(1.2,peri*3/Math.max(csd,0.1))),tLen=cm.tailLen*tI*cmZm;
        if(tLen>2){for(var tp2=0;tp2<20;tp2++){var tf=tp2/20;ctx.fillStyle="rgba("+cm.col[0]+","+cm.col[1]+","+cm.col[2]+","+((1-tf)*0.35*Math.min(tI,1)).toFixed(3)+")";var tsz=cmH*(0.8+tf*1.5);ctx.fillRect(cmPj.x+tnx*tLen*tf+tpx*Math.sin(tp2*1.7+t*2)*tLen*0.01-tsz*0.5,cmPj.y+tny*tLen*tf+tpy*Math.sin(tp2*1.7+t*2)*tLen*0.01-tsz*0.5,tsz,tsz);}for(var tp3=0;tp3<14;tp3++){var tf2=tp3/14,cv2=tf2*tf2*tLen*0.15;ctx.fillStyle="rgba(255,230,180,"+((1-tf2)*0.22*Math.min(tI,1)).toFixed(3)+")";var tsz2=cmH*(0.6+tf2*1.2);ctx.fillRect(cmPj.x+tnx*tLen*tf2*0.7+tpx*cv2-tsz2*0.5,cmPj.y+tny*tLen*tf2*0.7+tpy*cv2-tsz2*0.5,tsz2,tsz2);}}
        var comaR=cmH*(3+tI*4);var comaG=ctx.createRadialGradient(cmPj.x,cmPj.y,0,cmPj.x,cmPj.y,comaR);var cA=Math.min(0.7,0.2+tI*0.3);comaG.addColorStop(0,"rgba(255,255,255,"+cA.toFixed(2)+")");comaG.addColorStop(0.3,"rgba(200,230,255,"+(cA*0.3).toFixed(2)+")");comaG.addColorStop(1,"rgba(150,200,255,0)");ctx.fillStyle=comaG;ctx.fillRect(cmPj.x-comaR,cmPj.y-comaR,comaR*2,comaR*2);fillCirc(ctx,cmPj.x,cmPj.y,cmH,"rgba(240,250,255,1)");
        hits.push({n:cm.key,x:cmPj.x,y:cmPj.y,r:Math.max(comaR,15)});
        if(show.orbits){ctx.beginPath();ctx.strokeStyle="rgba(100,180,255,0.08)";ctx.lineWidth=0.5;ctx.setLineDash([3,5]);var cmN=Math.max(80,Math.min(600,Math.floor(cmOrbR*cam.zm*0.25)));for(var cj=0;cj<=cmN;cj++){var cja=(cj/cmN)*TAU,cjr=cmOrbR*(1-cmE*cmE)/(1+cmE*Math.cos(cja)),cjp=pj(Math.cos(cja+cm.inc)*cjr,0,Math.sin(cja+cm.inc)*cjr,cam);if(cj===0)ctx.moveTo(cjp.x,cjp.y);else ctx.lineTo(cjp.x,cjp.y);}ctx.stroke();ctx.setLineDash([]);}
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
          if(show.tilt)dAx(ctx,ppp.x,ppp.y,rr,pdt.pl.t);
          if(pdt.pl.n==="Earth"&&show.moon){var moV=mOf(_rd,_un),mAng=(t/MD.p)*TAU,mx=pdt.wx+Math.cos(mAng)*moV,mz=pdt.wz+Math.sin(mAng)*moV,mp=pj(mx,0,mz,cam),mrV=Math.max(mRf(_rp,_un)*cam.zm,0.3);dC(ctx,mp.x,mp.y,mrV,"rgba(200,200,200,1)");if(mrV>3)sphereShade(ctx,mp.x,mp.y,mrV);dSh(ctx,mp.x,mp.y,mrV,mx,mz,cam);if(show.labels){ctx.fillStyle="rgba(200,200,200,0.75)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("月",mp.x,mp.y-mrV-4);}}
          if(pdt.pl.n==="Jupiter"&&show.moon){for(var gmi=0;gmi<GMOONS.length;gmi++){var gm=GMOONS[gmi],gmOrb=_un?(gm.orbR/1e6)*DK:(_rd?(gm.orbR*0.001)*DK:(12+gmi*5)),gmAng=(t/gm.p)*TAU,gmWx=pdt.wx+Math.cos(gmAng)*gmOrb,gmWz=pdt.wz+Math.sin(gmAng)*gmOrb,gmPj=pj(gmWx,0,gmWz,cam),gmR=Math.max(_un?(gm.r/1e6)*DK*cam.zm:(_rp?gm.r*SK*0.01*cam.zm:(1.2+gmi*0.3)*cam.zm*0.3),0.4);dC(ctx,gmPj.x,gmPj.y,gmR,gm.col);if(gmR>1.5)sphereShade(ctx,gmPj.x,gmPj.y,gmR);dSh(ctx,gmPj.x,gmPj.y,gmR,gmWx,gmWz,cam);if(show.labels&&gmR>0.8){ctx.fillStyle="rgba(200,200,180,0.65)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(gm.name,gmPj.x,gmPj.y-gmR-3);}}}
          if(pdt.pl.n==="Earth"){var moVe=mOf(_rd,_un),mAnge=(t/MD.p)*TAU,sunAngE=Math.atan2(-pdt.wz,-pdt.wx),cosPhaseE=Math.cos(mAnge-sunAngE),inNode=Math.abs(Math.sin(Math.PI*t/173.31))<0.22;if(inNode){if(cosPhaseE>0.9995)eclipseType="solar";else if(cosPhaseE<-0.9993)eclipseType="lunar";}eclipseEarPj=ppp;eclipseEarRr=rr;}
          if(show.labels){ctx.fillStyle="rgba(255,255,255,0.85)";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(langR.current==="en"?pdt.pl.n:pdt.pl.j,ppp.x,ppp.y-rr-7);if(show.tilt){ctx.fillStyle="rgba(255,255,100,0.45)";ctx.font="8px sans-serif";ctx.fillText(pdt.pl.t+"°",ppp.x,ppp.y+rr+13);}}
        }
      }
      if(show.orbits){for(var oi2=0;oi2<pd.length;oi2++){var _oc2=pd[oi2].pl.c.match(/(\d+),(\d+),(\d+)/);dOb(ctx,pd[oi2].oR,cam,_oc2?_oc2[1]+","+_oc2[2]+","+_oc2[3]:null,true);}}
      sim.hitAreas=hits;if(ssFade<1)ctx.globalAlpha=1;ctx.restore();
      if(eclipseType&&!cmpR.current){var eTxt=langR.current==="en"?(eclipseType==="solar"?"🌑 Solar Eclipse":"🌕 Lunar Eclipse"):(eclipseType==="solar"?"🌑 日食":"🌕 月食");ctx.save();ctx.font="bold 13px system-ui,sans-serif";ctx.textAlign="center";var etW=ctx.measureText(eTxt).width+24;ctx.fillStyle="rgba(0,0,0,0.72)";ctx.fillRect(W/2-etW/2,H-72,etW,30);ctx.fillStyle=eclipseType==="solar"?"rgba(255,210,80,1)":"rgba(200,150,255,1)";ctx.fillText(eTxt,W/2,H-51);if(eclipseEarPj){ctx.strokeStyle=eclipseType==="solar"?"rgba(255,180,0,0.7)":"rgba(180,120,255,0.7)";ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.arc(eclipseEarPj.x,eclipseEarPj.y,eclipseEarRr+10,0,TAU);ctx.stroke();ctx.setLineDash([]);}ctx.restore();}

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
        <div style={lb}>表示 ⠿</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[{k:"orbits",l:"軌道"},{k:"trails",l:"軌跡"},{k:"belt",l:"小惑星帯"},{k:"tilt",l:"地軸"},{k:"moon",l:"月"},{k:"labels",l:"ラベル"},{k:"planets",l:"惑星"}].map(function(x){return <button key={x.k} style={sh[x.k]?bN:bF} onClick={function(){tog(x.k);}}>{x.l}</button>;})}</div>
        <div style={Object.assign({},lb,{marginTop:8,marginBottom:4})}>実スケール</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}><button style={uni?bD:(rSn?bN:bF)} onClick={function(){if(!uni)setRSn(function(p){return!p;});}}>太陽{!uni&&rSn?" ●":""}</button><button style={uni?bD:(rPl?bN:bF)} onClick={function(){if(!uni)setRPl(function(p){return!p;});}}>惑星{!uni&&rPl?" ●":""}</button><button style={uni?bD:(rDi?bN:bF)} onClick={function(){if(!uni)setRDi(function(p){return!p;});}}>距離{!uni&&rDi?" ●":""}</button></div>
        <div style={{marginTop:6,display:"flex",gap:3,flexWrap:"wrap"}}><button style={uni?bU:bF} onClick={function(){setUni(function(p){return!p;});}}>統一比率{uni?" ●":""}</button><button style={compare?bT("100,220,150"):bF} onClick={function(){setCompare(function(p){if(!p)cmpStateRef.current={offX:0,zm:1};return!p;});}}>比較{compare?" ●":""}</button><button style={touring?bT("200,100,255"):bF} onClick={function(){if(touring){stopTour();setFoc("all");setInfo(null);}else{setLanding(null);stopTour();setTouring(true);tourRef.current={active:true,idx:0,timer:0,trans:false};setFoc("sun");setInfo({type:"sun"});}}}>{touring?"ツアー停止":"ツアー"}</button><button style={bgm?bT("80,200,220"):bF} onClick={function(){setBgm(function(p){return!p;});}}>BGM{bgm?" ♪":""}</button><button style={lang==="en"?bT("100,220,180"):bF} onClick={function(){setLang(function(p){return p==="ja"?"en":"ja";});}}>EN/JA</button></div>
        <div style={Object.assign({},lb,{marginTop:8,marginBottom:4})}>ツール</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
          <button style={showDate?bN:bF} onClick={function(){setShowDate(function(p){return!p;});}}>日付移動</button>
          <button style={bF} onClick={takeScreenshot}>📷 撮影モード</button>
          <button style={bF} onClick={shareURL}>🔗 共有</button>
          <button style={bF} onClick={function(){setImportMode(true);}}>📥 読込</button>
          <button style={bF} onClick={function(){S.current.t=dateToSimDays(new Date().toISOString().slice(0,10));for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];}}>今日</button>
          <button style={bF} onClick={function(){for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];}}>軌跡クリア</button>
          <button style={showEvents?bT("255,200,80"):bF} onClick={function(){if(!showEvents){eventsRef.current=scanEvents(S.current.t);}setShowEvents(function(p){return!p;});}}>📅 天文イベント</button>
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

      {/* Info panel */}
      {cleanView===0&&!landing&&info!==null&&<DragPanel style={Object.assign({},pn,{top:80,right:10,width:180,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"})}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:"bold",color:"rgba(255,255,255,0.95)"}}>{info.type==="sun"?(lang==="en"?"Sun":SUNINFO.j):info.type==="comet"?info.cm.name:(lang==="en"?info.pl.n:info.pl.j)}</span><button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){setInfo(null);}}>✕</button></div>{info.type==="sun"?<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)"}}><div>質量: {SUNINFO.mass}</div><div>半径: {SUNINFO.r}</div><div>表面温度: {SUNINFO.temp}</div><div>分類: {SUNINFO.type}</div><div>年齢: {SUNINFO.age}</div></div>:info.type==="comet"?<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)",whiteSpace:"pre-line"}}>{info.cm.info}</div>:<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)"}}><div>質量: {info.pl.mass}</div><div>半径: {(info.pl.r*1000).toLocaleString()} km</div><div>重力: {info.pl.grav}</div><div>自転: {info.pl.day}</div><div>公転: {info.pl.year}</div><div>衛星: {info.pl.moons}個</div><div>大気: {info.pl.atm}</div><div>気温: {info.pl.temp}</div><div>地軸傾斜: {info.pl.t}°</div><div>太陽距離: {info.pl.d}百万km</div><button style={Object.assign({},touring?bD:bT("100,180,255"),{marginTop:8,width:"100%",fontSize:11,padding:"6px"})} disabled={touring} onClick={function(){if(!touring)doLanding(info.pl.n);}}>{touring?(lang==="en"?"🚀 Stop Tour First":"🚀 ツアー停止後に着陸可"):(lang==="en"?"🚀 Land":"🚀 着陸")}</button></div>}</DragPanel>}

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
      <div style={{position:"absolute",top:4,left:4,color:"rgba(255,255,255,0.35)",fontSize:9,fontFamily:"system-ui,sans-serif",pointerEvents:"none",zIndex:20}}>v2.4.0</div>

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
    </div>
  );
}
