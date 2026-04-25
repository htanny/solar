import { useState, useRef, useEffect, useCallback } from "react";

var PL=[
  {n:"Mercury",j:"水星",d:58,r:2.4,p:88,c:"rgba(180,180,180,1)",t:0.03,rot:58.6,type:"rock",mass:"3.30×10²³ kg",grav:"3.7 m/s²",moons:0,day:"58.6日",year:"88日",atm:"ほぼ無し",temp:"−180〜430℃"},
  {n:"Venus",j:"金星",d:108,r:6.0,p:225,c:"rgba(230,180,80,1)",t:177.4,rot:-243,type:"venus",mass:"4.87×10²⁴ kg",grav:"8.9 m/s²",moons:0,day:"243日(逆行)",year:"225日",atm:"CO₂ 96%",temp:"約462℃"},
  {n:"Earth",j:"地球",d:150,r:6.4,p:365,c:"rgba(70,130,230,1)",t:23.4,rot:1,type:"earth",mass:"5.97×10²⁴ kg",grav:"9.8 m/s²",moons:1,day:"24時間",year:"365.25日",atm:"N₂ 78% O₂ 21%",temp:"平均15℃"},
  {n:"Mars",j:"火星",d:228,r:3.4,p:687,c:"rgba(210,100,60,1)",t:25.2,rot:1.03,type:"mars",mass:"6.42×10²³ kg",grav:"3.7 m/s²",moons:2,day:"24.6時間",year:"687日",atm:"CO₂ 95%",temp:"平均−63℃"},
  {n:"Jupiter",j:"木星",d:778,r:71.5,p:4333,c:"rgba(210,170,110,1)",t:3.1,rot:0.41,type:"gas1",mass:"1.90×10²⁷ kg",grav:"24.8 m/s²",moons:95,day:"9.9時間",year:"11.9年",atm:"H₂ 90% He 10%",temp:"−110℃"},
  {n:"Saturn",j:"土星",d:1427,r:60.3,p:10759,c:"rgba(220,200,150,1)",t:26.7,rot:0.44,type:"gas2",mass:"5.68×10²⁶ kg",grav:"10.4 m/s²",moons:146,day:"10.7時間",year:"29.5年",atm:"H₂ 96% He 3%",temp:"−140℃"},
  {n:"Uranus",j:"天王星",d:2871,r:25.6,p:30687,c:"rgba(150,220,230,1)",t:97.8,rot:-0.72,type:"ice1",mass:"8.68×10²⁵ kg",grav:"8.9 m/s²",moons:28,day:"17.2時間(逆行)",year:"84年",atm:"H₂ 83% He 15%",temp:"−195℃"},
  {n:"Neptune",j:"海王星",d:4495,r:24.8,p:60190,c:"rgba(60,100,220,1)",t:28.3,rot:0.67,type:"ice2",mass:"1.02×10²⁶ kg",grav:"11.2 m/s²",moons:16,day:"16.1時間",year:"165年",atm:"H₂ 80% He 19%",temp:"−200℃"},
];
var SUNINFO={j:"太陽",mass:"1.99×10³⁰ kg",r:"69.6万km",temp:"表面5,500℃ / 中心1,500万℃",type:"G型主系列星",age:"約46億年"};
var MD={oR:18,r:2.5,p:27.3,rd:0.384,rr:1.737};
var GMOONS=[{name:"イオ",orbR:421.7,r:1821,p:1.769,col:"rgba(220,200,100,1)"},{name:"エウロパ",orbR:671.0,r:1560,p:3.551,col:"rgba(180,170,150,1)"},{name:"ガニメデ",orbR:1070.4,r:2634,p:7.155,col:"rgba(160,155,140,1)"},{name:"カリスト",orbR:1882.7,r:2410,p:16.689,col:"rgba(130,125,115,1)"}];
var COMETS=[
  {key:"Halley",name:"ハレー彗星",a:17.8*150,e:0.967,p:27484,inc:0.05,col:[140,200,255],sz:1.5,tailLen:80,phase0:0.0,info:"周期: 約75.3年\n離心率: 0.967\n近日点: 0.586 AU\n遠日点: 35.1 AU\n発見: 紀元前240年（記録）\nエドモンド・ハレーが周期性を予言"},
  {key:"Encke",name:"エンケ彗星",a:2.22*150,e:0.848,p:1204,inc:-0.03,col:[180,220,200],sz:1,tailLen:40,phase0:0.35,info:"周期: 約3.3年\n離心率: 0.848\n近日点: 0.336 AU\n遠日点: 4.09 AU\n既知の彗星で最短周期"},
];
var PL_MAP={};PL.forEach(function(p){PL_MAP[p.n]=p;});
var COMET_MAP={};COMETS.forEach(function(c){COMET_MAP[c.key]=c;});
var DWARFS=[
  {n:"Ceres",j:"ケレス",e:"Ceres",d:414,r:0.47,p:1682,c:"rgba(155,150,143,1)",t:4.0,rot:0.378,type:"rock",mass:"9.39×10²⁰ kg",grav:"0.28 m/s²",moons:0,day:"9.1時間",year:"4.6年",atm:"なし",temp:"約−105℃"},
  {n:"Pluto",j:"冥王星",e:"Pluto",d:5906,r:1.19,p:90560,c:"rgba(200,185,165,1)",t:122.5,rot:6.39,type:"rock",mass:"1.30×10²² kg",grav:"0.62 m/s²",moons:5,day:"6.39日",year:"248年",atm:"N₂ 微量",temp:"約−230℃"},
  {n:"Eris",j:"エリス",e:"Eris",d:10120,r:1.16,p:203830,c:"rgba(185,185,188,1)",t:44.0,rot:1.08,type:"rock",mass:"1.66×10²² kg",grav:"0.82 m/s²",moons:1,day:"25.9時間",year:"558年",atm:"なし",temp:"約−240℃"},
];
var DWARF_MAP={};DWARFS.forEach(function(p){DWARF_MAP[p.n]=p;});
var SRR=695,DK=0.08,SK=0.18,TRAIL_LEN=200,TAU=6.2832;
var FL=[{k:"all",l:"全体",e:"All"},{k:"sun",l:"太陽",e:"Sun"},{k:"Mercury",l:"水星",e:"Mercury"},{k:"Venus",l:"金星",e:"Venus"},{k:"Earth",l:"地球",e:"Earth"},{k:"Mars",l:"火星",e:"Mars"},{k:"Jupiter",l:"木星",e:"Jupiter"},{k:"Saturn",l:"土星",e:"Saturn"},{k:"Uranus",l:"天王星",e:"Uranus"},{k:"Neptune",l:"海王星",e:"Neptune"},{k:"Ceres",l:"ケレス",e:"Ceres"},{k:"Pluto",l:"冥王星",e:"Pluto"},{k:"Eris",l:"エリス",e:"Eris"},{k:"Halley",l:"ハレー彗星",e:"Halley"},{k:"Encke",l:"エンケ彗星",e:"Encke"}];
var SP=[0.5,1,4,15,50,100];
var ZS=[0.00002,0.00005,0.00012,0.0003,0.0007,0.002,0.005,0.012,0.025,0.04,0.07,0.1,0.15,0.22,0.35,0.5,0.7,1,1.5,2.2,3.5,5,8,13,22,40,70,120,200,350,600,1100,2000,4000,8000,16000,35000,70000,150000];
var TOUR_SEQ=["sun","Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune","Halley","Encke"];
var TOUR_NAMES=["太陽","水星","金星","地球","火星","木星","土星","天王星","海王星","ハレー彗星","エンケ彗星"];
var TOUR_HOLD=4;
var LAND_SP=[
  {v:1/86400,l:"実速"},{v:60/86400,l:"1分/s"},
  {v:3600/86400,l:"1時/s"},{v:1,l:"1日/s"},
  {v:30,l:"1月/s"},{v:365,l:"1年/s"}
];
var MAP_CTNS=[
  [[10,-35],[36,-35],[52,-8],[55,12],[42,37],[18,37],[2,32],[-5,22],[-18,15],[-18,-5],[10,-35]],
  [[-10,35],[40,35],[40,52],[28,60],[20,71],[5,71],[-5,62],[-10,52],[-10,35]],
  [[25,5],[100,5],[145,12],[150,50],[145,62],[90,75],[50,75],[25,65],[25,5]],
  [[-170,65],[-55,65],[-52,47],[-52,10],[-80,8],[-90,22],[-120,5],[-170,40],[-170,65]],
  [[-82,12],[-35,5],[-34,-30],[-52,-56],[-70,-56],[-82,12]],
  [[114,-10],[154,-10],[154,-39],[114,-39]],
  [[-72,60],[-18,60],[-18,84],[-72,82]],
  [[-180,-65],[180,-65],[180,-90],[-180,-90]],
];
var NAMED_STARS=[
  {n:"シリウス",    ra:101.3,dec:-16.7,col:"rgba(200,220,255,"},
  {n:"カノープス",  ra:95.9, dec:-52.7,col:"rgba(255,255,220,"},
  {n:"アークトゥルス",ra:213.9,dec:19.2,col:"rgba(255,220,150,"},
  {n:"ベガ",        ra:279.2,dec:38.8, col:"rgba(220,230,255,"},
  {n:"カペラ",      ra:79.2, dec:46.0, col:"rgba(255,240,200,"},
  {n:"リゲル",      ra:78.6, dec:-8.2, col:"rgba(200,220,255,"},
  {n:"プロキオン",  ra:114.8,dec:5.2,  col:"rgba(255,250,230,"},
  {n:"ベテルギウス",ra:88.8, dec:7.4,  col:"rgba(255,180,120,"},
  {n:"アルタイル",  ra:297.7,dec:8.9,  col:"rgba(240,250,255,"},
  {n:"アルデバラン",ra:69.0, dec:16.5, col:"rgba(255,200,130,"},
  {n:"アンタレス",  ra:247.4,dec:-26.4,col:"rgba(255,160,100,"},
  {n:"スピカ",      ra:201.3,dec:-11.2,col:"rgba(200,220,255,"},
  {n:"デネブ",      ra:310.4,dec:45.3, col:"rgba(240,250,255,"},
  {n:"フォーマルハウト",ra:344.4,dec:-29.6,col:"rgba(230,240,255,"},
  {n:"北極星",      ra:37.9, dec:89.3, col:"rgba(255,255,255,"},
];
/* Constellation line data: {n,s:[[ra,dec],...],l:[[i,j],...]} */
var CONST_LINES=[
  {n:"オリオン",s:[[88.79,7.41],[78.63,-8.20],[81.28,6.35],[83.00,-0.30],[84.05,-1.20],[85.19,-1.94],[76.96,-9.67],[83.78,9.93]],
   l:[[7,0],[7,2],[0,2],[0,5],[2,3],[3,4],[4,5],[1,3],[6,5]]},
  {n:"おおぐま",s:[[165.93,61.75],[165.46,56.38],[178.46,53.69],[183.86,57.03],[193.51,55.96],[200.98,54.93],[206.89,49.31]],
   l:[[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]]},
  {n:"カシオペア",s:[[2.29,59.15],[10.13,56.54],[14.18,60.72],[21.45,60.24],[28.60,63.67]],
   l:[[0,1],[1,2],[2,3],[3,4]]},
  {n:"さそり",s:[[247.35,-26.43],[241.36,-19.81],[240.08,-22.62],[252.54,-34.29],[263.40,-37.10],[264.33,-43.00],[255.99,-39.03]],
   l:[[1,2],[2,0],[0,3],[3,6],[6,4],[4,5]]},
  {n:"しし",s:[[152.09,11.97],[177.26,14.57],[154.99,19.84],[168.53,20.52],[171.13,15.43],[146.46,23.77]],
   l:[[0,2],[2,5],[2,3],[3,4],[4,1],[0,4]]},
  {n:"はくちょう",s:[[310.36,45.28],[305.56,40.26],[292.68,27.96],[311.55,33.97],[296.24,45.13]],
   l:[[0,1],[1,2],[0,3],[4,1]]},
  {n:"みなみじゅうじ",s:[[186.65,-63.10],[191.93,-59.69],[187.79,-57.11],[183.79,-58.75]],
   l:[[0,2],[3,1]]},
  {n:"おうし",s:[[69.0,16.5],[84.41,21.14],[81.57,28.61],[56.87,24.11],[67.15,19.18]],
   l:[[0,1],[1,2],[0,4],[0,3]]},
];
/* Zodiac signs: [ecliptic_longitude_deg, jp_name, symbol] */
var ZODIAC=[[0,"おひつじ","♈"],[30,"おうし","♉"],[60,"ふたご","♊"],[90,"かに","♋"],
  [120,"しし","♌"],[150,"おとめ","♍"],[180,"てんびん","♎"],[210,"さそり","♏"],
  [240,"いて","♐"],[270,"やぎ","♑"],[300,"みずがめ","♒"],[330,"うお","♓"]];
/* Spring equinox sim angle: Earth at sim_angle=eqAng when sun enters Aries */
var ZODIAC_BASE=(79/365)*TAU+Math.PI;/* Aries direction from Sun in simulation frame */

function oR(p,rd,un){if(un||rd)return p.d*DK;var v=p.d;if(v<=228)return 40+(v/228)*120;return 160+Math.pow((v-228)/4267,0.55)*280;}
function pRf(p,rp,un){if(un)return Math.max((p.r/1000)*DK,0.0001);if(rp)return Math.max(p.r*SK,0.7);if(p.r>50)return 10+(p.r-50)*0.06;if(p.r>20)return 6+(p.r-20)*0.12;return 3+p.r*0.4;}
function sRf(rs,un){if(un)return(SRR/1000)*DK;if(rs)return SRR*SK;return 18;}
function mOf(rd,un){if(un)return MD.rd*DK;if(rd)return MD.rd*1000*DK;return MD.oR;}
function mRf(rp,un){if(un)return Math.max((MD.rr/1000)*DK,0.0001);if(rp)return Math.max(MD.rr*SK,0.5);return MD.r;}
function RY(p,a){var c=Math.cos(a),s=Math.sin(a);return[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];}
function RX(p,a){var c=Math.cos(a),s=Math.sin(a);return[p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c];}
function pj(x,y,z,c){var p=RX(RY([x-c.fx,y-c.fy,z-c.fz],c.ry),c.rx);return{x:p[0]*c.zm,y:p[1]*c.zm,z:p[2]};}

