"""focus.js session objects for FINM 33500 — the two parts of Session 9.

Resequenced 2026-10-11: the old Sessions 8 (CI/CD, s8 = part 9a, cited as
"Deck Week 9a") and 9 (integration & finale, s9 = part 9b, "Deck Week 9b") are
taught together on Fri Dec 4; tools/build_focus.py merges them into one entry.

Grounded in deck_w8.txt / deck_w9.txt, labs/week08.md / week09.md, the
session 8 and 9 speaker guides, and the AlgoArena repo itself.
Every `code` snippet has been executed with python3; the trailing `#` lines
are the real captured stdout.
"""

s8 = {
    "n": 9,  # part 9a (source week 8)
    "focus": "CI/CD, testing & reproducibility",
    "tagline": "A green run on your laptop proves nothing — the bar is 1,286 tests in twenty seconds, seeded, network-free, and running the same way on a clean runner.",
    "concepts": [
        {
            "title": "Push the logic down the pyramid, and read the coverage report",
            "text": "Many fast unit tests at the base, a few integration tests above them, a handful of end-to-end runs at the top. A unit test drives one function with no I/O in milliseconds; an integration test wires a couple of pieces together with no network; an end-to-end run drives a whole session and tells you that something broke rather than what. The numbers make the argument: the platform's suite is 1,286 tests in about 20 seconds, and test_orderbook.py plus test_arena_sdk.py alone is 82 tests in 0.13 seconds. Coverage then tells you where the holes are, not how good the tests are — it proves execution, not correctness, so the Missing column is the useful part. Where to aim high is a design decision: shared/orderbook.py is held at 100% because a wrong fill corrupts every downstream P&L.",
            "deck": "Deck Week 9a · slides 5, 10",
        },
        {
            "title": "A test is a function, an assert, and a name",
            "text": "pytest collects files named test_*.py and functions named test_*, then runs them and rewrites plain asserts into rich failure diffs. Name the test after the behaviour it pins, not the function it calls: test_momentum_goes_long_on_uptrend tells you what broke from the failure line alone. One behaviour per test. The discovery loop below is the whole mechanism in two lines — find the callables whose names start with test_, call them, and let an AssertionError be the failure.",
            "code": """def momentum(prices, lookback=10, band=0.002):        # pure: no I/O, no clock
    if len(prices) < lookback + 1: return 0
    chg = prices[-1] / prices[-lookback - 1] - 1.0
    return 1 if chg > band else (-1 if chg < -band else 0)

def test_long_on_uptrend(): assert momentum([100 + i * .5 for i in range(30)]) == 1
def test_flat_on_no_trend(): assert momentum([100.0] * 30) == 0

for name, fn in sorted(globals().items()):
    if name.startswith("test_"): fn(); print(name, "passed")
# test_flat_on_no_trend passed
# test_long_on_uptrend passed""",
            "deck": "Deck Week 9a · slide 6",
        },
        {
            "title": "Fixtures and parametrize make the input space visible",
            "text": "A fixture is reusable setup injected by argument name and torn down per test — use one instead of a module-level Portfolio(10_000), or test four fails because test two spent the cash and the failure moves when you reorder. @pytest.mark.parametrize runs one test over a table of inputs and reports each case as its own pass or fail, so a red run names the input that broke. Parametrize is not about saving typing; you read the coverage of a behaviour straight off the decorator. The cases that matter are the boring ones — [100.0, 101.0] for not enough history, [] for a cold start or an empty book.",
            "code": """def momentum(prices, lookback=10, band=0.002):
    if len(prices) < lookback + 1: return 0          # cold start: no view
    chg = prices[-1] / prices[-lookback - 1] - 1.0
    return 1 if chg > band else (-1 if chg < -band else 0)

cases = [([100 + i * .5 for i in range(30)], 1), ([100.0] * 30, 0),
         ([100 - i * .5 for i in range(30)], -1), ([100.0, 101.0], 0), ([], 0)]
bad = [(p[:2], want, momentum(p)) for p, want in cases if momentum(p) != want]
print(f"{len(cases) - len(bad)}/{len(cases)} cases pass", bad)
# 5/5 cases pass []""",
            "deck": "Deck Week 9a · slide 7",
        },
        {
            "title": "Mock the boundary, test the logic",
            "text": "Never touch the real network in a unit test. A mock records calls and returns whatever you configured, a fake is a small working implementation, and monkeypatch swaps an attribute at runtime and puts it back afterwards. Prefer the hand-written fake at a boundary you own: nine lines, no library, and it fails loudly when the real interface changes, whereas a mock that return_values everything passes forever — including after you break the code. Coroutines need an explicit @pytest.mark.asyncio in this repo, because there is no pytest.ini and therefore no asyncio_mode; without the marker pytest calls the function, gets a coroutine it never awaits, and reports a pass.",
            "code": """import asyncio
class FakeMarket:                              # a hand-written fake, not a mock
    def best_bid(self, s): return None         # the market maker just died
    def best_ask(self, s): return None
def edge(market, sym):
    bid, ask = market.best_bid(sym), market.best_ask(sym)
    return None if not (bid and ask) else ask - bid
async def test_no_order_on_a_dead_book():
    await asyncio.sleep(0)                     # a real await
    assert edge(FakeMarket(), "AAPL") is None; print("dead book -> no order")
asyncio.run(test_no_order_on_a_dead_book())
# dead book -> no order""",
            "deck": "Deck Week 9a · slide 8",
        },
        {
            "title": "Determinism is what makes CI possible",
            "text": "A flaky test is worse than no test: one failure in twenty runs trains the team to ignore red, which defeats the point of having a gate. Three sources, three fixes — seed the randomness, keep the network out, and pass the clock and the ids in rather than calling datetime.now() or uuid4() deep in a decision path. SimSession.run(seed=3) does the first of those for a whole season, which is why two runs must produce identical leaderboards. And this is not hygiene for its own sake: a CI runner has no internet by design, so a deterministic, network-free session is the only end-to-end test the pipeline can execute.",
            "code": """import random

def session(seed=None):
    if seed is not None: random.seed(seed)
    return [round(100 + random.gauss(0, 1), 4) for _ in range(5)]

print("seeded runs agree :", session(3) == session(3))
random.seed(0); a, b = session(), session()
print("unseeded runs agree:", a == b)
# seeded runs agree : True
# unseeded runs agree: False""",
            "deck": "Deck Week 9a · slide 9",
        },
        {
            "title": "Pin, isolate, containerise — and the pipeline is the gate",
            "text": "CI runs the suite on every push and pull request on a clean machine, and merge is blocked until the checks pass: the tests you wrote become the contract for what enters main. A workflow is YAML under .github/workflows/ — on: triggers it, jobs: run in parallel, steps: run in order, matrix: fans one job across versions, uses: reuses an action and run: runs a shell command. Then make the runner's answer match yours: pin with == rather than >=, isolate in a venv, and freeze OS plus deps plus code in an image with layers ordered stable to volatile, so COPY requirements.txt and pip install sit above COPY . . and a code change does not reinstall the world. Config (ports, poll interval) is plain env vars; secrets are injected at runtime and never enter git or the image.",
            "code": """import itertools
matrix = {"python": ["3.11", "3.12"], "os": ["ubuntu-latest"]}
jobs = [dict(zip(matrix, combo)) for combo in itertools.product(*matrix.values())]
for j in jobs: print("runner:", j)
print(len(jobs), "runners from one job definition")
# runner: {'python': '3.11', 'os': 'ubuntu-latest'}
# runner: {'python': '3.12', 'os': 'ubuntu-latest'}
# 2 runners from one job definition""",
            "deck": "Deck Week 9a · slides 12–15",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "Testing a strategy starts by cutting it in two. The decision becomes a pure function of prices — momentum(prices, lookback, band), no I/O, no clock, no globals — and on_tick shrinks to an adapter that reads the book, calls it, and returns a Signal. The pure half runs in microseconds, so a hundred cases cost nothing; the adapter half only needs the seams: empty book, one-sided book, insufficient cash, a None return. The lab builds exactly that split, then as_signal_fn hands the same object to the simulator, so the code you tested is the code that trades.",
            "An offline result is believable only when it reproduces. Seed the session and two runs must produce identical leaderboards; if they do not, you have unseeded randomness, a datetime.now(), a uuid4(), or iteration over an unstably-hashed set somewhere in the decision path. That is not cosmetic. A number you cannot reproduce cannot be debugged, defended in a demo, or compared against the next version of the signal — so every backtest claim you make rests on determinism first and on the strategy second.",
            "The tests that protect capital are the ugly ones. Drive on_tick with a fake market whose best_ask returns None and whose price history is all NaN, and assert it returns None instead of raising — a raising on_tick in a live session is a bot that has silently stopped trading while the dashboard watches. Then pin the kill switch: push realised P&L past the daily-loss threshold and assert on_tick returns None from then on. Pinned dependencies belong in the same category, because a floating version that shipped an API change is a bot that fails to import at 6 p.m.",
            "Fee arithmetic is where money leaks quietly, which is why the matching engine is held at 100% coverage: one wrong fill corrupts every P&L downstream. The sign convention is the thing to assert. Under the default maker/taker schedule the aggressor pays TAKER_FEE_RATE, 0.0015 of notional, and the resting side earns MAKER_REBATE_RATE, 0.0010 — so a bot that flips every tick is a fee machine with a strategy attached. A test that a taker fill debits cash and a maker fill credits it kills a whole class of accounting bug.",
            "Shipping ends at observability, not at a green badge. Give yourself one surface — a rich table or an equity plot written on exit showing position, cash, P&L and whether the kill switch is armed — because you cannot fix what you cannot see. The venue-level version is the dashboard's STATS tab, where MAKER % and NET FEES are the two most diagnostic numbers on the platform. Neither helps unless you wrote down the healthy baseline while the market was calm: fills per ten seconds, net worth, maker share.",
        ],
        "example": {
            "title": "In the arena",
            "text": "tests/test_orderbook.py — the suite your own file imitates: a fixture builds a fresh book per test, two helpers remove the copy-paste, and each test pins one behaviour of the matching engine by name.",
            "code": """# tests/test_orderbook.py
@pytest.fixture
def ob():
    return OrderBook("AAPL", fee_rate=0.001)

def place_buy(ob, team, price, qty, order_type="limit"):
    return ob.place_order(team, "buy", price, qty, order_type)

class TestResting:
    def test_limit_buy_rests_in_empty_book(self, ob):
        order, trades = place_buy(ob, "t1", 100.0, 10)
        assert trades == []
        assert order.remaining == 10
        assert ob.best_bid() == 100.0
        assert ob.best_ask() is None""",
        },
    },
    "interview": [
        {
            "q": "How does pytest find your tests, and why does it let you use a plain assert?",
            "a": "It collects files matching test_*.py, functions named test_*, and classes named Test*, then runs each one as a separate report line. Plain assert works because pytest rewrites assert statements during import to capture the operands, so a failure shows both sides of the comparison instead of just 'AssertionError' — no assertEqual boilerplate. Day to day you run `pytest -q` for a quiet summary and `pytest -k momentum` to filter by name while iterating.",
            "level": "warm-up",
            "skill": "tools.pytest",
        },
        {
            "q": "Distinguish a mock, a fake and monkeypatch, and say which you would reach for at a market-data boundary.",
            "a": "A mock is a stand-in that records calls and returns whatever you configured; a fake is a small working implementation of the same interface; monkeypatch swaps an attribute or env var for the duration of one test and restores it afterwards. At a boundary you own I write the fake: a nine-line FakeMarket with best_bid/best_ask/prices fails loudly the day the real interface changes, whereas a mock configured to return_value everything keeps passing after you break the code. monkeypatch is for the third-party edge you cannot inject cleanly.",
            "level": "warm-up",
            "skill": "tools.mocking-async",
        },
        {
            "q": "A suite passes twice and fails on the third run. Where do you look, and what is the fix?",
            "a": "Unseeded randomness, a wall-clock call or uuid4() buried in the logic, iteration order over sets or dicts keyed by unstably-hashed objects, shared mutable state leaking between tests, or a real network call. The fixes are mechanical: seed the RNG, inject the clock and the id generator as parameters, use a fixture so each test gets fresh state, and replace the network with a fake or a recorded fixture. Until it is deterministic you are not entitled to call it a flake — with the seed fixed, a red test fails the same way every time and can actually be debugged.",
            "level": "core",
            "skill": "tools.determinism",
        },
        {
            "q": "Your async test reports a pass but the assertion inside it never executed. Explain.",
            "a": "Calling a coroutine function returns a coroutine object and runs nothing. If there is no asyncio plugin mode configured and no @pytest.mark.asyncio, pytest calls the function, gets that object, never awaits it, and records a pass with at most a RuntimeWarning about a coroutine that was never awaited. The fix is the explicit marker on every coroutine test (or asyncio_mode = auto in the config), and the defensive habit is to make a new async test fail on purpose once to prove it is really running.",
            "level": "core",
            "skill": "tools.mocking-async",
        },
        {
            "q": "You have 100% line coverage and still shipped a bug. What does coverage not tell you?",
            "a": "Coverage records that a line executed, not that anything was asserted about its result, and line coverage says nothing about which branch combinations ran. So a suite of smoke calls with no assertions can score 100%. The useful part of the report is the Missing column — code no test has ever entered. To distinguish real tests from decorative ones, delete a line of production logic and see whether anything goes red; that is mutation testing in one sentence.",
            "level": "core",
            "skill": "tools.test-pyramid",
        },
        {
            "q": "Why pin dependencies with == rather than >=, and why does the order of Dockerfile layers matter?",
            "a": "Pinning does not prevent upstream breakage, it controls when you find out: with websockets>=12.0 your CI goes red on a commit that touched only a README, because a new release changed an API. With ==12.0 the upgrade is a deliberate commit you can test. Layers matter because each COPY or RUN is cached by content: put COPY requirements.txt and pip install above COPY . . and a code change reuses the installed-deps layer, while the reverse order reinstalls everything on every build. Order stable to volatile.",
            "level": "core",
            "skill": "tools.docker",
        },
        {
            "q": "Your pipeline takes 25 minutes. What do you change, and what stays in the merge gate?",
            "a": "At 25 minutes people stop waiting for it, then stop trusting it, then merge around it, so I would split the workflow by cost. The gate on every push is the fast deterministic layer — unit tests plus one seeded, network-free end-to-end run — cached deps, matrix jobs in parallel, fail-fast on. The slow work (long simulations, multi-seed sweeps, container builds) moves to a nightly or merge-queue job that reports rather than blocks. The target is a gate you are willing to wait for: this platform runs 1,286 tests in roughly 20 seconds, and that is deliberate.",
            "level": "senior",
            "skill": "tools.github-actions",
        },
        {
            "q": "How would you test a trading bot's risk layer and its reconnection without any venue to connect to?",
            "a": "In-process, with fakes and a seeded simulator. For risk: construct the portfolio state directly, feed synthetic fills through on_fill until realised P&L breaches the daily-loss limit, and assert the next on_tick returns None and that a flatten order is emitted once, not every tick. For reconnection: run the client against a fake server you can drop, then await a reconnected event with a timeout and assert the bot re-synced state rather than trading on its stale view. Both are deterministic and run in CI, which is the only reason they get run at all.",
            "level": "senior",
            "skill": "tools.headless-sim",
        },
    ],
}

