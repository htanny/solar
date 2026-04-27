import { TAU, PL, J2000 } from "../data/solarData.js";

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

export { dateToSimDays, simDaysToDate, scanEvents };
