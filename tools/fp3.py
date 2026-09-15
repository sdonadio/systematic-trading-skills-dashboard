"""Focus content for FINM 33500 sessions 6 and 7 (window.FOCUS slice).

Session 6 — Big data & distributed compute   (deck week 6, 22 slides)
Session 7 — Machine-learning signals & model ops (deck week 7, 22 slides)
"""

s6 = {
    "n": 6,
    "focus": "Big data & distributed compute",
    "tagline": "Store data in columns, process it in chunks, and fan the backtest out over processes — so you can search a strategy space instead of running one config.",
    "concepts": [
        {
            "title": "The memory wall — measure before you scale",
            "text": "pandas holds the whole frame in RAM, and the in-memory footprint is routinely 2-10x the file on disk. Cross physical memory and the OS swaps: everything falls off a cliff at roughly 1000x slower. Before you reach for a cluster, measure with df.info(memory_usage='deep') or df.memory_usage(deep=True) — without deep=True pandas reports the pointer array and hides the strings entirely. Then downcast: float64 to float32, object to category. In the week-6 lab that one step took a 250 000-row snapshot frame from 25.3 MB to 7.3 MB, 3.5x smaller, almost all of it from turning 250 000 Python strings into int8 category codes.",
            "code": """import pandas as pd
sym = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN"] * 20_000
wide = pd.DataFrame({"symbol": sym, "mid": [182.5] * len(sym), "spread": [0.02] * len(sym)})
lean = wide.astype({"symbol": "category", "mid": "float32", "spread": "float32"})
w = wide.memory_usage(deep=True).sum(); l = lean.memory_usage(deep=True).sum()
print("rows", len(wide), "| lean at least 3x smaller:", w > 3 * l)
print("dtypes", lean.symbol.dtype, lean.mid.dtype, "| codes", lean.symbol.cat.codes.dtype)
# rows 100000 | lean at least 3x smaller: True
# dtypes category float32 | codes int8""",
            "deck": "Deck Week 6 · slide 5",
        },
        {
            "title": "Rows versus columns — CSV against Parquet",
            "text": "How the bytes are laid out on disk decides how many of them you have to read. CSV is row-oriented text: no types, no column pruning, large on disk. Parquet is columnar, typed and compressed, so you read only the columns you touch and a column of near-identical floats compresses 5-20x with zstd or snappy. The lab measured the same tape at 61.6 MB as JSONL, 16.9 MB as CSV and 2.7 MB as Parquet, and pruning to two columns read ~28x faster than the CSV. Parquet also round-trips dtypes; CSV hands back float64 and silently undoes your downcasting. Rule: CSV to exchange with humans, Parquet for anything you re-read.",
            "code": """import os, tempfile, pandas as pd
df = pd.DataFrame({"ts": range(50_000), "symbol": ["AAPL"] * 50_000,
                   "mid": [182.5] * 50_000}).astype({"mid": "float32"})
with tempfile.TemporaryDirectory() as d:
    csv, pq = os.path.join(d, "t.csv"), os.path.join(d, "t.parquet")
    df.to_csv(csv, index=False); df.to_parquet(pq, index=False)
    two = pd.read_parquet(pq, columns=["ts", "mid"])        # column pruning
    print("parquet smaller:", os.path.getsize(pq) < os.path.getsize(csv),
          "| csv returns", pd.read_csv(csv).mid.dtype, "| parquet keeps", two.mid.dtype)
    print("columns touched:", list(two.columns))
# parquet smaller: True | csv returns float64 | parquet keeps float32
# columns touched: ['ts', 'mid']""",
            "deck": "Deck Week 6 · slide 6",
        },
        {
            "title": "Chunk it, reduce as you go, carry the state",
            "text": "If the file will not fit, do not load it. Read bounded pieces — pd.read_csv(chunksize=...) or your own line blocks — and reduce each piece into an accumulator, so memory is O(chunk + state) regardless of file size. The lab computed the same per-symbol statistic at 44 MB peak RSS chunked against 229 MB loading everything. The trap is the rolling window: a 100-bar SMA must survive chunk boundaries, so the deque per symbol is carried across chunks. Drop it and the first 99 rows of every chunk get a wrong window — a silent, wrong number, not a crash. And only statistics that compose survive this pattern: (sum, count) does, a median does not.",
            "code": """import itertools
from collections import deque
src = (100.0 + (i % 13) * 0.5 for i in range(20_000))  # a stream, never fully in RAM
win, tot, n = deque(maxlen=20), 0.0, 0
while blk := list(itertools.islice(src, 4_096)):       # bounded chunks
    for px in blk:
        win.append(px)                                 # state CARRIED across chunks
        if len(win) == 20:
            tot += sum(win) / 20; n += 1
print("sma samples", n, "| mean of 20-bar SMA", round(tot / n, 4))
# sma samples 19981 | mean of 20-bar SMA 103.0""",
            "deck": "Deck Week 6 · slides 8–9",
        },
        {
            "title": "Scale up first, then out — and use processes",
            "text": "Vertical scaling needs no code change but has a ceiling and prices superlinearly; horizontal scaling is near-unlimited but you must partition the work and combine the results. More RAM plus smaller dtypes plus Parquet often removes the problem outright, so start there. When you do go parallel, remember the GIL: only one thread runs Python bytecode at a time, so threads buy nothing for a CPU-bound sweep. Use processes — ProcessPoolExecutor from the stdlib, with the __main__ guard, because each worker re-imports your module and without the guard it re-spawns the pool. joblib is the same idea in one line. Dask and Ray extend it across machines; this course names them and stays on one box.",
            "code": """from concurrent.futures import ProcessPoolExecutor
import numpy as np
def cycles(lookback):              # CPU-bound shard: one parameter, one process
    s = np.sign(np.sin(np.arange(200_000) / lookback))
    return lookback, int((np.diff(s) != 0).sum())    # deterministic per shard
if __name__ == "__main__":         # mandatory: every worker re-imports this file
    with ProcessPoolExecutor(max_workers=2) as pool:
        par = dict(pool.map(cycles, [5, 10, 20, 40]))  # map
    print(par)                                         # reduce
    print("parallel == sequential:", par == dict(map(cycles, [5, 10, 20, 40])))
# {5: 12733, 10: 6367, 20: 3184, 40: 1592}
# parallel == sequential: True""",
            "deck": "Deck Week 6 · slides 11–12",
        },
        {
            "title": "Map, reduce, shard — and what will not shard",
            "text": "The mental model behind every scale-out: apply the same function to each independent piece (map), then combine the partials (reduce), with a shard key chosen so the pieces really are independent — per symbol, per date range, per parameter. Parameter sweeps and per-symbol backtests are embarrassingly parallel: nothing is shared, so you just collect results. A stateful order book is not. Matching depends on the order of arrivals, so sharding it blindly changes the answer; dependencies force coordination. Measure the win rather than assuming n_cores: the lab's byte-range map-reduce over ten shards returned 2.1x, because process start-up, pickling partials and one shared disk all take their cut.",
            "deck": "Deck Week 6 · slides 13–14",
        },
        {
            "title": "Idempotency and reproducibility under fan-out",
            "text": "Distributed jobs retry, reorder and run out of process, so correctness needs determinism and safe re-runs. Make each task idempotent by keying its output on a hash of its inputs: running it twice writes the same file and nothing is double-counted, and a resumed sweep skips what is already on disk. Make it reproducible by pinning the seed (SimSession takes seed=), the data version and the dtypes, so every worker computes the same numbers. Keep workers pure: inputs in, output out, no shared mutable state and no hidden globals. Note that the float32 win from downcasting costs you exactness — the lab's vectorised and loop versions agreed only to ~1.8e-3, so assert with a tolerance you can defend.",
            "code": """import hashlib, json
def key(params):                     # one output file per input set
    blob = json.dumps(params, sort_keys=True).encode()
    return "sweep_" + hashlib.sha256(blob).hexdigest()[:8] + ".parquet"
a = key({"lookback": 20, "spread": 0.3, "seed": 7})
b = key({"seed": 7, "spread": 0.3, "lookback": 20})   # same inputs, keys in any order
c = key({"lookback": 40, "spread": 0.3, "seed": 7})
print(a)
print("re-run is a no-op:", a == b, "| new config, new file:", a != c)
# sweep_b2945585.parquet
# re-run is a no-op: True | new config, new file: True""",
            "deck": "Deck Week 6 · slide 15",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "Scale is what separates a strategy from a search. One backtest tells you whether one lookback worked on one tape; a sweep tells you whether the edge exists across a neighbourhood of parameters, which is the only version worth trading. That is why the week-6 deliverable is a parallel sweep with one run per configuration and a Sharpe collected per point, and why the headless sim is built to be fanned out: SimSession().run() is pure and in-process with no sockets, so twenty of them can run at once.",
            "The pipeline splits in two at a hard seam. Offline you build features — returns, rolling means, rolling vol — and cache them to Parquet; online your signal function reads the freshest rows of that frame and does arithmetic only. Get the seam wrong and you pay twice: a groupby-rolling inside on_tick blows the per-tick budget, and features computed differently offline and live give you a bot that was validated on numbers it never sees again.",
            "Reproducibility is what makes an offline result believable. A sweep that cannot be re-run to the same numbers cannot be defended: pin seed=, pin the data version, pin the dtypes, and key every output on a hash of its inputs so a retried worker overwrites itself instead of double-counting. Log every configuration you tried, too — that count is what week 7 uses to deflate the best Sharpe you found, and a sweep is a very efficient way to try hundreds of things.",
            "Costs are the reason you keep the whole tape rather than a sample. Fees, spread and slippage only show up when you replay every fill: the lab's stretch step ran the template's Level-1 random strategy over 250 000 snapshots and finished at $51,617 — a 48% loss, almost all of it fees. Column pruning is what makes that affordable; you read price, size and fee columns out of a multi-gigabyte recording and leave the rest on disk.",
            "Scaling out also means more sockets. Multi-venue has been live since week 1: set EXCHANGE_URLS to a comma-separated list and one bot connects to every venue. The broker's answer to that is one pricing brain and N execution gateways — the external reference is shared, while each venue's mark, resting orders and positions stay local. Live risk lives in that split, because a position is per venue but your exposure is not.",
        ],
        "example": {
            "title": "In the arena",
            "text": "sim/session.py exposes run(n_ticks, strategies, symbols, fee_rate, broker_spread, seed, verbose) and returns a SessionResult whose traders carry a pnl_curve. It is pure and network-free, so one process per parameter is the whole scale-out.",
            "code": """# sweep.py at the repo root — one backtest per process
from concurrent.futures import ProcessPoolExecutor
import numpy as np
from sim.session import SimSession
from plugins.strategies.examples import momentum_signal

def sharpe(curve):
    r = np.diff(curve)
    return r.mean() / (r.std() + 1e-9) * np.sqrt(252)

def backtest(spread):                      # one shard = one parameter value
    res = SimSession().run(n_ticks=2000, seed=7, verbose=False,
                           strategies=[("m", momentum_signal)],
                           symbols=["AAPL", "TSLA"], broker_spread=spread)
    return spread, sharpe(res.traders[0].pnl_curve)

if __name__ == "__main__":                 # required for multiprocessing
    with ProcessPoolExecutor() as pool:
        for sp, sr in pool.map(backtest, [0.05, 0.1, 0.3, 0.6]):
            print(f"spread={sp:>5}  Sharpe={sr:6.2f}")""",
        },
    },
    "interview": [
        {
            "q": "A 17 MB CSV of ticks turns into 200 MB of RAM once it is a DataFrame. Why, and what do you do about it?",
            "a": "Text becomes typed objects with per-object overhead: every string cell is a Python str behind a pointer, and every number is float64 whether it needs 8 bytes or not, so the in-memory frame is routinely 2-10x the file. Measure it honestly with df.memory_usage(deep=True) — without deep=True you see only the pointer array. Then downcast: object to category for low-cardinality columns like symbol, float64 to float32 for prices, and parse timestamps into a DatetimeIndex. That is typically 3-4x for free, which is often the whole problem.",
            "level": "warm-up",
            "skill": "python.pandas-memory",
        },
        {
            "q": "You want to run 200 backtests on an 8-core laptop. Threads or processes?",
            "a": "Processes. The GIL lets only one thread execute Python bytecode at a time, so a thread pool gives you no speedup on CPU-bound work — threads only help when the work is blocking I/O such as a socket or an HTTP poll. Use concurrent.futures.ProcessPoolExecutor, which gives each worker its own interpreter and its own GIL, and put the submit under an if __name__ == '__main__' guard, because workers re-import the module and without the guard they re-spawn the pool.",
            "level": "warm-up",
            "skill": "python.gil",
        },
        {
            "q": "You are streaming a 60 GB recording in chunks and computing a 100-bar rolling mean per symbol. What breaks, and how do you fix it?",
            "a": "The window straddles chunk boundaries. If each chunk is processed independently, the first 99 rows of every chunk have an incomplete window, so you get silently wrong numbers rather than an error. Carry the state across chunks — a deque(maxlen=100) per symbol — and reduce into accumulators as you go, which keeps memory at O(chunk + state) for any file size. Also check that your statistic composes: (sum, count) combines across shards, a median does not, so a streamed median needs a different algorithm.",
            "level": "core",
            "skill": "python.chunking",
        },
        {
            "q": "Why store a feature store as Parquet rather than CSV, and when would you still pick CSV?",
            "a": "Parquet is columnar, typed and compressed: you read only the columns you project, near-identical float columns compress heavily, and dtypes round-trip so a float32 column comes back float32 instead of silently widening to float64. On a real tape that is roughly 6x smaller than CSV and around 28x faster when you read two columns out of seven. CSV stays useful for handing a file to a human or a tool that only speaks text, and for tiny data where the dependency is not worth it.",
            "level": "core",
            "skill": "tools.parquet",
        },
        {
            "q": "Which parts of a trading stack are embarrassingly parallel and which are not?",
            "a": "Parameter sweeps, per-symbol feature builds and independent backtest runs are embarrassingly parallel: no piece needs another, so you map one process per shard and reduce the results. A matching engine is not. The order book is stateful and price-time priority depends on arrival order, so sharding it changes the fills — the dependency forces coordination, which is why the exchange stays single-threaded per venue and scales out by running more venues instead.",
            "level": "core",
            "skill": "python.multiprocessing",
        },
        {
            "q": "How do you make a distributed parameter sweep idempotent and reproducible?",
            "a": "Key every output on its inputs: hash the parameter dict with json.dumps(params, sort_keys=True) and write to features_<hash>.parquet, so re-running a task overwrites the same file instead of appending a second copy, and a resumed sweep skips completed work. Then pin everything that could vary — the RNG seed (SimSession takes seed=), the input data version, the dtypes — and keep workers pure, inputs in and results out, with no shared mutable state. Same inputs, same numbers, on any worker, in any order.",
            "level": "core",
            "skill": "tools.determinism",
        },
        {
            "q": "You parallelise a map-reduce over ten shards on a ten-core box and measure 2.1x, not 10x. Explain, and say what you would measure next.",
            "a": "Process start-up and pickling dominate at small shard sizes, one shared disk serialises the reads, and the reduce step plus any unparallelised setup bound you by Amdahl's law. I would time the phases separately: per-shard compute against wall clock, bytes read per second against the disk's ceiling, and payload size per task. Then fix the biggest one — fewer, larger shards to amortise spawn cost, Parquet plus column pruning to cut the I/O, and returning compact partials rather than frames. The point is that you measure the speedup instead of assuming the core count.",
            "level": "senior",
            "skill": "python.multiprocessing",
        },
        {
            "q": "A bot connects to several venues at once. What changes in the design?",
            "a": "State splits by scope. There is one instrument, so the reference price is shared — one pricing brain — but resting orders, fills and positions are per venue, so each connection keeps its own execution state and its own reconnect loop. The broker does exactly this: one instance polls the feed and the others share its price state while quoting independently. Routing then compares the touch across venues net of each venue's own fee schedule, since a better headline price at a worse taker rate is not better, and risk has to be aggregated across venues even though limits are enforced per venue.",
            "level": "senior",
            "skill": "trading.multi-venue",
        },
    ],
}

