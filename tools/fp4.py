# -*- coding: utf-8 -*-
"""focus.js session object for FINM 33500 — Session 9 (Fri Dec 4, 2026), the LAST class.

Rebuilt 2026-11-14 to the Week 9 finale redo (AlgoArena
.claude/handover/week9_finale_redo/OUTLINE.md): P1 testing, P2 git flow and
environments, P3 CI/CD + live failure modes + the risk-adjusted score, PS the
synthesis "nine weeks, one system" (five cards that follow one order through
the whole course), and PQ a course-wide interview bank (questions from every
week, each linked to the skill where it was taught, sessions 0-9).

The old two-part Session 9 (9a CI/CD, 9b integration & finale) is replaced by
this single object, so tools/build_focus.py no longer merges two parts. No card
cites a deck slide: the Week 9 deck is being rebuilt at the same time.

Every Python `code` snippet was executed with python3 and the trailing `#`
lines are its real stdout; the one bash card (`lang: "bash"`) is executed by
tools/validate_focus.py in a throw-away directory with a throw-away git
identity, and its claims are checked the same way.

Constraints: never name a student; never describe the Week 9 hidden signal.
"""

CONCEPTS = [
    # ---------------- P1 testing ----------------
    {
        "title": "The testing pyramid, and pytest in two lines",
        "text": "Many fast unit tests at the base, a few integration tests above them, a handful of end-to-end runs at the top. A unit test drives one pure function with no I/O in microseconds; an integration test wires two or three pieces together with no network; an end-to-end run drives a whole session and tells you that something broke rather than what. So push the logic down: cut the strategy into a pure decision function and a thin on_tick adapter, and the pure half can be tested a hundred ways for free. The platform's own suite is 2,036 tests in about 42 seconds, and the Week 9 lab's file is 11 tests in 0.12 s. pytest collects files named test_*.py and functions named test_*, rewrites plain asserts into readable diffs, and @pytest.mark.parametrize turns a table of inputs into one report line each. Name the test after the behaviour it pins, and include the boring cases: not enough history, an empty list.",
        "code": """def momentum(prices, lookback=10, band=0.002):        # pure: no I/O, no clock, no globals
    if len(prices) < lookback + 1: return 0           # cold start: no view
    chg = prices[-1] / prices[-lookback - 1] - 1.0
    return 1 if chg > band else (-1 if chg < -band else 0)

def test_long_on_uptrend(): assert momentum([100 + i * .5 for i in range(30)]) == 1
def test_flat_on_no_trend(): assert momentum([100.0] * 30) == 0

CASES = [([100 - i * .5 for i in range(30)], -1), ([100.0, 101.0], 0), ([], 0)]
def test_table():                                     # what @pytest.mark.parametrize does
    bad = [(p[:2], want, momentum(p)) for p, want in CASES if momentum(p) != want]
    assert not bad, bad

for name, fn in sorted(globals().items()):            # what pytest's collector does
    if name.startswith("test_"): fn(); print(name, "passed")
# test_flat_on_no_trend passed
# test_long_on_uptrend passed
# test_table passed""",
    },
    {
        "title": "Fakes at the boundary, async tests, and determinism",
        "text": "Never touch the real network in a unit test. A mock records calls and returns what you configured; a fake is a small working implementation of the interface; monkeypatch swaps an attribute for one test and restores it. At a boundary you own, write the fake: nine lines, no library, and it breaks loudly the day the real interface changes, whereas a mock that returns anything passes forever. A coroutine test needs @pytest.mark.asyncio (this repo sets no asyncio_mode): without it pytest calls the function, gets a coroutine it never awaits, and reports a pass. Then determinism, because a flaky test trains a team to ignore red: seed the randomness, keep the network out, and pass the clock and the ids in rather than calling datetime.now() or uuid4() inside a decision. SimSession.run(seed=3) gives the same leaderboard twice, which is why a network-free seeded session is the one end-to-end test a CI runner can execute.",
        "code": """import asyncio, random

class FakeMarket:                                  # a hand-written fake at a boundary you own
    def __init__(self, bid, ask): self.bid, self.ask = bid, ask
    def best_bid(self, s): return self.bid
    def best_ask(self, s): return self.ask

def edge(m, sym):
    bid, ask = m.best_bid(sym), m.best_ask(sym)
    return None if bid is None or ask is None else round(ask - bid, 4)

async def test_dead_book_sends_nothing():          # under pytest: @pytest.mark.asyncio
    await asyncio.sleep(0)                         # a real await, so the test really runs
    assert edge(FakeMarket(None, None), "AAPL") is None
    assert edge(FakeMarket(99.98, 100.02), "AAPL") == 0.04
asyncio.run(test_dead_book_sends_nothing()); print("dead book -> no order")

def session(seed):                                 # randomness injected, never global
    rng = random.Random(seed)
    return [round(100 + rng.gauss(0, 1), 4) for _ in range(5)]
print("same seed, same tape:", session(3) == session(3), "| new seed:", session(3) == session(4))
# dead book -> no order
# same seed, same tape: True | new seed: False""",
    },
    {
        "title": "Coverage is read, not chased",
        "text": "Coverage records that a line executed, not that anything was asserted about it, so a suite of calls with no asserts can score 100% and find nothing. The snippet does exactly that to a fee function with the maker's sign wrong: both lines run, coverage is complete, and only one real assert exposes the bug. Read the report for its Missing column — code no test has ever entered — and decide where a high bar is a design decision: shared/orderbook.py is held at 100% because one wrong fill corrupts every P&L downstream, while a plotting helper does not need it. The honest check on a suite is mutation in one sentence: break a line of production logic on purpose and see whether anything goes red. And the tests that protect capital are the ugly ones — a missing book, a None return, a kill switch that must latch — not the happy path.",
        "code": """import sys
def fee(notional, taker):
    rate = 0.0015 if taker else 0.0010          # BUG: a maker should EARN the 0.0010
    return round(notional * rate, 2)
hit, body = set(), {fee.__code__.co_firstlineno + 1, fee.__code__.co_firstlineno + 2}
def tracer(frame, event, arg):
    if frame.f_code is fee.__code__ and event == "line": hit.add(frame.f_lineno)
    return tracer
sys.settrace(tracer)
fee(10_000, True); fee(10_000, False)            # a "test" that calls but never asserts
sys.settrace(None)
print(f"coverage {len(hit & body)}/{len(body)} lines, bugs found: 0")
try:
    assert fee(10_000, False) == -10.0, fee(10_000, False)
except AssertionError as e:
    print("one real assert finds it: maker fee =", e)
# coverage 2/2 lines, bugs found: 0
# one real assert finds it: maker fee = 10.0""",
    },
    # ---------------- P2 git flow ----------------
    {
        "title": "Git flow: one branch per purpose",
        "text": "A company's repository is organised so that what is running is always identifiable and always recoverable. main is production: protected, nobody pushes to it directly, and every release on it is a tag. develop is where finished features integrate. A feature/<ticket> branch carries one change and lives days, not weeks; a bugfix/<ticket> branch fixes something not yet released, off develop. A release/<version> branch freezes a version — only fixes and the version bump — while develop moves on. A hotfix/<ticket> branch starts from the tag that is LIVE, not from develop, because develop holds unreleased work you must not ship by accident; it is merged into main and tagged, then merged back into develop so the fix is not lost at the next release. The script plays a whole trading week in a throw-away repository: feature, release v1.3.0, a hotfix v1.3.1, and the tag you would roll back to.",
        "lang": "bash",
        "code": """set -e; git init -q -b main desk && cd desk
git commit -q --allow-empty -m "chore: v1.2.0 in production" && git tag v1.2.0
git switch -q -c develop                                  # integration branch
git switch -q -c feature/ARN-42-vol-band develop          # one change, short-lived
git commit -q --allow-empty -m "feat(signal): vol-adjusted band"
git switch -q develop && git merge -q --no-ff -m "Merge PR #42 (2 approvals, checks green)" feature/ARN-42-vol-band
git switch -q -c release/1.3.0                            # freeze: fixes and the version bump only
git commit -q --allow-empty -m "chore(release): 1.3.0"
git switch -q main && git merge -q --no-ff -m "Release 1.3.0" release/1.3.0 && git tag v1.3.0
git switch -q develop && git merge -q --no-ff -m "Back-merge release 1.3.0" release/1.3.0
git switch -q -c hotfix/1.3.1 v1.3.0                      # off what is LIVE, not off develop
git commit -q --allow-empty -m "fix(risk): kill-switch sign"
git switch -q main && git merge -q --no-ff -m "Hotfix 1.3.1" hotfix/1.3.1 && git tag v1.3.1
git switch -q develop && git merge -q --no-ff -m "Back-merge hotfix 1.3.1" hotfix/1.3.1
echo "tags: $(git tag | tr '\\n' ' ')"
echo "main: $(git log --first-parent --format=%s main | tr '\\n' '|')"
git merge-base --is-ancestor hotfix/1.3.1 develop && echo "develop has the hotfix: yes"
echo "rollback target: $(git describe --tags --abbrev=0 v1.3.1^1)"
# tags: v1.2.0 v1.3.0 v1.3.1
# main: Hotfix 1.3.1|Release 1.3.0|chore: v1.2.0 in production|
# develop has the hotfix: yes
# rollback target: v1.3.0""",
    },
    {
        "title": "Pull requests, required checks and versions",
        "text": "Nothing reaches main or develop except through a pull request: a description that says what changed, why, and how it was tested, a linked ticket, two approvals including one from someone who did not write it, and required checks — lint, unit, integration, a coverage threshold — that branch protection enforces, so a red check blocks the merge button rather than a reviewer's memory. Merge strategy is a team choice: squash gives one commit per feature on the shared branch, a merge commit keeps the branch's history, rebase keeps it linear; pick one and keep it. Conventional commits (feat:, fix:, chore:, feat!: for a breaking change) make the history machine-readable, and semantic versions follow from them: a fix bumps the patch, a feature the minor, a breaking change the major — and on a trading wire, renaming a message field is a breaking change. The CHANGELOG is generated from the same messages.",
        "code": """import re

REQUIRED = ["lint", "unit", "integration", "coverage>=85%"]
def mergeable(pr):                                 # branch protection on main, as code
    missing = [c for c in REQUIRED if pr["checks"].get(c) != "pass"]
    return pr["approvals"] >= 2 and not missing, missing

pr = {"approvals": 2, "checks": {"lint": "pass", "unit": "pass",
                                 "integration": "fail", "coverage>=85%": "pass"}}
print("PR #42 mergeable:", mergeable(pr))
pr["checks"]["integration"] = "pass"; print("after the fix:", mergeable(pr))

def next_version(tag, commits):                    # conventional commits -> semantic version
    major, minor, patch = map(int, tag.lstrip("v").split("."))
    if any(re.match(r"\\w+(\\(.+\\))?!:", c) or "BREAKING CHANGE" in c for c in commits):
        return f"v{major + 1}.0.0"
    if any(c.startswith("feat") for c in commits): return f"v{major}.{minor + 1}.0"
    return f"v{major}.{minor}.{patch + 1}"
print(next_version("v1.2.0", ["fix(book): lazy cancel", "feat(signal): vol band"]),
      next_version("v1.3.0", ["fix(risk): kill-switch sign"]),
      next_version("v1.3.1", ["feat(wire)!: rename qty to quantity"]))
# PR #42 mergeable: (False, ['integration'])
# after the fix: (True, [])
# v1.3.0 v1.3.1 v2.0.0""",
    },
    {
        "title": "Environments and change windows at a trading firm",
        "text": "A change climbs a ladder, one rung at a time: local, then CI on a clean box, then testing/QA, then staging — production-like, fed replayed tapes, often shadow trading next to the live system without sending orders — then a canary (one venue, one book, small size), and only then all of production. New behaviour ships dark behind a feature flag that defaults OFF, which is the rule this course's own engine follows, and a rollback is a redeploy of the previous tag, not a hurried edit. Trading adds rules most software shops do not have: never deploy while a session is open; use a change window right after the close, or here right after a graded block; a run-book for every deploy; a short list of people who may push to production; a two-person rule on anything that sends orders; and research kept in a separate repository from production, so a notebook experiment can never be imported by the code that trades.",
        "code": """from datetime import datetime as dt

LADDER = ["local", "ci", "testing", "staging", "canary", "production"]
FREEZE = (dt(2026, 12, 4, 15, 25), dt(2026, 12, 4, 16, 30))   # connect -> end of the blocks

def may_promote(change, to, now):
    if LADDER.index(to) != LADDER.index(change["at"]) + 1: return "no: one rung at a time"
    if not change["green"]: return "no: checks are red"
    if to in ("canary", "production"):
        if FREEZE[0] <= now < FREEZE[1]: return "no: market open, change freeze"
        if len(set(change["approvers"])) < 2: return "no: two-person rule"
        if change["flag_default"] != "off": return "no: new behaviour must ship dark"
    return "yes"

c = {"at": "staging", "green": True, "approvers": ["dev"], "flag_default": "off"}
print(may_promote(c, "production", dt(2026, 12, 4, 17, 0)))
print(may_promote(c, "canary", dt(2026, 12, 4, 15, 45)))
print(may_promote(c, "canary", dt(2026, 12, 4, 16, 35)))
c["approvers"].append("risk"); print(may_promote(c, "canary", dt(2026, 12, 4, 16, 35)))
# no: one rung at a time
# no: market open, change freeze
# no: two-person rule
# yes""",
    },
    # ---------------- P3 CI/CD, live, score ----------------
    {
        "title": "The CI/CD gate: pin, isolate, ship what passed",
        "text": "CI runs the suite on every push and pull request on a clean machine, and the required check is the contract for what enters main. A GitHub Actions workflow is YAML under .github/workflows/: on: says when it runs, jobs: run in parallel, steps: run in order, uses: reuses an action, run: is a shell command, and a matrix fans one job across Python versions. Make the runner's answer match yours: pin with == rather than >=, isolate in a venv, and freeze OS plus dependencies plus code in an image whose layers go stable to volatile, so a code change does not reinstall the world. Configuration is plain environment variables; secrets such as a team token are injected at runtime and never enter git or the image. CD is the other half: it ships exactly the artefact that passed, tagged with its commit, so production is always a version you can name. Keep the gate fast — a pipeline nobody waits for gets merged around.",
        "code": """REQS = ["websockets==12.0", "pydantic>=2.5", "numpy==1.26.4"]
def pipeline(stages):                              # fail fast: the first red stage stops the line
    for name, ok, secs in stages:
        print(f"  {name:<20}{'pass' if ok else 'FAIL'} {secs:5.1f}s")
        if not ok: return "blocked: nothing ships"
    return "ship the image that passed, tagged with its commit"

unpinned = [r for r in REQS if "==" not in r]
print("run 1:", pipeline([("pins", not unpinned, 0.1), ("unit + integration", True, 41.8)]))
print("  unpinned:", unpinned)
REQS[1] = "pydantic==2.5.3"
print("run 2:", pipeline([("pins", True, 0.1), ("unit + integration", True, 41.8),
                          ("seeded sim", True, 6.2), ("build image", True, 30.0)]))
# run 1: blocked: nothing ships
# unpinned: ['pydantic>=2.5']
# run 2: ship the image that passed, tagged with its commit""",
    },
    {
        "title": "Live failure modes and the run-book",
        "text": "Live systems fail partially, not all at once. The socket stays up while the price behind it dies; a market maker disconnects and, with CANCEL_ON_DISCONNECT, its quotes vanish so best_bid and best_ask return None within a tick; the venue restarts and your bot reconnects believing state that is no longer true. Positions self-heal, because the venue sends them on every PortfolioUpdate; what you accumulated yourself — realised P&L, fill counts, a daily-loss tally — does not. So track the age of every price, keep a shadow ledger from on_fill and diff it against the venue every tick, give each order a client id so a retry is a no-op rather than a double fill, and bound your queues. Write the run-book before you need it, one page per failure as symptom, diagnosis, action, because under pressure you follow steps; afterwards write a blameless postmortem whose root cause is specific, and end it as a regression test.",
        "code": """class Feed:                                    # the socket is up; is the price alive?
    def __init__(self): self.px, self.moved_at = None, 0
    def age(self, px, tick):
        if px != self.px: self.px, self.moved_at = px, tick
        return tick - self.moved_at            # ticks since the price last moved

f = Feed()
ages = [f.age(px, t) for t, px in enumerate([100.0, 100.2, 100.2, 100.2, 100.2], 1)]
print("ages", ages, "-> stale from tick", 1 + next(i for i, a in enumerate(ages) if a > 2))

shadow, venue = {}, {"AAPL": 3}                # your ledger from on_fill vs the venue's truth
for side, qty in (("buy", 5), ("sell", 2)):
    shadow["AAPL"] = shadow.get("AAPL", 0) + (qty if side == "buy" else -qty)
print("agree before the drop:", shadow == venue)
shadow.clear()                                 # the reconnect wiped local state
if shadow != venue:                            # run-book: page, then re-sync from the venue
    print("RECON MISMATCH AAPL shadow=%d venue=%d" % (shadow.get("AAPL", 0), venue["AAPL"]))
    shadow.update(venue)
print("agree after re-sync:", shadow == venue)
# ages [0, 0, 1, 2, 3] -> stale from tick 5
# agree before the drop: True
# RECON MISMATCH AAPL shadow=0 venue=3
# agree after re-sync: True""",
    },
    {
        "title": "The risk-adjusted score and the kill switch",
        "text": "Raw return rewards the gambler: the same +12.68% can be a steady book or a coin flip that landed right. So exchange/scoring.py ranks each role on mean excess return over max(vol, VOL_FLOOR), multiplied by max(0, 1 - 2·max_drawdown) and clamped. Excess means net of the risk-free cash drift, so parking cash scores about zero; the floored denominator stops a flat curve from producing an astronomical ratio. The snippet reproduces the lab's two curves: identical return, +10.000 for the steady one and +0.091 for the jagged one with a 19.20% drawdown. The tearsheet reads the same way — the shape of the equity curve first, then Sharpe, max drawdown, Calmar, turnover and exposure. The kill switch is the other half of risk: past the daily-loss limit it stops all new orders and it LATCHES, so a bounce does not re-arm it. It is the single most important test in a trading repository.",
        "code": """from statistics import mean, pstdev

def score(eq, rf=1.000002 ** 60 - 1, floor=1.2e-4, pen=2.0):
    r = [b / a - 1 for a, b in zip(eq, eq[1:])]
    mdd = max((max(eq[:i + 1]) - v) / max(eq[:i + 1]) for i, v in enumerate(eq))
    ratio = min(10.0, (mean(r) - rf) / max(pstdev(r), floor))   # Sharpe-like, floored, capped
    return ratio * max(0.0, 1 - pen * mdd), mdd                 # the drawdown always hurts

steady = [100_000 * 1.01 ** k for k in range(13)]
jagged = [100_000, 118_000, 96_000, 121_000, 99_000, 125_000, 101_000,
          128_000, 104_000, 130_000, 108_000, 126_000, steady[-1]]
for name, e in (("steady", steady), ("jagged", jagged)):
    s, d = score(e); print(f"{name} score {s:+.3f} maxDD {d:.2%} ret {e[-1] / e[0] - 1:+.2%}")

class KillSwitch:                                  # latches: a recovery does not re-arm it
    def __init__(self, max_loss): self.max_loss, self.tripped = max_loss, False
    def allow(self, pnl):
        self.tripped |= pnl <= -self.max_loss
        return not self.tripped
ks = KillSwitch(2_000)
print("orders allowed at pnl -500, -2100, +300:", [ks.allow(p) for p in (-500, -2_100, 300)])
# steady score +10.000 maxDD 0.00% ret +12.68%
# jagged score +0.091 maxDD 19.20% ret +12.68%
# orders allowed at pnl -500, -2100, +300: [True, False, False]""",
    },
    # ---------------- PS synthesis: nine weeks, one system ----------------
    {
        "title": "Nine weeks, one system (1/5): the machine and the objects — Weeks 0 and 1",
        "text": "Follow one order from a market-data byte to a P&L number. It starts in a limit order book (Week 0): best bid, best ask, a spread you measure in basis points, four matching rules, and fees that on this venue's default schedule (taker 15 bp, maker rebate 10 bp) are bigger than a tight spread. It runs on a machine whose costs you learned to respect: cache and memory, a network hop that dwarfs any bytecode, a 0.5 s tick that makes Python the right language here and the wrong one for a colocated engine measured in microseconds. Then Week 1 gave the order a shape. An Order is a value object whose invariant (no negative quantity, a valid side) is checked once, where it is built; a Trader is an abstract class with on_tick and on_fill, and the engine calls YOUR code — polymorphism is why the same bot runs offline in the simulator and live on the venue. A dict is not a design: it has no place to keep an invariant.",
        "code": """from abc import ABC, abstractmethod
from dataclasses import dataclass
bid, ask = 99.98, 100.02                          # Week 0: the book in basis points
print("spread", round((ask - bid) / ((ask + bid) / 2) * 1e4, 1), "bps")
@dataclass(frozen=True)
class Order:                                      # Week 1: a value object with an invariant
    side: str; price: float; qty: int
    def __post_init__(self):
        if self.qty <= 0 or self.side not in ("buy", "sell"): raise ValueError(f"bad {self}")
class Trader(ABC):                                # the contract the engine calls
    @abstractmethod
    def on_tick(self, mid: float) -> Order | None: ...
class Dip(Trader):
    def on_tick(self, mid): return Order("buy", round(mid - 0.05, 2), 10) if mid < 100 else None
class Quiet(Trader):
    def on_tick(self, mid): return None
for bot in (Dip(), Quiet()):                      # polymorphism: one call, two behaviours
    print(type(bot).__name__, [bot.on_tick(m) for m in (100.2, 99.9)])
try: Order("buy", 99.9, -5)
except ValueError: print("invariant held: no negative quantity")
try: Trader()
except TypeError: print("abstract Trader cannot be instantiated")
# spread 4.0 bps
# Dip [None, Order(side='buy', price=99.85, qty=10)]
# Quiet [None, None]
# invariant held: no negative quantity
# abstract Trader cannot be instantiated""",
    },
    {
        "title": "Nine weeks, one system (2/5): the loop and the wire — Weeks 2 and 3",
        "text": "The order now has to travel. Week 2 put the bot in an event loop: one task reads the socket while another runs your on_tick, so a bot is I/O-bound and async is the right tool — and a blocking call inside on_tick does not crash anything, it silently stops the reader. Threads are for blocking libraries you cannot rewrite (the broker polls yfinance on one); processes are for CPU work, because the GIL lets only one thread run Python at a time; queues with a maxsize turn a fast producer into backpressure instead of a memory leak; and every await is a point where another task can change shared state. Week 3 is the wire: TCP for orders because they must arrive once and in order, UDP multicast with sequence numbers for market data at real venues, FIX/ITCH/OUCH there and WebSocket plus JSON validated by Pydantic here. TCP is a byte stream — one recv is not one message — so a reader reframes, validates at the edge, and reconnects with backoff, jitter and a resync.",
        "code": """import asyncio
from typing import Literal
from pydantic import BaseModel
class Tick(BaseModel):                            # Week 3: the wire contract
    type: Literal["tick"] = "tick"; symbol: str; bid: float; ask: float; seq: int

chunks = [b'{"symbol":"AAPL","bid":99.98,"ask":100.02,"seq":1}\\n{"sym',
          b'bol":"AAPL","bid":99.99,"ask":100.03,"seq":2}\\n']
async def reader(q):                              # one recv is not one message
    buf = b""
    for c in chunks:
        buf += c; await asyncio.sleep(0)          # each await lets other tasks run
        while b"\\n" in buf:
            line, buf = buf.split(b"\\n", 1)
            await q.put(Tick.model_validate_json(line))
    await q.put(None)
async def strategy(q):                            # Week 2: a consumer that never blocks
    while (t := await q.get()) is not None:
        print(f"seq {t.seq} mid {(t.bid + t.ask) / 2:.2f}")
async def main():
    q = asyncio.Queue(maxsize=100)                # bounded: backpressure, not a memory leak
    await asyncio.gather(reader(q), strategy(q))
asyncio.run(main()); print(len(chunks), "recv chunks -> 2 messages")
# seq 1 mid 100.00
# seq 2 mid 100.01
# 2 recv chunks -> 2 messages""",
    },
    {
        "title": "Nine weeks, one system (3/5): the tape, the book and the data engines — Weeks 4, 6 and 7",
        "text": "Every message the venue saw was written to a tape, and Week 4 turned the tape into a laboratory. A backtest replays it on the LOGICAL clock — the tape's tick and sequence number, never time.time() — so two laptops produce the same fills and the same digest; the fill model charges the spread, the taker fee and latency in whole ticks; and the ways a backtest lies (look-ahead, survivorship, snooping, free fills, ignored latency) are each a clock or a cost violation. Storage follows the question: a row store with an index for point lookups, columns (Parquet, DuckDB, kdb+) for scans over one field of a season, an as-of join backward in time inside a decision. Week 6 made the hot path cheap: a heap with lazy cancel and a dict by order id give the best price in O(1) and a cancel without a rescan, and a rolling statistic updates in O(1) per tick. Week 7 scaled the research around it: dtypes that cut a 30 MB frame to 7.5 MB, vectorised code about 40 times faster than the loop, chunks that carry rolling state, and process pools for independent work.",
        "code": """import hashlib, heapq
from collections import deque
tape = [(1, "add", "b1", 99.98), (2, "add", "b2", 99.99), (3, "cancel", "b2", 0.0),
        (4, "add", "b3", 99.97), (5, "add", "b4", 100.00)]
heap, live = [], {}                   # Week 6: heap for the best price, dict for O(1) cancel
win, total, seen = deque(maxlen=3), 0.0, []
for tick, op, oid, px in tape:        # Week 4: the clock is the tape's tick, never time.time()
    if op == "add":
        live[oid] = px; heapq.heappush(heap, (-px, tick, oid))
    else:
        live.pop(oid, None)           # lazy cancel: leave the heap entry, skip it later
    while heap and heap[0][2] not in live: heapq.heappop(heap)
    best = -heap[0][0]
    if len(win) == win.maxlen: total -= win[0]
    win.append(best); total += best   # O(1) rolling mean: add the new, drop the old
    seen.append(f"{tick}:{best:.2f}")
print("best bid by tick", seen)
print("rolling mean", round(total / len(win), 4),
      "| digest", hashlib.sha256("|".join(seen).encode()).hexdigest()[:12])
# best bid by tick ['1:99.98', '2:99.99', '3:99.98', '4:99.98', '5:100.00']
# rolling mean 99.9867 | digest a4af201d2255""",
    },
    {
        "title": "Nine weeks, one system (4/5): the model and the gate — Weeks 8 and 9",
        "text": "Week 8 replaced a hand-typed rule with a learned one, and spent half its time on not fooling yourself. Indicators become features known at tick t, the label is a fact about t+h, scaling is fitted on the training window only, and validation walks forward with a gap at each wall, because a shuffled split on serially correlated data reports accuracy that does not exist. The model ladder starts simple — a linear or logistic model, then regularisation, trees, forests, boosting, a small network — and climbs only when the out-of-sample number pays for the complexity; accuracy is not money until it survives costs and turnover. The model then enters the bot through the same seam as every rule: frozen to a versioned artifact, loaded once in __init__, predicting in on_tick, falling back to flat when anything is missing, and monitored for drift. Week 9 is the gate around all of it: the rule that training always precedes testing becomes a test that runs on every push, so nobody can break it by accident.",
        "code": """import numpy as np
rng = np.random.default_rng(0)
n = 600
X = rng.normal(size=(n, 3))                        # three features known at tick t
y = (X[:, 0] + rng.normal(size=n) > 0).astype(int) # a fact about t+h
def walk_forward(n, folds=4, gap=5):               # train on the past, gap, test the next block
    step = n // (folds + 1)
    for k in range(1, folds + 1):
        yield np.arange(0, k * step - gap), np.arange(k * step, (k + 1) * step)
def fit(tr):                                       # the simple model first: least squares
    w, *_ = np.linalg.lstsq(np.c_[X[tr], np.ones(len(tr))], y[tr] - 0.5, rcond=None)
    return lambda x: float(np.r_[x, 1.0] @ w)

accs = [np.mean([(fit(tr)(X[i]) > 0) == y[i] for i in te]) for tr, te in walk_forward(n)]
print("walk-forward hit rate", [round(float(a), 2) for a in accs])

def signal(model, x):                              # Week 8 -> bot: predict, or fall back to flat
    try: return 1 if model(x) > 0 else -1
    except Exception: return 0
print("no model ->", signal(None, X[0]))

def test_train_always_precedes_test():             # Week 9: the gate pins the rule
    assert all(tr.max() < te.min() for tr, te in walk_forward(n))
test_train_always_precedes_test(); print("gate green: no future in any training set")
# walk-forward hit rate [0.66, 0.77, 0.69, 0.76]
# no model -> 0
# gate green: no future in any training set""",
    },
    {
        "title": "Nine weeks, one system (5/5): the market structure and the score — the season",
        "text": "Around the code ran a season that taught market structure by making you live in it. Fees decide who earns what: the exchange keeps the gap between the taker fee and the maker rebate, the broker earns the half-spread plus the rebate for carrying inventory risk, and the trader pays both and must find an edge larger than them. Auctions open and reopen the book; LULD-style bands, halts and the short-sale restriction stop a disorderly price; IPOs showed the primary market (bookbuild, pricing, allocation, a first day of price discovery); several venues meant routing on the all-in price, fee included, rather than on the best quote alone; futures added margin, basis and scarce borrow. And everything is ranked by a risk-adjusted score with a drawdown penalty, so the steady book beats the lucky one. The logic that ties the nine weeks together fits in five rules: measure before you optimise, determinism before speed, the simple model before the complex one, fail safe (a fallback, a kill switch), and every change behind a flag and a test.",
        "code": """TAKER, MAKER = 0.0015, 0.0010                      # the default schedule (exchange/config.py)
qty, ask, mid = 100, 100.02, 100.00                # a trader lifts a broker's ask
notional = qty * ask
roles = {"exchange": notional * (TAKER - MAKER),   # keeps the fee minus the rebate
         "broker": qty * (ask - mid) + notional * MAKER,   # half-spread + rebate
         "trader": -qty * (ask - mid) - notional * TAKER}  # pays both: needs an edge
print({k: round(v, 2) for k, v in roles.items()})

def in_band(px, ref, band=0.05):                   # an LULD-style price band (illustrative width)
    return abs(px / ref - 1) <= band
print("band: 104 vs ref 100 ->", in_band(104, 100), "| 106 ->", in_band(106, 100))

venues = {"house": (100.02, 0.0015), "team_a": (100.01, 0.0040), "team_b": (100.03, 0.0005)}
all_in = {v: round(px * (1 + fee), 4) for v, (px, fee) in venues.items()}
print("best quote team_a, but route the buy to", min(all_in, key=all_in.get), all_in)
# {'exchange': 5.0, 'broker': 12.0, 'trader': -17.0}
# band: 104 vs ref 100 -> True | 106 -> False
# best quote team_a, but route the buy to team_b {'house': 100.17, 'team_a': 100.41, 'team_b': 100.08}""",
    },
]

