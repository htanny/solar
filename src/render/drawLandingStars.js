// @ts-check
import { TAU, NAMED_STARS, CONST_LINES, MSHW } from "../data/solarData.js";
import { fillCirc, seedR } from "./utils.js";

/**
 * Random background stars, named bright stars, and constellation lines.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {import("./drawLanding.js").LandingSkyState} s
 * @param {number} starA - overall star alpha (0..1)
 */
function drawStars(ctx,W,H,s,starA){
  var t=s.t,yaw=s.yaw,lngDeg=s.lngDeg,constOn=s.constOn,latRad=s.latRad,hrzY=s.hrzY;
  if(starA<=0.01)return;

  /* ======== RANDOM BACKGROUND STARS ======== */
  var sr2=seedR(42);
  for(var si=0;si<250;si++){
    var sx2=(sr2()*W*4+yaw*100)%W,sy2=sr2()*hrzY*0.92;
    var sb=0.3+sr2()*0.7;
    ctx.fillStyle="rgba(255,255,255,"+(sb*starA).toFixed(2)+")";
    var ss=sr2()<0.03?1.5:0.7;
    ctx.fillRect(sx2,sy2,ss,ss);
  }

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
    var lstD2=((280.46+360.98565*t+(lngDeg||0))%360+360)%360;
    ctx.save();ctx.lineWidth=0.6;
    for(var cli=0;cli<CONST_LINES.length;cli++){
      var cl=CONST_LINES[cli];
      var clSx=[],clSy=[],clVis=[];
      for(var csi=0;csi<cl.s.length;csi++){
        var csHr=(lstD2-cl.s[csi][0])*TAU/360,csDecR=cl.s[csi][1]*TAU/360;
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
      var cxSum=0,cySum=0,cCount=0;
      for(var cvi=0;cvi<clVis.length;cvi++){if(clVis[cvi]){cxSum+=clSx[cvi];cySum+=clSy[cvi];cCount++;}}
      if(cCount>0){ctx.fillStyle="rgba(130,180,255,"+(starA*0.5).toFixed(2)+")";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(cl.n,cxSum/cCount,cySum/cCount-8);}
    }
    ctx.restore();
  }
}

/**
 * Meteor showers (Earth landing mode only).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {import("./drawLanding.js").LandingSkyState} s
 * @param {number} starA
 */
function drawMeteorShowers(ctx,W,H,s,starA){
  if(s.plName!=="Earth"||starA<=0.1)return;
  var t=s.t,yaw=s.yaw,lngDeg=s.lngDeg,latRad=s.latRad,hrzY=s.hrzY;
  var dayY=((t%365.25)+365.25)%365.25;
  var shwI=1.0,bestI=0,bestSi=0;
  for(var msi=0;msi<MSHW.length;msi++){
    var mdiff=Math.min(Math.abs(dayY-MSHW[msi].d),365-Math.abs(dayY-MSHW[msi].d));
    var si2=Math.exp(-mdiff*mdiff*0.04)*8;
    shwI+=si2;if(si2>bestI){bestI=si2;bestSi=msi;}
  }
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

export { drawStars, drawMeteorShowers };
