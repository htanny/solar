// @ts-check
/* Pure helpers for landing mode — no canvas side-effects */

function terrainH(x,seed){return(Math.sin(x*0.02+seed)*0.4+Math.sin(x*0.057+seed*2.3)*0.3+Math.sin(x*0.13+seed*5.1)*0.2+Math.sin(x*0.31+seed*11)*0.1)*0.5+0.5;}

/**
 * 球面上の2点間の大円角距離（度）。緯度経度は度で渡す。
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} 角距離（度）
 */
function angSepDeg(lat1,lng1,lat2,lng2){
  var dl=(lng2-lng1)*0.01745,l1=lat1*0.01745,l2=lat2*0.01745;
  var c=Math.sin(l1)*Math.sin(l2)+Math.cos(l1)*Math.cos(l2)*Math.cos(dl);
  return Math.acos(Math.max(-1,Math.min(1,c)))*57.2958;
}

function earthIsLand(lat,lng){
  var ln=((lng%360)+540)%360-180;
  if(lat>15&&lat<75&&ln>-170&&ln<-52)return true;   /* N America */
  if(lat>-58&&lat<12&&ln>-82&&ln<-34)return true;   /* S America */
  if(lat>36&&lat<72&&ln>-11&&ln<42)return true;     /* Europe */
  if(lat>-35&&lat<38&&ln>-18&&ln<52)return true;    /* Africa */
  if(lat>12&&lat<42&&ln>32&&ln<64)return true;      /* Middle East */
  if(lat>0&&lat<78&&ln>40&&ln<148)return true;      /* Asia */
  if(lat>-10&&lat<30&&ln>72&&ln<142)return true;    /* S/SE Asia */
  if(lat>-44&&lat<-10&&ln>113&&ln<154)return true;  /* Australia */
  if(lat<-65)return true;                            /* Antarctica */
  return false;
}
function getEarthBiome(lat,lng){
  var a=Math.abs(lat),ln=((lng%360)+540)%360-180;
  if(a>70)return'polar';
  if(!earthIsLand(lat,ln))return a>62?'polar':'ocean';
  if(a>62)return'tundra';
  if(a>52)return'taiga';
  if(lat>14&&lat<32&&ln>-17&&ln<46)return'desert';   /* Sahara */
  if(lat>12&&lat<30&&ln>35&&ln<62)return'desert';    /* Arabian */
  if(lat>38&&lat<50&&ln>88&&ln<116)return'desert';   /* Gobi */
  if(lat>-32&&lat<-18&&ln>114&&ln<142)return'desert';/* Australia outback */
  if(lat>-30&&lat<-18&&ln>-72&&ln<-64)return'desert';/* Atacama */
  if(lat>29&&lat<37&&ln>-122&&ln<-108)return'desert';/* SW USA */
  if(a<11)return'jungle';
  if(a<23)return'savanna';
  return'temperate';
}

var BIOME_CONF={polar:{g:"rgba(215,228,242,1)",far:"rgba(175,200,222,1)",mid:"rgba(195,215,235,1)",mhF:6,mhM:5,mhN:3},tundra:{g:"rgba(82,92,60,1)",far:"rgba(70,82,58,1)",mid:"rgba(76,88,62,1)",mhF:22,mhM:18,mhN:12},taiga:{g:"rgba(30,62,26,1)",far:"rgba(24,52,20,1)",mid:"rgba(27,56,22,1)",mhF:28,mhM:22,mhN:14},temperate:{g:"rgba(45,110,40,1)",far:"rgba(60,80,120,1)",mid:"rgba(40,65,35,1)",mhF:30,mhM:25,mhN:15},desert:{g:"rgba(188,158,82,1)",far:"rgba(158,130,66,1)",mid:"rgba(172,144,72,1)",mhF:20,mhM:16,mhN:10},savanna:{g:"rgba(148,145,48,1)",far:"rgba(124,114,42,1)",mid:"rgba(135,128,44,1)",mhF:18,mhM:14,mhN:8},jungle:{g:"rgba(22,105,25,1)",far:"rgba(16,70,18,1)",mid:"rgba(19,82,20,1)",mhF:30,mhM:26,mhN:18},ocean:{g:"rgba(16,52,128,1)",far:"rgba(12,38,108,1)",mid:"rgba(14,44,118,1)",mhF:2,mhM:2,mhN:2}};

export { terrainH, angSepDeg, earthIsLand, getEarthBiome, BIOME_CONF };
