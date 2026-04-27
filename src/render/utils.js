import { TAU, SRR, DK, SK, MD } from "../data/solarData.js";

export function oR(p,rd,un){if(un||rd)return p.d*DK;var v=p.d;if(v<=228)return 40+(v/228)*120;return 160+Math.pow((v-228)/4267,0.55)*280;}
export function pRf(p,rp,un){if(un)return Math.max((p.r/1000)*DK,0.0001);if(rp)return Math.max(p.r*SK,0.7);if(p.r>50)return 10+(p.r-50)*0.06;if(p.r>20)return 6+(p.r-20)*0.12;return 3+p.r*0.4;}
export function sRf(rs,un){if(un)return(SRR/1000)*DK;if(rs)return SRR*SK;return 18;}
export function mOf(rd,un){if(un)return MD.rd*DK;if(rd)return MD.rd*1000*DK;return MD.oR;}
export function mRf(rp,un){if(un)return Math.max((MD.rr/1000)*DK,0.0001);if(rp)return Math.max(MD.rr*SK,0.5);return MD.r;}

export function RY(p,a){var c=Math.cos(a),s=Math.sin(a);return[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];}
export function RX(p,a){var c=Math.cos(a),s=Math.sin(a);return[p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c];}
export function pj(x,y,z,c){var p=RX(RY([x-c.fx,y-c.fy,z-c.fz],c.ry),c.rx);return{x:p[0]*c.zm,y:p[1]*c.zm,z:p[2]};}

export function clipCirc(ctx,cx,cy,r){ctx.beginPath();ctx.arc(cx,cy,Math.max(r,0.1),0,TAU);ctx.closePath();}
export function fillCirc(ctx,cx,cy,r,f){ctx.beginPath();ctx.arc(cx,cy,Math.max(r,0.1),0,TAU);ctx.fillStyle=f;ctx.fill();}
export function sphereShade(ctx,cx,cy,r){var g=ctx.createRadialGradient(cx-r*0.25,cy-r*0.25,r*0.1,cx,cy,r);g.addColorStop(0,"rgba(255,255,255,0.12)");g.addColorStop(0.5,"rgba(255,255,255,0)");g.addColorStop(1,"rgba(0,0,0,0.15)");ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fillStyle=g;ctx.fill();}
export function limbDarken(ctx,cx,cy,r,i){var g=ctx.createRadialGradient(cx,cy,r*0.3,cx,cy,r);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(0.7,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,"+(i||0.35)+")");ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fillStyle=g;ctx.fill();}
export function atmosGlow(ctx,cx,cy,r,col,w){var g=ctx.createRadialGradient(cx,cy,r*(1-w),cx,cy,r*1.08);g.addColorStop(0,"rgba("+col+",0)");g.addColorStop(0.5,"rgba("+col+",0.08)");g.addColorStop(1,"rgba("+col+",0)");ctx.fillStyle=g;ctx.fillRect(cx-r*1.1,cy-r*1.1,r*2.2,r*2.2);}
export function dC(ctx,cx,cy,r,f){if(r<0.3){ctx.fillStyle=f;ctx.fillRect(cx-0.5,cy-0.5,1,1);return;}fillCirc(ctx,cx,cy,r,f);}

export function seedR(s){var v=s;return function(){v=(v*16807)%2147483647;return(v-1)/2147483646;};}
export function lerpColor(a,b,f){var pa=a.split(",").map(Number),pb=b.split(",").map(Number);return Math.round(pa[0]+(pb[0]-pa[0])*f)+","+Math.round(pa[1]+(pb[1]-pa[1])*f)+","+Math.round(pa[2]+(pb[2]-pa[2])*f);}
