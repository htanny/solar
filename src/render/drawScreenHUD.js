// @ts-check
import { PL, TAU, DK } from "../data/solarData.js";
import { oR } from "./utils.js";

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

export { drawDateReadout, drawScaleBar, drawMiniMap, drawFps };
