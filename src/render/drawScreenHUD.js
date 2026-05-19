// @ts-check
import { PL, TAU, DK } from "../data/solarData.js";
import { oR } from "./utils.js";

/**
 * Eclipse alert: label box near the bottom + dashed ring around Earth.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {string} eclipseType - "solar" | "lunar"
 * @param {{x:number,y:number}|null} earthPj
 * @param {number} earthRr
 * @param {boolean} isEn
 */
function drawEclipseAlert(ctx,W,H,eclipseType,earthPj,earthRr,isEn){
  var eTxt=isEn?(eclipseType==="solar"?"🌑 Solar Eclipse":"🌕 Lunar Eclipse"):(eclipseType==="solar"?"🌑 日食":"🌕 月食");
  ctx.save();ctx.font="bold 13px system-ui,sans-serif";ctx.textAlign="center";
  var etW=ctx.measureText(eTxt).width+24;
  ctx.fillStyle="rgba(0,0,0,0.72)";ctx.fillRect(W/2-etW/2,H-72,etW,30);
  ctx.fillStyle=eclipseType==="solar"?"rgba(255,210,80,1)":"rgba(200,150,255,1)";
  ctx.fillText(eTxt,W/2,H-51);
  if(earthPj){
    ctx.strokeStyle=eclipseType==="solar"?"rgba(255,180,0,0.7)":"rgba(180,120,255,0.7)";
    ctx.lineWidth=2;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.arc(earthPj.x,earthPj.y,earthRr+10,0,TAU);ctx.stroke();ctx.setLineDash([]);
  }
  ctx.restore();
}

/**
 * Conjunction (合) or opposition (衝) alert: top-center label when a planet's
 * elongation from Earth approaches 0° or 180°.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {Array<{pl:{j:string,n:string},wx:number,wz:number}>} pd
 * @param {number} earthIdx
 */
function drawConjunctionAlert(ctx,W,pd,earthIdx){
  if(earthIdx<0)return;
  var aex=pd[earthIdx].wx,aez=pd[earthIdx].wz,aeSL=Math.sqrt(aex*aex+aez*aez);
  var msg=null,isOpp=false;
  for(var i=0;i<pd.length;i++){
    if(i===earthIdx)continue;
    var dx=pd[i].wx-aex,dz=pd[i].wz-aez,L=Math.sqrt(dx*dx+dz*dz);
    if(L<0.1||aeSL<0.1)continue;
    var dot=(-aex*dx-aez*dz)/(aeSL*L);
    var deg=Math.acos(Math.max(-1,Math.min(1,dot)))*180/Math.PI;
    if(deg>174&&!isOpp){msg="🌟 "+pd[i].pl.j+"が衝 (Opposition)";isOpp=true;}
    else if(deg<4&&!msg)msg="☀ "+pd[i].pl.j+"が合 (Conjunction)";
  }
  if(!msg)return;
  ctx.save();ctx.font="bold 12px system-ui,sans-serif";ctx.textAlign="center";
  var alW=ctx.measureText(msg).width+24;
  ctx.fillStyle="rgba(0,0,0,0.75)";ctx.fillRect(W/2-alW/2,8,alW,26);
  ctx.fillStyle=isOpp?"rgba(100,210,255,1)":"rgba(255,230,80,1)";
  ctx.fillText(msg,W/2,26);ctx.restore();
}

/**
 * Date readout (top right).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} t
 * @param {string} curDate
 */
function drawDateReadout(ctx,W,t,curDate){
  var days=Math.floor(t),yrs=t/365.25;
  ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="10px sans-serif";ctx.textAlign="right";
  ctx.fillText(curDate+"  ("+(yrs>=1?(yrs.toFixed(1)+"年 / "):"")+days+"日)",W-16,26);
}

/**
 * Realistic-scale bar (bottom right). Only shown in real-distance or universal scale modes.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {number} camZm
 */