/* All circles use ctx.arc for perfect rendering */
function clipCirc(ctx,cx,cy,r){ctx.beginPath();ctx.arc(cx,cy,Math.max(r,0.1),0,TAU);ctx.closePath();}
function fillCirc(ctx,cx,cy,r,f){ctx.beginPath();ctx.arc(cx,cy,Math.max(r,0.1),0,TAU);ctx.fillStyle=f;ctx.fill();}
function sphereShade(ctx,cx,cy,r){var g=ctx.createRadialGradient(cx-r*0.25,cy-r*0.25,r*0.1,cx,cy,r);g.addColorStop(0,"rgba(255,255,255,0.12)");g.addColorStop(0.5,"rgba(255,255,255,0)");g.addColorStop(1,"rgba(0,0,0,0.15)");ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fillStyle=g;ctx.fill();}
function limbDarken(ctx,cx,cy,r,i){var g=ctx.createRadialGradient(cx,cy,r*0.3,cx,cy,r);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(0.7,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,"+(i||0.35)+")");ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fillStyle=g;ctx.fill();}
function atmosGlow(ctx,cx,cy,r,col,w){var g=ctx.createRadialGradient(cx,cy,r*(1-w),cx,cy,r*1.08);g.addColorStop(0,"rgba("+col+",0)");g.addColorStop(0.5,"rgba("+col+",0.08)");g.addColorStop(1,"rgba("+col+",0)");ctx.fillStyle=g;ctx.fillRect(cx-r*1.1,cy-r*1.1,r*2.2,r*2.2);}
function dC(ctx,cx,cy,r,f){if(r<0.3){ctx.fillStyle=f;ctx.fillRect(cx-0.5,cy-0.5,1,1);return;}fillCirc(ctx,cx,cy,r,f);}
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
function seedR(s){var v=s;return function(){v=(v*16807)%2147483647;return(v-1)/2147483646;};}
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
/* Draggable panel */
function DragPanel(props){
  var ref=useRef(null),dr=useRef(null);
  var[pos,setPos]=useState(null);
  function onDown(e){
    if(e.target.tagName==="BUTTON"||e.target.tagName==="INPUT")return;
    var el=ref.current;if(!el)return;
    var r=el.getBoundingClientRect();
    var cx=e.clientX!==undefined?e.clientX:e.touches[0].clientX;
    var cy=e.clientY!==undefined?e.clientY:e.touches[0].clientY;
    dr.current={ox:cx-r.left,oy:cy-r.top};
    function onMove(ev){
      ev.preventDefault();
      var mx=ev.clientX!==undefined?ev.clientX:ev.touches[0].clientX;
      var my=ev.clientY!==undefined?ev.clientY:ev.touches[0].clientY;
      setPos({x:mx-dr.current.ox,y:my-dr.current.oy});
    }
    function onUp(){window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);window.removeEventListener("touchmove",onMove);window.removeEventListener("touchend",onUp);}
    window.addEventListener("mousemove",onMove);window.addEventListener("mouseup",onUp);
    window.addEventListener("touchmove",onMove,{passive:false});window.addEventListener("touchend",onUp);
  }
  var st=Object.assign({},props.style||{},{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"});
  if(pos){st.position="absolute";st.left=pos.x;st.top=pos.y;st.right="auto";st.bottom="auto";}
  return <div ref={ref} style={st} onMouseDown={onDown} onTouchStart={onDown}>{props.children}</div>;
}

/* J2000 epoch: 2000-01-01T12:00:00Z = day 0 for our simulation */
/* ===== LANDING VIEW ===== */
var SURF={
  Mercury:{atm:0,sunSz:6.7,g:"rgba(105,100,90,1)",skyTop:"0,0,0",skyBot:"5,5,8"},
  Venus:{atm:3,sunSz:1.9,g:"rgba(110,85,45,1)",skyTop:"160,120,50",skyBot:"140,100,40"},
  Earth:{atm:1,sunSz:1,g:"rgba(45,110,40,1)",skyTop:"70,140,255",skyBot:"140,190,255",skyNT:"3,5,18",skyNB:"8,15,40"},
  Mars:{atm:0.3,sunSz:0.43,g:"rgba(155,85,45,1)",skyTop:"160,110,75",skyBot:"190,140,95"},
  Jupiter:{atm:2,sunSz:0.037,g:"rgba(155,125,85,1)",skyTop:"150,120,80",skyBot:"170,140,100"},
  Saturn:{atm:2,sunSz:0.011,g:"rgba(175,155,115,1)",skyTop:"170,150,110",skyBot:"185,165,130"},
  Uranus:{atm:1.5,sunSz:0.0027,g:"rgba(130,175,180,1)",skyTop:"60,110,120",skyBot:"90,150,160"},
  Neptune:{atm:1.5,sunSz:0.0011,g:"rgba(35,55,135,1)",skyTop:"15,25,90",skyBot:"30,50,130"},
  Ceres:{atm:0,sunSz:0.13,g:"rgba(100,95,88,1)",skyTop:"0,0,0",skyBot:"3,3,5"},
  Pluto:{atm:0,sunSz:0.0025,g:"rgba(165,145,125,1)",skyTop:"0,0,0",skyBot:"2,2,4"},
  Eris:{atm:0,sunSz:0.0007,g:"rgba(155,155,158,1)",skyTop:"0,0,0",skyBot:"1,1,3"},
};
function lerpColor(a,b,f){var pa=a.split(",").map(Number),pb=b.split(",").map(Number);return Math.round(pa[0]+(pb[0]-pa[0])*f)+","+Math.round(pa[1]+(pb[1]-pa[1])*f)+","+Math.round(pa[2]+(pb[2]-pa[2])*f);}

/* Seeded terrain heightmap for horizon mountains */
function terrainH(x,seed){return(Math.sin(x*0.02+seed)*0.4+Math.sin(x*0.057+seed*2.3)*0.3+Math.sin(x*0.13+seed*5.1)*0.2+Math.sin(x*0.31+seed*11)*0.1)*0.5+0.5;}

function drawLanding(ctx,W,H,t,plName,yaw,lat,fov,lngDeg,tilt){
  var sf=SURF[plName];if(!sf)return;
  var pl=PL_MAP[plName]||DWARF_MAP[plName];if(!pl)return;
  fov=fov||1;/* FOV multiplier: <1 zoom in, >1 zoom out */
  var rot=pl.rot,rotAbs=Math.abs(rot);
  var solarDay;
  if(rot<0)solarDay=1/(1/rotAbs+1/pl.p);else solarDay=Math.abs(1/(1/rotAbs-1/pl.p));
  if(!isFinite(solarDay)||solarDay>1e6)solarDay=rotAbs;
  if(plName==="Earth")solarDay=1;/* rot=1 in data = solar day, not sidereal; use 1.0 exactly */
  var dayPh=((t/solarDay+0.25)%1+1)%1;
  var sunDir=rot<0?-1:1;
  var sunHourAng=(dayPh+(lngDeg||0)/360)*TAU*sunDir;
  var effTilt=pl.t>90?(180-pl.t):pl.t;
  var season=Math.sin((t/pl.p)*TAU);
  var effTR=effTilt*0.01745;
  var latRad=(lat||0)*0.01745;
  var decl=effTR*season;
  var sinAlt=Math.sin(latRad)*Math.sin(decl)+Math.cos(latRad)*Math.cos(decl)*Math.sin(sunHourAng);
  var sunAlt=Math.max(-0.95,Math.min(0.95,sinAlt));
  var sunAz=Math.atan2(Math.cos(sunHourAng)*Math.cos(decl),Math.sin(decl)*Math.cos(latRad)-Math.cos(decl)*Math.sin(latRad)*Math.sin(sunHourAng));
  var aDiffSun=((sunAz-yaw)%TAU+TAU)%TAU;if(aDiffSun>Math.PI)aDiffSun-=TAU;
  var sunScreenX=W/2+aDiffSun*W*0.8/TAU;
  var isNight=sunAlt<-0.08;
  var dayF=Math.max(0,Math.min(1,sunAlt*4+0.5));
  var hrzY=Math.max(H*0.05,Math.min(H*0.92,H*(0.58-(tilt||0)*0.01)));
  var rng=seedR(plName.length*7+31);

  /* ======== SKY ======== */
  var sTop=sf.skyTop,sBot=sf.skyBot;
  if(sf.skyNT){sTop=lerpColor(sf.skyNT,sf.skyTop,dayF);sBot=lerpColor(sf.skyNB,sf.skyBot,dayF);}
  var skyG=ctx.createLinearGradient(0,0,0,hrzY);
  skyG.addColorStop(0,"rgba("+sTop+",1)");skyG.addColorStop(1,"rgba("+sBot+",1)");
  ctx.fillStyle=skyG;ctx.fillRect(0,0,W,hrzY);

  /* ======== STARS ======== */
  var starA=sf.atm<0.5?0.7:(isNight?0.65:Math.max(0,(0.15-sunAlt)*3));
  if(starA>0.01){var sr2=seedR(42);for(var si=0;si<250;si++){var sx2=(sr2()*W*4+yaw*100)%W,sy2=sr2()*hrzY*0.92;var sb=0.3+sr2()*0.7;ctx.fillStyle="rgba(255,255,255,"+(sb*starA).toFixed(2)+")";var ss=sr2()<0.03?1.5:0.7;ctx.fillRect(sx2,sy2,ss,ss);}}

  /* ======== NAMED STARS ======== */
  if(starA>0.05){
    var lstD=((280.46+360.98565*t+(lngDeg||0))%360+360)%360;
    ctx.font="7px sans-serif";ctx.textAlign="left";
    for(var nsi=0;nsi<NAMED_STARS.length;nsi++){
      var ns=NAMED_STARS[nsi];
      var Hr2=(lstD-ns.ra)*TAU/360;
      var decR2=ns.dec*TAU/360;
      var sAltN=Math.sin(latRad)*Math.sin(decR2)+Math.cos(latRad)*Math.cos(decR2)*Math.cos(Hr2);
      if(sAltN<0.03)continue;
      var azN=Math.atan2(-Math.sin(Hr2)*Math.cos(decR2),Math.sin(decR2)*Math.cos(latRad)-Math.cos(decR2)*Math.sin(latRad)*Math.cos(Hr2));
      var aDiff=((azN-yaw)%TAU+TAU)%TAU;if(aDiff>Math.PI)aDiff-=TAU;
      if(Math.abs(aDiff)>TAU*0.28)continue;
      var sxN=W/2+aDiff*W*0.8/TAU;
      var syN=hrzY-sAltN*hrzY*0.75;
      if(syN>hrzY-15)continue;
      var nA=Math.min(1,starA*0.85);
      fillCirc(ctx,sxN,syN,2,ns.col+nA.toFixed(2)+")");
      ctx.fillStyle="rgba(255,255,255,"+(nA*0.5).toFixed(2)+")";
      ctx.fillText(ns.n,sxN+4,syN+3);
    }
    ctx.textAlign="center";
  }

  /* ======== CONSTELLATION LINES ======== */
  if(starA>0.05){
    ctx.save();ctx.lineWidth=0.6;
    for(var cli=0;cli<CONST_LINES.length;cli++){
      var cl=CONST_LINES[cli];
      var clSx=[],clSy=[],clVis=[];
      for(var csi=0;csi<cl.s.length;csi++){
        var csHr=(lstD-cl.s[csi][0])*TAU/360,csDecR=cl.s[csi][1]*TAU/360;
        var csAlt=Math.sin(latRad)*Math.sin(csDecR)+Math.cos(latRad)*Math.cos(csDecR)*Math.cos(csHr);
        var csAz=Math.atan2(-Math.sin(csHr)*Math.cos(csDecR),Math.sin(csDecR)*Math.cos(latRad)-Math.cos(csDecR)*Math.sin(latRad)*Math.cos(csHr));
        var csDiff=((csAz-yaw)%TAU+TAU)%TAU;if(csDiff>Math.PI)csDiff-=TAU;
        clSx.push(W/2+csDiff*W*0.8/TAU);clSy.push(hrzY-csAlt*hrzY*0.75);
        clVis.push(csAlt>0.03&&Math.abs(csDiff)<TAU*0.32&&hrzY-csAlt*hrzY*0.75<hrzY-10);
      }
      var anyVis=false;for(var cv=0;cv<clVis.length;cv++)if(clVis[cv])anyVis=true;
      if(!anyVis)continue;
      ctx.strokeStyle="rgba(100,160,255,"+(starA*0.35).toFixed(2)+")";
      for(var lli=0;lli<cl.l.length;lli++){
        var la=cl.l[lli][0],lb2=cl.l[lli][1];
        if(!clVis[la]||!clVis[lb2])continue;
        ctx.beginPath();ctx.moveTo(clSx[la],clSy[la]);ctx.lineTo(clSx[lb2],clSy[lb2]);ctx.stroke();
      }
      /* Constellation name at centroid of visible stars */
      var cxSum=0,cySum=0,cCount=0;
      for(var cvi=0;cvi<clVis.length;cvi++){if(clVis[cvi]){cxSum+=clSx[cvi];cySum+=clSy[cvi];cCount++;}}
      if(cCount>0){ctx.fillStyle="rgba(130,180,255,"+(starA*0.5).toFixed(2)+")";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(cl.n,cxSum/cCount,cySum/cCount-8);}
    }
    ctx.restore();
  }

  /* ======== SUN ======== */
  var sunY=hrzY-sunAlt*hrzY*0.75;
  if(sunAlt>-0.2&&sunY<hrzY+30&&Math.abs(aDiffSun)<TAU*0.32){
    var sunR=Math.max(2,14*Math.sqrt(sf.sunSz)/fov);
    var glR=sunR*10;var sg=ctx.createRadialGradient(sunScreenX,sunY,sunR,sunScreenX,sunY,glR);
    sg.addColorStop(0,"rgba(255,240,200,0.25)");sg.addColorStop(0.3,"rgba(255,200,100,0.06)");sg.addColorStop(1,"rgba(255,180,80,0)");
    ctx.fillStyle=sg;ctx.fillRect(sunScreenX-glR,sunY-glR,glR*2,glR*2);
    ctx.globalAlpha=plName==="Venus"?0.25:1;
    fillCirc(ctx,sunScreenX,sunY,sunR,"rgba(255,245,220,1)");ctx.globalAlpha=1;
    if(sunAlt>-0.1&&sunAlt<0.35){var ga=Math.max(0,(0.35-Math.abs(sunAlt-0.1))*1.5);var hg=ctx.createLinearGradient(0,hrzY-80,0,hrzY);hg.addColorStop(0,"rgba(255,130,40,0)");hg.addColorStop(1,"rgba(255,100,30,"+(ga*0.25).toFixed(2)+")");ctx.fillStyle=hg;ctx.fillRect(0,hrzY-80,W,80);}
  }

  /* ======== OTHER CELESTIAL BODIES IN SKY ======== */
  var nightAlpha=Math.max(0.2,1-dayF);
  if(plName==="Earth"){
    /* Moon - visible day and night */
    var moonAng=(t/27.3)*TAU;var moonPhX=((moonAng/(TAU)+0.3)%1)*W;
    var moonAlt2=0.5+Math.sin(moonAng*0.5)*0.3;var moonY2=hrzY*(1-moonAlt2);
    var moonScrX=(moonPhX+yaw*40)%W;
    if(moonAlt2>0.1){
      var moonRad=Math.max(4,8/fov);
      /* Moon phase via ecliptic longitudes */
      var sunLngE=(280.46+0.9856*t+36000)%360;
      var moonLngE=(218.316+13.176396*t+360000)%360;
      var moonPh=((moonLngE-sunLngE)/360+100)%1;
      var mkx=moonRad*Math.cos(moonPh*TAU);
      var mA=Math.min(0.95,nightAlpha*0.85+0.1);
      ctx.save();ctx.beginPath();ctx.arc(moonScrX,moonY2,moonRad,0,TAU);ctx.clip();
      ctx.fillStyle="rgba(15,18,35,1)";ctx.fillRect(moonScrX-moonRad,moonY2-moonRad,moonRad*2,moonRad*2);
      if(moonPh>0.02&&moonPh<0.98){
        ctx.fillStyle="rgba(235,235,210,"+mA.toFixed(2)+")";ctx.beginPath();
        if(moonPh<0.5){ctx.arc(moonScrX,moonY2,moonRad,-Math.PI/2,Math.PI/2,false);}
        else{ctx.arc(moonScrX,moonY2,moonRad,-Math.PI/2,Math.PI/2,true);}
        ctx.bezierCurveTo(moonScrX+mkx,moonY2+moonRad,moonScrX+mkx,moonY2-moonRad,moonScrX,moonY2-moonRad);
        ctx.fill();
      }else{
        ctx.fillStyle="rgba(235,235,210,"+mA.toFixed(2)+")";
        ctx.beginPath();ctx.arc(moonScrX,moonY2,moonRad,0,TAU);ctx.fill();
      }
      ctx.restore();
      /* Glow */
      var mg=ctx.createRadialGradient(moonScrX,moonY2,moonRad,moonScrX,moonY2,moonRad*3);
      mg.addColorStop(0,"rgba(255,255,220,"+(0.12*nightAlpha).toFixed(2)+")");mg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=mg;ctx.fillRect(moonScrX-moonRad*3,moonY2-moonRad*3,moonRad*6,moonRad*6);
      /* Phase label */
      ctx.fillStyle="rgba(200,200,180,"+(0.4*nightAlpha).toFixed(2)+")";ctx.font="7px sans-serif";ctx.textAlign="center";
      var phaseNames=["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"];ctx.fillText(phaseNames[Math.round(moonPh*8)%8],moonScrX,moonY2+moonRad+9);
    }
    /* Venus as evening/morning star */
    if(!isNight||sunAlt>-0.3){var venX=(W*0.3+t*0.1+yaw*60)%W,venY=hrzY*0.4+Math.sin(t*0.01)*hrzY*0.1;
      ctx.globalAlpha=Math.max(0,(0.3-sunAlt)*2)*0.7;fillCirc(ctx,venX,venY,2,"rgba(255,255,200,1)");
      var vglow=ctx.createRadialGradient(venX,venY,1,venX,venY,8);vglow.addColorStop(0,"rgba(255,255,200,0.3)");vglow.addColorStop(1,"rgba(255,255,200,0)");ctx.fillStyle=vglow;ctx.fillRect(venX-8,venY-8,16,16);ctx.globalAlpha=1;}
  }else if(plName==="Mars"){
    /* Phobos - fast, large moon */
    var phAng=(t/0.319)*TAU,phX=(W*0.5+Math.cos(phAng+yaw)*W*0.3),phY=hrzY*0.35+Math.sin(phAng)*hrzY*0.15;
    ctx.globalAlpha=0.7*nightAlpha;fillCirc(ctx,phX,phY,3/fov,"rgba(180,170,150,1)");ctx.globalAlpha=1;
    /* Deimos - slower, smaller */
    var deAng=(t/1.263)*TAU,deX=(W*0.5+Math.cos(deAng+yaw*0.8)*W*0.25),deY=hrzY*0.45+Math.sin(deAng)*hrzY*0.1;
    ctx.globalAlpha=0.5*nightAlpha;fillCirc(ctx,deX,deY,1.5/fov,"rgba(170,160,140,1)");ctx.globalAlpha=1;
    /* Earth as bright point */
    var eaX=(W*0.7+t*0.05+yaw*50)%W;ctx.globalAlpha=0.6*nightAlpha;fillCirc(ctx,eaX,hrzY*0.3,1.5,"rgba(100,150,255,1)");ctx.globalAlpha=1;
  }else if(plName==="Jupiter"){
    /* Galilean moons - large and dramatic */
    for(var gmi=0;gmi<GMOONS.length;gmi++){var gm=GMOONS[gmi];
      var gmA=(t/gm.p)*TAU,gmScrX=(W*0.5+Math.cos(gmA+yaw)*W*0.35);
      var gmScrY=hrzY*0.25+Math.sin(gmA*0.3)*hrzY*0.15;
      var gmSz=(gmi===2?4:gmi===3?3.5:gmi===0?3:2.5)/fov;
      ctx.globalAlpha=0.8;fillCirc(ctx,gmScrX,gmScrY,gmSz,gm.col);
      if(gmSz>2.5){ctx.fillStyle="rgba(255,255,255,0.2)";ctx.font="7px sans-serif";ctx.textAlign="center";ctx.fillText(gm.name,gmScrX,gmScrY-gmSz-3);}
      ctx.globalAlpha=1;}
  }else if(plName==="Saturn"){
    /* Titan - visible as bright dot */
    var tiAng=(t/15.945)*TAU,tiX=(W*0.4+Math.cos(tiAng+yaw)*W*0.2),tiY=hrzY*0.35;
    ctx.globalAlpha=0.6;fillCirc(ctx,tiX,tiY,2.5/fov,"rgba(200,180,120,1)");ctx.globalAlpha=1;
  }

  /* ======== AURORA (Earth lat>55°, Jupiter lat>45°) ======== */
  var absLat=Math.abs(lat||0);
  if((plName==="Earth"&&absLat>55)||(plName==="Jupiter"&&absLat>40)){
    var auroraStr=(plName==="Jupiter"?1.5:1)*Math.max(0,(absLat-(plName==="Jupiter"?40:55))/35);
    auroraStr=Math.min(1,auroraStr)*nightAlpha;
    if(auroraStr>0.02){
      for(var ai=0;ai<8;ai++){
        var ax=(ai/8)*W,aw=W*0.15,aH=hrzY*0.3;
        var ay=hrzY*0.05+Math.sin(ai*1.3+t*0.7)*hrzY*0.08;
        var wave=Math.sin(ai*2.1+t*1.2)*10;
        var aG=ctx.createLinearGradient(ax+wave,ay,ax+wave,ay+aH);
        if(plName==="Jupiter"){
          aG.addColorStop(0,"rgba(100,50,200,0)");aG.addColorStop(0.3,"rgba(120,60,220,"+(auroraStr*0.12).toFixed(2)+")");aG.addColorStop(0.7,"rgba(80,40,180,"+(auroraStr*0.08).toFixed(2)+")");aG.addColorStop(1,"rgba(60,30,150,0)");
        }else{
          aG.addColorStop(0,"rgba(50,200,100,0)");aG.addColorStop(0.3,"rgba(80,255,120,"+(auroraStr*0.1).toFixed(2)+")");aG.addColorStop(0.6,"rgba(60,180,200,"+(auroraStr*0.06).toFixed(2)+")");aG.addColorStop(1,"rgba(100,50,200,0)");
        }
        ctx.fillStyle=aG;ctx.fillRect(ax+wave-aw*0.5,ay,aw,aH);
      }
    }
  }

  /* ======== PLANET-SPECIFIC SKY FEATURES (dynamic) ======== */
  if(plName==="Earth"){
    /* Moving clouds */
    ctx.globalAlpha=0.18*dayF;ctx.fillStyle="rgba(255,255,255,1)";
    for(var ci=0;ci<12;ci++){var cx2=((rng()*W*3+t*8+yaw*40)%(W*1.5))-W*0.25,cy2=hrzY*0.15+rng()*hrzY*0.45,cw=25+rng()*55;
      ctx.beginPath();ctx.arc(cx2,cy2,cw*0.5,0,TAU);ctx.arc(cx2+cw*0.3,cy2-5,cw*0.35,0,TAU);ctx.arc(cx2-cw*0.15,cy2+3,cw*0.25,0,TAU);ctx.fill();}ctx.globalAlpha=1;
  }else if(plName==="Venus"){
    for(var vi=0;vi<4;vi++){ctx.globalAlpha=0.07+vi*0.025;ctx.fillStyle="rgba("+(170+vi*10)+","+(130+vi*8)+","+(50+vi*5)+",1)";ctx.fillRect(0,vi*hrzY*0.2+Math.sin(t*0.15+vi)*3,W,hrzY*0.25);}
    if(Math.sin(t*7.3)>0.97){ctx.globalAlpha=0.12;ctx.fillStyle="rgba(255,255,200,1)";ctx.fillRect(0,0,W,hrzY);}ctx.globalAlpha=1;
  }else if(plName==="Mars"){
    /* Animated dust particles */
    ctx.globalAlpha=0.1;ctx.fillStyle="rgba(200,150,90,1)";
    for(var di=0;di<50;di++){var dx=(rng()*W*2+t*20+yaw*20+Math.sin(di*1.7+t*0.6)*40)%W,dy3=rng()*hrzY*0.9;var dsz=0.5+rng()*2;ctx.fillRect(dx,dy3,dsz,dsz*0.5);}ctx.globalAlpha=1;
    /* Dust devil occasionally */
    if(Math.sin(t*0.3+yaw)>0.85){var ddx=(W*0.6+t*2)%W;ctx.globalAlpha=0.06;ctx.fillStyle="rgba(180,130,80,1)";ctx.beginPath();ctx.moveTo(ddx-3,hrzY);ctx.lineTo(ddx+1,hrzY*0.5);ctx.lineTo(ddx+5,hrzY);ctx.fill();ctx.globalAlpha=1;}
  }else if(plName==="Jupiter"){
    /* Cloud bands with animation */
    var jCols=["185,150,100","210,170,120","160,120,75","195,160,110","170,130,85"];
    for(var ji=0;ji<5;ji++){var jShift=Math.sin(t*0.4+ji*1.5)*8;ctx.fillStyle="rgba("+jCols[ji]+",0.13)";ctx.fillRect(jShift,hrzY*0.08+ji*hrzY*0.14,W,hrzY*0.1);}
    /* Animated Great Red Spot */
    var grsX=((0.3*W+t*1.5+yaw*30)%(W*1.2))-W*0.1;
    ctx.globalAlpha=0.15;fillCirc(ctx,grsX,hrzY*0.33,28,"rgba(190,90,50,1)");
    /* Swirl inside GRS */
    ctx.globalAlpha=0.08;ctx.strokeStyle="rgba(220,120,60,1)";ctx.lineWidth=1;
    ctx.beginPath();for(var gk=0;gk<20;gk++){var ga2=gk*0.32+t*0.8,gr2=8+gk*0.8;ctx.lineTo(grsX+Math.cos(ga2)*gr2,hrzY*0.33+Math.sin(ga2)*gr2*0.6);}ctx.stroke();
    ctx.globalAlpha=1;
    if(Math.sin(t*11+yaw)>0.95){ctx.globalAlpha=0.06;ctx.fillStyle="rgba(200,200,255,1)";ctx.fillRect(0,0,W,hrzY*0.5);ctx.globalAlpha=1;}
  }else if(plName==="Saturn"){
    /* Rings with subtle animation */
    ctx.globalAlpha=0.25;
    for(var rBand=0;rBand<3;rBand++){ctx.strokeStyle=rBand===0?"rgba(200,185,140,1)":rBand===1?"rgba(185,170,125,1)":"rgba(165,150,110,1)";ctx.lineWidth=rBand===0?8:rBand===1?12:6;ctx.beginPath();for(var rk=0;rk<=60;rk++){var ra=rk/60,rpx=ra*W,rpy=hrzY*0.22+Math.sin(ra*3.1416)*hrzY*(0.18+rBand*0.04)+Math.sin(t*0.1+ra*2)*2;if(rk===0)ctx.moveTo(rpx,rpy);else ctx.lineTo(rpx,rpy);}ctx.stroke();}
    ctx.globalAlpha=0.05;ctx.fillStyle="rgba(0,0,0,1)";ctx.fillRect(0,hrzY*0.45,W,hrzY*0.08);ctx.globalAlpha=1;
  }

  /* ======== FAR MOUNTAINS (parallax layer 3 - slowest) ======== */
  var tSeed=plName.charCodeAt(0)*13+plName.length;
  var farMh=plName==="Mercury"||plName==="Mars"?18:plName==="Venus"?6:plName==="Earth"?30:3;
  if(farMh>2){ctx.globalAlpha=0.15;
    ctx.beginPath();ctx.moveTo(0,hrzY);
    for(var fx=0;fx<=W;fx+=3){var fh=terrainH(fx+yaw*15,tSeed+100)*farMh;ctx.lineTo(fx,hrzY-fh-8);}
    ctx.lineTo(W,hrzY);ctx.closePath();
    ctx.fillStyle=plName==="Mars"?"rgba(140,70,40,1)":plName==="Earth"?"rgba(60,80,120,1)":"rgba(80,75,70,1)";ctx.fill();ctx.globalAlpha=1;}

  /* ======== MID MOUNTAINS (parallax layer 2) ======== */
  var midMh=plName==="Mercury"||plName==="Mars"?30:plName==="Venus"?10:plName==="Earth"?25:4;
  if(midMh>2){ctx.globalAlpha=0.3;
    ctx.beginPath();ctx.moveTo(0,hrzY);
    for(var mx=0;mx<=W;mx+=2){var mh2=terrainH(mx+yaw*30,tSeed+50)*midMh;ctx.lineTo(mx,hrzY-mh2-3);}
    ctx.lineTo(W,hrzY);ctx.closePath();
    ctx.fillStyle=plName==="Mars"?"rgba(155,80,45,1)":plName==="Earth"?"rgba(40,65,35,1)":"rgba(90,85,78,1)";ctx.fill();ctx.globalAlpha=1;}

  /* ======== NEAR TERRAIN (parallax layer 1 - fastest) + ground ======== */
  ctx.beginPath();ctx.moveTo(0,hrzY);
  var nearMh=plName==="Mercury"||plName==="Mars"?25:plName==="Venus"?8:plName==="Earth"?15:5;
  for(var tx=0;tx<=W;tx+=2){var th2=terrainH(tx+yaw*50,tSeed)*nearMh;ctx.lineTo(tx,hrzY-th2);}
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
  var gG=ctx.createLinearGradient(0,hrzY-20,0,H);gG.addColorStop(0,sf.g);
  var gDark=sf.g.replace(/\d+/g,function(v,i){return i<3?Math.max(0,parseInt(v)-25)+"":v;});
  gG.addColorStop(1,gDark);ctx.fillStyle=gG;ctx.fill();

  /* ======== FOREGROUND DETAIL (parallax fastest) ======== */
  if(plName==="Mercury"||plName==="Mars"){
    var cr=seedR(plName==="Mercury"?55:77);
    for(var ci2=0;ci2<40;ci2++){var cx3=cr()*W,cy3=hrzY+12+cr()*(H-hrzY-25),dist=(cy3-hrzY)/(H-hrzY),sz=1+dist*14+cr()*8*dist;
      ctx.globalAlpha=0.25*dist;ctx.fillStyle="rgba(0,0,0,1)";ctx.beginPath();ctx.arc(cx3+sz*0.15,cy3+sz*0.1,sz*0.9,0,TAU);ctx.fill();
      ctx.globalAlpha=0.4*dist;ctx.fillStyle=plName==="Mercury"?"rgba(80,75,70,1)":"rgba(140,80,45,1)";ctx.beginPath();ctx.arc(cx3,cy3,sz*0.8,0,TAU);ctx.fill();
      ctx.globalAlpha=0.12*dist;ctx.beginPath();ctx.arc(cx3-sz*0.2,cy3-sz*0.2,sz*0.35,0,TAU);ctx.fillStyle="rgba(255,255,255,1)";ctx.fill();}
    ctx.globalAlpha=1;
    if(plName==="Mars"){ctx.globalAlpha=0.18;ctx.fillStyle="rgba(180,100,55,1)";for(var mi=0;mi<6;mi++){var mx2=((rng()*W*2+yaw*40)%(W*1.3))-W*0.15;ctx.beginPath();ctx.moveTo(mx2-45,hrzY);ctx.lineTo(mx2,hrzY-18-rng()*22);ctx.lineTo(mx2+45,hrzY);ctx.fill();}ctx.globalAlpha=1;}
  }else if(plName==="Earth"){
    /* Grass blades */
    var gr3=seedR(99);ctx.strokeStyle="rgba(35,90,30,1)";ctx.lineWidth=1;
    for(var gi=0;gi<80;gi++){var gx3=gr3()*W,gy3=hrzY+3+gr3()*(H-hrzY-8),gd2=(gy3-hrzY)/(H-hrzY),gh=3+gd2*8;
      ctx.globalAlpha=0.15*gd2;ctx.beginPath();ctx.moveTo(gx3,gy3);ctx.lineTo(gx3+Math.sin(t*2+gi)*2,gy3-gh);ctx.stroke();}ctx.globalAlpha=1;
    /* Trees (near, large) */
    for(var ti=0;ti<6;ti++){var tx3=((rng()*W*2+yaw*60)%(W*1.2))-W*0.1,tSz=8+rng()*10;
      ctx.globalAlpha=0.5;ctx.fillStyle="rgba(35,55,20,1)";ctx.beginPath();ctx.arc(tx3,hrzY-tSz*0.5,tSz,0,TAU);ctx.fill();
      ctx.fillStyle="rgba(60,40,20,1)";ctx.fillRect(tx3-1.5,hrzY-tSz*0.3,3,tSz*0.5);ctx.globalAlpha=1;}
    /* Far trees (horizon line) */
    ctx.globalAlpha=0.25;ctx.fillStyle="rgba(25,60,18,1)";
    for(var ti2=0;ti2<30;ti2++){var tx4=((rng()*W*3+yaw*35)%(W*1.5))-W*0.25;ctx.beginPath();ctx.arc(tx4,hrzY-1,3+rng()*4,0,TAU);ctx.fill();}ctx.globalAlpha=1;
  }else if(plName==="Venus"){
    var vr=seedR(66);ctx.globalAlpha=0.2;
    for(var vi2=0;vi2<25;vi2++){var vx=vr()*W,vy=hrzY+8+vr()*(H-hrzY-15),vsz=2+((vy-hrzY)/(H-hrzY))*12;
      ctx.fillStyle="rgba(80,60,35,1)";ctx.beginPath();ctx.arc(vx,vy,vsz,0,TAU);ctx.fill();
      if(vr()<0.2){ctx.fillStyle="rgba(220,80,20,"+(0.15+Math.sin(t*3+vi2)*0.08).toFixed(2)+")";ctx.beginPath();ctx.arc(vx,vy+vsz*0.3,vsz*0.6,0,TAU);ctx.fill();}}ctx.globalAlpha=1;
  }else if(plName==="Uranus"||plName==="Neptune"){
    ctx.globalAlpha=0.1;var ir=seedR(plName==="Uranus"?88:99);ctx.strokeStyle=plName==="Uranus"?"rgba(150,220,230,1)":"rgba(80,120,220,1)";ctx.lineWidth=0.5;
    for(var ii=0;ii<40;ii++){var ix=ir()*W,iy=hrzY+3+ir()*(H-hrzY-8);ctx.beginPath();ctx.moveTo(ix,iy);ctx.lineTo(ix+ir()*25-12,iy+ir()*12-6);ctx.stroke();
      if(ir()<0.1){ctx.globalAlpha=0.05;fillCirc(ctx,ix,iy,3+ir()*5,plName==="Uranus"?"rgba(180,240,250,1)":"rgba(100,140,240,1)");ctx.globalAlpha=0.1;}}
    ctx.globalAlpha=1;
  }

  /* ======== ATMOSPHERIC FOG ======== */
  if(sf.atm>0.2){var fogA=Math.min(0.35,sf.atm*0.12);var fogG=ctx.createLinearGradient(0,hrzY-50,0,hrzY+50);fogG.addColorStop(0,"rgba("+sBot+",0)");fogG.addColorStop(0.5,"rgba("+sBot+","+(fogA).toFixed(2)+")");fogG.addColorStop(1,"rgba("+sBot+",0)");ctx.fillStyle=fogG;ctx.fillRect(0,hrzY-50,W,100);}

  /* ======== PERSPECTIVE GRID ======== */
  ctx.globalAlpha=0.03;ctx.strokeStyle="rgba(255,255,255,1)";ctx.lineWidth=0.5;
  for(var gi3=1;gi3<=8;gi3++){var gy5=hrzY+gi3*gi3*(H-hrzY)/72;ctx.beginPath();ctx.moveTo(0,gy5);ctx.lineTo(W,gy5);ctx.stroke();}ctx.globalAlpha=1;

  /* ======== COMPASS BAR ======== */
  var compassY=H<500?H-118:H-128;
  ctx.fillStyle="rgba(0,0,0,0.35)";ctx.fillRect(0,compassY-12,W,28);
  var dirs=[{a:0,l:"N"},{a:0.25,l:"E"},{a:0.5,l:"S"},{a:0.75,l:"W"}];
  var subDirs=[{a:0.125,l:"NE"},{a:0.375,l:"SE"},{a:0.625,l:"SW"},{a:0.875,l:"NW"}];
  ctx.font="bold 10px sans-serif";ctx.textAlign="center";
  var yawNorm=((yaw/TAU)%1+1)%1;
  for(var di2=0;di2<dirs.length;di2++){var dOff=((dirs[di2].a-yawNorm+0.5)%1-0.5)*W*0.8;if(Math.abs(dOff)<W*0.5){ctx.fillStyle="rgba(255,200,100,0.8)";ctx.fillText(dirs[di2].l,W*0.5+dOff,compassY+2);}}
  ctx.font="8px sans-serif";for(var di3=0;di3<subDirs.length;di3++){var dOff2=((subDirs[di3].a-yawNorm+0.5)%1-0.5)*W*0.8;if(Math.abs(dOff2)<W*0.5){ctx.fillStyle="rgba(255,255,255,0.3)";ctx.fillText(subDirs[di3].l,W*0.5+dOff2,compassY+2);}}
  ctx.strokeStyle="rgba(255,255,255,0.12)";ctx.lineWidth=0.5;for(var tk2=0;tk2<36;tk2++){var tkOff=((tk2/36-yawNorm+0.5)%1-0.5)*W*0.8;if(Math.abs(tkOff)<W*0.48){ctx.beginPath();ctx.moveTo(W*0.5+tkOff,compassY-8);ctx.lineTo(W*0.5+tkOff,compassY-4);ctx.stroke();}}
  ctx.fillStyle="rgba(255,100,80,0.8)";ctx.beginPath();ctx.moveTo(W*0.5,compassY-10);ctx.lineTo(W*0.5-4,compassY-14);ctx.lineTo(W*0.5+4,compassY-14);ctx.closePath();ctx.fill();

  /* ======== MINI WORLD MAP (Earth only) ======== */
  if(plName==="Earth"){
    var mW=130,mH=65,mX=52,mY=90;
    ctx.save();
    ctx.fillStyle="rgba(8,20,60,0.78)";ctx.fillRect(mX,mY,mW,mH);
    ctx.fillStyle="rgba(52,115,45,0.88)";
    for(var mci=0;mci<MAP_CTNS.length;mci++){var mc2=MAP_CTNS[mci];ctx.beginPath();for(var mcj=0;mcj<mc2.length;mcj++){var mcpx=mX+(mc2[mcj][0]+180)/360*mW,mcpy=mY+(90-mc2[mcj][1])/180*mH;if(mcj===0)ctx.moveTo(mcpx,mcpy);else ctx.lineTo(mcpx,mcpy);}ctx.closePath();ctx.fill();}
    ctx.strokeStyle="rgba(80,130,255,0.25)";ctx.lineWidth=0.5;
    var eqY2=mY+mH/2;ctx.beginPath();ctx.moveTo(mX,eqY2);ctx.lineTo(mX+mW,eqY2);ctx.stroke();
    var pmX2=mX+mW/2;ctx.beginPath();ctx.moveTo(pmX2,mY);ctx.lineTo(pmX2,mY+mH);ctx.stroke();
    ctx.strokeStyle="rgba(100,160,255,0.55)";ctx.lineWidth=0.8;ctx.strokeRect(mX,mY,mW,mH);
    var mPoX=mX+((lngDeg||0)+180)/360*mW,mPoY=mY+(90-(lat||0))/180*mH;
    mPoX=Math.max(mX+1,Math.min(mX+mW-1,mPoX));mPoY=Math.max(mY+1,Math.min(mY+mH-1,mPoY));
    ctx.strokeStyle="rgba(255,55,55,1)";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(mPoX-4,mPoY);ctx.lineTo(mPoX+4,mPoY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(mPoX,mPoY-4);ctx.lineTo(mPoX,mPoY+4);ctx.stroke();
    fillCirc(ctx,mPoX,mPoY,1.8,"rgba(255,55,55,1)");
    ctx.restore();
  }

  /* ======== HUD ======== */
  ctx.fillStyle="rgba(0,0,0,0.45)";ctx.fillRect(0,0,W,rot<0?100:90);
  ctx.fillStyle="rgba(255,255,255,0.9)";ctx.font="bold 14px sans-serif";ctx.textAlign="center";
  ctx.fillText(pl.j+"の表面",W/2,22);
  ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="9px sans-serif";
  var descs={Mercury:"大気なし・灼熱の昼(430℃)と極寒の夜(−180℃)",Venus:"厚い硫酸雲・気温462℃・気圧90気圧",Earth:"青い空・白い雲・生命の惑星",Mars:"薄いCO₂大気・赤い空・砂嵐",Jupiter:"ガス惑星・巨大な雲の海",Saturn:"ガス惑星・空を横切る壮大なリング",Uranus:"氷の巨人・メタンの青い大気",Neptune:"最果ての惑星・時速2000kmの暴風",Ceres:"小惑星帯最大の天体・岩と氷の世界",Pluto:"冥王星・−230℃の極寒の世界",Eris:"最も遠い矮小惑星・太陽が極小"};
  ctx.fillText(descs[plName]||"",W/2,38);
  var tod=sunAlt>0.3?"昼":sunAlt>0.05?"朝/夕":sunAlt>-0.08?"薄明":"夜";
  var sdStr=solarDay<1?(solarDay*24).toFixed(1)+"h":solarDay<100?solarDay.toFixed(1)+"日":(solarDay/365.25).toFixed(1)+"年";
  var bearDeg=Math.round(((yawNorm)*360)%360);
  var bearName=bearDeg<23?"N":bearDeg<68?"NE":bearDeg<113?"E":bearDeg<158?"SE":bearDeg<203?"S":bearDeg<248?"SW":bearDeg<293?"W":bearDeg<338?"NW":"N";
  var lng=(lngDeg||0).toFixed(1);
  var latStr=(lat||0).toFixed(1);
  var sunAltDeg=Math.round(Math.asin(Math.max(-1,Math.min(1,sunAlt)))*57.3);
  var fovStr=fov<0.95?" 🔭×"+(1/fov).toFixed(1):fov>1.05?" 🔍×"+fov.toFixed(1):"";
  ctx.fillText(tod+"　重力"+pl.grav+"　太陽日:"+sdStr+"　☀×"+sf.sunSz+fovStr,W/2,52);
  ctx.fillStyle="rgba(180,210,255,0.5)";ctx.font="9px sans-serif";
  ctx.fillText("緯度 "+latStr+"°　経度 "+lng+"°　方位 "+bearDeg+"° "+bearName+"　太陽高度 "+sunAltDeg+"°",W/2,66);
  var _p2=function(n){return n<10?"0"+n:""+n;};var _dms=new Date(946728000000+t*86400000);
  var _utc=_dms.getUTCFullYear()+"/"+_p2(_dms.getUTCMonth()+1)+"/"+_p2(_dms.getUTCDate())+" "+_p2(_dms.getUTCHours())+":"+_p2(_dms.getUTCMinutes())+":"+_p2(_dms.getUTCSeconds())+" UTC";
  ctx.fillStyle="rgba(140,200,255,0.6)";ctx.font="9px monospace";ctx.fillText(_utc,W/2,80);
  if(rot<0){ctx.fillStyle="rgba(255,200,100,0.35)";ctx.font="9px sans-serif";ctx.fillText("※逆行自転: 太陽は西から昇り東に沈む",W/2,94);}
}
/* ===== LANDING ENVIRONMENT SOUND ===== */
var LAND_AUDIO=null;
function startLandSound(plName){
  stopLandSound();
  try{
    var ac=new(window.AudioContext||window.webkitAudioContext)();
    var master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
    master.gain.linearRampToValueAtTime(0.15,ac.currentTime+1);
    var nodes=[];
    if(plName==="Earth"){
      /* Wind */
      var bn=ac.createBufferSource();var buf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);var d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*0.3;bn.buffer=buf;bn.loop=true;
      var flt=ac.createBiquadFilter();flt.type="lowpass";flt.frequency.value=400;
      var lfo=ac.createOscillator();lfo.frequency.value=0.15;var lg=ac.createGain();lg.gain.value=150;lfo.connect(lg);lg.connect(flt.frequency);lfo.start();
      bn.connect(flt);flt.connect(master);bn.start();nodes.push(bn,lfo);
      /* Birds (occasional chirps) */
      var bInt=setInterval(function(){if(ac.state==="closed")return;var o=ac.createOscillator();o.frequency.value=2000+Math.random()*2000;var g=ac.createGain();g.gain.value=0.02;o.connect(g);g.connect(master);o.start();g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.3);o.stop(ac.currentTime+0.4);},3000+Math.random()*5000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[bInt]};
    }else if(plName==="Mars"){
      /* Thin wind */
      var bn2=ac.createBufferSource();var buf2=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);var d2=buf2.getChannelData(0);for(var j=0;j<d2.length;j++)d2[j]=(Math.random()*2-1)*0.15;bn2.buffer=buf2;bn2.loop=true;
      var flt2=ac.createBiquadFilter();flt2.type="lowpass";flt2.frequency.value=200;bn2.connect(flt2);flt2.connect(master);bn2.start();nodes.push(bn2);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[]};
    }else if(plName==="Venus"){
      /* Deep pressure drone */
      var o2=ac.createOscillator();o2.type="sine";o2.frequency.value=30;var g2=ac.createGain();g2.gain.value=0.3;o2.connect(g2);g2.connect(master);o2.start();nodes.push(o2);
      /* Hiss */
      var bn3=ac.createBufferSource();var buf3=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);var d3=buf3.getChannelData(0);for(var k=0;k<d3.length;k++)d3[k]=(Math.random()*2-1)*0.08;bn3.buffer=buf3;bn3.loop=true;
      var flt3=ac.createBiquadFilter();flt3.type="lowpass";flt3.frequency.value=100;bn3.connect(flt3);flt3.connect(master);bn3.start();nodes.push(bn3);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[]};
    }else if(plName==="Jupiter"||plName==="Saturn"){
      /* Storm rumble */
      var bn4=ac.createBufferSource();var buf4=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate);var d4=buf4.getChannelData(0);for(var m=0;m<d4.length;m++)d4[m]=(Math.random()*2-1)*0.25;bn4.buffer=buf4;bn4.loop=true;
      var flt4=ac.createBiquadFilter();flt4.type="lowpass";flt4.frequency.value=80;
      var lfo2=ac.createOscillator();lfo2.frequency.value=0.05;var lg2=ac.createGain();lg2.gain.value=40;lfo2.connect(lg2);lg2.connect(flt4.frequency);lfo2.start();
      bn4.connect(flt4);flt4.connect(master);bn4.start();nodes.push(bn4,lfo2);
      /* Thunder */
      var thInt=setInterval(function(){if(ac.state==="closed")return;var bn5=ac.createBufferSource();var buf5=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);var d5=buf5.getChannelData(0);for(var n=0;n<d5.length;n++)d5[n]=(Math.random()*2-1)*0.4*Math.exp(-n/ac.sampleRate*3);bn5.buffer=buf5;var g5=ac.createGain();g5.gain.value=0.08;var f5=ac.createBiquadFilter();f5.type="lowpass";f5.frequency.value=150;bn5.connect(f5);f5.connect(g5);g5.connect(master);bn5.start();},8000+Math.random()*12000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[thInt]};
    }else if(plName==="Neptune"||plName==="Uranus"){
      /* Howling wind */
      var bn6=ac.createBufferSource();var buf6=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);var d6=buf6.getChannelData(0);for(var q=0;q<d6.length;q++)d6[q]=(Math.random()*2-1)*0.2;bn6.buffer=buf6;bn6.loop=true;
      var flt6=ac.createBiquadFilter();flt6.type="bandpass";flt6.frequency.value=300;flt6.Q.value=2;
      var lfo3=ac.createOscillator();lfo3.frequency.value=0.08;var lg3=ac.createGain();lg3.gain.value=200;lfo3.connect(lg3);lg3.connect(flt6.frequency);lfo3.start();
      bn6.connect(flt6);flt6.connect(master);bn6.start();nodes.push(bn6,lfo3);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[]};
    }else{
      /* Mercury/default: silence with occasional metallic ping (thermal expansion) */
      var pingInt=setInterval(function(){if(ac.state==="closed")return;var o3=ac.createOscillator();o3.frequency.value=800+Math.random()*1200;o3.type="sine";var g3=ac.createGain();g3.gain.value=0.015;o3.connect(g3);g3.connect(master);o3.start();g3.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.5);o3.stop(ac.currentTime+0.6);},4000+Math.random()*8000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[pingInt]};
    }
  }catch(e){}
}
function stopLandSound(){
  if(!LAND_AUDIO)return;
  try{
    if(LAND_AUDIO.intervals)LAND_AUDIO.intervals.forEach(function(i){clearInterval(i);});
    LAND_AUDIO.master.gain.linearRampToValueAtTime(0,LAND_AUDIO.ac.currentTime+0.3);
    setTimeout(function(){try{LAND_AUDIO.ac.close();}catch(e){}LAND_AUDIO=null;},400);
  }catch(e){LAND_AUDIO=null;}
}
var J2000=946728000000;/* ms */
function dateToSimDays(dateStr){var d=new Date(dateStr);if(isNaN(d))return null;return(d.getTime()-J2000)/86400000;}
function simDaysToDate(days){var d=new Date(J2000+days*86400000);return d.toISOString().slice(0,10);}
function scanEvents(t0){
  var evts=[],PI2=TAU,t1=t0+730;/* scan 2 years ahead */
  var p2=function(n){return n<10?"0"+n:""+n;};
  var fmtD=function(t){var d=new Date(J2000+t*86400000);return d.getUTCFullYear()+"年"+p2(d.getUTCMonth()+1)+"月"+p2(d.getUTCDate())+"日";};
  /* Seasonal events */
  var SEAS=[{d:79.5,n:"春分"},{d:172,n:"夏至"},{d:265,n:"秋分"},{d:355.5,n:"冬至"}];
  /* Meteor showers */
  var SHW=[{d:3,n:"しぶんぎ座流星群"},{d:125,n:"みずがめ座η流星群"},{d:223,n:"ペルセウス座流星群"},{d:294,n:"オリオン座流星群"},{d:321,n:"しし座流星群"},{d:347,n:"ふたご座流星群"}];
  for(var yr=Math.floor(t0/365.25);yr<=Math.ceil(t1/365.25)+1;yr++){
    var yB=yr*365.25;
    SEAS.forEach(function(s){var te=yB+s.d;if(te>=t0&&te<=t1)evts.push({t:te,n:s.n,ic:"🌸",date:fmtD(te)});});
    SHW.forEach(function(s){var te=yB+s.d;if(te>=t0&&te<=t1)evts.push({t:te,n:s.n,ic:"🌠",date:fmtD(te)});});
  }
  /* Outer planet oppositions */
  var OPL=[{n:"火星",p:687,d:228},{n:"木星",p:4333,d:778},{n:"土星",p:10759,d:1427},{n:"天王星",p:30687,d:2871},{n:"海王星",p:60190,d:4497}];
  var prevCos={};OPL.forEach(function(op){prevCos[op.n]=[null,null];});
  for(var tc=t0;tc<=t1;tc+=1){
    var eA=(tc/365.25)*PI2,eX=Math.cos(eA)*150,eZ=-Math.sin(eA)*150;
    OPL.forEach(function(op){
      var pA=(tc/op.p)*PI2,pX=Math.cos(pA)*op.d,pZ=-Math.sin(pA)*op.d;
      var dx=pX-eX,dz=pZ-eZ,sl=Math.sqrt(dx*dx+dz*dz);
      var ex=-eX,ez=-eZ,el=Math.sqrt(ex*ex+ez*ez);
      var cosEl=(dx*ex+dz*ez)/(sl*el);
      var pr=prevCos[op.n];
      if(pr[0]!==null&&pr[1]!==null&&cosEl>pr[0]&&pr[0]<pr[1]&&pr[0]<-0.97){
        evts.push({t:tc-1,n:op.n+"が衝",ic:"🔭",date:fmtD(tc-1)});
      }
      pr[1]=pr[0];pr[0]=cosEl;
    });
  }
  /* Inner planet greatest elongation */
  var IPL=[{n:"水星",p:88,d:58,me:0.45},{n:"金星",p:225,d:108,me:0.70}];
  IPL.forEach(function(ip){
    var prevEl=[null,null];
    for(var tc2=t0;tc2<=t1;tc2+=1){
      var eA2=(tc2/365.25)*PI2,eX2=Math.cos(eA2)*150,eZ2=-Math.sin(eA2)*150;
      var pA2=(tc2/ip.p)*PI2,pX2=Math.cos(pA2)*ip.d,pZ2=-Math.sin(pA2)*ip.d;
      var dx2=pX2-eX2,dz2=pZ2-eZ2,sl2=Math.sqrt(dx2*dx2+dz2*dz2);
      var ex2=-eX2,ez2=-eZ2,el2=Math.sqrt(ex2*ex2+ez2*ez2);
      var cosEl2=(dx2*ex2+dz2*ez2)/(sl2*el2);
      var eDeg=Math.acos(Math.max(-1,Math.min(1,cosEl2)))*180/Math.PI;
      if(prevEl[0]!==null&&prevEl[1]!==null&&eDeg<prevEl[0]&&prevEl[0]>prevEl[1]&&prevEl[0]>ip.me*90){
        var dir=((Math.atan2(pZ2-eZ2,pX2-eX2)-Math.atan2(-eZ2,-eX2)+PI2*2)%(PI2))<Math.PI?"東方":"西方";
        evts.push({t:tc2-1,n:ip.n+"が"+dir+"最大離角("+prevEl[0].toFixed(0)+"°)",ic:"💫",date:fmtD(tc2-1)});
      }
      prevEl[1]=prevEl[0];prevEl[0]=eDeg;
    }
  });
  evts.sort(function(a,b){return a.t-b.t;});
  return evts.slice(0,40);/* max 40 events */
}

