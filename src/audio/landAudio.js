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
    }else if(plName==="Jupiter"||plName==="Saturn"){
      /* Storm rumble */
      var bn4=ac.createBufferSource();var buf4=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate);var d4=buf4.getChannelData(0);for(var m=0;m<d4.length;m++)d4[m]=(Math.random()*2-1)*0.25;bn4.buffer=buf4;bn4.loop=true;
      var flt4=ac.createBiquadFilter();flt4.type="lowpass";flt4.frequency.value=80;
      var lfo2=ac.createOscillator();lfo2.frequency.value=0.05;var lg2=ac.createGain();lg2.gain.value=40;lfo2.connect(lg2);lg2.connect(flt4.frequency);lfo2.start();
      bn4.connect(flt4);flt4.connect(master);bn4.start();nodes.push(bn4,lfo2);
      /* Thunder */
      var thInt=setInterval(function(){if(ac.state==="closed")return;var bn5=ac.createBufferSource();var buf5=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);var d5=buf5.getChannelData(0);for(var n=0;n<d5.length;n++)d5[n]=(Math.random()*2-1)*0.4*Math.exp(-n/ac.sampleRate*3);bn5.buffer=buf5;var g5=ac.createGain();g5.gain.value=0.08;var f5=ac.createBiquadFilter();f5.type="lowpass";f5.frequency.value=150;bn5.connect(f5);f5.connect(g5);g5.connect(master);bn5.start();},8000+Math.random()*12000);
      LAND_AUDIO={ac:ac,master:master,nodes:nodes,intervals:[thInt]};
    }else if(plName==="Neptune"||plName==="Uranus"){
      /* Howling wind */
      var bn6=ac.createBufferSource();var buf6=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);var d6=buf6.getChannelData(0);for(var q=0;q<d6.length;q++)d6[q]=(Math.random()*2-1)*0.2;bn6.buffer=buf6;bn6.loop=true;
      var flt6=ac.createBiquadFilter();flt6.type="bandpass";flt6.frequency.value=300;flt6.Q.value=2;
      var lfo3=ac.createOscillator();lfo3.frequency.value=0.08;var lg3=ac.createGain();lg3.gain.value=200;lfo3.connect(lg3);lg3.connect(flt6.frequency);lfo3.start();
      bn6.connect(flt6);flt6.connect(master);bn6.start();nodes.push(bn6,lfo3);
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
