import { describe, it, expect } from "vitest";
import { PANEL_INIT, panelReducer } from "../../src/utils/panelReducer.js";

describe("panelReducer", function(){
  it("PANEL_INIT は全てのパネルキーを false で持つ", function(){
    expect(PANEL_INIT.showEvents).toBe(false);
    expect(PANEL_INIT.exoOpen).toBe(false);
    expect(PANEL_INIT.satOpen).toBe(false);
    expect(PANEL_INIT.bookOpen).toBe(false);
  });

  it("TOGGLE は対象キーの真偽値を反転させる", function(){
    var s1=panelReducer(PANEL_INIT,{type:"TOGGLE",key:"showEvents"});
    expect(s1.showEvents).toBe(true);
    expect(s1.exoOpen).toBe(false);/* 他のキーは変わらない */
    var s2=panelReducer(s1,{type:"TOGGLE",key:"showEvents"});
    expect(s2.showEvents).toBe(false);
  });

  it("SET は指定値で上書きする", function(){
    var s=panelReducer(PANEL_INIT,{type:"SET",key:"exoOpen",value:true});
    expect(s.exoOpen).toBe(true);
    var s2=panelReducer(s,{type:"SET",key:"exoOpen",value:false});
    expect(s2.exoOpen).toBe(false);
  });

  it("未知の action はそのまま state を返す", function(){
    var s=panelReducer(PANEL_INIT,{type:"UNKNOWN"});
    expect(s).toBe(PANEL_INIT);
  });

  it("state は破壊的に変更されない", function(){
    var s=panelReducer(PANEL_INIT,{type:"TOGGLE",key:"exoOpen"});
    expect(PANEL_INIT.exoOpen).toBe(false);
    expect(s).not.toBe(PANEL_INIT);
  });

  it("TOGGLE_EX は他の排他パネルを閉じて対象を開く", function(){
    var open=panelReducer(PANEL_INIT,{type:"SET",key:"exoOpen",value:true});
    open=panelReducer(open,{type:"SET",key:"bookOpen",value:true});
    var s=panelReducer(open,{type:"TOGGLE_EX",key:"searchOpen"});
    expect(s.searchOpen).toBe(true);
    expect(s.exoOpen).toBe(false);
    expect(s.bookOpen).toBe(false);
  });

  it("TOGGLE_EX は同じキーを2度呼ぶと閉じる", function(){
    var s1=panelReducer(PANEL_INIT,{type:"TOGGLE_EX",key:"compareTable"});
    expect(s1.compareTable).toBe(true);
    var s2=panelReducer(s1,{type:"TOGGLE_EX",key:"compareTable"});
    expect(s2.compareTable).toBe(false);
  });

  it("CLOSE_ALL は全ての排他パネルを閉じる", function(){
    var open=panelReducer(PANEL_INIT,{type:"SET",key:"exoOpen",value:true});
    open=panelReducer(open,{type:"SET",key:"satOpen",value:true});
    open=panelReducer(open,{type:"SET",key:"tourPick",value:true});
    var s=panelReducer(open,{type:"CLOSE_ALL"});
    expect(s.exoOpen).toBe(false);
    expect(s.satOpen).toBe(false);
    expect(s.tourPick).toBe(false);
  });
});