function drawScaleBar(ctx,W,H,camZm){
  var bPx=80,bW=bPx/camZm/DK,bx=W-120,by=H-40;
  ctx.strokeStyle="rgba(255,255,255,0.35)";ctx.lineWidth=1;ctx.beginPath();
  ctx.moveTo(bx,by);ctx.lineTo(bx+bPx,by);
  ctx.moveTo(bx,by-4);ctx.lineTo(bx,by+4);
  ctx.moveTo(bx+bPx,by-4);ctx.lineTo(bx+bPx,by+4);ctx.stroke();
  ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="9px sans-serif";ctx.textAlign="center";
  var lbl;
  if(bW>=1e6)lbl=(bW/1e6).toFixed(1)+"億km";
  else if(bW>=1e4)lbl=(bW/1e4).toFixed(bW>=1e5?0:1)+"万km";
  else if(bW>=1)lbl=Math.round(bW).toLocaleString()+"km";
  else lbl=Math.round(bW*1000)+"m";
  ctx.fillText(lbl,bx+bPx/2,by-8);
}

/**
 * Mini-map: top-down planets relative to current focus (bottom right).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {number} t
 * @param {string} fc - focused body name
 * @param {Array<{pl:import("./utils.js").PlanetData}>} pd - planet data array
 */
function drawMiniMap(ctx,W,H,t,fc,pd){
  if(fc==="all")return;
  var mmSz=90,mmX=W-mmSz-55,mmY=H-mmSz-55;
  ctx.fillStyle="rgba(5,5,15,0.75)";ctx.fillRect(mmX-2,mmY-2,mmSz+4,mmSz+4);
  ctx.strokeStyle="rgba(255,255,255,0.15)";ctx.lineWidth=1;ctx.strokeRect(mmX-2,mmY-2,mmSz+4,mmSz+4);
  var mmCx=mmX+mmSz/2,mmCy=mmY+mmSz/2,mmScale=(mmSz*0.45)/oR(PL[7],false,false);
  ctx.fillStyle="rgba(255,200,50,0.8)";ctx.fillRect(mmCx-1.5,mmCy-1.5,3,3);
  for(var mmi=0;mmi<pd.length;mmi++){
    var mmOr=oR(pd[mmi].pl,false,false),mmAng=(t/pd[mmi].pl.p)*TAU;
    var mmPx=mmCx+Math.cos(mmAng)*mmOr*mmScale,mmPy=mmCy+Math.sin(mmAng)*mmOr*mmScale;
    ctx.fillStyle=pd[mmi].pl.c;
    var mmDot=pd[mmi].pl.n===fc?2.5:1.2;
    ctx.fillRect(mmPx-mmDot,mmPy-mmDot,mmDot*2,mmDot*2);
    if(pd[mmi].pl.n===fc){
      ctx.strokeStyle="rgba(255,255,255,0.6)";ctx.lineWidth=0.8;ctx.beginPath();
      ctx.moveTo(mmPx-4,mmPy);ctx.lineTo(mmPx+4,mmPy);
      ctx.moveTo(mmPx,mmPy-4);ctx.lineTo(mmPx,mmPy+4);ctx.stroke();
    }
  }
}

/**
 * FPS counter (bottom left).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} H
 * @param {number} fps
 */
function drawFps(ctx,H,fps){
  ctx.save();
  ctx.fillStyle="rgba(0,0,0,0.65)";ctx.fillRect(4,H-22,60,18);
  ctx.fillStyle=fps>=55?"rgba(100,255,100,0.9)":fps>=30?"rgba(255,220,80,0.9)":"rgba(255,80,80,0.9)";
  ctx.font="10px monospace";ctx.textAlign="left";
  ctx.fillText("FPS: "+fps,8,H-8);
  ctx.restore();
}

export { drawDateReadout, drawScaleBar, drawMiniMap, drawFps, drawEclipseAlert, drawConjunctionAlert };
