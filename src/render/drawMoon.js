import { TAU } from "../data/solarData.js";
import { fillCirc } from "./utils.js";

/* City cluster positions: [phaseFrac, yFrac, brightness]
   phaseFrac 0-1 = longitude around planet (anchored to continent data at phase=0)
   yFrac: negative=north hemisphere, positive=south hemisphere */
var CITY_PTS=[
  [0.85,-0.30,1.00],[0.74,-0.33,0.85],[0.80,-0.32,0.78],[0.78,-0.25,0.80], // Tokyo, Beijing, Seoul, Shanghai
  [0.63,-0.19,0.75],[0.65,-0.30,0.70],[0.68,0.02,0.72],[0.58,-0.22,0.65], // Mumbai, Delhi, Singapore, Dubai
  [0.54,-0.27,0.68],[0.52, 0.06,0.50],                                     // Cairo, W.Africa
  [0.50,-0.38,0.92],[0.52,-0.36,0.90],[0.57,-0.44,0.75],[0.55,-0.40,0.70],[0.55,-0.33,0.68], // London, Paris, Moscow, Germany, SE Europe
  [0.11,-0.29,0.95],[0.07,-0.33,0.80],[0.02,-0.22,0.75],[0.09,-0.36,0.72], // NYC, Chicago, LA, Toronto
  [0.17, 0.22,0.65],[0.16, 0.31,0.60],[0.90, 0.27,0.65],[0.89, 0.31,0.60]  // São Paulo, BsAs, Sydney, Melbourne
];
export function drawEarthCityLights(ctx,cx,cy,r,rotAng,sdx,sdy){
  if(r<10)return;
  var phase=(((rotAng%TAU)/TAU)%1+1)%1,sl=Math.sqrt(sdx*sdx+sdy*sdy);if(sl<0.1)return;
  var ndx=sdx/sl,ndy=sdy/sl;
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.clip();
  for(var ci=0;ci<CITY_PTS.length;ci++){
    var cp=CITY_PTS[ci],pf=cp[0],yf=cp[1],br=cp[2];
    var ecx2=((pf+phase)%1)*2-1,ecd=1-ecx2*ecx2;if(ecd<0.04)continue;
    var px2=cx+ecx2*r*0.86,py2=cy+yf*r;
    var dot=ecx2*ndx+yf*ndy;if(dot>-0.07)continue; /* day side */
    var nf=Math.min(1,(-dot-0.07)*2.5)*ecd;var alpha=br*nf*0.9;if(alpha<0.04)continue;
    var gr2=ctx.createRadialGradient(px2,py2,0,px2,py2,r*0.045+1.5);
    gr2.addColorStop(0,"rgba(255,230,140,"+alpha.toFixed(2)+")");
    gr2.addColorStop(1,"rgba(255,175,50,0)");
    ctx.fillStyle=gr2;ctx.fillRect(px2-r*0.055,py2-r*0.055,r*0.11,r*0.11);
  }
  ctx.restore();
}

/* Moon near-side features (real positions, cylindrical: longitude 0..1 = -90E..+90W, lat -1..+1)
   MARE: [lonFrac, latFrac, sizeFrac, darkness, ellipseRatio]
   CRATER: [lonFrac, latFrac, radiusFrac, brightness, hasRays] */
