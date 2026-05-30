import { PL, TAU, solveKepler } from "../data/solarData.js";

/* N-body: initialize planet state from Kepler positions at time t */
function initNBody(t){var GM=2.959e-4;return PL.map(function(pl){var r=pl.d/150,ang=(t/pl.p)*TAU,v=Math.sqrt(GM/r);return{pl:pl,x:Math.cos(ang)*r,z:Math.sin(ang)*r,vx:-Math.sin(ang)*v,vz:Math.cos(ang)*v,m:{Mercury:1.65e-7,Venus:2.45e-6,Earth:3.00e-6,Mars:3.23e-7,Jupiter:9.55e-4,Saturn:2.86e-4,Uranus:4.37e-5,Neptune:5.15e-5}[pl.n]||1e-7};})}
/* Tonight's sky: compute planet visibility from observer position */
function computeNightSky(t,lat,lng){var lstD=((280.46+360.98565*t+(lng||0))%360+360)%360,latR=(lat||35)*TAU/360;var ea=(t/365.25)*TAU,ex=Math.cos(ea)*150,ez=Math.sin(ea)*150;var sunEclLng=(ea*180/Math.PI+360)%360,sunHr=(lstD-sunEclLng)*TAU/360,sunSA=Math.cos(latR)*Math.cos(sunHr),sunAlt=Math.round(Math.asin(Math.max(-1,Math.min(1,sunSA)))*180/Math.PI);var isNight=sunAlt<-6;var items=PL.map(function(pl){var ang=(t/pl.p)*TAU,px=Math.cos(ang)*pl.d,pz=Math.sin(ang)*pl.d,dx=px-ex,dz=pz-ez;var eclLng=(Math.atan2(dz,dx)*180/Math.PI+360)%360;var hr=(lstD-eclLng)*TAU/360,sinAlt=Math.cos(latR)*Math.cos(hr),alt=Math.round(Math.asin(Math.max(-1,Math.min(1,sinAlt)))*180/Math.PI);var baseMag={Mercury:0.0,Venus:-4.4,Earth:99,Mars:-0.5,Jupiter:-2.7,Saturn:0.5,Uranus:5.7,Neptune:7.9}[pl.n]||5;return{name:pl.j,alt:alt,vis:alt>5&&pl.n!=="Earth",mag:baseMag.toFixed(1)};});return{items:items,isNight:isNight,sunAlt:sunAlt};}

/* Moon phase calendar: generate phases for ~2 months around current time t */
function computeMoonPhases(t){var syn=29.53059,t0=-5.7;var curAge=((t-t0)%syn+syn)%syn;var lastNew=t-curAge;var phases=[];for(var i=-1;i<4;i++){var base=lastNew+i*syn;phases.push({t:base,age:0,name:"🌑 新月"});phases.push({t:base+syn*0.25,age:syn*0.25,name:"🌓 上弦"});phases.push({t:base+syn*0.5,age:syn*0.5,name:"🌕 満月"});phases.push({t:base+syn*0.75,age:syn*0.75,name:"🌗 下弦"});}phases.sort(function(a,b){return a.t-b.t;});return phases;}
/* Orbital elements for a planet at time t */
function computeOrbElem(pl,t){var iMap={Mercury:7.0,Venus:3.4,Earth:0,Mars:1.8,Jupiter:1.3,Saturn:2.5,Uranus:0.8,Neptune:1.8};var e=pl.ecc||0.01,inc=iMap[pl.n]||0,a=pl.d/150,peri=(pl.peri||0)*0.0174533;var M_=(((t/pl.p)*TAU-peri)%TAU+TAU)%TAU;var sk=solveKepler(M_,e),nu=sk.nu;var r_=a*(1-e*Math.cos(sk.E));var GM_au=2.959e-4;var v_auday=Math.sqrt(GM_au*(2/r_-1/a));var v_kms=v_auday*1.496e8/86400;return{a:a,e:e,i:inc,T:pl.p,M:M_*180/Math.PI,nu:nu*180/Math.PI,r:r_,v:v_kms};}

export { initNBody, computeNightSky, computeMoonPhases, computeOrbElem };
