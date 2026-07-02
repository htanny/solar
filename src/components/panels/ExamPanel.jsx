import { useState } from "react";
import { DragPanel } from "../DragPanel.jsx";
import { mobileSheet, bClose } from "../../styles/panelStyles.js";

/* 受験対策パネル — 中学受験・中3理科の最頻出単元「月の満ち欠け」「金星の見え方」を
   軌道図(宇宙から見た図)と地球から見た形の対応で学ぶインタラクティブ図解。
   図は教科書標準の北極側から見た配置(太陽光は左から・公転は反時計回り)。 */

/* 月の8位置。ang=図上の角度(0°=右,反時計回り)。frac=輝面率, litLeft=地球から見て左側が光る,
   southH=南中時刻(時)。出=southH-6時, 入り=southH+6時 として地上ビューの位置計算に使う */
var MOON_POS=[
  {ang:180,j:"新月",e:"New Moon",frac:0,litLeft:false,southH:12,rise:"6時",south:"12時",set:"18時",
   pt:"太陽と同じ方向にあるため見えない。日食はこのとき起こる",
   ptE:"Invisible — same direction as the Sun. Solar eclipses occur at this phase"},
  {ang:225,j:"三日月",e:"Waxing Crescent",frac:0.25,litLeft:false,southH:15,rise:"9時ごろ",south:"15時ごろ",set:"21時ごろ",
   pt:"夕方、西の低い空に見える。右側が細く光る",
   ptE:"Low in the western sky at dusk. Thin sliver lit on the right"},
  {ang:270,j:"上弦の月",e:"First Quarter",frac:0.5,litLeft:false,southH:18,rise:"12時",south:"18時",set:"0時",
   pt:"夕方に南中し、右半分が光る。真夜中に西へ沈む",
   ptE:"Souths at dusk with the right half lit. Sets in the west at midnight"},
  {ang:315,j:"十三夜月",e:"Waxing Gibbous",frac:0.75,litLeft:false,southH:21,rise:"15時ごろ",south:"21時ごろ",set:"3時ごろ",
   pt:"満月の2日前ごろの月。夕方の東の空に昇る",
   ptE:"About two days before full. Rises in the east around dusk"},
  {ang:0,j:"満月",e:"Full Moon",frac:1,litLeft:false,southH:0,rise:"18時",south:"0時",set:"6時",
   pt:"日没に東から昇り、真夜中に南中する。月食はこのとき起こる",
   ptE:"Rises at sunset, souths at midnight. Lunar eclipses occur at this phase"},
  {ang:45,j:"居待月",e:"Waning Gibbous",frac:0.75,litLeft:true,southH:3,rise:"21時ごろ",south:"3時ごろ",set:"9時ごろ",
   pt:"満月の2〜3日後。夜遅くに昇り朝まで見える",
   ptE:"A few days after full. Rises late at night, visible until morning"},
  {ang:90,j:"下弦の月",e:"Last Quarter",frac:0.5,litLeft:true,southH:6,rise:"0時",south:"6時",set:"12時",
   pt:"明け方に南中し、左半分が光る。昼に西へ沈む",
   ptE:"Souths at dawn with the left half lit. Sets in the west around noon"},
  {ang:135,j:"有明月",e:"Waning Crescent",frac:0.25,litLeft:true,southH:9,rise:"3時ごろ",south:"9時ごろ",set:"15時ごろ",
   pt:"明け方、東の低い空に見える。左側が細く光る",
   ptE:"Low in the eastern sky at dawn. Thin sliver lit on the left"},
];

/* 金星の8位置(太陽中心・地球は図の下端固定)。size=見かけの大きさの相対値,
   gv=地上ビューの空("e"=明け方東/"w"=夕方西/null=見えない), vAlt=地平線からの高さ(0〜1, 離角に比例) */
