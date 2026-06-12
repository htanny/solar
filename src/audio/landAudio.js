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
    }else if(plName==="Moon"){
      /* Deep silence with occasional microimpact rumble */
      var impInt=setInterval(function(){if(ac.state==="closed")return;var bi=ac.createBufferSource();var bufi=ac.createBuffer(1,Math.floor(ac.sampleRate*0.8),ac.sampleRate);var di=bufi.getChannelData(0);for(var ii=0;ii<di.length;ii++)di[ii]=(Math.random()*2-1)*0.35*Math.exp(-ii/ac.sampleRate*8);bi.buffer=bufi;var gi=ac.createGain();gi.gain.value=0.04;var fi=ac.createBiquadFilter();fi.type="lowpass";fi.frequency.value=60;bi.connect(fi);fi.connect(gi);gi.connect(master);bi.start();},12000+Math.random()*18000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[impInt]};
    }else if(plName==="Jupiter"){
      /* Very deep storm rumble + massive wind */
      var bn4=ac.createBufferSource();var buf4=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate);var d4=buf4.getChannelData(0);for(var m=0;m<d4.length;m++)d4[m]=(Math.random()*2-1)*0.3;bn4.buffer=buf4;bn4.loop=true;
      var flt4=ac.createBiquadFilter();flt4.type="lowpass";flt4.frequency.value=60;
      var lfo2=ac.createOscillator();lfo2.frequency.value=0.04;var lg2=ac.createGain();lg2.gain.value=30;lfo2.connect(lg2);lg2.connect(flt4.frequency);lfo2.start();
      bn4.connect(flt4);flt4.connect(master);bn4.start();nodes.push(bn4,lfo2);
      /* Frequent heavy thunder */
      var thInt=setInterval(function(){if(ac.state==="closed")return;var bn5=ac.createBufferSource();var buf5=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);var d5=buf5.getChannelData(0);for(var n=0;n<d5.length;n++)d5[n]=(Math.random()*2-1)*0.5*Math.exp(-n/ac.sampleRate*2);bn5.buffer=buf5;var g5=ac.createGain();g5.gain.value=0.12;var f5=ac.createBiquadFilter();f5.type="lowpass";f5.frequency.value=120;bn5.connect(f5);f5.connect(g5);g5.connect(master);bn5.start();},4000+Math.random()*6000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[thInt]};
    }else if(plName==="Saturn"){
      /* Hexagonal storm: deep pulse + ring whistler */
      var bn4s=ac.createBufferSource();var buf4s=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate);var d4s=buf4s.getChannelData(0);for(var ms=0;ms<d4s.length;ms++)d4s[ms]=(Math.random()*2-1)*0.2;bn4s.buffer=buf4s;bn4s.loop=true;
      var flt4s=ac.createBiquadFilter();flt4s.type="bandpass";flt4s.frequency.value=55;flt4s.Q.value=3;bn4s.connect(flt4s);flt4s.connect(master);bn4s.start();nodes.push(bn4s);
      var oRing=ac.createOscillator();oRing.type="sawtooth";oRing.frequency.value=480;var gRing=ac.createGain();gRing.gain.value=0.01;var lfoR=ac.createOscillator();lfoR.frequency.value=0.12;var lgR=ac.createGain();lgR.gain.value=180;lfoR.connect(lgR);lgR.connect(oRing.frequency);lfoR.start();oRing.connect(gRing);gRing.connect(master);oRing.start();nodes.push(oRing,lfoR);
      var thIntS=setInterval(function(){if(ac.state==="closed")return;var bn5s=ac.createBufferSource();var buf5s=ac.createBuffer(1,Math.floor(ac.sampleRate*1.5),ac.sampleRate);var d5s=buf5s.getChannelData(0);for(var ns2=0;ns2<d5s.length;ns2++)d5s[ns2]=(Math.random()*2-1)*0.3*Math.exp(-ns2/ac.sampleRate*2);bn5s.buffer=buf5s;var g5s=ac.createGain();g5s.gain.value=0.06;var f5s=ac.createBiquadFilter();f5s.type="lowpass";f5s.frequency.value=90;bn5s.connect(f5s);f5s.connect(g5s);g5s.connect(master);bn5s.start();},12000+Math.random()*16000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[thIntS]};
    }else if(plName==="Neptune"||plName==="Uranus"){
      /* Howling wind */
      var bn6=ac.createBufferSource();var buf6=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);var d6=buf6.getChannelData(0);for(var q=0;q<d6.length;q++)d6[q]=(Math.random()*2-1)*0.2;bn6.buffer=buf6;bn6.loop=true;
      var flt6=ac.createBiquadFilter();flt6.type="bandpass";flt6.frequency.value=300;flt6.Q.value=2;
      var lfo3=ac.createOscillator();lfo3.frequency.value=0.08;var lg3=ac.createGain();lg3.gain.value=200;lfo3.connect(lg3);lg3.connect(flt6.frequency);lfo3.start();
      bn6.connect(flt6);flt6.connect(master);bn6.start();nodes.push(bn6,lfo3);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[]};
    }else if(plName==="ProximaB"||plName==="Trappist1e"){
      /* Red dwarf flare world: low hum + sporadic UV crackle */
      var oRD=ac.createOscillator();oRD.type="sine";oRD.frequency.value=22;var gRD=ac.createGain();gRD.gain.value=0.2;oRD.connect(gRD);gRD.connect(master);oRD.start();nodes.push(oRD);
      var flareInt=setInterval(function(){if(ac.state==="closed")return;var of=ac.createOscillator();of.type="sawtooth";of.frequency.value=600+Math.random()*400;var gf=ac.createGain();gf.gain.value=0.025;of.connect(gf);gf.connect(master);of.start();gf.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.2);of.stop(ac.currentTime+0.25);},2500+Math.random()*4000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[flareInt]};
    }else if(plName==="Kepler22b"||plName==="HD189733b"){
      /* Super-Earth ocean wind + deep rumble */
      var bnEx=ac.createBufferSource();var bufEx=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);var dEx=bufEx.getChannelData(0);for(var ex=0;ex<dEx.length;ex++)dEx[ex]=(Math.random()*2-1)*0.22;bnEx.buffer=bufEx;bnEx.loop=true;
      var fltEx=ac.createBiquadFilter();fltEx.type="bandpass";fltEx.frequency.value=350;fltEx.Q.value=1.5;bnEx.connect(fltEx);fltEx.connect(master);bnEx.start();nodes.push(bnEx);
      var oEx=ac.createOscillator();oEx.type="sine";oEx.frequency.value=40;var gEx=ac.createGain();gEx.gain.value=0.15;oEx.connect(gEx);gEx.connect(master);oEx.start();nodes.push(oEx);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[]};
    }else if(plName==="Titan"){
      /* Dense N₂/CH₄ atmosphere: low atmospheric drone + N₂ wind (Huygens measured 5-10 m/s near surface)
         + periodic methane drizzle patter (at polar latitudes). Sound speed in cold N₂ is ~180 m/s,
         so atmosphere resonance is lower-pitched than Earth. */
      var oTi=ac.createOscillator();oTi.type="sine";oTi.frequency.value=55;var gTi=ac.createGain();gTi.gain.value=0.11;oTi.connect(gTi);gTi.connect(master);oTi.start();nodes.push(oTi);
      var oTi2=ac.createOscillator();oTi2.type="sine";oTi2.frequency.value=82;var gTi2=ac.createGain();gTi2.gain.value=0.045;oTi2.connect(gTi2);gTi2.connect(master);oTi2.start();nodes.push(oTi2);
      var bnTi=ac.createBufferSource();var bufTi=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);var dTi=bufTi.getChannelData(0);for(var tw=0;tw<dTi.length;tw++)dTi[tw]=(Math.random()*2-1)*0.22;bnTi.buffer=bufTi;bnTi.loop=true;
      var fltTi=ac.createBiquadFilter();fltTi.type="lowpass";fltTi.frequency.value=220;
      var lfoTi=ac.createOscillator();lfoTi.frequency.value=0.07;var lgTi=ac.createGain();lgTi.gain.value=80;lfoTi.connect(lgTi);lgTi.connect(fltTi.frequency);lfoTi.start();
      bnTi.connect(fltTi);fltTi.connect(master);bnTi.start();nodes.push(bnTi,lfoTi);
      var drzInt=setInterval(function(){if(ac.state==="closed")return;var bd=ac.createBufferSource();var bufd=ac.createBuffer(1,Math.floor(ac.sampleRate*0.9),ac.sampleRate);var dd=bufd.getChannelData(0);for(var dr=0;dr<dd.length;dr++)dd[dr]=(Math.random()*2-1)*0.3*Math.min(1,dr/(ac.sampleRate*0.15))*Math.exp(-dr/ac.sampleRate*2.5);bd.buffer=bufd;var gd=ac.createGain();gd.gain.value=0.032;var fd=ac.createBiquadFilter();fd.type="highpass";fd.frequency.value=1100;bd.connect(fd);fd.connect(gd);gd.connect(master);bd.start();},7000+Math.random()*13000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[drzInt]};
    }else if(plName==="Phobos"){
      /* Airless body in tight Mars orbit: deep tidal resonance sub-bass (Mars pulls hard
         at 7.65h) + occasional microimpact rumble (intense Stickney-region cratering) */
      var oPh=ac.createOscillator();oPh.type="sine";oPh.frequency.value=24;var gPh=ac.createGain();gPh.gain.value=0.10;oPh.connect(gPh);gPh.connect(master);oPh.start();nodes.push(oPh);
      var oPh2=ac.createOscillator();oPh2.type="sine";oPh2.frequency.value=48;var gPh2=ac.createGain();gPh2.gain.value=0.04;oPh2.connect(gPh2);gPh2.connect(master);oPh2.start();nodes.push(oPh2);
      var phImpInt=setInterval(function(){if(ac.state==="closed")return;var bp=ac.createBufferSource();var bufp=ac.createBuffer(1,Math.floor(ac.sampleRate*0.7),ac.sampleRate);var dp=bufp.getChannelData(0);for(var pi=0;pi<dp.length;pi++)dp[pi]=(Math.random()*2-1)*0.4*Math.exp(-pi/ac.sampleRate*10);bp.buffer=bufp;var gp=ac.createGain();gp.gain.value=0.035;var fp=ac.createBiquadFilter();fp.type="lowpass";fp.frequency.value=80;bp.connect(fp);fp.connect(gp);gp.connect(master);bp.start();},9000+Math.random()*15000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[phImpInt]};
    }else if(plName==="Europa"){
      /* Tidal flexing from Jupiter (3.55-day orbit): deep 20Hz sub-bass + 40Hz harmonic
         + bandpass-filtered subglacial ocean rumble + ice shell crack pops */
      var oEu=ac.createOscillator();oEu.type="sine";oEu.frequency.value=20;var gEu=ac.createGain();gEu.gain.value=0.12;oEu.connect(gEu);gEu.connect(master);oEu.start();nodes.push(oEu);
      var oEu2=ac.createOscillator();oEu2.type="sine";oEu2.frequency.value=40;var gEu2=ac.createGain();gEu2.gain.value=0.05;oEu2.connect(gEu2);gEu2.connect(master);oEu2.start();nodes.push(oEu2);
      var bnEu=ac.createBufferSource();var bufEu=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);var dEu=bufEu.getChannelData(0);for(var eu=0;eu<dEu.length;eu++)dEu[eu]=(Math.random()*2-1)*0.16;bnEu.buffer=bufEu;bnEu.loop=true;
      var fltEu=ac.createBiquadFilter();fltEu.type="bandpass";fltEu.frequency.value=42;fltEu.Q.value=1.8;bnEu.connect(fltEu);fltEu.connect(master);bnEu.start();nodes.push(bnEu);
      var crackInt=setInterval(function(){if(ac.state==="closed")return;var bc=ac.createBufferSource();var bufc=ac.createBuffer(1,Math.floor(ac.sampleRate*0.12),ac.sampleRate);var dc=bufc.getChannelData(0);for(var ci=0;ci<dc.length;ci++)dc[ci]=(Math.random()*2-1)*0.55*Math.exp(-ci/ac.sampleRate*30);bc.buffer=bufc;var gc=ac.createGain();gc.gain.value=0.025;var fcrk=ac.createBiquadFilter();fcrk.type="highpass";fcrk.frequency.value=600;bc.connect(fcrk);fcrk.connect(gc);gc.connect(master);bc.start();},5000+Math.random()*11000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[crackInt]};
    }else if(plName==="Io"){
      /* 太陽系最活発の火山天体: 深い火山性トレモア(16Hz+32Hz)
         + LFO変調ローパスノイズの溶岩湖ランブル + 周期的な噴火ホワール + 溶岩はぜ音 */
      var oIo=ac.createOscillator();oIo.type="sine";oIo.frequency.value=16;var gIo=ac.createGain();gIo.gain.value=0.13;oIo.connect(gIo);gIo.connect(master);oIo.start();nodes.push(oIo);
      var oIo2=ac.createOscillator();oIo2.type="sine";oIo2.frequency.value=32;var gIo2=ac.createGain();gIo2.gain.value=0.06;oIo2.connect(gIo2);gIo2.connect(master);oIo2.start();nodes.push(oIo2);
      var bnIo=ac.createBufferSource();var bufIo=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);var dIo=bufIo.getChannelData(0);for(var io=0;io<dIo.length;io++)dIo[io]=(Math.random()*2-1)*0.20;bnIo.buffer=bufIo;bnIo.loop=true;
      var fltIo=ac.createBiquadFilter();fltIo.type="lowpass";fltIo.frequency.value=75;
      var lfoIo=ac.createOscillator();lfoIo.frequency.value=0.11;var lgIo=ac.createGain();lgIo.gain.value=35;lfoIo.connect(lgIo);lgIo.connect(fltIo.frequency);lfoIo.start();
      bnIo.connect(fltIo);fltIo.connect(master);bnIo.start();nodes.push(bnIo,lfoIo);
      var erupInt=setInterval(function(){if(ac.state==="closed")return;var be=ac.createBufferSource();var bufe=ac.createBuffer(1,Math.floor(ac.sampleRate*2.2),ac.sampleRate);var de=bufe.getChannelData(0);for(var ei=0;ei<de.length;ei++)de[ei]=(Math.random()*2-1)*0.45*Math.min(1,ei/(ac.sampleRate*0.5))*Math.exp(-ei/ac.sampleRate*0.9);be.buffer=bufe;var ge=ac.createGain();ge.gain.value=0.055;var fe=ac.createBiquadFilter();fe.type="lowpass";fe.frequency.value=160;be.connect(fe);fe.connect(ge);ge.connect(master);be.start();},11000+Math.random()*14000);
      var popInt=setInterval(function(){if(ac.state==="closed")return;var bp2=ac.createBufferSource();var bufp2=ac.createBuffer(1,Math.floor(ac.sampleRate*0.08),ac.sampleRate);var dp2=bufp2.getChannelData(0);for(var pi2=0;pi2<dp2.length;pi2++)dp2[pi2]=(Math.random()*2-1)*0.5*Math.exp(-pi2/ac.sampleRate*55);bp2.buffer=bufp2;var gp2=ac.createGain();gp2.gain.value=0.02;var fp2=ac.createBiquadFilter();fp2.type="bandpass";fp2.frequency.value=420;bp2.connect(fp2);fp2.connect(gp2);gp2.connect(master);bp2.start();},3000+Math.random()*6000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[erupInt,popInt]};
    }else if(plName==="Ganymede"){
      /* 太陽系唯一の固有磁場を持つ衛星: 深い地下海ハム(22Hz+44Hz)
         + 磁気圏ホイッスラー空電(下降スイープ音) + 氷地殻のピング */
      var oGn=ac.createOscillator();oGn.type="sine";oGn.frequency.value=22;var gGn=ac.createGain();gGn.gain.value=0.11;oGn.connect(gGn);gGn.connect(master);oGn.start();nodes.push(oGn);
      var oGn2=ac.createOscillator();oGn2.type="sine";oGn2.frequency.value=44;var gGn2=ac.createGain();gGn2.gain.value=0.045;oGn2.connect(gGn2);gGn2.connect(master);oGn2.start();nodes.push(oGn2);
      var whisInt=setInterval(function(){if(ac.state==="closed")return;var ow=ac.createOscillator();ow.type="sine";ow.frequency.setValueAtTime(2400+Math.random()*1600,ac.currentTime);ow.frequency.exponentialRampToValueAtTime(180,ac.currentTime+1.4);var gw=ac.createGain();gw.gain.value=0.014;ow.connect(gw);gw.connect(master);ow.start();gw.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+1.5);ow.stop(ac.currentTime+1.6);},9000+Math.random()*12000);
      var icePingInt=setInterval(function(){if(ac.state==="closed")return;var op=ac.createOscillator();op.type="triangle";op.frequency.value=1600+Math.random()*1400;var gpn=ac.createGain();gpn.gain.value=0.012;op.connect(gpn);gpn.connect(master);op.start();gpn.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.6);op.stop(ac.currentTime+0.65);},7000+Math.random()*11000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[whisInt,icePingInt]};
    }else if(plName==="Miranda"){
      /* Airless moon in tight Uranus orbit: deep tidal resonance (low sub-bass) + sparse icy pings */
      var oMi=ac.createOscillator();oMi.type="sine";oMi.frequency.value=18;var gMi=ac.createGain();gMi.gain.value=0.12;oMi.connect(gMi);gMi.connect(master);oMi.start();nodes.push(oMi);
      var oMi2=ac.createOscillator();oMi2.type="sine";oMi2.frequency.value=36;var gMi2=ac.createGain();gMi2.gain.value=0.06;oMi2.connect(gMi2);gMi2.connect(master);oMi2.start();nodes.push(oMi2);
      var iceInt=setInterval(function(){if(ac.state==="closed")return;var oi=ac.createOscillator();oi.type="triangle";oi.frequency.value=2200+Math.random()*1800;var gi=ac.createGain();gi.gain.value=0.012;oi.connect(gi);gi.connect(master);oi.start();gi.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.7);oi.stop(ac.currentTime+0.75);},8000+Math.random()*14000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[iceInt]};
    }else if(plName==="Enceladus"){
      /* Airless ice moon: faint sub-bass tremor (tidal flexing) + periodic geyser whoosh */
      var oEn=ac.createOscillator();oEn.type="sine";oEn.frequency.value=28;var gEn=ac.createGain();gEn.gain.value=0.10;oEn.connect(gEn);gEn.connect(master);oEn.start();nodes.push(oEn);
      var geyInt=setInterval(function(){if(ac.state==="closed")return;var bg=ac.createBufferSource();var bufg=ac.createBuffer(1,Math.floor(ac.sampleRate*1.6),ac.sampleRate);var dg=bufg.getChannelData(0);for(var gn=0;gn<dg.length;gn++)dg[gn]=(Math.random()*2-1)*0.4*Math.min(1,gn/(ac.sampleRate*0.3))*Math.exp(-gn/ac.sampleRate*1.2);bg.buffer=bufg;var gg=ac.createGain();gg.gain.value=0.05;var fg=ac.createBiquadFilter();fg.type="highpass";fg.frequency.value=900;bg.connect(fg);fg.connect(gg);gg.connect(master);bg.start();},7000+Math.random()*9000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[geyInt]};
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

export { startLandSound, stopLandSound };
