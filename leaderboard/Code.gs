// 🌍 „Louka příšer“ – online žebříček: backend
// Bezplatný Google Apps Script vázaný na Google Tabulku – bez klíčů, bez serveru, bez starostí.
// Návod krok za krokem: leaderboard/README.md

var SHEET_NAME = "board";
var MAX_ROWS = 500; // server drží jen top 500 záznamů, ať Tabulka neroste do nebe
var TOP_N = 50; // kolik řádků vrátí klientovi

function doGet(e) {
  return handle(e && e.parameter ? e.parameter : {});
}

function doPost(e) {
  var p = {};
  try {
    if (e && e.parameter) p = e.parameter;
    if (e && e.postData && e.postData.contents) {
      var j = JSON.parse(e.postData.contents);
      for (var k in j) p[k] = String(j[k]);
    }
  } catch (err) {
    // rozsypané tělo - zkusíme parametry, co jsou
  }
  return handle(p);
}

function clampNum(v, lo, hi) {
  var n = Number(v);
  if (!isFinite(n) || n < 0) n = 0;
  return Math.min(hi, Math.max(lo, Math.floor(n)));
}

function handle(p) {
  var out;
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(["name", "score", "level", "kills", "time", "cls", "diff", "date", "combo", "ts"]);
    }
    if (p.op === "submit") {
      // 🦟 jméno jen tisknutelné znaky a krátké - žebříček je veřejný
      var name = String(p.name || "?").replace(/[^\p{L}\p{N} _.'\-!?]/gu, "").trim().slice(0, 12) || "?";
      sh.appendRow([
        name,
        clampNum(p.score, 0, 100000000),
        clampNum(p.level, 0, 100000),
        clampNum(p.kills, 0, 1000000),
        clampNum(p.time, 0, 2592000),
        String(p.cls || "?").slice(0, 12),
        clampNum(p.diff, 0, 10),
        String(p.date || "").slice(0, 10),
        clampNum(p.combo, 0, 1000000),
        new Date().toISOString(),
      ]);
      trimSheet(sh);
      out = { ok: true };
    } else {
      // op=top (výchozí) – globální žebříček
      var data = sh.getDataRange().getValues();
      var rows = [];
      for (var i = 1; i < data.length; i++) {
        var score = Number(data[i][1]);
        if (isFinite(score) && score > 0) {
          rows.push({
            name: String(data[i][0]).slice(0, 12),
            score: score,
            level: Number(data[i][2]) || 0,
            kills: Number(data[i][3]) || 0,
            time: Number(data[i][4]) || 0,
            cls: String(data[i][5] || "?"),
            diff: Number(data[i][6]) || 0,
            date: String(data[i][7] || ""),
            combo: Number(data[i][8]) || 0,
          });
        }
      }
      rows.sort(function (a, b) { return b.score - a.score; });
      out = { ok: true, rows: rows.slice(0, TOP_N) };
    }
  } catch (err) {
    out = { ok: false, error: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

// ✂️ Tabulka drží jen top MAX_ROWS podle skóre - staré slabé runy vypadnou
function trimSheet(sh) {
  var last = sh.getLastRow();
  if (last <= MAX_ROWS) return;
  var width = sh.getLastColumn();
  var header = sh.getRange(1, 1, 1, width).getValues();
  var vals = sh.getRange(2, 1, last - 1, width).getValues();
  vals.sort(function (a, b) { return Number(b[1]) - Number(a[1]); });
  sh.clear();
  sh.getRange(1, 1, 1, width).setValues(header);
  var keep = vals.slice(0, MAX_ROWS);
  if (keep.length) sh.getRange(2, 1, keep.length, width).setValues(keep);
}
