import { ALL_BODIES, BADGES, computeBadges, nextGoal } from "./explorerLog.js";

/* 共有カード: 探検手帳の実績や「今日のみどころ」をURL付きテキストとして出力。
   テキスト生成は純粋関数（テスト対象）、出力は Web Share API → クリップボードの順でフォールバック。 */

export var APP_URL="https://htanny.github.io/solar/";

/* 探検手帳の実績テキスト */
export function explorerShareText(visited,en){
  var nVisited=ALL_BODIES.filter(function(b){return visited[b.k];}).length;
  var pct=Math.round(nVisited/ALL_BODIES.length*100);
  var earned=computeBadges(visited).filter(function(r){return r.earned;});
  var icons=earned.map(function(r){return r.badge.ic;}).join("");
  var lines=[];
  lines.push(en
    ?"🧭 Solar System Explorer Log — visited "+nVisited+"/"+ALL_BODIES.length+" worlds ("+pct+"%)"
    :"🧭 太陽系探検手帳 — "+nVisited+"/"+ALL_BODIES.length+"天体を訪問（"+pct+"%）");
  if(earned.length)lines.push((en?"🎖 Badges ":"🎖 バッジ ")+earned.length+"/"+BADGES.length+": "+icons);
  var goal=nextGoal(visited,en);
  if(goal)lines.push((en?"Next: ":"次の目標: ")+goal);
  lines.push("▶ "+APP_URL);
  return lines.join("\n");
}

/* 受験対策ドリルの結果共有テキスト */
export function drillShareText(score,total,en){
  var pct=Math.round(score/total*100);
  var tag=score===total
    ?(en?"Perfect score! 🏆":"満点でした！🏆")
    :pct>=75
    ?(en?"Great job! ⭐":"よくできました！⭐")
    :(en?"Keep practicing 💪":"あと少し！💪");
  var lines=[];
  lines.push(en
    ?"📖 Exam Prep Drill — Moon phases & Venus: "+score+"/"+total+" ("+pct+"%)"
    :"📖 受験対策ドリル「月の満ち欠け・金星」— "+total+"問中"+score+"問正解（"+pct+"%）");
  lines.push(tag);
  lines.push(en?"Try it yourself ▶ "+APP_URL:"あなたも挑戦 ▶ "+APP_URL);
  return lines.join("\n");
}

/* 「今日のみどころ」の共有テキスト（sug は pickSuggestion の戻り値） */
export function highlightShareText(sug,en){
  var body=sug.kind==="event"
    ?(en?sug.ev.n+" — "+sug.ev.date:sug.ev.n+"（"+sug.ev.date+"）")
    :(en?sug.s.e:sug.s.j);
  var icon=sug.kind==="event"?sug.ev.ic:"🚀";
  return (en?icon+" Today's highlight: ":icon+" 今日のみどころ: ")+body+"\n"+
    (en?"Explore it in the Solar System Simulator ▶ ":"太陽系シミュレーターで体験 ▶ ")+APP_URL;
}

/* テキストを Web Share API → クリップボードの順で出力。
   解決値は "webshare" / "clipboard" / null（全滅）。 */
export function shareOut(text,title){
  if(typeof navigator!=="undefined"&&navigator.share){
    return navigator.share({title:title||"Solar System Simulator",text:text})
      .then(function(){return"webshare";})
      .catch(function(err){
        /* ユーザーキャンセルは黙って終了、それ以外はクリップボードへ */
        if(err&&err.name==="AbortError")return null;
        return copyText(text);
      });
  }
  return copyText(text);
}

function copyText(text){
  if(typeof navigator!=="undefined"&&navigator.clipboard&&navigator.clipboard.writeText){
    return navigator.clipboard.writeText(text).then(function(){return"clipboard";}).catch(function(){return null;});
  }
  return Promise.resolve(null);
}
