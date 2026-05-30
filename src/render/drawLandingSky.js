// @ts-check
import { TAU } from "../data/solarData.js";
import { fillCirc } from "./utils.js";
import { drawStars, drawMeteorShowers } from "./drawLandingStars.js";
import { drawSkyBodies } from "./drawLandingSkyBodies.js";

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {import("./drawLanding.js").LandingSkyState} s
 */
function drawLandingSky(ctx,W,H,s){
  var t=s.t,plName=s.plName,yaw=s.yaw,lat=s.lat,fov=s.fov,lngDeg=s.lngDeg;
  var sf=s.sf,biome=s.biome,latRad=s.latRad;
  var sunAlt=s.sunAlt,sunAz=s.sunAz,aDiffSun=s.aDiffSun,isNight=s.isNight,dayF=s.dayF;
  var hrzY=s.hrzY,rng=s.rng,sTop=s.sTop,sBot=s.sBot;
  var sunScreenX=W/2+aDiffSun*W*0.8/TAU;
  var sunY=hrzY-sunAlt*hrzY*0.75;
  var nightAlpha=Math.max(0.2,1-dayF);

  /* ======== SKY GRADIENT + BIOME TINT ======== */
  var skyG=ctx.createLinearGradient(0,0,0,hrzY);
  skyG.addColorStop(0,"rgba("+sTop+",1)");skyG.addColorStop(1,"rgba("+sBot+",1)");
  ctx.fillStyle=skyG;ctx.fillRect(0,0,W,hrzY);
  if(plName==="Earth"&&dayF>0.05){
    if(biome==="desert"){ctx.globalAlpha=0.13*dayF;ctx.fillStyle="rgba(210,165,75,1)";ctx.fillRect(0,hrzY*0.45,W,hrzY*0.55);ctx.globalAlpha=1;}
    else if(biome==="polar"){ctx.globalAlpha=0.08*dayF;ctx.fillStyle="rgba(185,215,248,1)";ctx.fillRect(0,0,W,hrzY);ctx.globalAlpha=1;}
    else if(biome==="ocean"){ctx.globalAlpha=0.06*dayF;ctx.fillStyle="rgba(30,100,200,1)";ctx.fillRect(0,0,W,hrzY);ctx.globalAlpha=1;}
  }

  /* ======== STARS + METEORS ======== */
  var starA=sf.atm<0.5?0.7:(isNight?0.65:Math.max(0,(0.15-sunAlt)*3));
  drawStars(ctx,W,H,s,starA);
  drawMeteorShowers(ctx,W,H,s,starA);

  /* ======== ECLIPSE DETECTION (used by Sun + Moon rendering) ======== */
  var eclLand=null,eclStrength=0,moonSinAlt=-1;
  if(plName==="Earth"){
    var _sl=(280.46+0.9856*t+36000)%360;
    var _ml=(218.316+13.176396*t+360000)%360;
    var _mp=((_ml-_sl)/360+100)%1;
    var _md2=5.1*Math.sin((_ml-125.04)*0.01745)*0.01745;
    var _lst2=((280.46+360.98565*t+(lngDeg||0))%360+360)%360;
    var _mh=(_lst2-_ml%360)*TAU/360;
    moonSinAlt=Math.sin(latRad)*Math.sin(_md2)+Math.cos(latRad)*Math.cos(_md2)*Math.cos(_mh);
    var inNode=Math.abs(Math.sin(Math.PI*t/173.31))<0.22;
    if(inNode){
      var _ep=Math.min(_mp,1-_mp);if(_ep<0.018){eclLand='solar';eclStrength=1-_ep/0.018;}
      var _elp=Math.abs(_mp-0.5);if(_elp<0.022){eclLand='lunar';eclStrength=1-_elp/0.022;}
    }
  }

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
    if(sunAlt>-0.1&&sunAlt<0.35){
      var ga=Math.max(0,(0.35-Math.abs(sunAlt-0.1))*1.5);
      var hg=ctx.createLinearGradient(0,hrzY-80,0,hrzY);
      hg.addColorStop(0,"rgba(255,130,40,0)");hg.addColorStop(1,"rgba(255,100,30,"+(ga*0.25).toFixed(2)+")");
      ctx.fillStyle=hg;ctx.fillRect(0,hrzY-80,W,80);
    }
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
  drawSkyBodies(ctx,W,H,s,{
    eclLand:eclLand,eclStrength:eclStrength,moonSinAlt:moonSinAlt,
    sunScreenX:sunScreenX,sunY:sunY,sunAz:sunAz,nightAlpha:nightAlpha,
    isNight:isNight,sunAlt:sunAlt
  });

  /* ======== AURORA (Earth: solar-cycle oval; Jupiter: Io-driven, lat>40°) ======== */
  var absLat=Math.abs(lat||0);
  /* Solar cycle ≈11 yr ≈ 4015 days; at maximum the auroral oval reaches lower latitudes (62°→46°). */
  var solAct=0.5+0.5*Math.sin(t*TAU/4015+1.2);
  var auThr=plName==="Jupiter"?40:(62-solAct*16);
  if((plName==="Earth"&&absLat>auThr)||(plName==="Jupiter"&&absLat>40)){
    var auroraStr=(plName==="Jupiter"?1.5:(0.45+solAct*0.55))*Math.max(0,(absLat-auThr)/35);
    auroraStr=Math.min(1,auroraStr)*nightAlpha;
    if(auroraStr>0.02){
      var isJup=plName==="Jupiter";
      var auGl=ctx.createLinearGradient(0,hrzY*0.05,0,hrzY*0.4);
      auGl.addColorStop(0,isJup?"rgba(140,80,220,0)":"rgba(50,220,150,0)");
      auGl.addColorStop(0.5,isJup?"rgba(110,60,200,"+(auroraStr*0.06).toFixed(2)+")":"rgba(70,255,140,"+(auroraStr*0.05).toFixed(2)+")");
      auGl.addColorStop(1,isJup?"rgba(60,30,150,0)":"rgba(40,180,200,0)");
      ctx.fillStyle=auGl;ctx.fillRect(0,hrzY*0.05,W,hrzY*0.4);
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

  /* ======== PLANET-SPECIFIC SKY DYNAMICS (clouds, dust, GRS, rings) ======== */
  if(plName==="Earth"){
    /* Moving clouds */
    ctx.globalAlpha=0.18*dayF;ctx.fillStyle="rgba(255,255,255,1)";
    for(var ci=0;ci<12;ci++){
      var cBaseAng=ci*TAU/12+rng()*TAU/12;
      var cDrift=((cBaseAng+(t/55)*TAU)%TAU+TAU)%TAU;
      var cDiff=((cDrift-yaw)%TAU+TAU)%TAU;if(cDiff>Math.PI)cDiff-=TAU;
      var cx2=W/2+cDiff*W*0.8/TAU,cy2=hrzY*0.15+rng()*hrzY*0.45,cw=25+rng()*55;
      ctx.beginPath();ctx.arc(cx2,cy2,cw*0.5,0,TAU);ctx.arc(cx2+cw*0.3,cy2-5,cw*0.35,0,TAU);ctx.arc(cx2-cw*0.15,cy2+3,cw*0.25,0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;
  }else if(plName==="Venus"){
    for(var vi=0;vi<4;vi++){
      ctx.globalAlpha=0.07+vi*0.025;ctx.fillStyle="rgba("+(170+vi*10)+","+(130+vi*8)+","+(50+vi*5)+",1)";
      ctx.fillRect(0,vi*hrzY*0.2+Math.sin(t*0.15+vi)*3,W,hrzY*0.25);
    }
    if(Math.sin(t*7.3)>0.97){ctx.globalAlpha=0.12;ctx.fillStyle="rgba(255,255,200,1)";ctx.fillRect(0,0,W,hrzY);}
    ctx.globalAlpha=1;
  }else if(plName==="Mars"){
    ctx.globalAlpha=0.1;ctx.fillStyle="rgba(200,150,90,1)";
    for(var di=0;di<50;di++){
      var dBaseAng=rng()*TAU;
      var dDrift=((dBaseAng+(t/25)*TAU)%TAU+TAU)%TAU;
      var dDiff=((dDrift-yaw)%TAU+TAU)%TAU;if(dDiff>Math.PI)dDiff-=TAU;
      var dx=W/2+dDiff*W*0.8/TAU+Math.sin(di*1.7+t*0.6)*40,dy3=rng()*hrzY*0.9;
      var dsz=0.5+rng()*2;ctx.fillRect(dx,dy3,dsz,dsz*0.5);
    }
    ctx.globalAlpha=1;
    if(Math.sin(t*0.3+yaw)>0.85){
      var ddx=(W*0.6+t*2)%W;ctx.globalAlpha=0.06;ctx.fillStyle="rgba(180,130,80,1)";
      ctx.beginPath();ctx.moveTo(ddx-3,hrzY);ctx.lineTo(ddx+1,hrzY*0.5);ctx.lineTo(ddx+5,hrzY);ctx.fill();ctx.globalAlpha=1;
    }
  }else if(plName==="Jupiter"){
    var jCols=["185,150,100","210,170,120","160,120,75","195,160,110","170,130,85"];
    for(var ji=0;ji<5;ji++){
      var jShift=Math.sin(t*0.4+ji*1.5)*8;ctx.fillStyle="rgba("+jCols[ji]+",0.13)";
      ctx.fillRect(jShift,hrzY*0.08+ji*hrzY*0.14,W,hrzY*0.1);
    }
    var grsAng=((0.3*TAU+(t/10)*TAU)%TAU+TAU)%TAU;
    var grsDiff=((grsAng-yaw)%TAU+TAU)%TAU;if(grsDiff>Math.PI)grsDiff-=TAU;
    var grsX=W/2+grsDiff*W*0.8/TAU;
    ctx.globalAlpha=0.15;fillCirc(ctx,grsX,hrzY*0.33,28,"rgba(190,90,50,1)");
    ctx.globalAlpha=0.08;ctx.strokeStyle="rgba(220,120,60,1)";ctx.lineWidth=1;
    ctx.beginPath();for(var gk=0;gk<20;gk++){var ga2=gk*0.32+t*0.8,gr2=8+gk*0.8;ctx.lineTo(grsX+Math.cos(ga2)*gr2,hrzY*0.33+Math.sin(ga2)*gr2*0.6);}ctx.stroke();
    ctx.globalAlpha=1;
    if(Math.sin(t*11+yaw)>0.95){ctx.globalAlpha=0.06;ctx.fillStyle="rgba(200,200,255,1)";ctx.fillRect(0,0,W,hrzY*0.5);ctx.globalAlpha=1;}
  }else if(plName==="Saturn"){
    ctx.globalAlpha=0.25;
    for(var rBand=0;rBand<3;rBand++){
      ctx.strokeStyle=rBand===0?"rgba(200,185,140,1)":rBand===1?"rgba(185,170,125,1)":"rgba(165,150,110,1)";
      ctx.lineWidth=rBand===0?8:rBand===1?12:6;
      ctx.beginPath();
      for(var rk=0;rk<=60;rk++){var ra=rk/60,rpx=ra*W,rpy=hrzY*0.22+Math.sin(ra*3.1416)*hrzY*(0.18+rBand*0.04)+Math.sin(t*0.1+ra*2)*2;if(rk===0)ctx.moveTo(rpx,rpy);else ctx.lineTo(rpx,rpy);}
      ctx.stroke();
    }
    ctx.globalAlpha=0.05;ctx.fillStyle="rgba(0,0,0,1)";ctx.fillRect(0,hrzY*0.45,W,hrzY*0.08);ctx.globalAlpha=1;
  }
}

export { drawLandingSky };