var VENUS_POS=[
  {ang:270,j:"内合",e:"Inferior conjunction",frac:0.02,litLeft:false,size:30,gv:null,vAlt:0,when:"見えない",whenE:"Not visible",
   pt:"地球に最も近いが、太陽と同じ方向にあるため見えない",
   ptE:"Closest to Earth but hidden in the Sun's glare"},
  {ang:315,j:"明けの明星（内合前後）",e:"Morning star (near inferior conj.)",frac:0.2,litLeft:true,size:24,gv:"e",vAlt:0.75,when:"明け方・東の空",whenE:"Dawn · eastern sky",
   pt:"大きく欠けた細い三日月形。見かけの大きさは最大級",
   ptE:"Large thin crescent — near its maximum apparent size"},
  {ang:0,j:"西方最大離角",e:"Greatest western elongation",frac:0.5,litLeft:true,size:16,gv:"e",vAlt:1,when:"明け方・東の空",whenE:"Dawn · eastern sky",
   pt:"明けの明星として最も高く見える。半月形に見える",
   ptE:"Highest as the morning star. Appears half-lit"},
  {ang:45,j:"明けの明星（外合前）",e:"Morning star (approaching superior conj.)",frac:0.8,litLeft:true,size:12,gv:"e",vAlt:0.5,when:"明け方・東の空",whenE:"Dawn · eastern sky",
   pt:"丸に近い形だが、遠いため小さく見える",
   ptE:"Nearly round but small — far from Earth"},
  {ang:90,j:"外合",e:"Superior conjunction",frac:1,litLeft:false,size:10,gv:null,vAlt:0,when:"見えない",whenE:"Not visible",
   pt:"太陽の向こう側にあり見えない。最も小さく丸い",
   ptE:"Behind the Sun — smallest and fully lit"},
  {ang:135,j:"宵の明星（外合後）",e:"Evening star (after superior conj.)",frac:0.8,litLeft:false,size:12,gv:"w",vAlt:0.5,when:"夕方・西の空",whenE:"Dusk · western sky",
   pt:"丸に近い小さな形。日がたつにつれ大きく欠けていく",
   ptE:"Small and nearly round; grows larger and thinner over time"},
  {ang:180,j:"東方最大離角",e:"Greatest eastern elongation",frac:0.5,litLeft:false,size:16,gv:"w",vAlt:1,when:"夕方・西の空",whenE:"Dusk · western sky",
   pt:"宵の明星として最も高く見える。半月形に見える",
   ptE:"Highest as the evening star. Appears half-lit"},
  {ang:225,j:"宵の明星（内合前）",e:"Evening star (near inferior conj.)",frac:0.2,litLeft:false,size:24,gv:"w",vAlt:0.75,when:"夕方・西の空",whenE:"Dusk · western sky",
   pt:"内合が近づくにつれ大きく細い三日月形になる",
   ptE:"Becomes a large thin crescent as inferior conjunction nears"},
];

/* 地上ビュー共通: 夜空の星(固定配置) */
var GV_STARS=[[18,18],[52,34],[88,12],[128,28],[168,16],[205,38],[242,14],[278,30],[38,52],[112,48],[190,55],[262,50],[75,60],[225,62]];

/* c1→c2 を f(0..1) で線形補間した "r,g,b" 文字列 */
function mixRGB(c1,c2,f){
  return Math.round(c1[0]+(c2[0]-c1[0])*f)+","+Math.round(c1[1]+(c2[1]-c1[1])*f)+","+Math.round(c1[2]+(c2[2]-c1[2])*f);
}

/* 輝面率fracの月・金星をSVGパスで描く。litLeft=左側が光る。戻り値: null=全暗, "full"=全灯 */
function phasePath(cx,cy,r,frac,litLeft){
  if(frac<=0.03)return null;
  if(frac>=0.97)return "full";
  var k=(Math.abs(2*frac-1)*r).toFixed(1);
  var top=(cy-r).toFixed(1),bot=(cy+r).toFixed(1);
  var outerSweep=litLeft?0:1;
  var termSweep=litLeft?(frac<0.5?1:0):(frac<0.5?0:1);
  return "M "+cx+" "+top+" A "+r+" "+r+" 0 0 "+outerSweep+" "+cx+" "+bot+" A "+k+" "+r+" 0 0 "+termSweep+" "+cx+" "+top;
}

/* 位相円(暗面+輝面)を返す共通描画 */
function PhaseDisc({cx,cy,r,frac,litLeft,dark,lit,stroke}){
  var p=phasePath(cx,cy,r,frac,litLeft);
  return <g>
    <circle cx={cx} cy={cy} r={r} fill={dark} stroke={stroke||"none"} strokeWidth={0.6}/>
    {p==="full"?<circle cx={cx} cy={cy} r={r} fill={lit}/>:p?<path d={p} fill={lit}/>:null}
  </g>;
}

