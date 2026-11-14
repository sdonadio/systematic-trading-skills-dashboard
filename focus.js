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
      "focus": "Concurrency: asyncio, threads & processes",
      "tagline": "One loop, many tasks, a half-second tick budget, and one rule above all: pick asyncio, a thread or a process by where each component's time goes, and measure before you believe it.",
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
          "title": "The GIL: threads wait in parallel, they do not compute in parallel",
          "text": "CPython's Global Interpreter Lock lets one thread execute Python bytecode at a time. A thread that blocks on a socket, a disk or `time.sleep` releases it, so threads overlap waiting, and they do nothing for computing. Classify the work first. Quiz 3 measured it on a 10-core Mac: the same dot product took 1.85 s sequentially, 2.21 s on 4 threads (slower, because you pay the hand-offs and get no parallelism) and 0.78 s on 4 processes, each with its own interpreter and its own GIL. numpy and other C kernels release the GIL inside their loops, which is why vectorised code can still use threads.",
          "code": "import threading, time\ndef crunch(n):                        # CPU-bound: pure Python bytecode, holds the GIL\n    while n: n -= 1\ndef wait(s):                          # I/O-bound: blocks with the GIL released\n    time.sleep(s)\ndef timed(fn, arg, threads):\n    t0 = time.perf_counter()\n    if threads:\n        ts = [threading.Thread(target=fn, args=(arg,)) for _ in range(4)]\n        [t.start() for t in ts]; [t.join() for t in ts]\n    else:\n        [fn(arg) for _ in range(4)]\n    return time.perf_counter() - t0\ncpu = timed(crunch, 3_000_000, False) / timed(crunch, 3_000_000, True)\nio = timed(wait, 0.2, False) / timed(wait, 0.2, True)\nprint(\"CPU-bound: 4 threads at least 1.5x faster?\", cpu > 1.5)\nprint(\"I/O-bound: 4 threads at least 2.5x faster?\", io > 2.5)\n# CPU-bound: 4 threads at least 1.5x faster? False\n# I/O-bound: 4 threads at least 2.5x faster? True",
          "deck": "Deck Week 2 · slides 7, 14"
        },
        {
          "title": "The GIL is not thread safety: find the race, take the Lock",
          "text": "The GIL protects the interpreter, not your data. A switch can land between the read and the write of `balance = balance + amount`, and the other thread's update disappears. In Quiz 2 two customers made 10 million deposits each way and the balance ended at +2,478,125 instead of 0. A different number came out every run, so a passing test proves nothing. The fix is a `threading.Lock` around the whole read-modify-write: correct, at the cost of 1.3 s becoming 2.1 s, so lock only the critical section. The toolkit is small. `Thread` and `join`, `Event` as the clean stop flag, `queue.Queue` to hand data over instead of sharing it, and `RLock` when a locked `withdraw()` calls a locked `deposit()`.",
          "code": "import sys, threading\nsys.setswitchinterval(1e-5)               # switch threads often so the race shows quickly\nclass Account:\n    def __init__(self): self.balance = 0; self.lock = threading.Lock()\n    def _write_receipt(self, b): pass\n    def deposit(self, amount):\n        new = self.balance + amount       # 1. read\n        self._write_receipt(new)          # 2. a thread switch can land here\n        self.balance = new                # 3. write: overwrites the other thread's update\n    def safe_deposit(self, amount):\n        with self.lock:                   # 1-2-3 as ONE critical section\n            new = self.balance + amount\n            self._write_receipt(new); self.balance = new\ndef run(method, n=200_000):\n    acct = Account(); op = getattr(acct, method)\n    def customer(amount):\n        for _ in range(n): op(amount)\n    ts = [threading.Thread(target=customer, args=(a,)) for a in (+1, -1)]\n    [t.start() for t in ts]; [t.join() for t in ts]\n    return acct.balance\nprint(\"no lock, balance is 0?\", run(\"deposit\") == 0)\nprint(\"with Lock, balance:\", run(\"safe_deposit\"))\n# no lock, balance is 0? False\n# with Lock, balance: 0",
          "deck": "Deck Week 2 · slides 15–16"
        },
        {
          "title": "Pools, start methods and pickling: a process is not free",
          "text": "`ThreadPoolExecutor` and `ProcessPoolExecutor` share one API (`map`, `submit`, Futures), so you can swap the class and keep the code, then measure. Ten blocking 0.3 s polls take 3.04 s serially and 0.31 s on a thread pool. CPU work needs the process pool, but every argument and result crosses by pickle, and the child gets your function by name. Lambdas, nested functions, sockets, locks and event loops will not go. The start method decides how the child begins. `spawn` (the default on macOS and Windows) re-imports your file, so the `__main__` guard is mandatory. `fork` copies the parent along with any half-held locks, and `forkserver` is the Linux default from 3.14. Pool start-up costs 0.1 to 0.3 s, so a process pool loses to one core on small jobs, and passing 160 MB of lists instead of seeds handed Quiz 3's win back.",
          "code": "import multiprocessing as mp, pickle, sys, time\nfrom concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor\ndef crunch(n):                            # module level: pickled BY NAME, child re-imports it\n    while n: n -= 1\n    return n\ndef timed(pool_cls, jobs):\n    t0 = time.perf_counter()\n    with pool_cls(max_workers=4) as ex: list(ex.map(crunch, jobs))\n    return time.perf_counter() - t0\nif __name__ == \"__main__\":                # REQUIRED under spawn: the child re-imports this file\n    print(sys.platform, mp.get_start_method())\n    try: pickle.dumps(lambda x: x * x)\n    except Exception as e: print(\"pickle a lambda ->\", type(e).__name__)\n    big, tiny = [5_000_000] * 4, [10] * 4\n    print(\"big jobs: processes beat threads?\", timed(ProcessPoolExecutor, big) < timed(ThreadPoolExecutor, big))\n    t0 = time.perf_counter(); [crunch(n) for n in tiny]; one_core = time.perf_counter() - t0\n    print(\"tiny jobs: process pool slower than one core?\", timed(ProcessPoolExecutor, tiny) > one_core)\n# darwin spawn\n# pickle a lambda -> PicklingError\n# big jobs: processes beat threads? True\n# tiny jobs: process pool slower than one core? True",
          "deck": "Deck Week 2 · slides 17–20"
        },
        {
          "title": "Choose per component, and cross the thread-loop line safely",
          "text": "Decide per component by where its time goes. The feed handler and the order gateway wait on sockets, so they run as asyncio tasks, and the gateway stays one task so order sequence is kept. The yfinance reference poll is blocking HTTP with no async API, so it gets a thread. A light z-score signal costs microseconds of numpy and runs inline, while a heavy fit or backtest burns CPU for seconds and goes to a process pool. Logs and disk writes use `to_thread` or a writer thread. When a thread and the loop must talk, there are three safe crossings: a plain dict write the loop reads later, `loop.call_soon_threadsafe` to push into the loop, and `await asyncio.to_thread(fn)` to run blocking work and get the result back. An `asyncio.Queue` is not thread-safe, so a thread never touches it directly.",
          "code": "import asyncio, threading, time\nprices = {}                                         # the broker's state.yahoo_prices\ndef heavy_calc():                                   # blocking work the loop asks for\n    time.sleep(0.3); return 42\nasync def main():\n    loop = asyncio.get_running_loop()\n    q = asyncio.Queue()                             # NOT thread-safe: only the loop touches it\n    def poll():                                     # the \"yahoo-feed\" thread\n        for i in range(3):\n            time.sleep(0.1)                         # blocking HTTP stand-in\n            prices[\"AAPL\"] = 100.0 + i              # PULL: a plain dict write\n            loop.call_soon_threadsafe(q.put_nowait, i)   # PUSH: the only safe way in\n    threading.Thread(target=poll, daemon=True, name=\"yahoo-feed\").start()\n    t0 = time.perf_counter()\n    score = await asyncio.to_thread(heavy_calc)     # loop -> thread -> result back\n    got = [await q.get() for _ in range(3)]\n    print(score, got, prices, \"overlapped:\", time.perf_counter() - t0 < 0.45)\nasyncio.run(main())\n# 42 [0, 1, 2] {'AAPL': 102.0} overlapped: True",
          "deck": "Deck Week 2 · slides 21–22"
        },
        {
          "title": "Sockets drop: catch ConnectionClosed and back off",
          "text": "A live session will drop your socket — the venue restarts, the wifi blinks, a close frame arrives. `websockets.exceptions.ConnectionClosed` must be caught around the read loop, not inside the strategy, and the retry has to back off: double the delay and cap it, so thirty bots reconnecting do not arrive as a thundering herd on a venue that is still starting. Reset state on the way back in. The engine rebuilds `MarketData()` on every reconnect for a reason — a stale book is worse than no book, because it looks tradeable.",
          "code": "import asyncio\nasync def consume(attempts, delay=1.0):\n    log = []\n    for ok in attempts:\n        if ok:\n            log.append(\"connected\"); delay = 1.0; continue\n        log.append(f\"ConnectionClosed - retry in {delay:.0f}s\")\n        await asyncio.sleep(0)                      # stand-in for the real wait\n        delay = min(delay * 2, 30.0)                # exponential backoff, capped\n    return log\nprint(asyncio.run(consume([False, False, False, True])))\n# ['ConnectionClosed - retry in 1s', 'ConnectionClosed - retry in 2s', 'ConnectionClosed - retry in 4s', 'connected']",
          "deck": "Deck Week 2 · slide 25 · slide 31"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "The signal-to-order pipeline in this codebase is two tasks on one loop. `run()` creates them both: `listen()` reads the socket and decodes book snapshots, acks and fills into `MarketData`, and `trading_loop()` sleeps `TICK_INTERVAL_SEC` — 0.5 s by default — then calls your hook, gates the returned `Signal` through a risk check and sends a `PlaceOrder`. Your hook is the synchronous step in the middle of an asynchronous machine. If it does not return, `listen()` does not run, `MarketData` stops updating, and you are deciding on a book that no longer exists.",
          "That is the live-risk failure, and it is measurable rather than theoretical. Block the loop for three seconds and three seconds of snapshots, acks and fills arrive at a socket nobody is reading; the lab's heartbeat measured 3,010 ms of starvation against 4.8 ms for the same work moved off the loop with `to_thread`. Scoring begins in week 2, so this is not a style point — a blocking bot misses fills, and it also misses the SESSION_CLOSED event that triggers flattening, which is how a position survives the end of a session.",
          "Queue depth is a transaction cost. A bounded queue makes the producer wait and keeps the prices you act on current; an unbounded one converts a slow consumer into stale decisions, and a stale decision crosses a spread that has already moved against it. The lab's two rows say it precisely: identical throughput, worst-case lag of a few milliseconds against roughly 2.4 seconds. Turnover multiplies that error, so the right response to falling behind is to drop or coalesce updates and keep the tick you act on fresh, not to buy a bigger buffer.",
          "There is exactly one legitimate thread here, and it is worth knowing why. `yfinance` is blocking HTTP with no async API — one `Ticker(...).fast_info.last_price` took 3.6 seconds in the lab, across ten symbols every 5 seconds — so the broker runs it in a daemon thread named `yahoo-feed` that writes one dict of floats, and the async quoting code reads that dict. Threads for blocking libraries, the loop for sockets, nothing shared but plain floats, and the thread's body wrapped so it never raises. That is the whole hand-off.",
          "Processes belong to research, not to the tick. A walk-forward fit or a parameter sweep is CPU-bound and embarrassingly parallel, so it is the one place a process pool pays: Quiz 3's 1.85 s became 0.78 s on four workers. A process round trip per tick is the opposite trade, because start-up and pickling cost more than a z-score. And a thread you add to write your portfolio while the loop reads it is Quiz 2 waiting to happen. Keep one owner for each piece of state, and measure before you add a core.",
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
          "q": "A bot stops receiving market data for seconds at a time, then catches up. How do you diagnose it?",
          "a": "That pattern is a blocked event loop, not a network problem: while one coroutine refuses to yield, the socket reader never runs and the data queues up in the kernel. First confirm it — run the loop with `debug=True` or `PYTHONASYNCIODEBUG=1`, which logs any callback that holds the loop for more than 100 ms, and add timing around the suspect hook. Then find the offender, which is nearly always `time.sleep`, a blocking HTTP client, a synchronous database driver, or a heavy numeric loop. Move it off the loop with `asyncio.to_thread` or a process pool, and re-measure the same way.",
          "level": "core",
          "skill": "python.non-blocking"
        },
        {
          "q": "The event loop is single-threaded. Do you still need a lock?",
          "a": "Sometimes. You do not get the pre-emptive data races threads give you, because a task yields only at an `await`, so a sequence of plain statements between awaits is atomic. What survives is the logic race: read shared state, `await` something, then write a value derived from the stale read — the other task ran in that gap. Guard that span with `asyncio.Lock` if it must be serialised, or restructure so the state has one owner and the other tasks talk to it through a queue. `threading.Lock` is the wrong tool inside a coroutine: it blocks the loop rather than yielding.",
          "level": "core",
          "skill": "python.async-races"
        },
        {
          "q": "Why did 4 threads not speed up the dot product, when 4 processes did?",
          "a": "The dot product in Quiz 3 is pure Python arithmetic, so it is CPU-bound, and CPython's GIL lets only one thread execute bytecode at a time. Four threads take turns on one core and add switching and hand-off cost: 1.85 s sequentially became 2.21 s. Four processes each have their own interpreter, GIL and core, so they ran in parallel: 0.78 s. The fix is to classify the work before choosing the tool. Threads help when the time goes on waiting, because a blocked thread releases the GIL. For computing you want processes, or a numpy kernel that releases the GIL inside its loop.",
          "level": "core",
          "skill": "python.gil"
        },
        {
          "q": "The GIL means only one thread runs at a time. So why can two threads still corrupt a balance?",
          "a": "The GIL makes each bytecode atomic, not your three-step update. `new = balance + amount; balance = new` is a load, an add and a store, and the interpreter can switch threads between them, so the second writer overwrites the first and an update is lost. Quiz 2 ended at +2,478,125 when it should have been 0, with a different value every run. Put a `threading.Lock` around the whole read-modify-write and it comes back to 0, at about 60% more run time, so lock only the critical section. Two follow-ups are worth knowing: `balance += 1` is not atomic either, and taking a plain Lock in `withdraw()` and again in the `deposit()` it calls deadlocks, so use an `RLock` or lock in one place. The better design is often to share nothing and pass data through a `queue.Queue`.",
          "level": "core",
          "skill": "python.threading"
        },
        {
          "q": "When is a process pool worse than a single core?",
          "a": "When the overhead is bigger than the work. A pool pays start-up (0.1 to 0.3 s, since under `spawn` each worker starts a fresh interpreter and re-imports your module) and pickles every argument and result across the boundary. On small jobs, or once per tick, that costs more than the computation, so one core in a loop wins. It also loses when the payload is big: Quiz 3 took 0.78 s when each worker rebuilt its slice from a seed, and 1.59 s for the dot product alone when the parent pickled 160 MB of lists across. And it loses when the work is not CPU-bound at all, because waiting does not need another core. Create the pool once, send small inputs, return small results, and keep the decision only if the timing shows a gain.",
          "level": "core",
          "skill": "python.executors"
        },
        {
          "q": "For each component of a trading system, would you use threads, processes or asyncio?",
          "a": "Decide by where the time goes. The feed handler waits on a socket for thousands of messages, so it runs on asyncio: one loop and no locks. The order gateway also waits, and order sequence matters, so it is one asyncio task acting as the single writer. A blocking library with no async API, like the yfinance reference poll, gets a thread. A light signal such as a numpy z-score runs inline, because a process round trip would cost more than the math. A heavy fit or backtest is CPU-bound and goes to a process pool, with the result pickled back. Logs and database writes use `to_thread` or a dedicated writer thread. The default is asyncio, a thread only when a library blocks, and a process only after a measurement shows the CPU is the bottleneck.",
          "level": "senior",
          "skill": "python.concurrency-choice"
        },
        {
          "q": "Your signal needs a blocking C library that takes 20 ms per call, and the tick budget is 500 ms. Walk through the options.",
          "a": "First check whether it must be on the tick path at all — a cached or periodically refreshed value often removes the problem. If it must run per tick, `asyncio.to_thread` is the one-liner and is correct when the library releases the GIL while it works, which most C extensions doing real work do; if it holds the GIL, the thread starves the loop anyway and you need a process pool and the serialisation cost with it. Use `run_in_executor` with your own bounded pool when you need to limit concurrency. Whatever you pick, keep a deadline: if the result is not back in time, skip the tick rather than queue a stale decision.",
          "level": "senior",
          "skill": "python.to-thread"
        },
        {
          "q": "Design the reconnect path for a WebSocket market-data client.",
          "a": "Wrap the whole connect-and-read cycle in a loop, catch `ConnectionClosed` and `OSError` around it rather than inside the strategy, and back off exponentially with a cap and some jitter — `delay = min(delay * 2, 30)` — so a venue restart does not get a thundering herd from every bot at once, and reset the delay after a successful handshake. On reconnect, discard derived state: rebuild the local book rather than resuming from a stale one, and re-subscribe. Cancel the sibling tasks with the connection so a trading loop does not keep firing orders at a dead socket, and treat a clean close and an abnormal drop as the same event.",
          "level": "senior",
          "skill": "python.reconnect"
        }
      ]
    },
    {
      "n": 3,
      "focus": "The stack, sockets & wire protocols",
      "tagline": "Nine things happen between joining the Wi-Fi and your first quote. Learn the layer each one lives at, pick TCP or UDP by what a loss costs, frame your bytes, read FIX and ITCH, then let a WebSocket and a typed schema carry your orders.",
      "concepts": [
        {
          "title": "Seven OSI layers, four that the Internet implements",
          "text": "OSI is a vocabulary for saying where something lives or fails; TCP/IP is what is actually implemented. Here is each layer with its job, PDU, header, protocols and devices. L1 Physical puts bits on a medium (radio, copper, fibre, through antennas and optics). L2 Data link delivers a frame to the next hop: MAC addresses and an FCS, over 802.11 or Ethernet, with ARP resolving the gateway's MAC, through NICs, access points and switches. L3 Network moves a packet host to host: a 20-byte IPv4 header with TTL and protocol, through routers and NAT. L4 Transport is process to process: ports, plus TCP's sequence, ack, window and flags, on host kernels, firewalls and NAT. L5 Session and L6 Presentation have no protocol of their own on the Internet; TLS 1.3 and your encoding (JSON, SBE) live there. L7 Application is DNS, HTTP, the WebSocket, FIX and our JSON. TCP/IP folds L1–2 into Link and L5–7 into Application. Each layer reads only its own header and hands the rest up. Setup from this laptop to the arena took about 250 ms (DNS 53 ms, TCP 25 ms, TLS 35 ms, upgrade 26 ms), once per session.",
          "code": "STACK = [  # OSI layer, PDU, TCP/IP layer, what tonight's quote carries there\n    (7, \"Application\",  \"message\",  \"Application\", \"DNS, HTTP, WebSocket 2-14 B, our JSON\"),\n    (6, \"Presentation\", \"-\",        \"Application\", \"TLS encryption; JSON / SBE encoding\"),\n    (5, \"Session\",      \"-\",        \"Application\", \"TLS session, FIX session, WS close\"),\n    (4, \"Transport\",    \"segment\",  \"Transport\",   \"TCP 20-60 B: ports, seq, ack, flags\"),\n    (3, \"Network\",      \"packet\",   \"Internet\",    \"IPv4 20 B: src/dst IP, TTL, protocol\"),\n    (2, \"Data link\",    \"frame\",    \"Link\",        \"802.11 / Ethernet: MACs, FCS 4 B\"),\n    (1, \"Physical\",     \"bit\",      \"Link\",        \"5 GHz radio, copper, fibre\"),\n]\nfor n, name, pdu, tcpip, carries in STACK:\n    print(f\"L{n} {name:<12} {pdu:<8} {tcpip:<11} {carries}\")\nprint(\"TCP MSS on a 1500-byte MTU with timestamps:\", 1500 - 20 - 20 - 12)\n# L7 Application  message  Application DNS, HTTP, WebSocket 2-14 B, our JSON\n# L6 Presentation -        Application TLS encryption; JSON / SBE encoding\n# L5 Session      -        Application TLS session, FIX session, WS close\n# L4 Transport    segment  Transport   TCP 20-60 B: ports, seq, ack, flags\n# L3 Network      packet   Internet    IPv4 20 B: src/dst IP, TTL, protocol\n# L2 Data link    frame    Link        802.11 / Ethernet: MACs, FCS 4 B\n# L1 Physical     bit      Link        5 GHz radio, copper, fibre\n# TCP MSS on a 1500-byte MTU with timestamps: 1448",
          "deck": "Deck Week 3 · slides 3–11"
        },
        {
          "title": "UDP vs TCP: what a loss costs decides",
          "text": "TCP (`SOCK_STREAM`) costs one round trip of handshake and gives you a byte stream: ordered, retransmitted, flow- and congestion-controlled, with no message boundaries, and with head-of-line blocking where one lost packet freezes every byte behind it. UDP (`SOCK_DGRAM`) has an 8-byte header, no connection, no retransmit and no ordering. One `sendto` is one `recvfrom`, and multicast lets the network copy each datagram to every subscriber at nearly the same instant. Hence the rule. Order entry runs on TCP (FIX, OUCH, iLink 3, our WebSocket), because a lost order is a bug. Market data runs on UDP multicast (ITCH, CME MDP 3.0), because a retransmitted price arrives stale. You pay for UDP by numbering every datagram and detecting gaps yourself: in the lab all three subscribers saw `missing [4]`. UDP fails silently: a `sendto` to nobody still reports success.",
          "code": "import socket, struct\nrx = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\nrx.bind((\"127.0.0.1\", 0)); rx.settimeout(0.5)            # UDP: bind and go, no listen/accept\ntx = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\nfor seq in (1, 2, 3, 5):                                  # datagram 4 was \"lost\" on the way\n    tx.sendto(struct.pack(\"!Q\", seq) + b\"AAPL 225.78\", rx.getsockname())\ngot = [struct.unpack(\"!Q\", rx.recvfrom(65535)[0][:8])[0] for _ in range(4)]   # one sendto = one recvfrom\nexpected, missing = 1, []\nfor seq in got:                                           # gap detection is YOUR job on UDP\n    missing += range(expected, seq); expected = seq + 1\nprint(\"received\", got, \"missing\", missing, \"-> retransmit or snapshot\")\nprint(\"sendto() to a port nobody listens on returned\", tx.sendto(b\"hello?\", (\"127.0.0.1\", 9)))\n# received [1, 2, 3, 5] missing [4] -> retransmit or snapshot\n# sendto() to a port nobody listens on returned 6",
          "deck": "Deck Week 3 · slides 12–13"
        },
        {
          "title": "The socket API, call by call, and what the kernel does",
          "text": "TCP server: `socket`, `setsockopt(SO_REUSEADDR)`, `bind`, `listen(8)`. From `listen` on, the kernel answers SYNs by itself and parks finished handshakes in the backlog, which is why the client's `connect` returned at 0.39 ms, before the server's `accept`. `accept` mints a new socket per client while the listening socket keeps listening. `recv(n)` returns whatever has arrived, up to n bytes, and `b''` means the peer sent FIN. `sendall` loops `send` for you. The side that closes first sits in TIME_WAIT, so a restarted server gets `[Errno 48] Address already in use` without `SO_REUSEADDR`. UDP is just `socket`, `bind`, `recvfrom` on the receiver and `sendto` on the sender, with no listen, no accept and no connection state. A blocking accept loop serves one client at a time (50 clients took 0.23 s); readiness I/O with `selectors` or asyncio serves them all on one thread (0.03 s).",
          "code": "import socket\nsrv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\nsrv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)   # rebind despite TIME_WAIT\nsrv.bind((\"127.0.0.1\", 0)); srv.listen(8)                   # LISTEN: the kernel now answers SYNs\ncli = socket.create_connection(srv.getsockname(), timeout=2)  # handshake done by the kernels...\nconn, peer = srv.accept()                                   # ...and queued in the backlog until now\nprint(\"accept() minted a new socket:\", conn.fileno() != srv.fileno())\ncli.sendall(b\"buy 5 AAPL\");  print(\"server recv:\", conn.recv(4096))\nconn.sendall(b\"BUY 5 AAPL\"); print(\"client recv:\", cli.recv(4096))\ncli.close()                                                 # client sends FIN\nprint(\"server recv after FIN:\", conn.recv(4096))            # b'' = orderly close, not an error\nconn.close(); srv.close()\n# accept() minted a new socket: True\n# server recv: b'buy 5 AAPL'\n# client recv: b'BUY 5 AAPL'\n# server recv after FIN: b''",
          "deck": "Deck Week 3 · slides 15–17"
        },
        {
          "title": "An echo server, framing, and a UDP pair",
          "text": "Every networked program is the echo server plus framing plus error handling. The server loop is `while data := conn.recv(4096): conn.sendall(data.upper())`, and the client sets a timeout so a silent peer becomes an exception instead of a hang. With the server down, the client gets `ConnectionRefusedError` because the kernel answered the SYN with RST. TCP gives you bytes, not messages: three `sendall` calls came back as two `recv`s, and one 1 MB send arrived as 25. Frame every message, with a 4-byte length prefix for anything binary (FIX, SoupBinTCP and SBE all carry a length) or a newline for text you want to grep, like the session `.jsonl` tapes. On UDP the boundaries are preserved and delivery is not, so put a sequence number in every datagram and expect a datagram over 65,507 bytes to fail with `Message too long`.",
          "code": "import json, socket, struct\na, b = socket.socketpair()                                  # a connected byte stream\na.sendall(b'{\"type\":\"place_order\"}'); a.sendall(b'{\"type\":\"cancel_order\"}')\ntry: json.loads(b.recv(4096))                               # two sends, one recv\nexcept json.JSONDecodeError as e: print(\"unframed:\", e.msg)\ndef send_msg(s, obj):                                       # 4-byte big-endian length, then payload\n    body = json.dumps(obj).encode(); s.sendall(struct.pack(\"!I\", len(body)) + body)\ndef recv_exactly(s, n):                                     # recv may return fewer than n bytes\n    buf = bytearray()\n    while len(buf) < n:\n        chunk = s.recv(n - len(buf))\n        if not chunk: raise ConnectionError(\"peer closed mid-message\")\n        buf += chunk\n    return bytes(buf)\ndef recv_msg(s): return json.loads(recv_exactly(s, struct.unpack(\"!I\", recv_exactly(s, 4))[0]))\nfor t in (\"place_order\", \"cancel_order\", \"handshake\"): send_msg(a, {\"type\": t})\nprint(\"framed:\", [recv_msg(b)[\"type\"] for _ in range(3)])\n# unframed: Extra data\n# framed: ['place_order', 'cancel_order', 'handshake']",
          "deck": "Deck Week 3 · slides 18–20"
        },
        {
          "title": "FIX, ITCH and OUCH: the venue protocols under ours",
          "text": "FIX is tag=value text separated by SOH. 8 is BeginString, 9 is BodyLength, 35 is MsgType (D is NewOrderSingle, 8 is ExecutionReport), 34 is MsgSeqNum, 11 is the client's ClOrdID, and 10 is CheckSum, the byte sum mod 256. Session messages keep the pipe honest and know nothing about orders: Logon (A), Heartbeat (0), TestRequest (1), ResendRequest (2), SequenceReset (4), Logout (5). Application messages carry the business: D, F, G and 8. Sequence numbers survive a reconnect, so a session resumes instead of restarting. When microseconds matter, fixed-layout binary replaces text. ITCH is Nasdaq's market data out over UDP multicast (MoldUDP64), and an Add Order is 36 bytes you decode with one `struct.unpack`. OUCH is Nasdaq's order entry in: tiny binary Enter, Cancel and Replace messages over TCP (SoupBinTCP). Decoding one order took 84 ns with struct against 1,197 ns with `json.loads`, and fixed sizes make latency predictable.",
          "code": "import struct\nSOH = \"\\x01\"\ndef fix(fields):                                            # BodyLength (9) and CheckSum (10) computed\n    body = \"\".join(f\"{k}={v}{SOH}\" for k, v in fields)\n    head = f\"8=FIX.4.4{SOH}9={len(body)}{SOH}\"\n    return head + body + f\"10={sum((head + body).encode()) % 256:03d}{SOH}\"\nmsg = fix([(35, \"D\"), (49, \"TEAM_SEB\"), (56, \"ARENA\"), (34, 42), (52, \"20261016-20:45:00.123\"),\n           (11, \"c-0001\"), (55, \"AAPL\"), (54, 1), (38, 5), (40, 2), (44, \"225.30\"), (59, 0)])\nprint(msg.replace(SOH, \"|\"))\ntags = dict(f.split(\"=\", 1) for f in msg.split(SOH) if f)\nprint(\"MsgType\", tags[\"35\"], \"(NewOrderSingle) seq\", tags[\"34\"], \"ClOrdID\", tags[\"11\"])\nITCH_ADD = \"!cHH6sQcI8sI\"                                   # 'A' Add Order, 36 bytes, fixed offsets\nwire = struct.pack(ITCH_ADD, b\"A\", 7, 0, (74_700_123_457_000).to_bytes(6, \"big\"),\n                   1001, b\"B\", 5, b\"AAPL    \", 2_253_000)\nkind, _, _, ts, ref, side, shares, sym, px = struct.unpack(ITCH_ADD, wire)\nprint(len(wire), \"bytes:\", kind.decode(), f\"ref={ref}\", side.decode(), shares, sym.decode().strip(),\n      f\"@ {px / 10_000:.4f}\", f\"t={int.from_bytes(ts, 'big') / 1e9:.6f}s after midnight\")\n# 8=FIX.4.4|9=105|35=D|49=TEAM_SEB|56=ARENA|34=42|52=20261016-20:45:00.123|11=c-0001|55=AAPL|54=1|38=5|40=2|44=225.30|59=0|10=242|\n# MsgType D (NewOrderSingle) seq 42 ClOrdID c-0001\n# 36 bytes: A ref=1001 B 5 AAPL @ 225.3000 t=74700.123457s after midnight",
          "deck": "Deck Week 3 · slides 21–23"
        },
        {
          "title": "WebSocket: one upgrade, then frames, pings and a reconnect loop",
          "text": "A WebSocket starts as an HTTP/1.1 GET with `Upgrade: websocket` and a random `Sec-WebSocket-Key`. The server answers `101 Switching Protocols` with base64(SHA-1(key + a fixed GUID)), proving it understood the upgrade. After that the same TCP connection carries frames in both directions: a 2–14 byte header with FIN, opcode (1 text, 2 binary, 8 close, 9 ping, A pong), a mask bit (client frames are always masked) and a length. One frame is one message, the boundary TCP never gave you. Ping and pong go every 20 s and are invisible to `recv()`. Close code 1000 is a normal close, and 1006 means no close frame arrived because the peer vanished. Reconnect with backoff, jitter and a resync from the first snapshot. AlgoArena maps onto real venues: Handshake is FIX Logon, ping/pong is Heartbeat/TestRequest, PlaceOrder is NewOrderSingle, and OrderAck plus TradeExecution play the role of ExecutionReport. It has no ClOrdID and no sequence numbers; full snapshots every 0.5 s replace gap fill, and one TCP send per client replaces multicast.",
          "code": "import base64, hashlib\nGUID = b\"258EAFA5-E914-47DA-95CA-C5AB0DC85B11\"             # RFC 6455, the same on every server\nkey = b\"OEdYZE9xvbhe7elrv3f99Q==\"                          # the client's Sec-WebSocket-Key\nprint(\"HTTP/1.1 101 Switching Protocols\")\nprint(\"Sec-WebSocket-Accept:\", base64.b64encode(hashlib.sha1(key + GUID).digest()).decode())\nOPCODES = {1: \"text\", 2: \"binary\", 8: \"close\", 9: \"ping\", 10: \"pong\"}\ndef header(frame):                                          # first bytes of a frame, read by hand\n    fin, op, masked, n = frame[0] >> 7, frame[0] & 0x0F, frame[1] >> 7, frame[1] & 0x7F\n    if n == 126: n = int.from_bytes(frame[2:4], \"big\")      # 126 -> the next 2 bytes hold the length\n    return f\"FIN={fin} {OPCODES[op]} masked={masked} len={n}\"\nprint(header(bytes.fromhex(\"817e05a3\")), \"<- server book_snapshot\")\nprint(header(bytes.fromhex(\"880203e8\")), \"code\", int.from_bytes(bytes.fromhex(\"03e8\"), \"big\"))\n# HTTP/1.1 101 Switching Protocols\n# Sec-WebSocket-Accept: JI+wC80lovHV+cvvlPFl5diw9JQ=\n# FIN=1 text masked=0 len=1443 <- server book_snapshot\n# FIN=1 close masked=0 len=2 code 1000",
          "deck": "Deck Week 3 · slides 24–30"
        },
        {
          "title": "Typed schemas and one dispatcher: continue, never raise",
          "text": "Framing and encoding are solved for you. What remains is the schema and its meaning. A pydantic model makes the shape code that runs on every message: a `Literal` makes `side='long'` unrepresentable, `Field(gt=0)` kills a zero-lot order at the edge, and a `type` discriminator picks exactly one model in one step instead of trial parsing. Every input then becomes a typed object or one of three loud errors: unparseable bytes, an unknown type, or an invalid payload. The venue's inbound loop answers each with `ErrorMsg(PARSE_ERROR)` and then `continue`, not `raise`. Your `listen()` owes it the same courtesy, because one bad frame must never end a session that has resting orders behind it.",
          "code": "import json\nfrom typing import Annotated, Literal, Union\nfrom pydantic import BaseModel, Field, TypeAdapter, ValidationError\nclass PlaceOrder(BaseModel):\n    type: Literal[\"place_order\"] = \"place_order\"\n    symbol: str\n    side: Literal[\"buy\", \"sell\"]                 # 'long' is unrepresentable, not just wrong\n    quantity: int = Field(gt=0)\nclass CancelOrder(BaseModel):\n    type: Literal[\"cancel_order\"] = \"cancel_order\"\n    order_id: str\nparse = TypeAdapter(Annotated[Union[PlaceOrder, CancelOrder], Field(discriminator=\"type\")]).validate_python\nfor raw in ('{\"type\":\"place_order\",\"symbol\":\"AAPL\",\"side\":\"buy\",\"quantity\":5}',\n            '{\"type\":\"cancel_order\",\"order_id\":\"a1\"}',\n            '{\"type\":\"place_order\",\"symbol\":\"AAPL\",\"side\":\"long\",\"quantity\":5}',\n            '{\"type\":\"place_ordr\"}', 'nope'):\n    try:                                         # continue, never raise: one bad frame must not end the session\n        print(\"ok      \", type(parse(json.loads(raw))).__name__)\n    except json.JSONDecodeError:\n        print(\"rejected unparseable bytes\")\n    except ValidationError as e:\n        err = e.errors()[0]; print(\"rejected\", err[\"type\"], err[\"loc\"])\n# ok       PlaceOrder\n# ok       CancelOrder\n# rejected literal_error ('place_order', 'side')\n# rejected union_tag_invalid ()\n# rejected unparseable bytes",
          "deck": "Deck Week 3 · slides 32–33"
        },
        {
          "title": "A protocol is a versioned contract",
          "text": "Framing says where a message ends; it says nothing about what the message means. The contract does: which types exist, what fields each carries, who may send it, and what a valid reply is. PlaceOrder from a client is answered by OrderAck from the venue. Contracts outlive their first release, so you evolve them by adding optional fields with defaults and never by repurposing an existing one. queue_ahead, maker_rebate and microprice were all added to AlgoArena mid-season that way, and no older bot broke.",
          "code": "from typing import Literal\nfrom pydantic import BaseModel\nclass OrderAck(BaseModel):\n    type: Literal[\"order_ack\"] = \"order_ack\"\n    order_id: str\n    price: float\n    queue_ahead: int = 0          # added mid-season: optional, with a default\nold = '{\"type\":\"order_ack\",\"order_id\":\"a1\",\"price\":309.48}'   # a pre-upgrade client\nack = OrderAck.model_validate_json(old)\nprint(\"parsed, queue_ahead =\", ack.queue_ahead,\n      \"| round-trip equal:\", OrderAck.model_validate_json(ack.model_dump_json()) == ack)\n# parsed, queue_ahead = 0 | round-trip equal: True",
          "deck": "Deck Week 3 · slides 31, 34"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "Your bot writes only the last of the nine steps between the Wi-Fi and the first quote, and any of the other eight can still break it mid-session. So read a failure by its layer. `socket.gaierror` is DNS at L7. `[Errno 61] Connection refused` is L4: nothing is listening, often a stale EXCHANGE_HOST in `.env`. `SSLCertVerificationError` is L5–6. A 1006 after a Wi-Fi blip is L1–2, and a laptop that slept through its DHCP lease comes back with a new IP and every connection dead. The setup costs about 250 ms once, after which every order and quote rides the same TCP + TLS + WebSocket connection. That is why losing it is expensive.",
          "Real venues split the wire the way the UDP/TCP comparison predicts. Market data goes out by UDP multicast, published twice on A and B feeds, with a sequence number per packet and a snapshot channel to recover a gap. Orders come in by TCP, each one named by a ClOrdID so a duplicate is detectable after a drop. AlgoArena deliberately leaves both out. TCP plus full snapshots means there is nothing to gap-fill, and there is no ClOrdID, so an order in flight at a disconnect is unknowable until you reconcile from `portfolio_update`. Knowing what your protocol omits tells you what your bot has to do itself.",
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
          "q": "Name the seven OSI layers, map them onto TCP/IP, and say where TLS, the WebSocket and your JSON sit.",
          "a": "Bottom up: 1 Physical (bits, through radio, copper and fibre), 2 Data link (frames, MACs, switches and access points, ARP), 3 Network (packets, IP addresses, routers, NAT), 4 Transport (segments or datagrams, ports, TCP and UDP), 5 Session, 6 Presentation, 7 Application (messages: DNS, HTTP, FIX). TCP/IP implements four: Link (OSI 1–2), Internet (3), Transport (4) and Application (5–7). TLS sits at 5–6, opening the encrypted session and representing the data. The WebSocket is an application protocol at 7 that upgrades from HTTP, and your JSON is the payload it carries, with its encoding at 6. Each layer reads only its own header, which is why a quote on Wi-Fi is an 802.11 header, IP 20 B, TCP 32 B, a TLS record, a WS header of 2–14 B, then your JSON and the FCS.",
          "level": "warm-up",
          "skill": "tools.osi-stack"
        },
        {
          "q": "Your bot never gets its first quote. How do you find which layer failed?",
          "a": "Read the error by its layer and check with the matching tool. `socket.gaierror` means name resolution at L7, so check `dig`. A connect timeout or `timed out during opening handshake` usually means the wrong host, often a stale EXCHANGE_HOST; `[Errno 61] Connection refused` is a TCP RST at L4 because nothing is listening on that port; check both with `nc -vz host port`. `SSLCertVerificationError` is L5–6, a wrong name or wss on a plain port, so check `openssl s_client`. A stall followed by 1006 after a Wi-Fi blip is L1–2, and a new IP after sleep means the DHCP lease (L3) killed every connection. AUTH_FAILED, PARSE_ERROR or TIMEOUT come from your own protocol on top, and they will be in your bot's log.",
          "level": "core",
          "skill": "tools.osi-stack"
        },
        {
          "q": "Would you carry orders over TCP or UDP, and does market data get the same answer?",
          "a": "Orders go over TCP: every order and fill must arrive exactly once and in order, and a lost cancel is worse than a slow one. Market data is the case for UDP multicast. One send reaches every subscriber at nearly the same instant, there is no head-of-line blocking, and a retransmitted quote would be stale anyway. The price is that UDP will not tell you about a loss, so every datagram carries a sequence number, and the receiver detects gaps and recovers them from a retransmission server, an A/B feed or the snapshot channel, without trading that book while it does. That is ITCH and MDP 3.0 for data, and FIX, OUCH and iLink 3 over TCP for orders.",
          "level": "warm-up",
          "skill": "tools.udp-tcp"
        },
        {
          "q": "Walk through the TCP server and client calls. Why does connect() return before the server calls accept()?",
          "a": "The server calls `socket`, `bind` and `listen(backlog)`. From `listen` on, the kernel itself answers SYNs, completes the three-way handshake and queues the established connection in the backlog. The client's `connect` returns as soon as the handshake completes, whether or not the application has called `accept`. `accept` then pulls a connection off the backlog and returns a new socket for that peer while the listening socket stays open. Then `sendall` and `recv` move bytes, `recv` returning `b''` means the peer sent FIN, and `close` sends your own FIN. The side that closes first waits in TIME_WAIT, which is why a restarted server needs `SO_REUSEADDR` to avoid `Address already in use`. UDP has none of this: `bind` and `recvfrom` on one side, `sendto` on the other, and no connection state.",
          "level": "core",
          "skill": "python.sockets"
        },
        {
          "q": "A colleague's feed reader calls json.loads on whatever recv returns and it fails under load. What is wrong?",
          "a": "recv returns bytes, not messages. TCP is a stream, so under load the kernel coalesces sends and one recv can contain two JSON objects plus half of a third — json.loads then raises 'Extra data' or 'Unterminated string'. The reader needs a framing layer: accumulate into a buffer and split on a delimiter, or length-prefix each payload and read exactly that many bytes. WebSocket is the third option and the reason we use it: the protocol frames for you, so one recv is one whole message.",
          "level": "core",
          "skill": "python.socket-examples"
        },
        {
          "q": "Read this FIX message: 8=FIX.4.4|9=105|35=D|34=42|11=c-0001|55=AAPL|54=1|38=5|40=2|44=225.30|...|10=242. What is it, and which messages are session-level?",
          "a": "It is a NewOrderSingle (35=D): buy (54=1) 5 shares (38) of AAPL (55) as a limit order (40=2) at 225.30 (44). The client named the order c-0001 (ClOrdID, tag 11), and the message is number 42 in this direction (MsgSeqNum, tag 34). 8 is the version, 9 is the body length in bytes, and 10 is the checksum, the sum of every preceding byte mod 256, written as three digits. Session messages keep the connection honest and know nothing about orders: Logon (A), Heartbeat (0), TestRequest (1), ResendRequest (2), SequenceReset (4) and Logout (5). Application messages carry the business: NewOrderSingle (D), cancel (F), cancel/replace (G) and ExecutionReport (8). If you receive 45 after 42, you send ResendRequest for 43–44.",
          "level": "core",
          "skill": "trading.fix-itch"
        },
        {
          "q": "Why do venues use binary protocols like ITCH and OUCH instead of FIX text, and what is each one for?",
          "a": "Latency and determinism. A fixed-layout binary message is decoded by reading at known offsets, with no parsing, no allocation and no branching on content, so the 99.9th percentile looks like the median. In the lab one `struct.unpack` of an order took about 84 ns against 1.2 to 1.5 µs for JSON or FIX parsing. ITCH is Nasdaq's outbound market data, one message per book event (Add Order, Execute, Cancel), with full depth by order, over UDP multicast with MoldUDP64 sequence numbers. OUCH is Nasdaq's inbound order entry, small binary Enter, Cancel and Replace messages over TCP with SoupBinTCP for login and sequencing. CME's equivalents are MDP 3.0 and iLink 3, both SBE-encoded.",
          "level": "core",
          "skill": "trading.fix-itch"
        },
        {
          "q": "Why does a live book use a WebSocket rather than HTTP polling, and what happens on the wire after the upgrade?",
          "a": "Polling pays a full request, headers and a round trip each time, and still misses every change between polls. A WebSocket upgrades one connection once: an HTTP GET with `Upgrade: websocket` and a `Sec-WebSocket-Key`, answered by `101 Switching Protocols` with base64(SHA-1(key + GUID)). From then on both sides send frames on the same TCP connection, each with a 2–14 byte header: FIN, opcode, mask bit (always set by the client) and length. One frame is one message, so the framing problem goes away. Ping/pong control frames every 20 s detect a dead peer and keep NAT entries alive. Close 1000 is clean, and 1006 means the peer vanished without a close frame, which is your cue to reconnect. SSE is server-to-client only, and a trader has to send orders too.",
          "level": "warm-up",
          "skill": "python.websockets"
        },
        {
          "q": "Map AlgoArena's JSON-over-WebSocket onto FIX. Your connection drops just after you send an order: do you resend it?",
          "a": "The mapping is Handshake for Logon, ping/pong for Heartbeat/TestRequest, PlaceOrder for NewOrderSingle, and OrderAck plus TradeExecution plus PortfolioUpdate for ExecutionReport. What is missing matters: there are no MsgSeqNum and no ClOrdID, since TCP order and full snapshots replace sequence numbers and gap fill. So you cannot ask the venue what happened to your order, and a blind resend can open a second position. Reconnect with exponential backoff and jitter, re-handshake, take the first snapshot as the truth, and reconcile positions and open orders from `portfolio_update` before acting. A protocol that wants safe retries needs a client-generated id the venue de-duplicates on, which is exactly what FIX's ClOrdID provides.",
          "level": "senior",
          "skill": "python.reconnect"
        },
        {
          "q": "You must add a field to a protocol that is live, with clients you cannot redeploy. How?",
          "a": "Add it as optional with a default, and never change the meaning of an existing field. An older client omits it and still parses; a newer client sends it and older receivers ignore it. That is how queue_ahead and level_qty landed mid-season: an order_ack payload with neither field still validates, with both defaulting to 0. If the semantics genuinely change, introduce a new type or a new field name and deprecate the old one on a schedule — repurposing a field is the change that breaks peers silently, far from the boundary.",
          "level": "core",
          "skill": "tools.protocol-contract"
        }
      ]
    },
    {
      "n": 4,
      "focus": "Backtesting & tick data storage",
      "tagline": "A backtest is a replay you can be wrong about cheaply: store the tape so a question costs milliseconds (SQL, then kdb+ and Parquet), run every decision on the tape's logical clock, and the P&L is identical at any replay speed until one time.time() call breaks it.",
      "concepts": [
        {
          "title": "What a backtest is, and what it is for",
          "text": "Six stages, always the same: data, a replay loop in recorded order, the strategy, simulated fills and fees, accounting, metrics. Its goal is to falsify cheaply: an idea that loses on the tape after honest costs will not win live. A positive result is an estimate under a fill model, a cost model and one path of history, never a proof, and it cannot see your own market impact, your queue position, a regime absent from the data or the bugs that only live in the live path. Four ticks are enough to show why the fill model matters: the mid rises 0.6 % and the strategy still loses.",
          "code": "tape = [(1, 100.0, 100.2), (2, 100.4, 100.6), (3, 101.0, 101.2), (4, 100.6, 100.8)]  # (t, bid, ask)\nfee, cash, pos, pending, curve = 0.003, 10_000.0, 0, [], []\nfor t, bid, ask in tape:                                       # replay on the logical clock\n    for side, q in pending:                                    # orders sent at t-1 fill now\n        px, sgn = (ask, 1) if side == \"buy\" else (bid, -1)     # a buy lifts the ask\n        cash -= sgn * q * px + q * px * fee; pos += sgn * q    # fees, then accounting\n    pending = [(\"buy\", 10)] if t == 1 else [(\"sell\", 10)] if t == 3 else []   # strategy\n    curve.append(cash + pos * (bid + ask) / 2)                 # mark to the mid\nprint(f\"P&L {curve[-1] - 10_000:+.2f} while the mid rose 0.6%\")                 # metrics\n# P&L -6.04 while the mid rose 0.6%"
        },
        {
          "title": "Start with SQL: schema, index, query plan",
          "text": "One table per message type (trades, quotes, book snapshots with their depth in a child table), both clocks and the recording order kept as columns. SQLite is a library and a file, Postgres a server with concurrent users. The query every backtest asks is one symbol in a window of time, and EXPLAIN QUERY PLAN shows the difference a composite (symbol, t) index makes: equality column first, range second, and the scan becomes a search. Measured on the whole Session 2 tape, the SQLite file is 50,081,792 bytes, and the index takes the AAPL event window at t400 from 10.4 ms to 0.02 ms; a query that reads every AAPL row gains nothing (3.7 ms without, 4.2 ms with).",
          "code": "import random, sqlite3\ndb, rng = sqlite3.connect(\":memory:\"), random.Random(4)\ndb.execute(\"CREATE TABLE quotes (seq INTEGER PRIMARY KEY, t INT, symbol TEXT, bid REAL, ask REAL)\")\ndb.executemany(\"INSERT INTO quotes VALUES (?,?,?,?,?)\",\n               [(i, i // 50, rng.choice([\"AAPL\", \"MSFT\", \"NVDA\"]), 100.0, 100.1) for i in range(200_000)])\nq = \"SELECT count(*) FROM quotes WHERE symbol = 'AAPL' AND t BETWEEN 390 AND 460\"\nprint(db.execute(\"EXPLAIN QUERY PLAN \" + q).fetchone()[-1])      # no index: read every row\ndb.execute(\"CREATE INDEX quotes_sym_t ON quotes (symbol, t)\")    # equality first, range second\nprint(db.execute(\"EXPLAIN QUERY PLAN \" + q).fetchone()[-1])\n# SCAN quotes\n# SEARCH quotes USING COVERING INDEX quotes_sym_t (symbol=? AND t>? AND t<?)"
        },
        {
          "title": "Why a row store struggles, and what kdb+ does instead",
          "text": "Tick research reads a few columns of many rows in time order, arriving as a firehose of appends. A row store reads every column of every matching row, pays an index update on every insert, scans ranges row by row, has no as-of join operator and does not compress columns. kdb+ answers with a column store: today's data in memory, history on disk in one directory per date with each table splayed into one file per column, data sorted by time within symbol, and aj, the as-of join, as a built-in. TimescaleDB, QuestDB, InfluxDB and ArcticDB each take part of that design; DuckDB's ASOF JOIN and pandas' merge_asof are the open-source analogues. On real AAPL trades from the earnings ramp the as-of match finds the ask each buyer paid, and the forward match shows the next quote instead, which is look-ahead inside a backtest.",
          "code": "import pandas as pd                                    # AAPL on the Session 2 tape, t399-t400\nquotes = pd.DataFrame({\"seq\": [20889, 20913, 20932, 20992], \"bid\": [193.94, 193.94, 193.94, 198.17],\n                       \"ask\": [194.13, 195.14, 196.06, None]})\ntrades = pd.DataFrame({\"seq\": [20912, 20931, 20942, 21026], \"price\": [194.13, 195.14, 196.06, 196.92]})\nback = pd.merge_asof(trades, quotes, on=\"seq\", direction=\"backward\")   # q: aj[`sym`time; t; q]\nfwd = pd.merge_asof(trades, quotes, on=\"seq\", direction=\"forward\")     # the NEXT quote\nprint(\"as-of ask:\", back[\"ask\"].tolist())\nprint(\"next  ask:\", fwd[\"ask\"].tolist())\n# as-of ask: [194.13, 195.14, 196.06, nan]\n# next  ask: [195.14, 196.06, nan, nan]"
        },
        {
          "title": "Parquet: the column store as a file",
          "text": "Parquet stores a table by column: rows are cut into row groups, each column of a row group is one encoded and compressed column chunk, and the footer records min/max statistics for every chunk. A reader decompresses only the columns a query names (projection) and skips every row group whose statistics cannot match the filter (predicate pushdown, which only works on data sorted by the filter column): a filter on t reads 2 of the book file's 14 row groups. The Session 2 tape is 265 MB as JSONL, 51.9 MB in SQLite and 6.7 MB as Parquet, and AAPL's mid at every tick takes 3,449.7 ms with json.loads over the JSONL, 6.3 ms from indexed SQLite and 1.8 ms from Parquet with pyarrow. DuckDB runs SQL on the files in place; they are the store the lab's backtester reads.",
          "code": "import os, tempfile, pyarrow as pa, pyarrow.parquet as pq\nn = 100_000\ntbl = pa.table({\"t\": [i // 35 for i in range(n)], \"symbol\": [(\"AAPL\", \"MSFT\", \"NVDA\")[i % 3] for i in range(n)],\n                \"mid\": [100 + (i % 997) / 100 for i in range(n)]})\npath = os.path.join(tempfile.mkdtemp(), \"quotes.parquet\")\npq.write_table(tbl, path, row_group_size=10_000)                  # 10 row groups, sorted by t\nmd = pq.ParquetFile(path).metadata\nst = [md.row_group(g).column(0).statistics for g in range(md.num_row_groups)]\nprint(\"t in [1000, 1300] can only be in row groups\", [g for g, s in enumerate(st) if s.max >= 1000 and s.min <= 1300])\nprint(\"symbol column encoding:\", md.row_group(0).column(1).encodings[-1])\n# t in [1000, 1300] can only be in row groups [3, 4]\n# symbol column encoding: RLE_DICTIONARY"
        },
        {
          "title": "Logical time vs real time",
          "text": "Every line of the tape carries event time (tick, the engine's step counter, and seq, the recording order) and processing time (ts, the wall clock when the line was written). They drift: on Oct 9 a tick lasted 1.062 s on average and anywhere from 0.54 s to 7 s, so the AAPL print at t400 arrived 12 s later than a one-tick-per-second clock predicts and t900 33 s later. Until 2026-10-09 the arena's own simulator resumed halted symbols with a wall-clock sleep, so a fast laptop stayed halted 235 ticks and a slow one 85; counted in ticks, 5 and 5. Decisions read the logical clock they are handed; the wall clock belongs at the edges (pacing, timeouts, backoff, logs).",
          "code": "ts = [0.0, 1.0, 2.16, 3.35, 4.48, 5.48, 6.48, 7.58, 8.72, 9.87, 10.52, 11.68,     # ts of t400..t419,\n      12.8, 13.86, 14.58, 15.78, 16.87, 17.97, 18.56, 19.58]                     # seconds after t400\ndef exit_tick(speed, clock):\n    hits = (i for i, s in enumerate(ts) if (i >= 15 if clock == \"ticks\" else s / speed + 0.0003 * i >= 15.9))\n    return next((f\"t{400 + i}\" for i in hits), \"not before t420\")\nfor speed in (float(\"inf\"), 5, 1):\n    print(f\"speed {speed}: on ticks {exit_tick(speed, 'ticks')}, on time.time() {exit_tick(speed, 'wall')}\")\n# speed inf: on ticks t415, on time.time() not before t420\n# speed 5: on ticks t415, on time.time() not before t420\n# speed 1: on ticks t415, on time.time() t416"
        },
        {
          "title": "Back to the backtester: one clock, honest numbers",
          "text": "The lab's backtester reads the Parquet tape and runs once per tick: apply the tick's books in seq order, fill orders due now against the first book of their symbol (latency is an integer number of ticks), deliver events, collect decisions, mark to the mid. Costs are a 0.30 % taker fee and walking the recorded depth; results are read against do-nothing and buy-and-hold, with a chronological in-sample/out-of-sample split (tuning momentum on the first half picked the setting that lost 10,313 on the second). Look-ahead is a clock violation: sig[t] * ret[t] decides with data stamped after the decision. And determinism is testable: the AAPL slice gives +505.36 with the same fill digest at speeds inf, 5 and 1, and one time.time() exit timer turns it into +902.06, +861.70 and +456.60.",
          "code": "import numpy as np, pandas as pd\nrng = np.random.default_rng(7)\npx = pd.Series(100 * np.cumprod(1 + rng.normal(0.0002, 0.01, 1500)))\nret, ma = px.pct_change(), px.rolling(40).mean()\nsig = (px > ma).astype(float)                       # long above the 40-bar SMA\nsharpe = lambda s: s.dropna().mean() / s.dropna().std() * 252 ** 0.5\nprint(f\"BUG  sig[t]   * ret[t]  Sharpe {sharpe(sig * ret):+.2f}\")\nprint(f\"FIX  sig[t-1] * ret[t]  Sharpe {sharpe(sig.shift(1) * ret):+.2f}\")\n# BUG  sig[t]   * ret[t]  Sharpe +2.38\n# FIX  sig[t-1] * ret[t]  Sharpe -0.19"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "On a desk the research loop is only as fast as the question you can ask of the history. If every question means parsing a quarter of a gigabyte of JSON, you ask three a day and stop exploring; if it costs ten milliseconds, you ask a thousand and actually test the idea. That is why tick data lives in column stores, kdb+ on most bank and HFT desks and Parquet files queried in place nearly everywhere else, while orders, positions and accounts stay in a relational database where transactions matter. Choosing the store by the shape of the work is a decision you will be asked to defend.",
          "The as-of join is the most used and most abused operation in market-data research. Every fill analysis, every markout and every transaction-cost report matches events to the quote in force, and the key and direction decide whether the answer is honest. On the Session 2 tape, joining on the tick alone hands every AAPL trade in tick 400 a one-sided book recorded after it traded; joining forward is exactly right for a post-trade markout and exactly wrong inside a backtest. Write the definition down (the lab's book_eot) and make every engine use it.",
          "Determinism is what turns a backtest into evidence. If the same tape and the same code can produce two P&Ls, a parameter search is measuring your machine, and the fastest replay, the one you run a thousand times, is the one that lies most: on the AAPL slice the wall-clock exit made +902 at full speed against +505 for the honest run. Desks enforce this by injecting the clock into the strategy, replaying recorded production days through the live code path, and comparing fill digests in CI, so that any difference between replay and live is a real difference and not an accident of timing.",
          "Costs and latency are positions you hold whether you model them or not. At the arena's 0.30 % taker fee, momentum lost 16,501 over the block through 1,187 fills, and the in-sample tuning chose the lookback that lost most out of sample. A latency of one tick decided whether event_ride caught the 36 shares offered at 197.18 during the AAPL ramp or found an empty ask side. Report P&L net of fees against baselines, count the trials you ran, and treat latency as a number of ticks you measure, because your backtest will otherwise invent exactly the trades that pay."
        ],
        "example": {
          "title": "In the arena",
          "text": "course/systematic-trading/week4_demos/backtest_parquet.py — the lab's backtester. One loop per tick of the tape, the logical clock; the strategy is told the time (now=t) and never asks the machine. The wall clock appears once, to pace a replay, and never changes what is decided.",
          "code": "for i, t in enumerate(tape.ticks):\n    if math.isfinite(speed) and t in tape.ts_at:                 # pacing only\n        wait = (tape.ts_at[t] - t0_ts) / speed - (time.time() - t0_wall)\n        if wait > 0:\n            time.sleep(wait)\n    ...\n    for ev in tape.events_at.get(t, []):                         # 3. events\n        strategy.on_event(ev, now=t)\n    for sig in strategy.on_tick(now=t, market=view, pf=pf) or []:  # 4. decisions\n        pending[t + latency].append(sig)                         #    fill at t + latency"
        }
      },
      "interview": [
        {
          "q": "What is a backtest for, and what can it not tell you?",
          "a": "It is a cheap way to falsify a strategy: replay recorded events in order, let the strategy see only the past, simulate fills and costs, and see whether it still makes money against a baseline. A loss after honest costs is strong evidence; a profit is only an estimate under the fill model, the cost model and one path of history. It cannot show your own market impact, because the recorded book never reacts to you, nor your queue position, a regime missing from the data, unmodelled latency, or the failures that only happen live, such as reconnects and rejects.",
          "level": "warm-up",
          "skill": "quant.event-driven-backtest"
        },
        {
          "q": "Row store or column store for five years of quotes, and why?",
          "a": "A column store. The workload is append-only and reads a few columns of many rows in time order, such as the bid and ask of one symbol over a window. A column store reads only those columns, compresses each one well because the values are similar, and keeps data sorted by time within symbol so a window is a contiguous slice. A row store reads every column of every matching row and pays an index update on every insert. Orders, positions and accounts are the opposite workload, small and transactional, and belong in a relational row store such as Postgres.",
          "level": "warm-up",
          "skill": "tools.column-store"
        },
        {
          "q": "Design a SQL schema for trades, quotes and book snapshots. Which indexes, and what hurts first as it grows?",
          "a": "One table per message type with typed columns: trades (seq, t, symbol, price, qty, aggressor), quotes (seq, t, symbol, bid, bid_qty, ask, ask_qty), and book snapshots with the depth in a child table keyed by (snapshot, side, level). Keep the event clock, the recording order and, separately, the wall-clock timestamp. Index (symbol, t), equality column first and range second, and check with the query plan that it searches rather than scans. What hurts first is the write path, since every insert updates every index, then the size of the exploded depth table and the cost of as-of joins written as correlated subqueries.",
          "level": "core",
          "skill": "tools.sql-tick-store"
        },
        {
          "q": "What is an as-of join? Write it two ways and name a way it silently goes wrong.",
          "a": "For each row on the left, take the last row on the right whose key is at or before it, usually by symbol: each trade gets the quote in force when it happened. In pandas it is merge_asof(trades, quotes, on='time', by='symbol', direction='backward'); in DuckDB, trades ASOF JOIN quotes ON trades.symbol = quotes.symbol AND trades.time >= quotes.time; in q, aj[`sym`time; trade; quote]. It goes wrong silently when the key is too coarse, so several quotes share a timestamp and an arbitrary one wins, when inputs are unsorted or the key dtypes differ, or when someone uses a forward match inside a backtest, which is look-ahead.",
          "level": "core",
          "skill": "tools.as-of-join"
        },
        {
          "q": "Your Parquet query filters on time and is still slow. What do you check?",
          "a": "First whether the files are sorted by the filter column: predicate pushdown skips a row group only if its min/max statistics exclude the range, and a file sorted by symbol has every row group spanning the whole day. Then whether the query names only the columns it needs, since projection is the other half of the saving. Then row-group size, since huge groups prune coarsely and tiny ones bloat the footer. Finally read the plan with EXPLAIN in DuckDB to see whether the filter and the projection were actually pushed into the Parquet scan.",
          "level": "core",
          "skill": "tools.parquet"
        },
        {
          "q": "How do you model fills and latency for a strategy that trades on scheduled news?",
          "a": "Fill at the next tick, not the decision tick, against the book recorded at that moment, walking the depth up to the limit price and dropping or resting the remainder by order type; charge the taker fee on the notional. Treat latency as an integer number of ticks and test several values, because on a thin book around an announcement the result is lumpy: on the AAPL earnings ramp an order arriving one tick after the decision filled 36 shares, while zero or two ticks found no ask under the cap. Expect one-sided books and empty levels exactly when the news hits, and never assume the mid.",
          "level": "core",
          "skill": "quant.fill-simulation"
        },
        {
          "q": "The same backtest on the same data gives a different P&L on every run. How do you find the cause?",
          "a": "Make the run reproducible enough to compare: record a digest of the fill list, rerun at two replay speeds and on two machines, and find the first fill that differs. The usual cause is a decision that reads the machine rather than the data: time.time(), datetime.now() or a sleep-based cooldown, so its length in market time depends on CPU speed. Others are unseeded randomness, iteration over an unordered container, threads racing on shared state, or parallel workers merging results in completion order. Fix it by handing the strategy the logical time and an injected clock, and keep the wall clock at the edges only.",
          "level": "senior",
          "skill": "tools.headless-sim"
        },
        {
          "q": "A researcher shows you Sharpe 3 on tick data. How do you try to break it?",
          "a": "Look for leaks first, because they are cheap to find: lag the signal by one tick and see whether the edge degrades a little or collapses, check every as-of join for its key and direction, and check that nothing reads restated or future reference data. Then the fill model: next-tick fills against recorded depth, the real fee schedule, latency in ticks, one-sided books. Then compare with baselines and count the trials behind the chosen parameters, and look at the out-of-sample block they never touched. Finally replay at two speeds and confirm the same fill digest, to rule out a wall-clock dependency.",
          "level": "senior",
          "skill": "quant.look-ahead"
        }
      ]
    },
    {
      "n": 5,
      "focus": "Midterm week: review Weeks 1–4",
      "tagline": "No lecture and no new material this Friday: the midterm covers Weeks 1–4, and the graded live block still runs in the evening.",
      "concepts": [
        {
          "title": "What the midterm covers",
          "text": "Weeks 1 to 4, and nothing after them. Week 1: the Python object model, abstract base classes, dataclasses and the UML that describes them. Week 2: concurrency — coroutines and the event loop, threads and the GIL, process pools, and which one a given component needs. Week 3: the network stack, sockets, WebSockets, wire protocols and pydantic message schemas. Week 4: backtesting and its data — the event-driven backtester, look-ahead as a clock violation, fill simulation, SQL, time-series stores and Parquet, as-of joins. Algorithmic complexity and data structures are taught after the midterm, in Week 6, and are not examined on it. The window, the rules and the format are on the Midterm Exam page on Canvas."
        },
        {
          "title": "Prepare from the checklists, not from the slides",
          "text": "Open the Week 1 to Week 4 pages of this dashboard and read every \"You can…\" sentence as a question you might be asked. Tick only the ones that are true of you today; every unticked sentence is a review item, and the chips under it name the deck slides, lab parts and homework where it was taught. Re-reading a deck front to back feels productive and is not: retrieval is what the exam measures, so practise retrieving."
        },
        {
          "title": "Then answer the interview questions out loud",
          "text": "Each of the Week 1 to Week 4 pages ends with interview questions, from warm-up to senior. Answer each one before opening the model answer, then compare. Redo the part of HW 1 to HW 4 you were least sure of, without looking at your submission, and take the Mock Midterm on Canvas under exam conditions — one sitting, no notes, timed."
        },
        {
          "title": "The live block still runs that evening",
          "text": "The season does not pause for the exam. The graded live block for season week 5 runs on Friday Oct 30 in the evening: it starts at about 20:00 CT with the usual 10-minute pre-open, the market opens at about 20:10, and the block lasts 60 minutes in total. Week 5 is the risk week — circuit breakers, stops and liquidation are live — so have your bot's risk layer in place and tested before the midterm, not after it."
        }
      ],
      "hft": {
        "paragraphs": [
          "The four weeks on the midterm are the four layers every systematic trading system is built from, in the order they depend on each other. The object model is how a strategy, a broker and a venue become interchangeable parts; concurrency is how one process listens to a market while it thinks; the wire is how those parts talk across machines; and the data and the backtester are how you decide, before risking capital, whether the thinking was any good.",
          "A desk interview tests the same layers, in the same way: not whether you remember a definition, but whether you can say what breaks when one layer is wrong. A blocking call in the event loop, a message schema that accepts junk, a backtest that reads the wall clock — each one looks fine in isolation and costs money in a live session. The midterm questions are written in that spirit.",
          "That is also why the evening's live block is not a distraction from the exam. The week-5 risk rules punish exactly the failures the midterm asks about: a bot that cannot keep up with the feed, cannot parse the venue's messages, or trades on a signal that was only ever profitable with look-ahead will meet a stop or a liquidation, and the season score records it."
        ]
      },
      "interview": []
    },
    {
      "n": 6,
      "focus": "Algorithmic complexity & data structures",
      "tagline": "Choose the container by the operation you repeat most: a heap plus a dict answers 'best bid?' in O(1) while a re-sorted list burns 475 times more for the identical answer.",
      "concepts": [
        {
          "title": "The Big-O ladder, and where constants still matter",
          "text": "Big-O says how work grows with n, ignoring constants: O(1) for a dict lookup or a deque append, O(log n) for a binary search or a heap push, O(n) for a list scan, O(n log n) for a sort, and O(n squared) for nested loops that are fine at n=100 and fatal at a million. Read it as a curve, not a stopwatch: a fast O(n) can beat a heavy O(log n) at small n, but n grows. Know the worst case too — dict is O(1) average and O(n) under pathological collisions, so you design for the common case and guard the tail.",
          "code": "import timeit\nsetup = \"d = {k: k for k in range(100_000)}; xs = list(range(100_000)); n = 99_999\"\nper = lambda stmt, num: min(timeit.repeat(stmt, setup=setup, number=num, repeat=3)) / num\nt_dict = per(\"d[n]\", 200_000)          # O(1) hash lookup\nt_scan = per(\"n in xs\", 200)           # O(n) linear scan, worst case\nprint(f\"dict {t_dict * 1e6:.3f} us   list scan {t_scan * 1e6:.1f} us   ~{t_scan / t_dict:.0f}x\")\nprint(\"O(1) beats O(n) at n=100k:\", t_dict < t_scan)\n# O(1) beats O(n) at n=100k: True",
          "deck": "Deck Week 6 · slides 5–7"
        },
        {
          "title": "Pick the container by the question you ask most",
          "text": "Four structures carry most trading code. A dict answers 'what is X?' — order id to Order, symbol to price — in O(1) average, and it is the canonical live set. A set answers 'have I seen X?' with the same hashing and no values. A deque appends and pops at both ends in O(1), and deque(maxlen=k) gives a fixed rolling window that evicts the oldest for free. A heap answers 'best of many': O(log n) push and pop, O(1) peek at the minimum. Know the trade against space as well — a lookup table buys time with memory — and that list.append is O(1) amortised because the occasional resize averages out over cheap appends.",
          "deck": "Deck Week 6 · slides 7–8"
        },
        {
          "title": "O(1) rolling statistics beat recomputing",
          "text": "on_tick fires on every price update, so recomputing a mean and variance over the full history each call is O(n) per tick and O(n squared) over a session. Keep incremental state instead. A running sum gives an O(1) mean; Welford updates mean and variance together in one pass without storing history and without the sum-of-squares cancellation that wrecks a naive variance in floating point. The lab measures it: identical variance, 515 times faster at N=2000 and 6,093 times at N=20,000 — the speedup is not a constant, it grows with session length.",
          "code": "import statistics\nclass Welford:                                 # O(1) mean + variance, one pass\n    def __init__(self): self.n = 0; self.mean = 0.0; self.m2 = 0.0\n    def update(self, x):\n        self.n += 1; d = x - self.mean\n        self.mean += d / self.n                # O(1)\n        self.m2 += d * (x - self.mean)         # stable: no sum of squares\n    def var(self): return self.m2 / (self.n - 1)\npx = [100 + (i % 97) * 0.01 for i in range(5_000)]; w = Welford()\nfor p in px: w.update(p)\nprint(\"ticks:\", w.n, \"| var matches recompute:\", abs(w.var() - statistics.variance(px)) < 1e-9)\n# ticks: 5000 | var matches recompute: True",
          "deck": "Deck Week 6 · slides 9–10"
        },
        {
          "title": "The order book is a heap plus a dict",
          "text": "A book must answer 'best price?' constantly and match by price first, then time. Scanning every resting order is O(n) on every incoming order. Two min-heaps keyed on (price, seq, order_id) give O(log n) insert and an O(1) peek at the extreme — bids negate the price, asks use it raw. seq is a monotonic arrival counter rather than a timestamp, because floats tie and counters never do, which is what makes queue position exact. A dict of live orders stays the canonical set; the heaps are only a fast index into it. Cancelling deletes from the dict alone and the stale heap entry is popped lazily on the next read, so cancels stay cheap and reads stay correct.",
          "code": "import heapq\nbids, orders = [], {}                          # min-heap index + canonical dict\nfor oid, px in enumerate([100.01, 100.03, 100.03]):\n    heapq.heappush(bids, (-px, oid, oid)); orders[oid] = px   # (-price, seq, id)\ndef best_bid():\n    while bids and bids[0][2] not in orders: heapq.heappop(bids)   # lazy delete\n    return (-bids[0][0], bids[0][2]) if bids else None\nprint(\"best bid, front order:\", best_bid())\ndel orders[1]                                  # cancel == one O(1) dict delete\nprint(\"after cancel:\", best_bid(), \"| heap entries left:\", len(bids))\n# best bid, front order: (100.03, 1)\n# after cancel: (100.03, 2) | heap entries left: 2",
          "deck": "Deck Week 6 · slide 11 · slide 18"
        },
        {
          "title": "Measure, then optimise",
          "text": "Intuition about performance is famously wrong, so profile before you touch anything. cProfile finds which function dominates across a run; timeit compares two implementations over many loops; perf_counter measures a block in situ against your per-tick budget. A careless benchmark lies, so warm up and discard the first runs, repeat and report the minimum — the minimum is the least-contaminated sample while the mean drags in OS noise — and time only the hot path with allocation hoisted out of the loop. Never benchmark n=1, and never tune a function called twice per session.",
          "code": "import timeit\nsetup = \"xs = [100.0 + i * 0.01 for i in range(20_000)]\"\nruns = timeit.repeat(\"sum(xs[-20:]) / 20\", setup=setup, number=20_000, repeat=7)\nper = [t / 20_000 * 1e6 for t in runs]\nprint(f\"min {min(per):.3f} us   mean {sum(per) / len(per):.3f} us   max {max(per):.3f} us\")\nprint(\"min <= mean (noise only ever adds time):\", min(per) <= sum(per) / len(per))\n# min <= mean (noise only ever adds time): True",
          "deck": "Deck Week 6 · slides 13–14"
        },
        {
          "title": "Latency, throughput and the tail that gets you picked off",
          "text": "Latency is the time for one operation end to end; throughput is operations per second. For a trader latency is edge, because slow means acting on stale prices; for an exchange throughput is capacity under load. They trade against each other — batching raises throughput and raises latency — so tune for the role you play. Averages hide the pain: a 5 microsecond mean with a 140 microsecond p99 means one tick in a hundred is catastrophic, and those are usually the volatile ticks that matter. Report p50, p95 and p99, and keep the p99 under your per-tick budget with room to spare.",
          "code": "import random, statistics\nrandom.seed(7)\nlat = [3.3 + random.random() for _ in range(990)]      # the quiet ticks\nlat += [140.0 + random.random() for _ in range(10)]    # the shock burst: 1 in 100\nlat.sort()\npct = lambda q: lat[min(int(q * len(lat)), len(lat) - 1)]\nprint(f\"mean {statistics.mean(lat):6.2f} us   p50 {pct(.50):5.2f} us\"\n      f\"   p95 {pct(.95):5.2f} us   p99 {pct(.99):6.2f} us\")\nprint(\"mean hides the tail:\", statistics.mean(lat) < pct(.99) / 10)\n# mean 5.15 us p50 3.77 us p95 4.26 us p99 140.04 us\n# mean hides the tail: True",
          "deck": "Deck Week 6 · slide 16"
        },
        {
          "title": "Overlapping sub-problems: memoise, or fill the table bottom-up",
          "text": "Recursion that recomputes the same sub-problem is exponential: fib(n) calls fib(n-1) and fib(n-2), the call tree has about 1.6 to the n nodes, and fib(n-2) is rebuilt over and over. Two fixes keep the algorithm and drop the repetition. Memoise: one lru_cache line stores each result by its argument, so every value is computed once, O(n) time and O(n) memory, and a repeat call is a dict lookup. Or go bottom-up: walk from the smallest sub-problem and keep only the last two values, O(n) time and O(1) memory, the shape of a streaming statistic. The costs are real. maxsize=None never evicts, the function must be pure with hashable arguments (caching a read of the order book returns stale answers), and a cold memoised call deeper than about 1,000 frames raises RecursionError. On one laptop fib(30) took about 79 ms recursively, 0.008 ms memoised and 0.003 ms iteratively.",
          "code": "import sys\nfrom functools import lru_cache\ncalls = 0\ndef fib_slow(n):                               # the definition, as code: O(1.6^n)\n    global calls; calls += 1\n    return n if n < 2 else fib_slow(n - 1) + fib_slow(n - 2)\n@lru_cache(maxsize=None)                       # same code + one decorator: O(n)\ndef fib_memo(n):\n    return n if n < 2 else fib_memo(n - 1) + fib_memo(n - 2)\ndef fib_table(n):                              # bottom-up: O(n) time, O(1) memory\n    a, b = 0, 1\n    for _ in range(n): a, b = b, a + b\n    return a\nprint(\"fib(25) =\", fib_slow(25), \"took\", calls, \"calls\")\nok = fib_table(25) == fib_memo(25)\nprint(\"memo computed\", fib_memo.cache_info().misses, \"values; table agrees:\", ok)\nfib_memo.cache_clear()\ntry: fib_memo(5_000)                           # cold call: recursion 5000 deep\nexcept RecursionError: print(\"cold fib_memo(5000): RecursionError, limit\", sys.getrecursionlimit())\nprint(\"fib_table(5000) has\", len(str(fib_table(5_000))), \"digits\")\n# fib(25) = 75025 took 242785 calls\n# memo computed 26 values; table agrees: True\n# cold fib_memo(5000): RecursionError, limit 1000\n# fib_table(5000) has 1045 digits"
        },
        {
          "title": "0/1 knapsack: allocating capital across trade ideas",
          "text": "You have a capital budget and a list of trade ideas, each with a capital need and an expected profit, each taken whole or not at all. Trying every subset is O(2 to the n): 25 ideas took about 190 ms recursively on one laptop. The DP table best[c], the best profit using capital c with the ideas seen so far, solves it in O(n*W) time and O(W) memory, where W is the budget in integer units; walk c downward so an idea is used at most once. It is pseudo-polynomial: the cost grows with the size of W, not just the number of ideas. Measure the same $250,000 in $10 units instead of $1,000 and W is 100 times larger, and so is the time (about 0.8 ms to about 104 ms for 100 ideas on one laptop). Pick the coarsest unit the sizing really needs, and remember the table needs integer weights.",
          "code": "import random\ndef trade_ideas(n, seed=3):                    # capital need in $1,000, profit in $\n    rng = random.Random(seed)\n    w = [rng.randint(5, 60) for _ in range(n)]\n    return w, [int(x * rng.uniform(8, 30)) for x in w]\ndef knapsack(weights, values, cap):            # O(n * W) time, O(W) memory\n    best = [0] * (cap + 1)\n    for w, v in zip(weights, values):\n        for c in range(cap, w - 1, -1):        # downward: each idea used once\n            best[c] = max(best[c], best[c - w] + v)\n    return best[cap]\nw, v = trade_ideas(100)\nprint(\"100 ideas, $250k budget: best profit $%d\" % knapsack(w, v, 250))\nfor scale in (1, 10, 100):                     # same money, measured in finer units\n    print(\"W = %6d  table cells = %9d\" % (250 * scale, 100 * 250 * scale))\nprint(\"same answer, W x100:\", knapsack([x * 100 for x in w], v, 25_000) == knapsack(w, v, 250))\n# 100 ideas, $250k budget: best profit $7309\n# W = 25000 table cells = 2500000\n# same answer, W x100: True"
        },
        {
          "title": "Dijkstra: the cheapest route, as long as no cost is negative",
          "text": "A market is a graph: nodes are venues, currencies or gateways, and an edge is a hop with a cost in basis points. Dijkstra answers 'cheapest way from A to B?' with a heap: pop the cheapest unsettled node, settle it for good, relax its edges. It is O((V + E) log V), and the stale-entry skip is the lazy deletion from the order book again. 'Settled for good' is the assumption, and it needs every cost to be non-negative. Add a 12 bp rebate edge and venue_A is settled at 5 bp before the cheaper path through the rebate is looked at, so Dijkstra still answers 9.0 bp while the true best is 7.0. You meet it in smart order routing, in the cheapest path between data centres, and in converting a position through the cheapest chain of instruments.",
          "code": "import heapq, math\ndef dijkstra(g, src):                          # needs every cost >= 0\n    dist, heap, done = {src: 0.0}, [(0.0, src)], set()\n    while heap:\n        d, u = heapq.heappop(heap)\n        if u in done: continue                 # stale entry: lazy deletion again\n        done.add(u)\n        for v, w in g.get(u, {}).items():\n            if v not in done and d + w < dist.get(v, math.inf):\n                dist[v] = d + w; heapq.heappush(heap, (d + w, v))\n    return dist\nnet = {\"gw\": {\"house\": 15.0, \"venue_A\": 6.0, \"dark\": 2.0}, \"dark\": {\"venue_A\": 3.0},\n       \"venue_A\": {\"fill\": 4.0}, \"house\": {\"fill\": 0.5}}\nprint(\"Dijkstra:\", dijkstra(net, \"gw\")[\"fill\"], \"bp\")\nnet[\"house\"][\"venue_A\"] = -12.0                # a rebate: true best is 15-12+4 = 7\nprint(\"with a -12 bp edge Dijkstra still says\", dijkstra(net, \"gw\")[\"fill\"], \"bp\")\n# Dijkstra: 9.0 bp\n# with a -12 bp edge Dijkstra still says 9.0 bp"
        },
        {
          "title": "Bellman-Ford: negative edges, and arbitrage as a negative cycle",
          "text": "Bellman-Ford relaxes every edge V-1 times, O(V*E), and allows negative costs. If a V-th pass still improves a distance there is a negative cycle. Arbitrage is exactly that: trading a to b at rate r multiplies your money by r, so weight each edge with -log(r), and a loop multiplies money by more than 1 exactly when its weights sum below 0. One stale GBP/EUR quote 60 bp too high, against a 2 bp spread, makes EUR to GBP to EUR worth +56 bp before fees. Measured on random graphs with about ten edges per node, doubling V roughly doubled Dijkstra and quadrupled Bellman-Ford. A detected loop is not yet a profit: fees, size at those prices and latency decide, and it may be gone before you trade.",
          "code": "import math\ndef has_arbitrage(rates):                  # Bellman-Ford on -log(rate): O(V * E)\n    edges = [(a, b, -math.log(r)) for a in rates for b, r in rates[a].items()]\n    dist = {n: 0.0 for n in rates}\n    for _ in range(len(rates)):                # pass V still improving => negative cycle\n        moved = False\n        for a, b, w in edges:\n            if dist[a] + w < dist[b] - 1e-12: dist[b] = dist[a] + w; moved = True\n    return moved\nusd = {\"USD\": 1.0, \"EUR\": 1.0860, \"GBP\": 1.2658}\nfx = {a: {b: usd[a] / usd[b] * 0.9998 for b in usd if b != a} for a in usd}   # 2 bp spread\nprint(\"consistent quotes, arbitrage:\", has_arbitrage(fx))\nfx[\"GBP\"][\"EUR\"] *= 1.006                      # one stale quote, 60 bp too high\nprint(\"stale GBP/EUR quote, arbitrage:\", has_arbitrage(fx))\nloop = fx[\"EUR\"][\"GBP\"] * fx[\"GBP\"][\"EUR\"]\nprint(\"EUR -> GBP -> EUR: x%.5f (%+.1f bp)\" % (loop, (loop - 1) * 1e4))\n# consistent quotes, arbitrage: False\n# stale GBP/EUR quote, arbitrage: True\n# EUR -> GBP -> EUR: x1.00560 (+56.0 bp)"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "A slow signal is not a signal. Prices move while you compute, so the per-tick budget is the real constraint on the signal-to-order pipeline: whatever on_tick spends is time the book had to move against the decision it is about to produce. The lab makes the cost visible without changing a single trading rule. FastBot keeps its statistics over a fixed window and runs at p50 3.33 microseconds, p99 7.38; SlowBot computes the same signal by rescanning full history and runs at p50 71.58, p99 145.04. Same fills, same edge, twenty times the latency — and SlowBot's median keeps climbing all session because its cost is O(n) in history.",
          "The order book is where the theory is load-bearing. shared/orderbook.py holds two min-heaps of (price, seq, order_id) plus a canonical dict, so best_bid measured 0.075 microseconds and stayed dead flat from 1,000 to 100,000 resting orders — a lazy heap clean followed by an O(1) peek, on the operation the venue repeats most. get_snapshot is the counterexample: it aggregates price levels by iterating _orders, so it went from 96 microseconds to 8,461 across the same range, exactly linear, and the exchange calls it on every broadcast. Knowing which of your reads is which separates a venue that holds up under load from one that does not.",
          "Tail latency is a live-risk control, not a vanity metric. The p99 arrives during a shock burst, when ticks come fastest and the book is moving most, which is precisely when a stale quote gets taken. For a market maker that is adverse selection, and it shows up in TCA as fills that sit systematically on the wrong side of the next mid: a rebate does not cover a spread you quoted against a price that no longer exists. Cancel latency has the same shape — a requote you cannot land in time is a free option you have written to the fastest taker in the session.",
          "Complexity also decides what you can honestly test. An O(n squared) per-session statistic makes a 20,000-tick backtest take twelve seconds, which is enough to stop you running the parameter sweeps and walk-forward windows that would have caught the overfit. Welford and the full recompute agree on the variance to floating-point precision; the only difference is the curve. Fast, correct hot paths are what buy you the number of honest runs, and they are the same paths week 7 goes on to distribute.",
          "The same cost discipline reaches past the book. Memoisation and a bottom-up table are how a repeated sub-problem stops being repeated, and a knapsack table allocates a fixed capital budget across all-or-nothing trade ideas in O(n*W). Graph algorithms price routes and loops: Dijkstra picks the cheapest of several venues when every cost is non-negative, and Bellman-Ford over -log(rate) edges flags a loop of quotes that multiplies money, which on the AlgoArena team venues is the same stock quoted at two prices. A detected loop is only worth trading if fees, size and latency leave something over.",
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
        },
        {
          "q": "You have a graph of venues and fees and one venue pays a rebate, a negative edge. Which shortest-path algorithm do you use, and how do you search for an arbitrage?",
          "a": "Not Dijkstra. It settles the cheapest node and never revisits it, so a negative edge reached later can leave an already-settled answer wrong: with a 12 bp rebate it still reports the 9 bp route when the true best is 7. Use Bellman-Ford, which relaxes every edge V-1 times in O(V*E) and tolerates negative costs. For arbitrage, weight each edge with -log(rate): a loop multiplies money by the product of its rates, so it is profitable exactly when its weights sum to a negative number, a negative cycle, which Bellman-Ford reports when the V-th pass still improves a distance. A found cycle is a candidate, not a profit: fees, available size at those prices and latency decide whether it survives.",
          "level": "core",
          "skill": "python.shortest-paths"
        },
        {
          "q": "A knapsack DP over your capital budget runs in O(n*W). A colleague says that is polynomial, so scale it up. What do you answer?",
          "a": "It is pseudo-polynomial: the time is polynomial in the number of ideas and in the numeric value of the budget W, but W is written in about log W bits, so in the size of the input the cost is exponential. In practice, measuring $250,000 in $10 units instead of $1,000 makes W 100 times larger and the table 100 times slower for the same problem, about 0.8 ms to about 104 ms for 100 ideas on one laptop. So I choose the coarsest unit the sizing really needs, round weights onto that grid, and budget the n*W cells of memory if I also want to recover which ideas were chosen. With real-valued sizes or a very fine grid the DP stops being the right tool.",
          "level": "senior",
          "skill": "quant.knapsack"
        }
      ]
    },
    {
      "n": 7,
      "focus": "Big data & distributed compute",
      "tagline": "Store data in columns, process it in chunks, and fan the backtest out over processes — so you can search a strategy space instead of running one config.",
      "concepts": [
        {
          "title": "The memory wall — measure before you scale",
          "text": "pandas holds the whole frame in RAM, and the in-memory footprint is routinely 2-10x the file on disk. Cross physical memory and the OS swaps: everything falls off a cliff at roughly 1000x slower. Before you reach for a cluster, measure with df.info(memory_usage='deep') or df.memory_usage(deep=True) — without deep=True pandas reports the pointer array and hides the strings entirely. Then downcast: float64 to float32, object to category. In the week-6 lab that one step took a 250 000-row snapshot frame from 25.3 MB to 7.3 MB, 3.5x smaller, almost all of it from turning 250 000 Python strings into int8 category codes.",
          "code": "import pandas as pd\nsym = [\"AAPL\", \"MSFT\", \"NVDA\", \"TSLA\", \"AMZN\"] * 20_000\nwide = pd.DataFrame({\"symbol\": sym, \"mid\": [182.5] * len(sym), \"spread\": [0.02] * len(sym)})\nlean = wide.astype({\"symbol\": \"category\", \"mid\": \"float32\", \"spread\": \"float32\"})\nw = wide.memory_usage(deep=True).sum(); l = lean.memory_usage(deep=True).sum()\nprint(\"rows\", len(wide), \"| lean at least 3x smaller:\", w > 3 * l)\nprint(\"dtypes\", lean.symbol.dtype, lean.mid.dtype, \"| codes\", lean.symbol.cat.codes.dtype)\n# rows 100000 | lean at least 3x smaller: True\n# dtypes category float32 | codes int8",
          "deck": "Deck Week 7 · slide 5"
        },
        {
          "title": "Rows versus columns — CSV against Parquet",
          "text": "How the bytes are laid out on disk decides how many of them you have to read. CSV is row-oriented text: no types, no column pruning, large on disk. Parquet is columnar, typed and compressed, so you read only the columns you touch and a column of near-identical floats compresses 5-20x with zstd or snappy. The lab measured the same tape at 61.6 MB as JSONL, 16.9 MB as CSV and 2.7 MB as Parquet, and pruning to two columns read ~28x faster than the CSV. Parquet also round-trips dtypes; CSV hands back float64 and silently undoes your downcasting. Rule: CSV to exchange with humans, Parquet for anything you re-read.",
          "code": "import os, tempfile, pandas as pd\ndf = pd.DataFrame({\"ts\": range(50_000), \"symbol\": [\"AAPL\"] * 50_000,\n                   \"mid\": [182.5] * 50_000}).astype({\"mid\": \"float32\"})\nwith tempfile.TemporaryDirectory() as d:\n    csv, pq = os.path.join(d, \"t.csv\"), os.path.join(d, \"t.parquet\")\n    df.to_csv(csv, index=False); df.to_parquet(pq, index=False)\n    two = pd.read_parquet(pq, columns=[\"ts\", \"mid\"])        # column pruning\n    print(\"parquet smaller:\", os.path.getsize(pq) < os.path.getsize(csv),\n          \"| csv returns\", pd.read_csv(csv).mid.dtype, \"| parquet keeps\", two.mid.dtype)\n    print(\"columns touched:\", list(two.columns))\n# parquet smaller: True | csv returns float64 | parquet keeps float32\n# columns touched: ['ts', 'mid']",
          "deck": "Deck Week 7 · slide 6"
        },
        {
          "title": "Chunk it, reduce as you go, carry the state",
          "text": "If the file will not fit, do not load it. Read bounded pieces — pd.read_csv(chunksize=...) or your own line blocks — and reduce each piece into an accumulator, so memory is O(chunk + state) regardless of file size. The lab computed the same per-symbol statistic at 44 MB peak RSS chunked against 229 MB loading everything. The trap is the rolling window: a 100-bar SMA must survive chunk boundaries, so the deque per symbol is carried across chunks. Drop it and the first 99 rows of every chunk get a wrong window — a silent, wrong number, not a crash. And only statistics that compose survive this pattern: (sum, count) does, a median does not.",
          "code": "import itertools\nfrom collections import deque\nsrc = (100.0 + (i % 13) * 0.5 for i in range(20_000))  # a stream, never fully in RAM\nwin, tot, n = deque(maxlen=20), 0.0, 0\nwhile blk := list(itertools.islice(src, 4_096)):       # bounded chunks\n    for px in blk:\n        win.append(px)                                 # state CARRIED across chunks\n        if len(win) == 20:\n            tot += sum(win) / 20; n += 1\nprint(\"sma samples\", n, \"| mean of 20-bar SMA\", round(tot / n, 4))\n# sma samples 19981 | mean of 20-bar SMA 103.0",
          "deck": "Deck Week 7 · slides 8–9"
        },
        {
          "title": "Scale up first, then out — and use processes",
          "text": "Vertical scaling needs no code change but has a ceiling and prices superlinearly; horizontal scaling is near-unlimited but you must partition the work and combine the results. More RAM plus smaller dtypes plus Parquet often removes the problem outright, so start there. When you do go parallel, remember the GIL: only one thread runs Python bytecode at a time, so threads buy nothing for a CPU-bound sweep. Use processes — ProcessPoolExecutor from the stdlib, with the __main__ guard, because each worker re-imports your module and without the guard it re-spawns the pool. joblib is the same idea in one line. Dask, Ray and Spark extend it across machines; this course names them and stays on one box.",
          "code": "from concurrent.futures import ProcessPoolExecutor\nimport numpy as np\ndef cycles(lookback):              # CPU-bound shard: one parameter, one process\n    s = np.sign(np.sin(np.arange(200_000) / lookback))\n    return lookback, int((np.diff(s) != 0).sum())    # deterministic per shard\nif __name__ == \"__main__\":         # mandatory: every worker re-imports this file\n    with ProcessPoolExecutor(max_workers=2) as pool:\n        par = dict(pool.map(cycles, [5, 10, 20, 40]))  # map\n    print(par)                                         # reduce\n    print(\"parallel == sequential:\", par == dict(map(cycles, [5, 10, 20, 40])))\n# {5: 12733, 10: 6367, 20: 3184, 40: 1592}\n# parallel == sequential: True",
          "deck": "Deck Week 7 · slides 11–12"
        },
        {
          "title": "Map, reduce, shard — and what will not shard",
          "text": "The mental model behind every scale-out: apply the same function to each independent piece (map), then combine the partials (reduce), with a shard key chosen so the pieces really are independent — per symbol, per date range, per parameter. Parameter sweeps and per-symbol backtests are embarrassingly parallel: nothing is shared, so you just collect results. A stateful order book is not. Matching depends on the order of arrivals, so sharding it blindly changes the answer; dependencies force coordination. Measure the win rather than assuming n_cores: the lab's byte-range map-reduce over ten shards returned 2.1x, because process start-up, pickling partials and one shared disk all take their cut.",
          "deck": "Deck Week 7 · slides 13–14"
        },
        {
          "title": "Idempotency and reproducibility under fan-out",
          "text": "Distributed jobs retry, reorder and run out of process, so correctness needs determinism and safe re-runs. Make each task idempotent by keying its output on a hash of its inputs: running it twice writes the same file and nothing is double-counted, and a resumed sweep skips what is already on disk. Make it reproducible by pinning the seed (SimSession takes seed=), the data version and the dtypes, so every worker computes the same numbers. Keep workers pure: inputs in, output out, no shared mutable state and no hidden globals. Note that the float32 win from downcasting costs you exactness — the lab's vectorised and loop versions agreed only to ~1.8e-3, so assert with a tolerance you can defend.",
          "code": "import hashlib, json\ndef key(params):                     # one output file per input set\n    blob = json.dumps(params, sort_keys=True).encode()\n    return \"sweep_\" + hashlib.sha256(blob).hexdigest()[:8] + \".parquet\"\na = key({\"lookback\": 20, \"spread\": 0.3, \"seed\": 7})\nb = key({\"seed\": 7, \"spread\": 0.3, \"lookback\": 20})   # same inputs, keys in any order\nc = key({\"lookback\": 40, \"spread\": 0.3, \"seed\": 7})\nprint(a)\nprint(\"re-run is a no-op:\", a == b, \"| new config, new file:\", a != c)\n# sweep_b2945585.parquet\n# re-run is a no-op: True | new config, new file: True",
          "deck": "Deck Week 7 · slide 15"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "Scale is what separates a strategy from a search. One backtest tells you whether one lookback worked on one tape; a sweep tells you whether the edge exists across a neighbourhood of parameters, which is the only version worth trading. That is why the week-6 deliverable is a parallel sweep with one run per configuration and a Sharpe collected per point, and why the headless sim is built to be fanned out: SimSession().run() is pure and in-process with no sockets, so twenty of them can run at once.",
          "The pipeline splits in two at a hard seam. Offline you build features — returns, rolling means, rolling vol — and cache them to Parquet; online your signal function reads the freshest rows of that frame and does arithmetic only. Get the seam wrong and you pay twice: a groupby-rolling inside on_tick blows the per-tick budget, and features computed differently offline and live give you a bot that was validated on numbers it never sees again.",
          "Reproducibility is what makes an offline result believable. A sweep that cannot be re-run to the same numbers cannot be defended: pin seed=, pin the data version, pin the dtypes, and key every output on a hash of its inputs so a retried worker overwrites itself instead of double-counting. Log every configuration you tried, too — that count is what week 8 uses to deflate the best Sharpe you found, and a sweep is a very efficient way to try hundreds of things.",
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
      "n": 8,
      "focus": "Machine learning that makes the strategy better",
      "tagline": "A model earns its place in the bot only when it beats the rule you already have — out-of-sample, in time order, after costs — so the class runs the pipeline from features to a frozen model in on_tick, and every model it climbs through is judged that way.",
      "concepts": [
        {
          "title": "Why machine learning in trading — a better strategy, not a new system",
          "text": "Machine learning is there for one reason: to make the strategy better — a better signal, better execution, better risk. In the pipeline you have built all quarter (gateway in, book, signal, execution, order management, gateway out) a model replaces or sharpens the signal or the execution-cost estimate; it never replaces the system around it. Typical uses: predict the direction or the return over the next h ticks, spot patterns in order flow, detect the regime, predict the cost of an order, score news sentiment, flag a bot that has gone wrong. Three things make it dangerous here. Signal-to-noise is tiny, so a 52% hit rate is either an edge or pure luck depending on how many trades stand behind it. Markets are non-stationary, so models rot. And your own trades feed back into the prices you learn from. The rule for the whole class: spend as much time catching yourself cheating as fitting. What this changes in your bot: nothing until a model beats your current rule out-of-sample, after costs.",
          "code": "import math\ndef z_of(hit_rate, n):                  # how many standard errors above a coin flip\n    return (hit_rate - 0.5) / math.sqrt(0.25 / n)\nfor n in (200, 2_000, 10_000):\n    print(f\"52% on {n:>6} trades: z = {z_of(0.52, n):.2f}\")\nfee_bp, edge_bp = 15.0, 4.0              # taker fee each way vs the move you predict\nprint(\"edge after a round trip (bp):\", edge_bp - 2 * fee_bp)\n# 52% on 200 trades: z = 0.57\n# 52% on 10000 trades: z = 4.00\n# edge after a round trip (bp): -26.0"
        },
        {
          "title": "Supervised vs unsupervised — two kinds of question",
          "text": "Supervised learning has an answer to learn: features X known at time t and a label y about t+h. Ask for a class (up or down, filled or not filled) and it is classification; ask for a number (the next return, the cost of an order) and it is regression. Unsupervised learning has no label: it finds structure — clustering volatility, volume and spread into market regimes, PCA for the common factors of a basket, anomaly detection on your own fills and messages to catch a bot that misbehaves. Reinforcement learning (learning an execution policy by trial and error) is a third family, out of scope here. In the arena: a classifier predicts the sign of the next 10-tick mark move; k-means on volatility and spread tells a calm book from a stressed one, which can switch your quote width or your position limit. What this changes in your bot: a supervised model becomes the signal; an unsupervised one usually becomes a switch on the rules you already have.",
          "code": "import numpy as np\nfrom sklearn.cluster import KMeans\nfrom sklearn.linear_model import LogisticRegression\nrng = np.random.default_rng(1)\ncalm  = np.c_[rng.normal(10, 2, 300), rng.normal(2, 0.5, 300)]    # vol bp, spread bp\nstorm = np.c_[rng.normal(45, 8, 100), rng.normal(9, 2.0, 100)]\nF = np.r_[calm, storm]\nregime = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(F)   # no labels\nprint(\"unsupervised regimes:\", sorted(np.bincount(regime).tolist()))\nx = rng.normal(0, 1, (400, 1)); y = (x[:, 0] + rng.normal(0, 1, 400) > 0).astype(int)\nclf = LogisticRegression().fit(x[:300], y[:300])                 # labels: up / down\nprint(\"supervised: coef > 0:\", bool(clf.coef_[0, 0] > 0),\n      \"| p(up | x=+2) > 0.8:\", bool(clf.predict_proba([[2.0]])[0, 1] > 0.8))\n# unsupervised regimes: [99, 301]\n# supervised: coef > 0: True | p(up | x=+2) > 0.8: True"
        },
        {
          "title": "Technical indicators — the feature factory, and why so many parameters",
          "text": "Technical indicators are the classical hand-made features: SMA and EMA gaps, momentum or rate of change, RSI, MACD, Bollinger z-scores, ATR or realised volatility, the distance to VWAP, order-book imbalance, the spread in basis points, trade-flow imbalance. Every one of them has windows and thresholds, and every window is a parameter: 10 indicators in 20 settings over 9 symbols is 1,800 columns before you add the model's own parameters (coefficients, depth, C, gamma, layers) and its hyperparameters. That is more columns than your data has independent information, which is exactly the curse of dimensionality and the overfitting the next cards deal with. Two rules. Shift every feature so that row t only uses what was known at t. And compute it in O(1) per tick inside on_tick with the rolling statistics from Week 6, never by recomputing a window. What this changes in your bot: pick a handful of indicators you can defend, not every setting you can generate.",
          "code": "import numpy as np, pandas as pd\nrng = np.random.default_rng(3)\npx = pd.Series(100 + np.cumsum(rng.normal(0, 0.2, 500)))\ndef rsi(p, n):\n    d = p.diff(); up = d.clip(lower=0).rolling(n).mean(); dn = (-d.clip(upper=0)).rolling(n).mean()\n    return 100 - 100 / (1 + up / dn)\nfeat = pd.DataFrame({\n    \"sma_gap_20\": px / px.rolling(20).mean() - 1,\n    \"ema_gap_10\": px / px.ewm(span=10).mean() - 1,\n    \"roc_5\": px.pct_change(5),\n    \"rsi_14\": rsi(px, 14),\n    \"boll_z_20\": (px - px.rolling(20).mean()) / px.rolling(20).std(),\n    \"rvol_20\": px.pct_change().rolling(20).std(),\n}).shift(1).dropna()                         # shift: only what was known at t\nprint(\"rows\", len(feat), \"| features\", feat.shape[1], \"| RSI in [0,100]:\",\n      bool(feat.rsi_14.between(0, 100).all()))\nindicators, settings, symbols = 10, 20, 9   # each window/threshold is a parameter\nprint(\"columns you could build:\", indicators * settings * symbols)\n# rows 479 | features 6 | RSI in [0,100]: True\n# columns you could build: 1800"
        },
        {
          "title": "The pipeline, part 1 — clean, standardise, as-of merge",
          "text": "Start with a hypothesis you write down before touching the data (\"imbalance at the touch predicts the next move\"), then choose the data and its granularity: arena tapes, the history zips, news and events. Cleaning comes first: drop duplicate timestamps, turn impossible values (a negative mid, a crossed book) into missing ones, fill gaps from the past only, fix types and align the clocks of the different streams. Standardise features (z-score, or a robust median/IQR scale) with statistics fitted on the training slice only, then apply those numbers to validation and test. Merge on time with an as-of join that only looks backward: each tick gets the latest news score, event or book state that already existed, never the next one. A single forward-looking merge is enough to produce a beautiful and worthless backtest. What this changes in your bot: the feature function you write here is the one the bot calls live, so the cleaning and the scaling must be the same code.",
          "code": "import numpy as np, pandas as pd\nfrom sklearn.preprocessing import StandardScaler\nticks = pd.DataFrame({\"ts\": pd.to_datetime([1, 2, 2, 3, 4, 5, 6, 7], unit=\"s\"),\n                      \"mid\": [100.0, 100.1, 100.1, -1.0, 100.3, np.nan, 100.2, 100.4]})\nticks = ticks.drop_duplicates(\"ts\").reset_index(drop=True)     # 1. duplicates\nticks.loc[ticks.mid <= 0, \"mid\"] = np.nan                       # 2. impossible values\nticks[\"mid\"] = ticks.mid.ffill()                                # 3. gaps: last known, never next\nnews = pd.DataFrame({\"ts\": pd.to_datetime([2.5, 5.5], unit=\"s\"), \"sent\": [0.8, -0.6]})\nm = pd.merge_asof(ticks, news, on=\"ts\", direction=\"backward\")   # 4. as-of: no future rows\nprint(\"sentiment as of each tick:\", m.sent.fillna(0).tolist())\nX = m[[\"mid\"]].to_numpy(); cut = 4\nsc = StandardScaler().fit(X[:cut])                              # 5. fit on TRAIN only\nprint(\"train mean\", round(float(sc.mean_[0]), 3), \"| test z\", sc.transform(X[cut:]).round(1).ravel().tolist())\n# sentiment as of each tick: [0.0, 0.0, 0.8, 0.8, 0.8, -0.6, -0.6]"
        },
        {
          "title": "The pipeline, part 2 — cross-validate in time, then measure",
          "text": "Random K-fold lies on time series: neighbouring rows have near-identical features and labels that overlap over the horizon, so shuffling puts each test row's twin in the training set. Use time splits instead — walk-forward folds, with the rows that straddle each boundary purged and an embargo of h rows after it (sklearn's TimeSeriesSplit(gap=h)). Train, choose hyperparameters on validation folds, and touch the test block once. Then measure with metrics chosen for the question. Classification: accuracy, precision and recall, F1, ROC-AUC, log-loss, the confusion matrix. Regression: MSE or RMSE, MAE, R squared out-of-sample. Trading: hit rate, P&L after fees and spread, Sharpe, turnover, maximum drawdown, capacity. Always against baselines first — always-up and the momentum rule. The snippet runs on a random walk, where the honest answer is no edge; note that even one honest test block can print an AUC of 0.6 by luck, which is why you report several folds and their dispersion. What this changes in your bot: you only ship what wins walk-forward against the baseline.",
          "code": "import numpy as np\nfrom sklearn.model_selection import KFold, TimeSeriesSplit, cross_val_score\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.metrics import precision_score, recall_score, roc_auc_score\nrng = np.random.default_rng(0)\nmid = 100 + np.cumsum(rng.normal(0, 0.05, 4000))      # random walk: there is NO edge\nh, t = 50, np.arange(200, 3950)\nX = np.c_[mid[t] / mid[t - 100] - 1, mid[t] / mid[t - 200] - 1]\ny = (mid[t + h] > mid[t]).astype(int)                 # neighbours share most of a label\nknn = KNeighborsClassifier(n_neighbors=1)\nshuf = cross_val_score(knn, X, y, cv=KFold(5, shuffle=True, random_state=0)).mean()\npurged = cross_val_score(knn, X, y, cv=TimeSeriesSplit(5, gap=h)).mean()   # gap = embargo\nprint(\"shuffled K-fold\", round(shuf, 2), \"| time split + gap\", round(purged, 2))\nprint(\"shuffled CV lies:\", shuf - purged > 0.1)\ncut = 3000; p = knn.fit(X[:cut - h], y[:cut - h]).predict(X[cut:])         # test once\nprint(\"precision\", round(precision_score(y[cut:], p), 2), \"| recall\",\n      round(recall_score(y[cut:], p), 2), \"| AUC\", round(roc_auc_score(y[cut:], p), 2))\n# shuffled K-fold 0.68 | time split + gap 0.53\n# shuffled CV lies: True"
        },
        {
          "title": "The curse of dimensionality — and its remedies",
          "text": "Add columns and the space empties out: the volume of the hypercube grows exponentially, distances between points concentrate (the nearest and the farthest neighbour look alike), and the number of rows you need to cover the space explodes. In finance n is small and noisy, so this bites early. Three remedies. Shrinkage: ridge (L2) pulls every weight towards zero, lasso (L1) sets most of them to exactly zero and so selects features, elastic net mixes both. PCA rotates the basis to the directions of largest variance (an SVD): on the arena basket the first component is the market factor and the next ones are eigen-portfolios; the scree plot tells you how many to keep. LDA is the supervised cousin: the projection that best separates the classes rather than the one that keeps the most variance. Feature selection keeps original columns; feature extraction builds new ones. What this changes in your bot: fewer, better inputs, and a penalty chosen by time-aware cross-validation.",
          "code": "import numpy as np\nfrom sklearn.linear_model import Ridge, Lasso\nfrom sklearn.decomposition import PCA\nfrom sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA\nrng = np.random.default_rng(4)\nfor d in (2, 100, 1000):                      # distances concentrate as d grows\n    D = np.linalg.norm(rng.random((200, d)) - rng.random(d), axis=1)\n    print(f\"d={d:>4}  (max-min)/min distance = {(D.max() - D.min()) / D.min():.2f}\")\nn, p = 120, 60                                # few rows, many indicator columns\nX = rng.normal(size=(n, p)); y = 0.5 * X[:, 0] - 0.3 * X[:, 1] + rng.normal(0, 1, n)\nprint(\"lasso keeps\", int((Lasso(alpha=0.1).fit(X, y).coef_ != 0).sum()), \"of\", p,\n      \"| ridge keeps\", int((Ridge(alpha=10).fit(X, y).coef_ != 0).sum()))\nmkt = rng.normal(0, 1, (500, 1))              # one common factor drives 9 symbols\nR = mkt + 0.5 * rng.normal(0, 1, (500, 9))\nprint(\"PC1 explains > 70% of the basket:\", bool(PCA().fit(R).explained_variance_ratio_[0] > 0.7))\nlab = (R[:, 0] - R[:, 1] > 0).astype(int)     # LDA: the projection that separates labels\nprint(\"LDA separates the classes:\", bool(LDA().fit(R, lab).score(R, lab) > 0.9))\n# lasso keeps 19 of 60 | ridge keeps 60\n# PC1 explains > 70% of the basket: True\n# LDA separates the classes: True"
        },
        {
          "title": "Linear models, and the overfitting picture",
          "text": "Ordinary least squares has a closed form, t-statistics and an R squared — and the in-sample R squared always flatters you, so report it out-of-sample. Logistic regression puts the same linear score through a sigmoid and is fitted on log-loss; its output is a probability you can threshold and size with, provided it is calibrated. The overfitting picture is the one to remember: fit polynomials of degree 1 to 15 on noisy data and the training error falls every time while the test error turns up; the same U appears when the ridge penalty goes to zero. Test error is bias plus variance plus irreducible noise, and in markets the noise term is most of it. Limits of a line: interactions (up only when two features agree), regime changes, outliers, noise that changes with volatility. What this changes in your bot: a logistic regression on a few standardised features is the first model to beat, and often the one you keep.",
          "code": "import numpy as np\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import PolynomialFeatures, StandardScaler\nfrom sklearn.linear_model import LinearRegression, LogisticRegression\nfrom sklearn.metrics import mean_squared_error as mse\nrng = np.random.default_rng(5)\nx = rng.uniform(-1, 1, (60, 1)); y = 0.8 * x[:, 0] + rng.normal(0, 0.3, 60)\nxt = rng.uniform(-1, 1, (500, 1)); yt = 0.8 * xt[:, 0] + rng.normal(0, 0.3, 500)\ntr, te = [], []\nfor deg in (1, 3, 15):                       # more parameters: train error always falls\n    m = make_pipeline(PolynomialFeatures(deg), StandardScaler(), LinearRegression()).fit(x, y)\n    tr.append(mse(y, m.predict(x))); te.append(mse(yt, m.predict(xt)))\n    print(f\"degree {deg:>2}: train {tr[-1]:.3f}  test {te[-1]:.3f}\")\nprint(\"train falls:\", tr[0] > tr[1] > tr[2], \"| test U-turns:\", te[2] > te[0])\nup = (y > 0).astype(int)\np = LogisticRegression().fit(x, up).predict_proba([[0.5]])[0, 1]   # a probability you can size with\nprint(\"P(up | x=0.5) between 0.5 and 1:\", 0.5 < p < 1)\n# degree 15: train 0.047 test 0.116\n# train falls: True | test U-turns: True\n# P(up | x=0.5) between 0.5 and 1: True"
        },
        {
          "title": "Non-linear models — trees, forests, boosting, SVMs, neural nets",
          "text": "A decision tree splits on the feature and threshold that reduce impurity most; depth and minimum leaf size are its overfitting knobs, and its rules can be read. A random forest averages many deep trees, each on a bootstrap sample with a random subset of features: lower variance, an out-of-bag error for free, feature importance, and it trains in parallel. Gradient boosting fits trees one after the other on the residuals of the ensemble so far, with a learning rate and early stopping (sklearn's HistGradientBoosting); because each tree needs the previous one, it parallelises badly across trees. A support vector machine maximises the margin, C trades margin for errors, and a kernel (polynomial, RBF with gamma) separates data that no line can, without building the features. A multilayer perceptron stacks layers and activations trained by backpropagation over epochs; learning curves, early stopping and dropout keep it honest, and it needs far more data than 500 noisy bars — it shines on images and text. Climb this ladder one rung at a time, on the same features and the same walk-forward, and watch the cost per prediction. What this changes in your bot: a non-linear model earns its place only when it beats the logistic and the momentum baseline out-of-sample.",
          "code": "import numpy as np, time\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier\nfrom sklearn.svm import SVC\nfrom sklearn.neural_network import MLPClassifier\nrng = np.random.default_rng(6)\nX = rng.uniform(-1, 1, (1200, 2))            # an interaction: up only when the two agree\ny = ((X[:, 0] * X[:, 1] > 0) ^ (rng.random(1200) < 0.1)).astype(int)   # 10% label noise\nXtr, ytr, Xte, yte = X[:800], y[:800], X[800:], y[800:]\nmodels = {\"logistic\": LogisticRegression(),\n          \"tree d=4\": DecisionTreeClassifier(max_depth=4, random_state=0),\n          \"forest\": RandomForestClassifier(200, min_samples_leaf=5, n_jobs=-1, random_state=0),\n          \"boosting\": HistGradientBoostingClassifier(learning_rate=0.1, random_state=0),\n          \"svm rbf\": SVC(kernel=\"rbf\", C=1.0, gamma=2.0),\n          \"mlp\": MLPClassifier((16, 16), max_iter=2000, random_state=0)}\nacc = {}\nfor name, m in models.items():\n    m.fit(Xtr, ytr); t0 = time.perf_counter(); acc[name] = m.score(Xte, yte)\n    us = (time.perf_counter() - t0) / len(Xte) * 1e6\n    print(f\"{name:<9} test acc {acc[name]:.2f}   {us:6.1f} us per row, batched\")\nprint(\"no line separates XOR:\", acc[\"logistic\"] < 0.65,\n      \"| every non-linear model > 0.8:\", min(v for k, v in acc.items() if k != \"logistic\") > 0.8)\n# no line separates XOR: True | every non-linear model > 0.8: True"
        },
        {
          "title": "From model to bot — freeze, load, predict, fall back, monitor",
          "text": "Apply the whole pipeline to an arena question — the next k-tick mark move, or patterns in the house desk's flow from book and trade-flow features on the week-9 history — walk it forward in the simulator, then freeze the winner: joblib (or JSON weights) together with its feature list, horizon and version. Load it once in __init__, check the feature list on load, and predict inside on_tick within the per-tick budget. If the artifact is missing or does not match, fall back to the baseline rule and log it: never crash, never guess. Then monitor drift: score each prediction h ticks later and keep a rolling live hit rate; when it sits well below the training number, stop trusting the model and retrain on a fixed cadence or on that trigger. Judge it the only way that counts — P&L after fees against the momentum baseline. What this changes in your bot: this card is the bot; the Week 9 block rewards a model built this way.",
          "code": "import os, tempfile, joblib, numpy as np\nfrom collections import deque\nfrom sklearn.linear_model import LogisticRegression\nFEATURES = [\"ret1\", \"mom5\", \"vol20\"]                       # one feature function, offline AND live\nrng = np.random.default_rng(9); X = rng.normal(size=(500, 3)); y = (X[:, 1] > 0).astype(int)\npath = os.path.join(tempfile.mkdtemp(), \"signal_v3.joblib\")\njoblib.dump({\"model\": LogisticRegression().fit(X, y), \"features\": FEATURES, \"version\": 3}, path)  # freeze\n\ndef load(p):                                               # once, in __init__ — never per tick\n    try:\n        art = joblib.load(p)\n        return art if art[\"features\"] == FEATURES else None   # schema check on load\n    except (OSError, KeyError, ValueError):\n        return None\nart, missing = load(path), load(path + \".gone\")\ndef decide(art, x):                                        # in on_tick\n    if art is None:\n        return \"fallback: momentum rule\"                   # never crash, never guess\n    return \"buy\" if art[\"model\"].predict_proba([x])[0, 1] > 0.6 else \"hold\"\nprint(decide(art, [0.0, 1.5, 0.2]), \"|\", decide(missing, [0.0, 1.5, 0.2]))\nhits = deque(maxlen=50); hits.extend([1] * 22 + [0] * 28)  # score each call h ticks later\nprint(\"live hit rate\", sum(hits) / len(hits), \"| drift alarm:\", sum(hits) / len(hits) < 0.5)\n# buy | fallback: momentum rule\n# live hit rate 0.44 | drift alarm: True"
        },
        {
          "title": "Unstructured data — from news to a sentiment feature",
          "text": "Text becomes a signal through the same pipeline. Start from the raw item — a headline, a filing, a post, or the arena's own news and event messages — and extract metadata: the time you received it (not the time printed on it), the source, the tickers and entities, the topic, the language, and a dedup key, because the same story arrives several times. Score it: a finance word list in the Loughran-McDonald style is transparent and fast; a transformer classifier reads context. As-of merge the scores with prices, run an event study (the return in the window after the item) to see whether the score means anything, and only then build a feature — a sentiment per symbol that decays with a half-life. Licensing matters: vendor news usually forbids training on it, while EDGAR, RSS feeds and public headlines are free. What this changes in your bot: one more feature known at t, judged by the same walk-forward as the others.",
          "code": "import math, re\nPOS = {\"beat\", \"beats\", \"raises\", \"upgrade\", \"record\", \"surge\"}      # Loughran-McDonald style lists\nNEG = {\"miss\", \"misses\", \"warning\", \"downgrade\", \"probe\", \"cuts\", \"recall\"}\nnews = [(100, \"Reuters\", \"NVDA beats estimates, raises guidance\"),\n        (160, \"PR wire\", \"TSLA recall widens; analysts downgrade\"),\n        (170, \"Reuters\", \"NVDA beats estimates, raises guidance\")]  # a duplicate story\nseen, feed = set(), []\nfor ts, src, text in news:                                         # 1. metadata + dedup\n    if text in seen:\n        continue\n    seen.add(text)\n    words = re.findall(r\"[a-z]+\", text.lower())\n    score = (sum(w in POS for w in words) - sum(w in NEG for w in words)) / len(words)\n    feed.append({\"ts\": ts, \"src\": src, \"ticker\": text.split()[0], \"score\": round(score, 3)})\nprint([(f[\"ticker\"], f[\"score\"]) for f in feed])\ndef decayed(ticker, now, half_life=60.0):                          # 2. the feature at tick `now`\n    return sum(f[\"score\"] * 0.5 ** ((now - f[\"ts\"]) / half_life)\n               for f in feed if f[\"ticker\"] == ticker and f[\"ts\"] <= now)   # as-of: no future news\nprint(\"NVDA at t=160:\", round(decayed(\"NVDA\", 160), 3), \"| TSLA at t=150:\", decayed(\"TSLA\", 150))\n# [('NVDA', 0.4), ('TSLA', -0.4)]\n# NVDA at t=160: 0.2 | TSLA at t=150: 0"
        },
        {
          "title": "Fine-tuning a transformer on financial headlines",
          "text": "An off-the-shelf sentiment model is trained on movie reviews and gets finance wrong: \"profit warning\" and \"beat estimates\" are not in its world. Fine-tuning fixes that cheaply: take a pretrained DistilBERT (about 66 million parameters), put a new classification head on it for negative, neutral and positive, freeze the pretrained body and train only the head (about 0.6 million parameters) on a few hundred labelled financial headlines — optionally unfreezing the last layers. Compare held-out accuracy before and after, and look for the sentences that flip. On a laptop CPU it takes minutes. In production you would start from a finance-specific model such as FinBERT. What this changes in your bot: a sentiment score that understands the vocabulary of the market — still one feature among others, still validated in time. The snippet runs offline: it uses only cached weights, and skips the transformer part if the library or the weights are not there.",
          "code": "import os; os.environ.setdefault(\"HF_HUB_OFFLINE\", \"1\")   # cached weights only, no download\nH, LABELS = 768, 3                                          # DistilBERT width; neg / neutral / pos\nhead = (H * H + H) + (H * LABELS + LABELS)                  # pre_classifier + classifier\ntry:\n    from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline\n    sst2 = pipeline(\"sentiment-analysis\",                   # off the shelf: movie reviews, not markets\n                    model=\"distilbert/distilbert-base-uncased-finetuned-sst-2-english\")\n    print(\"sst-2 says:\", [r[\"label\"] for r in sst2([\"profit warning\", \"beat estimates\"])])\n    name = \"distilbert-base-uncased\"\n    tok = AutoTokenizer.from_pretrained(name)\n    model = AutoModelForSequenceClassification.from_pretrained(name, num_labels=LABELS)\n    for p in model.distilbert.parameters():                 # freeze the pretrained body ...\n        p.requires_grad = False\n    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)\n    assert trainable == head                                # ... train only the new head\n    batch = tok([\"profit warning\", \"beat estimates\"], padding=True, return_tensors=\"pt\")\n    print(\"logits shape\", tuple(model(**batch).logits.shape))   # (2 headlines, 3 classes)\nexcept ImportError:\n    print(\"transformers not installed (optional, for Part 8)\")\nexcept Exception as e:                                      # e.g. weights not in the local cache\n    print(\"transformer skipped offline:\", type(e).__name__)\nprint(\"trainable head params\", head, \"of ~66M\")\n# trainable head params 592899 of ~66M"
        }
      ],
      "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
          "Machine learning changes the signal, not the system. Your sizing, stops, position limits and routing stay as they are, and the seam is the one you have used all quarter: on_tick in the SDK returns a Signal or None. A model plugs in there — features computed from the market and the portfolio, one predict call, a threshold that turns a probability into an order. Everything expensive (cleaning, fitting, cross-validation) happens offline; on the tick you only do arithmetic.",
          "Honesty is the deliverable. Returns are mostly noise, so a 52% out-of-sample hit rate over thousands of trades can be excellent while a 90% in-sample one is worthless. Split in time, purge and embargo the horizon, walk forward, report the mean and the dispersion across folds, and look at the test block once. Two controls catch most mistakes: shuffle the labels (the score must collapse to a coin flip) and run on a random walk (the honest answer is no edge).",
          "Costs decide whether an edge exists. A model that is right 55% of the time and flips its view every tick pays the taker fee and the spread on both legs, which on the arena's default schedule is tens of basis points per round trip against an edge measured in single digits. Make the label cost-aware, score turnover next to Sharpe, and always compare with the momentum baseline after fees: many models are alpha in a backtest and transaction cost live.",
          "Serving is risk management. Load the frozen model once, validate its feature list, and keep a fallback rule for the moment the file is missing or wrong; time predict against the per-tick budget and the order quota, because a model that blocks the loop misses the market it predicted. Then watch it: a rolling live hit rate scored h ticks after each call is the cheapest drift alarm there is, and a retrain cadence decided in advance beats a retrain decided in a panic.",
          "The Week 9 block (Fri Dec 4) is built for exactly this pipeline: the house desk's flow contains patterns a model can learn, and the 200 simulated sessions in the week-9 history are the training data. Nobody is told the rule. Build features from the book and the trade flow, walk them forward, freeze the model, and let the block judge it on P&L after fees."
        ],
        "example": {
          "title": "In the arena",
          "text": "arena/trader.py defines the Trader base: on_tick(market, portfolio) returns a Signal or None, market exposes symbols(), prices(), mid_price(), best_bid()/best_ask() and spread(), portfolio exposes can_buy()/can_sell(). The bot below lives in team/trader.py: it loads a frozen sklearn Pipeline (scaler fitted on train plus a classifier) once in __init__, falls back to the momentum rule when the artifact is missing or its feature list does not match, scores each of its own calls H ticks later, and stops firing when the live hit rate drifts below a coin flip.",
          "code": "# team/trader.py — a frozen sklearn model, loaded once, with a fallback\nfrom collections import deque\nimport joblib, numpy as np\nfrom arena import Trader, Signal\n\nFEATURES = [\"ret1\", \"mom5\", \"mom10\", \"vol20\", \"spread_bp\"]   # the SAME function offline\nH = 10                                                       # the label's horizon, in ticks\n\ndef features(px, spread, mid):\n    p = np.asarray(px[-21:], float); r = p[1:] / p[:-1] - 1\n    return [r[-1], p[-1] / p[-6] - 1, p[-1] / p[-11] - 1, r.std(), spread / mid * 1e4]\n\nclass MLTrader(Trader):\n    def __init__(self, path=\"models/signal_v3.joblib\"):\n        try:                                        # load ONCE, never in on_tick\n            art = joblib.load(path)\n            self.model = art[\"model\"] if art[\"features\"] == FEATURES else None\n        except (OSError, KeyError, ValueError):\n            self.model = None                       # missing or mismatched -> fallback\n        self.pending, self.hits = deque(), deque(maxlen=100)\n\n    def on_tick(self, market, portfolio):\n        for _ in range(len(self.pending)):          # drift: score each call H ticks later\n            sym, mid0, age = self.pending.popleft()\n            if age < H:\n                self.pending.append((sym, mid0, age + 1))\n            elif market.mid_price(sym):\n                self.hits.append(market.mid_price(sym) > mid0)\n        live_ok = len(self.hits) < 50 or sum(self.hits) / len(self.hits) >= 0.5\n        for sym in market.symbols():\n            px, spread, mid = market.prices(sym), market.spread(sym), market.mid_price(sym)\n            ask = market.best_ask(sym)\n            if len(px) < 21 or not spread or not mid or not ask:\n                continue\n            if self.model is None:                  # fallback: the momentum baseline\n                p_up = 0.7 if px[-1] > px[-11] else 0.3\n            else:                                   # a Pipeline: scaler fitted on train only\n                p_up = float(self.model.predict_proba([features(px, spread, mid)])[0, 1])\n            if p_up > 0.6 and live_ok and portfolio.can_buy(sym, 2, ask):\n                self.pending.append((sym, mid, 0))\n                return Signal(symbol=sym, side=\"buy\", quantity=2, price=ask, confidence=p_up)\n        return None"
        }
      },
      "interview": [
        {
          "q": "Name one supervised and one unsupervised use of machine learning in a trading bot, and say where each plugs in.",
          "a": "Supervised: predict the sign of the mid move over the next h ticks from features known at t — a classifier whose probability becomes the signal in on_tick. Unsupervised: cluster volatility, volume and spread into regimes with k-means and use the regime as a switch on rules you already have (a wider quote, a smaller position limit). Supervised needs labels about the future; unsupervised needs none and usually changes parameters rather than placing orders.",
          "level": "warm-up",
          "skill": "quant.supervised-setup"
        },
        {
          "q": "The kernel trick in one sentence — and what C and gamma do in an RBF SVM.",
          "a": "The kernel trick computes inner products in a high-dimensional feature space directly from the original inputs, so a linear max-margin classifier there draws a non-linear boundary here without ever building those features. C is the price of a margin violation: large C fits the training set tightly (low bias, high variance), small C accepts errors for a wider margin. Gamma is the RBF's reach: large gamma makes each point's influence local and the boundary wiggly, small gamma makes it smooth. Both are chosen by time-aware cross-validation.",
          "level": "warm-up",
          "skill": "quant.svm-kernels"
        },
        {
          "q": "Your classifier scores 0.68 with shuffled 5-fold cross-validation and 0.53 with a time split. Which do you believe, and why does shuffled CV lie here?",
          "a": "The time split. With a horizon of h ticks, neighbouring rows have nearly identical features and labels that overlap over most of the window, so a shuffled fold puts each test row's near-twin in the training set and the model recognises it instead of predicting. Split chronologically, purge the rows whose labels straddle the boundary and embargo h rows after it (TimeSeriesSplit(gap=h) is the minimum). The gap between the two numbers is the size of the leak; on a random walk 0.53 is roughly the honest answer.",
          "level": "core",
          "skill": "quant.walk-forward"
        },
        {
          "q": "Explain the bias-variance trade-off with the model you would fit in a trading bot.",
          "a": "Expected test error is bias squared plus variance plus irreducible noise. A logistic regression on three features has high bias (it cannot bend) and low variance (it barely changes when the data does); a deep tree or a degree-15 polynomial has low bias and huge variance, so training error falls while test error turns up. In markets the noise term dominates, so variance is the enemy: regularise, keep few features, prefer the simpler model unless the complex one wins walk-forward, and read the train-test gap as the overfitting meter.",
          "level": "core",
          "skill": "quant.overfitting"
        },
        {
          "q": "When does a decision tree beat a logistic regression, and when does it lose?",
          "a": "A tree wins when the signal is an interaction or a threshold — buy only when imbalance is high and the spread is tight, an XOR-shaped rule no single line can draw — or when features have very different scales and outliers, which a tree does not care about. It loses when the relationship is smooth and roughly linear in noisy data: the tree spends splits fitting noise, its predictions are step functions, and its variance is high. That is why the forest (averaging) and boosting (small steps) exist, and why the logistic stays the baseline.",
          "level": "core",
          "skill": "quant.decision-tree"
        },
        {
          "q": "Why does a random forest parallelise well and gradient boosting badly?",
          "a": "A forest's trees are independent — each sees its own bootstrap sample and feature subset — so they can be grown on every core at once and averaged at the end. Boosting is sequential by construction: tree k is fitted to the residuals of trees 1 to k-1, so it cannot start until the previous one is done. Implementations parallelise inside a tree (histogram building over features and rows, which is what HistGradientBoosting does), but not across trees. The trade-off: boosting usually wins on accuracy per tree, the forest on wall-clock training and robustness.",
          "level": "core",
          "skill": "quant.boosting"
        },
        {
          "q": "PCA versus LDA on the same feature set: what does each keep?",
          "a": "PCA is unsupervised: it rotates to the orthogonal directions of largest variance and keeps the first few, regardless of the labels — on a basket of returns the first component is the market factor. LDA is supervised: it finds the projection that maximises the distance between class means relative to the spread within classes, at most one fewer dimension than there are classes. A high-variance direction can be useless for prediction and a low-variance one can carry the signal, so PCA compresses and LDA discriminates; fit both on the training slice only.",
          "level": "core",
          "skill": "quant.pca-lda"
        },
        {
          "q": "For a buy signal, do you care more about precision or recall, and how do you set the threshold?",
          "a": "Usually precision: every positive is a trade that pays fees and the spread, so a false positive costs real money while a missed opportunity costs nothing but the edge you did not take. Recall matters when missing the move is expensive (a hedge, a stop). Rather than 0.5, set the threshold on the validation folds by maximising P&L after costs or a precision floor, read the precision-recall curve rather than accuracy, and check the threshold is stable across folds; then confirm on the untouched test block.",
          "level": "core",
          "skill": "quant.signal-scoring"
        },
        {
          "q": "Your fine-tuned headline model is live in a bot. What exactly changed when you fine-tuned, and what can still go wrong?",
          "a": "Fine-tuning added a new classification head for negative, neutral and positive on top of a pretrained DistilBERT and updated its weights (and optionally the last transformer layers) on our labelled financial headlines; the tokenizer, the vocabulary and most of the 66 million body weights are unchanged, so the model now maps finance phrases like 'profit warning' to the right class. What can go wrong: a few hundred labels overfit, so measure on held-out headlines; the score is only a feature, so it still needs an as-of merge on the time received and an event study; inference is milliseconds, so score asynchronously off the tick path; and the training text must be licensed for training.",
          "level": "senior",
          "skill": "quant.fine-tuning"
        },
        {
          "q": "Walk me through serving a model inside on_tick, from the file on disk to the drift alarm.",
          "a": "Offline, freeze the fitted pipeline (scaler plus model) with its feature list, horizon and version. In __init__, load it once, check the feature list against the feature function the bot uses — the same code that built the training set — and on any failure fall back to the baseline rule and log it. In on_tick, compute the features in O(1), call predict_proba once, threshold, and keep the call inside the per-tick budget and the message quota. Store each prediction, score it h ticks later, and keep a rolling live hit rate; if it sits two standard errors below the validation number for a session, stop trading the model, retrain on a rolling window and keep the previous artifact for a one-line rollback.",
          "level": "senior",
          "skill": "quant.model-ops"
        }
      ]
    },
    {
      "n": 9,
      "focus": "CI/CD, testing & the live system",
      "tagline": "A green run on your laptop proves nothing, and parts that pass their own tests prove little more: the bar is a seeded, network-free suite on a clean runner, then parts that honour each other's contracts while the leaderboard scores risk rather than return.",
      "concepts": [
        {
          "title": "Push the logic down the pyramid, and read the coverage report",
          "text": "Many fast unit tests at the base, a few integration tests above them, a handful of end-to-end runs at the top. A unit test drives one function with no I/O in milliseconds; an integration test wires a couple of pieces together with no network; an end-to-end run drives a whole session and tells you that something broke rather than what. The numbers make the argument: the platform's suite is 1,286 tests in about 20 seconds, and test_orderbook.py plus test_arena_sdk.py alone is 82 tests in 0.13 seconds. Coverage then tells you where the holes are, not how good the tests are — it proves execution, not correctness, so the Missing column is the useful part. Where to aim high is a design decision: shared/orderbook.py is held at 100% because a wrong fill corrupts every downstream P&L.",
          "deck": "Deck Week 9a · slides 5, 10"
        },
        {
          "title": "A test is a function, an assert, and a name",
          "text": "pytest collects files named test_*.py and functions named test_*, then runs them and rewrites plain asserts into rich failure diffs. Name the test after the behaviour it pins, not the function it calls: test_momentum_goes_long_on_uptrend tells you what broke from the failure line alone. One behaviour per test. The discovery loop below is the whole mechanism in two lines — find the callables whose names start with test_, call them, and let an AssertionError be the failure.",
          "code": "def momentum(prices, lookback=10, band=0.002):        # pure: no I/O, no clock\n    if len(prices) < lookback + 1: return 0\n    chg = prices[-1] / prices[-lookback - 1] - 1.0\n    return 1 if chg > band else (-1 if chg < -band else 0)\n\ndef test_long_on_uptrend(): assert momentum([100 + i * .5 for i in range(30)]) == 1\ndef test_flat_on_no_trend(): assert momentum([100.0] * 30) == 0\n\nfor name, fn in sorted(globals().items()):\n    if name.startswith(\"test_\"): fn(); print(name, \"passed\")\n# test_flat_on_no_trend passed\n# test_long_on_uptrend passed",
          "deck": "Deck Week 9a · slide 6"
        },
        {
          "title": "Fixtures and parametrize make the input space visible",
          "text": "A fixture is reusable setup injected by argument name and torn down per test — use one instead of a module-level Portfolio(10_000), or test four fails because test two spent the cash and the failure moves when you reorder. @pytest.mark.parametrize runs one test over a table of inputs and reports each case as its own pass or fail, so a red run names the input that broke. Parametrize is not about saving typing; you read the coverage of a behaviour straight off the decorator. The cases that matter are the boring ones — [100.0, 101.0] for not enough history, [] for a cold start or an empty book.",
          "code": "def momentum(prices, lookback=10, band=0.002):\n    if len(prices) < lookback + 1: return 0          # cold start: no view\n    chg = prices[-1] / prices[-lookback - 1] - 1.0\n    return 1 if chg > band else (-1 if chg < -band else 0)\n\ncases = [([100 + i * .5 for i in range(30)], 1), ([100.0] * 30, 0),\n         ([100 - i * .5 for i in range(30)], -1), ([100.0, 101.0], 0), ([], 0)]\nbad = [(p[:2], want, momentum(p)) for p, want in cases if momentum(p) != want]\nprint(f\"{len(cases) - len(bad)}/{len(cases)} cases pass\", bad)\n# 5/5 cases pass []",
          "deck": "Deck Week 9a · slide 7"
        },
        {
          "title": "Mock the boundary, test the logic",
          "text": "Never touch the real network in a unit test. A mock records calls and returns whatever you configured, a fake is a small working implementation, and monkeypatch swaps an attribute at runtime and puts it back afterwards. Prefer the hand-written fake at a boundary you own: nine lines, no library, and it fails loudly when the real interface changes, whereas a mock that return_values everything passes forever — including after you break the code. Coroutines need an explicit @pytest.mark.asyncio in this repo, because there is no pytest.ini and therefore no asyncio_mode; without the marker pytest calls the function, gets a coroutine it never awaits, and reports a pass.",
          "code": "import asyncio\nclass FakeMarket:                              # a hand-written fake, not a mock\n    def best_bid(self, s): return None         # the market maker just died\n    def best_ask(self, s): return None\ndef edge(market, sym):\n    bid, ask = market.best_bid(sym), market.best_ask(sym)\n    return None if not (bid and ask) else ask - bid\nasync def test_no_order_on_a_dead_book():\n    await asyncio.sleep(0)                     # a real await\n    assert edge(FakeMarket(), \"AAPL\") is None; print(\"dead book -> no order\")\nasyncio.run(test_no_order_on_a_dead_book())\n# dead book -> no order",
          "deck": "Deck Week 9a · slide 8"
        },
        {
          "title": "Determinism is what makes CI possible",
          "text": "A flaky test is worse than no test: one failure in twenty runs trains the team to ignore red, which defeats the point of having a gate. Three sources, three fixes — seed the randomness, keep the network out, and pass the clock and the ids in rather than calling datetime.now() or uuid4() deep in a decision path. SimSession.run(seed=3) does the first of those for a whole season, which is why two runs must produce identical leaderboards. And this is not hygiene for its own sake: a CI runner has no internet by design, so a deterministic, network-free session is the only end-to-end test the pipeline can execute.",
          "code": "import random\n\ndef session(seed=None):\n    if seed is not None: random.seed(seed)\n    return [round(100 + random.gauss(0, 1), 4) for _ in range(5)]\n\nprint(\"seeded runs agree :\", session(3) == session(3))\nrandom.seed(0); a, b = session(), session()\nprint(\"unseeded runs agree:\", a == b)\n# seeded runs agree : True\n# unseeded runs agree: False",
          "deck": "Deck Week 9a · slide 9"
        },
        {
          "title": "Pin, isolate, containerise — and the pipeline is the gate",
          "text": "CI runs the suite on every push and pull request on a clean machine, and merge is blocked until the checks pass: the tests you wrote become the contract for what enters main. A workflow is YAML under .github/workflows/ — on: triggers it, jobs: run in parallel, steps: run in order, matrix: fans one job across versions, uses: reuses an action and run: runs a shell command. Then make the runner's answer match yours: pin with == rather than >=, isolate in a venv, and freeze OS plus deps plus code in an image with layers ordered stable to volatile, so COPY requirements.txt and pip install sit above COPY . . and a code change does not reinstall the world. Config (ports, poll interval) is plain env vars; secrets are injected at runtime and never enter git or the image.",
          "code": "import itertools\nmatrix = {\"python\": [\"3.11\", \"3.12\"], \"os\": [\"ubuntu-latest\"]}\njobs = [dict(zip(matrix, combo)) for combo in itertools.product(*matrix.values())]\nfor j in jobs: print(\"runner:\", j)\nprint(len(jobs), \"runners from one job definition\")\n# runner: {'python': '3.11', 'os': 'ubuntu-latest'}\n# runner: {'python': '3.12', 'os': 'ubuntu-latest'}\n# 2 runners from one job definition",
          "deck": "Deck Week 9a · slides 12–15"
        },
        {
          "title": "Integration correctness is a different claim",
          "text": "Unit correctness says each object honours its own contract in isolation, and 1,286 tests establish that here. Integration correctness says the objects honour each other's contracts, wired together, live, under load. The properties that decide it — timing, ordering, back-pressure, shared state — are emergent and invisible to any single unit test. The classic seam bugs are ordering bugs: the signal fires faster than risk can veto it, a fill arrives before its ack, two messages race on the book, one side sends price as a float while the other rounds to ticks and both are individually correct. Test the conversation, not just the speakers.",
          "deck": "Deck Week 9b · slide 5"
        },
        {
          "title": "The wire contract is the integration contract",
          "text": "Three independent processes — broker, exchange, trader — speak only Pydantic models from shared/messages.py, with a type discriminator that parse_message dispatches on. Every arrow between them is a seam, so the natural unit test for a seam is a round trip: dump to JSON, parse back, assert the object is identical. If it round-trips, the two sides agree about the payload; what remains to test is the timing and the ordering. This is also a responsibility diagram rather than a data-flow diagram — the exchange owns the truth, the broker owns liquidity, your bot owns its decisions — and confusion about who owns what is the root cause of most live incidents.",
          "code": "import json\nfrom typing import Literal\nfrom pydantic import BaseModel\n\nclass PortfolioUpdate(BaseModel):                  # the seam's contract\n    type: Literal[\"portfolio_update\"] = \"portfolio_update\"\n    team_id: str; positions: dict[str, int]; realized_pnl: float; net_worth: float\nsent = PortfolioUpdate(team_id=\"t1\", positions={\"AAPL\": 3},\n                       realized_pnl=-0.95, net_worth=163296.40)\nback = PortfolioUpdate.model_validate(json.loads(sent.model_dump_json()))\nprint(\"round-trip identical:\", back == sent, back.positions)\n# round-trip identical: True {'AAPL': 3}",
          "deck": "Deck Week 9b · slide 6"
        },
        {
          "title": "Live systems fail partially, not all at once",
          "text": "The socket stays up while the price behind it dies. The broker's Yahoo poll stalls, the mark stops moving, and you keep quoting confidently around a number nobody stands behind. Kill the market maker and the touch goes one of two ways depending on the venue: with CANCEL_ON_DISCONNECT the venue pulls the dead seat's orders and best_bid, best_ask and spread start returning None within a tick, so any arithmetic on the touch raises; without it the dead quotes persist and your arithmetic succeeds against a corpse. Handle both — guard the touch before it reaches a Signal, and keep a last-change tick per symbol so a price that stopped moving stops your quoting.",
          "code": "class Feed:\n    def __init__(self): self.px, self.moved_at = 100.0, 0\n    def see(self, px, tick):\n        if px != self.px: self.px, self.moved_at = px, tick\n        return tick - self.moved_at            # ticks since the price last moved\n\nf, ticks = Feed(), [100.0, 100.2, 100.2, 100.2, 100.2, 100.2]\nages = [f.see(px, t) for t, px in enumerate(ticks, start=1)]\nprint(\"ages\", ages, \"| stale from tick\", 1 + next(i for i, a in enumerate(ages) if a > 2))\n# ages [1, 0, 1, 2, 3, 4] | stale from tick 5",
          "deck": "Deck Week 9b · slide 8"
        },
        {
          "title": "Reconnect, then re-sync: the venue owns the truth",
          "text": "On ConnectionClosed you back off and reconnect — trader/trader.py retries every three seconds and clears its stale book — but reconnecting is not recovering. Positions self-heal, because the client assigns self.positions = dict(update.positions) on every PortfolioUpdate. Anything you accumulate yourself does not: in the lab the bot rejoins at Tick 0 believing it holds $100,000, net worth snaps back to $163,315 one tick later, and realized_pnl stays at +0.00 for the rest of the session. So keep a shadow ledger from on_fill, compare it against the exchange's positions every tick, log the mismatch loudly, and reset from portfolio.positions on rejoin. A retried order also needs an id, or retry logic is a double-fill machine.",
          "code": "shadow = {}                                    # accumulated from on_fill only\ndef on_fill(side, sym, qty):\n    shadow[sym] = shadow.get(sym, 0) + (qty if side == \"buy\" else -qty)\non_fill(\"buy\", \"AAPL\", 5); on_fill(\"sell\", \"AAPL\", 2); venue = {\"AAPL\": 3}\nprint(\"before the drop, agree:\", shadow == venue)\nshadow.clear()                                 # the reconnect wiped local state\nprint(\"RECON MISMATCH AAPL: shadow=%d venue=%d\" % (shadow.get(\"AAPL\", 0), venue[\"AAPL\"]))\nshadow.update(venue)                           # re-sync from the source of truth\nprint(\"after re-sync, agree:\", shadow == venue)\n# before the drop, agree: True\n# RECON MISMATCH AAPL: shadow=0 venue=3\n# after re-sync, agree: True",
          "deck": "Deck Week 9b · slides 8–9"
        },
        {
          "title": "The tearsheet: read the curve, then the numbers",
          "text": "One page answers two questions: did this make money, and how much risk did it take to do it. The equity curve comes first because the shape tells the story before any number does — a smooth 20% beats a jagged 40%, which is one bad tick from a blow-up. Then the numbers: Sharpe as mean excess return over the volatility of returns, max drawdown as the largest peak-to-trough fall and therefore the worst pain an investor sat through, Calmar as return over that drawdown, turnover as how much you traded to get there, and exposure as how much capital was at risk and on which side. Turnover is a cost, not a measure of effort.",
          "code": "from statistics import mean, pstdev\neq = [100_000, 101_200, 100_800, 102_500, 102_100, 103_900, 105_200]\nr = [b / a - 1 for a, b in zip(eq, eq[1:])]\npeak = mdd = 0.0\nfor v in eq: peak = max(peak, v); mdd = max(mdd, (peak - v) / peak)\nret = eq[-1] / eq[0] - 1\nprint(f\"return {ret:+.2%} vol {pstdev(r):.4f} sharpe {mean(r) / pstdev(r):.2f}\")\nprint(f\"maxDD {mdd:.2%} calmar {ret / mdd:.1f}\")\n# return +5.20% vol 0.0090 sharpe 0.94\n# maxDD 0.40% calmar 13.2",
          "deck": "Deck Week 9b · slide 12"
        },
        {
          "title": "Risk-adjusted scoring: the steady book wins",
          "text": "Raw return is the most misleading number in finance — the same +30% can be an edge or a coin flip that landed right, and maximum leverage on one bet wins the year it works and ends the season it does not at zero. So exchange/scoring.py ranks on a risk-adjusted score, per role, announced in week one: mean excess return over max(vol, VOL_FLOOR), multiplied by max(0, 1 - 2·max_drawdown) and clamped. Two details do real work. Returns are measured net of the risk-free cash drift, so parking cash scores about zero instead of dominating; and the denominator is floored, so a near-flat curve cannot produce an astronomical ratio. The snippet reproduces the lab's two curves exactly.",
          "code": "from statistics import mean, pstdev\ndef score(eq, rf=1.000002 ** 60 - 1, floor=1.2e-4, pen=2.0):\n    r = [b / a - 1 for a, b in zip(eq, eq[1:])]\n    mdd = max((max(eq[:i + 1]) - v) / max(eq[:i + 1]) for i, v in enumerate(eq))\n    ratio = min(10.0, (mean(r) - rf) / max(pstdev(r), floor))   # Sharpe-like\n    return ratio * max(0.0, 1 - pen * mdd), mdd                 # drawdown always hurts\nsteady = [100_000 * 1.01 ** k for k in range(13)]\njagged = [100_000, 118_000, 96_000, 121_000, 99_000, 125_000, 101_000,\n          128_000, 104_000, 130_000, 108_000, 126_000, steady[-1]]\nfor n, e in ((\"steady\", steady), (\"jagged\", jagged)): s, d = score(e); print(f\"{n} score {s:+.3f} maxDD {d:.2%} ret {e[-1] / e[0] - 1:+.2%}\")\n# steady score +10.000 maxDD 0.00% ret +12.68%\n# jagged score +0.091 maxDD 19.20% ret +12.68%",
          "deck": "Deck Week 9b · slides 13, 17"
        }
      ],
      "hft": {
        "paragraphs": [
          "Testing a strategy starts by cutting it in two. The decision becomes a pure function of prices — momentum(prices, lookback, band), no I/O, no clock, no globals — and on_tick shrinks to an adapter that reads the book, calls it, and returns a Signal. The pure half runs in microseconds, so a hundred cases cost nothing; the adapter half only needs the seams: empty book, one-sided book, insufficient cash, a None return. The lab builds exactly that split, then as_signal_fn hands the same object to the simulator, so the code you tested is the code that trades.",
          "An offline result is believable only when it reproduces. Seed the session and two runs must produce identical leaderboards; if they do not, you have unseeded randomness, a datetime.now(), a uuid4(), or iteration over an unstably-hashed set somewhere in the decision path. That is not cosmetic. A number you cannot reproduce cannot be debugged, defended in a demo, or compared against the next version of the signal — so every backtest claim you make rests on determinism first and on the strategy second.",
          "The tests that protect capital are the ugly ones. Drive on_tick with a fake market whose best_ask returns None and whose price history is all NaN, and assert it returns None instead of raising — a raising on_tick in a live session is a bot that has silently stopped trading while the dashboard watches. Then pin the kill switch: push realised P&L past the daily-loss threshold and assert on_tick returns None from then on. Pinned dependencies belong in the same category, because a floating version that shipped an API change is a bot that fails to import at 6 p.m.",
          "Fee arithmetic is where money leaks quietly, which is why the matching engine is held at 100% coverage: one wrong fill corrupts every P&L downstream. The sign convention is the thing to assert. Under the default maker/taker schedule the aggressor pays TAKER_FEE_RATE, 0.0015 of notional, and the resting side earns MAKER_REBATE_RATE, 0.0010 — so a bot that flips every tick is a fee machine with a strategy attached. A test that a taker fill debits cash and a maker fill credits it kills a whole class of accounting bug.",
          "Shipping ends at observability, not at a green badge. Give yourself one surface — a rich table or an equity plot written on exit showing position, cash, P&L and whether the kill switch is armed — because you cannot fix what you cannot see. The venue-level version is the dashboard's STATS tab, where MAKER % and NET FEES are the two most diagnostic numbers on the platform. Neither helps unless you wrote down the healthy baseline while the market was calm: fills per ten seconds, net worth, maker share.",
          "The signal-to-order pipeline is a chain of seams, and the seams are where the session is lost. on_tick reads a book snapshot, computes a number, risk vetoes or passes it, an order goes on the wire, an ack comes back, a fill follows, the portfolio marks, the leaderboard updates. Each hop is a contract between two processes that were tested separately. Where it breaks is ordering: a fill that lands before its ack, a signal that fires again before risk has seen the first order, a float price that the venue rounds to a tick. A round-trip test proves the payload; only a wired-up run proves the sequence.",
          "Offline honesty decides where you are allowed to test. End-to-end runs over live data are flaky by construction — the feed moves, the counterparties change, the failure does not reproduce — so the seeded, network-free simulator is the first venue for every claim, and the live session is confirmation rather than discovery. That is also what a smoke test is for: one fast pass over the critical path, does it start, connect, place one order and score. A green end-to-end run is proof the system was healthy once, on that data; observability is what tells you about now.",
          "What protects capital live is degradation, not perfection. Guard the touch so a one-sided book returns None rather than raising, because a raising on_tick is a bot that quietly stopped trading. Detect staleness explicitly, since 'the connection is up' is not 'the data is good'. Bound your queues and shed load when messages arrive faster than you process them. Lose the model and fall back to flat rather than to garbage orders — fail loudly at the seam, fail safe at the edge. And give every order a client id so a retry after a dropped socket is a no-op instead of a double fill.",
          "Your ledger and the venue's will disagree, and the reconnect is when you find out. Positions self-heal because the exchange overwrites them on every PortfolioUpdate; realised P&L, fill counts and your kill switch's loss tally do not, which is why the lab's bot comes back with the right net worth and a realized_pnl of +0.00 that stays wrong all session. Keep a shadow ledger from on_fill, diff it every tick, and treat a mismatch as a page: it means a fill you missed or double-counted. Then confirm the story offline from the tape with scripts/tca_report.py.",
          "Costs and risk are the two things the tearsheet must not flatter. tca_report.py gives you fills, volume, buy/sell split, maker versus taker mix, fees against rebates, and execution quality against the prevailing mid at each fill — set that beside your walk-forward estimate and explain the gap, because turnover is where an edge quietly goes. Then accept the ranking: the same +12.68% return scores +10.000 as a steady curve and +0.091 as a jagged one with a 19.2% drawdown. Defend the process, not the P&L, and remember that one seed is one sample."
        ],
        "example": [
          {
            "title": "In the arena",
            "text": "tests/test_orderbook.py — the suite your own file imitates: a fixture builds a fresh book per test, two helpers remove the copy-paste, and each test pins one behaviour of the matching engine by name.",
            "code": "# tests/test_orderbook.py\n@pytest.fixture\ndef ob():\n    return OrderBook(\"AAPL\", fee_rate=0.001)\n\ndef place_buy(ob, team, price, qty, order_type=\"limit\"):\n    return ob.place_order(team, \"buy\", price, qty, order_type)\n\nclass TestResting:\n    def test_limit_buy_rests_in_empty_book(self, ob):\n        order, trades = place_buy(ob, \"t1\", 100.0, 10)\n        assert trades == []\n        assert order.remaining == 10\n        assert ob.best_bid() == 100.0\n        assert ob.best_ask() is None"
          },
          {
            "title": "In the arena",
            "text": "exchange/scoring.py — score_equity() is the function that ranks the season, and it is the same code the live venue and the offline sim both call, so a tearsheet you compute yourself is comparable with the leaderboard.",
            "code": "# exchange/scoring.py  (score_equity)\nr = returns(eq)\nvol = statistics.pstdev(r) if len(r) > 1 else 0.0\nmean_r = (sum(r) / len(r)) if r else 0.0\nmdd = max_drawdown(eq)\n\nif n >= MIN_SNAPSHOTS and r:\n    excess = [x - RISK_FREE_PER_SNAPSHOT for x in r]\n    mean_excess = sum(excess) / len(excess)\n    ratio = mean_excess / max(vol, VOL_FLOOR)\n    ratio = max(-RISK_ADJUSTED_CAP, min(RISK_ADJUSTED_CAP, ratio))\n    if ratio >= 0:\n        risk_adjusted = ratio * max(0.0, 1.0 - pen * mdd)\n    else:\n        risk_adjusted = ratio * (1.0 + pen * mdd)"
          }
        ]
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
        },
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
