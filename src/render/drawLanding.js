// @ts-check
import { TAU, SURF, PL_MAP, DWARF_MAP, EXO_SURF } from "../data/solarData.js";
import { seedR, lerpColor } from "./utils.js";
import { getEarthBiome, BIOME_CONF } from "./landingUtils.js";
import { drawLandingTerrain } from "./drawLandingTerrain.js";
import { drawLandingSky } from "./drawLandingSky.js";
import { drawLandingHUD } from "./drawLandingHUD.js";

/**
 * @typedef {Object} SurfData 着陸先の地表データ (SURF テーブル要素)
 * @property {number} atm 大気の厚さ係数 (0=真空 〜 3.5=タイタン)
 * @property {number} sunSz 太陽の見かけサイズ係数
 * @property {string} g 地面の RGBA カラー
 * @property {string} skyTop 空上端 RGB ("R,G,B")
 * @property {string} skyBot 空下端 RGB
 * @property {string} [skyNT] 夜空上端 RGB (オプション)
 * @property {string} [skyNB] 夜空下端 RGB (オプション)
 * @property {string} [starTint] 主星の色 (系外惑星)
 * @property {boolean} [exo] 系外惑星フラグ
 * @property {boolean} [fixedSun] 太陽固定(潮汐ロック世界)
 * @property {boolean} [companions] 連星系
 * @property {boolean} [showEarth] 地球を空に描く(月のみ)
 */

/**
 * @typedef {Object} PlanetInfo 天体メタデータ (PL_MAP/DWARF_MAP 要素)
 * @property {string} n 英名キー
 * @property {string} j 日本語名
 * @property {number} r 半径 (1000km単位)
 * @property {number} p 公転周期 (日)
 * @property {number} rot 自転周期 (日。負=逆行)
 * @property {number} t 地軸傾斜 (度)
 * @property {number} d 太陽距離 (Mkm)
 * @property {string} grav 重力 (表示文字列)
 */

/**
 * @typedef {Object} LandingSkyState drawLandingSky に渡す状態
 * @property {number} t シム時刻 (日)
 * @property {string} plName 着陸先英名
 * @property {number} yaw カメラ方位 (rad)
 * @property {number} lat 観測者緯度 (度)
 * @property {number} fov 視野倍率
 * @property {number} lngDeg 観測者経度 (度)
 * @property {boolean} constOn 星座線表示
 * @property {SurfData} sf
 * @property {string} biome 地球バイオーム (Earthのみ)
 * @property {number} rot 自転周期 (負=逆行)
 * @property {number} rotAbs |rot|
 * @property {number} latRad 緯度 (rad)
 * @property {number} sunAlt 太陽高度の sin (-1〜1)
 * @property {number} sunAz 太陽方位 (rad)
 * @property {number} aDiffSun 太陽-yaw 方位差 (rad, -π〜π)
 * @property {boolean} isNight
 * @property {number} dayF 昼夜補間 (0=夜,1=昼)
 * @property {number} hrzY 水平線 Y (px)
 * @property {() => number} rng 擬似乱数
 * @property {string} sTop 現空上端 RGB
 * @property {string} sBot 現空下端 RGB
 * @property {number} sunDir 自転方向 (+1=順行,-1=逆行)
 */

