#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Assemble focus.js (window.FOCUS) from the per-slice modules fp1..fp5.

fp1 = sessions 0,1,2   fp2 = sessions 3,4,6   fp3 = sessions 7,8
fp4 = session 9 (two parts: 9a CI/CD, 9b integration & finale)
fp5 = session 5 (midterm week)

Resequenced 2026-10-11 (the instructor's decision): Week 5 is the midterm only;
the old Sessions 5, 6, 7 are taught in 6, 7, 8 and the old Sessions 8 and 9 are
merged into Session 9 — both parts' concepts, paragraphs, arena examples and
interview questions are kept, part 9a first.

Run:  python3 tools/build_focus.py   ->  writes ../focus.js
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
OUT = os.path.join(os.path.dirname(HERE), "focus.js")

import fp1  # noqa: E402
import fp2  # noqa: E402
import fp3  # noqa: E402
import fp4  # noqa: E402
import fp5  # noqa: E402

META = {
    "link_title": "Why this matters in systematic trading",
    "interview_title": "Interview questions",
}

# the merged Session 9 (2026-10-11): its own focus line and tagline
MERGED = {
    9: {
        "focus": "CI/CD, testing & the live system",
        "tagline": "A green run on your laptop proves nothing, and parts that pass their own tests prove little more: the bar is a seeded, network-free suite on a clean runner, then parts that honour each other's contracts while the leaderboard scores risk rather than return.",
    },
}


def merge(parts, n):
    """One session object from its parts, in teaching order."""
    out = {"n": n}
    out.update(MERGED[n])
    out["concepts"] = [c for p in parts for c in p["concepts"]]
    out["hft"] = {
        "paragraphs": [x for p in parts for x in p["hft"]["paragraphs"]],
        "example": [p["hft"]["example"] for p in parts if p["hft"].get("example")],
    }
    out["interview"] = [q for p in parts for q in p["interview"]]
    return out


slices = fp1.SESSIONS + fp2.SESSIONS + fp3.SESSIONS + fp4.SESSIONS + fp5.SESSIONS
by_n = {}
for s in slices:
    by_n.setdefault(s["n"], []).append(s)
sessions = [(v[0] if len(v) == 1 else merge(v, n)) for n, v in sorted(by_n.items())]
assert [s["n"] for s in sessions] == list(range(10)), \
    "expected sessions 0..9, got %r" % [s["n"] for s in sessions]

data = {"meta": META, "sessions": sessions}
body = json.dumps(data, indent=2, ensure_ascii=False)
with open(OUT, "w", encoding="utf-8") as fh:
    fh.write("window.FOCUS = " + body + ";\n")

print("wrote %s  (%d sessions, %d bytes)" % (OUT, len(sessions), len(body)))
for s in sessions:
    print("  S%-2d %-46.46s concepts=%d code=%d paras=%d interview=%d"
          % (s["n"], s["focus"], len(s["concepts"]),
             sum(1 for c in s["concepts"] if "code" in c),
             len(s["hft"]["paragraphs"]), len(s["interview"])))