HFT = {
    "paragraphs": [
        "Everything a trading firm builds sits behind a gate, because the expensive failure is not a bad idea but a good system broken by an ordinary change. The gate is the three parts of this class in a row: tests that make a behaviour explicit and fast to check, a branch-and-review discipline that decides what may enter main and when, and a pipeline that runs the same checks on a clean machine and ships only the artefact that passed. This platform runs under the same rules while three courses trade on it every week: hosted venues run a pinned main, new features ship behind flags that default off, a golden simulation must be identical before and after a change, the wire only grows (new fields get defaults, nothing is renamed), and restarts happen right after a graded block, never during one.",
        "Git flow is how that discipline looks in a repository. Feature branches keep unfinished work away from what trades; a release branch freezes a version while development moves on; a hotfix starts from the live tag and is merged back so it is not lost; tags make rollback a command rather than an archaeology project. Which flow fits depends on the team: a four-person quant desk that deploys one service is best served by trunk-based development or GitHub flow — short branches, main always releasable, flags for anything unfinished — while a bank with four hundred developers, scheduled releases and auditors needs release branches and the full git flow. What does not vary in trading is the extra layer: a change window, a two-person rule on order-sending code, research and production kept apart.",
        "Look back at the nine weeks and the same five rules keep reappearing. Measure before you optimise: Week 6 timed the book before rewriting it and reported the p99, not the mean. Determinism before speed: Week 4 replayed on the logical clock and proved it with a digest before anything was made fast. The simple model before the complex one: Week 8 climbed the model ladder only when walk-forward results paid for it. Fail safe: a missing model falls back to flat, a stale price stops quoting, a kill switch latches. And every change behind a flag and a test: the Week 9 gate. None of these is specific to trading; trading is simply where breaking them costs money within the hour.",
        "The season also taught the business model of each role, which is why the system is shaped the way it is. The exchange sells certainty — a fair, reliable match — and earns the gap between taker fees and maker rebates, so it competes on uptime, fee schedule and the flow it attracts. The broker sells immediacy: it earns the spread and the rebate for carrying inventory and adverse-selection risk, so it lives or dies on its quoting and its skew. The trader buys both and must have an edge larger than the spread plus the fee, which is why turnover is a cost and why a strategy that trades every tick is a fee machine with a signal attached. The risk-adjusted score then rewards the role that does its job steadily, not the one that got lucky once.",
        "A professional systematic-trading stack has exactly the stations you built. Market-data handlers and normalisers (Weeks 2 and 3) feed a book and a feature store (Weeks 6 and 7); research runs on stored tapes in columnar form with an honest backtester (Week 4) and a model pipeline with time-aware validation (Week 8); strategies are plug-ins behind one interface (Week 1); orders pass a pre-trade risk layer and a kill switch before an execution and routing layer that knows fees and venues; post-trade reconciliation, TCA and a tearsheet close the loop; and observability, CI/CD, environments and run-books (Week 9) surround all of it. What changes at a real firm is scale and latency: C++ or FPGAs where microseconds matter, kernel-bypass networking, kdb+ or a columnar warehouse holding years of ticks, and many more people.",
        "What to learn next follows from where your project hurt. If the hot path was the problem, learn C++ and how a CPU really executes code. If the data was, learn a columnar engine and distributed processing in depth. If the model was, learn statistics for dependent data and causal inference before any larger network. If operations were, learn containers, orchestration and observability properly. And whichever path you take, keep the habits of this course: a seeded offline run before any live claim, a test for every behaviour you rely on, a branch and a review for every change, and a number you can reproduce for every result you present.",
    ],
    "example": [
        {
            "title": "In the arena: the template's CI workflow",
            "text": "scripts/make_template_repo.py writes this file to .github/workflows/checks.yml in every team repository: it runs on every push and pull request, installs the pinned requirements, runs the tests and proves the bots import. Make it a required check on main in the repository's branch protection, and HW 9 asks you to extend it with a coverage threshold and one seeded, network-free simulation run.",
            "code": """# .github/workflows/checks.yml  (written by scripts/make_template_repo.py)
name: checks
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.11"}
      - run: pip install -r requirements.txt
      - run: PYTHONPATH=engine:. pytest tests/ -q
      - name: bots import cleanly
        run: |
          PYTHONPATH=engine:. python -c "import arena, trader.trader, broker.broker, exchange.server"
          if [ -d team ]; then PYTHONPATH=engine:. python -c "import team.config"; fi""",
        },
        {
            "title": "In the arena: the pull-request checklist",
            "text": "Paste this into the description of every pull request into develop or main. Each line is a rule from this class, and the files it names are the platform's own examples: flags that default off in exchange/config.py, a wire that only grows in shared/messages.py, and a matching engine held at 100% by tests/test_orderbook.py.",
            "code": """## PR: feature/ARN-42-vol-band -> develop
- [ ] One change; the title is a conventional commit: feat(signal): vol-adjusted band
- [ ] Ticket linked; the description says what changed, why, and how it was tested
- [ ] New behaviour behind a flag that defaults OFF (the exchange/config.py pattern)
- [ ] Wire unchanged, or additive with defaults (round-trip test, shared/messages.py)
- [ ] Unit tests for the pure logic (the tests/test_orderbook.py style)
- [ ] Seeded offline run identical before/after where behaviour should not change
- [ ] CI green: lint, unit, integration, coverage threshold
- [ ] Two approvals, at least one from someone who did not write it
- [ ] Not merged or deployed while a session is open; run-book updated if needed
- [ ] Release: version bumped, CHANGELOG entry, tag pushed, rollback tag noted""",
        },
        {
            "title": "In the arena: the function that ranks the season",
            "text": "exchange/scoring.py — score_equity() is the same code the live venue and the offline simulator call, so a tearsheet you compute yourself is comparable with the leaderboard.",
            "code": """# exchange/scoring.py  (score_equity)
r = returns(eq)
vol = statistics.pstdev(r) if len(r) > 1 else 0.0
mean_r = (sum(r) / len(r)) if r else 0.0
mdd = max_drawdown(eq)

if n >= MIN_SNAPSHOTS and r:
    excess = [x - RISK_FREE_PER_SNAPSHOT for x in r]
    mean_excess = sum(excess) / len(excess)
    ratio = mean_excess / max(vol, VOL_FLOOR)
    ratio = max(-RISK_ADJUSTED_CAP, min(RISK_ADJUSTED_CAP, ratio))
    if ratio >= 0:
        risk_adjusted = ratio * max(0.0, 1.0 - pen * mdd)
    else:
        risk_adjusted = ratio * (1.0 + pen * mdd)""",
        },
    ],
}

from fp4_interview import INTERVIEW  # noqa: E402  (the course-wide bank)

s9 = {
    "n": 9,
    "focus": "Ship it, run it, see the whole system",
    "tagline": "The last class: tests that pin every behaviour, a git flow and an environment ladder that decide what may change and when, a pipeline that ships only what passed — and then one order followed through all nine weeks, to see why each piece was built the way it was.",
    "concepts": CONCEPTS,
    "hft": HFT,
    "interview": INTERVIEW,
}

SESSIONS = [s9]
