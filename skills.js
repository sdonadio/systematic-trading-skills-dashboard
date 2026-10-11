window.SKILLS = {
  "course": {
    "code": "FINM 33500",
    "title": "Systematic Trading Technologies",
    "institution": "University of Chicago",
    "term": "Autumn 2026",
    "sessions_url": "https://canvas.uchicago.edu/courses/74211",
    "starter_url": "https://github.com/sdonadio/algoarena-team-template",
    "companion_url": "https://sdonadio.github.io/systematic-trading-arena/",
    "lms": "Canvas",
    "lang": "Python",
    "session_word": "Week",
    "deck_word": "Week",
    "accent": "#800000",
    "accent_2": "#d6d6ce",
    "storage_prefix": "finm-st-skills"
  },
  "categories": [
    {
      "id": "python",
      "name": "Python & async engineering",
      "color": "#800000"
    },
    {
      "id": "quant",
      "name": "Signals, backtesting & risk",
      "color": "#1f6f8b"
    },
    {
      "id": "tools",
      "name": "Tooling & engineering",
      "color": "#2e8b57"
    },
    {
      "id": "trading",
      "name": "Markets & microstructure",
      "color": "#b8860b"
    }
  ],
  "sessions": [
    {
      "n": 0,
      "date": "2026-09-18",
      "title": "Setup & the Green Smoke Test",
      "decks": [
        "w0"
      ],
      "lab": null,
      "hw": {
        "label": "Welcome Survey - Your Background & Goals",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901640",
        "due": "2026-10-05"
      },
      "project": null,
      "exam": null,
      "companion_url": "https://sdonadio.github.io/systematic-trading-arena/",
      "skills": [
        "trading.clob",
        "trading.order-types",
        "trading.market-making",
        "trading.market-impact",
        "trading.primary-secondary",
        "quant.five-pillars",
        "tools.venv",
        "tools.smoke-test",
        "tools.genai-workflow"
      ]
    },
    {
      "n": 1,
      "date": "2026-10-02",
      "title": "UML & Object-Oriented Programming",
      "decks": [
        "w1"
      ],
      "lab": {
        "label": "Lab 1 — UML & the Arena SDK",
        "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-1-uml-and-the-arena-sdk"
      },
      "hw": {
        "label": "HW 1 — UML & your first bot",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901643",
        "due": "2026-10-10"
      },
      "project": {
        "label": "Phase 0 — Team, Role & Capital Allocation",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901652",
        "due": "2026-10-10"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/systematic-trading-arena/week1.html",
      "skills": [
        "tools.venv",
        "tools.genai-workflow",
        "python.classes",
        "python.abc",
        "python.inheritance",
        "python.dataclasses",
        "python.strategy-pattern",
        "tools.uml",
        "tools.git-branching"
      ]
    },
    {
      "n": 2,
      "date": "2026-10-09",
      "title": "Concurrency & Async in Python",
      "decks": [
        "w2"
      ],
      "lab": {
        "label": "Lab 2 — Concurrency & the Event Loop",
        "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
      },
      "hw": {
        "label": "HW 2 — Async concurrency with asyncio",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901644",
        "due": "2026-10-17"
      },
      "project": null,
      "exam": null,
      "companion_url": "https://sdonadio.github.io/systematic-trading-arena/week2.html",
      "skills": [
        "python.abc",
        "tools.uml",
        "python.gil",
        "python.coroutines",
        "python.event-loop",
        "python.asyncio-queue",
        "python.non-blocking",
        "python.async-races",
        "python.threading",
        "python.executors",
        "python.start-methods",
        "python.concurrency-choice",
        "python.to-thread",
        "python.reconnect"
      ]
    },
    {
      "n": 3,
      "date": "2026-10-16",
      "title": "Socket Streaming & Protocols",
      "decks": [
        "w3"
      ],
      "lab": {
        "label": "Lab 3 — Socket Streaming & Protocols",
        "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
      },
      "hw": {
        "label": "HW 3 — Protocols & pydantic message schemas",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901645",
        "due": "2026-10-24"
      },
      "project": {
        "label": "Phase 1 — Connect & Trade for Real",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901653",
        "due": "2026-10-24"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/systematic-trading-arena/week3.html",
      "skills": [
        "tools.osi-stack",
        "tools.udp-tcp",
        "python.sockets",
        "python.socket-examples",
        "trading.fix-itch",
        "python.websockets",
        "python.reconnect",
        "python.asyncio-queue",
        "python.pydantic",
        "python.discriminated-union",
        "python.error-boundary",
        "tools.protocol-contract"
      ]
    },
    {
      "n": 4,
      "date": "2026-10-23",
      "title": "Backtesting and Its Data",
      "decks": [
        "w4"
      ],
      "lab": {
        "label": "Lab 4 — Backtesting and Its Data",
        "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-4-the-tape-as-a-dataset"
      },
      "hw": {
        "label": "HW 4 — Your tapes in SQL and Parquet, and a backtest you can trust",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901646",
        "due": "2026-10-31"
      },
      "project": null,
      "exam": null,
      "companion_url": "https://sdonadio.github.io/systematic-trading-arena/week4.html",
      "skills": [
        "quant.event-driven-backtest",
        "quant.performance-metrics",
        "tools.sql-tick-store",
        "tools.column-store",
        "tools.as-of-join",
        "tools.parquet",
        "tools.headless-sim",
        "quant.look-ahead",
        "quant.fill-simulation"
      ],
      "combined_url": "https://sdonadio.github.io/systematic-trading-arena/week4.html"
    },
    {
      "n": 5,
      "date": "2026-10-30",
      "title": "Algorithmic Complexity & Data Structures",
      "decks": [
        "w5"
      ],
      "lab": {
        "label": "Lab 5 — Complexity & Data Structures",
        "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-5-complexity-and-data-structures"
      },
      "hw": {
        "label": "HW 5 — Complexity & the order book data structure",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901647",
        "due": "2026-11-07"
      },
      "project": {
        "label": "Phase 2 — A Real Edge, Backtested",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901654",
        "due": "2026-11-07"
      },
      "exam": "midterm",
      "companion_url": "https://sdonadio.github.io/systematic-trading-arena/week5.html",
      "skills": [
        "trading.clob",
        "python.bigo",
        "python.containers",
        "python.hot-loop",
        "quant.rolling-stats",
        "trading.price-time-priority",
        "tools.profiling",
        "tools.latency-tail"
      ]
    },
    {
      "n": 6,
      "date": "2026-11-06",
      "title": "Big Data & Distributed Computing",
      "decks": [
        "w6"
      ],
      "lab": {
        "label": "Lab 6 — Big Data",
        "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-6-big-data"
      },
      "hw": {
        "label": "HW 6 — Big data: vectorize your signal",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901648",
        "due": "2026-11-14"
      },
      "project": null,
      "exam": null,
      "companion_url": "https://sdonadio.github.io/systematic-trading-arena/week6.html",
      "skills": [
        "python.gil",
        "tools.headless-sim",
        "python.pandas-memory",
        "python.numpy-vectorize",
        "python.chunking",
        "python.multiprocessing",
        "tools.parquet",
        "tools.determinism",
        "trading.multi-venue"
      ]
    },
    {
      "n": 7,
      "date": "2026-11-13",
      "title": "Machine Learning Signals & Model Ops",
      "decks": [
        "w7"
      ],
      "lab": {
        "label": "Lab 7 — ML Signals & Model Ops",
        "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-7-ml-signals-and-model-ops"
      },
      "hw": {
        "label": "HW 7 — ML signals & model ops",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901649",
        "due": "2026-11-21"
      },
      "project": {
        "label": "Phase 3 — Risk & Robustness",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901655",
        "due": "2026-11-21"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/systematic-trading-arena/week7.html",
      "skills": [
        "quant.look-ahead",
        "quant.overfitting",
        "tools.headless-sim",
        "tools.latency-tail",
        "quant.supervised-setup",
        "quant.feature-engineering",
        "quant.walk-forward",
        "quant.signal-scoring",
        "quant.model-ops"
      ]
    },
    {
      "n": 8,
      "date": "2026-11-20",
      "title": "CI/CD, Testing & UI",
      "decks": [
        "w8"
      ],
      "lab": {
        "label": "Lab 8 — CI/CD, Testing & the Dashboard",
        "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-8-ci-slash-cd-testing-and-the-dashboard"
      },
      "hw": {
        "label": "HW 8 — CI/CD, testing & a bot you trust",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901650",
        "due": "2026-11-28"
      },
      "project": {
        "label": "Phase 4 — Scale & Operations",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901656",
        "due": "2026-12-04"
      },
      "exam": null,
      "companion_url": "https://sdonadio.github.io/systematic-trading-arena/week8.html",
      "skills": [
        "tools.git-branching",
        "tools.headless-sim",
        "tools.determinism",
        "tools.test-pyramid",
        "tools.pytest",
        "tools.mocking-async",
        "tools.github-actions",
        "tools.docker",
        "tools.observability"
      ]
    },
    {
      "n": 9,
      "date": "2026-12-04",
      "title": "Integration & Demo — Season Finale",
      "decks": [
        "w9"
      ],
      "lab": {
        "label": "Lab 9 — Integration, Failure Drills & the Demo",
        "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-9-integration-failure-drills-and-the-demo"
      },
      "hw": {
        "label": "HW 9 — Integration & season-finale demo",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901651",
        "due": "2026-12-12"
      },
      "project": {
        "label": "Phase 5 — Season Finale: Demo & Postmortem",
        "url": "https://canvas.uchicago.edu/courses/74211/assignments/901657",
        "due": "2026-12-12"
      },
      "exam": "final",
      "companion_url": "https://sdonadio.github.io/systematic-trading-arena/week9.html",
      "skills": [
        "quant.performance-metrics",
        "tools.test-pyramid",
        "quant.risk-controls",
        "quant.tearsheet",
        "quant.risk-adjusted-score",
        "trading.portfolio-pnl",
        "trading.reconciliation",
        "tools.failure-modes",
        "tools.runbook"
      ]
    }
  ],
  "skills": [
    {
      "id": "trading.clob",
      "category": "trading",
      "name": "The central limit order book",
      "can": "You can read a two-sided limit order book and compute best bid, best ask, spread, mid and available depth from it, and say where a market order fills.",
      "introduced": 0,
      "practised": [
        5
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 0,
          "label": "Deck Week 0 · slide 11"
        },
        {
          "type": "deck",
          "session": 5,
          "label": "Deck Week 5 · slide 11"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab 5 · part 1 — Time the CLOB against n",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-5-complexity-and-data-structures"
        },
        {
          "type": "exam",
          "label": "Final · group: Order Books, Matching & Market Microstructure in Code"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.order-types",
      "category": "trading",
      "name": "Order types & the execution trade-off",
      "can": "You can choose between market, limit, stop, IOC/FOK, post-only and TWAP/VWAP orders and justify the certainty-of-price versus certainty-of-execution trade-off each one makes.",
      "introduced": 0,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 0,
          "label": "Deck Week 0 · slide 12"
        },
        {
          "type": "hw",
          "label": "HW 3 — Protocols & pydantic message schemas",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901645"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.market-making",
      "category": "trading",
      "name": "Making markets: spread, inventory, toxic flow",
      "can": "You can explain how a market maker earns the spread, decompose that spread into order processing, inventory risk and adverse selection, and say why inventory and informed flow are the two things that kill the P&L.",
      "introduced": 0,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 0,
          "label": "Deck Week 0 · slides 13–14"
        },
        {
          "type": "project",
          "label": "Phase 1 — Connect & Trade for Real",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901653"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.market-impact",
      "category": "trading",
      "name": "Market impact & price discovery",
      "can": "You can explain why your own order moves the price against you, estimate impact as growing with size relative to average daily volume, and separate temporary impact from permanent price discovery.",
      "introduced": 0,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 0,
          "label": "Deck Week 0 · slides 14–15"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.primary-secondary",
      "category": "trading",
      "name": "Primary vs secondary markets & IPOs",
      "can": "You can distinguish a primary-market issue (IPO, secondary offering, bond issuance) from secondary-market trading, and describe how a bookbuild prices and allocates a deal before it lists.",
      "introduced": 0,
      "practised": [],
      "depth": 1,
      "where": [
        {
          "type": "deck",
          "session": 0,
          "label": "Deck Week 0 · slide 9"
        }
      ],
      "interview": false
    },
    {
      "id": "quant.five-pillars",
      "category": "quant",
      "name": "The five pillars of a systematic system",
      "can": "You can decompose any systematic trading system into signal, strategy, execution, risk management and portfolio, and say which pillar a given bug or loss belongs to.",
      "introduced": 0,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 0,
          "label": "Deck Week 0 · slide 16"
        },
        {
          "type": "project",
          "label": "Phase 5 — Season Finale: Demo & Postmortem",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901657"
        },
        {
          "type": "exam",
          "label": "Final · group: Live Systems: Risk, Reconciliation & Failure Modes"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.venv",
      "category": "tools",
      "name": "A pinned Python 3.11 environment",
      "can": "You can create an isolated Python 3.11 environment, install a project from its pinned requirements, and diagnose the usual breakages (wrong interpreter, pydantic v1/v2 mix, a missing .env).",
      "introduced": 0,
      "practised": [
        1
      ],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 0,
          "label": "Deck Week 0 · slides 27–29"
        },
        {
          "type": "hw",
          "label": "Welcome Survey - Your Background & Goals",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901640"
        }
      ],
      "interview": false
    },
    {
      "id": "tools.smoke-test",
      "category": "tools",
      "name": "The green smoke test",
      "can": "You can define a smoke test as one fast pass over the critical path, run the course suite until every check is green, and explain why a skipped check is not a passing check.",
      "introduced": 0,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 0,
          "label": "Deck Week 0 · slides 28, 35"
        },
        {
          "type": "hw",
          "label": "Welcome Survey - Your Background & Goals",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901640"
        },
        {
          "type": "exam",
          "label": "Final · group: Testing, CI/CD & Reproducibility"
        }
      ],
      "interview": false
    },
    {
      "id": "tools.genai-workflow",
      "category": "tools",
      "name": "GenAI as a dev tool — and its limits",
      "can": "You can use an LLM to scaffold, review and explain trading code with explicit constraints, and name the three places it fails you: novel alpha, financial maths and anything about live runtime state.",
      "introduced": 0,
      "practised": [
        1
      ],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 0,
          "label": "Deck Week 0 · slides 31–33"
        },
        {
          "type": "deck",
          "session": 1,
          "label": "Deck Week 1 · slide 23"
        },
        {
          "type": "hw",
          "label": "Welcome Survey - Your Background & Goals",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901640"
        }
      ],
      "interview": false
    },
    {
      "id": "python.classes",
      "category": "python",
      "name": "Classes, objects & encapsulation",
      "can": "You can write a class with instance and class attributes, hide internals behind the _name/__name conventions, and expose computed state read-only with @property.",
      "introduced": 1,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck Week 1 · slides 7, 9"
        },
        {
          "type": "lab",
          "session": 1,
          "label": "Lab 1 · part 3 — The objects your hook receives = the boxes of your diagram",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-1-uml-and-the-arena-sdk"
        },
        {
          "type": "hw",
          "label": "HW 1 — UML & your first bot",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901643"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Python Object Model & OOP Design"
        },
        {
          "type": "exam",
          "label": "Final · group: OOP, Dataclasses & Pydantic (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.abc",
      "category": "python",
      "name": "ABCs, polymorphism & duck typing",
      "can": "You can define an abstract base class with @abstractmethod so subclasses must implement a hook, explain why instantiating the ABC raises TypeError, and say when duck typing is enough instead.",
      "introduced": 1,
      "practised": [
        2
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck Week 1 · slides 8, 11–12"
        },
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slide 29"
        },
        {
          "type": "lab",
          "session": 1,
          "label": "Lab 1 · part 2 — The ABC bites — abstraction you cannot skip",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-1-uml-and-the-arena-sdk"
        },
        {
          "type": "hw",
          "label": "HW 1 — UML & your first bot",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901643"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Python Object Model & OOP Design"
        },
        {
          "type": "exam",
          "label": "Final · group: OOP, Dataclasses & Pydantic (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.inheritance",
      "category": "python",
      "name": "Inheritance, composition & SOLID",
      "can": "You can decide between IS-A inheritance with super() and HAS-A composition, and justify the call with the single-responsibility, open/closed and dependency-inversion principles.",
      "introduced": 1,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck Week 1 · slides 10, 14"
        },
        {
          "type": "lab",
          "session": 1,
          "label": "Lab 1 · part 5 — Find the four pillars in the starter bot",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-1-uml-and-the-arena-sdk"
        },
        {
          "type": "hw",
          "label": "HW 1 — UML & your first bot",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901643"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Python Object Model & OOP Design"
        },
        {
          "type": "exam",
          "label": "Final · group: OOP, Dataclasses & Pydantic (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.dataclasses",
      "category": "python",
      "name": "Dataclasses as value objects",
      "can": "You can declare a @dataclass to get __init__, __repr__ and __eq__ from type hints alone, and say when you need a validating pydantic model instead.",
      "introduced": 1,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck Week 1 · slide 13"
        },
        {
          "type": "hw",
          "label": "HW 1 — UML & your first bot",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901643"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Dataclasses, Pydantic & Message Schemas"
        },
        {
          "type": "exam",
          "label": "Final · group: OOP, Dataclasses & Pydantic (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.strategy-pattern",
      "category": "python",
      "name": "The strategy pattern behind a plugin registry",
      "can": "You can express interchangeable trading logic as one interface with many implementations, register them as plugins, and swap a strategy without touching the engine that calls it.",
      "introduced": 1,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck Week 1 · slides 11, 21"
        },
        {
          "type": "lab",
          "session": 1,
          "label": "Lab 1 · part 6 — Strategy pattern — two strategies, one interface",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-1-uml-and-the-arena-sdk"
        },
        {
          "type": "hw",
          "label": "HW 1 — UML & your first bot",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901643"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Python Object Model & OOP Design"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.uml",
      "category": "tools",
      "name": "UML class & sequence diagrams",
      "can": "You can draw a class diagram with visibility, typed members, generalization, aggregation, composition, dependency and multiplicity, and a sequence diagram showing who calls whom in what order.",
      "introduced": 1,
      "practised": [
        2
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck Week 1 · slides 17–19, 22"
        },
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slide 27"
        },
        {
          "type": "lab",
          "session": 1,
          "label": "Lab 1 · part 4 — Sketch the UML — on the board, then in your repo",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-1-uml-and-the-arena-sdk"
        },
        {
          "type": "hw",
          "label": "HW 1 — UML & your first bot",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901643"
        },
        {
          "type": "project",
          "label": "Phase 0 — Team, Role & Capital Allocation",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901652"
        }
      ],
      "interview": false
    },
    {
      "id": "tools.git-branching",
      "category": "tools",
      "name": "Git feature branches & a readable history",
      "can": "You can work a week on its own feature branch, keep commits small and legible, and explain why a repository history that shows how a system was built is itself a deliverable.",
      "introduced": 1,
      "practised": [
        8
      ],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 1,
          "label": "Deck Week 1 · slides 25–26"
        },
        {
          "type": "deck",
          "session": 8,
          "label": "Deck Week 8 · slide 21"
        },
        {
          "type": "hw",
          "label": "HW 1 — UML & your first bot",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901643"
        },
        {
          "type": "project",
          "label": "Phase 0 — Team, Role & Capital Allocation",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901652"
        }
      ],
      "interview": false
    },
    {
      "id": "python.gil",
      "category": "python",
      "name": "The GIL: I/O-bound vs CPU-bound work",
      "can": "You can explain that CPython's GIL lets one thread execute bytecode at a time and is released around blocking I/O, classify a piece of work as I/O-bound or CPU-bound, and predict from that whether threads will speed it up.",
      "introduced": 2,
      "practised": [
        6
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slides 5–7, 14"
        },
        {
          "type": "deck",
          "session": 6,
          "label": "Deck Week 6 · slide 12"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 2 — Concurrency is not parallelism — prove it",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 8 — Threads vs processes vs one core",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "hw",
          "label": "HW 2 — Async concurrency with asyncio",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901644"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Threads, the GIL & Concurrency Pitfalls"
        },
        {
          "type": "exam",
          "label": "Final · group: asyncio & Concurrency (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.coroutines",
      "category": "python",
      "name": "Coroutines: async def & await",
      "can": "You can write a coroutine with async def, explain that calling it returns a coroutine object rather than running it, and say exactly what await does to control flow.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slide 8"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 1 — Where is the loop? Ask the code",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "hw",
          "label": "HW 2 — Async concurrency with asyncio",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901644"
        },
        {
          "type": "exam",
          "label": "Midterm · group: asyncio: Coroutines, Tasks & the Event Loop"
        },
        {
          "type": "exam",
          "label": "Final · group: asyncio & Concurrency (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.event-loop",
      "category": "python",
      "name": "The event loop, tasks & gather",
      "can": "You can start a loop with asyncio.run, schedule work with create_task, await many coroutines at once with gather, and explain why concurrent is not parallel on one thread.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slides 9, 25"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 2 — Concurrency is not parallelism — prove it",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "hw",
          "label": "HW 2 — Async concurrency with asyncio",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901644"
        },
        {
          "type": "exam",
          "label": "Midterm · group: asyncio: Coroutines, Tasks & the Event Loop"
        },
        {
          "type": "exam",
          "label": "Final · group: asyncio & Concurrency (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.asyncio-queue",
      "category": "python",
      "name": "asyncio.Queue & backpressure",
      "can": "You can decouple a fast producer from a slower consumer with an asyncio.Queue, and explain how a maxsize bound turns into backpressure instead of unbounded memory growth.",
      "introduced": 2,
      "practised": [
        3
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slides 10, 27"
        },
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slide 29"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 3 — Feed → asyncio.Queue → strategy",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "hw",
          "label": "HW 2 — Async concurrency with asyncio",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901644"
        },
        {
          "type": "exam",
          "label": "Midterm · group: asyncio: Coroutines, Tasks & the Event Loop"
        },
        {
          "type": "exam",
          "label": "Final · group: asyncio & Concurrency (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.non-blocking",
      "category": "python",
      "name": "Never block the event loop",
      "can": "You can spot the calls that freeze every task on a loop (time.sleep, blocking HTTP, a heavy computation), prove the stall with debug=True or a heartbeat measurement, and keep a synchronous on_tick returning fast.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slides 11, 26, 29"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 4 — One blocking call freezes everything",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "hw",
          "label": "HW 2 — Async concurrency with asyncio",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901644"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Threads, the GIL & Concurrency Pitfalls"
        },
        {
          "type": "exam",
          "label": "Final · group: asyncio & Concurrency (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.async-races",
      "category": "python",
      "name": "Races, atomicity between awaits & locks",
      "can": "You can explain why a single-threaded loop makes plain state updates between awaits atomic, identify a read-modify-write that spans an await, and choose asyncio.Lock, a queue or a thread lock accordingly.",
      "introduced": 2,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slide 12"
        },
        {
          "type": "hw",
          "label": "HW 2 — Async concurrency with asyncio",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901644"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Threads, the GIL & Concurrency Pitfalls"
        },
        {
          "type": "exam",
          "label": "Final · group: asyncio & Concurrency (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.reconnect",
      "category": "python",
      "name": "Disconnects, heartbeats & idempotent retries",
      "can": "You can catch a closed WebSocket without crashing the bot, reconnect with exponential backoff and re-sync state from a fresh snapshot, and use client-side ids so a retried order cannot double-execute.",
      "introduced": 2,
      "practised": [
        3
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slides 25, 31"
        },
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slides 28, 34"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 7 — Survive a drop (this is what kills student bots)",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 5 — WebSockets",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "hw",
          "label": "HW 2 — Async concurrency with asyncio",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901644"
        },
        {
          "type": "project",
          "label": "Phase 1 — Connect & Trade for Real",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901653"
        },
        {
          "type": "exam",
          "label": "Final · group: Live Systems: Risk, Reconciliation & Failure Modes"
        }
      ],
      "interview": true
    },
    {
      "id": "python.threading",
      "category": "python",
      "name": "threading: Thread, Lock, Queue & Event",
      "can": "You can start and join threading.Thread workers, hand data between them with a queue.Queue and stop them with an Event, and find and fix a read-modify-write race with a Lock (or an RLock when a locked method calls another).",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slides 15–16"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 8 — Threads vs processes vs one core",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "hw",
          "label": "HW 2 — Async concurrency with asyncio",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901644"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Threads, the GIL & Concurrency Pitfalls"
        },
        {
          "type": "exam",
          "label": "Final · group: asyncio & Concurrency (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.executors",
      "category": "python",
      "name": "ThreadPoolExecutor vs ProcessPoolExecutor, measured",
      "can": "You can run the same job through ThreadPoolExecutor and ProcessPoolExecutor, time sequential vs threads vs processes, and justify the pool you pick from that measurement, including when start-up and pickling make a process pool slower than one core.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slides 17–18, 23"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 8 — Threads vs processes vs one core",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Threads, the GIL & Concurrency Pitfalls"
        },
        {
          "type": "exam",
          "label": "Final · group: asyncio & Concurrency (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.start-methods",
      "category": "python",
      "name": "Start methods, pickling & shared memory",
      "can": "You can name spawn, fork and forkserver and say which one your OS uses, explain why a pool needs a module-level function and a __main__ guard, list what cannot be pickled (lambdas, sockets, locks, event loops) and say when shared_memory beats pickling.",
      "introduced": 2,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slides 19–20"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 8 — Threads vs processes vs one core",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Threads, the GIL & Concurrency Pitfalls"
        }
      ],
      "interview": true
    },
    {
      "id": "python.concurrency-choice",
      "category": "python",
      "name": "Threads vs processes vs asyncio, per component",
      "can": "You can take each component of a trading system (feed handler, reference-price poll, light and heavy signals, order gateway, logging) and choose asyncio, a thread or a process from where its time goes, defaulting to asyncio and measuring before you add a process.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slides 6, 21"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 8 — Threads vs processes vs one core",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "hw",
          "label": "HW 2 — Async concurrency with asyncio",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901644"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Threads, the GIL & Concurrency Pitfalls"
        },
        {
          "type": "exam",
          "label": "Final · group: asyncio & Concurrency (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.to-thread",
      "category": "python",
      "name": "Handing blocking work off the event loop",
      "can": "You can move a blocking call off the loop with await asyncio.to_thread, push a value from a thread into the loop with loop.call_soon_threadsafe, and explain why a thread must never touch an asyncio.Queue or any other loop object directly.",
      "introduced": 2,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 2,
          "label": "Deck Week 2 · slides 22, 26, 29"
        },
        {
          "type": "lab",
          "session": 2,
          "label": "Lab 2 · part 6 — The one legitimate thread in this codebase",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-2-concurrency-and-the-event-loop"
        },
        {
          "type": "hw",
          "label": "HW 2 — Async concurrency with asyncio",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901644"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Threads, the GIL & Concurrency Pitfalls"
        },
        {
          "type": "exam",
          "label": "Final · group: asyncio & Concurrency (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.osi-stack",
      "category": "tools",
      "name": "The OSI stack, layer by layer",
      "can": "You can name the seven OSI layers and give each one's job, PDU, header fields, protocols and devices, map them onto the four TCP/IP layers, and place DNS, TLS, the WebSocket and your JSON on the stack, so a failure can be read by its layer.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slides 3–11"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 0 — The stack on your own laptop",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Sockets, WebSockets & Protocol Framing"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.udp-tcp",
      "category": "tools",
      "name": "UDP vs TCP: market data vs order entry",
      "can": "You can compare TCP and UDP on connection, unit, reliability, ordering, head-of-line blocking and fan-out, and pick TCP for order entry and UDP multicast for market data, numbering datagrams so a gap can be detected and filled.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slides 12–13"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 1 — UDP vs TCP: multicast for market data",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Sockets, WebSockets & Protocol Framing"
        }
      ],
      "interview": true
    },
    {
      "id": "python.sockets",
      "category": "python",
      "name": "The socket API, call by call",
      "can": "You can walk through socket/bind/listen/accept and connect/sendall/recv/close for TCP and socket/bind/sendto/recvfrom for UDP, and say what the kernel is doing at each call: the backlog of finished handshakes, recv returning b'' on FIN, TIME_WAIT and SO_REUSEADDR.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slides 15–17"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 2 — The socket API, call by call",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Sockets, WebSockets & Protocol Framing"
        }
      ],
      "interview": true
    },
    {
      "id": "python.socket-examples",
      "category": "python",
      "name": "TCP echo, framing & a UDP pair",
      "can": "You can write a TCP echo server and client with timeouts, add length-prefix or newline framing because one recv is not one message, and write a UDP sender and receiver that numbers its datagrams and survives silence.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slides 18–20"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 3 — Server/client examples, run",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "hw",
          "label": "HW 3 — Protocols & pydantic message schemas",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901645"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Sockets, WebSockets & Protocol Framing"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.fix-itch",
      "category": "trading",
      "name": "FIX, ITCH & OUCH on the wire",
      "can": "You can read a FIX message tag by tag (8, 9, 35, 34, 11, 10 and the checksum), tell session messages from application messages, decode an ITCH Add Order with one struct call, and say what OUCH is and how venues recover a gap.",
      "introduced": 3,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slides 21–24"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 4 — One order as FIX, ITCH and JSON",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Sockets, WebSockets & Protocol Framing"
        }
      ],
      "interview": true
    },
    {
      "id": "python.websockets",
      "category": "python",
      "name": "WebSockets: upgrade, frames, ping/pong & reconnect",
      "can": "You can describe the HTTP Upgrade that returns 101 Switching Protocols, read a frame header (FIN, opcode, mask, length), explain ping/pong and the close codes 1000 and 1006, and map AlgoArena's JSON-over-WebSocket onto FIX: what it keeps and what it leaves out.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slides 24–30"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 5 — WebSockets",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "hw",
          "label": "HW 3 — Protocols & pydantic message schemas",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901645"
        },
        {
          "type": "project",
          "label": "Phase 1 — Connect & Trade for Real",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901653"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Sockets, WebSockets & Protocol Framing"
        },
        {
          "type": "exam",
          "label": "Final · group: asyncio & Concurrency (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.pydantic",
      "category": "python",
      "name": "Pydantic v2 models & validation at the edge",
      "can": "You can define a message as a pydantic BaseModel with Literal-constrained fields, serialise it with model_dump_json, and explain why a ValidationError at the boundary beats a KeyError deep inside matching.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slides 31–32"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 6 — The contract: what may be said, and what the venue does with junk",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "hw",
          "label": "HW 3 — Protocols & pydantic message schemas",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901645"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Dataclasses, Pydantic & Message Schemas"
        },
        {
          "type": "exam",
          "label": "Final · group: OOP, Dataclasses & Pydantic (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.discriminated-union",
      "category": "python",
      "name": "Discriminated unions & type dispatch",
      "can": "You can tag every message with a type field, build a union keyed on that discriminator so parsing is unambiguous, and dispatch on the parsed model instead of poking at raw dict keys.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slides 33, 35"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 6 — The contract: what may be said, and what the venue does with junk",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 7 — Talk to the exchange by hand",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "hw",
          "label": "HW 3 — Protocols & pydantic message schemas",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901645"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Dataclasses, Pydantic & Message Schemas"
        },
        {
          "type": "exam",
          "label": "Final · group: OOP, Dataclasses & Pydantic (recap)"
        }
      ],
      "interview": true
    },
    {
      "id": "python.error-boundary",
      "category": "python",
      "name": "Rejecting malformed & unknown messages",
      "can": "You can decide up front what happens to a malformed message, an unknown type and unparseable bytes, and implement log-and-skip versus close-the-connection without taking down a live bot over one bad frame.",
      "introduced": 3,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slide 33"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 6 — The contract: what may be said, and what the venue does with junk",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "hw",
          "label": "HW 3 — Protocols & pydantic message schemas",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901645"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Sockets, WebSockets & Protocol Framing"
        },
        {
          "type": "exam",
          "label": "Final · group: Live Systems: Risk, Reconciliation & Failure Modes"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.protocol-contract",
      "category": "tools",
      "name": "A wire protocol as a versioned contract",
      "can": "You can specify a protocol as a finite set of message types with required fields, directions and valid replies, and evolve it by adding optional fields with defaults so older clients keep working.",
      "introduced": 3,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 3,
          "label": "Deck Week 3 · slides 31, 34"
        },
        {
          "type": "lab",
          "session": 3,
          "label": "Lab 3 · step 6 — The contract: what may be said, and what the venue does with junk",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-3-socket-streaming-and-protocols"
        },
        {
          "type": "hw",
          "label": "HW 3 — Protocols & pydantic message schemas",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901645"
        },
        {
          "type": "project",
          "label": "Phase 1 — Connect & Trade for Real",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901653"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Sockets, WebSockets & Protocol Framing"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.event-driven-backtest",
      "category": "quant",
      "name": "The backtest pipeline and its goal",
      "can": "You can draw the pipeline a backtest runs — data, replay loop, strategy, simulated fills and fees, accounting, metrics — and say what a backtest can falsify cheaply and what it cannot tell you.",
      "introduced": 4,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "hw",
          "label": "HW 4 — Your tapes in SQL and Parquet, and a backtest you can trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901646"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Backtester Design, Look-Ahead & Complexity"
        },
        {
          "type": "exam",
          "label": "Final · group: Backtesting, Look-Ahead Bias & Performance Metrics"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.performance-metrics",
      "category": "quant",
      "name": "Sharpe, max drawdown & Calmar",
      "can": "You can compute CAGR, Sharpe, max drawdown, Calmar and profit factor from an equity curve, and explain why a high Sharpe with a deep drawdown is untradeable.",
      "introduced": 4,
      "practised": [
        9
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck Week 9 · slide 12"
        },
        {
          "type": "hw",
          "label": "HW 4 — Your tapes in SQL and Parquet, and a backtest you can trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901646"
        },
        {
          "type": "exam",
          "label": "Final · group: Backtesting, Look-Ahead Bias & Performance Metrics"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.sql-tick-store",
      "category": "tools",
      "name": "Tick data in a relational database",
      "can": "You can write a SQL schema for trades, quotes and book snapshots with a composite (symbol, time) index, read a query plan to tell a search from a scan, and name the five reasons a row store struggles with tick history.",
      "introduced": 4,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "hw",
          "label": "HW 4 — Your tapes in SQL and Parquet, and a backtest you can trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901646"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.column-store",
      "category": "tools",
      "name": "Column stores & time-series databases",
      "can": "You can explain why a column store reads only the columns a query names, describe kdb+'s in-memory plus date-partitioned splayed layout and its q-sql, and place TimescaleDB, QuestDB, InfluxDB, ArcticDB and DuckDB on that map.",
      "introduced": 4,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "hw",
          "label": "HW 4 — Your tapes in SQL and Parquet, and a backtest you can trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901646"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.as-of-join",
      "category": "tools",
      "name": "The as-of join",
      "can": "You can match each trade to the last quote at or before it with aj in q, ASOF JOIN in DuckDB or merge_asof in pandas, choose the key and the direction on purpose, and explain why a forward match inside a backtest is look-ahead.",
      "introduced": 4,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "hw",
          "label": "HW 4 — Your tapes in SQL and Parquet, and a backtest you can trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901646"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.headless-sim",
      "category": "tools",
      "name": "A deterministic replay on the logical clock",
      "can": "You can replay a recorded tape or a seeded simulation in one process with no sockets, drive every decision from the logical clock instead of the machine's, and prove it with the same fill digest at any replay speed.",
      "introduced": 4,
      "practised": [
        6,
        7,
        8
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck Week 6 · slide 18"
        },
        {
          "type": "deck",
          "session": 7,
          "label": "Deck Week 7 · slide 19"
        },
        {
          "type": "hw",
          "label": "HW 4 — Your tapes in SQL and Parquet, and a backtest you can trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901646"
        },
        {
          "type": "exam",
          "label": "Final · group: Testing, CI/CD & Reproducibility"
        }
      ],
      "interview": false
    },
    {
      "id": "quant.look-ahead",
      "category": "quant",
      "name": "Look-ahead bias",
      "can": "You can find where a backtest used information that did not exist at decision time — an unlagged signal, a forward as-of match, a peek at the next book — fix it on the logical clock, and quantify how much of the edge was the leak.",
      "introduced": 4,
      "practised": [
        7
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck Week 7 · slide 11"
        },
        {
          "type": "hw",
          "label": "HW 4 — Your tapes in SQL and Parquet, and a backtest you can trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901646"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Backtester Design, Look-Ahead & Complexity"
        },
        {
          "type": "exam",
          "label": "Final · group: Backtesting, Look-Ahead Bias & Performance Metrics"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.fill-simulation",
      "category": "quant",
      "name": "Fill simulation, costs & latency",
      "can": "You can fill a simulated order at the next tick against the recorded depth instead of the last price, charge the taker fee, and show how fees, latency in ticks and turnover move P&L and drawdown.",
      "introduced": 4,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "hw",
          "label": "HW 4 — Your tapes in SQL and Parquet, and a backtest you can trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901646"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Backtester Design, Look-Ahead & Complexity"
        },
        {
          "type": "exam",
          "label": "Final · group: Backtesting, Look-Ahead Bias & Performance Metrics"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.overfitting",
      "category": "quant",
      "name": "Overfitting, data snooping & bias-variance",
      "can": "You can explain test error as bias plus variance plus irreducible noise, recognise that keeping the best of 500 variants fits noise, and defend against it with fewer parameters, counted trials and a held-out block.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck Week 7 · slides 9, 13"
        },
        {
          "type": "hw",
          "label": "HW 7 — ML signals & model ops",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901649"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Backtester Design, Look-Ahead & Complexity"
        },
        {
          "type": "exam",
          "label": "Final · group: ML Signals: Features, Leakage & Validation"
        }
      ],
      "interview": true
    },
    {
      "id": "python.bigo",
      "category": "python",
      "name": "Big-O, amortized cost & space/time trade-offs",
      "can": "You can place an operation on the O(1) / O(log n) / O(n) / O(n log n) / O(n squared) ladder, distinguish worst from average and amortized cost, and name the memory you spent to buy the speed.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck Week 5 · slides 5–6"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab 5 · part 3 — The Big-O ladder, measured",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-5-complexity-and-data-structures"
        },
        {
          "type": "hw",
          "label": "HW 5 — Complexity & the order book data structure",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901647"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Backtester Design, Look-Ahead & Complexity"
        },
        {
          "type": "exam",
          "label": "Final · group: Complexity & Data Structures"
        }
      ],
      "interview": true
    },
    {
      "id": "python.containers",
      "category": "python",
      "name": "dict, set, deque & heapq and their costs",
      "can": "You can pick the container from the operation you repeat most — dict for keyed lookup, set for membership, deque(maxlen) for a rolling window, heapq for best-of-many — and quote each one's cost.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck Week 5 · slides 7–8"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab 5 · part 2 — Heap + dict vs sorted list",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-5-complexity-and-data-structures"
        },
        {
          "type": "hw",
          "label": "HW 5 — Complexity & the order book data structure",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901647"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Backtester Design, Look-Ahead & Complexity"
        },
        {
          "type": "exam",
          "label": "Final · group: Complexity & Data Structures"
        }
      ],
      "interview": true
    },
    {
      "id": "python.hot-loop",
      "category": "python",
      "name": "Speeding up a Python hot loop",
      "can": "You can apply the standard levers in order of payoff — the right data structure, hoisting allocation out of the loop, binding a method to a local name, vectorising batch maths — and stop once the code is no longer hot.",
      "introduced": 5,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck Week 5 · slide 15"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab 5 · part 2 — Heap + dict vs sorted list",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-5-complexity-and-data-structures"
        },
        {
          "type": "hw",
          "label": "HW 5 — Complexity & the order book data structure",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901647"
        },
        {
          "type": "exam",
          "label": "Final · group: Complexity & Data Structures"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.rolling-stats",
      "category": "quant",
      "name": "O(1) rolling statistics with Welford",
      "can": "You can replace an O(n)-per-tick mean or variance with incremental state, implement Welford's update for a numerically stable running variance, and bound the window with a deque so per-tick cost stops growing.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck Week 5 · slides 9–10, 19"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab 5 · part 4 — O(1) rolling statistics — Welford vs recompute",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-5-complexity-and-data-structures"
        },
        {
          "type": "hw",
          "label": "HW 5 — Complexity & the order book data structure",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901647"
        },
        {
          "type": "exam",
          "label": "Final · group: Complexity & Data Structures"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.price-time-priority",
      "category": "trading",
      "name": "Price-time priority & the matching engine",
      "can": "You can apply price-then-time priority to say which resting order fills first, and explain the heap-plus-dict order book design: a monotonic sequence for true time priority, a dict as the canonical set, and lazy deletion on cancel.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck Week 5 · slides 11, 18"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab 5 · part 2 — Heap + dict vs sorted list",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-5-complexity-and-data-structures"
        },
        {
          "type": "hw",
          "label": "HW 5 — Complexity & the order book data structure",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901647"
        },
        {
          "type": "project",
          "label": "Phase 2 — A Real Edge, Backtested",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901654"
        },
        {
          "type": "exam",
          "label": "Final · group: Order Books, Matching & Market Microstructure in Code"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.profiling",
      "category": "tools",
      "name": "Profiling and microbenchmarking honestly",
      "can": "You can find the function that dominates a run with cProfile, then time the hot path with perf_counter using warm-up, repeats and the minimum, and refuse to optimise code that is called twice a session.",
      "introduced": 5,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck Week 5 · slides 13–14, 20"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab 5 · part 1 — Time the CLOB against n",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-5-complexity-and-data-structures"
        },
        {
          "type": "hw",
          "label": "HW 5 — Complexity & the order book data structure",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901647"
        },
        {
          "type": "project",
          "label": "Phase 2 — A Real Edge, Backtested",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901654"
        },
        {
          "type": "exam",
          "label": "Final · group: Complexity & Data Structures"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.latency-tail",
      "category": "tools",
      "name": "Latency, throughput & the tail",
      "can": "You can separate per-operation latency from operations per second, report p50/p95/p99 instead of a mean, and set a per-tick budget that the tail — not the average — has to fit inside.",
      "introduced": 5,
      "practised": [
        7
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 5,
          "label": "Deck Week 5 · slides 16, 20"
        },
        {
          "type": "deck",
          "session": 7,
          "label": "Deck Week 7 · slide 18"
        },
        {
          "type": "lab",
          "session": 5,
          "label": "Lab 5 · part 5 — Tail latency of your own on_tick",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-5-complexity-and-data-structures"
        },
        {
          "type": "hw",
          "label": "HW 5 — Complexity & the order book data structure",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901647"
        },
        {
          "type": "exam",
          "label": "Final · group: Complexity & Data Structures"
        }
      ],
      "interview": true
    },
    {
      "id": "python.pandas-memory",
      "category": "python",
      "name": "The DataFrame memory bill & dtypes",
      "can": "You can measure what a frame really costs with memory_usage(deep=True), downcast float64 to float32 and object to category, and recognise the symptoms of crossing physical memory.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck Week 6 · slide 5"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab 6 · part 2 — Load it into pandas — and look at the memory bill",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-6-big-data"
        },
        {
          "type": "hw",
          "label": "HW 6 — Big data: vectorize your signal",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901648"
        },
        {
          "type": "exam",
          "label": "Final · group: numpy & pandas: Vectorisation, Indexing & Memory"
        }
      ],
      "interview": true
    },
    {
      "id": "python.numpy-vectorize",
      "category": "python",
      "name": "Vectorising with numpy & pandas",
      "can": "You can replace a per-row Python loop with whole-array numpy and pandas operations, check the two agree with allclose, and explain where the order of magnitude comes from.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck Week 6 · slides 7, 19"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab 6 · part 3 — Python loop vs vectorised, timed and checked",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-6-big-data"
        },
        {
          "type": "hw",
          "label": "HW 6 — Big data: vectorize your signal",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901648"
        },
        {
          "type": "exam",
          "label": "Final · group: numpy & pandas: Vectorisation, Indexing & Memory"
        }
      ],
      "interview": true
    },
    {
      "id": "python.chunking",
      "category": "python",
      "name": "Chunked, bounded-memory processing",
      "can": "You can process a file larger than memory as a stream of chunks with a running reduction, and show that peak memory stays flat while a load-it-all version scales with the file.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck Week 6 · slide 8"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab 6 · part 4 — Chunked processing — bounded memory",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-6-big-data"
        },
        {
          "type": "hw",
          "label": "HW 6 — Big data: vectorize your signal",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901648"
        },
        {
          "type": "exam",
          "label": "Final · group: numpy & pandas: Vectorisation, Indexing & Memory"
        }
      ],
      "interview": true
    },
    {
      "id": "python.multiprocessing",
      "category": "python",
      "name": "Process pools & the map-reduce fan-out",
      "can": "You can shard an embarrassingly parallel workload by symbol or parameter, fan it out with ProcessPoolExecutor under a __main__ guard, and reduce the partial results into one answer.",
      "introduced": 6,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck Week 6 · slides 12–14, 20"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab 6 · part 5 — Map-reduce across processes",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-6-big-data"
        },
        {
          "type": "hw",
          "label": "HW 6 — Big data: vectorize your signal",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901648"
        },
        {
          "type": "project",
          "label": "Phase 3 — Risk & Robustness",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901655"
        },
        {
          "type": "exam",
          "label": "Midterm · group: Threads, the GIL & Concurrency Pitfalls"
        },
        {
          "type": "exam",
          "label": "Final · group: numpy & pandas: Vectorisation, Indexing & Memory"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.parquet",
      "category": "tools",
      "name": "Parquet, partitions & predicate pushdown",
      "can": "You can convert a tape to partitioned Parquet, explain row groups, footer statistics, dictionary encoding and projection, query the files in place with DuckDB or Polars, and reuse them as a feature cache.",
      "introduced": 4,
      "practised": [
        6
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck Week 6 · slides 6, 9"
        },
        {
          "type": "lab",
          "session": 6,
          "label": "Lab 6 · part 6 — Columnar vs row storage",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-6-big-data"
        },
        {
          "type": "hw",
          "label": "HW 4 — Your tapes in SQL and Parquet, and a backtest you can trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901646"
        },
        {
          "type": "hw",
          "label": "HW 6 — Big data: vectorize your signal",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901648"
        },
        {
          "type": "project",
          "label": "Phase 3 — Risk & Robustness",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901655"
        },
        {
          "type": "exam",
          "label": "Final · group: numpy & pandas: Vectorisation, Indexing & Memory"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.determinism",
      "category": "tools",
      "name": "Deterministic, network-free runs",
      "can": "You can make a run reproducible by pinning the seed, injecting the clock and ids, and keeping the network out of it, and explain why an idempotent task keyed by its inputs is safe to retry.",
      "introduced": 6,
      "practised": [
        8
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck Week 6 · slide 15"
        },
        {
          "type": "deck",
          "session": 8,
          "label": "Deck Week 8 · slide 9"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab 8 · part 5 — Determinism: same seed, same result",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-8-ci-slash-cd-testing-and-the-dashboard"
        },
        {
          "type": "hw",
          "label": "HW 6 — Big data: vectorize your signal",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901648"
        },
        {
          "type": "exam",
          "label": "Final · group: Testing, CI/CD & Reproducibility"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.multi-venue",
      "category": "trading",
      "name": "Multi-venue connection & routing",
      "can": "You can connect one bot to several venues at once from a comma-separated URL list, and explain why the same symbol on two books creates a routing decision and a cross-venue arbitrage.",
      "introduced": 6,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 6,
          "label": "Deck Week 6 · slide 17"
        },
        {
          "type": "hw",
          "label": "HW 6 — Big data: vectorize your signal",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901648"
        },
        {
          "type": "project",
          "label": "Phase 3 — Risk & Robustness",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901655"
        }
      ],
      "interview": false
    },
    {
      "id": "quant.supervised-setup",
      "category": "quant",
      "name": "The supervised setup: X, y and the horizon",
      "can": "You can frame a trading signal as supervised learning — features knowable at t, a label about t+h — and choose classification or regression with a horizon that matches the holding period you intend.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck Week 7 · slide 5"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab 7 · part 3 — Features known at t, label about t + h",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-7-ml-signals-and-model-ops"
        },
        {
          "type": "hw",
          "label": "HW 7 — ML signals & model ops",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901649"
        },
        {
          "type": "exam",
          "label": "Final · group: ML Signals: Features, Leakage & Validation"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.feature-engineering",
      "category": "quant",
      "name": "Features from prices & the order book",
      "can": "You can build momentum, volatility, spread and order-book-imbalance features from a price history and a book snapshot, standardise them, and justify why fewer, better features win in low signal-to-noise data.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck Week 7 · slide 6"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab 7 · part 3 — Features known at t, label about t + h",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-7-ml-signals-and-model-ops"
        },
        {
          "type": "hw",
          "label": "HW 7 — ML signals & model ops",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901649"
        },
        {
          "type": "project",
          "label": "Phase 3 — Risk & Robustness",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901655"
        },
        {
          "type": "exam",
          "label": "Final · group: ML Signals: Features, Leakage & Validation"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.walk-forward",
      "category": "quant",
      "name": "Walk-forward validation & leakage control",
      "can": "You can split a time series chronologically into train, validation and an untouched test block, roll the split forward over expanding or rolling windows, and embargo the boundary so horizon-h labels cannot leak across it.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck Week 7 · slides 11–12"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab 7 · part 5 — Walk-forward, and the shuffled-label control",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-7-ml-signals-and-model-ops"
        },
        {
          "type": "hw",
          "label": "HW 7 — ML signals & model ops",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901649"
        },
        {
          "type": "project",
          "label": "Phase 3 — Risk & Robustness",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901655"
        },
        {
          "type": "exam",
          "label": "Final · group: ML Signals: Features, Leakage & Validation"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.signal-scoring",
      "category": "quant",
      "name": "Scoring a signal after costs",
      "can": "You can explain why classification accuracy is necessary but not sufficient, read hit rate together with average win over average loss, and judge a signal on out-of-sample Sharpe and P&L net of fees, spread and turnover.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck Week 7 · slide 14"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab 7 · part 5 — Walk-forward, and the shuffled-label control",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-7-ml-signals-and-model-ops"
        },
        {
          "type": "hw",
          "label": "HW 7 — ML signals & model ops",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901649"
        },
        {
          "type": "exam",
          "label": "Final · group: ML Signals: Features, Leakage & Validation"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.model-ops",
      "category": "quant",
      "name": "Persist, serve, monitor & retrain a model",
      "can": "You can train offline, serialise the fitted model with its feature list and version, load it once outside the hot path, time predict against the per-tick budget, and monitor drift to decide when to retrain or roll back.",
      "introduced": 7,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 7,
          "label": "Deck Week 7 · slides 15, 18"
        },
        {
          "type": "lab",
          "session": 7,
          "label": "Lab 7 · part 6 — Freeze the model, then load it in on_tick",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-7-ml-signals-and-model-ops"
        },
        {
          "type": "hw",
          "label": "HW 7 — ML signals & model ops",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901649"
        },
        {
          "type": "project",
          "label": "Phase 3 — Risk & Robustness",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901655"
        },
        {
          "type": "exam",
          "label": "Final · group: ML Signals: Features, Leakage & Validation"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.test-pyramid",
      "category": "tools",
      "name": "The testing pyramid & integration tests",
      "can": "You can place a test at the unit, integration or end-to-end layer, push logic down so bugs are caught by fast unit tests, and explain why every part passing its own tests does not mean the system works.",
      "introduced": 8,
      "practised": [
        9
      ],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck Week 8 · slide 5"
        },
        {
          "type": "deck",
          "session": 9,
          "label": "Deck Week 9 · slides 5, 7"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab 8 · part 4 — An integration test — the bot inside the simulator",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-8-ci-slash-cd-testing-and-the-dashboard"
        },
        {
          "type": "hw",
          "label": "HW 8 — CI/CD, testing & a bot you trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901650"
        },
        {
          "type": "exam",
          "label": "Final · group: Testing, CI/CD & Reproducibility"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.pytest",
      "category": "tools",
      "name": "pytest: tests, fixtures, parametrize & coverage",
      "can": "You can write test_* functions with plain asserts, factor setup into fixtures, drive many cases from one @parametrize, and read a coverage report as a map of untested code rather than a number to chase.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck Week 8 · slides 6–7, 10"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab 8 · part 3 — Fixtures and parametrize instead of copy-paste",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-8-ci-slash-cd-testing-and-the-dashboard"
        },
        {
          "type": "hw",
          "label": "HW 8 — CI/CD, testing & a bot you trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901650"
        },
        {
          "type": "exam",
          "label": "Final · group: Testing, CI/CD & Reproducibility"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.mocking-async",
      "category": "tools",
      "name": "Fakes, monkeypatch & testing coroutines",
      "can": "You can replace a network or market-data dependency with a hand-written fake or a monkeypatched attribute, and test a coroutine with pytest-asyncio instead of hitting a live feed.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck Week 8 · slide 8"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab 8 · part 6 — One async test",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-8-ci-slash-cd-testing-and-the-dashboard"
        },
        {
          "type": "hw",
          "label": "HW 8 — CI/CD, testing & a bot you trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901650"
        },
        {
          "type": "exam",
          "label": "Final · group: Testing, CI/CD & Reproducibility"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.github-actions",
      "category": "tools",
      "name": "CI with GitHub Actions",
      "can": "You can write a workflow that installs and runs the suite on every push, explain triggers, jobs, steps and a version matrix, and use a required check as the gate on what enters main.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck Week 8 · slides 12–13"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab 8 · part 8 — The CI workflow you will commit in HW 8",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-8-ci-slash-cd-testing-and-the-dashboard"
        },
        {
          "type": "hw",
          "label": "HW 8 — CI/CD, testing & a bot you trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901650"
        },
        {
          "type": "project",
          "label": "Phase 4 — Scale & Operations",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901656"
        },
        {
          "type": "exam",
          "label": "Final · group: Testing, CI/CD & Reproducibility"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.docker",
      "category": "tools",
      "name": "Containers & pinned reproducibility",
      "can": "You can pin exact dependency versions, write a Dockerfile whose layers go stable-to-volatile so the install layer caches, and argue that the image is what makes 'works on my machine' a testable claim.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck Week 8 · slide 14"
        },
        {
          "type": "hw",
          "label": "HW 8 — CI/CD, testing & a bot you trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901650"
        },
        {
          "type": "project",
          "label": "Phase 4 — Scale & Operations",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901656"
        },
        {
          "type": "exam",
          "label": "Final · group: Testing, CI/CD & Reproducibility"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.observability",
      "category": "tools",
      "name": "Logs, metrics & a live dashboard",
      "can": "You can separate structured logs (discrete events with context) from metrics (numbers over time), split plain config from secrets that never enter the image, and read a dashboard for the vital signs of a running session.",
      "introduced": 8,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 8,
          "label": "Deck Week 8 · slides 15, 18"
        },
        {
          "type": "lab",
          "session": 8,
          "label": "Lab 8 · part 9 — Read the dashboard against a local exchange",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-8-ci-slash-cd-testing-and-the-dashboard"
        },
        {
          "type": "hw",
          "label": "HW 8 — CI/CD, testing & a bot you trust",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901650"
        },
        {
          "type": "project",
          "label": "Phase 4 — Scale & Operations",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901656"
        },
        {
          "type": "exam",
          "label": "Final · group: Live Systems: Risk, Reconciliation & Failure Modes"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.risk-controls",
      "category": "quant",
      "name": "Position limits, stops & graceful de-risking",
      "can": "You can put a pre-trade veto in front of every order — position limit, stop-loss, margin check — and design the failure path so losing a signal flattens the book instead of emitting garbage orders.",
      "introduced": 9,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck Week 9 · slides 3, 8, 18"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab 9 · part 2 — Drill 1 — kill the feed",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-9-integration-failure-drills-and-the-demo"
        },
        {
          "type": "hw",
          "label": "HW 9 — Integration & season-finale demo",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901651"
        },
        {
          "type": "project",
          "label": "Phase 3 — Risk & Robustness",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901655"
        },
        {
          "type": "exam",
          "label": "Final · group: Live Systems: Risk, Reconciliation & Failure Modes"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.tearsheet",
      "category": "quant",
      "name": "The performance tearsheet",
      "can": "You can turn an equity curve into a one-page tearsheet — Sharpe, max drawdown, Calmar, turnover, exposure — and read the shape of the curve before quoting any single number from it.",
      "introduced": 9,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck Week 9 · slides 12, 19"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab 9 · part 5 — Why the season score is risk-adjusted",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-9-integration-failure-drills-and-the-demo"
        },
        {
          "type": "hw",
          "label": "HW 9 — Integration & season-finale demo",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901651"
        },
        {
          "type": "project",
          "label": "Phase 5 — Season Finale: Demo & Postmortem",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901657"
        },
        {
          "type": "exam",
          "label": "Final · group: Backtesting, Look-Ahead Bias & Performance Metrics"
        }
      ],
      "interview": true
    },
    {
      "id": "quant.risk-adjusted-score",
      "category": "quant",
      "name": "Risk-adjusted scoring & the drawdown penalty",
      "can": "You can explain why raw return rewards the gambler, compute a Sharpe-like excess-return-over-volatility ratio, and show how a multiplicative drawdown penalty makes the steady book beat the lucky one.",
      "introduced": 9,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck Week 9 · slides 13, 17"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab 9 · part 5 — Why the season score is risk-adjusted",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-9-integration-failure-drills-and-the-demo"
        },
        {
          "type": "hw",
          "label": "HW 9 — Integration & season-finale demo",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901651"
        },
        {
          "type": "project",
          "label": "Phase 5 — Season Finale: Demo & Postmortem",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901657"
        },
        {
          "type": "exam",
          "label": "Final · group: Backtesting, Look-Ahead Bias & Performance Metrics"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.portfolio-pnl",
      "category": "trading",
      "name": "Realized & unrealized P&L marked to mid",
      "can": "You can maintain cash, positions and average entry price from a stream of fills, split realized from unrealized P&L, and mark a book to the venue mid to get net worth.",
      "introduced": 9,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck Week 9 · slides 3, 18"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab 9 · part 4 — Reconcile your ledger against the exchange's",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-9-integration-failure-drills-and-the-demo"
        },
        {
          "type": "hw",
          "label": "HW 9 — Integration & season-finale demo",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901651"
        },
        {
          "type": "exam",
          "label": "Final · group: Live Systems: Risk, Reconciliation & Failure Modes"
        }
      ],
      "interview": true
    },
    {
      "id": "trading.reconciliation",
      "category": "trading",
      "name": "Reconciling your ledger with the venue",
      "can": "You can compare your own positions, cash and fill count against the exchange's record, and treat any break as a bug to explain rather than a rounding difference to ignore.",
      "introduced": 9,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "lab",
          "session": 9,
          "label": "Lab 9 · part 4 — Reconcile your ledger against the exchange's",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-9-integration-failure-drills-and-the-demo"
        },
        {
          "type": "hw",
          "label": "HW 9 — Integration & season-finale demo",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901651"
        },
        {
          "type": "project",
          "label": "Phase 5 — Season Finale: Demo & Postmortem",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901657"
        },
        {
          "type": "exam",
          "label": "Final · group: Live Systems: Risk, Reconciliation & Failure Modes"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.failure-modes",
      "category": "tools",
      "name": "Partial failure in a live system",
      "can": "You can name the ways a live trading system degrades rather than dies — a stale feed behind a healthy socket, a dropped venue, an unbounded queue — and design detection and a fail-safe response for each.",
      "introduced": 9,
      "practised": [],
      "depth": 3,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck Week 9 · slide 8"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab 9 · part 3 — Drill 2 — kill the venue, then bring it back",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-9-integration-failure-drills-and-the-demo"
        },
        {
          "type": "hw",
          "label": "HW 9 — Integration & season-finale demo",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901651"
        },
        {
          "type": "exam",
          "label": "Final · group: Live Systems: Risk, Reconciliation & Failure Modes"
        }
      ],
      "interview": true
    },
    {
      "id": "tools.runbook",
      "category": "tools",
      "name": "Run-books, postmortems & the demo",
      "can": "You can write a run-book as symptom, diagnosis, action before you need it, write a blameless postmortem with timeline, root cause and fixes afterwards, and turn each incident into a regression test.",
      "introduced": 9,
      "practised": [],
      "depth": 2,
      "where": [
        {
          "type": "deck",
          "session": 9,
          "label": "Deck Week 9 · slides 9, 14"
        },
        {
          "type": "lab",
          "session": 9,
          "label": "Lab 9 · part 7 — The postmortem skeleton",
          "url": "https://canvas.uchicago.edu/courses/74211/pages/lab-9-integration-failure-drills-and-the-demo"
        },
        {
          "type": "hw",
          "label": "HW 9 — Integration & season-finale demo",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901651"
        },
        {
          "type": "project",
          "label": "Phase 5 — Season Finale: Demo & Postmortem",
          "url": "https://canvas.uchicago.edu/courses/74211/assignments/901657"
        },
        {
          "type": "exam",
          "label": "Final · group: Live Systems: Risk, Reconciliation & Failure Modes"
        }
      ],
      "interview": false
    }
  ]
};
