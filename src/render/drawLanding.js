import { TAU, SURF, PL_MAP, DWARF_MAP, NAMED_STARS, CONST_LINES, MSHW, MAP_CTNS, GMOONS } from "../data/solarData.js";
import { fillCirc, seedR, lerpColor } from "./utils.js";


/* Seeded terrain heightmap for horizon mountains */
function terrainH(x,seed){return(Math.sin(x*0.02+seed)*0.4+Math.sin(x*0.057+seed*2.3)*0.3+Math.sin(x*0.13+seed*5.1)*0.2+Math.sin(x*0.31+seed*11)*0.1)*0.5+0.5;}

/* Earth biome detection from lat/lng */
function earthIsLand(lat,lng){
  var ln=((lng%360)+540)%360-180;
  if(lat>15&&lat<75&&ln>-170&&ln<-52)return true;   /* N America */
  if(lat>-58&&lat<12&&ln>-82&&ln<-34)return true;   /* S America */
  if(lat>36&&lat<72&&ln>-11&&ln<42)return true;     /* Europe */
  if(lat>-35&&lat<38&&ln>-18&&ln<52)return true;    /* Africa */
  if(lat>12&&lat<42&&ln>32&&ln<64)return true;      /* Middle East */
  if(lat>0&&lat<78&&ln>40&&ln<148)return true;      /* Asia */
  if(lat>-10&&lat<30&&ln>72&&ln<142)return true;    /* S/SE Asia */
  if(lat>-44&&lat<-10&&ln>113&&ln<154)return true;  /* Australia */
  if(lat<-65)return true;                            /* Antarctica */
  return false;
}
function getEarthBiome(lat,lng){
  var a=Math.abs(lat),ln=((lng%360)+540)%360-180;
  if(a>70)return'polar';
  if(!earthIsLand(lat,ln))return a>62?'polar':'ocean';
  if(a>62)return'tundra';
  if(a>52)return'taiga';
  if(lat>14&&lat<32&&ln>-17&&ln<46)return'desert';   /* Sahara */
  if(lat>12&&lat<30&&ln>35&&ln<62)return'desert';    /* Arabian */
  if(lat>38&&lat<50&&ln>88&&ln<116)return'desert';   /* Gobi */
  if(lat>-32&&lat<-18&&ln>114&&ln<142)return'desert';/* Australia outback */
  if(lat>-30&&lat<-18&&ln>-72&&ln<-64)return'desert';/* Atacama */
  if(lat>29&&lat<37&&ln>-122&&ln<-108)return'desert';/* SW USA */
  if(a<11)return'jungle';
  if(a<23)return'savanna';
  return'temperate';
}

