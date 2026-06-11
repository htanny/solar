// @ts-check
import { TAU } from "../data/solarData.js";
import { pj } from "./utils.js";

/* Saturn pole longitude in simulator coords, calibrated against the 2025-03-25 ring plane crossing
   (J2000+9215 days → Saturn sim angle 308.4°; edge-on condition gives poleLon ≈ 38°) */
var SAT_POLE_LON=38*0.01745;
/* Uranus pole longitude ≈ ecliptic longitude of pole (J2000 α=257°, δ=-15° → λ ≈ 77°) */
var URA_POLE_LON=77*0.01745;

/* Render a stack of ring layers on a tilted plane defined by `tiltDeg` and `poleLon` (radians).
   Each layer is described by its inner/outer scale and fill color. */
function dRiPlane(ctx,wx,wy,wz,pr,cam,tiltDeg,poleLon,layers,segMul){
  var tr=tiltDeg*0.01745,cosTr=Math.cos(tr),sinTr=Math.sin(tr);
  var sinL=Math.sin(poleLon),cosL=Math.cos(poleLon);
  /* Ring plane basis u1 = (sinL, 0, -cosL), u2 = (-cosTr*cosL, sinTr, -cosTr*sinL) */
  var u1x=sinL,u1z=-cosL;
  var u2x=-cosTr*cosL,u2y=sinTr,u2z=-cosTr*sinL;
  var n=Math.max(24,Math.min(300,Math.floor(pr*2*cam.zm*(segMul||0.6))));
  for(var li=0;li<layers.length;li++){
    var L=layers[li],ot=[],it=[];
    for(var j=0;j<=n;j++){
      var a=(j/n)*TAU,ca=Math.cos(a),sa=Math.sin(a);
      ot.push(pj(wx+(ca*u1x+sa*u2x)*pr*L.o,wy+sa*u2y*pr*L.o,wz+(ca*u1z+sa*u2z)*pr*L.o,cam));
      it.push(pj(wx+(ca*u1x+sa*u2x)*pr*L.i,wy+sa*u2y*pr*L.i,wz+(ca*u1z+sa*u2z)*pr*L.i,cam));
    }
    ctx.beginPath();
    for(var k=0;k<ot.length;k++){if(k===0)ctx.moveTo(ot[k].x,ot[k].y);else ctx.lineTo(ot[k].x,ot[k].y);}
    for(var k2=it.length-1;k2>=0;k2--)ctx.lineTo(it[k2].x,it[k2].y);
    ctx.closePath();ctx.fillStyle=L.c;ctx.fill();
  }
}

/* Saturn ring layers, inside→out: C ring / B ring (3 bands with darker grooves between —
   the radial brightness structure Voyager imaged) / Cassini division / A ring split by the
   Encke gap / faint F ring. Radii relative to planet radius. */
var SAT_LAYERS=[
  {i:1.24,o:1.42,c:"rgba(200,180,135,0.30)"},
  {i:1.45,o:1.58,c:"rgba(222,202,150,0.50)"},
  {i:1.58,o:1.62,c:"rgba(205,185,135,0.36)"},
  {i:1.62,o:1.78,c:"rgba(235,215,165,0.62)"},
  {i:1.78,o:1.82,c:"rgba(202,182,132,0.38)"},
  {i:1.82,o:1.92,c:"rgba(225,205,155,0.52)"},
  {i:1.97,o:2.02,c:"rgba(20,15,10,0.7)"},
  {i:2.03,o:2.12,c:"rgba(200,180,130,0.44)"},
  {i:2.12,o:2.14,c:"rgba(110,96,68,0.30)"},
  {i:2.14,o:2.27,c:"rgba(190,170,122,0.38)"},
  {i:2.30,o:2.40,c:"rgba(155,135,95,0.20)"},
];
var URA_LAYERS=[{i:1.38,o:1.40,c:"rgba(60,80,90,0.30)"},{i:1.50,o:1.52,c:"rgba(60,80,90,0.28)"},{i:1.58,o:1.60,c:"rgba(70,90,100,0.28)"},{i:1.65,o:1.68,c:"rgba(70,90,100,0.32)"},{i:1.76,o:1.79,c:"rgba(80,100,110,0.28)"},{i:1.90,o:1.95,c:"rgba(70,90,100,0.38)"}];

