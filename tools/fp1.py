# focus.js slice — FINM 33500 Systematic Trading Technologies, sessions 0-2.
# Every `code` snippet below was executed with python3 (3.13.5) and the trailing
# `#` lines are its real stdout. `hft.example` snippets are quoted from the
# AlgoArena repo and are deliberately NOT executed.

s0 = {
    "n": 0,
    "focus": "Environment & the green smoke test",
    "tagline": "Before any of the microstructure matters, one thing has to be true: your machine runs the same code the same way tomorrow, and you can prove it in six checks.",
    "concepts": [
        {
            "title": "A pinned interpreter is part of the deliverable",
            "text": "The stack is Python 3.11+ inside a virtual environment you create on purpose — `uv venv .venv --python 3.11` — not whatever `python` happens to resolve to on your laptop. A venv is a directory with its own interpreter and its own site-packages, put first on PATH; that is all the isolation there is, and it is enough to make the installed package set a property of the project rather than of the machine. Check 1 of the smoke test is exactly this comparison, and it runs first because every later check is meaningless without it.",
            "code": """\
import sys
MIN = (3, 11)
def ok(v):                       # this IS check 1 of tests/test_smoke.py
    return v[:2] >= MIN
print("this interpreter:", ok(sys.version_info))
print("system python 3.9:", ok((3, 9, 18)))
print("pinned venv 3.11:", ok((3, 11, 9)))
# this interpreter: True
# system python 3.9: False
# pinned venv 3.11: True""",
            "deck": "Deck Week 0 · slides 27–28",
        },
        {
            "title": "Six checks, ordered cheapest first",
            "text": "The green smoke test is six checks in a fixed order: Python version, `arena.Trader` imports, the Anthropic key answers a prompt, yfinance returns a live AAPL price, the engine plus a headless session run end to end, and your bot handshakes with the arena and receives a book snapshot. Each one costs more than the last and depends on the ones above it, so the first failure names the layer to fix. Check 6 is the real gate — appearing on the teacher dashboard proves the interpreter, the SDK, the token and the socket in a single observation.",
            "deck": "Deck Week 0 · slide 28 · Deck Week 0 · slide 35",
        },
        {
            "title": "A SKIP is not a PASS",
            "text": "Checks that need an external resource — your key, the network, the class arena — skip rather than fail, so a student without an API key is not blocked. That kindness is the trap: pytest prints skips in yellow beside the green dots, and \"no failures\" reads as \"done\". A skipped check never ran and has told you nothing. The suite therefore restates its own tally in words, and the deliverable is six passed, zero skipped.",
            "code": """\
CHECKS = 6
def summary(passed, skipped, failed=0):
    head = f"{passed} passed, {skipped} skipped"
    if failed:
        head += f", {failed} FAILED"
    if skipped or failed:
        return f"{head} - a skip is NOT a green check ({passed}/{CHECKS} ran green)"
    return f"{head} - all {CHECKS}/{CHECKS} ran green"
print(summary(4, 2))
print(summary(6, 0))
# 4 passed, 2 skipped - a skip is NOT a green check (4/6 ran green)
# 6 passed, 0 skipped - all 6/6 ran green""",
            "deck": "Deck Week 0 · slide 35 · Deck Week 0 · slide 37",
        },
        {
            "title": "Configuration comes from the environment, never from the source",
            "text": "`EXCHANGE_HOST`, `TEAM_ID` and `ARENA_TOKEN` are read from the process environment, with a `.env` file as the fallback and the shell always winning. That precedence is not cosmetic: registration leaves the hosted arena's address in `.env`, so local play needs `EXCHANGE_HOST=localhost` on the command line to beat it, and the bot logs which source won so a stale value is visible instead of mysterious. Secrets travel in one direction only — the token lives in `.env`, `.env` is gitignored, and `.env.example` carries the key names with empty values.",
            "code": """\
def load_env(lines, env):                      # shared/envfile.py, in miniature
    for line in lines:
        if not line.strip() or line.startswith("#") or "=" not in line: continue
        k, v = line.split("=", 1)
        env.setdefault(k.strip(), v.strip())   # setdefault: the shell always wins
    return env
shell = {"EXCHANGE_HOST": "localhost"}         # what you exported this session
env = load_env(["EXCHANGE_HOST=arena.example.edu", "TEAM_ID=team_a"], shell)
print("host:", env["EXCHANGE_HOST"], "team:", env["TEAM_ID"])
print("token came from the repo:", "ARENA_TOKEN" in env)
# host: localhost team: team_a
# token came from the repo: False""",
            "deck": "Deck Week 0 · slide 29",
        },
        {
            "title": "Verify a dependency's version at runtime",
            "text": "\"Installed\" and \"the version this code needs\" are different claims, and pydantic is the one that bites. Every arena message is a v2 model; `model_dump_json()` does not exist on v1, so a v1 install fails deep inside a parse rather than at import. `importlib.metadata.version` reports the version the interpreter actually resolved, which is the number worth asserting on — not the one written in requirements.txt.",
            "code": """\
from importlib.metadata import version
import pydantic
major = int(version("pydantic").split(".")[0])
print("pydantic major:", major, "| v2 required:", major >= 2)
print("v2 API present:", hasattr(pydantic.BaseModel, "model_dump_json"))
# pydantic major: 2 | v2 required: True
# v2 API present: True""",
            "deck": "Deck Week 0 · slide 27 · Deck Week 0 · slide 29",
        },
        {
            "title": "Constrain the prompt, then verify the output",
            "text": "The three prompt patterns that work all narrow the question: generate code under stated constraints (\"use only the prices and history arguments, return Signal | None\"), stress-test logic you already wrote, or explain one mechanism against your own file. The three that fail are asking for the whole system at once, trusting its financial maths, and shipping anything you cannot explain. Sharpe, Kelly and drawdown are the formulas it gets confidently wrong, so a generated metric is worth exactly what your independent check of it is worth.",
            "code": """\
import statistics as st
def sharpe(r, rf=0.0):                    # the shape an LLM hands you
    ex = [x - rf for x in r]
    return st.mean(ex) / st.stdev(ex)
r = [0.010, -0.005, 0.020, 0.000, 0.015]
# re-derive it by hand before it sizes a single order
m = sum(r) / len(r)
v = sum((x - m) ** 2 for x in r) / (len(r) - 1)
print("generated:", round(sharpe(r), 4))
print("by hand:", round(m / v ** 0.5, 4))
# generated: 0.7716
# by hand: 0.7716""",
            "deck": "Deck Week 0 · slides 32–33",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "The pipeline you spend nine weeks building is short and unforgiving: data arrives, features are computed, a signal becomes a target position, orders are routed, fills come back and get reconciled. Every stage is a process reading configuration from the environment and importing some version of a library. A bot that works on your laptop and not on the arena has not found an edge; it has found an environment difference. Pinning the interpreter and the dependency set is what leaves the strategy as the only variable in the experiment.",
            "An offline result is believable only if it reproduces, and reproducibility starts below the strategy. Same interpreter, same library versions, same seed, same data snapshot — change one and two runs of identical code disagree for reasons that have nothing to do with the market. `make sim` exists so you can watch the engine and the SDK produce a headless season before you interpret a single P&L figure. The habit to build in week 0: when a number moves, the first question is what else moved.",
            "Live sessions die in the environment far more often than in the algorithm. ConnectionRefused because the venue is not up yet; a stale `EXCHANGE_HOST` pointing at the wrong venue; a yellow check where a key should be; yfinance rate-limiting a tight poll loop. None of those are strategy bugs and every one of them costs you a session's fills. The six checks are the pre-flight for precisely that list, which is why check 6 — a real handshake and a real book snapshot — is the one that decides whether you passed.",
            "Being pedantic about the plumbing pays because the edge is thin. Take the deck's own arithmetic: a strategy making 0.05% per trade against 0.03% of spread, 0.02% of impact and 0.01% of commission is a 0.01% loss per round trip, and it loses faster the more it trades. Nothing about your environment changes those numbers. But a session you cannot run and a backtest you cannot reproduce guarantee you never measure them, and unmeasured cost is the usual reason a promising signal ends up a loss-making business.",
        ],
        "example": {
            "title": "In the arena",
            "text": "tests/test_smoke.py — check 5 is the whole engine in a dozen lines: a crossing order must print a trade at the RESTING order's price, then a full headless season runs with no network at all. Green here means the matching engine and the SDK on your machine agree with everyone else's.",
            "code": """\
# tests/test_smoke.py
def test_engine_and_sdk_smoke():
    \"\"\"5. Arena engine + SDK smoke: the order book matches and a full
    no-network session runs end to end.\"\"\"
    from shared.orderbook import OrderBook

    ob = OrderBook("AAPL")
    ob.place_order("maker", "sell", 100.0, 5)
    _order, trades = ob.place_order("taker", "buy", 100.0, 5)
    assert trades and trades[0].price == 100.0

    from sim.session import SimSession

    result = SimSession().run(n_ticks=50, verbose=False)
    assert result is not None""",
        },
    },
    "interview": [
        {
            "q": "What does a Python virtual environment actually change, and why does the course insist on one?",
            "a": "It creates a directory holding its own interpreter and its own site-packages, and putting that directory's bin first on PATH makes `python` and `pip` resolve there. Nothing is isolated at the OS level — it is path resolution plus a chosen interpreter version. The value is that the installed package set becomes a property of the project instead of the laptop, so `uv venv .venv --python 3.11` plus a pinned requirement set reproduces the same imports on the next machine.",
            "level": "warm-up",
            "skill": "tools.venv",
        },
        {
            "q": "What does a market order guarantee, and what does a limit order guarantee?",
            "a": "A market order guarantees execution and not price: it crosses the spread against the best resting orders, so a large one walks up the book and gets a blended average fill. A limit order guarantees price and not execution: it rests in the book at your price until it fills or is cancelled, which also makes you the passive side and the one earning a rebate under a maker/taker schedule. Systematic strategies default to limit orders and cross only when speed genuinely beats price.",
            "level": "warm-up",
            "skill": "trading.order-types",
        },
        {
            "q": "CI reports \"4 passed, 2 skipped\" and the build is green. Why is that a problem, and what do you change?",
            "a": "A skip means the check never ran, so it has asserted nothing — and \"no failures\" is a weaker statement than \"everything verified\". The skipped checks are usually the ones needing an external resource, which is exactly where breakage lives. The fix is to stop treating absence of failure as the signal: provide the resource in CI, and gate on an explicit count — the number of checks that actually ran green must equal the total. A summary line that says \"a skip is not a green check\" is the cheap version of the same discipline.",
            "level": "core",
            "skill": "tools.smoke-test",
        },
        {
            "q": "Where should an exchange hostname, a team id and an API token live, and why not in the code?",
            "a": "All three come from the process environment, with a gitignored `.env` as a local fallback and the shell taking precedence, so one image runs against a local venue and a hosted one with no code change. Hostnames and ids in source mean a rebuild per environment and a merge conflict per developer. A token in source is a credential in git history forever, and deleting the file later does not remove it. Ship a `.env.example` with the key names and empty values, and have the process log which source won so a stale value is visible.",
            "level": "core",
            "skill": "tools.venv",
        },
        {
            "q": "Name the five pillars of a systematic trading system and say which is most often underestimated.",
            "a": "Signal, strategy, execution, risk management and portfolio. Signal gets the attention because it is the hardest to find; strategy turns it into direction, size and holding period; portfolio combines weakly correlated strategies for a smoother return stream. Execution is the underestimated one — roughly 20% of the edge in a liquid name and up to 80% in an illiquid or high-turnover one, because slippage, impact and fees scale with how often you trade. Risk management is second, since most systems fail from a blowup rather than from a wrong signal.",
            "level": "core",
            "skill": "quant.five-pillars",
        },
        {
            "q": "A strategy earns 5 bps of gross edge per round trip. Spread costs 3 bps, impact 2 bps, commission 1 bp. Is it a business?",
            "a": "No: 6 bps of round-trip cost against 5 bps of gross is a 1 bp loss per trade, and it scales with turnover, so trading more makes it worse. The three ways out are structural. Earn the spread instead of paying it by resting passively and accepting fill uncertainty. Cut turnover so the same gross edge covers fewer round trips. Or reduce impact by shrinking participation — impact grows roughly with volatility times the square root of order size over ADV, so halving the clip does not halve the cost.",
            "level": "core",
            "skill": "trading.market-impact",
        },
        {
            "q": "How do you use an LLM to write a signal function without shipping code you cannot defend?",
            "a": "Constrain the request to something checkable: state the inputs it may use, the return type and the rule in words, then read every line and re-derive any maths independently. The reliable failure modes are asking for the whole system at once, trusting a formula — Sharpe, Kelly and drawdown are the confident hallucinations — and pasting output you have not read. I keep a unit test that encodes the rule separately from the generated implementation, so the verification survives the next regeneration and the review question \"why this threshold\" has an answer that is mine.",
            "level": "senior",
            "skill": "tools.genai-workflow",
        },
        {
            "q": "Primary versus secondary market: what changes about how the price gets set?",
            "a": "In the primary market the issuer sells new shares and keeps the proceeds, and the price comes out of a bookbuild — indications of demand across a range, one clearing price chosen, then pro-rata allocation, so there is no continuous price until listing. In the secondary market the issuer receives nothing and price comes from a continuous double auction between investors, updating on every trade. The arena runs both: `exchange/ipo.py` does bookbuild, pricing, allocation and a listing-day open, and from that moment the CLOB sets the price.",
            "level": "senior",
            "skill": "trading.primary-secondary",
        },
    ],
}

