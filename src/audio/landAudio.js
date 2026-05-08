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
