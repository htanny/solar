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

var SAT_LAYERS=[{i:1.24,o:1.42,c:"rgba(200,180,135,0.30)"},{i:1.45,o:1.92,c:"rgba(225,205,155,0.55)"},{i:1.97,o:2.02,c:"rgba(20,15,10,0.7)"},{i:2.03,o:2.27,c:"rgba(195,175,125,0.40)"},{i:2.30,o:2.40,c:"rgba(155,135,95,0.20)"}];
var URA_LAYERS=[{i:1.38,o:1.40,c:"rgba(60,80,90,0.30)"},{i:1.50,o:1.52,c:"rgba(60,80,90,0.28)"},{i:1.58,o:1.60,c:"rgba(70,90,100,0.28)"},{i:1.65,o:1.68,c:"rgba(70,90,100,0.32)"},{i:1.76,o:1.79,c:"rgba(80,100,110,0.28)"},{i:1.90,o:1.95,c:"rgba(70,90,100,0.38)"}];

function dRi(ctx,wx,wy,wz,pr,cam,td){dRiPlane(ctx,wx,wy,wz,pr,cam,td,SAT_POLE_LON,SAT_LAYERS,0.6);}
function dRiUranus(ctx,wx,wy,wz,pr,cam){dRiPlane(ctx,wx,wy,wz,pr,cam,97.8,URA_POLE_LON,URA_LAYERS,0.5);}

export { dRi, dRiUranus };
