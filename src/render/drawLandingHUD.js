import { TAU, MAP_CTNS } from "../data/solarData.js";
import { fillCirc } from "./utils.js";

function drawLandingHUD(ctx,W,H,h){
  var t=h.t,lat=h.lat,lngDeg=h.lngDeg,yaw=h.yaw,plName=h.plName;
  var solarDay=h.solarDay,sunAlt=h.sunAlt,pl=h.pl,sf=h.sf,rot=h.rot;
  var hrzY=h.hrzY,fov=h.fov;

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

  /* ======== COMPASS STRIP (just above horizon) ======== */
  var compY=hrzY-2;
  ctx.fillStyle="rgba(0,0,0,0.45)";ctx.fillRect(0,compY-12,W,18);
  ctx.strokeStyle="rgba(255,255,255,0.3)";ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(0,compY);ctx.lineTo(W,compY);ctx.stroke();
  var compDirs=[{a:0,n:"N"},{a:0.7854,n:"NE"},{a:1.5708,n:"E"},{a:2.3562,n:"SE"},{a:3.1416,n:"S"},{a:3.927,n:"SW"},{a:4.7124,n:"W"},{a:5.4978,n:"NW"}];
  for(var cdi=0;cdi<8;cdi++){
    var cdDiff=((compDirs[cdi].a-yaw)%TAU+TAU)%TAU;if(cdDiff>Math.PI)cdDiff-=TAU;
    if(Math.abs(cdDiff)>TAU*0.28)continue;
    var cdX=W/2+cdDiff*W*0.8/TAU;
    var isCard=compDirs[cdi].n.length===1;
    ctx.fillStyle=isCard?"rgba(255,200,120,0.95)":"rgba(180,210,255,0.7)";
    ctx.font=(isCard?"bold 11px":"9px")+" sans-serif";ctx.textAlign="center";
    ctx.fillText(compDirs[cdi].n,cdX,compY-2);
    ctx.strokeStyle=isCard?"rgba(255,200,120,0.7)":"rgba(255,255,255,0.4)";ctx.lineWidth=0.7;
    ctx.beginPath();ctx.moveTo(cdX,compY-1);ctx.lineTo(cdX,compY+3);ctx.stroke();
  }

  /* ======== RISE/SET/TRANSIT (sun) ======== */
  var latRad=(lat||0)*0.01745;
  var sunEcl2=(280.46+0.9856*t)*0.01745;
  var sunDecR3=Math.asin(Math.sin(0.40928)*Math.sin(sunEcl2));
  var cosHaS=-Math.tan(latRad)*Math.tan(sunDecR3);
  var rsStr;
  if(cosHaS>1)rsStr="極夜（太陽昇らず）";
  else if(cosHaS<-1)rsStr="白夜（太陽沈まず）";
  else{
    var haS=Math.acos(cosHaS);
    var fmtT=function(h){var hh=Math.floor(h),mm=Math.floor((h-hh)*60);return (hh<10?"0":"")+hh+":"+(mm<10?"0":"")+mm;};
    var rT=((0.5-haS/TAU)*24+24)%24,sT=((0.5+haS/TAU)*24)%24;
    rsStr="日の出 "+fmtT(rT)+"　南中 12:00　日の入り "+fmtT(sT);
  }
  ctx.fillStyle="rgba(255,200,140,0.65)";ctx.font="9px sans-serif";ctx.textAlign="center";
  ctx.fillText(rsStr,W/2,108);
}

export { drawLandingHUD };
