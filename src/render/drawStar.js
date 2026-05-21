// @ts-check
import { TAU } from "../data/solarData.js";
import { seedR, fillCirc } from "./utils.js";

/* ===== STARS ===== */
function mkStars(){var r=seedR(42),o=[];var CC=["200,210,255","170,190,255","255,255,255","255,240,220","255,220,180","255,200,150","255,180,130","180,200,255"];for(var i=0;i<1000;i++){o.push({th:r()*TAU,ph:Math.acos(2*r()-1),l:r()<0.7?0:r()<0.7?1:2,b:0.15+r()*0.75+(r()<0.03?0.7:0),s:0.4+r()*0.9+(r()<0.02?1:0),ci:Math.floor(r()*CC.length),tw:r()*100});}for(var j=0;j<400;j++){o.push({th:r()*TAU,ph:1.5708+(r()-0.5)*0.35,l:0,b:0.08+r()*0.2,s:0.3+r()*0.5,ci:Math.floor(r()*CC.length),tw:r()*100});}return{s:o,c:CC};}
function mkNeb(){var r=seedR(77),o=[];var cs=[[80,40,120],[40,60,130],[120,50,60],[50,90,110],[100,60,90]];for(var i=0;i<10;i++){o.push({th:r()*TAU,ph:Math.acos(2*r()-1),ra:60+r()*140,cl:cs[Math.floor(r()*cs.length)],a:0.02+r()*0.04});}return o;}
function sSP(th,ph,rx,ry,dp){var x=Math.sin(ph)*Math.cos(th),y=Math.cos(ph),z=Math.sin(ph)*Math.sin(th),px=1-dp*0.15;var c1=Math.cos(-ry*px),s1=Math.sin(-ry*px),nx=x*c1+z*s1,nz=-x*s1+z*c1;x=nx;z=nz;var c2=Math.cos(-rx*px),s2=Math.sin(-rx*px),ny=y*c2-z*s2,nz2=y*s2+z*c2;return{x:x,y:ny,z:nz2};}
var SD=mkStars(),NB=mkNeb();
function mkAst(){var r=seedR(123),o=[];for(var i=0;i<200;i++){o.push({ang:r()*TAU,rad:330+r()*200,y:(r()-0.5)*8,sz:0.3+r()*1.2,spd:0.0002+r()*0.0003});}return o;}
/* Trojan asteroids cluster at Jupiter's L4 (+60°) and L5 (-60°) points.
   Angular offset is relative to Jupiter's current angle, set at render time. */
function mkTrojans(){var r=seedR(213),o=[];for(var i=0;i<120;i++){var lp=i<60?1:-1;o.push({lp:lp,off:(r()-0.5)*0.7,rad:770+(r()-0.5)*60,y:(r()-0.5)*16,sz:0.3+r()*1.0});}return o;}
/* Kuiper belt: 35-50 AU, scattered around the ecliptic */
function mkKuiper(){var r=seedR(317),o=[];for(var i=0;i<250;i++){o.push({ang:r()*TAU,rad:5250+r()*2250,y:(r()-0.5)*40,sz:0.3+r()*0.9,spd:0.00001+r()*0.000015});}return o;}
var AST=mkAst(),TROJAN=mkTrojans(),KUIPER=mkKuiper();

