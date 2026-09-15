#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build skills.js (window.SKILLS) for FINM 33500 Systematic Trading Technologies.

Sources of truth (all real, all checked by tools/validate_skills.py):
  * decks        course/systematic-trading/week0_smoketest.pptx, week1..week9.pptx
                 (slide text extracted to deck_w0.txt .. deck_w9.txt)
  * speaker      course/systematic-trading/session0..9_talking_points.md
  * labs         Canvas PAGES on course 74211 (markdown source in
                 course/systematic-trading/labs/week01..09.md)
  * assignments  Canvas course 74211, published only
  * exams        course/exams/st_midterm_bank.json / st_final_bank.json (group names)
  * schedule     ta_bot/kb_sources/uchicago-systematic/schedule.md

Run:  python3 tools/build_skills.py   ->  writes ../skills.js
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "skills.js")

CANVAS = "https://canvas.uchicago.edu/courses/74211"
PAGES = CANVAS + "/pages/"
ASSN = CANVAS + "/assignments/"
COMPANION = "https://sdonadio.github.io/systematic-trading-arena/"

# --------------------------------------------------------------------------
# course
# --------------------------------------------------------------------------
COURSE = {
    "code": "FINM 33500",
    "title": "Systematic Trading Technologies",
    "institution": "University of Chicago",
    "term": "Autumn 2026",
    "sessions_url": CANVAS,
    # the student template repo: github.com/sdonadio/algoarena-team-template
    # (marked "Template", referenced by docs/CLASSROOM_SETUP.md and the
    #  week-0 talking points, assembled by scripts/make_template_repo.py)
    "starter_url": "https://github.com/sdonadio/algoarena-team-template",
    "companion_url": COMPANION,
    "lms": "Canvas",
    "accent": "#800000",
    "accent_2": "#d6d6ce",
    "storage_prefix": "finm-st-skills",
}

CATEGORIES = [
    {"id": "python",  "name": "Python & async engineering",   "color": "#800000"},
    {"id": "quant",   "name": "Signals, backtesting & risk",  "color": "#1f6f8b"},
    {"id": "tools",   "name": "Tooling & engineering",        "color": "#2e8b57"},
    {"id": "trading", "name": "Markets & microstructure",     "color": "#b8860b"},
]

# --------------------------------------------------------------------------
# sessions 0..9  (dates America/Chicago, from schedule.md + Canvas modules)
# --------------------------------------------------------------------------
LABS = {
    1: ("Lab 1 — UML & the Arena SDK", "lab-1-uml-and-the-arena-sdk"),
    2: ("Lab 2 — Concurrency & the Event Loop", "lab-2-concurrency-and-the-event-loop"),
    3: ("Lab 3 — Socket Streaming & Protocols", "lab-3-socket-streaming-and-protocols"),
    4: ("Lab 4 — Backtester Architecture", "lab-4-backtester-architecture"),
    5: ("Lab 5 — Complexity & Data Structures", "lab-5-complexity-and-data-structures"),
    6: ("Lab 6 — Big Data", "lab-6-big-data"),
    7: ("Lab 7 — ML Signals & Model Ops", "lab-7-ml-signals-and-model-ops"),
    8: ("Lab 8 — CI/CD, Testing & the Dashboard",
        "lab-8-ci-slash-cd-testing-and-the-dashboard"),
    9: ("Lab 9 — Integration, Failure Drills & the Demo",
        "lab-9-integration-failure-drills-and-the-demo"),
}

HW = {
    0: ("Welcome Survey - Your Background & Goals", "901640", "2026-10-05"),
    1: ("HW 1 — UML & your first bot", "901643", "2026-10-10"),
    2: ("HW 2 — Async concurrency with asyncio", "901644", "2026-10-17"),
    3: ("HW 3 — Protocols & pydantic message schemas", "901645", "2026-10-24"),
    4: ("HW 4 — Build an event-driven backtester", "901646", "2026-10-31"),
    5: ("HW 5 — Complexity & the order book data structure", "901647", "2026-11-07"),
    6: ("HW 6 — Big data: vectorize your signal", "901648", "2026-11-14"),
    7: ("HW 7 — ML signals & model ops", "901649", "2026-11-21"),
    8: ("HW 8 — CI/CD, testing & a bot you trust", "901650", "2026-11-28"),
    9: ("HW 9 — Integration & season-finale demo", "901651", "2026-12-12"),
}

PROJECT = {
    1: ("Phase 0 — Team, Role & Capital Allocation", "901652", "2026-10-10"),
    3: ("Phase 1 — Connect & Trade for Real", "901653", "2026-10-24"),
    5: ("Phase 2 — A Real Edge, Backtested", "901654", "2026-11-07"),
    7: ("Phase 3 — Risk & Robustness", "901655", "2026-11-21"),
    8: ("Phase 4 — Scale & Operations", "901656", "2026-12-04"),
    9: ("Phase 5 — Season Finale: Demo & Postmortem", "901657", "2026-12-12"),
}

