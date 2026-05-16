import { TAU, NAMED_STARS, CONST_LINES, MSHW, GMOONS } from "../data/solarData.js";
import { fillCirc, seedR } from "./utils.js";

function drawLandingSky(ctx,W,H,s){
  var t=s.t,plName=s.plName,yaw=s.yaw,lat=s.lat,fov=s.fov,lngDeg=s.lngDeg,constOn=s.constOn;
  var sf=s.sf,biome=s.biome,rot=s.rot,rotAbs=s.rotAbs,latRad=s.latRad;
  var sunAlt=s.sunAlt,sunAz=s.sunAz,aDiffSun=s.aDiffSun,isNight=s.isNight,dayF=s.dayF;
  var hrzY=s.hrzY,rng=s.rng,sTop=s.sTop,sBot=s.sBot;
  var sunScreenX=W/2+aDiffSun*W*0.8/TAU;
  var sunY=hrzY-sunAlt*hrzY*0.75;

  /* ======== SKY ======== */
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

  /* ======== METEOR SHOWERS (Earth landing mode, radiant-based) ======== */
  if(plName==="Earth"&&starA>0.1){
    var dayY=((t%365.25)+365.25)%365.25;
    var shwI=1.0,bestI=0,bestSi=0;
    for(var msi=0;msi<MSHW.length;msi++){var mdiff=Math.min(Math.abs(dayY-MSHW[msi].d),365-Math.abs(dayY-MSHW[msi].d));var si2=Math.exp(-mdiff*mdiff*0.04)*8;shwI+=si2;if(si2>bestI){bestI=si2;bestSi=msi;}}
    var radX=W/2,radY=hrzY*0.4,hasRadiant=false,radSinAlt=0;
    if(bestI>0.5&&MSHW[bestSi].raD!==undefined){
      var lstD3=((280.46+360.98565*t+(lngDeg||0))%360+360)%360;
      var radHA=(lstD3-MSHW[bestSi].raD)*TAU/360;
      var radDec=MSHW[bestSi].decD*TAU/360;
      radSinAlt=Math.sin(latRad)*Math.sin(radDec)+Math.cos(latRad)*Math.cos(radDec)*Math.cos(radHA);
      if(radSinAlt>-0.1){
        var radAz=Math.atan2(-Math.sin(radHA)*Math.cos(radDec),Math.sin(radDec)*Math.cos(latRad)-Math.cos(radDec)*Math.sin(latRad)*Math.cos(radHA));
        var radADiff=((radAz-yaw)%TAU+TAU)%TAU;if(radADiff>Math.PI)radADiff-=TAU;
        radX=W/2+radADiff*W*0.8/TAU;
        radY=hrzY-radSinAlt*hrzY*0.88;
        hasRadiant=true;
      }
    }
    var nMet=Math.min(20,Math.floor(shwI*1.5));
    var metDur=0.004;ctx.lineWidth=1.2;
    for(var mii=0;mii<nMet;mii++){
      var mPer=metDur*(1+mii*0.65);
      var mSlotT=(t%mPer)/mPer;if(mSlotT>0.45)continue;
      var mSeed=Math.floor(t/mPer)*97+mii*53;
      var mr=seedR(mSeed);
      var mProgress=mSlotT/0.45;
      var mAng,mSX,mSY;
      if(hasRadiant&&radSinAlt>-0.05){
        mAng=mr()*TAU;
        var mr0=15+mr()*70;
        mSX=radX+Math.cos(mAng)*mr0;mSY=radY+Math.sin(mAng)*mr0;
      }else{
        mSX=mr()*W;mSY=mr()*hrzY*0.72;
        mAng=Math.PI*0.4+mr()*Math.PI*0.2;
      }
      var mLen=25+mr()*55;
      var mDX=Math.cos(mAng)*mLen*mProgress,mDY=Math.sin(mAng)*mLen*mProgress;
      var mAlpha=(1-mProgress)*starA*(0.5+mr()*0.5);
      if(mAlpha<0.05)continue;
      var mGrad=ctx.createLinearGradient(mSX,mSY,mSX+mDX,mSY+mDY);
      mGrad.addColorStop(0,"rgba(255,255,255,0)");
      mGrad.addColorStop(1,"rgba(255,255,255,"+mAlpha.toFixed(2)+")");
      ctx.strokeStyle=mGrad;ctx.beginPath();ctx.moveTo(mSX,mSY);ctx.lineTo(mSX+mDX,mSY+mDY);ctx.stroke();
    }
    if(bestI>3){
      var rateStr=MSHW[bestSi].rate?" (ZHR ~"+MSHW[bestSi].rate+")":"";
      ctx.fillStyle="rgba(200,220,255,"+(Math.min(0.7,bestI*0.07)).toFixed(2)+")";ctx.font="9px sans-serif";ctx.textAlign="center";
      ctx.fillText("🌠 "+MSHW[bestSi].n+"流星群"+rateStr,W/2,16);
      if(hasRadiant&&radSinAlt>0.05){
        ctx.strokeStyle="rgba(200,220,255,"+(Math.min(0.5,bestI*0.06)).toFixed(2)+")";ctx.lineWidth=0.8;
        ctx.beginPath();ctx.moveTo(radX-6,radY);ctx.lineTo(radX+6,radY);ctx.moveTo(radX,radY-6);ctx.lineTo(radX,radY+6);ctx.stroke();
      }
    }
  }

  /* Eclipse detection must precede sun section which uses eclLand/moonSinAlt */
  var eclLand=null,eclStrength=0,moonSinAlt=-1;
  if(plName==="Earth"){var _sl=(280.46+0.9856*t+36000)%360,_ml=(218.316+13.176396*t+360000)%360,_mp=((_ml-_sl)/360+100)%1;var _md2=5.1*Math.sin((_ml-125.04)*0.01745)*0.01745,_lst2=((280.46+360.98565*t+(lngDeg||0))%360+360)%360,_mh=(_lst2-_ml%360)*TAU/360;moonSinAlt=Math.sin(latRad)*Math.sin(_md2)+Math.cos(latRad)*Math.cos(_md2)*Math.cos(_mh);var inNode=Math.abs(Math.sin(Math.PI*t/173.31))<0.22;if(inNode){var _ep=Math.min(_mp,1-_mp);if(_ep<0.018){eclLand='solar';eclStrength=1-_ep/0.018;}var _elp=Math.abs(_mp-0.5);if(_elp<0.022){eclLand='lunar';eclStrength=1-_elp/0.022;}}}

  /* ======== SUN ======== */
  if(sunAlt>-0.2&&sunY<hrzY+30&&Math.abs(aDiffSun)<TAU*0.32){
    var sunR=Math.max(2,14*Math.sqrt(sf.sunSz)/fov);
    var sunCol=sf.starTint?"rgba("+sf.starTint+",1)":"rgba(255,245,220,1)";
    var glR=sunR*10;var sg=ctx.createRadialGradient(sunScreenX,sunY,sunR,sunScreenX,sunY,glR);
    if(sf.starTint){sg.addColorStop(0,"rgba("+sf.starTint+",0.3)");sg.addColorStop(0.3,"rgba("+sf.starTint+",0.07)");sg.addColorStop(1,"rgba("+sf.starTint+",0)");}
    else{sg.addColorStop(0,"rgba(255,240,200,0.25)");sg.addColorStop(0.3,"rgba(255,200,100,0.06)");sg.addColorStop(1,"rgba(255,180,80,0)");}
    ctx.fillStyle=sg;ctx.fillRect(sunScreenX-glR,sunY-glR,glR*2,glR*2);
    ctx.globalAlpha=plName==="Venus"?0.25:1;
    fillCirc(ctx,sunScreenX,sunY,sunR,sunCol);ctx.globalAlpha=1;
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

  /* ======== SATURN NORTH POLAR HEXAGON STORM ======== */
  if(plName==="Saturn"&&(lat||0)>60){
    var hexStr=Math.min(1,((lat||0)-60)/20);var hexY=hrzY*0.28;var hexR=Math.min(W*0.38,H*0.45);
    ctx.save();ctx.globalAlpha=hexStr*0.65*(0.3+dayF*0.7);
    var hexBgG=ctx.createRadialGradient(W/2,hexY,hexR*0.2,W/2,hexY,hexR*1.2);
    hexBgG.addColorStop(0,"rgba(160,90,40,0.18)");hexBgG.addColorStop(0.7,"rgba(140,80,30,0.08)");hexBgG.addColorStop(1,"rgba(140,80,30,0)");
    ctx.fillStyle=hexBgG;ctx.fillRect(0,0,W,hrzY);
    ctx.strokeStyle="rgba(200,130,60,0.85)";ctx.lineWidth=Math.max(2,hexR*0.018);
    ctx.beginPath();for(var hi=0;hi<6;hi++){var ha=hi/6*TAU-Math.PI/6;var hx=W/2+Math.cos(ha)*hexR,hy=hexY+Math.sin(ha)*hexR*0.38;if(hi===0)ctx.moveTo(hx,hy);else ctx.lineTo(hx,hy);}ctx.closePath();ctx.stroke();
    ctx.strokeStyle="rgba(180,110,50,0.6)";ctx.lineWidth=Math.max(1,hexR*0.012);
    ctx.beginPath();ctx.arc(W/2,hexY,hexR*0.18,0,TAU);ctx.stroke();
    ctx.lineWidth=Math.max(0.8,hexR*0.008);ctx.strokeStyle="rgba(220,150,70,0.4)";
    for(var sa2=0;sa2<3;sa2++){ctx.beginPath();for(var sp2=0;sp2<=16;sp2++){var st2=sp2/16,sr3=hexR*(0.04+st2*0.15),sa3=sa2*TAU/3+st2*TAU*0.7+t*0.1;ctx.lineTo(W/2+Math.cos(sa3)*sr3,hexY+Math.sin(sa3)*sr3*0.38);}ctx.stroke();}
    ctx.globalAlpha=hexStr*0.8;ctx.fillStyle="rgba(230,160,80,0.9)";ctx.font="10px system-ui,sans-serif";ctx.textAlign="center";
    ctx.fillText("🌩 北極六角形嵐",W/2,hrzY*0.06);
    ctx.restore();
  }

  /* ======== ZODIACAL LIGHT (Earth only, twilight) ======== */
  if(plName==="Earth"&&sunAlt<-0.05&&sunAlt>-0.38){
    var zlStr=Math.max(0,(0.35-Math.abs(sunAlt+0.1))/0.35)*(1-dayF)*0.55;
    if(zlStr>0.01&&Math.abs(aDiffSun)<TAU*0.32){
      ctx.save();
      var zlSY=hrzY,zlW=W*0.14+W*0.06*(1-Math.abs(aDiffSun)/(TAU*0.32));
      var zlGr=ctx.createLinearGradient(sunScreenX,zlSY,sunScreenX,0);
      zlGr.addColorStop(0,"rgba(255,240,200,"+(zlStr*0.55).toFixed(2)+")");
      zlGr.addColorStop(0.25,"rgba(255,220,160,"+(zlStr*0.22).toFixed(2)+")");
      zlGr.addColorStop(0.6,"rgba(255,210,130,"+(zlStr*0.07).toFixed(2)+")");
      zlGr.addColorStop(1,"rgba(255,200,100,0)");
      ctx.beginPath();ctx.moveTo(sunScreenX,zlSY);ctx.lineTo(sunScreenX-zlW,0);ctx.lineTo(sunScreenX+zlW,0);ctx.closePath();
      ctx.fillStyle=zlGr;ctx.fill();
      ctx.restore();
    }
  }
  /* ======== GEGENSCHEIN (Earth only, deep night, antisun direction) ======== */
  if(plName==="Earth"&&isNight&&sunAlt<-0.28&&starA>0.3){
    var gsStr=Math.max(0,(-0.28-sunAlt)*0.7)*starA*0.3;
    if(gsStr>0.01){
      var antiAz_=(sunAz+Math.PI)%TAU;
      var antiDiff_=((antiAz_-yaw)%TAU+TAU)%TAU;if(antiDiff_>Math.PI)antiDiff_-=TAU;
      if(Math.abs(antiDiff_)<TAU*0.32){
        var gX_=W/2+antiDiff_*W*0.8/TAU,gY_=hrzY*0.38;
        var gsGr=ctx.createRadialGradient(gX_,gY_,0,gX_,gY_,W*0.09);
        gsGr.addColorStop(0,"rgba(255,255,220,"+gsStr.toFixed(2)+")");
        gsGr.addColorStop(0.5,"rgba(255,255,200,"+(gsStr*0.4).toFixed(2)+")");
        gsGr.addColorStop(1,"rgba(255,255,180,0)");
        ctx.fillStyle=gsGr;ctx.fillRect(gX_-W*0.09,gY_-W*0.09,W*0.18,W*0.18);
        ctx.fillStyle="rgba(220,230,255,"+(gsStr*0.5).toFixed(2)+")";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("対日照",gX_,gY_-W*0.06);
      }
    }
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
  }else if(plName==="Io"||plName==="Europa"||plName==="Ganymede"||plName==="Callisto"){
    /* Jupiter dominates the sky — tidally locked (sub-Jovian point = lat:0 lng:0) */
    var jupLngR=((lngDeg||0)+540)%360-180;jupLngR=jupLngR*0.01745;
    var jupLatR=(lat||0)*0.01745;
    var subJovCos=Math.cos(jupLatR)*Math.cos(jupLngR);
    if(subJovCos>-0.05){
      var jupAlt=Math.asin(Math.max(-1,Math.min(1,subJovCos)));
      var jupAz=Math.atan2(Math.sin(jupLngR),-Math.sin(jupLatR)*Math.cos(jupLngR));
      var jupADiff=((jupAz-yaw)%TAU+TAU)%TAU;if(jupADiff>Math.PI)jupADiff-=TAU;
      if(Math.abs(jupADiff)<TAU*0.4){
        var jupX=W/2+jupADiff*W*0.8/TAU;
        var jupY=hrzY-(jupAlt/(Math.PI*0.5))*hrzY*0.85;
        /* angular radius: Io=0.168 Europa=0.106 Ganymede=0.067 Callisto=0.038 rad */
        var jupAngR=plName==="Io"?0.168:plName==="Europa"?0.106:plName==="Ganymede"?0.067:0.038;
        var jupRad=Math.max(3,jupAngR*W*0.8/TAU/fov);
        /* glow */
        var jg=ctx.createRadialGradient(jupX,jupY,jupRad,jupX,jupY,jupRad*2.4);
        jg.addColorStop(0,"rgba(210,170,100,0.18)");jg.addColorStop(1,"rgba(210,170,100,0)");
        ctx.fillStyle=jg;ctx.fillRect(jupX-jupRad*3,jupY-jupRad*3,jupRad*6,jupRad*6);
        ctx.save();ctx.beginPath();ctx.arc(jupX,jupY,jupRad,0,TAU);ctx.clip();
        /* base color */
        ctx.fillStyle="rgba(205,175,115,1)";ctx.fillRect(jupX-jupRad,jupY-jupRad,jupRad*2,jupRad*2);
        /* cloud bands */
        var jupBands=[{y:-0.55,h:0.18,c:"rgba(175,120,70,0.8)"},{y:-0.25,h:0.14,c:"rgba(155,105,60,0.7)"},{y:0.05,h:0.20,c:"rgba(185,130,80,0.75)"},{y:0.38,h:0.15,c:"rgba(160,110,65,0.65)"}];
        for(var jbi=0;jbi<jupBands.length;jbi++){var jb=jupBands[jbi];ctx.fillStyle=jb.c;ctx.fillRect(jupX-jupRad,jupY+jb.y*jupRad,jupRad*2,jb.h*jupRad);}
        /* Great Red Spot (small oval) */
        ctx.fillStyle="rgba(180,80,55,0.7)";ctx.beginPath();ctx.ellipse(jupX-jupRad*0.2,jupY+jupRad*0.12,jupRad*0.22,jupRad*0.10,0,0,TAU);ctx.fill();
        ctx.restore();
        if(jupY<hrzY-2&&jupRad>5){ctx.fillStyle="rgba(220,185,130,0.6)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("木星",jupX,jupY-jupRad-4);}
      }
    }
  }else if(plName==="Titan"){
    /* Saturn with rings visible through orange haze (tidally locked, sub-Saturnian at lng:0) */
    var satLngR=((lngDeg||0)+540)%360-180;satLngR=satLngR*0.01745;
    var satLatR=(lat||0)*0.01745;
    var subSatCos=Math.cos(satLatR)*Math.cos(satLngR);
    if(subSatCos>-0.05){
      var satAlt=Math.asin(Math.max(-1,Math.min(1,subSatCos)));
      var satAz=Math.atan2(Math.sin(satLngR),-Math.sin(satLatR)*Math.cos(satLngR));
      var satADiff=((satAz-yaw)%TAU+TAU)%TAU;if(satADiff>Math.PI)satADiff-=TAU;
      if(Math.abs(satADiff)<TAU*0.4){
        var satX=W/2+satADiff*W*0.8/TAU;
        var satY=hrzY-(satAlt/(Math.PI*0.5))*hrzY*0.85;
        var satAngR=0.049;/* atan(60268/1222000) */
        var satRad=Math.max(2,satAngR*W*0.8/TAU/fov);
        ctx.save();ctx.globalAlpha=0.55;/* dimmed by thick haze */
        /* ring (ellipse) behind */
        ctx.strokeStyle="rgba(200,178,120,0.6)";ctx.lineWidth=satRad*0.35;
        ctx.beginPath();ctx.ellipse(satX,satY,satRad*2.2,satRad*0.55,0,0,TAU);ctx.stroke();
        /* planet disk */
        ctx.beginPath();ctx.arc(satX,satY,satRad,0,TAU);ctx.clip();
        ctx.fillStyle="rgba(215,195,148,1)";ctx.fillRect(satX-satRad,satY-satRad,satRad*2,satRad*2);
        ctx.fillStyle="rgba(185,160,110,0.6)";ctx.fillRect(satX-satRad,satY+satRad*0.1,satRad*2,satRad*0.25);
        ctx.restore();
        ctx.globalAlpha=0.55;
        /* ring front (draw over planet) */
        ctx.strokeStyle="rgba(200,178,120,0.5)";ctx.lineWidth=satRad*0.28;
        ctx.beginPath();ctx.ellipse(satX,satY+satRad*0.12,satRad*2.2,satRad*0.55,0,Math.PI,0,false);ctx.stroke();
        ctx.globalAlpha=1;
        if(satY<hrzY-2&&satRad>3){ctx.fillStyle="rgba(220,195,148,0.5)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("土星",satX,satY-satRad-4);}
      }
    }
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
    /* Galilean moons in equatorial plane (dec≈0): alt/az from observer lat+lng */
    var gmLST=(t/rotAbs+(lngDeg||0)/360)*TAU*sunDir;
    var cosLat=Math.cos(latRad),sinLat=Math.sin(latRad);
    for(var gmi=0;gmi<GMOONS.length;gmi++){var gm=GMOONS[gmi];
      var gmHA=gmLST-(t/gm.p)*TAU;
      var cosHA=Math.cos(gmHA),sinHA=Math.sin(gmHA);
      var gmSinAlt=cosLat*cosHA;
      if(gmSinAlt<-0.05)continue;
      var gmAz2=Math.atan2(-sinHA,-sinLat*cosHA);
      var gmAzDiff=((gmAz2-yaw)%TAU+TAU)%TAU;if(gmAzDiff>Math.PI)gmAzDiff-=TAU;
      var gmScrX=W/2+gmAzDiff*W*0.8/TAU;
      var gmScrY=hrzY-gmSinAlt*hrzY*0.88;
      if(gmScrX<-50||gmScrX>W+50||gmScrY<2)continue;
      var gmSz=gm.sz/fov;
      ctx.globalAlpha=0.85;fillCirc(ctx,gmScrX,gmScrY,gmSz,gm.col);
      if(gmSz>2.5){ctx.fillStyle="rgba(255,255,255,0.25)";ctx.font="7px sans-serif";ctx.textAlign="center";ctx.fillText(gm.name,gmScrX,gmScrY-gmSz-3);}
      ctx.globalAlpha=1;}
  }else if(plName==="Saturn"){
    /* Titan - visible as bright dot */
    var tiAng=(t/15.945)*TAU,tiX=(W*0.4+Math.cos(tiAng+yaw)*W*0.2),tiY=hrzY*0.35;
    ctx.globalAlpha=0.6;fillCirc(ctx,tiX,tiY,2.5/fov,"rgba(200,180,120,1)");ctx.globalAlpha=1;
  }else if(plName==="Moon"){
    /* Earth in lunar sky — tidally locked + optical libration (Earth gently sways) */
    var libL=7.9*Math.sin(t*2*Math.PI/27.55);/* longitudinal libration ±7.9° */
    var libB=6.7*Math.sin(t*2*Math.PI/27.21);/* latitudinal libration ±6.7° */
    var lngRadE=(((lngDeg||0)-libL+540)%360-180)*0.01745;
    var latRadEff=((lat||0)-libB)*0.01745;
    var subEarthCos=Math.cos(latRadEff)*Math.cos(lngRadE);
    if(subEarthCos>0.02){
      var earthAlt=Math.asin(Math.max(-1,Math.min(1,subEarthCos)));
      var earthAz=Math.atan2(Math.sin(lngRadE),-Math.sin(latRadEff)*Math.cos(lngRadE));
      var earthADiff=((earthAz-yaw)%TAU+TAU)%TAU;if(earthADiff>Math.PI)earthADiff-=TAU;
      if(Math.abs(earthADiff)<TAU*0.32){
        var earthX=W/2+earthADiff*W*0.8/TAU;
        var earthY=hrzY-(earthAlt/(Math.PI*0.5))*hrzY*0.85;
        var earthRad=Math.max(10,22/fov);/* Earth appears ~4x larger than Moon from Earth */
        var sunLngM=(280.46+0.9856*t+36000)%360;
        var moonLngM=(218.316+13.176396*t+360000)%360;
        var moonPhFromE=((moonLngM-sunLngM)/360+100)%1;
        var earthPh=(moonPhFromE+0.5)%1;/* Earth phase = opposite of Moon-from-Earth */
        var dxSunE=sunScreenX-earthX,dySunE=sunY-earthY;
        var toSunE=Math.atan2(dxSunE,-dySunE);
        var earthTilt=earthPh<0.5?toSunE-Math.PI/2:toSunE+Math.PI/2;
        ctx.save();
        /* Earthshine glow / blue limb */
        var egGlow=ctx.createRadialGradient(earthX,earthY,earthRad*0.95,earthX,earthY,earthRad*2.4);
        egGlow.addColorStop(0,"rgba(140,200,255,0.25)");egGlow.addColorStop(1,"rgba(120,180,255,0)");
        ctx.fillStyle=egGlow;ctx.fillRect(earthX-earthRad*3,earthY-earthRad*3,earthRad*6,earthRad*6);
        ctx.translate(earthX,earthY);ctx.rotate(earthTilt);
        ctx.beginPath();ctx.arc(0,0,earthRad,0,TAU);ctx.clip();
        /* Dark side (night Earth with faint city lights tint) */
        ctx.fillStyle="rgba(8,12,28,1)";ctx.fillRect(-earthRad,-earthRad,earthRad*2,earthRad*2);
        /* Lit hemisphere */
        if(earthPh>0.02&&earthPh<0.98){
          var ekx=earthRad*Math.cos(earthPh*TAU);
          ctx.fillStyle="rgba(55,100,180,1)";/* ocean blue base */
          ctx.beginPath();
          if(earthPh<0.5){
            ctx.arc(0,0,earthRad,-Math.PI/2,Math.PI/2,false);
            ctx.bezierCurveTo(ekx,earthRad,ekx,-earthRad,0,-earthRad);
          }else{
            ctx.arc(0,0,earthRad,-Math.PI/2,Math.PI/2,true);
            ctx.bezierCurveTo(-ekx,earthRad,-ekx,-earthRad,0,-earthRad);
          }
          ctx.fill();
          /* Continents (rough Africa/Eurasia/Americas hint) — only on lit side */
          ctx.globalAlpha=0.85;ctx.fillStyle="rgba(95,135,60,1)";
          var contShift=earthPh<0.5?earthRad*0.15:-earthRad*0.15;
          ctx.beginPath();ctx.ellipse(contShift,-earthRad*0.05,earthRad*0.38,earthRad*0.48,0.2,0,TAU);ctx.fill();
          ctx.fillStyle="rgba(180,150,90,1)";
          ctx.beginPath();ctx.ellipse(contShift-earthRad*0.1,earthRad*0.25,earthRad*0.22,earthRad*0.18,0.3,0,TAU);ctx.fill();
          /* Cloud bands */
          ctx.globalAlpha=0.55;ctx.fillStyle="rgba(255,255,255,1)";
          ctx.beginPath();ctx.ellipse(contShift+earthRad*0.2,-earthRad*0.45,earthRad*0.45,earthRad*0.14,0.15,0,TAU);ctx.fill();
          ctx.beginPath();ctx.ellipse(contShift-earthRad*0.05,earthRad*0.4,earthRad*0.4,earthRad*0.12,-0.1,0,TAU);ctx.fill();
          /* Polar ice caps */
          ctx.globalAlpha=0.7;ctx.fillStyle="rgba(245,250,255,1)";
          ctx.beginPath();ctx.ellipse(0,-earthRad*0.88,earthRad*0.55,earthRad*0.15,0,0,TAU);ctx.fill();
          ctx.beginPath();ctx.ellipse(0,earthRad*0.88,earthRad*0.45,earthRad*0.13,0,0,TAU);ctx.fill();
          /* Atmospheric limb (blue scattering on day side edge) */
          ctx.globalAlpha=0.55;
          var lgmEdge=ctx.createRadialGradient(0,0,earthRad*0.85,0,0,earthRad);
          lgmEdge.addColorStop(0,"rgba(120,180,255,0)");lgmEdge.addColorStop(0.85,"rgba(140,200,255,0.3)");lgmEdge.addColorStop(1,"rgba(180,220,255,0.8)");
          ctx.fillStyle=lgmEdge;ctx.fillRect(-earthRad,-earthRad,earthRad*2,earthRad*2);
          ctx.globalAlpha=1;
        }
        /* Faint city lights on night side */
        if(earthPh<0.85){
          ctx.globalAlpha=0.5;ctx.fillStyle="rgba(255,220,140,1)";
          for(var clI=0;clI<8;clI++){var cla=(clI*0.785+t*0.05)%TAU,clr=earthRad*(0.4+clI*0.05),clx2=Math.cos(cla)*clr,cly2=Math.sin(cla)*clr*0.7;
            if((earthPh<0.5&&clx2>0)||(earthPh>0.5&&clx2<0))continue;/* only night side */
            ctx.fillRect(clx2,cly2,0.8,0.8);}
          ctx.globalAlpha=1;
        }
        ctx.restore();
        /* Label */
        ctx.fillStyle="rgba(180,210,255,0.85)";ctx.font="bold 10px sans-serif";ctx.textAlign="center";
        var earthPhName;
        if(earthPh<0.04||earthPh>0.96)earthPhName="新地球";
        else if(earthPh<0.46)earthPhName="三日地球";
        else if(earthPh<0.54)earthPhName="満地球 🌍";
        else if(earthPh<0.96)earthPhName="半地球";
        ctx.fillText(earthPhName,earthX,earthY+earthRad+14);
        ctx.fillStyle="rgba(140,180,230,0.55)";ctx.font="8px sans-serif";
        ctx.fillText("輝面比 "+(Math.round((1-Math.cos(earthPh*TAU))/2*100))+"%",earthX,earthY+earthRad+25);
      }
    }
    /* Apollo landing sites label (when looking at appropriate region) */
    if(Math.abs(latRad)<0.5&&((lngDeg||0)>-50&&(lngDeg||0)<50)){
      ctx.fillStyle="rgba(255,200,100,0.4)";ctx.font="8px sans-serif";ctx.textAlign="left";
      ctx.fillText("🏴 Apollo 着陸候補域",10,hrzY-6);
    }
  }

  /* ======== AURORA (Earth lat>55°, Jupiter lat>45°) - dynamic curtain ======== */
  var absLat=Math.abs(lat||0);
  if((plName==="Earth"&&absLat>55)||(plName==="Jupiter"&&absLat>40)){
    var auroraStr=(plName==="Jupiter"?1.5:1)*Math.max(0,(absLat-(plName==="Jupiter"?40:55))/35);
    auroraStr=Math.min(1,auroraStr)*nightAlpha;
    if(auroraStr>0.02){
      var isJup=plName==="Jupiter";
      /* Horizon glow */
      var auGl=ctx.createLinearGradient(0,hrzY*0.05,0,hrzY*0.4);
      auGl.addColorStop(0,isJup?"rgba(140,80,220,0)":"rgba(50,220,150,0)");
      auGl.addColorStop(0.5,isJup?"rgba(110,60,200,"+(auroraStr*0.06).toFixed(2)+")":"rgba(70,255,140,"+(auroraStr*0.05).toFixed(2)+")");
      auGl.addColorStop(1,isJup?"rgba(60,30,150,0)":"rgba(40,180,200,0)");
      ctx.fillStyle=auGl;ctx.fillRect(0,hrzY*0.05,W,hrzY*0.4);
      /* Curtain rays - 24 narrow bands */
      for(var ai=0;ai<24;ai++){
        var arSh=Math.sin(ai*1.7+t*1.5)*0.5+0.5;
        var ax=(ai/24)*W+Math.sin(ai*0.7+t*0.5)*W*0.03;
        var aH=hrzY*0.25*(0.65+arSh*0.5),ay=hrzY*0.05+Math.sin(ai*0.9+t*0.4)*hrzY*0.06;
        var aw=W*0.045+arSh*W*0.015;
        var aG=ctx.createLinearGradient(ax,ay,ax,ay+aH);
        if(isJup){
          aG.addColorStop(0,"rgba(140,80,230,0)");aG.addColorStop(0.4,"rgba("+Math.floor(110+arSh*30)+",60,210,"+(auroraStr*0.18*arSh).toFixed(2)+")");aG.addColorStop(0.8,"rgba(80,40,180,"+(auroraStr*0.10*arSh).toFixed(2)+")");aG.addColorStop(1,"rgba(50,20,120,0)");
        }else{
          var auGB=Math.floor(140+arSh*100);
          aG.addColorStop(0,"rgba(60,255,"+auGB+",0)");aG.addColorStop(0.35,"rgba("+Math.floor(40+arSh*40)+",255,"+auGB+","+(auroraStr*0.14*arSh).toFixed(2)+")");aG.addColorStop(0.7,"rgba(60,180,200,"+(auroraStr*0.08*arSh).toFixed(2)+")");aG.addColorStop(1,"rgba(120,60,210,0)");
        }
        ctx.fillStyle=aG;ctx.fillRect(ax-aw*0.5,ay,aw,aH);
      }
      /* Bright vertical sparkle rays */
      if(absLat>60||isJup){
        ctx.globalAlpha=auroraStr*0.4;ctx.lineWidth=1.2;
        ctx.strokeStyle=isJup?"rgba(200,140,255,0.55)":"rgba(180,255,200,0.6)";
        for(var rri=0;rri<10;rri++){
          var rrx=W*((rri*0.137+t*0.005)%1)+Math.sin(rri*1.3+t*0.7)*30;
          var rrY1=hrzY*0.06+Math.sin(rri*0.5+t)*hrzY*0.02;
          var rrY2=rrY1+hrzY*0.22*(0.6+Math.sin(rri*1.7+t*0.5)*0.4);
          ctx.beginPath();ctx.moveTo(rrx,rrY1);ctx.lineTo(rrx,rrY2);ctx.stroke();
        }
        ctx.globalAlpha=1;
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
}

export { drawLandingSky };
