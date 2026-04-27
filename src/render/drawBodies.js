import { TAU } from "../data/solarData.js";
import { fillCirc, sphereShade, limbDarken, atmosGlow, seedR, pj, RX, RY } from "./utils.js";

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
function dRi(ctx,wx,wy,wz,pr,cam,td){var tr=td*0.01745,n=Math.max(36,Math.min(300,Math.floor(pr*2.3*cam.zm*0.6)));var ls=[{i:1.4,o:1.7,c:"rgba(200,180,130,0.45)"},{i:1.7,o:2.0,c:"rgba(190,170,120,0.35)"},{i:2.0,o:2.3,c:"rgba(170,150,100,0.25)"}];for(var li=0;li<3;li++){var L=ls[li],ot=[],it=[];for(var j=0;j<=n;j++){var a=(j/n)*TAU,ca=Math.cos(a),sa=Math.sin(a);ot.push(pj(wx+ca*pr*L.o,wy+sa*pr*L.o*Math.cos(tr),wz+sa*pr*L.o*Math.sin(tr),cam));it.push(pj(wx+ca*pr*L.i,wy+sa*pr*L.i*Math.cos(tr),wz+sa*pr*L.i*Math.sin(tr),cam));}ctx.beginPath();for(var k=0;k<ot.length;k++){if(k===0)ctx.moveTo(ot[k].x,ot[k].y);else ctx.lineTo(ot[k].x,ot[k].y);}for(var k2=it.length-1;k2>=0;k2--)ctx.lineTo(it[k2].x,it[k2].y);ctx.closePath();ctx.fillStyle=L.c;ctx.fill();}}
function dSh(ctx,px,py,r,wx,wz,cam){if(r<0.8)return;
  /* Compute light direction in view space */
  var sl=Math.sqrt(wx*wx+wz*wz);if(sl<0.01)return;
  var ld=RX(RY([-wx/sl,0,-wz/sl],cam.ry),cam.rx);
  /* ld[0],ld[1]=screen light dir; ld[2]>0=sun behind planet(dark side visible) */
  var scrAng=Math.atan2(ld[1],ld[0]);
  var termW=ld[2];/* -1:full lit, 0:quarter, +1:full dark */
  if(termW<-0.97)return;/* fully lit, no shadow */
  ctx.save();ctx.beginPath();ctx.arc(px,py,r,0,TAU);ctx.clip();
  ctx.translate(px,py);ctx.rotate(-scrAng);/* rotate so light=+x */
  /* Shadow region: left limb + terminator ellipse */
  var seg=Math.max(16,Math.floor(r*0.8));
  ctx.beginPath();
  /* Left semicircle (dark limb): top→left→bottom */
  ctx.arc(0,0,r+0.5,-1.5708,1.5708,true);
  /* Terminator: bottom→top via (termW*r, 0) */
  for(var k=0;k<=seg;k++){var a2=1.5708-(k/seg)*3.1416;ctx.lineTo(termW*r*Math.cos(a2),r*Math.sin(a2));}
  ctx.closePath();ctx.fillStyle="rgba(0,0,0,0.5)";ctx.fill();
  ctx.restore();}
function dAx(ctx,px,py,r,td){if(r<2)return;var tr=td*0.01745,len=r+Math.min(14,r*0.8),dx=Math.sin(tr)*len,dy=Math.cos(tr)*len;ctx.beginPath();ctx.moveTo(px-dx,py+dy);ctx.lineTo(px+dx,py-dy);ctx.strokeStyle="rgba(255,255,100,0.5)";ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);var ax=px+dx,ay=py-dy,ad=Math.atan2(-dy,dx);ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax-Math.cos(ad-0.4)*5,ay-Math.sin(ad-0.4)*5);ctx.moveTo(ax,ay);ctx.lineTo(ax-Math.cos(ad+0.4)*5,ay-Math.sin(ad+0.4)*5);ctx.strokeStyle="rgba(255,255,100,0.5)";ctx.lineWidth=1;ctx.stroke();}