SESSION_META = [
    (0, "2026-09-18", "Setup & the Green Smoke Test", None),
    (1, "2026-10-02", "UML & Object-Oriented Programming", None),
    (2, "2026-10-09", "Concurrency & Async in Python", None),
    (3, "2026-10-16", "Socket Streaming & Protocols", None),
    (4, "2026-10-23", "Backtester Architecture", None),
    (5, "2026-10-30", "Algorithmic Complexity & Data Structures", "midterm"),
    (6, "2026-11-06", "Big Data & Distributed Computing", None),
    (7, "2026-11-13", "Machine Learning Signals & Model Ops", None),
    (8, "2026-11-20", "CI/CD, Testing & UI", None),
    (9, "2026-12-04", "Integration & Demo — Season Finale", "final"),
]


# --------------------------------------------------------------------------
# where-link helpers
# --------------------------------------------------------------------------
def deck(session, slides):
    """Deck evidence. `slides` is '11' or '9-11' or '9, 12'."""
    word = "slide" if ("-" not in slides and "," not in slides) else "slides"
    return {"type": "deck", "session": session,
            "label": "Deck Week %d · %s %s" % (session, word,
                                                    slides.replace("-", "–"))}


def lab(session, part, title):
    n = session  # lab N is taught in session N
    return {"type": "lab", "session": session,
            "label": "Lab %d · part %d — %s" % (n, part, title),
            "url": PAGES + LABS[n][1]}


def hw(session):
    label, aid, _due = HW[session]
    return {"type": "hw", "label": label, "url": ASSN + aid}


def project(session):
    label, aid, _due = PROJECT[session]
    return {"type": "project", "label": label, "url": ASSN + aid}


def midterm(group):
    return {"type": "exam", "label": "Midterm · group: " + group}


def final(group):
    return {"type": "exam", "label": "Final · group: " + group}


# exam group short names
MT_OOP = "Python Object Model & OOP Design"
MT_PYD = "Dataclasses, Pydantic & Message Schemas"
MT_ASY = "asyncio: Coroutines, Tasks & the Event Loop"
MT_GIL = "Threads, the GIL & Concurrency Pitfalls"
MT_SOC = "Sockets, WebSockets & Protocol Framing"
MT_BKT = "Backtester Design, Look-Ahead & Complexity"

FN_OOP = "OOP, Dataclasses & Pydantic (recap)"
FN_ASY = "asyncio & Concurrency (recap)"
FN_BOOK = "Order Books, Matching & Market Microstructure in Code"
FN_CPX = "Complexity & Data Structures"
FN_NP = "numpy & pandas: Vectorisation, Indexing & Memory"
FN_BKT = "Backtesting, Look-Ahead Bias & Performance Metrics"
FN_ML = "ML Signals: Features, Leakage & Validation"
FN_CI = "Testing, CI/CD & Reproducibility"
FN_LIVE = "Live Systems: Risk, Reconciliation & Failure Modes"


def S(sid, cat, name, can, introduced, practised, depth, where, interview):
    return {"id": sid, "category": cat, "name": name, "can": can,
            "introduced": introduced, "practised": practised, "depth": depth,
            "where": where, "interview": interview}


