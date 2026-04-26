import { useState, useRef } from "react";

function DragPanel(props){
  var ref=useRef(null),dr=useRef(null);
  var[pos,setPos]=useState(null);
  function onDown(e){
    if(e.target.tagName==="BUTTON"||e.target.tagName==="INPUT")return;
    var el=ref.current;if(!el)return;
    var r=el.getBoundingClientRect();
    var cx=e.clientX!==undefined?e.clientX:e.touches[0].clientX;
    var cy=e.clientY!==undefined?e.clientY:e.touches[0].clientY;
    dr.current={ox:cx-r.left,oy:cy-r.top};
    function onMove(ev){
      ev.preventDefault();
      var mx=ev.clientX!==undefined?ev.clientX:ev.touches[0].clientX;
      var my=ev.clientY!==undefined?ev.clientY:ev.touches[0].clientY;
      setPos({x:mx-dr.current.ox,y:my-dr.current.oy});
    }
    function onUp(){window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);window.removeEventListener("touchmove",onMove);window.removeEventListener("touchend",onUp);}
    window.addEventListener("mousemove",onMove);window.addEventListener("mouseup",onUp);
    window.addEventListener("touchmove",onMove,{passive:false});window.addEventListener("touchend",onUp);
  }
  var st=Object.assign({},props.style||{},{cursor:"grab",userSelect:"none",WebkitUserSelect:"none"});
  if(pos){st.position="absolute";st.left=pos.x;st.top=pos.y;st.right="auto";st.bottom="auto";}
  return <div ref={ref} style={st} onMouseDown={onDown} onTouchStart={onDown}>{props.children}</div>;
}

export { DragPanel };
