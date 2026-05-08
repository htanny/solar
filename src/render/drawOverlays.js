/* ===== VISUALIZATION OVERLAYS ===== */
/* Hill spheres, eclipse shadow cone, tidal vectors, telescope mode */
import { pj, mOf } from "./utils.js";
import { MD, TAU } from "../data/solarData.js";

var HILL_MASS={Mercury:1.65e-7,Venus:2.45e-6,Earth:3.00e-6,Mars:3.23e-7,Jupiter:9.55e-4,Saturn:2.86e-4,Uranus:4.37e-5,Neptune:5.15e-5};

function drawHillSpheres(ctx,pd,cam,W,H){
  if(cam.zm<=0.02||cam.zm>=200)return;
  for(var i=0;i<pd.length;i++){
    var hpl=pd[i],hm=HILL_MASS[hpl.pl.n];if(!hm)continue;
    var hR_au=hpl.oR/150*Math.pow(hm/3,1/3),hR_sim=hR_au*150,hR_scr=hR_sim*cam.zm;
    if(hR_scr<4||hR_scr>Math.max(W,H)*3)continue;
    var hN=Math.max(32,Math.min(120,Math.floor(hR_scr*0.4)));
    ctx.strokeStyle="rgba(255,180,100,0.25)";ctx.lineWidth=0.8;ctx.setLineDash([4,6]);
    ctx.beginPath();
    for(var j=0;j<=hN;j++){var a=j/hN*TAU,p=pj(hpl.wx+Math.cos(a)*hR_sim,0,hpl.wz+Math.sin(a)*hR_sim,cam);if(j===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}
    ctx.stroke();ctx.setLineDash([]);
    if(hR_scr>30){var lp=pj(hpl.wx,0,hpl.wz+hR_sim,cam);ctx.fillStyle="rgba(255,180,100,0.5)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("ヒル球 "+(hR_au*150).toFixed(1)+"Mkm",lp.x,lp.y-4);}
  }
}

function drawShadowCone(ctx,earthPd,eclipseEarPj,eclipseEarRr,cam,_rd,_un,t){
  if(!earthPd||!eclipseEarPj)return;
  var moVsh=mOf(_rd,_un),mpsh=pj(earthPd.wx+Math.cos((t/MD.p)*TAU)*moVsh,0,earthPd.wz+Math.sin((t/MD.p)*TAU)*moVsh,cam);
  var sl2=Math.sqrt(earthPd.wx*earthPd.wx+earthPd.wz*earthPd.wz)||1;
  var sdx={x:-earthPd.wx/sl2,z:-earthPd.wz/sl2};
  var uL=eclipseEarRr*8,pL=eclipseEarRr*20,uW=0.004,pW=0.012;
  ctx.save();
  ctx.globalAlpha=0.45;ctx.fillStyle="rgba(10,5,30,0.7)";
  ctx.beginPath();ctx.moveTo(mpsh.x,mpsh.y);
  ctx.lineTo(mpsh.x+sdx.x*uL-sdx.z*uW*uL,mpsh.y+sdx.z*uL+sdx.x*uW*uL);
  ctx.lineTo(mpsh.x+sdx.x*uL+sdx.z*uW*uL,mpsh.y+sdx.z*uL-sdx.x*uW*uL);
  ctx.closePath();ctx.fill();
  ctx.fillStyle="rgba(40,20,80,0.25)";
  ctx.beginPath();ctx.moveTo(mpsh.x,mpsh.y);
  ctx.lineTo(mpsh.x+sdx.x*pL-sdx.z*pW*pL,mpsh.y+sdx.z*pL+sdx.x*pW*pL);
  ctx.lineTo(mpsh.x+sdx.x*pL+sdx.z*pW*pL,mpsh.y+sdx.z*pL-sdx.x*pW*pL);
  ctx.closePath();ctx.fill();
  ctx.globalAlpha=0.5;ctx.strokeStyle="rgba(120,80,200,0.6)";ctx.lineWidth=0.8;ctx.setLineDash([3,4]);
  ctx.beginPath();ctx.moveTo(mpsh.x,mpsh.y);ctx.lineTo(mpsh.x+sdx.x*pL,mpsh.y+sdx.z*pL);ctx.stroke();
  ctx.setLineDash([]);ctx.fillStyle="rgba(180,140,255,0.7)";ctx.font="9px sans-serif";ctx.textAlign="center";
  ctx.fillText("影錐 (日食)",mpsh.x+sdx.x*pL*0.55,mpsh.y+sdx.z*pL*0.55-7);
  ctx.restore();
}

function drawTidalForce(ctx,earthPd,earthPdIdx,pjArr,cam,_rd,_un,t){
  if(!earthPd||earthPdIdx<0)return;
  var moVtd=mOf(_rd,_un),mAtd=(t/MD.p)*TAU;
  var mxtd=earthPd.wx+Math.cos(mAtd)*moVtd,mztd=earthPd.wz+Math.sin(mAtd)*moVtd;
  var tdx2=mxtd-earthPd.wx,tdz2=mztd-earthPd.wz,tdd=Math.sqrt(tdx2*tdx2+tdz2*tdz2)||1;
  var tnx=tdx2/tdd,tnz=tdz2/tdd;
  var ep=pjArr[earthPdIdx],errr=Math.max(earthPd.vr*cam.zm,0.4),aSz=Math.max(8,errr*2.2);
  ctx.save();ctx.strokeStyle="rgba(255,160,60,0.7)";ctx.fillStyle="rgba(255,160,60,0.7)";ctx.lineWidth=1.5;
  var dirs=[{nx:tnx,nz:tnz,len:2.5},{nx:-tnx,nz:-tnz,len:2.5},{nx:tnz,nz:-tnx,len:1.7},{nx:-tnz,nz:tnx,len:1.7}];
  for(var i=0;i<dirs.length;i++){
    var d=dirs[i],ax=ep.x+d.nx*aSz*d.len,ay=ep.y+d.nz*aSz*d.len;
    ctx.beginPath();ctx.moveTo(ep.x,ep.y);ctx.lineTo(ax,ay);ctx.stroke();
    var ang=Math.atan2(ay-ep.y,ax-ep.x);
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax-Math.cos(ang-0.4)*5,ay-Math.sin(ang-0.4)*5);ctx.lineTo(ax-Math.cos(ang+0.4)*5,ay-Math.sin(ang+0.4)*5);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle="rgba(255,160,60,0.6)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("潮汐力",ep.x,ep.y-aSz*2.8-5);
  ctx.restore();
}

function drawTelescope(ctx,pd,pjArr,cam,W,H,fc,zmStr,srScr,sunPj){
  if(fc==="all")return;
  var focPj=null,focRr=0;
  if(fc==="sun"){focPj=sunPj;focRr=srScr;}
  else{for(var i=0;i<pd.length;i++){if(pd[i].pl.n===fc){focPj=pjArr[i];focRr=Math.max(pd[i].vr*cam.zm,0.4);break;}}}
  if(!focPj)return;
  var tR=Math.min(W,H)*0.42,cx=W/2,cy=H/2;
  ctx.save();
  ctx.beginPath();ctx.rect(0,0,W,H);ctx.arc(cx,cy,tR,0,TAU,true);ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fill();
  ctx.strokeStyle="rgba(100,150,100,0.7)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,tR,0,TAU);ctx.stroke();
  ctx.strokeStyle="rgba(100,200,100,0.5)";ctx.lineWidth=0.8;ctx.setLineDash([4,8]);
  ctx.beginPath();ctx.moveTo(cx-tR,cy);ctx.lineTo(cx+tR,cy);ctx.moveTo(cx,cy-tR);ctx.lineTo(cx,cy+tR);ctx.stroke();
  ctx.setLineDash([]);
  [0.25,0.5,0.75].forEach(function(rf){ctx.strokeStyle="rgba(100,200,100,0.18)";ctx.beginPath();ctx.arc(cx,cy,tR*rf,0,TAU);ctx.stroke();});
  if(focRr>2){
    var bsz=Math.max(focRr*1.8,20),bx=focPj.x-bsz,by=focPj.y-bsz,bw=bsz*2,seg=bsz*0.35;
    ctx.strokeStyle="rgba(150,255,150,0.7)";ctx.lineWidth=1.2;ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(bx,by+seg);ctx.lineTo(bx,by);ctx.lineTo(bx+seg,by);
    ctx.moveTo(bx+bw-seg,by);ctx.lineTo(bx+bw,by);ctx.lineTo(bx+bw,by+seg);
    ctx.moveTo(bx+bw,by+bw-seg);ctx.lineTo(bx+bw,by+bw);ctx.lineTo(bx+bw-seg,by+bw);
    ctx.moveTo(bx+seg,by+bw);ctx.lineTo(bx,by+bw);ctx.lineTo(bx,by+bw-seg);
    ctx.stroke();
  }
  ctx.fillStyle="rgba(100,220,100,0.7)";ctx.font="9px monospace";ctx.textAlign="left";
  ctx.fillText("× "+zmStr,cx-tR+8,cy+tR-22);
  ctx.fillText("FOC: "+(fc==="sun"?"SUN":fc.toUpperCase().slice(0,8)),cx-tR+8,cy+tR-10);
  ctx.restore();
}

export function drawOverlays(ctx,opts){
  var pd=opts.pd,pjArr=opts.pjArr,cam=opts.cam,W=opts.W,H=opts.H;
  var earthPd=opts.earthPd,earthPdIdx=opts.earthPdIdx;
  var eclipseEarPj=opts.eclipseEarPj,eclipseEarRr=opts.eclipseEarRr;
  var compare=opts.compare,_rd=opts._rd,_un=opts._un,t=opts.t;
  var fc=opts.fc,zmStr=opts.zmStr,srScr=opts.srScr,sunPj=opts.sunPj;
  if(!compare){
    if(opts.showHill)drawHillSpheres(ctx,pd,cam,W,H);
    if(opts.showShadow&&opts.eclipseType==="solar")drawShadowCone(ctx,earthPd,eclipseEarPj,eclipseEarRr,cam,_rd,_un,t);
    if(opts.showTidal)drawTidalForce(ctx,earthPd,earthPdIdx,pjArr,cam,_rd,_un,t);
  }
  if(opts.showTelescope&&!compare)drawTelescope(ctx,pd,pjArr,cam,W,H,fc,zmStr,srScr,sunPj);
}
