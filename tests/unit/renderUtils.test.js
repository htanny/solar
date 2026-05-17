import { describe, it, expect } from "vitest";
import { RX, RY, pj, seedR, lerpColor } from "../../src/render/utils.js";

describe("RX / RY 軸回転", function(){
  it("RY 0度は恒等変換", function(){
    var p=RY([1,2,3],0);
    expect(p[0]).toBeCloseTo(1);
    expect(p[1]).toBe(2);
    expect(p[2]).toBeCloseTo(3);
  });

  it("RX 0度は恒等変換", function(){
    var p=RX([1,2,3],0);
    expect(p[0]).toBe(1);
    expect(p[1]).toBeCloseTo(2);
    expect(p[2]).toBeCloseTo(3);
  });

  it("RY π/2 は x→-z, z→x", function(){
    var p=RY([1,0,0],Math.PI/2);
    expect(p[0]).toBeCloseTo(0);
    expect(p[2]).toBeCloseTo(-1);
  });
});

describe("pj (3D→2D投影)", function(){
  it("カメラ原点・無回転で xz 平面はそのまま", function(){
    var cam={rx:0,ry:0,zm:1,fx:0,fy:0,fz:0};
    var r=pj(2,0,3,cam);
    expect(r.x).toBeCloseTo(2);
    expect(r.z).toBeCloseTo(3);
  });

  it("zm でスケールされる", function(){
    var cam={rx:0,ry:0,zm:2,fx:0,fy:0,fz:0};
    var r=pj(1,1,0,cam);
    expect(r.x).toBeCloseTo(2);
    expect(r.y).toBeCloseTo(2);
  });

  it("focus 座標(fx,fy,fz)が引かれる", function(){
    var cam={rx:0,ry:0,zm:1,fx:5,fy:0,fz:0};
    var r=pj(5,0,0,cam);
    expect(r.x).toBeCloseTo(0);
  });
});

describe("seedR (擬似乱数)", function(){
  it("結果は 0〜1 の範囲", function(){
    var r=seedR(42);
    for(var i=0;i<100;i++){
      var v=r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("同じシードなら同じ列を生成", function(){
    var r1=seedR(123),r2=seedR(123);
    for(var i=0;i<20;i++){
      expect(r1()).toBe(r2());
    }
  });

  it("異なるシードなら異なる列を生成", function(){
    var r1=seedR(1),r2=seedR(2);
    expect(r1()).not.toBe(r2());
  });
});

describe("lerpColor", function(){
  it("f=0 は a を返す", function(){
    expect(lerpColor("100,50,200","0,255,0",0)).toBe("100,50,200");
  });

  it("f=1 は b を返す", function(){
    expect(lerpColor("100,50,200","0,255,0",1)).toBe("0,255,0");
  });

  it("f=0.5 は中点", function(){
    expect(lerpColor("0,0,0","100,200,50",0.5)).toBe("50,100,25");
  });
});
