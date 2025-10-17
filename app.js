// backend/server.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// -------------------------
// 1️⃣ Normalize expression
// -------------------------
function toJsExpression(raw) {
  if (typeof raw !== "string") throw new Error("Expression must be a string");
  let s = raw.trim();
  s = s.replace(/\s+/g, "");

  s = s.replace(/<->|⇔/g, "__EQV__");
  s = s.replace(/->|=>|⇒/g, "__IMPL__");
  s = s.replace(/∧|&|\^|AND/gi, "&&");
  s = s.replace(/∨|\||v|OR/gi, "||");
  s = s.replace(/¬|~|NOT/gi, "!");
  return s;
}

// -------------------------
// 2️⃣ Extract variable names
// -------------------------
function extractVariables(raw) {
  const tokens = raw.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) || [];
  const reserved = new Set(["AND", "OR", "NOT", "TRUE", "FALSE"]);
  const vars = [];
  for (const t of tokens) {
    if (!reserved.has(t.toUpperCase()) && !vars.includes(t)) vars.push(t);
  }
  return vars;
}

// -------------------------
// 3️⃣ Transform implications/equivalences
// -------------------------
function transformImplications(jsExpr) {
  const implRe = /(\!?\(?true|false\)?|\([^\(\)]*\))__IMPL__(\!?\(?true|false\)?|\([^\(\)]*\))/g;
  while (jsExpr.includes("__IMPL__")) {
    jsExpr = jsExpr.replace(implRe, "((!($1))||($2))");
  }

  const eqvRe = /(\!?\(?true|false\)?|\([^\(\)]*\))__EQV__(\!?\(?true|false\)?|\([^\(\)]*\))/g;
  while (jsExpr.includes("__EQV__")) {
    jsExpr = jsExpr.replace(eqvRe, "((($1)&&($2))||((!($1))&&(!($2))))");
  }
  return jsExpr;
}

// -------------------------
// 4️⃣ Evaluate safely
// -------------------------
function evalBooleanExpression(jsExpr) {
  return Function('"use strict"; return (' + jsExpr + ")")();
}

// -------------------------
// 5️⃣ Optimized endpoint
// -------------------------
app.post("/evaluate", (req, res) => {
  const { expression } = req.body || {};
  if (!expression || typeof expression !== "string")
    return res.status(400).json({ error: "No expression provided (string expected)" });

  try {
    const normalized = toJsExpression(expression);
    const vars = extractVariables(expression);

    if (vars.length === 0) {
      let jsExpr = normalized.replace(/\bTRUE\b/gi, "true").replace(/\bFALSE\b/gi, "false");
      jsExpr = transformImplications(jsExpr);
      const result = !!evalBooleanExpression(jsExpr);
      return res.json({
        vars: [],
        rows: null,
        type: result ? "Tautology" : "Contradiction",
        trueCount: result ? 1 : 0,
        falseCount: result ? 0 : 1,
      });
    }

    const n = vars.length;
    if (n > 20) return res.status(400).json({ error: "Too many variables (limit 20)" });

    let allTrue = true;
    let allFalse = true;
    let trueCount = 0;
    let falseCount = 0;

    const total = 1 << n;

    for (let mask = 0; mask < total; mask++) {
      let jsExpr = normalized;

      // Substitute variables
      for (let i = 0; i < n; i++) {
        const val = Boolean((mask >> (n - 1 - i)) & 1);
        const re = new RegExp("\\b" + vars[i] + "\\b", "g");
        jsExpr = jsExpr.replace(re, val ? "true" : "false");
      }

      // Replace TRUE/FALSE literals
      jsExpr = jsExpr.replace(/\bTRUE\b/gi, "true").replace(/\bFALSE\b/gi, "false");

      // Transform implications/equivalences
      jsExpr = transformImplications(jsExpr);

      // Evaluate
      const result = !!evalBooleanExpression(jsExpr);
      if (result) falseCount++; else trueCount++; // track counts

      allTrue = allTrue && result;
      allFalse = allFalse && !result;
    }

    const type = allTrue ? "Tautology" : allFalse ? "Contradiction" : "Contingent";

    return res.json({
      vars,
      rows: null,          // rows are omitted for speed
      type,
      trueCount: total - falseCount,
      falseCount: falseCount
    });

  } catch (err) {
    console.error("Server error:", err.stack || err);
    return res.status(400).json({ error: err.message || "Unknown error" });
  }
});

// -------------------------
// 6️⃣ Start server
// -------------------------
app.listen(4000, () => console.log("✅ Backend running at http://localhost:4000"));
