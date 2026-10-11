#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Validate focus.js against FOCUS_SCHEMA.md, adapted for FINM 33500.

Deviations from the Columbia reference validator:
  * 10 sessions numbered 0..9
  * a top-level "meta" block with link_title / interview_title
  * snippets are Python 3.11: every one is written to snips/ and RUN with
    python3; its trailing "#" comment lines are its claimed output and must
    appear in stdout
  * deck labels are "Deck Week N · slides a-b" and session N teaches deck wN

Resequence 2026-10-11 (the instructor's decision): Session 5 is the midterm
week (no deck, no snippets, no interview questions — exempt from those
minimums); Sessions 6..8 teach source decks 5..7; the merged Session 9 cites
"Deck Week 9a" (source deck 8) and "Deck Week 9b" (source deck 9) and keeps
both parts' content, so its upper limits are the two parts' sum. SOURCE_WEEK is
the same table as tools/build_skills.py.
"""
import io
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FOCUS = os.path.join(ROOT, "focus.js")
SKILLS = os.path.join(ROOT, "skills.js")
SNIPS = os.path.join(ROOT, "snips")
REPO = "/Users/sdonadio/PycharmProjects/AlgoArena"

LEVELS = {"warm-up", "core", "senior"}
SOURCE_WEEK = {"0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "6": 5, "7": 6, "8": 7,
               "9a": 8, "9b": 9}
MIDTERM_ONLY = {5}
# 2026-10-11: the merged Session 9 = old 8 + old 9, both parts kept
MERGED_MAX = {9: {"concepts": 12, "paragraphs": 10, "interview": 16}}
NSESS = 10
# only these third-party imports are installed / allowed in a snippet
ALLOWED_3P = {"numpy", "pandas", "pydantic", "websockets", "pytest"}
FORBIDDEN = ["duckdns", "algoarena-st", "ws://", "wss://", "sk-ant-",
             "ARENA_TOKEN=", "@uchicago.edu", "Bearer "]

errors, warnings = [], []


def err(m):
    errors.append(m)


# ---------- 1. strip the JS wrapper and parse as strict JSON ----------
raw = io.open(FOCUS, encoding="utf-8").read()
PREFIX = "window.FOCUS = "
assert raw.startswith(PREFIX), "focus.js must start with 'window.FOCUS = '"
body = raw[len(PREFIX):].strip()
assert body.endswith(";"), "focus.js must end with ';'"
data = json.loads(body[:-1])          # no comments, no trailing commas
print("1. JSON parse .......... OK  (%d bytes, top-level keys %r)"
      % (len(raw), sorted(data)))

# ---------- 2. deck lengths from the extracted deck texts ----------
deck_len = {}
for f in os.listdir(ROOT):
    m = re.fullmatch(r"deck_(w\d+)\.txt", f)
    if not m:
        continue
    txt = io.open(os.path.join(ROOT, f), encoding="utf-8").read()
    nums = [int(x) for x in
            re.findall(r"^--- %s slide (\d+) ---$" % m.group(1), txt, re.M)]
    deck_len[m.group(1)] = max(nums)
print("2. deck lengths ........ " + " ".join(
    "%s=%d" % (k, deck_len[k]) for k in sorted(deck_len, key=lambda s: int(s[1:]))))

# ---------- 3. skills.js ids ----------
sraw = io.open(SKILLS, encoding="utf-8").read()
sdata = json.loads(sraw[sraw.index("=") + 1:].strip().rstrip(";"))
skill_ids = {s["id"] for s in sdata["skills"]}
sess_skills = {s["n"]: set(s["skills"]) for s in sdata["sessions"]}
print("3. skills.js ids ....... %d ids loaded" % len(skill_ids))

# ---------- 4. meta + structure ----------
meta = data.get("meta") or {}
if meta.get("link_title") != "Why this matters in systematic trading":
    err("meta.link_title must be 'Why this matters in systematic trading'")
if meta.get("interview_title") != "Interview questions":
    err("meta.interview_title must be 'Interview questions'")

sessions = data["sessions"]
if len(sessions) != NSESS:
    err("expected %d sessions, got %d" % (NSESS, len(sessions)))
if [s["n"] for s in sessions] != list(range(NSESS)):
    err("session numbers must be 0..%d in order, got %s"
        % (NSESS - 1, [s["n"] for s in sessions]))

DECK_RE = re.compile(r"Deck Week (\d+[ab]?)\s*·\s*slides?\s*(\d+)(?:\s*[–-]\s*(\d+))?")
snippets, used_skills, lvl_tally = [], set(), {}

for s in sessions:
    n = s["n"]
    tag = "S%d" % n
    for k in ("focus", "tagline", "concepts", "hft", "interview"):
        if k not in s:
            err("%s: missing key %r" % (tag, k))
    if not (2 <= len(s["focus"].split()) <= 8):
        warnings.append("%s: focus is %d words" % (tag, len(s["focus"].split())))
    if not s["tagline"].strip():
        err("%s: empty tagline" % tag)

    # --- concepts: 4-6 ---
    cs = s["concepts"]
    mx = MERGED_MAX.get(n, {})
    if not (4 <= len(cs) <= mx.get("concepts", 10)):  # raised 2026-10-11 at the instructor's request (was 4-6; Session 2 has 10)
        err("%s: %d concepts (want 4-%d)" % (tag, len(cs), mx.get("concepts", 10)))
    if n not in MIDTERM_ONLY and sum(1 for c in cs if "code" in c) < 3:
        err("%s: only %d concepts carry a snippet (want >= 3)"
            % (tag, sum(1 for c in cs if "code" in c)))
    for i, c in enumerate(cs, 1):
        if not c.get("title"):
            err("%s.c%d: no title" % (tag, i))
        if not c.get("text"):
            err("%s.c%d: no text" % (tag, i))
        if "code" in c:
            lines = c["code"].split("\n")
            if len(lines) > 27:  # raised 2026-10-11 at the instructor's request (was 12; S3.c7 has 27)
                err("%s.c%d: code is %d lines (max 27)" % (tag, i, len(lines)))
            snippets.append((tag, i, c["title"], c["code"]))
        if "deck" in c:
            found = DECK_RE.findall(c["deck"])
            if not found:
                err("%s.c%d: unparseable deck label %r" % (tag, i, c["deck"]))
            for wk, a, b in found:
                if int(wk[0]) != n or wk not in SOURCE_WEEK:
                    err("%s.c%d: cites Deck Week %s, but this is session %d"
                        % (tag, i, wk, n))
                    continue
                dk = "w%d" % SOURCE_WEEK[wk]
                for g in (a, b):
                    if g and not (1 <= int(g) <= deck_len[dk]):
                        err("%s.c%d: slide %s out of range for %s (1..%d)"
                            % (tag, i, g, dk, deck_len[dk]))

    # --- hft block: 3-5 paragraphs ---
    h = s["hft"]
    ps = h.get("paragraphs")
    pmax = mx.get("paragraphs", 6)
    if not isinstance(ps, list) or not (3 <= len(ps) <= pmax):  # raised 2026-10-11 at the instructor's request (was 3-5; Session 2 has 6)
        err("%s: hft.paragraphs must be a list of 3-%d strings (got %r)"
            % (tag, pmax, len(ps) if isinstance(ps, list) else type(ps).__name__))
    for p in (ps or []):
        if not isinstance(p, str) or len(p.split()) < 25:
            err("%s: hft paragraph too short / not a string: %r" % (tag, str(p)[:60]))
    ex = h.get("example")
    for e in (ex if isinstance(ex, list) else ([ex] if ex is not None else [])):
        for k in ("title", "code", "text"):
            if not e.get(k):
                err("%s: hft.example missing %r" % (tag, k))

    # --- interview: 6-8 with the required level mix ---
    iv = s["interview"]
    imax = mx.get("interview", 10)
    if n in MIDTERM_ONLY:
        if iv:
            err("%s: the midterm week carries no interview questions" % tag)
        lvl_tally[n] = {}
        continue
    if not (6 <= len(iv) <= imax):  # raised 2026-10-11 at the instructor's request (was 6-8; Sessions 2 and 3 have 10)
        err("%s: %d interview items (want 6-%d)" % (tag, len(iv), imax))
    counts = {}
    for j, q in enumerate(iv, 1):
        if not q.get("q"):
            err("%s.i%d: no q" % (tag, j))
        if not q.get("a") or len(q.get("a", "").split()) < 20:
            err("%s.i%d: answer missing or too short" % (tag, j))
        lv = q.get("level")
        if lv not in LEVELS:
            err("%s.i%d: bad level %r" % (tag, j, lv))
        counts[lv] = counts.get(lv, 0) + 1
        if "skill" in q:
            used_skills.add(q["skill"])
            if q["skill"] not in skill_ids:
                err("%s.i%d: skill %r not in skills.js" % (tag, j, q["skill"]))
            elif q["skill"] not in sess_skills.get(n, set()):
                warnings.append("%s.i%d links %s, which skills.js does not list "
                                "for this session" % (tag, j, q["skill"]))
    lvl_tally[n] = counts
    if counts.get("warm-up", 0) < 2:
        err("%s: %d warm-up questions (want 2)" % (tag, counts.get("warm-up", 0)))
    if counts.get("core", 0) < 3:
        err("%s: only %d core questions (want 3-4)" % (tag, counts.get("core", 0)))
    if counts.get("senior", 0) < 1:
        err("%s: no senior questions" % tag)

print("4. per-session shape ... n | concepts | code | hft-paras | interview (w/c/s)")
for s in sessions:
    c = lvl_tally[s["n"]]
    print("   %2d |    %d     |  %d   |     %d     |  %d (%d/%d/%d)"
          % (s["n"], len(s["concepts"]),
             sum(1 for x in s["concepts"] if "code" in x),
             len(s["hft"]["paragraphs"]), len(s["interview"]),
             c.get("warm-up", 0), c.get("core", 0), c.get("senior", 0)))

# ---------- 5. run every concept snippet with python3 ----------
os.makedirs(SNIPS, exist_ok=True)
print("5. snippets ............ written to snips/ and run with `python3`")
ok = bad = 0
for tag, i, title, code in snippets:
    # claimed output = the trailing '#' comment lines
    exp = []
    for ln in reversed(code.split("\n")):
        st = ln.strip()
        if st.startswith("#"):
            exp.append(st[1:].strip())
        elif not st:
            continue
        else:
            break
    # normalise whitespace the same way we normalise stdout
    exp = [" ".join(e.split()) for e in reversed(exp) if e.strip()]

    # import hygiene
    for mod in re.findall(r"^\s*(?:import|from)\s+([A-Za-z_][\w]*)", code, re.M):
        if mod in ALLOWED_3P:
            continue
        try:
            __import__(mod)
        except Exception:
            err("%s.c%d %r: imports %r which is not available" % (tag, i, title, mod))

    name = "v_%s_c%d" % (tag.lower(), i)
    src = os.path.join(SNIPS, name + ".py")
    io.open(src, "w", encoding="utf-8").write(code + "\n")
    try:
        rp = subprocess.run([sys.executable, src], capture_output=True,
                            text=True, timeout=120, cwd=SNIPS)
    except subprocess.TimeoutExpired:
        err("%s.c%d %r: RUN TIMED OUT" % (tag, i, title))
        bad += 1
        print("   TIMEOUT %-12s %s" % (name, title))
        continue
    if rp.returncode != 0:
        err("%s.c%d %r: NON-ZERO EXIT" % (tag, i, title))
        bad += 1
        print("   FAIL  %-12s %s" % (name, rp.stderr.strip().split("\n")[-1][:90]))
        continue
    got = " ".join(rp.stdout.split())
    missing = [e for e in exp if e.split("--")[0].strip()
               and e.split("--")[0].strip() not in got]
    if not exp:
        err("%s.c%d %r: snippet has no trailing '#' output claim" % (tag, i, title))
        bad += 1
        status = "NOCLAIM"
    elif missing:
        err("%s.c%d %r: stdout %r does not contain claim %r"
            % (tag, i, title, got[:160], missing))
        bad += 1
        status = "MISMATCH"
    else:
        ok += 1
        status = "OK  "
    print("   %-8s %-12s %-40.40s run=%r" % (status, name, title, got[:70]))
print("   -> %d snippets verified, %d problems" % (ok, bad))

# ---------- 6. arena examples quote real repo files ----------
PATH_RE = re.compile(r"(?:^|[\s`(])((?:arena|trader|broker|shared|sim|exchange|"
                     r"plugins|tests|scripts|teacher|course|deploy|team)"
                     r"/[\w./-]+\.(?:py|json|md|yml|yaml))")
print("6. arena examples ...... files named must exist in the repo")
for s in sessions:
    ex = s["hft"].get("example")
    if not ex:
        if s["n"] not in MIDTERM_ONLY:
            warnings.append("S%d: no hft.example" % s["n"])
        print("   S%-2d (none)" % s["n"])
        continue
    exs = ex if isinstance(ex, list) else [ex]
    paths = set()
    for e in exs:
        paths |= set(PATH_RE.findall(e["code"] + " " + e["text"]))
    miss = [p for p in paths if not os.path.exists(os.path.join(REPO, p))]
    if miss:
        err("S%d: hft.example names files that do not exist: %s" % (s["n"], miss))
    if not paths:
        err("S%d: hft.example names no repo file" % s["n"])
    print("   S%-2d %s" % (s["n"], ", ".join(sorted(paths)) or "(no path cited)"))

# ---------- 7. no leaked infrastructure or student data ----------
low = raw.lower()
leaks = [t for t in FORBIDDEN if t.lower() in low]
if leaks:
    err("focus.js contains forbidden strings: %r" % leaks)
print("7. leak scan ........... %s" % ("clean" if not leaks else "LEAKS %r" % leaks))

# ---------- 8. summary ----------
print("8. skill links ......... %d distinct skills.js ids referenced" % len(used_skills))
print("   focus titles:")
for s in sessions:
    print("     %d. %s" % (s["n"], s["focus"]))
if warnings:
    print("   warnings (%d):" % len(warnings))
    for w in warnings:
        print("     - " + w)
print()
if errors:
    print("FAIL  %d error(s):" % len(errors))
    for e in errors:
        print("  -", e)
    sys.exit(1)
print("PASS  focus.js conforms to FOCUS_SCHEMA.md — %d sessions (0..9), 4-10 concepts, "
      "3-6 paragraphs, 6-10 interview items (midterm week exempt, merged Session 9 "
      "up to 12/10/16), %d Python snippets executed and their printed output "
      "verified." % (len(sessions), ok))
