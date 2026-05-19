// @ts-check
import { TAU, TOUR_SEQ, TOUR_HOLD } from "../data/solarData.js";

/**
 * Tour mode HUD: pan/zoom interpolation between bodies, info panel with
 * key facts, progress bar, "next →" preview. Mutates cam during transitions.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {Object} d
 * @param {{active:boolean,idx:number,timer:number,trans:boolean,lv:string,transT?:number,transDur?:number,fromFx?:number,fromFz?:number,fromZm?:number,toFx?:number,toFz?:number,toZm?:number}} d.tr - mutable tour ref
 * @param {{fx:number,fz:number,zm:number}} d.cam - mutable camera
 * @param {number} d.dt
 * @param {Array<{pl:{n:string},wx:number,wz:number}>} d.pd
 * @param {Array<{cm:{key:string},wx:number,wz:number}>} d.cd
 * @param {{names:string[],desc:string[],exam:string[][]}} d.tourData
 * @param {boolean} d.isEn
 * @param {()=>void} d.onTourEnd
 * @param {(nextIdx:number,nextKey:string)=>void} d.onAdvance
 */
function drawTourHUD(ctx,W,H,d){
  var tr=d.tr;if(!tr.active)return;
  var cam=d.cam,dt=d.dt,pd=d.pd,cd=d.cd,tD=d.tourData,en=d.isEn;
  var tBarW=300,tBarX=(W-tBarW)/2,tBarY=H-20;

  if(tr.trans){
    /* Transition phase: smooth pan + zoom out → in */
    tr.transT=Math.min(1,(tr.transT||0)+dt/(tr.transDur||1.8));
    var ease=tr.transT<1?tr.transT*tr.transT*(3-2*tr.transT):1;
    cam.fx=tr.fromFx+(tr.toFx-tr.fromFx)*ease;
    cam.fz=tr.fromFz+(tr.toFz-tr.fromFz)*ease;
    var tdx=tr.toFx-tr.fromFx,tdz=tr.toFz-tr.fromFz,tdist=Math.sqrt(tdx*tdx+tdz*tdz);
    var midZm=tdist>0.5?Math.min(W,H)*0.35/tdist:Math.max(1,Math.min(tr.fromZm,tr.toZm)*0.5);
    midZm=Math.max(1,midZm);
    if(ease<0.5)cam.zm=tr.fromZm+(midZm-tr.fromZm)*(ease*2);
    else cam.zm=midZm+(tr.toZm-midZm)*((ease-0.5)*2);
    if(tr.transT>=1){tr.trans=false;cam.fx=tr.toFx;cam.fz=tr.toFz;cam.zm=tr.toZm;}
    ctx.fillStyle="rgba(8,10,20,0.78)";ctx.fillRect(tBarX-8,tBarY-14,tBarW+16,22);
    ctx.fillStyle="rgba(255,255,255,0.1)";ctx.fillRect(tBarX,tBarY,tBarW,4);
    ctx.fillStyle="rgba(255,160,50,0.85)";ctx.fillRect(tBarX,tBarY,tBarW*ease,4);
    ctx.fillStyle="rgba(255,200,100,0.75)";ctx.font="10px sans-serif";ctx.textAlign="center";
    ctx.fillText("→ "+tD.names[tr.idx]+" ("+(tr.idx+1)+"/"+TOUR_SEQ.length+")",W/2,tBarY-2);
    return;
  }

  /* Hold phase: timer counts toward next body */
  tr.timer+=dt;
  if(tr.timer>=TOUR_HOLD){
    tr.timer=0;
    var nextIdx=(tr.idx+1)%TOUR_SEQ.length;
    if(nextIdx===0){tr.active=false;d.onTourEnd();return;}
    tr.fromFx=cam.fx;tr.fromFz=cam.fz;tr.fromZm=cam.zm;
    var tk=TOUR_SEQ[nextIdx],toTarget=null;
    for(var tfi=0;tfi<pd.length;tfi++)if(pd[tfi].pl.n===tk){toTarget=pd[tfi];break;}
    if(!toTarget)for(var tci=0;tci<cd.length;tci++)if(cd[tci].cm.key===tk){toTarget=cd[tci];break;}
    tr.toFx=toTarget?toTarget.wx:0;tr.toFz=toTarget?toTarget.wz:0;
    tr.toZm=cam.zm;tr.idx=nextIdx;tr.transT=0;tr.transDur=1.8;tr.trans=true;
    d.onAdvance(nextIdx,tk);
  }

  var tProg=tr.timer/TOUR_HOLD,panH=96,exFacts=tD.exam[tr.idx];
  ctx.fillStyle="rgba(8,10,20,0.88)";ctx.fillRect(tBarX-12,tBarY-panH-4,tBarW+24,panH+12);
  ctx.strokeStyle="rgba(100,150,255,0.18)";ctx.lineWidth=1;ctx.strokeRect(tBarX-12,tBarY-panH-4,tBarW+24,panH+12);
  ctx.fillStyle="rgba(255,255,255,0.95)";ctx.font="bold 13px sans-serif";ctx.textAlign="center";
  ctx.fillText(tD.names[tr.idx]+" ("+(tr.idx+1)+"/"+TOUR_SEQ.length+")",W/2,tBarY-panH+12);
  ctx.fillStyle="rgba(255,220,120,0.88)";ctx.font="11px sans-serif";
  ctx.fillText(tD.desc[tr.idx],W/2,tBarY-panH+28);
  ctx.strokeStyle="rgba(255,255,255,0.1)";ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(tBarX,tBarY-panH+35);ctx.lineTo(tBarX+tBarW,tBarY-panH+35);ctx.stroke();
  ctx.fillStyle="rgba(100,220,180,0.85)";ctx.font="9.5px sans-serif";ctx.textAlign="left";
  for(var efi=0;efi<exFacts.length;efi++)ctx.fillText("★ "+exFacts[efi],tBarX+4,tBarY-panH+50+efi*14);
  ctx.fillStyle="rgba(255,255,255,0.12)";ctx.fillRect(tBarX,tBarY-8,tBarW,4);
  ctx.fillStyle="rgba(100,180,255,0.82)";ctx.fillRect(tBarX,tBarY-8,tBarW*tProg,4);
  var nextI=(tr.idx+1)%TOUR_SEQ.length;
  if(nextI>0){
    ctx.fillStyle="rgba(255,255,255,0.38)";ctx.font="8px sans-serif";ctx.textAlign="right";
    ctx.fillText((en?"Next: ":"次: ")+tD.names[nextI],tBarX+tBarW,tBarY-11);
  }
}

export { drawTourHUD };