export default function App(){
  var cR=useRef(null),fR=useRef(0);
  var S=useRef({t:dateToSimDays(new Date().toISOString().slice(0,10))||0,cam:{rx:0.22,ry:0.3,zm:1,tzm:1,fx:0,fy:0,fz:0},dr:null,pi:null,trails:PL.map(function(){return[];}),hitAreas:[],dragged:false});
  var[sh,setSh]=useState({orbits:true,tilt:true,moon:true,labels:true,planets:true,trails:true,belt:true});
  var[spd,setSpd]=useState(1);
  var[rSn,setRSn]=useState(false);var[rPl,setRPl]=useState(false);var[rDi,setRDi]=useState(false);var[uni,setUni]=useState(false);
  var[foc,setFoc]=useState("all");var[zi,setZi]=useState(17);
  var[paused,setPaused]=useState(false);var[info,setInfo]=useState(null);var[compare,setCompare]=useState(false);
  var focTransRef=useRef({active:false});
  var tourRef=useRef({active:false,idx:0,timer:0,trans:false});
  var[touring,setTouring]=useState(false);
  var[showEvents,setShowEvents]=useState(false);var eventsRef=useRef([]);
  var cmpStateRef=useRef({offX:0,zm:1});
  var[bgm,setBgm]=useState(false);var audioRef=useRef(null);
  var[dateInput,setDateInput]=useState("");
  var[showDate,setShowDate]=useState(false);
  var[landing,setLanding]=useState(null);/* null or planet name */
  var[landYaw,setLandYaw]=useState(0);/* horizontal look angle radians */
  var[landLat,setLandLat]=useState(0);
  var[landLng,setLandLng]=useState(0);
  var[landFov,setLandFov]=useState(1);
  var[landSpd,setLandSpd]=useState(3600/86400);
  var[landTilt,setLandTilt]=useState(0);
  var[lang,setLang]=useState("ja");
  var landR=useRef(null);var landYR=useRef(0);var landLatR=useRef(0);var landLngR=useRef(0);var landFovR=useRef(1);var landSpdR=useRef(3600/86400);var landTiltR=useRef(0);var langR=useRef("ja");
  useEffect(function(){landR.current=landing;if(landing){startLandSound(landing);}else{stopLandSound();}return function(){stopLandSound();};},[landing]);
  useEffect(function(){landYR.current=landYaw;},[landYaw]);
  useEffect(function(){landLatR.current=landLat;},[landLat]);
  useEffect(function(){landLngR.current=landLng;},[landLng]);
  useEffect(function(){landFovR.current=landFov;},[landFov]);
  useEffect(function(){landSpdR.current=landSpd;},[landSpd]);
  useEffect(function(){landTiltR.current=landTilt;},[landTilt]);
  useEffect(function(){langR.current=lang;},[lang]);
  var shR=useRef(sh),spR=useRef(spd),rsR=useRef(rSn),rpR=useRef(rPl),rdR=useRef(rDi),unR=useRef(uni),foR=useRef(foc),ziR=useRef(zi),pausR=useRef(paused),cmpR=useRef(compare);
  useEffect(function(){shR.current=sh;},[sh]);useEffect(function(){spR.current=spd;},[spd]);useEffect(function(){rsR.current=rSn;},[rSn]);useEffect(function(){rpR.current=rPl;},[rPl]);useEffect(function(){rdR.current=rDi;},[rDi]);useEffect(function(){unR.current=uni;},[uni]);useEffect(function(){foR.current=foc;},[foc]);useEffect(function(){ziR.current=zi;},[zi]);useEffect(function(){pausR.current=paused;},[paused]);useEffect(function(){cmpR.current=compare;},[compare]);
  useEffect(function(){if(!bgm)return;var ctx2;try{ctx2=new(window.AudioContext||window.webkitAudioContext)();var m=ctx2.createGain();m.gain.value=0;m.connect(ctx2.destination);m.gain.linearRampToValueAtTime(0.22,ctx2.currentTime+2);var b=ctx2.createOscillator();b.type="sine";b.frequency.value=55;var bg=ctx2.createGain();bg.gain.value=0.18;b.connect(bg);bg.connect(m);b.start();var p1=ctx2.createOscillator();p1.type="sine";p1.frequency.value=110;var pg=ctx2.createGain();pg.gain.value=0.06;p1.connect(pg);pg.connect(m);p1.start();var p2=ctx2.createOscillator();p2.type="sine";p2.frequency.value=164.81;var p2g=ctx2.createGain();p2g.gain.value=0.04;p2.connect(p2g);p2g.connect(m);p2.start();var p3=ctx2.createOscillator();p3.type="sine";p3.frequency.value=329.63;var p3g=ctx2.createGain();p3g.gain.value=0.02;p3.connect(p3g);p3g.connect(m);p3.start();var notes=[523.25,659.25,783.99,1046.5,1318.5,1567.98];var si2=setInterval(function(){if(ctx2.state==="closed")return;var o=ctx2.createOscillator();o.type="sine";o.frequency.value=notes[Math.floor(Math.random()*notes.length)];var g2=ctx2.createGain();g2.gain.value=0.02+Math.random()*0.02;o.connect(g2);g2.connect(m);o.start();g2.gain.exponentialRampToValueAtTime(0.001,ctx2.currentTime+3);o.stop(ctx2.currentTime+4);},2500+Math.random()*3000);audioRef.current={ctx:ctx2,master:m,si:si2};}catch(e){}return function(){if(audioRef.current){clearInterval(audioRef.current.si);try{audioRef.current.master.gain.linearRampToValueAtTime(0,audioRef.current.ctx.currentTime+0.5);setTimeout(function(){try{audioRef.current.ctx.close();}catch(e2){}audioRef.current=null;},600);}catch(e3){}};};},[bgm]);

  var dz=useCallback(function(i){var c=Math.max(0,Math.min(ZS.length-1,i));S.current.cam.zm=ZS[c];return c;},[]);
  var zIn=useCallback(function(){setZi(function(p){var n=Math.min(ZS.length-1,p+1);dz(n);S.current.cam.tzm=ZS[n];return n;});},[dz]);
  var zOut=useCallback(function(){setZi(function(p){var n=Math.max(0,p-1);dz(n);S.current.cam.tzm=ZS[n];return n;});},[dz]);
  var tog=useCallback(function(k){setSh(function(p){var o={};for(var x in p)o[x]=p[x];o[k]=!p[k];return o;});},[]);
  function autoZoomVal(name,isUni){if(!isUni)return null;var wr;if(name==="sun"){wr=(SRR/1000)*DK;}else{var pl=PL_MAP[name]||DWARF_MAP[name];if(!pl){var cm=COMET_MAP[name];if(!cm)return null;wr=(1/1000)*DK;}else{wr=(pl.r/1000)*DK;}}var ideal=30/Math.max(wr,0.00001),best=0,bd=1e15;for(var i=0;i<ZS.length;i++){var d=Math.abs(ZS[i]-ideal);if(d<bd){bd=d;best=i;}}return ZS[best];}
  var autoZoom=useCallback(function(name,isUni){if(!isUni)return;var wr;if(name==="sun"){wr=(SRR/1000)*DK;}else if(name==="all"){return;}else{var pl=PL_MAP[name]||DWARF_MAP[name];if(!pl)return;wr=(pl.r/1000)*DK;}var ideal=30/Math.max(wr,0.00001),best=0,bd=1e15;for(var i=0;i<ZS.length;i++){var d=Math.abs(ZS[i]-ideal);if(d<bd){bd=d;best=i;}}S.current.cam.tzm=ZS[best];ziR.current=best;setZi(best);},[]);
  useEffect(function(){if(uni&&foc!=="all"){autoZoom(foc,true);}},[uni,foc,autoZoom]);
  var stopTour=useCallback(function(){setTouring(false);if(tourRef.current)tourRef.current.active=false;},[]);

  function findInfo(k){if(k==="sun")return{type:"sun"};var pl=PL_MAP[k]||DWARF_MAP[k];if(pl)return{type:"planet",pl:pl};var cm=COMET_MAP[k];if(cm)return{type:"comet",cm:cm};return null;}
  var focusOn=useCallback(function(k){
    if(k!=="all"&&k!==foR.current&&!landR.current){
      var _c=S.current.cam,_tz=autoZoomVal(k,uni)||_c.zm;
      focTransRef.current={active:true,t:0,dur:2.0,ready:false,fromFx:_c.fx,fromFz:_c.fz,fromZm:_c.zm,toZm:_tz};
    }
    setFoc(k);autoZoom(k,uni);setInfo(k==="all"?null:findInfo(k));
    if(landR.current){if(PL_MAP[k]||DWARF_MAP[k]){landLngR.current=0;setLandLng(0);setLanding(k);setLandYaw(0);setLandLat(0);setLandFov(1);}else{setLanding(null);}}
  },[autoZoom,uni]);

  /* Central landing helper: stops tour, exits galaxy view, focuses planet, lands */
  var doLanding=useCallback(function(plName){
    if(!PL_MAP[plName]&&!DWARF_MAP[plName])return;
    stopTour();
    setFoc(plName);setInfo(findInfo(plName));
    if(ziR.current<10){var ssIdx=17;dz(ssIdx);ziR.current=ssIdx;setZi(ssIdx);}
    setCompare(false);
    landLngR.current=0;setLandLng(0);
    landTiltR.current=0;setLandTilt(0);
    setLanding(plName);setLandYaw(0);setLandLat(0);setLandFov(1);
  },[dz,stopTour]);

  var doTakeoff=useCallback(function(){
    setLanding(null);
  },[]);

  /* Time travel: jump to a specific date */
  var jumpToDate=useCallback(function(ds){
    var d=dateToSimDays(ds);if(d===null)return;
    S.current.t=d;setPaused(true);
    /* Clear trails for clean view at new date */
    for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];
  },[]);

  /* Clean view mode - hide all UI for native screenshot */
  var[cleanView,setCleanView]=useState(0);/* 0=off, 1=with hint, 2=fully clean */
  var cleanR=useRef(0);
  useEffect(function(){cleanR.current=cleanView;},[cleanView]);
  var takeScreenshot=useCallback(function(){
    setCleanView(1);
    setTimeout(function(){setCleanView(2);},1500);/* hint disappears after 1.5s */
    setTimeout(function(){setCleanView(0);},8000);/* auto-restore after 8s */
  },[]);

  var[shareText,setShareText]=useState(null);
  var[importMode,setImportMode]=useState(false);
  var[importText,setImportText]=useState("");
  var shareURL=useCallback(function(){
    var s=S.current,c=s.cam;
    var code="SS|"+s.t.toFixed(1)+"|"+c.rx.toFixed(3)+"|"+c.ry.toFixed(3)+"|"+zi+"|"+foc;
    setShareText(code);
  },[zi,foc]);
  var importState=useCallback(function(code){
    try{
      var p=code.split("|");if(p[0]!=="SS"||p.length<6)return false;
      /* Exit any special modes first */
      setLanding(null);setCompare(false);stopTour();
      S.current.t=parseFloat(p[1]);
      S.current.cam.rx=parseFloat(p[2]);S.current.cam.ry=parseFloat(p[3]);
      var zv=parseInt(p[4]);if(zv>=0&&zv<ZS.length){setZi(zv);S.current.cam.zm=ZS[zv];}
      var fv=p[5];setFoc(fv);setInfo(fv==="all"?null:findInfo(fv));
      for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];
      return true;
    }catch(e){return false;}
  },[stopTour]);



  var handleClick=useCallback(function(e){if(S.current.dragged)return;var cv=cR.current;if(!cv)return;var rect=cv.getBoundingClientRect(),mx=e.clientX-rect.left-rect.width/2,my=e.clientY-rect.top-rect.height/2;var hits=S.current.hitAreas;for(var i=0;i<hits.length;i++){var h=hits[i],dx=mx-h.x,dy2=my-h.y;if(dx*dx+dy2*dy2<h.r*h.r){focusOn(h.n);return;}}setInfo(null);},[focusOn]);

  useEffect(function(){
    var cv=cR.current;if(!cv)return;var ctx=cv.getContext("2d"),alive=true,lt=0,sim=S.current,trailTimer=0;
    function rsz(){var d=Math.min(window.devicePixelRatio||1,2),pa=cv.parentElement,w=pa.clientWidth,h=pa.clientHeight;cv.width=w*d;cv.height=h*d;cv.style.width=w+"px";cv.style.height=h+"px";ctx.setTransform(d,0,0,d,0,0);}rsz();window.addEventListener("resize",rsz);
    function md(e){e.preventDefault();sim.dragged=false;if(cmpR.current){sim.cmpDrag={x:e.clientX};return;}sim.dr={x:e.clientX,y:e.clientY};}
    function mm(e){if(sim.cmpDrag){var dx0=e.clientX-sim.cmpDrag.x;cmpStateRef.current.offX+=dx0;sim.cmpDrag.x=e.clientX;sim.dragged=true;return;}if(!sim.dr)return;var dx=e.clientX-sim.dr.x,dy=e.clientY-sim.dr.y;if(Math.abs(dx)+Math.abs(dy)>3)sim.dragged=true;if(!landR.current){sim.cam.ry+=dx*0.005;sim.cam.rx=Math.max(-1.5,Math.min(1.5,sim.cam.rx+dy*0.005));}sim.dr.x=e.clientX;sim.dr.y=e.clientY;}
    function mu(){sim.cmpDrag=null;sim.dr=null;}
    function wl(e){e.preventDefault();if(cmpR.current){cmpStateRef.current.zm=Math.max(0.2,Math.min(5,cmpStateRef.current.zm*(e.deltaY>0?0.9:1.1)));return;}if(landR.current){var f=landFovR.current*(e.deltaY>0?1.1:0.9);f=Math.max(0.3,Math.min(3,f));landFovR.current=f;setLandFov(f);return;}var d2=e.deltaY>0?-1:1,c2=ziR.current,n=Math.max(0,Math.min(ZS.length-1,c2+d2));if(n!==c2){dz(n);ziR.current=n;setZi(n);sim.cam.tzm=ZS[n];}}
    function td3(e){if(e.touches.length<2)return 0;var a=e.touches[0],b=e.touches[1];return Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);}
    function tst(e){if(cmpR.current){e.preventDefault();if(e.touches.length===1){sim.cmpDrag={x:e.touches[0].clientX};sim.dragged=false;}if(e.touches.length===2){sim.cmpPinch=td3(e);sim.cmpDrag=null;}return;}if(e.touches.length===1){sim.dr={x:e.touches[0].clientX,y:e.touches[0].clientY};sim.dragged=false;}if(e.touches.length===2){sim.pi=td3(e);sim.dr=null;}}
    function tmv(e){e.preventDefault();if(cmpR.current){if(e.touches.length===1&&sim.cmpDrag){cmpStateRef.current.offX+=e.touches[0].clientX-sim.cmpDrag.x;sim.cmpDrag.x=e.touches[0].clientX;}if(e.touches.length===2&&sim.cmpPinch){var dp=td3(e),rp=dp/sim.cmpPinch;if(rp>1.01||rp<0.99){cmpStateRef.current.zm=Math.max(0.2,Math.min(5,cmpStateRef.current.zm*rp));sim.cmpPinch=dp;}}return;}if(e.touches.length===1&&sim.dr){var dx=e.touches[0].clientX-sim.dr.x,dy=e.touches[0].clientY-sim.dr.y;if(Math.abs(dx)+Math.abs(dy)>3)sim.dragged=true;if(!landR.current){sim.cam.ry+=dx*0.005;sim.cam.rx=Math.max(-1.5,Math.min(1.5,sim.cam.rx+dy*0.005));}sim.dr.x=e.touches[0].clientX;sim.dr.y=e.touches[0].clientY;}if(e.touches.length===2&&sim.pi){var d3=td3(e),ratio=d3/sim.pi;if(landR.current){var newFov=Math.max(0.3,Math.min(3,landFovR.current/ratio));landFovR.current=newFov;setLandFov(newFov);sim.pi=d3;}else if(ratio>1.06||ratio<0.94){var dir=ratio>1?1:-1,c3=ziR.current,n2=Math.max(0,Math.min(ZS.length-1,c3+dir));if(n2!==c3){dz(n2);ziR.current=n2;setZi(n2);sim.cam.tzm=ZS[n2];}sim.pi=d3;}}}
    function ten(e){if(e.touches.length<2){sim.pi=null;sim.cmpPinch=null;}if(e.touches.length===0){sim.dr=null;sim.cmpDrag=null;}}
    function kd(e){var k=e.key;if(k===" "){e.preventDefault();setPaused(function(p){return!p;});}else if(k==="0"){focusOn("all");}else if(k.toLowerCase()==="s"){focusOn("sun");}else if(k>="1"&&k<="8"){focusOn(PL[parseInt(k)-1].n);}else if(k==="9"){focusOn("Halley");}else if(k.toLowerCase()==="e"){focusOn("Encke");}else if(k==="+"||k==="="){e.preventDefault();zIn();}else if(k==="-"||k==="_"){e.preventDefault();zOut();}else if(k==="ArrowRight"){var ci2=SP.indexOf(spR.current);if(ci2<SP.length-1){setSpd(SP[ci2+1]);setPaused(false);}}else if(k==="ArrowLeft"){var ci3=SP.indexOf(spR.current);if(ci3>0){setSpd(SP[ci3-1]);setPaused(false);}}else if(k.toLowerCase()==="c"){setCompare(function(p){if(!p)cmpStateRef.current={offX:0,zm:1};return!p;});}else if(k.toLowerCase()==="t"){if(tourRef.current.active){stopTour();setFoc("all");setInfo(null);}else{setLanding(null);stopTour();setTouring(true);tourRef.current={active:true,idx:0,timer:0,trans:false};setFoc("sun");setInfo({type:"sun"});}}else if(k.toLowerCase()==="m"){setBgm(function(p){return!p;});}
      else if(k.toLowerCase()==="g"){var galIdx=2;var ssIdx=17;if(ziR.current>9){dz(galIdx);ziR.current=galIdx;setZi(galIdx);setFoc("all");setInfo(null);}else{dz(ssIdx);ziR.current=ssIdx;setZi(ssIdx);}}
      else if(k.toLowerCase()==="l"){if(landR.current){setLanding(null);}else if(foR.current!=="all"&&foR.current!=="sun"){var lpl=PL_MAP[foR.current];if(lpl){doLanding(foR.current);}}}
      else if(k==="Escape"){if(landR.current)setLanding(null);}}
    cv.addEventListener("mousedown",md);window.addEventListener("mousemove",mm);window.addEventListener("mouseup",mu);cv.addEventListener("wheel",wl,{passive:false});cv.addEventListener("touchstart",tst,{passive:false});cv.addEventListener("touchmove",tmv,{passive:false});cv.addEventListener("touchend",ten);window.addEventListener("keydown",kd);
    var sArr=SD.s,sCols=SD.c,nArr=NB;

    function frame(ts2){
      if(!alive)return;var dt=lt?Math.min((ts2-lt)/1000,0.1):0.016;lt=ts2;if(!pausR.current){if(landR.current)sim.t+=dt*landSpdR.current;else sim.t+=dt*spR.current;}
      var pa=cv.parentElement,W=pa.clientWidth,H=pa.clientHeight;if(cv.style.width!==W+"px")rsz();
      var show=shR.current,_rs=rsR.current,_rp=rpR.current,_rd=rdR.current,_un=unR.current,fc=foR.current,cam=sim.cam,t=sim.t;
      if(!focTransRef.current.active&&cam.tzm&&Math.abs(cam.tzm-cam.zm)>0.00005){cam.zm+=(cam.tzm-cam.zm)*Math.min(1,dt*5);}
      ctx.fillStyle="rgba(3,3,10,1)";ctx.fillRect(0,0,W,H);

      /* Landing view mode */
      var _land=landR.current;
      if(_land){
        drawLanding(ctx,W,H,t,_land,landYR.current,landLatR.current,landFovR.current,landLngR.current,landTiltR.current);
        fR.current=requestAnimationFrame(frame);return;
      }

      ctx.save();ctx.translate(W/2,H/2);

      for(var ni=0;ni<nArr.length;ni++){var nb=nArr[ni],nsp=sSP(nb.th,nb.ph,cam.rx,cam.ry,0);if(nsp.z<-0.1)continue;var nsx=nsp.x*W*0.6,nsy=nsp.y*H*0.6;var ngr=ctx.createRadialGradient(nsx,nsy,0,nsx,nsy,nb.ra);ngr.addColorStop(0,"rgba("+nb.cl[0]+","+nb.cl[1]+","+nb.cl[2]+","+(nb.a*1.2)+")");ngr.addColorStop(0.5,"rgba("+nb.cl[0]+","+nb.cl[1]+","+nb.cl[2]+","+(nb.a*0.4)+")");ngr.addColorStop(1,"rgba("+nb.cl[0]+","+nb.cl[1]+","+nb.cl[2]+",0)");ctx.fillStyle=ngr;ctx.fillRect(nsx-nb.ra,nsy-nb.ra,nb.ra*2,nb.ra*2);}
      for(var si=0;si<sArr.length;si++){var st=sArr[si],sp=sSP(st.th,st.ph,cam.rx,cam.ry,st.l);if(sp.z<-0.2)continue;var sx=sp.x*W*0.7,sy=sp.y*H*0.7;if(sx<-W*0.52||sx>W*0.52||sy<-H*0.52||sy>H*0.52)continue;var al=Math.max(0.03,Math.min(0.95,(st.b+Math.sin(t*1.5+st.tw)*0.12)*(0.6+sp.z*0.4)));ctx.fillStyle="rgba("+sCols[st.ci]+","+al.toFixed(2)+")";ctx.fillRect(sx-st.s*0.5,sy-st.s*0.5,st.s,st.s);}

      /* ===== GALAXY VIEW (when zoomed out far enough) ===== */
      var galFade=cam.zm<0.03?Math.min(1,(0.03-cam.zm)/0.02):0;
      if(galFade>0){
        var galScale=Math.max(cam.zm*30000,W*0.006);
        var sunGX=SUN_GAL_R*Math.cos(SUN_GAL_ANG),sunGZ=SUN_GAL_R*Math.sin(SUN_GAL_ANG);
        /* Galaxy projection: particles in XZ plane, apply camera rotation, no focus offset */
        /* galPj: galaxy coords (gx,gy,gz) -> screen (x,y,z) with depth */
        var crx=cam.rx,cry=cam.ry;
        var cryC=Math.cos(cry),cryS=Math.sin(cry),crxC=Math.cos(crx),crxS=Math.sin(crx);
        function galPj(gx,gy,gz){
          var dx=gx-sunGX,dy=gy,dz=gz-sunGZ;
          /* RY */var rx=dx*cryC+dz*cryS,rz=-dx*cryS+dz*cryC;
          /* RX */var ry=dy*crxC-rz*crxS,rz2=dy*crxS+rz*crxC;
          return{x:rx*galScale,y:ry*galScale,z:rz2};
        }
        /* Bulge thickness for 3D: bulge is ellipsoidal, disk is thin */
        /* Dust lanes */
        ctx.globalAlpha=galFade*0.12;
        for(var gdi=0;gdi<GAL.dust.length;gdi++){var gd2=GAL.dust[gdi];var gp=galPj(gd2.x,0,gd2.y);if(Math.abs(gp.x)>W||Math.abs(gp.y)>H)continue;var dsz=gd2.sz*galScale;ctx.fillStyle="rgba(5,3,15,1)";ctx.fillRect(gp.x-dsz*0.5,gp.y-dsz*0.5,dsz,dsz);}
        /* Central bulge glow */
        var bp=galPj(0,0,0);var bulgeR=8*galScale;
        if(Math.abs(bp.x)<W+bulgeR&&Math.abs(bp.y)<H+bulgeR){
          ctx.globalAlpha=galFade*0.4;
          var bg2=ctx.createRadialGradient(bp.x,bp.y,0,bp.x,bp.y,bulgeR);bg2.addColorStop(0,"rgba(255,240,180,0.6)");bg2.addColorStop(0.3,"rgba(255,220,140,0.2)");bg2.addColorStop(1,"rgba(255,200,100,0)");ctx.fillStyle=bg2;ctx.fillRect(bp.x-bulgeR,bp.y-bulgeR,bulgeR*2,bulgeR*2);
        }
        /* Bulge stars (have vertical extent) */
        ctx.globalAlpha=galFade*0.5;
        for(var gbi=0;gbi<GAL.bulge.length;gbi++){var gb=GAL.bulge[gbi];var gbp=galPj(gb.x,gb.y*0.5,gb.y);if(Math.abs(gbp.x)>W||Math.abs(gbp.y)>H)continue;ctx.fillStyle="rgba(255,235,180,"+gb.b.toFixed(2)+")";ctx.fillRect(gbp.x-gb.s*0.5,gbp.y-gb.s*0.5,gb.s,gb.s);}
        /* Spiral arm stars */
        ctx.globalAlpha=galFade;
        for(var gai=0;gai<GAL.arms.length;gai++){var ga2=GAL.arms[gai];var gap2=galPj(ga2.x,0,ga2.y);if(Math.abs(gap2.x)>W||Math.abs(gap2.y)>H)continue;ctx.fillStyle="rgba("+GAL_COLS[ga2.ci]+","+(ga2.b*galFade).toFixed(2)+")";var gsz=ga2.s*(galScale>5?1.5:1);ctx.fillRect(gap2.x-gsz*0.5,gap2.y-gsz*0.5,gsz,gsz);}
        /* Nearby named stars */
        if(galScale>20){
          for(var nsi=0;nsi<NEAR_STARS.length;nsi++){var ns2=NEAR_STARS[nsi];var nsp2=galPj(ns2.x,0,ns2.y);if(Math.abs(nsp2.x)>W||Math.abs(nsp2.y)>H)continue;ctx.globalAlpha=galFade*ns2.b;ctx.fillStyle="rgba(255,255,255,1)";ctx.fillRect(nsp2.x-1,nsp2.y-1,2,2);if(ns2.name&&galScale>80){ctx.fillStyle="rgba(200,220,255,"+(galFade*0.6).toFixed(2)+")";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(ns2.name,nsp2.x,nsp2.y-5);}}}
        /* Sun marker at origin (camera centered on Sun) */
        ctx.globalAlpha=galFade;
        var smR=Math.max(2,Math.min(6,galScale*0.3));
        fillCirc(ctx,0,0,smR,"rgba(255,220,50,1)");
        var smGlow=ctx.createRadialGradient(0,0,smR,0,0,smR*4);smGlow.addColorStop(0,"rgba(255,200,50,0.3)");smGlow.addColorStop(1,"rgba(255,200,50,0)");ctx.fillStyle=smGlow;ctx.fillRect(-smR*4,-smR*4,smR*8,smR*8);
        if(galScale<50){ctx.fillStyle="rgba(255,220,100,"+(galFade*0.8).toFixed(2)+")";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("☀ 太陽系",0,smR+14);}
        /* Galaxy center label */
        if(galScale<30){ctx.fillStyle="rgba(255,230,160,"+(galFade*0.5).toFixed(2)+")";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("銀河中心 ▸ いて座A*",bp.x,bp.y+bulgeR*0.3+12);}
        /* Galaxy info overlay (fixed on screen, outside translate) */
        ctx.globalAlpha=1;
      }
      /* Info text drawn after ctx.restore, in screen space */
      var galInfoFade=cam.zm<0.005?Math.min(1,(0.005-cam.zm)/0.004):0;
      /* Solar system fade when galaxy visible */
      var ssFade=cam.zm<0.03?Math.max(0.05,cam.zm/0.03):1;
      if(ssFade<1)ctx.globalAlpha=ssFade;

      var allBodies=PL.concat(DWARFS);
      var pd=[];for(var i=0;i<allBodies.length;i++){var pl=allBodies[i],oRv=oR(pl,_rd,_un),ang=(t/pl.p)*TAU;pd.push({pl:pl,oR:oRv,wx:Math.cos(ang)*oRv,wy:0,wz:Math.sin(ang)*oRv,vr:pRf(pl,_rp,_un),rotAng:(t/Math.abs(pl.rot))*TAU*(pl.rot<0?-1:1)});}
      var cd=[];for(var cci=0;cci<COMETS.length;cci++){var cm0=COMETS[cci],cm0E=cm0.e;var cm0OrbR=_rd||_un?cm0.a*DK:(160+Math.pow((cm0.a-228)/4267,0.55)*280);var cm0M=((t/cm0.p)+cm0.phase0)*TAU;var cm0Ecc=cm0M;for(var ki0=0;ki0<6;ki0++){cm0Ecc=cm0M+cm0E*Math.sin(cm0Ecc);}var cm0V=2*Math.atan2(Math.sqrt(1+cm0E)*Math.sin(cm0Ecc/2),Math.sqrt(1-cm0E)*Math.cos(cm0Ecc/2));var cm0R=cm0OrbR*(1-cm0E*cm0E)/(1+cm0E*Math.cos(cm0V));cd.push({cm:cm0,orbR:cm0OrbR,wx:Math.cos(cm0V+cm0.inc)*cm0R,wy:0,wz:Math.sin(cm0V+cm0.inc)*cm0R});}

      trailTimer+=dt;if(trailTimer>0.05&&!pausR.current&&!tourRef.current.trans){trailTimer=0;for(var ti=0;ti<sim.trails.length;ti++){sim.trails[ti].push({x:pd[ti].wx,z:pd[ti].wz});if(sim.trails[ti].length>TRAIL_LEN)sim.trails[ti].shift();}}

      var tfx=0,tfy=0,tfz=0,hasTarget=false;
      if(fc!=="all"&&fc!=="sun"){for(var fi=0;fi<pd.length;fi++){if(pd[fi].pl.n===fc){tfx=pd[fi].wx;tfy=pd[fi].wy;tfz=pd[fi].wz;hasTarget=true;break;}}if(!hasTarget){for(var fi2=0;fi2<cd.length;fi2++){if(cd[fi2].cm.key===fc){tfx=cd[fi2].wx;tfy=cd[fi2].wy;tfz=cd[fi2].wz;hasTarget=true;break;}}}}
      var ft=focTransRef.current;if(ft.active){if(!ft.ready){if(hasTarget){ft.toFx=tfx;ft.toFz=tfz;ft.ready=true;}else if(fc==="sun"||fc==="all"){ft.toFx=0;ft.toFz=0;ft.ready=true;}}if(ft.ready){ft.t=Math.min(1,ft.t+dt/ft.dur);var ease2=ft.t*ft.t*(3-2*ft.t);cam.fx=ft.fromFx+(ft.toFx-ft.fromFx)*ease2;cam.fz=ft.fromFz+(ft.toFz-ft.fromFz)*ease2;var midZm=Math.max(0.0001,Math.min(ft.fromZm,ft.toZm)*0.15);if(ease2<0.5){cam.zm=ft.fromZm+(midZm-ft.fromZm)*(ease2*2);}else{cam.zm=midZm+(ft.toZm-midZm)*((ease2-0.5)*2);}if(ft.t>=1){ft.active=false;cam.fx=ft.toFx;cam.fz=ft.toFz;cam.zm=ft.toZm;}}}else if(hasTarget||fc==="sun"){var lf=Math.min(1,dt*7);cam.fx+=(tfx-cam.fx)*lf;cam.fy+=(tfy-cam.fy)*lf;cam.fz+=(tfz-cam.fz)*lf;}else if(fc==="all"){cam.fx*=0.92;cam.fy*=0.92;cam.fz*=0.92;}

      if(show.orbits){for(var oi=0;oi<pd.length;oi++){var _oc=pd[oi].pl.c.match(/(\d+),(\d+),(\d+)/);dOb(ctx,pd[oi].oR,cam,_oc?_oc[1]+","+_oc[2]+","+_oc[3]:null,false);}}
      if(show.trails){for(var tri=0;tri<sim.trails.length;tri++){var trail=sim.trails[tri];if(trail.length<3)continue;var cStr=pd[tri].pl.c.replace(",1)","");var bs=Math.max(2,Math.floor(trail.length/10));for(var tb=0;tb<trail.length-1;tb+=bs){var te2=Math.min(tb+bs+1,trail.length),mA=((tb+te2)*0.5/trail.length)*0.5;ctx.beginPath();ctx.strokeStyle=cStr+","+mA.toFixed(2)+")";ctx.lineWidth=1.5;var fp=pj(trail[tb].x,0,trail[tb].z,cam);ctx.moveTo(fp.x,fp.y);for(var tj=tb+1;tj<te2;tj++){var cp=pj(trail[tj].x,0,trail[tj].z,cam);ctx.lineTo(cp.x,cp.y);}ctx.stroke();}}}
      if(show.belt&&!_un){ctx.fillStyle="rgba(160,150,130,0.4)";for(var ai=0;ai<AST.length;ai++){var as2=AST[ai],aR=_rd?as2.rad*0.15*DK:(160+(as2.rad-330)/200*60),aAng=as2.ang+t*as2.spd,ap=pj(Math.cos(aAng)*aR,as2.y*(_rd?0.1:1),Math.sin(aAng)*aR,cam),aSz=Math.max(as2.sz*cam.zm,0.2);ctx.fillRect(ap.x-aSz*0.5,ap.y-aSz*0.5,aSz,aSz);}}

      /* ======== ZODIAC RING ======== */
      if(!_un&&cam.zm<10){
        var sunEclLng=((((t/365.25)*TAU-(ZODIAC_BASE-Math.PI))*180/Math.PI)%360+360)%360;
        var curZIdx=Math.floor(sunEclLng/30);
        var halfMin=Math.min(W,H)*0.47;
        var maxEdge=Math.min(halfMin,Math.max(440*cam.zm*1.15,Math.min(W,H)*0.28));
        ctx.save();ctx.font="10px sans-serif";ctx.textAlign="center";
        for(var zi2=0;zi2<ZODIAC.length;zi2++){
          var zAng2=ZODIAC_BASE+ZODIAC[zi2][0]*Math.PI/180;
          var zPP=pj(Math.cos(zAng2)*800,0,Math.sin(zAng2)*800,cam);
          var zLen=Math.sqrt(zPP.x*zPP.x+zPP.y*zPP.y);if(zLen<1)continue;
          var lx2=zPP.x/zLen*maxEdge,ly2=zPP.y/zLen*maxEdge;
          var isCur=(zi2===curZIdx);
          ctx.fillStyle=isCur?"rgba(255,220,80,0.85)":"rgba(180,200,255,0.35)";
          ctx.font=(isCur?"bold ":"")+"10px sans-serif";
          ctx.fillText(ZODIAC[zi2][2]+ZODIAC[zi2][1],lx2,ly2);
        }
        ctx.restore();
      }

      /* Sun */
      var sunPj=pj(0,0,0,cam),srScr=(_rs||_un)?sRf(_rs,_un)*cam.zm:Math.min(sRf(false,false)*Math.pow(cam.zm,0.35),40);
      var hits=[];

      /* Comets */
      for(var cmi=0;cmi<cd.length;cmi++){var cm=cd[cmi].cm,cmE=cm.e,cmOrbR=cd[cmi].orbR;var cmPj=pj(cd[cmi].wx,0,cd[cmi].wz,cam);var cmH=Math.max(cm.sz,0.8),cmZm=Math.pow(cam.zm,0.3);var tdx=cmPj.x-sunPj.x,tdy=cmPj.y-sunPj.y,tl2=Math.sqrt(tdx*tdx+tdy*tdy);if(tl2<0.1){tdx=1;tdy=0;tl2=1;}var tnx=tdx/tl2,tny=tdy/tl2,tpx=-tny,tpy=tnx;var csd=Math.sqrt(cd[cmi].wx*cd[cmi].wx+cd[cmi].wz*cd[cmi].wz),peri=cmOrbR*(1-cmE),tI=Math.max(0.1,Math.min(1.2,peri*3/Math.max(csd,0.1))),tLen=cm.tailLen*tI*cmZm;
        if(tLen>2){for(var tp2=0;tp2<20;tp2++){var tf=tp2/20;ctx.fillStyle="rgba("+cm.col[0]+","+cm.col[1]+","+cm.col[2]+","+((1-tf)*0.35*Math.min(tI,1)).toFixed(3)+")";var tsz=cmH*(0.8+tf*1.5);ctx.fillRect(cmPj.x+tnx*tLen*tf+tpx*Math.sin(tp2*1.7+t*2)*tLen*0.01-tsz*0.5,cmPj.y+tny*tLen*tf+tpy*Math.sin(tp2*1.7+t*2)*tLen*0.01-tsz*0.5,tsz,tsz);}for(var tp3=0;tp3<14;tp3++){var tf2=tp3/14,cv2=tf2*tf2*tLen*0.15;ctx.fillStyle="rgba(255,230,180,"+((1-tf2)*0.22*Math.min(tI,1)).toFixed(3)+")";var tsz2=cmH*(0.6+tf2*1.2);ctx.fillRect(cmPj.x+tnx*tLen*tf2*0.7+tpx*cv2-tsz2*0.5,cmPj.y+tny*tLen*tf2*0.7+tpy*cv2-tsz2*0.5,tsz2,tsz2);}}
        var comaR=cmH*(3+tI*4);var comaG=ctx.createRadialGradient(cmPj.x,cmPj.y,0,cmPj.x,cmPj.y,comaR);var cA=Math.min(0.7,0.2+tI*0.3);comaG.addColorStop(0,"rgba(255,255,255,"+cA.toFixed(2)+")");comaG.addColorStop(0.3,"rgba(200,230,255,"+(cA*0.3).toFixed(2)+")");comaG.addColorStop(1,"rgba(150,200,255,0)");ctx.fillStyle=comaG;ctx.fillRect(cmPj.x-comaR,cmPj.y-comaR,comaR*2,comaR*2);fillCirc(ctx,cmPj.x,cmPj.y,cmH,"rgba(240,250,255,1)");
        hits.push({n:cm.key,x:cmPj.x,y:cmPj.y,r:Math.max(comaR,15)});
        if(show.orbits){ctx.beginPath();ctx.strokeStyle="rgba(100,180,255,0.08)";ctx.lineWidth=0.5;ctx.setLineDash([3,5]);var cmN=Math.max(80,Math.min(600,Math.floor(cmOrbR*cam.zm*0.25)));for(var cj=0;cj<=cmN;cj++){var cja=(cj/cmN)*TAU,cjr=cmOrbR*(1-cmE*cmE)/(1+cmE*Math.cos(cja)),cjp=pj(Math.cos(cja+cm.inc)*cjr,0,Math.sin(cja+cm.inc)*cjr,cam);if(cj===0)ctx.moveTo(cjp.x,cjp.y);else ctx.lineTo(cjp.x,cjp.y);}ctx.stroke();ctx.setLineDash([]);}
        if(show.labels){ctx.fillStyle="rgba(150,210,255,0.7)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText(cm.name,cmPj.x,cmPj.y-comaR-5);}
      }

      /* Sort + draw sun/planets */
      var eclipseType=null,eclipseEarPj=null,eclipseEarRr=0;
      var items=[{k:"s",z:sunPj.z}],pjArr=[];for(var di=0;di<pd.length;di++){var pp=pj(pd[di].wx,pd[di].wy,pd[di].wz,cam);pjArr.push(pp);items.push({k:"p",z:pp.z,i:di});}items.sort(function(a,b){return b.z-a.z;});
      hits.push({n:"sun",x:sunPj.x,y:sunPj.y,r:Math.max(srScr,12)});

      for(var dr=0;dr<items.length;dr++){
        var it=items[dr];
        if(it.k==="s"){
          var gr=ctx.createRadialGradient(sunPj.x,sunPj.y,srScr*0.2,sunPj.x,sunPj.y,srScr*3);gr.addColorStop(0,"rgba(255,220,80,0.5)");gr.addColorStop(0.3,"rgba(255,180,50,0.12)");gr.addColorStop(1,"rgba(255,150,30,0)");ctx.fillStyle=gr;ctx.fillRect(sunPj.x-srScr*3,sunPj.y-srScr*3,srScr*6,srScr*6);
          drawSun(ctx,sunPj.x,sunPj.y,srScr,t);
          if(show.labels){ctx.fillStyle="rgba(255,220,100,0.85)";ctx.font="bold 11px sans-serif";ctx.textAlign="center";ctx.fillText(langR.current==="en"?"Sun":"太陽",sunPj.x,sunPj.y-srScr-7);}
        }else if(show.planets){
          var idx=it.i,pdt=pd[idx],ppp=pjArr[idx],rr=Math.max(pdt.vr*cam.zm,0.4);
          hits.push({n:pdt.pl.n,x:ppp.x,y:ppp.y,r:Math.max(rr,10)});
          if(pdt.pl.n==="Saturn")dRi(ctx,pdt.wx,pdt.wy,pdt.wz,pdt.vr,cam,pdt.pl.t);
          drawPlanetBody(ctx,ppp.x,ppp.y,rr,pdt.pl,pdt.rotAng);
          dSh(ctx,ppp.x,ppp.y,rr,pdt.wx,pdt.wz,cam);
          if(show.tilt)dAx(ctx,ppp.x,ppp.y,rr,pdt.pl.t);
          if(pdt.pl.n==="Earth"&&show.moon){var moV=mOf(_rd,_un),mAng=(t/MD.p)*TAU,mx=pdt.wx+Math.cos(mAng)*moV,mz=pdt.wz+Math.sin(mAng)*moV,mp=pj(mx,0,mz,cam),mrV=Math.max(mRf(_rp,_un)*cam.zm,0.3);dC(ctx,mp.x,mp.y,mrV,"rgba(200,200,200,1)");if(mrV>3)sphereShade(ctx,mp.x,mp.y,mrV);dSh(ctx,mp.x,mp.y,mrV,mx,mz,cam);if(show.labels){ctx.fillStyle="rgba(200,200,200,0.75)";ctx.font="9px sans-serif";ctx.textAlign="center";ctx.fillText("月",mp.x,mp.y-mrV-4);}}
          if(pdt.pl.n==="Jupiter"&&show.moon){for(var gmi=0;gmi<GMOONS.length;gmi++){var gm=GMOONS[gmi],gmOrb=_un?(gm.orbR/1e6)*DK:(_rd?(gm.orbR*0.001)*DK:(12+gmi*5)),gmAng=(t/gm.p)*TAU,gmWx=pdt.wx+Math.cos(gmAng)*gmOrb,gmWz=pdt.wz+Math.sin(gmAng)*gmOrb,gmPj=pj(gmWx,0,gmWz,cam),gmR=Math.max(_un?(gm.r/1e6)*DK*cam.zm:(_rp?gm.r*SK*0.01*cam.zm:(1.2+gmi*0.3)*cam.zm*0.3),0.4);dC(ctx,gmPj.x,gmPj.y,gmR,gm.col);if(gmR>1.5)sphereShade(ctx,gmPj.x,gmPj.y,gmR);dSh(ctx,gmPj.x,gmPj.y,gmR,gmWx,gmWz,cam);if(show.labels&&gmR>0.8){ctx.fillStyle="rgba(200,200,180,0.65)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText(gm.name,gmPj.x,gmPj.y-gmR-3);}}}
          if(pdt.pl.n==="Earth"){var moVe=mOf(_rd,_un),mAnge=(t/MD.p)*TAU,sunAngE=Math.atan2(-pdt.wz,-pdt.wx),cosPhaseE=Math.cos(mAnge-sunAngE),inNode=Math.abs(Math.sin(Math.PI*t/173.31))<0.22;if(inNode){if(cosPhaseE>0.9995)eclipseType="solar";else if(cosPhaseE<-0.9993)eclipseType="lunar";}eclipseEarPj=ppp;eclipseEarRr=rr;}
          if(show.labels){ctx.fillStyle="rgba(255,255,255,0.85)";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(langR.current==="en"?pdt.pl.n:pdt.pl.j,ppp.x,ppp.y-rr-7);if(show.tilt){ctx.fillStyle="rgba(255,255,100,0.45)";ctx.font="8px sans-serif";ctx.fillText(pdt.pl.t+"°",ppp.x,ppp.y+rr+13);}}
        }
      }
      if(show.orbits){for(var oi2=0;oi2<pd.length;oi2++){var _oc2=pd[oi2].pl.c.match(/(\d+),(\d+),(\d+)/);dOb(ctx,pd[oi2].oR,cam,_oc2?_oc2[1]+","+_oc2[2]+","+_oc2[3]:null,true);}}
      sim.hitAreas=hits;if(ssFade<1)ctx.globalAlpha=1;ctx.restore();
      if(eclipseType&&!cmpR.current){var eTxt=langR.current==="en"?(eclipseType==="solar"?"🌑 Solar Eclipse":"🌕 Lunar Eclipse"):(eclipseType==="solar"?"🌑 日食":"🌕 月食");ctx.save();ctx.font="bold 13px system-ui,sans-serif";ctx.textAlign="center";var etW=ctx.measureText(eTxt).width+24;ctx.fillStyle="rgba(0,0,0,0.72)";ctx.fillRect(W/2-etW/2,H-72,etW,30);ctx.fillStyle=eclipseType==="solar"?"rgba(255,210,80,1)":"rgba(200,150,255,1)";ctx.fillText(eTxt,W/2,H-51);if(eclipseEarPj){ctx.strokeStyle=eclipseType==="solar"?"rgba(255,180,0,0.7)":"rgba(180,120,255,0.7)";ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.arc(eclipseEarPj.x,eclipseEarPj.y,eclipseEarRr+10,0,TAU);ctx.stroke();ctx.setLineDash([]);}ctx.restore();}

      /* Galaxy info in screen space */
      if(galInfoFade>0){
        ctx.fillStyle="rgba(255,255,255,"+(galInfoFade*0.35).toFixed(2)+")";ctx.font="12px sans-serif";ctx.textAlign="center";
        ctx.fillText("天の川銀河  Milky Way",W/2,32);ctx.font="9px sans-serif";ctx.fillText("直径: 約10万光年　恒星数: 約1000〜4000億　太陽位置: 中心から約2.6万光年",W/2,48);
        var galSc2=Math.max(cam.zm*30000,W*0.006);var sclLy=10000,sclPx=sclLy/1000*galSc2;
        if(sclPx>20&&sclPx<W*0.4){ctx.strokeStyle="rgba(255,255,255,"+(galInfoFade*0.3).toFixed(2)+")";ctx.lineWidth=1;var sbx2=W/2-sclPx/2,sby2=H-32;ctx.beginPath();ctx.moveTo(sbx2,sby2);ctx.lineTo(sbx2+sclPx,sby2);ctx.moveTo(sbx2,sby2-3);ctx.lineTo(sbx2,sby2+3);ctx.moveTo(sbx2+sclPx,sby2-3);ctx.lineTo(sbx2+sclPx,sby2+3);ctx.stroke();ctx.fillText("1万光年",W/2,sby2-6);}
      }

      var _cl=cleanR.current;var days=Math.floor(t),yrs=t/365.25;var curDate=simDaysToDate(t);if(!_cl){ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="10px sans-serif";ctx.textAlign="right";ctx.fillText(curDate+"  ("+(yrs>=1?(yrs.toFixed(1)+"年 / "):"")+days+"日)",W-16,26);}
      if(_un||_rd){var bPx=80,bW=bPx/cam.zm/DK,bx=W-120,by=H-40;ctx.strokeStyle="rgba(255,255,255,0.35)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+bPx,by);ctx.moveTo(bx,by-4);ctx.lineTo(bx,by+4);ctx.moveTo(bx+bPx,by-4);ctx.lineTo(bx+bPx,by+4);ctx.stroke();ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="9px sans-serif";ctx.textAlign="center";var lbl2;if(bW>=1e6)lbl2=(bW/1e6).toFixed(1)+"億km";else if(bW>=1e4)lbl2=(bW/1e4).toFixed(bW>=1e5?0:1)+"万km";else if(bW>=1)lbl2=Math.round(bW).toLocaleString()+"km";else lbl2=Math.round(bW*1000)+"m";ctx.fillText(lbl2,bx+bPx/2,by-8);}

      if(fc!=="all"){var mmSz=90,mmX=W-mmSz-55,mmY=H-mmSz-55;ctx.fillStyle="rgba(5,5,15,0.75)";ctx.fillRect(mmX-2,mmY-2,mmSz+4,mmSz+4);ctx.strokeStyle="rgba(255,255,255,0.15)";ctx.lineWidth=1;ctx.strokeRect(mmX-2,mmY-2,mmSz+4,mmSz+4);var mmCx=mmX+mmSz/2,mmCy=mmY+mmSz/2,mmScale=(mmSz*0.45)/oR(PL[7],false,false);ctx.fillStyle="rgba(255,200,50,0.8)";ctx.fillRect(mmCx-1.5,mmCy-1.5,3,3);for(var mmi=0;mmi<pd.length;mmi++){var mmOr=oR(pd[mmi].pl,false,false),mmAng2=(t/pd[mmi].pl.p)*TAU,mmPx=mmCx+Math.cos(mmAng2)*mmOr*mmScale,mmPy=mmCy+Math.sin(mmAng2)*mmOr*mmScale;ctx.fillStyle=pd[mmi].pl.c;var mmDot=pd[mmi].pl.n===fc?2.5:1.2;ctx.fillRect(mmPx-mmDot,mmPy-mmDot,mmDot*2,mmDot*2);if(pd[mmi].pl.n===fc){ctx.strokeStyle="rgba(255,255,255,0.6)";ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(mmPx-4,mmPy);ctx.lineTo(mmPx+4,mmPy);ctx.moveTo(mmPx,mmPy-4);ctx.lineTo(mmPx,mmPy+4);ctx.stroke();}}}

      var tr2=tourRef.current;if(tr2.active){var tBarW=180,tBarX=(W-tBarW)/2,tBarY=H-28;if(tr2.trans){tr2.transT=Math.min(1,(tr2.transT||0)+dt/(tr2.transDur||1.8));var ease=tr2.transT<1?tr2.transT*tr2.transT*(3-2*tr2.transT):1;cam.fx=tr2.fromFx+(tr2.toFx-tr2.fromFx)*ease;cam.fz=tr2.fromFz+(tr2.toFz-tr2.fromFz)*ease;var tdx=tr2.toFx-tr2.fromFx,tdz=tr2.toFz-tr2.fromFz,tdist=Math.sqrt(tdx*tdx+tdz*tdz);var midZm=tdist>0.5?Math.min(W,H)*0.35/tdist:Math.max(1,Math.min(tr2.fromZm,tr2.toZm)*0.5);midZm=Math.max(1,midZm);if(ease<0.5){cam.zm=tr2.fromZm+(midZm-tr2.fromZm)*(ease*2);}else{cam.zm=midZm+(tr2.toZm-midZm)*((ease-0.5)*2);}if(tr2.transT>=1){tr2.trans=false;cam.fx=tr2.toFx;cam.fz=tr2.toFz;cam.zm=tr2.toZm;}var tPanProg=ease;ctx.fillStyle="rgba(8,10,20,0.7)";ctx.fillRect(tBarX-8,tBarY-14,tBarW+16,24);ctx.fillStyle="rgba(255,255,255,0.15)";ctx.fillRect(tBarX,tBarY,tBarW,4);ctx.fillStyle="rgba(255,160,50,0.85)";ctx.fillRect(tBarX,tBarY,tBarW*tPanProg,4);ctx.fillStyle="rgba(255,200,100,0.7)";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText("→ "+TOUR_NAMES[tr2.idx]+" ("+(tr2.idx+1)+"/"+TOUR_SEQ.length+")",W/2,tBarY-3);}else{tr2.timer+=dt;if(tr2.timer>=TOUR_HOLD){tr2.timer=0;var nextIdx=(tr2.idx+1)%TOUR_SEQ.length;if(nextIdx===0){tr2.active=false;setTouring(false);setFoc("all");setInfo(null);}else{tr2.fromFx=cam.fx;tr2.fromFz=cam.fz;tr2.fromZm=cam.zm;var tk2=TOUR_SEQ[nextIdx];var toTarget=null;for(var tfi=0;tfi<pd.length;tfi++){if(pd[tfi].pl.n===tk2){toTarget=pd[tfi];break;}}if(!toTarget){for(var tci=0;tci<cd.length;tci++){if(cd[tci].cm.key===tk2){toTarget=cd[tci];break;}}}tr2.toFx=toTarget?toTarget.wx:0;tr2.toFz=toTarget?toTarget.wz:0;tr2.toZm=cam.zm;tr2.idx=nextIdx;tr2.transT=0;tr2.transDur=1.8;tr2.trans=true;setFoc(tk2);setInfo(findInfo(tk2));}}var tProg=tr2.timer/TOUR_HOLD;ctx.fillStyle="rgba(8,10,20,0.7)";ctx.fillRect(tBarX-8,tBarY-14,tBarW+16,24);ctx.fillStyle="rgba(255,255,255,0.15)";ctx.fillRect(tBarX,tBarY,tBarW,4);ctx.fillStyle="rgba(100,180,255,0.7)";ctx.fillRect(tBarX,tBarY,tBarW*tProg,4);ctx.fillStyle="rgba(255,255,255,0.6)";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText("ツアー: "+TOUR_NAMES[tr2.idx]+" ("+(tr2.idx+1)+"/"+TOUR_SEQ.length+")",W/2,tBarY-3);}}

      if(cmpR.current){var cmpSt=cmpStateRef.current;ctx.fillStyle="rgba(3,3,12,0.92)";ctx.fillRect(0,0,W,H);ctx.fillStyle="rgba(255,255,255,0.5)";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("サイズ比較モード（実比率）",W/2,30);var cmpY=H*0.52;var cmpBaseScale=(H*0.015)/PL[2].r;var cmpScale=cmpBaseScale*cmpSt.zm;var sunPx=SRR*cmpScale,sunCX=-sunPx+50;ctx.save();ctx.beginPath();ctx.rect(0,50,W,H-50);ctx.clip();clipCirc(ctx,sunCX,cmpY,sunPx);ctx.fillStyle="rgba(255,200,50,1)";ctx.fill();ctx.fillStyle="rgba(255,220,100,0.7)";ctx.font="11px sans-serif";ctx.textAlign="left";ctx.fillText("太陽 ☀",Math.max(4,sunCX+sunPx+4),cmpY-sunPx*0.1-4);var allCmp=PL.concat(DWARFS);var cmpXs=[],cx=W*0.1+cmpSt.offX;for(var ci=0;ci<allCmp.length;ci++){cmpXs[ci]=cx;var rC=Math.max(allCmp[ci].r*cmpScale,2);var rN=ci<allCmp.length-1?Math.max(allCmp[ci+1].r*cmpScale,2):0;cx+=Math.max(rC+rN+18*cmpSt.zm,44*cmpSt.zm);}for(var cpi=0;cpi<allCmp.length;cpi++){var cpx=cmpXs[cpi],cpr=Math.max(allCmp[cpi].r*cmpScale,1.5);if(cpx+cpr<0||cpx-cpr>W)continue;drawPlanetBody(ctx,cpx,cmpY,cpr,allCmp[cpi],t/Math.abs(allCmp[cpi].rot)*TAU);if(allCmp[cpi].n==="Saturn")dRi(ctx,cpx,cmpY,0,cpr,{fx:0,fy:0,fz:0,rx:0,ry:0,zm:1},allCmp[cpi].t);ctx.fillStyle="rgba(255,255,255,0.85)";ctx.font="11px sans-serif";ctx.textAlign="center";ctx.fillText(allCmp[cpi].j,cpx,cmpY+cpr+16);ctx.fillStyle="rgba(255,255,255,0.45)";ctx.font="9px sans-serif";ctx.fillText("地球の"+(allCmp[cpi].r/6.4).toFixed(1)+"倍",cpx,cmpY+cpr+29);}ctx.restore();ctx.fillStyle="rgba(255,255,255,0.25)";ctx.font="11px sans-serif";ctx.textAlign="center";ctx.fillText("← ドラッグでスクロール　ピンチ/ホイールでズーム →",W/2,H-12);}

      fR.current=requestAnimationFrame(frame);
    }
    fR.current=requestAnimationFrame(frame);
    return function(){alive=false;cancelAnimationFrame(fR.current);window.removeEventListener("resize",rsz);cv.removeEventListener("mousedown",md);window.removeEventListener("mousemove",mm);window.removeEventListener("mouseup",mu);cv.removeEventListener("wheel",wl);cv.removeEventListener("touchstart",tst);cv.removeEventListener("touchmove",tmv);cv.removeEventListener("touchend",ten);window.removeEventListener("keydown",kd);};
  },[dz,focusOn,stopTour]);

  var pn={position:"absolute",background:"rgba(8,10,20,0.88)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"7px 9px",color:"rgba(255,255,255,0.9)",fontSize:11,fontFamily:"system-ui,sans-serif",zIndex:10,backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",maxWidth:"calc(100vw - 20px)",boxSizing:"border-box"};
  var bF={background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,color:"rgba(255,255,255,0.75)",fontSize:10,padding:"4px 8px",cursor:"pointer",fontFamily:"system-ui,sans-serif",whiteSpace:"nowrap",outline:"none"};
  var bN=Object.assign({},bF,{background:"rgba(70,140,255,0.25)",border:"1px solid rgba(70,140,255,0.45)",color:"rgba(170,210,255,1)"});
  var bU=Object.assign({},bF,{background:"rgba(255,170,50,0.25)",border:"1px solid rgba(255,170,50,0.5)",color:"rgba(255,210,140,1)"});
  var bD=Object.assign({},bF,{opacity:0.35,cursor:"default"});
  var lb={fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:4,textTransform:"uppercase",letterSpacing:1};
  var curZm=ZS[zi]||1;
  var zmStr=curZm>=10?curZm.toFixed(0)+"x":curZm>=1?curZm.toFixed(1)+"x":curZm>=0.01?curZm.toFixed(2)+"x":curZm.toFixed(5)+"x";
  var zmLabel=curZm<0.003?"銀河":curZm<0.03?"恒星間":"太陽系";
  var bT=function(c){return Object.assign({},bF,{background:"rgba("+c+",0.25)",border:"1px solid rgba("+c+",0.5)",color:"rgba(255,255,255,0.9)"});};

  return(
    <div style={{width:"100%",height:"100dvh",background:"rgba(3,3,10,1)",position:"relative",overflow:"hidden"}}>
      <canvas ref={cR} style={{display:"block",width:"100%",height:"100%",touchAction:"none",cursor:"crosshair"}} onClick={handleClick}/>

      {/* Focus panel */}
      {cleanView===0&&!landing&&<DragPanel style={Object.assign({},pn,{top:10,left:10,maxWidth:300})}><div style={lb}>{lang==="en"?"Focus ⠿":"フォーカス ⠿"}</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{FL.map(function(f){return <button key={f.k} style={foc===f.k?bN:bF} onClick={function(){focusOn(f.k);}}>{lang==="en"?(f.e||f.l):f.l}</button>;})}</div></DragPanel>}

      {/* Speed panel */}
      {cleanView===0&&!landing&&<DragPanel style={Object.assign({},pn,{top:10,right:10})}><div style={lb}>速度 ⠿</div><div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}><button style={Object.assign({},paused?bU:bF,{fontSize:12,padding:"3px 7px"})} onClick={function(){setPaused(function(p){return!p;});}}>{paused?"▶":"⏸"}</button>{SP.map(function(s){return <button key={s} style={spd===s&&!paused?bN:bF} onClick={function(){setSpd(s);setPaused(false);}}>{s}x</button>;})}</div></DragPanel>}

      {/* Toggles panel */}
      {cleanView===0&&!landing&&<DragPanel style={Object.assign({},pn,{bottom:10,left:10,maxWidth:300})}>
        <div style={lb}>表示 ⠿</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[{k:"orbits",l:"軌道"},{k:"trails",l:"軌跡"},{k:"belt",l:"小惑星帯"},{k:"tilt",l:"地軸"},{k:"moon",l:"月"},{k:"labels",l:"ラベル"},{k:"planets",l:"惑星"}].map(function(x){return <button key={x.k} style={sh[x.k]?bN:bF} onClick={function(){tog(x.k);}}>{x.l}</button>;})}</div>
        <div style={Object.assign({},lb,{marginTop:8,marginBottom:4})}>実スケール</div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}><button style={uni?bD:(rSn?bN:bF)} onClick={function(){if(!uni)setRSn(function(p){return!p;});}}>太陽{!uni&&rSn?" ●":""}</button><button style={uni?bD:(rPl?bN:bF)} onClick={function(){if(!uni)setRPl(function(p){return!p;});}}>惑星{!uni&&rPl?" ●":""}</button><button style={uni?bD:(rDi?bN:bF)} onClick={function(){if(!uni)setRDi(function(p){return!p;});}}>距離{!uni&&rDi?" ●":""}</button></div>
        <div style={{marginTop:6,display:"flex",gap:3,flexWrap:"wrap"}}><button style={uni?bU:bF} onClick={function(){setUni(function(p){return!p;});}}>統一比率{uni?" ●":""}</button><button style={compare?bT("100,220,150"):bF} onClick={function(){setCompare(function(p){if(!p)cmpStateRef.current={offX:0,zm:1};return!p;});}}>比較{compare?" ●":""}</button><button style={touring?bT("200,100,255"):bF} onClick={function(){if(touring){stopTour();setFoc("all");setInfo(null);}else{setLanding(null);stopTour();setTouring(true);tourRef.current={active:true,idx:0,timer:0,trans:false};setFoc("sun");setInfo({type:"sun"});}}}>{touring?"ツアー停止":"ツアー"}</button><button style={bgm?bT("80,200,220"):bF} onClick={function(){setBgm(function(p){return!p;});}}>BGM{bgm?" ♪":""}</button><button style={lang==="en"?bT("100,220,180"):bF} onClick={function(){setLang(function(p){return p==="ja"?"en":"ja";});}}>EN/JA</button></div>
        <div style={Object.assign({},lb,{marginTop:8,marginBottom:4})}>ツール</div>
        <div style={{display:"flex",gap:3,flexWrap:"wrap",alignItems:"center"}}>
          <button style={showDate?bN:bF} onClick={function(){setShowDate(function(p){return!p;});}}>日付移動</button>
          <button style={bF} onClick={takeScreenshot}>📷 撮影モード</button>
          <button style={bF} onClick={shareURL}>🔗 共有</button>
          <button style={bF} onClick={function(){setImportMode(true);}}>📥 読込</button>
          <button style={bF} onClick={function(){S.current.t=dateToSimDays(new Date().toISOString().slice(0,10));for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];}}>今日</button>
          <button style={bF} onClick={function(){for(var i=0;i<S.current.trails.length;i++)S.current.trails[i]=[];}}>軌跡クリア</button>
          <button style={showEvents?bT("255,200,80"):bF} onClick={function(){if(!showEvents){eventsRef.current=scanEvents(S.current.t);}setShowEvents(function(p){return!p;});}}>📅 天文イベント</button>
        </div>
        {showDate&&<div style={{marginTop:6,display:"flex",gap:4,alignItems:"center"}}>
          <input type="date" value={dateInput} onChange={function(e){setDateInput(e.target.value);}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:4,color:"rgba(255,255,255,0.9)",fontSize:10,padding:"3px 6px",fontFamily:"system-ui",outline:"none",colorScheme:"dark"}}/>
          <button style={bN} onClick={function(){if(dateInput)jumpToDate(dateInput);}}>移動</button>
        </div>}
        {showDate&&<div style={{marginTop:4,display:"flex",gap:3,flexWrap:"wrap"}}>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("2061-07-28");}}>ハレー彗星 2061</button>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("2035-09-02");}}>日食 2035</button>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("1969-07-20");}}>月面着陸</button>
          <button style={Object.assign({},bF,{fontSize:8})} onClick={function(){jumpToDate("2006-01-19");}}>NHニューホライズンズ</button>
        </div>}
      </DragPanel>}

      {/* Zoom panel */}
      {cleanView===0&&!landing&&<DragPanel style={Object.assign({},pn,{bottom:10,right:10,display:"flex",flexDirection:"column",alignItems:"center",gap:4})}><div style={lb}>ズーム ⠿</div><button style={Object.assign({},bF,{width:34,height:30,fontSize:18,padding:0,display:"flex",alignItems:"center",justifyContent:"center"})} onClick={zIn}>+</button><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",minWidth:44,textAlign:"center"}}>{zmStr}<br/><span style={{fontSize:7,color:"rgba(255,255,255,0.3)"}}>{zmLabel}</span></div><button style={Object.assign({},bF,{width:34,height:30,fontSize:18,padding:0,display:"flex",alignItems:"center",justifyContent:"center"})} onClick={zOut}>−</button></DragPanel>}

      {/* Event calendar panel */}
      {cleanView===0&&!landing&&showEvents&&<DragPanel style={Object.assign({},pn,{top:80,left:10,width:260,maxWidth:"calc(100vw - 20px)",padding:"10px 12px",maxHeight:"70vh",display:"flex",flexDirection:"column"})}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:11,fontWeight:"bold",color:"rgba(255,220,80,0.95)"}}>📅 天文イベント（2年先まで）</span>
          <button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){setShowEvents(false);}}>✕</button>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {eventsRef.current.length===0&&<div style={{color:"rgba(255,255,255,0.4)",fontSize:9}}>イベントが見つかりません</div>}
          {eventsRef.current.map(function(ev,ei){return <div key={ei} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
            <span style={{fontSize:12,flexShrink:0}}>{ev.ic}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.9)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.n}</div>
              <div style={{fontSize:8,color:"rgba(180,200,255,0.6)"}}>{ev.date}</div>
            </div>
            <button style={Object.assign({},bF,{padding:"2px 5px",fontSize:8,flexShrink:0})} onClick={function(){S.current.t=ev.t;setShowEvents(false);}}>→移動</button>
          </div>;})}
        </div>
      </DragPanel>}

      {/* Info panel */}
      {cleanView===0&&!landing&&info!==null&&<DragPanel style={Object.assign({},pn,{top:80,right:10,width:180,maxWidth:"calc(100vw - 20px)",padding:"10px 12px"})}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:"bold",color:"rgba(255,255,255,0.95)"}}>{info.type==="sun"?(lang==="en"?"Sun":SUNINFO.j):info.type==="comet"?info.cm.name:(lang==="en"?info.pl.n:info.pl.j)}</span><button style={Object.assign({},bF,{padding:"2px 6px",fontSize:9})} onClick={function(){setInfo(null);}}>✕</button></div>{info.type==="sun"?<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)"}}><div>質量: {SUNINFO.mass}</div><div>半径: {SUNINFO.r}</div><div>表面温度: {SUNINFO.temp}</div><div>分類: {SUNINFO.type}</div><div>年齢: {SUNINFO.age}</div></div>:info.type==="comet"?<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)",whiteSpace:"pre-line"}}>{info.cm.info}</div>:<div style={{fontSize:9,lineHeight:"16px",color:"rgba(255,255,255,0.7)"}}><div>質量: {info.pl.mass}</div><div>半径: {(info.pl.r*1000).toLocaleString()} km</div><div>重力: {info.pl.grav}</div><div>自転: {info.pl.day}</div><div>公転: {info.pl.year}</div><div>衛星: {info.pl.moons}個</div><div>大気: {info.pl.atm}</div><div>気温: {info.pl.temp}</div><div>地軸傾斜: {info.pl.t}°</div><div>太陽距離: {info.pl.d}百万km</div><button style={Object.assign({},touring?bD:bT("100,180,255"),{marginTop:8,width:"100%",fontSize:11,padding:"6px"})} disabled={touring} onClick={function(){if(!touring)doLanding(info.pl.n);}}>{touring?(lang==="en"?"🚀 Stop Tour First":"🚀 ツアー停止後に着陸可"):(lang==="en"?"🚀 Land":"🚀 着陸")}</button></div>}</DragPanel>}

      {/* Landing mode top-right: speed + liftoff */}
      {landing&&<div style={{position:"absolute",top:10,right:10,zIndex:26,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
        <div style={{background:"rgba(0,5,18,0.82)",border:"1px solid rgba(100,160,255,0.2)",borderRadius:6,padding:"6px 8px",display:"flex",flexWrap:"wrap",justifyContent:"flex-end",gap:3,maxWidth:260}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:"100%",marginBottom:2}}>速度</span>
          <button style={Object.assign({},paused?bT("100,180,255"):bF,{padding:"2px 6px",fontSize:10})} onClick={function(){setPaused(function(p){return!p;})}}>{paused?"▶":"⏸"}</button>
          {LAND_SP.map(function(s){return <button key={s.l} style={Object.assign({},landSpd===s.v&&!paused?bN:bF,{padding:"2px 5px",fontSize:9})} onClick={function(){setLandSpd(s.v);landSpdR.current=s.v;setPaused(false);}}>{s.l}</button>;})}
          <button style={Object.assign({},bT("100,230,160"),{padding:"2px 6px",fontSize:9,marginTop:2,width:"100%"})} onClick={function(){
            S.current.t=(Date.now()-J2000)/86400000;setPaused(false);
            if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(pos){var lng2=Math.round(pos.coords.longitude),lat3=Math.round(pos.coords.latitude);setLandLng(lng2);landLngR.current=lng2;setLandLat(lat3);landLatR.current=lat3;},function(){});}
          }}>📍 今</button>
        </div>
        <button style={Object.assign({},bT("255,100,80"),{fontSize:12,padding:"8px 16px"})} onClick={function(){setLanding(null);}}>{lang==="en"?"🚀 Liftoff":"🚀 離陸"}</button>
      </div>}

      {/* Landing mode control panel — left: latitude vertical, bottom: lng+az+speed */}
      {landing&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",zIndex:25,background:"rgba(0,5,18,0.82)",borderRight:"1px solid rgba(100,160,255,0.2)",padding:"10px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:6,fontFamily:"system-ui,sans-serif"}}>
        <span style={{color:"rgba(120,150,200,0.5)",fontSize:8}}>N</span>
        <span style={{color:"rgba(255,255,255,0.85)",fontSize:9}}>{landLat>=0?"+":""}{landLat}°</span>
        <span style={{color:"rgba(180,210,255,0.7)",fontSize:9}}>緯度</span>
        <input type="range" min="-90" max="90" step="1" value={landLat}
          style={{writingMode:"vertical-lr",direction:"rtl",height:130,width:24,cursor:"pointer",accentColor:"#64b4ff"}}
          onChange={function(e){var v=+e.target.value;setLandLat(v);landLatR.current=v;}}/>
        <span style={{color:"rgba(120,150,200,0.5)",fontSize:8}}>S</span>
      </div>}
      {landing&&<div style={{position:"absolute",bottom:0,left:40,right:0,zIndex:25,background:"rgba(0,5,18,0.85)",borderTop:"1px solid rgba(100,160,255,0.2)",padding:"6px 10px 8px",fontFamily:"system-ui,sans-serif"}}>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:22,flexShrink:0}}>経度</span>
          <input type="range" style={{flex:1,height:16,cursor:"pointer",accentColor:"#64b4ff"}} min="-180" max="180" step="1" value={landLng}
            onChange={function(e){var v=+e.target.value;setLandLng(v);landLngR.current=v;}}/>
          <span style={{color:"rgba(255,255,255,0.85)",fontSize:9,width:46,textAlign:"right",flexShrink:0}}>{landLng>=0?"+":""}{landLng}°</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:22,flexShrink:0}}>方位</span>
          <input type="range" style={{flex:1,height:16,cursor:"pointer",accentColor:"#64b4ff"}} min="0" max="359" step="1"
            value={Math.round(((landYaw*57.296)%360+360)%360)}
            onChange={function(e){var r=(+e.target.value)*0.01745;setLandYaw(r);landYR.current=r;}}/>
          <span style={{color:"rgba(255,255,255,0.85)",fontSize:9,width:46,textAlign:"right",flexShrink:0}}>{(function(){var d=Math.round(((landYaw*57.296)%360+360)%360);var n=d<23?"N":d<68?"NE":d<113?"E":d<158?"SE":d<203?"S":d<248?"SW":d<293?"W":d<338?"NW":"N";return d+"°"+n;})()}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{color:"rgba(180,210,255,0.7)",fontSize:9,width:22,flexShrink:0}}>仰角</span>
          <input type="range" style={{flex:1,height:16,cursor:"pointer",accentColor:"#64b4ff"}} min="-40" max="40" step="1" value={landTilt}
            onChange={function(e){var v=+e.target.value;setLandTilt(v);landTiltR.current=v;}}/>
          <span style={{color:"rgba(255,255,255,0.85)",fontSize:9,width:46,textAlign:"right",flexShrink:0}}>{landTilt>=0?"+":""}{landTilt}°</span>
        </div>
      </div>}

      {cleanView===0&&!landing&&<div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",color:"rgba(255,255,255,0.2)",fontSize:9,fontFamily:"system-ui,sans-serif",pointerEvents:"none",zIndex:10,textAlign:"center"}}>クリックで選択　ドラッグ：回転　ピンチ：ズーム　パネルはドラッグ移動可能</div>}
      <div style={{position:"absolute",top:4,left:4,color:"rgba(255,255,255,0.35)",fontSize:9,fontFamily:"system-ui,sans-serif",pointerEvents:"none",zIndex:20}}>v2.2.0</div>

      {/* Clean view mode for native screenshot */}
      {cleanView>0&&<div style={{position:"absolute",inset:0,zIndex:200}} onClick={function(){setCleanView(0);}}>
        {cleanView===1&&<div style={{position:"absolute",top:16,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.6)",borderRadius:20,padding:"8px 20px",color:"rgba(255,255,255,0.8)",fontSize:12,fontFamily:"system-ui,sans-serif",textAlign:"center",animation:"none"}}>📷 電源＋音量↓ でスクリーンショット<br/><span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>このテキストは1.5秒で消えます</span></div>}
      </div>}

      {/* Share state code overlay */}
      {shareText&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.8)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={function(){setShareText(null);}}>
        <div style={{background:"rgba(15,18,30,0.95)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:16,maxWidth:"90%",width:320}} onClick={function(e){e.stopPropagation();}}>
          <div style={{color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:"bold",marginBottom:8,fontFamily:"system-ui,sans-serif"}}>🔗 状態コード</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:9,marginBottom:8,fontFamily:"system-ui,sans-serif"}}>このコードを共有すると同じ視点を再現できます</div>
          <input id="share-url-input" type="text" readOnly value={shareText} onFocus={function(e){e.target.select();}} style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:6,color:"rgba(255,255,255,0.95)",fontSize:11,padding:"8px",fontFamily:"monospace",outline:"none",boxSizing:"border-box",textAlign:"center",letterSpacing:0.5}}/>
          <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
            <button onClick={function(){try{var inp=document.querySelector("#share-url-input");if(inp){inp.focus();inp.select();inp.setSelectionRange(0,99999);document.execCommand("copy");}}catch(e){}}} style={{background:"rgba(70,140,255,0.3)",border:"1px solid rgba(70,140,255,0.5)",borderRadius:6,color:"rgba(170,210,255,1)",fontSize:10,padding:"6px 14px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>コピー</button>
            <button onClick={function(){setShareText(null);}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"rgba(255,255,255,0.7)",fontSize:10,padding:"6px 14px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>閉じる</button>
          </div>
        </div>
      </div>}

      {/* Import state code overlay */}
      {importMode&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.8)",zIndex:150,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={function(){setImportMode(false);}}>
        <div style={{background:"rgba(15,18,30,0.95)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:16,maxWidth:"90%",width:320}} onClick={function(e){e.stopPropagation();}}>
          <div style={{color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:"bold",marginBottom:8,fontFamily:"system-ui,sans-serif"}}>📥 コード読込</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:9,marginBottom:8,fontFamily:"system-ui,sans-serif"}}>共有された状態コードを貼り付けてください</div>
          <input type="text" value={importText} onChange={function(e){setImportText(e.target.value);}} placeholder="SS|9613.2|..." style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:6,color:"rgba(255,255,255,0.95)",fontSize:11,padding:"8px",fontFamily:"monospace",outline:"none",boxSizing:"border-box",textAlign:"center"}}/>
          <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"flex-end"}}>
            <button onClick={function(){if(importState(importText)){setImportMode(false);setImportText("");}}} style={{background:"rgba(70,140,255,0.3)",border:"1px solid rgba(70,140,255,0.5)",borderRadius:6,color:"rgba(170,210,255,1)",fontSize:10,padding:"6px 14px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>復元</button>
            <button onClick={function(){setImportMode(false);}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"rgba(255,255,255,0.7)",fontSize:10,padding:"6px 14px",cursor:"pointer",fontFamily:"system-ui,sans-serif"}}>閉じる</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
