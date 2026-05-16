import { TAU, MAP_CTNS, APOLLO_SITES, LUNAR_MARIA, MARS_LANDMARKS, VENUS_LANDERS, MERCURY_SITES, TITAN_PROBES, HAYABUSA_SITES } from "../data/solarData.js";
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

  /* ======== MINI MOON MAP (Moon only) — Apollo sites + sub-Earth + maria ======== */
  if(plName==="Moon"){
    var lmW=130,lmH=65,lmX=52,lmY=90;
    ctx.save();
    /* background — gradient from far side (bright highlands) edges to near side (dark) center */
    var lmBg=ctx.createLinearGradient(lmX,0,lmX+lmW,0);
    lmBg.addColorStop(0,"rgba(150,146,138,0.85)");/* far side left */
    lmBg.addColorStop(0.25,"rgba(100,96,88,0.85)");/* limb */
    lmBg.addColorStop(0.5,"rgba(78,75,68,0.85)");/* near center */
    lmBg.addColorStop(0.75,"rgba(100,96,88,0.85)");/* limb */
    lmBg.addColorStop(1,"rgba(150,146,138,0.85)");/* far side right */
    ctx.fillStyle=lmBg;ctx.fillRect(lmX,lmY,lmW,lmH);
    /* maria on near side */
    ctx.fillStyle="rgba(40,38,35,0.85)";
    for(var lmi=0;lmi<LUNAR_MARIA.length;lmi++){var lma=LUNAR_MARIA[lmi];
      var lmCx=lmX+(lma.lng+180)/360*lmW,lmCy=lmY+(90-lma.lat)/180*lmH;
      var lmRx=lma.rLng/360*lmW,lmRy=lma.rLat/180*lmH;
      ctx.beginPath();ctx.ellipse(lmCx,lmCy,lmRx,lmRy,0,0,TAU);ctx.fill();}
    /* near/far side boundary (dashed) */
    ctx.strokeStyle="rgba(255,200,100,0.45)";ctx.lineWidth=0.7;ctx.setLineDash([2,2]);
    ctx.beginPath();ctx.moveTo(lmX+lmW*0.25,lmY);ctx.lineTo(lmX+lmW*0.25,lmY+lmH);ctx.stroke();
    ctx.beginPath();ctx.moveTo(lmX+lmW*0.75,lmY);ctx.lineTo(lmX+lmW*0.75,lmY+lmH);ctx.stroke();
    ctx.setLineDash([]);
    /* equator/meridian */
    ctx.strokeStyle="rgba(255,255,255,0.18)";ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(lmX,lmY+lmH/2);ctx.lineTo(lmX+lmW,lmY+lmH/2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(lmX+lmW/2,lmY);ctx.lineTo(lmX+lmW/2,lmY+lmH);ctx.stroke();
    ctx.strokeStyle="rgba(200,200,200,0.55)";ctx.lineWidth=0.8;ctx.strokeRect(lmX,lmY,lmW,lmH);
    /* sub-Earth point with libration (visible only on near side) */
    var lmLibL=7.9*Math.sin(t*2*Math.PI/27.55);
    var lmLibB=6.7*Math.sin(t*2*Math.PI/27.21);
    var seMx=lmX+(lmLibL+180)/360*lmW,seMy=lmY+(90-lmLibB)/180*lmH;
    ctx.strokeStyle="rgba(120,170,255,0.55)";ctx.lineWidth=0.7;
    ctx.beginPath();ctx.arc(seMx,seMy,4.5,0,TAU);ctx.stroke();
    fillCirc(ctx,seMx,seMy,2.2,"rgba(140,190,255,0.95)");
    /* Apollo sites */
    for(var lai=0;lai<APOLLO_SITES.length;lai++){var lap=APOLLO_SITES[lai];
      var lapX=lmX+(lap.lng+180)/360*lmW,lapY=lmY+(90-lap.lat)/180*lmH;
      fillCirc(ctx,lapX,lapY,1.6,"rgba(255,220,80,1)");
      ctx.fillStyle="rgba(255,220,80,0.7)";ctx.font="bold 7px sans-serif";ctx.textAlign="left";
      ctx.fillText(lap.n.replace("Apollo ","A"),lapX+2.5,lapY-2);}
    /* observer position */
    var omX=lmX+((lngDeg||0)+180)/360*lmW,omY=lmY+(90-(lat||0))/180*lmH;
    omX=Math.max(lmX+1,Math.min(lmX+lmW-1,omX));omY=Math.max(lmY+1,Math.min(lmY+lmH-1,omY));
    ctx.strokeStyle="rgba(255,55,55,1)";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(omX-4,omY);ctx.lineTo(omX+4,omY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(omX,omY-4);ctx.lineTo(omX,omY+4);ctx.stroke();
    fillCirc(ctx,omX,omY,1.8,"rgba(255,55,55,1)");
    /* legend */
    ctx.fillStyle="rgba(255,255,255,0.45)";ctx.font="7px sans-serif";ctx.textAlign="left";
    ctx.fillText("◐近地面 ⚪地球副点(秤動) ●アポロ ✕現在地",lmX,lmY+lmH+9);
    ctx.restore();
  }

  /* ======== MARS MINI MAP ======== */
  if(plName==="Moon"||plName==="Mars"){var mmW=130,mmH=65,mmX=52,mmY=90;}
  if(plName==="Mars"){
    ctx.save();
    var mgBg=ctx.createLinearGradient(mmX,mmY,mmX,mmY+mmH);
    mgBg.addColorStop(0,"rgba(155,85,45,0.88)");mgBg.addColorStop(1,"rgba(110,52,25,0.88)");
    ctx.fillStyle=mgBg;ctx.fillRect(mmX,mmY,mmW,mmH);
    /* Tharsis volcanic plateau — dark reddish band left-center */
    ctx.fillStyle="rgba(90,38,18,0.65)";
    ctx.beginPath();ctx.ellipse(mmX+((-101+180)/360)*mmW,mmY+(90-1)/180*mmH,28,22,0,0,TAU);ctx.fill();
    /* Hellas basin — dark circular depression right */
    ctx.fillStyle="rgba(65,28,12,0.75)";
    ctx.beginPath();ctx.ellipse(mmX+((70.5+180)/360)*mmW,mmY+(90+42.7)/180*mmH,10,7,0,0,TAU);ctx.fill();
    /* Valles Marineris — thin dark slash center-right */
    ctx.strokeStyle="rgba(50,18,8,0.85)";ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(mmX+((-82+180)/360)*mmW,mmY+(90+11)/180*mmH);ctx.lineTo(mmX+((-36+180)/360)*mmW,mmY+(90+17)/180*mmH);ctx.stroke();
    /* Polar caps */
    ctx.fillStyle="rgba(220,215,210,0.72)";
    ctx.beginPath();ctx.ellipse(mmX+mmW/2,mmY+3,mmW*0.35,4,0,0,TAU);ctx.fill();
    ctx.beginPath();ctx.ellipse(mmX+mmW/2,mmY+mmH-3,mmW*0.2,3,0,0,TAU);ctx.fill();
    /* Equator / meridian */
    ctx.strokeStyle="rgba(255,200,150,0.2)";ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(mmX,mmY+mmH/2);ctx.lineTo(mmX+mmW,mmY+mmH/2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(mmX+mmW/2,mmY);ctx.lineTo(mmX+mmW/2,mmY+mmH);ctx.stroke();
    ctx.strokeStyle="rgba(200,130,80,0.5)";ctx.lineWidth=0.8;ctx.strokeRect(mmX,mmY,mmW,mmH);
    /* Landmarks */
    for(var mli=0;mli<MARS_LANDMARKS.length;mli++){var ml=MARS_LANDMARKS[mli];
      var mlX=mmX+(ml.lng+180)/360*mmW,mlY=mmY+(90-ml.lat)/180*mmH;
      if(ml.type==="rover"){
        fillCirc(ctx,mlX,mlY,2.2,"rgba(255,220,60,1)");
        ctx.fillStyle="rgba(255,220,60,0.8)";ctx.font="bold 7px sans-serif";ctx.textAlign="left";
        var _rl={"Perseverance":"P","Curiosity":"C","Viking 1":"V1","Viking 2":"V2","Pathfinder":"Pf","InSight":"IS","Zhurong":"Zh"};
        ctx.fillText(_rl[ml.en]||ml.en[0],mlX+2.5,mlY-2);
      }else if(ml.type==="volcano"){
        ctx.fillStyle="rgba(255,120,60,0.9)";ctx.font="8px sans-serif";ctx.textAlign="center";
        ctx.fillText("▲",mlX,mlY+3);}
      else if(ml.type==="ice"){
        fillCirc(ctx,mlX,mlY,2,"rgba(220,215,210,0.9)");}
    }
    /* Observer */
    var moX=mmX+((lngDeg||0)+180)/360*mmW,moY=mmY+(90-(lat||0))/180*mmH;
    moX=Math.max(mmX+1,Math.min(mmX+mmW-1,moX));moY=Math.max(mmY+1,Math.min(mmY+mmH-1,moY));
    ctx.strokeStyle="rgba(255,55,55,1)";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(moX-4,moY);ctx.lineTo(moX+4,moY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(moX,moY-4);ctx.lineTo(moX,moY+4);ctx.stroke();
    fillCirc(ctx,moX,moY,1.8,"rgba(255,55,55,1)");
    ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="7px sans-serif";ctx.textAlign="left";
    ctx.fillText("▲火山  ●ローバー(P/C/V1/V2/Pf/IS/Zh)  ✕現在地",mmX,mmY+mmH+9);
    ctx.restore();
  }

  /* ======== VENUS MINI MAP ======== */
  if(plName==="Venus"){
    var vmW=130,vmH=65,vmX=52,vmY=90;
    ctx.save();
    var vmBg=ctx.createLinearGradient(vmX,vmY,vmX,vmY+vmH);
    vmBg.addColorStop(0,"rgba(195,138,58,0.88)");vmBg.addColorStop(1,"rgba(155,98,38,0.88)");
    ctx.fillStyle=vmBg;ctx.fillRect(vmX,vmY,vmW,vmH);
    /* Ishtar Terra — northern highland (60-75°N, roughly -30 to +60°E) */
    ctx.fillStyle="rgba(220,178,88,0.62)";
    ctx.beginPath();ctx.ellipse(vmX+(30+180)/360*vmW,vmY+(90-67)/180*vmH,vmW*0.19,vmH*0.13,0,0,TAU);ctx.fill();
    /* Aphrodite Terra — equatorial highland (right half) */
    ctx.fillStyle="rgba(210,155,72,0.52)";
    ctx.beginPath();ctx.ellipse(vmX+(130+180)/360*vmW,vmY+(90-10)/180*vmH,vmW*0.26,vmH*0.09,0,0,TAU);ctx.fill();
    /* equator / prime meridian */
    ctx.strokeStyle="rgba(255,200,150,0.2)";ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(vmX,vmY+vmH/2);ctx.lineTo(vmX+vmW,vmY+vmH/2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(vmX+vmW/2,vmY);ctx.lineTo(vmX+vmW/2,vmY+vmH);ctx.stroke();
    ctx.strokeStyle="rgba(200,148,78,0.5)";ctx.lineWidth=0.8;ctx.strokeRect(vmX,vmY,vmW,vmH);
    /* Venera lander sites */
    for(var vli2=0;vli2<VENUS_LANDERS.length;vli2++){var vlp=VENUS_LANDERS[vli2];
      var vlX=vmX+(vlp.lng+180)/360*vmW,vlY=vmY+(90-vlp.lat)/180*vmH;
      fillCirc(ctx,vlX,vlY,2,"rgba(255,200,80,1)");
      ctx.fillStyle="rgba(255,200,80,0.82)";ctx.font="bold 7px sans-serif";ctx.textAlign="left";
      ctx.fillText(vlp.en.replace("Venera ","V"),vlX+2.5,vlY-2);}
    /* observer */
    var voX=vmX+((lngDeg||0)+180)/360*vmW,voY=vmY+(90-(lat||0))/180*vmH;
    voX=Math.max(vmX+1,Math.min(vmX+vmW-1,voX));voY=Math.max(vmY+1,Math.min(vmY+vmH-1,voY));
    ctx.strokeStyle="rgba(255,55,55,1)";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(voX-4,voY);ctx.lineTo(voX+4,voY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(voX,voY-4);ctx.lineTo(voX,voY+4);ctx.stroke();
    fillCirc(ctx,voX,voY,1.8,"rgba(255,55,55,1)");
    ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="7px sans-serif";ctx.textAlign="left";
    ctx.fillText("●ベネラ着陸点  ✕現在地",vmX,vmY+vmH+9);
    ctx.restore();
  }

  /* ======== MERCURY MINI MAP ======== */
  if(plName==="Mercury"){
    var hgW=130,hgH=65,hgX=52,hgY=90;
    ctx.save();
    var hgBg=ctx.createLinearGradient(hgX,hgY,hgX,hgY+hgH);
    hgBg.addColorStop(0,"rgba(162,157,150,0.88)");hgBg.addColorStop(1,"rgba(112,107,100,0.88)");
    ctx.fillStyle=hgBg;ctx.fillRect(hgX,hgY,hgW,hgH);
    /* Caloris Basin (~30°N, 162°E) */
    ctx.fillStyle="rgba(88,82,76,0.68)";
    ctx.beginPath();ctx.ellipse(hgX+(162+180)/360*hgW,hgY+(90-30)/180*hgH,hgW*0.12,hgH*0.18,0,0,TAU);ctx.fill();
    ctx.strokeStyle="rgba(120,115,108,0.5)";ctx.lineWidth=0.7;
    ctx.beginPath();ctx.ellipse(hgX+(162+180)/360*hgW,hgY+(90-30)/180*hgH,hgW*0.14,hgH*0.21,0,0,TAU);ctx.stroke();
    /* North polar region */
    ctx.fillStyle="rgba(192,188,178,0.52)";
    ctx.beginPath();ctx.ellipse(hgX+hgW/2,hgY+3,hgW*0.46,4,0,0,TAU);ctx.fill();
    /* equator / meridian */
    ctx.strokeStyle="rgba(200,200,200,0.2)";ctx.lineWidth=0.5;
    ctx.beginPath();ctx.moveTo(hgX,hgY+hgH/2);ctx.lineTo(hgX+hgW,hgY+hgH/2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(hgX+hgW/2,hgY);ctx.lineTo(hgX+hgW/2,hgY+hgH);ctx.stroke();
    ctx.strokeStyle="rgba(155,150,142,0.5)";ctx.lineWidth=0.8;ctx.strokeRect(hgX,hgY,hgW,hgH);
    /* MESSENGER sites */
    for(var hsi=0;hsi<MERCURY_SITES.length;hsi++){var hsp=MERCURY_SITES[hsi];
      var hsX=hgX+(hsp.lng+180)/360*hgW,hsY=hgY+(90-hsp.lat)/180*hgH;
      fillCirc(ctx,hsX,hsY,2.2,"rgba(255,200,80,1)");
      ctx.fillStyle="rgba(255,200,80,0.82)";ctx.font="bold 7px sans-serif";ctx.textAlign="left";
      ctx.fillText("M",hsX+2.5,hsY-2);}
    /* observer */
    var hoX=hgX+((lngDeg||0)+180)/360*hgW,hoY=hgY+(90-(lat||0))/180*hgH;
    hoX=Math.max(hgX+1,Math.min(hgX+hgW-1,hoX));hoY=Math.max(hgY+1,Math.min(hgY+hgH-1,hoY));
    ctx.strokeStyle="rgba(255,55,55,1)";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(hoX-4,hoY);ctx.lineTo(hoX+4,hoY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(hoX,hoY-4);ctx.lineTo(hoX,hoY+4);ctx.stroke();
    fillCirc(ctx,hoX,hoY,1.8,"rgba(255,55,55,1)");
    ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="7px sans-serif";ctx.textAlign="left";
    ctx.fillText("●MESSENGER衝突点  ✕現在地",hgX,hgY+hgH+9);
    ctx.restore();
  }

  /* ======== HUD ======== */
  ctx.fillStyle="rgba(0,0,0,0.45)";ctx.fillRect(0,0,W,plName==="Moon"||plName==="Mars"||plName==="Venus"||plName==="Mercury"||plName==="Titan"||plName==="Itokawa"||plName==="Ryugu"?104:rot<0?100:90);
  ctx.fillStyle="rgba(255,255,255,0.9)";ctx.font="bold 14px sans-serif";ctx.textAlign="center";
  ctx.fillText(pl.j+"の表面",W/2,22);
  ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="9px sans-serif";
  var _mhL=((lngDeg||0)+540)%360-180,_mhA=Math.abs(_mhL);
  var _mhNF=Math.max(0,1-_mhA/90),_mhFF=Math.max(0,(_mhA-90)/90);
  var descs={Mercury:"大気なし・灼熱の昼(430℃)と極寒の夜(−180℃)",Venus:"厚い硫酸雲・気温462℃・気圧90気圧",Earth:"青い空・白い雲・生命の惑星",Mars:"薄いCO₂大気・赤い空・砂嵐",Jupiter:"ガス惑星・巨大な雲の海",Saturn:"ガス惑星・空を横切る壮大なリング",Uranus:"氷の巨人・メタンの青い大気",Neptune:"最果ての惑星・時速2000kmの暴風",Ceres:"小惑星帯最大の天体・岩と氷の世界",Pluto:"冥王星・−230℃の極寒の世界",Eris:"最も遠い矮小惑星・太陽が極小",Moon:_mhFF>0.3?"反地球側（遠地面）— 大型クレーター密集・地球は永遠に見えない":_mhNF>0.3?"地球側（近地面）— 月の海が広がる・地球が空に浮かぶ":"月の縁（秤動で地球が揺れる）",
Io:"火山が500個以上 — 常に噴火する最も地質活動が活発な天体",
Europa:"厚さ数kmの氷殻の下に地下海 — 生命の可能性が最も高い場所のひとつ",
Ganymede:"太陽系最大の衛星 — 固有の磁場を持つ唯一の衛星",
Callisto:"太陽系で最も古い地表 — 40億年変わらぬクレーターの海",
Titan:"窒素・メタンの濃い大気 — 液体の川と湖が存在する地球外の世界",
Itokawa:"はやぶさが2005年に試料採取 — 地球に持ち帰られた最初の小惑星サンプル",
Ryugu:"はやぶさ2が2019年着陸 — 炭素質コンドライト 太陽系初期の物質を保存",
};
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
  if(plName==="Moon"){
    var _aMin=1e9,_aIdx=-1;
    for(var _api=0;_api<APOLLO_SITES.length;_api++){var _aS=APOLLO_SITES[_api];
      var _aDL=(_aS.lng-(lngDeg||0))*0.01745,_aL1=(lat||0)*0.01745,_aL2=_aS.lat*0.01745;
      var _aCos=Math.sin(_aL1)*Math.sin(_aL2)+Math.cos(_aL1)*Math.cos(_aL2)*Math.cos(_aDL);
      var _aD=Math.acos(Math.max(-1,Math.min(1,_aCos)))*57.2958;
      if(_aD<_aMin){_aMin=_aD;_aIdx=_api;}}
    var _aSel=APOLLO_SITES[_aIdx];
    var _aKm=Math.round(_aMin*1737*Math.PI/180);
    var _liL=7.9*Math.sin(t*2*Math.PI/27.55);
    var _liB=6.7*Math.sin(t*2*Math.PI/27.21);
    ctx.fillStyle="rgba(255,220,140,0.7)";ctx.font="9px sans-serif";ctx.textAlign="center";
    ctx.fillText(_aSel.n+"地点まで "+_aKm.toLocaleString()+"km　秤動 L:"+_liL.toFixed(1)+"° B:"+_liB.toFixed(1)+"°",W/2,94);
  }
  if(plName==="Mars"){
    var _mMin=1e9,_mIdx=-1;
    for(var _mli=0;_mli<MARS_LANDMARKS.length;_mli++){var _ml=MARS_LANDMARKS[_mli];
      var _mDL=(_ml.lng-(lngDeg||0))*0.01745,_mL1=(lat||0)*0.01745,_mL2=_ml.lat*0.01745;
      var _mCos=Math.sin(_mL1)*Math.sin(_mL2)+Math.cos(_mL1)*Math.cos(_mL2)*Math.cos(_mDL);
      var _mD=Math.acos(Math.max(-1,Math.min(1,_mCos)))*57.2958;
      if(_mD<_mMin){_mMin=_mD;_mIdx=_mli;}}
    var _mSel=MARS_LANDMARKS[_mIdx];
    var _mKm=Math.round(_mMin*3389.5*Math.PI/180);
    /* bearing to landmark */
    var _mbDL=(_mSel.lng-(lngDeg||0))*0.01745,_mbL1=(lat||0)*0.01745,_mbL2=_mSel.lat*0.01745;
    var _mbB=Math.atan2(Math.sin(_mbDL)*Math.cos(_mbL2),Math.cos(_mbL1)*Math.sin(_mbL2)-Math.sin(_mbL1)*Math.cos(_mbL2)*Math.cos(_mbDL));
    var _mbDeg=Math.round(((_mbB*57.296)%360+360)%360);
    var _mbN=_mbDeg<23?"N":_mbDeg<68?"NE":_mbDeg<113?"E":_mbDeg<158?"SE":_mbDeg<203?"S":_mbDeg<248?"SW":_mbDeg<293?"W":_mbDeg<338?"NW":"N";
    ctx.fillStyle="rgba(255,160,100,0.75)";ctx.font="9px sans-serif";ctx.textAlign="center";
    ctx.fillText("最寄: "+_mSel.n+"　"+_mKm.toLocaleString()+"km "+_mbN+"("+_mbDeg+"°)",W/2,94);
  }
  if(plName==="Venus"){
    var _vMin=1e9,_vIdx=-1;
    for(var _vli=0;_vli<VENUS_LANDERS.length;_vli++){var _vl2=VENUS_LANDERS[_vli];
      var _vDL=(_vl2.lng-(lngDeg||0))*0.01745,_vL1=(lat||0)*0.01745,_vL2=_vl2.lat*0.01745;
      var _vCos=Math.sin(_vL1)*Math.sin(_vL2)+Math.cos(_vL1)*Math.cos(_vL2)*Math.cos(_vDL);
      var _vD=Math.acos(Math.max(-1,Math.min(1,_vCos)))*57.2958;
      if(_vD<_vMin){_vMin=_vD;_vIdx=_vli;}}
    var _vSel=VENUS_LANDERS[_vIdx];
    var _vKm=Math.round(_vMin*6051.8*Math.PI/180);
    ctx.fillStyle="rgba(255,200,120,0.72)";ctx.font="9px sans-serif";ctx.textAlign="center";
    ctx.fillText("最寄: "+_vSel.n+"　"+_vKm.toLocaleString()+"km",W/2,94);
  }
  if(plName==="Mercury"){
    var _hMin=1e9,_hIdx=-1;
    for(var _hsi2=0;_hsi2<MERCURY_SITES.length;_hsi2++){var _hs2=MERCURY_SITES[_hsi2];
      var _hDL=(_hs2.lng-(lngDeg||0))*0.01745,_hL1=(lat||0)*0.01745,_hL2=_hs2.lat*0.01745;
      var _hCos=Math.sin(_hL1)*Math.sin(_hL2)+Math.cos(_hL1)*Math.cos(_hL2)*Math.cos(_hDL);
      var _hD=Math.acos(Math.max(-1,Math.min(1,_hCos)))*57.2958;
      if(_hD<_hMin){_hMin=_hD;_hIdx=_hsi2;}}
    var _hSel=MERCURY_SITES[_hIdx];
    var _hKm=Math.round(_hMin*2439.7*Math.PI/180);
    ctx.fillStyle="rgba(200,200,228,0.72)";ctx.font="9px sans-serif";ctx.textAlign="center";
    ctx.fillText("最寄: "+_hSel.n+"　"+_hKm.toLocaleString()+"km",W/2,94);
  }
  if(plName==="Titan"){
    var _tpMin=1e9,_tpIdx=-1;
    for(var _tpii=0;_tpii<TITAN_PROBES.length;_tpii++){var _tp2=TITAN_PROBES[_tpii];
      var _tpDL=(_tp2.lng-(lngDeg||0))*0.01745,_tpL1=(lat||0)*0.01745,_tpL2=_tp2.lat*0.01745;
      var _tpCos=Math.sin(_tpL1)*Math.sin(_tpL2)+Math.cos(_tpL1)*Math.cos(_tpL2)*Math.cos(_tpDL);
      var _tpD=Math.acos(Math.max(-1,Math.min(1,_tpCos)))*57.2958;
      if(_tpD<_tpMin){_tpMin=_tpD;_tpIdx=_tpii;}}
    var _tpSel=TITAN_PROBES[_tpIdx];
    var _tpKm=Math.round(_tpMin*2575*Math.PI/180);
    ctx.fillStyle="rgba(255,210,140,0.72)";ctx.font="9px sans-serif";ctx.textAlign="center";
    ctx.fillText("最寄: "+_tpSel.n+"　"+_tpKm.toLocaleString()+"km",W/2,94);
  }
  if(plName==="Itokawa"||plName==="Ryugu"){
    var _haMin=1e9,_haIdx=-1,_haR=plName==="Itokawa"?0.000165:0.000448;
    for(var _ha2i=0;_ha2i<HAYABUSA_SITES.length;_ha2i++){var _ha2=HAYABUSA_SITES[_ha2i];
      if(_ha2.body!==plName)continue;
      var _haDL=(_ha2.lng-(lngDeg||0))*0.01745,_haL1=(lat||0)*0.01745,_haL2=_ha2.lat*0.01745;
      var _haCos=Math.sin(_haL1)*Math.sin(_haL2)+Math.cos(_haL1)*Math.cos(_haL2)*Math.cos(_haDL);
      var _haD=Math.acos(Math.max(-1,Math.min(1,_haCos)))*57.2958;
      if(_haD<_haMin){_haMin=_haD;_haIdx=_ha2i;}}
    if(_haIdx>=0){
      var _haSel=HAYABUSA_SITES[_haIdx];
      var _haKm=(_haMin*_haR*Math.PI/180*1000).toFixed(1);
      ctx.fillStyle="rgba(200,210,255,0.72)";ctx.font="9px sans-serif";ctx.textAlign="center";
      ctx.fillText("最寄: "+_haSel.n+"　"+_haKm+"m",W/2,94);}
  }

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