s7 = {
    "n": 7,
    "focus": "Machine-learning signals & model ops",
    "tagline": "A model is just another signal function: learn it offline, split in time so it cannot see the future, and load it once so predicting fits inside the per-tick budget.",
    "concepts": [
        {
            "title": "The supervised setup — X at t, y about t+h",
            "text": "You learn a mapping from features to a label, and in trading the two live at different times. Every column of X must be knowable at t; y is about t+h. Classification predicts direction and is easy to size by confidence; regression predicts magnitude and is more informative but noisier. The horizon h has to match how long you actually hold — label a 5-tick move and then hold for an hour and you have validated a different strategy. The last h rows of any tape have no label yet, which is exactly the shape of the live problem: you always stand at the right-hand edge.",
            "code": """import numpy as np
rng = np.random.default_rng(7)
mid = 100 + np.cumsum(rng.normal(0, 0.05, 600))       # the tape
h, t = 5, np.arange(20, 600 - 5)                      # horizon, usable rows
ret = np.r_[0.0, mid[1:] / mid[:-1] - 1]
X = np.c_[ret[t], mid[t] / mid[t - 10] - 1]           # known AT t
y = (mid[t + h] > mid[t]).astype(float)               # about t+h: the label only
print("X", X.shape, "y", y.shape, "up-rate", round(float(y.mean()), 3))
print("last labelled t", int(t[-1]), "of", len(mid) - 1, "- the tail has no label yet")
# X (575, 2) y (575,) up-rate 0.386
# last labelled t 594 of 599 - the tail has no label yet""",
            "deck": "Deck Week 7 · slide 5",
        },
        {
            "title": "Features from prices and the book",
            "text": "The model is only as good as X, and the useful families are the rolling statistics you already built: momentum over a lookback, volatility as recent dispersion of returns, the spread in basis points, and order-book imbalance as signed bid-versus-ask pressure. Standardise them, because a model that cares about magnitude will be dominated by whichever column has the largest scale. Fewer, better features win — each one costs a degree of freedom. Print X.std(0) before every fit: in the week-7 lab, obi came out with standard deviation 0.0, because a single broker quoting a symmetric ladder never moves the imbalance. A zero-variance feature cannot help, and a feature you cannot compute inside on_tick is not a feature.",
            "code": """import numpy as np
px = np.array([100.0, 100.2, 100.1, 100.4, 100.9, 101.0, 100.7, 101.3, 101.1, 101.6])
rets = px[1:] / px[:-1] - 1
bid, ask, bidq, askq = 101.55, 101.65, 400, 100
X = np.array([rets[-1], px[-1] / px[0] - 1, rets.std(),
              (ask - bid) / ((ask + bid) / 2) * 1e4, (bidq - askq) / (bidq + askq)])
names = ["ret1", "mom9", "vol9", "spread_bps", "obi"]
print(dict(zip(names, np.round(X, 4).tolist())))
rows = np.array([X, X * 1.1, X * 0.9]); rows[:, 4] = 0.60   # one broker: obi never moves
print("dead features:", [n for n, s in zip(names, rows.std(0)) if s < 1e-12])
# {'ret1': 0.0049, 'mom9': 0.016, 'vol9': 0.0031, 'spread_bps': 9.8425, 'obi': 0.6}
# dead features: ['obi']""",
            "deck": "Deck Week 7 · slide 6",
        },
        {
            "title": "Split in time, with an embargo",
            "text": "Random shuffling leaks the future into training, so time-series data is split chronologically: an early train slice, a middle validation slice you tune on, and a latest test slice you look at once. Then embargo the wall — drop the last h training rows — because with horizon h the labels of adjacent rows overlap, so a shuffled split drops each test row's near-twin into training and a memoriser simply looks it up. The snippet runs a 1-nearest-neighbour model on a pure random walk, where the honest answer is 50%: the shuffled split invents almost eight accuracy points of edge on data that contains none. The lab measured the same effect at +0.095.",
            "code": """import numpy as np
rng = np.random.default_rng(0)
mid = 100 + np.cumsum(rng.normal(0, 0.05, 1500))   # a random walk: there is NO edge
h, t = 20, np.arange(50, 1480)
X = np.c_[mid[t] / mid[t - 20] - 1, mid[t] / mid[t - 50] - 1]
y = (mid[t + h] > mid[t]).astype(int)              # labels of adjacent rows overlap
nn1 = lambda A, a, B, b: float((a[((B[:, None] - A[None]) ** 2).sum(2).argmin(1)] == b).mean())
cut, p = int(0.7 * len(X)), rng.permutation(len(X))
shuf = nn1(X[p[:cut]], y[p[:cut]], X[p[cut:]], y[p[cut:]])
hon = nn1(X[:cut - h], y[:cut - h], X[cut:], y[cut:])
print(f"1-NN shuffled {shuf:.3f}  time+embargo {hon:.3f}  fake edge {shuf - hon:+.3f}")
# 1-NN shuffled 0.602 time+embargo 0.526 fake edge +0.077""",
            "deck": "Deck Week 7 · slide 11",
        },
        {
            "title": "Walk-forward validation is the only score to trust",
            "text": "Train on the past, test on the next unseen block, roll forward, repeat, and average the out-of-sample metric over the test blocks. An expanding window keeps all history; a rolling window forgets the distant past and copes better with drift. Report the dispersion as well as the mean — one lucky fold is not a result. Keep the embargo on every fold. The fit itself needs no framework: scikit-learn and joblib are not in requirements.txt and the graded week-7 lab is numpy-only, so a least-squares fit through numpy.linalg.lstsq is a perfectly respectable linear baseline, and the model ladder says beat that baseline before you climb to regularised linear or tree ensembles.",
            "code": """import numpy as np
rng = np.random.default_rng(3)
sig = np.sin(2 * np.pi * np.arange(2100) / 300); t = np.arange(10, 2090)
X = np.c_[sig[t] - sig[t - 5] + rng.normal(0, .3, len(t)), np.ones(len(t))]
y = np.sign(sig[t + 5] - sig[t])                             # label about t+5
accs = []
for i in range(1, 5):                                        # 4 expanding folds
    a, b = i * 400, (i + 1) * 400
    w, *_ = np.linalg.lstsq(X[:a - 5], y[:a - 5], rcond=None)  # embargo the last 5 rows
    accs.append(round(float((np.sign(X[a:b] @ w) == y[a:b]).mean()), 3))
print("folds", accs, "| mean", round(sum(accs) / 4, 3))
# folds [0.527, 0.54, 0.593, 0.557] | mean 0.554""",
            "deck": "Deck Week 7 · slide 12",
        },
        {
            "title": "Metrics that matter — accuracy is a trap",
            "text": "A signal is good only if it makes risk-adjusted money out-of-sample after costs. Accuracy is necessary and not sufficient: 51% on balanced up-and-down labels can be very profitable, and 99% on rare events can lose money. What decides it is hit rate together with payoff, the average win over the average loss. Then subtract the trading: fees, spread and slippage, which is where most backtested machine-learning alpha dies. The snippet gives a genuine 4 bp average edge that a 15 bp taker fee each way destroys. Turnover and capacity are part of the score — a signal that flips every tick pays the spread endlessly, and slower, surer signals often win the season.",
            "code": """import numpy as np
rng = np.random.default_rng(11)
edge = rng.normal(0.0004, 0.004, 4000)      # 4000 round trips, a real 4 bp edge
hit = float((edge > 0).mean())
payoff = float(edge[edge > 0].mean() / -edge[edge < 0].mean())
cost = 2 * 0.0015                           # taker in, taker out
print(f"hit {hit:.3f}  payoff {payoff:.2f}  gross {edge.mean() * 1e4:+.1f}bp"
      f"  net {(edge.mean() - cost) * 1e4:+.1f}bp")
print("survives costs:", bool(edge.mean() > cost))
# hit 0.550 payoff 1.09 gross +4.5bp net -25.5bp
# survives costs: False""",
            "deck": "Deck Week 7 · slide 14",
        },
        {
            "title": "Model ops — persist, serve, monitor, retrain",
            "text": "A model is a live artifact with a lifecycle, and training is the small part. Serialise the fitted weights together with the feature list, the horizon, the scaler statistics and a version, so the bot can check that what it computes per tick is what the model was fitted on. Load it once in __init__, never in the hot path, and measure predict() against the per-tick budget — a model you cannot run live scores nothing. A missing or stale artifact must be a quiet no-trade, not a crash mid-session. Then monitor: live hit rate against the training number, feature distributions, P&L against the backtest. Decide the retraining cadence up front and keep every version so you can roll one back.",
            "code": """import json, os, tempfile, numpy as np
art = {"version": 1, "kind": "logistic", "horizon": 5, "b": 0.02,
       "features": ["ret1", "mom10", "vol20"], "w": [-0.84, 0.61, -0.18],
       "mu": [0.0, 0.0, 0.004], "sd": [0.002, 0.01, 0.001]}
with tempfile.TemporaryDirectory() as d:
    p = os.path.join(d, "signal_v1.json"); json.dump(art, open(p, "w"))
    a = json.load(open(p))                       # load ONCE, in __init__
w, mu, sd = (np.array(a[k]) for k in ("w", "mu", "sd"))
z = ((np.array([0.001, 0.012, 0.005]) - mu) / sd) @ w + a["b"]
print("v%d %s h=%d" % (a["version"], a["features"], a["horizon"]),
      "p_up %.4f" % (1 / (1 + np.exp(-z))), "| contract ok:", len(a["features"]) == len(w))
# v1 ['ret1', 'mom10', 'vol20'] h=5 p_up 0.5379 | contract ok: True""",
            "deck": "Deck Week 7 · slide 15 · Deck Week 7 · slide 18",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "Machine learning replaces the signal, not the system. The model emits one number; your sizing, stop-loss, position limit and routing are unchanged, and the seam is the same one you have used all quarter — a signal_fn with the registry signature, or on_tick in the SDK. That is the whole integration: compute features from market and portfolio, call the model, and turn a probability into a Signal above a threshold or into None below it. Everything expensive stays offline, because the pipeline that produced last week's cached features is what trains it.",
            "Honesty is the entire deliverable here. Financial returns are mostly noise, so a 52% out-of-sample model can be excellent while a 90% in-sample one is worthless. Split in time, embargo the horizon, walk forward, report mean and dispersion, and look at the final test block once. Run the two controls the lab gives you: a shuffled-label run, which should collapse to a coin flip, and a random-walk symbol, where the honest answer is no edge. If the score survives both, you have something; if you tuned on the test block, you have a number with no meaning.",
            "Costs decide whether the edge is real. A model that is right 55% of the time and flips its view every tick pays the taker fee and half the spread on both legs, which on the arena's schedule is 15 bp each way against an edge measured in single basis points. So make the label fee-aware — only call the move up if it clears the round-trip cost — and score turnover alongside Sharpe. Many machine-learning signals are pure alpha in a backtest and pure transaction cost in a live session.",
            "Live risk is mostly serving discipline. Load the artifact once in __init__ and do arithmetic per tick; if the file is missing or its feature list does not match what you compute, trade nothing and log it rather than crashing mid-session. Measure predict() against the per-tick budget and against the order quota — eight messages per tick in week 7 — because a model that blocks the loop misses the market it just predicted. Then monitor drift: score your own predictions h ticks later and log a rolling live hit rate. Two standard errors below the training number for a whole session means the artifact is stale.",
            "Features have to be identical offline and live or you have leaked. The lab drops obi for exactly that reason: it has zero variance in the simulated tape and MarketData cannot hand it to you live anyway. Write the feature function once, call it from both the training script and on_tick, and validate the recorded feature list on load. The bot you walk-forward validate in sim/session.py is the bot that competes in the season, unchanged.",
        ],
        "example": {
            "title": "In the arena",
            "text": "arena/trader.py defines the Trader base whose on_tick(market, portfolio) returns a Signal or None; market exposes prices(), mid_price(), best_bid/ask() and spread(), and portfolio exposes can_buy()/can_sell(). An ML bot loads its artifact in __init__ and only does arithmetic inside the hook.",
            "code": """# team/trader.py — numpy-only model, artifact frozen offline
import json, math
import numpy as np
from arena import Trader, Signal

class MLTrader(Trader):
    def __init__(self, path="models/signal_v1.json"):
        try:
            self.art = json.load(open(path))       # load ONCE, never in on_tick
        except (OSError, ValueError):
            self.art = None                        # fail safe, not silent
        if self.art:
            self.w, self.mu, self.sd = (np.array(self.art[k]) for k in ("w", "mu", "sd"))

    def on_tick(self, market, portfolio):
        if self.art is None:
            return None                            # no artifact -> trade nothing
        for sym in market.symbols():
            px, spread, mid = market.prices(sym), market.spread(sym), market.mid_price(sym)
            if len(px) < 21 or spread is None or not mid:
                continue
            p_ = np.array(px[-21:], float); rets = p_[1:] / p_[:-1] - 1
            x = np.array([rets[-1], p_[-1] / p_[-6] - 1, p_[-1] / p_[-11] - 1,
                          rets.std(), spread / mid * 1e4])
            z = float(((x - self.mu) / self.sd) @ self.w + self.art["b"])
            p = 1 / (1 + math.exp(-max(-60, min(60, z))))
            ask = market.best_ask(sym)
            if p > 0.55 and ask and portfolio.can_buy(sym, 2, ask):
                return Signal(symbol=sym, side="buy", quantity=2, price=ask, confidence=p)
        return None""",
        },
    },
    "interview": [
        {
            "q": "You want a model that predicts direction over the next five ticks. What are X and y, and what is the one rule you cannot break?",
            "a": "X is one row per point in time holding only quantities knowable at t — recent returns, momentum over a lookback, rolling volatility, the spread, book imbalance. y is about t+h: for direction, 1 if mid[t+h] > mid[t] else 0. The rule is that nothing in X may touch data after t, and that includes the scaler — fit mu and sd on the training slice only. The horizon also has to match the holding period, because a 5-tick label validates a 5-tick trade and nothing else.",
            "level": "warm-up",
            "skill": "quant.supervised-setup",
        },
        {
            "q": "Why can a 52% accurate model be excellent while a 99% accurate one is useless?",
            "a": "Because accuracy ignores both the payoff and the base rate. Financial returns are mostly noise, so on balanced up-and-down labels a couple of points above a coin flip, repeated with disciplined sizing, is a real edge. A 99% model on a rare event is usually predicting the majority class and earns nothing when it is right and loses heavily on the 1%. What matters is hit rate together with the average win over the average loss, out-of-sample, after fees and spread.",
            "level": "warm-up",
            "skill": "quant.signal-scoring",
        },
        {
            "q": "Your model scores 0.57 on a random 70/30 split and 0.48 walk-forward. What happened?",
            "a": "The random split leaked. With a horizon of h the labels of neighbouring rows overlap, and their features are nearly identical, so shuffling puts each test row's near-twin in the training set and the model recognises it instead of generalising. Split chronologically and drop the last h training rows as an embargo so no training label reaches across the wall. The 0.48 is the honest number; on a random-walk symbol that is exactly what you should see, and the gap is the measure of the leak.",
            "level": "core",
            "skill": "quant.look-ahead",
        },
        {
            "q": "Expanding window or rolling window for walk-forward folds?",
            "a": "Expanding keeps all history, so each fold trains on more data and the estimates are more stable — good when the relationship is roughly stationary. Rolling forgets the distant past, which is what you want under drift, because a regime from two years ago dilutes the current one. In practice I run both and compare: if rolling wins, the process is non-stationary and that is a finding about the market, not a hyperparameter. Either way every test block stays out-of-sample, the embargo applies per fold, and I report the mean with the fold-to-fold dispersion.",
            "level": "core",
            "skill": "quant.walk-forward",
        },
        {
            "q": "Name three concrete ways a feature can leak the future, and the check that rules each one out.",
            "a": "First, a centred or unshifted rolling statistic: a rolling mean that includes t+1, or a signal used on the same bar it was computed from — the check is a mandatory shift() and a re-run to confirm the P&L drops. Second, scaling or imputing on the full sample: fit mu and sd on the train slice and apply them to test. Third, a label-derived column, such as a forward return sneaking into X — the check is a shuffled-label control, which must collapse to chance; if the model still scores, a feature encodes the answer.",
            "level": "core",
            "skill": "quant.overfitting",
        },
        {
            "q": "You tried 200 feature-and-hyperparameter configurations and the best one has a Sharpe of 2.1. What do you report?",
            "a": "Not 2.1. Picking the maximum of 200 noisy estimates inflates it by construction, so I report the deflated Sharpe — adjusted down for the number of trials — along with the trial count itself and the dispersion across walk-forward folds. If the test block was used to choose among the 200, it is no longer a test and the honest answer is that there is no out-of-sample number yet. The fixes are budgeting trials up front, logging every run, and keeping one untouched block to look at exactly once.",
            "level": "core",
            "skill": "quant.overfitting",
        },
        {
            "q": "How do you serve a trained model inside a per-tick loop without hurting yourself?",
            "a": "Freeze it offline and ship an artifact that carries its weights, the feature list, the horizon, the scaler statistics and a version. Load it once in the constructor, never per tick, and on load validate that the feature list matches what the bot computes; on a missing or mismatched artifact, return None and log rather than crash. Then measure: time predict() over thousands of calls and compare the tail against the per-tick budget and the message quota. Use the same feature function offline and live, because two implementations is a leak waiting to happen.",
            "level": "senior",
            "skill": "quant.model-ops",
        },
        {
            "q": "The model is live. How do you know when it has stopped working, and what do you do?",
            "a": "Instrument the prediction, not just the P&L. Store (tick, symbol, prediction) when you fire, score it against the realised move h ticks later, and log a rolling live hit rate; track feature distributions and live P&L against the backtest curve as well. If the live hit rate sits about two standard errors below the training number for a whole session, the data-generating process moved. The response is decided in advance: retrain on a rolling window at a fixed cadence or on a drift trigger, version every artifact, and keep the previous one loadable so a rollback is one config change.",
            "level": "senior",
            "skill": "quant.model-ops",
        },
    ],
}

SESSIONS = [s6, s7]
