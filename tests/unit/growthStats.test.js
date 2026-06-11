import { describe, it, expect } from "vitest";
import { growthStats } from "../../src/utils/analytics.js";

describe("growthStats", function(){
  it("イベントなしならすべてゼロ", function(){
    var gs=growthStats([]);
    expect(gs.today).toEqual({shown:0,go:0,dismiss:0});
    expect(gs.pwa).toEqual({shown:0,installed:0,declined:0,dismiss:0});
    expect(gs.share.total).toBe(0);
    expect(gs.badges).toEqual([]);
  });

  it("undefined を渡しても安全", function(){
    expect(growthStats(undefined).share.total).toBe(0);
  });

  it("today_card のファネルを集計", function(){
    var gs=growthStats([
      {ev:"today_card",action:"shown"},
      {ev:"today_card",action:"shown"},
      {ev:"today_card",action:"go"},
      {ev:"today_card",action:"dismiss"},
    ]);
    expect(gs.today).toEqual({shown:2,go:1,dismiss:1});
  });

  it("pwa_install のファネルを集計", function(){
    var gs=growthStats([
      {ev:"pwa_install",action:"shown"},
      {ev:"pwa_install",action:"installed"},
      {ev:"pwa_install",action:"declined"},
    ]);
    expect(gs.pwa.shown).toBe(1);
    expect(gs.pwa.installed).toBe(1);
    expect(gs.pwa.declined).toBe(1);
  });

  it("share_card を source/method 別に集計", function(){
    var gs=growthStats([
      {ev:"share_card",source:"explorer",method:"clipboard"},
      {ev:"share_card",source:"today",method:"webshare"},
      {ev:"share_card",source:"explorer",method:"webshare"},
    ]);
    expect(gs.share.total).toBe(3);
    expect(gs.share.explorer).toBe(2);
    expect(gs.share.today).toBe(1);
    expect(gs.share.webshare).toBe(2);
    expect(gs.share.clipboard).toBe(1);
  });

  it("badge_earned を獲得順に収集", function(){
    var gs=growthStats([
      {ev:"badge_earned",badge:"first"},
      {ev:"badge_earned",badge:"galilean"},
    ]);
    expect(gs.badges).toEqual(["first","galilean"]);
  });

  it("未知の action / 無関係イベントは無視", function(){
    var gs=growthStats([
      {ev:"today_card",action:"unknown"},
      {ev:"landing",planet:"Mars"},
      {ev:"badge_earned"},/* badge 欠落 */
    ]);
    expect(gs.today).toEqual({shown:0,go:0,dismiss:0});
    expect(gs.badges).toEqual([]);
  });
});
