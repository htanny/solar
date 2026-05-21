import { useEffect } from "react";
import { PL, PL_MAP, SP } from "../data/solarData.js";

/* Centralized keyboard shortcut handler.
   Caller supplies a `ctx` object with the React state setters / refs
   needed to react to each key. Keeping it out of App.jsx makes the giant
   animation-loop useEffect smaller and the shortcut surface easier to scan. */
export function useKeyboard(ctx){
  useEffect(function(){
    function kd(e){
      var k=e.key;
      if(k===" "){e.preventDefault();ctx.setPaused(function(p){return!p;});}
      else if(k==="0"){ctx.focusOn("all");}
      else if(k.toLowerCase()==="s"){ctx.focusOn("sun");}
      else if(k>="1"&&k<="8"){ctx.focusOn(PL[parseInt(k)-1].n);}
      else if(k==="9"){ctx.focusOn("Halley");}
      else if(k.toLowerCase()==="e"){ctx.focusOn("Encke");}
      else if(k==="+"||k==="="){e.preventDefault();if(ctx.landR.current){var fi=Math.max(0.3,ctx.landFovR.current*0.9);ctx.landFovR.current=fi;ctx.setLandFov(fi);}else ctx.zIn();}
      else if(k==="-"||k==="_"){e.preventDefault();if(ctx.landR.current){var fo=Math.min(3,ctx.landFovR.current*1.1);ctx.landFovR.current=fo;ctx.setLandFov(fo);}else ctx.zOut();}
      else if(k==="ArrowRight"){var ci2=SP.indexOf(ctx.spR.current);if(ci2<SP.length-1){ctx.setSpd(SP[ci2+1]);ctx.setPaused(false);}}
      else if(k==="ArrowLeft"){var ci3=SP.indexOf(ctx.spR.current);if(ci3>0){ctx.setSpd(SP[ci3-1]);ctx.setPaused(false);}}
      else if(k.toLowerCase()==="c"){ctx.setCompare(function(p){if(!p)ctx.cmpStateRef.current={offX:0,zm:1};return!p;});}
      else if(k.toLowerCase()==="t"){if(ctx.tourRef.current.active){ctx.stopTour();ctx.setFoc("all");ctx.setInfo(null);}else{ctx.setLanding(null);ctx.stopTour();ctx.setTouring(true);ctx.tourRef.current={active:true,idx:0,timer:0,trans:false,lv:"int"};ctx.setFoc("sun");ctx.setInfo({type:"sun"});}}
      else if(k.toLowerCase()==="m"){ctx.setBgm(function(p){return!p;});}
      else if(k.toLowerCase()==="g"){var galIdx=2,ssIdx=17;if(ctx.ziR.current>9){ctx.dz(galIdx);ctx.ziR.current=galIdx;ctx.setZi(galIdx);ctx.setFoc("all");ctx.setInfo(null);}else{ctx.dz(ssIdx);ctx.ziR.current=ssIdx;ctx.setZi(ssIdx);}}
      else if(k.toLowerCase()==="l"){if(ctx.landR.current){ctx.setLanding(null);}else if(ctx.foR.current!=="all"&&ctx.foR.current!=="sun"){var lpl=PL_MAP[ctx.foR.current];if(lpl)ctx.doLanding(ctx.foR.current);}}
      else if(k==="Escape"){if(ctx.landR.current)ctx.setLanding(null);}
      else if(k==="?"||(k==="/"&&e.shiftKey)){e.preventDefault();ctx.dispatchPanel({type:ctx.isPhone?"TOGGLE_EX":"TOGGLE",key:"helpOpen"});}
    }
    window.addEventListener("keydown",kd);
    return function(){window.removeEventListener("keydown",kd);};
  },[ctx]);
}
