#!/usr/bin/env python3
"""GET-only fetch of the Canvas 74211 caches the build/validate tools read.

    python3 tools/fetch_canvas_cache.py raw      # pages, assignments, modules
    uv run --with python-pptx python3 tools/extract_decks.py
    python3 tools/build_skills.py && python3 tools/build_focus.py
    python3 tools/validate_skills.py && python3 tools/validate_focus.py
    rm -rf raw snips deck_w*.txt               # caches are not committed

Reads the token from ~/.uchicago_canvas_token. Never writes to Canvas.
"""
import json, os, urllib.request, re, sys
TOK = open(os.path.expanduser("~/.uchicago_canvas_token")).read().strip()
BASE = "https://canvas.uchicago.edu/api/v1/courses/74211"
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)


def get_all(url):
    out = []
    while url:
        req = urllib.request.Request(url, headers={"Authorization": "Bearer " + TOK})
        with urllib.request.urlopen(req) as r:
            out += json.load(r)
            link = r.headers.get("Link", "") or ""
        m = re.search(r'<([^>]+)>;\s*rel="next"', link)
        url = m.group(1) if m else None
    return out


for name, path in (("pages", "/pages?per_page=100"),
                   ("assignments", "/assignments?per_page=100"),
                   ("modules", "/modules?include[]=items&per_page=100")):
    data = get_all(BASE + path)
    json.dump(data, open(os.path.join(OUT, name + ".json"), "w"), indent=1)
    print(name, len(data))
