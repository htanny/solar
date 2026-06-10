import { describe, it, expect } from "vitest";
import { pickSuggestion, LAND_SUGGEST } from "../../src/utils/todayHighlight.js";

describe("LAND_SUGGEST", function(){
  it("全エントリが k/j/e を持つ", function(){
    LAND_SUGGEST.forEach(function(s){
      expect(typeof s.k).toBe("string");
      expect(typeof s.j).toBe("string");
      expect(typeof s.e).toBe("string");
    });
  });

  it("着陸先キーに重複がない", function(){
    var keys=LAND_SUGGEST.map(function(s){return s.k;});
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("pickSuggestion", function(){
  it("event か land のいずれかを返す", function(){
    var sug=pickSuggestion(0);
    expect(["event","land"]).toContain(sug.kind);
  });

  it("event の場合は30日以内のイベントを返す", function(){
    /* 春分(day 79.5)直前 → 必ずイベントが30日以内に存在する */
    var sug=pickSuggestion(70);
    expect(sug.kind).toBe("event");
    expect(sug.ev.t).toBeGreaterThanOrEqual(70);
    expect(sug.ev.t).toBeLessThanOrEqual(100);
    expect(typeof sug.ev.n).toBe("string");
    expect(typeof sug.ev.date).toBe("string");
  });

  it("land の場合は LAND_SUGGEST のエントリを返す", function(){
    /* どの t でも、kind が land なら s は候補リストの要素 */
    var sug=pickSuggestion(30);
    if(sug.kind==="land"){
      expect(LAND_SUGGEST).toContain(sug.s);
    }
  });

  it("日替わりローテーションは nowMs で決定的", function(){
    /* node 環境では localStorage が無く landing 履歴は空 → pool は全件。
       同じ nowMs なら同じ提案、1日進めると次の候補に進む。 */
    var t=30;/* day3とday79.5の間のイベント空白期を狙うが、kind=event でもテスト自体は成立 */
    var a=pickSuggestion(t,86400000*100);
    var b=pickSuggestion(t,86400000*100);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