s1 = {
    "n": 1,
    "focus": "Object-oriented Python & UML",
    "tagline": "Model the domain as objects, enforce the contract with an ABC, and draw the arrows before you write the file — a wrong relationship costs a minute on paper and a week in code.",
    "concepts": [
        {
            "title": "A class is a blueprint; the attributes say where state lives",
            "text": "`__init__` sets up per-object state and `self` is the instance. The distinction that catches people is class attribute versus instance attribute: a class attribute is one object shared by every instance, and assigning to it through an instance does not update it — it creates a new instance attribute that shadows it on that object alone. A fee rate, a symbol table or a counter declared at class level is shared mutable state, and that is a design decision, not a shortcut.",
            "code": """\
class Order:
    exchange_fee = 0.001                  # class attribute: shared by every Order
    def __init__(self, symbol, side, qty, price):
        self.symbol, self.side, self.qty, self.price = symbol, side, qty, price
    def notional(self): return self.qty * self.price
o = Order("AAPL", "buy", 5, 185.50)
print("notional:", o.notional(), "fee:", o.exchange_fee)
o.exchange_fee = 0.002                    # shadows the class attr on o alone
print("o:", o.exchange_fee, "fresh:", Order("MSFT", "buy", 1, 1.0).exchange_fee)
# notional: 927.5 fee: 0.001
# o: 0.002 fresh: 0.001""",
            "deck": "Deck Week 1 · slide 7",
        },
        {
            "title": "Encapsulation is a convention plus a property",
            "text": "Python has no access control. A single leading underscore is a message to the reader — internal, hands off — and a double underscore is name-mangled to `_ClassName__attr`, which prevents accidental collisions in subclasses rather than access. `@property` is the useful half: it turns a computed value into attribute access with no setter, so `net_worth` is read-only from outside and you are free to change how it is computed. Encapsulation in practice means a stable interface over internals you intend to rewrite.",
            "code": """\
class Portfolio:
    def __init__(self, cash):
        self.cash = cash                   # public API
        self._positions = {"AAPL": 10}     # _protected by convention
        self.__ledger = []                 # __private: name-mangled
    @property                              # computed, read-only
    def net_worth(self): return self.cash + self._positions["AAPL"] * 185.50
p = Portfolio(100_000.0)
print("net_worth:", p.net_worth, "setter:", Portfolio.net_worth.fset)
print("mangled to:", [n for n in vars(p) if "ledger" in n])
# net_worth: 101855.0 setter: None
# mangled to: ['_Portfolio__ledger']""",
            "deck": "Deck Week 1 · slide 9",
        },
        {
            "title": "Inheritance is for genuine specialisation",
            "text": "A subclass is an IS-A claim: `Momentum` IS-A `Strategy`, so anywhere a `Strategy` is expected a `Momentum` must work. `super().__init__(name)` hands the parent responsibility for its own state instead of re-implementing it, and `__mro__` is the list Python walks to resolve a method — the reason `super()` is a position in a chain rather than a hard-coded parent. Reach for inheritance when the subclass really is the base type with extra behaviour; reach for composition when you only want the code.",
            "code": """\
class Strategy:
    def __init__(self, name): self.name = name
    def signal(self, px): return 0.0
class Momentum(Strategy):                       # Momentum IS-A Strategy
    def __init__(self, name, lookback):
        super().__init__(name)                  # parent sets up its own state
        self.lookback = lookback
    def signal(self, px): return px[-1] - px[-self.lookback]   # override
m = Momentum("mom", 3)
print(m.name, m.signal([10.0, 11.0, 12.0]), [c.__name__ for c in Momentum.__mro__])
# mom 2.0 ['Momentum', 'Strategy', 'object']""",
            "deck": "Deck Week 1 · slide 10",
        },
        {
            "title": "The ABC is the contract, checked at construction",
            "text": "An abstract base class declares what a subclass must supply. `arena.Trader` is one abstract method, `on_tick(market, portfolio) -> Signal | None`, plus three optional hooks — `on_fill`, `on_event`, `on_ipo` — with harmless defaults and a `run()` you never override. That asymmetry is the design: the mandatory part is your edge, the rest is opt-in. The practical difference from registering a plain function is when the mistake surfaces. `Trader()` raises `TypeError` at construction, before a session starts, rather than an `AttributeError` mid-tick.",
            "code": """\
from abc import ABC, abstractmethod
class Trader(ABC):
    @abstractmethod
    def on_tick(self, market, portfolio): ...                  # subclasses MUST answer
    def on_fill(self, side, symbol, qty, price): return None    # optional hook
class MyBot(Trader):
    def on_tick(self, market, portfolio): return None
print("abstract:", sorted(Trader.__abstractmethods__))
try: Trader()
except TypeError: print("Trader() -> TypeError; MyBot() ok:", isinstance(MyBot(), Trader))
# abstract: ['on_tick']
# Trader() -> TypeError; MyBot() ok: True""",
            "deck": "Deck Week 1 · slide 12 · Deck Week 1 · slide 21",
        },
        {
            "title": "Dataclass or pydantic model: who checks the data",
            "text": "`@dataclass` writes `__init__`, `__repr__` and `__eq__` from your annotations and is the right tool for a value object you construct yourself — a `Trade`, a `Fill`, an `Order`. It does not validate anything: the annotations are documentation at runtime, so a string lands in a float field without complaint. A pydantic v2 model validates and coerces, which is why every message crossing a socket in this codebase is one. A dataclass believes you; a pydantic model checks you. Note also that pydantic models take keyword arguments only.",
            "code": """\
from dataclasses import dataclass
from pydantic import BaseModel, ValidationError
@dataclass
class Trade: symbol: str; price: float; quantity: int
class Signal(BaseModel): symbol: str; side: str; quantity: int
print(Trade("AAPL", "not a price", 5))          # the dataclass believes you
print("coerced:", Signal(symbol="AAPL", side="buy", quantity="5").quantity)
try: Signal(symbol="AAPL", side="buy", quantity="five")
except ValidationError: print("pydantic rejected quantity='five'")
# Trade(symbol='AAPL', price='not a price', quantity=5)
# coerced: 5
# pydantic rejected quantity='five'""",
            "deck": "Deck Week 1 · slide 13",
        },
        {
            "title": "Composition, duck typing, and the arrows on the diagram",
            "text": "Polymorphism is one call site and many implementations: the engine calls `generate_signal(...)` and does not care which class answers, and Python does not require a shared base — the right method is enough. Make the decision rule an object the bot HAS rather than something the bot IS, and you can swap it without touching the bot. That distinction is what the UML arrows record: `▷` generalisation for IS-A, `◆` composition for owns-with-shared-fate, `◇` aggregation for holds-but-outlives, `- ->` dependency for a transient use such as emitting a `Signal`, with `+`/`-`/`#` for visibility and `1`, `0..1`, `*` for multiplicity. Getting an arrow wrong on paper costs a minute.",
            "code": """\
class Momentum:
    def decide(self, px): return "buy" if px[-1] > sum(px) / len(px) else "flat"
class AlwaysFlat:
    def decide(self, px): return "flat"
class Bot:                                       # Bot HAS-A strategy
    def __init__(self, strategy): self.strategy = strategy
    def on_tick(self, px): return self.strategy.decide(px)   # one call site
print([Bot(s).on_tick([10.0, 11.0, 13.0]) for s in (Momentum(), AlwaysFlat())])
# ['buy', 'flat']""",
            "deck": "Deck Week 1 · slide 14 · Deck Week 1 · slides 17–18",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "The class model is the signal-to-order pipeline drawn as boxes. `on_tick(market, portfolio)` hands you two live objects and expects a `Signal` back; the engine then gates that signal through a risk check and turns the survivors into a `PlaceOrder` on the wire. Every hop is a typed contract, so a change of strategy is a change of one object and a change of message shape is a change everyone sees. Draw the diagram badly and you find out at the seam between your decision rule and the order that leaves the socket.",
            "Encapsulation is a live-risk control here, not a style preference. Two families of methods show up when you introspect the objects your hook receives: `update_book`, `update_trade` and `apply_server_update` are written by the engine, and `mid_price`, `best_ask`, `can_buy`, `net_worth` are read by you. The server is the source of truth for cash and positions. A bot that mutates its local portfolio and sizes the next order from that number is trading against its own bookkeeping, and it will keep buying after the venue has already rejected it.",
            "One interface is what makes an offline result about the code you actually ship. The same `Trader` subclass runs live against the exchange and headless in the simulator, because `_AdapterStrategy` and `as_signal_fn` translate between the simulator's `signal_fn(symbol, prices, history, book, portfolio)` and the SDK's `on_tick(market, portfolio)`. Two harnesses, one implementation — so a backtest is evidence rather than a parallel codebase that drifts. The adapter is composition and inheritance doing the same job as a cast in a typed language.",
            "Swapping strategy objects is also how you attribute cost. In the week-1 lab two bots race over 400 ticks behind a single interface: momentum crossed the spread 66 times, paid $113.57 in fees and handed the broker exactly the P&L it lost, while a mean-reversion bot with a 0.3% band never triggered and \"won\" by doing nothing. Loosen the band to 0.1% and it earns +45.37 realised while paying $142.66 in fees — still below its $100k start. Not trading is a strategy; paying the spread 66 times is a decision, and the object boundary is what lets you price it.",
        ],
        "example": {
            "title": "In the arena",
            "text": "arena/trader.py — the ABC you subclass. One `@abstractmethod`, three optional hooks with defaults, and a `run()` you inherit; everything about sockets, auth and portfolio accounting lives behind it in trader/trader.py.",
            "code": """\
# arena/trader.py
class Trader(ABC):
    \"\"\"Your algorithmic trader. Subclass and implement on_tick().\"\"\"

    # -- The hooks (override these) ------------------------------------
    @abstractmethod
    def on_tick(self, market: MarketData, portfolio: Portfolio) -> Signal | None:
        \"\"\"Called every tick. Return a Signal to trade, or None to sit out.\"\"\"

    def on_fill(self, side: str, symbol: str, quantity: int,
                price: float) -> None: ...

    # -- Entry point (don't override) ----------------------------------
    def run(self) -> None:
        asyncio.run(_AdaptedTraderBot(self).run())""",
        },
    },
    "interview": [
        {
            "q": "What is the difference between a class attribute and an instance attribute in Python?",
            "a": "A class attribute lives on the class object and is shared by every instance; an instance attribute lives in that object's `__dict__`. Attribute lookup checks the instance first, then the class, which is why reading works for both. Assignment does not: `obj.x = 1` always writes an instance attribute, so it shadows the class one rather than updating it. The classic bug is a mutable class attribute such as a list or dict, which really is shared — mutate it through one instance and every instance sees the change.",
            "level": "warm-up",
            "skill": "python.classes",
        },
        {
            "q": "What do a single and a double leading underscore mean on a Python attribute?",
            "a": "A single underscore is convention only: it tells the reader the name is internal and unsupported, and nothing in the language enforces it. A double leading underscore triggers name mangling — inside `class Portfolio`, `self.__ledger` is stored as `_Portfolio__ledger`. That exists to stop a subclass from accidentally colliding with a base class's private state, not to stop access; you can still reach it by the mangled name. There is no `private` in Python, so encapsulation is a documented interface plus `@property` for computed, read-only state.",
            "level": "warm-up",
            "skill": "python.classes",
        },
        {
            "q": "Why define a bot as an ABC with one abstract method rather than letting users register a plain function?",
            "a": "Because the contract is then checked at construction. `Trader()` raises `TypeError` before a session opens, whereas a missing function attribute surfaces as an `AttributeError` on some tick mid-market. The subclass also inherits the rest of the lifecycle for free — `run()`, and default `on_fill` / `on_event` / `on_ipo` — so adding a fourth hook next term does not break existing bots. And `isinstance` becomes meaningful, which matters for a registry that has to tell a trader from a broker. A bare function is fine when there is genuinely one callback and no lifecycle.",
            "level": "core",
            "skill": "python.abc",
        },
        {
            "q": "A message crosses a socket between two of your processes. Dataclass or pydantic model?",
            "a": "A pydantic model, because the data is untrusted the moment it leaves your process. A dataclass generates the boilerplate but does not check anything — annotations are not enforced at runtime, so a string happily occupies a float field and the error appears later, somewhere else. A pydantic v2 model validates and coerces on construction, serialises with `model_dump_json()`, and gives you a discriminated union to parse an incoming frame into the right type. Keep dataclasses for internal value objects you construct yourself, where the producer and consumer are the same code.",
            "level": "core",
            "skill": "python.dataclasses",
        },
        {
            "q": "When does inheritance become the wrong tool, and what do you use instead?",
            "a": "When you are inheriting for code reuse rather than because the subclass genuinely IS the base type. The symptoms are a deep tree, subclasses overriding methods to raise or to no-op, and a base class that grows a flag for every variant. Prefer composition: make the varying behaviour a separate object the class holds, so `Bot(strategy=Momentum())` delegates the decision and a new rule is a new small class with no edit to the bot. That is the Strategy pattern, and it also makes each rule testable in isolation, which a deep hierarchy does not.",
            "level": "core",
            "skill": "python.strategy-pattern",
        },
        {
            "q": "In a UML class diagram, what is the difference between aggregation, composition and dependency?",
            "a": "All three are \"knows about\", separated by lifetime and strength. Composition, the filled diamond, is ownership with shared fate: the whole creates and destroys the part, so a bot owning its portfolio is composition. Aggregation, the hollow diamond, is HAS-A with independent lifetimes — a venue holds bots that outlive it. Dependency, the dashed arrow, is transient use: a method takes or returns the type, such as `on_tick` emitting a `Signal`, and nothing is stored. Multiplicity goes on the ends — `1`, `0..1`, `*` — so \"an order book has many orders\" is a `*` rather than a comment.",
            "level": "core",
            "skill": "tools.uml",
        },
        {
            "q": "Explain super() and the MRO, and why hard-coding the parent class name is worse.",
            "a": "`super()` does not mean \"my parent\"; it means \"the next class after me in this instance's method resolution order\". The MRO is a linearisation of the inheritance graph, computed by C3, and you can read it off `Cls.__mro__`. Calling `Base.method(self, ...)` by name pins one class and silently skips anything a sibling contributed, so with multiple inheritance a mixin's `__init__` never runs. Using `super()` everywhere and accepting `**kwargs` in cooperative `__init__` methods keeps the chain intact whatever the subclass mixes in.",
            "level": "senior",
            "skill": "python.inheritance",
        },
        {
            "q": "You need to add a required hook to a base class that ten teams have already subclassed. How do you do it without breaking them?",
            "a": "Not by adding an `@abstractmethod` — that turns every existing subclass into something that cannot be instantiated. Ship it as a concrete method with a safe default (return `None`, sit out), so old subclasses keep working and new ones override it. Then deprecate in stages: log once when the default is used, document the date it becomes required, and only then make it abstract. The same reasoning applies to the hook's signature — take the new information in a dict or keyword-only argument rather than adding a positional parameter that every override must now accept.",
            "level": "senior",
            "skill": "python.abc",
        },
    ],
}