function dRi(ctx,wx,wy,wz,pr,cam,td){dRiPlane(ctx,wx,wy,wz,pr,cam,td,SAT_POLE_LON,SAT_LAYERS,0.6);}
function dRiUranus(ctx,wx,wy,wz,pr,cam){dRiPlane(ctx,wx,wy,wz,pr,cam,97.8,URA_POLE_LON,URA_LAYERS,0.5);}

/* Cast the ring system's shadow onto the planet disk. The Sun (world origin) lights the
   planet; the rings block a band whose width tracks how open the rings appear to the Sun
   (sin of sub-solar ring latitude) and which sits on the hemisphere opposite the Sun. */
function dRingShadow(ctx,wx,wy,wz,pr,rr,cx,cy,cam,tiltDeg){
  var sx=-wx,sy=-wy,sz=-wz,sl=Math.sqrt(sx*sx+sy*sy+sz*sz)||1;sx/=sl;sy/=sl;sz/=sl;
  var tr=tiltDeg*0.01745,cosTr=Math.cos(tr),sinTr=Math.sin(tr);
  var sinLn=Math.sin(SAT_POLE_LON),cosLn=Math.cos(SAT_POLE_LON);
  var u1x=sinLn,u1y=0,u1z=-cosLn;
  var u2x=-cosTr*cosLn,u2y=sinTr,u2z=-cosTr*sinLn;
  var nx=u1y*u2z-u1z*u2y,ny=u1z*u2x-u1x*u2z,nz=u1x*u2y-u1y*u2x;
  var sinB=sx*nx+sy*ny+sz*nz;/* sub-solar ring latitude */
  if(Math.abs(sinB)<0.04)return;/* edge-on: shadow collapses to a thin line, skip */
  /* Screen direction of the ring line-of-nodes (u1) → shadow band runs parallel to it. */
  var pA=pj(wx+u1x*pr,wy+u1y*pr,wz+u1z*pr,cam),pB=pj(wx-u1x*pr,wy-u1y*pr,wz-u1z*pr,cam);
  var ax=pA.x-pB.x,ay=pA.y-pB.y,al=Math.sqrt(ax*ax+ay*ay)||1;ax/=al;ay/=al;
  var perpX=-ay,perpY=ax;
  /* Sun screen direction relative to planet centre; shadow sits opposite. */
  var sp=pj(0,0,0,cam),sdx=sp.x-cx,sdy=sp.y-cy,sd=Math.sqrt(sdx*sdx+sdy*sdy)||1;sdx/=sd;sdy/=sd;
  var side=(sdx*perpX+sdy*perpY)>0?-1:1;
  var off=rr*Math.min(0.7,Math.abs(sinB)*1.3)*side;
  var halfW=rr*Math.max(0.08,Math.abs(sinB)*0.5);
  var bcx=cx+perpX*off,bcy=cy+perpY*off;
  ctx.save();
  ctx.beginPath();ctx.arc(cx,cy,rr*0.99,0,TAU);ctx.clip();
  ctx.globalAlpha=0.32;ctx.fillStyle="rgba(10,8,4,1)";
  ctx.beginPath();
  ctx.moveTo(bcx+ax*rr*1.5+perpX*halfW,bcy+ay*rr*1.5+perpY*halfW);
  ctx.lineTo(bcx-ax*rr*1.5+perpX*halfW,bcy-ay*rr*1.5+perpY*halfW);
  ctx.lineTo(bcx-ax*rr*1.5-perpX*halfW,bcy-ay*rr*1.5-perpY*halfW);
  ctx.lineTo(bcx+ax*rr*1.5-perpX*halfW,bcy+ay*rr*1.5-perpY*halfW);
  ctx.closePath();ctx.fill();
  ctx.restore();ctx.globalAlpha=1;
}

export { dRi, dRiUranus, dRingShadow };