/**
 * @typedef {Object} LandingHUDState drawLandingHUD に渡す状態
 * @property {number} t
 * @property {number} lat
 * @property {number} lngDeg
 * @property {number} yaw
 * @property {string} plName
 * @property {number} solarDay 太陽日 (日)
 * @property {number} sunAlt
 * @property {PlanetInfo} pl
 * @property {SurfData} sf
 * @property {number} rot
 * @property {number} hrzY
 * @property {number} fov
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {number} t シム時刻 (日)
 * @param {string} plName 着陸先英名
 * @param {number} yaw rad
 * @param {number} lat 度
 * @param {number} fov 視野倍率
 * @param {number} lngDeg 度
 * @param {number} tilt 度 (画面を傾ける)
 * @param {boolean} constOn 星座線表示
 */
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
  var effTR=effTilt*0.01745;
  var latRad=(lat||0)*0.01745;
  /* Solar declination = arcsin(sin(obliquity)·sin(λ)), where λ is the Sun's ecliptic
     longitude from the planet's vernal equinox. For Earth the equinox is aligned to
     day 79.5 of each J2000 year so the seasons match scanEvents (timeUtils.js). */
  var sunEclLng=plName==="Earth"?((t-79.5)/365.25)*TAU:(t/pl.p)*TAU;
  var decl=Math.asin(Math.sin(effTR)*Math.sin(sunEclLng));
  var sinAlt=Math.sin(latRad)*Math.sin(decl)+Math.cos(latRad)*Math.cos(decl)*Math.sin(sunHourAng);
  var sunAlt=Math.max(-0.95,Math.min(0.95,sinAlt));
  var sunAz=Math.atan2(Math.cos(sunHourAng)*Math.cos(decl),Math.sin(decl)*Math.cos(latRad)-Math.cos(decl)*Math.sin(latRad)*Math.sin(sunHourAng));
  var aDiffSun=((sunAz-yaw)%TAU+TAU)%TAU;if(aDiffSun>Math.PI)aDiffSun-=TAU;
  var isNight=sunAlt<-0.08;
  var dayF=Math.max(0,Math.min(1,sunAlt*4+0.5));
  /* Tidally-locked moons: override generic hour-angle Sun position with orbital mechanics.
     The parent body always sits at sub-parent point (lng=0,lat=0); the Sun cycles through
     the moon's sky at the synodic period. Sub-solar lng: 0°=near-side facing parent (full
     parent from moon), ±180°=far-side (new/dark parent from moon). */
  var _parentMap={Moon:"Earth",Io:"Jupiter",Europa:"Jupiter",Ganymede:"Jupiter",Callisto:"Jupiter",Titan:"Saturn",Enceladus:"Saturn",Triton:"Neptune",Charon:"Pluto",Pluto:"Pluto"};
  var _parentName=_parentMap[plName];
  if(_parentName){
    var _parent=PL_MAP[_parentName]||DWARF_MAP[_parentName];
    if(_parent){
      var _phase;
      if(plName==="Moon"){
        /* Empirical lunar formula (consistent with Earth-from-Moon view in drawLandingSkyBodies) */
        var _mlng=(218.316+13.176396*t+360000)%360;
        var _slng=(280.46+0.9856*t+36000)%360;
        _phase=((_mlng-_slng)/360+100)%1;
      }else{
        /* Generic synodic phase: (1/T_moon - 1/T_parent) cycles per day */
        var _syn=1/(1/pl.rot-1/_parent.p);
        _phase=((t/_syn)%1+100)%1;
      }
      var _ssLng=(((0.5-_phase)*360)+900)%360-180;
      var _dLng=((lngDeg||0)-_ssLng+540)%360-180;
      var _dLat=lat||0;
      var _dlr=_dLng*0.01745,_dlar=_dLat*0.01745;
      sunAlt=Math.max(-0.95,Math.min(0.95,Math.cos(_dlar)*Math.cos(_dlr)));
      sunAz=Math.atan2(Math.sin(_dlr),-Math.sin(_dlar)*Math.cos(_dlr));
      aDiffSun=((sunAz-yaw)%TAU+TAU)%TAU;if(aDiffSun>Math.PI)aDiffSun-=TAU;
      isNight=sunAlt<-0.08;
      dayF=Math.max(0,Math.min(1,sunAlt*4+0.5));
    }
  }else if(sf.fixedSun){
    /* Tidally-locked exoplanet (e.g. ProximaB): star fixed at sub-stellar point (lng=0,lat=0) */
    var _exLngR=(((lngDeg||0)+540)%360-180)*0.01745;
    var _exLatR=(lat||0)*0.01745;
    sunAlt=Math.max(-0.95,Math.min(0.95,Math.cos(_exLatR)*Math.cos(_exLngR)));
    sunAz=Math.atan2(Math.sin(_exLngR),-Math.sin(_exLatR)*Math.cos(_exLngR));
    aDiffSun=((sunAz-yaw)%TAU+TAU)%TAU;if(aDiffSun>Math.PI)aDiffSun-=TAU;
    isNight=sunAlt<-0.08;
    dayF=Math.max(0,Math.min(1,sunAlt*4+0.5));
  }
  var hrzY=Math.max(H*0.05,Math.min(H*0.92,H*(0.58-(tilt||0)*0.01)));
  var rng=seedR(plName.length*7+31);
  var sTop=sf.skyTop,sBot=sf.skyBot;
  if(sf.skyNT){sTop=lerpColor(sf.skyNT,sf.skyTop,dayF);sBot=lerpColor(sf.skyNB,sf.skyBot,dayF);}

  drawLandingSky(ctx,W,H,{t:t,plName:plName,yaw:yaw,lat:lat,fov:fov,lngDeg:lngDeg,constOn:constOn,sf:sf,biome:biome,rot:rot,rotAbs:rotAbs,latRad:latRad,sunAlt:sunAlt,sunAz:sunAz,aDiffSun:aDiffSun,isNight:isNight,dayF:dayF,hrzY:hrzY,rng:rng,sTop:sTop,sBot:sBot,sunDir:sunDir});
  drawLandingTerrain(ctx,W,H,hrzY,plName,yaw,biome,bConf,sf,rng,t,dayF,lat,lngDeg,sBot);
  drawLandingHUD(ctx,W,H,{t:t,lat:lat,lngDeg:lngDeg,yaw:yaw,plName:plName,solarDay:solarDay,sunAlt:sunAlt,pl:pl,sf:sf,rot:rot,hrzY:hrzY,fov:fov});
}

export { drawLanding };
