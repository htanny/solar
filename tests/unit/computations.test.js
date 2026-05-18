import { describe, it, expect } from "vitest";
import { initNBody, computeNightSky, computeMoonPhases, computeOrbElem } from "../../src/utils/computations.js";
import { PL, PL_MAP } from "../../src/data/solarData.js";

describe("computeOrbElem", function(){
  it("地球の長半径は約1 AU", function(){
    var oe=computeOrbElem(PL_MAP.Earth,0);
    expect(oe.a).toBeCloseTo(1.0,1);
  });

  it("ケプラー第3法則 a³/T² ≈ 1（AU・年）", function(){
    PL.forEach(function(pl){
      var oe=computeOrbElem(pl,1000);
      var ratio=Math.pow(oe.a,3)/Math.pow(oe.T/365.25,2);
      expect(ratio).toBeGreaterThan(0.95);
      expect(ratio).toBeLessThan(1.06);
    });
  });

  it("離心率 e は0以上1未満", function(){
    PL.forEach(function(pl){
      var oe=computeOrbElem(pl,0);
      expect(oe.e).toBeGreaterThanOrEqual(0);
      expect(oe.e).toBeLessThan(1);
    });
  });

  it("真近点角 ν と平均近点角 M は0..360°の範囲内", function(){
    var oe=computeOrbElem(PL_MAP.Mars,1234);
    expect(oe.M).toBeGreaterThanOrEqual(0);
    expect(oe.M).toBeLessThan(360);
    expect(oe.nu).toBeGreaterThanOrEqual(-180);
    expect(oe.nu).toBeLessThanOrEqual(360);
  });

  it("地球の軌道速度は約29.8 km/s", function(){
    var oe=computeOrbElem(PL_MAP.Earth,0);
    expect(oe.v).toBeGreaterThan(28);
    expect(oe.v).toBeLessThan(32);
  });
});

describe("computeMoonPhases", function(){
  it("4つの月相が連続して並ぶ", function(){
    var ph=computeMoonPhases(0);
    expect(ph.length).toBeGreaterThanOrEqual(16);
    var names=ph.slice(0,4).map(function(p){return p.name.slice(0,2);});
    expect(names).toContain("🌑");
    expect(names).toContain("🌓");
    expect(names).toContain("🌕");
    expect(names).toContain("🌗");
  });

  it("時刻 t が昇順にソートされる", function(){
    var ph=computeMoonPhases(100);
    for(var i=1;i<ph.length;i++){
      expect(ph[i].t).toBeGreaterThanOrEqual(ph[i-1].t);
    }
  });

  it("朔望月の周期は約29.5日", function(){
    var ph=computeMoonPhases(0).filter(function(p){return p.name.indexOf("🌑")===0;});
    if(ph.length>=2){
      expect(ph[1].t-ph[0].t).toBeCloseTo(29.53,1);
    }
  });
});

describe("computeNightSky", function(){
  it("夜と昼で isNight フラグが反転する", function(){
    var nightData=computeNightSky(0,35,135);
    var dayData=computeNightSky(0.5,35,135);
    expect(typeof nightData.isNight).toBe("boolean");
    expect(typeof dayData.isNight).toBe("boolean");
  });

  it("地球は items から除外されないが vis=false", function(){
    var nsd=computeNightSky(0,35,135);
    var earth=nsd.items.filter(function(it){return it.name==="地球";})[0];
    expect(earth).toBeDefined();
    expect(earth.vis).toBe(false);
  });

  it("太陽高度は −90° 〜 +90° の範囲内", function(){
    for(var t=0;t<2;t+=0.1){
      var nsd=computeNightSky(t,35,135);
      expect(nsd.sunAlt).toBeGreaterThanOrEqual(-90);
      expect(nsd.sunAlt).toBeLessThanOrEqual(90);
    }
  });

  it("緯度・経度を変えても items 配列の長さは同じ", function(){
    var a=computeNightSky(0,0,0);
    var b=computeNightSky(0,80,179);
    expect(a.items.length).toBe(b.items.length);
  });
});

describe("initNBody", function(){
  it("8惑星すべての初期状態を返す", function(){
    var st=initNBody(0);
    expect(st.length).toBe(8);
    st.forEach(function(s){
      expect(s.pl).toBeDefined();
      expect(typeof s.x).toBe("number");
      expect(typeof s.z).toBe("number");
      expect(typeof s.vx).toBe("number");
      expect(typeof s.vz).toBe("number");
      expect(s.m).toBeGreaterThan(0);
    });
  });

  it("地球の初期距離は1 AU近傍", function(){
    var st=initNBody(0);
    var earth=st.filter(function(s){return s.pl.n==="Earth";})[0];
    var r=Math.sqrt(earth.x*earth.x+earth.z*earth.z);
    expect(r).toBeCloseTo(1.0,1);
  });

  it("速度ベクトルは位置ベクトルに直交（円軌道近似）", function(){
    var st=initNBody(0);
    st.forEach(function(s){
      var dot=s.x*s.vx+s.z*s.vz;
      var rMag=Math.sqrt(s.x*s.x+s.z*s.z);
      var vMag=Math.sqrt(s.vx*s.vx+s.vz*s.vz);
      expect(Math.abs(dot)).toBeLessThan(rMag*vMag*0.01);
    });
  });
});
