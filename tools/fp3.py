"""Focus content for FINM 33500 sessions 7 and 8 (window.FOCUS slice).

Session 7 — Big data & distributed compute   (source deck week 6, 22 slides)
Session 8 — Machine learning that makes the strategy better (rebuilt 2026-11-14
            to the new Week 8 class: one concept card per part P0-P8 of
            .claude/handover/week8_ml_redo/OUTLINE.md in the course repo, P3 in
            two cards; no deck chips until the rebuilt week8.pptx lands)

Resequenced 2026-10-11: these were Sessions 6 and 7; the variable names s6/s7
keep the source week. Deck labels cite the new week numbers (Deck Week 7/8).
"""

s6 = {
    "n": 7,
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
            "deck": "Deck Week 7 · slide 5",
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
            "deck": "Deck Week 7 · slide 6",
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
            "deck": "Deck Week 7 · slides 8–9",
        },
        {
            "title": "Scale up first, then out — and use processes",
            "text": "Vertical scaling needs no code change but has a ceiling and prices superlinearly; horizontal scaling is near-unlimited but you must partition the work and combine the results. More RAM plus smaller dtypes plus Parquet often removes the problem outright, so start there. When you do go parallel, remember the GIL: only one thread runs Python bytecode at a time, so threads buy nothing for a CPU-bound sweep. Use processes — ProcessPoolExecutor from the stdlib, with the __main__ guard, because each worker re-imports your module and without the guard it re-spawns the pool. joblib is the same idea in one line. Dask, Ray and Spark extend it across machines; this course names them and stays on one box.",
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
            "deck": "Deck Week 7 · slides 11–12",
        },
        {
            "title": "Map, reduce, shard — and what will not shard",
            "text": "The mental model behind every scale-out: apply the same function to each independent piece (map), then combine the partials (reduce), with a shard key chosen so the pieces really are independent — per symbol, per date range, per parameter. Parameter sweeps and per-symbol backtests are embarrassingly parallel: nothing is shared, so you just collect results. A stateful order book is not. Matching depends on the order of arrivals, so sharding it blindly changes the answer; dependencies force coordination. Measure the win rather than assuming n_cores: the lab's byte-range map-reduce over ten shards returned 2.1x, because process start-up, pickling partials and one shared disk all take their cut.",
            "deck": "Deck Week 7 · slides 13–14",
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
            "deck": "Deck Week 7 · slide 15",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "Scale is what separates a strategy from a search. One backtest tells you whether one lookback worked on one tape; a sweep tells you whether the edge exists across a neighbourhood of parameters, which is the only version worth trading. That is why the week-6 deliverable is a parallel sweep with one run per configuration and a Sharpe collected per point, and why the headless sim is built to be fanned out: SimSession().run() is pure and in-process with no sockets, so twenty of them can run at once.",
            "The pipeline splits in two at a hard seam. Offline you build features — returns, rolling means, rolling vol — and cache them to Parquet; online your signal function reads the freshest rows of that frame and does arithmetic only. Get the seam wrong and you pay twice: a groupby-rolling inside on_tick blows the per-tick budget, and features computed differently offline and live give you a bot that was validated on numbers it never sees again.",
            "Reproducibility is what makes an offline result believable. A sweep that cannot be re-run to the same numbers cannot be defended: pin seed=, pin the data version, pin the dtypes, and key every output on a hash of its inputs so a retried worker overwrites itself instead of double-counting. Log every configuration you tried, too — that count is what week 8 uses to deflate the best Sharpe you found, and a sweep is a very efficient way to try hundreds of things.",
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
    "n": 8,
    "focus": "Machine learning that makes the strategy better",
    "tagline": "A model earns its place in the bot only when it beats the rule you already have — out-of-sample, in time order, after costs — so the class runs the pipeline from features to a frozen model in on_tick, and every model it climbs through is judged that way.",
    "concepts": [
        {
            "title": "Why machine learning in trading — a better strategy, not a new system",
            "text": "Machine learning is there for one reason: to make the strategy better — a better signal, better execution, better risk. In the pipeline you have built all quarter (gateway in, book, signal, execution, order management, gateway out) a model replaces or sharpens the signal or the execution-cost estimate; it never replaces the system around it. Typical uses: predict the direction or the return over the next h ticks, spot patterns in order flow, detect the regime, predict the cost of an order, score news sentiment, flag a bot that has gone wrong. Three things make it dangerous here. Signal-to-noise is tiny, so a 52% hit rate is either an edge or pure luck depending on how many trades stand behind it. Markets are non-stationary, so models rot. And your own trades feed back into the prices you learn from. The rule for the whole class: spend as much time catching yourself cheating as fitting. What this changes in your bot: nothing until a model beats your current rule out-of-sample, after costs.",
            "code": """import math
def z_of(hit_rate, n):                  # how many standard errors above a coin flip
    return (hit_rate - 0.5) / math.sqrt(0.25 / n)
for n in (200, 2_000, 10_000):
    print(f"52% on {n:>6} trades: z = {z_of(0.52, n):.2f}")
fee_bp, edge_bp = 15.0, 4.0              # taker fee each way vs the move you predict
print("edge after a round trip (bp):", edge_bp - 2 * fee_bp)
# 52% on 200 trades: z = 0.57
# 52% on 10000 trades: z = 4.00
# edge after a round trip (bp): -26.0""",
        },
        {
            "title": "Supervised vs unsupervised — two kinds of question",
            "text": "Supervised learning has an answer to learn: features X known at time t and a label y about t+h. Ask for a class (up or down, filled or not filled) and it is classification; ask for a number (the next return, the cost of an order) and it is regression. Unsupervised learning has no label: it finds structure — clustering volatility, volume and spread into market regimes, PCA for the common factors of a basket, anomaly detection on your own fills and messages to catch a bot that misbehaves. Reinforcement learning (learning an execution policy by trial and error) is a third family, out of scope here. In the arena: a classifier predicts the sign of the next 10-tick mark move; k-means on volatility and spread tells a calm book from a stressed one, which can switch your quote width or your position limit. What this changes in your bot: a supervised model becomes the signal; an unsupervised one usually becomes a switch on the rules you already have.",
            "code": """import numpy as np
from sklearn.cluster import KMeans
from sklearn.linear_model import LogisticRegression
rng = np.random.default_rng(1)
calm  = np.c_[rng.normal(10, 2, 300), rng.normal(2, 0.5, 300)]    # vol bp, spread bp
storm = np.c_[rng.normal(45, 8, 100), rng.normal(9, 2.0, 100)]
F = np.r_[calm, storm]
regime = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(F)   # no labels
print("unsupervised regimes:", sorted(np.bincount(regime).tolist()))
x = rng.normal(0, 1, (400, 1)); y = (x[:, 0] + rng.normal(0, 1, 400) > 0).astype(int)
clf = LogisticRegression().fit(x[:300], y[:300])                 # labels: up / down
print("supervised: coef > 0:", bool(clf.coef_[0, 0] > 0),
      "| p(up | x=+2) > 0.8:", bool(clf.predict_proba([[2.0]])[0, 1] > 0.8))
# unsupervised regimes: [99, 301]
# supervised: coef > 0: True | p(up | x=+2) > 0.8: True""",
        },
        {
            "title": "Technical indicators — the feature factory, and why so many parameters",
            "text": "Technical indicators are the classical hand-made features: SMA and EMA gaps, momentum or rate of change, RSI, MACD, Bollinger z-scores, ATR or realised volatility, the distance to VWAP, order-book imbalance, the spread in basis points, trade-flow imbalance. Every one of them has windows and thresholds, and every window is a parameter: 10 indicators in 20 settings over 9 symbols is 1,800 columns before you add the model's own parameters (coefficients, depth, C, gamma, layers) and its hyperparameters. That is more columns than your data has independent information, which is exactly the curse of dimensionality and the overfitting the next cards deal with. Two rules. Shift every feature so that row t only uses what was known at t. And compute it in O(1) per tick inside on_tick with the rolling statistics from Week 6, never by recomputing a window. What this changes in your bot: pick a handful of indicators you can defend, not every setting you can generate.",
            "code": """import numpy as np, pandas as pd
rng = np.random.default_rng(3)
px = pd.Series(100 + np.cumsum(rng.normal(0, 0.2, 500)))
def rsi(p, n):
    d = p.diff(); up = d.clip(lower=0).rolling(n).mean(); dn = (-d.clip(upper=0)).rolling(n).mean()
    return 100 - 100 / (1 + up / dn)
feat = pd.DataFrame({
    "sma_gap_20": px / px.rolling(20).mean() - 1,
    "ema_gap_10": px / px.ewm(span=10).mean() - 1,
    "roc_5": px.pct_change(5),
    "rsi_14": rsi(px, 14),
    "boll_z_20": (px - px.rolling(20).mean()) / px.rolling(20).std(),
    "rvol_20": px.pct_change().rolling(20).std(),
}).shift(1).dropna()                         # shift: only what was known at t
print("rows", len(feat), "| features", feat.shape[1], "| RSI in [0,100]:",
      bool(feat.rsi_14.between(0, 100).all()))
indicators, settings, symbols = 10, 20, 9   # each window/threshold is a parameter
print("columns you could build:", indicators * settings * symbols)
# rows 479 | features 6 | RSI in [0,100]: True
# columns you could build: 1800""",
        },
        {
            "title": "The pipeline, part 1 — clean, standardise, as-of merge",
            "text": "Start with a hypothesis you write down before touching the data (\"imbalance at the touch predicts the next move\"), then choose the data and its granularity: arena tapes, the history zips, news and events. Cleaning comes first: drop duplicate timestamps, turn impossible values (a negative mid, a crossed book) into missing ones, fill gaps from the past only, fix types and align the clocks of the different streams. Standardise features (z-score, or a robust median/IQR scale) with statistics fitted on the training slice only, then apply those numbers to validation and test. Merge on time with an as-of join that only looks backward: each tick gets the latest news score, event or book state that already existed, never the next one. A single forward-looking merge is enough to produce a beautiful and worthless backtest. What this changes in your bot: the feature function you write here is the one the bot calls live, so the cleaning and the scaling must be the same code.",
            "code": """import numpy as np, pandas as pd
from sklearn.preprocessing import StandardScaler
ticks = pd.DataFrame({"ts": pd.to_datetime([1, 2, 2, 3, 4, 5, 6, 7], unit="s"),
                      "mid": [100.0, 100.1, 100.1, -1.0, 100.3, np.nan, 100.2, 100.4]})
ticks = ticks.drop_duplicates("ts").reset_index(drop=True)     # 1. duplicates
ticks.loc[ticks.mid <= 0, "mid"] = np.nan                       # 2. impossible values
ticks["mid"] = ticks.mid.ffill()                                # 3. gaps: last known, never next
news = pd.DataFrame({"ts": pd.to_datetime([2.5, 5.5], unit="s"), "sent": [0.8, -0.6]})
m = pd.merge_asof(ticks, news, on="ts", direction="backward")   # 4. as-of: no future rows
print("sentiment as of each tick:", m.sent.fillna(0).tolist())
X = m[["mid"]].to_numpy(); cut = 4
sc = StandardScaler().fit(X[:cut])                              # 5. fit on TRAIN only
print("train mean", round(float(sc.mean_[0]), 3), "| test z", sc.transform(X[cut:]).round(1).ravel().tolist())
# sentiment as of each tick: [0.0, 0.0, 0.8, 0.8, 0.8, -0.6, -0.6]""",
        },
        {
            "title": "The pipeline, part 2 — cross-validate in time, then measure",
            "text": "Random K-fold lies on time series: neighbouring rows have near-identical features and labels that overlap over the horizon, so shuffling puts each test row's twin in the training set. Use time splits instead — walk-forward folds, with the rows that straddle each boundary purged and an embargo of h rows after it (sklearn's TimeSeriesSplit(gap=h)). Train, choose hyperparameters on validation folds, and touch the test block once. Then measure with metrics chosen for the question. Classification: accuracy, precision and recall, F1, ROC-AUC, log-loss, the confusion matrix. Regression: MSE or RMSE, MAE, R squared out-of-sample. Trading: hit rate, P&L after fees and spread, Sharpe, turnover, maximum drawdown, capacity. Always against baselines first — always-up and the momentum rule. The snippet runs on a random walk, where the honest answer is no edge; note that even one honest test block can print an AUC of 0.6 by luck, which is why you report several folds and their dispersion. What this changes in your bot: you only ship what wins walk-forward against the baseline.",
            "code": """import numpy as np
from sklearn.model_selection import KFold, TimeSeriesSplit, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import precision_score, recall_score, roc_auc_score
rng = np.random.default_rng(0)
mid = 100 + np.cumsum(rng.normal(0, 0.05, 4000))      # random walk: there is NO edge
h, t = 50, np.arange(200, 3950)
X = np.c_[mid[t] / mid[t - 100] - 1, mid[t] / mid[t - 200] - 1]
y = (mid[t + h] > mid[t]).astype(int)                 # neighbours share most of a label
knn = KNeighborsClassifier(n_neighbors=1)
shuf = cross_val_score(knn, X, y, cv=KFold(5, shuffle=True, random_state=0)).mean()
purged = cross_val_score(knn, X, y, cv=TimeSeriesSplit(5, gap=h)).mean()   # gap = embargo
print("shuffled K-fold", round(shuf, 2), "| time split + gap", round(purged, 2))
print("shuffled CV lies:", shuf - purged > 0.1)
cut = 3000; p = knn.fit(X[:cut - h], y[:cut - h]).predict(X[cut:])         # test once
print("precision", round(precision_score(y[cut:], p), 2), "| recall",
      round(recall_score(y[cut:], p), 2), "| AUC", round(roc_auc_score(y[cut:], p), 2))
# shuffled K-fold 0.68 | time split + gap 0.53
# shuffled CV lies: True""",
        },
        {
            "title": "The curse of dimensionality — and its remedies",
            "text": "Add columns and the space empties out: the volume of the hypercube grows exponentially, distances between points concentrate (the nearest and the farthest neighbour look alike), and the number of rows you need to cover the space explodes. In finance n is small and noisy, so this bites early. Three remedies. Shrinkage: ridge (L2) pulls every weight towards zero, lasso (L1) sets most of them to exactly zero and so selects features, elastic net mixes both. PCA rotates the basis to the directions of largest variance (an SVD): on the arena basket the first component is the market factor and the next ones are eigen-portfolios; the scree plot tells you how many to keep. LDA is the supervised cousin: the projection that best separates the classes rather than the one that keeps the most variance. Feature selection keeps original columns; feature extraction builds new ones. What this changes in your bot: fewer, better inputs, and a penalty chosen by time-aware cross-validation.",
            "code": """import numpy as np
from sklearn.linear_model import Ridge, Lasso
from sklearn.decomposition import PCA
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
rng = np.random.default_rng(4)
for d in (2, 100, 1000):                      # distances concentrate as d grows
    D = np.linalg.norm(rng.random((200, d)) - rng.random(d), axis=1)
    print(f"d={d:>4}  (max-min)/min distance = {(D.max() - D.min()) / D.min():.2f}")
n, p = 120, 60                                # few rows, many indicator columns
X = rng.normal(size=(n, p)); y = 0.5 * X[:, 0] - 0.3 * X[:, 1] + rng.normal(0, 1, n)
print("lasso keeps", int((Lasso(alpha=0.1).fit(X, y).coef_ != 0).sum()), "of", p,
      "| ridge keeps", int((Ridge(alpha=10).fit(X, y).coef_ != 0).sum()))
mkt = rng.normal(0, 1, (500, 1))              # one common factor drives 9 symbols
R = mkt + 0.5 * rng.normal(0, 1, (500, 9))
print("PC1 explains > 70% of the basket:", bool(PCA().fit(R).explained_variance_ratio_[0] > 0.7))
lab = (R[:, 0] - R[:, 1] > 0).astype(int)     # LDA: the projection that separates labels
print("LDA separates the classes:", bool(LDA().fit(R, lab).score(R, lab) > 0.9))
# lasso keeps 19 of 60 | ridge keeps 60
# PC1 explains > 70% of the basket: True
# LDA separates the classes: True""",
        },
        {
            "title": "Linear models, and the overfitting picture",
            "text": "Ordinary least squares has a closed form, t-statistics and an R squared — and the in-sample R squared always flatters you, so report it out-of-sample. Logistic regression puts the same linear score through a sigmoid and is fitted on log-loss; its output is a probability you can threshold and size with, provided it is calibrated. The overfitting picture is the one to remember: fit polynomials of degree 1 to 15 on noisy data and the training error falls every time while the test error turns up; the same U appears when the ridge penalty goes to zero. Test error is bias plus variance plus irreducible noise, and in markets the noise term is most of it. Limits of a line: interactions (up only when two features agree), regime changes, outliers, noise that changes with volatility. What this changes in your bot: a logistic regression on a few standardised features is the first model to beat, and often the one you keep.",
            "code": """import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import mean_squared_error as mse
rng = np.random.default_rng(5)
x = rng.uniform(-1, 1, (60, 1)); y = 0.8 * x[:, 0] + rng.normal(0, 0.3, 60)
xt = rng.uniform(-1, 1, (500, 1)); yt = 0.8 * xt[:, 0] + rng.normal(0, 0.3, 500)
tr, te = [], []
for deg in (1, 3, 15):                       # more parameters: train error always falls
    m = make_pipeline(PolynomialFeatures(deg), StandardScaler(), LinearRegression()).fit(x, y)
    tr.append(mse(y, m.predict(x))); te.append(mse(yt, m.predict(xt)))
    print(f"degree {deg:>2}: train {tr[-1]:.3f}  test {te[-1]:.3f}")
print("train falls:", tr[0] > tr[1] > tr[2], "| test U-turns:", te[2] > te[0])
up = (y > 0).astype(int)
p = LogisticRegression().fit(x, up).predict_proba([[0.5]])[0, 1]   # a probability you can size with
print("P(up | x=0.5) between 0.5 and 1:", 0.5 < p < 1)
# degree 15: train 0.047 test 0.116
# train falls: True | test U-turns: True
# P(up | x=0.5) between 0.5 and 1: True""",
        },
        {
            "title": "Non-linear models — trees, forests, boosting, SVMs, neural nets",
            "text": "A decision tree splits on the feature and threshold that reduce impurity most; depth and minimum leaf size are its overfitting knobs, and its rules can be read. A random forest averages many deep trees, each on a bootstrap sample with a random subset of features: lower variance, an out-of-bag error for free, feature importance, and it trains in parallel. Gradient boosting fits trees one after the other on the residuals of the ensemble so far, with a learning rate and early stopping (sklearn's HistGradientBoosting); because each tree needs the previous one, it parallelises badly across trees. A support vector machine maximises the margin, C trades margin for errors, and a kernel (polynomial, RBF with gamma) separates data that no line can, without building the features. A multilayer perceptron stacks layers and activations trained by backpropagation over epochs; learning curves, early stopping and dropout keep it honest, and it needs far more data than 500 noisy bars — it shines on images and text. Climb this ladder one rung at a time, on the same features and the same walk-forward, and watch the cost per prediction. What this changes in your bot: a non-linear model earns its place only when it beats the logistic and the momentum baseline out-of-sample.",
            "code": """import numpy as np, time
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
rng = np.random.default_rng(6)
X = rng.uniform(-1, 1, (1200, 2))            # an interaction: up only when the two agree
y = ((X[:, 0] * X[:, 1] > 0) ^ (rng.random(1200) < 0.1)).astype(int)   # 10% label noise
Xtr, ytr, Xte, yte = X[:800], y[:800], X[800:], y[800:]
models = {"logistic": LogisticRegression(),
          "tree d=4": DecisionTreeClassifier(max_depth=4, random_state=0),
          "forest": RandomForestClassifier(200, min_samples_leaf=5, n_jobs=-1, random_state=0),
          "boosting": HistGradientBoostingClassifier(learning_rate=0.1, random_state=0),
          "svm rbf": SVC(kernel="rbf", C=1.0, gamma=2.0),
          "mlp": MLPClassifier((16, 16), max_iter=2000, random_state=0)}
acc = {}
for name, m in models.items():
    m.fit(Xtr, ytr); t0 = time.perf_counter(); acc[name] = m.score(Xte, yte)
    us = (time.perf_counter() - t0) / len(Xte) * 1e6
    print(f"{name:<9} test acc {acc[name]:.2f}   {us:6.1f} us per row, batched")
print("no line separates XOR:", acc["logistic"] < 0.65,
      "| every non-linear model > 0.8:", min(v for k, v in acc.items() if k != "logistic") > 0.8)
# no line separates XOR: True | every non-linear model > 0.8: True""",
        },
        {
            "title": "From model to bot — freeze, load, predict, fall back, monitor",
            "text": "Apply the whole pipeline to an arena question — the next k-tick mark move, or patterns in the house desk's flow from book and trade-flow features on the week-9 history — walk it forward in the simulator, then freeze the winner: joblib (or JSON weights) together with its feature list, horizon and version. Load it once in __init__, check the feature list on load, and predict inside on_tick within the per-tick budget. If the artifact is missing or does not match, fall back to the baseline rule and log it: never crash, never guess. Then monitor drift: score each prediction h ticks later and keep a rolling live hit rate; when it sits well below the training number, stop trusting the model and retrain on a fixed cadence or on that trigger. Judge it the only way that counts — P&L after fees against the momentum baseline. What this changes in your bot: this card is the bot; the Week 9 block rewards a model built this way.",
            "code": """import os, tempfile, joblib, numpy as np
from collections import deque
from sklearn.linear_model import LogisticRegression
FEATURES = ["ret1", "mom5", "vol20"]                       # one feature function, offline AND live
rng = np.random.default_rng(9); X = rng.normal(size=(500, 3)); y = (X[:, 1] > 0).astype(int)
path = os.path.join(tempfile.mkdtemp(), "signal_v3.joblib")
joblib.dump({"model": LogisticRegression().fit(X, y), "features": FEATURES, "version": 3}, path)  # freeze

def load(p):                                               # once, in __init__ — never per tick
    try:
        art = joblib.load(p)
        return art if art["features"] == FEATURES else None   # schema check on load
    except (OSError, KeyError, ValueError):
        return None
art, missing = load(path), load(path + ".gone")
def decide(art, x):                                        # in on_tick
    if art is None:
        return "fallback: momentum rule"                   # never crash, never guess
    return "buy" if art["model"].predict_proba([x])[0, 1] > 0.6 else "hold"
print(decide(art, [0.0, 1.5, 0.2]), "|", decide(missing, [0.0, 1.5, 0.2]))
hits = deque(maxlen=50); hits.extend([1] * 22 + [0] * 28)  # score each call h ticks later
print("live hit rate", sum(hits) / len(hits), "| drift alarm:", sum(hits) / len(hits) < 0.5)
# buy | fallback: momentum rule
# live hit rate 0.44 | drift alarm: True""",
        },
        {
            "title": "Unstructured data — from news to a sentiment feature",
            "text": "Text becomes a signal through the same pipeline. Start from the raw item — a headline, a filing, a post, or the arena's own news and event messages — and extract metadata: the time you received it (not the time printed on it), the source, the tickers and entities, the topic, the language, and a dedup key, because the same story arrives several times. Score it: a finance word list in the Loughran-McDonald style is transparent and fast; a transformer classifier reads context. As-of merge the scores with prices, run an event study (the return in the window after the item) to see whether the score means anything, and only then build a feature — a sentiment per symbol that decays with a half-life. Licensing matters: vendor news usually forbids training on it, while EDGAR, RSS feeds and public headlines are free. What this changes in your bot: one more feature known at t, judged by the same walk-forward as the others.",
            "code": """import math, re
POS = {"beat", "beats", "raises", "upgrade", "record", "surge"}      # Loughran-McDonald style lists
NEG = {"miss", "misses", "warning", "downgrade", "probe", "cuts", "recall"}
news = [(100, "Reuters", "NVDA beats estimates, raises guidance"),
        (160, "PR wire", "TSLA recall widens; analysts downgrade"),
        (170, "Reuters", "NVDA beats estimates, raises guidance")]  # a duplicate story
seen, feed = set(), []
for ts, src, text in news:                                         # 1. metadata + dedup
    if text in seen:
        continue
    seen.add(text)
    words = re.findall(r"[a-z]+", text.lower())
    score = (sum(w in POS for w in words) - sum(w in NEG for w in words)) / len(words)
    feed.append({"ts": ts, "src": src, "ticker": text.split()[0], "score": round(score, 3)})
print([(f["ticker"], f["score"]) for f in feed])
def decayed(ticker, now, half_life=60.0):                          # 2. the feature at tick `now`
    return sum(f["score"] * 0.5 ** ((now - f["ts"]) / half_life)
               for f in feed if f["ticker"] == ticker and f["ts"] <= now)   # as-of: no future news
print("NVDA at t=160:", round(decayed("NVDA", 160), 3), "| TSLA at t=150:", decayed("TSLA", 150))
# [('NVDA', 0.4), ('TSLA', -0.4)]
# NVDA at t=160: 0.2 | TSLA at t=150: 0""",
        },
        {
            "title": "Fine-tuning a transformer on financial headlines",
            "text": "An off-the-shelf sentiment model is trained on movie reviews and gets finance wrong: \"profit warning\" and \"beat estimates\" are not in its world. Fine-tuning fixes that cheaply: take a pretrained DistilBERT (about 66 million parameters), put a new classification head on it for negative, neutral and positive, freeze the pretrained body and train only the head (about 0.6 million parameters) on a few hundred labelled financial headlines — optionally unfreezing the last layers. Compare held-out accuracy before and after, and look for the sentences that flip. On a laptop CPU it takes minutes. In production you would start from a finance-specific model such as FinBERT. What this changes in your bot: a sentiment score that understands the vocabulary of the market — still one feature among others, still validated in time. The snippet runs offline: it uses only cached weights, and skips the transformer part if the library or the weights are not there.",
            "code": """import os; os.environ.setdefault("HF_HUB_OFFLINE", "1")   # cached weights only, no download
H, LABELS = 768, 3                                          # DistilBERT width; neg / neutral / pos
head = (H * H + H) + (H * LABELS + LABELS)                  # pre_classifier + classifier
try:
    from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline
    sst2 = pipeline("sentiment-analysis",                   # off the shelf: movie reviews, not markets
                    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english")
    print("sst-2 says:", [r["label"] for r in sst2(["profit warning", "beat estimates"])])
    name = "distilbert-base-uncased"
    tok = AutoTokenizer.from_pretrained(name)
    model = AutoModelForSequenceClassification.from_pretrained(name, num_labels=LABELS)
    for p in model.distilbert.parameters():                 # freeze the pretrained body ...
        p.requires_grad = False
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    assert trainable == head                                # ... train only the new head
    batch = tok(["profit warning", "beat estimates"], padding=True, return_tensors="pt")
    print("logits shape", tuple(model(**batch).logits.shape))   # (2 headlines, 3 classes)
except ImportError:
    print("transformers not installed (optional, for Part 8)")
except Exception as e:                                      # e.g. weights not in the local cache
    print("transformer skipped offline:", type(e).__name__)
print("trainable head params", head, "of ~66M")
# trainable head params 592899 of ~66M""",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "Machine learning changes the signal, not the system. Your sizing, stops, position limits and routing stay as they are, and the seam is the one you have used all quarter: on_tick in the SDK returns a Signal or None. A model plugs in there — features computed from the market and the portfolio, one predict call, a threshold that turns a probability into an order. Everything expensive (cleaning, fitting, cross-validation) happens offline; on the tick you only do arithmetic.",
            "Honesty is the deliverable. Returns are mostly noise, so a 52% out-of-sample hit rate over thousands of trades can be excellent while a 90% in-sample one is worthless. Split in time, purge and embargo the horizon, walk forward, report the mean and the dispersion across folds, and look at the test block once. Two controls catch most mistakes: shuffle the labels (the score must collapse to a coin flip) and run on a random walk (the honest answer is no edge).",
            "Costs decide whether an edge exists. A model that is right 55% of the time and flips its view every tick pays the taker fee and the spread on both legs, which on the arena's default schedule is tens of basis points per round trip against an edge measured in single digits. Make the label cost-aware, score turnover next to Sharpe, and always compare with the momentum baseline after fees: many models are alpha in a backtest and transaction cost live.",
            "Serving is risk management. Load the frozen model once, validate its feature list, and keep a fallback rule for the moment the file is missing or wrong; time predict against the per-tick budget and the order quota, because a model that blocks the loop misses the market it predicted. Then watch it: a rolling live hit rate scored h ticks after each call is the cheapest drift alarm there is, and a retrain cadence decided in advance beats a retrain decided in a panic.",
            "The Week 9 block (Fri Dec 4) is built for exactly this pipeline: the house desk's flow contains patterns a model can learn, and the 200 simulated sessions in the week-9 history are the training data. Nobody is told the rule. Build features from the book and the trade flow, walk them forward, freeze the model, and let the block judge it on P&L after fees.",
        ],
        "example": {
            "title": "In the arena",
            "text": "arena/trader.py defines the Trader base: on_tick(market, portfolio) returns a Signal or None, market exposes symbols(), prices(), mid_price(), best_bid()/best_ask() and spread(), portfolio exposes can_buy()/can_sell(). The bot below lives in team/trader.py: it loads a frozen sklearn Pipeline (scaler fitted on train plus a classifier) once in __init__, falls back to the momentum rule when the artifact is missing or its feature list does not match, scores each of its own calls H ticks later, and stops firing when the live hit rate drifts below a coin flip.",
            "code": """# team/trader.py — a frozen sklearn model, loaded once, with a fallback
from collections import deque
import joblib, numpy as np
from arena import Trader, Signal

FEATURES = ["ret1", "mom5", "mom10", "vol20", "spread_bp"]   # the SAME function offline
H = 10                                                       # the label's horizon, in ticks

def features(px, spread, mid):
    p = np.asarray(px[-21:], float); r = p[1:] / p[:-1] - 1
    return [r[-1], p[-1] / p[-6] - 1, p[-1] / p[-11] - 1, r.std(), spread / mid * 1e4]

class MLTrader(Trader):
    def __init__(self, path="models/signal_v3.joblib"):
        try:                                        # load ONCE, never in on_tick
            art = joblib.load(path)
            self.model = art["model"] if art["features"] == FEATURES else None
        except (OSError, KeyError, ValueError):
            self.model = None                       # missing or mismatched -> fallback
        self.pending, self.hits = deque(), deque(maxlen=100)

    def on_tick(self, market, portfolio):
        for _ in range(len(self.pending)):          # drift: score each call H ticks later
            sym, mid0, age = self.pending.popleft()
            if age < H:
                self.pending.append((sym, mid0, age + 1))
            elif market.mid_price(sym):
                self.hits.append(market.mid_price(sym) > mid0)
        live_ok = len(self.hits) < 50 or sum(self.hits) / len(self.hits) >= 0.5
        for sym in market.symbols():
            px, spread, mid = market.prices(sym), market.spread(sym), market.mid_price(sym)
            ask = market.best_ask(sym)
            if len(px) < 21 or not spread or not mid or not ask:
                continue
            if self.model is None:                  # fallback: the momentum baseline
                p_up = 0.7 if px[-1] > px[-11] else 0.3
            else:                                   # a Pipeline: scaler fitted on train only
                p_up = float(self.model.predict_proba([features(px, spread, mid)])[0, 1])
            if p_up > 0.6 and live_ok and portfolio.can_buy(sym, 2, ask):
                self.pending.append((sym, mid, 0))
                return Signal(symbol=sym, side="buy", quantity=2, price=ask, confidence=p_up)
        return None""",
        },
    },
    "interview": [
        {
            "q": "Name one supervised and one unsupervised use of machine learning in a trading bot, and say where each plugs in.",
            "a": "Supervised: predict the sign of the mid move over the next h ticks from features known at t — a classifier whose probability becomes the signal in on_tick. Unsupervised: cluster volatility, volume and spread into regimes with k-means and use the regime as a switch on rules you already have (a wider quote, a smaller position limit). Supervised needs labels about the future; unsupervised needs none and usually changes parameters rather than placing orders.",
            "level": "warm-up",
            "skill": "quant.supervised-setup",
        },
        {
            "q": "The kernel trick in one sentence — and what C and gamma do in an RBF SVM.",
            "a": "The kernel trick computes inner products in a high-dimensional feature space directly from the original inputs, so a linear max-margin classifier there draws a non-linear boundary here without ever building those features. C is the price of a margin violation: large C fits the training set tightly (low bias, high variance), small C accepts errors for a wider margin. Gamma is the RBF's reach: large gamma makes each point's influence local and the boundary wiggly, small gamma makes it smooth. Both are chosen by time-aware cross-validation.",
            "level": "warm-up",
            "skill": "quant.svm-kernels",
        },
        {
            "q": "Your classifier scores 0.68 with shuffled 5-fold cross-validation and 0.53 with a time split. Which do you believe, and why does shuffled CV lie here?",
            "a": "The time split. With a horizon of h ticks, neighbouring rows have nearly identical features and labels that overlap over most of the window, so a shuffled fold puts each test row's near-twin in the training set and the model recognises it instead of predicting. Split chronologically, purge the rows whose labels straddle the boundary and embargo h rows after it (TimeSeriesSplit(gap=h) is the minimum). The gap between the two numbers is the size of the leak; on a random walk 0.53 is roughly the honest answer.",
            "level": "core",
            "skill": "quant.walk-forward",
        },
        {
            "q": "Explain the bias-variance trade-off with the model you would fit in a trading bot.",
            "a": "Expected test error is bias squared plus variance plus irreducible noise. A logistic regression on three features has high bias (it cannot bend) and low variance (it barely changes when the data does); a deep tree or a degree-15 polynomial has low bias and huge variance, so training error falls while test error turns up. In markets the noise term dominates, so variance is the enemy: regularise, keep few features, prefer the simpler model unless the complex one wins walk-forward, and read the train-test gap as the overfitting meter.",
            "level": "core",
            "skill": "quant.overfitting",
        },
        {
            "q": "When does a decision tree beat a logistic regression, and when does it lose?",
            "a": "A tree wins when the signal is an interaction or a threshold — buy only when imbalance is high and the spread is tight, an XOR-shaped rule no single line can draw — or when features have very different scales and outliers, which a tree does not care about. It loses when the relationship is smooth and roughly linear in noisy data: the tree spends splits fitting noise, its predictions are step functions, and its variance is high. That is why the forest (averaging) and boosting (small steps) exist, and why the logistic stays the baseline.",
            "level": "core",
            "skill": "quant.decision-tree",
        },
        {
            "q": "Why does a random forest parallelise well and gradient boosting badly?",
            "a": "A forest's trees are independent — each sees its own bootstrap sample and feature subset — so they can be grown on every core at once and averaged at the end. Boosting is sequential by construction: tree k is fitted to the residuals of trees 1 to k-1, so it cannot start until the previous one is done. Implementations parallelise inside a tree (histogram building over features and rows, which is what HistGradientBoosting does), but not across trees. The trade-off: boosting usually wins on accuracy per tree, the forest on wall-clock training and robustness.",
            "level": "core",
            "skill": "quant.boosting",
        },
        {
            "q": "PCA versus LDA on the same feature set: what does each keep?",
            "a": "PCA is unsupervised: it rotates to the orthogonal directions of largest variance and keeps the first few, regardless of the labels — on a basket of returns the first component is the market factor. LDA is supervised: it finds the projection that maximises the distance between class means relative to the spread within classes, at most one fewer dimension than there are classes. A high-variance direction can be useless for prediction and a low-variance one can carry the signal, so PCA compresses and LDA discriminates; fit both on the training slice only.",
            "level": "core",
            "skill": "quant.pca-lda",
        },
        {
            "q": "For a buy signal, do you care more about precision or recall, and how do you set the threshold?",
            "a": "Usually precision: every positive is a trade that pays fees and the spread, so a false positive costs real money while a missed opportunity costs nothing but the edge you did not take. Recall matters when missing the move is expensive (a hedge, a stop). Rather than 0.5, set the threshold on the validation folds by maximising P&L after costs or a precision floor, read the precision-recall curve rather than accuracy, and check the threshold is stable across folds; then confirm on the untouched test block.",
            "level": "core",
            "skill": "quant.signal-scoring",
        },
        {
            "q": "Your fine-tuned headline model is live in a bot. What exactly changed when you fine-tuned, and what can still go wrong?",
            "a": "Fine-tuning added a new classification head for negative, neutral and positive on top of a pretrained DistilBERT and updated its weights (and optionally the last transformer layers) on our labelled financial headlines; the tokenizer, the vocabulary and most of the 66 million body weights are unchanged, so the model now maps finance phrases like 'profit warning' to the right class. What can go wrong: a few hundred labels overfit, so measure on held-out headlines; the score is only a feature, so it still needs an as-of merge on the time received and an event study; inference is milliseconds, so score asynchronously off the tick path; and the training text must be licensed for training.",
            "level": "senior",
            "skill": "quant.fine-tuning",
        },
        {
            "q": "Walk me through serving a model inside on_tick, from the file on disk to the drift alarm.",
            "a": "Offline, freeze the fitted pipeline (scaler plus model) with its feature list, horizon and version. In __init__, load it once, check the feature list against the feature function the bot uses — the same code that built the training set — and on any failure fall back to the baseline rule and log it. In on_tick, compute the features in O(1), call predict_proba once, threshold, and keep the call inside the per-tick budget and the message quota. Store each prediction, score it h ticks later, and keep a rolling live hit rate; if it sits two standard errors below the validation number for a session, stop trading the model, retrain on a rolling window and keep the previous artifact for a one-line rollback.",
            "level": "senior",
            "skill": "quant.model-ops",
        },
    ],
}


SESSIONS = [s6, s7]
