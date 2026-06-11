import { describe, it, expect } from "vitest";
import { explorerShareText, highlightShareText, APP_URL } from "../../src/utils/shareCard.js";
import { ALL_BODIES } from "../../src/utils/explorerLog.js";

describe("explorerShareText", function(){
  it("未訪問: 0/29 とURLを含み、バッジ行は出ない", function(){
    var t=explorerShareText({});
    expect(t).toContain("0/"+ALL_BODIES.length);
    expect(t).toContain(APP_URL);
    expect(t).not.toContain("🎖");
  });

  it("一部訪問: 訪問数・バッジ・次の目標を含む", function(){
    var t=explorerShareText({Io:1,Europa:1,Ganymede:1});
    expect(t).toContain("3/"+ALL_BODIES.length);
    expect(t).toContain("🎖");/* first バッジ獲得済み */
    expect(t).toContain("次の目標");
    expect(t).toContain("ガリレオの目");
  });

  it("EN 表示にも対応", function(){
    var t=explorerShareText({Mars:1},true);
    expect(t).toContain("Explorer Log");
    expect(t).toContain("visited 1/"+ALL_BODIES.length);
    expect(t).toContain("Next:");
  });

  it("全制覇: 全バッジを含み次の目標は出ない", function(){
    var all={};
    ALL_BODIES.forEach(function(b){all[b.k]=1;});
    var t=explorerShareText(all);
    expect(t).toContain(ALL_BODIES.length+"/"+ALL_BODIES.length);
    expect(t).toContain("🏆");
    expect(t).not.toContain("次の目標");
  });
});

describe("highlightShareText", function(){
  it("event: イベント名・日付・URLを含む", function(){
    var sug={kind:"event",ev:{n:"春分",date:"3/20",ic:"🌸",t:79.5}};
    var t=highlightShareText(sug);
    expect(t).toContain("春分");
    expect(t).toContain("3/20");
    expect(t).toContain("🌸");
    expect(t).toContain(APP_URL);
  });

  it("land: 着陸先の説明文とURLを含む", function(){
    var sug={kind:"land",s:{k:"Europa",j:"エウロパ — 地下海の世界",e:"Europa — subsurface ocean"}};
    expect(highlightShareText(sug)).toContain("エウロパ");
    expect(highlightShareText(sug,true)).toContain("Europa — subsurface ocean");
  });
});