s2 = {
    "n": 2,
    "focus": "Concurrency & the asyncio event loop",
    "tagline": "One thread, many tasks, and a half-second tick budget: your hook is a callback inside somebody else's loop, and everything it blocks is a fill you never see.",
    "concepts": [
        {
            "title": "Concurrency is structure; parallelism is execution",
            "text": "Concurrency means many tasks are in progress and interleaved on one worker; parallelism means they run at the same instant on several cores. asyncio gives you the first and not the second: `gather` overlaps waiting, so three sleeps of 3, 2 and 1 seconds finish in 3 seconds rather than 6, on one thread and one core. Nothing ran faster — the waiting overlapped. That is the right trade for a trading bot, which is I/O-bound: sockets, feeds, acks. CPU-bound work is the other case, and CPython's GIL lets only one thread execute bytecode at a time, so threads give no speedup there and processes do.",
            "code": """\
import asyncio
done = []
async def worker(name, delay):
    await asyncio.sleep(delay)          # non-blocking: yields to the loop
    done.append(name); return f"{name} ok"
async def main():
    res = await asyncio.gather(worker("feed", 0.03), worker("quote", 0.02), worker("order", 0.01))
    print("gather returns in call order:", res)
    print("they finished in this order:", done)
asyncio.run(main())
# gather returns in call order: ['feed ok', 'quote ok', 'order ok']
# they finished in this order: ['order', 'quote', 'feed']""",
            "deck": "Deck Week 2 · slides 5–7",
        },
        {
            "title": "Calling a coroutine does not run it",
            "text": "`async def` defines a coroutine function. Calling it builds a coroutine object and executes nothing — the body runs only when something awaits it or the loop schedules it as a task. Forget the `await` and your program carries on cheerfully having done none of the work, with a `RuntimeWarning` about a coroutine that was never awaited buried in a log you are not reading. Worth knowing for this codebase: the engine's `on_tick` hook is a plain synchronous function called from inside the loop, so marking your override `async` returns a coroutine object the engine treats as a truthy signal.",
            "code": """\
import asyncio, inspect
async def best_ask(sym):
    await asyncio.sleep(0)
    return 185.50
def on_tick(market, portfolio): return None      # the arena hook: a plain def
c = best_ask("AAPL")                             # calling it does NOT run it
print(type(c).__name__, inspect.iscoroutine(c))
print("awaited:", asyncio.run(c))
print("async?", inspect.iscoroutinefunction(best_ask), "on_tick async?", inspect.iscoroutinefunction(on_tick))
# coroutine True
# awaited: 185.5
# async? True on_tick async? False""",
            "deck": "Deck Week 2 · slide 8",
        },
        {
            "title": "One blocking call freezes every task",
            "text": "A single-threaded loop runs one task at a time and switches only at an `await`. So `time.sleep`, a blocking HTTP call or a long numeric loop inside a coroutine stalls every other task for its whole duration — including the socket reader. In the week-2 lab three seconds of blocking work left the heartbeat 3,010 ms late; the same work through `asyncio.to_thread` cost it 4.8 ms. `async` buys nothing if you never `await`. Run with `debug=True` or `PYTHONASYNCIODEBUG=1` and the loop logs any callback that hogs it for more than 100 ms, which is the first thing to try when a bot \"misses fills for no reason\".",
            "code": """\
import asyncio, time
async def reader(stop, n):
    while not stop.is_set(): await asyncio.sleep(0.005); n.append(1)
async def main(block):
    stop, n = asyncio.Event(), []
    t = asyncio.create_task(reader(stop, n))
    await asyncio.sleep(0.02)
    if block: time.sleep(0.2)                       # WRONG: freezes every task
    else: await asyncio.to_thread(time.sleep, 0.2)  # RIGHT: off the loop
    stop.set(); await t; return len(n)
print("reads during 0.2s of work - blocking:", asyncio.run(main(True)) < 8, "offloaded:", asyncio.run(main(False)) > 20)
# reads during 0.2s of work - blocking: True offloaded: True""",
            "deck": "Deck Week 2 · slide 11",
        },
        {
            "title": "A bounded queue is backpressure; an unbounded one is a time machine",
            "text": "`asyncio.Queue` decouples a fast producer from a slower consumer, and `maxsize` is the interesting parameter: when the queue is full, `put()` waits, which is backpressure for free. Leave it unbounded and the producer races ahead — in the lab a 10,000-slot queue let the feed run about 1,960 ticks in front, so the strategy was deciding on prices two and a half seconds old, with no throughput gain whatsoever. Depth is latency you cannot see in a throughput number. When you cannot keep up, drop or coalesce stale book updates; never buffer them.",
            "code": """\
import asyncio
async def feed(q, n):
    for i in range(n): await q.put(i)          # put() waits when the queue is full
    await q.put(None)
async def strategy(q, seen):
    while True:
        seen.append(q.qsize())                 # ticks already queued behind me
        if await q.get() is None: return max(seen)
        await asyncio.sleep(0)                 # "decide" on this tick
async def run(size): q = asyncio.Queue(size); return (await asyncio.gather(feed(q, 200), strategy(q, [])))[1]
print("stale ticks behind you - maxsize=1:", asyncio.run(run(1)), "unbounded:", asyncio.run(run(0)))
# stale ticks behind you - maxsize=1: 1 unbounded: 201""",
            "deck": "Deck Week 2 · slide 10",
        },
        {
            "title": "Atomic between awaits, not across them",
            "text": "One task runs at a time and yields only at an `await`, so plain state updates between awaits are atomic and the pre-emptive data races you fear from threads do not happen. What does happen is the logic race: a read, an `await`, then a write derived from the read. The other task ran in the gap, and your write lands on a stale value. The shape to hunt for in your own bot is read a position, `await` the order send, write back a computed position. The fix is `asyncio.Lock` around the section that spans the await — or better, stop sharing mutable state and pass data between tasks through a queue.",
            "code": """\
import asyncio
pos = 0
async def buy(qty):
    global pos
    local = pos                  # read
    await asyncio.sleep(0)       # the seam: the other task runs right here
    pos = local + qty            # write, from a now-stale read
async def main():
    await asyncio.gather(buy(5), buy(5))
    print("net position:", pos, "| expected:", 10)
asyncio.run(main())
# net position: 5 | expected: 10""",
            "deck": "Deck Week 2 · slide 12",
        },
        {
            "title": "Sockets drop: catch ConnectionClosed and back off",
            "text": "A live session will drop your socket — the venue restarts, the wifi blinks, a close frame arrives. `websockets.exceptions.ConnectionClosed` must be caught around the read loop, not inside the strategy, and the retry has to back off: double the delay and cap it, so thirty bots reconnecting do not arrive as a thundering herd on a venue that is still starting. Reset state on the way back in. The engine rebuilds `MarketData()` on every reconnect for a reason — a stale book is worse than no book, because it looks tradeable.",
            "code": """\
import asyncio
async def consume(attempts, delay=1.0):
    log = []
    for ok in attempts:
        if ok:
            log.append("connected"); delay = 1.0; continue
        log.append(f"ConnectionClosed - retry in {delay:.0f}s")
        await asyncio.sleep(0)                      # stand-in for the real wait
        delay = min(delay * 2, 30.0)                # exponential backoff, capped
    return log
print(asyncio.run(consume([False, False, False, True])))
# ['ConnectionClosed - retry in 1s', 'ConnectionClosed - retry in 2s', 'ConnectionClosed - retry in 4s', 'connected']""",
            "deck": "Deck Week 2 · slide 14 · Deck Week 2 · slide 20",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "The signal-to-order pipeline in this codebase is two tasks on one loop. `run()` creates them both: `listen()` reads the socket and decodes book snapshots, acks and fills into `MarketData`, and `trading_loop()` sleeps `TICK_INTERVAL_SEC` — 0.5 s by default — then calls your hook, gates the returned `Signal` through a risk check and sends a `PlaceOrder`. Your hook is the synchronous step in the middle of an asynchronous machine. If it does not return, `listen()` does not run, `MarketData` stops updating, and you are deciding on a book that no longer exists.",
            "That is the live-risk failure, and it is measurable rather than theoretical. Block the loop for three seconds and three seconds of snapshots, acks and fills arrive at a socket nobody is reading; the lab's heartbeat measured 3,010 ms of starvation against 4.8 ms for the same work moved off the loop with `to_thread`. Scoring begins in week 2, so this is not a style point — a blocking bot misses fills, and it also misses the SESSION_CLOSED event that triggers flattening, which is how a position survives the end of a session.",
            "Queue depth is a transaction cost. A bounded queue makes the producer wait and keeps the prices you act on current; an unbounded one converts a slow consumer into stale decisions, and a stale decision crosses a spread that has already moved against it. The lab's two rows say it precisely: identical throughput, worst-case lag of a few milliseconds against roughly 2.4 seconds. Turnover multiplies that error, so the right response to falling behind is to drop or coalesce updates and keep the tick you act on fresh, not to buy a bigger buffer.",
            "There is exactly one legitimate thread here, and it is worth knowing why. `yfinance` is blocking HTTP with no async API — one `Ticker(...).fast_info.last_price` took 3.6 seconds in the lab, across ten symbols every 5 seconds — so the broker runs it in a daemon thread named `yahoo-feed` that writes one dict of floats, and the async quoting code reads that dict. Threads for blocking libraries, the loop for sockets, nothing shared but plain floats, and the thread's body wrapped so it never raises. That is the whole hand-off.",
            "Offline honesty has a limit here that is worth naming. The simulator runs the same `Trader` subclass with no network, which makes an offline P&L a statement about the code you ship — but it never stalls, never drops a socket and never delivers a book two seconds late. The failures this week is about are exactly the ones a clean harness cannot show you. So instrument the real thing: time `on_tick` and log a warning past 50 ms, run once with `debug=True`, and make your bot log a reconnect line and come back without being restarted.",
        ],
        "example": {
            "title": "In the arena",
            "text": "broker/broker.py — the one thread in the codebase. `start_yahoo_feeds()` launches a daemon thread and `_yahoo_poll_loop()` writes into a plain dict the async quoting code reads; note the wrapper that guarantees it never raises.",
            "code": """\
# broker/broker.py
def start_yahoo_feeds(self) -> None:
    \"\"\"Poll Yahoo Finance in a background daemon thread.\"\"\"
    t = threading.Thread(target=self._yahoo_poll_loop,
                         args=(config.EQUITY_SYMBOLS,),
                         daemon=True, name="yahoo-feed")
    t.start()

def _yahoo_poll_loop(self, symbols: list[str]) -> None:
    \"\"\"Runs in the yahoo-feed thread. Never raises - errors are logged.\"\"\"
    import yfinance as yf
    while True:
        for sym in symbols:
            try:
                price = float(yf.Ticker(sym).fast_info.last_price)
                if price > 0:
                    self.state.yahoo_prices[sym] = price   # the whole hand-off
            except Exception as exc:
                logger.debug("Yahoo fetch failed for %s: %s", sym, exc)
        time.sleep(config.YAHOO_POLL_INTERVAL)""",
        },
    },
    "interview": [
        {
            "q": "What is the difference between concurrency and parallelism, and which one does asyncio give you?",
            "a": "Concurrency is a structuring property: many tasks are in progress and interleaved, so progress on one overlaps waiting on another. Parallelism is an execution property: work happens at the same instant on multiple cores. asyncio gives concurrency only — one thread, cooperative scheduling, thousands of tasks — so it wins when the time goes on waiting for sockets and feeds, and buys nothing when the time goes on computing. Three network calls of 3, 2 and 1 seconds take 3 seconds under `gather`; three one-second CPU loops still take three.",
            "level": "warm-up",
            "skill": "python.event-loop",
        },
        {
            "q": "You call an async function and nothing happens. Why?",
            "a": "Calling a coroutine function returns a coroutine object; it does not execute the body. Something has to drive it — `await`, `asyncio.create_task`, `asyncio.gather`, or `asyncio.run` at the top. Without that the object is discarded and CPython emits a `RuntimeWarning: coroutine ... was never awaited`, which is easy to lose in a log. It is also worth checking whether the caller is even async: if a synchronous function calls a coroutine function, no amount of `await` in the callee helps, and `inspect.iscoroutinefunction` on both sides settles the argument.",
            "level": "warm-up",
            "skill": "python.coroutines",
        },
        {
            "q": "Why don't threads speed up CPU-bound Python, and what do you use instead?",
            "a": "CPython's global interpreter lock lets one thread execute bytecode at a time, so four threads doing pure Python arithmetic interleave rather than scale — you pay context switches for no throughput. Threads still help for blocking I/O, because the lock is released around a socket, disk or network wait. For real CPU parallelism use processes (`multiprocessing`, `ProcessPoolExecutor`), accepting separate memory and a serialisation cost at the boundary, or push the loop into a library that releases the GIL while it works, which is what a vectorised numpy operation does.",
            "level": "core",
            "skill": "python.gil",
        },
        {
            "q": "A bot stops receiving market data for seconds at a time, then catches up. How do you diagnose it?",
            "a": "That pattern is a blocked event loop, not a network problem: while one coroutine refuses to yield, the socket reader never runs and the data queues up in the kernel. First confirm it — run the loop with `debug=True` or `PYTHONASYNCIODEBUG=1`, which logs any callback that holds the loop for more than 100 ms, and add timing around the suspect hook. Then find the offender, which is nearly always `time.sleep`, a blocking HTTP client, a synchronous database driver, or a heavy numeric loop. Move it off the loop with `asyncio.to_thread` or a process pool, and re-measure the same way.",
            "level": "core",
            "skill": "python.non-blocking",
        },
        {
            "q": "Why give an asyncio.Queue a maxsize, and what do you do when the consumer cannot keep up?",
            "a": "`maxsize` makes `put()` wait when the queue is full, which pushes backpressure onto the producer and bounds memory. Unbounded, a fast feed and a slow strategy produce a deep queue, and depth is age: you keep full throughput while acting on prices that are seconds stale. For market data the right answer is usually not to queue at all — keep the latest snapshot per symbol and overwrite it, or coalesce updates so the consumer always gets the newest book. Queue everything you must not lose, such as fills and acks; drop what only the freshest value of matters.",
            "level": "core",
            "skill": "python.asyncio-queue",
        },
        {
            "q": "The event loop is single-threaded. Do you still need a lock?",
            "a": "Sometimes. You do not get the pre-emptive data races threads give you, because a task yields only at an `await`, so a sequence of plain statements between awaits is atomic. What survives is the logic race: read shared state, `await` something, then write a value derived from the stale read — the other task ran in that gap. Guard that span with `asyncio.Lock` if it must be serialised, or restructure so the state has one owner and the other tasks talk to it through a queue. `threading.Lock` is the wrong tool inside a coroutine: it blocks the loop rather than yielding.",
            "level": "core",
            "skill": "python.async-races",
        },
        {
            "q": "Design the reconnect path for a WebSocket market-data client.",
            "a": "Wrap the whole connect-and-read cycle in a loop, catch `ConnectionClosed` and `OSError` around it rather than inside the strategy, and back off exponentially with a cap and some jitter — `delay = min(delay * 2, 30)` — so a venue restart does not get a thundering herd from every bot at once, and reset the delay after a successful handshake. On reconnect, discard derived state: rebuild the local book rather than resuming from a stale one, and re-subscribe. Cancel the sibling tasks with the connection so a trading loop does not keep firing orders at a dead socket, and treat a clean close and an abnormal drop as the same event.",
            "level": "senior",
            "skill": "python.reconnect",
        },
        {
            "q": "Your signal needs a blocking C library that takes 20 ms per call, and the tick budget is 500 ms. Walk through the options.",
            "a": "First check whether it must be on the tick path at all — a cached or periodically refreshed value often removes the problem. If it must run per tick, `asyncio.to_thread` is the one-liner and is correct when the library releases the GIL while it works, which most C extensions doing real work do; if it holds the GIL, the thread starves the loop anyway and you need a process pool and the serialisation cost with it. Use `run_in_executor` with your own bounded pool when you need to limit concurrency. Whatever you pick, keep a deadline: if the result is not back in time, skip the tick rather than queue a stale decision.",
            "level": "senior",
            "skill": "python.multiprocessing",
        },
    ],
}

SESSIONS = [s0, s1, s2]
