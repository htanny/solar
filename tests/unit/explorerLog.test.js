import { describe, it, expect } from "vitest";
import { EXPLORER_GROUPS, ALL_BODIES, BADGES, getVisitedMap, computeBadges, nextGoal } from "../../src/utils/explorerLog.js";

describe("EXPLORER_GROUPS / ALL_BODIES", function(){
  it("全エントリが k/j/e を持つ", function(){
    ALL_BODIES.forEach(function(b){
      expect(typeof b.k).toBe("string");
      expect(typeof b.j).toBe("string");
      expect(typeof b.e).toBe("string");
    });
  });

  it("天体キーに重複がない", function(){
    var keys=ALL_BODIES.map(function(b){return b.k;});
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("着陸可能な29天体を網羅している", function(){
    expect(ALL_BODIES.length).toBe(29);
  });
});

describe("BADGES", function(){
  it("need のキーはすべて ALL_BODIES に存在する", function(){
    var valid={};
    ALL_BODIES.forEach(function(b){valid[b.k]=1;});
    BADGES.forEach(function(bd){
      (bd.need||[]).forEach(function(k){
        expect(valid[k],bd.id+" references unknown body "+k).toBe(1);
      });
    });
  });

  it("バッジ id に重複がない", function(){
    var ids=BADGES.map(function(b){return b.id;});
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("computeBadges", function(){
  it("未訪問なら獲得バッジ 0", function(){
    var res=computeBadges({});
    expect(res.filter(function(r){return r.earned;}).length).toBe(0);
  });

  it("全訪問なら全バッジ獲得", function(){
    var all={};
    ALL_BODIES.forEach(function(b){all[b.k]=1;});
    var res=computeBadges(all);
    expect(res.filter(function(r){return r.earned;}).length).toBe(BADGES.length);
  });

  it("1天体の着陸で first バッジのみ獲得", function(){
    var res=computeBadges({Mars:1});
    var earned=res.filter(function(r){return r.earned;}).map(function(r){return r.badge.id;});
    expect(earned).toEqual(["first"]);
  });

  it("ガリレオ衛星4つで galilean を獲得", function(){
    var res=computeBadges({Io:1,Europa:1,Ganymede:1,Callisto:1});
    var ids=res.filter(function(r){return r.earned;}).map(function(r){return r.badge.id;});
    expect(ids).toContain("galilean");
  });
});

describe("getVisitedMap", function(){
  it("landing イベントから初訪問 ts を構築", function(){
    var an={events:[
      {ev:"landing",planet:"Mars",ts:100},
      {ev:"landing",planet:"Mars",ts:200},
      {ev:"landing",planet:"Moon",ts:300},
      {ev:"panel_toggle",panel:"satOpen",ts:400},
    ]};
    var v=getVisitedMap(an);
    expect(v).toEqual({Mars:100,Moon:300});
  });
});

describe("nextGoal", function(){
  it("未着手(全 have=0)なら null", function(){
    expect(nextGoal({})).toBe(null);
  });

  it("ガリレオ衛星3つ → あと1天体でガリレオの目", function(){
    var g=nextGoal({Io:1,Europa:1,Ganymede:1});
    expect(g).toContain("あと1天体");
    expect(g).toContain("ガリレオの目");
  });

  it("EN 表示にも対応", function(){
    var g=nextGoal({Io:1,Europa:1,Ganymede:1},true);
    expect(g).toContain("1 more");
    expect(g).toContain("Galilean Eyes");
  });

  it("全制覇なら null", function(){
    var all={};
    ALL_BODIES.forEach(function(b){all[b.k]=1;});
    expect(nextGoal(all)).toBe(null);
  });
});
