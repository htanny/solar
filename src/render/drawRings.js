import { TAU } from "../data/solarData.js";
import { pj } from "./utils.js";

// Saturn pole longitude in simulator coords, calibrated against the 2025-03-25 ring plane crossing
// (J2000+9215 days → Saturn sim angle 308.4°; edge-on condition gives poleLon = 308.4° - 90° = 38°)
var SAT_POLE_LON=38*0.01745;

function dRi(ctx,wx,wy,wz,pr,cam,td){
  var tr=td*0.01745,cosTr=Math.cos(tr),sinTr=Math.sin(tr);
  var sinL=Math.sin(SAT_POLE_LON),cosL=Math.cos(SAT_POLE_LON);
  // Ring plane basis: u1 = normalize(y × N), u2 = N × u1
  // N = (sinTr*cosL, cosTr, sinTr*sinL)
  // u1 = (sinL, 0, -cosL)
  // u2 = (-cosTr*cosL, sinTr, -cosTr*sinL)
  var u1x=sinL,u1z=-cosL;
  var u2x=-cosTr*cosL,u2y=sinTr,u2z=-cosTr*sinL;
  var n=Math.max(36,Math.min(300,Math.floor(pr*2.3*cam.zm*0.6)));
  var ls=[{i:1.24,o:1.42,c:"rgba(200,180,135,0.30)"},{i:1.45,o:1.92,c:"rgba(225,205,155,0.55)"},{i:1.97,o:2.02,c:"rgba(20,15,10,0.7)"},{i:2.03,o:2.27,c:"rgba(195,175,125,0.40)"},{i:2.30,o:2.40,c:"rgba(155,135,95,0.20)"}];
  for(var li=0;li<ls.length;li++){var L=ls[li],ot=[],it=[];for(var j=0;j<=n;j++){var a=(j/n)*TAU,ca=Math.cos(a),sa=Math.sin(a);ot.push(pj(wx+(ca*u1x+sa*u2x)*pr*L.o,wy+sa*u2y*pr*L.o,wz+(ca*u1z+sa*u2z)*pr*L.o,cam));it.push(pj(wx+(ca*u1x+sa*u2x)*pr*L.i,wy+sa*u2y*pr*L.i,wz+(ca*u1z+sa*u2z)*pr*L.i,cam));}ctx.beginPath();for(var k=0;k<ot.length;k++){if(k===0)ctx.moveTo(ot[k].x,ot[k].y);else ctx.lineTo(ot[k].x,ot[k].y);}for(var k2=it.length-1;k2>=0;k2--)ctx.lineTo(it[k2].x,it[k2].y);ctx.closePath();ctx.fillStyle=L.c;ctx.fill();}
}
function dRiUranus(ctx,wx,wy,wz,pr,cam){var tr=97.8*0.01745,cosTr=Math.cos(tr),sinTr=Math.sin(tr);var rings=[{i:1.38,o:1.40,c:"rgba(60,80,90,0.30)"},{i:1.50,o:1.52,c:"rgba(60,80,90,0.28)"},{i:1.58,o:1.60,c:"rgba(70,90,100,0.28)"},{i:1.65,o:1.68,c:"rgba(70,90,100,0.32)"},{i:1.76,o:1.79,c:"rgba(80,100,110,0.28)"},{i:1.90,o:1.95,c:"rgba(70,90,100,0.38)"}];var n=Math.max(24,Math.min(180,Math.floor(pr*2*cam.zm*0.5)));for(var li=0;li<rings.length;li++){var L=rings[li],ot=[],it=[];for(var j=0;j<=n;j++){var a=(j/n)*TAU,ca=Math.cos(a),sa=Math.sin(a);ot.push(pj(wx+ca*pr*L.o*cosTr,wy-ca*pr*L.o*sinTr,wz+sa*pr*L.o,cam));it.push(pj(wx+ca*pr*L.i*cosTr,wy-ca*pr*L.i*sinTr,wz+sa*pr*L.i,cam));}ctx.beginPath();for(var k=0;k<ot.length;k++){if(k===0)ctx.moveTo(ot[k].x,ot[k].y);else ctx.lineTo(ot[k].x,ot[k].y);}for(var k2=it.length-1;k2>=0;k2--)ctx.lineTo(it[k2].x,it[k2].y);ctx.closePath();ctx.fillStyle=L.c;ctx.fill();}}

export { dRi, dRiUranus };