/* ===== PLANET TEXTURES WITH TILT ROTATION ===== */
function drawPlanetBody(ctx,cx,cy,r,pl,rotAngle){
  if(r<1.5){fillCirc(ctx,cx,cy,Math.max(r,0.4),pl.c);return;}
  var tp=pl.type,phase=(((rotAngle%TAU)/TAU)%1+1)%1,hi=r>12,atm=null,R=r*1.5;
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.clip();
  ctx.translate(cx,cy);ctx.rotate(pl.t*0.01745);ctx.translate(-cx,-cy);

  if(tp==="rock"){
    var g=ctx.createRadialGradient(cx-r*0.15,cy-r*0.1,r*0.1,cx,cy,r);g.addColorStop(0,"rgba(170,168,160,1)");g.addColorStop(0.6,"rgba(140,138,130,1)");g.addColorStop(1,"rgba(100,98,92,1)");ctx.fillStyle=g;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    var crt=[[0.3,0.2,0.16],[0.72,0.55,0.12],[-0.18,0.38,0.09],[0.48,-0.28,0.2],[-0.42,-0.18,0.11],[0.12,0.68,0.08],[0.8,-0.1,0.1],[0.05,-0.55,0.14]];
    for(var ci=0;ci<crt.length;ci++){var c2=crt[ci],crx=((c2[0]+phase)%1)*2-1,cdf=1-crx*crx;if(cdf<0.1)continue;ctx.globalAlpha=0.45*cdf;fillCirc(ctx,cx+crx*r*0.82,cy+c2[1]*r*0.82,c2[2]*r*cdf,"rgba(95,92,85,1)");}ctx.globalAlpha=1;
    limbDarken(ctx,cx,cy,r,0.4);
  }else if(tp==="venus"){
    var vg=ctx.createRadialGradient(cx,cy,0,cx,cy,r);vg.addColorStop(0,"rgba(235,210,145,1)");vg.addColorStop(0.5,"rgba(220,195,120,1)");vg.addColorStop(1,"rgba(195,170,100,1)");ctx.fillStyle=vg;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    var vBands=[{y:-0.7,h:0.18,v:230},{y:-0.45,h:0.14,v:210},{y:-0.2,h:0.2,v:235},{y:0.3,h:0.18,v:228},{y:0.55,h:0.14,v:205}];
    for(var vbi=0;vbi<vBands.length;vbi++){var vb=vBands[vbi];ctx.globalAlpha=0.35;ctx.fillStyle="rgba("+vb.v+","+(vb.v-25)+","+(vb.v-95)+",1)";ctx.fillRect(cx-R,cy+vb.y*r-vb.h*r,R*2,vb.h*r*2);}ctx.globalAlpha=1;
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
    for(var eci=0;eci<allC.length;eci++){
      var ec=allC[eci],ecx=((ec.x+phase)%1)*2-1,ecd=1-ecx*ecx;if(ecd<0.04)continue;
      var ecR=r*1.8*ecd;
      /* Coastal shallow water glow */
      ctx.globalAlpha=ecd*0.15;
      ctx.fillStyle="rgba(40,120,180,1)";
      ctx.beginPath();for(var ep=0;ep<ec.pts.length;ep++){var px3=cx+ecx*r*0.85+ec.pts[ep][0]*ecR*1.15,py3=cy+ec.y*r+ec.pts[ep][1]*ecR*1.15;if(ep===0)ctx.moveTo(px3,py3);else ctx.lineTo(px3,py3);}ctx.closePath();ctx.fill();
      /* Main landmass */
      ctx.globalAlpha=ecd*0.95;
      ctx.fillStyle="rgba("+ec.c[0]+","+ec.c[1]+","+ec.c[2]+",1)";
      ctx.beginPath();for(var ep2=0;ep2<ec.pts.length;ep2++){var px4=cx+ecx*r*0.85+ec.pts[ep2][0]*ecR,py4=cy+ec.y*r+ec.pts[ep2][1]*ecR;if(ep2===0)ctx.moveTo(px4,py4);else ctx.lineTo(px4,py4);}ctx.closePath();ctx.fill();
      /* Interior variation (deserts/highlands) */
      if(ec.c2&&hi){ctx.globalAlpha=ecd*0.35;ctx.fillStyle="rgba("+ec.c2[0]+","+ec.c2[1]+","+ec.c2[2]+",1)";ctx.beginPath();for(var ep3=0;ep3<ec.pts.length;ep3++){var px5=cx+ecx*r*0.85+ec.pts[ep3][0]*ecR*0.6,py5=cy+ec.y*r+ec.pts[ep3][1]*ecR*0.6;if(ep3===0)ctx.moveTo(px5,py5);else ctx.lineTo(px5,py5);}ctx.closePath();ctx.fill();}
    }ctx.globalAlpha=1;
    /* Ice caps - realistic shape */
    var npG=ctx.createLinearGradient(cx,cy-r,cx,cy-r*0.82);npG.addColorStop(0,"rgba(240,245,255,0.8)");npG.addColorStop(0.5,"rgba(225,235,250,0.4)");npG.addColorStop(1,"rgba(210,225,245,0)");ctx.fillStyle=npG;ctx.fillRect(cx-R,cy-r,R*2,r*0.22);
    var spG=ctx.createLinearGradient(cx,cy+r,cx,cy+r*0.84);spG.addColorStop(0,"rgba(235,242,252,0.7)");spG.addColorStop(0.4,"rgba(220,232,248,0.3)");spG.addColorStop(1,"rgba(210,225,245,0)");ctx.fillStyle=spG;ctx.fillRect(cx-R,cy+r*0.8,R*2,r*0.22);
    /* Clouds - multiple layers */
    if(hi){
      var cSeed=seedR(88);
      ctx.globalAlpha=0.22;ctx.fillStyle="rgba(255,255,255,1)";
      for(var cl=0;cl<12;cl++){
        var clLng=cSeed()*1.0,clLat=(cSeed()-0.5)*1.4,clW=0.06+cSeed()*0.12,clH=0.015+cSeed()*0.02;
        var clx2=((clLng+phase*0.55)%1)*2-1,cld2=1-clx2*clx2;if(cld2<0.1)continue;
        ctx.globalAlpha=0.18*cld2;
        ctx.beginPath();
        for(var ck2=0;ck2<=12;ck2++){var ca3=(ck2/12)*TAU,crx3=clW*r*cld2*(1+Math.sin(ca3*2+cl*1.3)*0.35),cry2=clH*r*2.5;
          if(ck2===0)ctx.moveTo(cx+clx2*r*0.88+Math.cos(ca3)*crx3,cy+clLat*r+Math.sin(ca3)*cry2);
          else ctx.lineTo(cx+clx2*r*0.88+Math.cos(ca3)*crx3,cy+clLat*r+Math.sin(ca3)*cry2);}
        ctx.closePath();ctx.fill();
      }
      /* Tropical cloud band - ITCZ */
      ctx.globalAlpha=0.08;
      ctx.fillRect(cx-R,cy-r*0.05,R*2,r*0.08);
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
    for(var mri=0;mri<mReg.length;mri++){var mr2=mReg[mri],mrx=((mr2.x+phase)%1)*2-1,mrd=1-mrx*mrx;if(mrd<0.1)continue;ctx.globalAlpha=mrd*0.4;fillCirc(ctx,cx+mrx*r*0.8,cy+mr2.y*r,mr2.s*r*mrd,"rgba(120,60,35,1)");}ctx.globalAlpha=1;
    ctx.fillStyle="rgba(235,240,248,0.5)";ctx.fillRect(cx-R,cy-r,R*2,r*0.15);ctx.fillStyle="rgba(235,238,245,0.35)";ctx.fillRect(cx-R,cy+r*0.88,R*2,r*0.12);
    limbDarken(ctx,cx,cy,r,0.35);atm="210,140,80";
  }else if(tp==="gas1"){
    ctx.fillStyle="rgba(195,170,125,1)";ctx.fillRect(cx-R,cy-R,R*2,R*2);
    var jB=[{y:-0.88,h:0.1,v:185},{y:-0.72,h:0.12,v:215},{y:-0.55,h:0.1,v:165},{y:-0.4,h:0.14,v:225},{y:-0.22,h:0.1,v:175},{y:-0.08,h:0.16,v:220},{y:0.12,h:0.12,v:170},{y:0.28,h:0.14,v:218},{y:0.45,h:0.1,v:160},{y:0.58,h:0.14,v:212},{y:0.75,h:0.1,v:168},{y:0.88,h:0.1,v:205}];
    for(var jbi=0;jbi<jB.length;jbi++){var jb2=jB[jbi];ctx.fillStyle="rgba("+jb2.v+","+(jb2.v-25)+","+(jb2.v-70)+",1)";ctx.fillRect(cx-R,cy+jb2.y*r-jb2.h*r*0.5,R*2,jb2.h*r);}
    var gx=((0.3+phase*1.1)%1)*2-1,gd=1-gx*gx;
    if(gd>0.12){ctx.globalAlpha=0.7*gd;fillCirc(ctx,cx+gx*r*0.75,cy+r*0.22,r*0.14*gd,"rgba(195,95,60,1)");ctx.globalAlpha=0.4*gd;fillCirc(ctx,cx+gx*r*0.75,cy+r*0.22,r*0.07*gd,"rgba(175,70,45,1)");ctx.globalAlpha=1;}
    limbDarken(ctx,cx,cy,r,0.3);
  }else if(tp==="gas2"){
    var sg2=ctx.createRadialGradient(cx,cy,0,cx,cy,r);sg2.addColorStop(0,"rgba(225,210,165,1)");sg2.addColorStop(1,"rgba(190,175,130,1)");ctx.fillStyle=sg2;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    var sB=[{y:-0.8,h:0.12,v:210},{y:-0.6,h:0.15,v:225},{y:-0.38,h:0.12,v:200},{y:-0.18,h:0.18,v:228},{y:0.05,h:0.14,v:205},{y:0.25,h:0.16,v:222},{y:0.45,h:0.12,v:198},{y:0.62,h:0.14,v:218},{y:0.8,h:0.12,v:195}];
    for(var sbi=0;sbi<sB.length;sbi++){var sb2=sB[sbi];ctx.fillStyle="rgba("+sb2.v+","+(sb2.v-15)+","+(sb2.v-62)+",0.7)";ctx.fillRect(cx-R,cy+sb2.y*r-sb2.h*r*0.5,R*2,sb2.h*r);}
    limbDarken(ctx,cx,cy,r,0.25);
  }else if(tp==="ice1"){
    var ug=ctx.createRadialGradient(cx,cy,0,cx,cy,r);ug.addColorStop(0,"rgba(170,228,232,1)");ug.addColorStop(1,"rgba(110,185,195,1)");ctx.fillStyle=ug;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    ctx.fillStyle="rgba(140,210,218,0.07)";ctx.fillRect(cx-R,cy-r*0.6,R*2,r*0.25);ctx.fillRect(cx-R,cy+r*0.2,R*2,r*0.25);
    limbDarken(ctx,cx,cy,r,0.25);atm="150,220,230";
  }else if(tp==="ice2"){
    var ng=ctx.createRadialGradient(cx,cy,0,cx,cy,r);ng.addColorStop(0,"rgba(55,90,215,1)");ng.addColorStop(1,"rgba(25,45,150,1)");ctx.fillStyle=ng;ctx.fillRect(cx-R,cy-R,R*2,R*2);
    ctx.fillStyle="rgba(50,80,200,0.4)";ctx.fillRect(cx-R,cy-r*0.5,R*2,r*0.2);ctx.fillRect(cx-R,cy+r*0.1,R*2,r*0.25);
    var ndx=((0.5+phase*0.9)%1)*2-1,ndd=1-ndx*ndx;
    if(ndd>0.15){ctx.globalAlpha=0.55*ndd;fillCirc(ctx,cx+ndx*r*0.7,cy-r*0.15,r*0.12*ndd,"rgba(25,40,130,1)");ctx.globalAlpha=1;}
    limbDarken(ctx,cx,cy,r,0.3);atm="60,100,220";
  }
  sphereShade(ctx,cx,cy,r);ctx.restore();
  if(atm)atmosGlow(ctx,cx,cy,r,atm,0.1);
}

/* ===== STARS ===== */
function mkStars(){var r=seedR(42),o=[];var CC=["200,210,255","170,190,255","255,255,255","255,240,220","255,220,180","255,200,150","255,180,130","180,200,255"];for(var i=0;i<1000;i++){o.push({th:r()*TAU,ph:Math.acos(2*r()-1),l:r()<0.7?0:r()<0.7?1:2,b:0.15+r()*0.75+(r()<0.03?0.7:0),s:0.4+r()*0.9+(r()<0.02?1:0),ci:Math.floor(r()*CC.length),tw:r()*100});}for(var j=0;j<400;j++){o.push({th:r()*TAU,ph:1.5708+(r()-0.5)*0.35,l:0,b:0.08+r()*0.2,s:0.3+r()*0.5,ci:Math.floor(r()*CC.length),tw:r()*100});}return{s:o,c:CC};}
function mkNeb(){var r=seedR(77),o=[];var cs=[[80,40,120],[40,60,130],[120,50,60],[50,90,110],[100,60,90]];for(var i=0;i<10;i++){o.push({th:r()*TAU,ph:Math.acos(2*r()-1),ra:60+r()*140,cl:cs[Math.floor(r()*cs.length)],a:0.02+r()*0.04});}return o;}
function sSP(th,ph,rx,ry,dp){var x=Math.sin(ph)*Math.cos(th),y=Math.cos(ph),z=Math.sin(ph)*Math.sin(th),px=1-dp*0.15;var c1=Math.cos(-ry*px),s1=Math.sin(-ry*px),nx=x*c1+z*s1,nz=-x*s1+z*c1;x=nx;z=nz;var c2=Math.cos(-rx*px),s2=Math.sin(-rx*px),ny=y*c2-z*s2,nz2=y*s2+z*c2;return{x:x,y:ny,z:nz2};}
var SD=mkStars(),NB=mkNeb();
function mkAst(){var r=seedR(123),o=[];for(var i=0;i<200;i++){o.push({ang:r()*TAU,rad:330+r()*200,y:(r()-0.5)*8,sz:0.3+r()*1.2,spd:0.0002+r()*0.0003});}return o;}
var AST=mkAst();

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
  /* A few named stars */
  var named=[{n:"シリウス",d:0.003},{n:"プロキオン",d:0.004},{n:"ベガ",d:0.008},{n:"アルタイル",d:0.005},{n:"デネブ",d:0.5}];
  for(var ni=0;ni<named.length;ni++){var ns=named[ni],na=r()*TAU;o.push({x:SUN_GAL_R*Math.cos(SUN_GAL_ANG)+Math.cos(na)*ns.d*10,y:SUN_GAL_R*Math.sin(SUN_GAL_ANG)+Math.sin(na)*ns.d*10,b:0.8,name:ns.n});}
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
}

export { dOb, dRi, dSh, dAx, drawPlanetBody, drawSun, mkStars, mkNeb, sSP, mkAst, mkGalaxy, mkNearStars, SD, NB, AST, GAL, GAL_COLS, GAL_R, SUN_GAL_R, SUN_GAL_ANG, NEAR_STARS, SUNSPOTS };
