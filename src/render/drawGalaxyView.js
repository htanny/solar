// @ts-check
import { fillCirc } from "./utils.js";
import { GAL, GAL_COLS, NEAR_STARS, SUN_GAL_R, SUN_GAL_ANG } from "./drawBodies.js";

/**
 * Galaxy-scale rendering: dust lanes, bulge glow, bulge/arm stars, nearby named stars,
 * Sun marker at origin and a small Sgr A* label. Run inside the centered translate
 * (already applied by caller).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {{rx:number,ry:number,zm:number,fx:number,fy:number,fz:number}} cam
 * @param {number} galFade - alpha multiplier (0..1)
 */
function drawGalaxyView(ctx,W,H,cam,galFade){
  if(galFade<=0)return;
  var galScale=Math.max(cam.zm*30000,W*0.006);
  var sunGX=SUN_GAL_R*Math.cos(SUN_GAL_ANG),sunGZ=SUN_GAL_R*Math.sin(SUN_GAL_ANG);
  var crx=cam.rx,cry=cam.ry;
  var cryC=Math.cos(cry),cryS=Math.sin(cry),crxC=Math.cos(crx),crxS=Math.sin(crx);
  function galPj(gx,gy,gz){
    var dx=gx-sunGX,dy=gy,dz=gz-sunGZ;
    var rx=dx*cryC+dz*cryS,rz=-dx*cryS+dz*cryC;
    var ry=dy*crxC-rz*crxS,rz2=dy*crxS+rz*crxC;
    return{x:rx*galScale,y:ry*galScale,z:rz2};
  }
  /* Dust lanes */
  ctx.globalAlpha=galFade*0.12;
  for(var gdi=0;gdi<GAL.dust.length;gdi++){var gd2=GAL.dust[gdi];var gp=galPj(gd2.x,0,gd2.y);if(Math.abs(gp.x)>W||Math.abs(gp.y)>H)continue;var dsz=gd2.sz*galScale;ctx.fillStyle="rgba(5,3,15,1)";ctx.fillRect(gp.x-dsz*0.5,gp.y-dsz*0.5,dsz,dsz);}
  /* Central bulge glow */
  var bp=galPj(0,0,0);var bulgeR=8*galScale;
  if(Math.abs(bp.x)<W+bulgeR&&Math.abs(bp.y)<H+bulgeR){
    ctx.globalAlpha=galFade*0.4;
    var bg2=ctx.createRadialGradient(bp.x,bp.y,0,bp.x,bp.y,bulgeR);bg2.addColorStop(0,"rgba(255,240,180,0.6)");bg2.addColorStop(0.3,"rgba(255,220,140,0.2)");bg2.addColorStop(1,"rgba(255,200,100,0)");ctx.fillStyle=bg2;ctx.fillRect(bp.x-bulgeR,bp.y-bulgeR,bulgeR*2,bulgeR*2);
  }
  /* Bulge stars */
  ctx.globalAlpha=galFade*0.5;
  for(var gbi=0;gbi<GAL.bulge.length;gbi++){var gb=GAL.bulge[gbi];var gbp=galPj(gb.x,gb.y*0.5,gb.y);if(Math.abs(gbp.x)>W||Math.abs(gbp.y)>H)continue;ctx.fillStyle="rgba(255,235,180,"+gb.b.toFixed(2)+")";ctx.fillRect(gbp.x-gb.s*0.5,gbp.y-gb.s*0.5,gb.s,gb.s);}
  /* Spiral arm stars */
  ctx.globalAlpha=galFade;
  for(var gai=0;gai<GAL.arms.length;gai++){var ga2=GAL.arms[gai];var gap2=galPj(ga2.x,0,ga2.y);if(Math.abs(gap2.x)>W||Math.abs(gap2.y)>H)continue;ctx.fillStyle="rgba("+GAL_COLS[ga2.ci]+","+(ga2.b*galFade).toFixed(2)+")";var gsz=ga2.s*(galScale>5?1.5:1);ctx.fillRect(gap2.x-gsz*0.5,gap2.y-gsz*0.5,gsz,gsz);}
  /* Nearby named stars */
  if(galScale>20){
    for(var nsi=0;nsi<NEAR_STARS.length;nsi++){var ns2=NEAR_STARS[nsi];var nsp2=galPj(ns2.x,0,ns2.y);if(Math.abs(nsp2.x)>W||Math.abs(nsp2.y)>H)continue;ctx.globalAlpha=galFade*ns2.b;var nsc2=ns2.sc?"rgba("+ns2.sc+",1)":"rgba(255,255,255,1)";ctx.fillStyle=nsc2;var ndot=ns2.name?1.5:1;ctx.fillRect(nsp2.x-ndot,nsp2.y-ndot,ndot*2,ndot*2);if(ns2.name&&galScale>60){ctx.fillStyle="rgba(200,220,255,"+(galFade*0.65).toFixed(2)+")";ctx.font=(galScale>100?"9px":"7px")+" sans-serif";ctx.textAlign="center";ctx.fillText(ns2.name,nsp2.x,nsp2.y-6);if(ns2.sp&&galScale>100){ctx.fillStyle="rgba("+ns2.sc+","+(galFade*0.4).toFixed(2)+")";ctx.font="7px sans-serif";ctx.fillText(ns2.sp,nsp2.x,nsp2.y-14);}}}}
  /* Sun marker at origin */
  ctx.globalAlpha=galFade;
  var smR=Math.max(2,Math.min(6,galScale*0.3));
  fillCirc(ctx,0,0,smR,"rgba(255,220,50,1)");
  var smGlow=ctx.createRadialGradient(0,0,smR,0,0,smR*4);smGlow.addColorStop(0,"rgba(255,200,50,0.3)");smGlow.addColorStop(1,"rgba(255,200,50,0)");ctx.fillStyle=smGlow;ctx.fillRect(-smR*4,-smR*4,smR*8,smR*8);
  if(galScale<50){ctx.fillStyle="rgba(255,220,100,"+(galFade*0.8).toFixed(2)+")";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("☀ 太陽系",0,smR+14);}
  if(galScale<30){ctx.fillStyle="rgba(255,230,160,"+(galFade*0.5).toFixed(2)+")";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("銀河中心 ▸ いて座A*",bp.x,bp.y+bulgeR*0.3+12);}
  ctx.globalAlpha=1;
}

