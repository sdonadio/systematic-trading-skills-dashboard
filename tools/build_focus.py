#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Assemble focus.js (window.FOCUS) from the per-slice modules fp1..fp4.

fp1 = sessions 0,1,2   fp2 = sessions 3,4,5   fp3 = sessions 6,7   fp4 = sessions 8,9

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

META = {
    "link_title": "Why this matters in systematic trading",
    "interview_title": "Interview questions",
}

sessions = fp1.SESSIONS + fp2.SESSIONS + fp3.SESSIONS + fp4.SESSIONS
sessions.sort(key=lambda s: s["n"])
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
