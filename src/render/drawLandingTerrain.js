// @ts-check
import { TAU, APOLLO_SITES, MARS_LANDMARKS, VENUS_LANDERS, MERCURY_SITES, TITAN_PROBES, TITAN_FEATURES, HAYABUSA_SITES, TRITON_FEATURES, ENCELADUS_FEATURES, MIRANDA_FEATURES, PLUTO_FEATURES, CHARON_FEATURES, OUTER_PROBES, PHOBOS_FEATURES, EUROPA_FEATURES, IO_FEATURES, GANYMEDE_FEATURES, CALLISTO_FEATURES } from "../data/solarData.js";
import { fillCirc, seedR } from "./utils.js";
import { terrainH, angSepDeg } from "./landingUtils.js";

/**
 * 地表の遠近レイヤー・前景・大気フォグ・遠近グリッドを描画。
 * drawLanding 内で空・天体描画後に呼ばれる。
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {number} hrzY 水平線 Y 座標
 * @param {string} plName 着陸先英名
 * @param {number} yaw rad
 * @param {string} biome バイオーム名 (Earthのみ意味あり)
 * @param {{g:string,far:string,mid:string,mhF:number,mhM:number,mhN:number}} bConf BIOME_CONF[biome]
 * @param {import("./drawLanding.js").SurfData} sf
 * @param {() => number} rng
 * @param {number} t シム時刻
 * @param {number} dayF 0=夜,1=昼
 * @param {number} lat 度
 * @param {number} lngDeg 度
 * @param {string} sBot 空下端 RGB
 */
