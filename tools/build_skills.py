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
    "lang": "Python",
    "session_word": "Week",
    "deck_word": "Week",
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
    4: ("Lab 4 — Backtesting and Its Data", "lab-4-the-tape-as-a-dataset"),
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
    4: ("HW 4 — Your tapes in SQL and Parquet, and a backtest you can trust", "901646", "2026-10-31"),
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
    (4, "2026-10-23", "Backtesting and Its Data", None),
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
      "spread, mid and available depth from it, and say where a market order "
      "fills.",
      0, [5], 3,
      [deck(0, "11"),
       deck(5, "11"),
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
      "You can explain how a market maker earns the spread, decompose that spread"
      " into order processing, inventory risk and adverse selection, and say why "
      "inventory and informed flow are the two things that kill the P&L.",
      0, [], 3,
      [deck(0, "13-14"),
       project(3)], True),

    S("trading.market-impact", "trading", "Market impact & price discovery",
      "You can explain why your own order moves the price against you, estimate "
      "impact as growing with size relative to average daily volume, and separate"
      " temporary impact from permanent price discovery.",
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
      "execution, risk management and portfolio, and say which pillar a given bug"
      " or loss belongs to.",
      0, [], 3,
      [deck(0, "16"),
       project(9),
       final(FN_LIVE)], True),

    S("tools.venv", "tools", "A pinned Python 3.11 environment",
      "You can create an isolated Python 3.11 environment, install a project from"
      " its pinned requirements, and diagnose the usual breakages (wrong "
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
      "explicit constraints, and name the three places it fails you: novel alpha,"
      " financial maths and anything about live runtime state.",
      0, [1], 2,
      [deck(0, "31-33"),
       deck(1, "23"),
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
       midterm(MT_OOP),
       final(FN_OOP)], True),

    S("python.abc", "python", "ABCs, polymorphism & duck typing",
      "You can define an abstract base class with @abstractmethod so subclasses "
      "must implement a hook, explain why instantiating the ABC raises TypeError,"
      " and say when duck typing is enough instead.",
      1, [2], 3,
      [deck(1, "8, 11-12"),
       deck(2, "29"),
       lab(1, 2, "The ABC bites — abstraction you cannot skip"),
       hw(1),
       midterm(MT_OOP),
       final(FN_OOP)], True),

    S("python.inheritance", "python", "Inheritance, composition & SOLID",
      "You can decide between IS-A inheritance with super() and HAS-A "
      "composition, and justify the call with the single-responsibility, "
      "open/closed and dependency-inversion principles.",
      1, [], 2,
      [deck(1, "10, 14"),
       lab(1, 5, "Find the four pillars in the starter bot"),
       hw(1),
       midterm(MT_OOP),
       final(FN_OOP)], True),

    S("python.dataclasses", "python", "Dataclasses as value objects",
      "You can declare a @dataclass to get __init__, __repr__ and __eq__ from "
      "type hints alone, and say when you need a validating pydantic model "
      "instead.",
      1, [], 3,
      [deck(1, "13"),
       hw(1),
       midterm(MT_PYD),
       final(FN_OOP)], True),

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
      "generalization, aggregation, composition, dependency and multiplicity, and"
      " a sequence diagram showing who calls whom in what order.",
      1, [2], 3,
      [deck(1, "17-19, 22"),
       deck(2, "27"),
       lab(1, 4, "Sketch the UML — on the board, then in your repo"),
       hw(1),
       project(1)], False),

    S("tools.git-branching", "tools", "Git feature branches & a readable history",
      "You can work a week on its own feature branch, keep commits small and "
      "legible, and explain why a repository history that shows how a system was "
      "built is itself a deliverable.",
      1, [8], 2,
      [deck(1, "25-26"),
       deck(8, "21"),
       hw(1),
       project(1)], False),


    # ================= session 2 =================
    S("python.gil", "python", "The GIL: I/O-bound vs CPU-bound work",
      "You can explain that CPython's GIL lets one thread execute bytecode at a "
      "time and is released around blocking I/O, classify a piece of work as "
      "I/O-bound or CPU-bound, and predict from that whether threads will speed "
      "it up.",
      2, [6], 3,
      [deck(2, "5-7, 14"),
       deck(6, "12"),
       lab(2, 2, "Concurrency is not parallelism — prove it"),
       lab(2, 8, "Threads vs processes vs one core"),
       hw(2),
       midterm(MT_GIL),
       final(FN_ASY)], True),

    S("python.coroutines", "python", "Coroutines: async def & await",
      "You can write a coroutine with async def, explain that calling it returns "
      "a coroutine object rather than running it, and say exactly what await does"
      " to control flow.",
      2, [], 3,
      [deck(2, "8"),
       lab(2, 1, "Where is the loop? Ask the code"),
       hw(2),
       midterm(MT_ASY),
       final(FN_ASY)], True),

    S("python.event-loop", "python", "The event loop, tasks & gather",
      "You can start a loop with asyncio.run, schedule work with create_task, "
      "await many coroutines at once with gather, and explain why concurrent is "
      "not parallel on one thread.",
      2, [], 3,
      [deck(2, "9, 25"),
       lab(2, 2, "Concurrency is not parallelism — prove it"),
       hw(2),
       midterm(MT_ASY),
       final(FN_ASY)], True),

    S("python.asyncio-queue", "python", "asyncio.Queue & backpressure",
      "You can decouple a fast producer from a slower consumer with an "
      "asyncio.Queue, and explain how a maxsize bound turns into backpressure "
      "instead of unbounded memory growth.",
      2, [3], 3,
      [deck(2, "10, 27"),
       deck(3, "29"),
       lab(2, 3, "Feed → asyncio.Queue → strategy"),
       hw(2),
       midterm(MT_ASY),
       final(FN_ASY)], True),

    S("python.non-blocking", "python", "Never block the event loop",
      "You can spot the calls that freeze every task on a loop (time.sleep, "
      "blocking HTTP, a heavy computation), prove the stall with debug=True or a "
      "heartbeat measurement, and keep a synchronous on_tick returning fast.",
      2, [], 3,
      [deck(2, "11, 26, 29"),
       lab(2, 4, "One blocking call freezes everything"),
       hw(2),
       midterm(MT_GIL),
       final(FN_ASY)], True),

    S("python.async-races", "python", "Races, atomicity between awaits & locks",
      "You can explain why a single-threaded loop makes plain state updates "
      "between awaits atomic, identify a read-modify-write that spans an await, "
      "and choose asyncio.Lock, a queue or a thread lock accordingly.",
      2, [], 2,
      [deck(2, "12"),
       hw(2),
       midterm(MT_GIL),
       final(FN_ASY)], True),

    S("python.reconnect", "python", "Disconnects, heartbeats & idempotent retries",
      "You can catch a closed WebSocket without crashing the bot, reconnect with "
      "exponential backoff and re-sync state from a fresh snapshot, and use "
      "client-side ids so a retried order cannot double-execute.",
      2, [3], 3,
      [deck(2, "25, 31"),
       deck(3, "28, 34"),
       lab(2, 7, "Survive a drop (this is what kills student bots)"),
       {"type": "lab", "session": 3, "label": "Lab 3 · step 5 — WebSockets", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       hw(2),
       project(3),
       final(FN_LIVE)], True),

    S("python.threading", "python", "threading: Thread, Lock, Queue & Event",
      "You can start and join threading.Thread workers, hand data between them "
      "with a queue.Queue and stop them with an Event, and find and fix a "
      "read-modify-write race with a Lock (or an RLock when a locked method calls"
      " another).",
      2, [], 3,
      [deck(2, "15-16"),
       lab(2, 8, "Threads vs processes vs one core"),
       hw(2),
       midterm(MT_GIL),
       final(FN_ASY)], True),

    S("python.executors", "python", "ThreadPoolExecutor vs ProcessPoolExecutor, measured",
      "You can run the same job through ThreadPoolExecutor and "
      "ProcessPoolExecutor, time sequential vs threads vs processes, and justify "
      "the pool you pick from that measurement, including when start-up and "
      "pickling make a process pool slower than one core.",
      2, [], 3,
      [deck(2, "17-18, 23"),
       lab(2, 8, "Threads vs processes vs one core"),
       midterm(MT_GIL),
       final(FN_ASY)], True),

    S("python.start-methods", "python", "Start methods, pickling & shared memory",
      "You can name spawn, fork and forkserver and say which one your OS uses, "
      "explain why a pool needs a module-level function and a __main__ guard, "
      "list what cannot be pickled (lambdas, sockets, locks, event loops) and say"
      " when shared_memory beats pickling.",
      2, [], 2,
      [deck(2, "19-20"),
       lab(2, 8, "Threads vs processes vs one core"),
       midterm(MT_GIL)], True),

    S("python.concurrency-choice", "python", "Threads vs processes vs asyncio, per component",
      "You can take each component of a trading system (feed handler, "
      "reference-price poll, light and heavy signals, order gateway, logging) and"
      " choose asyncio, a thread or a process from where its time goes, "
      "defaulting to asyncio and measuring before you add a process.",
      2, [], 3,
      [deck(2, "6, 21"),
       lab(2, 8, "Threads vs processes vs one core"),
       hw(2),
       midterm(MT_GIL),
       final(FN_ASY)], True),

    S("python.to-thread", "python", "Handing blocking work off the event loop",
      "You can move a blocking call off the loop with await asyncio.to_thread, "
      "push a value from a thread into the loop with loop.call_soon_threadsafe, "
      "and explain why a thread must never touch an asyncio.Queue or any other "
      "loop object directly.",
      2, [], 3,
      [deck(2, "22, 26, 29"),
       lab(2, 6, "The one legitimate thread in this codebase"),
       hw(2),
       midterm(MT_GIL),
       final(FN_ASY)], True),


    # ================= session 3 =================
    S("tools.osi-stack", "tools", "The OSI stack, layer by layer",
      "You can name the seven OSI layers and give each one's job, PDU, header "
      "fields, protocols and devices, map them onto the four TCP/IP layers, and "
      "place DNS, TLS, the WebSocket and your JSON on the stack, so a failure can"
      " be read by its layer.",
      3, [], 3,
      [deck(3, "3-11"),
       {"type": "lab", "session": 3, "label": "Lab 3 · step 0 — The stack on your own laptop", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       midterm(MT_SOC)], True),

    S("tools.udp-tcp", "tools", "UDP vs TCP: market data vs order entry",
      "You can compare TCP and UDP on connection, unit, reliability, ordering, "
      "head-of-line blocking and fan-out, and pick TCP for order entry and UDP "
      "multicast for market data, numbering datagrams so a gap can be detected "
      "and filled.",
      3, [], 3,
      [deck(3, "12-13"),
       {"type": "lab", "session": 3, "label": "Lab 3 · step 1 — UDP vs TCP: multicast for market data", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       midterm(MT_SOC)], True),

    S("python.sockets", "python", "The socket API, call by call",
      "You can walk through socket/bind/listen/accept and "
      "connect/sendall/recv/close for TCP and socket/bind/sendto/recvfrom for "
      "UDP, and say what the kernel is doing at each call: the backlog of "
      "finished handshakes, recv returning b'' on FIN, TIME_WAIT and "
      "SO_REUSEADDR.",
      3, [], 3,
      [deck(3, "15-17"),
       {"type": "lab", "session": 3, "label": "Lab 3 · step 2 — The socket API, call by call", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       midterm(MT_SOC)], True),

    S("python.socket-examples", "python", "TCP echo, framing & a UDP pair",
      "You can write a TCP echo server and client with timeouts, add "
      "length-prefix or newline framing because one recv is not one message, and "
      "write a UDP sender and receiver that numbers its datagrams and survives "
      "silence.",
      3, [], 3,
      [deck(3, "18-20"),
       {"type": "lab", "session": 3, "label": "Lab 3 · step 3 — Server/client examples, run", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       hw(3),
       midterm(MT_SOC)], True),

    S("trading.fix-itch", "trading", "FIX, ITCH & OUCH on the wire",
      "You can read a FIX message tag by tag (8, 9, 35, 34, 11, 10 and the "
      "checksum), tell session messages from application messages, decode an ITCH"
      " Add Order with one struct call, and say what OUCH is and how venues "
      "recover a gap.",
      3, [], 2,
      [deck(3, "21-24"),
       {"type": "lab", "session": 3, "label": "Lab 3 · step 4 — One order as FIX, ITCH and JSON", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       midterm(MT_SOC)], True),

    S("python.websockets", "python", "WebSockets: upgrade, frames, ping/pong & reconnect",
      "You can describe the HTTP Upgrade that returns 101 Switching Protocols, "
      "read a frame header (FIN, opcode, mask, length), explain ping/pong and the"
      " close codes 1000 and 1006, and map AlgoArena's JSON-over-WebSocket onto "
      "FIX: what it keeps and what it leaves out.",
      3, [], 3,
      [deck(3, "24-30"),
       {"type": "lab", "session": 3, "label": "Lab 3 · step 5 — WebSockets", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       hw(3),
       project(3),
       midterm(MT_SOC),
       final(FN_ASY)], True),

    S("python.pydantic", "python", "Pydantic v2 models & validation at the edge",
      "You can define a message as a pydantic BaseModel with Literal-constrained "
      "fields, serialise it with model_dump_json, and explain why a "
      "ValidationError at the boundary beats a KeyError deep inside matching.",
      3, [], 3,
      [deck(3, "31-32"),
       {"type": "lab", "session": 3, "label": "Lab 3 · step 6 — The contract: what may be said, and what the venue does with junk", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       hw(3),
       midterm(MT_PYD),
       final(FN_OOP)], True),

    S("python.discriminated-union", "python", "Discriminated unions & type dispatch",
      "You can tag every message with a type field, build a union keyed on that "
      "discriminator so parsing is unambiguous, and dispatch on the parsed model "
      "instead of poking at raw dict keys.",
      3, [], 3,
      [deck(3, "33, 35"),
       {"type": "lab", "session": 3, "label": "Lab 3 · step 6 — The contract: what may be said, and what the venue does with junk", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       {"type": "lab", "session": 3, "label": "Lab 3 · step 7 — Talk to the exchange by hand", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       hw(3),
       midterm(MT_PYD),
       final(FN_OOP)], True),

    S("python.error-boundary", "python", "Rejecting malformed & unknown messages",
      "You can decide up front what happens to a malformed message, an unknown "
      "type and unparseable bytes, and implement log-and-skip versus "
      "close-the-connection without taking down a live bot over one bad frame.",
      3, [], 2,
      [deck(3, "33"),
       {"type": "lab", "session": 3, "label": "Lab 3 · step 6 — The contract: what may be said, and what the venue does with junk", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       hw(3),
       midterm(MT_SOC),
       final(FN_LIVE)], True),

    S("tools.protocol-contract", "tools", "A wire protocol as a versioned contract",
      "You can specify a protocol as a finite set of message types with required "
      "fields, directions and valid replies, and evolve it by adding optional "
      "fields with defaults so older clients keep working.",
      3, [], 3,
      [deck(3, "31, 34"),
       {"type": "lab", "session": 3, "label": "Lab 3 · step 6 — The contract: what may be said, and what the venue does with junk", "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"},
       hw(3),
       project(3),
       midterm(MT_SOC)], True),


    # ================= session 4 =================
    S("quant.event-driven-backtest", "quant", "The backtest pipeline and its goal",
      "You can draw the pipeline a backtest runs — data, replay loop, strategy, "
      "simulated fills and fees, accounting, metrics — and say what a backtest "
      "can falsify cheaply and what it cannot tell you.",
      4, [], 3,
      [hw(4),
       midterm(MT_BKT),
       final(FN_BKT)], True),

    S("quant.performance-metrics", "quant", "Sharpe, max drawdown & Calmar",
      "You can compute CAGR, Sharpe, max drawdown, Calmar and profit factor from "
      "an equity curve, and explain why a high Sharpe with a deep drawdown is "
      "untradeable.",
      4, [9], 3,
      [deck(9, "12"),
       hw(4),
       final(FN_BKT)], True),

    S("tools.sql-tick-store", "tools", "Tick data in a relational database",
      "You can write a SQL schema for trades, quotes and book snapshots with a "
      "composite (symbol, time) index, read a query plan to tell a search from a "
      "scan, and name the five reasons a row store struggles with tick history.",
      4, [], 2,
      [hw(4)], True),

    S("tools.column-store", "tools", "Column stores & time-series databases",
      "You can explain why a column store reads only the columns a query names, "
      "describe kdb+'s in-memory plus date-partitioned splayed layout and its "
      "q-sql, and place TimescaleDB, QuestDB, InfluxDB, ArcticDB and DuckDB on "
      "that map.",
      4, [], 2,
      [hw(4)], True),

    S("tools.as-of-join", "tools", "The as-of join",
      "You can match each trade to the last quote at or before it with aj in q, "
      "ASOF JOIN in DuckDB or merge_asof in pandas, choose the key and the "
      "direction on purpose, and explain why a forward match inside a backtest is"
      " look-ahead.",
      4, [], 3,
      [hw(4)], True),

    S("tools.headless-sim", "tools", "A deterministic replay on the logical clock",
      "You can replay a recorded tape or a seeded simulation in one process with "
      "no sockets, drive every decision from the logical clock instead of the "
      "machine's, and prove it with the same fill digest at any replay speed.",
      4, [6, 7, 8], 3,
      [deck(6, "18"),
       deck(7, "19"),
       hw(4),
       final(FN_CI)], False),

    S("quant.look-ahead", "quant", "Look-ahead bias",
      "You can find where a backtest used information that did not exist at "
      "decision time — an unlagged signal, a forward as-of match, a peek at the "
      "next book — fix it on the logical clock, and quantify how much of the edge"
      " was the leak.",
      4, [7], 3,
      [deck(7, "11"),
       hw(4),
       midterm(MT_BKT),
       final(FN_BKT)], True),

    S("quant.fill-simulation", "quant", "Fill simulation, costs & latency",
      "You can fill a simulated order at the next tick against the recorded depth"
      " instead of the last price, charge the taker fee, and show how fees, "
      "latency in ticks and turnover move P&L and drawdown.",
      4, [], 3,
      [hw(4),
       midterm(MT_BKT),
       final(FN_BKT)], True),


    # ================= session 7 =================
    S("quant.overfitting", "quant", "Overfitting, data snooping & bias-variance",
      "You can explain test error as bias plus variance plus irreducible noise, "
      "recognise that keeping the best of 500 variants fits noise, and defend "
      "against it with fewer parameters, counted trials and a held-out block.",
      7, [], 3,
      [deck(7, "9, 13"),
       hw(7),
       midterm(MT_BKT),
       final(FN_ML)], True),


    # ================= session 5 =================
    S("python.bigo", "python", "Big-O, amortized cost & space/time trade-offs",
      "You can place an operation on the O(1) / O(log n) / O(n) / O(n log n) / "
      "O(n squared) ladder, distinguish worst from average and amortized cost, "
      "and name the memory you spent to buy the speed.",
      5, [], 3,
      [deck(5, "5-6"),
       lab(5, 3, "The Big-O ladder, measured"),
       hw(5),
       midterm(MT_BKT),
       final(FN_CPX)], True),

    S("python.containers", "python", "dict, set, deque & heapq and their costs",
      "You can pick the container from the operation you repeat most — dict for "
      "keyed lookup, set for membership, deque(maxlen) for a rolling window, "
      "heapq for best-of-many — and quote each one's cost.",
      5, [], 3,
      [deck(5, "7-8"),
       lab(5, 2, "Heap + dict vs sorted list"),
       hw(5),
       midterm(MT_BKT),
       final(FN_CPX)], True),

    S("python.hot-loop", "python", "Speeding up a Python hot loop",
      "You can apply the standard levers in order of payoff — the right data "
      "structure, hoisting allocation out of the loop, binding a method to a "
      "local name, vectorising batch maths — and stop once the code is no longer "
      "hot.",
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
      "You can find the function that dominates a run with cProfile, then time "
      "the hot path with perf_counter using warm-up, repeats and the minimum, and"
      " refuse to optimise code that is called twice a session.",
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
      [deck(5, "16, 20"),
       deck(7, "18"),
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
      "operations, check the two agree with allclose, and explain where the order"
      " of magnitude comes from.",
      6, [], 3,
      [deck(6, "7, 19"),
       lab(6, 3, "Python loop vs vectorised, timed and checked"),
       hw(6),
       final(FN_NP)], True),

    S("python.chunking", "python", "Chunked, bounded-memory processing",
      "You can process a file larger than memory as a stream of chunks with a "
      "running reduction, and show that peak memory stays flat while a "
      "load-it-all version scales with the file.",
      6, [], 3,
      [deck(6, "8"),
       lab(6, 4, "Chunked processing — bounded memory"),
       hw(6),
       final(FN_NP)], True),

    S("python.multiprocessing", "python", "Process pools & the map-reduce fan-out",
      "You can shard an embarrassingly parallel workload by symbol or parameter, "
      "fan it out with ProcessPoolExecutor under a __main__ guard, and reduce the"
      " partial results into one answer.",
      6, [], 3,
      [deck(6, "12-14, 20"),
       lab(6, 5, "Map-reduce across processes"),
       hw(6),
       project(7),
       midterm(MT_GIL),
       final(FN_NP)], True),


    # ================= session 4 =================
    S("tools.parquet", "tools", "Parquet, partitions & predicate pushdown",
      "You can convert a tape to partitioned Parquet, explain row groups, footer "
      "statistics, dictionary encoding and projection, query the files in place "
      "with DuckDB or Polars, and reuse them as a feature cache.",
      4, [6], 3,
      [deck(6, "6, 9"),
       lab(6, 6, "Columnar vs row storage"),
       hw(4),
       hw(6),
       project(7),
       final(FN_NP)], True),


    # ================= session 6 =================
    S("tools.determinism", "tools", "Deterministic, network-free runs",
      "You can make a run reproducible by pinning the seed, injecting the clock "
      "and ids, and keeping the network out of it, and explain why an idempotent "
      "task keyed by its inputs is safe to retry.",
      6, [8], 3,
      [deck(6, "15"),
       deck(8, "9"),
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
      "sufficient, read hit rate together with average win over average loss, and"
      " judge a signal on out-of-sample Sharpe and P&L net of fees, spread and "
      "turnover.",
      7, [], 3,
      [deck(7, "14"),
       lab(7, 5, "Walk-forward, and the shuffled-label control"),
       hw(7),
       final(FN_ML)], True),

    S("quant.model-ops", "quant", "Persist, serve, monitor & retrain a model",
      "You can train offline, serialise the fitted model with its feature list "
      "and version, load it once outside the hot path, time predict against the "
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
      [deck(8, "5"),
       deck(9, "5, 7"),
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
      "stable-to-volatile so the install layer caches, and argue that the image "
      "is what makes 'works on my machine' a testable claim.",
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
      "excess-return-over-volatility ratio, and show how a multiplicative "
      "drawdown penalty makes the steady book beat the lucky one.",
      9, [], 3,
      [deck(9, "13, 17"),
       lab(9, 5, "Why the season score is risk-adjusted"),
       hw(9),
       project(9),
       final(FN_BKT)], True),

    S("trading.portfolio-pnl", "trading", "Realized & unrealized P&L marked to mid",
      "You can maintain cash, positions and average entry price from a stream of "
      "fills, split realized from unrealized P&L, and mark a book to the venue "
      "mid to get net worth.",
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
      "You can write a run-book as symptom, diagnosis, action before you need it,"
      " write a blameless postmortem with timeline, root cause and fixes "
      "afterwards, and turn each incident into a regression test.",
      9, [], 2,
      [deck(9, "9, 14"),
       lab(9, 7, "The postmortem skeleton"),
       hw(9),
       project(9),
       final(FN_LIVE)], False),
]

# --------------------------------------------------------------------------
# sessions: the checklist order of each session, in teaching order (hand-kept;
# tools/validate_skills.py checks it against introduced + practised)
# --------------------------------------------------------------------------
SESSION_SKILLS = {
    0: ["trading.clob", "trading.order-types", "trading.market-making", "trading.market-impact", "trading.primary-secondary", "quant.five-pillars", "tools.venv", "tools.smoke-test", "tools.genai-workflow"],
    1: ["tools.venv", "tools.genai-workflow", "python.classes", "python.abc", "python.inheritance", "python.dataclasses", "python.strategy-pattern", "tools.uml", "tools.git-branching"],
    2: ["python.abc", "tools.uml", "python.gil", "python.coroutines", "python.event-loop", "python.asyncio-queue", "python.non-blocking", "python.async-races", "python.threading", "python.executors", "python.start-methods", "python.concurrency-choice", "python.to-thread", "python.reconnect"],
    3: ["tools.osi-stack", "tools.udp-tcp", "python.sockets", "python.socket-examples", "trading.fix-itch", "python.websockets", "python.reconnect", "python.asyncio-queue", "python.pydantic", "python.discriminated-union", "python.error-boundary", "tools.protocol-contract"],
    4: ["quant.event-driven-backtest", "quant.performance-metrics", "tools.sql-tick-store", "tools.column-store", "tools.as-of-join", "tools.parquet", "tools.headless-sim", "quant.look-ahead", "quant.fill-simulation"],
    5: ["trading.clob", "python.bigo", "python.containers", "python.hot-loop", "quant.rolling-stats", "trading.price-time-priority", "tools.profiling", "tools.latency-tail"],
    6: ["python.gil", "tools.headless-sim", "python.pandas-memory", "python.numpy-vectorize", "python.chunking", "python.multiprocessing", "tools.parquet", "tools.determinism", "trading.multi-venue"],
    7: ["quant.look-ahead", "quant.overfitting", "tools.headless-sim", "tools.latency-tail", "quant.supervised-setup", "quant.feature-engineering", "quant.walk-forward", "quant.signal-scoring", "quant.model-ops"],
    8: ["tools.git-branching", "tools.headless-sim", "tools.determinism", "tools.test-pyramid", "tools.pytest", "tools.mocking-async", "tools.github-actions", "tools.docker", "tools.observability"],
    9: ["quant.performance-metrics", "tools.test-pyramid", "quant.risk-controls", "quant.tearsheet", "quant.risk-adjusted-score", "trading.portfolio-pnl", "trading.reconciliation", "tools.failure-modes", "tools.runbook"],
}

# a session whose student-facing page is a combined companion page: the skills
# dashboard links there and session-N.html shows a banner pointing to it
COMBINED = {4: COMPANION + "week4.html"}


def build_sessions():
    out = []
    for n, date, title, exam in SESSION_META:
        ids = SESSION_SKILLS[n]
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
        if n in COMBINED:
            s["combined_url"] = COMBINED[n]
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