/**
 * Screen-space overlay (call after ctx.restore): title + scale bar at galaxy scale.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {number} galInfoFade
 * @param {{zm:number}} cam
 */
function drawGalaxyInfo(ctx,W,H,galInfoFade,cam){
  if(galInfoFade<=0)return;
  ctx.fillStyle="rgba(255,255,255,"+(galInfoFade*0.35).toFixed(2)+")";ctx.font="12px sans-serif";ctx.textAlign="center";
  ctx.fillText("天の川銀河  Milky Way",W/2,32);ctx.font="9px sans-serif";ctx.fillText("直径: 約10万光年　恒星数: 約1000〜4000億　太陽位置: 中心から約2.6万光年",W/2,48);
  var galSc2=Math.max(cam.zm*30000,W*0.006);var sclLy=10000,sclPx=sclLy/1000*galSc2;
  if(sclPx>20&&sclPx<W*0.4){ctx.strokeStyle="rgba(255,255,255,"+(galInfoFade*0.3).toFixed(2)+")";ctx.lineWidth=1;var sbx2=W/2-sclPx/2,sby2=H-32;ctx.beginPath();ctx.moveTo(sbx2,sby2);ctx.lineTo(sbx2+sclPx,sby2);ctx.moveTo(sbx2,sby2-3);ctx.lineTo(sbx2,sby2+3);ctx.moveTo(sbx2+sclPx,sby2-3);ctx.lineTo(sbx2+sclPx,sby2+3);ctx.stroke();ctx.fillText("1万光年",W/2,sby2-6);}
}

export { drawGalaxyView, drawGalaxyInfo };