var MOON_MARIA=[
  [0.46,-0.42, 0.22, 0.55, 0.95],/* Imbrium (雨の海) NW */
  [0.55,-0.20, 0.16, 0.55, 0.92],/* Serenitatis (晴れの海) */
  [0.62,-0.05, 0.13, 0.60, 0.88],/* Tranquillitatis (静かの海) */
  [0.68, 0.05, 0.10, 0.55, 0.90],/* Fecunditatis (豊かの海) */
  [0.70,-0.45, 0.08, 0.50, 0.80],/* Frigoris east */
  [0.40,-0.45, 0.09, 0.50, 0.80],/* Frigoris west */
  [0.38, 0.04, 0.16, 0.55, 0.90],/* Procellarum north (嵐の大洋) */
  [0.30, 0.30, 0.14, 0.55, 0.85],/* Procellarum south */
  [0.45, 0.20, 0.10, 0.50, 0.90],/* Cognitum/Insularum */
  [0.55, 0.45, 0.13, 0.60, 0.88],/* Nubium / Humorum */
  [0.62, 0.45, 0.10, 0.55, 0.80],/* Humorum */
  [0.72, 0.35, 0.08, 0.55, 0.85],/* Nectaris (神酒の海) */
  [0.80,-0.10, 0.07, 0.50, 0.80],/* Crisium (危難の海) */
];
var MOON_CRATERS=[
  /* [lon, lat, radius, brightness, hasRays] */
  [0.52, 0.55, 0.045, 1.0, 1],/* Tycho (光条あり) */
  [0.50, 0.18, 0.034, 0.85, 1],/* Copernicus (光条あり) */
  [0.36, 0.10, 0.026, 0.80, 1],/* Kepler (光条あり) */
  [0.30, 0.05, 0.024, 0.95, 1],/* Aristarchus (最明領域) */
  [0.42,-0.55, 0.030, 0.70, 0],/* Plato (玄武岩底) */
  [0.74, 0.50, 0.028, 0.70, 0],/* Tycho neighbor */
  [0.86, 0.10, 0.020, 0.65, 0],/* Petavius */
  [0.74,-0.30, 0.020, 0.70, 0],/* Posidonius */
  [0.65, 0.30, 0.018, 0.65, 0],/* small */
  [0.55,-0.65, 0.022, 0.60, 0],/* polar region */
];
export function drawMoonDetail(ctx,cx,cy,r,phase){
  if(r<2)return;
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.clip();
  var ph=(((phase%TAU)/TAU)%1+1)%1;
  /* Highlands base color variation (subtle bluish gray rim, tan center) */
  if(r>6){
    var hg=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    hg.addColorStop(0,"rgba(225,218,205,0.18)");
    hg.addColorStop(0.6,"rgba(195,190,180,0.10)");
    hg.addColorStop(1,"rgba(150,150,155,0.20)");
    ctx.fillStyle=hg;ctx.fillRect(cx-r,cy-r,r*2,r*2);
  }
  /* MARIA */
  for(var mi=0;mi<MOON_MARIA.length;mi++){
    var m=MOON_MARIA[mi],pf=m[0],yf=m[1],sz=m[2],darkness=m[3],er=m[4];
    var lon=((pf+ph)%1)*2-1,ecd=1-lon*lon;if(ecd<0.08)continue;
    var px=cx+lon*r*0.92,py=cy+yf*r*0.92;
    var ax=sz*r*Math.sqrt(ecd),ay=sz*r*er;
    ctx.globalAlpha=darkness*Math.sqrt(ecd)*0.78;
    var mg=ctx.createRadialGradient(px,py,0,px,py,Math.max(ax,ay));
    mg.addColorStop(0,"rgba(78,80,86,1)");
    mg.addColorStop(0.55,"rgba(88,88,92,0.85)");
    mg.addColorStop(1,"rgba(95,95,100,0)");
    ctx.save();ctx.translate(px,py);ctx.scale(1,ay/Math.max(ax,0.01));ctx.translate(-px,-py);
    ctx.fillStyle=mg;ctx.beginPath();ctx.arc(px,py,ax,0,TAU);ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha=1;
  /* CRATERS with bright rim + dark interior + optional rays */
  if(r>4){
    for(var ci=0;ci<MOON_CRATERS.length;ci++){
      var c=MOON_CRATERS[ci],pf2=c[0],yf2=c[1],sz2=c[2]*r,br=c[3],rays=c[4];
      var lon2=((pf2+ph)%1)*2-1,ecd2=1-lon2*lon2;if(ecd2<0.1)continue;
      var cpx=cx+lon2*r*0.92,cpy=cy+yf2*r*0.92,fade=Math.sqrt(ecd2);
      /* Rays (only for fresh craters) */
      if(rays&&r>10){
        ctx.globalAlpha=0.13*br*fade;ctx.strokeStyle="rgba(245,240,225,1)";ctx.lineWidth=0.7;
        var rayCount=10,rayLen=r*0.32*br;
        for(var rti=0;rti<rayCount;rti++){var rta=rti*TAU/rayCount+pf2*7;ctx.beginPath();ctx.moveTo(cpx,cpy);ctx.lineTo(cpx+Math.cos(rta)*rayLen,cpy+Math.sin(rta)*rayLen);ctx.stroke();}
      }
      /* Ejecta blanket (soft halo) */
      ctx.globalAlpha=0.30*br*fade;
      var eg=ctx.createRadialGradient(cpx,cpy,sz2*0.8,cpx,cpy,sz2*2.8);
      eg.addColorStop(0,"rgba(230,225,210,1)");eg.addColorStop(1,"rgba(230,225,210,0)");
      ctx.fillStyle=eg;ctx.fillRect(cpx-sz2*3,cpy-sz2*3,sz2*6,sz2*6);
      /* Bright rim */
      ctx.globalAlpha=0.65*br*fade;fillCirc(ctx,cpx,cpy,sz2*1.4,"rgba(240,235,222,1)");
      /* Dark interior */
      ctx.globalAlpha=0.55*br*fade;fillCirc(ctx,cpx,cpy,sz2*0.65,"rgba(70,68,65,1)");
      /* Central peak (only for largest) */
      if(sz2>r*0.025){ctx.globalAlpha=0.5*br*fade;fillCirc(ctx,cpx,cpy,sz2*0.18,"rgba(220,215,200,1)");}
    }
    ctx.globalAlpha=1;
  }
  /* Random fine cratering texture (procedural pock marks) */
  if(r>10){
    var rng=Math.sin(phase*0.001+1)*0.5+0.5;
    ctx.globalAlpha=0.18;
    for(var pi=0;pi<30;pi++){
      var pa=(pi*0.7919+rng)%1,pb=(pi*1.3107+rng*2)%1;
      var plon=pa*2-1,plat=pb*2-1;
      var pe=1-plon*plon-plat*plat;if(pe<0.05)continue;
      var ppx=cx+((plon+ph*2)%2-1)*r*0.9,ppy=cy+plat*r*0.9;
      var ppr=Math.max(0.5,r*0.008*(0.5+(pi*0.31)%1));
      ctx.fillStyle=(pi%3===0)?"rgba(220,215,205,1)":"rgba(70,68,65,1)";
      ctx.beginPath();ctx.arc(ppx,ppy,ppr,0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  /* Limb darkening (subtle dark rim) */
  if(r>5){
    var lg=ctx.createRadialGradient(cx,cy,r*0.75,cx,cy,r);
    lg.addColorStop(0,"rgba(0,0,0,0)");lg.addColorStop(1,"rgba(0,0,0,0.35)");
    ctx.fillStyle=lg;ctx.fillRect(cx-r,cy-r,r*2,r*2);
  }
  ctx.restore();
}