/* ===== MILKY WAY GALAXY DATA ===== */
/* Galaxy scale: 1 unit = ~1000 light-years. Galaxy radius ~50 units */
var GAL_R=50;/* galaxy radius in units */
var SUN_GAL_R=26;/* Sun at 26,000 ly from center */
var SUN_GAL_ANG=1.2;/* angle in Orion-Cygnus arm */
function mkGalaxy(){
  var r=seedR(200),arms=[],bulge=[],dust=[];
  /* 4 spiral arms: logarithmic spiral r=a*e^(b*theta) */
  var armOff=[0,1.5708,3.1416,4.7124];/* 4 arms 90° apart */
  for(var ai=0;ai<4;ai++){
    for(var j=0;j<400;j++){
      var th=armOff[ai]+j*0.025;
      var baseR=3*Math.exp(0.22*j*0.025);if(baseR>GAL_R*1.1)continue;
      var spread=(1+baseR*0.04)*(r()-0.5)*2;
      var px=Math.cos(th)*(baseR+spread)-Math.sin(th)*spread*0.3;
      var py=Math.sin(th)*(baseR+spread)+Math.cos(th)*spread*0.3;
      var br=0.15+r()*0.5;if(r()<0.02)br=0.8+r()*0.2;
      var sz=0.3+r()*0.6;
      var ci=r()<0.7?0:r()<0.5?1:r()<0.5?2:3;/* color index */
      arms.push({x:px,y:py,b:br,s:sz,ci:ci});
    }
  }
  /* Central bulge */
  for(var bi=0;bi<300;bi++){
    var ba=r()*TAU,bd=r()*8*(0.5+r()*0.5);
    bulge.push({x:Math.cos(ba)*bd,y:Math.sin(ba)*bd*0.6,b:0.3+r()*0.6,s:0.4+r()*0.5});
  }
  /* Dust lanes along arms */
  for(var di=0;di<200;di++){
    var dArm=Math.floor(r()*4),dth=armOff[dArm]+r()*10;
    var dR2=3*Math.exp(0.22*dth*0.025*0.4);if(dR2>GAL_R)continue;
    var dsp=(r()-0.5)*3;
    dust.push({x:Math.cos(dth)*dR2+dsp,y:Math.sin(dth)*dR2+dsp*0.3,sz:1+r()*3});
  }
  return{arms:arms,bulge:bulge,dust:dust};
}
var GAL=mkGalaxy();
var GAL_COLS=["200,210,255","255,240,200","255,200,150","180,200,255"];/* OBAF star colors */
/* Nearby star field for transition zone */
function mkNearStars(){
  var r=seedR(300),o=[];
  for(var i=0;i<80;i++){
    var ang=r()*TAU,dist=2+r()*40;
    o.push({x:Math.cos(ang)*dist+SUN_GAL_R*Math.cos(SUN_GAL_ANG),y:Math.sin(ang)*dist+SUN_GAL_R*Math.sin(SUN_GAL_ANG),b:0.3+r()*0.7,name:null});
  }
  /* Named stars with spectral type + color */
  var named=[{n:"シリウス",sp:"A1V",sc:"200,225,255",d:0.003},{n:"プロキオン",sp:"F5V",sc:"255,248,225",d:0.004},{n:"ベガ",sp:"A0V",sc:"200,215,255",d:0.008},{n:"アルタイル",sp:"A7V",sc:"220,235,255",d:0.005},{n:"デネブ",sp:"A2Ia",sc:"205,218,255",d:0.5},{n:"リゲル",sp:"B8Ia",sc:"170,200,255",d:0.8},{n:"ベテルギウス",sp:"M2Ib",sc:"255,100,50",d:0.6},{n:"アルデバラン",sp:"K5III",sc:"255,160,80",d:0.07},{n:"スピカ",sp:"B1V",sc:"160,190,255",d:0.08}];
  for(var ni=0;ni<named.length;ni++){var ns=named[ni],na=r()*TAU;o.push({x:SUN_GAL_R*Math.cos(SUN_GAL_ANG)+Math.cos(na)*ns.d*10,y:SUN_GAL_R*Math.sin(SUN_GAL_ANG)+Math.sin(na)*ns.d*10,b:0.85,name:ns.n,sp:ns.sp,sc:ns.sc});}
  return o;
}
var NEAR_STARS=mkNearStars();

