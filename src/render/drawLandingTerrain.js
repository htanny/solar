import { TAU, APOLLO_SITES, MARS_LANDMARKS, VENUS_LANDERS, MERCURY_SITES, TITAN_PROBES, HAYABUSA_SITES } from "../data/solarData.js";
import { fillCirc, seedR } from "./utils.js";
import { terrainH } from "./landingUtils.js";

/* Draw terrain layers, foreground detail, atmospheric fog, and perspective grid.
   Called from drawLanding after all sky/celestial sections are complete. */
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
        var _dl=(_as.lng-(lngDeg||0))*0.01745,_a1=(lat||0)*0.01745,_a2=_as.lat*0.01745;
        var _cd=Math.sin(_a1)*Math.sin(_a2)+Math.cos(_a1)*Math.cos(_a2)*Math.cos(_dl);
        var _da=Math.acos(Math.max(-1,Math.min(1,_cd)))*57.2958;
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
        var _mrDL=(_mr.lng-(lngDeg||0))*0.01745,_mrL1=(lat||0)*0.01745,_mrL2=_mr.lat*0.01745;
        var _mrCos=Math.sin(_mrL1)*Math.sin(_mrL2)+Math.cos(_mrL1)*Math.cos(_mrL2)*Math.cos(_mrDL);
        var _mrD=Math.acos(Math.max(-1,Math.min(1,_mrCos)))*57.2958;
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
        var _msdl=(_ms.lng-(lngDeg||0))*0.01745,_msl1=(lat||0)*0.01745,_msl2=_ms.lat*0.01745;
        var _mscos=Math.sin(_msl1)*Math.sin(_msl2)+Math.cos(_msl1)*Math.cos(_msl2)*Math.cos(_msdl);
        var _msda=Math.acos(Math.max(-1,Math.min(1,_mscos)))*57.2958;
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
      var _vdl=(_vl.lng-(lngDeg||0))*0.01745,_vll1=(lat||0)*0.01745,_vll2=_vl.lat*0.01745;
      var _vcos=Math.sin(_vll1)*Math.sin(_vll2)+Math.cos(_vll1)*Math.cos(_vll2)*Math.cos(_vdl);
      var _vda=Math.acos(Math.max(-1,Math.min(1,_vcos)))*57.2958;
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
    /* Sulfur plains with lava pools and volcanic calderas */
    var ior=seedR(777);ctx.globalAlpha=0.3;
    for(var ioi=0;ioi<8;ioi++){var iox=ior()*W,ioy=hrzY+10+ior()*(H-hrzY-20),ioR=8+ior()*25;
      ctx.fillStyle=ior()<0.5?"rgba(30,10,5,1)":"rgba(80,20,5,1)";ctx.beginPath();ctx.ellipse(iox,ioy,ioR,ioR*0.38,0,0,TAU);ctx.fill();}
    ctx.globalAlpha=0.18;ctx.fillStyle="rgba(240,80,20,1)";
    for(var ili=0;ili<3;ili++){var ilx=((rng()*W*1.5+yaw*40)%(W*1.2))-W*0.1;ctx.beginPath();ctx.moveTo(ilx-30,hrzY);ctx.lineTo(ilx,hrzY-4-rng()*8);ctx.lineTo(ilx+30,hrzY);ctx.fill();}
    ctx.globalAlpha=1;
  }else if(plName==="Europa"){
    /* Ice ridges and linear chaos terrain */
    var eur=seedR(888);ctx.globalAlpha=0.22;
    for(var eui=0;eui<14;eui++){var eux=eur()*W,euy=hrzY+5+eur()*(H-hrzY-12),euw=1+eur()*3,eul=20+eur()*80,eua=(eur()-0.5)*0.6;
      ctx.strokeStyle=eur()<0.3?"rgba(160,100,70,1)":"rgba(180,150,120,1)";ctx.lineWidth=euw;
      ctx.beginPath();ctx.moveTo(eux,euy);ctx.lineTo(eux+Math.cos(eua)*eul,euy+Math.sin(eua)*eul);ctx.stroke();}
    ctx.globalAlpha=1;
  }else if(plName==="Ganymede"){
    /* Mix of dark ancient and bright grooved terrain */
    var gnr=seedR(999);ctx.globalAlpha=0.18;
    for(var gni=0;gni<10;gni++){var gnx=gnr()*W,gny=hrzY+8+gnr()*(H-hrzY-15),gnsz=4+gnr()*18;
      ctx.fillStyle=gnr()<0.45?"rgba(60,55,48,1)":"rgba(155,148,130,1)";ctx.beginPath();ctx.ellipse(gnx,gny,gnsz,gnsz*0.5,gnr()*Math.PI,0,0,TAU);ctx.fill();}
    ctx.globalAlpha=0.12;ctx.strokeStyle="rgba(180,172,155,1)";ctx.lineWidth=2;
    for(var gri=0;gri<5;gri++){var grx=gnr()*W;ctx.beginPath();ctx.moveTo(grx,hrzY);ctx.lineTo(grx+(gnr()-0.5)*60,hrzY+(H-hrzY)*0.8);ctx.stroke();}
    ctx.globalAlpha=1;
  }else if(plName==="Callisto"){
    /* Old dark ice, dense multi-ring craters */
    var clr=seedR(111);ctx.globalAlpha=0.22;
    for(var cali=0;cali<12;cali++){var calx=clr()*W,caly=hrzY+8+clr()*(H-hrzY-15),calsz=5+clr()*20;
      ctx.fillStyle="rgba(25,22,18,1)";ctx.beginPath();ctx.arc(calx,caly,calsz,0,TAU);ctx.fill();
      ctx.strokeStyle="rgba(88,82,72,1)";ctx.lineWidth=0.8;ctx.beginPath();ctx.arc(calx,caly,calsz*1.35,0,TAU);ctx.stroke();}
    ctx.globalAlpha=1;
  }else if(plName==="Titan"){
    /* Orange-tinted dunes and methane lake patches */
    var ttnr=seedR(222);ctx.globalAlpha=0.2;
    for(var tdi=0;tdi<20;tdi++){var tdx=ttnr()*W,tdy=hrzY+4+ttnr()*(H-hrzY-10),tdD=(tdy-hrzY)/(H-hrzY),tdsz=3+tdD*14;
      ctx.strokeStyle="rgba(80,55,25,1)";ctx.lineWidth=tdsz*0.4;ctx.beginPath();ctx.moveTo(tdx,tdy);ctx.lineTo(tdx+(ttnr()-0.5)*tdsz*4,tdy-tdsz*0.5);ctx.stroke();}
    ctx.globalAlpha=0.15;ctx.fillStyle="rgba(40,28,12,1)";
    for(var tli=0;tli<4;tli++){var tlx=ttnr()*W,tly=hrzY+25+ttnr()*(H-hrzY-38),tlrx=30+ttnr()*60,tlry=8+ttnr()*14;
      ctx.beginPath();ctx.ellipse(tlx,tly,tlrx,tlry,0,0,TAU);ctx.fill();}
    ctx.globalAlpha=1;
    /* Huygens probe site marker */
    for(var _tpi=0;_tpi<TITAN_PROBES.length;_tpi++){var _tp=TITAN_PROBES[_tpi];
      var _tdl=(_tp.lng-(lngDeg||0))*0.01745,_tl1=(lat||0)*0.01745,_tl2=_tp.lat*0.01745;
      var _tcos=Math.sin(_tl1)*Math.sin(_tl2)+Math.cos(_tl1)*Math.cos(_tl2)*Math.cos(_tdl);
      var _tda=Math.acos(Math.max(-1,Math.min(1,_tcos)))*57.2958;
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
      var _hadl=(_ha.lng-(lngDeg||0))*0.01745,_hal1=(lat||0)*0.01745,_hal2=_ha.lat*0.01745;
      var _hacos=Math.sin(_hal1)*Math.sin(_hal2)+Math.cos(_hal1)*Math.cos(_hal2)*Math.cos(_hadl);
      var _hada=Math.acos(Math.max(-1,Math.min(1,_hacos)))*57.2958;
      if(_hada<8){
        var hax=W*0.72,hay=H-48;ctx.globalAlpha=0.84;
        ctx.fillStyle="rgba(165,160,148,0.9)";ctx.fillRect(hax-8,hay-12,16,12);
        ctx.fillStyle="rgba(55,70,148,0.85)";ctx.fillRect(hax-22,hay-8,12,5);ctx.fillRect(hax+10,hay-8,12,5);
        ctx.fillStyle="rgba(200,195,175,0.85)";ctx.fillRect(hax-1,hay-22,2,12);ctx.fillRect(hax-5,hay-24,10,3);
        ctx.fillStyle="rgba(255,220,80,1)";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(_ha.n,hax,hay-30);
        ctx.fillStyle="rgba(220,200,160,0.75)";ctx.font="7px sans-serif";ctx.fillText(_ha.date,hax,hay+16);
        ctx.globalAlpha=1;break;}
    }
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