s9 = {
    "n": 9,  # part 9b (source week 9)
    "focus": "Integration & the live system",
    "tagline": "Every part passed its own tests; integration asks whether they honour each other's contracts while the leaderboard scores risk rather than return.",
    "concepts": [
        {
            "title": "Integration correctness is a different claim",
            "text": "Unit correctness says each object honours its own contract in isolation, and 1,286 tests establish that here. Integration correctness says the objects honour each other's contracts, wired together, live, under load. The properties that decide it — timing, ordering, back-pressure, shared state — are emergent and invisible to any single unit test. The classic seam bugs are ordering bugs: the signal fires faster than risk can veto it, a fill arrives before its ack, two messages race on the book, one side sends price as a float while the other rounds to ticks and both are individually correct. Test the conversation, not just the speakers.",
            "deck": "Deck Week 9b · slide 5",
        },
        {
            "title": "The wire contract is the integration contract",
            "text": "Three independent processes — broker, exchange, trader — speak only Pydantic models from shared/messages.py, with a type discriminator that parse_message dispatches on. Every arrow between them is a seam, so the natural unit test for a seam is a round trip: dump to JSON, parse back, assert the object is identical. If it round-trips, the two sides agree about the payload; what remains to test is the timing and the ordering. This is also a responsibility diagram rather than a data-flow diagram — the exchange owns the truth, the broker owns liquidity, your bot owns its decisions — and confusion about who owns what is the root cause of most live incidents.",
            "code": """import json
from typing import Literal
from pydantic import BaseModel

class PortfolioUpdate(BaseModel):                  # the seam's contract
    type: Literal["portfolio_update"] = "portfolio_update"
    team_id: str; positions: dict[str, int]; realized_pnl: float; net_worth: float
sent = PortfolioUpdate(team_id="t1", positions={"AAPL": 3},
                       realized_pnl=-0.95, net_worth=163296.40)
back = PortfolioUpdate.model_validate(json.loads(sent.model_dump_json()))
print("round-trip identical:", back == sent, back.positions)
# round-trip identical: True {'AAPL': 3}""",
            "deck": "Deck Week 9b · slide 6",
        },
        {
            "title": "Live systems fail partially, not all at once",
            "text": "The socket stays up while the price behind it dies. The broker's Yahoo poll stalls, the mark stops moving, and you keep quoting confidently around a number nobody stands behind. Kill the market maker and the touch goes one of two ways depending on the venue: with CANCEL_ON_DISCONNECT the venue pulls the dead seat's orders and best_bid, best_ask and spread start returning None within a tick, so any arithmetic on the touch raises; without it the dead quotes persist and your arithmetic succeeds against a corpse. Handle both — guard the touch before it reaches a Signal, and keep a last-change tick per symbol so a price that stopped moving stops your quoting.",
            "code": """class Feed:
    def __init__(self): self.px, self.moved_at = 100.0, 0
    def see(self, px, tick):
        if px != self.px: self.px, self.moved_at = px, tick
        return tick - self.moved_at            # ticks since the price last moved

f, ticks = Feed(), [100.0, 100.2, 100.2, 100.2, 100.2, 100.2]
ages = [f.see(px, t) for t, px in enumerate(ticks, start=1)]
print("ages", ages, "| stale from tick", 1 + next(i for i, a in enumerate(ages) if a > 2))
# ages [1, 0, 1, 2, 3, 4] | stale from tick 5""",
            "deck": "Deck Week 9b · slide 8",
        },
        {
            "title": "Reconnect, then re-sync: the venue owns the truth",
            "text": "On ConnectionClosed you back off and reconnect — trader/trader.py retries every three seconds and clears its stale book — but reconnecting is not recovering. Positions self-heal, because the client assigns self.positions = dict(update.positions) on every PortfolioUpdate. Anything you accumulate yourself does not: in the lab the bot rejoins at Tick 0 believing it holds $100,000, net worth snaps back to $163,315 one tick later, and realized_pnl stays at +0.00 for the rest of the session. So keep a shadow ledger from on_fill, compare it against the exchange's positions every tick, log the mismatch loudly, and reset from portfolio.positions on rejoin. A retried order also needs an id, or retry logic is a double-fill machine.",
            "code": """shadow = {}                                    # accumulated from on_fill only
def on_fill(side, sym, qty):
    shadow[sym] = shadow.get(sym, 0) + (qty if side == "buy" else -qty)
on_fill("buy", "AAPL", 5); on_fill("sell", "AAPL", 2); venue = {"AAPL": 3}
print("before the drop, agree:", shadow == venue)
shadow.clear()                                 # the reconnect wiped local state
print("RECON MISMATCH AAPL: shadow=%d venue=%d" % (shadow.get("AAPL", 0), venue["AAPL"]))
shadow.update(venue)                           # re-sync from the source of truth
print("after re-sync, agree:", shadow == venue)
# before the drop, agree: True
# RECON MISMATCH AAPL: shadow=0 venue=3
# after re-sync, agree: True""",
            "deck": "Deck Week 9b · slides 8–9",
        },
        {
            "title": "The tearsheet: read the curve, then the numbers",
            "text": "One page answers two questions: did this make money, and how much risk did it take to do it. The equity curve comes first because the shape tells the story before any number does — a smooth 20% beats a jagged 40%, which is one bad tick from a blow-up. Then the numbers: Sharpe as mean excess return over the volatility of returns, max drawdown as the largest peak-to-trough fall and therefore the worst pain an investor sat through, Calmar as return over that drawdown, turnover as how much you traded to get there, and exposure as how much capital was at risk and on which side. Turnover is a cost, not a measure of effort.",
            "code": """from statistics import mean, pstdev
eq = [100_000, 101_200, 100_800, 102_500, 102_100, 103_900, 105_200]
r = [b / a - 1 for a, b in zip(eq, eq[1:])]
peak = mdd = 0.0
for v in eq: peak = max(peak, v); mdd = max(mdd, (peak - v) / peak)
ret = eq[-1] / eq[0] - 1
print(f"return {ret:+.2%} vol {pstdev(r):.4f} sharpe {mean(r) / pstdev(r):.2f}")
print(f"maxDD {mdd:.2%} calmar {ret / mdd:.1f}")
# return +5.20% vol 0.0090 sharpe 0.94
# maxDD 0.40% calmar 13.2""",
            "deck": "Deck Week 9b · slide 12",
        },
        {
            "title": "Risk-adjusted scoring: the steady book wins",
            "text": "Raw return is the most misleading number in finance — the same +30% can be an edge or a coin flip that landed right, and maximum leverage on one bet wins the year it works and ends the season it does not at zero. So exchange/scoring.py ranks on a risk-adjusted score, per role, announced in week one: mean excess return over max(vol, VOL_FLOOR), multiplied by max(0, 1 - 2·max_drawdown) and clamped. Two details do real work. Returns are measured net of the risk-free cash drift, so parking cash scores about zero instead of dominating; and the denominator is floored, so a near-flat curve cannot produce an astronomical ratio. The snippet reproduces the lab's two curves exactly.",
            "code": """from statistics import mean, pstdev
def score(eq, rf=1.000002 ** 60 - 1, floor=1.2e-4, pen=2.0):
    r = [b / a - 1 for a, b in zip(eq, eq[1:])]
    mdd = max((max(eq[:i + 1]) - v) / max(eq[:i + 1]) for i, v in enumerate(eq))
    ratio = min(10.0, (mean(r) - rf) / max(pstdev(r), floor))   # Sharpe-like
    return ratio * max(0.0, 1 - pen * mdd), mdd                 # drawdown always hurts
steady = [100_000 * 1.01 ** k for k in range(13)]
jagged = [100_000, 118_000, 96_000, 121_000, 99_000, 125_000, 101_000,
          128_000, 104_000, 130_000, 108_000, 126_000, steady[-1]]
for n, e in (("steady", steady), ("jagged", jagged)): s, d = score(e); print(f"{n} score {s:+.3f} maxDD {d:.2%} ret {e[-1] / e[0] - 1:+.2%}")
# steady score +10.000 maxDD 0.00% ret +12.68%
# jagged score +0.091 maxDD 19.20% ret +12.68%""",
            "deck": "Deck Week 9b · slides 13, 17",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "The signal-to-order pipeline is a chain of seams, and the seams are where the session is lost. on_tick reads a book snapshot, computes a number, risk vetoes or passes it, an order goes on the wire, an ack comes back, a fill follows, the portfolio marks, the leaderboard updates. Each hop is a contract between two processes that were tested separately. Where it breaks is ordering: a fill that lands before its ack, a signal that fires again before risk has seen the first order, a float price that the venue rounds to a tick. A round-trip test proves the payload; only a wired-up run proves the sequence.",
            "Offline honesty decides where you are allowed to test. End-to-end runs over live data are flaky by construction — the feed moves, the counterparties change, the failure does not reproduce — so the seeded, network-free simulator is the first venue for every claim, and the live session is confirmation rather than discovery. That is also what a smoke test is for: one fast pass over the critical path, does it start, connect, place one order and score. A green end-to-end run is proof the system was healthy once, on that data; observability is what tells you about now.",
            "What protects capital live is degradation, not perfection. Guard the touch so a one-sided book returns None rather than raising, because a raising on_tick is a bot that quietly stopped trading. Detect staleness explicitly, since 'the connection is up' is not 'the data is good'. Bound your queues and shed load when messages arrive faster than you process them. Lose the model and fall back to flat rather than to garbage orders — fail loudly at the seam, fail safe at the edge. And give every order a client id so a retry after a dropped socket is a no-op instead of a double fill.",
            "Your ledger and the venue's will disagree, and the reconnect is when you find out. Positions self-heal because the exchange overwrites them on every PortfolioUpdate; realised P&L, fill counts and your kill switch's loss tally do not, which is why the lab's bot comes back with the right net worth and a realized_pnl of +0.00 that stays wrong all session. Keep a shadow ledger from on_fill, diff it every tick, and treat a mismatch as a page: it means a fill you missed or double-counted. Then confirm the story offline from the tape with scripts/tca_report.py.",
            "Costs and risk are the two things the tearsheet must not flatter. tca_report.py gives you fills, volume, buy/sell split, maker versus taker mix, fees against rebates, and execution quality against the prevailing mid at each fill — set that beside your walk-forward estimate and explain the gap, because turnover is where an edge quietly goes. Then accept the ranking: the same +12.68% return scores +10.000 as a steady curve and +0.091 as a jagged one with a 19.2% drawdown. Defend the process, not the P&L, and remember that one seed is one sample.",
        ],
        "example": {
            "title": "In the arena",
            "text": "exchange/scoring.py — score_equity() is the function that ranks the season, and it is the same code the live venue and the offline sim both call, so a tearsheet you compute yourself is comparable with the leaderboard.",
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
    },
    "interview": [
        {
            "q": "What is the difference between unit correctness and integration correctness?",
            "a": "Unit correctness means each component honours its own contract in isolation — the matching engine matches, the risk check vetoes, the message model validates. Integration correctness means those components honour each other's contracts when wired together under load, which depends on timing, ordering, back-pressure and shared state. Those properties are emergent, so no single unit test can see them: a system can be made entirely of green components and still be wrong at the seams.",
            "level": "warm-up",
            "skill": "tools.test-pyramid",
        },
        {
            "q": "You have thirty seconds before a live session and one command. What do you run, and what is it for?",
            "a": "A smoke test: one fast pass over the critical path — does the process start, connect and handshake, place one order and get an ack, and produce a score. Here that is the seeded offline session, which needs no network and finishes in seconds. It is not a substitute for the suite; it catches the obvious 90% — a broken import, a missing env var, the wrong venue address — which is exactly the class of failure that embarrasses you at the open. Running the full suite instead means you have not thought about the thirty seconds.",
            "level": "warm-up",
            "skill": "tools.smoke-test",
        },
        {
            "q": "The socket is healthy and the price looks plausible, but the feed has gone stale. How do you detect that, and what should the bot do?",
            "a": "Liveness of the connection is not freshness of the data, so I track freshness directly: store the last price and the tick or timestamp at which it last changed, per symbol, and treat age since the last change as a first-class metric. Past a threshold the symbol is cold — stop quoting it, widen dramatically, or flatten, and log it as an anomaly rather than trading on a mark nobody stands behind. The same check catches the subtler case where a market maker died but its resting quotes were never cancelled, so the touch keeps answering with a dead price.",
            "level": "core",
            "skill": "tools.failure-modes",
        },
        {
            "q": "Your bot reconnects after the venue restarts. Which parts of its state are trustworthy and which are not?",
            "a": "Anything the venue sends you is trustworthy, because it overwrites yours: positions arrive on every portfolio update, so they self-heal within a tick. Anything you accumulated locally does not — realised P&L, fill counts, rolling signal statistics, a daily-loss tally — because the reconnect reset your object while the venue kept the truth. So on rejoin I re-sync from the venue's snapshot, reset derived counters from it rather than carrying a fiction, and run a reconciliation check every tick that diffs my fill-derived shadow ledger against the venue's positions and logs any mismatch as an incident.",
            "level": "core",
            "skill": "trading.reconciliation",
        },
        {
            "q": "Why is retry logic without idempotency dangerous, and how do you make an order retry safe?",
            "a": "Because a timeout tells you nothing about whether the venue received the order. Retrying a send that actually landed gives you two live orders and, in a fast market, two fills and double the intended position — the failure mode shows up precisely on the night the network is bad. The fix is to tie the action to an identity: generate a client order id, send it with the order, and have the venue treat a repeat of the same id as a no-op that returns the original ack. Then a replay is idempotent, and you can assert that in a test that sends the same id twice and expects one position change.",
            "level": "core",
            "skill": "tools.failure-modes",
        },
        {
            "q": "Two bots finish the season with identical net worth. Which one do you hire, and what do you ask to see?",
            "a": "The steadier one, and I would want the mechanism rather than the curve. Concretely: volatility of returns and the Sharpe that follows, max drawdown and where it happened, turnover and the fee split between taker cost and maker rebate, hit rate with average win against average loss, and the number of trades — three winners prove nothing, a hundred with positive expectancy is an edge. Then I would ask what the thesis is and whether the result survives a different seed or period, because a good process can have a bad week and a bad process can get lucky.",
            "level": "core",
            "skill": "quant.performance-metrics",
        },
        {
            "q": "Design a season score that cannot be won by parking the cash or by one maximally levered bet.",
            "a": "Score risk-adjusted return, not final equity. Take per-snapshot returns, subtract the risk-free drift so an idle all-cash book has roughly zero excess return, divide by the volatility of returns with the denominator floored so a near-constant curve cannot produce an astronomical ratio, then multiply by a drawdown penalty like max(0, 1 - 2·maxDD) so a 25% drawdown halves you, and clamp the result. Penalise by sign, so a big drawdown makes a negative score worse rather than pulling it toward zero — otherwise the most levered loser ranks highest. Rank within role, and announce the formula up front so it shapes behaviour instead of surprising people.",
            "level": "senior",
            "skill": "quant.risk-adjusted-score",
        },
        {
            "q": "What belongs in a run-book, and what makes a postmortem worth the hour it takes to write?",
            "a": "A run-book is one page per known failure in the form symptom, diagnosis, action — 'no fills and retry lines in the log: confirm the venue is up, confirm the token, let the backoff run, reset the shadow ledger from the venue's positions on rejoin'. It is written cold and used hot, because under pressure you follow steps rather than reasoning from first principles. A postmortem is blameless and system-focused: timeline, root cause via five whys, impact, and fixes with owners. It earns its hour only if the root cause is specific — a missing test, not a person — and if it ends as a regression test in the suite. A postmortem with no root cause is a diary.",
            "level": "senior",
            "skill": "tools.runbook",
        },
    ],
}

SESSIONS = [s8, s9]
