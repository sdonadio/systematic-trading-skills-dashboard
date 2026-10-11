#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Validate skills.js against SCHEMA.md, adapted for FINM 33500.

Deviations from the Columbia reference validator:
  * 10 sessions numbered 0..9 (not 13 numbered 1..13)
  * category ids: python / quant / tools / trading
  * deck label form  "Deck Week N · slides a–b"  (session N teaches deck wN;
    week 0 is week0_smoketest.pptx)
  * labs are Canvas PAGES (verified against the live pages listing) and the
    cited part number must exist in the lab's markdown source
  * hw / project urls must be a published Canvas assignment on course 74211

Resequence 2026-10-11: Session 5 is the midterm only (no deck, no lab, no
skills); Sessions 6..8 teach source weeks 5..7; Session 9 merges source weeks
8 and 9 as parts "9a" and "9b". SOURCE_WEEK maps each cited deck/lab key to
the weekN.pptx / labs/weekNN.md it was built from (same table as
tools/build_skills.py). Lab urls may be Canvas module-item urls.
"""
import collections
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "skills.js")
RAW = os.path.join(ROOT, "raw")
REPO = "/Users/sdonadio/PycharmProjects/AlgoArena"
DECK_DIR = os.path.join(REPO, "course/systematic-trading")
LABS_DIR = os.path.join(DECK_DIR, "labs")
EXAM_DIR = os.path.join(REPO, "course/exams")

CATS = ["python", "quant", "tools", "trading"]
NSESS = 10                      # sessions 0..9
CANVAS = "https://canvas.uchicago.edu/courses/74211"

errs = []


def chk(cond, msg):
    if not cond:
        errs.append(msg)


# ---------- load ----------
raw = open(SRC, encoding="utf-8").read().strip()
assert raw.startswith("window.SKILLS = "), "must start with 'window.SKILLS = '"
assert raw.endswith(";"), "must end with ';'"
data = json.loads(raw[len("window.SKILLS = "):-1])

# deck slide counts from the extracted deck text
deck_len = {}
for f in os.listdir(ROOT):
    m = re.fullmatch(r"deck_(w\d+)\.txt", f)
    if not m:
        continue
    txt = open(os.path.join(ROOT, f), encoding="utf-8").read()
    nums = [int(x) for x in
            re.findall(r"^--- %s slide (\d+) ---$" % m.group(1), txt, re.M)]
    deck_len[m.group(1)] = max(nums)

# cited key -> source week of the material (2026-10-11 resequence)
SOURCE_WEEK = {"0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "6": 5, "7": 6, "8": 7,
               "9a": 8, "9b": 9}
SESSION_DECKS = {0: ["w0"], 1: ["w1"], 2: ["w2"], 3: ["w3"], 4: ["w4"], 5: [],
                 6: ["w6"], 7: ["w7"], 8: ["w8"], 9: ["w9a", "w9b"]}
MIDTERM_ONLY = {5}               # no class, no deck, no lab, no new skills


def src_deck(key):
    """'9a' -> 'w8': the extracted deck text a citation is checked against."""
    return "w%d" % SOURCE_WEEK[key]


DECK_FILE = {"w0": "week0_smoketest.pptx"}
for i in range(1, 10):
    DECK_FILE["w%d" % i] = "week%d.pptx" % i

# live Canvas pages + published assignments (fetched to raw/)
pages = {p["html_url"] for p in json.load(open(os.path.join(RAW, "pages.json")))}
# module items that point at a live page (a lab link may be a module-item url)
pages |= {it["html_url"]
          for m in json.load(open(os.path.join(RAW, "modules.json")))
          for it in m.get("items", [])
          if it.get("type") == "Page" and
          CANVAS + "/pages/" + str(it.get("page_url")) in pages}
assns = {a["html_url"]: a["name"]
         for a in json.load(open(os.path.join(RAW, "assignments.json")))
         if a.get("published")}

# lab part counts from the markdown sources
lab_parts = {}
for i in range(1, 10):
    txt = open(os.path.join(LABS_DIR, "week%02d.md" % i), encoding="utf-8").read()
    lab_parts[i] = {int(m) for m in re.findall(r"^### (\d+)\.", txt, re.M)}
    # labs rebuilt from Week 3 on number their sections "## Step N — ..."
    lab_parts[i] |= {int(m) for m in re.findall(r"^## Step (\d+)\b", txt, re.M)}

# exam bank group names
banks = {}
for tag, fn in (("Midterm", "st_midterm_bank.json"), ("Final", "st_final_bank.json")):
    banks[tag] = {g["name"] for g in
                  json.load(open(os.path.join(EXAM_DIR, fn)))["groups"]}

# ---------- course ----------
c = data["course"]
for k in ("code", "title", "institution", "term", "sessions_url", "starter_url",
          "companion_url", "lms", "accent", "accent_2", "storage_prefix"):
    chk(k in c, "course missing %s" % k)
chk(c["code"] == "FINM 33500", "course code wrong")
chk(c["institution"] == "University of Chicago", "institution wrong")
chk(c["sessions_url"] == CANVAS, "sessions_url wrong")
chk(c["lms"] == "Canvas", "lms wrong")
chk(re.fullmatch(r"#[0-9a-f]{6}", c["accent"]) and
    re.fullmatch(r"#[0-9a-f]{6}", c["accent_2"]), "accent colours must be hex")

# ---------- categories ----------
cats = data["categories"]
chk([x["id"] for x in cats] == CATS,
    "category ids must be exactly %r in order" % CATS)
for x in cats:
    chk(set(x) == {"id", "name", "color"}, "category %s odd keys" % x.get("id"))
    chk(bool(re.fullmatch(r"#[0-9a-f]{6}", x["color"])),
        "category %s colour not lowercase hex" % x["id"])

# ---------- sessions ----------
sess = data["sessions"]
chk(len(sess) == NSESS, "must be exactly %d sessions, got %d" % (NSESS, len(sess)))
chk([s["n"] for s in sess] == list(range(NSESS)),
    "sessions must be numbered 0..%d in order" % (NSESS - 1))
for s in sess:
    n = s["n"]
    chk(bool(re.fullmatch(r"20\d\d-\d\d-\d\d", s.get("date", ""))),
        "session %s bad date %r" % (n, s.get("date")))
    chk(bool(s.get("title")), "session %s missing title" % n)
    chk(s.get("decks") == SESSION_DECKS[n],
        "session %s must teach decks %r, got %r" % (n, SESSION_DECKS[n], s.get("decks")))
    for d in s["decks"]:
        chk(os.path.exists(os.path.join(DECK_DIR, DECK_FILE[src_deck(d[1:])])),
            "session %s deck file for %s missing" % (n, d))
    chk(s.get("exam") in (None, "midterm", "final"), "session %s bad exam" % n)
    want = ("https://sdonadio.github.io/systematic-trading-arena/"
            + ("" if n == 0 else "week%d.html" % n))
    chk(s["companion_url"] == want,
        "session %s companion_url %r != %r" % (n, s["companion_url"], want))
    labs = s.get("lab")
    labs = labs if isinstance(labs, list) else ([labs] if labs else [])
    chk(not (labs and n in MIDTERM_ONLY), "session %s is the midterm only: no lab" % n)
    for lb in labs:
        chk(set(lb) == {"label", "url"}, "session %s lab odd keys" % n)
        chk(lb["url"] in pages,
            "session %s lab url is not a live Canvas page" % n)
    for key in ("hw", "project"):
        vs = s.get(key)
        # the merged Session 9 carries two project phases -> a list
        for v in (vs if isinstance(vs, list) else ([vs] if vs else [])):
          chk(set(v) == {"label", "url", "due"}, "session %s %s odd keys" % (n, key))
          chk(v["url"] in assns,
              "session %s %s url is not a published assignment" % (n, key))
          chk(bool(re.fullmatch(r"20\d\d-\d\d-\d\d", v["due"])),
              "session %s %s due %r malformed" % (n, key, v["due"]))
chk([s["exam"] for s in sess if s["exam"]] == ["midterm", "final"],
    "expected one midterm then one final")
chk(sess[5]["exam"] == "midterm", "the midterm is in session 5")

# ---------- skills ----------
skills = data["skills"]
ids = [k["id"] for k in skills]
chk(len(ids) == len(set(ids)), "duplicate skill ids: %r" %
    [i for i, n in collections.Counter(ids).items() if n > 1])
chk(50 <= len(skills) <= 80, "want 50-80 skills, got %d" % len(skills))
by_id = {k["id"]: k for k in skills}
ORDER = ["deck", "lab", "hw", "project", "exam"]
DECK_RE = re.compile(r"^Deck Week (\d+[ab]?) · (slide|slides) ([\d,– ]+)$")
LAB_RE = re.compile(r"^Lab (\d+[ab]?) · (?:part|step) (\d+) — .+$")

for k in skills:
    sid = k["id"]
    chk(set(k) == {"id", "category", "name", "can", "introduced", "practised",
                   "depth", "where", "interview"},
        "%s odd key set %r" % (sid, sorted(k)))
    chk(k["category"] in CATS, "%s bad category" % sid)
    chk(bool(re.fullmatch(r"[a-z]+\.[a-z0-9]+(?:-[a-z0-9]+)*", sid)),
        "%s id must be <category>.<slug>" % sid)
    chk(sid.split(".")[0] == k["category"], "%s id prefix != category" % sid)
    chk(bool(k["name"]) and not k["name"].endswith("."),
        "%s name must be a non-empty phrase with no trailing period" % sid)
    chk(k["can"].startswith("You can "), "%s can must start with 'You can'" % sid)
    chk(k["can"].endswith("."), "%s can must end with '.'" % sid)
    chk(re.search(r"\.\s+[A-Z]", k["can"]) is None,
        "%s can must be ONE sentence (found a sentence break)" % sid)
    chk(k["depth"] in (1, 2, 3), "%s bad depth" % sid)
    chk(isinstance(k["interview"], bool), "%s interview not bool" % sid)
    chk(0 <= k["introduced"] <= NSESS - 1, "%s introduced out of range" % sid)
    chk(isinstance(k["practised"], list), "%s practised not a list" % sid)
    chk(k["introduced"] not in k["practised"], "%s practised repeats introduced" % sid)
    chk(len(set(k["practised"])) == len(k["practised"]), "%s practised has dups" % sid)
    for p in k["practised"]:
        chk(0 <= p <= NSESS - 1, "%s practised session %r out of range" % (sid, p))
    chk(1 <= len(k["where"]) <= 7,  # raised 2026-10-11 at the instructor's request (was 6; python.gil and python.reconnect have 7)
        "%s where must have 1..7 items, has %d" % (sid, len(k["where"])))
    homes = {k["introduced"]} | set(k["practised"])

    for w in k["where"]:
        t = w.get("type")
        chk(t in ORDER, "%s where type %r not allowed" % (sid, t))
        chk(bool(w.get("label")), "%s where item missing label" % sid)
        if t == "deck":
            chk("url" not in w, "%s deck where must have no url" % sid)
            m = DECK_RE.match(w["label"])
            chk(bool(m), "%s deck label %r not canonical" % (sid, w["label"]))
            chk(w.get("session") in homes,
                "%s cites a deck from session %r, which is neither introduced "
                "nor practised" % (sid, w.get("session")))
            if m:
                chk(int(m.group(1)[0]) == w["session"]
                    and m.group(1) in SOURCE_WEEK,
                    "%s deck label week %s != where session %s"
                    % (sid, m.group(1), w["session"]))
                dk = src_deck(m.group(1)) if m.group(1) in SOURCE_WEEK else "w?"
                for part in m.group(3).split(","):
                    for num in part.strip().split("–"):
                        num = num.strip()
                        chk(num.isdigit() and 1 <= int(num) <= deck_len[dk],
                            "%s slide %r out of range for %s (1..%d)"
                            % (sid, num, dk, deck_len[dk]))
        elif t == "lab":
            m = LAB_RE.match(w["label"])
            chk(bool(m), "%s lab label %r not canonical" % (sid, w["label"]))
            chk(w.get("session") in homes,
                "%s cites a lab from session %r, which is neither introduced "
                "nor practised" % (sid, w.get("session")))
            chk(w["url"] in pages, "%s lab url is not a live Canvas page" % sid)
            if m:
                key, part = m.group(1), int(m.group(2))
                ln = SOURCE_WEEK.get(key)
                chk(int(key[0]) == w["session"] and ln is not None,
                    "%s lab %s cited under session %s" % (sid, key, w["session"]))
                chk(part in lab_parts.get(ln, set()),
                    "%s cites Lab %s part %d, which does not exist (parts %r)"
                    % (sid, key, part, sorted(lab_parts.get(ln, []))))
        elif t in ("hw", "project"):
            chk(w["url"] in assns,
                "%s %s url %r is not a published assignment" % (sid, t, w["url"]))
            chk(assns.get(w["url"]) == w["label"],
                "%s %s label %r != Canvas name %r"
                % (sid, t, w["label"], assns.get(w["url"])))
            if t == "project":
                chk(w["label"].startswith("Phase "),
                    "%s project label %r should start with 'Phase '" % (sid, w["label"]))
        elif t == "exam":
            chk("url" not in w, "%s exam where must have no url" % sid)
            chk(w["label"].startswith(("Midterm · group: ", "Final · group: ")),
                "%s exam label %r wrong" % (sid, w["label"]))
            if " · group: " in w["label"]:
                tag, grp = w["label"].split(" · group: ", 1)
                chk(grp in banks.get(tag, set()),
                    "%s exam group %r not in the %s bank" % (sid, grp, tag))
    order = [ORDER.index(w["type"]) for w in k["where"] if w.get("type") in ORDER]
    chk(order == sorted(order),
        "%s where not in deck/lab/hw/project/exam order" % sid)

# ---------- cross-reference ----------
for s in sess:
    chk(len(s["skills"]) == len(set(s["skills"])),
        "session %d has duplicate skill ids" % s["n"])
    for sid in s["skills"]:
        chk(sid in by_id, "session %d lists unknown skill %s" % (s["n"], sid))
    if s["n"] in MIDTERM_ONLY:   # 2026-10-11: the midterm week teaches nothing new
        chk(not s["skills"], "session %d is the midterm only: no skills" % s["n"])
        continue
    chk(5 <= len(s["skills"]) <= 17,  # raised 2026-10-11 at the instructor's request (was 9, then 14; Session 2 has 14, the merged Session 9 has 17)
        "session %d has %d skills (want 5-17)" % (s["n"], len(s["skills"])))
for k in skills:
    want = {k["introduced"]} | set(k["practised"])
    got = {s["n"] for s in sess if k["id"] in s["skills"]}
    chk(want == got, "%s should appear in sessions %r but appears in %r"
        % (k["id"], sorted(want), sorted(got)))

# no student data
blob = raw.lower()
for bad in ("@uchicago.edu", "cnetid", "student id", "grade:"):
    chk(bad not in blob, "possible student data in skills.js: %r" % bad)

# ---------- report ----------
print("=" * 72)
print("skills.js validation" +
      ("  —  ALL CHECKS PASSED" if not errs else "  —  %d FAILURES" % len(errs)))
print("=" * 72)
for e in errs:
    print("  FAIL:", e)
print()
print("course : %s %s · %s · %s" % (c["code"], c["title"], c["institution"], c["term"]))
print("starter: %s" % c["starter_url"])
print("totals : %d skills, %d sessions, %d categories, %d where-links"
      % (len(skills), len(sess), len(cats), sum(len(k["where"]) for k in skills)))
print("links  : " + ", ".join(
    "%s %d" % (t, sum(1 for k in skills for w in k["where"] if w["type"] == t))
    for t in ORDER))
print("interview-flagged: %d of %d" % (sum(1 for k in skills if k["interview"]),
                                       len(skills)))
print()
print("deck slide counts: " + " ".join(
    "%s=%d" % (k, deck_len[k]) for k in sorted(deck_len, key=lambda x: int(x[1:]))))
print()
print("per category:")
for x in cats:
    d = collections.Counter(k["depth"] for k in skills if k["category"] == x["id"])
    print("  %-8s %2d skills   depth1=%d depth2=%d depth3=%d   interview=%d"
          % (x["id"], sum(1 for k in skills if k["category"] == x["id"]),
             d[1], d[2], d[3],
             sum(1 for k in skills
                 if k["category"] == x["id"] and k["interview"])))
print()
print("per session:")
for s in sess:
    intro = [i for i in s["skills"] if by_id[i]["introduced"] == s["n"]]
    print("  S%-2d %s  deck=%-3s lab=%-5s hw=%-5s proj=%-5s %-6s total=%d "
          "(new %d, practised %d)"
          % (s["n"], s["date"], "+".join(s["decks"]) or "—",
             ("%d" % len(s["lab"]) if isinstance(s["lab"], list) else "yes") if s["lab"] else "—",
             "yes" if s["hw"] else "—",
             ("%d" % len(s["project"]) if isinstance(s["project"], list) else "yes") if s["project"] else "—",
             s["exam"] or "", len(s["skills"]), len(intro),
             len(s["skills"]) - len(intro)))
print()
print("depth overall: " + ", ".join(
    "depth%d=%d" % (d, sum(1 for k in skills if k["depth"] == d)) for d in (1, 2, 3)))
sys.exit(1 if errs else 0)