/* Sun texture data - precomputed sunspots and granules */
var SUNSPOTS=(function(){var r=seedR(55),o=[];for(var i=0;i<12;i++){o.push({lng:r()*TAU,lat:(r()-0.5)*1.2,sz:0.03+r()*0.06,life:r()*100});}return o;})();
function drawSun(ctx,sx,sy,sr,t){
  if(sr<2){fillCirc(ctx,sx,sy,Math.max(sr,1),"rgba(255,200,50,1)");return;}
  /* Corona glow */
  var cg=ctx.createRadialGradient(sx,sy,sr*0.2,sx,sy,sr*3);cg.addColorStop(0,"rgba(255,220,80,0.5)");cg.addColorStop(0.3,"rgba(255,180,50,0.12)");cg.addColorStop(1,"rgba(255,150,30,0)");ctx.fillStyle=cg;ctx.fillRect(sx-sr*3,sy-sr*3,sr*6,sr*6);
  /* Corona rays */
  if(sr>6){ctx.save();ctx.globalAlpha=0.12;for(var ri=0;ri<12;ri++){var ra2=(ri/12)*TAU+t*0.02,rL=sr*(1.8+Math.sin(ri*2.3+t*0.5)*0.5);ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+Math.cos(ra2-0.06)*rL,sy+Math.sin(ra2-0.06)*rL);ctx.lineTo(sx+Math.cos(ra2+0.06)*rL,sy+Math.sin(ra2+0.06)*rL);ctx.closePath();ctx.fillStyle="rgba(255,220,100,0.3)";ctx.fill();}ctx.restore();}
  /* Prominences - plasma arcs at limb */
  if(sr>10){ctx.save();for(var ppi=0;ppi<6;ppi++){var ppa=ppi*1.07+t*0.012,parc=0.35+Math.sin(ppi*2.7+t*0.3)*0.25;var pSx=sx+Math.cos(ppa)*sr,pSy=sy+Math.sin(ppa)*sr;var pEa=ppa+0.15+Math.sin(ppi*1.3+t*0.2)*0.06;var pEx=sx+Math.cos(pEa)*sr,pEy=sy+Math.sin(pEa)*sr;var pMa=(ppa+pEa)*0.5,pMr=sr*(1+parc*0.45);var pCx=sx+Math.cos(pMa)*pMr,pCy=sy+Math.sin(pMa)*pMr;var palpha=0.25+Math.sin(t*0.4+ppi*1.7)*0.15;ctx.strokeStyle="rgba(255,200,140,"+(palpha*0.6).toFixed(2)+")";ctx.lineWidth=Math.max(2,sr*0.04);ctx.beginPath();ctx.moveTo(pSx,pSy);ctx.quadraticCurveTo(pCx,pCy,pEx,pEy);ctx.stroke();ctx.strokeStyle="rgba(255,140,70,"+palpha.toFixed(2)+")";ctx.lineWidth=Math.max(0.8,sr*0.018);ctx.beginPath();ctx.moveTo(pSx,pSy);ctx.quadraticCurveTo(pCx,pCy,pEx,pEy);ctx.stroke();}ctx.restore();}
  /* Base disc */
  var bg=ctx.createRadialGradient(sx-sr*0.1,sy-sr*0.1,sr*0.1,sx,sy,sr);bg.addColorStop(0,"rgba(255,230,100,1)");bg.addColorStop(0.6,"rgba(255,200,50,1)");bg.addColorStop(1,"rgba(220,150,30,1)");fillCirc(ctx,sx,sy,sr,bg);
  if(sr<8)return;
  ctx.save();ctx.beginPath();ctx.arc(sx,sy,sr,0,TAU);ctx.clip();
  /* Granulation - convective cells */
  var rot=t*0.04;
  ctx.globalAlpha=0.08;
  for(var gi=0;gi<20;gi++){var ga=gi*0.32+rot,gd=sr*(0.2+Math.sin(gi*1.7)*0.35);var gx=sx+Math.cos(ga)*gd,gy=sy+Math.sin(ga)*gd;fillCirc(ctx,gx,gy,sr*(0.08+Math.sin(gi*2.5)*0.03),"rgba(255,255,200,1)");}
  /* Darker convective boundaries */
  ctx.globalAlpha=0.06;
  for(var bi=0;bi<30;bi++){var ba=bi*0.21+rot*0.7,bd=sr*(0.15+Math.sin(bi*3.1)*0.4);ctx.fillStyle="rgba(200,120,20,1)";ctx.fillRect(sx+Math.cos(ba)*bd-sr*0.02,sy+Math.sin(ba)*bd-sr*0.02,sr*0.04,sr*0.04);}
  /* Sunspots */
  ctx.globalAlpha=1;
  for(var si=0;si<SUNSPOTS.length;si++){
    var sp=SUNSPOTS[si],spx=((sp.lng+rot*0.3)%TAU)/TAU*2-1;
    var depth=1-spx*spx;if(depth<0.1)continue;
    var spy=sp.lat*sr*0.7,spr=sp.sz*sr*depth;
    /* Umbra */
    ctx.globalAlpha=0.6*depth;fillCirc(ctx,sx+spx*sr*0.8,sy+spy,spr,"rgba(60,30,10,1)");
    /* Penumbra */
    ctx.globalAlpha=0.3*depth;fillCirc(ctx,sx+spx*sr*0.8,sy+spy,spr*1.6,"rgba(140,80,20,1)");
  }
  ctx.globalAlpha=1;
  /* Faculae - bright patches near limb */
  ctx.globalAlpha=0.1;
  for(var fi=0;fi<8;fi++){var fa=fi*0.8+rot*0.2+t*0.01,fd=sr*0.85;fillCirc(ctx,sx+Math.cos(fa)*fd,sy+Math.sin(fa)*fd,sr*0.06,"rgba(255,255,220,1)");}
  ctx.globalAlpha=1;
  /* Limb darkening */
  var ld=ctx.createRadialGradient(sx,sy,sr*0.5,sx,sy,sr);ld.addColorStop(0,"rgba(0,0,0,0)");ld.addColorStop(0.7,"rgba(0,0,0,0)");ld.addColorStop(1,"rgba(100,40,0,0.4)");ctx.fillStyle=ld;ctx.beginPath();ctx.arc(sx,sy,sr,0,TAU);ctx.fill();
  ctx.restore();
  /* Solar flare burst - occasional intense burst, every ~14s */
  if(sr>10){var flareCycle=t*0.07,flareIdx=Math.floor(flareCycle),flarePhase=flareCycle-flareIdx;if(flarePhase<0.18){var flareI=Math.sin(flarePhase/0.18*Math.PI);var fa2=(flareIdx*2.41)%TAU,fSx2=sx+Math.cos(fa2)*sr*0.92,fSy2=sy+Math.sin(fa2)*sr*0.92;var fLen=sr*(0.6+flareI*0.7);var fG=ctx.createRadialGradient(fSx2,fSy2,0,fSx2,fSy2,fLen);fG.addColorStop(0,"rgba(255,255,210,"+(0.85*flareI).toFixed(2)+")");fG.addColorStop(0.35,"rgba(255,200,110,"+(0.45*flareI).toFixed(2)+")");fG.addColorStop(1,"rgba(255,100,50,0)");ctx.fillStyle=fG;ctx.fillRect(fSx2-fLen,fSy2-fLen,fLen*2,fLen*2);}}
}

export { drawSun, mkStars, mkNeb, sSP, mkAst, mkGalaxy, mkNearStars, SD, NB, AST, TROJAN, KUIPER, GAL, GAL_COLS, GAL_R, SUN_GAL_R, SUN_GAL_ANG, NEAR_STARS, SUNSPOTS };