function drawLandingTerrain(ctx,W,H,hrzY,plName,yaw,biome,bConf,sf,rng,t,dayF,lat,lngDeg,sBot){
  var tSeed=plName.charCodeAt(0)*13+plName.length;
  /* Moon near/far side: near side = maria basalt, far side = bright highlands */
  var _mLng=plName==="Moon"?(((lngDeg||0)+540)%360-180):0;
  var _mAbs=Math.abs(_mLng);
  var moonNearF=plName==="Moon"?Math.max(0,1-_mAbs/90):0;
  var moonFarF=plName==="Moon"?Math.max(0,(_mAbs-90)/90):0;
  var moonGT=plName==="Moon"?_mAbs/180:0;

  /* ======== FAR MOUNTAINS (parallax layer 3 - slowest) ======== */
  var farMh=plName==="Mercury"||plName==="Mars"?18:plName==="Moon"?(8+Math.round(14*(1-moonNearF))):plName==="Venus"?6:plName==="Earth"?bConf.mhF:3;
  if(farMh>2){ctx.globalAlpha=0.15;
    ctx.beginPath();ctx.moveTo(0,hrzY);
    for(var fx=0;fx<=W;fx+=3){var fh=terrainH(fx+yaw*15,tSeed+100)*farMh;ctx.lineTo(fx,hrzY-fh-8);}
    ctx.lineTo(W,hrzY);ctx.closePath();
    ctx.fillStyle=plName==="Mars"?"rgba(140,70,40,1)":plName==="Earth"?bConf.far:plName==="Moon"?"rgba(75,72,68,1)":"rgba(80,75,70,1)";ctx.fill();ctx.globalAlpha=1;}

  /* ======== MID MOUNTAINS (parallax layer 2) ======== */
  var midMh=plName==="Mercury"||plName==="Mars"?30:plName==="Moon"?(12+Math.round(18*(1-moonNearF))):plName==="Venus"?10:plName==="Earth"?bConf.mhM:4;
  if(midMh>2){ctx.globalAlpha=0.3;
    ctx.beginPath();ctx.moveTo(0,hrzY);
    for(var mx=0;mx<=W;mx+=2){var mh2=terrainH(mx+yaw*30,tSeed+50)*midMh;ctx.lineTo(mx,hrzY-mh2-3);}
    ctx.lineTo(W,hrzY);ctx.closePath();
    ctx.fillStyle=plName==="Mars"?"rgba(155,80,45,1)":plName==="Earth"?bConf.mid:plName==="Moon"?"rgba(95,92,86,1)":"rgba(90,85,78,1)";ctx.fill();ctx.globalAlpha=1;}

  /* ======== NEAR TERRAIN (parallax layer 1 - fastest) + ground ======== */
  ctx.beginPath();ctx.moveTo(0,hrzY);
  var nearMh=plName==="Mercury"||plName==="Mars"?25:plName==="Moon"?(10+Math.round(14*(1-moonNearF))):plName==="Venus"?8:plName==="Earth"?bConf.mhN:5;
  for(var tx=0;tx<=W;tx+=2){var th2=terrainH(tx+yaw*50,tSeed)*nearMh;ctx.lineTo(tx,hrzY-th2);}
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
  var groundCol=plName==="Earth"?bConf.g:plName==="Moon"?"rgba("+Math.round(78+80*moonGT)+","+Math.round(75+79*moonGT)+","+Math.round(68+78*moonGT)+",1)":sf.g;
  var gG=ctx.createLinearGradient(0,hrzY-20,0,H);gG.addColorStop(0,groundCol);
  var gDark=groundCol.replace(/\d+/g,function(v,i){return i<3?Math.max(0,parseInt(v)-25)+"":v;});
  gG.addColorStop(1,gDark);ctx.fillStyle=gG;ctx.fill();

  /* ======== MOON NEAR-SIDE MARIA (dark basaltic plains) ======== */
  if(plName==="Moon"&&moonNearF>0.08){var marR2=seedR(499);ctx.globalAlpha=Math.min(0.55,moonNearF*0.6);ctx.fillStyle="rgba(40,38,35,1)";for(var mri2=0;mri2<5;mri2++){var maX=marR2()*W,maY=hrzY+20+marR2()*(H-hrzY)*0.48,maRx=50+marR2()*W*0.2,maRy=(16+marR2()*(H-hrzY)*0.06)*(0.45+((maY-hrzY)/(H-hrzY))*0.55),maRot=marR2()*Math.PI;ctx.beginPath();ctx.ellipse(maX,maY,maRx,maRy,maRot,0,TAU);ctx.fill();}ctx.globalAlpha=1;}

  /* ======== FOREGROUND DETAIL (parallax fastest) ======== */
  if(plName==="Mercury"||plName==="Mars"||plName==="Moon"){
    var cr=seedR(plName==="Mercury"?55:plName==="Moon"?91:77);
    var craterRim=plName==="Mercury"?"rgba(80,75,70,1)":plName==="Moon"?"rgba(130,127,118,1)":"rgba(140,80,45,1)";
    for(var ci2=0;ci2<(plName==="Moon"?Math.round(25+30*(1-moonNearF)+35*moonFarF):40);ci2++){var cx3=cr()*W,cy3=hrzY+12+cr()*(H-hrzY-25),dist=(cy3-hrzY)/(H-hrzY),sz=(1+dist*14+cr()*8*dist)*(plName==="Moon"?0.6+(1-moonNearF)*0.4+moonFarF*0.4:1);
      ctx.globalAlpha=0.25*dist;ctx.fillStyle="rgba(0,0,0,1)";ctx.beginPath();ctx.arc(cx3+sz*0.15,cy3+sz*0.1,sz*0.9,0,TAU);ctx.fill();
      ctx.globalAlpha=0.4*dist;ctx.fillStyle=craterRim;ctx.beginPath();ctx.arc(cx3,cy3,sz*0.8,0,TAU);ctx.fill();
      ctx.globalAlpha=0.12*dist;ctx.beginPath();ctx.arc(cx3-sz*0.2,cy3-sz*0.2,sz*0.35,0,TAU);ctx.fillStyle="rgba(255,255,255,1)";ctx.fill();}
    ctx.globalAlpha=1;
    if(plName==="Moon"){
      var mrn=seedR(307);ctx.globalAlpha=0.4;
      for(var rgi=0;rgi<120;rgi++){var rgx=mrn()*W,rgy=hrzY+6+mrn()*(H-hrzY-10),rgsz=0.5+mrn()*1.5;
        ctx.fillStyle=mrn()<(0.2+0.5*moonGT)?"rgba(190,185,175,1)":"rgba(70,68,62,1)";
        ctx.fillRect(rgx,rgy,rgsz,rgsz);}
      ctx.globalAlpha=1;
      /* Apollo landing site flag — show when within ~5° of any site */
      for(var _ai=0;_ai<APOLLO_SITES.length;_ai++){var _as=APOLLO_SITES[_ai];
        var _da=angSepDeg(lat||0,lngDeg||0,_as.lat,_as.lng);
        if(_da<5){
          var fpY=H-32;ctx.globalAlpha=0.65;ctx.fillStyle="rgba(20,20,18,1)";
          ctx.fillRect(W*0.78-12,fpY,24,8);
          ctx.beginPath();ctx.moveTo(W*0.78-14,fpY+8);ctx.lineTo(W*0.78-8,fpY+18);ctx.lineTo(W*0.78-6,fpY+8);ctx.fill();
          ctx.beginPath();ctx.moveTo(W*0.78+14,fpY+8);ctx.lineTo(W*0.78+8,fpY+18);ctx.lineTo(W*0.78+6,fpY+8);ctx.fill();
          ctx.fillStyle="rgba(220,210,180,0.8)";ctx.fillRect(W*0.78-3,fpY-6,6,6);
          ctx.fillStyle="rgba(255,220,80,1)";ctx.font="bold 10px sans-serif";ctx.textAlign="center";
          ctx.fillText(_as.n,W*0.78,fpY-10);
          ctx.fillStyle="rgba(220,220,200,0.85)";ctx.font="8px sans-serif";
          ctx.fillText(_as.region,W*0.78,fpY+30);
          ctx.fillStyle="rgba(180,180,160,0.7)";ctx.font="7px sans-serif";
          ctx.fillText(_as.date+" "+_as.crew,W*0.78,fpY+40);
          ctx.globalAlpha=1;
          break;
        }
      }
    }
    if(plName==="Mars"){
      ctx.globalAlpha=0.18;ctx.fillStyle="rgba(180,100,55,1)";
      for(var mi=0;mi<6;mi++){var mx2=((rng()*W*2+yaw*40)%(W*1.3))-W*0.15;ctx.beginPath();ctx.moveTo(mx2-45,hrzY);ctx.lineTo(mx2,hrzY-18-rng()*22);ctx.lineTo(mx2+45,hrzY);ctx.fill();}
      ctx.globalAlpha=1;
      /* Rover marker when near a landing site */
      for(var _mri=0;_mri<MARS_LANDMARKS.length;_mri++){var _mr=MARS_LANDMARKS[_mri];if(_mr.type!=="rover")continue;
        var _mrD=angSepDeg(lat||0,lngDeg||0,_mr.lat,_mr.lng);
        if(_mrD<5){
          var rvX=W*0.72,rvY=H-48;ctx.globalAlpha=0.8;
          /* rover body */
          ctx.fillStyle="rgba(200,180,120,0.9)";ctx.fillRect(rvX-12,rvY-6,24,10);
          /* solar panels */
          ctx.fillStyle="rgba(60,80,160,0.85)";ctx.fillRect(rvX-22,rvY-4,8,6);ctx.fillRect(rvX+14,rvY-4,8,6);
          /* mast */
          ctx.fillStyle="rgba(180,160,100,0.9)";ctx.fillRect(rvX-1,rvY-20,2,14);ctx.fillRect(rvX-4,rvY-22,8,4);
          /* wheels */
          ctx.fillStyle="rgba(80,60,30,0.85)";
          for(var wi=0;wi<3;wi++){ctx.beginPath();ctx.ellipse(rvX-10+wi*10,rvY+6,3,4,0,0,TAU);ctx.fill();}
          ctx.fillStyle="rgba(255,220,80,1)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";
          ctx.fillText(_mr.n,rvX,rvY-26);
          ctx.fillStyle="rgba(220,200,160,0.75)";ctx.font="7px sans-serif";
          ctx.fillText(_mr.info.split(" ").slice(0,3).join(" "),rvX,rvY+22);
          ctx.globalAlpha=1;break;}
      }
    }
    if(plName==="Mercury"){
      /* MESSENGER crash site marker when within ~5° */
      for(var _msi=0;_msi<MERCURY_SITES.length;_msi++){var _ms=MERCURY_SITES[_msi];
        var _msda=angSepDeg(lat||0,lngDeg||0,_ms.lat,_ms.lng);
        if(_msda<5){
          var msx=W*0.72,msy=H-52;ctx.globalAlpha=0.82;
          ctx.fillStyle="rgba(90,82,72,0.65)";ctx.beginPath();ctx.ellipse(msx,msy+10,20,8,0,0,TAU);ctx.fill();
          ctx.fillStyle="rgba(172,168,158,0.9)";ctx.fillRect(msx-10,msy-10,20,16);
          ctx.fillStyle="rgba(55,72,155,0.85)";ctx.fillRect(msx-28,msy-5,15,5);ctx.fillRect(msx+13,msy-5,15,5);
          ctx.fillStyle="rgba(255,220,80,1)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";
          ctx.fillText(_ms.n,msx,msy-16);
          ctx.fillStyle="rgba(200,200,220,0.75)";ctx.font="7px sans-serif";
          ctx.fillText(_ms.date,msx,msy+24);
          ctx.globalAlpha=1;break;}
      }
    }
  }else if(plName==="Earth"){
    if(biome==="polar"){
      ctx.globalAlpha=0.32;ctx.fillStyle="rgba(218,230,244,1)";
      for(var pi=0;pi<15;pi++){var px=rng()*W,pd=hrzY+18+rng()*(H-hrzY-28),pSz=10+rng()*24;ctx.beginPath();ctx.ellipse(px,pd,pSz,pSz*0.28,0,0,TAU);ctx.fill();}
      ctx.globalAlpha=0.5;ctx.fillStyle="rgba(240,248,255,1)";
      for(var sci=0;sci<25;sci++){var ssx=rng()*W,ssy=hrzY+4+rng()*(H-hrzY-10),ssz=0.5+rng()*2;ctx.fillRect(ssx,ssy,ssz,ssz);}
      ctx.globalAlpha=1;
    }else if(biome==="tundra"){
      var tur=seedR(201);ctx.globalAlpha=0.28;
      for(var tui=0;tui<40;tui++){var tux=tur()*W,tuy=hrzY+8+tur()*(H-hrzY-14),tuD=(tuy-hrzY)/(H-hrzY),tuSz=2+tuD*9;
        if(tur()<0.4){ctx.fillStyle="rgba(76,70,48,1)";ctx.beginPath();ctx.ellipse(tux,tuy,tuSz*1.6,tuSz*0.38,0,0,TAU);ctx.fill();}
        else{ctx.fillStyle="rgba(86,78,55,1)";ctx.beginPath();ctx.arc(tux,tuy,tuSz*0.55,0,TAU);ctx.fill();}}ctx.globalAlpha=1;
    }else if(biome==="taiga"){
      var tar=seedR(301);
      ctx.globalAlpha=0.28;ctx.fillStyle="rgba(18,42,15,1)";
      for(var tai=0;tai<30;tai++){var tax=((tar()*W*3+yaw*40)%(W*1.5))-W*0.25,tah=6+tar()*10;
        ctx.beginPath();ctx.moveTo(tax,hrzY);ctx.lineTo(tax-tah*0.32,hrzY+0.5);ctx.lineTo(tax+tah*0.32,hrzY+0.5);ctx.fill();}
      ctx.globalAlpha=0.55;
      for(var tai2=0;tai2<7;tai2++){var tax2=((tar()*W*2+yaw*70)%(W*1.3))-W*0.15,tah2=18+tar()*28;
        ctx.fillStyle="rgba(20,48,16,1)";ctx.beginPath();ctx.moveTo(tax2,hrzY-tah2);ctx.lineTo(tax2-tah2*0.35,hrzY+0.4);ctx.lineTo(tax2+tah2*0.35,hrzY+0.4);ctx.fill();
        ctx.fillStyle="rgba(42,28,12,1)";ctx.fillRect(tax2-2,hrzY-tah2*0.22,4,tah2*0.28);}ctx.globalAlpha=1;
    }else if(biome==="desert"){
      ctx.globalAlpha=0.11;ctx.strokeStyle="rgba(168,138,62,1)";ctx.lineWidth=1;
      for(var dri=0;dri<18;dri++){var dry=hrzY+14+dri*(H-hrzY-15)/18;ctx.beginPath();ctx.moveTo(0,dry);
        for(var drx=0;drx<=W;drx+=16){ctx.lineTo(drx,dry+Math.sin(drx*0.07+dri*1.4+yaw)*2.5);}ctx.stroke();}
      var dr2=seedR(401);ctx.globalAlpha=0.35;
      for(var dri2=0;dri2<14;dri2++){var drx2=dr2()*W,dry2=hrzY+14+dr2()*(H-hrzY-20),drD=(dry2-hrzY)/(H-hrzY),drsz=2+drD*12;
        ctx.fillStyle="rgba(156,130,74,1)";ctx.beginPath();ctx.ellipse(drx2,dry2,drsz,drsz*0.48,0,0,TAU);ctx.fill();}
      ctx.globalAlpha=0.48;ctx.fillStyle="rgba(68,108,48,1)";
      for(var cai=0;cai<3;cai++){var cax=((rng()*W*1.5+yaw*50)%(W*1.3))-W*0.15,cah=12+rng()*18;
        ctx.fillRect(cax-2,hrzY-cah,4,cah+3);ctx.fillRect(cax-9,hrzY-cah*0.62,8,3);ctx.fillRect(cax+2,hrzY-cah*0.5,6,3);}ctx.globalAlpha=1;
    }else if(biome==="savanna"){
      var svr=seedR(501);ctx.strokeStyle="rgba(158,142,42,1)";ctx.lineWidth=1;
      for(var svi=0;svi<100;svi++){var svx=svr()*W,svy=hrzY+5+svr()*(H-hrzY-12),svD=(svy-hrzY)/(H-hrzY),svh=4+svD*15;
        ctx.globalAlpha=0.17*svD;ctx.beginPath();ctx.moveTo(svx,svy);ctx.lineTo(svx+Math.sin(t*1.5+svi)*2,svy-svh);ctx.stroke();}
      ctx.globalAlpha=0.5;
      for(var sai=0;sai<4;sai++){var sax=((rng()*W*1.5+yaw*55)%(W*1.2))-W*0.1,saSz=8+rng()*14;
        ctx.fillStyle="rgba(48,30,10,1)";ctx.fillRect(sax-1.5,hrzY-saSz,3,saSz+2);
        ctx.fillStyle="rgba(22,65,12,1)";ctx.beginPath();ctx.ellipse(sax,hrzY-saSz,saSz*1.6,saSz*0.3,0,0,TAU);ctx.fill();}ctx.globalAlpha=1;
    }else if(biome==="jungle"){
      var jur=seedR(601);
      ctx.globalAlpha=0.38;ctx.fillStyle="rgba(14,58,12,1)";
      for(var jui=0;jui<45;jui++){var jux=((jur()*W*3+yaw*38)%(W*1.5))-W*0.25,juSz=5+jur()*10;
        ctx.beginPath();ctx.arc(jux,hrzY+juSz*0.18,juSz,0,TAU);ctx.fill();}
      ctx.globalAlpha=0.6;
      for(var jui2=0;jui2<8;jui2++){var jux2=((jur()*W*2+yaw*65)%(W*1.2))-W*0.1,juh=20+jur()*28;
        ctx.fillStyle="rgba(16,52,14,1)";ctx.beginPath();ctx.arc(jux2,hrzY-juh,juh*0.55,0,TAU);ctx.fill();
        ctx.fillStyle="rgba(10,38,10,1)";ctx.beginPath();ctx.arc(jux2+jur()*8-4,hrzY-juh*0.58,juh*0.38,0,TAU);ctx.fill();
        ctx.fillStyle="rgba(28,20,8,1)";ctx.fillRect(jux2-2,hrzY-juh,4,juh);}
      ctx.globalAlpha=0.11;ctx.strokeStyle="rgba(18,68,16,1)";ctx.lineWidth=1.5;
      for(var jvi=0;jvi<10;jvi++){var jvx=jur()*W,jvy=hrzY-jur()*H*0.14;
        ctx.beginPath();ctx.moveTo(jvx,jvy);ctx.bezierCurveTo(jvx+jur()*18-9,jvy+H*0.05,jvx+jur()*18-9,jvy+H*0.1,jvx+jur()*9-4,jvy+H*0.14);ctx.stroke();}
      ctx.globalAlpha=1;
    }else if(biome==="ocean"){
      ctx.globalAlpha=0.1;ctx.strokeStyle="rgba(100,178,238,1)";ctx.lineWidth=1;
      for(var owi=0;owi<14;owi++){var owy=hrzY+5+owi*(H-hrzY-10)/14;ctx.beginPath();ctx.moveTo(0,owy);
        for(var owx=0;owx<=W;owx+=14){ctx.lineTo(owx,owy+Math.sin(owx*0.05+t*2+owi*0.8)*3);}ctx.stroke();}
      var ocr=seedR(701);ctx.globalAlpha=0.07;ctx.fillStyle="rgba(220,238,255,1)";
      for(var ofi=0;ofi<18;ofi++){var ofx=((ocr()*W*2+t*8+yaw*30)%(W*1.5))-W*0.25,ofy=hrzY+20+ocr()*(H-hrzY-30);
        ctx.beginPath();ctx.ellipse(ofx,ofy,12+ocr()*22,3+ocr()*4,0,0,TAU);ctx.fill();}
      ctx.globalAlpha=1;
    }else{
      var gr3=seedR(99);ctx.strokeStyle="rgba(35,90,30,1)";ctx.lineWidth=1;
      for(var gi=0;gi<80;gi++){var gx3=gr3()*W,gy3=hrzY+3+gr3()*(H-hrzY-8),gd2=(gy3-hrzY)/(H-hrzY),gh=3+gd2*8;
        ctx.globalAlpha=0.15*gd2;ctx.beginPath();ctx.moveTo(gx3,gy3);ctx.lineTo(gx3+Math.sin(t*2+gi)*2,gy3-gh);ctx.stroke();}ctx.globalAlpha=1;
      for(var ti=0;ti<6;ti++){var tx3=((rng()*W*2+yaw*60)%(W*1.2))-W*0.1,tSz=8+rng()*10;
        ctx.globalAlpha=0.5;ctx.fillStyle="rgba(35,55,20,1)";ctx.beginPath();ctx.arc(tx3,hrzY-tSz*0.5,tSz,0,TAU);ctx.fill();
        ctx.fillStyle="rgba(60,40,20,1)";ctx.fillRect(tx3-1.5,hrzY-tSz*0.3,3,tSz*0.5);ctx.globalAlpha=1;}
      ctx.globalAlpha=0.25;ctx.fillStyle="rgba(25,60,18,1)";
      for(var ti2=0;ti2<30;ti2++){var tx4=((rng()*W*3+yaw*35)%(W*1.5))-W*0.25;ctx.beginPath();ctx.arc(tx4,hrzY-1,3+rng()*4,0,TAU);ctx.fill();}ctx.globalAlpha=1;
    }
  }else if(plName==="Venus"){
    var vr=seedR(66);ctx.globalAlpha=0.2;
    for(var vi2=0;vi2<25;vi2++){var vx=vr()*W,vy=hrzY+8+vr()*(H-hrzY-15),vsz=2+((vy-hrzY)/(H-hrzY))*12;
      ctx.fillStyle="rgba(80,60,35,1)";ctx.beginPath();ctx.arc(vx,vy,vsz,0,TAU);ctx.fill();
      if(vr()<0.2){ctx.fillStyle="rgba(220,80,20,"+(0.15+Math.sin(t*3+vi2)*0.08).toFixed(2)+")";ctx.beginPath();ctx.arc(vx,vy+vsz*0.3,vsz*0.6,0,TAU);ctx.fill();}}ctx.globalAlpha=1;
    /* Venera cylindrical lander when within ~5° of a landing site */
    for(var _vi=0;_vi<VENUS_LANDERS.length;_vi++){var _vl=VENUS_LANDERS[_vi];
      var _vda=angSepDeg(lat||0,lngDeg||0,_vl.lat,_vl.lng);
      if(_vda<5){
        var vvX=W*0.72,vvY=H-52;ctx.globalAlpha=0.84;
        ctx.fillStyle="rgba(178,168,142,0.9)";ctx.fillRect(vvX-10,vvY-18,20,26);
        ctx.fillStyle="rgba(138,128,108,0.85)";ctx.fillRect(vvX-16,vvY-20,32,4);
        ctx.fillRect(vvX-16,vvY+6,32,4);
        ctx.fillStyle="rgba(200,195,168,0.88)";ctx.fillRect(vvX-1,vvY-30,2,12);
        ctx.fillRect(vvX-8,vvY-32,16,3);
        ctx.fillStyle="rgba(255,220,80,1)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";
        ctx.fillText(_vl.n,vvX,vvY-38);
        ctx.fillStyle="rgba(220,200,160,0.75)";ctx.font="7px sans-serif";
        ctx.fillText(_vl.date,vvX,vvY+20);
        ctx.globalAlpha=1;break;}
    }
  }else if(plName==="Io"){
    /* 太陽系で最も火山活動が活発な天体: 硫黄平原(黄・橙・白のSO₂霜)、
       黒い溶岩湖(縁が赤熱)、蛇行する溶岩流、地平線の噴煙プルーム、非火山性の山影 */
    var ior=seedR(777);
    /* SO₂霜と硫黄化合物の色斑 — イオ特有のまだら模様 */
    for(var iosi=0;iosi<14;iosi++){
      var sx2=ior()*W,sy2=hrzY+6+ior()*(H-hrzY-12),sR2=10+ior()*30,sPick=ior();
      ctx.globalAlpha=0.13;
      ctx.fillStyle=sPick<0.35?"rgba(250,240,200,1)":sPick<0.7?"rgba(225,160,40,1)":"rgba(180,210,170,1)";
      ctx.beginPath();ctx.ellipse(sx2,sy2,sR2,sR2*0.32,(ior()-0.5)*0.4,0,TAU);ctx.fill();
    }
    /* 溶岩湖(パテラ) — 黒い湖面+赤熱した縁(夜はより明るく脈動) */
    var ioGlow=0.5+(1-dayF)*0.5;
    for(var ioi=0;ioi<8;ioi++){
      var iox=ior()*W,ioy=hrzY+10+ior()*(H-hrzY-20),ioR=8+ior()*25,ioPh=ior()*TAU;
      ctx.globalAlpha=0.34;
      ctx.fillStyle="rgba(22,8,4,1)";ctx.beginPath();ctx.ellipse(iox,ioy,ioR,ioR*0.38,0,0,TAU);ctx.fill();
      var ioPulse=0.7+Math.sin(t*1.8+ioPh)*0.3;
      ctx.globalAlpha=0.30*ioGlow*ioPulse;
      ctx.strokeStyle="rgba(255,120,30,1)";ctx.lineWidth=1.4;
      ctx.beginPath();ctx.ellipse(iox,ioy,ioR*0.92,ioR*0.34,0,0,TAU);ctx.stroke();
      ctx.globalAlpha=0.16*ioGlow*ioPulse;
      ctx.fillStyle="rgba(255,90,20,1)";ctx.beginPath();ctx.ellipse(iox,ioy,ioR*0.5,ioR*0.18,0,0,TAU);ctx.fill();
    }
    /* 蛇行する溶岩流 — 地平線側から手前へ */
    for(var ifl=0;ifl<4;ifl++){
      var ifx=ior()*W,ifAmp=4+ior()*7,ifSeg=6+Math.floor(ior()*4);
      ctx.globalAlpha=0.30*ioGlow;ctx.strokeStyle="rgba(255,110,25,1)";ctx.lineWidth=1.1+ior()*1.4;
      ctx.beginPath();ctx.moveTo(ifx,hrzY+3);
      for(var ifs=1;ifs<=ifSeg;ifs++){
        var ifyy=hrzY+3+(H-hrzY-20)*(ifs/ifSeg)*(0.3+ior()*0.25);
        ctx.lineTo(ifx+Math.sin(ifs*1.9+ifx)*ifAmp*(ifs/ifSeg+0.4),ifyy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha=1;
    /* 地平線の山影(非火山性の隆起山地、最大17.5km級) */
    ctx.globalAlpha=0.5;ctx.fillStyle="rgba(48,32,16,1)";
    for(var imt=0;imt<3;imt++){
      var imx=((ior()*W*2+yaw*55)%(W*1.4))-W*0.2,imw=30+ior()*50,imh=8+ior()*16;
      ctx.beginPath();ctx.moveTo(imx-imw,hrzY);
      ctx.lineTo(imx-imw*0.3,hrzY-imh);ctx.lineTo(imx+imw*0.25,hrzY-imh*0.6);ctx.lineTo(imx+imw,hrzY);
      ctx.closePath();ctx.fill();
    }
    ctx.globalAlpha=1;
    /* 噴煙プルーム — 地平線から傘状に立ち上る(ヨー連動で2本) */
    for(var ipl=0;ipl<2;ipl++){
      var ipx=((ipl*W*0.9+W*0.3+yaw*70)%(W*1.6))-W*0.3;
      if(ipx<-60||ipx>W+60)continue;
      var ipH=46+ipl*22,ipPh2=t*0.9+ipl*2.6;
      /* 噴出柱 */
      ctx.globalAlpha=0.20*ioGlow;ctx.strokeStyle="rgba(255,150,60,1)";ctx.lineWidth=2.2;
      ctx.beginPath();ctx.moveTo(ipx,hrzY);ctx.quadraticCurveTo(ipx+Math.sin(ipPh2)*2,hrzY-ipH*0.6,ipx,hrzY-ipH);ctx.stroke();
      /* 傘状の頂部(弾道軌道で広がって落下するSO₂) */
      ctx.globalAlpha=0.13;ctx.strokeStyle="rgba(235,210,170,1)";ctx.lineWidth=1.2;
      for(var ipa=0;ipa<5;ipa++){
        var ipf=(ipa/4-0.5)*2;
        ctx.beginPath();ctx.moveTo(ipx,hrzY-ipH);
        ctx.quadraticCurveTo(ipx+ipf*ipH*0.55,hrzY-ipH-8,ipx+ipf*ipH*0.8,hrzY-ipH*0.25);
        ctx.stroke();
      }
      /* 落下する粒子のきらめき */
      ctx.fillStyle="rgba(255,200,140,1)";
      for(var ipp=0;ipp<6;ipp++){
        var ippT=((t*0.5+ipp*0.37+ipl*0.5)%1),ippX=ipx+Math.sin(ipp*2.4)*ipH*0.6*ippT,ippY=hrzY-ipH+(ipH*0.75)*ippT*ippT;
        ctx.globalAlpha=0.25*(1-ippT)*ioGlow;
        ctx.fillRect(ippX-0.7,ippY-0.7,1.4,1.4);
      }
    }
    ctx.globalAlpha=1;
    /* IO_FEATURES 近接ラベル */
    var _ioMin=1e9,_ioIdx=-1;
    for(var _ifi=0;_ifi<IO_FEATURES.length;_ifi++){
      var _iod=angSepDeg(lat||0,lngDeg||0,IO_FEATURES[_ifi].lat,IO_FEATURES[_ifi].lng);
      if(_iod<_ioMin){_ioMin=_iod;_ioIdx=_ifi;}
    }
    if(_ioMin<6&&_ioIdx>=0){var _ioSel=IO_FEATURES[_ioIdx];
      ctx.fillStyle="rgba(255,200,120,0.92)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";
      ctx.fillText(_ioSel.n,W*0.72,H-42);
      ctx.fillStyle="rgba(230,180,110,0.7)";ctx.font="7px sans-serif";
      ctx.fillText(_ioSel.info.split(" ")[0],W*0.72,H-30);}
  }else if(plName==="Europa"){
    /* Ice-covered ocean world: reddish double-ridge lineae (tidal fracturing from Jupiter),
       lenticulae chaos terrain (sub-ice material upwelling), very few craters (young surface ~40-90 Myr) */
    var eur=seedR(888);
    /* E-W primary double ridges (lineae) — outer dark ridge + bright ice spine */
    for(var eui=0;eui<18;eui++){
      var euy=hrzY+4+eur()*(H-hrzY-12),euD=(euy-hrzY)/(H-hrzY),euW=0.8+euD*3.2;
      var euLen=W*0.4+eur()*W*0.55,euX0=eur()*W*0.5,euA=(eur()-0.5)*0.18;
      ctx.globalAlpha=0.32;ctx.strokeStyle=eur()<0.4?"rgba(140,85,55,1)":"rgba(162,100,65,1)";ctx.lineWidth=euW+1.5;
      ctx.beginPath();ctx.moveTo(euX0,euy);ctx.lineTo(euX0+Math.cos(euA)*euLen,euy+Math.sin(euA)*euLen);ctx.stroke();
      ctx.globalAlpha=0.16;ctx.strokeStyle="rgba(232,228,238,1)";ctx.lineWidth=euW*0.4;
      ctx.beginPath();ctx.moveTo(euX0,euy);ctx.lineTo(euX0+Math.cos(euA)*euLen,euy+Math.sin(euA)*euLen);ctx.stroke();
    }
    /* Diagonal cross-cutting lineae at steeper angles */
    ctx.globalAlpha=0.20;ctx.strokeStyle="rgba(118,72,52,1)";
    for(var edi=0;edi<8;edi++){
      var edY=hrzY+6+eur()*(H-hrzY-14),edD2=(edY-hrzY)/(H-hrzY),edA=0.3+eur()*0.85;
      var edX0=eur()*W,edLen=W*0.18+eur()*W*0.32;
      ctx.lineWidth=0.5+edD2*1.8;
      ctx.beginPath();ctx.moveTo(edX0,edY);ctx.lineTo(edX0+Math.cos(edA)*edLen,edY+Math.sin(edA)*edLen);ctx.stroke();
    }
    /* Lenticulae chaos patches — oval disrupted surface with bright halo */
    ctx.globalAlpha=0.28;
    for(var eli=0;eli<10;eli++){
      var elX=eur()*W,elY=hrzY+10+eur()*(H-hrzY-20),elRx=4+eur()*14,elRy=elRx*(0.32+eur()*0.38),elRot=eur()*Math.PI;
      ctx.fillStyle=eur()<0.5?"rgba(155,95,62,1)":"rgba(82,76,90,1)";
      ctx.beginPath();ctx.ellipse(elX,elY,elRx,elRy,elRot,0,TAU);ctx.fill();
      ctx.globalAlpha=0.10;ctx.strokeStyle="rgba(228,222,235,1)";ctx.lineWidth=0.8;
      ctx.beginPath();ctx.ellipse(elX,elY,elRx*1.45,elRy*1.45,elRot,0,TAU);ctx.stroke();
      ctx.globalAlpha=0.28;
    }
    ctx.globalAlpha=1;
    /* EUROPA_FEATURES proximity label */
    for(var _efei=0;_efei<EUROPA_FEATURES.length;_efei++){var _efe=EUROPA_FEATURES[_efei];
      var _efeDa=angSepDeg(lat||0,lngDeg||0,_efe.lat,_efe.lng);
      if(_efeDa<6){ctx.fillStyle="rgba(200,188,220,0.9)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(_efe.n,W*0.72,H-42);
        ctx.fillStyle="rgba(182,172,205,0.7)";ctx.font="7px sans-serif";ctx.fillText(_efe.info.split(" ")[0],W*0.72,H-30);break;}}
  }else if(plName==="Ganymede"){
    /* 太陽系最大の衛星: 暗い古地形(40億年前の地殻・クレーター密集)と
       明るい溝状地形(スルクス — 平行な尾根と溝の帯、テクトニクス活動の痕跡)の二分地殻 */
    var gnr=seedR(999);
    /* 暗い古地形のパッチ(レゴ) — 表面の約1/3を占める */
    for(var gdi=0;gdi<6;gdi++){
      var gdx=gnr()*W,gdy=hrzY+8+gnr()*(H-hrzY-16),gdR=18+gnr()*40;
      ctx.globalAlpha=0.22;ctx.fillStyle="rgba(52,46,38,1)";
      ctx.beginPath();ctx.ellipse(gdx,gdy,gdR,gdR*0.34,(gnr()-0.5)*0.3,0,TAU);ctx.fill();
      /* 古地形内の密集小クレーター */
      ctx.globalAlpha=0.20;ctx.fillStyle="rgba(30,26,22,1)";
      for(var gdc=0;gdc<5;gdc++){
        var gca=gnr()*TAU,gcd=gnr()*gdR*0.7;
        ctx.beginPath();ctx.ellipse(gdx+Math.cos(gca)*gcd,gdy+Math.sin(gca)*gcd*0.34,1.5+gnr()*3.5,(1.5+gnr()*3.5)*0.4,0,0,TAU);ctx.fill();
      }
    }
    /* 明るい溝状地形帯(スルクス) — 平行な尾根と溝のセットが帯状に走る */
    for(var gsi=0;gsi<4;gsi++){
      var gsy=hrzY+6+gnr()*(H-hrzY-14),gsD=(gsy-hrzY)/(H-hrzY);
      var gsA=(gnr()-0.5)*0.35,gsX0=gnr()*W*0.4,gsLen=W*0.45+gnr()*W*0.5;
      var gsN=4+Math.floor(gnr()*4),gsGap=(1.5+gsD*3.5);
      for(var gsl=0;gsl<gsN;gsl++){
        var gslOff=(gsl-gsN*0.5)*gsGap;
        ctx.globalAlpha=gsl%2?0.16:0.10;
        ctx.strokeStyle=gsl%2?"rgba(196,188,168,1)":"rgba(120,112,96,1)";
        ctx.lineWidth=gsl%2?(0.8+gsD*1.6):(0.5+gsD*1.0);
        ctx.beginPath();
        ctx.moveTo(gsX0,gsy+gslOff);
        ctx.lineTo(gsX0+Math.cos(gsA)*gsLen,gsy+gslOff+Math.sin(gsA)*gsLen);
        ctx.stroke();
      }
    }
    /* パリンプセスト(ゴーストクレーター) — 起伏が消えた明るい円形痕 */
    ctx.globalAlpha=0.10;ctx.strokeStyle="rgba(205,198,180,1)";ctx.lineWidth=1.2;
    for(var gpi=0;gpi<3;gpi++){
      var gpx2=gnr()*W,gpy2=hrzY+14+gnr()*(H-hrzY-26),gpR=10+gnr()*22;
      ctx.beginPath();ctx.ellipse(gpx2,gpy2,gpR,gpR*0.36,0,0,TAU);ctx.stroke();
      ctx.globalAlpha=0.05;ctx.fillStyle="rgba(210,202,185,1)";
      ctx.beginPath();ctx.ellipse(gpx2,gpy2,gpR,gpR*0.36,0,0,TAU);ctx.fill();
      ctx.globalAlpha=0.10;
    }
    /* 明るい放射状クレーター(トロス型) — 1つだけ目立たせる */
    var gtx=((gnr()*W*2+yaw*45)%(W*1.3))-W*0.15,gty=hrzY+18+gnr()*(H-hrzY-32),gtR=5+gnr()*7;
    if(gtx>-30&&gtx<W+30){
      ctx.globalAlpha=0.3;ctx.fillStyle="rgba(228,222,208,1)";
      ctx.beginPath();ctx.ellipse(gtx,gty,gtR,gtR*0.4,0,0,TAU);ctx.fill();
      ctx.globalAlpha=0.14;ctx.strokeStyle="rgba(232,226,212,1)";ctx.lineWidth=1;
      for(var gtr2=0;gtr2<7;gtr2++){
        var gta=gtr2/7*TAU;
        ctx.beginPath();ctx.moveTo(gtx+Math.cos(gta)*gtR,gty+Math.sin(gta)*gtR*0.4);
        ctx.lineTo(gtx+Math.cos(gta)*gtR*(2.2+gnr()*1.5),gty+Math.sin(gta)*gtR*0.4*(2.2+gnr()*1.5));
        ctx.stroke();
      }
    }
    ctx.globalAlpha=1;
    /* GANYMEDE_FEATURES 近接ラベル */
    var _gnMin=1e9,_gnIdx=-1;
    for(var _gfi=0;_gfi<GANYMEDE_FEATURES.length;_gfi++){
      var _gnd=angSepDeg(lat||0,lngDeg||0,GANYMEDE_FEATURES[_gfi].lat,GANYMEDE_FEATURES[_gfi].lng);
      if(_gnd<_gnMin){_gnMin=_gnd;_gnIdx=_gfi;}
    }
    if(_gnMin<6&&_gnIdx>=0){var _gnSel=GANYMEDE_FEATURES[_gnIdx];
      ctx.fillStyle="rgba(210,200,180,0.92)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";
      ctx.fillText(_gnSel.n,W*0.72,H-42);
      ctx.fillStyle="rgba(190,182,165,0.7)";ctx.font="7px sans-serif";
      ctx.fillText(_gnSel.info.split(" ")[0],W*0.72,H-30);}
  }else if(plName==="Callisto"){
    /* 太陽系で最も密にクレーターが刻まれた天体: 暗い古代氷地面、低起伏の"緩和"クレーター群、
       ヴァルハラ盆地(直径3800km)の同心リング、明るい霜の縁取り */
    var clr=seedR(111);
    /* 暗い汚れた氷のパッチ — アルベド0.17の非常に暗い表面 */
    ctx.globalAlpha=0.20;ctx.fillStyle="rgba(20,16,12,1)";
    for(var cldi=0;cldi<10;cldi++){
      var cldx=clr()*W,cldy=hrzY+10+clr()*(H-hrzY-20),cldr=22+clr()*55;
      ctx.beginPath();ctx.ellipse(cldx,cldy,cldr,cldr*0.32,(clr()-0.5)*0.3,0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;
    /* 密集した古代クレーター — 全て低起伏(氷の緩和でリムが低い) */
    ctx.globalAlpha=0.34;
    for(var clci=0;clci<28;clci++){
      var clcx=clr()*W,clcy=hrzY+7+clr()*(H-hrzY-14);
      var clcD=(clcy-hrzY)/(H-hrzY),clcsz=(1.5+clcD*10+clr()*5*clcD);
      ctx.fillStyle="rgba(26,22,16,1)";
      ctx.beginPath();ctx.ellipse(clcx,clcy,clcsz,clcsz*0.65,0,0,TAU);ctx.fill();
      /* 明るい霜のリム — カリスト特有の白い霜が縁に堆積 */
      ctx.globalAlpha=0.18;ctx.strokeStyle="rgba(158,148,130,1)";ctx.lineWidth=0.5+clcD*0.8;
      ctx.beginPath();ctx.ellipse(clcx,clcy,clcsz*1.28,clcsz*0.85,0,0,TAU);ctx.stroke();
      ctx.globalAlpha=0.34;
    }
    ctx.globalAlpha=1;
    /* ヴァルハラ盆地の同心リング — 付近では地平線に弧状の隆起帯が並ぶ */
    var _vlDist=angSepDeg(lat||0,lngDeg||0,16,10);
    if(_vlDist<35){
      var _vlF=Math.max(0,1-_vlDist/35);
      ctx.globalAlpha=0.28*_vlF;ctx.strokeStyle="rgba(105,98,84,1)";
      for(var vlri=0;vlri<5;vlri++){
        ctx.lineWidth=1.0+vlri*0.4;
        var vlry=hrzY+18+(vlri+1)*((H-hrzY)*0.12);
        ctx.beginPath();ctx.moveTo(0,vlry);
        for(var vlrx=0;vlrx<=W;vlrx+=10){ctx.lineTo(vlrx,vlry+Math.sin(vlrx*0.018+vlri*1.1)*2.5+(clr()-0.5)*1.5);}
        ctx.stroke();
      }
      ctx.globalAlpha=1;
    }
    /* 明るい霜の堆積物(大きなクレーター周辺に広がる) */
    ctx.globalAlpha=0.09;ctx.fillStyle="rgba(188,180,162,1)";
    for(var clfi=0;clfi<6;clfi++){
      var clfx=clr()*W,clfy=hrzY+14+clr()*(H-hrzY-26),clfsz=16+clr()*38;
      ctx.beginPath();ctx.ellipse(clfx,clfy,clfsz,clfsz*0.26,(clr()-0.5)*0.5,0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;
    /* CALLISTO_FEATURES 近接ラベル */
    var _clMin=1e9,_clIdx=-1;
    for(var _cfi2=0;_cfi2<CALLISTO_FEATURES.length;_cfi2++){
      var _cld=angSepDeg(lat||0,lngDeg||0,CALLISTO_FEATURES[_cfi2].lat,CALLISTO_FEATURES[_cfi2].lng);
      if(_cld<_clMin){_clMin=_cld;_clIdx=_cfi2;}
    }
    if(_clMin<10&&_clIdx>=0){var _clSel=CALLISTO_FEATURES[_clIdx];
      ctx.fillStyle="rgba(195,185,165,0.92)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";
      ctx.fillText(_clSel.n,W*0.72,H-42);
      ctx.fillStyle="rgba(172,164,145,0.7)";ctx.font="7px sans-serif";
      ctx.fillText(_clSel.info.split(" ")[0],W*0.72,H-30);}
  }else if(plName==="Titan"){
    /* East-west aligned hydrocarbon sand dunes (Titan's linear dunes are 100-150m tall,
       100km+ long, formed by Saturn-tide winds) + dark methane lake patches */
    var ttnr=seedR(222);
    /* Methane lakes — dark blue-black pools (more prominent than before) */
    for(var tli=0;tli<6;tli++){
      var tlx=ttnr()*W,tly=hrzY+18+ttnr()*(H-hrzY-35),tlrx=18+ttnr()*75,tlry=5+ttnr()*16,tlRot=(ttnr()-0.5)*0.6;
      ctx.globalAlpha=0.28;ctx.fillStyle="rgba(18,14,26,1)";
      ctx.beginPath();ctx.ellipse(tlx,tly,tlrx,tlry,tlRot,0,TAU);ctx.fill();
      if(dayF>0.12){ctx.globalAlpha=0.10*dayF;ctx.fillStyle="rgba(70,55,95,1)";
        ctx.beginPath();ctx.ellipse(tlx-tlrx*0.1,tly-tlry*0.2,tlrx*0.65,tlry*0.45,tlRot,0,TAU);ctx.fill();}
    }
    /* Long east-west dune crests */
    ctx.strokeStyle="rgba(70,48,18,1)";
    for(var tdi=0;tdi<28;tdi++){
      var tdy=hrzY+3+ttnr()*(H-hrzY-10),tdD=(tdy-hrzY)/(H-hrzY);
      ctx.lineWidth=0.7+tdD*2.8;ctx.globalAlpha=0.15+tdD*0.20;
      ctx.beginPath();
      var tdx0=ttnr()*W*0.4,tdLen=W*0.35+ttnr()*W*0.55;
      ctx.moveTo(tdx0,tdy);ctx.lineTo(tdx0+tdLen,tdy+(ttnr()-0.5)*2.5);ctx.stroke();
    }
    ctx.globalAlpha=1;
    /* TITAN_FEATURES proximity marker */
    var _tfMin=1e9,_tfIdx=-1;
    for(var _tfii=0;_tfii<TITAN_FEATURES.length;_tfii++){var _tff=TITAN_FEATURES[_tfii];
      var _tfda=angSepDeg(lat||0,lngDeg||0,_tff.lat,_tff.lng);
      if(_tfda<_tfMin){_tfMin=_tfda;_tfIdx=_tfii;}}
    if(_tfMin<3&&_tfIdx>=0){var _tfSel=TITAN_FEATURES[_tfIdx];
      ctx.globalAlpha=0.82;ctx.fillStyle="rgba(255,210,100,0.9)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";
      ctx.fillText("◆ "+_tfSel.n,W*0.5,H-56);ctx.globalAlpha=0.65;ctx.font="7px sans-serif";ctx.fillStyle="rgba(220,195,150,0.85)";
      ctx.fillText(_tfSel.info,W*0.5,H-44);ctx.globalAlpha=1;}
    /* Huygens probe site marker */
    for(var _tpi=0;_tpi<TITAN_PROBES.length;_tpi++){var _tp=TITAN_PROBES[_tpi];
      var _tda=angSepDeg(lat||0,lngDeg||0,_tp.lat,_tp.lng);
      if(_tda<5){
        var hgx=W*0.72,hgy=H-52;ctx.globalAlpha=0.82;
        ctx.fillStyle="rgba(175,165,140,0.9)";ctx.beginPath();ctx.ellipse(hgx,hgy-8,10,14,0,0,TAU);ctx.fill();
        ctx.fillStyle="rgba(135,125,108,0.85)";ctx.beginPath();ctx.ellipse(hgx,hgy-22,6,6,0,0,TAU);ctx.fill();
        ctx.fillStyle="rgba(200,190,160,0.88)";ctx.fillRect(hgx-1,hgy-30,2,10);
        ctx.fillStyle="rgba(255,220,80,1)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";
        ctx.fillText(_tp.n,hgx,hgy-36);ctx.fillStyle="rgba(220,200,160,0.75)";ctx.font="7px sans-serif";ctx.fillText(_tp.date,hgx,hgy+18);
        ctx.globalAlpha=1;break;}
    }
  }else if(plName==="Itokawa"||plName==="Ryugu"){
    /* Rough rocky asteroid surface: boulders + regolith */
    var asr=seedR(plName==="Itokawa"?333:444);ctx.globalAlpha=0.28;
    var asCol=plName==="Itokawa"?"rgba(140,120,95,1)":"rgba(25,20,16,1)";
    var asRim=plName==="Itokawa"?"rgba(160,138,110,1)":"rgba(38,30,22,1)";
    for(var asi=0;asi<30;asi++){var asx=asr()*W,asy=hrzY+6+asr()*(H-hrzY-14),asD=(asy-hrzY)/(H-hrzY),assz=1+asD*10+asr()*6*asD;
      ctx.fillStyle=asCol;ctx.beginPath();var asp=3+Math.floor(asr()*4);
      ctx.save();ctx.translate(asx,asy);ctx.rotate(asr()*Math.PI);
      ctx.beginPath();for(var av=0;av<asp;av++){var aa=av/asp*TAU,ar=assz*(0.7+asr()*0.3);if(av===0)ctx.moveTo(Math.cos(aa)*ar,Math.sin(aa)*ar*0.6);else ctx.lineTo(Math.cos(aa)*ar,Math.sin(aa)*ar*0.6);}
      ctx.closePath();ctx.fill();ctx.strokeStyle=asRim;ctx.lineWidth=0.5;ctx.globalAlpha=0.4;ctx.stroke();
      ctx.restore();}
    ctx.globalAlpha=0.35;ctx.fillStyle=asCol;
    for(var agi=0;agi<80;agi++){var agx=asr()*W,agy=hrzY+3+asr()*(H-hrzY-8);ctx.fillRect(agx,agy,0.8+asr()*1.5,0.8+asr()*1.5);}
    ctx.globalAlpha=1;
    /* Hayabusa spacecraft marker */
    for(var _hai=0;_hai<HAYABUSA_SITES.length;_hai++){var _ha=HAYABUSA_SITES[_hai];
      if(_ha.body!==plName)continue;
      var _hada=angSepDeg(lat||0,lngDeg||0,_ha.lat,_ha.lng);
      if(_hada<8){
        var hax=W*0.72,hay=H-48;ctx.globalAlpha=0.84;
        ctx.fillStyle="rgba(165,160,148,0.9)";ctx.fillRect(hax-8,hay-12,16,12);
        ctx.fillStyle="rgba(55,70,148,0.85)";ctx.fillRect(hax-22,hay-8,12,5);ctx.fillRect(hax+10,hay-8,12,5);
        ctx.fillStyle="rgba(200,195,175,0.85)";ctx.fillRect(hax-1,hay-22,2,12);ctx.fillRect(hax-5,hay-24,10,3);
        ctx.fillStyle="rgba(255,220,80,1)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(_ha.n,hax,hay-30);
        ctx.fillStyle="rgba(220,200,160,0.75)";ctx.font="7px sans-serif";ctx.fillText(_ha.date,hax,hay+16);
        ctx.globalAlpha=1;break;}
    }
  }else if(plName==="Triton"){
    /* Cantaloupe terrain — pitted melon-skin texture + pink-tinted nitrogen ice + geyser plumes */
    var trr=seedR(555);ctx.globalAlpha=0.22;
    for(var trci=0;trci<14;trci++){var trcx=trr()*W,trcy=hrzY+6+trr()*(H-hrzY-12),trcD=(trcy-hrzY)/(H-hrzY),trcsz=4+trcD*12;
      ctx.fillStyle="rgba(165,145,128,1)";ctx.beginPath();ctx.ellipse(trcx,trcy,trcsz,trcsz*0.7,0,0,TAU);ctx.fill();
      ctx.strokeStyle="rgba(210,190,168,1)";ctx.lineWidth=0.6;ctx.beginPath();ctx.ellipse(trcx,trcy,trcsz*1.15,trcsz*0.8,0,0,TAU);ctx.stroke();}
    ctx.globalAlpha=0.12;ctx.fillStyle="rgba(220,180,180,1)";ctx.fillRect(0,hrzY,W,H-hrzY);/* pink frost tint */
    ctx.globalAlpha=1;
    /* Nitrogen geyser plumes — vertical dark streaks */
    for(var trgi=0;trgi<3;trgi++){var trgx=((trr()*W*1.5+yaw*20)%(W*1.1))-W*0.05,trgw=2+trr()*3,trgh=40+trr()*60;
      var trgG=ctx.createLinearGradient(trgx,hrzY,trgx,hrzY-trgh);
      trgG.addColorStop(0,"rgba(40,30,35,0.7)");trgG.addColorStop(1,"rgba(40,30,35,0)");
      ctx.fillStyle=trgG;ctx.fillRect(trgx-trgw,hrzY-trgh,trgw*2,trgh);}
    /* Feature site marker */
    for(var _tri=0;_tri<TRITON_FEATURES.length;_tri++){var _trf=TRITON_FEATURES[_tri];
      var _trda=angSepDeg(lat||0,lngDeg||0,_trf.lat,_trf.lng);
      if(_trda<6){ctx.fillStyle="rgba(255,210,140,0.85)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(_trf.n,W*0.72,H-42);
        ctx.fillStyle="rgba(220,200,170,0.65)";ctx.font="7px sans-serif";ctx.fillText(_trf.info.split(" ")[0],W*0.72,H-30);break;}}
  }else if(plName==="Enceladus"){
    /* Pristine fresh-snow ice + bluish tiger-stripe fractures + towering bright water geysers */
    var enr=seedR(637);
    ctx.globalAlpha=0.10;ctx.fillStyle="rgba(210,228,245,1)";ctx.fillRect(0,hrzY,W,H-hrzY);/* blue-white frost tint */
    ctx.globalAlpha=1;
    /* Bluish fracture cracks (tiger-stripe sulci) */
    ctx.strokeStyle="rgba(120,165,210,0.5)";
    for(var enfi=0;enfi<7;enfi++){var enfy=hrzY+10+enr()*(H-hrzY-16),enfx=enr()*W,enfL=40+enr()*120;
      ctx.lineWidth=0.8+enr()*1.4;ctx.beginPath();ctx.moveTo(enfx,enfy);
      for(var enfk=1;enfk<=5;enfk++){ctx.lineTo(enfx+enfk*enfL/5,enfy+(enr()-0.5)*8);}ctx.stroke();}
    /* Ice-crystal sparkle */
    ctx.globalAlpha=0.5;ctx.fillStyle="rgba(255,255,255,1)";
    for(var ensi=0;ensi<40;ensi++){var ensx=enr()*W,ensy=hrzY+4+enr()*(H-hrzY-8),enss=0.5+enr()*1.4;ctx.fillRect(ensx,ensy,enss,enss);}
    ctx.globalAlpha=1;
    /* Towering water-vapor geyser plumes — bright, tall, rising from the surface */
    for(var engi=0;engi<4;engi++){var engx=((enr()*W*1.5+yaw*20)%(W*1.1))-W*0.05,engw=3+enr()*4,engh=90+enr()*110;
      var engG=ctx.createLinearGradient(engx,hrzY,engx,hrzY-engh);
      engG.addColorStop(0,"rgba(235,245,255,0.6)");engG.addColorStop(0.5,"rgba(205,225,245,0.28)");engG.addColorStop(1,"rgba(205,225,245,0)");
      ctx.fillStyle=engG;
      ctx.beginPath();ctx.moveTo(engx-engw*0.5,hrzY);ctx.lineTo(engx-engw*1.8,hrzY-engh);ctx.lineTo(engx+engw*1.8,hrzY-engh);ctx.lineTo(engx+engw*0.5,hrzY);ctx.closePath();ctx.fill();}
    /* Feature site marker */
    for(var _eni=0;_eni<ENCELADUS_FEATURES.length;_eni++){var _enf=ENCELADUS_FEATURES[_eni];
      var _enda=angSepDeg(lat||0,lngDeg||0,_enf.lat,_enf.lng);
      if(_enda<7){ctx.fillStyle="rgba(190,225,255,0.9)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(_enf.n,W*0.72,H-42);
        ctx.fillStyle="rgba(205,225,245,0.7)";ctx.font="7px sans-serif";ctx.fillText(_enf.info.split(" ")[0],W*0.72,H-30);break;}}
  }else if(plName==="Miranda"){
    /* Chaotic patchwork: ancient cratered highlands + smooth corona plains + Verona Rupes cliff */
    var mnr=seedR(743);
    /* Ancient impact craters (darker, rough terrain) */
    ctx.globalAlpha=0.28;
    for(var mnci=0;mnci<18;mnci++){var mncx=mnr()*W,mncy=hrzY+8+mnr()*(H-hrzY-14),mncD=(mncy-hrzY)/(H-hrzY),mncsz=3+mncD*10;
      ctx.fillStyle="rgba(80,72,66,1)";ctx.beginPath();ctx.ellipse(mncx,mncy,mncsz,mncsz*0.7,0,0,TAU);ctx.fill();
      ctx.strokeStyle="rgba(130,118,108,1)";ctx.lineWidth=0.5;ctx.beginPath();ctx.ellipse(mncx,mncy,mncsz*1.2,mncsz*0.85,0,0,TAU);ctx.stroke();}
    ctx.globalAlpha=1;
    /* Corona smooth patches (lighter, younger terrain) */
    ctx.globalAlpha=0.14;ctx.fillStyle="rgba(175,168,160,1)";
    for(var mnpi=0;mnpi<5;mnpi++){var mnpx=mnr()*W,mnpy=hrzY+4+mnr()*(H-hrzY-8),mnpsz=30+mnr()*55;
      ctx.beginPath();ctx.ellipse(mnpx,mnpy,mnpsz,mnpsz*0.6,0,0,TAU);ctx.fill();}
    ctx.globalAlpha=1;
    /* Cliff-like ridges (visible as dark horizontal banding — Verona Rupes impression) */
    ctx.globalAlpha=0.35;
    for(var mnri=0;mnri<3;mnri++){
      var mnry=hrzY+20+mnri*((H-hrzY)*0.28),mnrW=mnr()*W;
      ctx.strokeStyle="rgba(55,48,44,1)";ctx.lineWidth=1.5+mnr()*2.5;
      ctx.beginPath();ctx.moveTo(mnrW,mnry);ctx.bezierCurveTo(mnrW+W*0.15,mnry+(mnr()-0.5)*6,mnrW+W*0.35,mnry+(mnr()-0.5)*6,mnrW+W*0.5,mnry);ctx.stroke();}
    ctx.globalAlpha=1;
    /* Feature site marker */
    for(var _mni=0;_mni<MIRANDA_FEATURES.length;_mni++){var _mnf=MIRANDA_FEATURES[_mni];
      var _mnda=angSepDeg(lat||0,lngDeg||0,_mnf.lat,_mnf.lng);
      if(_mnda<8){ctx.fillStyle="rgba(210,228,240,0.9)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(_mnf.n,W*0.72,H-42);
        ctx.fillStyle="rgba(190,210,225,0.7)";ctx.font="7px sans-serif";ctx.fillText(_mnf.info.split(" ")[0],W*0.72,H-30);break;}}
  }else if(plName==="Pluto"){
    /* Sputnik Planitia smooth nitrogen ice + Cthulhu Macula dark mottling + water-ice mountains */
    var plr=seedR(311);ctx.globalAlpha=0.2;
    /* Ice plain polygonal convection cells (visible near Sputnik) */
    var _plDist=angSepDeg(lat||0,lngDeg||0,25,175);/* Sputnik Planitia 中心からの角距離 */
    if(_plDist<35){ctx.fillStyle="rgba(220,205,185,1)";
      for(var plpi=0;plpi<8;plpi++){var plpx=plr()*W,plpy=hrzY+12+plr()*(H-hrzY-20),plpsz=8+plr()*20;
        ctx.beginPath();var psd=5+Math.floor(plr()*3);
        for(var pv=0;pv<psd;pv++){var pa=pv/psd*TAU,pr=plpsz*(0.85+plr()*0.15);
          if(pv===0)ctx.moveTo(plpx+Math.cos(pa)*pr,plpy+Math.sin(pa)*pr*0.55);
          else ctx.lineTo(plpx+Math.cos(pa)*pr,plpy+Math.sin(pa)*pr*0.55);}
        ctx.closePath();ctx.fill();ctx.strokeStyle="rgba(180,160,140,1)";ctx.lineWidth=0.8;ctx.stroke();}
    }else{
      /* Reddish-brown tholin-rich terrain elsewhere */
      ctx.globalAlpha=0.25;ctx.fillStyle="rgba(85,55,40,1)";
      for(var pmci=0;pmci<10;pmci++){var pmx=plr()*W,pmy=hrzY+8+plr()*(H-hrzY-15),pmsz=6+plr()*22;
        ctx.beginPath();ctx.ellipse(pmx,pmy,pmsz,pmsz*0.45,plr()*Math.PI,0,TAU);ctx.fill();}
    }
    ctx.globalAlpha=0.18;ctx.fillStyle="rgba(195,178,158,1)";
    /* Water-ice mountains silhouette */
    for(var pmi=0;pmi<5;pmi++){var pmtx=((plr()*W*1.5+yaw*30)%(W*1.2))-W*0.1;
      ctx.beginPath();ctx.moveTo(pmtx-40,hrzY);ctx.lineTo(pmtx,hrzY-12-plr()*16);ctx.lineTo(pmtx+40,hrzY);ctx.fill();}
    ctx.globalAlpha=1;
    /* New Horizons closest approach marker */
    for(var _opi=0;_opi<OUTER_PROBES.length;_opi++){var _op=OUTER_PROBES[_opi];
      if(_op.body!=="Pluto")continue;
      var _opD=angSepDeg(lat||0,lngDeg||0,_op.lat,_op.lng);
      if(_opD<8){
        var nhx=W*0.72,nhy=H-50;ctx.globalAlpha=0.85;
        ctx.fillStyle="rgba(180,170,148,0.9)";ctx.fillRect(nhx-10,nhy-8,20,8);/* main body */
        ctx.fillStyle="rgba(55,70,148,0.85)";ctx.fillRect(nhx-18,nhy-4,8,4);/* dish antenna offset */
        ctx.strokeStyle="rgba(220,200,170,0.85)";ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(nhx+14,nhy-2,5,0,TAU);ctx.stroke();/* HGA dish */
        ctx.fillStyle="rgba(255,220,80,1)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";
        ctx.fillText("New Horizons",nhx,nhy-16);
        ctx.fillStyle="rgba(220,200,160,0.75)";ctx.font="7px sans-serif";ctx.fillText(_op.date,nhx,nhy+14);
        ctx.globalAlpha=1;break;}}
    /* Feature site label */
    for(var _pfi=0;_pfi<PLUTO_FEATURES.length;_pfi++){var _pf=PLUTO_FEATURES[_pfi];
      var _pfda=angSepDeg(lat||0,lngDeg||0,_pf.lat,_pf.lng);
      if(_pfda<10){ctx.fillStyle="rgba(255,210,160,0.7)";ctx.font="bold 8px sans-serif";ctx.textAlign="center";ctx.fillText("🛰 "+_pf.n,W*0.28,H-46);break;}}
  }else if(plName==="Charon"){
    /* Crater-pocked grey ice + Serenity Chasma rift + Mordor red polar */
    var chr=seedR(412);ctx.globalAlpha=0.22;
    for(var chci=0;chci<14;chci++){var chcx=chr()*W,chcy=hrzY+8+chr()*(H-hrzY-15),chcsz=4+chr()*18;
      ctx.fillStyle="rgba(70,65,60,1)";ctx.beginPath();ctx.arc(chcx,chcy,chcsz,0,TAU);ctx.fill();
      ctx.strokeStyle="rgba(180,170,160,1)";ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(chcx,chcy,chcsz*1.18,0,TAU);ctx.stroke();}
    /* Mordor red tint when at northern high latitudes */
    if((lat||0)>50){ctx.globalAlpha=Math.min(0.25,((lat||0)-50)/40*0.25);ctx.fillStyle="rgba(140,55,30,1)";ctx.fillRect(0,hrzY,W,H-hrzY);}
    /* Serenity Chasma rift visible near equator */
    if(Math.abs(lat||0)<25){ctx.globalAlpha=0.3;ctx.fillStyle="rgba(20,18,16,1)";
      var crX=((chr()*W*1.2+yaw*40)%(W*1.1))-W*0.05;
      ctx.fillRect(crX,hrzY+H*0.18,W*0.6,H*0.08);}
    ctx.globalAlpha=1;
    /* Feature label */
    for(var _cfi=0;_cfi<CHARON_FEATURES.length;_cfi++){var _cf=CHARON_FEATURES[_cfi];
      var _cfda=angSepDeg(lat||0,lngDeg||0,_cf.lat,_cf.lng);
      if(_cfda<10){ctx.fillStyle="rgba(255,180,140,0.75)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(_cf.n,W*0.72,H-42);break;}}
  }else if(plName==="Phobos"){
    /* Very dark, heavily cratered carbonaceous body. Dominated by Stickney crater
       and characteristic parallel groove system caused by tidal stress from Mars. */
    var phr=seedR(555);
    /* Dense impact craters */
    ctx.globalAlpha=0.32;
    for(var phci=0;phci<22;phci++){
      var phcx=phr()*W,phcy=hrzY+8+phr()*(H-hrzY-15);
      var phDist=(phcy-hrzY)/(H-hrzY),phsz=(2+phDist*9+phr()*6*phDist);
      ctx.fillStyle="rgba(52,42,34,1)";ctx.beginPath();ctx.ellipse(phcx,phcy,phsz,phsz*0.72,0,0,TAU);ctx.fill();
      ctx.strokeStyle="rgba(118,98,80,1)";ctx.lineWidth=0.5;ctx.beginPath();ctx.ellipse(phcx,phcy,phsz*1.22,phsz*0.88,0,0,TAU);ctx.stroke();
    }
    ctx.globalAlpha=1;
    /* Stickney crater — 9km on an 11km-radius body: broad shallow bowl visible for ~25° */
    var _phDa=angSepDeg(lat||0,lngDeg||0,1,37);/* スティックニー中心(1°N,37°W系)からの角距離 */
    if(_phDa<22){
      var _phF=Math.max(0,1-_phDa/22);
      /* Dark interior floor */
      ctx.globalAlpha=0.20*_phF;ctx.fillStyle="rgba(42,34,26,1)";ctx.fillRect(0,hrzY,W,H-hrzY);
      /* Bright ejecta rim */
      ctx.globalAlpha=0.30*_phF;ctx.strokeStyle="rgba(148,126,102,1)";ctx.lineWidth=3+_phF*8;
      ctx.beginPath();ctx.moveTo(0,hrzY+6+_phF*4);ctx.lineTo(W,hrzY+6+_phF*4);ctx.stroke();
      ctx.globalAlpha=1;
    }
    /* Parallel groove system (tidal stress fractures) running approximately E-W */
    ctx.globalAlpha=0.25;ctx.strokeStyle="rgba(58,46,36,1)";
    for(var phgi=0;phgi<10;phgi++){
      var phgy=hrzY+14+phgi*((H-hrzY)*0.077);
      var phgdist=(phgy-hrzY)/(H-hrzY);ctx.lineWidth=0.7+phgdist*1.6;
      ctx.beginPath();ctx.moveTo(0,phgy+(phr()*10-5));ctx.lineTo(W,phgy+(phr()*10-5));ctx.stroke();
    }
    ctx.globalAlpha=1;
    /* PHOBOS_FEATURES proximity marker */
    for(var _pfbi=0;_pfbi<PHOBOS_FEATURES.length;_pfbi++){var _pfb=PHOBOS_FEATURES[_pfbi];
      var _pfbDa=angSepDeg(lat||0,lngDeg||0,_pfb.lat,_pfb.lng);
      if(_pfbDa<6){ctx.fillStyle="rgba(218,200,178,0.9)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(_pfb.n,W*0.72,H-42);
        ctx.fillStyle="rgba(195,178,158,0.7)";ctx.font="7px sans-serif";ctx.fillText(_pfb.info.split(" ")[0],W*0.72,H-30);break;}}
  }else if(plName==="HalleyCore"){
    /* Pitch-black irregular crust with bright sublimation jets */
    var hcr=seedR(601);ctx.globalAlpha=0.4;ctx.fillStyle="rgba(8,6,5,1)";
    ctx.fillRect(0,hrzY,W,H-hrzY);/* very dark ground overlay */
    for(var hci=0;hci<35;hci++){var hcx=hcr()*W,hcy=hrzY+4+hcr()*(H-hrzY-8),hcsz=2+hcr()*8;
      ctx.fillStyle=hcr()<0.5?"rgba(15,12,10,1)":"rgba(35,28,22,1)";
      ctx.beginPath();var hcp=4+Math.floor(hcr()*4);
      for(var hv=0;hv<hcp;hv++){var ha=hv/hcp*TAU,hr=hcsz*(0.75+hcr()*0.35);
        if(hv===0)ctx.moveTo(hcx+Math.cos(ha)*hr,hcy+Math.sin(ha)*hr*0.65);
        else ctx.lineTo(hcx+Math.cos(ha)*hr,hcy+Math.sin(ha)*hr*0.65);}
      ctx.closePath();ctx.fill();}
    /* Bright sublimation jets */
    ctx.globalAlpha=0.5;
    for(var hji=0;hji<4;hji++){var hjx=((hcr()*W*1.3+yaw*50+t*5)%(W*1.1))-W*0.05,hjh=80+hcr()*120;
      var hjG=ctx.createLinearGradient(hjx,hrzY,hjx,hrzY-hjh);
      hjG.addColorStop(0,"rgba(255,250,230,0.85)");hjG.addColorStop(0.6,"rgba(220,220,200,0.3)");hjG.addColorStop(1,"rgba(180,200,255,0)");
      ctx.fillStyle=hjG;ctx.fillRect(hjx-2,hrzY-hjh,4,hjh);}
    ctx.globalAlpha=1;
    /* Giotto flyby label */
    var _gpD=angSepDeg(lat||0,0,0,0);/* 赤道(ジオット最接近帯)からの角距離=|緯度| */
    if(_gpD<30){ctx.fillStyle="rgba(255,220,80,0.78)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";
      ctx.fillText("⮕ ジオット最接近(1986)",W*0.5,hrzY*0.92);}
  }else if(plName==="Uranus"||plName==="Neptune"){
    ctx.globalAlpha=0.1;var ir=seedR(plName==="Uranus"?88:99);ctx.strokeStyle=plName==="Uranus"?"rgba(150,220,230,1)":"rgba(80,120,220,1)";ctx.lineWidth=0.5;
    for(var ii=0;ii<40;ii++){var ix=ir()*W,iy=hrzY+3+ir()*(H-hrzY-8);ctx.beginPath();ctx.moveTo(ix,iy);ctx.lineTo(ix+ir()*25-12,iy+ir()*12-6);ctx.stroke();
      if(ir()<0.1){ctx.globalAlpha=0.05;fillCirc(ctx,ix,iy,3+ir()*5,plName==="Uranus"?"rgba(180,240,250,1)":"rgba(100,140,240,1)");ctx.globalAlpha=0.1;}}
    ctx.globalAlpha=1;
  }

  /* ======== ATMOSPHERIC FOG ======== */
  if(sf.atm>0.2){var fogA=Math.min(0.35,sf.atm*0.12);var fogG=ctx.createLinearGradient(0,hrzY-50,0,hrzY+50);fogG.addColorStop(0,"rgba("+sBot+",0)");fogG.addColorStop(0.5,"rgba("+sBot+","+(fogA).toFixed(2)+")");fogG.addColorStop(1,"rgba("+sBot+",0)");ctx.fillStyle=fogG;ctx.fillRect(0,hrzY-50,W,100);}

  /* ======== PERSPECTIVE GRID ======== */
  ctx.globalAlpha=0.03;ctx.strokeStyle="rgba(255,255,255,1)";ctx.lineWidth=0.5;
  for(var gi3=1;gi3<=8;gi3++){var gy5=hrzY+gi3*gi3*(H-hrzY)/72;ctx.beginPath();ctx.moveTo(0,gy5);ctx.lineTo(W,gy5);ctx.stroke();}ctx.globalAlpha=1;
}

export { drawLandingTerrain };
