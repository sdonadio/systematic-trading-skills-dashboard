window.FOCUS = {
  "meta": {
    "link_title": "Why this matters in systematic trading",
    "interview_title": "Interview questions"
  },
  "sessions": [
    {
      "n": 0,
      "focus": "Environment & the green smoke test",
      "tagline": "Before any of the microstructure matters, one thing has to be true: your machine runs the same code the same way tomorrow, and you can prove it in six checks.",
      "concepts": [
        {
          "title": "A pinned interpreter is part of the deliverable",
          "text": "The stack is Python 3.11+ inside a virtual environment you create on purpose — `uv venv .venv --python 3.11` — not whatever `python` happens to resolve to on your laptop. A venv is a directory with its own interpreter and its own site-packages, put first on PATH; that is all the isolation there is, and it is enough to make the installed package set a property of the project rather than of the machine. Check 1 of the smoke test is exactly this comparison, and it runs first because every later check is meaningless without it.",
          "code": "import sys\nMIN = (3, 11)\ndef ok(v):                       # this IS check 1 of tests/test_smoke.py\n    return v[:2] >= MIN\nprint(\"this interpreter:\", ok(sys.version_info))\nprint(\"system python 3.9:\", ok((3, 9, 18)))\nprint(\"pinned venv 3.11:\", ok((3, 11, 9)))\n# this interpreter: True\n# system python 3.9: False\n# pinned venv 3.11: True",
          "deck": "Deck Week 0 · slides 27–28"
        },
        {
          "title": "Six checks, ordered cheapest first",
          "text": "The green smoke test is six checks in a fixed order: Python version, `arena.Trader` imports, the Anthropic key answers a prompt, yfinance returns a live AAPL price, the engine plus a headless session run end to end, and your bot handshakes with the arena and receives a book snapshot. Each one costs more than the last and depends on the ones above it, so the first failure names the layer to fix. Check 6 is the real gate — appearing on the teacher dashboard proves the interpreter, the SDK, the token and the socket in a single observation.",
          "deck": "Deck Week 0 · slide 28 · Deck Week 0 · slide 35"
        },
        {
          "title": "A SKIP is not a PASS",
          "text": "Checks that need an external resource — your key, the network, the class arena — skip rather than fail, so a student without an API key is not blocked. That kindness is the trap: pytest prints skips in yellow beside the green dots, and \"no failures\" reads as \"done\". A skipped check never ran and has told you nothing. The suite therefore restates its own tally in words, and the deliverable is six passed, zero skipped.",
          "code": "CHECKS = 6\ndef summary(passed, skipped, failed=0):\n    head = f\"{passed} passed, {skipped} skipped\"\n    if failed:\n        head += f\", {failed} FAILED\"\n    if skipped or failed:\n        return f\"{head} - a skip is NOT a green check ({passed}/{CHECKS} ran green)\"\n    return f\"{head} - all {CHECKS}/{CHECKS} ran green\"\nprint(summary(4, 2))\nprint(summary(6, 0))\n# 4 passed, 2 skipped - a skip is NOT a green check (4/6 ran green)\n# 6 passed, 0 skipped - all 6/6 ran green",
          "deck": "Deck Week 0 · slide 35 · Deck Week 0 · slide 37"
        },
        {
          "title": "Configuration comes from the environment, never from the source",
          "text": "`EXCHANGE_HOST`, `TEAM_ID` and `ARENA_TOKEN` are read from the process environment, with a `.env` file as the fallback and the shell always winning. That precedence is not cosmetic: registration leaves the hosted arena's address in `.env`, so local play needs `EXCHANGE_HOST=localhost` on the command line to beat it, and the bot logs which source won so a stale value is visible instead of mysterious. Secrets travel in one direction only — the token lives in `.env`, `.env` is gitignored, and `.env.example` carries the key names with empty values.",
          "code": "def load_env(lines, env):                      # shared/envfile.py, in miniature\n    for line in lines:\n        if not line.strip() or line.startswith(\"#\") or \"=\" not in line: continue\n        k, v = line.split(\"=\", 1)\n        env.setdefault(k.strip(), v.strip())   # setdefault: the shell always wins\n    return env\nshell = {\"EXCHANGE_HOST\": \"localhost\"}         # what you exported this session\nenv = load_env([\"EXCHANGE_HOST=arena.example.edu\", \"TEAM_ID=team_a\"], shell)\nprint(\"host:\", env[\"EXCHANGE_HOST\"], \"team:\", env[\"TEAM_ID\"])\nprint(\"token came from the repo:\", \"ARENA_TOKEN\" in env)\n# host: localhost team: team_a\n# token came from the repo: False",
          "deck": "Deck Week 0 · slide 29"
        },
        {
          "title": "Verify a dependency's version at runtime",
          "text": "\"Installed\" and \"the version this code needs\" are different claims, and pydantic is the one that bites. Every arena message is a v2 model; `model_dump_json()` does not exist on v1, so a v1 install fails deep inside a parse rather than at import. `importlib.metadata.version` reports the version the interpreter actually resolved, which is the number worth asserting on — not the one written in requirements.txt.",
          "code": "from importlib.metadata import version\nimport pydantic\nmajor = int(version(\"pydantic\").split(\".\")[0])\nprint(\"pydantic major:\", major, \"| v2 required:\", major >= 2)\nprint(\"v2 API present:\", hasattr(pydantic.BaseModel, \"model_dump_json\"))\n# pydantic major: 2 | v2 required: True\n# v2 API present: True",
          "deck": "Deck Week 0 · slide 27 · Deck Week 0 · slide 29"
        },
        {
          "title": "Constrain the prompt, then verify the output",
          "text": "The three prompt patterns that work all narrow the question: generate code under stated constraints (\"use only the prices and history arguments, return Signal | None\"), stress-test logic you already wrote, or explain one mechanism against your own file. The three that fail are asking for the whole system at once, trusting its financial maths, and shipping anything you cannot explain. Sharpe, Kelly and drawdown are the formulas it gets confidently wrong, so a generated metric is worth exactly what your independent check of it is worth.",
          "code": "import statistics as st\ndef sharpe(r, rf=0.0):                    # the shape an LLM hands you\n    ex = [x - rf for x in r]\n    return st.mean(ex) / st.stdev(ex)\nr = [0.010, -0.005, 0.020, 0.000, 0.015]\n# re-derive it by hand before it sizes a single order\nm = sum(r) / len(r)\nv = sum((x - m) ** 2 for x in r) / (len(r) - 1)\nprint(\"generated:\", round(sharpe(r), 4))\nprint(\"by hand:\", round(m / v ** 0.5, 4))\n# generated: 0.7716\n# by hand: 0.7716",
          "deck": "Deck Week 0 · slides 32–33"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "The pipeline you spend nine weeks building is short and unforgiving: data arrives, features are computed, a signal becomes a target position, orders are routed, fills come back and get reconciled. Every stage is a process reading configuration from the environment and importing some version of a library. A bot that works on your laptop and not on the arena has not found an edge; it has found an environment difference. Pinning the interpreter and the dependency set is what leaves the strategy as the only variable in the experiment.",
          "An offline result is believable only if it reproduces, and reproducibility starts below the strategy. Same interpreter, same library versions, same seed, same data snapshot — change one and two runs of identical code disagree for reasons that have nothing to do with the market. `make sim` exists so you can watch the engine and the SDK produce a headless season before you interpret a single P&L figure. The habit to build in week 0: when a number moves, the first question is what else moved.",
          "Live sessions die in the environment far more often than in the algorithm. ConnectionRefused because the venue is not up yet; a stale `EXCHANGE_HOST` pointing at the wrong venue; a yellow check where a key should be; yfinance rate-limiting a tight poll loop. None of those are strategy bugs and every one of them costs you a session's fills. The six checks are the pre-flight for precisely that list, which is why check 6 — a real handshake and a real book snapshot — is the one that decides whether you passed.",
          "Being pedantic about the plumbing pays because the edge is thin. Take the deck's own arithmetic: a strategy making 0.05% per trade against 0.03% of spread, 0.02% of impact and 0.01% of commission is a 0.01% loss per round trip, and it loses faster the more it trades. Nothing about your environment changes those numbers. But a session you cannot run and a backtest you cannot reproduce guarantee you never measure them, and unmeasured cost is the usual reason a promising signal ends up a loss-making business."
        ],
        "example": {
          "title": "In the arena",
          "text": "tests/test_smoke.py — check 5 is the whole engine in a dozen lines: a crossing order must print a trade at the RESTING order's price, then a full headless season runs with no network at all. Green here means the matching engine and the SDK on your machine agree with everyone else's.",
          "code": "# tests/test_smoke.py\ndef test_engine_and_sdk_smoke():\n    \"\"\"5. Arena engine + SDK smoke: the order book matches and a full\n    no-network session runs end to end.\"\"\"\n    from shared.orderbook import OrderBook\n\n    ob = OrderBook(\"AAPL\")\n    ob.place_order(\"maker\", \"sell\", 100.0, 5)\n    _order, trades = ob.place_order(\"taker\", \"buy\", 100.0, 5)\n    assert trades and trades[0].price == 100.0\n\n    from sim.session import SimSession\n\n    result = SimSession().run(n_ticks=50, verbose=False)\n    assert result is not None"
        }
      },
      "interview": [
        {
          "q": "What does a Python virtual environment actually change, and why does the course insist on one?",
          "a": "It creates a directory holding its own interpreter and its own site-packages, and putting that directory's bin first on PATH makes `python` and `pip` resolve there. Nothing is isolated at the OS level — it is path resolution plus a chosen interpreter version. The value is that the installed package set becomes a property of the project instead of the laptop, so `uv venv .venv --python 3.11` plus a pinned requirement set reproduces the same imports on the next machine.",
          "level": "warm-up",
          "skill": "tools.venv"
        },
        {
          "q": "What does a market order guarantee, and what does a limit order guarantee?",
          "a": "A market order guarantees execution and not price: it crosses the spread against the best resting orders, so a large one walks up the book and gets a blended average fill. A limit order guarantees price and not execution: it rests in the book at your price until it fills or is cancelled, which also makes you the passive side and the one earning a rebate under a maker/taker schedule. Systematic strategies default to limit orders and cross only when speed genuinely beats price.",
          "level": "warm-up",
          "skill": "trading.order-types"
        },
        {
          "q": "CI reports \"4 passed, 2 skipped\" and the build is green. Why is that a problem, and what do you change?",
          "a": "A skip means the check never ran, so it has asserted nothing — and \"no failures\" is a weaker statement than \"everything verified\". The skipped checks are usually the ones needing an external resource, which is exactly where breakage lives. The fix is to stop treating absence of failure as the signal: provide the resource in CI, and gate on an explicit count — the number of checks that actually ran green must equal the total. A summary line that says \"a skip is not a green check\" is the cheap version of the same discipline.",
          "level": "core",
          "skill": "tools.smoke-test"
        },
        {
          "q": "Where should an exchange hostname, a team id and an API token live, and why not in the code?",
          "a": "All three come from the process environment, with a gitignored `.env` as a local fallback and the shell taking precedence, so one image runs against a local venue and a hosted one with no code change. Hostnames and ids in source mean a rebuild per environment and a merge conflict per developer. A token in source is a credential in git history forever, and deleting the file later does not remove it. Ship a `.env.example` with the key names and empty values, and have the process log which source won so a stale value is visible.",
          "level": "core",
          "skill": "tools.venv"
        },
        {
          "q": "Name the five pillars of a systematic trading system and say which is most often underestimated.",
          "a": "Signal, strategy, execution, risk management and portfolio. Signal gets the attention because it is the hardest to find; strategy turns it into direction, size and holding period; portfolio combines weakly correlated strategies for a smoother return stream. Execution is the underestimated one — roughly 20% of the edge in a liquid name and up to 80% in an illiquid or high-turnover one, because slippage, impact and fees scale with how often you trade. Risk management is second, since most systems fail from a blowup rather than from a wrong signal.",
          "level": "core",
          "skill": "quant.five-pillars"
        },
        {
          "q": "A strategy earns 5 bps of gross edge per round trip. Spread costs 3 bps, impact 2 bps, commission 1 bp. Is it a business?",
          "a": "No: 6 bps of round-trip cost against 5 bps of gross is a 1 bp loss per trade, and it scales with turnover, so trading more makes it worse. The three ways out are structural. Earn the spread instead of paying it by resting passively and accepting fill uncertainty. Cut turnover so the same gross edge covers fewer round trips. Or reduce impact by shrinking participation — impact grows roughly with volatility times the square root of order size over ADV, so halving the clip does not halve the cost.",
          "level": "core",
          "skill": "trading.market-impact"
        },
        {
          "q": "How do you use an LLM to write a signal function without shipping code you cannot defend?",
          "a": "Constrain the request to something checkable: state the inputs it may use, the return type and the rule in words, then read every line and re-derive any maths independently. The reliable failure modes are asking for the whole system at once, trusting a formula — Sharpe, Kelly and drawdown are the confident hallucinations — and pasting output you have not read. I keep a unit test that encodes the rule separately from the generated implementation, so the verification survives the next regeneration and the review question \"why this threshold\" has an answer that is mine.",
          "level": "senior",
          "skill": "tools.genai-workflow"
        },
        {
          "q": "Primary versus secondary market: what changes about how the price gets set?",
          "a": "In the primary market the issuer sells new shares and keeps the proceeds, and the price comes out of a bookbuild — indications of demand across a range, one clearing price chosen, then pro-rata allocation, so there is no continuous price until listing. In the secondary market the issuer receives nothing and price comes from a continuous double auction between investors, updating on every trade. The arena runs both: `exchange/ipo.py` does bookbuild, pricing, allocation and a listing-day open, and from that moment the CLOB sets the price.",
          "level": "senior",
          "skill": "trading.primary-secondary"
        }
      ]
    },
    {
      "n": 1,
      "focus": "Object-oriented Python & UML",
      "tagline": "Model the domain as objects, enforce the contract with an ABC, and draw the arrows before you write the file — a wrong relationship costs a minute on paper and a week in code.",
      "concepts": [
        {
          "title": "A class is a blueprint; the attributes say where state lives",
          "text": "`__init__` sets up per-object state and `self` is the instance. The distinction that catches people is class attribute versus instance attribute: a class attribute is one object shared by every instance, and assigning to it through an instance does not update it — it creates a new instance attribute that shadows it on that object alone. A fee rate, a symbol table or a counter declared at class level is shared mutable state, and that is a design decision, not a shortcut.",
          "code": "class Order:\n    exchange_fee = 0.001                  # class attribute: shared by every Order\n    def __init__(self, symbol, side, qty, price):\n        self.symbol, self.side, self.qty, self.price = symbol, side, qty, price\n    def notional(self): return self.qty * self.price\no = Order(\"AAPL\", \"buy\", 5, 185.50)\nprint(\"notional:\", o.notional(), \"fee:\", o.exchange_fee)\no.exchange_fee = 0.002                    # shadows the class attr on o alone\nprint(\"o:\", o.exchange_fee, \"fresh:\", Order(\"MSFT\", \"buy\", 1, 1.0).exchange_fee)\n# notional: 927.5 fee: 0.001\n# o: 0.002 fresh: 0.001",
          "deck": "Deck Week 1 · slide 7"
        },
        {
          "title": "Encapsulation is a convention plus a property",
          "text": "Python has no access control. A single leading underscore is a message to the reader — internal, hands off — and a double underscore is name-mangled to `_ClassName__attr`, which prevents accidental collisions in subclasses rather than access. `@property` is the useful half: it turns a computed value into attribute access with no setter, so `net_worth` is read-only from outside and you are free to change how it is computed. Encapsulation in practice means a stable interface over internals you intend to rewrite.",
          "code": "class Portfolio:\n    def __init__(self, cash):\n        self.cash = cash                   # public API\n        self._positions = {\"AAPL\": 10}     # _protected by convention\n        self.__ledger = []                 # __private: name-mangled\n    @property                              # computed, read-only\n    def net_worth(self): return self.cash + self._positions[\"AAPL\"] * 185.50\np = Portfolio(100_000.0)\nprint(\"net_worth:\", p.net_worth, \"setter:\", Portfolio.net_worth.fset)\nprint(\"mangled to:\", [n for n in vars(p) if \"ledger\" in n])\n# net_worth: 101855.0 setter: None\n# mangled to: ['_Portfolio__ledger']",
          "deck": "Deck Week 1 · slide 9"
        },
        {
          "title": "Inheritance is for genuine specialisation",
          "text": "A subclass is an IS-A claim: `Momentum` IS-A `Strategy`, so anywhere a `Strategy` is expected a `Momentum` must work. `super().__init__(name)` hands the parent responsibility for its own state instead of re-implementing it, and `__mro__` is the list Python walks to resolve a method — the reason `super()` is a position in a chain rather than a hard-coded parent. Reach for inheritance when the subclass really is the base type with extra behaviour; reach for composition when you only want the code.",
          "code": "class Strategy:\n    def __init__(self, name): self.name = name\n    def signal(self, px): return 0.0\nclass Momentum(Strategy):                       # Momentum IS-A Strategy\n    def __init__(self, name, lookback):\n        super().__init__(name)                  # parent sets up its own state\n        self.lookback = lookback\n    def signal(self, px): return px[-1] - px[-self.lookback]   # override\nm = Momentum(\"mom\", 3)\nprint(m.name, m.signal([10.0, 11.0, 12.0]), [c.__name__ for c in Momentum.__mro__])\n# mom 2.0 ['Momentum', 'Strategy', 'object']",
          "deck": "Deck Week 1 · slide 10"
        },
        {
          "title": "The ABC is the contract, checked at construction",
          "text": "An abstract base class declares what a subclass must supply. `arena.Trader` is one abstract method, `on_tick(market, portfolio) -> Signal | None`, plus three optional hooks — `on_fill`, `on_event`, `on_ipo` — with harmless defaults and a `run()` you never override. That asymmetry is the design: the mandatory part is your edge, the rest is opt-in. The practical difference from registering a plain function is when the mistake surfaces. `Trader()` raises `TypeError` at construction, before a session starts, rather than an `AttributeError` mid-tick.",
          "code": "from abc import ABC, abstractmethod\nclass Trader(ABC):\n    @abstractmethod\n    def on_tick(self, market, portfolio): ...                  # subclasses MUST answer\n    def on_fill(self, side, symbol, qty, price): return None    # optional hook\nclass MyBot(Trader):\n    def on_tick(self, market, portfolio): return None\nprint(\"abstract:\", sorted(Trader.__abstractmethods__))\ntry: Trader()\nexcept TypeError: print(\"Trader() -> TypeError; MyBot() ok:\", isinstance(MyBot(), Trader))\n# abstract: ['on_tick']\n# Trader() -> TypeError; MyBot() ok: True",
          "deck": "Deck Week 1 · slide 12 · Deck Week 1 · slide 21"
        },
        {
          "title": "Dataclass or pydantic model: who checks the data",
          "text": "`@dataclass` writes `__init__`, `__repr__` and `__eq__` from your annotations and is the right tool for a value object you construct yourself — a `Trade`, a `Fill`, an `Order`. It does not validate anything: the annotations are documentation at runtime, so a string lands in a float field without complaint. A pydantic v2 model validates and coerces, which is why every message crossing a socket in this codebase is one. A dataclass believes you; a pydantic model checks you. Note also that pydantic models take keyword arguments only.",
          "code": "from dataclasses import dataclass\nfrom pydantic import BaseModel, ValidationError\n@dataclass\nclass Trade: symbol: str; price: float; quantity: int\nclass Signal(BaseModel): symbol: str; side: str; quantity: int\nprint(Trade(\"AAPL\", \"not a price\", 5))          # the dataclass believes you\nprint(\"coerced:\", Signal(symbol=\"AAPL\", side=\"buy\", quantity=\"5\").quantity)\ntry: Signal(symbol=\"AAPL\", side=\"buy\", quantity=\"five\")\nexcept ValidationError: print(\"pydantic rejected quantity='five'\")\n# Trade(symbol='AAPL', price='not a price', quantity=5)\n# coerced: 5\n# pydantic rejected quantity='five'",
          "deck": "Deck Week 1 · slide 13"
        },
        {
          "title": "Composition, duck typing, and the arrows on the diagram",
          "text": "Polymorphism is one call site and many implementations: the engine calls `generate_signal(...)` and does not care which class answers, and Python does not require a shared base — the right method is enough. Make the decision rule an object the bot HAS rather than something the bot IS, and you can swap it without touching the bot. That distinction is what the UML arrows record: `▷` generalisation for IS-A, `◆` composition for owns-with-shared-fate, `◇` aggregation for holds-but-outlives, `- ->` dependency for a transient use such as emitting a `Signal`, with `+`/`-`/`#` for visibility and `1`, `0..1`, `*` for multiplicity. Getting an arrow wrong on paper costs a minute.",
          "code": "class Momentum:\n    def decide(self, px): return \"buy\" if px[-1] > sum(px) / len(px) else \"flat\"\nclass AlwaysFlat:\n    def decide(self, px): return \"flat\"\nclass Bot:                                       # Bot HAS-A strategy\n    def __init__(self, strategy): self.strategy = strategy\n    def on_tick(self, px): return self.strategy.decide(px)   # one call site\nprint([Bot(s).on_tick([10.0, 11.0, 13.0]) for s in (Momentum(), AlwaysFlat())])\n# ['buy', 'flat']",
          "deck": "Deck Week 1 · slide 14 · Deck Week 1 · slides 17–18"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "The class model is the signal-to-order pipeline drawn as boxes. `on_tick(market, portfolio)` hands you two live objects and expects a `Signal` back; the engine then gates that signal through a risk check and turns the survivors into a `PlaceOrder` on the wire. Every hop is a typed contract, so a change of strategy is a change of one object and a change of message shape is a change everyone sees. Draw the diagram badly and you find out at the seam between your decision rule and the order that leaves the socket.",
          "Encapsulation is a live-risk control here, not a style preference. Two families of methods show up when you introspect the objects your hook receives: `update_book`, `update_trade` and `apply_server_update` are written by the engine, and `mid_price`, `best_ask`, `can_buy`, `net_worth` are read by you. The server is the source of truth for cash and positions. A bot that mutates its local portfolio and sizes the next order from that number is trading against its own bookkeeping, and it will keep buying after the venue has already rejected it.",
          "One interface is what makes an offline result about the code you actually ship. The same `Trader` subclass runs live against the exchange and headless in the simulator, because `_AdapterStrategy` and `as_signal_fn` translate between the simulator's `signal_fn(symbol, prices, history, book, portfolio)` and the SDK's `on_tick(market, portfolio)`. Two harnesses, one implementation — so a backtest is evidence rather than a parallel codebase that drifts. The adapter is composition and inheritance doing the same job as a cast in a typed language.",
          "Swapping strategy objects is also how you attribute cost. In the week-1 lab two bots race over 400 ticks behind a single interface: momentum crossed the spread 66 times, paid $113.57 in fees and handed the broker exactly the P&L it lost, while a mean-reversion bot with a 0.3% band never triggered and \"won\" by doing nothing. Loosen the band to 0.1% and it earns +45.37 realised while paying $142.66 in fees — still below its $100k start. Not trading is a strategy; paying the spread 66 times is a decision, and the object boundary is what lets you price it."
        ],
        "example": {
          "title": "In the arena",
          "text": "arena/trader.py — the ABC you subclass. One `@abstractmethod`, three optional hooks with defaults, and a `run()` you inherit; everything about sockets, auth and portfolio accounting lives behind it in trader/trader.py.",
          "code": "# arena/trader.py\nclass Trader(ABC):\n    \"\"\"Your algorithmic trader. Subclass and implement on_tick().\"\"\"\n\n    # -- The hooks (override these) ------------------------------------\n    @abstractmethod\n    def on_tick(self, market: MarketData, portfolio: Portfolio) -> Signal | None:\n        \"\"\"Called every tick. Return a Signal to trade, or None to sit out.\"\"\"\n\n    def on_fill(self, side: str, symbol: str, quantity: int,\n                price: float) -> None: ...\n\n    # -- Entry point (don't override) ----------------------------------\n    def run(self) -> None:\n        asyncio.run(_AdaptedTraderBot(self).run())"
        }
      },
      "interview": [
        {
          "q": "What is the difference between a class attribute and an instance attribute in Python?",
          "a": "A class attribute lives on the class object and is shared by every instance; an instance attribute lives in that object's `__dict__`. Attribute lookup checks the instance first, then the class, which is why reading works for both. Assignment does not: `obj.x = 1` always writes an instance attribute, so it shadows the class one rather than updating it. The classic bug is a mutable class attribute such as a list or dict, which really is shared — mutate it through one instance and every instance sees the change.",
          "level": "warm-up",
          "skill": "python.classes"
        },
        {
          "q": "What do a single and a double leading underscore mean on a Python attribute?",
          "a": "A single underscore is convention only: it tells the reader the name is internal and unsupported, and nothing in the language enforces it. A double leading underscore triggers name mangling — inside `class Portfolio`, `self.__ledger` is stored as `_Portfolio__ledger`. That exists to stop a subclass from accidentally colliding with a base class's private state, not to stop access; you can still reach it by the mangled name. There is no `private` in Python, so encapsulation is a documented interface plus `@property` for computed, read-only state.",
          "level": "warm-up",
          "skill": "python.classes"
        },
        {
          "q": "Why define a bot as an ABC with one abstract method rather than letting users register a plain function?",
          "a": "Because the contract is then checked at construction. `Trader()` raises `TypeError` before a session opens, whereas a missing function attribute surfaces as an `AttributeError` on some tick mid-market. The subclass also inherits the rest of the lifecycle for free — `run()`, and default `on_fill` / `on_event` / `on_ipo` — so adding a fourth hook next term does not break existing bots. And `isinstance` becomes meaningful, which matters for a registry that has to tell a trader from a broker. A bare function is fine when there is genuinely one callback and no lifecycle.",
          "level": "core",
          "skill": "python.abc"
        },
        {
          "q": "A message crosses a socket between two of your processes. Dataclass or pydantic model?",
          "a": "A pydantic model, because the data is untrusted the moment it leaves your process. A dataclass generates the boilerplate but does not check anything — annotations are not enforced at runtime, so a string happily occupies a float field and the error appears later, somewhere else. A pydantic v2 model validates and coerces on construction, serialises with `model_dump_json()`, and gives you a discriminated union to parse an incoming frame into the right type. Keep dataclasses for internal value objects you construct yourself, where the producer and consumer are the same code.",
          "level": "core",
          "skill": "python.dataclasses"
        },
        {
          "q": "When does inheritance become the wrong tool, and what do you use instead?",
          "a": "When you are inheriting for code reuse rather than because the subclass genuinely IS the base type. The symptoms are a deep tree, subclasses overriding methods to raise or to no-op, and a base class that grows a flag for every variant. Prefer composition: make the varying behaviour a separate object the class holds, so `Bot(strategy=Momentum())` delegates the decision and a new rule is a new small class with no edit to the bot. That is the Strategy pattern, and it also makes each rule testable in isolation, which a deep hierarchy does not.",
          "level": "core",
          "skill": "python.strategy-pattern"
        },
        {
          "q": "In a UML class diagram, what is the difference between aggregation, composition and dependency?",
          "a": "All three are \"knows about\", separated by lifetime and strength. Composition, the filled diamond, is ownership with shared fate: the whole creates and destroys the part, so a bot owning its portfolio is composition. Aggregation, the hollow diamond, is HAS-A with independent lifetimes — a venue holds bots that outlive it. Dependency, the dashed arrow, is transient use: a method takes or returns the type, such as `on_tick` emitting a `Signal`, and nothing is stored. Multiplicity goes on the ends — `1`, `0..1`, `*` — so \"an order book has many orders\" is a `*` rather than a comment.",
          "level": "core",
          "skill": "tools.uml"
        },
        {
          "q": "Explain super() and the MRO, and why hard-coding the parent class name is worse.",
          "a": "`super()` does not mean \"my parent\"; it means \"the next class after me in this instance's method resolution order\". The MRO is a linearisation of the inheritance graph, computed by C3, and you can read it off `Cls.__mro__`. Calling `Base.method(self, ...)` by name pins one class and silently skips anything a sibling contributed, so with multiple inheritance a mixin's `__init__` never runs. Using `super()` everywhere and accepting `**kwargs` in cooperative `__init__` methods keeps the chain intact whatever the subclass mixes in.",
          "level": "senior",
          "skill": "python.inheritance"
        },
        {
          "q": "You need to add a required hook to a base class that ten teams have already subclassed. How do you do it without breaking them?",
          "a": "Not by adding an `@abstractmethod` — that turns every existing subclass into something that cannot be instantiated. Ship it as a concrete method with a safe default (return `None`, sit out), so old subclasses keep working and new ones override it. Then deprecate in stages: log once when the default is used, document the date it becomes required, and only then make it abstract. The same reasoning applies to the hook's signature — take the new information in a dict or keyword-only argument rather than adding a positional parameter that every override must now accept.",
          "level": "senior",
          "skill": "python.abc"
        }
      ]
    },
    {
      "n": 2,
      "focus": "Concurrency & the asyncio event loop",
      "tagline": "One thread, many tasks, and a half-second tick budget: your hook is a callback inside somebody else's loop, and everything it blocks is a fill you never see.",
      "concepts": [
        {
          "title": "Concurrency is structure; parallelism is execution",
          "text": "Concurrency means many tasks are in progress and interleaved on one worker; parallelism means they run at the same instant on several cores. asyncio gives you the first and not the second: `gather` overlaps waiting, so three sleeps of 3, 2 and 1 seconds finish in 3 seconds rather than 6, on one thread and one core. Nothing ran faster — the waiting overlapped. That is the right trade for a trading bot, which is I/O-bound: sockets, feeds, acks. CPU-bound work is the other case, and CPython's GIL lets only one thread execute bytecode at a time, so threads give no speedup there and processes do.",
          "code": "import asyncio\ndone = []\nasync def worker(name, delay):\n    await asyncio.sleep(delay)          # non-blocking: yields to the loop\n    done.append(name); return f\"{name} ok\"\nasync def main():\n    res = await asyncio.gather(worker(\"feed\", 0.03), worker(\"quote\", 0.02), worker(\"order\", 0.01))\n    print(\"gather returns in call order:\", res)\n    print(\"they finished in this order:\", done)\nasyncio.run(main())\n# gather returns in call order: ['feed ok', 'quote ok', 'order ok']\n# they finished in this order: ['order', 'quote', 'feed']",
          "deck": "Deck Week 2 · slides 5–7"
        },
        {
          "title": "Calling a coroutine does not run it",
          "text": "`async def` defines a coroutine function. Calling it builds a coroutine object and executes nothing — the body runs only when something awaits it or the loop schedules it as a task. Forget the `await` and your program carries on cheerfully having done none of the work, with a `RuntimeWarning` about a coroutine that was never awaited buried in a log you are not reading. Worth knowing for this codebase: the engine's `on_tick` hook is a plain synchronous function called from inside the loop, so marking your override `async` returns a coroutine object the engine treats as a truthy signal.",
          "code": "import asyncio, inspect\nasync def best_ask(sym):\n    await asyncio.sleep(0)\n    return 185.50\ndef on_tick(market, portfolio): return None      # the arena hook: a plain def\nc = best_ask(\"AAPL\")                             # calling it does NOT run it\nprint(type(c).__name__, inspect.iscoroutine(c))\nprint(\"awaited:\", asyncio.run(c))\nprint(\"async?\", inspect.iscoroutinefunction(best_ask), \"on_tick async?\", inspect.iscoroutinefunction(on_tick))\n# coroutine True\n# awaited: 185.5\n# async? True on_tick async? False",
          "deck": "Deck Week 2 · slide 8"
        },
        {
          "title": "One blocking call freezes every task",
          "text": "A single-threaded loop runs one task at a time and switches only at an `await`. So `time.sleep`, a blocking HTTP call or a long numeric loop inside a coroutine stalls every other task for its whole duration — including the socket reader. In the week-2 lab three seconds of blocking work left the heartbeat 3,010 ms late; the same work through `asyncio.to_thread` cost it 4.8 ms. `async` buys nothing if you never `await`. Run with `debug=True` or `PYTHONASYNCIODEBUG=1` and the loop logs any callback that hogs it for more than 100 ms, which is the first thing to try when a bot \"misses fills for no reason\".",
          "code": "import asyncio, time\nasync def reader(stop, n):\n    while not stop.is_set(): await asyncio.sleep(0.005); n.append(1)\nasync def main(block):\n    stop, n = asyncio.Event(), []\n    t = asyncio.create_task(reader(stop, n))\n    await asyncio.sleep(0.02)\n    if block: time.sleep(0.2)                       # WRONG: freezes every task\n    else: await asyncio.to_thread(time.sleep, 0.2)  # RIGHT: off the loop\n    stop.set(); await t; return len(n)\nprint(\"reads during 0.2s of work - blocking:\", asyncio.run(main(True)) < 8, \"offloaded:\", asyncio.run(main(False)) > 20)\n# reads during 0.2s of work - blocking: True offloaded: True",
          "deck": "Deck Week 2 · slide 11"
        },
        {
          "title": "A bounded queue is backpressure; an unbounded one is a time machine",
          "text": "`asyncio.Queue` decouples a fast producer from a slower consumer, and `maxsize` is the interesting parameter: when the queue is full, `put()` waits, which is backpressure for free. Leave it unbounded and the producer races ahead — in the lab a 10,000-slot queue let the feed run about 1,960 ticks in front, so the strategy was deciding on prices two and a half seconds old, with no throughput gain whatsoever. Depth is latency you cannot see in a throughput number. When you cannot keep up, drop or coalesce stale book updates; never buffer them.",
          "code": "import asyncio\nasync def feed(q, n):\n    for i in range(n): await q.put(i)          # put() waits when the queue is full\n    await q.put(None)\nasync def strategy(q, seen):\n    while True:\n        seen.append(q.qsize())                 # ticks already queued behind me\n        if await q.get() is None: return max(seen)\n        await asyncio.sleep(0)                 # \"decide\" on this tick\nasync def run(size): q = asyncio.Queue(size); return (await asyncio.gather(feed(q, 200), strategy(q, [])))[1]\nprint(\"stale ticks behind you - maxsize=1:\", asyncio.run(run(1)), \"unbounded:\", asyncio.run(run(0)))\n# stale ticks behind you - maxsize=1: 1 unbounded: 201",
          "deck": "Deck Week 2 · slide 10"
        },
        {
          "title": "Atomic between awaits, not across them",
          "text": "One task runs at a time and yields only at an `await`, so plain state updates between awaits are atomic and the pre-emptive data races you fear from threads do not happen. What does happen is the logic race: a read, an `await`, then a write derived from the read. The other task ran in the gap, and your write lands on a stale value. The shape to hunt for in your own bot is read a position, `await` the order send, write back a computed position. The fix is `asyncio.Lock` around the section that spans the await — or better, stop sharing mutable state and pass data between tasks through a queue.",
          "code": "import asyncio\npos = 0\nasync def buy(qty):\n    global pos\n    local = pos                  # read\n    await asyncio.sleep(0)       # the seam: the other task runs right here\n    pos = local + qty            # write, from a now-stale read\nasync def main():\n    await asyncio.gather(buy(5), buy(5))\n    print(\"net position:\", pos, \"| expected:\", 10)\nasyncio.run(main())\n# net position: 5 | expected: 10",
          "deck": "Deck Week 2 · slide 12"
        },
        {
          "title": "Sockets drop: catch ConnectionClosed and back off",
          "text": "A live session will drop your socket — the venue restarts, the wifi blinks, a close frame arrives. `websockets.exceptions.ConnectionClosed` must be caught around the read loop, not inside the strategy, and the retry has to back off: double the delay and cap it, so thirty bots reconnecting do not arrive as a thundering herd on a venue that is still starting. Reset state on the way back in. The engine rebuilds `MarketData()` on every reconnect for a reason — a stale book is worse than no book, because it looks tradeable.",
          "code": "import asyncio\nasync def consume(attempts, delay=1.0):\n    log = []\n    for ok in attempts:\n        if ok:\n            log.append(\"connected\"); delay = 1.0; continue\n        log.append(f\"ConnectionClosed - retry in {delay:.0f}s\")\n        await asyncio.sleep(0)                      # stand-in for the real wait\n        delay = min(delay * 2, 30.0)                # exponential backoff, capped\n    return log\nprint(asyncio.run(consume([False, False, False, True])))\n# ['ConnectionClosed - retry in 1s', 'ConnectionClosed - retry in 2s', 'ConnectionClosed - retry in 4s', 'connected']",
          "deck": "Deck Week 2 · slide 14 · Deck Week 2 · slide 20"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "The signal-to-order pipeline in this codebase is two tasks on one loop. `run()` creates them both: `listen()` reads the socket and decodes book snapshots, acks and fills into `MarketData`, and `trading_loop()` sleeps `TICK_INTERVAL_SEC` — 0.5 s by default — then calls your hook, gates the returned `Signal` through a risk check and sends a `PlaceOrder`. Your hook is the synchronous step in the middle of an asynchronous machine. If it does not return, `listen()` does not run, `MarketData` stops updating, and you are deciding on a book that no longer exists.",
          "That is the live-risk failure, and it is measurable rather than theoretical. Block the loop for three seconds and three seconds of snapshots, acks and fills arrive at a socket nobody is reading; the lab's heartbeat measured 3,010 ms of starvation against 4.8 ms for the same work moved off the loop with `to_thread`. Scoring begins in week 2, so this is not a style point — a blocking bot misses fills, and it also misses the SESSION_CLOSED event that triggers flattening, which is how a position survives the end of a session.",
          "Queue depth is a transaction cost. A bounded queue makes the producer wait and keeps the prices you act on current; an unbounded one converts a slow consumer into stale decisions, and a stale decision crosses a spread that has already moved against it. The lab's two rows say it precisely: identical throughput, worst-case lag of a few milliseconds against roughly 2.4 seconds. Turnover multiplies that error, so the right response to falling behind is to drop or coalesce updates and keep the tick you act on fresh, not to buy a bigger buffer.",
          "There is exactly one legitimate thread here, and it is worth knowing why. `yfinance` is blocking HTTP with no async API — one `Ticker(...).fast_info.last_price` took 3.6 seconds in the lab, across ten symbols every 5 seconds — so the broker runs it in a daemon thread named `yahoo-feed` that writes one dict of floats, and the async quoting code reads that dict. Threads for blocking libraries, the loop for sockets, nothing shared but plain floats, and the thread's body wrapped so it never raises. That is the whole hand-off.",
          "Offline honesty has a limit here that is worth naming. The simulator runs the same `Trader` subclass with no network, which makes an offline P&L a statement about the code you ship — but it never stalls, never drops a socket and never delivers a book two seconds late. The failures this week is about are exactly the ones a clean harness cannot show you. So instrument the real thing: time `on_tick` and log a warning past 50 ms, run once with `debug=True`, and make your bot log a reconnect line and come back without being restarted."
        ],
        "example": {
          "title": "In the arena",
          "text": "broker/broker.py — the one thread in the codebase. `start_yahoo_feeds()` launches a daemon thread and `_yahoo_poll_loop()` writes into a plain dict the async quoting code reads; note the wrapper that guarantees it never raises.",
          "code": "# broker/broker.py\ndef start_yahoo_feeds(self) -> None:\n    \"\"\"Poll Yahoo Finance in a background daemon thread.\"\"\"\n    t = threading.Thread(target=self._yahoo_poll_loop,\n                         args=(config.EQUITY_SYMBOLS,),\n                         daemon=True, name=\"yahoo-feed\")\n    t.start()\n\ndef _yahoo_poll_loop(self, symbols: list[str]) -> None:\n    \"\"\"Runs in the yahoo-feed thread. Never raises - errors are logged.\"\"\"\n    import yfinance as yf\n    while True:\n        for sym in symbols:\n            try:\n                price = float(yf.Ticker(sym).fast_info.last_price)\n                if price > 0:\n                    self.state.yahoo_prices[sym] = price   # the whole hand-off\n            except Exception as exc:\n                logger.debug(\"Yahoo fetch failed for %s: %s\", sym, exc)\n        time.sleep(config.YAHOO_POLL_INTERVAL)"
        }
      },
      "interview": [
        {
          "q": "What is the difference between concurrency and parallelism, and which one does asyncio give you?",
          "a": "Concurrency is a structuring property: many tasks are in progress and interleaved, so progress on one overlaps waiting on another. Parallelism is an execution property: work happens at the same instant on multiple cores. asyncio gives concurrency only — one thread, cooperative scheduling, thousands of tasks — so it wins when the time goes on waiting for sockets and feeds, and buys nothing when the time goes on computing. Three network calls of 3, 2 and 1 seconds take 3 seconds under `gather`; three one-second CPU loops still take three.",
          "level": "warm-up",
          "skill": "python.event-loop"
        },
        {
          "q": "You call an async function and nothing happens. Why?",
          "a": "Calling a coroutine function returns a coroutine object; it does not execute the body. Something has to drive it — `await`, `asyncio.create_task`, `asyncio.gather`, or `asyncio.run` at the top. Without that the object is discarded and CPython emits a `RuntimeWarning: coroutine ... was never awaited`, which is easy to lose in a log. It is also worth checking whether the caller is even async: if a synchronous function calls a coroutine function, no amount of `await` in the callee helps, and `inspect.iscoroutinefunction` on both sides settles the argument.",
          "level": "warm-up",
          "skill": "python.coroutines"
        },
        {
          "q": "Why don't threads speed up CPU-bound Python, and what do you use instead?",
          "a": "CPython's global interpreter lock lets one thread execute bytecode at a time, so four threads doing pure Python arithmetic interleave rather than scale — you pay context switches for no throughput. Threads still help for blocking I/O, because the lock is released around a socket, disk or network wait. For real CPU parallelism use processes (`multiprocessing`, `ProcessPoolExecutor`), accepting separate memory and a serialisation cost at the boundary, or push the loop into a library that releases the GIL while it works, which is what a vectorised numpy operation does.",
          "level": "core",
          "skill": "python.gil"
        },
        {
          "q": "A bot stops receiving market data for seconds at a time, then catches up. How do you diagnose it?",
          "a": "That pattern is a blocked event loop, not a network problem: while one coroutine refuses to yield, the socket reader never runs and the data queues up in the kernel. First confirm it — run the loop with `debug=True` or `PYTHONASYNCIODEBUG=1`, which logs any callback that holds the loop for more than 100 ms, and add timing around the suspect hook. Then find the offender, which is nearly always `time.sleep`, a blocking HTTP client, a synchronous database driver, or a heavy numeric loop. Move it off the loop with `asyncio.to_thread` or a process pool, and re-measure the same way.",
          "level": "core",
          "skill": "python.non-blocking"
        },
        {
          "q": "Why give an asyncio.Queue a maxsize, and what do you do when the consumer cannot keep up?",
          "a": "`maxsize` makes `put()` wait when the queue is full, which pushes backpressure onto the producer and bounds memory. Unbounded, a fast feed and a slow strategy produce a deep queue, and depth is age: you keep full throughput while acting on prices that are seconds stale. For market data the right answer is usually not to queue at all — keep the latest snapshot per symbol and overwrite it, or coalesce updates so the consumer always gets the newest book. Queue everything you must not lose, such as fills and acks; drop what only the freshest value of matters.",
          "level": "core",
          "skill": "python.asyncio-queue"
        },
        {
          "q": "The event loop is single-threaded. Do you still need a lock?",
          "a": "Sometimes. You do not get the pre-emptive data races threads give you, because a task yields only at an `await`, so a sequence of plain statements between awaits is atomic. What survives is the logic race: read shared state, `await` something, then write a value derived from the stale read — the other task ran in that gap. Guard that span with `asyncio.Lock` if it must be serialised, or restructure so the state has one owner and the other tasks talk to it through a queue. `threading.Lock` is the wrong tool inside a coroutine: it blocks the loop rather than yielding.",
          "level": "core",
          "skill": "python.async-races"
        },
        {
          "q": "Design the reconnect path for a WebSocket market-data client.",
          "a": "Wrap the whole connect-and-read cycle in a loop, catch `ConnectionClosed` and `OSError` around it rather than inside the strategy, and back off exponentially with a cap and some jitter — `delay = min(delay * 2, 30)` — so a venue restart does not get a thundering herd from every bot at once, and reset the delay after a successful handshake. On reconnect, discard derived state: rebuild the local book rather than resuming from a stale one, and re-subscribe. Cancel the sibling tasks with the connection so a trading loop does not keep firing orders at a dead socket, and treat a clean close and an abnormal drop as the same event.",
          "level": "senior",
          "skill": "python.reconnect"
        },
        {
          "q": "Your signal needs a blocking C library that takes 20 ms per call, and the tick budget is 500 ms. Walk through the options.",
          "a": "First check whether it must be on the tick path at all — a cached or periodically refreshed value often removes the problem. If it must run per tick, `asyncio.to_thread` is the one-liner and is correct when the library releases the GIL while it works, which most C extensions doing real work do; if it holds the GIL, the thread starves the loop anyway and you need a process pool and the serialisation cost with it. Use `run_in_executor` with your own bounded pool when you need to limit concurrency. Whatever you pick, keep a deadline: if the result is not back in time, skip the tick rather than queue a stale decision.",
          "level": "senior",
          "skill": "python.multiprocessing"
        }
      ]
    },
    {
      "n": 3,
      "focus": "Sockets, WebSockets & typed message protocols",
      "tagline": "Bytes are not messages: frame them, upgrade the connection once, then let a pydantic model reject a bad order at the edge instead of three layers deep in the matching engine.",
      "concepts": [
        {
          "title": "TCP hands you bytes, not messages",
          "text": "TCP is a reliable, ordered byte stream with no message boundaries. Two sendall calls can arrive as one recv, and one call can arrive split across two. In the week-3 lab three sends came back as two receives: the first glued two JSON objects together and cut a third in half. json.loads raises on either buffer. There are exactly three fixes — a delimiter, a length prefix, or a protocol that frames for you.",
          "code": "import json, struct\nglued = b'{\"type\":\"place_order\"}{\"type\":\"cancel_order\"}'      # two sends, one recv\ntry: json.loads(glued)\nexcept json.JSONDecodeError as e: print(\"unframed ->\", e.msg)\nframe = lambda p: struct.pack(\"!I\", len(p)) + p\nwire = frame(b'{\"type\":\"place_order\"}') + frame(b'{\"type\":\"cancel_order\"}')[:9]\nmsgs, i = [], 0\nwhile i + 4 <= len(wire) and i + 4 + struct.unpack(\"!I\", wire[i:i + 4])[0] <= len(wire):\n    n = struct.unpack(\"!I\", wire[i:i + 4])[0]; msgs.append(wire[i + 4:i + 4 + n]); i += 4 + n\nprint(\"framed ->\", len(msgs), \"complete,\", len(wire) - i, \"bytes buffered\")\n# unframed -> Extra data\n# framed -> 1 complete, 9 bytes buffered",
          "deck": "Deck Week 3 · slide 6 · slide 11"
        },
        {
          "title": "One upgrade, then full duplex and framed",
          "text": "A WebSocket starts as an ordinary HTTP GET carrying Upgrade: websocket and a random Sec-WebSocket-Key. The server replies 101 Switching Protocols and echoes back the SHA-1 of your key concatenated with a fixed RFC 6455 GUID — that is how the client knows it reached a real WebSocket server and not a cache. From then on the same TCP connection is full-duplex and framed: one await ws.recv() returns exactly one message, never half and never two. HTTP polling gives you neither; SSE is server-to-client only, and a trader must also send orders.",
          "code": "import base64, hashlib\nGUID = \"258EAFA5-E914-47DA-95CA-C5AB0DC85B11\"       # RFC 6455, same on every server\nkey = \"dGhlIHNhbXBsZQ==\"                           # the client's Sec-WebSocket-Key\naccept = base64.b64encode(hashlib.sha1((key + GUID).encode()).digest()).decode()\nprint(\"HTTP/1.1 101 Switching Protocols\")\nprint(\"Sec-WebSocket-Accept:\", accept)\n# HTTP/1.1 101 Switching Protocols\n# Sec-WebSocket-Accept: OEPSNnbvaxYns+EYSv7+c2kBj+o=",
          "deck": "Deck Week 3 · slides 9–10"
        },
        {
          "title": "A protocol is a versioned contract",
          "text": "Framing says where a message ends; it says nothing about what the message means. The contract does: which types exist, what fields each carries, who may send it, and what a valid reply is. PlaceOrder from a client is answered by OrderAck from the venue. Contracts outlive their first release, so you evolve them by adding optional fields with defaults and never by repurposing an existing one. queue_ahead, maker_rebate and microprice were all added to AlgoArena mid-season that way, and no older bot broke.",
          "code": "from typing import Literal\nfrom pydantic import BaseModel\nclass OrderAck(BaseModel):\n    type: Literal[\"order_ack\"] = \"order_ack\"\n    order_id: str\n    price: float\n    queue_ahead: int = 0          # added mid-season: optional, with a default\nold = '{\"type\":\"order_ack\",\"order_id\":\"a1\",\"price\":309.48}'   # a pre-upgrade client\nack = OrderAck.model_validate_json(old)\nprint(\"parsed, queue_ahead =\", ack.queue_ahead,\n      \"| round-trip equal:\", OrderAck.model_validate_json(ack.model_dump_json()) == ack)\n# parsed, queue_ahead = 0 | round-trip equal: True",
          "deck": "Deck Week 3 · slide 14"
        },
        {
          "title": "Typed models beat raw dicts",
          "text": "A dict is a bag of maybe-there keys: msg['quatity'] is a KeyError at runtime, mid-session, and optional-versus-required is folklore you recover by reading every producer. A pydantic model makes the shape code the machine enforces on every parse. A Literal makes side='long' unrepresentable rather than merely detected later, and Field(gt=0) kills a zero-quantity order at the boundary. The class definition is also the authoritative spec — the model is the documentation.",
          "code": "from typing import Literal\nfrom pydantic import BaseModel, Field, ValidationError\nclass PlaceOrder(BaseModel):\n    symbol: str\n    side: Literal[\"buy\", \"sell\"]        # 'long' is unrepresentable, not just wrong\n    quantity: int = Field(gt=0)\nfor bad in ({\"symbol\": \"AAPL\", \"side\": \"long\", \"quantity\": 1},\n            {\"symbol\": \"AAPL\", \"side\": \"buy\", \"quantity\": 0}):\n    try: PlaceOrder(**bad)\n    except ValidationError as e: print(e.errors()[0][\"loc\"], \"-\", e.errors()[0][\"msg\"])\n# ('side',) - Input should be 'buy' or 'sell'\n# ('quantity',) - Input should be greater than 0",
          "deck": "Deck Week 3 · slides 15–16"
        },
        {
          "title": "Discriminated unions dispatch on `type`",
          "text": "One connection carries many kinds of message, so every message carries a discriminator: its type field. A union keyed on that field lets the parser pick the right model in one step instead of guessing the shape. AlgoArena splits its 21 types into two such unions by direction — AnyClientMessage is what you send, AnyExchangeMessage is what you receive — and parse_message dispatches either one on its tag. With TypeAdapter, pydantic does the selection and the validation together.",
          "code": "from typing import Annotated, Literal, Union\nfrom pydantic import BaseModel, Field, TypeAdapter\nclass OrderAck(BaseModel):\n    type: Literal[\"order_ack\"] = \"order_ack\"; order_id: str\nclass TradeExecution(BaseModel):\n    type: Literal[\"trade_execution\"] = \"trade_execution\"; price: float; fee: float\nparse = TypeAdapter(Annotated[Union[OrderAck, TradeExecution], Field(discriminator=\"type\")]).validate_python\nfor raw in ({\"type\": \"order_ack\", \"order_id\": \"a1\"},\n            {\"type\": \"trade_execution\", \"price\": 309.81, \"fee\": 0.4647}):\n    print(type(parse(raw)).__name__)\n# OrderAck\n# TradeExecution",
          "deck": "Deck Week 3 · slide 17 · slide 21"
        },
        {
          "title": "Three ways input is wrong, and none may kill the session",
          "text": "Decide up front what happens when a message is bad. Malformed — a missing field, a bad enum — gets rejected with a clear error before it reaches business logic. An unknown type, from a newer peer or a typo, gets logged and skipped. Unparseable input is not even JSON; catch the decode error, and consider closing only if it repeats. The venue's inbound guard is four lines and ends in continue, not raise: in the lab two junk frames both came back as ErrorMsg with the socket still open.",
          "code": "import json\nfrom pydantic import BaseModel, ValidationError\nclass PlaceOrder(BaseModel):\n    symbol: str; quantity: int\nTYPES, log = {\"place_order\": PlaceOrder}, []\nfor raw in ('{\"type\":\"place_order\",\"symbol\":\"AAPL\"}', '{\"type\":\"place_ordr\"}', 'nope'):\n    try: TYPES[json.loads(raw)[\"type\"]].model_validate(json.loads(raw))\n    except json.JSONDecodeError: log.append(\"unparseable\")\n    except KeyError: log.append(\"unknown-type\")\n    except ValidationError: log.append(\"malformed\")\nprint(log, \"-> connection stays open\")\n# ['malformed', 'unknown-type', 'unparseable'] -> connection stays open",
          "deck": "Deck Week 3 · slide 18"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "The wire is the last mile of the signal-to-order pipeline. Your strategy produces a number; that number only becomes a position by leaving the process as a PlaceOrder and coming back as an OrderAck and a TradeExecution. Every field on that round trip is a decision you can act on: order_type chooses whether you cross or rest, and queue_ahead on the ack tells you how many lots sit in front of you at your price. A bot that serialises by hand loses those fields quietly, and with them the ability to know whether it is ahead in the queue or behind.",
          "The protocol is also where live risk is contained. A public endpoint sees malformed frames, so one bad message must never take down a session — yours or the venue's. The venue answers with ErrorMsg and continues; your reader must do the same, because a crash mid-session leaves resting orders behind. That is why CANCEL_ON_DISCONNECT pulls a team's live orders when its socket closes. On the way back you reconnect with exponential backoff, re-handshake, and request a fresh snapshot rather than assuming the book you remember is still real.",
          "Costs travel on the wire too, which is what makes TCA possible at all. TradeExecution carries fee, maker_id and taker_id, so every fill is self-attributing: cross the ask and you are the taker paying the fee, rest and you are the maker earning the rebate out of it. In the lab a single share bought at 309.81 printed fee=0.4647 with maker=house_broker — 15 bps of notional for one lot of impatience. Read those fields per fill and your cost model stops being an assumption and becomes a measurement.",
          "Typed messages are what let one strategy be believable offline. Session recordings under sessions/ are the same JSON frames the exchange broadcast live, and scripts/backtest.py replays them through the same models, so the replay sees the identical field set with no adapter quietly inventing a mid price. Get the contract right in week 3 and the backtester in week 4 inherits it: if the offline path and the live path disagree, the disagreement is in your strategy, not in two different notions of what a book snapshot contains."
        ],
        "example": {
          "title": "In the arena",
          "text": "shared/messages.py — parse_message is the whole dispatcher, and the two failure modes it raises are exactly the two your reader must catch. _TYPE_MAP holds all 21 message types.",
          "code": "# shared/messages.py\ndef parse_message(raw: dict[str, Any]) -> BaseModel:\n    \"\"\"Dispatch a raw dict to the correct Pydantic model.\n\n    Raises KeyError if the 'type' field is missing or unrecognised.\n    Raises ValidationError if the payload is structurally invalid.\n    \"\"\"\n    msg_type = raw.get(\"type\")\n    if msg_type is None:\n        raise KeyError(\"Message is missing required 'type' field\")\n    model_cls = _TYPE_MAP.get(msg_type)\n    if model_cls is None:\n        raise KeyError(f\"Unknown message type: {msg_type!r}\")\n    return model_cls.model_validate(raw)"
        }
      },
      "interview": [
        {
          "q": "Would you carry orders over TCP or UDP, and does market data get the same answer?",
          "a": "Orders go over TCP. You need every order and fill exactly once and in order, and a lost cancel is worse than a slow one. Market data is the case for UDP: it is connectionless multicast with no retransmit, which suits a feed where a stale packet is worse than a missing one and one publisher fans out to many subscribers. The trade-off is that UDP gives you gaps you must detect by sequence number and recover from a separate snapshot channel.",
          "level": "warm-up",
          "skill": "python.sockets"
        },
        {
          "q": "Why does a live book use a WebSocket rather than HTTP polling?",
          "a": "Polling asks 'anything new?' on a loop: each request pays a full set of headers and a round trip, and you still miss every change that happens between polls. A WebSocket upgrades one TCP connection once and then pushes frames in both directions with a tiny header, so the exchange streams the book while you stream orders on the same pipe. SSE and long-polling fix the header tax but are effectively server-to-client, and a trader has to send orders too.",
          "level": "warm-up",
          "skill": "python.websockets"
        },
        {
          "q": "A colleague's feed reader calls json.loads on whatever recv returns and it fails under load. What is wrong?",
          "a": "recv returns bytes, not messages. TCP is a stream, so under load the kernel coalesces sends and one recv can contain two JSON objects plus half of a third — json.loads then raises 'Extra data' or 'Unterminated string'. The reader needs a framing layer: accumulate into a buffer and split on a delimiter, or length-prefix each payload and read exactly that many bytes. WebSocket is the third option and the reason we use it: the protocol frames for you, so one recv is one whole message.",
          "level": "core",
          "skill": "python.sockets"
        },
        {
          "q": "What does a pydantic Literal buy you over validating a str yourself?",
          "a": "It moves the check from your code to the boundary and from runtime to the type system. side: Literal['buy', 'sell'] means side='long' raises ValidationError at parse time with loc=('side',) and a clear message, so the illegal state is unrepresentable rather than detected three layers deep in the matcher. The type checker also narrows on it, so a match or if/else over the two cases is verifiable as exhaustive. Pair it with Field(gt=0) for quantity and a zero-lot order never reaches your risk code.",
          "level": "core",
          "skill": "python.pydantic"
        },
        {
          "q": "You have twenty message types on one socket. Why a discriminated union instead of trying each model until one validates?",
          "a": "Trial parsing is O(number of types) and ambiguous: two models with overlapping optional fields can both accept the same payload, so you silently build the wrong one. A union keyed on a type field is a single dict lookup to the right class, then one validation — and the error you get back names the actual type rather than twenty rejections. In pydantic that is Annotated[Union[...], Field(discriminator='type')] behind a TypeAdapter. Splitting the union by direction adds a second guarantee: a client cannot send something only the venue is allowed to say.",
          "level": "core",
          "skill": "python.discriminated-union"
        },
        {
          "q": "You must add a field to a protocol that is live, with clients you cannot redeploy. How?",
          "a": "Add it as optional with a default, and never change the meaning of an existing field. An older client omits it and still parses; a newer client sends it and older receivers ignore it. That is how queue_ahead and level_qty landed mid-season: an order_ack payload with neither field still validates, with both defaulting to 0. If the semantics genuinely change, introduce a new type or a new field name and deprecate the old one on a schedule — repurposing a field is the change that breaks peers silently, far from the boundary.",
          "level": "core",
          "skill": "tools.protocol-contract"
        },
        {
          "q": "A client starts sending garbage frames at a high rate. What should your server do?",
          "a": "Reject each frame at the parse boundary, answer with a typed error, and keep the connection open — one bad frame must not drop a session that has resting orders behind it. But an endpoint also needs an error budget: count parse failures per connection and per unit time, and close or rate-limit a peer that exceeds it, since sustained garbage is either a bug that will not fix itself or an attack. Log the discriminator and the validation loc, not the raw payload, and never let the handler's exception escape into the accept loop.",
          "level": "senior",
          "skill": "python.error-boundary"
        },
        {
          "q": "Your connection drops just after you send an order. You reconnect — do you resend it?",
          "a": "Only if resending is safe, which means the protocol has to make it safe. Attach a client-generated id to every order so the venue can recognise a repeat and return the original ack instead of executing twice; without that, a retry is a second position. On reconnect do not assume continuity: re-handshake, request a fresh snapshot, and reconcile your positions and open orders against the venue's view before acting, because fills may have happened while you were away. Back off exponentially so a venue restart does not get a reconnect storm.",
          "level": "senior",
          "skill": "python.reconnect"
        }
      ]
    },
    {
      "n": 4,
      "focus": "Event-driven backtester architecture",
      "tagline": "A backtest is a hypothesis test you can rig without noticing: one missing shift(1) turns Sharpe 2.38 into -0.19, and 15 bps of taker fee turns the survivor into a loser.",
      "concepts": [
        {
          "title": "Prototype vectorised, validate event-driven",
          "text": "A vectorised backtest computes signals over a whole price series at once with numpy or pandas. It is fast to write and the right first screen, but it makes peeking at the future a one-character mistake and it cannot model queues, partial fills or an order book. An event-driven loop steps through time one event at a time, so the strategy is only ever handed the past — and the same code path runs live. AlgoArena's simulator is event-driven for exactly that reason. If the two architectures disagree on a strategy, trust neither until you know why.",
          "deck": "Deck Week 4 · slides 5–6"
        },
        {
          "title": "The five-step loop and its invariant",
          "text": "Every backtester is a variation on five steps: take the next market event, ask the strategy for a signal, turn the signal into an order, simulate the fill, update cash and positions — then record the mark. The live engine runs the same five. The loop invariant is the whole value of the architecture: the strategy receives prices[:i+1] and there is no expressible way for it to see prices[i+1]. Structure, not discipline, is what keeps look-ahead out.",
          "code": "prices = [100 + (i % 20) * 0.5 for i in range(200)]\nsma = lambda xs, k: sum(xs[-k:]) / min(len(xs), k)\ncash, pos, trades, equity = 100_000.0, 0, 0, []\nfor i, px in enumerate(prices):\n    past = prices[: i + 1]                                # 1. event: the past only\n    target = 100 if sma(past, 5) > sma(past, 20) else 0    # 2. signal\n    delta = target - pos                                   # 3. order\n    if delta:\n        cash -= delta * px; pos += delta; trades += 1       # 4. fill  5. portfolio\n    equity.append(cash + pos * px)                         # record the mark\nprint(f\"ticks={len(equity)} trades={trades} equity={equity[-1]:.2f}\")\n# ticks=200 trades=19 equity=96200.00",
          "deck": "Deck Week 4 · slide 7"
        },
        {
          "title": "Honest fills cross the spread",
          "text": "Slippage is execution price minus decision price, and it comes from the spread, your queue position, and the market moving while you act. Assume you trade at the last price and the backtest lies in your favour on every trade. A buy lifts the ask and a sell hits the bid; an order larger than the touch walks the book to worse levels and gets a blended average, not its own limit. Twelve lots against a four-lot touch here pay 6 bps against the mid before a single fee.",
          "code": "asks = [(309.81, 4), (309.84, 6), (309.90, 20)]   # the resting sell side\nwant, cost, filled = 12, 0.0, 0\nfor px, qty in asks:\n    take = min(want, qty)\n    cost += take * px; filled += take; want -= take   # fill at the RESTING price\n    if not want: break\nmid, avg = 309.655, cost / filled\nprint(f\"naive says {mid}  honest avg {avg:.4f}  slippage {(avg - mid) / mid * 1e4:.1f} bps\")\n# naive says 309.655 honest avg 309.8400 slippage 6.0 bps",
          "deck": "Deck Week 4 · slide 8"
        },
        {
          "title": "The turnover trap",
          "text": "Costs are explicit and implicit. Explicit is the fee schedule: in AlgoArena the taker pays 0.0015 and the maker earns a 0.0010 rebate. Implicit is the half-spread you cross on each leg, plus your own impact, which grows with size and is often modelled as the square root of it. Both scale with the number of round trips, so halving your holding period roughly doubles the drag. A 40 bps gross edge survives one round trip and dies at two. Always report P&L net of costs.",
          "code": "gross_bps, taker_bps, half_spread_bps = 40.0, 15.0, 1.5   # arena taker fee = 0.0015\nfor round_trips in (1, 2, 4):\n    cost = round_trips * 2 * (taker_bps + half_spread_bps)   # two sides per round trip\n    print(f\"{round_trips} round trip(s): gross {gross_bps:.0f} bps \"\n          f\"cost {cost:.0f} bps  net {gross_bps - cost:+.0f} bps\")\n# 1 round trip(s): gross 40 bps cost 33 bps net +7 bps\n# 2 round trip(s): gross 40 bps cost 66 bps net -26 bps\n# 4 round trip(s): gross 40 bps cost 132 bps net -92 bps",
          "deck": "Deck Week 4 · slide 9"
        },
        {
          "title": "Read return, risk and shape together",
          "text": "One number never tells the story. CAGR normalises return to a year; Sharpe is mean excess return over its standard deviation, the return per unit of volatility; max drawdown is the largest peak-to-trough fall, the pain you have to survive to collect the return. Calmar divides CAGR by that drawdown and profit factor divides gross profit by gross loss. The path below compounds at 6.7% a year for a Sharpe of 0.47 and a 28% drawdown — a Calmar of 0.24 is not a tradeable strategy however positive the return.",
          "code": "import numpy as np\nrng = np.random.default_rng(4)\nr = rng.normal(0.0004, 0.01, 1000)                 # one equity path, 1000 bars\neq = 100_000 * np.cumprod(1 + r)\ncagr = (eq[-1] / eq[0]) ** (252 / len(r)) - 1\nsharpe = r.mean() / r.std(ddof=1) * np.sqrt(252)\nmdd = float((eq / np.maximum.accumulate(eq) - 1).min())\nprint(f\"CAGR {cagr:+.2%}  Sharpe {sharpe:+.2f}  maxDD {mdd:.2%}  Calmar {cagr / -mdd:.2f}\")\n# CAGR +6.68% Sharpe +0.47 maxDD -28.01% Calmar 0.24",
          "deck": "Deck Week 4 · slide 10"
        },
        {
          "title": "Look-ahead, and the biases the curve hides",
          "text": "The cardinal sin is using information you would not have had at decision time, and it is usually one index deep: sig[t] needs close[t] to exist, while ret[t] is the move into bar t, so the unlagged product earns a return it could never have captured. One .shift(1) takes the Sharpe below from 2.38 to -0.19, and the lab's planted version collapses the same way, 2.50 to 0.05. Survivorship bias and data snooping are quieter: test on today's index members and the bankruptcies are already deleted, and keeping the best of 500 variants selects the luckiest draw. The defence is a chronological split you touch exactly once, never a shuffled one.",
          "code": "import numpy as np, pandas as pd\nrng = np.random.default_rng(7)\npx = pd.Series(100 * np.cumprod(1 + rng.normal(0.0002, 0.01, 1500)))\nret, ma = px.pct_change(), px.rolling(40).mean()\nsig = (px > ma).astype(float)                       # long above the 40-bar SMA\nsharpe = lambda s: s.dropna().mean() / s.dropna().std() * 252 ** 0.5\nprint(f\"BUG  sig[t]   * ret[t]  Sharpe {sharpe(sig * ret):+.2f}\")\nprint(f\"FIX  sig[t-1] * ret[t]  Sharpe {sharpe(sig.shift(1) * ret):+.2f}\")\n# BUG sig[t] * ret[t] Sharpe +2.38\n# FIX sig[t-1] * ret[t] Sharpe -0.19",
          "deck": "Deck Week 4 · slide 12 · slides 14–16"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "Backtest honesty is an architectural property before it is a discipline. The reason we build the loop by hand is that handing the strategy prices[:i+1] makes the cardinal sin unexpressible, whereas a vectorised column makes it a one-character typo. The lab plants that typo on purpose: the unlagged signal reports +6.56% at Sharpe 2.50 and the shifted one +0.12% at Sharpe 0.05, on the same prices and the same rule. Nothing else about the strategy changed. Every believable offline number you quote this term rests on being able to point at where the future cannot leak in.",
          "One strategy, two worlds, is the point of the signal-to-order pipeline here. arena.as_signal_fn adapts a Trader's on_tick to the simulator's signal_fn(symbol, prices, history, book, portfolio), so the bot you compete with is the bot you backtest and there is no second codebase to drift. The fills are not simulated separately either: sim and live both match through shared/orderbook.py, the same price-time-priority CLOB. There is no 'assume I traded at the mid' available to you, which is why a sim P&L is worth reading at all.",
          "Costs are the largest position most student strategies hold. Fifteen basis points is the arena's real TAKER_FEE_RATE, and in the lab it took the momentum bot from -0.04% to -4.05% across 86 trades, dropping Sharpe by 2.7 and leaving max drawdown exactly equal to total return — a curve that only ever goes down. The in-sample parameter sweep then delivers the other lesson: the winning configuration was almost always the one that traded least, so the edge being selected was a cost reduction. Report net, count your trials, and treat turnover as a risk limit.",
          "The score you are ranked on is risk-adjusted, so backtest for it rather than for the headline. exchange/scoring.py takes mean excess return over a floored volatility, clamps the ratio, and then penalises drawdown by sign — a good return earned through a deep drawdown shrinks toward zero, and a loss with a deep drawdown gets worse. Week 4 is also when shorts unlock and the first IPO prices, which is when unbacktested position sizing starts costing real net worth. Size for the regime you have not lived through, because no backtest covers one it never saw."
        ],
        "example": {
          "title": "In the arena",
          "text": "sim/session.py — the whole arena in-process, no network, seedable. This is the reference event loop the lab asks you to narrate: four numbered steps, and no way for a trader to see a price that has not been produced yet.",
          "code": "# sim/session.py  — Main simulation loop\nfor tick_n in range(n_ticks):\n    # 1. Advance GBM prices.\n    exchange.advance_tick()\n\n    # 2. Record prices.\n    for sym in exchange.symbols:\n        price_history[sym].append(exchange.ref_prices[sym])\n\n    # 3. Broker requotes all symbols.\n    broker.tick()\n\n    # 4. Each trader generates and places a signal.\n    for trader in traders:\n        trader.tick()"
        }
      },
      "interview": [
        {
          "q": "Define look-ahead bias and give a concrete example.",
          "a": "It is using information that would not have been available at decision time. The textbook case is a signal computed from today's close multiplied by today's return: the return is the move into the bar, so the signal needs a price that did not exist when you supposedly traded. Lagging the signal by one bar fixes it. Subtler versions hide in reference data — using today's index membership, a restated earnings figure, or a split adjustment applied to the whole history rather than only after the split.",
          "level": "warm-up",
          "skill": "quant.look-ahead"
        },
        {
          "q": "Vectorised or event-driven — which backtester would you build, and when?",
          "a": "Both, in that order. Vectorised with numpy or pandas is the fast first screen: a few lines, whole-series arithmetic, good enough to reject an idea. Event-driven is what you validate and trade with, because stepping one event at a time lets you model queue position, partial fills, costs and latency, and because the same code path runs live. The practical rule is that if the two disagree on the same strategy you trust neither until you have found the reason, which is usually a lag or a fill assumption.",
          "level": "warm-up",
          "skill": "quant.event-driven-backtest"
        },
        {
          "q": "A strategy reports Sharpe 1.8. What else do you want to see before believing it?",
          "a": "Max drawdown and time under water, because a Sharpe of 1.8 with a 60% drawdown is untradeable; Calmar to combine the two. Then turnover and the P&L net of fees and slippage, since the cost drag scales with round trips and often accounts for the whole edge. Then hit rate against average win and loss size, to see whether the return is many small wins or one lucky outlier. Finally the P&L broken out by period, to check the Sharpe is not the average of one great regime and several bad ones.",
          "level": "core",
          "skill": "quant.performance-metrics"
        },
        {
          "q": "How would you model fills honestly for a strategy that trades 5,000 shares at a time?",
          "a": "Not at the last price. A buy pays the ask and a sell receives the bid, and once the order is larger than the displayed size at the touch it walks the book, so the fill price is the volume-weighted average over the levels consumed. Cap each fill at the size actually displayed and let the remainder rest or be cancelled according to the order type, which turns some of your trades into partials. Add a latency between signal and fill, and an impact term that grows with size — commonly modelled as the square root of participation.",
          "level": "core",
          "skill": "quant.fill-simulation"
        },
        {
          "q": "In-sample Sharpe is 2.5 and out-of-sample is 0.05. What happened and what do you do next?",
          "a": "A large in-sample to out-of-sample gap is the definition of overfitting: the parameters fit noise. Before retuning anything, check for a look-ahead bug, since those produce exactly this signature and are cheaper to find. Then count the configurations you tried, because the more variants you screened the higher the bar for significance, and the best of 500 is a luckiest-draw story. The fix is fewer parameters with an economic rationale, robustness to small changes rather than a fragile optimum, and a test set that is touched once.",
          "level": "core",
          "skill": "quant.overfitting"
        },
        {
          "q": "Why does survivorship bias flatter a buy-the-dip strategy in particular?",
          "a": "Because the strategy's thesis is that prices come back, and a universe of today's index members is a sample in which they always did. Every name that went bankrupt, delisted or was acquired has been deleted, so the dips that never recovered are simply absent from the data. The fix is a dataset that includes dead tickers with each name present only on the dates it actually traded. Selection bias is the cousin to watch for at the same time: choosing the symbols, dates or markets where the rule happens to work.",
          "level": "core",
          "skill": "quant.survivorship"
        },
        {
          "q": "A portfolio manager wants to halve the holding period to 'capture more moves'. What do you tell them?",
          "a": "That the gross edge per trade has to survive twice the cost, and it usually does not. Each round trip pays the taker fee on both legs plus the half-spread on both, so the drag scales linearly with turnover: a 40 bps gross edge that nets +7 bps at one round trip nets -26 at two. The alternative is to earn the other side of the schedule by resting rather than crossing, which turns the taker fee into a maker rebate — but it costs fill certainty and exposes you to adverse selection, so model that before promising it.",
          "level": "senior",
          "skill": "trading.maker-taker"
        },
        {
          "q": "How do you make a backtest reveal regime dependence rather than average it away?",
          "a": "Stop reporting one blended number. Break the P&L out by calendar period and by a regime label defined independently of the strategy — realised volatility buckets, rate cycles, liquidity conditions — and look at the dispersion, not the mean. A robust strategy is merely acceptable everywhere; a fragile one is spectacular in one window and bleeding elsewhere, and the blended Sharpe hides that. Walk-forward, which we build in week 7, rolls the train and test split through time so each out-of-sample window is judged in its own regime.",
          "level": "senior",
          "skill": "quant.regime-change"
        }
      ]
    },
    {
      "n": 5,
      "focus": "Algorithmic complexity & data structures",
      "tagline": "Choose the container by the operation you repeat most: a heap plus a dict answers 'best bid?' in O(1) while a re-sorted list burns 475 times more for the identical answer.",
      "concepts": [
        {
          "title": "The Big-O ladder, and where constants still matter",
          "text": "Big-O says how work grows with n, ignoring constants: O(1) for a dict lookup or a deque append, O(log n) for a binary search or a heap push, O(n) for a list scan, O(n log n) for a sort, and O(n squared) for nested loops that are fine at n=100 and fatal at a million. Read it as a curve, not a stopwatch: a fast O(n) can beat a heavy O(log n) at small n, but n grows. Know the worst case too — dict is O(1) average and O(n) under pathological collisions, so you design for the common case and guard the tail.",
          "code": "import timeit\nsetup = \"d = {k: k for k in range(100_000)}; xs = list(range(100_000)); n = 99_999\"\nper = lambda stmt, num: min(timeit.repeat(stmt, setup=setup, number=num, repeat=3)) / num\nt_dict = per(\"d[n]\", 200_000)          # O(1) hash lookup\nt_scan = per(\"n in xs\", 200)           # O(n) linear scan, worst case\nprint(f\"dict {t_dict * 1e6:.3f} us   list scan {t_scan * 1e6:.1f} us   ~{t_scan / t_dict:.0f}x\")\nprint(\"O(1) beats O(n) at n=100k:\", t_dict < t_scan)\n# O(1) beats O(n) at n=100k: True",
          "deck": "Deck Week 5 · slides 5–7"
        },
        {
          "title": "Pick the container by the question you ask most",
          "text": "Four structures carry most trading code. A dict answers 'what is X?' — order id to Order, symbol to price — in O(1) average, and it is the canonical live set. A set answers 'have I seen X?' with the same hashing and no values. A deque appends and pops at both ends in O(1), and deque(maxlen=k) gives a fixed rolling window that evicts the oldest for free. A heap answers 'best of many': O(log n) push and pop, O(1) peek at the minimum. Know the trade against space as well — a lookup table buys time with memory — and that list.append is O(1) amortised because the occasional resize averages out over cheap appends.",
          "deck": "Deck Week 5 · slides 7–8"
        },
        {
          "title": "O(1) rolling statistics beat recomputing",
          "text": "on_tick fires on every price update, so recomputing a mean and variance over the full history each call is O(n) per tick and O(n squared) over a session. Keep incremental state instead. A running sum gives an O(1) mean; Welford updates mean and variance together in one pass without storing history and without the sum-of-squares cancellation that wrecks a naive variance in floating point. The lab measures it: identical variance, 515 times faster at N=2000 and 6,093 times at N=20,000 — the speedup is not a constant, it grows with session length.",
          "code": "import statistics\nclass Welford:                                 # O(1) mean + variance, one pass\n    def __init__(self): self.n = 0; self.mean = 0.0; self.m2 = 0.0\n    def update(self, x):\n        self.n += 1; d = x - self.mean\n        self.mean += d / self.n                # O(1)\n        self.m2 += d * (x - self.mean)         # stable: no sum of squares\n    def var(self): return self.m2 / (self.n - 1)\npx = [100 + (i % 97) * 0.01 for i in range(5_000)]; w = Welford()\nfor p in px: w.update(p)\nprint(\"ticks:\", w.n, \"| var matches recompute:\", abs(w.var() - statistics.variance(px)) < 1e-9)\n# ticks: 5000 | var matches recompute: True",
          "deck": "Deck Week 5 · slides 9–10"
        },
        {
          "title": "The order book is a heap plus a dict",
          "text": "A book must answer 'best price?' constantly and match by price first, then time. Scanning every resting order is O(n) on every incoming order. Two min-heaps keyed on (price, seq, order_id) give O(log n) insert and an O(1) peek at the extreme — bids negate the price, asks use it raw. seq is a monotonic arrival counter rather than a timestamp, because floats tie and counters never do, which is what makes queue position exact. A dict of live orders stays the canonical set; the heaps are only a fast index into it. Cancelling deletes from the dict alone and the stale heap entry is popped lazily on the next read, so cancels stay cheap and reads stay correct.",
          "code": "import heapq\nbids, orders = [], {}                          # min-heap index + canonical dict\nfor oid, px in enumerate([100.01, 100.03, 100.03]):\n    heapq.heappush(bids, (-px, oid, oid)); orders[oid] = px   # (-price, seq, id)\ndef best_bid():\n    while bids and bids[0][2] not in orders: heapq.heappop(bids)   # lazy delete\n    return (-bids[0][0], bids[0][2]) if bids else None\nprint(\"best bid, front order:\", best_bid())\ndel orders[1]                                  # cancel == one O(1) dict delete\nprint(\"after cancel:\", best_bid(), \"| heap entries left:\", len(bids))\n# best bid, front order: (100.03, 1)\n# after cancel: (100.03, 2) | heap entries left: 2",
          "deck": "Deck Week 5 · slide 11 · slide 18"
        },
        {
          "title": "Measure, then optimise",
          "text": "Intuition about performance is famously wrong, so profile before you touch anything. cProfile finds which function dominates across a run; timeit compares two implementations over many loops; perf_counter measures a block in situ against your per-tick budget. A careless benchmark lies, so warm up and discard the first runs, repeat and report the minimum — the minimum is the least-contaminated sample while the mean drags in OS noise — and time only the hot path with allocation hoisted out of the loop. Never benchmark n=1, and never tune a function called twice per session.",
          "code": "import timeit\nsetup = \"xs = [100.0 + i * 0.01 for i in range(20_000)]\"\nruns = timeit.repeat(\"sum(xs[-20:]) / 20\", setup=setup, number=20_000, repeat=7)\nper = [t / 20_000 * 1e6 for t in runs]\nprint(f\"min {min(per):.3f} us   mean {sum(per) / len(per):.3f} us   max {max(per):.3f} us\")\nprint(\"min <= mean (noise only ever adds time):\", min(per) <= sum(per) / len(per))\n# min <= mean (noise only ever adds time): True",
          "deck": "Deck Week 5 · slides 13–14"
        },
        {
          "title": "Latency, throughput and the tail that gets you picked off",
          "text": "Latency is the time for one operation end to end; throughput is operations per second. For a trader latency is edge, because slow means acting on stale prices; for an exchange throughput is capacity under load. They trade against each other — batching raises throughput and raises latency — so tune for the role you play. Averages hide the pain: a 5 microsecond mean with a 140 microsecond p99 means one tick in a hundred is catastrophic, and those are usually the volatile ticks that matter. Report p50, p95 and p99, and keep the p99 under your per-tick budget with room to spare.",
          "code": "import random, statistics\nrandom.seed(7)\nlat = [3.3 + random.random() for _ in range(990)]      # the quiet ticks\nlat += [140.0 + random.random() for _ in range(10)]    # the shock burst: 1 in 100\nlat.sort()\npct = lambda q: lat[min(int(q * len(lat)), len(lat) - 1)]\nprint(f\"mean {statistics.mean(lat):6.2f} us   p50 {pct(.50):5.2f} us\"\n      f\"   p95 {pct(.95):5.2f} us   p99 {pct(.99):6.2f} us\")\nprint(\"mean hides the tail:\", statistics.mean(lat) < pct(.99) / 10)\n# mean 5.15 us p50 3.77 us p95 4.26 us p99 140.04 us\n# mean hides the tail: True",
          "deck": "Deck Week 5 · slide 16"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "A slow signal is not a signal. Prices move while you compute, so the per-tick budget is the real constraint on the signal-to-order pipeline: whatever on_tick spends is time the book had to move against the decision it is about to produce. The lab makes the cost visible without changing a single trading rule. FastBot keeps its statistics over a fixed window and runs at p50 3.33 microseconds, p99 7.38; SlowBot computes the same signal by rescanning full history and runs at p50 71.58, p99 145.04. Same fills, same edge, twenty times the latency — and SlowBot's median keeps climbing all session because its cost is O(n) in history.",
          "The order book is where the theory is load-bearing. shared/orderbook.py holds two min-heaps of (price, seq, order_id) plus a canonical dict, so best_bid measured 0.075 microseconds and stayed dead flat from 1,000 to 100,000 resting orders — a lazy heap clean followed by an O(1) peek, on the operation the venue repeats most. get_snapshot is the counterexample: it aggregates price levels by iterating _orders, so it went from 96 microseconds to 8,461 across the same range, exactly linear, and the exchange calls it on every broadcast. Knowing which of your reads is which separates a venue that holds up under load from one that does not.",
          "Tail latency is a live-risk control, not a vanity metric. The p99 arrives during a shock burst, when ticks come fastest and the book is moving most, which is precisely when a stale quote gets taken. For a market maker that is adverse selection, and it shows up in TCA as fills that sit systematically on the wrong side of the next mid: a rebate does not cover a spread you quoted against a price that no longer exists. Cancel latency has the same shape — a requote you cannot land in time is a free option you have written to the fastest taker in the session.",
          "Complexity also decides what you can honestly test. An O(n squared) per-session statistic makes a 20,000-tick backtest take twelve seconds, which is enough to stop you running the parameter sweeps and walk-forward windows that would have caught the overfit. Welford and the full recompute agree on the variance to floating-point precision; the only difference is the curve. Fast, correct hot paths are what buy you the number of honest runs, and they are the same paths week 6 goes on to distribute.",
          "This session also carries the midterm: 30 multiple-choice questions in 90 minutes, one attempt, closed book, drawn from weeks 1 to 5. It rewards exactly the vocabulary above — naming the complexity class of an operation, choosing the container that matches the question you repeat most, and reading a percentile table rather than a mean. The homework that follows has you build an order book from scratch and defend it with a written complexity table and a benchmark, so treat tonight's measurements as the reference you will be held to."
        ],
        "example": {
          "title": "In the arena",
          "text": "shared/orderbook.py — lazy deletion is three lines, and it is why best_bid stays flat as the book grows. Cancelling only removes the entry from _orders; the dead heap entry is popped on the next read.",
          "code": "# shared/orderbook.py\ndef _clean_heap(self, heap: list) -> None:\n    \"\"\"Pop stale (dead) entries from the heap front until a live entry is found.\"\"\"\n    while heap and heap[0][2] not in self._orders:\n        heapq.heappop(heap)\n\ndef best_bid(self) -> float | None:\n    \"\"\"Highest resting bid price, or None if no bids.\"\"\"\n    self._clean_heap(self._bids)\n    return -self._bids[0][0] if self._bids else None\n\ndef best_ask(self) -> float | None:\n    \"\"\"Lowest resting ask price, or None if no asks.\"\"\"\n    self._clean_heap(self._asks)\n    return self._asks[0][0] if self._asks else None"
        }
      },
      "interview": [
        {
          "q": "Give the complexity of a dict lookup, a list membership test and a heap push, and say which you would use to track the best bid.",
          "a": "A dict lookup is O(1) average, a list membership test is O(n), and heapq.heappush is O(log n) with an O(1) peek at heap[0]. For the best bid you want the heap: the operation you repeat most is reading the extreme, and a heap makes that a constant-time peek while keeping inserts logarithmic. A sorted list gives the same O(1) read but pays O(n) per insert to keep the order, and re-sorting on every insert is far worse than that — the lab measured 475 times worse for the identical answer.",
          "level": "warm-up",
          "skill": "python.bigo"
        },
        {
          "q": "You need the last 50 prices in a hot loop. list or deque?",
          "a": "deque(maxlen=50). Appending is O(1) at both ends and the maxlen evicts the oldest element for you, so the window never grows and there is no per-tick slicing or copying. A list append is also O(1) amortised, but trimming the front with pop(0) or a slice is O(n), and keeping the whole history alive means every statistic computed over it grows with the session. The one thing a list gives you that a deque does not is O(1) random indexing in the middle, which a rolling window rarely needs.",
          "level": "warm-up",
          "skill": "python.containers"
        },
        {
          "q": "Why is a min-heap the right structure for one side of an order book, and what goes in the key?",
          "a": "Because the operation repeated on every incoming order is 'what is the best price?', and a heap answers that with an O(1) peek and an O(log n) insert. The key is a tuple (price, seq, order_id): price orders the book, seq breaks equal-price ties by strict arrival order, and the id is a final deterministic tiebreak. Bids negate the price so the same min-heap yields the highest bid. seq is a monotonic counter rather than a timestamp because two floats can be equal and a counter cannot, which is what makes queue position exact.",
          "level": "core",
          "skill": "trading.price-time-priority"
        },
        {
          "q": "A cancel arrives. Why not remove the order from the heap immediately?",
          "a": "Because heapq offers no O(log n) delete of an arbitrary element — finding it is O(n) and repairing the invariant costs more. Lazy deletion instead makes the dict of live orders the single source of truth: cancel is one O(1) del from _orders, and the stale heap entry is popped on the next read, when a clean loop discards front entries whose ids are no longer live. That keeps cancels cheap in the path that has to be cheap. The correctness condition is that every read either cleans first or iterates the canonical dict, so a dead entry can never be matched against or reported in a snapshot.",
          "level": "core",
          "skill": "trading.clob"
        },
        {
          "q": "Your on_tick recomputes a 200-period mean and standard deviation from full history. Fix it, and say why Welford rather than a running sum of squares.",
          "a": "Keep incremental state. A running sum gives an O(1) mean, and a deque(maxlen=200) plus add-new and subtract-old gives an O(1) window; over a session that turns O(n squared) work into O(n). For the variance, the naive route stores sum(x) and sum(x*x) and subtracts them, which cancels catastrophically when prices are large and the variance is small — it can return a negative variance. Welford updates the mean and the sum of squared deviations from that running mean, so it is one pass, stores no history, and is numerically stable.",
          "level": "core",
          "skill": "quant.rolling-stats"
        },
        {
          "q": "Walk me through benchmarking two implementations of a hot function so I can trust the result.",
          "a": "Profile first to confirm the function actually dominates, otherwise the comparison does not matter. Then time only the hot path with setup and allocation hoisted out, loop enough that total time is well above timer resolution, warm up and discard the first runs so imports and caches have settled, and repeat — timeit.repeat with a handful of repeats, reporting the minimum and noting the spread, because the minimum is the least-contaminated run while the mean absorbs OS noise. Verify both versions produce the same answer, and watch for input that flatters one of them, like Timsort running linearly on already-sorted data.",
          "level": "core",
          "skill": "tools.profiling"
        },
        {
          "q": "Your bot's p50 is 3 microseconds and its p99 is 200 milliseconds. What do you investigate?",
          "a": "A gap that large is not the algorithm, it is something occasional and blocking, so look for the events that only happen sometimes: a synchronous log flush or network call on the decision path, a garbage-collection pause, a dict or buffer resize, a lock contended by a poller, or a rare branch that rescans full history. Instrument per-stage timings and keep the percentiles rather than the mean, then attack whichever stage owns the tail. It matters more than the median because the p99 lands during a shock burst, when ticks arrive fastest and a stale quote is exactly what gets picked off.",
          "level": "senior",
          "skill": "tools.latency-tail"
        },
        {
          "q": "get_snapshot is O(N) in total resting orders because it aggregates by iterating the canonical order dict. How would you make it O(levels returned)?",
          "a": "Maintain a price-level index alongside the canonical dict: a dict keyed by (side, price) holding aggregated quantity and a FIFO of order ids, plus a heap of live prices per side. A snapshot of depth k then reads the k best prices off the heap and takes their aggregates, independent of N. The cost is that every mutation must maintain it — place increments the level and appends to the queue, cancel decrements and removes, and a level that hits zero is dropped or marked dead for lazy cleanup. Test that the index and the dict never disagree, because two sources of truth is the bug this design invites.",
          "level": "senior",
          "skill": "python.hot-loop"
        }
      ]
    },
    {
      "n": 6,
      "focus": "Big data & distributed compute",
      "tagline": "Store data in columns, process it in chunks, and fan the backtest out over processes — so you can search a strategy space instead of running one config.",
      "concepts": [
        {
          "title": "The memory wall — measure before you scale",
          "text": "pandas holds the whole frame in RAM, and the in-memory footprint is routinely 2-10x the file on disk. Cross physical memory and the OS swaps: everything falls off a cliff at roughly 1000x slower. Before you reach for a cluster, measure with df.info(memory_usage='deep') or df.memory_usage(deep=True) — without deep=True pandas reports the pointer array and hides the strings entirely. Then downcast: float64 to float32, object to category. In the week-6 lab that one step took a 250 000-row snapshot frame from 25.3 MB to 7.3 MB, 3.5x smaller, almost all of it from turning 250 000 Python strings into int8 category codes.",
          "code": "import pandas as pd\nsym = [\"AAPL\", \"MSFT\", \"NVDA\", \"TSLA\", \"AMZN\"] * 20_000\nwide = pd.DataFrame({\"symbol\": sym, \"mid\": [182.5] * len(sym), \"spread\": [0.02] * len(sym)})\nlean = wide.astype({\"symbol\": \"category\", \"mid\": \"float32\", \"spread\": \"float32\"})\nw = wide.memory_usage(deep=True).sum(); l = lean.memory_usage(deep=True).sum()\nprint(\"rows\", len(wide), \"| lean at least 3x smaller:\", w > 3 * l)\nprint(\"dtypes\", lean.symbol.dtype, lean.mid.dtype, \"| codes\", lean.symbol.cat.codes.dtype)\n# rows 100000 | lean at least 3x smaller: True\n# dtypes category float32 | codes int8",
          "deck": "Deck Week 6 · slide 5"
        },
        {
          "title": "Rows versus columns — CSV against Parquet",
          "text": "How the bytes are laid out on disk decides how many of them you have to read. CSV is row-oriented text: no types, no column pruning, large on disk. Parquet is columnar, typed and compressed, so you read only the columns you touch and a column of near-identical floats compresses 5-20x with zstd or snappy. The lab measured the same tape at 61.6 MB as JSONL, 16.9 MB as CSV and 2.7 MB as Parquet, and pruning to two columns read ~28x faster than the CSV. Parquet also round-trips dtypes; CSV hands back float64 and silently undoes your downcasting. Rule: CSV to exchange with humans, Parquet for anything you re-read.",
          "code": "import os, tempfile, pandas as pd\ndf = pd.DataFrame({\"ts\": range(50_000), \"symbol\": [\"AAPL\"] * 50_000,\n                   \"mid\": [182.5] * 50_000}).astype({\"mid\": \"float32\"})\nwith tempfile.TemporaryDirectory() as d:\n    csv, pq = os.path.join(d, \"t.csv\"), os.path.join(d, \"t.parquet\")\n    df.to_csv(csv, index=False); df.to_parquet(pq, index=False)\n    two = pd.read_parquet(pq, columns=[\"ts\", \"mid\"])        # column pruning\n    print(\"parquet smaller:\", os.path.getsize(pq) < os.path.getsize(csv),\n          \"| csv returns\", pd.read_csv(csv).mid.dtype, \"| parquet keeps\", two.mid.dtype)\n    print(\"columns touched:\", list(two.columns))\n# parquet smaller: True | csv returns float64 | parquet keeps float32\n# columns touched: ['ts', 'mid']",
          "deck": "Deck Week 6 · slide 6"
        },
        {
          "title": "Chunk it, reduce as you go, carry the state",
          "text": "If the file will not fit, do not load it. Read bounded pieces — pd.read_csv(chunksize=...) or your own line blocks — and reduce each piece into an accumulator, so memory is O(chunk + state) regardless of file size. The lab computed the same per-symbol statistic at 44 MB peak RSS chunked against 229 MB loading everything. The trap is the rolling window: a 100-bar SMA must survive chunk boundaries, so the deque per symbol is carried across chunks. Drop it and the first 99 rows of every chunk get a wrong window — a silent, wrong number, not a crash. And only statistics that compose survive this pattern: (sum, count) does, a median does not.",
          "code": "import itertools\nfrom collections import deque\nsrc = (100.0 + (i % 13) * 0.5 for i in range(20_000))  # a stream, never fully in RAM\nwin, tot, n = deque(maxlen=20), 0.0, 0\nwhile blk := list(itertools.islice(src, 4_096)):       # bounded chunks\n    for px in blk:\n        win.append(px)                                 # state CARRIED across chunks\n        if len(win) == 20:\n            tot += sum(win) / 20; n += 1\nprint(\"sma samples\", n, \"| mean of 20-bar SMA\", round(tot / n, 4))\n# sma samples 19981 | mean of 20-bar SMA 103.0",
          "deck": "Deck Week 6 · slides 8–9"
        },
        {
          "title": "Scale up first, then out — and use processes",
          "text": "Vertical scaling needs no code change but has a ceiling and prices superlinearly; horizontal scaling is near-unlimited but you must partition the work and combine the results. More RAM plus smaller dtypes plus Parquet often removes the problem outright, so start there. When you do go parallel, remember the GIL: only one thread runs Python bytecode at a time, so threads buy nothing for a CPU-bound sweep. Use processes — ProcessPoolExecutor from the stdlib, with the __main__ guard, because each worker re-imports your module and without the guard it re-spawns the pool. joblib is the same idea in one line. Dask and Ray extend it across machines; this course names them and stays on one box.",
          "code": "from concurrent.futures import ProcessPoolExecutor\nimport numpy as np\ndef cycles(lookback):              # CPU-bound shard: one parameter, one process\n    s = np.sign(np.sin(np.arange(200_000) / lookback))\n    return lookback, int((np.diff(s) != 0).sum())    # deterministic per shard\nif __name__ == \"__main__\":         # mandatory: every worker re-imports this file\n    with ProcessPoolExecutor(max_workers=2) as pool:\n        par = dict(pool.map(cycles, [5, 10, 20, 40]))  # map\n    print(par)                                         # reduce\n    print(\"parallel == sequential:\", par == dict(map(cycles, [5, 10, 20, 40])))\n# {5: 12733, 10: 6367, 20: 3184, 40: 1592}\n# parallel == sequential: True",
          "deck": "Deck Week 6 · slides 11–12"
        },
        {
          "title": "Map, reduce, shard — and what will not shard",
          "text": "The mental model behind every scale-out: apply the same function to each independent piece (map), then combine the partials (reduce), with a shard key chosen so the pieces really are independent — per symbol, per date range, per parameter. Parameter sweeps and per-symbol backtests are embarrassingly parallel: nothing is shared, so you just collect results. A stateful order book is not. Matching depends on the order of arrivals, so sharding it blindly changes the answer; dependencies force coordination. Measure the win rather than assuming n_cores: the lab's byte-range map-reduce over ten shards returned 2.1x, because process start-up, pickling partials and one shared disk all take their cut.",
          "deck": "Deck Week 6 · slides 13–14"
        },
        {
          "title": "Idempotency and reproducibility under fan-out",
          "text": "Distributed jobs retry, reorder and run out of process, so correctness needs determinism and safe re-runs. Make each task idempotent by keying its output on a hash of its inputs: running it twice writes the same file and nothing is double-counted, and a resumed sweep skips what is already on disk. Make it reproducible by pinning the seed (SimSession takes seed=), the data version and the dtypes, so every worker computes the same numbers. Keep workers pure: inputs in, output out, no shared mutable state and no hidden globals. Note that the float32 win from downcasting costs you exactness — the lab's vectorised and loop versions agreed only to ~1.8e-3, so assert with a tolerance you can defend.",
          "code": "import hashlib, json\ndef key(params):                     # one output file per input set\n    blob = json.dumps(params, sort_keys=True).encode()\n    return \"sweep_\" + hashlib.sha256(blob).hexdigest()[:8] + \".parquet\"\na = key({\"lookback\": 20, \"spread\": 0.3, \"seed\": 7})\nb = key({\"seed\": 7, \"spread\": 0.3, \"lookback\": 20})   # same inputs, keys in any order\nc = key({\"lookback\": 40, \"spread\": 0.3, \"seed\": 7})\nprint(a)\nprint(\"re-run is a no-op:\", a == b, \"| new config, new file:\", a != c)\n# sweep_b2945585.parquet\n# re-run is a no-op: True | new config, new file: True",
          "deck": "Deck Week 6 · slide 15"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "Scale is what separates a strategy from a search. One backtest tells you whether one lookback worked on one tape; a sweep tells you whether the edge exists across a neighbourhood of parameters, which is the only version worth trading. That is why the week-6 deliverable is a parallel sweep with one run per configuration and a Sharpe collected per point, and why the headless sim is built to be fanned out: SimSession().run() is pure and in-process with no sockets, so twenty of them can run at once.",
          "The pipeline splits in two at a hard seam. Offline you build features — returns, rolling means, rolling vol — and cache them to Parquet; online your signal function reads the freshest rows of that frame and does arithmetic only. Get the seam wrong and you pay twice: a groupby-rolling inside on_tick blows the per-tick budget, and features computed differently offline and live give you a bot that was validated on numbers it never sees again.",
          "Reproducibility is what makes an offline result believable. A sweep that cannot be re-run to the same numbers cannot be defended: pin seed=, pin the data version, pin the dtypes, and key every output on a hash of its inputs so a retried worker overwrites itself instead of double-counting. Log every configuration you tried, too — that count is what week 7 uses to deflate the best Sharpe you found, and a sweep is a very efficient way to try hundreds of things.",
          "Costs are the reason you keep the whole tape rather than a sample. Fees, spread and slippage only show up when you replay every fill: the lab's stretch step ran the template's Level-1 random strategy over 250 000 snapshots and finished at $51,617 — a 48% loss, almost all of it fees. Column pruning is what makes that affordable; you read price, size and fee columns out of a multi-gigabyte recording and leave the rest on disk.",
          "Scaling out also means more sockets. Multi-venue has been live since week 1: set EXCHANGE_URLS to a comma-separated list and one bot connects to every venue. The broker's answer to that is one pricing brain and N execution gateways — the external reference is shared, while each venue's mark, resting orders and positions stay local. Live risk lives in that split, because a position is per venue but your exposure is not."
        ],
        "example": {
          "title": "In the arena",
          "text": "sim/session.py exposes run(n_ticks, strategies, symbols, fee_rate, broker_spread, seed, verbose) and returns a SessionResult whose traders carry a pnl_curve. It is pure and network-free, so one process per parameter is the whole scale-out.",
          "code": "# sweep.py at the repo root — one backtest per process\nfrom concurrent.futures import ProcessPoolExecutor\nimport numpy as np\nfrom sim.session import SimSession\nfrom plugins.strategies.examples import momentum_signal\n\ndef sharpe(curve):\n    r = np.diff(curve)\n    return r.mean() / (r.std() + 1e-9) * np.sqrt(252)\n\ndef backtest(spread):                      # one shard = one parameter value\n    res = SimSession().run(n_ticks=2000, seed=7, verbose=False,\n                           strategies=[(\"m\", momentum_signal)],\n                           symbols=[\"AAPL\", \"TSLA\"], broker_spread=spread)\n    return spread, sharpe(res.traders[0].pnl_curve)\n\nif __name__ == \"__main__\":                 # required for multiprocessing\n    with ProcessPoolExecutor() as pool:\n        for sp, sr in pool.map(backtest, [0.05, 0.1, 0.3, 0.6]):\n            print(f\"spread={sp:>5}  Sharpe={sr:6.2f}\")"
        }
      },
      "interview": [
        {
          "q": "A 17 MB CSV of ticks turns into 200 MB of RAM once it is a DataFrame. Why, and what do you do about it?",
          "a": "Text becomes typed objects with per-object overhead: every string cell is a Python str behind a pointer, and every number is float64 whether it needs 8 bytes or not, so the in-memory frame is routinely 2-10x the file. Measure it honestly with df.memory_usage(deep=True) — without deep=True you see only the pointer array. Then downcast: object to category for low-cardinality columns like symbol, float64 to float32 for prices, and parse timestamps into a DatetimeIndex. That is typically 3-4x for free, which is often the whole problem.",
          "level": "warm-up",
          "skill": "python.pandas-memory"
        },
        {
          "q": "You want to run 200 backtests on an 8-core laptop. Threads or processes?",
          "a": "Processes. The GIL lets only one thread execute Python bytecode at a time, so a thread pool gives you no speedup on CPU-bound work — threads only help when the work is blocking I/O such as a socket or an HTTP poll. Use concurrent.futures.ProcessPoolExecutor, which gives each worker its own interpreter and its own GIL, and put the submit under an if __name__ == '__main__' guard, because workers re-import the module and without the guard they re-spawn the pool.",
          "level": "warm-up",
          "skill": "python.gil"
        },
        {
          "q": "You are streaming a 60 GB recording in chunks and computing a 100-bar rolling mean per symbol. What breaks, and how do you fix it?",
          "a": "The window straddles chunk boundaries. If each chunk is processed independently, the first 99 rows of every chunk have an incomplete window, so you get silently wrong numbers rather than an error. Carry the state across chunks — a deque(maxlen=100) per symbol — and reduce into accumulators as you go, which keeps memory at O(chunk + state) for any file size. Also check that your statistic composes: (sum, count) combines across shards, a median does not, so a streamed median needs a different algorithm.",
          "level": "core",
          "skill": "python.chunking"
        },
        {
          "q": "Why store a feature store as Parquet rather than CSV, and when would you still pick CSV?",
          "a": "Parquet is columnar, typed and compressed: you read only the columns you project, near-identical float columns compress heavily, and dtypes round-trip so a float32 column comes back float32 instead of silently widening to float64. On a real tape that is roughly 6x smaller than CSV and around 28x faster when you read two columns out of seven. CSV stays useful for handing a file to a human or a tool that only speaks text, and for tiny data where the dependency is not worth it.",
          "level": "core",
          "skill": "tools.parquet"
        },
        {
          "q": "Which parts of a trading stack are embarrassingly parallel and which are not?",
          "a": "Parameter sweeps, per-symbol feature builds and independent backtest runs are embarrassingly parallel: no piece needs another, so you map one process per shard and reduce the results. A matching engine is not. The order book is stateful and price-time priority depends on arrival order, so sharding it changes the fills — the dependency forces coordination, which is why the exchange stays single-threaded per venue and scales out by running more venues instead.",
          "level": "core",
          "skill": "python.multiprocessing"
        },
        {
          "q": "How do you make a distributed parameter sweep idempotent and reproducible?",
          "a": "Key every output on its inputs: hash the parameter dict with json.dumps(params, sort_keys=True) and write to features_<hash>.parquet, so re-running a task overwrites the same file instead of appending a second copy, and a resumed sweep skips completed work. Then pin everything that could vary — the RNG seed (SimSession takes seed=), the input data version, the dtypes — and keep workers pure, inputs in and results out, with no shared mutable state. Same inputs, same numbers, on any worker, in any order.",
          "level": "core",
          "skill": "tools.determinism"
        },
        {
          "q": "You parallelise a map-reduce over ten shards on a ten-core box and measure 2.1x, not 10x. Explain, and say what you would measure next.",
          "a": "Process start-up and pickling dominate at small shard sizes, one shared disk serialises the reads, and the reduce step plus any unparallelised setup bound you by Amdahl's law. I would time the phases separately: per-shard compute against wall clock, bytes read per second against the disk's ceiling, and payload size per task. Then fix the biggest one — fewer, larger shards to amortise spawn cost, Parquet plus column pruning to cut the I/O, and returning compact partials rather than frames. The point is that you measure the speedup instead of assuming the core count.",
          "level": "senior",
          "skill": "python.multiprocessing"
        },
        {
          "q": "A bot connects to several venues at once. What changes in the design?",
          "a": "State splits by scope. There is one instrument, so the reference price is shared — one pricing brain — but resting orders, fills and positions are per venue, so each connection keeps its own execution state and its own reconnect loop. The broker does exactly this: one instance polls the feed and the others share its price state while quoting independently. Routing then compares the touch across venues net of each venue's own fee schedule, since a better headline price at a worse taker rate is not better, and risk has to be aggregated across venues even though limits are enforced per venue.",
          "level": "senior",
          "skill": "trading.multi-venue"
        }
      ]
    },
    {
      "n": 7,
      "focus": "Machine-learning signals & model ops",
      "tagline": "A model is just another signal function: learn it offline, split in time so it cannot see the future, and load it once so predicting fits inside the per-tick budget.",
      "concepts": [
        {
          "title": "The supervised setup — X at t, y about t+h",
          "text": "You learn a mapping from features to a label, and in trading the two live at different times. Every column of X must be knowable at t; y is about t+h. Classification predicts direction and is easy to size by confidence; regression predicts magnitude and is more informative but noisier. The horizon h has to match how long you actually hold — label a 5-tick move and then hold for an hour and you have validated a different strategy. The last h rows of any tape have no label yet, which is exactly the shape of the live problem: you always stand at the right-hand edge.",
          "code": "import numpy as np\nrng = np.random.default_rng(7)\nmid = 100 + np.cumsum(rng.normal(0, 0.05, 600))       # the tape\nh, t = 5, np.arange(20, 600 - 5)                      # horizon, usable rows\nret = np.r_[0.0, mid[1:] / mid[:-1] - 1]\nX = np.c_[ret[t], mid[t] / mid[t - 10] - 1]           # known AT t\ny = (mid[t + h] > mid[t]).astype(float)               # about t+h: the label only\nprint(\"X\", X.shape, \"y\", y.shape, \"up-rate\", round(float(y.mean()), 3))\nprint(\"last labelled t\", int(t[-1]), \"of\", len(mid) - 1, \"- the tail has no label yet\")\n# X (575, 2) y (575,) up-rate 0.386\n# last labelled t 594 of 599 - the tail has no label yet",
          "deck": "Deck Week 7 · slide 5"
        },
        {
          "title": "Features from prices and the book",
          "text": "The model is only as good as X, and the useful families are the rolling statistics you already built: momentum over a lookback, volatility as recent dispersion of returns, the spread in basis points, and order-book imbalance as signed bid-versus-ask pressure. Standardise them, because a model that cares about magnitude will be dominated by whichever column has the largest scale. Fewer, better features win — each one costs a degree of freedom. Print X.std(0) before every fit: in the week-7 lab, obi came out with standard deviation 0.0, because a single broker quoting a symmetric ladder never moves the imbalance. A zero-variance feature cannot help, and a feature you cannot compute inside on_tick is not a feature.",
          "code": "import numpy as np\npx = np.array([100.0, 100.2, 100.1, 100.4, 100.9, 101.0, 100.7, 101.3, 101.1, 101.6])\nrets = px[1:] / px[:-1] - 1\nbid, ask, bidq, askq = 101.55, 101.65, 400, 100\nX = np.array([rets[-1], px[-1] / px[0] - 1, rets.std(),\n              (ask - bid) / ((ask + bid) / 2) * 1e4, (bidq - askq) / (bidq + askq)])\nnames = [\"ret1\", \"mom9\", \"vol9\", \"spread_bps\", \"obi\"]\nprint(dict(zip(names, np.round(X, 4).tolist())))\nrows = np.array([X, X * 1.1, X * 0.9]); rows[:, 4] = 0.60   # one broker: obi never moves\nprint(\"dead features:\", [n for n, s in zip(names, rows.std(0)) if s < 1e-12])\n# {'ret1': 0.0049, 'mom9': 0.016, 'vol9': 0.0031, 'spread_bps': 9.8425, 'obi': 0.6}\n# dead features: ['obi']",
          "deck": "Deck Week 7 · slide 6"
        },
        {
          "title": "Split in time, with an embargo",
          "text": "Random shuffling leaks the future into training, so time-series data is split chronologically: an early train slice, a middle validation slice you tune on, and a latest test slice you look at once. Then embargo the wall — drop the last h training rows — because with horizon h the labels of adjacent rows overlap, so a shuffled split drops each test row's near-twin into training and a memoriser simply looks it up. The snippet runs a 1-nearest-neighbour model on a pure random walk, where the honest answer is 50%: the shuffled split invents almost eight accuracy points of edge on data that contains none. The lab measured the same effect at +0.095.",
          "code": "import numpy as np\nrng = np.random.default_rng(0)\nmid = 100 + np.cumsum(rng.normal(0, 0.05, 1500))   # a random walk: there is NO edge\nh, t = 20, np.arange(50, 1480)\nX = np.c_[mid[t] / mid[t - 20] - 1, mid[t] / mid[t - 50] - 1]\ny = (mid[t + h] > mid[t]).astype(int)              # labels of adjacent rows overlap\nnn1 = lambda A, a, B, b: float((a[((B[:, None] - A[None]) ** 2).sum(2).argmin(1)] == b).mean())\ncut, p = int(0.7 * len(X)), rng.permutation(len(X))\nshuf = nn1(X[p[:cut]], y[p[:cut]], X[p[cut:]], y[p[cut:]])\nhon = nn1(X[:cut - h], y[:cut - h], X[cut:], y[cut:])\nprint(f\"1-NN shuffled {shuf:.3f}  time+embargo {hon:.3f}  fake edge {shuf - hon:+.3f}\")\n# 1-NN shuffled 0.602 time+embargo 0.526 fake edge +0.077",
          "deck": "Deck Week 7 · slide 11"
        },
        {
          "title": "Walk-forward validation is the only score to trust",
          "text": "Train on the past, test on the next unseen block, roll forward, repeat, and average the out-of-sample metric over the test blocks. An expanding window keeps all history; a rolling window forgets the distant past and copes better with drift. Report the dispersion as well as the mean — one lucky fold is not a result. Keep the embargo on every fold. The fit itself needs no framework: scikit-learn and joblib are not in requirements.txt and the graded week-7 lab is numpy-only, so a least-squares fit through numpy.linalg.lstsq is a perfectly respectable linear baseline, and the model ladder says beat that baseline before you climb to regularised linear or tree ensembles.",
          "code": "import numpy as np\nrng = np.random.default_rng(3)\nsig = np.sin(2 * np.pi * np.arange(2100) / 300); t = np.arange(10, 2090)\nX = np.c_[sig[t] - sig[t - 5] + rng.normal(0, .3, len(t)), np.ones(len(t))]\ny = np.sign(sig[t + 5] - sig[t])                             # label about t+5\naccs = []\nfor i in range(1, 5):                                        # 4 expanding folds\n    a, b = i * 400, (i + 1) * 400\n    w, *_ = np.linalg.lstsq(X[:a - 5], y[:a - 5], rcond=None)  # embargo the last 5 rows\n    accs.append(round(float((np.sign(X[a:b] @ w) == y[a:b]).mean()), 3))\nprint(\"folds\", accs, \"| mean\", round(sum(accs) / 4, 3))\n# folds [0.527, 0.54, 0.593, 0.557] | mean 0.554",
          "deck": "Deck Week 7 · slide 12"
        },
        {
          "title": "Metrics that matter — accuracy is a trap",
          "text": "A signal is good only if it makes risk-adjusted money out-of-sample after costs. Accuracy is necessary and not sufficient: 51% on balanced up-and-down labels can be very profitable, and 99% on rare events can lose money. What decides it is hit rate together with payoff, the average win over the average loss. Then subtract the trading: fees, spread and slippage, which is where most backtested machine-learning alpha dies. The snippet gives a genuine 4 bp average edge that a 15 bp taker fee each way destroys. Turnover and capacity are part of the score — a signal that flips every tick pays the spread endlessly, and slower, surer signals often win the season.",
          "code": "import numpy as np\nrng = np.random.default_rng(11)\nedge = rng.normal(0.0004, 0.004, 4000)      # 4000 round trips, a real 4 bp edge\nhit = float((edge > 0).mean())\npayoff = float(edge[edge > 0].mean() / -edge[edge < 0].mean())\ncost = 2 * 0.0015                           # taker in, taker out\nprint(f\"hit {hit:.3f}  payoff {payoff:.2f}  gross {edge.mean() * 1e4:+.1f}bp\"\n      f\"  net {(edge.mean() - cost) * 1e4:+.1f}bp\")\nprint(\"survives costs:\", bool(edge.mean() > cost))\n# hit 0.550 payoff 1.09 gross +4.5bp net -25.5bp\n# survives costs: False",
          "deck": "Deck Week 7 · slide 14"
        },
        {
          "title": "Model ops — persist, serve, monitor, retrain",
          "text": "A model is a live artifact with a lifecycle, and training is the small part. Serialise the fitted weights together with the feature list, the horizon, the scaler statistics and a version, so the bot can check that what it computes per tick is what the model was fitted on. Load it once in __init__, never in the hot path, and measure predict() against the per-tick budget — a model you cannot run live scores nothing. A missing or stale artifact must be a quiet no-trade, not a crash mid-session. Then monitor: live hit rate against the training number, feature distributions, P&L against the backtest. Decide the retraining cadence up front and keep every version so you can roll one back.",
          "code": "import json, os, tempfile, numpy as np\nart = {\"version\": 1, \"kind\": \"logistic\", \"horizon\": 5, \"b\": 0.02,\n       \"features\": [\"ret1\", \"mom10\", \"vol20\"], \"w\": [-0.84, 0.61, -0.18],\n       \"mu\": [0.0, 0.0, 0.004], \"sd\": [0.002, 0.01, 0.001]}\nwith tempfile.TemporaryDirectory() as d:\n    p = os.path.join(d, \"signal_v1.json\"); json.dump(art, open(p, \"w\"))\n    a = json.load(open(p))                       # load ONCE, in __init__\nw, mu, sd = (np.array(a[k]) for k in (\"w\", \"mu\", \"sd\"))\nz = ((np.array([0.001, 0.012, 0.005]) - mu) / sd) @ w + a[\"b\"]\nprint(\"v%d %s h=%d\" % (a[\"version\"], a[\"features\"], a[\"horizon\"]),\n      \"p_up %.4f\" % (1 / (1 + np.exp(-z))), \"| contract ok:\", len(a[\"features\"]) == len(w))\n# v1 ['ret1', 'mom10', 'vol20'] h=5 p_up 0.5379 | contract ok: True",
          "deck": "Deck Week 7 · slide 15 · Deck Week 7 · slide 18"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "Machine learning replaces the signal, not the system. The model emits one number; your sizing, stop-loss, position limit and routing are unchanged, and the seam is the same one you have used all quarter — a signal_fn with the registry signature, or on_tick in the SDK. That is the whole integration: compute features from market and portfolio, call the model, and turn a probability into a Signal above a threshold or into None below it. Everything expensive stays offline, because the pipeline that produced last week's cached features is what trains it.",
          "Honesty is the entire deliverable here. Financial returns are mostly noise, so a 52% out-of-sample model can be excellent while a 90% in-sample one is worthless. Split in time, embargo the horizon, walk forward, report mean and dispersion, and look at the final test block once. Run the two controls the lab gives you: a shuffled-label run, which should collapse to a coin flip, and a random-walk symbol, where the honest answer is no edge. If the score survives both, you have something; if you tuned on the test block, you have a number with no meaning.",
          "Costs decide whether the edge is real. A model that is right 55% of the time and flips its view every tick pays the taker fee and half the spread on both legs, which on the arena's schedule is 15 bp each way against an edge measured in single basis points. So make the label fee-aware — only call the move up if it clears the round-trip cost — and score turnover alongside Sharpe. Many machine-learning signals are pure alpha in a backtest and pure transaction cost in a live session.",
          "Live risk is mostly serving discipline. Load the artifact once in __init__ and do arithmetic per tick; if the file is missing or its feature list does not match what you compute, trade nothing and log it rather than crashing mid-session. Measure predict() against the per-tick budget and against the order quota — eight messages per tick in week 7 — because a model that blocks the loop misses the market it just predicted. Then monitor drift: score your own predictions h ticks later and log a rolling live hit rate. Two standard errors below the training number for a whole session means the artifact is stale.",
          "Features have to be identical offline and live or you have leaked. The lab drops obi for exactly that reason: it has zero variance in the simulated tape and MarketData cannot hand it to you live anyway. Write the feature function once, call it from both the training script and on_tick, and validate the recorded feature list on load. The bot you walk-forward validate in sim/session.py is the bot that competes in the season, unchanged."
        ],
        "example": {
          "title": "In the arena",
          "text": "arena/trader.py defines the Trader base whose on_tick(market, portfolio) returns a Signal or None; market exposes prices(), mid_price(), best_bid/ask() and spread(), and portfolio exposes can_buy()/can_sell(). An ML bot loads its artifact in __init__ and only does arithmetic inside the hook.",
          "code": "# team/trader.py — numpy-only model, artifact frozen offline\nimport json, math\nimport numpy as np\nfrom arena import Trader, Signal\n\nclass MLTrader(Trader):\n    def __init__(self, path=\"models/signal_v1.json\"):\n        try:\n            self.art = json.load(open(path))       # load ONCE, never in on_tick\n        except (OSError, ValueError):\n            self.art = None                        # fail safe, not silent\n        if self.art:\n            self.w, self.mu, self.sd = (np.array(self.art[k]) for k in (\"w\", \"mu\", \"sd\"))\n\n    def on_tick(self, market, portfolio):\n        if self.art is None:\n            return None                            # no artifact -> trade nothing\n        for sym in market.symbols():\n            px, spread, mid = market.prices(sym), market.spread(sym), market.mid_price(sym)\n            if len(px) < 21 or spread is None or not mid:\n                continue\n            p_ = np.array(px[-21:], float); rets = p_[1:] / p_[:-1] - 1\n            x = np.array([rets[-1], p_[-1] / p_[-6] - 1, p_[-1] / p_[-11] - 1,\n                          rets.std(), spread / mid * 1e4])\n            z = float(((x - self.mu) / self.sd) @ self.w + self.art[\"b\"])\n            p = 1 / (1 + math.exp(-max(-60, min(60, z))))\n            ask = market.best_ask(sym)\n            if p > 0.55 and ask and portfolio.can_buy(sym, 2, ask):\n                return Signal(symbol=sym, side=\"buy\", quantity=2, price=ask, confidence=p)\n        return None"
        }
      },
      "interview": [
        {
          "q": "You want a model that predicts direction over the next five ticks. What are X and y, and what is the one rule you cannot break?",
          "a": "X is one row per point in time holding only quantities knowable at t — recent returns, momentum over a lookback, rolling volatility, the spread, book imbalance. y is about t+h: for direction, 1 if mid[t+h] > mid[t] else 0. The rule is that nothing in X may touch data after t, and that includes the scaler — fit mu and sd on the training slice only. The horizon also has to match the holding period, because a 5-tick label validates a 5-tick trade and nothing else.",
          "level": "warm-up",
          "skill": "quant.supervised-setup"
        },
        {
          "q": "Why can a 52% accurate model be excellent while a 99% accurate one is useless?",
          "a": "Because accuracy ignores both the payoff and the base rate. Financial returns are mostly noise, so on balanced up-and-down labels a couple of points above a coin flip, repeated with disciplined sizing, is a real edge. A 99% model on a rare event is usually predicting the majority class and earns nothing when it is right and loses heavily on the 1%. What matters is hit rate together with the average win over the average loss, out-of-sample, after fees and spread.",
          "level": "warm-up",
          "skill": "quant.signal-scoring"
        },
        {
          "q": "Your model scores 0.57 on a random 70/30 split and 0.48 walk-forward. What happened?",
          "a": "The random split leaked. With a horizon of h the labels of neighbouring rows overlap, and their features are nearly identical, so shuffling puts each test row's near-twin in the training set and the model recognises it instead of generalising. Split chronologically and drop the last h training rows as an embargo so no training label reaches across the wall. The 0.48 is the honest number; on a random-walk symbol that is exactly what you should see, and the gap is the measure of the leak.",
          "level": "core",
          "skill": "quant.look-ahead"
        },
        {
          "q": "Expanding window or rolling window for walk-forward folds?",
          "a": "Expanding keeps all history, so each fold trains on more data and the estimates are more stable — good when the relationship is roughly stationary. Rolling forgets the distant past, which is what you want under drift, because a regime from two years ago dilutes the current one. In practice I run both and compare: if rolling wins, the process is non-stationary and that is a finding about the market, not a hyperparameter. Either way every test block stays out-of-sample, the embargo applies per fold, and I report the mean with the fold-to-fold dispersion.",
          "level": "core",
          "skill": "quant.walk-forward"
        },
        {
          "q": "Name three concrete ways a feature can leak the future, and the check that rules each one out.",
          "a": "First, a centred or unshifted rolling statistic: a rolling mean that includes t+1, or a signal used on the same bar it was computed from — the check is a mandatory shift() and a re-run to confirm the P&L drops. Second, scaling or imputing on the full sample: fit mu and sd on the train slice and apply them to test. Third, a label-derived column, such as a forward return sneaking into X — the check is a shuffled-label control, which must collapse to chance; if the model still scores, a feature encodes the answer.",
          "level": "core",
          "skill": "quant.overfitting"
        },
        {
          "q": "You tried 200 feature-and-hyperparameter configurations and the best one has a Sharpe of 2.1. What do you report?",
          "a": "Not 2.1. Picking the maximum of 200 noisy estimates inflates it by construction, so I report the deflated Sharpe — adjusted down for the number of trials — along with the trial count itself and the dispersion across walk-forward folds. If the test block was used to choose among the 200, it is no longer a test and the honest answer is that there is no out-of-sample number yet. The fixes are budgeting trials up front, logging every run, and keeping one untouched block to look at exactly once.",
          "level": "core",
          "skill": "quant.overfitting"
        },
        {
          "q": "How do you serve a trained model inside a per-tick loop without hurting yourself?",
          "a": "Freeze it offline and ship an artifact that carries its weights, the feature list, the horizon, the scaler statistics and a version. Load it once in the constructor, never per tick, and on load validate that the feature list matches what the bot computes; on a missing or mismatched artifact, return None and log rather than crash. Then measure: time predict() over thousands of calls and compare the tail against the per-tick budget and the message quota. Use the same feature function offline and live, because two implementations is a leak waiting to happen.",
          "level": "senior",
          "skill": "quant.model-ops"
        },
        {
          "q": "The model is live. How do you know when it has stopped working, and what do you do?",
          "a": "Instrument the prediction, not just the P&L. Store (tick, symbol, prediction) when you fire, score it against the realised move h ticks later, and log a rolling live hit rate; track feature distributions and live P&L against the backtest curve as well. If the live hit rate sits about two standard errors below the training number for a whole session, the data-generating process moved. The response is decided in advance: retrain on a rolling window at a fixed cadence or on a drift trigger, version every artifact, and keep the previous one loadable so a rollback is one config change.",
          "level": "senior",
          "skill": "quant.model-ops"
        }
      ]
    },
    {
      "n": 8,
      "focus": "CI/CD, testing & reproducibility",
      "tagline": "A green run on your laptop proves nothing — the bar is 1,286 tests in twenty seconds, seeded, network-free, and running the same way on a clean runner.",
      "concepts": [
        {
          "title": "Push the logic down the pyramid, and read the coverage report",
          "text": "Many fast unit tests at the base, a few integration tests above them, a handful of end-to-end runs at the top. A unit test drives one function with no I/O in milliseconds; an integration test wires a couple of pieces together with no network; an end-to-end run drives a whole session and tells you that something broke rather than what. The numbers make the argument: the platform's suite is 1,286 tests in about 20 seconds, and test_orderbook.py plus test_arena_sdk.py alone is 82 tests in 0.13 seconds. Coverage then tells you where the holes are, not how good the tests are — it proves execution, not correctness, so the Missing column is the useful part. Where to aim high is a design decision: shared/orderbook.py is held at 100% because a wrong fill corrupts every downstream P&L.",
          "deck": "Deck Week 8 · slides 5, 10"
        },
        {
          "title": "A test is a function, an assert, and a name",
          "text": "pytest collects files named test_*.py and functions named test_*, then runs them and rewrites plain asserts into rich failure diffs. Name the test after the behaviour it pins, not the function it calls: test_momentum_goes_long_on_uptrend tells you what broke from the failure line alone. One behaviour per test. The discovery loop below is the whole mechanism in two lines — find the callables whose names start with test_, call them, and let an AssertionError be the failure.",
          "code": "def momentum(prices, lookback=10, band=0.002):        # pure: no I/O, no clock\n    if len(prices) < lookback + 1: return 0\n    chg = prices[-1] / prices[-lookback - 1] - 1.0\n    return 1 if chg > band else (-1 if chg < -band else 0)\n\ndef test_long_on_uptrend(): assert momentum([100 + i * .5 for i in range(30)]) == 1\ndef test_flat_on_no_trend(): assert momentum([100.0] * 30) == 0\n\nfor name, fn in sorted(globals().items()):\n    if name.startswith(\"test_\"): fn(); print(name, \"passed\")\n# test_flat_on_no_trend passed\n# test_long_on_uptrend passed",
          "deck": "Deck Week 8 · slide 6"
        },
        {
          "title": "Fixtures and parametrize make the input space visible",
          "text": "A fixture is reusable setup injected by argument name and torn down per test — use one instead of a module-level Portfolio(10_000), or test four fails because test two spent the cash and the failure moves when you reorder. @pytest.mark.parametrize runs one test over a table of inputs and reports each case as its own pass or fail, so a red run names the input that broke. Parametrize is not about saving typing; you read the coverage of a behaviour straight off the decorator. The cases that matter are the boring ones — [100.0, 101.0] for not enough history, [] for a cold start or an empty book.",
          "code": "def momentum(prices, lookback=10, band=0.002):\n    if len(prices) < lookback + 1: return 0          # cold start: no view\n    chg = prices[-1] / prices[-lookback - 1] - 1.0\n    return 1 if chg > band else (-1 if chg < -band else 0)\n\ncases = [([100 + i * .5 for i in range(30)], 1), ([100.0] * 30, 0),\n         ([100 - i * .5 for i in range(30)], -1), ([100.0, 101.0], 0), ([], 0)]\nbad = [(p[:2], want, momentum(p)) for p, want in cases if momentum(p) != want]\nprint(f\"{len(cases) - len(bad)}/{len(cases)} cases pass\", bad)\n# 5/5 cases pass []",
          "deck": "Deck Week 8 · slide 7"
        },
        {
          "title": "Mock the boundary, test the logic",
          "text": "Never touch the real network in a unit test. A mock records calls and returns whatever you configured, a fake is a small working implementation, and monkeypatch swaps an attribute at runtime and puts it back afterwards. Prefer the hand-written fake at a boundary you own: nine lines, no library, and it fails loudly when the real interface changes, whereas a mock that return_values everything passes forever — including after you break the code. Coroutines need an explicit @pytest.mark.asyncio in this repo, because there is no pytest.ini and therefore no asyncio_mode; without the marker pytest calls the function, gets a coroutine it never awaits, and reports a pass.",
          "code": "import asyncio\nclass FakeMarket:                              # a hand-written fake, not a mock\n    def best_bid(self, s): return None         # the market maker just died\n    def best_ask(self, s): return None\ndef edge(market, sym):\n    bid, ask = market.best_bid(sym), market.best_ask(sym)\n    return None if not (bid and ask) else ask - bid\nasync def test_no_order_on_a_dead_book():\n    await asyncio.sleep(0)                     # a real await\n    assert edge(FakeMarket(), \"AAPL\") is None; print(\"dead book -> no order\")\nasyncio.run(test_no_order_on_a_dead_book())\n# dead book -> no order",
          "deck": "Deck Week 8 · slide 8"
        },
        {
          "title": "Determinism is what makes CI possible",
          "text": "A flaky test is worse than no test: one failure in twenty runs trains the team to ignore red, which defeats the point of having a gate. Three sources, three fixes — seed the randomness, keep the network out, and pass the clock and the ids in rather than calling datetime.now() or uuid4() deep in a decision path. SimSession.run(seed=3) does the first of those for a whole season, which is why two runs must produce identical leaderboards. And this is not hygiene for its own sake: a CI runner has no internet by design, so a deterministic, network-free session is the only end-to-end test the pipeline can execute.",
          "code": "import random\n\ndef session(seed=None):\n    if seed is not None: random.seed(seed)\n    return [round(100 + random.gauss(0, 1), 4) for _ in range(5)]\n\nprint(\"seeded runs agree :\", session(3) == session(3))\nrandom.seed(0); a, b = session(), session()\nprint(\"unseeded runs agree:\", a == b)\n# seeded runs agree : True\n# unseeded runs agree: False",
          "deck": "Deck Week 8 · slide 9"
        },
        {
          "title": "Pin, isolate, containerise — and the pipeline is the gate",
          "text": "CI runs the suite on every push and pull request on a clean machine, and merge is blocked until the checks pass: the tests you wrote become the contract for what enters main. A workflow is YAML under .github/workflows/ — on: triggers it, jobs: run in parallel, steps: run in order, matrix: fans one job across versions, uses: reuses an action and run: runs a shell command. Then make the runner's answer match yours: pin with == rather than >=, isolate in a venv, and freeze OS plus deps plus code in an image with layers ordered stable to volatile, so COPY requirements.txt and pip install sit above COPY . . and a code change does not reinstall the world. Config (ports, poll interval) is plain env vars; secrets are injected at runtime and never enter git or the image.",
          "code": "import itertools\nmatrix = {\"python\": [\"3.11\", \"3.12\"], \"os\": [\"ubuntu-latest\"]}\njobs = [dict(zip(matrix, combo)) for combo in itertools.product(*matrix.values())]\nfor j in jobs: print(\"runner:\", j)\nprint(len(jobs), \"runners from one job definition\")\n# runner: {'python': '3.11', 'os': 'ubuntu-latest'}\n# runner: {'python': '3.12', 'os': 'ubuntu-latest'}\n# 2 runners from one job definition",
          "deck": "Deck Week 8 · slides 12–15"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "Testing a strategy starts by cutting it in two. The decision becomes a pure function of prices — momentum(prices, lookback, band), no I/O, no clock, no globals — and on_tick shrinks to an adapter that reads the book, calls it, and returns a Signal. The pure half runs in microseconds, so a hundred cases cost nothing; the adapter half only needs the seams: empty book, one-sided book, insufficient cash, a None return. The lab builds exactly that split, then as_signal_fn hands the same object to the simulator, so the code you tested is the code that trades.",
          "An offline result is believable only when it reproduces. Seed the session and two runs must produce identical leaderboards; if they do not, you have unseeded randomness, a datetime.now(), a uuid4(), or iteration over an unstably-hashed set somewhere in the decision path. That is not cosmetic. A number you cannot reproduce cannot be debugged, defended in a demo, or compared against the next version of the signal — so every backtest claim you make rests on determinism first and on the strategy second.",
          "The tests that protect capital are the ugly ones. Drive on_tick with a fake market whose best_ask returns None and whose price history is all NaN, and assert it returns None instead of raising — a raising on_tick in a live session is a bot that has silently stopped trading while the dashboard watches. Then pin the kill switch: push realised P&L past the daily-loss threshold and assert on_tick returns None from then on. Pinned dependencies belong in the same category, because a floating version that shipped an API change is a bot that fails to import at 6 p.m.",
          "Fee arithmetic is where money leaks quietly, which is why the matching engine is held at 100% coverage: one wrong fill corrupts every P&L downstream. The sign convention is the thing to assert. Under the default maker/taker schedule the aggressor pays TAKER_FEE_RATE, 0.0015 of notional, and the resting side earns MAKER_REBATE_RATE, 0.0010 — so a bot that flips every tick is a fee machine with a strategy attached. A test that a taker fill debits cash and a maker fill credits it kills a whole class of accounting bug.",
          "Shipping ends at observability, not at a green badge. Give yourself one surface — a rich table or an equity plot written on exit showing position, cash, P&L and whether the kill switch is armed — because you cannot fix what you cannot see. The venue-level version is the dashboard's STATS tab, where MAKER % and NET FEES are the two most diagnostic numbers on the platform. Neither helps unless you wrote down the healthy baseline while the market was calm: fills per ten seconds, net worth, maker share."
        ],
        "example": {
          "title": "In the arena",
          "text": "tests/test_orderbook.py — the suite your own file imitates: a fixture builds a fresh book per test, two helpers remove the copy-paste, and each test pins one behaviour of the matching engine by name.",
          "code": "# tests/test_orderbook.py\n@pytest.fixture\ndef ob():\n    return OrderBook(\"AAPL\", fee_rate=0.001)\n\ndef place_buy(ob, team, price, qty, order_type=\"limit\"):\n    return ob.place_order(team, \"buy\", price, qty, order_type)\n\nclass TestResting:\n    def test_limit_buy_rests_in_empty_book(self, ob):\n        order, trades = place_buy(ob, \"t1\", 100.0, 10)\n        assert trades == []\n        assert order.remaining == 10\n        assert ob.best_bid() == 100.0\n        assert ob.best_ask() is None"
        }
      },
      "interview": [
        {
          "q": "How does pytest find your tests, and why does it let you use a plain assert?",
          "a": "It collects files matching test_*.py, functions named test_*, and classes named Test*, then runs each one as a separate report line. Plain assert works because pytest rewrites assert statements during import to capture the operands, so a failure shows both sides of the comparison instead of just 'AssertionError' — no assertEqual boilerplate. Day to day you run `pytest -q` for a quiet summary and `pytest -k momentum` to filter by name while iterating.",
          "level": "warm-up",
          "skill": "tools.pytest"
        },
        {
          "q": "Distinguish a mock, a fake and monkeypatch, and say which you would reach for at a market-data boundary.",
          "a": "A mock is a stand-in that records calls and returns whatever you configured; a fake is a small working implementation of the same interface; monkeypatch swaps an attribute or env var for the duration of one test and restores it afterwards. At a boundary you own I write the fake: a nine-line FakeMarket with best_bid/best_ask/prices fails loudly the day the real interface changes, whereas a mock configured to return_value everything keeps passing after you break the code. monkeypatch is for the third-party edge you cannot inject cleanly.",
          "level": "warm-up",
          "skill": "tools.mocking-async"
        },
        {
          "q": "A suite passes twice and fails on the third run. Where do you look, and what is the fix?",
          "a": "Unseeded randomness, a wall-clock call or uuid4() buried in the logic, iteration order over sets or dicts keyed by unstably-hashed objects, shared mutable state leaking between tests, or a real network call. The fixes are mechanical: seed the RNG, inject the clock and the id generator as parameters, use a fixture so each test gets fresh state, and replace the network with a fake or a recorded fixture. Until it is deterministic you are not entitled to call it a flake — with the seed fixed, a red test fails the same way every time and can actually be debugged.",
          "level": "core",
          "skill": "tools.determinism"
        },
        {
          "q": "Your async test reports a pass but the assertion inside it never executed. Explain.",
          "a": "Calling a coroutine function returns a coroutine object and runs nothing. If there is no asyncio plugin mode configured and no @pytest.mark.asyncio, pytest calls the function, gets that object, never awaits it, and records a pass with at most a RuntimeWarning about a coroutine that was never awaited. The fix is the explicit marker on every coroutine test (or asyncio_mode = auto in the config), and the defensive habit is to make a new async test fail on purpose once to prove it is really running.",
          "level": "core",
          "skill": "tools.mocking-async"
        },
        {
          "q": "You have 100% line coverage and still shipped a bug. What does coverage not tell you?",
          "a": "Coverage records that a line executed, not that anything was asserted about its result, and line coverage says nothing about which branch combinations ran. So a suite of smoke calls with no assertions can score 100%. The useful part of the report is the Missing column — code no test has ever entered. To distinguish real tests from decorative ones, delete a line of production logic and see whether anything goes red; that is mutation testing in one sentence.",
          "level": "core",
          "skill": "tools.test-pyramid"
        },
        {
          "q": "Why pin dependencies with == rather than >=, and why does the order of Dockerfile layers matter?",
          "a": "Pinning does not prevent upstream breakage, it controls when you find out: with websockets>=12.0 your CI goes red on a commit that touched only a README, because a new release changed an API. With ==12.0 the upgrade is a deliberate commit you can test. Layers matter because each COPY or RUN is cached by content: put COPY requirements.txt and pip install above COPY . . and a code change reuses the installed-deps layer, while the reverse order reinstalls everything on every build. Order stable to volatile.",
          "level": "core",
          "skill": "tools.docker"
        },
        {
          "q": "Your pipeline takes 25 minutes. What do you change, and what stays in the merge gate?",
          "a": "At 25 minutes people stop waiting for it, then stop trusting it, then merge around it, so I would split the workflow by cost. The gate on every push is the fast deterministic layer — unit tests plus one seeded, network-free end-to-end run — cached deps, matrix jobs in parallel, fail-fast on. The slow work (long simulations, multi-seed sweeps, container builds) moves to a nightly or merge-queue job that reports rather than blocks. The target is a gate you are willing to wait for: this platform runs 1,286 tests in roughly 20 seconds, and that is deliberate.",
          "level": "senior",
          "skill": "tools.github-actions"
        },
        {
          "q": "How would you test a trading bot's risk layer and its reconnection without any venue to connect to?",
          "a": "In-process, with fakes and a seeded simulator. For risk: construct the portfolio state directly, feed synthetic fills through on_fill until realised P&L breaches the daily-loss limit, and assert the next on_tick returns None and that a flatten order is emitted once, not every tick. For reconnection: run the client against a fake server you can drop, then await a reconnected event with a timeout and assert the bot re-synced state rather than trading on its stale view. Both are deterministic and run in CI, which is the only reason they get run at all.",
          "level": "senior",
          "skill": "tools.headless-sim"
        }
      ]
    },
    {
      "n": 9,
      "focus": "Integration & the live system",
      "tagline": "Every part passed its own tests; integration asks whether they honour each other's contracts while the leaderboard scores risk rather than return.",
      "concepts": [
        {
          "title": "Integration correctness is a different claim",
          "text": "Unit correctness says each object honours its own contract in isolation, and 1,286 tests establish that here. Integration correctness says the objects honour each other's contracts, wired together, live, under load. The properties that decide it — timing, ordering, back-pressure, shared state — are emergent and invisible to any single unit test. The classic seam bugs are ordering bugs: the signal fires faster than risk can veto it, a fill arrives before its ack, two messages race on the book, one side sends price as a float while the other rounds to ticks and both are individually correct. Test the conversation, not just the speakers.",
          "deck": "Deck Week 9 · slide 5"
        },
        {
          "title": "The wire contract is the integration contract",
          "text": "Three independent processes — broker, exchange, trader — speak only Pydantic models from shared/messages.py, with a type discriminator that parse_message dispatches on. Every arrow between them is a seam, so the natural unit test for a seam is a round trip: dump to JSON, parse back, assert the object is identical. If it round-trips, the two sides agree about the payload; what remains to test is the timing and the ordering. This is also a responsibility diagram rather than a data-flow diagram — the exchange owns the truth, the broker owns liquidity, your bot owns its decisions — and confusion about who owns what is the root cause of most live incidents.",
          "code": "import json\nfrom typing import Literal\nfrom pydantic import BaseModel\n\nclass PortfolioUpdate(BaseModel):                  # the seam's contract\n    type: Literal[\"portfolio_update\"] = \"portfolio_update\"\n    team_id: str; positions: dict[str, int]; realized_pnl: float; net_worth: float\nsent = PortfolioUpdate(team_id=\"t1\", positions={\"AAPL\": 3},\n                       realized_pnl=-0.95, net_worth=163296.40)\nback = PortfolioUpdate.model_validate(json.loads(sent.model_dump_json()))\nprint(\"round-trip identical:\", back == sent, back.positions)\n# round-trip identical: True {'AAPL': 3}",
          "deck": "Deck Week 9 · slide 6"
        },
        {
          "title": "Live systems fail partially, not all at once",
          "text": "The socket stays up while the price behind it dies. The broker's Yahoo poll stalls, the mark stops moving, and you keep quoting confidently around a number nobody stands behind. Kill the market maker and the touch goes one of two ways depending on the venue: with CANCEL_ON_DISCONNECT the venue pulls the dead seat's orders and best_bid, best_ask and spread start returning None within a tick, so any arithmetic on the touch raises; without it the dead quotes persist and your arithmetic succeeds against a corpse. Handle both — guard the touch before it reaches a Signal, and keep a last-change tick per symbol so a price that stopped moving stops your quoting.",
          "code": "class Feed:\n    def __init__(self): self.px, self.moved_at = 100.0, 0\n    def see(self, px, tick):\n        if px != self.px: self.px, self.moved_at = px, tick\n        return tick - self.moved_at            # ticks since the price last moved\n\nf, ticks = Feed(), [100.0, 100.2, 100.2, 100.2, 100.2, 100.2]\nages = [f.see(px, t) for t, px in enumerate(ticks, start=1)]\nprint(\"ages\", ages, \"| stale from tick\", 1 + next(i for i, a in enumerate(ages) if a > 2))\n# ages [1, 0, 1, 2, 3, 4] | stale from tick 5",
          "deck": "Deck Week 9 · slide 8"
        },
        {
          "title": "Reconnect, then re-sync: the venue owns the truth",
          "text": "On ConnectionClosed you back off and reconnect — trader/trader.py retries every three seconds and clears its stale book — but reconnecting is not recovering. Positions self-heal, because the client assigns self.positions = dict(update.positions) on every PortfolioUpdate. Anything you accumulate yourself does not: in the lab the bot rejoins at Tick 0 believing it holds $100,000, net worth snaps back to $163,315 one tick later, and realized_pnl stays at +0.00 for the rest of the session. So keep a shadow ledger from on_fill, compare it against the exchange's positions every tick, log the mismatch loudly, and reset from portfolio.positions on rejoin. A retried order also needs an id, or retry logic is a double-fill machine.",
          "code": "shadow = {}                                    # accumulated from on_fill only\ndef on_fill(side, sym, qty):\n    shadow[sym] = shadow.get(sym, 0) + (qty if side == \"buy\" else -qty)\non_fill(\"buy\", \"AAPL\", 5); on_fill(\"sell\", \"AAPL\", 2); venue = {\"AAPL\": 3}\nprint(\"before the drop, agree:\", shadow == venue)\nshadow.clear()                                 # the reconnect wiped local state\nprint(\"RECON MISMATCH AAPL: shadow=%d venue=%d\" % (shadow.get(\"AAPL\", 0), venue[\"AAPL\"]))\nshadow.update(venue)                           # re-sync from the source of truth\nprint(\"after re-sync, agree:\", shadow == venue)\n# before the drop, agree: True\n# RECON MISMATCH AAPL: shadow=0 venue=3\n# after re-sync, agree: True",
          "deck": "Deck Week 9 · slides 8–9"
        },
        {
          "title": "The tearsheet: read the curve, then the numbers",
          "text": "One page answers two questions: did this make money, and how much risk did it take to do it. The equity curve comes first because the shape tells the story before any number does — a smooth 20% beats a jagged 40%, which is one bad tick from a blow-up. Then the numbers: Sharpe as mean excess return over the volatility of returns, max drawdown as the largest peak-to-trough fall and therefore the worst pain an investor sat through, Calmar as return over that drawdown, turnover as how much you traded to get there, and exposure as how much capital was at risk and on which side. Turnover is a cost, not a measure of effort.",
          "code": "from statistics import mean, pstdev\neq = [100_000, 101_200, 100_800, 102_500, 102_100, 103_900, 105_200]\nr = [b / a - 1 for a, b in zip(eq, eq[1:])]\npeak = mdd = 0.0\nfor v in eq: peak = max(peak, v); mdd = max(mdd, (peak - v) / peak)\nret = eq[-1] / eq[0] - 1\nprint(f\"return {ret:+.2%} vol {pstdev(r):.4f} sharpe {mean(r) / pstdev(r):.2f}\")\nprint(f\"maxDD {mdd:.2%} calmar {ret / mdd:.1f}\")\n# return +5.20% vol 0.0090 sharpe 0.94\n# maxDD 0.40% calmar 13.2",
          "deck": "Deck Week 9 · slide 12"
        },
        {
          "title": "Risk-adjusted scoring: the steady book wins",
          "text": "Raw return is the most misleading number in finance — the same +30% can be an edge or a coin flip that landed right, and maximum leverage on one bet wins the year it works and ends the season it does not at zero. So exchange/scoring.py ranks on a risk-adjusted score, per role, announced in week one: mean excess return over max(vol, VOL_FLOOR), multiplied by max(0, 1 - 2·max_drawdown) and clamped. Two details do real work. Returns are measured net of the risk-free cash drift, so parking cash scores about zero instead of dominating; and the denominator is floored, so a near-flat curve cannot produce an astronomical ratio. The snippet reproduces the lab's two curves exactly.",
          "code": "from statistics import mean, pstdev\ndef score(eq, rf=1.000002 ** 60 - 1, floor=1.2e-4, pen=2.0):\n    r = [b / a - 1 for a, b in zip(eq, eq[1:])]\n    mdd = max((max(eq[:i + 1]) - v) / max(eq[:i + 1]) for i, v in enumerate(eq))\n    ratio = min(10.0, (mean(r) - rf) / max(pstdev(r), floor))   # Sharpe-like\n    return ratio * max(0.0, 1 - pen * mdd), mdd                 # drawdown always hurts\nsteady = [100_000 * 1.01 ** k for k in range(13)]\njagged = [100_000, 118_000, 96_000, 121_000, 99_000, 125_000, 101_000,\n          128_000, 104_000, 130_000, 108_000, 126_000, steady[-1]]\nfor n, e in ((\"steady\", steady), (\"jagged\", jagged)): s, d = score(e); print(f\"{n} score {s:+.3f} maxDD {d:.2%} ret {e[-1] / e[0] - 1:+.2%}\")\n# steady score +10.000 maxDD 0.00% ret +12.68%\n# jagged score +0.091 maxDD 19.20% ret +12.68%",
          "deck": "Deck Week 9 · slides 13, 17"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "The signal-to-order pipeline is a chain of seams, and the seams are where the session is lost. on_tick reads a book snapshot, computes a number, risk vetoes or passes it, an order goes on the wire, an ack comes back, a fill follows, the portfolio marks, the leaderboard updates. Each hop is a contract between two processes that were tested separately. Where it breaks is ordering: a fill that lands before its ack, a signal that fires again before risk has seen the first order, a float price that the venue rounds to a tick. A round-trip test proves the payload; only a wired-up run proves the sequence.",
          "Offline honesty decides where you are allowed to test. End-to-end runs over live data are flaky by construction — the feed moves, the counterparties change, the failure does not reproduce — so the seeded, network-free simulator is the first venue for every claim, and the live session is confirmation rather than discovery. That is also what a smoke test is for: one fast pass over the critical path, does it start, connect, place one order and score. A green end-to-end run is proof the system was healthy once, on that data; observability is what tells you about now.",
          "What protects capital live is degradation, not perfection. Guard the touch so a one-sided book returns None rather than raising, because a raising on_tick is a bot that quietly stopped trading. Detect staleness explicitly, since 'the connection is up' is not 'the data is good'. Bound your queues and shed load when messages arrive faster than you process them. Lose the model and fall back to flat rather than to garbage orders — fail loudly at the seam, fail safe at the edge. And give every order a client id so a retry after a dropped socket is a no-op instead of a double fill.",
          "Your ledger and the venue's will disagree, and the reconnect is when you find out. Positions self-heal because the exchange overwrites them on every PortfolioUpdate; realised P&L, fill counts and your kill switch's loss tally do not, which is why the lab's bot comes back with the right net worth and a realized_pnl of +0.00 that stays wrong all session. Keep a shadow ledger from on_fill, diff it every tick, and treat a mismatch as a page: it means a fill you missed or double-counted. Then confirm the story offline from the tape with scripts/tca_report.py.",
          "Costs and risk are the two things the tearsheet must not flatter. tca_report.py gives you fills, volume, buy/sell split, maker versus taker mix, fees against rebates, and execution quality against the prevailing mid at each fill — set that beside your walk-forward estimate and explain the gap, because turnover is where an edge quietly goes. Then accept the ranking: the same +12.68% return scores +10.000 as a steady curve and +0.091 as a jagged one with a 19.2% drawdown. Defend the process, not the P&L, and remember that one seed is one sample."
        ],
        "example": {
          "title": "In the arena",
          "text": "exchange/scoring.py — score_equity() is the function that ranks the season, and it is the same code the live venue and the offline sim both call, so a tearsheet you compute yourself is comparable with the leaderboard.",
          "code": "# exchange/scoring.py  (score_equity)\nr = returns(eq)\nvol = statistics.pstdev(r) if len(r) > 1 else 0.0\nmean_r = (sum(r) / len(r)) if r else 0.0\nmdd = max_drawdown(eq)\n\nif n >= MIN_SNAPSHOTS and r:\n    excess = [x - RISK_FREE_PER_SNAPSHOT for x in r]\n    mean_excess = sum(excess) / len(excess)\n    ratio = mean_excess / max(vol, VOL_FLOOR)\n    ratio = max(-RISK_ADJUSTED_CAP, min(RISK_ADJUSTED_CAP, ratio))\n    if ratio >= 0:\n        risk_adjusted = ratio * max(0.0, 1.0 - pen * mdd)\n    else:\n        risk_adjusted = ratio * (1.0 + pen * mdd)"
        }
      },
      "interview": [
        {
          "q": "What is the difference between unit correctness and integration correctness?",
          "a": "Unit correctness means each component honours its own contract in isolation — the matching engine matches, the risk check vetoes, the message model validates. Integration correctness means those components honour each other's contracts when wired together under load, which depends on timing, ordering, back-pressure and shared state. Those properties are emergent, so no single unit test can see them: a system can be made entirely of green components and still be wrong at the seams.",
          "level": "warm-up",
          "skill": "tools.test-pyramid"
        },
        {
          "q": "You have thirty seconds before a live session and one command. What do you run, and what is it for?",
          "a": "A smoke test: one fast pass over the critical path — does the process start, connect and handshake, place one order and get an ack, and produce a score. Here that is the seeded offline session, which needs no network and finishes in seconds. It is not a substitute for the suite; it catches the obvious 90% — a broken import, a missing env var, the wrong venue address — which is exactly the class of failure that embarrasses you at the open. Running the full suite instead means you have not thought about the thirty seconds.",
          "level": "warm-up",
          "skill": "tools.smoke-test"
        },
        {
          "q": "The socket is healthy and the price looks plausible, but the feed has gone stale. How do you detect that, and what should the bot do?",
          "a": "Liveness of the connection is not freshness of the data, so I track freshness directly: store the last price and the tick or timestamp at which it last changed, per symbol, and treat age since the last change as a first-class metric. Past a threshold the symbol is cold — stop quoting it, widen dramatically, or flatten, and log it as an anomaly rather than trading on a mark nobody stands behind. The same check catches the subtler case where a market maker died but its resting quotes were never cancelled, so the touch keeps answering with a dead price.",
          "level": "core",
          "skill": "tools.failure-modes"
        },
        {
          "q": "Your bot reconnects after the venue restarts. Which parts of its state are trustworthy and which are not?",
          "a": "Anything the venue sends you is trustworthy, because it overwrites yours: positions arrive on every portfolio update, so they self-heal within a tick. Anything you accumulated locally does not — realised P&L, fill counts, rolling signal statistics, a daily-loss tally — because the reconnect reset your object while the venue kept the truth. So on rejoin I re-sync from the venue's snapshot, reset derived counters from it rather than carrying a fiction, and run a reconciliation check every tick that diffs my fill-derived shadow ledger against the venue's positions and logs any mismatch as an incident.",
          "level": "core",
          "skill": "trading.reconciliation"
        },
        {
          "q": "Why is retry logic without idempotency dangerous, and how do you make an order retry safe?",
          "a": "Because a timeout tells you nothing about whether the venue received the order. Retrying a send that actually landed gives you two live orders and, in a fast market, two fills and double the intended position — the failure mode shows up precisely on the night the network is bad. The fix is to tie the action to an identity: generate a client order id, send it with the order, and have the venue treat a repeat of the same id as a no-op that returns the original ack. Then a replay is idempotent, and you can assert that in a test that sends the same id twice and expects one position change.",
          "level": "core",
          "skill": "tools.failure-modes"
        },
        {
          "q": "Two bots finish the season with identical net worth. Which one do you hire, and what do you ask to see?",
          "a": "The steadier one, and I would want the mechanism rather than the curve. Concretely: volatility of returns and the Sharpe that follows, max drawdown and where it happened, turnover and the fee split between taker cost and maker rebate, hit rate with average win against average loss, and the number of trades — three winners prove nothing, a hundred with positive expectancy is an edge. Then I would ask what the thesis is and whether the result survives a different seed or period, because a good process can have a bad week and a bad process can get lucky.",
          "level": "core",
          "skill": "quant.performance-metrics"
        },
        {
          "q": "Design a season score that cannot be won by parking the cash or by one maximally levered bet.",
          "a": "Score risk-adjusted return, not final equity. Take per-snapshot returns, subtract the risk-free drift so an idle all-cash book has roughly zero excess return, divide by the volatility of returns with the denominator floored so a near-constant curve cannot produce an astronomical ratio, then multiply by a drawdown penalty like max(0, 1 - 2·maxDD) so a 25% drawdown halves you, and clamp the result. Penalise by sign, so a big drawdown makes a negative score worse rather than pulling it toward zero — otherwise the most levered loser ranks highest. Rank within role, and announce the formula up front so it shapes behaviour instead of surprising people.",
          "level": "senior",
          "skill": "quant.risk-adjusted-score"
        },
        {
          "q": "What belongs in a run-book, and what makes a postmortem worth the hour it takes to write?",
          "a": "A run-book is one page per known failure in the form symptom, diagnosis, action — 'no fills and retry lines in the log: confirm the venue is up, confirm the token, let the backoff run, reset the shadow ledger from the venue's positions on rejoin'. It is written cold and used hot, because under pressure you follow steps rather than reasoning from first principles. A postmortem is blameless and system-focused: timeline, root cause via five whys, impact, and fixes with owners. It earns its hour only if the root cause is specific — a missing test, not a person — and if it ends as a regression test in the suite. A postmortem with no root cause is a diary.",
          "level": "senior",
          "skill": "tools.runbook"
        }
      ]
    }
  ]
};
