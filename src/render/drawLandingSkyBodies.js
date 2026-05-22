// @ts-check
import { TAU, GMOONS } from "../data/solarData.js";
import { fillCirc } from "./utils.js";

/**
 * Render all "other celestial bodies" visible from the landing site's sky:
 * Moon/Venus from Earth, Earth from Moon, Jupiter from Galilean moons,
 * Saturn from Titan, Neptune from Triton, Pluto from Charon, Mars moons, etc.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W
 * @param {number} H
 * @param {import("./drawLanding.js").LandingSkyState} s
 * @param {{eclLand:string|null,eclStrength:number,moonSinAlt:number,sunScreenX:number,sunY:number,sunAz:number,nightAlpha:number,isNight:boolean,sunAlt:number}} ctx2
 */
function drawSkyBodies(ctx,W,H,s,ctx2){
  var t=s.t,plName=s.plName,yaw=s.yaw,lat=s.lat,fov=s.fov,lngDeg=s.lngDeg;
  var latRad=s.latRad,rotAbs=s.rotAbs,hrzY=s.hrzY,sunDir=s.sunDir;
  var eclLand=ctx2.eclLand,eclStrength=ctx2.eclStrength;
  var sunScreenX=ctx2.sunScreenX,sunY=ctx2.sunY,sunAz=ctx2.sunAz,nightAlpha=ctx2.nightAlpha;
  var isNight=ctx2.isNight,sunAlt=ctx2.sunAlt;

  if(plName==="Earth"){
    /* Moon - proper alt/az from RA/Dec, matching star calculation */
    var sunLngE=(280.46+0.9856*t+36000)%360;
    var moonLngE=(218.316+13.176396*t+360000)%360;
    var moonPh=((moonLngE-sunLngE)/360+100)%1;
    var moonRaD=moonLngE%360;
    var moonDecD=5.1*Math.sin((moonLngE-125.04)*0.01745);
    var lstD2=((280.46+360.98565*t+(lngDeg||0))%360+360)%360;
    var moonHr=(lstD2-moonRaD)*TAU/360;
    var moonDecR2=moonDecD*0.01745;
    var moonSinAlt=Math.sin(latRad)*Math.sin(moonDecR2)+Math.cos(latRad)*Math.cos(moonDecR2)*Math.cos(moonHr);
    if(moonSinAlt>-0.1){
      var moonAz2=Math.atan2(-Math.sin(moonHr)*Math.cos(moonDecR2),Math.sin(moonDecR2)*Math.cos(latRad)-Math.cos(moonDecR2)*Math.sin(latRad)*Math.cos(moonHr));
      var moonADiff=((moonAz2-yaw)%TAU+TAU)%TAU;if(moonADiff>Math.PI)moonADiff-=TAU;
      var moonX=W/2+moonADiff*W*0.8/TAU;
      var moonY=hrzY-moonSinAlt*hrzY*0.75;
      if(moonY>4&&moonY<hrzY+10){
        var moonRad=Math.max(4,8/fov);
        var mkx=moonRad*Math.cos(moonPh*TAU);
        var mA=Math.max(0.75,nightAlpha*0.85+0.1);
        var dxSun2=sunScreenX-moonX, dySun2=sunY-moonY;
        var toSun=Math.atan2(dxSun2,-dySun2);
        var moonTilt=moonPh<0.5 ? toSun-Math.PI/2 : toSun+Math.PI/2;
        ctx.save();
        ctx.translate(moonX,moonY);ctx.rotate(moonTilt);
        ctx.beginPath();ctx.arc(0,0,moonRad,0,TAU);ctx.clip();
        ctx.fillStyle="rgba(15,18,35,1)";ctx.fillRect(-moonRad,-moonRad,moonRad*2,moonRad*2);
        if(moonPh>0.02&&moonPh<0.98){
          /* Lunar eclipse: blend white→coppery red proportional to eclStrength */
          var moonCol;
          if(eclLand==='lunar'){
            var ls=eclStrength;
            var rC=Math.round(235-(235-185)*ls),gC=Math.round(235-(235-70)*ls),bC=Math.round(210-(210-25)*ls);
            moonCol="rgba("+rC+","+gC+","+bC+",";
          }else{
            moonCol="rgba(235,235,210,";
          }
          /* Dim alpha proportionally during deep eclipse (total eclipse ≈ -2 mag vs normal full moon) */
          var moonA=eclLand==='lunar'?mA*(1-eclStrength*0.35):mA;
          ctx.fillStyle=moonCol+moonA.toFixed(2)+")";ctx.beginPath();
          if(moonPh<0.5){
            ctx.arc(0,0,moonRad,-Math.PI/2,Math.PI/2,false);
            ctx.bezierCurveTo(mkx,moonRad,mkx,-moonRad,0,-moonRad);
          }else{
            ctx.arc(0,0,moonRad,-Math.PI/2,Math.PI/2,true);
            ctx.bezierCurveTo(-mkx,moonRad,-mkx,-moonRad,0,-moonRad);
          }
          ctx.fill();
        }
        ctx.restore();
        if(eclLand==='lunar'){
          var lstr=eclStrength;ctx.globalAlpha=0.18*lstr;
          var lg=ctx.createRadialGradient(moonX,moonY,moonRad,moonX,moonY,moonRad*3);
          lg.addColorStop(0,"rgba(200,50,0,1)");lg.addColorStop(1,"rgba(200,50,0,0)");
          ctx.fillStyle=lg;ctx.fillRect(moonX-moonRad*3,moonY-moonRad*3,moonRad*6,moonRad*6);ctx.globalAlpha=1;
          /* Partial eclipses: show Earth shadow arc encroaching from the sun-opposite side */
          if(lstr<0.85){
            var shAng=Math.atan2(-dySun2,-dxSun2);/* direction away from sun */
            var shOff=(1-lstr)*moonRad*1.4;
            var shCx=moonX+Math.cos(shAng)*shOff,shCy=moonY+Math.sin(shAng)*shOff;
            ctx.save();ctx.beginPath();ctx.arc(moonX,moonY,moonRad,0,TAU);ctx.clip();
            ctx.fillStyle="rgba(40,15,5,"+(0.55+lstr*0.3).toFixed(2)+")";
            ctx.beginPath();ctx.arc(shCx,shCy,moonRad*1.1,0,TAU);ctx.fill();
            ctx.restore();
          }
          ctx.fillStyle="rgba(255,150,80,"+(0.7*Math.max(lstr,0.4)).toFixed(2)+")";ctx.font="bold 10px sans-serif";ctx.textAlign="center";
          ctx.fillText(lstr>0.85?"🌕 皆既月食":lstr>0.4?"🌖 部分月食":"🌗 半影月食",W/2,hrzY*0.08);
        }
        var mg=ctx.createRadialGradient(moonX,moonY,moonRad,moonX,moonY,moonRad*3);
        mg.addColorStop(0,"rgba(255,255,220,"+(0.12*nightAlpha).toFixed(2)+")");mg.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=mg;ctx.fillRect(moonX-moonRad*3,moonY-moonRad*3,moonRad*6,moonRad*6);
        ctx.fillStyle="rgba(200,200,180,"+(0.4*nightAlpha).toFixed(2)+")";ctx.font="7px sans-serif";ctx.textAlign="center";
        var phaseNames=["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"];ctx.fillText(phaseNames[Math.round(moonPh*8)%8],moonX,moonY+moonRad+9);
      }
    }
    /* Venus as evening/morning star */
    if(!isNight||sunAlt>-0.3){
      var venX=(W*0.3+t*0.1+yaw*60)%W,venY=hrzY*0.4+Math.sin(t*0.01)*hrzY*0.1;
      ctx.globalAlpha=Math.max(0,(0.3-sunAlt)*2)*0.7;fillCirc(ctx,venX,venY,2,"rgba(255,255,200,1)");
      var vglow=ctx.createRadialGradient(venX,venY,1,venX,venY,8);vglow.addColorStop(0,"rgba(255,255,200,0.3)");vglow.addColorStop(1,"rgba(255,255,200,0)");ctx.fillStyle=vglow;ctx.fillRect(venX-8,venY-8,16,16);ctx.globalAlpha=1;
    }
  }else if(plName==="Io"||plName==="Europa"||plName==="Ganymede"||plName==="Callisto"){
    /* Jupiter dominates the sky — tidally locked (sub-Jovian point = lat:0 lng:0) */
    var jupLngR=((lngDeg||0)+540)%360-180;jupLngR=jupLngR*0.01745;
    var jupLatR=(lat||0)*0.01745;
    var subJovCos=Math.cos(jupLatR)*Math.cos(jupLngR);
    if(subJovCos>-0.05){
      var jupAlt=Math.asin(Math.max(-1,Math.min(1,subJovCos)));
      var jupAz=Math.atan2(Math.sin(jupLngR),-Math.sin(jupLatR)*Math.cos(jupLngR));
      var jupADiff=((jupAz-yaw)%TAU+TAU)%TAU;if(jupADiff>Math.PI)jupADiff-=TAU;
      if(Math.abs(jupADiff)<TAU*0.4){
        var jupX=W/2+jupADiff*W*0.8/TAU;
        var jupY=hrzY-(jupAlt/(Math.PI*0.5))*hrzY*0.85;
        var jupAngR=plName==="Io"?0.168:plName==="Europa"?0.106:plName==="Ganymede"?0.067:0.038;
        var jupRad=Math.max(3,jupAngR*W*0.8/TAU/fov);
        var jg=ctx.createRadialGradient(jupX,jupY,jupRad,jupX,jupY,jupRad*2.4);
        jg.addColorStop(0,"rgba(210,170,100,0.18)");jg.addColorStop(1,"rgba(210,170,100,0)");
        ctx.fillStyle=jg;ctx.fillRect(jupX-jupRad*3,jupY-jupRad*3,jupRad*6,jupRad*6);
        ctx.save();ctx.beginPath();ctx.arc(jupX,jupY,jupRad,0,TAU);ctx.clip();
        ctx.fillStyle="rgba(205,175,115,1)";ctx.fillRect(jupX-jupRad,jupY-jupRad,jupRad*2,jupRad*2);
        var jupBands=[{y:-0.55,h:0.18,c:"rgba(175,120,70,0.8)"},{y:-0.25,h:0.14,c:"rgba(155,105,60,0.7)"},{y:0.05,h:0.20,c:"rgba(185,130,80,0.75)"},{y:0.38,h:0.15,c:"rgba(160,110,65,0.65)"}];
        for(var jbi=0;jbi<jupBands.length;jbi++){var jb=jupBands[jbi];ctx.fillStyle=jb.c;ctx.fillRect(jupX-jupRad,jupY+jb.y*jupRad,jupRad*2,jb.h*jupRad);}
        ctx.fillStyle="rgba(180,80,55,0.7)";ctx.beginPath();ctx.ellipse(jupX-jupRad*0.2,jupY+jupRad*0.12,jupRad*0.22,jupRad*0.10,0,0,TAU);ctx.fill();
        ctx.restore();
        if(jupY<hrzY-2&&jupRad>5){ctx.fillStyle="rgba(220,185,130,0.6)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("木星",jupX,jupY-jupRad-4);}
      }
    }
  }else if(plName==="Triton"){
    /* Neptune dominates the sky — tidally locked, retrograde */
    var neLngR=((lngDeg||0)+540)%360-180;neLngR=neLngR*0.01745;
    var neLatR=(lat||0)*0.01745;
    var subNepCos=Math.cos(neLatR)*Math.cos(neLngR);
    if(subNepCos>-0.05){
      var neAlt=Math.asin(Math.max(-1,Math.min(1,subNepCos)));
      var neAz=Math.atan2(Math.sin(neLngR),-Math.sin(neLatR)*Math.cos(neLngR));
      var neADiff=((neAz-yaw)%TAU+TAU)%TAU;if(neADiff>Math.PI)neADiff-=TAU;
      if(Math.abs(neADiff)<TAU*0.4){
        var neX=W/2+neADiff*W*0.8/TAU;
        var neY=hrzY-(neAlt/(Math.PI*0.5))*hrzY*0.85;
        var neAngR=0.139;
        var neRad=Math.max(4,neAngR*W*0.8/TAU/fov);
        var neg=ctx.createRadialGradient(neX,neY,neRad,neX,neY,neRad*2.2);
        neg.addColorStop(0,"rgba(80,120,220,0.18)");neg.addColorStop(1,"rgba(80,120,220,0)");
        ctx.fillStyle=neg;ctx.fillRect(neX-neRad*3,neY-neRad*3,neRad*6,neRad*6);
        ctx.save();ctx.beginPath();ctx.arc(neX,neY,neRad,0,TAU);ctx.clip();
        ctx.fillStyle="rgba(45,80,180,1)";ctx.fillRect(neX-neRad,neY-neRad,neRad*2,neRad*2);
        ctx.fillStyle="rgba(30,55,140,0.65)";ctx.fillRect(neX-neRad,neY-neRad*0.45,neRad*2,neRad*0.22);
        ctx.fillStyle="rgba(70,110,200,0.55)";ctx.fillRect(neX-neRad,neY+neRad*0.1,neRad*2,neRad*0.18);
        ctx.fillStyle="rgba(15,25,80,0.7)";ctx.beginPath();ctx.ellipse(neX-neRad*0.15,neY-neRad*0.05,neRad*0.22,neRad*0.10,0,0,TAU);ctx.fill();
        ctx.restore();
        if(neY<hrzY-2&&neRad>5){ctx.fillStyle="rgba(120,170,240,0.65)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("海王星",neX,neY-neRad-4);}
      }
    }
  }else if(plName==="Charon"){
    /* Pluto dominates Charon's sky */
    var puLngR=((lngDeg||0)+540)%360-180;puLngR=puLngR*0.01745;
    var puLatR=(lat||0)*0.01745;
    var subPluCos=Math.cos(puLatR)*Math.cos(puLngR);
    if(subPluCos>-0.05){
      var puAlt=Math.asin(Math.max(-1,Math.min(1,subPluCos)));
      var puAz=Math.atan2(Math.sin(puLngR),-Math.sin(puLatR)*Math.cos(puLngR));
      var puADiff=((puAz-yaw)%TAU+TAU)%TAU;if(puADiff>Math.PI)puADiff-=TAU;
      if(Math.abs(puADiff)<TAU*0.4){
        var puX=W/2+puADiff*W*0.8/TAU;
        var puY=hrzY-(puAlt/(Math.PI*0.5))*hrzY*0.85;
        var puAngR=0.155;
        var puRad=Math.max(5,puAngR*W*0.8/TAU/fov);
        ctx.save();ctx.beginPath();ctx.arc(puX,puY,puRad,0,TAU);ctx.clip();
        ctx.fillStyle="rgba(195,175,150,1)";ctx.fillRect(puX-puRad,puY-puRad,puRad*2,puRad*2);
        ctx.fillStyle="rgba(235,220,200,0.8)";
        ctx.beginPath();ctx.ellipse(puX+puRad*0.1,puY-puRad*0.05,puRad*0.3,puRad*0.28,0,0,TAU);ctx.fill();
        ctx.fillStyle="rgba(95,60,40,0.7)";
        ctx.beginPath();ctx.ellipse(puX-puRad*0.35,puY+puRad*0.25,puRad*0.35,puRad*0.18,0.2,0,TAU);ctx.fill();
        ctx.restore();
        if(puY<hrzY-2&&puRad>5){ctx.fillStyle="rgba(220,200,170,0.7)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("冥王星",puX,puY-puRad-4);}
      }
    }
  }else if(plName==="Pluto"){
    /* Charon dominates Pluto's sky */
    var caLngR=((lngDeg||0)+540)%360-180;caLngR=caLngR*0.01745;
    var caLatR=(lat||0)*0.01745;
    var subChaCos=Math.cos(caLatR)*Math.cos(caLngR);
    if(subChaCos>-0.05){
      var caAlt=Math.asin(Math.max(-1,Math.min(1,subChaCos)));
      var caAz=Math.atan2(Math.sin(caLngR),-Math.sin(caLatR)*Math.cos(caLngR));
      var caADiff=((caAz-yaw)%TAU+TAU)%TAU;if(caADiff>Math.PI)caADiff-=TAU;
      if(Math.abs(caADiff)<TAU*0.4){
        var caX=W/2+caADiff*W*0.8/TAU;
        var caY=hrzY-(caAlt/(Math.PI*0.5))*hrzY*0.85;
        var caAngR=0.067;
        var caRad=Math.max(4,caAngR*W*0.8/TAU/fov);
        ctx.save();ctx.beginPath();ctx.arc(caX,caY,caRad,0,TAU);ctx.clip();
        ctx.fillStyle="rgba(155,142,130,1)";ctx.fillRect(caX-caRad,caY-caRad,caRad*2,caRad*2);
        ctx.fillStyle="rgba(140,55,35,0.7)";
        ctx.beginPath();ctx.ellipse(caX,caY-caRad*0.7,caRad*0.65,caRad*0.3,0,0,TAU);ctx.fill();
        ctx.restore();
        if(caY<hrzY-2&&caRad>4){ctx.fillStyle="rgba(200,185,165,0.7)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("カロン",caX,caY-caRad-4);}
      }
    }
  }else if(plName==="HalleyCore"){
    /* Coma + ion tail anti-sunward streaks */
    var coR=Math.min(W,hrzY)*0.6;
    var coGr=ctx.createRadialGradient(sunScreenX,sunY,coR*0.05,sunScreenX,sunY,coR);
    coGr.addColorStop(0,"rgba(180,220,255,0.18)");coGr.addColorStop(0.5,"rgba(140,190,240,0.06)");coGr.addColorStop(1,"rgba(100,150,220,0)");
    ctx.fillStyle=coGr;ctx.fillRect(sunScreenX-coR,sunY-coR,coR*2,coR*2);
    var antiSunAz=(sunAz+Math.PI)%TAU;
    var antiDiff=((antiSunAz-yaw)%TAU+TAU)%TAU;if(antiDiff>Math.PI)antiDiff-=TAU;
    if(Math.abs(antiDiff)<TAU*0.4){
      var tailX=W/2+antiDiff*W*0.8/TAU;
      ctx.globalAlpha=0.35;ctx.strokeStyle="rgba(140,190,255,0.85)";ctx.lineWidth=1;
      for(var hti=0;hti<14;hti++){
        var htOff=(hti-7)*8;
        ctx.beginPath();ctx.moveTo(tailX+htOff,hrzY*0.92);ctx.lineTo(tailX+htOff*1.5,hrzY*0.05);ctx.stroke();
      }
      ctx.globalAlpha=1;
    }
  }else if(plName==="Titan"){
    /* Saturn with rings visible through orange haze */
    var satLngR=((lngDeg||0)+540)%360-180;satLngR=satLngR*0.01745;
    var satLatR=(lat||0)*0.01745;
    var subSatCos=Math.cos(satLatR)*Math.cos(satLngR);
    if(subSatCos>-0.05){
      var satAlt=Math.asin(Math.max(-1,Math.min(1,subSatCos)));
      var satAz=Math.atan2(Math.sin(satLngR),-Math.sin(satLatR)*Math.cos(satLngR));
      var satADiff=((satAz-yaw)%TAU+TAU)%TAU;if(satADiff>Math.PI)satADiff-=TAU;
      if(Math.abs(satADiff)<TAU*0.4){
        var satX=W/2+satADiff*W*0.8/TAU;
        var satY=hrzY-(satAlt/(Math.PI*0.5))*hrzY*0.85;
        var satAngR=0.049;
        var satRad=Math.max(2,satAngR*W*0.8/TAU/fov);
        ctx.save();ctx.globalAlpha=0.55;
        ctx.strokeStyle="rgba(200,178,120,0.6)";ctx.lineWidth=satRad*0.35;
        ctx.beginPath();ctx.ellipse(satX,satY,satRad*2.2,satRad*0.55,0,0,TAU);ctx.stroke();
        ctx.beginPath();ctx.arc(satX,satY,satRad,0,TAU);ctx.clip();
        ctx.fillStyle="rgba(215,195,148,1)";ctx.fillRect(satX-satRad,satY-satRad,satRad*2,satRad*2);
        ctx.fillStyle="rgba(185,160,110,0.6)";ctx.fillRect(satX-satRad,satY+satRad*0.1,satRad*2,satRad*0.25);
        ctx.restore();
        ctx.globalAlpha=0.55;
        ctx.strokeStyle="rgba(200,178,120,0.5)";ctx.lineWidth=satRad*0.28;
        ctx.beginPath();ctx.ellipse(satX,satY+satRad*0.12,satRad*2.2,satRad*0.55,0,Math.PI,0,false);ctx.stroke();
        ctx.globalAlpha=1;
        if(satY<hrzY-2&&satRad>3){ctx.fillStyle="rgba(220,195,148,0.5)";ctx.font="8px sans-serif";ctx.textAlign="center";ctx.fillText("土星",satX,satY-satRad-4);}
      }
    }
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
    /* Galilean moons in equatorial plane (dec≈0): alt/az from observer lat+lng */
    var gmLST=(t/rotAbs+(lngDeg||0)/360)*TAU*sunDir;
    var cosLat=Math.cos(latRad),sinLat=Math.sin(latRad);
    for(var gmi=0;gmi<GMOONS.length;gmi++){
      var gm=GMOONS[gmi];
      var gmHA=gmLST-(t/gm.p)*TAU;
      var cosHA=Math.cos(gmHA),sinHA=Math.sin(gmHA);
      var gmSinAlt=cosLat*cosHA;
      if(gmSinAlt<-0.05)continue;
      var gmAz2=Math.atan2(-sinHA,-sinLat*cosHA);
      var gmAzDiff=((gmAz2-yaw)%TAU+TAU)%TAU;if(gmAzDiff>Math.PI)gmAzDiff-=TAU;
      var gmScrX=W/2+gmAzDiff*W*0.8/TAU;
      var gmScrY=hrzY-gmSinAlt*hrzY*0.88;
      if(gmScrX<-50||gmScrX>W+50||gmScrY<2)continue;
      var gmSz=gm.sz/fov;
      ctx.globalAlpha=0.85;fillCirc(ctx,gmScrX,gmScrY,gmSz,gm.col);
      if(gmSz>2.5){ctx.fillStyle="rgba(255,255,255,0.25)";ctx.font="7px sans-serif";ctx.textAlign="center";ctx.fillText(gm.name,gmScrX,gmScrY-gmSz-3);}
      ctx.globalAlpha=1;
    }
  }else if(plName==="Saturn"){
    /* Titan - visible as bright dot */
    var tiAng=(t/15.945)*TAU,tiX=(W*0.4+Math.cos(tiAng+yaw)*W*0.2),tiY=hrzY*0.35;
    ctx.globalAlpha=0.6;fillCirc(ctx,tiX,tiY,2.5/fov,"rgba(200,180,120,1)");ctx.globalAlpha=1;
  }else if(plName==="Moon"){
    /* Earth in lunar sky — tidally locked + optical libration */
    var libL=7.9*Math.sin(t*2*Math.PI/27.55);
    var libB=6.7*Math.sin(t*2*Math.PI/27.21);
    var lngRadE=(((lngDeg||0)-libL+540)%360-180)*0.01745;
    var latRadEff=((lat||0)-libB)*0.01745;
    var subEarthCos=Math.cos(latRadEff)*Math.cos(lngRadE);
    if(subEarthCos>0.02){
      var earthAlt=Math.asin(Math.max(-1,Math.min(1,subEarthCos)));
      var earthAz=Math.atan2(Math.sin(lngRadE),-Math.sin(latRadEff)*Math.cos(lngRadE));
      var earthADiff=((earthAz-yaw)%TAU+TAU)%TAU;if(earthADiff>Math.PI)earthADiff-=TAU;
      if(Math.abs(earthADiff)<TAU*0.32){
        var earthX=W/2+earthADiff*W*0.8/TAU;
        var earthY=hrzY-(earthAlt/(Math.PI*0.5))*hrzY*0.85;
        var earthRad=Math.max(10,22/fov);
        var sunLngM=(280.46+0.9856*t+36000)%360;
        var moonLngM=(218.316+13.176396*t+360000)%360;
        var moonPhFromE=((moonLngM-sunLngM)/360+100)%1;
        /* earthPh: new Moon (phase=0) = dark Earth (0%); full Moon (phase=0.5) = full Earth (100%) */
        var earthPh=moonPhFromE;
        /* Sub-solar longitude on Moon surface (0=near-side/sub-Earth, ±180=far-side) */
        var ssLngD=(((0.5-moonPhFromE)*360)+900)%360-180;
        /* Sun direction from observer, consistent with libration correction applied to Earth */
        var sunLngRadM=(((lngDeg||0)-libL-ssLngD+540)%360-180)*0.01745;
        var sunLatRadM=((lat||0)-libB)*0.01745;
        var moonSunSinAlt=Math.cos(sunLatRadM)*Math.cos(sunLngRadM);
        var moonSunAz2=Math.atan2(Math.sin(sunLngRadM),-Math.sin(sunLatRadM)*Math.cos(sunLngRadM));
        var moonSunADiff=((moonSunAz2-yaw)%TAU+TAU)%TAU;if(moonSunADiff>Math.PI)moonSunADiff-=TAU;
        var moonSunScrX=W/2+moonSunADiff*W*0.8/TAU;
        var moonSunScrY=hrzY-moonSunSinAlt*hrzY*0.75;
        var dxSunE=moonSunScrX-earthX,dySunE=moonSunScrY-earthY;
        var toSunE=Math.atan2(dxSunE,-dySunE);
        var earthTilt=earthPh<0.5?toSunE-Math.PI/2:toSunE+Math.PI/2;
        ctx.save();
        var egGlow=ctx.createRadialGradient(earthX,earthY,earthRad*0.95,earthX,earthY,earthRad*2.4);
        egGlow.addColorStop(0,"rgba(140,200,255,0.25)");egGlow.addColorStop(1,"rgba(120,180,255,0)");
        ctx.fillStyle=egGlow;ctx.fillRect(earthX-earthRad*3,earthY-earthRad*3,earthRad*6,earthRad*6);
        ctx.translate(earthX,earthY);ctx.rotate(earthTilt);
        ctx.beginPath();ctx.arc(0,0,earthRad,0,TAU);ctx.clip();
        ctx.fillStyle="rgba(8,12,28,1)";ctx.fillRect(-earthRad,-earthRad,earthRad*2,earthRad*2);
        if(earthPh>0.02&&earthPh<0.98){
          var ekx=earthRad*Math.cos(earthPh*TAU);
          ctx.fillStyle="rgba(55,100,180,1)";
          ctx.beginPath();
          if(earthPh<0.5){
            ctx.arc(0,0,earthRad,-Math.PI/2,Math.PI/2,false);
            ctx.bezierCurveTo(ekx,earthRad,ekx,-earthRad,0,-earthRad);
          }else{
            ctx.arc(0,0,earthRad,-Math.PI/2,Math.PI/2,true);
            ctx.bezierCurveTo(-ekx,earthRad,-ekx,-earthRad,0,-earthRad);
          }
          ctx.fill();
          ctx.globalAlpha=0.85;ctx.fillStyle="rgba(95,135,60,1)";
          var contShift=earthPh<0.5?earthRad*0.15:-earthRad*0.15;
          ctx.beginPath();ctx.ellipse(contShift,-earthRad*0.05,earthRad*0.38,earthRad*0.48,0.2,0,TAU);ctx.fill();
          ctx.fillStyle="rgba(180,150,90,1)";
          ctx.beginPath();ctx.ellipse(contShift-earthRad*0.1,earthRad*0.25,earthRad*0.22,earthRad*0.18,0.3,0,TAU);ctx.fill();
          ctx.globalAlpha=0.55;ctx.fillStyle="rgba(255,255,255,1)";
          ctx.beginPath();ctx.ellipse(contShift+earthRad*0.2,-earthRad*0.45,earthRad*0.45,earthRad*0.14,0.15,0,TAU);ctx.fill();
          ctx.beginPath();ctx.ellipse(contShift-earthRad*0.05,earthRad*0.4,earthRad*0.4,earthRad*0.12,-0.1,0,TAU);ctx.fill();
          ctx.globalAlpha=0.7;ctx.fillStyle="rgba(245,250,255,1)";
          ctx.beginPath();ctx.ellipse(0,-earthRad*0.88,earthRad*0.55,earthRad*0.15,0,0,TAU);ctx.fill();
          ctx.beginPath();ctx.ellipse(0,earthRad*0.88,earthRad*0.45,earthRad*0.13,0,0,TAU);ctx.fill();
          ctx.globalAlpha=0.55;
          var lgmEdge=ctx.createRadialGradient(0,0,earthRad*0.85,0,0,earthRad);
          lgmEdge.addColorStop(0,"rgba(120,180,255,0)");lgmEdge.addColorStop(0.85,"rgba(140,200,255,0.3)");lgmEdge.addColorStop(1,"rgba(180,220,255,0.8)");
          ctx.fillStyle=lgmEdge;ctx.fillRect(-earthRad,-earthRad,earthRad*2,earthRad*2);
          ctx.globalAlpha=1;
        }
        if(earthPh<0.85){
          ctx.globalAlpha=0.5;ctx.fillStyle="rgba(255,220,140,1)";
          for(var clI=0;clI<8;clI++){
            var cla=(clI*0.785+t*0.05)%TAU,clr=earthRad*(0.4+clI*0.05),clx2=Math.cos(cla)*clr,cly2=Math.sin(cla)*clr*0.7;
            if((earthPh<0.5&&clx2>0)||(earthPh>0.5&&clx2<0))continue;
            ctx.fillRect(clx2,cly2,0.8,0.8);
          }
          ctx.globalAlpha=1;
        }
        ctx.restore();
        ctx.fillStyle="rgba(180,210,255,0.85)";ctx.font="bold 10px sans-serif";ctx.textAlign="center";
        var earthPhName;
        if(earthPh<0.04||earthPh>0.96)earthPhName="新地球";
        else if(earthPh<0.46)earthPhName="三日地球";
        else if(earthPh<0.54)earthPhName="満地球 🌍";
        else if(earthPh<0.96)earthPhName="半地球";
        ctx.fillText(earthPhName,earthX,earthY+earthRad+14);
        ctx.fillStyle="rgba(140,180,230,0.55)";ctx.font="8px sans-serif";
        ctx.fillText("輝面比 "+(Math.round((1-Math.cos(earthPh*TAU))/2*100))+"%",earthX,earthY+earthRad+25);
      }
    }
    /* Apollo landing sites label */
    if(Math.abs(latRad)<0.5&&((lngDeg||0)>-50&&(lngDeg||0)<50)){
      ctx.fillStyle="rgba(255,200,100,0.4)";ctx.font="8px sans-serif";ctx.textAlign="left";
      ctx.fillText("🏴 Apollo 着陸候補域",10,hrzY-6);
    }
  }
}

export { drawSkyBodies };
