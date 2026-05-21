// @ts-check
import { TAU } from "../data/solarData.js";
import { fillCirc, sphereShade, limbDarken, atmosGlow, seedR, pj, RX, RY } from "./utils.js";
import { dRi, dRiUranus } from "./drawRings.js";
import { drawSun, mkStars, mkNeb, sSP, mkAst, mkGalaxy, mkNearStars, SD, NB, AST, TROJAN, KUIPER, GAL, GAL_COLS, GAL_R, SUN_GAL_R, SUN_GAL_ANG, NEAR_STARS, SUNSPOTS } from "./drawStar.js";
import { drawEarthCityLights, drawMoonDetail } from "./drawMoon.js";

function dOb(ctx,rad,cam,col,frontOnly){
  var n=Math.max(80,Math.min(360,Math.floor(rad*cam.zm*0.3)));
  var pts=[];for(var i=0;i<=n;i++){var a=(i/n)*TAU,pp=pj(Math.cos(a)*rad,0,Math.sin(a)*rad,cam);pts.push(pp);}
  var bc=col||"255,255,255";
  if(!frontOnly){
    /* Back arc (z≥0, far from viewer): dim dashed — draw BEFORE sun */
    ctx.strokeStyle="rgba("+bc+",0.09)";ctx.lineWidth=0.6;ctx.setLineDash([3,7]);
    ctx.beginPath();var ib=false;
    for(var i=0;i<n;i++){if(pts[i].z>=0){if(!ib){ctx.moveTo(pts[i].x,pts[i].y);ib=true;}else ctx.lineTo(pts[i].x,pts[i].y);}else{if(ib)ctx.lineTo(pts[i].x,pts[i].y);ib=false;}}
    ctx.stroke();
  }
  if(frontOnly){
    /* Front arc (z<0, near viewer): bright solid + arrow — draw AFTER sun */
    ctx.strokeStyle="rgba("+bc+",0.30)";ctx.lineWidth=1.1;ctx.setLineDash([]);
    ctx.beginPath();var ifa=false;
    for(var i=0;i<n;i++){if(pts[i].z<0){if(!ifa){ctx.moveTo(pts[i].x,pts[i].y);ifa=true;}else ctx.lineTo(pts[i].x,pts[i].y);}else{if(ifa)ctx.lineTo(pts[i].x,pts[i].y);ifa=false;}}
    ctx.stroke();
    /* Direction arrow on front arc — CCW on screen */
    var aArr=cam.ry+Math.PI*1.5,p0=pj(Math.cos(aArr)*rad,0,Math.sin(aArr)*rad,cam);
    if(p0.z<0){
      var p1=pj(Math.cos(aArr+0.12)*rad,0,Math.sin(aArr+0.12)*rad,cam);
      var adx=p1.x-p0.x,ady=p1.y-p0.y,al=Math.sqrt(adx*adx+ady*ady);
      if(al>1){adx/=al;ady/=al;var as=Math.min(5,Math.max(2,rad*cam.zm*0.06));
        ctx.strokeStyle="rgba("+bc+",0.45)";ctx.lineWidth=0.9;
        ctx.beginPath();ctx.moveTo(p0.x+adx*as,p0.y+ady*as);
        ctx.lineTo(p0.x-adx*as-ady*as,p0.y-ady*as+adx*as);
        ctx.lineTo(p0.x-adx*as+ady*as,p0.y-ady*as-adx*as);ctx.closePath();ctx.stroke();}
    }
  }
}
function dSh(ctx,px,py,r,wx,wz,cam){if(r<0.8)return;
  /* Compute light direction in view space */
  var sl=Math.sqrt(wx*wx+wz*wz);if(sl<0.01)return;
  var ld=RX(RY([-wx/sl,0,-wz/sl],cam.ry),cam.rx);
  /* ld[0],ld[1]=screen light dir; ld[2]>0=sun behind planet(dark side visible) */
  var scrAng=Math.atan2(ld[1],ld[0]);
  var termW=ld[2];/* -1:full lit, 0:quarter, +1:full dark */
  if(termW<-0.97)return;/* fully lit, no shadow */
  ctx.save();ctx.beginPath();ctx.arc(px,py,r,0,TAU);ctx.clip();
  ctx.translate(px,py);ctx.rotate(scrAng);/* rotate so light=+x */
  /* Shadow region: left limb + terminator ellipse */
  var seg=Math.max(16,Math.floor(r*0.8));
  ctx.beginPath();
  /* Left semicircle (dark limb): top→left→bottom */
  ctx.arc(0,0,r+0.5,-1.5708,1.5708,true);
  /* Terminator: bottom→top via (termW*r, 0) */
  for(var k=0;k<=seg;k++){var a2=1.5708-(k/seg)*3.1416;ctx.lineTo(termW*r*Math.cos(a2),r*Math.sin(a2));}
  ctx.closePath();ctx.fillStyle="rgba(0,0,0,0.5)";ctx.fill();
  ctx.restore();}
