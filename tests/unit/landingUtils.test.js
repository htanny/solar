import { describe, it, expect } from "vitest";
import { terrainH, earthIsLand, getEarthBiome, BIOME_CONF } from "../../src/render/landingUtils.js";

describe("terrainH", function(){
  it("結果は 0 〜 1 の範囲に正規化される", function(){
    for(var i=0;i<200;i++){
      var v=terrainH(i*13.7,3);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("同じ入力なら同じ出力 (決定論的)", function(){
    expect(terrainH(100,5)).toBe(terrainH(100,5));
  });

  it("シードが異なれば結果も異なる", function(){
    expect(terrainH(100,5)).not.toBe(terrainH(100,7));
  });
});

describe("earthIsLand", function(){
  it("赤道直下の海(大西洋中央)は海", function(){
    expect(earthIsLand(0,-25)).toBe(false);
  });

  it("北米中央(緯度40N経度-100)は陸", function(){
    expect(earthIsLand(40,-100)).toBe(true);
  });

  it("南極(緯度-80)は陸", function(){
    expect(earthIsLand(-80,0)).toBe(true);
  });

  it("オーストラリア(緯度-25経度135)は陸", function(){
    expect(earthIsLand(-25,135)).toBe(true);
  });

  it("経度の正規化が効く(±360跨ぎ)", function(){
    expect(earthIsLand(40,-100)).toBe(earthIsLand(40,260));
  });
});

describe("getEarthBiome", function(){
  it("緯度>70は polar", function(){
    expect(getEarthBiome(75,0)).toBe("polar");
    expect(getEarthBiome(-75,0)).toBe("polar");
  });

  it("赤道のジャングル", function(){
    /* 赤道は陸か海か判定後にバイオーム決定。コンゴ盆地で確認 */
    expect(getEarthBiome(0,20)).toBe("jungle");
  });

  it("サハラ砂漠は desert", function(){
    expect(getEarthBiome(22,10)).toBe("desert");
  });

  it("海上は ocean", function(){
    expect(getEarthBiome(0,-25)).toBe("ocean");
  });

  it("BIOME_CONF にすべてのバイオームのエントリがある", function(){
    var biomes=["polar","tundra","taiga","temperate","desert","savanna","jungle","ocean"];
    biomes.forEach(function(b){
      expect(BIOME_CONF[b]).toBeDefined();
      expect(typeof BIOME_CONF[b].g).toBe("string");
    });
  });
});