# --------------------------------------------------------------------------
# the skills
# --------------------------------------------------------------------------
SKILLS = [

    # ================= session 0 =================
    S("trading.clob", "trading", "The central limit order book",
      "You can read a two-sided limit order book and compute best bid, best ask, "
      "spread, mid and available depth from it, and say where a market order fills.",
      0, [5], 3,
      [deck(0, "11"), deck(5, "11"),
       lab(5, 1, "Time the CLOB against n"),
       final(FN_BOOK)], True),

    S("trading.order-types", "trading", "Order types & the execution trade-off",
      "You can choose between market, limit, stop, IOC/FOK, post-only and "
      "TWAP/VWAP orders and justify the certainty-of-price versus "
      "certainty-of-execution trade-off each one makes.",
      0, [], 2,
      [deck(0, "12"),
       hw(3)], True),

    S("trading.market-making", "trading", "Making markets: spread, inventory, toxic flow",
      "You can explain how a market maker earns the spread, decompose that spread "
      "into order processing, inventory risk and adverse selection, and say why "
      "inventory and informed flow are the two things that kill the P&L.",
      0, [], 3,
      [deck(0, "13-14"),
       project(3)], True),

    S("trading.market-impact", "trading", "Market impact & price discovery",
      "You can explain why your own order moves the price against you, estimate "
      "impact as growing with size relative to average daily volume, and separate "
      "temporary impact from permanent price discovery.",
      0, [], 2,
      [deck(0, "14-15")], True),

    S("trading.primary-secondary", "trading", "Primary vs secondary markets & IPOs",
      "You can distinguish a primary-market issue (IPO, secondary offering, bond "
      "issuance) from secondary-market trading, and describe how a bookbuild "
      "prices and allocates a deal before it lists.",
      0, [], 1,
      [deck(0, "9")], False),

    S("quant.five-pillars", "quant", "The five pillars of a systematic system",
      "You can decompose any systematic trading system into signal, strategy, "
      "execution, risk management and portfolio, and say which pillar a given bug "
      "or loss belongs to.",
      0, [], 3,
      [deck(0, "16"),
       project(9),
       final(FN_LIVE)], True),

    S("tools.venv", "tools", "A pinned Python 3.11 environment",
      "You can create an isolated Python 3.11 environment, install a project from "
      "its pinned requirements, and diagnose the usual breakages (wrong "
      "interpreter, pydantic v1/v2 mix, a missing .env).",
      0, [1], 2,
      [deck(0, "27-29"),
       hw(0)], False),

    S("tools.smoke-test", "tools", "The green smoke test",
      "You can define a smoke test as one fast pass over the critical path, run "
      "the course suite until every check is green, and explain why a skipped "
      "check is not a passing check.",
      0, [], 2,
      [deck(0, "28, 35"),
       hw(0),
       final(FN_CI)], False),

    S("tools.genai-workflow", "tools", "GenAI as a dev tool — and its limits",
      "You can use an LLM to scaffold, review and explain trading code with "
      "explicit constraints, and name the three places it fails you: novel alpha, "
      "financial maths and anything about live runtime state.",
      0, [1], 2,
      [deck(0, "31-33"), deck(1, "23"),
       hw(0)], False),

    # ================= session 1 =================
    S("python.classes", "python", "Classes, objects & encapsulation",
      "You can write a class with instance and class attributes, hide internals "
      "behind the _name/__name conventions, and expose computed state read-only "
      "with @property.",
      1, [], 3,
      [deck(1, "7, 9"),
       lab(1, 3, "The objects your hook receives = the boxes of your diagram"),
       hw(1),
       midterm(MT_OOP), final(FN_OOP)], True),

    S("python.abc", "python", "ABCs, polymorphism & duck typing",
      "You can define an abstract base class with @abstractmethod so subclasses "
      "must implement a hook, explain why instantiating the ABC raises TypeError, "
      "and say when duck typing is enough instead.",
      1, [2], 3,
      [deck(1, "8, 11-12"), deck(2, "18"),
       lab(1, 2, "The ABC bites — abstraction you cannot skip"),
       hw(1),
       midterm(MT_OOP), final(FN_OOP)], True),

    S("python.inheritance", "python", "Inheritance, composition & SOLID",
      "You can decide between IS-A inheritance with super() and HAS-A "
      "composition, and justify the call with the single-responsibility, "
      "open/closed and dependency-inversion principles.",
      1, [], 2,
      [deck(1, "10, 14"),
       lab(1, 5, "Find the four pillars in the starter bot"),
       hw(1),
       midterm(MT_OOP), final(FN_OOP)], True),

    S("python.dataclasses", "python", "Dataclasses as value objects",
      "You can declare a @dataclass to get __init__, __repr__ and __eq__ from type "
      "hints alone, and say when you need a validating pydantic model instead.",
      1, [], 3,
      [deck(1, "13"),
       hw(1),
       midterm(MT_PYD), final(FN_OOP)], True),

    S("python.strategy-pattern", "python", "The strategy pattern behind a plugin registry",
      "You can express interchangeable trading logic as one interface with many "
      "implementations, register them as plugins, and swap a strategy without "
      "touching the engine that calls it.",
      1, [], 2,
      [deck(1, "11, 21"),
       lab(1, 6, "Strategy pattern — two strategies, one interface"),
       hw(1),
       midterm(MT_OOP)], True),

    S("tools.uml", "tools", "UML class & sequence diagrams",
      "You can draw a class diagram with visibility, typed members, "
      "generalization, aggregation, composition, dependency and multiplicity, and "
      "a sequence diagram showing who calls whom in what order.",
      1, [2, 3], 3,
      [deck(1, "17-19, 22"), deck(2, "16"), deck(3, "22"),
       lab(1, 4, "Sketch the UML — on the board, then in your repo"),
       hw(1),
       project(1)], False),

    S("tools.git-branching", "tools", "Git feature branches & a readable history",
      "You can work a week on its own feature branch, keep commits small and "
      "legible, and explain why a repository history that shows how a system was "
      "built is itself a deliverable.",
      1, [8], 2,
      [deck(1, "25-26"), deck(8, "21"),
       hw(1),
       project(1)], False),

    # ================= session 2 =================
    S("python.gil", "python", "The GIL: threads, processes or async",
      "You can state that CPython runs one thread of Python bytecode at a time, "
      "and pick threads, processes or asyncio from whether the work is blocking "
      "I/O, CPU-bound or high-volume I/O.",
      2, [6], 3,
      [deck(2, "5-7"), deck(6, "12"),
       lab(2, 2, "Concurrency is not parallelism — prove it"),
       hw(2),
       midterm(MT_GIL), final(FN_ASY)], True),

    S("python.coroutines", "python", "Coroutines: async def & await",
      "You can write a coroutine with async def, explain that calling it returns a "
      "coroutine object rather than running it, and say exactly what await does to "
      "control flow.",
      2, [], 3,
      [deck(2, "8"),
       lab(2, 1, "Where is the loop? Ask the code"),
       hw(2),
       midterm(MT_ASY), final(FN_ASY)], True),

    S("python.event-loop", "python", "The event loop, tasks & gather",
      "You can start a loop with asyncio.run, schedule work with create_task, "
      "await many coroutines at once with gather, and explain why concurrent is "
      "not parallel on one thread.",
      2, [], 3,
      [deck(2, "9, 14"),
       lab(2, 2, "Concurrency is not parallelism — prove it"),
       hw(2),
       midterm(MT_ASY), final(FN_ASY)], True),

    S("python.asyncio-queue", "python", "asyncio.Queue & backpressure",
      "You can decouple a fast producer from a slower consumer with an "
      "asyncio.Queue, and explain how a maxsize bound turns into backpressure "
      "instead of unbounded memory growth.",
      2, [3], 3,
      [deck(2, "10, 16"), deck(3, "12"),
       lab(2, 3, "Feed → asyncio.Queue → strategy"),
       hw(2),
       midterm(MT_ASY), final(FN_ASY)], True),

    S("python.non-blocking", "python", "Never block the event loop",
      "You can spot the calls that freeze every task on a loop (time.sleep, "
      "blocking HTTP, a heavy computation) and fix them with await or "
      "run_in_executor, and justify the one background thread a blocking library "
      "still needs.",
      2, [], 3,
      [deck(2, "11, 15, 18"),
       lab(2, 4, "One blocking call freezes everything"),
       hw(2),
       midterm(MT_GIL), final(FN_ASY)], True),

    S("python.async-races", "python", "Races, atomicity between awaits & locks",
      "You can explain why a single-threaded loop makes plain state updates "
      "between awaits atomic, identify a read-modify-write that spans an await, "
      "and choose asyncio.Lock, a queue or a thread lock accordingly.",
      2, [], 2,
      [deck(2, "12"),
       hw(2),
       midterm(MT_GIL), final(FN_ASY)], True),

    S("python.reconnect", "python", "Disconnects, heartbeats & idempotent retries",
      "You can catch a closed WebSocket without crashing the bot, reconnect with "
      "exponential backoff and re-sync state from a fresh snapshot, and use "
      "client-side ids so a retried order cannot double-execute.",
      2, [3], 3,
      [deck(2, "14"), deck(3, "12"),
       lab(2, 7, "Survive a drop (this is what kills student bots)"),
       hw(2),
       final(FN_LIVE)], True),

    # ================= session 3 =================
    S("python.sockets", "python", "Sockets, TCP vs UDP & message framing",
      "You can open a TCP socket with bind/listen/accept and connect/send/recv, "
      "explain why recv gives you bytes and not messages, and say when a market "
      "data feed would rather have UDP.",
      3, [], 2,
      [deck(3, "5-7, 11"),
       lab(3, 1, "TCP has no messages, only bytes"),
       hw(3),
       midterm(MT_SOC)], True),

    S("python.websockets", "python", "WebSockets: the upgrade, frames & full duplex",
      "You can describe the HTTP Upgrade handshake that returns 101 Switching "
      "Protocols, explain why one recv yields exactly one framed message, and say "
      "why a trading bot needs full duplex rather than HTTP polling.",
      3, [], 3,
      [deck(3, "9-11"),
       lab(3, 2, "The upgrade, by hand"),
       hw(3),
       midterm(MT_SOC), final(FN_ASY)], True),

    S("python.pydantic", "python", "Pydantic v2 models & validation at the edge",
      "You can define a message as a pydantic BaseModel with Literal-constrained "
      "fields, serialise it with model_dump_json, and explain why a "
      "ValidationError at the boundary beats a KeyError deep inside matching.",
      3, [], 3,
      [deck(3, "15-16, 20"),
       lab(3, 4, "Round-trip, reject, and version"),
       hw(3),
       midterm(MT_PYD), final(FN_OOP)], True),

    S("python.discriminated-union", "python", "Discriminated unions & type dispatch",
      "You can tag every message with a type field, build a union keyed on that "
      "discriminator so parsing is unambiguous, and dispatch on the parsed model "
      "instead of poking at raw dict keys.",
      3, [], 3,
      [deck(3, "17, 21"),
       lab(3, 3, "The contract: what may be said, and by whom"),
       hw(3),
       midterm(MT_PYD), final(FN_OOP)], True),

    S("python.error-boundary", "python", "Rejecting malformed & unknown messages",
      "You can decide up front what happens to a malformed message, an unknown "
      "type and unparseable bytes, and implement log-and-skip versus close-the-"
      "connection without taking down a live bot over one bad frame.",
      3, [], 2,
      [deck(3, "18"),
       lab(3, 5, "The venue enforces it too"),
       hw(3),
       midterm(MT_SOC), final(FN_LIVE)], True),

    S("tools.protocol-contract", "tools", "A wire protocol as a versioned contract",
      "You can specify a protocol as a finite set of message types with required "
      "fields, directions and valid replies, and evolve it by adding optional "
      "fields with defaults so older clients keep working.",
      3, [], 3,
      [deck(3, "14, 22"),
       lab(3, 3, "The contract: what may be said, and by whom"),
       hw(3),
       project(3),
       midterm(MT_SOC)], True),

    # ================= session 4 =================
    S("quant.event-driven-backtest", "quant", "The event-driven backtest loop",
      "You can write the five-step loop — market event, signal, order, fill, "
      "portfolio update — and explain why stepping through time keeps the strategy "
      "structurally blind to the future while a vectorised screen does not.",
      4, [], 3,
      [deck(4, "6-7"),
       lab(4, 2, "Write the loop yourself"),
       hw(4),
       midterm(MT_BKT), final(FN_BKT)], True),

    S("quant.fill-simulation", "quant", "Fill simulation, slippage & transaction costs",
      "You can replace an optimistic last-price fill with one that crosses the "
      "spread and walks the book, and show how fees, slippage and turnover move "
      "Sharpe and drawdown once you subtract them.",
      4, [], 3,
      [deck(4, "8-9"),
       lab(4, 5, "Add costs; watch Sharpe and drawdown move"),
       hw(4),
       midterm(MT_BKT), final(FN_BKT)], True),

    S("quant.performance-metrics", "quant", "Sharpe, max drawdown & Calmar",
      "You can compute CAGR, Sharpe, max drawdown, Calmar and profit factor from "
      "an equity curve, and explain why a high Sharpe with a deep drawdown is "
      "untradeable.",
      4, [9], 3,
      [deck(4, "10"), deck(9, "12"),
       lab(4, 2, "Write the loop yourself"),
       hw(4),
       final(FN_BKT)], True),

    S("quant.look-ahead", "quant", "Look-ahead bias",
      "You can find the place where a backtest used information that did not exist "
      "at decision time, fix it by lagging the signal, and quantify how much of "
      "the reported edge was the leak.",
      4, [7], 3,
      [deck(4, "12"), deck(7, "11"),
       lab(4, 4, "Plant a look-ahead bug, then catch it"),
       hw(4),
       midterm(MT_BKT), final(FN_BKT)], True),

    S("quant.survivorship", "quant", "Survivorship & selection bias",
      "You can explain why backtesting on today's index members silently deletes "
      "every failure from the sample, and say what a survivorship-bias-free "
      "dataset has to contain instead.",
      4, [], 2,
      [deck(4, "13"),
       hw(4),
       final(FN_BKT)], True),

    S("quant.overfitting", "quant", "Overfitting, data snooping & bias-variance",
      "You can explain test error as bias plus variance plus irreducible noise, "
      "recognise that keeping the best of 500 variants fits noise, and defend "
      "against it with fewer parameters, counted trials and a held-out block.",
      4, [7], 3,
      [deck(4, "14, 16"), deck(7, "9, 13"),
       lab(4, 6, "In-sample vs out-of-sample"),
       hw(4),
       midterm(MT_BKT), final(FN_ML)], True),

    S("quant.regime-change", "quant", "Non-stationarity, regime change & drift",
      "You can explain why an edge that lived in one volatility or rate regime can "
      "bleed in the next, break P&L out by period to see it, and size risk for the "
      "regime your backtest never saw.",
      4, [], 2,
      [deck(4, "15"),
       hw(4),
       final(FN_BKT)], True),

    S("trading.maker-taker", "trading", "Maker/taker fees & rebates",
      "You can compute the fee on a trade under a maker/taker schedule, say which "
      "side of a fill pays and which is paid, and explain how a post-only order "
      "and a rebate change a strategy's break-even edge.",
      4, [], 2,
      [deck(4, "9"),
       hw(4),
       final(FN_BOOK)], True),

    S("tools.headless-sim", "tools", "A network-free, seeded simulator",
      "You can run a whole trading session in one process with no sockets, pin a "
      "seed so a run is reproducible, and drive the same strategy code offline and "
      "live through one adapter.",
      4, [6, 7, 8], 3,
      [deck(4, "19-20"), deck(6, "18"), deck(7, "19"),
       lab(4, 3, "One on_tick, two worlds — as_signal_fn"),
       hw(4),
       final(FN_CI)], False),

    # ================= session 5 =================
    S("python.bigo", "python", "Big-O, amortized cost & space/time trade-offs",
      "You can place an operation on the O(1) / O(log n) / O(n) / O(n log n) / "
      "O(n squared) ladder, distinguish worst from average and amortized cost, and "
      "name the memory you spent to buy the speed.",
      5, [], 3,
      [deck(5, "5-6"),
       lab(5, 3, "The Big-O ladder, measured"),
       hw(5),
       midterm(MT_BKT), final(FN_CPX)], True),

    S("python.containers", "python", "dict, set, deque & heapq and their costs",
      "You can pick the container from the operation you repeat most — dict for "
      "keyed lookup, set for membership, deque(maxlen) for a rolling window, heapq "
      "for best-of-many — and quote each one's cost.",
      5, [], 3,
      [deck(5, "7-8"),
       lab(5, 2, "Heap + dict vs sorted list"),
       hw(5),
       midterm(MT_BKT), final(FN_CPX)], True),

    S("python.hot-loop", "python", "Speeding up a Python hot loop",
      "You can apply the standard levers in order of payoff — the right data "
      "structure, hoisting allocation out of the loop, binding a method to a local "
      "name, vectorising batch maths — and stop once the code is no longer hot.",
      5, [], 2,
      [deck(5, "15"),
       lab(5, 2, "Heap + dict vs sorted list"),
       hw(5),
       final(FN_CPX)], True),

    S("quant.rolling-stats", "quant", "O(1) rolling statistics with Welford",
      "You can replace an O(n)-per-tick mean or variance with incremental state, "
      "implement Welford's update for a numerically stable running variance, and "
      "bound the window with a deque so per-tick cost stops growing.",
      5, [], 3,
      [deck(5, "9-10, 19"),
       lab(5, 4, "O(1) rolling statistics — Welford vs recompute"),
       hw(5),
       final(FN_CPX)], True),

    S("trading.price-time-priority", "trading", "Price-time priority & the matching engine",
      "You can apply price-then-time priority to say which resting order fills "
      "first, and explain the heap-plus-dict order book design: a monotonic "
      "sequence for true time priority, a dict as the canonical set, and lazy "
      "deletion on cancel.",
      5, [], 3,
      [deck(5, "11, 18"),
       lab(5, 2, "Heap + dict vs sorted list"),
       hw(5),
       project(5),
       final(FN_BOOK)], True),

    S("tools.profiling", "tools", "Profiling and microbenchmarking honestly",
      "You can find the function that dominates a run with cProfile, then time the "
      "hot path with perf_counter using warm-up, repeats and the minimum, and "
      "refuse to optimise code that is called twice a session.",
      5, [], 3,
      [deck(5, "13-14, 20"),
       lab(5, 1, "Time the CLOB against n"),
       hw(5),
       project(5),
       final(FN_CPX)], True),

    S("tools.latency-tail", "tools", "Latency, throughput & the tail",
      "You can separate per-operation latency from operations per second, report "
      "p50/p95/p99 instead of a mean, and set a per-tick budget that the tail — "
      "not the average — has to fit inside.",
      5, [7], 3,
      [deck(5, "16, 20"), deck(7, "18"),
       lab(5, 5, "Tail latency of your own on_tick"),
       hw(5),
       final(FN_CPX)], True),

    # ================= session 6 =================
    S("python.pandas-memory", "python", "The DataFrame memory bill & dtypes",
      "You can measure what a frame really costs with memory_usage(deep=True), "
      "downcast float64 to float32 and object to category, and recognise the "
      "symptoms of crossing physical memory.",
      6, [], 3,
      [deck(6, "5"),
       lab(6, 2, "Load it into pandas — and look at the memory bill"),
       hw(6),
       final(FN_NP)], True),

    S("python.numpy-vectorize", "python", "Vectorising with numpy & pandas",
      "You can replace a per-row Python loop with whole-array numpy and pandas "
      "operations, check the two agree with allclose, and explain where the order "
      "of magnitude comes from.",
      6, [], 3,
      [deck(6, "7, 19"),
       lab(6, 3, "Python loop vs vectorised, timed and checked"),
       hw(6),
       final(FN_NP)], True),

    S("python.chunking", "python", "Chunked, bounded-memory processing",
      "You can process a file larger than memory as a stream of chunks with a "
      "running reduction, and show that peak memory stays flat while a load-it-all "
      "version scales with the file.",
      6, [], 3,
      [deck(6, "8"),
       lab(6, 4, "Chunked processing — bounded memory"),
       hw(6),
       final(FN_NP)], True),

    S("python.multiprocessing", "python", "Process pools & the map-reduce fan-out",
      "You can shard an embarrassingly parallel workload by symbol or parameter, "
      "fan it out with ProcessPoolExecutor under a __main__ guard, and reduce the "
      "partial results into one answer.",
      6, [], 3,
      [deck(6, "12-14, 20"),
       lab(6, 5, "Map-reduce across processes"),
       hw(6),
       project(7),
       midterm(MT_GIL), final(FN_NP)], True),

    S("tools.parquet", "tools", "Columnar storage & a feature cache",
      "You can explain why columnar Parquet beats row-oriented CSV for analytics — "
      "typed columns, column pruning, compression — and materialise an expensive "
      "feature build once so every later run reloads it.",
      6, [], 3,
      [deck(6, "6, 9"),
       lab(6, 6, "Columnar vs row storage"),
       hw(6),
       project(7),
       final(FN_NP)], True),

    S("tools.determinism", "tools", "Deterministic, network-free runs",
      "You can make a run reproducible by pinning the seed, injecting the clock "
      "and ids, and keeping the network out of it, and explain why an idempotent "
      "task keyed by its inputs is safe to retry.",
      6, [8], 3,
      [deck(6, "15"), deck(8, "9"),
       lab(8, 5, "Determinism: same seed, same result"),
       hw(6),
       final(FN_CI)], True),

    S("trading.multi-venue", "trading", "Multi-venue connection & routing",
      "You can connect one bot to several venues at once from a comma-separated "
      "URL list, and explain why the same symbol on two books creates a routing "
      "decision and a cross-venue arbitrage.",
      6, [], 2,
      [deck(6, "17"),
       hw(6),
       project(7)], False),

    # ================= session 7 =================
    S("quant.supervised-setup", "quant", "The supervised setup: X, y and the horizon",
      "You can frame a trading signal as supervised learning — features knowable "
      "at t, a label about t+h — and choose classification or regression with a "
      "horizon that matches the holding period you intend.",
      7, [], 3,
      [deck(7, "5"),
       lab(7, 3, "Features known at t, label about t + h"),
       hw(7),
       final(FN_ML)], True),

    S("quant.feature-engineering", "quant", "Features from prices & the order book",
      "You can build momentum, volatility, spread and order-book-imbalance "
      "features from a price history and a book snapshot, standardise them, and "
      "justify why fewer, better features win in low signal-to-noise data.",
      7, [], 3,
      [deck(7, "6"),
       lab(7, 3, "Features known at t, label about t + h"),
       hw(7),
       project(7),
       final(FN_ML)], True),

    S("quant.walk-forward", "quant", "Walk-forward validation & leakage control",
      "You can split a time series chronologically into train, validation and an "
      "untouched test block, roll the split forward over expanding or rolling "
      "windows, and embargo the boundary so horizon-h labels cannot leak across "
      "it.",
      7, [], 3,
      [deck(7, "11-12"),
       lab(7, 5, "Walk-forward, and the shuffled-label control"),
       hw(7),
       project(7),
       final(FN_ML)], True),

    S("quant.signal-scoring", "quant", "Scoring a signal after costs",
      "You can explain why classification accuracy is necessary but not "
      "sufficient, read hit rate together with average win over average loss, and "
      "judge a signal on out-of-sample Sharpe and P&L net of fees, spread and "
      "turnover.",
      7, [], 3,
      [deck(7, "14"),
       lab(7, 5, "Walk-forward, and the shuffled-label control"),
       hw(7),
       final(FN_ML)], True),

    S("quant.model-ops", "quant", "Persist, serve, monitor & retrain a model",
      "You can train offline, serialise the fitted model with its feature list and "
      "version, load it once outside the hot path, time predict against the "
      "per-tick budget, and monitor drift to decide when to retrain or roll back.",
      7, [], 3,
      [deck(7, "15, 18"),
       lab(7, 6, "Freeze the model, then load it in on_tick"),
       hw(7),
       project(7),
       final(FN_ML)], True),

    # ================= session 8 =================
    S("tools.test-pyramid", "tools", "The testing pyramid & integration tests",
      "You can place a test at the unit, integration or end-to-end layer, push "
      "logic down so bugs are caught by fast unit tests, and explain why every "
      "part passing its own tests does not mean the system works.",
      8, [9], 3,
      [deck(8, "5"), deck(9, "5, 7"),
       lab(8, 4, "An integration test — the bot inside the simulator"),
       hw(8),
       final(FN_CI)], True),

    S("tools.pytest", "tools", "pytest: tests, fixtures, parametrize & coverage",
      "You can write test_* functions with plain asserts, factor setup into "
      "fixtures, drive many cases from one @parametrize, and read a coverage "
      "report as a map of untested code rather than a number to chase.",
      8, [], 3,
      [deck(8, "6-7, 10"),
       lab(8, 3, "Fixtures and parametrize instead of copy-paste"),
       hw(8),
       final(FN_CI)], True),

    S("tools.mocking-async", "tools", "Fakes, monkeypatch & testing coroutines",
      "You can replace a network or market-data dependency with a hand-written "
      "fake or a monkeypatched attribute, and test a coroutine with "
      "pytest-asyncio instead of hitting a live feed.",
      8, [], 3,
      [deck(8, "8"),
       lab(8, 6, "One async test"),
       hw(8),
       final(FN_CI)], True),

    S("tools.github-actions", "tools", "CI with GitHub Actions",
      "You can write a workflow that installs and runs the suite on every push, "
      "explain triggers, jobs, steps and a version matrix, and use a required "
      "check as the gate on what enters main.",
      8, [], 3,
      [deck(8, "12-13"),
       lab(8, 8, "The CI workflow you will commit in HW 8"),
       hw(8),
       project(8),
       final(FN_CI)], True),

    S("tools.docker", "tools", "Containers & pinned reproducibility",
      "You can pin exact dependency versions, write a Dockerfile whose layers go "
      "stable-to-volatile so the install layer caches, and argue that the image is "
      "what makes 'works on my machine' a testable claim.",
      8, [], 3,
      [deck(8, "14"),
       hw(8),
       project(8),
       final(FN_CI)], True),

    S("tools.observability", "tools", "Logs, metrics & a live dashboard",
      "You can separate structured logs (discrete events with context) from "
      "metrics (numbers over time), split plain config from secrets that never "
      "enter the image, and read a dashboard for the vital signs of a running "
      "session.",
      8, [], 3,
      [deck(8, "15, 18"),
       lab(8, 9, "Read the dashboard against a local exchange"),
       hw(8),
       project(8),
       final(FN_LIVE)], True),

    # ================= session 9 =================
    S("quant.risk-controls", "quant", "Position limits, stops & graceful de-risking",
      "You can put a pre-trade veto in front of every order — position limit, "
      "stop-loss, margin check — and design the failure path so losing a signal "
      "flattens the book instead of emitting garbage orders.",
      9, [], 2,
      [deck(9, "3, 8, 18"),
       lab(9, 2, "Drill 1 — kill the feed"),
       hw(9),
       project(7),
       final(FN_LIVE)], True),

    S("quant.tearsheet", "quant", "The performance tearsheet",
      "You can turn an equity curve into a one-page tearsheet — Sharpe, max "
      "drawdown, Calmar, turnover, exposure — and read the shape of the curve "
      "before quoting any single number from it.",
      9, [], 3,
      [deck(9, "12, 19"),
       lab(9, 5, "Why the season score is risk-adjusted"),
       hw(9),
       project(9),
       final(FN_BKT)], True),

    S("quant.risk-adjusted-score", "quant", "Risk-adjusted scoring & the drawdown penalty",
      "You can explain why raw return rewards the gambler, compute a Sharpe-like "
      "excess-return-over-volatility ratio, and show how a multiplicative drawdown "
      "penalty makes the steady book beat the lucky one.",
      9, [], 3,
      [deck(9, "13, 17"),
       lab(9, 5, "Why the season score is risk-adjusted"),
       hw(9),
       project(9),
       final(FN_BKT)], True),

    S("trading.portfolio-pnl", "trading", "Realized & unrealized P&L marked to mid",
      "You can maintain cash, positions and average entry price from a stream of "
      "fills, split realized from unrealized P&L, and mark a book to the venue mid "
      "to get net worth.",
      9, [], 3,
      [deck(9, "3, 18"),
       lab(9, 4, "Reconcile your ledger against the exchange's"),
       hw(9),
       final(FN_LIVE)], True),

    S("trading.reconciliation", "trading", "Reconciling your ledger with the venue",
      "You can compare your own positions, cash and fill count against the "
      "exchange's record, and treat any break as a bug to explain rather than a "
      "rounding difference to ignore.",
      9, [], 2,
      [lab(9, 4, "Reconcile your ledger against the exchange's"),
       hw(9),
       project(9),
       final(FN_LIVE)], True),

    S("tools.failure-modes", "tools", "Partial failure in a live system",
      "You can name the ways a live trading system degrades rather than dies — a "
      "stale feed behind a healthy socket, a dropped venue, an unbounded queue — "
      "and design detection and a fail-safe response for each.",
      9, [], 3,
      [deck(9, "8"),
       lab(9, 3, "Drill 2 — kill the venue, then bring it back"),
       hw(9),
       final(FN_LIVE)], True),

    S("tools.runbook", "tools", "Run-books, postmortems & the demo",
      "You can write a run-book as symptom, diagnosis, action before you need it, "
      "write a blameless postmortem with timeline, root cause and fixes "
      "afterwards, and turn each incident into a regression test.",
      9, [], 2,
      [deck(9, "9, 14"),
       lab(9, 7, "The postmortem skeleton"),
       hw(9),
       project(9),
       final(FN_LIVE)], False),
]