function dAx(ctx,px,py,r,td,cam){if(r<2)return;var tr=td*0.01745,len=r+Math.min(14,r*0.8);var ap=RX(RY([Math.sin(tr),Math.cos(tr),0],cam.ry),cam.rx);var dx=ap[0]*len,dy=ap[1]*len;ctx.beginPath();ctx.moveTo(px-dx,py+dy);ctx.lineTo(px+dx,py-dy);ctx.strokeStyle="rgba(255,255,100,0.5)";ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);var ax=px+dx,ay=py-dy,ad=Math.atan2(-dy,dx);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax-Math.cos(ad-0.4)*5,ay-Math.sin(ad-0.4)*5);ctx.moveTo(ax,ay);ctx.lineTo(ax-Math.cos(ad+0.4)*5,ay-Math.sin(ad+0.4)*5);ctx.strokeStyle="rgba(255,255,100,0.5)";ctx.lineWidth=1;ctx.stroke();}

/* ===== PLANET TEXTURES — TRUE SPHERICAL PROJECTION ===== */
function drawPlanetBody(ctx,cx,cy,r,pl,rotAngle,cam){
  if(r<1.5){fillCirc(ctx,cx,cy,Math.max(r,0.4),pl.c);return;}
  var tp=pl.type,phase=(((rotAngle%TAU)/TAU)%1+1)%1,hi=r>12,atm=null,R=r*1.5;
  var tr=pl.t*0.01745,cosTr=Math.cos(tr),sinTr=Math.sin(tr);
  var ap=cam?RX(RY([Math.sin(tr),Math.cos(tr),0],cam.ry),cam.rx):[Math.sin(tr),Math.cos(tr),0];
  var screenTilt=Math.atan2(ap[0],ap[1]);
  var cry=cam?cam.ry:0,crx=cam?cam.rx:0;
  /* Spherical surface projection: lonFrac+phase=0.5 → center-of-disk at cam.ry=0 */
  function sp3d(lf,yf){var u=((lf+phase)%1+1)%1,lon=u*TAU+Math.PI*0.5;var sL=-yf,cL=Math.sqrt(Math.max(0,1-sL*sL)),cLon=cL*Math.cos(lon);return RX(RY([cLon*cosTr+sL*sinTr,-cLon*sinTr+sL*cosTr,cL*Math.sin(lon)],cry),crx);}
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.clip();

  if(tp==="rock"){
    var g=ctx.createRadialGradient(cx-r*0.15,cy-r*0.1,r*0.1,cx,cy,r);g.addColorStop(0,"rgba(170,168,160,1)");g.addColorStop(0.6,"rgba(140,138,130,1)");g.addColorStop(1,"rgba(100,98,92,1)");ctx.fillStyle=g;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    var crt=[[0.3,0.2,0.16],[0.72,0.55,0.12],[-0.18,0.38,0.09],[0.48,-0.28,0.2],[-0.42,-0.18,0.11],[0.12,0.68,0.08],[0.8,-0.1,0.1],[0.05,-0.55,0.14]];
    for(var ci=0;ci<crt.length;ci++){var c2=crt[ci],crp=sp3d(c2[0],c2[1]);if(crp[2]>=0)continue;var cdf=-crp[2];ctx.globalAlpha=0.45*cdf;fillCirc(ctx,cx+crp[0]*r,cy-crp[1]*r,c2[2]*r*cdf,"rgba(95,92,85,1)");}ctx.globalAlpha=1;
    limbDarken(ctx,cx,cy,r,0.4);
  }else if(tp==="venus"){
    var vg=ctx.createRadialGradient(cx,cy,0,cx,cy,r);vg.addColorStop(0,"rgba(235,210,145,1)");vg.addColorStop(0.5,"rgba(220,195,120,1)");vg.addColorStop(1,"rgba(195,170,100,1)");ctx.fillStyle=vg;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    ctx.save();ctx.translate(cx,cy);ctx.rotate(screenTilt);ctx.translate(-cx,-cy);
    var vBands=[{y:-0.7,h:0.18,v:230},{y:-0.45,h:0.14,v:210},{y:-0.2,h:0.2,v:235},{y:0.3,h:0.18,v:228},{y:0.55,h:0.14,v:205}];
    for(var vbi=0;vbi<vBands.length;vbi++){var vb=vBands[vbi];ctx.globalAlpha=0.35;ctx.fillStyle="rgba("+vb.v+","+(vb.v-25)+","+(vb.v-95)+",1)";ctx.fillRect(cx-R,cy+vb.y*r-vb.h*r,R*2,vb.h*r*2);}ctx.globalAlpha=1;ctx.restore();atm="255,195,100";
  }else if(tp==="earth"){
    /* Deep ocean base with depth gradient */
    var eg=ctx.createRadialGradient(cx-r*0.15,cy-r*0.12,r*0.05,cx+r*0.05,cy+r*0.08,r);
    eg.addColorStop(0,"rgba(25,65,155,1)");eg.addColorStop(0.3,"rgba(18,52,140,1)");eg.addColorStop(0.7,"rgba(12,38,115,1)");eg.addColorStop(1,"rgba(8,22,75,1)");
    ctx.fillStyle=eg;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    /* Ocean color variation bands */
    ctx.globalAlpha=0.08;
    ctx.fillStyle="rgba(30,80,170,1)";ctx.fillRect(cx-R,cy-r*0.3,R*2,r*0.25);
    ctx.fillStyle="rgba(20,55,130,1)";ctx.fillRect(cx-R,cy+r*0.1,R*2,r*0.2);
    ctx.globalAlpha=1;
    /* Continents - realistic shapes with many points */
    /* Africa */
    var AF={x:0.52,y:0.05,pts:[[0,-.22],[.02,-.24],[.05,-.23],[.07,-.2],[.09,-.16],[.1,-.12],[.08,-.08],[.1,-.03],[.12,.02],[.13,.08],[.12,.14],[.1,.18],[.08,.22],[.05,.24],[.02,.22],[0,.2],[-.02,.18],[-.04,.14],[-.06,.1],[-.07,.05],[-.06,0],[-.05,-.04],[-.04,-.08],[-.03,-.12],[-.02,-.16],[-.01,-.2]],c:[85,145,55],c2:[170,155,85]};
    /* Europe */
    var EU={x:0.52,y:-0.32,pts:[[0,-.08],[.03,-.1],[.06,-.09],[.08,-.07],[.1,-.05],[.11,-.02],[.1,0],[.12,.02],[.1,.04],[.08,.06],[.06,.07],[.04,.06],[.02,.08],[0,.07],[-.02,.06],[-.04,.05],[-.06,.04],[-.08,.02],[-.07,0],[-.06,-.02],[-.04,-.04],[-.02,-.06]],c:[70,138,52],c2:[95,130,65]};
    /* Asia */
    var AS={x:0.7,y:-0.22,pts:[[0,-.18],[.04,-.2],[.08,-.19],[.12,-.17],[.16,-.14],[.18,-.1],[.2,-.06],[.19,-.02],[.18,.02],[.16,.06],[.14,.1],[.12,.13],[.1,.15],[.06,.14],[.03,.12],[.01,.1],[-.02,.08],[-.04,.05],[-.06,.02],[-.08,0],[-.1,-.03],[-.11,-.06],[-.1,-.1],[-.08,-.13],[-.05,-.15],[-.02,-.17]],c:[75,140,50],c2:[145,138,75]};
    /* North America */
    var NA={x:0.08,y:-0.2,pts:[[0,-.2],[.03,-.22],[.06,-.21],[.09,-.18],[.12,-.15],[.14,-.12],[.15,-.08],[.14,-.04],[.13,0],[.12,.04],[.1,.07],[.08,.1],[.06,.12],[.04,.14],[.02,.15],[0,.14],[-.02,.12],[-.04,.1],[-.06,.08],[-.08,.05],[-.1,.02],[-.11,-.02],[-.12,-.06],[-.11,-.1],[-.09,-.13],[-.06,-.16],[-.03,-.18]],c:[60,135,48],c2:[130,128,68]};
    /* South America */
    var SA={x:0.18,y:0.18,pts:[[0,-.14],[.03,-.15],[.05,-.13],[.07,-.1],[.08,-.06],[.07,-.02],[.06,.02],[.05,.06],[.04,.1],[.03,.14],[.02,.18],[.01,.2],[0,.19],[-.02,.17],[-.03,.14],[-.04,.1],[-.05,.06],[-.04,.02],[-.03,-.02],[-.03,-.06],[-.02,-.1],[-.01,-.12]],c:[55,140,45],c2:[80,135,55]};
    /* Australia */
    var AU={x:0.88,y:0.22,pts:[[0,-.06],[.04,-.07],[.07,-.05],[.09,-.03],[.1,0],[.09,.03],[.07,.05],[.04,.06],[.01,.05],[-.02,.04],[-.04,.02],[-.05,0],[-.04,-.02],[-.02,-.04]],c:[145,130,60],c2:[160,140,65]};
    /* Antarctica */
    var AN={x:0.5,y:0.52,pts:[[-.15,0],[-.12,-.02],[-.08,-.03],[-.04,-.03],[0,-.04],[.04,-.03],[.08,-.03],[.12,-.02],[.15,0],[.12,.02],[.08,.03],[.04,.03],[0,.04],[-.04,.03],[-.08,.03],[-.12,.02]],c:[230,235,245],c2:[220,228,240]};
    var allC=[AF,EU,AS,NA,SA,AU,AN];
    var SC=1.8;/* angular scale — matches old ecR=r*1.8 at center */
    for(var eci=0;eci<allC.length;eci++){
      var ec=allC[eci];
      var cp=sp3d(ec.x,ec.y);if(cp[2]>=0)continue;/* back-face cull */
      var depth=-cp[2],cpx=cx+cp[0]*r,cpy=cy-cp[1]*r;
      var uc=((ec.x+phase)%1+1)%1,lonC=uc*TAU+Math.PI*0.5;
      var sLatC=-ec.y,cLatC=Math.sqrt(Math.max(0,1-sLatC*sLatC));
      var lonSc=SC/Math.max(0.12,cLatC);/* longitude scale (rad per pts unit) */
      /* pre-compute projected vertices */
      var vpts=[];
      for(var ep=0;ep<ec.pts.length;ep++){
        var vdx=ec.pts[ep][0],vdy=ec.pts[ep][1];
        var vlv=lonC+vdx*lonSc;
        var vsv=Math.max(-0.99,Math.min(0.99,sLatC+(-vdy)*SC*cLatC));
        var vcv=Math.sqrt(Math.max(0,1-vsv*vsv)),vcLn=vcv*Math.cos(vlv);
        var vp=RX(RY([vcLn*cosTr+vsv*sinTr,-vcLn*sinTr+vsv*cosTr,vcv*Math.sin(vlv)],cry),crx);
        vpts.push([cx+vp[0]*r,cy-vp[1]*r]);
      }
      /* Coastal glow 1.15× (scale from projected center) */
      ctx.globalAlpha=depth*0.15;ctx.fillStyle="rgba(40,120,180,1)";ctx.beginPath();
      for(var gp=0;gp<vpts.length;gp++){var gx2=cpx+(vpts[gp][0]-cpx)*1.15,gy2=cpy+(vpts[gp][1]-cpy)*1.15;if(gp===0)ctx.moveTo(gx2,gy2);else ctx.lineTo(gx2,gy2);}
      ctx.closePath();ctx.fill();
      /* Main landmass 1× */
      ctx.globalAlpha=depth*0.95;ctx.fillStyle="rgba("+ec.c[0]+","+ec.c[1]+","+ec.c[2]+",1)";ctx.beginPath();
      for(var mp=0;mp<vpts.length;mp++){if(mp===0)ctx.moveTo(vpts[mp][0],vpts[mp][1]);else ctx.lineTo(vpts[mp][0],vpts[mp][1]);}
      ctx.closePath();ctx.fill();
      /* Interior detail 0.6× */
      if(ec.c2&&hi){ctx.globalAlpha=depth*0.35;ctx.fillStyle="rgba("+ec.c2[0]+","+ec.c2[1]+","+ec.c2[2]+",1)";ctx.beginPath();
        for(var ip=0;ip<vpts.length;ip++){var ix=cpx+(vpts[ip][0]-cpx)*0.6,iy=cpy+(vpts[ip][1]-cpy)*0.6;if(ip===0)ctx.moveTo(ix,iy);else ctx.lineTo(ix,iy);}
        ctx.closePath();ctx.fill();}
    }ctx.globalAlpha=1;
    /* Ice caps — centered on spherically-projected pole positions */
    var npd=-ap[2];/* >0 when north pole faces camera */
    if(npd>0){var npCapR=r*(0.12+0.28*npd);var npG=ctx.createRadialGradient(cx+ap[0]*r,cy-ap[1]*r,0,cx+ap[0]*r,cy-ap[1]*r,npCapR);npG.addColorStop(0,"rgba(240,245,255,0.88)");npG.addColorStop(0.45,"rgba(228,238,252,0.50)");npG.addColorStop(1,"rgba(210,225,245,0)");ctx.fillStyle=npG;ctx.fillRect(cx-R,cy-R,R*2,R*2);}
    var spd=ap[2];/* >0 when south pole faces camera */
    if(spd>0){var spCapR=r*(0.10+0.22*spd);var spG=ctx.createRadialGradient(cx-ap[0]*r,cy+ap[1]*r,0,cx-ap[0]*r,cy+ap[1]*r,spCapR);spG.addColorStop(0,"rgba(235,242,252,0.82)");spG.addColorStop(0.45,"rgba(220,232,248,0.42)");spG.addColorStop(1,"rgba(210,225,245,0)");ctx.fillStyle=spG;ctx.fillRect(cx-R,cy-R,R*2,R*2);}
    /* Clouds — spherically projected centers */
    if(hi){
      var cSeed=seedR(88);
      var cloudPh=phase*0.55;
      ctx.fillStyle="rgba(255,255,255,1)";
      for(var cl=0;cl<12;cl++){
        var clLng=cSeed()*1.0,clLat=(cSeed()-0.5)*1.4,clW=0.06+cSeed()*0.12,clH=0.015+cSeed()*0.02;
        var cu2=((clLng+cloudPh)%1+1)%1,clon2=cu2*TAU+Math.PI*0.5;
        var csL=-clLat,ccL=Math.sqrt(Math.max(0,1-csL*csL)),ccLon=ccL*Math.cos(clon2);
        var cp3=RX(RY([ccLon*cosTr+csL*sinTr,-ccLon*sinTr+csL*cosTr,ccL*Math.sin(clon2)],cry),crx);
        if(cp3[2]>=0)continue;
        var cd=-cp3[2],csx=cx+cp3[0]*r,csy=cy-cp3[1]*r;
        ctx.globalAlpha=0.18*cd;
        ctx.beginPath();
        for(var ck2=0;ck2<=12;ck2++){var ca3=(ck2/12)*TAU,crx3=clW*r*cd*(1+Math.sin(ca3*2+cl*1.3)*0.35),cry3=clH*r*2.5;
          if(ck2===0)ctx.moveTo(csx+Math.cos(ca3)*crx3,csy+Math.sin(ca3)*cry3);
          else ctx.lineTo(csx+Math.cos(ca3)*crx3,csy+Math.sin(ca3)*cry3);}
        ctx.closePath();ctx.fill();
      }
      ctx.globalAlpha=1;
    }
    /* Ocean specular highlight */
    var osg=ctx.createRadialGradient(cx-r*0.2,cy-r*0.2,0,cx-r*0.2,cy-r*0.2,r*0.5);
    osg.addColorStop(0,"rgba(120,170,230,0.15)");osg.addColorStop(1,"rgba(120,170,230,0)");
    ctx.fillStyle=osg;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    limbDarken(ctx,cx,cy,r,0.35);atm="80,140,255";
  }else if(tp==="mars"){
    var mg=ctx.createRadialGradient(cx,cy,0,cx,cy,r);mg.addColorStop(0,"rgba(195,110,65,1)");mg.addColorStop(0.5,"rgba(175,90,50,1)");mg.addColorStop(1,"rgba(140,70,40,1)");ctx.fillStyle=mg;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    var mReg=[{x:0.2,y:0.0,s:0.2},{x:-0.25,y:0.15,s:0.18},{x:0.55,y:-0.2,s:0.15},{x:0.4,y:0.3,s:0.12}];
    for(var mri=0;mri<mReg.length;mri++){var mr2=mReg[mri],mp3=sp3d(mr2.x,mr2.y);if(mp3[2]>=0)continue;var mrd=-mp3[2];ctx.globalAlpha=mrd*0.4;fillCirc(ctx,cx+mp3[0]*r,cy-mp3[1]*r,mr2.s*r*mrd,"rgba(120,60,35,1)");}ctx.globalAlpha=1;
    /* Mars ice caps — spherically projected poles */
    var mnpd=-ap[2];if(mnpd>0){var mnpG=ctx.createRadialGradient(cx+ap[0]*r,cy-ap[1]*r,0,cx+ap[0]*r,cy-ap[1]*r,r*(0.07+0.14*mnpd));mnpG.addColorStop(0,"rgba(235,240,248,0.92)");mnpG.addColorStop(0.55,"rgba(230,236,245,0.42)");mnpG.addColorStop(1,"rgba(220,230,242,0)");ctx.fillStyle=mnpG;ctx.fillRect(cx-R,cy-R,R*2,R*2);}
    var mspd=ap[2];if(mspd>0){var mspG=ctx.createRadialGradient(cx-ap[0]*r,cy+ap[1]*r,0,cx-ap[0]*r,cy+ap[1]*r,r*(0.05+0.10*mspd));mspG.addColorStop(0,"rgba(235,238,245,0.82)");mspG.addColorStop(0.55,"rgba(228,234,242,0.35)");mspG.addColorStop(1,"rgba(220,230,240,0)");ctx.fillStyle=mspG;ctx.fillRect(cx-R,cy-R,R*2,R*2);}
    limbDarken(ctx,cx,cy,r,0.35);atm="210,140,80";
  }else if(tp==="gas1"){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(screenTilt);ctx.translate(-cx,-cy);
    ctx.fillStyle="rgba(195,170,125,1)";ctx.fillRect(cx-R,cy-R,R*2,R*2);
    var jB=[{y:-0.88,h:0.1,v:185},{y:-0.72,h:0.12,v:215},{y:-0.55,h:0.1,v:165},{y:-0.4,h:0.14,v:225},{y:-0.22,h:0.1,v:175},{y:-0.08,h:0.16,v:220},{y:0.12,h:0.12,v:170},{y:0.28,h:0.14,v:218},{y:0.45,h:0.1,v:160},{y:0.58,h:0.14,v:212},{y:0.75,h:0.1,v:168},{y:0.88,h:0.1,v:205}];
    for(var jbi=0;jbi<jB.length;jbi++){var jb2=jB[jbi];ctx.fillStyle="rgba("+jb2.v+","+(jb2.v-25)+","+(jb2.v-70)+",1)";ctx.fillRect(cx-R,cy+jb2.y*r-jb2.h*r*0.5,R*2,jb2.h*r);if(r>22){ctx.globalAlpha=0.22;ctx.fillStyle="rgba("+(jb2.v+18)+","+(jb2.v-8)+","+(jb2.v-50)+",1)";for(var ssi=0;ssi<7;ssi++){var ssfx=((ssi/7+phase*(jbi%2?1.4:-1.2))%1)*2-1,ssfd=1-ssfx*ssfx;if(ssfd<0.18)continue;ctx.fillRect(cx+ssfx*r*0.86-r*0.045,cy+jb2.y*r-jb2.h*r*0.32,r*0.09*ssfd,jb2.h*r*0.65);}ctx.globalAlpha=1;}}
    var gx=((0.3+phase*1.1)%1)*2-1,gd=1-gx*gx;
    if(gd>0.12){var gpx=cx+gx*r*0.75,gpy=cy+r*0.22,gsz=r*0.14*gd;ctx.globalAlpha=0.7*gd;fillCirc(ctx,gpx,gpy,gsz,"rgba(195,95,60,1)");ctx.globalAlpha=0.4*gd;fillCirc(ctx,gpx,gpy,gsz*0.5,"rgba(175,70,45,1)");if(gsz>4){ctx.globalAlpha=0.45*gd;ctx.lineWidth=Math.max(0.7,gsz*0.06);ctx.strokeStyle="rgba(225,150,110,1)";var grsRot=phase*5.5;for(var sai=0;sai<3;sai++){ctx.beginPath();for(var sap=0;sap<16;sap++){var sat=sap/16,saR=gsz*(0.15+sat*0.85),saA=grsRot+sai*TAU/3+sat*5.0;var sax=gpx+Math.cos(saA)*saR*0.95,say=gpy+Math.sin(saA)*saR*0.6;if(sap===0)ctx.moveTo(sax,say);else ctx.lineTo(sax,say);}ctx.stroke();}}ctx.globalAlpha=1;}
    ctx.restore();limbDarken(ctx,cx,cy,r,0.3);atm="215,175,110";
  }else if(tp==="gas2"){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(screenTilt);ctx.translate(-cx,-cy);
    var sg2=ctx.createRadialGradient(cx,cy,0,cx,cy,r);sg2.addColorStop(0,"rgba(225,210,165,1)");sg2.addColorStop(1,"rgba(190,175,130,1)");ctx.fillStyle=sg2;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    var sB=[{y:-0.8,h:0.12,v:210},{y:-0.6,h:0.15,v:225},{y:-0.38,h:0.12,v:200},{y:-0.18,h:0.18,v:228},{y:0.05,h:0.14,v:205},{y:0.25,h:0.16,v:222},{y:0.45,h:0.12,v:198},{y:0.62,h:0.14,v:218},{y:0.8,h:0.12,v:195}];
    for(var sbi=0;sbi<sB.length;sbi++){var sb2=sB[sbi];ctx.fillStyle="rgba("+sb2.v+","+(sb2.v-15)+","+(sb2.v-62)+",0.7)";ctx.fillRect(cx-R,cy+sb2.y*r-sb2.h*r*0.5,R*2,sb2.h*r);}
    ctx.restore();limbDarken(ctx,cx,cy,r,0.25);atm="220,200,145";
  }else if(tp==="ice1"){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(screenTilt);ctx.translate(-cx,-cy);
    var ug=ctx.createRadialGradient(cx,cy,0,cx,cy,r);ug.addColorStop(0,"rgba(170,228,232,1)");ug.addColorStop(1,"rgba(110,185,195,1)");ctx.fillStyle=ug;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    ctx.fillStyle="rgba(140,210,218,0.07)";ctx.fillRect(cx-R,cy-r*0.6,R*2,r*0.25);ctx.fillRect(cx-R,cy+r*0.2,R*2,r*0.25);
    ctx.restore();limbDarken(ctx,cx,cy,r,0.25);atm="150,220,230";
  }else if(tp==="ice2"){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(screenTilt);ctx.translate(-cx,-cy);
    var ng=ctx.createRadialGradient(cx,cy,0,cx,cy,r);ng.addColorStop(0,"rgba(55,90,215,1)");ng.addColorStop(1,"rgba(25,45,150,1)");ctx.fillStyle=ng;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    ctx.fillStyle="rgba(50,80,200,0.4)";ctx.fillRect(cx-R,cy-r*0.5,R*2,r*0.2);ctx.fillRect(cx-R,cy+r*0.1,R*2,r*0.25);
    var ndx=((0.5+phase*0.9)%1)*2-1,ndd=1-ndx*ndx;
    if(ndd>0.15){ctx.globalAlpha=0.55*ndd;fillCirc(ctx,cx+ndx*r*0.7,cy-r*0.15,r*0.12*ndd,"rgba(25,40,130,1)");ctx.globalAlpha=1;}
    ctx.restore();limbDarken(ctx,cx,cy,r,0.3);atm="60,100,220";
  }
  sphereShade(ctx,cx,cy,r);
  ctx.restore();
  if(atm)atmosGlow(ctx,cx,cy,r,atm,0.1);
}

export { dOb, dRi, dRiUranus, dSh, dAx, drawPlanetBody, drawSun, mkStars, mkNeb, sSP, mkAst, mkGalaxy, mkNearStars, SD, NB, AST, TROJAN, KUIPER, GAL, GAL_COLS, GAL_R, SUN_GAL_R, SUN_GAL_ANG, NEAR_STARS, SUNSPOTS, drawEarthCityLights, drawMoonDetail };