function drawLanding(ctx,W,H,t,plName,yaw,lat,fov,lngDeg,tilt,constOn){
  var sf=SURF[plName];if(!sf)return;
  var pl=PL_MAP[plName]||DWARF_MAP[plName];if(!pl)return;
  /* Earth biome config */
  var biome=plName==="Earth"?getEarthBiome(lat||0,lngDeg||0):'';
  var _BC={polar:{g:"rgba(215,228,242,1)",far:"rgba(175,200,222,1)",mid:"rgba(195,215,235,1)",mhF:6,mhM:5,mhN:3},tundra:{g:"rgba(82,92,60,1)",far:"rgba(70,82,58,1)",mid:"rgba(76,88,62,1)",mhF:22,mhM:18,mhN:12},taiga:{g:"rgba(30,62,26,1)",far:"rgba(24,52,20,1)",mid:"rgba(27,56,22,1)",mhF:28,mhM:22,mhN:14},temperate:{g:"rgba(45,110,40,1)",far:"rgba(60,80,120,1)",mid:"rgba(40,65,35,1)",mhF:30,mhM:25,mhN:15},desert:{g:"rgba(188,158,82,1)",far:"rgba(158,130,66,1)",mid:"rgba(172,144,72,1)",mhF:20,mhM:16,mhN:10},savanna:{g:"rgba(148,145,48,1)",far:"rgba(124,114,42,1)",mid:"rgba(135,128,44,1)",mhF:18,mhM:14,mhN:8},jungle:{g:"rgba(22,105,25,1)",far:"rgba(16,70,18,1)",mid:"rgba(19,82,20,1)",mhF:30,mhM:26,mhN:18},ocean:{g:"rgba(16,52,128,1)",far:"rgba(12,38,108,1)",mid:"rgba(14,44,118,1)",mhF:2,mhM:2,mhN:2}};
  var bConf=_BC[biome]||_BC.temperate;
  fov=fov||1;/* FOV multiplier: <1 zoom in, >1 zoom out */
  var rot=pl.rot,rotAbs=Math.abs(rot);
  var solarDay;
  if(rot<0)solarDay=1/(1/rotAbs+1/pl.p);else solarDay=Math.abs(1/(1/rotAbs-1/pl.p));
  if(!isFinite(solarDay)||solarDay>1e6)solarDay=rotAbs;
  if(plName==="Earth")solarDay=1;/* rot=1 in data = solar day, not sidereal; use 1.0 exactly */
  var dayPh=((t/solarDay+0.25)%1+1)%1;
  var sunDir=rot<0?-1:1;
  var sunHourAng=(dayPh+(lngDeg||0)/360)*TAU*sunDir;
  var effTilt=pl.t>90?(180-pl.t):pl.t;
  var season=Math.sin((t/pl.p)*TAU);
  var effTR=effTilt*0.01745;
  var latRad=(lat||0)*0.01745;
  var decl=effTR*season;
  var sinAlt=Math.sin(latRad)*Math.sin(decl)+Math.cos(latRad)*Math.cos(decl)*Math.sin(sunHourAng);
  var sunAlt=Math.max(-0.95,Math.min(0.95,sinAlt));
  var sunAz=Math.atan2(Math.cos(sunHourAng)*Math.cos(decl),Math.sin(decl)*Math.cos(latRad)-Math.cos(decl)*Math.sin(latRad)*Math.sin(sunHourAng));
  var aDiffSun=((sunAz-yaw)%TAU+TAU)%TAU;if(aDiffSun>Math.PI)aDiffSun-=TAU;
  var sunScreenX=W/2+aDiffSun*W*0.8/TAU;
  var isNight=sunAlt<-0.08;
  var dayF=Math.max(0,Math.min(1,sunAlt*4+0.5));
  var hrzY=Math.max(H*0.05,Math.min(H*0.92,H*(0.58-(tilt||0)*0.01)));
  var rng=seedR(plName.length*7+31);

  /* ======== SKY ======== */
  var sTop=sf.skyTop,sBot=sf.skyBot;
  if(sf.skyNT){sTop=lerpColor(sf.skyNT,sf.skyTop,dayF);sBot=lerpColor(sf.skyNB,sf.skyBot,dayF);}
  var skyG=ctx.createLinearGradient(0,0,0,hrzY);
  skyG.addColorStop(0,"rgba("+sTop+",1)");skyG.addColorStop(1,"rgba("+sBot+",1)");
  ctx.fillStyle=skyG;ctx.fillRect(0,0,W,hrzY);
  /* Earth バイオーム空色補正 */
  if(plName==="Earth"&&dayF>0.05){
    if(biome==="desert"){ctx.globalAlpha=0.13*dayF;ctx.fillStyle="rgba(210,165,75,1)";ctx.fillRect(0,hrzY*0.45,W,hrzY*0.55);ctx.globalAlpha=1;}
    else if(biome==="polar"){ctx.globalAlpha=0.08*dayF;ctx.fillStyle="rgba(185,215,248,1)";ctx.fillRect(0,0,W,hrzY);ctx.globalAlpha=1;}
    else if(biome==="ocean"){ctx.globalAlpha=0.06*dayF;ctx.fillStyle="rgba(30,100,200,1)";ctx.fillRect(0,0,W,hrzY);ctx.globalAlpha=1;}
  }

  /* ======== STARS ======== */
  var starA=sf.atm<0.5?0.7:(isNight?0.65:Math.max(0,(0.15-sunAlt)*3));
  if(starA>0.01){var sr2=seedR(42);for(var si=0;si<250;si++){var sx2=(sr2()*W*4+yaw*100)%W,sy2=sr2()*hrzY*0.92;var sb=0.3+sr2()*0.7;ctx.fillStyle="rgba(255,255,255,"+(sb*starA).toFixed(2)+")";var ss=sr2()<0.03?1.5:0.7;ctx.fillRect(sx2,sy2,ss,ss);}}

  /* ======== NAMED STARS ======== */
  if(starA>0.05){
    var lstD=((280.46+360.98565*t+(lngDeg||0))%360+360)%360;
    ctx.font="7px sans-serif";ctx.textAlign="left";
    for(var nsi=0;nsi<NAMED_STARS.length;nsi++){
      var ns=NAMED_STARS[nsi];
      var Hr2=(lstD-ns.ra)*TAU/360;
      var decR2=ns.dec*TAU/360;
      var sAltN=Math.sin(latRad)*Math.sin(decR2)+Math.cos(latRad)*Math.cos(decR2)*Math.cos(Hr2);
      if(sAltN<0.03)continue;
      var azN=Math.atan2(-Math.sin(Hr2)*Math.cos(decR2),Math.sin(decR2)*Math.cos(latRad)-Math.cos(decR2)*Math.sin(latRad)*Math.cos(Hr2));
      var aDiff=((azN-yaw)%TAU+TAU)%TAU;if(aDiff>Math.PI)aDiff-=TAU;
      if(Math.abs(aDiff)>TAU*0.28)continue;
      var sxN=W/2+aDiff*W*0.8/TAU;
      var syN=hrzY-sAltN*hrzY*0.75;
      if(syN>hrzY-15)continue;
      var nA=Math.min(1,starA*0.85);
      fillCirc(ctx,sxN,syN,2,ns.col+nA.toFixed(2)+")");
      ctx.fillStyle="rgba(255,255,255,"+(nA*0.5).toFixed(2)+")";
      ctx.fillText(ns.n,sxN+4,syN+3);
    }
    ctx.textAlign="center";
  }

  /* ======== CONSTELLATION LINES ======== */
  if(constOn&&starA>0.05){
    ctx.save();ctx.lineWidth=0.6;
    for(var cli=0;cli<CONST_LINES.length;cli++){
      var cl=CONST_LINES[cli];
      var clSx=[],clSy=[],clVis=[];
      for(var csi=0;csi<cl.s.length;csi++){
        var csHr=(lstD-cl.s[csi][0])*TAU/360,csDecR=cl.s[csi][1]*TAU/360;
        var csAlt=Math.sin(latRad)*Math.sin(csDecR)+Math.cos(latRad)*Math.cos(csDecR)*Math.cos(csHr);
        var csAz=Math.atan2(-Math.sin(csHr)*Math.cos(csDecR),Math.sin(csDecR)*Math.cos(latRad)-Math.cos(csDecR)*Math.sin(latRad)*Math.cos(csHr));
        var csDiff=((csAz-yaw)%TAU+TAU)%TAU;if(csDiff>Math.PI)csDiff-=TAU;
        clSx.push(W/2+csDiff*W*0.8/TAU);clSy.push(hrzY-csAlt*hrzY*0.75);
        clVis.push(csAlt>0.03&&Math.abs(csDiff)<TAU*0.32&&hrzY-csAlt*hrzY*0.75<hrzY-10);
      }
      var anyVis=false;for(var cv=0;cv<clVis.length;cv++)if(clVis[cv])anyVis=true;
      if(!anyVis)continue;
      ctx.strokeStyle="rgba(100,160,255,"+(starA*0.35).toFixed(2)+")";
      for(var lli=0;lli<cl.l.length;lli++){
        var la=cl.l[lli][0],lb2=cl.l[lli][1];
        if(!clVis[la]||!clVis[lb2])continue;
        ctx.beginPath();ctx.moveTo(clSx[la],clSy[la]);ctx.lineTo(clSx[lb2],clSy[lb2]);ctx.stroke();
      }
      /* Constellation name at centroid of visible stars */
      var cxSum=0,cySum=0,cCount=0;
      for(var cvi=0;cvi<clVis.length;cvi++){if(clVis[cvi]){cxSum+=clSx[cvi];cySum+=clSy[cvi];cCount++;}}
      if(cCount>0){ctx.fillStyle="rgba(130,180,255,"+(starA*0.5).toFixed(2)+")";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(cl.n,cxSum/cCount,cySum/cCount-8);}
    }
    ctx.restore();
  }

  /* ======== METEOR SHOWERS (Earth landing mode) ======== */
  if(plName==="Earth"&&starA>0.1){
    var dayY=((t%365.25)+365.25)%365.25;
    var shwI=1.0,bestI=0,bestSi=0;
    for(var msi=0;msi<MSHW.length;msi++){var mdiff=Math.min(Math.abs(dayY-MSHW[msi].d),365-Math.abs(dayY-MSHW[msi].d));var si2=Math.exp(-mdiff*mdiff*0.04)*8;shwI+=si2;if(si2>bestI){bestI=si2;bestSi=msi;}}
    var nMet=Math.min(20,Math.floor(shwI*1.5));
    var metDur=0.004;ctx.lineWidth=1.2;
    for(var mii=0;mii<nMet;mii++){
      var mPer=metDur*(1+mii*0.65);
      var mSlotT=(t%mPer)/mPer;if(mSlotT>0.45)continue;
      var mSeed=Math.floor(t/mPer)*97+mii*53;
      var mr=seedR(mSeed);
      var mProgress=mSlotT/0.45;
      var mSX=mr()*W,mSY=mr()*hrzY*0.72;
      var mAng=Math.PI*0.4+mr()*Math.PI*0.2;
      var mLen=25+mr()*55;
      var mDX=Math.cos(mAng)*mLen*mProgress,mDY=Math.sin(mAng)*mLen*mProgress;
      var mAlpha=(1-mProgress)*starA*(0.5+mr()*0.5);
      if(mAlpha<0.05)continue;
      var mGrad=ctx.createLinearGradient(mSX,mSY,mSX+mDX,mSY+mDY);
      mGrad.addColorStop(0,"rgba(255,255,255,0)");
      mGrad.addColorStop(1,"rgba(255,255,255,"+mAlpha.toFixed(2)+")");
      ctx.strokeStyle=mGrad;ctx.beginPath();ctx.moveTo(mSX,mSY);ctx.lineTo(mSX+mDX,mSY+mDY);ctx.stroke();
    }
    if(bestI>3){ctx.fillStyle="rgba(200,220,255,"+(Math.min(0.6,bestI*0.07)).toFixed(2)+")";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("🌠 "+MSHW[bestSi].n+"流星群",W/2,16);}
  }

  /* Eclipse detection must precede sun section which uses eclLand/moonSinAlt */
  var eclLand=null,eclStrength=0,moonSinAlt=-1;
  if(plName==="Earth"){var _sl=(280.46+0.9856*t+36000)%360,_ml=(218.316+13.176396*t+360000)%360,_mp=((_ml-_sl)/360+100)%1;var _md2=5.1*Math.sin((_ml-125.04)*0.01745)*0.01745,_lst2=((280.46+360.98565*t+(lngDeg||0))%360+360)%360,_mh=(_lst2-_ml%360)*TAU/360;moonSinAlt=Math.sin(latRad)*Math.sin(_md2)+Math.cos(latRad)*Math.cos(_md2)*Math.cos(_mh);var inNode=Math.abs(Math.sin(Math.PI*t/173.31))<0.22;if(inNode){var _ep=Math.min(_mp,1-_mp);if(_ep<0.018){eclLand='solar';eclStrength=1-_ep/0.018;}var _elp=Math.abs(_mp-0.5);if(_elp<0.022){eclLand='lunar';eclStrength=1-_elp/0.022;}}}

  /* ======== SUN ======== */
  var sunY=hrzY-sunAlt*hrzY*0.75;
  if(sunAlt>-0.2&&sunY<hrzY+30&&Math.abs(aDiffSun)<TAU*0.32){
    var sunR=Math.max(2,14*Math.sqrt(sf.sunSz)/fov);
    var glR=sunR*10;var sg=ctx.createRadialGradient(sunScreenX,sunY,sunR,sunScreenX,sunY,glR);
    sg.addColorStop(0,"rgba(255,240,200,0.25)");sg.addColorStop(0.3,"rgba(255,200,100,0.06)");sg.addColorStop(1,"rgba(255,180,80,0)");
    ctx.fillStyle=sg;ctx.fillRect(sunScreenX-glR,sunY-glR,glR*2,glR*2);
    ctx.globalAlpha=plName==="Venus"?0.25:1;
    fillCirc(ctx,sunScreenX,sunY,sunR,"rgba(255,245,220,1)");ctx.globalAlpha=1;
    /* Solar eclipse overlay */
    if(eclLand==='solar'&&moonSinAlt>-0.1){
      var eStr=eclStrength;
      var corR2=sunR*(1+eStr*1.5);
      var cg=ctx.createRadialGradient(sunScreenX,sunY,sunR*0.9,sunScreenX,sunY,corR2*2.2);
      cg.addColorStop(0,"rgba(255,240,180,"+(0.5*eStr).toFixed(2)+")");cg.addColorStop(0.4,"rgba(255,200,80,"+(0.2*eStr).toFixed(2)+")");cg.addColorStop(1,"rgba(255,150,30,0)");
      ctx.fillStyle=cg;ctx.beginPath();ctx.arc(sunScreenX,sunY,corR2*2.2,0,TAU);ctx.fill();
      fillCirc(ctx,sunScreenX,sunY,sunR*(0.95+eStr*0.1),"rgba(5,5,15,1)");
      if(eStr>0.9){ctx.globalAlpha=0.25*eStr;ctx.strokeStyle="rgba(255,240,200,1)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(sunScreenX,sunY,sunR*1.02,0,TAU);ctx.stroke();ctx.globalAlpha=1;}
      ctx.fillStyle="rgba(255,230,100,"+(0.7*eStr).toFixed(2)+")";ctx.font="bold 10px sans-serif";ctx.textAlign="center";
      ctx.fillText(eStr>0.85?"🌑 皆既日食":"🌑 日食",W/2,hrzY*0.08);
    }
    if(sunAlt>-0.1&&sunAlt<0.35){var ga=Math.max(0,(0.35-Math.abs(sunAlt-0.1))*1.5);var hg=ctx.createLinearGradient(0,hrzY-80,0,hrzY);hg.addColorStop(0,"rgba(255,130,40,0)");hg.addColorStop(1,"rgba(255,100,30,"+(ga*0.25).toFixed(2)+")");ctx.fillStyle=hg;ctx.fillRect(0,hrzY-80,W,80);}
  }

  /* ======== OTHER CELESTIAL BODIES IN SKY ======== */
  var nightAlpha=Math.max(0.2,1-dayF);
  if(plName==="Earth"){
    /* Moon - proper alt/az from RA/Dec, matching star calculation */
    var sunLngE=(280.46+0.9856*t+36000)%360;
    var moonLngE=(218.316+13.176396*t+360000)%360;
    var moonPh=((moonLngE-sunLngE)/360+100)%1;
    /* Moon RA ≈ ecliptic longitude (low inclination approx) */
    var moonRaD=moonLngE%360;
    var moonDecD=5.1*Math.sin((moonLngE-125.04)*0.01745); /* 5.1° max declination from inclination */
    var lstD2=((280.46+360.98565*t+(lngDeg||0))%360+360)%360;
    var moonHr=(lstD2-moonRaD)*TAU/360;
    var moonDecR2=moonDecD*0.01745;
    var moonSinAlt=Math.sin(latRad)*Math.sin(moonDecR2)+Math.cos(latRad)*Math.cos(moonDecR2)*Math.cos(moonHr);
    if(moonSinAlt>-0.1){
      var moonAz2=Math.atan2(-Math.sin(moonHr)*Math.cos(moonDecR2),Math.sin(moonDecR2)*Math.cos(latRad)-Math.cos(moonDecR2)*Math.sin(latRad)*Math.cos(moonHr));
      var moonADiff=((moonAz2-yaw)%TAU+TAU)%TAU;if(moonADiff>Math.PI)moonADiff-=TAU;
      var moonX=W/2+moonADiff*W*0.8/TAU;
      var moonY=hrzY-moonSinAlt*hrzY*0.75;
      if(moonY>4&&moonY<hrzY+10){
        var moonRad=Math.max(4,8/fov);
        var mkx=moonRad*Math.cos(moonPh*TAU);
        var mA=Math.max(0.75,nightAlpha*0.85+0.1);
        /* 傾き: 月→太陽のスクリーン方向から計算 */
        var dxSun2=sunScreenX-moonX, dySun2=sunY-moonY;
        var toSun=Math.atan2(dxSun2,-dySun2); /* 上方向=0, 時計回り正 */
        var moonTilt=moonPh<0.5 ? toSun-Math.PI/2 : toSun+Math.PI/2;
        ctx.save();
        ctx.translate(moonX,moonY);ctx.rotate(moonTilt);
        ctx.beginPath();ctx.arc(0,0,moonRad,0,TAU);ctx.clip();
        ctx.fillStyle="rgba(15,18,35,1)";ctx.fillRect(-moonRad,-moonRad,moonRad*2,moonRad*2);
        /* moonPh: 0=新月(暗), 0.25=上弦, 0.5=満月(明), 0.75=下弦 */
        if(moonPh>0.02&&moonPh<0.98){
          var moonCol=eclLand==='lunar'?"rgba(200,60,20,":moonPh>0.45&&moonPh<0.55&&eclStrength>0.3?"rgba(180,80,30,":"rgba(235,235,210,";
          ctx.fillStyle=moonCol+mA.toFixed(2)+")";ctx.beginPath();
          if(moonPh<0.5){
            ctx.arc(0,0,moonRad,-Math.PI/2,Math.PI/2,false);
            ctx.bezierCurveTo(mkx,moonRad,mkx,-moonRad,0,-moonRad);
          }else{
            ctx.arc(0,0,moonRad,-Math.PI/2,Math.PI/2,true);
            ctx.bezierCurveTo(-mkx,moonRad,-mkx,-moonRad,0,-moonRad);
          }
          ctx.fill();
        }
        /* moonPh≈0 or ≈1 → 新月: 暗いまま */
        ctx.restore();
        if(eclLand==='lunar'){
          var lstr=eclStrength;ctx.globalAlpha=0.18*lstr;
          var lg=ctx.createRadialGradient(moonX,moonY,moonRad,moonX,moonY,moonRad*3);
          lg.addColorStop(0,"rgba(200,50,0,1)");lg.addColorStop(1,"rgba(200,50,0,0)");
          ctx.fillStyle=lg;ctx.fillRect(moonX-moonRad*3,moonY-moonRad*3,moonRad*6,moonRad*6);ctx.globalAlpha=1;
          ctx.fillStyle="rgba(255,150,80,"+(0.7*lstr).toFixed(2)+")";ctx.font="bold 10px sans-serif";ctx.textAlign="center";
          ctx.fillText(lstr>0.85?"🌕 皆既月食":"🌕 月食",W/2,hrzY*0.08);
        }
        var mg=ctx.createRadialGradient(moonX,moonY,moonRad,moonX,moonY,moonRad*3);
        mg.addColorStop(0,"rgba(255,255,220,"+(0.12*nightAlpha).toFixed(2)+")");mg.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=mg;ctx.fillRect(moonX-moonRad*3,moonY-moonRad*3,moonRad*6,moonRad*6);
        ctx.fillStyle="rgba(200,200,180,"+(0.4*nightAlpha).toFixed(2)+")";ctx.font="7px sans-serif";ctx.textAlign="center";
        var phaseNames=["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"];ctx.fillText(phaseNames[Math.round(moonPh*8)%8],moonX,moonY+moonRad+9);
      }
    }
    /* Venus as evening/morning star */
    if(!isNight||sunAlt>-0.3){var venX=(W*0.3+t*0.1+yaw*60)%W,venY=hrzY*0.4+Math.sin(t*0.01)*hrzY*0.1;
      ctx.globalAlpha=Math.max(0,(0.3-sunAlt)*2)*0.7;fillCirc(ctx,venX,venY,2,"rgba(255,255,200,1)");
      var vglow=ctx.createRadialGradient(venX,venY,1,venX,venY,8);vglow.addColorStop(0,"rgba(255,255,200,0.3)");vglow.addColorStop(1,"rgba(255,255,200,0)");ctx.fillStyle=vglow;ctx.fillRect(venX-8,venY-8,16,16);ctx.globalAlpha=1;}
  }else if(plName==="Mars"){
    /* Phobos - fast, large moon */
    var phAng=(t/0.319)*TAU,phX=(W*0.5+Math.cos(phAng+yaw)*W*0.3),phY=hrzY*0.35+Math.sin(phAng)*hrzY*0.15;
    ctx.globalAlpha=0.7*nightAlpha;fillCirc(ctx,phX,phY,3/fov,"rgba(180,170,150,1)");ctx.globalAlpha=1;
    /* Deimos - slower, smaller */
    var deAng=(t/1.263)*TAU,deX=(W*0.5+Math.cos(deAng+yaw*0.8)*W*0.25),deY=hrzY*0.45+Math.sin(deAng)*hrzY*0.1;
    ctx.globalAlpha=0.5*nightAlpha;fillCirc(ctx,deX,deY,1.5/fov,"rgba(170,160,140,1)");ctx.globalAlpha=1;
    /* Earth as bright point */
    var eaX=(W*0.7+t*0.05+yaw*50)%W;ctx.globalAlpha=0.6*nightAlpha;fillCirc(ctx,eaX,hrzY*0.3,1.5,"rgba(100,150,255,1)");ctx.globalAlpha=1;
  }else if(plName==="Jupiter"){
    /* Galilean moons - large and dramatic */
    for(var gmi=0;gmi<GMOONS.length;gmi++){var gm=GMOONS[gmi];
      var gmA=(t/gm.p)*TAU,gmScrX=(W*0.5+Math.cos(gmA+yaw)*W*0.35);
      var gmScrY=hrzY*0.25+Math.sin(gmA*0.3)*hrzY*0.15;
      var gmSz=(gmi===2?4:gmi===3?3.5:gmi===0?3:2.5)/fov;
      ctx.globalAlpha=0.8;fillCirc(ctx,gmScrX,gmScrY,gmSz,gm.col);
      if(gmSz>2.5){ctx.fillStyle="rgba(255,255,255,0.2)";ctx.font="7px sans-serif";ctx.textAlign="center";ctx.fillText(gm.name,gmScrX,gmScrY-gmSz-3);}
      ctx.globalAlpha=1;}
  }else if(plName==="Saturn"){
    /* Titan - visible as bright dot */
    var tiAng=(t/15.945)*TAU,tiX=(W*0.4+Math.cos(tiAng+yaw)*W*0.2),tiY=hrzY*0.35;
    ctx.globalAlpha=0.6;fillCirc(ctx,tiX,tiY,2.5/fov,"rgba(200,180,120,1)");ctx.globalAlpha=1;
  }

  /* ======== AURORA (Earth lat>55°, Jupiter lat>45°) ======== */
  var absLat=Math.abs(lat||0);
  if((plName==="Earth"&&absLat>55)||(plName==="Jupiter"&&absLat>40)){
    var auroraStr=(plName==="Jupiter"?1.5:1)*Math.max(0,(absLat-(plName==="Jupiter"?40:55))/35);
    auroraStr=Math.min(1,auroraStr)*nightAlpha;
    if(auroraStr>0.02){
      for(var ai=0;ai<8;ai++){
        var ax=(ai/8)*W,aw=W*0.15,aH=hrzY*0.3;
        var ay=hrzY*0.05+Math.sin(ai*1.3+t*0.7)*hrzY*0.08;
        var wave=Math.sin(ai*2.1+t*1.2)*10;
        var aG=ctx.createLinearGradient(ax+wave,ay,ax+wave,ay+aH);
        if(plName==="Jupiter"){
          aG.addColorStop(0,"rgba(100,50,200,0)");aG.addColorStop(0.3,"rgba(120,60,220,"+(auroraStr*0.12).toFixed(2)+")");aG.addColorStop(0.7,"rgba(80,40,180,"+(auroraStr*0.08).toFixed(2)+")");aG.addColorStop(1,"rgba(60,30,150,0)");
        }else{
          aG.addColorStop(0,"rgba(50,200,100,0)");aG.addColorStop(0.3,"rgba(80,255,120,"+(auroraStr*0.1).toFixed(2)+")");aG.addColorStop(0.6,"rgba(60,180,200,"+(auroraStr*0.06).toFixed(2)+")");aG.addColorStop(1,"rgba(100,50,200,0)");
        }
        ctx.fillStyle=aG;ctx.fillRect(ax+wave-aw*0.5,ay,aw,aH);
      }
    }
  }

  /* ======== PLANET-SPECIFIC SKY FEATURES (dynamic) ======== */
  if(plName==="Earth"){
    /* Moving clouds */
    ctx.globalAlpha=0.18*dayF;ctx.fillStyle="rgba(255,255,255,1)";
    for(var ci=0;ci<12;ci++){var cx2=((rng()*W*3+t*8+yaw*40)%(W*1.5))-W*0.25,cy2=hrzY*0.15+rng()*hrzY*0.45,cw=25+rng()*55;
      ctx.beginPath();ctx.arc(cx2,cy2,cw*0.5,0,TAU);ctx.arc(cx2+cw*0.3,cy2-5,cw*0.35,0,TAU);ctx.arc(cx2-cw*0.15,cy2+3,cw*0.25,0,TAU);ctx.fill();}ctx.globalAlpha=1;
  }else if(plName==="Venus"){
    for(var vi=0;vi<4;vi++){ctx.globalAlpha=0.07+vi*0.025;ctx.fillStyle="rgba("+(170+vi*10)+","+(130+vi*8)+","+(50+vi*5)+",1)";ctx.fillRect(0,vi*hrzY*0.2+Math.sin(t*0.15+vi)*3,W,hrzY*0.25);}
    if(Math.sin(t*7.3)>0.97){ctx.globalAlpha=0.12;ctx.fillStyle="rgba(255,255,200,1)";ctx.fillRect(0,0,W,hrzY);}ctx.globalAlpha=1;
  }else if(plName==="Mars"){
    /* Animated dust particles */
    ctx.globalAlpha=0.1;ctx.fillStyle="rgba(200,150,90,1)";
    for(var di=0;di<50;di++){var dx=(rng()*W*2+t*20+yaw*20+Math.sin(di*1.7+t*0.6)*40)%W,dy3=rng()*hrzY*0.9;var dsz=0.5+rng()*2;ctx.fillRect(dx,dy3,dsz,dsz*0.5);}ctx.globalAlpha=1;
    /* Dust devil occasionally */
    if(Math.sin(t*0.3+yaw)>0.85){var ddx=(W*0.6+t*2)%W;ctx.globalAlpha=0.06;ctx.fillStyle="rgba(180,130,80,1)";ctx.beginPath();ctx.moveTo(ddx-3,hrzY);ctx.lineTo(ddx+1,hrzY*0.5);ctx.lineTo(ddx+5,hrzY);ctx.fill();ctx.globalAlpha=1;}
  }else if(plName==="Jupiter"){
    /* Cloud bands with animation */
    var jCols=["185,150,100","210,170,120","160,120,75","195,160,110","170,130,85"];
    for(var ji=0;ji<5;ji++){var jShift=Math.sin(t*0.4+ji*1.5)*8;ctx.fillStyle="rgba("+jCols[ji]+",0.13)";ctx.fillRect(jShift,hrzY*0.08+ji*hrzY*0.14,W,hrzY*0.1);}
    /* Animated Great Red Spot */
    var grsX=((0.3*W+t*1.5+yaw*30)%(W*1.2))-W*0.1;
    ctx.globalAlpha=0.15;fillCirc(ctx,grsX,hrzY*0.33,28,"rgba(190,90,50,1)");
    /* Swirl inside GRS */
    ctx.globalAlpha=0.08;ctx.strokeStyle="rgba(220,120,60,1)";ctx.lineWidth=1;
    ctx.beginPath();for(var gk=0;gk<20;gk++){var ga2=gk*0.32+t*0.8,gr2=8+gk*0.8;ctx.lineTo(grsX+Math.cos(ga2)*gr2,hrzY*0.33+Math.sin(ga2)*gr2*0.6);}ctx.stroke();
    ctx.globalAlpha=1;
    if(Math.sin(t*11+yaw)>0.95){ctx.globalAlpha=0.06;ctx.fillStyle="rgba(200,200,255,1)";ctx.fillRect(0,0,W,hrzY*0.5);ctx.globalAlpha=1;}
  }else if(plName==="Saturn"){
    /* Rings with subtle animation */
    ctx.globalAlpha=0.25;
    for(var rBand=0;rBand<3;rBand++){ctx.strokeStyle=rBand===0?"rgba(200,185,140,1)":rBand===1?"rgba(185,170,125,1)":"rgba(165,150,110,1)";ctx.lineWidth=rBand===0?8:rBand===1?12:6;ctx.beginPath();for(var rk=0;rk<=60;rk++){var ra=rk/60,rpx=ra*W,rpy=hrzY*0.22+Math.sin(ra*3.1416)*hrzY*(0.18+rBand*0.04)+Math.sin(t*0.1+ra*2)*2;if(rk===0)ctx.moveTo(rpx,rpy);else ctx.lineTo(rpx,rpy);}ctx.stroke();}
    ctx.globalAlpha=0.05;ctx.fillStyle="rgba(0,0,0,1)";ctx.fillRect(0,hrzY*0.45,W,hrzY*0.08);ctx.globalAlpha=1;
  }

  /* ======== FAR MOUNTAINS (parallax layer 3 - slowest) ======== */
  var tSeed=plName.charCodeAt(0)*13+plName.length;
  var farMh=plName==="Mercury"||plName==="Mars"?18:plName==="Venus"?6:plName==="Earth"?bConf.mhF:3;
  if(farMh>2){ctx.globalAlpha=0.15;
    ctx.beginPath();ctx.moveTo(0,hrzY);
    for(var fx=0;fx<=W;fx+=3){var fh=terrainH(fx+yaw*15,tSeed+100)*farMh;ctx.lineTo(fx,hrzY-fh-8);}
    ctx.lineTo(W,hrzY);ctx.closePath();
    ctx.fillStyle=plName==="Mars"?"rgba(140,70,40,1)":plName==="Earth"?bConf.far:"rgba(80,75,70,1)";ctx.fill();ctx.globalAlpha=1;}

  /* ======== MID MOUNTAINS (parallax layer 2) ======== */
  var midMh=plName==="Mercury"||plName==="Mars"?30:plName==="Venus"?10:plName==="Earth"?bConf.mhM:4;
  if(midMh>2){ctx.globalAlpha=0.3;
    ctx.beginPath();ctx.moveTo(0,hrzY);
    for(var mx=0;mx<=W;mx+=2){var mh2=terrainH(mx+yaw*30,tSeed+50)*midMh;ctx.lineTo(mx,hrzY-mh2-3);}
    ctx.lineTo(W,hrzY);ctx.closePath();
    ctx.fillStyle=plName==="Mars"?"rgba(155,80,45,1)":plName==="Earth"?bConf.mid:"rgba(90,85,78,1)";ctx.fill();ctx.globalAlpha=1;}

  /* ======== NEAR TERRAIN (parallax layer 1 - fastest) + ground ======== */
  ctx.beginPath();ctx.moveTo(0,hrzY);
  var nearMh=plName==="Mercury"||plName==="Mars"?25:plName==="Venus"?8:plName==="Earth"?bConf.mhN:5;
  for(var tx=0;tx<=W;tx+=2){var th2=terrainH(tx+yaw*50,tSeed)*nearMh;ctx.lineTo(tx,hrzY-th2);}
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
  var groundCol=plName==="Earth"?bConf.g:sf.g;
  var gG=ctx.createLinearGradient(0,hrzY-20,0,H);gG.addColorStop(0,groundCol);
  var gDark=groundCol.replace(/\d+/g,function(v,i){return i<3?Math.max(0,parseInt(v)-25)+"":v;});
  gG.addColorStop(1,gDark);ctx.fillStyle=gG;ctx.fill();

  /* ======== FOREGROUND DETAIL (parallax fastest) ======== */
  if(plName==="Mercury"||plName==="Mars"){
    var cr=seedR(plName==="Mercury"?55:77);
    for(var ci2=0;ci2<40;ci2++){var cx3=cr()*W,cy3=hrzY+12+cr()*(H-hrzY-25),dist=(cy3-hrzY)/(H-hrzY),sz=1+dist*14+cr()*8*dist;
      ctx.globalAlpha=0.25*dist;ctx.fillStyle="rgba(0,0,0,1)";ctx.beginPath();ctx.arc(cx3+sz*0.15,cy3+sz*0.1,sz*0.9,0,TAU);ctx.fill();
      ctx.globalAlpha=0.4*dist;ctx.fillStyle=plName==="Mercury"?"rgba(80,75,70,1)":"rgba(140,80,45,1)";ctx.beginPath();ctx.arc(cx3,cy3,sz*0.8,0,TAU);ctx.fill();
      ctx.globalAlpha=0.12*dist;ctx.beginPath();ctx.arc(cx3-sz*0.2,cy3-sz*0.2,sz*0.35,0,TAU);ctx.fillStyle="rgba(255,255,255,1)";ctx.fill();}
    ctx.globalAlpha=1;
    if(plName==="Mars"){ctx.globalAlpha=0.18;ctx.fillStyle="rgba(180,100,55,1)";for(var mi=0;mi<6;mi++){var mx2=((rng()*W*2+yaw*40)%(W*1.3))-W*0.15;ctx.beginPath();ctx.moveTo(mx2-45,hrzY);ctx.lineTo(mx2,hrzY-18-rng()*22);ctx.lineTo(mx2+45,hrzY);ctx.fill();}ctx.globalAlpha=1;}
  }else if(plName==="Earth"){
    if(biome==="polar"){
      /* 雪の吹き溜まり＋氷 */
      ctx.globalAlpha=0.32;ctx.fillStyle="rgba(218,230,244,1)";
      for(var pi=0;pi<15;pi++){var px=rng()*W,pd=hrzY+18+rng()*(H-hrzY-28),pSz=10+rng()*24;ctx.beginPath();ctx.ellipse(px,pd,pSz,pSz*0.28,0,0,TAU);ctx.fill();}
      ctx.globalAlpha=0.5;ctx.fillStyle="rgba(240,248,255,1)";
      for(var sci=0;sci<25;sci++){var ssx=rng()*W,ssy=hrzY+4+rng()*(H-hrzY-10),ssz=0.5+rng()*2;ctx.fillRect(ssx,ssy,ssz,ssz);}
      ctx.globalAlpha=1;
    }else if(biome==="tundra"){
      /* コケ・苔原・岩 */
      var tur=seedR(201);ctx.globalAlpha=0.28;
      for(var tui=0;tui<40;tui++){var tux=tur()*W,tuy=hrzY+8+tur()*(H-hrzY-14),tuD=(tuy-hrzY)/(H-hrzY),tuSz=2+tuD*9;
        if(tur()<0.4){ctx.fillStyle="rgba(76,70,48,1)";ctx.beginPath();ctx.ellipse(tux,tuy,tuSz*1.6,tuSz*0.38,0,0,TAU);ctx.fill();}
        else{ctx.fillStyle="rgba(86,78,55,1)";ctx.beginPath();ctx.arc(tux,tuy,tuSz*0.55,0,TAU);ctx.fill();}}ctx.globalAlpha=1;
    }else if(biome==="taiga"){
      /* 針葉樹（三角形） */
      var tar=seedR(301);
      ctx.globalAlpha=0.28;ctx.fillStyle="rgba(18,42,15,1)";
      for(var tai=0;tai<30;tai++){var tax=((tar()*W*3+yaw*40)%(W*1.5))-W*0.25,tah=6+tar()*10;
        ctx.beginPath();ctx.moveTo(tax,hrzY);ctx.lineTo(tax-tah*0.32,hrzY+0.5);ctx.lineTo(tax+tah*0.32,hrzY+0.5);ctx.fill();}
      ctx.globalAlpha=0.55;
      for(var tai2=0;tai2<7;tai2++){var tax2=((tar()*W*2+yaw*70)%(W*1.3))-W*0.15,tah2=18+tar()*28;
        ctx.fillStyle="rgba(20,48,16,1)";ctx.beginPath();ctx.moveTo(tax2,hrzY-tah2);ctx.lineTo(tax2-tah2*0.35,hrzY+0.4);ctx.lineTo(tax2+tah2*0.35,hrzY+0.4);ctx.fill();
        ctx.fillStyle="rgba(42,28,12,1)";ctx.fillRect(tax2-2,hrzY-tah2*0.22,4,tah2*0.28);}ctx.globalAlpha=1;
    }else if(biome==="desert"){
      /* 砂紋＋岩＋サボテン */
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
      /* 乾いた草＋アカシア */
      var svr=seedR(501);ctx.strokeStyle="rgba(158,142,42,1)";ctx.lineWidth=1;
      for(var svi=0;svi<100;svi++){var svx=svr()*W,svy=hrzY+5+svr()*(H-hrzY-12),svD=(svy-hrzY)/(H-hrzY),svh=4+svD*15;
        ctx.globalAlpha=0.17*svD;ctx.beginPath();ctx.moveTo(svx,svy);ctx.lineTo(svx+Math.sin(t*1.5+svi)*2,svy-svh);ctx.stroke();}
      ctx.globalAlpha=0.5;
      for(var sai=0;sai<4;sai++){var sax=((rng()*W*1.5+yaw*55)%(W*1.2))-W*0.1,saSz=8+rng()*14;
        ctx.fillStyle="rgba(48,30,10,1)";ctx.fillRect(sax-1.5,hrzY-saSz,3,saSz+2);
        ctx.fillStyle="rgba(22,65,12,1)";ctx.beginPath();ctx.ellipse(sax,hrzY-saSz,saSz*1.6,saSz*0.3,0,0,TAU);ctx.fill();}ctx.globalAlpha=1;
    }else if(biome==="jungle"){
      /* 密林 */
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
      /* 海面（波＋泡） */
      ctx.globalAlpha=0.1;ctx.strokeStyle="rgba(100,178,238,1)";ctx.lineWidth=1;
      for(var owi=0;owi<14;owi++){var owy=hrzY+5+owi*(H-hrzY-10)/14;ctx.beginPath();ctx.moveTo(0,owy);
        for(var owx=0;owx<=W;owx+=14){ctx.lineTo(owx,owy+Math.sin(owx*0.05+t*2+owi*0.8)*3);}ctx.stroke();}
      var ocr=seedR(701);ctx.globalAlpha=0.07;ctx.fillStyle="rgba(220,238,255,1)";
      for(var ofi=0;ofi<18;ofi++){var ofx=((ocr()*W*2+t*8+yaw*30)%(W*1.5))-W*0.25,ofy=hrzY+20+ocr()*(H-hrzY-30);
        ctx.beginPath();ctx.ellipse(ofx,ofy,12+ocr()*22,3+ocr()*4,0,0,TAU);ctx.fill();}
      ctx.globalAlpha=1;
    }else{
      /* 温帯（デフォルト）: 草＋木 */
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

  /* ======== COMPASS BAR ======== */
  var compassY=H<500?H-118:H-128;
  ctx.fillStyle="rgba(0,0,0,0.35)";ctx.fillRect(0,compassY-12,W,28);
  var dirs=[{a:0,l:"N"},{a:0.25,l:"E"},{a:0.5,l:"S"},{a:0.75,l:"W"}];
  var subDirs=[{a:0.125,l:"NE"},{a:0.375,l:"SE"},{a:0.625,l:"SW"},{a:0.875,l:"NW"}];
  ctx.font="bold 10px sans-serif";ctx.textAlign="center";
  var yawNorm=((yaw/TAU)%1+1)%1;
  for(var di2=0;di2<dirs.length;di2++){var dOff=((dirs[di2].a-yawNorm+0.5)%1-0.5)*W*0.8;if(Math.abs(dOff)<W*0.5){ctx.fillStyle="rgba(255,200,100,0.8)";ctx.fillText(dirs[di2].l,W*0.5+dOff,compassY+2);}}
  ctx.font="8px sans-serif";for(var di3=0;di3<subDirs.length;di3++){var dOff2=((subDirs[di3].a-yawNorm+0.5)%1-0.5)*W*0.8;if(Math.abs(dOff2)<W*0.5){ctx.fillStyle="rgba(255,255,255,0.3)";ctx.fillText(subDirs[di3].l,W*0.5+dOff2,compassY+2);}}
  ctx.strokeStyle="rgba(255,255,255,0.12)";ctx.lineWidth=0.5;for(var tk2=0;tk2<36;tk2++){var tkOff=((tk2/36-yawNorm+0.5)%1-0.5)*W*0.8;if(Math.abs(tkOff)<W*0.48){ctx.beginPath();ctx.moveTo(W*0.5+tkOff,compassY-8);ctx.lineTo(W*0.5+tkOff,compassY-4);ctx.stroke();}}
  ctx.fillStyle="rgba(255,100,80,0.8)";ctx.beginPath();ctx.moveTo(W*0.5,compassY-10);ctx.lineTo(W*0.5-4,compassY-14);ctx.lineTo(W*0.5+4,compassY-14);ctx.closePath();ctx.fill();

  /* ======== MINI WORLD MAP (Earth only) ======== */
  if(plName==="Earth"){
    var mW=130,mH=65,mX=52,mY=90;
    ctx.save();
    ctx.fillStyle="rgba(8,20,60,0.78)";ctx.fillRect(mX,mY,mW,mH);
    ctx.fillStyle="rgba(52,115,45,0.88)";
    for(var mci=0;mci<MAP_CTNS.length;mci++){var mc2=MAP_CTNS[mci];ctx.beginPath();for(var mcj=0;mcj<mc2.length;mcj++){var mcpx=mX+(mc2[mcj][0]+180)/360*mW,mcpy=mY+(90-mc2[mcj][1])/180*mH;if(mcj===0)ctx.moveTo(mcpx,mcpy);else ctx.lineTo(mcpx,mcpy);}ctx.closePath();ctx.fill();}
    ctx.strokeStyle="rgba(80,130,255,0.25)";ctx.lineWidth=0.5;
    var eqY2=mY+mH/2;ctx.beginPath();ctx.moveTo(mX,eqY2);ctx.lineTo(mX+mW,eqY2);ctx.stroke();
    var pmX2=mX+mW/2;ctx.beginPath();ctx.moveTo(pmX2,mY);ctx.lineTo(pmX2,mY+mH);ctx.stroke();
    ctx.strokeStyle="rgba(100,160,255,0.55)";ctx.lineWidth=0.8;ctx.strokeRect(mX,mY,mW,mH);
    var mPoX=mX+((lngDeg||0)+180)/360*mW,mPoY=mY+(90-(lat||0))/180*mH;
    mPoX=Math.max(mX+1,Math.min(mX+mW-1,mPoX));mPoY=Math.max(mY+1,Math.min(mY+mH-1,mPoY));
    ctx.strokeStyle="rgba(255,55,55,1)";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(mPoX-4,mPoY);ctx.lineTo(mPoX+4,mPoY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(mPoX,mPoY-4);ctx.lineTo(mPoX,mPoY+4);ctx.stroke();
    fillCirc(ctx,mPoX,mPoY,1.8,"rgba(255,55,55,1)");
    ctx.restore();
  }

  /* ======== HUD ======== */
  ctx.fillStyle="rgba(0,0,0,0.45)";ctx.fillRect(0,0,W,rot<0?100:90);
  ctx.fillStyle="rgba(255,255,255,0.9)";ctx.font="bold 14px sans-serif";ctx.textAlign="center";
  ctx.fillText(pl.j+"の表面",W/2,22);
  ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="9px sans-serif";
  var descs={Mercury:"大気なし・灼熱の昼(430℃)と極寒の夜(−180℃)",Venus:"厚い硫酸雲・気温462℃・気圧90気圧",Earth:"青い空・白い雲・生命の惑星",Mars:"薄いCO₂大気・赤い空・砂嵐",Jupiter:"ガス惑星・巨大な雲の海",Saturn:"ガス惑星・空を横切る壮大なリング",Uranus:"氷の巨人・メタンの青い大気",Neptune:"最果ての惑星・時速2000kmの暴風",Ceres:"小惑星帯最大の天体・岩と氷の世界",Pluto:"冥王星・−230℃の極寒の世界",Eris:"最も遠い矮小惑星・太陽が極小"};
  ctx.fillText(descs[plName]||"",W/2,38);
  var tod=sunAlt>0.3?"昼":sunAlt>0.05?"朝/夕":sunAlt>-0.08?"薄明":"夜";
  var sdStr=solarDay<1?(solarDay*24).toFixed(1)+"h":solarDay<100?solarDay.toFixed(1)+"日":(solarDay/365.25).toFixed(1)+"年";
  var bearDeg=Math.round(((yawNorm)*360)%360);
  var bearName=bearDeg<23?"N":bearDeg<68?"NE":bearDeg<113?"E":bearDeg<158?"SE":bearDeg<203?"S":bearDeg<248?"SW":bearDeg<293?"W":bearDeg<338?"NW":"N";
  var lng=(lngDeg||0).toFixed(1);
  var latStr=(lat||0).toFixed(1);
  var sunAltDeg=Math.round(Math.asin(Math.max(-1,Math.min(1,sunAlt)))*57.3);
  var fovStr=fov<0.95?" 🔭×"+(1/fov).toFixed(1):fov>1.05?" 🔍×"+fov.toFixed(1):"";
  ctx.fillText(tod+"　重力"+pl.grav+"　太陽日:"+sdStr+"　☀×"+sf.sunSz+fovStr,W/2,52);
  ctx.fillStyle="rgba(180,210,255,0.5)";ctx.font="9px sans-serif";
  ctx.fillText("緯度 "+latStr+"°　経度 "+lng+"°　方位 "+bearDeg+"° "+bearName+"　太陽高度 "+sunAltDeg+"°",W/2,66);
  var _p2=function(n){return n<10?"0"+n:""+n;};var _dms=new Date(946728000000+t*86400000);
  var _utc=_dms.getUTCFullYear()+"/"+_p2(_dms.getUTCMonth()+1)+"/"+_p2(_dms.getUTCDate())+" "+_p2(_dms.getUTCHours())+":"+_p2(_dms.getUTCMinutes())+":"+_p2(_dms.getUTCSeconds())+" UTC";
  ctx.fillStyle="rgba(140,200,255,0.6)";ctx.font="9px monospace";ctx.fillText(_utc,W/2,80);
  if(rot<0){ctx.fillStyle="rgba(255,200,100,0.35)";ctx.font="9px sans-serif";ctx.fillText("※逆行自転: 太陽は西から昇り東に沈む",W/2,94);}
}

export { drawLanding, earthIsLand, getEarthBiome };
