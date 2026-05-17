import { describe, it, expect } from "vitest";
import { dateToSimDays, simDaysToDate, scanEvents } from "../../src/utils/timeUtils.js";

describe("dateToSimDays / simDaysToDate", function(){
  /* J2000 = 2000-01-01T12:00:00Z (astronomical noon).
     so 2000-01-01 (midnight) → -0.5, 2000-01-02 (midnight) → +0.5 */
  it("J2000基準日(2000-01-01)の真夜中は -0.5 日", function(){
    expect(dateToSimDays("2000-01-01")).toBe(-0.5);
  });

  it("2000-01-02 は +0.5 日 (1日後の真夜中)", function(){
    expect(dateToSimDays("2000-01-02")).toBe(0.5);
  });

  it("不正な日付は null", function(){
    expect(dateToSimDays("invalid-date")).toBe(null);
  });

  it("dateToSimDays → simDaysToDate は元の日付に戻る", function(){
    var d="2026-05-17";
    expect(simDaysToDate(dateToSimDays(d))).toBe(d);
  });

  it("整数日数は ISO 日付に変換できる", function(){
    /* 0日(=正午J2000) → 2000-01-01 の日付として返る */
    expect(simDaysToDate(0)).toBe("2000-01-01");
    expect(simDaysToDate(365)).toBe("2000-12-31");
  });

  it("J2000以前(負の日数)も処理可能", function(){
    var d=dateToSimDays("1999-12-31");
    expect(d).toBeLessThan(0);
    /* 往復変換が一致する */
    expect(simDaysToDate(d)).toBe("1999-12-31");
  });
});

describe("scanEvents", function(){
  it("最大40件まで返す", function(){
    var es=scanEvents(0);
    expect(es.length).toBeLessThanOrEqual(40);
  });

  it("結果は時間順にソートされている", function(){
    var es=scanEvents(0);
    for(var i=1;i<es.length;i++){
      expect(es[i].t).toBeGreaterThanOrEqual(es[i-1].t);
    }
  });

  it("各イベントは {t,n,ic,date} を持つ", function(){
    var es=scanEvents(0);
    expect(es.length).toBeGreaterThan(0);
    var e=es[0];
    expect(typeof e.t).toBe("number");
    expect(typeof e.n).toBe("string");
    expect(typeof e.ic).toBe("string");
    expect(typeof e.date).toBe("string");
  });

  it("春分・夏至・秋分・冬至が含まれる(2年間スキャンの範囲)", function(){
    var es=scanEvents(0);
    var names=es.map(function(e){return e.n;}).join(",");
    expect(names).toContain("春分");
    expect(names).toContain("夏至");
  });
});
