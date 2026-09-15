"""FOCUS slices for FINM 33500 sessions 3, 4 and 5.

Every `code` snippet in this module was executed with python3 (3.13) and its
trailing `#` comment lines are the real captured stdout.
"""

SESSIONS = [

# ─────────────────────────────────────────────────────────────── session 3 ──
{
    "n": 3,
    "focus": "Sockets, WebSockets & typed message protocols",
    "tagline": "Bytes are not messages: frame them, upgrade the connection once, then let a pydantic model reject a bad order at the edge instead of three layers deep in the matching engine.",
    "concepts": [
        {
            "title": "TCP hands you bytes, not messages",
            "text": "TCP is a reliable, ordered byte stream with no message boundaries. Two sendall calls can arrive as one recv, and one call can arrive split across two. In the week-3 lab three sends came back as two receives: the first glued two JSON objects together and cut a third in half. json.loads raises on either buffer. There are exactly three fixes — a delimiter, a length prefix, or a protocol that frames for you.",
            "code": """import json, struct
glued = b'{"type":"place_order"}{"type":"cancel_order"}'      # two sends, one recv
try: json.loads(glued)
except json.JSONDecodeError as e: print("unframed ->", e.msg)
frame = lambda p: struct.pack("!I", len(p)) + p
wire = frame(b'{"type":"place_order"}') + frame(b'{"type":"cancel_order"}')[:9]
msgs, i = [], 0
while i + 4 <= len(wire) and i + 4 + struct.unpack("!I", wire[i:i + 4])[0] <= len(wire):
    n = struct.unpack("!I", wire[i:i + 4])[0]; msgs.append(wire[i + 4:i + 4 + n]); i += 4 + n
print("framed ->", len(msgs), "complete,", len(wire) - i, "bytes buffered")
# unframed -> Extra data
# framed -> 1 complete, 9 bytes buffered""",
            "deck": "Deck Week 3 · slide 6 · slide 11",
        },
        {
            "title": "One upgrade, then full duplex and framed",
            "text": "A WebSocket starts as an ordinary HTTP GET carrying Upgrade: websocket and a random Sec-WebSocket-Key. The server replies 101 Switching Protocols and echoes back the SHA-1 of your key concatenated with a fixed RFC 6455 GUID — that is how the client knows it reached a real WebSocket server and not a cache. From then on the same TCP connection is full-duplex and framed: one await ws.recv() returns exactly one message, never half and never two. HTTP polling gives you neither; SSE is server-to-client only, and a trader must also send orders.",
            "code": """import base64, hashlib
GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"       # RFC 6455, same on every server
key = "dGhlIHNhbXBsZQ=="                           # the client's Sec-WebSocket-Key
accept = base64.b64encode(hashlib.sha1((key + GUID).encode()).digest()).decode()
print("HTTP/1.1 101 Switching Protocols")
print("Sec-WebSocket-Accept:", accept)
# HTTP/1.1 101 Switching Protocols
# Sec-WebSocket-Accept: OEPSNnbvaxYns+EYSv7+c2kBj+o=""",
            "deck": "Deck Week 3 · slides 9–10",
        },
        {
            "title": "A protocol is a versioned contract",
            "text": "Framing says where a message ends; it says nothing about what the message means. The contract does: which types exist, what fields each carries, who may send it, and what a valid reply is. PlaceOrder from a client is answered by OrderAck from the venue. Contracts outlive their first release, so you evolve them by adding optional fields with defaults and never by repurposing an existing one. queue_ahead, maker_rebate and microprice were all added to AlgoArena mid-season that way, and no older bot broke.",
            "code": """from typing import Literal
from pydantic import BaseModel
class OrderAck(BaseModel):
    type: Literal["order_ack"] = "order_ack"
    order_id: str
    price: float
    queue_ahead: int = 0          # added mid-season: optional, with a default
old = '{"type":"order_ack","order_id":"a1","price":309.48}'   # a pre-upgrade client
ack = OrderAck.model_validate_json(old)
print("parsed, queue_ahead =", ack.queue_ahead,
      "| round-trip equal:", OrderAck.model_validate_json(ack.model_dump_json()) == ack)
# parsed, queue_ahead = 0 | round-trip equal: True""",
            "deck": "Deck Week 3 · slide 14",
        },
        {
            "title": "Typed models beat raw dicts",
            "text": "A dict is a bag of maybe-there keys: msg['quatity'] is a KeyError at runtime, mid-session, and optional-versus-required is folklore you recover by reading every producer. A pydantic model makes the shape code the machine enforces on every parse. A Literal makes side='long' unrepresentable rather than merely detected later, and Field(gt=0) kills a zero-quantity order at the boundary. The class definition is also the authoritative spec — the model is the documentation.",
            "code": """from typing import Literal
from pydantic import BaseModel, Field, ValidationError
class PlaceOrder(BaseModel):
    symbol: str
    side: Literal["buy", "sell"]        # 'long' is unrepresentable, not just wrong
    quantity: int = Field(gt=0)
for bad in ({"symbol": "AAPL", "side": "long", "quantity": 1},
            {"symbol": "AAPL", "side": "buy", "quantity": 0}):
    try: PlaceOrder(**bad)
    except ValidationError as e: print(e.errors()[0]["loc"], "-", e.errors()[0]["msg"])
# ('side',) - Input should be 'buy' or 'sell'
# ('quantity',) - Input should be greater than 0""",
            "deck": "Deck Week 3 · slides 15–16",
        },
        {
            "title": "Discriminated unions dispatch on `type`",
            "text": "One connection carries many kinds of message, so every message carries a discriminator: its type field. A union keyed on that field lets the parser pick the right model in one step instead of guessing the shape. AlgoArena splits its 21 types into two such unions by direction — AnyClientMessage is what you send, AnyExchangeMessage is what you receive — and parse_message dispatches either one on its tag. With TypeAdapter, pydantic does the selection and the validation together.",
            "code": """from typing import Annotated, Literal, Union
from pydantic import BaseModel, Field, TypeAdapter
class OrderAck(BaseModel):
    type: Literal["order_ack"] = "order_ack"; order_id: str
class TradeExecution(BaseModel):
    type: Literal["trade_execution"] = "trade_execution"; price: float; fee: float
parse = TypeAdapter(Annotated[Union[OrderAck, TradeExecution], Field(discriminator="type")]).validate_python
for raw in ({"type": "order_ack", "order_id": "a1"},
            {"type": "trade_execution", "price": 309.81, "fee": 0.4647}):
    print(type(parse(raw)).__name__)
# OrderAck
# TradeExecution""",
            "deck": "Deck Week 3 · slide 17 · slide 21",
        },
        {
            "title": "Three ways input is wrong, and none may kill the session",
            "text": "Decide up front what happens when a message is bad. Malformed — a missing field, a bad enum — gets rejected with a clear error before it reaches business logic. An unknown type, from a newer peer or a typo, gets logged and skipped. Unparseable input is not even JSON; catch the decode error, and consider closing only if it repeats. The venue's inbound guard is four lines and ends in continue, not raise: in the lab two junk frames both came back as ErrorMsg with the socket still open.",
            "code": """import json
from pydantic import BaseModel, ValidationError
class PlaceOrder(BaseModel):
    symbol: str; quantity: int
TYPES, log = {"place_order": PlaceOrder}, []
for raw in ('{"type":"place_order","symbol":"AAPL"}', '{"type":"place_ordr"}', 'nope'):
    try: TYPES[json.loads(raw)["type"]].model_validate(json.loads(raw))
    except json.JSONDecodeError: log.append("unparseable")
    except KeyError: log.append("unknown-type")
    except ValidationError: log.append("malformed")
print(log, "-> connection stays open")
# ['malformed', 'unknown-type', 'unparseable'] -> connection stays open""",
            "deck": "Deck Week 3 · slide 18",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "The wire is the last mile of the signal-to-order pipeline. Your strategy produces a number; that number only becomes a position by leaving the process as a PlaceOrder and coming back as an OrderAck and a TradeExecution. Every field on that round trip is a decision you can act on: order_type chooses whether you cross or rest, and queue_ahead on the ack tells you how many lots sit in front of you at your price. A bot that serialises by hand loses those fields quietly, and with them the ability to know whether it is ahead in the queue or behind.",
            "The protocol is also where live risk is contained. A public endpoint sees malformed frames, so one bad message must never take down a session — yours or the venue's. The venue answers with ErrorMsg and continues; your reader must do the same, because a crash mid-session leaves resting orders behind. That is why CANCEL_ON_DISCONNECT pulls a team's live orders when its socket closes. On the way back you reconnect with exponential backoff, re-handshake, and request a fresh snapshot rather than assuming the book you remember is still real.",
            "Costs travel on the wire too, which is what makes TCA possible at all. TradeExecution carries fee, maker_id and taker_id, so every fill is self-attributing: cross the ask and you are the taker paying the fee, rest and you are the maker earning the rebate out of it. In the lab a single share bought at 309.81 printed fee=0.4647 with maker=house_broker — 15 bps of notional for one lot of impatience. Read those fields per fill and your cost model stops being an assumption and becomes a measurement.",
            "Typed messages are what let one strategy be believable offline. Session recordings under sessions/ are the same JSON frames the exchange broadcast live, and scripts/backtest.py replays them through the same models, so the replay sees the identical field set with no adapter quietly inventing a mid price. Get the contract right in week 3 and the backtester in week 4 inherits it: if the offline path and the live path disagree, the disagreement is in your strategy, not in two different notions of what a book snapshot contains.",
        ],
        "example": {
            "title": "In the arena",
            "text": "shared/messages.py — parse_message is the whole dispatcher, and the two failure modes it raises are exactly the two your reader must catch. _TYPE_MAP holds all 21 message types.",
            "code": """# shared/messages.py
def parse_message(raw: dict[str, Any]) -> BaseModel:
    \"\"\"Dispatch a raw dict to the correct Pydantic model.

    Raises KeyError if the 'type' field is missing or unrecognised.
    Raises ValidationError if the payload is structurally invalid.
    \"\"\"
    msg_type = raw.get("type")
    if msg_type is None:
        raise KeyError("Message is missing required 'type' field")
    model_cls = _TYPE_MAP.get(msg_type)
    if model_cls is None:
        raise KeyError(f"Unknown message type: {msg_type!r}")
    return model_cls.model_validate(raw)""",
        },
    },
    "interview": [
        {
            "q": "Would you carry orders over TCP or UDP, and does market data get the same answer?",
            "a": "Orders go over TCP. You need every order and fill exactly once and in order, and a lost cancel is worse than a slow one. Market data is the case for UDP: it is connectionless multicast with no retransmit, which suits a feed where a stale packet is worse than a missing one and one publisher fans out to many subscribers. The trade-off is that UDP gives you gaps you must detect by sequence number and recover from a separate snapshot channel.",
            "level": "warm-up",
            "skill": "python.sockets",
        },
        {
            "q": "Why does a live book use a WebSocket rather than HTTP polling?",
            "a": "Polling asks 'anything new?' on a loop: each request pays a full set of headers and a round trip, and you still miss every change that happens between polls. A WebSocket upgrades one TCP connection once and then pushes frames in both directions with a tiny header, so the exchange streams the book while you stream orders on the same pipe. SSE and long-polling fix the header tax but are effectively server-to-client, and a trader has to send orders too.",
            "level": "warm-up",
            "skill": "python.websockets",
        },
        {
            "q": "A colleague's feed reader calls json.loads on whatever recv returns and it fails under load. What is wrong?",
            "a": "recv returns bytes, not messages. TCP is a stream, so under load the kernel coalesces sends and one recv can contain two JSON objects plus half of a third — json.loads then raises 'Extra data' or 'Unterminated string'. The reader needs a framing layer: accumulate into a buffer and split on a delimiter, or length-prefix each payload and read exactly that many bytes. WebSocket is the third option and the reason we use it: the protocol frames for you, so one recv is one whole message.",
            "level": "core",
            "skill": "python.sockets",
        },
        {
            "q": "What does a pydantic Literal buy you over validating a str yourself?",
            "a": "It moves the check from your code to the boundary and from runtime to the type system. side: Literal['buy', 'sell'] means side='long' raises ValidationError at parse time with loc=('side',) and a clear message, so the illegal state is unrepresentable rather than detected three layers deep in the matcher. The type checker also narrows on it, so a match or if/else over the two cases is verifiable as exhaustive. Pair it with Field(gt=0) for quantity and a zero-lot order never reaches your risk code.",
            "level": "core",
            "skill": "python.pydantic",
        },
        {
            "q": "You have twenty message types on one socket. Why a discriminated union instead of trying each model until one validates?",
            "a": "Trial parsing is O(number of types) and ambiguous: two models with overlapping optional fields can both accept the same payload, so you silently build the wrong one. A union keyed on a type field is a single dict lookup to the right class, then one validation — and the error you get back names the actual type rather than twenty rejections. In pydantic that is Annotated[Union[...], Field(discriminator='type')] behind a TypeAdapter. Splitting the union by direction adds a second guarantee: a client cannot send something only the venue is allowed to say.",
            "level": "core",
            "skill": "python.discriminated-union",
        },
        {
            "q": "You must add a field to a protocol that is live, with clients you cannot redeploy. How?",
            "a": "Add it as optional with a default, and never change the meaning of an existing field. An older client omits it and still parses; a newer client sends it and older receivers ignore it. That is how queue_ahead and level_qty landed mid-season: an order_ack payload with neither field still validates, with both defaulting to 0. If the semantics genuinely change, introduce a new type or a new field name and deprecate the old one on a schedule — repurposing a field is the change that breaks peers silently, far from the boundary.",
            "level": "core",
            "skill": "tools.protocol-contract",
        },
        {
            "q": "A client starts sending garbage frames at a high rate. What should your server do?",
            "a": "Reject each frame at the parse boundary, answer with a typed error, and keep the connection open — one bad frame must not drop a session that has resting orders behind it. But an endpoint also needs an error budget: count parse failures per connection and per unit time, and close or rate-limit a peer that exceeds it, since sustained garbage is either a bug that will not fix itself or an attack. Log the discriminator and the validation loc, not the raw payload, and never let the handler's exception escape into the accept loop.",
            "level": "senior",
            "skill": "python.error-boundary",
        },
        {
            "q": "Your connection drops just after you send an order. You reconnect — do you resend it?",
            "a": "Only if resending is safe, which means the protocol has to make it safe. Attach a client-generated id to every order so the venue can recognise a repeat and return the original ack instead of executing twice; without that, a retry is a second position. On reconnect do not assume continuity: re-handshake, request a fresh snapshot, and reconcile your positions and open orders against the venue's view before acting, because fills may have happened while you were away. Back off exponentially so a venue restart does not get a reconnect storm.",
            "level": "senior",
            "skill": "python.reconnect",
        },
    ],
},

# ─────────────────────────────────────────────────────────────── session 4 ──
{
    "n": 4,
    "focus": "Event-driven backtester architecture",
    "tagline": "A backtest is a hypothesis test you can rig without noticing: one missing shift(1) turns Sharpe 2.38 into -0.19, and 15 bps of taker fee turns the survivor into a loser.",
    "concepts": [
        {
            "title": "Prototype vectorised, validate event-driven",
            "text": "A vectorised backtest computes signals over a whole price series at once with numpy or pandas. It is fast to write and the right first screen, but it makes peeking at the future a one-character mistake and it cannot model queues, partial fills or an order book. An event-driven loop steps through time one event at a time, so the strategy is only ever handed the past — and the same code path runs live. AlgoArena's simulator is event-driven for exactly that reason. If the two architectures disagree on a strategy, trust neither until you know why.",
            "deck": "Deck Week 4 · slides 5–6",
        },
        {
            "title": "The five-step loop and its invariant",
            "text": "Every backtester is a variation on five steps: take the next market event, ask the strategy for a signal, turn the signal into an order, simulate the fill, update cash and positions — then record the mark. The live engine runs the same five. The loop invariant is the whole value of the architecture: the strategy receives prices[:i+1] and there is no expressible way for it to see prices[i+1]. Structure, not discipline, is what keeps look-ahead out.",
            "code": """prices = [100 + (i % 20) * 0.5 for i in range(200)]
sma = lambda xs, k: sum(xs[-k:]) / min(len(xs), k)
cash, pos, trades, equity = 100_000.0, 0, 0, []
for i, px in enumerate(prices):
    past = prices[: i + 1]                                # 1. event: the past only
    target = 100 if sma(past, 5) > sma(past, 20) else 0    # 2. signal
    delta = target - pos                                   # 3. order
    if delta:
        cash -= delta * px; pos += delta; trades += 1       # 4. fill  5. portfolio
    equity.append(cash + pos * px)                         # record the mark
print(f"ticks={len(equity)} trades={trades} equity={equity[-1]:.2f}")
# ticks=200 trades=19 equity=96200.00""",
            "deck": "Deck Week 4 · slide 7",
        },
        {
            "title": "Honest fills cross the spread",
            "text": "Slippage is execution price minus decision price, and it comes from the spread, your queue position, and the market moving while you act. Assume you trade at the last price and the backtest lies in your favour on every trade. A buy lifts the ask and a sell hits the bid; an order larger than the touch walks the book to worse levels and gets a blended average, not its own limit. Twelve lots against a four-lot touch here pay 6 bps against the mid before a single fee.",
            "code": """asks = [(309.81, 4), (309.84, 6), (309.90, 20)]   # the resting sell side
want, cost, filled = 12, 0.0, 0
for px, qty in asks:
    take = min(want, qty)
    cost += take * px; filled += take; want -= take   # fill at the RESTING price
    if not want: break
mid, avg = 309.655, cost / filled
print(f"naive says {mid}  honest avg {avg:.4f}  slippage {(avg - mid) / mid * 1e4:.1f} bps")
# naive says 309.655 honest avg 309.8400 slippage 6.0 bps""",
            "deck": "Deck Week 4 · slide 8",
        },
        {
            "title": "The turnover trap",
            "text": "Costs are explicit and implicit. Explicit is the fee schedule: in AlgoArena the taker pays 0.0015 and the maker earns a 0.0010 rebate. Implicit is the half-spread you cross on each leg, plus your own impact, which grows with size and is often modelled as the square root of it. Both scale with the number of round trips, so halving your holding period roughly doubles the drag. A 40 bps gross edge survives one round trip and dies at two. Always report P&L net of costs.",
            "code": """gross_bps, taker_bps, half_spread_bps = 40.0, 15.0, 1.5   # arena taker fee = 0.0015
for round_trips in (1, 2, 4):
    cost = round_trips * 2 * (taker_bps + half_spread_bps)   # two sides per round trip
    print(f"{round_trips} round trip(s): gross {gross_bps:.0f} bps "
          f"cost {cost:.0f} bps  net {gross_bps - cost:+.0f} bps")
# 1 round trip(s): gross 40 bps cost 33 bps net +7 bps
# 2 round trip(s): gross 40 bps cost 66 bps net -26 bps
# 4 round trip(s): gross 40 bps cost 132 bps net -92 bps""",
            "deck": "Deck Week 4 · slide 9",
        },
        {
            "title": "Read return, risk and shape together",
            "text": "One number never tells the story. CAGR normalises return to a year; Sharpe is mean excess return over its standard deviation, the return per unit of volatility; max drawdown is the largest peak-to-trough fall, the pain you have to survive to collect the return. Calmar divides CAGR by that drawdown and profit factor divides gross profit by gross loss. The path below compounds at 6.7% a year for a Sharpe of 0.47 and a 28% drawdown — a Calmar of 0.24 is not a tradeable strategy however positive the return.",
            "code": """import numpy as np
rng = np.random.default_rng(4)
r = rng.normal(0.0004, 0.01, 1000)                 # one equity path, 1000 bars
eq = 100_000 * np.cumprod(1 + r)
cagr = (eq[-1] / eq[0]) ** (252 / len(r)) - 1
sharpe = r.mean() / r.std(ddof=1) * np.sqrt(252)
mdd = float((eq / np.maximum.accumulate(eq) - 1).min())
print(f"CAGR {cagr:+.2%}  Sharpe {sharpe:+.2f}  maxDD {mdd:.2%}  Calmar {cagr / -mdd:.2f}")
# CAGR +6.68% Sharpe +0.47 maxDD -28.01% Calmar 0.24""",
            "deck": "Deck Week 4 · slide 10",
        },
        {
            "title": "Look-ahead, and the biases the curve hides",
            "text": "The cardinal sin is using information you would not have had at decision time, and it is usually one index deep: sig[t] needs close[t] to exist, while ret[t] is the move into bar t, so the unlagged product earns a return it could never have captured. One .shift(1) takes the Sharpe below from 2.38 to -0.19, and the lab's planted version collapses the same way, 2.50 to 0.05. Survivorship bias and data snooping are quieter: test on today's index members and the bankruptcies are already deleted, and keeping the best of 500 variants selects the luckiest draw. The defence is a chronological split you touch exactly once, never a shuffled one.",
            "code": """import numpy as np, pandas as pd
rng = np.random.default_rng(7)
px = pd.Series(100 * np.cumprod(1 + rng.normal(0.0002, 0.01, 1500)))
ret, ma = px.pct_change(), px.rolling(40).mean()
sig = (px > ma).astype(float)                       # long above the 40-bar SMA
sharpe = lambda s: s.dropna().mean() / s.dropna().std() * 252 ** 0.5
print(f"BUG  sig[t]   * ret[t]  Sharpe {sharpe(sig * ret):+.2f}")
print(f"FIX  sig[t-1] * ret[t]  Sharpe {sharpe(sig.shift(1) * ret):+.2f}")
# BUG sig[t] * ret[t] Sharpe +2.38
# FIX sig[t-1] * ret[t] Sharpe -0.19""",
            "deck": "Deck Week 4 · slide 12 · slides 14–16",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "Backtest honesty is an architectural property before it is a discipline. The reason we build the loop by hand is that handing the strategy prices[:i+1] makes the cardinal sin unexpressible, whereas a vectorised column makes it a one-character typo. The lab plants that typo on purpose: the unlagged signal reports +6.56% at Sharpe 2.50 and the shifted one +0.12% at Sharpe 0.05, on the same prices and the same rule. Nothing else about the strategy changed. Every believable offline number you quote this term rests on being able to point at where the future cannot leak in.",
            "One strategy, two worlds, is the point of the signal-to-order pipeline here. arena.as_signal_fn adapts a Trader's on_tick to the simulator's signal_fn(symbol, prices, history, book, portfolio), so the bot you compete with is the bot you backtest and there is no second codebase to drift. The fills are not simulated separately either: sim and live both match through shared/orderbook.py, the same price-time-priority CLOB. There is no 'assume I traded at the mid' available to you, which is why a sim P&L is worth reading at all.",
            "Costs are the largest position most student strategies hold. Fifteen basis points is the arena's real TAKER_FEE_RATE, and in the lab it took the momentum bot from -0.04% to -4.05% across 86 trades, dropping Sharpe by 2.7 and leaving max drawdown exactly equal to total return — a curve that only ever goes down. The in-sample parameter sweep then delivers the other lesson: the winning configuration was almost always the one that traded least, so the edge being selected was a cost reduction. Report net, count your trials, and treat turnover as a risk limit.",
            "The score you are ranked on is risk-adjusted, so backtest for it rather than for the headline. exchange/scoring.py takes mean excess return over a floored volatility, clamps the ratio, and then penalises drawdown by sign — a good return earned through a deep drawdown shrinks toward zero, and a loss with a deep drawdown gets worse. Week 4 is also when shorts unlock and the first IPO prices, which is when unbacktested position sizing starts costing real net worth. Size for the regime you have not lived through, because no backtest covers one it never saw.",
        ],
        "example": {
            "title": "In the arena",
            "text": "sim/session.py — the whole arena in-process, no network, seedable. This is the reference event loop the lab asks you to narrate: four numbered steps, and no way for a trader to see a price that has not been produced yet.",
            "code": """# sim/session.py  — Main simulation loop
for tick_n in range(n_ticks):
    # 1. Advance GBM prices.
    exchange.advance_tick()

    # 2. Record prices.
    for sym in exchange.symbols:
        price_history[sym].append(exchange.ref_prices[sym])

    # 3. Broker requotes all symbols.
    broker.tick()

    # 4. Each trader generates and places a signal.
    for trader in traders:
        trader.tick()""",
        },
    },
    "interview": [
        {
            "q": "Define look-ahead bias and give a concrete example.",
            "a": "It is using information that would not have been available at decision time. The textbook case is a signal computed from today's close multiplied by today's return: the return is the move into the bar, so the signal needs a price that did not exist when you supposedly traded. Lagging the signal by one bar fixes it. Subtler versions hide in reference data — using today's index membership, a restated earnings figure, or a split adjustment applied to the whole history rather than only after the split.",
            "level": "warm-up",
            "skill": "quant.look-ahead",
        },
        {
            "q": "Vectorised or event-driven — which backtester would you build, and when?",
            "a": "Both, in that order. Vectorised with numpy or pandas is the fast first screen: a few lines, whole-series arithmetic, good enough to reject an idea. Event-driven is what you validate and trade with, because stepping one event at a time lets you model queue position, partial fills, costs and latency, and because the same code path runs live. The practical rule is that if the two disagree on the same strategy you trust neither until you have found the reason, which is usually a lag or a fill assumption.",
            "level": "warm-up",
            "skill": "quant.event-driven-backtest",
        },
        {
            "q": "A strategy reports Sharpe 1.8. What else do you want to see before believing it?",
            "a": "Max drawdown and time under water, because a Sharpe of 1.8 with a 60% drawdown is untradeable; Calmar to combine the two. Then turnover and the P&L net of fees and slippage, since the cost drag scales with round trips and often accounts for the whole edge. Then hit rate against average win and loss size, to see whether the return is many small wins or one lucky outlier. Finally the P&L broken out by period, to check the Sharpe is not the average of one great regime and several bad ones.",
            "level": "core",
            "skill": "quant.performance-metrics",
        },
        {
            "q": "How would you model fills honestly for a strategy that trades 5,000 shares at a time?",
            "a": "Not at the last price. A buy pays the ask and a sell receives the bid, and once the order is larger than the displayed size at the touch it walks the book, so the fill price is the volume-weighted average over the levels consumed. Cap each fill at the size actually displayed and let the remainder rest or be cancelled according to the order type, which turns some of your trades into partials. Add a latency between signal and fill, and an impact term that grows with size — commonly modelled as the square root of participation.",
            "level": "core",
            "skill": "quant.fill-simulation",
        },
        {
            "q": "In-sample Sharpe is 2.5 and out-of-sample is 0.05. What happened and what do you do next?",
            "a": "A large in-sample to out-of-sample gap is the definition of overfitting: the parameters fit noise. Before retuning anything, check for a look-ahead bug, since those produce exactly this signature and are cheaper to find. Then count the configurations you tried, because the more variants you screened the higher the bar for significance, and the best of 500 is a luckiest-draw story. The fix is fewer parameters with an economic rationale, robustness to small changes rather than a fragile optimum, and a test set that is touched once.",
            "level": "core",
            "skill": "quant.overfitting",
        },
        {
            "q": "Why does survivorship bias flatter a buy-the-dip strategy in particular?",
            "a": "Because the strategy's thesis is that prices come back, and a universe of today's index members is a sample in which they always did. Every name that went bankrupt, delisted or was acquired has been deleted, so the dips that never recovered are simply absent from the data. The fix is a dataset that includes dead tickers with each name present only on the dates it actually traded. Selection bias is the cousin to watch for at the same time: choosing the symbols, dates or markets where the rule happens to work.",
            "level": "core",
            "skill": "quant.survivorship",
        },
        {
            "q": "A portfolio manager wants to halve the holding period to 'capture more moves'. What do you tell them?",
            "a": "That the gross edge per trade has to survive twice the cost, and it usually does not. Each round trip pays the taker fee on both legs plus the half-spread on both, so the drag scales linearly with turnover: a 40 bps gross edge that nets +7 bps at one round trip nets -26 at two. The alternative is to earn the other side of the schedule by resting rather than crossing, which turns the taker fee into a maker rebate — but it costs fill certainty and exposes you to adverse selection, so model that before promising it.",
            "level": "senior",
            "skill": "trading.maker-taker",
        },
        {
            "q": "How do you make a backtest reveal regime dependence rather than average it away?",
            "a": "Stop reporting one blended number. Break the P&L out by calendar period and by a regime label defined independently of the strategy — realised volatility buckets, rate cycles, liquidity conditions — and look at the dispersion, not the mean. A robust strategy is merely acceptable everywhere; a fragile one is spectacular in one window and bleeding elsewhere, and the blended Sharpe hides that. Walk-forward, which we build in week 7, rolls the train and test split through time so each out-of-sample window is judged in its own regime.",
            "level": "senior",
            "skill": "quant.regime-change",
        },
    ],
},

# ─────────────────────────────────────────────────────────────── session 5 ──
{
    "n": 5,
    "focus": "Algorithmic complexity & data structures",
    "tagline": "Choose the container by the operation you repeat most: a heap plus a dict answers 'best bid?' in O(1) while a re-sorted list burns 475 times more for the identical answer.",
    "concepts": [
        {
            "title": "The Big-O ladder, and where constants still matter",
            "text": "Big-O says how work grows with n, ignoring constants: O(1) for a dict lookup or a deque append, O(log n) for a binary search or a heap push, O(n) for a list scan, O(n log n) for a sort, and O(n squared) for nested loops that are fine at n=100 and fatal at a million. Read it as a curve, not a stopwatch: a fast O(n) can beat a heavy O(log n) at small n, but n grows. Know the worst case too — dict is O(1) average and O(n) under pathological collisions, so you design for the common case and guard the tail.",
            "code": """import timeit
setup = "d = {k: k for k in range(100_000)}; xs = list(range(100_000)); n = 99_999"
per = lambda stmt, num: min(timeit.repeat(stmt, setup=setup, number=num, repeat=3)) / num
t_dict = per("d[n]", 200_000)          # O(1) hash lookup
t_scan = per("n in xs", 200)           # O(n) linear scan, worst case
print(f"dict {t_dict * 1e6:.3f} us   list scan {t_scan * 1e6:.1f} us   ~{t_scan / t_dict:.0f}x")
print("O(1) beats O(n) at n=100k:", t_dict < t_scan)
# O(1) beats O(n) at n=100k: True""",
            "deck": "Deck Week 5 · slides 5–7",
        },
        {
            "title": "Pick the container by the question you ask most",
            "text": "Four structures carry most trading code. A dict answers 'what is X?' — order id to Order, symbol to price — in O(1) average, and it is the canonical live set. A set answers 'have I seen X?' with the same hashing and no values. A deque appends and pops at both ends in O(1), and deque(maxlen=k) gives a fixed rolling window that evicts the oldest for free. A heap answers 'best of many': O(log n) push and pop, O(1) peek at the minimum. Know the trade against space as well — a lookup table buys time with memory — and that list.append is O(1) amortised because the occasional resize averages out over cheap appends.",
            "deck": "Deck Week 5 · slides 7–8",
        },
        {
            "title": "O(1) rolling statistics beat recomputing",
            "text": "on_tick fires on every price update, so recomputing a mean and variance over the full history each call is O(n) per tick and O(n squared) over a session. Keep incremental state instead. A running sum gives an O(1) mean; Welford updates mean and variance together in one pass without storing history and without the sum-of-squares cancellation that wrecks a naive variance in floating point. The lab measures it: identical variance, 515 times faster at N=2000 and 6,093 times at N=20,000 — the speedup is not a constant, it grows with session length.",
            "code": """import statistics
class Welford:                                 # O(1) mean + variance, one pass
    def __init__(self): self.n = 0; self.mean = 0.0; self.m2 = 0.0
    def update(self, x):
        self.n += 1; d = x - self.mean
        self.mean += d / self.n                # O(1)
        self.m2 += d * (x - self.mean)         # stable: no sum of squares
    def var(self): return self.m2 / (self.n - 1)
px = [100 + (i % 97) * 0.01 for i in range(5_000)]; w = Welford()
for p in px: w.update(p)
print("ticks:", w.n, "| var matches recompute:", abs(w.var() - statistics.variance(px)) < 1e-9)
# ticks: 5000 | var matches recompute: True""",
            "deck": "Deck Week 5 · slides 9–10",
        },
        {
            "title": "The order book is a heap plus a dict",
            "text": "A book must answer 'best price?' constantly and match by price first, then time. Scanning every resting order is O(n) on every incoming order. Two min-heaps keyed on (price, seq, order_id) give O(log n) insert and an O(1) peek at the extreme — bids negate the price, asks use it raw. seq is a monotonic arrival counter rather than a timestamp, because floats tie and counters never do, which is what makes queue position exact. A dict of live orders stays the canonical set; the heaps are only a fast index into it. Cancelling deletes from the dict alone and the stale heap entry is popped lazily on the next read, so cancels stay cheap and reads stay correct.",
            "code": """import heapq
bids, orders = [], {}                          # min-heap index + canonical dict
for oid, px in enumerate([100.01, 100.03, 100.03]):
    heapq.heappush(bids, (-px, oid, oid)); orders[oid] = px   # (-price, seq, id)
def best_bid():
    while bids and bids[0][2] not in orders: heapq.heappop(bids)   # lazy delete
    return (-bids[0][0], bids[0][2]) if bids else None
print("best bid, front order:", best_bid())
del orders[1]                                  # cancel == one O(1) dict delete
print("after cancel:", best_bid(), "| heap entries left:", len(bids))
# best bid, front order: (100.03, 1)
# after cancel: (100.03, 2) | heap entries left: 2""",
            "deck": "Deck Week 5 · slide 11 · slide 18",
        },
        {
            "title": "Measure, then optimise",
            "text": "Intuition about performance is famously wrong, so profile before you touch anything. cProfile finds which function dominates across a run; timeit compares two implementations over many loops; perf_counter measures a block in situ against your per-tick budget. A careless benchmark lies, so warm up and discard the first runs, repeat and report the minimum — the minimum is the least-contaminated sample while the mean drags in OS noise — and time only the hot path with allocation hoisted out of the loop. Never benchmark n=1, and never tune a function called twice per session.",
            "code": """import timeit
setup = "xs = [100.0 + i * 0.01 for i in range(20_000)]"
runs = timeit.repeat("sum(xs[-20:]) / 20", setup=setup, number=20_000, repeat=7)
per = [t / 20_000 * 1e6 for t in runs]
print(f"min {min(per):.3f} us   mean {sum(per) / len(per):.3f} us   max {max(per):.3f} us")
print("min <= mean (noise only ever adds time):", min(per) <= sum(per) / len(per))
# min <= mean (noise only ever adds time): True""",
            "deck": "Deck Week 5 · slides 13–14",
        },
        {
            "title": "Latency, throughput and the tail that gets you picked off",
            "text": "Latency is the time for one operation end to end; throughput is operations per second. For a trader latency is edge, because slow means acting on stale prices; for an exchange throughput is capacity under load. They trade against each other — batching raises throughput and raises latency — so tune for the role you play. Averages hide the pain: a 5 microsecond mean with a 140 microsecond p99 means one tick in a hundred is catastrophic, and those are usually the volatile ticks that matter. Report p50, p95 and p99, and keep the p99 under your per-tick budget with room to spare.",
            "code": """import random, statistics
random.seed(7)
lat = [3.3 + random.random() for _ in range(990)]      # the quiet ticks
lat += [140.0 + random.random() for _ in range(10)]    # the shock burst: 1 in 100
lat.sort()
pct = lambda q: lat[min(int(q * len(lat)), len(lat) - 1)]
print(f"mean {statistics.mean(lat):6.2f} us   p50 {pct(.50):5.2f} us"
      f"   p95 {pct(.95):5.2f} us   p99 {pct(.99):6.2f} us")
print("mean hides the tail:", statistics.mean(lat) < pct(.99) / 10)
# mean 5.15 us p50 3.77 us p95 4.26 us p99 140.04 us
# mean hides the tail: True""",
            "deck": "Deck Week 5 · slide 16",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "A slow signal is not a signal. Prices move while you compute, so the per-tick budget is the real constraint on the signal-to-order pipeline: whatever on_tick spends is time the book had to move against the decision it is about to produce. The lab makes the cost visible without changing a single trading rule. FastBot keeps its statistics over a fixed window and runs at p50 3.33 microseconds, p99 7.38; SlowBot computes the same signal by rescanning full history and runs at p50 71.58, p99 145.04. Same fills, same edge, twenty times the latency — and SlowBot's median keeps climbing all session because its cost is O(n) in history.",
            "The order book is where the theory is load-bearing. shared/orderbook.py holds two min-heaps of (price, seq, order_id) plus a canonical dict, so best_bid measured 0.075 microseconds and stayed dead flat from 1,000 to 100,000 resting orders — a lazy heap clean followed by an O(1) peek, on the operation the venue repeats most. get_snapshot is the counterexample: it aggregates price levels by iterating _orders, so it went from 96 microseconds to 8,461 across the same range, exactly linear, and the exchange calls it on every broadcast. Knowing which of your reads is which separates a venue that holds up under load from one that does not.",
            "Tail latency is a live-risk control, not a vanity metric. The p99 arrives during a shock burst, when ticks come fastest and the book is moving most, which is precisely when a stale quote gets taken. For a market maker that is adverse selection, and it shows up in TCA as fills that sit systematically on the wrong side of the next mid: a rebate does not cover a spread you quoted against a price that no longer exists. Cancel latency has the same shape — a requote you cannot land in time is a free option you have written to the fastest taker in the session.",
            "Complexity also decides what you can honestly test. An O(n squared) per-session statistic makes a 20,000-tick backtest take twelve seconds, which is enough to stop you running the parameter sweeps and walk-forward windows that would have caught the overfit. Welford and the full recompute agree on the variance to floating-point precision; the only difference is the curve. Fast, correct hot paths are what buy you the number of honest runs, and they are the same paths week 6 goes on to distribute.",
            "This session also carries the midterm: 30 multiple-choice questions in 90 minutes, one attempt, closed book, drawn from weeks 1 to 5. It rewards exactly the vocabulary above — naming the complexity class of an operation, choosing the container that matches the question you repeat most, and reading a percentile table rather than a mean. The homework that follows has you build an order book from scratch and defend it with a written complexity table and a benchmark, so treat tonight's measurements as the reference you will be held to.",
        ],
        "example": {
            "title": "In the arena",
            "text": "shared/orderbook.py — lazy deletion is three lines, and it is why best_bid stays flat as the book grows. Cancelling only removes the entry from _orders; the dead heap entry is popped on the next read.",
            "code": """# shared/orderbook.py
def _clean_heap(self, heap: list) -> None:
    \"\"\"Pop stale (dead) entries from the heap front until a live entry is found.\"\"\"
    while heap and heap[0][2] not in self._orders:
        heapq.heappop(heap)

def best_bid(self) -> float | None:
    \"\"\"Highest resting bid price, or None if no bids.\"\"\"
    self._clean_heap(self._bids)
    return -self._bids[0][0] if self._bids else None

def best_ask(self) -> float | None:
    \"\"\"Lowest resting ask price, or None if no asks.\"\"\"
    self._clean_heap(self._asks)
    return self._asks[0][0] if self._asks else None""",
        },
    },
    "interview": [
        {
            "q": "Give the complexity of a dict lookup, a list membership test and a heap push, and say which you would use to track the best bid.",
            "a": "A dict lookup is O(1) average, a list membership test is O(n), and heapq.heappush is O(log n) with an O(1) peek at heap[0]. For the best bid you want the heap: the operation you repeat most is reading the extreme, and a heap makes that a constant-time peek while keeping inserts logarithmic. A sorted list gives the same O(1) read but pays O(n) per insert to keep the order, and re-sorting on every insert is far worse than that — the lab measured 475 times worse for the identical answer.",
            "level": "warm-up",
            "skill": "python.bigo",
        },
        {
            "q": "You need the last 50 prices in a hot loop. list or deque?",
            "a": "deque(maxlen=50). Appending is O(1) at both ends and the maxlen evicts the oldest element for you, so the window never grows and there is no per-tick slicing or copying. A list append is also O(1) amortised, but trimming the front with pop(0) or a slice is O(n), and keeping the whole history alive means every statistic computed over it grows with the session. The one thing a list gives you that a deque does not is O(1) random indexing in the middle, which a rolling window rarely needs.",
            "level": "warm-up",
            "skill": "python.containers",
        },
        {
            "q": "Why is a min-heap the right structure for one side of an order book, and what goes in the key?",
            "a": "Because the operation repeated on every incoming order is 'what is the best price?', and a heap answers that with an O(1) peek and an O(log n) insert. The key is a tuple (price, seq, order_id): price orders the book, seq breaks equal-price ties by strict arrival order, and the id is a final deterministic tiebreak. Bids negate the price so the same min-heap yields the highest bid. seq is a monotonic counter rather than a timestamp because two floats can be equal and a counter cannot, which is what makes queue position exact.",
            "level": "core",
            "skill": "trading.price-time-priority",
        },
        {
            "q": "A cancel arrives. Why not remove the order from the heap immediately?",
            "a": "Because heapq offers no O(log n) delete of an arbitrary element — finding it is O(n) and repairing the invariant costs more. Lazy deletion instead makes the dict of live orders the single source of truth: cancel is one O(1) del from _orders, and the stale heap entry is popped on the next read, when a clean loop discards front entries whose ids are no longer live. That keeps cancels cheap in the path that has to be cheap. The correctness condition is that every read either cleans first or iterates the canonical dict, so a dead entry can never be matched against or reported in a snapshot.",
            "level": "core",
            "skill": "trading.clob",
        },
        {
            "q": "Your on_tick recomputes a 200-period mean and standard deviation from full history. Fix it, and say why Welford rather than a running sum of squares.",
            "a": "Keep incremental state. A running sum gives an O(1) mean, and a deque(maxlen=200) plus add-new and subtract-old gives an O(1) window; over a session that turns O(n squared) work into O(n). For the variance, the naive route stores sum(x) and sum(x*x) and subtracts them, which cancels catastrophically when prices are large and the variance is small — it can return a negative variance. Welford updates the mean and the sum of squared deviations from that running mean, so it is one pass, stores no history, and is numerically stable.",
            "level": "core",
            "skill": "quant.rolling-stats",
        },
        {
            "q": "Walk me through benchmarking two implementations of a hot function so I can trust the result.",
            "a": "Profile first to confirm the function actually dominates, otherwise the comparison does not matter. Then time only the hot path with setup and allocation hoisted out, loop enough that total time is well above timer resolution, warm up and discard the first runs so imports and caches have settled, and repeat — timeit.repeat with a handful of repeats, reporting the minimum and noting the spread, because the minimum is the least-contaminated run while the mean absorbs OS noise. Verify both versions produce the same answer, and watch for input that flatters one of them, like Timsort running linearly on already-sorted data.",
            "level": "core",
            "skill": "tools.profiling",
        },
        {
            "q": "Your bot's p50 is 3 microseconds and its p99 is 200 milliseconds. What do you investigate?",
            "a": "A gap that large is not the algorithm, it is something occasional and blocking, so look for the events that only happen sometimes: a synchronous log flush or network call on the decision path, a garbage-collection pause, a dict or buffer resize, a lock contended by a poller, or a rare branch that rescans full history. Instrument per-stage timings and keep the percentiles rather than the mean, then attack whichever stage owns the tail. It matters more than the median because the p99 lands during a shock burst, when ticks arrive fastest and a stale quote is exactly what gets picked off.",
            "level": "senior",
            "skill": "tools.latency-tail",
        },
        {
            "q": "get_snapshot is O(N) in total resting orders because it aggregates by iterating the canonical order dict. How would you make it O(levels returned)?",
            "a": "Maintain a price-level index alongside the canonical dict: a dict keyed by (side, price) holding aggregated quantity and a FIFO of order ids, plus a heap of live prices per side. A snapshot of depth k then reads the k best prices off the heap and takes their aggregates, independent of N. The cost is that every mutation must maintain it — place increments the level and appends to the queue, cancel decrements and removes, and a level that hits zero is dropped or marked dead for lazy cleanup. Test that the index and the dict never disagree, because two sources of truth is the bug this design invites.",
            "level": "senior",
            "skill": "python.hot-loop",
        },
    ],
},

]