var JP_LABELS=["ア","イ","ウ","エ","オ","カ","キ","ク"];

export default function ExamPanel({visible,dispatchPanel,lang,isPhone,pn,bF,bT}){
  var[tab,setTab]=useState("moon");
  var[selM,setSelM]=useState(2);/* 上弦 */
  var[selV,setSelV]=useState(6);/* 東方最大離角 */
  var[hh,setHH]=useState(18);/* 地上ビューの時刻(0-23時) */
  if(!visible)return null;
  var en=lang==="en";
  var deg2rad=Math.PI/180;
  /* 月を選ぶと南中時刻へジャンプ(すぐ見える状態にする) */
  var pickMoon=function(i){setSelM(i);setHH(MOON_POS[i].southH);};

  /* ===== 月タブ: 軌道図 ===== */
  var moonSvg=(function(){
    var W=300,H=225,ex=170,ey=112,R=76;
    var m=MOON_POS[selM];
    return <svg width="100%" viewBox={"0 0 "+W+" "+H} style={{display:"block",background:"rgba(0,0,0,0.35)",borderRadius:6}}>
      {/* 太陽光(左から) */}
      {[0.28,0.5,0.72].map(function(f,i){return <g key={i}>
        <line x1={4} y1={H*f} x2={44} y2={H*f} stroke="rgba(255,210,80,0.75)" strokeWidth={1.4}/>
        <path d={"M "+(44)+" "+(H*f)+" l -6 -3.4 l 0 6.8 Z"} fill="rgba(255,210,80,0.75)"/>
      </g>;})}
      <text x={6} y={H*0.20} fill="rgba(255,210,80,0.85)" fontSize={9}>{en?"Sunlight":"太陽の光"}</text>
      {/* 月の公転軌道 */}
      <circle cx={ex} cy={ey} r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={0.8} strokeDasharray="3 3"/>
      {/* 公転の向き(反時計回り)矢印 */}
      <path d={"M "+(ex-R*0.62)+" "+(ey-R*0.86)+" A "+R*1.06+" "+R*1.06+" 0 0 0 "+(ex-R*0.92)+" "+(ey-R*0.52)} fill="none" stroke="rgba(140,200,255,0.6)" strokeWidth={1.2}/>
      <path d={"M "+(ex-R*0.92)+" "+(ey-R*0.52)+" l 1.2 -7 l 5.6 4.4 Z"} fill="rgba(140,200,255,0.6)"/>
      <text x={ex-R*1.02} y={ey-R*1.02} fill="rgba(140,200,255,0.7)" fontSize={8}>{en?"orbit direction":"公転の向き"}</text>
      {/* 地球(右半分が夜) */}
      <circle cx={ex} cy={ey} r={13} fill="rgba(70,130,230,1)"/>
      <path d={"M "+ex+" "+(ey-13)+" A 13 13 0 0 1 "+ex+" "+(ey+13)+" Z"} fill="rgba(0,0,20,0.55)"/>
      <text x={ex} y={ey+24} fill="rgba(160,200,255,0.9)" fontSize={9} textAnchor="middle">{en?"Earth":"地球"}</text>
      {/* 8つの月(向かって左半分=太陽側が常に光る) */}
      {MOON_POS.map(function(mp,i){
        var mx=ex+R*Math.cos(mp.ang*deg2rad),my=ey-R*Math.sin(mp.ang*deg2rad);
        var isSel=i===selM;
        return <g key={i} style={{cursor:"pointer"}} onClick={function(){pickMoon(i);}}>
          {isSel&&<circle cx={mx} cy={my} r={14} fill="none" stroke="rgba(255,220,80,0.9)" strokeWidth={1.6}/>}
          <circle cx={mx} cy={my} r={9} fill="rgba(30,30,38,1)"/>
          <path d={"M "+mx+" "+(my-9)+" A 9 9 0 0 0 "+mx+" "+(my+9)+" Z"} fill="rgba(235,230,215,1)"/>
          <circle cx={mx} cy={my} r={9} fill="rgba(0,0,0,0)" stroke={isSel?"none":"rgba(255,255,255,0.25)"} strokeWidth={0.6}/>
          <text x={mx+(mx>ex?15:-15)} y={my+3.5} fill={isSel?"rgba(255,220,80,1)":"rgba(255,255,255,0.55)"} fontSize={10} fontWeight={isSel?"bold":"normal"} textAnchor="middle">{en?String.fromCharCode(65+i):JP_LABELS[i]}</text>
        </g>;
      })}
    </svg>;
  })();

  /* ===== 金星タブ: 軌道図 ===== */
  var venusSvg=(function(){
    var W=300,H=235,sx=150,sy=95,R=52,gx=150,gy=205;
    var v=VENUS_POS[selV];
    var vx=sx+R*Math.cos(v.ang*deg2rad),vy=sy-R*Math.sin(v.ang*deg2rad);
    return <svg width="100%" viewBox={"0 0 "+W+" "+H} style={{display:"block",background:"rgba(0,0,0,0.35)",borderRadius:6}}>
      {/* 地球の公転軌道の一部 */}
      <path d={"M 20 "+(gy-24)+" Q "+gx+" "+(gy+26)+" "+(W-20)+" "+(gy-24)} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={0.8} strokeDasharray="3 3"/>
      {/* 太陽 */}
      <circle cx={sx} cy={sy} r={13} fill="rgba(255,200,60,1)"/>
      {[0,45,90,135,180,225,270,315].map(function(a,i){return <line key={i} x1={sx+16*Math.cos(a*deg2rad)} y1={sy-16*Math.sin(a*deg2rad)} x2={sx+21*Math.cos(a*deg2rad)} y2={sy-21*Math.sin(a*deg2rad)} stroke="rgba(255,210,80,0.6)" strokeWidth={1.2}/>;})}
      <text x={sx} y={sy-24} fill="rgba(255,210,80,0.9)" fontSize={9} textAnchor="middle">{en?"Sun":"太陽"}</text>
      {/* 金星の公転軌道 */}
      <circle cx={sx} cy={sy} r={R} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={0.8} strokeDasharray="3 3"/>
      {/* 明星ゾーンのラベル */}
      <text x={sx-R-8} y={sy+4} fill="rgba(255,170,120,0.6)" fontSize={8} textAnchor="end">{en?"evening ↓":"宵の明星側"}</text>
      <text x={sx+R+8} y={sy+4} fill="rgba(150,210,255,0.6)" fontSize={8}>{en?"↓ morning":"明けの明星側"}</text>
      {/* 地球(上半分=太陽側が昼) */}
      <circle cx={gx} cy={gy} r={10} fill="rgba(70,130,230,1)"/>
      <path d={"M "+(gx-10)+" "+gy+" A 10 10 0 0 0 "+(gx+10)+" "+gy+" Z"} fill="rgba(0,0,20,0.55)"/>
      <text x={gx+16} y={gy+4} fill="rgba(160,200,255,0.9)" fontSize={9}>{en?"Earth":"地球"}</text>
      {/* 地球→選択金星への視線 */}
      <line x1={gx} y1={gy-4} x2={vx} y2={vy} stroke="rgba(255,220,80,0.45)" strokeWidth={1} strokeDasharray="4 3"/>
      {/* 8つの金星(太陽側=中心向きが常に光る) */}
      {VENUS_POS.map(function(vp,i){
        var px=sx+R*Math.cos(vp.ang*deg2rad),py=sy-R*Math.sin(vp.ang*deg2rad);
        var isSel=i===selV;
        /* 太陽方向へ光る半円: 太陽向きベクトル角度 */
        var toSun=Math.atan2(py-sy,px-sx);/* SVG座標系での太陽→金星角。光る側は逆向き */
        var a1x=px+7*Math.cos(toSun+Math.PI/2),a1y=py+7*Math.sin(toSun+Math.PI/2);
        var a2x=px+7*Math.cos(toSun-Math.PI/2),a2y=py+7*Math.sin(toSun-Math.PI/2);
        return <g key={i} style={{cursor:"pointer"}} onClick={function(){setSelV(i);}}>
          {isSel&&<circle cx={px} cy={py} r={11.5} fill="none" stroke="rgba(255,220,80,0.9)" strokeWidth={1.5}/>}
          <circle cx={px} cy={py} r={7} fill="rgba(40,32,28,1)"/>
          <path d={"M "+a1x.toFixed(1)+" "+a1y.toFixed(1)+" A 7 7 0 0 1 "+a2x.toFixed(1)+" "+a2y.toFixed(1)+" Z"} fill="rgba(240,215,160,1)"/>
          <circle cx={px} cy={py} r={7} fill="rgba(0,0,0,0)" stroke={isSel?"none":"rgba(255,255,255,0.25)"} strokeWidth={0.6}/>
          <text x={px+(px>sx?13:px<sx?-13:0)} y={py+(py<sy?-11:py>sy+R-6?14:4)} fill={isSel?"rgba(255,220,80,1)":"rgba(255,255,255,0.55)"} fontSize={10} fontWeight={isSel?"bold":"normal"} textAnchor="middle">{en?String.fromCharCode(65+i):JP_LABELS[i]}</text>
        </g>;
      })}
    </svg>;
  })();

  var m=MOON_POS[selM],v=VENUS_POS[selV];
  var rowS={display:"flex",justifyContent:"space-between",fontSize:10,padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.07)"};
  var kS={color:"rgba(255,255,255,0.5)"},vS={color:"rgba(255,255,255,0.92)",fontWeight:"bold"};

  /* ===== 月タブ: 地上から見た空(南向き・東→南→西) ===== */
  var moonGround=(function(){
    var W=300,H=128,hy=98;
    /* 太陽: 6時出・12時南中・18時入り */
    var sunHA=((hh-12+36)%24)-12,sunUp=Math.abs(sunHA)<=6;
    var sunF=(sunHA+6)/12,sunAltN=sunUp?Math.sin(Math.PI*sunF):0;
    var dayF=sunUp?Math.min(1,sunAltN*2.5):0;
    var twiF=sunUp?Math.max(0,1-sunAltN*4):Math.max(0,1-(Math.abs(sunHA)-6)/1.5);
    var skyTop=mixRGB([4,6,20],[80,150,240],dayF);
    var skyBot=mixRGB(
      [8+Math.round(232*twiF*0.7),12+Math.round(128*twiF*0.7),35+Math.round(25*twiF*0.7)],
      [150,200,255],dayF);
    /* 月: southH で位置決め */
    var mHA=((hh-m.southH+36)%24)-12,mUp=Math.abs(mHA)<=6;
    var mF=(mHA+6)/12,mx=20+mF*(W-40),my=hy-Math.sin(Math.PI*mF)*68;
    var dirs=en?["E","SE","S","SW","W"]:["東","南東","南","南西","西"];
    var mDir=mF<0.15?dirs[0]:mF<0.35?dirs[1]:mF<0.65?dirs[2]:mF<0.85?dirs[3]:dirs[4];
    var gid="gvMoonSky";
    return {dir:mDir,up:mUp,svg:<svg width="100%" viewBox={"0 0 "+W+" "+H} style={{display:"block",borderRadius:6}}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={"rgb("+skyTop+")"}/><stop offset="100%" stopColor={"rgb("+skyBot+")"}/>
      </linearGradient></defs>
      <rect x={0} y={0} width={W} height={hy} fill={"url(#"+gid+")"}/>
      {dayF<0.25&&GV_STARS.map(function(s,i){return <rect key={i} x={s[0]} y={s[1]} width={1.2} height={1.2} fill={"rgba(255,255,255,"+(0.7*(1-dayF*4)).toFixed(2)+")"}/>;})}
      {/* 太陽 */}
      {sunUp&&<g><circle cx={20+sunF*(W-40)} cy={hy-sunAltN*68} r={9} fill="rgba(255,210,70,1)"/>
        <circle cx={20+sunF*(W-40)} cy={hy-sunAltN*68} r={14} fill="rgba(255,210,70,0.25)"/></g>}
      {/* 月(位相つき) */}
      {mUp?<g>
        <PhaseDisc cx={mx} cy={my} r={10} frac={m.frac} litLeft={m.litLeft} dark="rgba(35,38,52,1)" lit="rgba(245,240,225,1)" stroke="rgba(255,255,255,0.35)"/>
        <line x1={mx} y1={my+13} x2={mx} y2={hy} stroke="rgba(255,220,80,0.35)" strokeWidth={1} strokeDasharray="2 3"/>
      </g>:<text x={W/2} y={hy-38} fill="rgba(255,255,255,0.55)" fontSize={10} textAnchor="middle">{en?"Moon below horizon":"月は地平線の下（見えない）"}</text>}
      {/* 地面と方角 */}
      <rect x={0} y={hy} width={W} height={H-hy} fill="rgba(28,34,26,1)"/>
      <line x1={0} y1={hy} x2={W} y2={hy} stroke="rgba(255,255,255,0.35)" strokeWidth={1}/>
      {[0,0.25,0.5,0.75,1].map(function(f,i){return <text key={i} x={20+f*(W-40)} y={hy+16} fill={i===2?"rgba(255,220,120,0.9)":"rgba(255,255,255,0.55)"} fontSize={10} fontWeight={i===2?"bold":"normal"} textAnchor="middle">{dirs[i]}</text>;})}
      <text x={W-6} y={12} fill="rgba(255,255,255,0.6)" fontSize={10} textAnchor="end">{hh+(en?":00":"時")}</text>
    </svg>};
  })();

  /* ===== 金星タブ: 地上から見た空(明け方東 or 夕方西) ===== */
  var venusGround=(function(){
    var W=300,H=110,hy=82;
    var side=v.gv;/* "e"|"w"|null */
    var gid2="gvVenusSky";
    /* 薄明の空: 太陽が沈んだ側の地平線が橙に染まる */
    var glowX=side==="w"?W-30:30;
    var vx=side==="w"?W-62:62,vy=hy-8-v.vAlt*52;
    var dirs=en?["E","S","W"]:["東","南","西"];
    return <svg width="100%" viewBox={"0 0 "+W+" "+H} style={{display:"block",borderRadius:6}}>
      <defs>
        <linearGradient id={gid2} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(6,8,26)"/><stop offset="100%" stopColor="rgb(40,34,60)"/>
        </linearGradient>
        <radialGradient id="gvGlow" cx="50%" cy="100%" r="100%">
          <stop offset="0%" stopColor="rgba(250,150,60,0.55)"/><stop offset="100%" stopColor="rgba(250,150,60,0)"/>
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={W} height={hy} fill={"url(#"+gid2+")"}/>
      {GV_STARS.slice(0,9).map(function(s,i){return <rect key={i} x={s[0]} y={s[1]*0.8} width={1.2} height={1.2} fill="rgba(255,255,255,0.6)"/>;})}
      {side&&<ellipse cx={glowX} cy={hy} rx={90} ry={38} fill="url(#gvGlow)"/>}
      {side
        ?<g>
          <PhaseDisc cx={vx} cy={vy} r={Math.max(3.5,v.size*0.35)} frac={v.frac} litLeft={v.litLeft} dark="rgba(40,34,30,1)" lit="rgba(250,228,175,1)" stroke="rgba(255,255,255,0.3)"/>
          <line x1={vx} y1={vy+Math.max(3.5,v.size*0.35)+4} x2={vx} y2={hy} stroke="rgba(255,220,80,0.3)" strokeWidth={1} strokeDasharray="2 3"/>
          <text x={vx} y={vy-Math.max(3.5,v.size*0.35)-6} fill="rgba(255,230,160,0.9)" fontSize={9} textAnchor="middle">{en?"Venus":"金星"}</text>
          <text x={side==="w"?W-8:8} y={hy-4} fill="rgba(255,180,90,0.8)" fontSize={8} textAnchor={side==="w"?"end":"start"}>{side==="w"?(en?"sun just set ↓":"↓太陽は沈んだ直後"):(en?"sun about to rise ↓":"↓太陽が昇る直前")}</text>
        </g>
        :<text x={W/2} y={hy-32} fill="rgba(255,255,255,0.55)" fontSize={10} textAnchor="middle">{en?"Not visible — same direction as the Sun":"太陽と同じ方向のため見えない"}</text>}
      <rect x={0} y={hy} width={W} height={H-hy} fill="rgba(28,34,26,1)"/>
      <line x1={0} y1={hy} x2={W} y2={hy} stroke="rgba(255,255,255,0.35)" strokeWidth={1}/>
      {[0,0.5,1].map(function(f,i){return <text key={i} x={20+f*(W-40)} y={hy+16} fill="rgba(255,255,255,0.55)" fontSize={10} textAnchor="middle">{dirs[i]}</text>;})}
      <text x={W-6} y={12} fill="rgba(255,255,255,0.6)" fontSize={10} textAnchor="end">{side==="w"?(en?"~7 PM":"19時ごろ"):side==="e"?(en?"~5 AM":"5時ごろ"):""}</text>
    </svg>;
  })();

  return <DragPanel style={Object.assign({},pn,{top:10,right:10,left:"auto",width:340,maxWidth:"calc(100vw - 20px)",maxHeight:"calc(100dvh - 100px)",overflowY:"auto",padding:"12px 14px",zIndex:26},mobileSheet(isPhone))}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <span style={{fontSize:12,fontWeight:"bold",color:"rgba(255,160,200,0.95)"}}>{en?"📖 Exam Prep":"📖 受験対策"}</span>
      <button aria-label={en?"Close":"閉じる"} style={bClose} onClick={function(){dispatchPanel({type:"TOGGLE",key:"examOpen"});}}>✕</button>
    </div>
    <div style={{display:"flex",gap:4,marginBottom:8}}>
      <button style={Object.assign({},tab==="moon"?bT("255,220,120"):bF,{flex:1,padding:"5px 0",fontSize:11})} onClick={function(){setTab("moon");}}>{en?"🌙 Moon Phases":"🌙 月の満ち欠け"}</button>
      <button style={Object.assign({},tab==="venus"?bT("255,190,130"):bF,{flex:1,padding:"5px 0",fontSize:11})} onClick={function(){setTab("venus");}}>{en?"✨ Venus":"✨ 金星の見え方"}</button>
    </div>

    {tab==="moon"?<div>
      <div style={{fontSize:9,color:"rgba(255,255,255,0.55)",marginBottom:6}}>{en?"Click a moon position (A–H). North-pole view — each moon's Sun side is always lit; the shape seen from Earth changes.":"月の位置(ア〜ク)をクリック。北極側から見た図 — どの位置でも太陽側の半分が光り、地球から見える形だけが変わる。"}</div>
      {moonSvg}
      <div style={{display:"flex",gap:10,marginTop:8,alignItems:"center"}}>
        <svg width={54} height={54} viewBox="0 0 54 54" style={{flexShrink:0,background:"rgba(0,0,0,0.4)",borderRadius:6}}>
          <PhaseDisc cx={27} cy={27} r={20} frac={m.frac} litLeft={m.litLeft} dark="rgba(28,28,36,1)" lit="rgba(240,235,220,1)" stroke="rgba(255,255,255,0.2)"/>
        </svg>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:"bold",color:"rgba(255,220,80,0.95)",marginBottom:3}}>{(en?String.fromCharCode(65+selM):JP_LABELS[selM])+" : "+(en?m.e:m.j)}</div>
          <div style={rowS}><span style={kS}>{en?"Moonrise":"月の出"}</span><span style={vS}>{m.rise}</span></div>
          <div style={rowS}><span style={kS}>{en?"Souths (highest)":"南中"}</span><span style={vS}>{m.south}</span></div>
          <div style={rowS}><span style={kS}>{en?"Moonset":"月の入り"}</span><span style={vS}>{m.set}</span></div>
        </div>
      </div>
      <div style={{marginTop:6,fontSize:10,lineHeight:"15px",color:"rgba(150,220,180,0.9)"}}>💡 {en?m.ptE:m.pt}</div>
      {/* 地上から見た空 + 時刻スライダー */}
      <div style={{marginTop:8,fontSize:10,fontWeight:"bold",color:"rgba(180,220,255,0.9)"}}>
        {en?"⛰ Sky view (facing south)":"⛰ 地上から見た空（南向き）"}
        <span style={{marginLeft:6,fontWeight:"normal",color:"rgba(255,220,120,0.95)"}}>
          {hh+(en?":00 — ":"時 — ")+(en?m.e:m.j)+(moonGround.up?(en?" in the "+moonGround.dir:" は「"+moonGround.dir+"」の空"):(en?" below horizon":" は地平線の下"))}
        </span>
      </div>
      <div style={{marginTop:4}}>{moonGround.svg}</div>
      <input type="range" min={0} max={23} step={1} value={hh} onChange={function(e){setHH(parseInt(e.target.value,10));}} style={{width:"100%",marginTop:4,height:isPhone?26:16}}/>
      <div style={{display:"flex",gap:4,marginTop:2}}>
        {[{h:6,l:"明け方6時",le:"6 AM"},{h:12,l:"正午",le:"Noon"},{h:18,l:"夕方18時",le:"6 PM"},{h:0,l:"真夜中0時",le:"Midnight"}].map(function(b){
          return <button key={b.h} style={Object.assign({},hh===b.h?bT("180,220,255"):bF,{flex:1,fontSize:9,padding:"3px 0"})} onClick={function(){setHH(b.h);}}>{en?b.le:b.l}</button>;
        })}
      </div>
      <div style={{marginTop:8,padding:"6px 8px",background:"rgba(255,160,200,0.08)",border:"1px solid rgba(255,160,200,0.25)",borderRadius:5,fontSize:9,lineHeight:"14px",color:"rgba(255,255,255,0.75)"}}>
        <b style={{color:"rgba(255,180,210,0.95)"}}>{en?"Exam points":"入試の鉄則"}</b><br/>
        {en?"· Rise/south/set shift ~50 min later each day":"・月の出は毎日約50分ずつ遅くなる"}<br/>
        {en?"· Solar eclipse = new moon / lunar eclipse = full moon":"・日食は新月のとき、月食は満月のとき"}<br/>
        {en?"· First quarter souths at dusk, last quarter at dawn":"・上弦は夕方に南中、下弦は明け方に南中"}
      </div>
    </div>:<div>
      <div style={{fontSize:9,color:"rgba(255,255,255,0.55)",marginBottom:6}}>{en?"Click a Venus position (A–H). Venus orbits inside Earth's orbit, so it is never visible at midnight.":"金星の位置(ア〜ク)をクリック。金星は地球より内側を公転するため、真夜中には決して見えない。"}</div>
      {venusSvg}
      <div style={{display:"flex",gap:10,marginTop:8,alignItems:"center"}}>
        <svg width={54} height={54} viewBox="0 0 54 54" style={{flexShrink:0,background:"rgba(0,0,0,0.4)",borderRadius:6}}>
          {v.frac<=0.03
            ?<g><circle cx={27} cy={27} r={v.size*0.62} fill="rgba(35,30,28,1)" stroke="rgba(255,255,255,0.25)" strokeWidth={0.8}/><text x={27} y={31} fill="rgba(255,255,255,0.4)" fontSize={8} textAnchor="middle">{en?"—":"✕"}</text></g>
            :<PhaseDisc cx={27} cy={27} r={v.size*0.62} frac={v.frac} litLeft={v.litLeft} dark="rgba(40,32,28,1)" lit="rgba(245,222,170,1)" stroke="rgba(255,255,255,0.2)"/>}
        </svg>
        <div style={{flex:1}}>
          <div style={{fontSize:11,fontWeight:"bold",color:"rgba(255,220,80,0.95)",marginBottom:3}}>{(en?String.fromCharCode(65+selV):JP_LABELS[selV])+" : "+(en?v.e:v.j)}</div>
          <div style={rowS}><span style={kS}>{en?"Visible":"見える時間帯"}</span><span style={vS}>{en?v.whenE:v.when}</span></div>
          <div style={rowS}><span style={kS}>{en?"Apparent size":"見かけの大きさ"}</span><span style={vS}>{"●".repeat(Math.round(v.size/10))||"·"}</span></div>
        </div>
      </div>
      <div style={{marginTop:6,fontSize:10,lineHeight:"15px",color:"rgba(150,220,180,0.9)"}}>💡 {en?v.ptE:v.pt}</div>
      {/* 地上から見た空 */}
      <div style={{marginTop:8,fontSize:10,fontWeight:"bold",color:"rgba(180,220,255,0.9)"}}>
        {en?"⛰ Sky view":"⛰ 地上から見た空"}
        <span style={{marginLeft:6,fontWeight:"normal",color:"rgba(255,220,120,0.95)"}}>{en?v.whenE:v.when}</span>
      </div>
      <div style={{marginTop:4}}>{venusGround}</div>
      <div style={{marginTop:8,padding:"6px 8px",background:"rgba(255,160,200,0.08)",border:"1px solid rgba(255,160,200,0.25)",borderRadius:5,fontSize:9,lineHeight:"14px",color:"rgba(255,255,255,0.75)"}}>
        <b style={{color:"rgba(255,180,210,0.95)"}}>{en?"Exam points":"入試の鉄則"}</b><br/>
        {en?"· Never visible at midnight (inner planet)":"・内惑星なので真夜中には見えない"}<br/>
        {en?"· Closer to Earth → larger & thinner crescent":"・地球に近づくほど大きく・細く見える"}<br/>
        {en?"· Evening star: west at dusk / morning star: east at dawn":"・宵の明星=夕方西の空、明けの明星=明け方東の空"}
      </div>
    </div>}
  </DragPanel>;
}
