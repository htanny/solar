import { TAU, SURF, PL_MAP, DWARF_MAP, EXO_SURF } from "../data/solarData.js";
import { seedR, lerpColor } from "./utils.js";
import { earthIsLand, getEarthBiome, BIOME_CONF } from "./landingUtils.js";
import { drawLandingTerrain } from "./drawLandingTerrain.js";
import { drawLandingSky } from "./drawLandingSky.js";
import { drawLandingHUD } from "./drawLandingHUD.js";

function drawLanding(ctx,W,H,t,plName,yaw,lat,fov,lngDeg,tilt,constOn){
  var sf=SURF[plName]||EXO_SURF[plName];if(!sf)return;
  var pl=PL_MAP[plName]||DWARF_MAP[plName];if(!pl)return;
  var biome=plName==="Earth"?getEarthBiome(lat||0,lngDeg||0):'';
  var bConf=BIOME_CONF[biome]||BIOME_CONF.temperate;
  fov=fov||1;
  var rot=pl.rot,rotAbs=Math.abs(rot);
  var solarDay;
  if(rot<0)solarDay=1/(1/rotAbs+1/pl.p);else solarDay=Math.abs(1/(1/rotAbs-1/pl.p));
  if(!isFinite(solarDay)||solarDay>1e6)solarDay=rotAbs;
  if(plName==="Earth")solarDay=1;
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
  var isNight=sunAlt<-0.08;
  var dayF=Math.max(0,Math.min(1,sunAlt*4+0.5));
  var hrzY=Math.max(H*0.05,Math.min(H*0.92,H*(0.58-(tilt||0)*0.01)));
  var rng=seedR(plName.length*7+31);
  var sTop=sf.skyTop,sBot=sf.skyBot;
  if(sf.skyNT){sTop=lerpColor(sf.skyNT,sf.skyTop,dayF);sBot=lerpColor(sf.skyNB,sf.skyBot,dayF);}

  drawLandingSky(ctx,W,H,{t:t,plName:plName,yaw:yaw,lat:lat,fov:fov,lngDeg:lngDeg,constOn:constOn,sf:sf,biome:biome,rot:rot,rotAbs:rotAbs,latRad:latRad,sunAlt:sunAlt,sunAz:sunAz,aDiffSun:aDiffSun,isNight:isNight,dayF:dayF,hrzY:hrzY,rng:rng,sTop:sTop,sBot:sBot});
  drawLandingTerrain(ctx,W,H,hrzY,plName,yaw,biome,bConf,sf,rng,t,dayF,lat,lngDeg,sBot);
  drawLandingHUD(ctx,W,H,{t:t,lat:lat,lngDeg:lngDeg,yaw:yaw,plName:plName,solarDay:solarDay,sunAlt:sunAlt,pl:pl,sf:sf,rot:rot,hrzY:hrzY,fov:fov});
}

export { drawLanding, earthIsLand, getEarthBiome };