# --------------------------------------------------------------------------
# sessions: membership is derived from introduced + practised
# --------------------------------------------------------------------------
ORDER = {k["id"]: i for i, k in enumerate(SKILLS)}


def build_sessions():
    out = []
    for n, date, title, exam in SESSION_META:
        ids = [k["id"] for k in SKILLS
               if k["introduced"] == n or n in k["practised"]]
        ids.sort(key=lambda i: ORDER[i])
        s = {
            "n": n,
            "date": date,
            "title": title,
            "decks": ["w%d" % n],
            "lab": ({"label": LABS[n][0], "url": PAGES + LABS[n][1]}
                    if n in LABS else None),
            "hw": None,
            "project": None,
            "exam": exam,
            "companion_url": (COMPANION if n == 0 else COMPANION + "week%d.html" % n),
            "skills": ids,
        }
        if n in HW:
            label, aid, due = HW[n]
            s["hw"] = {"label": label, "url": ASSN + aid, "due": due}
        if n in PROJECT:
            label, aid, due = PROJECT[n]
            s["project"] = {"label": label, "url": ASSN + aid, "due": due}
        out.append(s)
    return out


def main():
    data = {"course": COURSE, "categories": CATEGORIES,
            "sessions": build_sessions(), "skills": SKILLS}
    body = json.dumps(data, indent=2, ensure_ascii=False)
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("window.SKILLS = " + body + ";\n")
    print("wrote %s  (%d skills, %d sessions)"
          % (OUT, len(SKILLS), len(data["sessions"])))
    for s in data["sessions"]:
        print("  S%-2d %s  %-42.42s %d skills"
              % (s["n"], s["date"], s["title"], len(s["skills"])))


if __name__ == "__main__":
    main()
