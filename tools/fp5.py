# -*- coding: utf-8 -*-
"""focus.js slice — FINM 33500, Session 5 (Fri Oct 30): MIDTERM WEEK.

Added 2026-10-11 with the resequence (the instructor's decision): Week 5 is the
midterm only. No lecture, no deck, no lab and no new skills; the page says what
the midterm covers (Weeks 1-4) and how to prepare. The graded live block does
NOT move: it still runs that evening with the season week-5 rules. No code
snippets and no interview questions here on purpose — tools/validate_focus.py
exempts this session from those two minimums.
"""

s5 = {
    "n": 5,
    "focus": "Midterm week: review Weeks 1–4",
    "tagline": "No lecture and no new material this Friday: the midterm covers Weeks 1–4, and the graded live block still runs in the evening.",
    "concepts": [
        {
            "title": "What the midterm covers",
            "text": "Weeks 1 to 4, and nothing after them. Week 1: the Python object model, abstract base classes, dataclasses and the UML that describes them. Week 2: concurrency — coroutines and the event loop, threads and the GIL, process pools, and which one a given component needs. Week 3: the network stack, sockets, WebSockets, wire protocols and pydantic message schemas. Week 4: backtesting and its data — the event-driven backtester, look-ahead as a clock violation, fill simulation, SQL, time-series stores and Parquet, as-of joins. Algorithmic complexity and data structures are taught after the midterm, in Week 6, and are not examined on it. The window, the rules and the format are on the Midterm Exam page on Canvas.",
        },
        {
            "title": "Prepare from the checklists, not from the slides",
            "text": "Open the Week 1 to Week 4 pages of this dashboard and read every \"You can…\" sentence as a question you might be asked. Tick only the ones that are true of you today; every unticked sentence is a review item, and the chips under it name the deck slides, lab parts and homework where it was taught. Re-reading a deck front to back feels productive and is not: retrieval is what the exam measures, so practise retrieving.",
        },
        {
            "title": "Then answer the interview questions out loud",
            "text": "Each of the Week 1 to Week 4 pages ends with interview questions, from warm-up to senior. Answer each one before opening the model answer, then compare. Redo the part of HW 1 to HW 4 you were least sure of, without looking at your submission, and take the Mock Midterm on Canvas under exam conditions — one sitting, no notes, timed.",
        },
        {
            "title": "The live block still runs that evening",
            "text": "The season does not pause for the exam. The graded live block for season week 5 runs on Friday Oct 30 in the evening: it starts at about 20:00 CT with the usual 10-minute pre-open, the market opens at about 20:10, and the block lasts 60 minutes in total. Week 5 is the risk week — circuit breakers, stops and liquidation are live — so have your bot's risk layer in place and tested before the midterm, not after it.",
        },
    ],
    "hft": {
        "paragraphs": [
            "The four weeks on the midterm are the four layers every systematic trading system is built from, in the order they depend on each other. The object model is how a strategy, a broker and a venue become interchangeable parts; concurrency is how one process listens to a market while it thinks; the wire is how those parts talk across machines; and the data and the backtester are how you decide, before risking capital, whether the thinking was any good.",
            "A desk interview tests the same layers, in the same way: not whether you remember a definition, but whether you can say what breaks when one layer is wrong. A blocking call in the event loop, a message schema that accepts junk, a backtest that reads the wall clock — each one looks fine in isolation and costs money in a live session. The midterm questions are written in that spirit.",
            "That is also why the evening's live block is not a distraction from the exam. The week-5 risk rules punish exactly the failures the midterm asks about: a bot that cannot keep up with the feed, cannot parse the venue's messages, or trades on a signal that was only ever profitable with look-ahead will meet a stop or a liquidation, and the season score records it.",
        ],
    },
    "interview": [],
}

SESSIONS = [s5]
