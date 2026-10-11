"""FOCUS slices for FINM 33500 sessions 3, 4 and 5.

Every `code` snippet in this module was executed with python3 (3.13) and its
trailing `#` comment lines are the real captured stdout.
"""

SESSIONS = [

# ─────────────────────────────────────────────────────────────── session 3 ──
# The content committed in focus.js by b9e9063 (Session 3 rewritten in teaching
# order), brought back into this source on 2026-10-10.
{
    "n": 3,
    "focus": "The stack, sockets & wire protocols",
    "tagline": "Nine things happen between joining the Wi-Fi and your first quote. Learn the layer each one lives at, pick TCP or UDP by what a loss costs, frame your bytes, read FIX and ITCH, then let a WebSocket and a typed schema carry your orders.",
    "concepts": [
        {
            "title": "Seven OSI layers, four that the Internet implements",
            "text": "OSI is a vocabulary for saying where something lives or fails; TCP/IP is what is actually implemented. Here is each layer with its job, PDU, header, protocols and devices. L1 Physical puts bits on a medium (radio, copper, fibre, through antennas and optics). L2 Data link delivers a frame to the next hop: MAC addresses and an FCS, over 802.11 or Ethernet, with ARP resolving the gateway's MAC, through NICs, access points and switches. L3 Network moves a packet host to host: a 20-byte IPv4 header with TTL and protocol, through routers and NAT. L4 Transport is process to process: ports, plus TCP's sequence, ack, window and flags, on host kernels, firewalls and NAT. L5 Session and L6 Presentation have no protocol of their own on the Internet; TLS 1.3 and your encoding (JSON, SBE) live there. L7 Application is DNS, HTTP, the WebSocket, FIX and our JSON. TCP/IP folds L1–2 into Link and L5–7 into Application. Each layer reads only its own header and hands the rest up. Setup from this laptop to the arena took about 250 ms (DNS 53 ms, TCP 25 ms, TLS 35 ms, upgrade 26 ms), once per session.",
            "code": """STACK = [  # OSI layer, PDU, TCP/IP layer, what tonight's quote carries there
    (7, "Application",  "message",  "Application", "DNS, HTTP, WebSocket 2-14 B, our JSON"),
    (6, "Presentation", "-",        "Application", "TLS encryption; JSON / SBE encoding"),
    (5, "Session",      "-",        "Application", "TLS session, FIX session, WS close"),
    (4, "Transport",    "segment",  "Transport",   "TCP 20-60 B: ports, seq, ack, flags"),
    (3, "Network",      "packet",   "Internet",    "IPv4 20 B: src/dst IP, TTL, protocol"),
    (2, "Data link",    "frame",    "Link",        "802.11 / Ethernet: MACs, FCS 4 B"),
    (1, "Physical",     "bit",      "Link",        "5 GHz radio, copper, fibre"),
]
for n, name, pdu, tcpip, carries in STACK:
    print(f"L{n} {name:<12} {pdu:<8} {tcpip:<11} {carries}")
print("TCP MSS on a 1500-byte MTU with timestamps:", 1500 - 20 - 20 - 12)
# L7 Application  message  Application DNS, HTTP, WebSocket 2-14 B, our JSON
# L6 Presentation -        Application TLS encryption; JSON / SBE encoding
# L5 Session      -        Application TLS session, FIX session, WS close
# L4 Transport    segment  Transport   TCP 20-60 B: ports, seq, ack, flags
# L3 Network      packet   Internet    IPv4 20 B: src/dst IP, TTL, protocol
# L2 Data link    frame    Link        802.11 / Ethernet: MACs, FCS 4 B
# L1 Physical     bit      Link        5 GHz radio, copper, fibre
# TCP MSS on a 1500-byte MTU with timestamps: 1448""",
            "deck": "Deck Week 3 · slides 3–11",
        },
        {
            "title": "UDP vs TCP: what a loss costs decides",
            "text": "TCP (`SOCK_STREAM`) costs one round trip of handshake and gives you a byte stream: ordered, retransmitted, flow- and congestion-controlled, with no message boundaries, and with head-of-line blocking where one lost packet freezes every byte behind it. UDP (`SOCK_DGRAM`) has an 8-byte header, no connection, no retransmit and no ordering. One `sendto` is one `recvfrom`, and multicast lets the network copy each datagram to every subscriber at nearly the same instant. Hence the rule. Order entry runs on TCP (FIX, OUCH, iLink 3, our WebSocket), because a lost order is a bug. Market data runs on UDP multicast (ITCH, CME MDP 3.0), because a retransmitted price arrives stale. You pay for UDP by numbering every datagram and detecting gaps yourself: in the lab all three subscribers saw `missing [4]`. UDP fails silently: a `sendto` to nobody still reports success.",
            "code": """import socket, struct
rx = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
rx.bind(("127.0.0.1", 0)); rx.settimeout(0.5)            # UDP: bind and go, no listen/accept
tx = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
for seq in (1, 2, 3, 5):                                  # datagram 4 was "lost" on the way
    tx.sendto(struct.pack("!Q", seq) + b"AAPL 225.78", rx.getsockname())
got = [struct.unpack("!Q", rx.recvfrom(65535)[0][:8])[0] for _ in range(4)]   # one sendto = one recvfrom
expected, missing = 1, []
for seq in got:                                           # gap detection is YOUR job on UDP
    missing += range(expected, seq); expected = seq + 1
print("received", got, "missing", missing, "-> retransmit or snapshot")
print("sendto() to a port nobody listens on returned", tx.sendto(b"hello?", ("127.0.0.1", 9)))
# received [1, 2, 3, 5] missing [4] -> retransmit or snapshot
# sendto() to a port nobody listens on returned 6""",
            "deck": "Deck Week 3 · slides 12–13",
        },
        {
            "title": "The socket API, call by call, and what the kernel does",
            "text": "TCP server: `socket`, `setsockopt(SO_REUSEADDR)`, `bind`, `listen(8)`. From `listen` on, the kernel answers SYNs by itself and parks finished handshakes in the backlog, which is why the client's `connect` returned at 0.39 ms, before the server's `accept`. `accept` mints a new socket per client while the listening socket keeps listening. `recv(n)` returns whatever has arrived, up to n bytes, and `b''` means the peer sent FIN. `sendall` loops `send` for you. The side that closes first sits in TIME_WAIT, so a restarted server gets `[Errno 48] Address already in use` without `SO_REUSEADDR`. UDP is just `socket`, `bind`, `recvfrom` on the receiver and `sendto` on the sender, with no listen, no accept and no connection state. A blocking accept loop serves one client at a time (50 clients took 0.23 s); readiness I/O with `selectors` or asyncio serves them all on one thread (0.03 s).",
            "code": """import socket
srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)   # rebind despite TIME_WAIT
srv.bind(("127.0.0.1", 0)); srv.listen(8)                   # LISTEN: the kernel now answers SYNs
cli = socket.create_connection(srv.getsockname(), timeout=2)  # handshake done by the kernels...
conn, peer = srv.accept()                                   # ...and queued in the backlog until now
print("accept() minted a new socket:", conn.fileno() != srv.fileno())
cli.sendall(b"buy 5 AAPL");  print("server recv:", conn.recv(4096))
conn.sendall(b"BUY 5 AAPL"); print("client recv:", cli.recv(4096))
cli.close()                                                 # client sends FIN
print("server recv after FIN:", conn.recv(4096))            # b'' = orderly close, not an error
conn.close(); srv.close()
# accept() minted a new socket: True
# server recv: b'buy 5 AAPL'
# client recv: b'BUY 5 AAPL'
# server recv after FIN: b''""",
            "deck": "Deck Week 3 · slides 15–17",
        },
        {
            "title": "An echo server, framing, and a UDP pair",
            "text": "Every networked program is the echo server plus framing plus error handling. The server loop is `while data := conn.recv(4096): conn.sendall(data.upper())`, and the client sets a timeout so a silent peer becomes an exception instead of a hang. With the server down, the client gets `ConnectionRefusedError` because the kernel answered the SYN with RST. TCP gives you bytes, not messages: three `sendall` calls came back as two `recv`s, and one 1 MB send arrived as 25. Frame every message, with a 4-byte length prefix for anything binary (FIX, SoupBinTCP and SBE all carry a length) or a newline for text you want to grep, like the session `.jsonl` tapes. On UDP the boundaries are preserved and delivery is not, so put a sequence number in every datagram and expect a datagram over 65,507 bytes to fail with `Message too long`.",
            "code": """import json, socket, struct
a, b = socket.socketpair()                                  # a connected byte stream
a.sendall(b'{"type":"place_order"}'); a.sendall(b'{"type":"cancel_order"}')
try: json.loads(b.recv(4096))                               # two sends, one recv
except json.JSONDecodeError as e: print("unframed:", e.msg)
def send_msg(s, obj):                                       # 4-byte big-endian length, then payload
    body = json.dumps(obj).encode(); s.sendall(struct.pack("!I", len(body)) + body)
def recv_exactly(s, n):                                     # recv may return fewer than n bytes
    buf = bytearray()
    while len(buf) < n:
        chunk = s.recv(n - len(buf))
        if not chunk: raise ConnectionError("peer closed mid-message")
        buf += chunk
    return bytes(buf)
def recv_msg(s): return json.loads(recv_exactly(s, struct.unpack("!I", recv_exactly(s, 4))[0]))
for t in ("place_order", "cancel_order", "handshake"): send_msg(a, {"type": t})
print("framed:", [recv_msg(b)["type"] for _ in range(3)])
# unframed: Extra data
# framed: ['place_order', 'cancel_order', 'handshake']""",
            "deck": "Deck Week 3 · slides 18–20",
        },
        {
            "title": "FIX, ITCH and OUCH: the venue protocols under ours",
            "text": "FIX is tag=value text separated by SOH. 8 is BeginString, 9 is BodyLength, 35 is MsgType (D is NewOrderSingle, 8 is ExecutionReport), 34 is MsgSeqNum, 11 is the client's ClOrdID, and 10 is CheckSum, the byte sum mod 256. Session messages keep the pipe honest and know nothing about orders: Logon (A), Heartbeat (0), TestRequest (1), ResendRequest (2), SequenceReset (4), Logout (5). Application messages carry the business: D, F, G and 8. Sequence numbers survive a reconnect, so a session resumes instead of restarting. When microseconds matter, fixed-layout binary replaces text. ITCH is Nasdaq's market data out over UDP multicast (MoldUDP64), and an Add Order is 36 bytes you decode with one `struct.unpack`. OUCH is Nasdaq's order entry in: tiny binary Enter, Cancel and Replace messages over TCP (SoupBinTCP). Decoding one order took 84 ns with struct against 1,197 ns with `json.loads`, and fixed sizes make latency predictable.",
            "code": "import struct\nSOH = \"\\x01\"\ndef fix(fields):                                            # BodyLength (9) and CheckSum (10) computed\n    body = \"\".join(f\"{k}={v}{SOH}\" for k, v in fields)\n    head = f\"8=FIX.4.4{SOH}9={len(body)}{SOH}\"\n    return head + body + f\"10={sum((head + body).encode()) % 256:03d}{SOH}\"\nmsg = fix([(35, \"D\"), (49, \"TEAM_SEB\"), (56, \"ARENA\"), (34, 42), (52, \"20261016-20:45:00.123\"),\n           (11, \"c-0001\"), (55, \"AAPL\"), (54, 1), (38, 5), (40, 2), (44, \"225.30\"), (59, 0)])\nprint(msg.replace(SOH, \"|\"))\ntags = dict(f.split(\"=\", 1) for f in msg.split(SOH) if f)\nprint(\"MsgType\", tags[\"35\"], \"(NewOrderSingle) seq\", tags[\"34\"], \"ClOrdID\", tags[\"11\"])\nITCH_ADD = \"!cHH6sQcI8sI\"                                   # 'A' Add Order, 36 bytes, fixed offsets\nwire = struct.pack(ITCH_ADD, b\"A\", 7, 0, (74_700_123_457_000).to_bytes(6, \"big\"),\n                   1001, b\"B\", 5, b\"AAPL    \", 2_253_000)\nkind, _, _, ts, ref, side, shares, sym, px = struct.unpack(ITCH_ADD, wire)\nprint(len(wire), \"bytes:\", kind.decode(), f\"ref={ref}\", side.decode(), shares, sym.decode().strip(),\n      f\"@ {px / 10_000:.4f}\", f\"t={int.from_bytes(ts, 'big') / 1e9:.6f}s after midnight\")\n# 8=FIX.4.4|9=105|35=D|49=TEAM_SEB|56=ARENA|34=42|52=20261016-20:45:00.123|11=c-0001|55=AAPL|54=1|38=5|40=2|44=225.30|59=0|10=242|\n# MsgType D (NewOrderSingle) seq 42 ClOrdID c-0001\n# 36 bytes: A ref=1001 B 5 AAPL @ 225.3000 t=74700.123457s after midnight",
            "deck": "Deck Week 3 · slides 21–23",
        },
        {
            "title": "WebSocket: one upgrade, then frames, pings and a reconnect loop",
            "text": "A WebSocket starts as an HTTP/1.1 GET with `Upgrade: websocket` and a random `Sec-WebSocket-Key`. The server answers `101 Switching Protocols` with base64(SHA-1(key + a fixed GUID)), proving it understood the upgrade. After that the same TCP connection carries frames in both directions: a 2–14 byte header with FIN, opcode (1 text, 2 binary, 8 close, 9 ping, A pong), a mask bit (client frames are always masked) and a length. One frame is one message, the boundary TCP never gave you. Ping and pong go every 20 s and are invisible to `recv()`. Close code 1000 is a normal close, and 1006 means no close frame arrived because the peer vanished. Reconnect with backoff, jitter and a resync from the first snapshot. AlgoArena maps onto real venues: Handshake is FIX Logon, ping/pong is Heartbeat/TestRequest, PlaceOrder is NewOrderSingle, and OrderAck plus TradeExecution play the role of ExecutionReport. It has no ClOrdID and no sequence numbers; full snapshots every 0.5 s replace gap fill, and one TCP send per client replaces multicast.",
            "code": """import base64, hashlib
GUID = b"258EAFA5-E914-47DA-95CA-C5AB0DC85B11"             # RFC 6455, the same on every server
key = b"OEdYZE9xvbhe7elrv3f99Q=="                          # the client's Sec-WebSocket-Key
print("HTTP/1.1 101 Switching Protocols")
print("Sec-WebSocket-Accept:", base64.b64encode(hashlib.sha1(key + GUID).digest()).decode())
OPCODES = {1: "text", 2: "binary", 8: "close", 9: "ping", 10: "pong"}
def header(frame):                                          # first bytes of a frame, read by hand
    fin, op, masked, n = frame[0] >> 7, frame[0] & 0x0F, frame[1] >> 7, frame[1] & 0x7F
    if n == 126: n = int.from_bytes(frame[2:4], "big")      # 126 -> the next 2 bytes hold the length
    return f"FIN={fin} {OPCODES[op]} masked={masked} len={n}"
print(header(bytes.fromhex("817e05a3")), "<- server book_snapshot")
print(header(bytes.fromhex("880203e8")), "code", int.from_bytes(bytes.fromhex("03e8"), "big"))
# HTTP/1.1 101 Switching Protocols
# Sec-WebSocket-Accept: JI+wC80lovHV+cvvlPFl5diw9JQ=
# FIN=1 text masked=0 len=1443 <- server book_snapshot
# FIN=1 close masked=0 len=2 code 1000""",
            "deck": "Deck Week 3 · slides 24–30",
        },
        {
            "title": "Typed schemas and one dispatcher: continue, never raise",
            "text": "Framing and encoding are solved for you. What remains is the schema and its meaning. A pydantic model makes the shape code that runs on every message: a `Literal` makes `side='long'` unrepresentable, `Field(gt=0)` kills a zero-lot order at the edge, and a `type` discriminator picks exactly one model in one step instead of trial parsing. Every input then becomes a typed object or one of three loud errors: unparseable bytes, an unknown type, or an invalid payload. The venue's inbound loop answers each with `ErrorMsg(PARSE_ERROR)` and then `continue`, not `raise`. Your `listen()` owes it the same courtesy, because one bad frame must never end a session that has resting orders behind it.",
            "code": """import json
from typing import Annotated, Literal, Union
from pydantic import BaseModel, Field, TypeAdapter, ValidationError
class PlaceOrder(BaseModel):
    type: Literal["place_order"] = "place_order"
    symbol: str
    side: Literal["buy", "sell"]                 # 'long' is unrepresentable, not just wrong
    quantity: int = Field(gt=0)
class CancelOrder(BaseModel):
    type: Literal["cancel_order"] = "cancel_order"
    order_id: str
parse = TypeAdapter(Annotated[Union[PlaceOrder, CancelOrder], Field(discriminator="type")]).validate_python
for raw in ('{"type":"place_order","symbol":"AAPL","side":"buy","quantity":5}',
            '{"type":"cancel_order","order_id":"a1"}',
            '{"type":"place_order","symbol":"AAPL","side":"long","quantity":5}',
            '{"type":"place_ordr"}', 'nope'):
    try:
        print("ok      ", type(parse(json.loads(raw))).__name__)
    except json.JSONDecodeError:
        print("rejected unparseable bytes")
    except ValidationError as e:
        err = e.errors()[0]; print("rejected", err["type"], err["loc"])
    # continue, never raise: one bad frame must not end the session
# ok       PlaceOrder
# ok       CancelOrder
# rejected literal_error ('place_order', 'side')
# rejected union_tag_invalid ()
# rejected unparseable bytes""",
            "deck": "Deck Week 3 · slides 32–33",
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
            "deck": "Deck Week 3 · slides 31, 34",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "Your bot writes only the last of the nine steps between the Wi-Fi and the first quote, and any of the other eight can still break it mid-session. So read a failure by its layer. `socket.gaierror` is DNS at L7. `[Errno 61] Connection refused` is L4: nothing is listening, often a stale EXCHANGE_HOST in `.env`. `SSLCertVerificationError` is L5–6. A 1006 after a Wi-Fi blip is L1–2, and a laptop that slept through its DHCP lease comes back with a new IP and every connection dead. The setup costs about 250 ms once, after which every order and quote rides the same TCP + TLS + WebSocket connection. That is why losing it is expensive.",
            "Real venues split the wire the way the UDP/TCP comparison predicts. Market data goes out by UDP multicast, published twice on A and B feeds, with a sequence number per packet and a snapshot channel to recover a gap. Orders come in by TCP, each one named by a ClOrdID so a duplicate is detectable after a drop. AlgoArena deliberately leaves both out. TCP plus full snapshots means there is nothing to gap-fill, and there is no ClOrdID, so an order in flight at a disconnect is unknowable until you reconcile from `portfolio_update`. Knowing what your protocol omits tells you what your bot has to do itself.",
            "The protocol is also where live risk is contained. A public endpoint sees malformed frames, so one bad message must never take down a session — yours or the venue's. The venue answers with ErrorMsg and continues; your reader must do the same, because a crash mid-session leaves resting orders behind. That is why CANCEL_ON_DISCONNECT pulls a team's live orders when its socket closes. On the way back you reconnect with exponential backoff, re-handshake, and request a fresh snapshot rather than assuming the book you remember is still real.",
            "Costs travel on the wire too, which is what makes TCA possible at all. TradeExecution carries fee, maker_id and taker_id, so every fill is self-attributing: cross the ask and you are the taker paying the fee, rest and you are the maker earning the rebate out of it. In the lab a single share bought at 309.81 printed fee=0.4647 with maker=house_broker — 15 bps of notional for one lot of impatience. Read those fields per fill and your cost model stops being an assumption and becomes a measurement.",
            "Typed messages are what let one strategy be believable offline. Session recordings under sessions/ are the same JSON frames the exchange broadcast live, and scripts/backtest.py replays them through the same models, so the replay sees the identical field set with no adapter quietly inventing a mid price. Get the contract right in week 3 and the backtester in week 4 inherits it: if the offline path and the live path disagree, the disagreement is in your strategy, not in two different notions of what a book snapshot contains.",
        ],
        "example": {
            "title": "In the arena",
            "text": "shared/messages.py — parse_message is the whole dispatcher, and the two failure modes it raises are exactly the two your reader must catch. _TYPE_MAP holds all 21 message types.",
            "code": "# shared/messages.py\ndef parse_message(raw: dict[str, Any]) -> BaseModel:\n    \"\"\"Dispatch a raw dict to the correct Pydantic model.\n\n    Raises KeyError if the 'type' field is missing or unrecognised.\n    Raises ValidationError if the payload is structurally invalid.\n    \"\"\"\n    msg_type = raw.get(\"type\")\n    if msg_type is None:\n        raise KeyError(\"Message is missing required 'type' field\")\n    model_cls = _TYPE_MAP.get(msg_type)\n    if model_cls is None:\n        raise KeyError(f\"Unknown message type: {msg_type!r}\")\n    return model_cls.model_validate(raw)",
        },
    },
    "interview": [
        {
            "q": "Name the seven OSI layers, map them onto TCP/IP, and say where TLS, the WebSocket and your JSON sit.",
            "a": "Bottom up: 1 Physical (bits, through radio, copper and fibre), 2 Data link (frames, MACs, switches and access points, ARP), 3 Network (packets, IP addresses, routers, NAT), 4 Transport (segments or datagrams, ports, TCP and UDP), 5 Session, 6 Presentation, 7 Application (messages: DNS, HTTP, FIX). TCP/IP implements four: Link (OSI 1–2), Internet (3), Transport (4) and Application (5–7). TLS sits at 5–6, opening the encrypted session and representing the data. The WebSocket is an application protocol at 7 that upgrades from HTTP, and your JSON is the payload it carries, with its encoding at 6. Each layer reads only its own header, which is why a quote on Wi-Fi is an 802.11 header, IP 20 B, TCP 32 B, a TLS record, a WS header of 2–14 B, then your JSON and the FCS.",
            "level": "warm-up",
            "skill": "tools.osi-stack",
        },
        {
            "q": "Your bot never gets its first quote. How do you find which layer failed?",
            "a": "Read the error by its layer and check with the matching tool. `socket.gaierror` means name resolution at L7, so check `dig`. A connect timeout or `timed out during opening handshake` usually means the wrong host, often a stale EXCHANGE_HOST; `[Errno 61] Connection refused` is a TCP RST at L4 because nothing is listening on that port; check both with `nc -vz host port`. `SSLCertVerificationError` is L5–6, a wrong name or wss on a plain port, so check `openssl s_client`. A stall followed by 1006 after a Wi-Fi blip is L1–2, and a new IP after sleep means the DHCP lease (L3) killed every connection. AUTH_FAILED, PARSE_ERROR or TIMEOUT come from your own protocol on top, and they will be in your bot's log.",
            "level": "core",
            "skill": "tools.osi-stack",
        },
        {
            "q": "Would you carry orders over TCP or UDP, and does market data get the same answer?",
            "a": "Orders go over TCP: every order and fill must arrive exactly once and in order, and a lost cancel is worse than a slow one. Market data is the case for UDP multicast. One send reaches every subscriber at nearly the same instant, there is no head-of-line blocking, and a retransmitted quote would be stale anyway. The price is that UDP will not tell you about a loss, so every datagram carries a sequence number, and the receiver detects gaps and recovers them from a retransmission server, an A/B feed or the snapshot channel, without trading that book while it does. That is ITCH and MDP 3.0 for data, and FIX, OUCH and iLink 3 over TCP for orders.",
            "level": "warm-up",
            "skill": "tools.udp-tcp",
        },
        {
            "q": "Walk through the TCP server and client calls. Why does connect() return before the server calls accept()?",
            "a": "The server calls `socket`, `bind` and `listen(backlog)`. From `listen` on, the kernel itself answers SYNs, completes the three-way handshake and queues the established connection in the backlog. The client's `connect` returns as soon as the handshake completes, whether or not the application has called `accept`. `accept` then pulls a connection off the backlog and returns a new socket for that peer while the listening socket stays open. Then `sendall` and `recv` move bytes, `recv` returning `b''` means the peer sent FIN, and `close` sends your own FIN. The side that closes first waits in TIME_WAIT, which is why a restarted server needs `SO_REUSEADDR` to avoid `Address already in use`. UDP has none of this: `bind` and `recvfrom` on one side, `sendto` on the other, and no connection state.",
            "level": "core",
            "skill": "python.sockets",
        },
        {
            "q": "A colleague's feed reader calls json.loads on whatever recv returns and it fails under load. What is wrong?",
            "a": "recv returns bytes, not messages. TCP is a stream, so under load the kernel coalesces sends and one recv can contain two JSON objects plus half of a third — json.loads then raises 'Extra data' or 'Unterminated string'. The reader needs a framing layer: accumulate into a buffer and split on a delimiter, or length-prefix each payload and read exactly that many bytes. WebSocket is the third option and the reason we use it: the protocol frames for you, so one recv is one whole message.",
            "level": "core",
            "skill": "python.socket-examples",
        },
        {
            "q": "Read this FIX message: 8=FIX.4.4|9=105|35=D|34=42|11=c-0001|55=AAPL|54=1|38=5|40=2|44=225.30|...|10=242. What is it, and which messages are session-level?",
            "a": "It is a NewOrderSingle (35=D): buy (54=1) 5 shares (38) of AAPL (55) as a limit order (40=2) at 225.30 (44). The client named the order c-0001 (ClOrdID, tag 11), and the message is number 42 in this direction (MsgSeqNum, tag 34). 8 is the version, 9 is the body length in bytes, and 10 is the checksum, the sum of every preceding byte mod 256, written as three digits. Session messages keep the connection honest and know nothing about orders: Logon (A), Heartbeat (0), TestRequest (1), ResendRequest (2), SequenceReset (4) and Logout (5). Application messages carry the business: NewOrderSingle (D), cancel (F), cancel/replace (G) and ExecutionReport (8). If you receive 45 after 42, you send ResendRequest for 43–44.",
            "level": "core",
            "skill": "trading.fix-itch",
        },
        {
            "q": "Why do venues use binary protocols like ITCH and OUCH instead of FIX text, and what is each one for?",
            "a": "Latency and determinism. A fixed-layout binary message is decoded by reading at known offsets, with no parsing, no allocation and no branching on content, so the 99.9th percentile looks like the median. In the lab one `struct.unpack` of an order took about 84 ns against 1.2 to 1.5 µs for JSON or FIX parsing. ITCH is Nasdaq's outbound market data, one message per book event (Add Order, Execute, Cancel), with full depth by order, over UDP multicast with MoldUDP64 sequence numbers. OUCH is Nasdaq's inbound order entry, small binary Enter, Cancel and Replace messages over TCP with SoupBinTCP for login and sequencing. CME's equivalents are MDP 3.0 and iLink 3, both SBE-encoded.",
            "level": "core",
            "skill": "trading.fix-itch",
        },
        {
            "q": "Why does a live book use a WebSocket rather than HTTP polling, and what happens on the wire after the upgrade?",
            "a": "Polling pays a full request, headers and a round trip each time, and still misses every change between polls. A WebSocket upgrades one connection once: an HTTP GET with `Upgrade: websocket` and a `Sec-WebSocket-Key`, answered by `101 Switching Protocols` with base64(SHA-1(key + GUID)). From then on both sides send frames on the same TCP connection, each with a 2–14 byte header: FIN, opcode, mask bit (always set by the client) and length. One frame is one message, so the framing problem goes away. Ping/pong control frames every 20 s detect a dead peer and keep NAT entries alive. Close 1000 is clean, and 1006 means the peer vanished without a close frame, which is your cue to reconnect. SSE is server-to-client only, and a trader has to send orders too.",
            "level": "warm-up",
            "skill": "python.websockets",
        },
        {
            "q": "Map AlgoArena's JSON-over-WebSocket onto FIX. Your connection drops just after you send an order: do you resend it?",
            "a": "The mapping is Handshake for Logon, ping/pong for Heartbeat/TestRequest, PlaceOrder for NewOrderSingle, and OrderAck plus TradeExecution plus PortfolioUpdate for ExecutionReport. What is missing matters: there are no MsgSeqNum and no ClOrdID, since TCP order and full snapshots replace sequence numbers and gap fill. So you cannot ask the venue what happened to your order, and a blind resend can open a second position. Reconnect with exponential backoff and jitter, re-handshake, take the first snapshot as the truth, and reconcile positions and open orders from `portfolio_update` before acting. A protocol that wants safe retries needs a client-generated id the venue de-duplicates on, which is exactly what FIX's ClOrdID provides.",
            "level": "senior",
            "skill": "python.reconnect",
        },
        {
            "q": "You must add a field to a protocol that is live, with clients you cannot redeploy. How?",
            "a": "Add it as optional with a default, and never change the meaning of an existing field. An older client omits it and still parses; a newer client sends it and older receivers ignore it. That is how queue_ahead and level_qty landed mid-season: an order_ack payload with neither field still validates, with both defaulting to 0. If the semantics genuinely change, introduce a new type or a new field name and deprecate the old one on a schedule — repurposing a field is the change that breaks peers silently, far from the boundary.",
            "level": "core",
            "skill": "tools.protocol-contract",
        },
    ],
},

# ─────────────────────────────────────────────────────────────── session 4 ──
# Week 4 was rebuilt on 2026-10-10 around one storyline (backtesting -> SQL ->
# why SQL is not enough -> kdb+/time-series DBs -> Parquet -> logical vs real
# time -> the Parquet-backed backtester). The student-facing page is the
# combined companion page (systematic-trading-arena/week4.html); session-4.html
# shows a banner pointing there. No deck slide numbers are cited while the deck
# is being rebuilt. Numbers are from the Session 2 tape (Fri Oct 9).
{
    "n": 4,
    "focus": "Backtesting & tick data storage",
    "tagline": "A backtest is a replay you can be wrong about cheaply: store the tape so a question costs milliseconds (SQL, then kdb+ and Parquet), run every decision on the tape's logical clock, and the P&L is identical at any replay speed until one time.time() call breaks it.",
    "concepts": [
        {
            "title": "What a backtest is, and what it is for",
            "text": "Six stages, always the same: data, a replay loop in recorded order, the strategy, simulated fills and fees, accounting, metrics. Its goal is to falsify cheaply: an idea that loses on the tape after honest costs will not win live. A positive result is an estimate under a fill model, a cost model and one path of history, never a proof, and it cannot see your own market impact, your queue position, a regime absent from the data or the bugs that only live in the live path. Four ticks are enough to show why the fill model matters: the mid rises 0.6 % and the strategy still loses.",
            "code": """tape = [(1, 100.0, 100.2), (2, 100.4, 100.6), (3, 101.0, 101.2), (4, 100.6, 100.8)]  # (t, bid, ask)
fee, cash, pos, pending, curve = 0.003, 10_000.0, 0, [], []
for t, bid, ask in tape:                                       # replay on the logical clock
    for side, q in pending:                                    # orders sent at t-1 fill now
        px, sgn = (ask, 1) if side == "buy" else (bid, -1)     # a buy lifts the ask
        cash -= sgn * q * px + q * px * fee; pos += sgn * q    # fees, then accounting
    pending = [("buy", 10)] if t == 1 else [("sell", 10)] if t == 3 else []   # strategy
    curve.append(cash + pos * (bid + ask) / 2)                 # mark to the mid
print(f"P&L {curve[-1] - 10_000:+.2f} while the mid rose 0.6%")                 # metrics
# P&L -6.04 while the mid rose 0.6%""",
        },
        {
            "title": "Start with SQL: schema, index, query plan",
            "text": "One table per message type (trades, quotes, book snapshots with their depth in a child table), both clocks and the recording order kept as columns. SQLite is a library and a file, Postgres a server with concurrent users. The query every backtest asks is one symbol in a window of time, and EXPLAIN QUERY PLAN shows the difference a composite (symbol, t) index makes: equality column first, range second, and the scan becomes a search. Measured on the whole Session 2 tape, the SQLite file is 50,081,792 bytes, and the index takes the AAPL event window at t400 from 10.4 ms to 0.02 ms; a query that reads every AAPL row gains nothing (3.7 ms without, 4.2 ms with).",
            "code": """import random, sqlite3
db, rng = sqlite3.connect(":memory:"), random.Random(4)
db.execute("CREATE TABLE quotes (seq INTEGER PRIMARY KEY, t INT, symbol TEXT, bid REAL, ask REAL)")
db.executemany("INSERT INTO quotes VALUES (?,?,?,?,?)",
               [(i, i // 50, rng.choice(["AAPL", "MSFT", "NVDA"]), 100.0, 100.1) for i in range(200_000)])
q = "SELECT count(*) FROM quotes WHERE symbol = 'AAPL' AND t BETWEEN 390 AND 460"
print(db.execute("EXPLAIN QUERY PLAN " + q).fetchone()[-1])      # no index: read every row
db.execute("CREATE INDEX quotes_sym_t ON quotes (symbol, t)")    # equality first, range second
print(db.execute("EXPLAIN QUERY PLAN " + q).fetchone()[-1])
# SCAN quotes
# SEARCH quotes USING COVERING INDEX quotes_sym_t (symbol=? AND t>? AND t<?)""",
        },
        {
            "title": "Why a row store struggles, and what kdb+ does instead",
            "text": "Tick research reads a few columns of many rows in time order, arriving as a firehose of appends. A row store reads every column of every matching row, pays an index update on every insert, scans ranges row by row, has no as-of join operator and does not compress columns. kdb+ answers with a column store: today's data in memory, history on disk in one directory per date with each table splayed into one file per column, data sorted by time within symbol, and aj, the as-of join, as a built-in. TimescaleDB, QuestDB, InfluxDB and ArcticDB each take part of that design; DuckDB's ASOF JOIN and pandas' merge_asof are the open-source analogues. On real AAPL trades from the earnings ramp the as-of match finds the ask each buyer paid, and the forward match shows the next quote instead, which is look-ahead inside a backtest.",
            "code": """import pandas as pd                                    # AAPL on the Session 2 tape, t399-t400
quotes = pd.DataFrame({"seq": [20889, 20913, 20932, 20992], "bid": [193.94, 193.94, 193.94, 198.17],
                       "ask": [194.13, 195.14, 196.06, None]})
trades = pd.DataFrame({"seq": [20912, 20931, 20942, 21026], "price": [194.13, 195.14, 196.06, 196.92]})
back = pd.merge_asof(trades, quotes, on="seq", direction="backward")   # q: aj[`sym`time; t; q]
fwd = pd.merge_asof(trades, quotes, on="seq", direction="forward")     # the NEXT quote
print("as-of ask:", back["ask"].tolist())
print("next  ask:", fwd["ask"].tolist())
# as-of ask: [194.13, 195.14, 196.06, nan]
# next  ask: [195.14, 196.06, nan, nan]""",
        },
        {
            "title": "Parquet: the column store as a file",
            "text": "Parquet stores a table by column in row groups, encodes and compresses each column chunk, and writes min/max statistics for every chunk in the footer. Folders named week=2/symbol=AAPL make the directory tree the partitioned database. A reader skips folders (partition pruning), skips row groups whose statistics cannot match (predicate pushdown, which only works on sorted data) and decompresses only the named columns (projection). The Session 2 tape goes from 264,960,858 bytes of JSONL to 6,740,873 bytes of Parquet (39.3x) in 3.3 s, AAPL's mid at every tick from 2.1-2.7 s to 0.5-1.5 ms, and a filter on t reads 2 of the book file's 14 row groups. DuckDB and Polars query the files in place; Spark does the same across a cluster.",
            "code": """import os, tempfile, pyarrow as pa, pyarrow.parquet as pq
n = 100_000
tbl = pa.table({"t": [i // 35 for i in range(n)], "symbol": [("AAPL", "MSFT", "NVDA")[i % 3] for i in range(n)],
                "mid": [100 + (i % 997) / 100 for i in range(n)]})
path = os.path.join(tempfile.mkdtemp(), "quotes.parquet")
pq.write_table(tbl, path, row_group_size=10_000)                  # 10 row groups, sorted by t
md = pq.ParquetFile(path).metadata
st = [md.row_group(g).column(0).statistics for g in range(md.num_row_groups)]
print("t in [1000, 1300] can only be in row groups", [g for g, s in enumerate(st) if s.max >= 1000 and s.min <= 1300])
print("symbol column encoding:", md.row_group(0).column(1).encodings[-1])
# t in [1000, 1300] can only be in row groups [3, 4]
# symbol column encoding: RLE_DICTIONARY""",
        },
        {
            "title": "Logical time vs real time",
            "text": "Every line of the tape carries event time (tick, the engine's step counter, and seq, the recording order) and processing time (ts, the wall clock when the line was written). They drift: on Oct 9 a tick lasted 1.062 s on average and anywhere from 0.54 s to 7 s, so the AAPL print at t400 arrived 12 s later than a one-tick-per-second clock predicts and t900 33 s later. Until 2026-10-09 the arena's own simulator resumed halted symbols with a wall-clock sleep, so a fast laptop stayed halted 235 ticks and a slow one 85; counted in ticks, 5 and 5. Decisions read the logical clock they are handed; the wall clock belongs at the edges (pacing, timeouts, backoff, logs).",
            "code": """ts = [0.0, 1.0, 2.16, 3.35, 4.48, 5.48, 6.48, 7.58, 8.72, 9.87, 10.52, 11.68,     # ts of t400..t419,
      12.8, 13.86, 14.58, 15.78, 16.87, 17.97, 18.56, 19.58]                     # seconds after t400
def exit_tick(speed, clock):
    hits = (i for i, s in enumerate(ts) if (i >= 15 if clock == "ticks" else s / speed + 0.0003 * i >= 15.9))
    return next((f"t{400 + i}" for i in hits), "not before t420")
for speed in (float("inf"), 5, 1):
    print(f"speed {speed}: on ticks {exit_tick(speed, 'ticks')}, on time.time() {exit_tick(speed, 'wall')}")
# speed inf: on ticks t415, on time.time() not before t420
# speed 5: on ticks t415, on time.time() not before t420
# speed 1: on ticks t415, on time.time() t416""",
        },
        {
            "title": "Back to the backtester: one clock, honest numbers",
            "text": "The lab's backtester reads the Parquet tape and runs once per tick: apply the tick's books in seq order, fill orders due now against the first book of their symbol (latency is an integer number of ticks), deliver events, collect decisions, mark to the mid. Costs are a 0.30 % taker fee and walking the recorded depth; results are read against do-nothing and buy-and-hold, with a chronological in-sample/out-of-sample split (tuning momentum on the first half picked the setting that lost 10,313 on the second). Look-ahead is a clock violation: sig[t] * ret[t] decides with data stamped after the decision. And determinism is testable: the AAPL slice gives +505.36 with the same fill digest at speeds inf, 5 and 1, and one time.time() exit timer turns it into +902.06, +861.70 and +456.60.",
            "code": """import numpy as np, pandas as pd
rng = np.random.default_rng(7)
px = pd.Series(100 * np.cumprod(1 + rng.normal(0.0002, 0.01, 1500)))
ret, ma = px.pct_change(), px.rolling(40).mean()
sig = (px > ma).astype(float)                       # long above the 40-bar SMA
sharpe = lambda s: s.dropna().mean() / s.dropna().std() * 252 ** 0.5
print(f"BUG  sig[t]   * ret[t]  Sharpe {sharpe(sig * ret):+.2f}")
print(f"FIX  sig[t-1] * ret[t]  Sharpe {sharpe(sig.shift(1) * ret):+.2f}")
# BUG  sig[t]   * ret[t]  Sharpe +2.38
# FIX  sig[t-1] * ret[t]  Sharpe -0.19""",
        },
    ],
    "hft": {
        "text": "Why this matters in systematic trading",
        "paragraphs": [
            "On a desk the research loop is only as fast as the question you can ask of the history. If every question means parsing a quarter of a gigabyte of JSON, you ask three a day and stop exploring; if it costs ten milliseconds, you ask a thousand and actually test the idea. That is why tick data lives in column stores, kdb+ on most bank and HFT desks and Parquet with DuckDB, Polars or Spark nearly everywhere else, while orders, positions and accounts stay in a relational database where transactions matter. Choosing the store by the shape of the work is a decision you will be asked to defend.",
            "The as-of join is the most used and most abused operation in market-data research. Every fill analysis, every markout and every transaction-cost report matches events to the quote in force, and the key and direction decide whether the answer is honest. On the Session 2 tape, joining on the tick alone hands every AAPL trade in tick 400 a one-sided book recorded after it traded; joining forward is exactly right for a post-trade markout and exactly wrong inside a backtest. Write the definition down (the lab's book_eot) and make every engine use it.",
            "Determinism is what turns a backtest into evidence. If the same tape and the same code can produce two P&Ls, a parameter search is measuring your machine, and the fastest replay, the one you run a thousand times, is the one that lies most: on the AAPL slice the wall-clock exit made +902 at full speed against +505 for the honest run. Desks enforce this by injecting the clock into the strategy, replaying recorded production days through the live code path, and comparing fill digests in CI, so that any difference between replay and live is a real difference and not an accident of timing.",
            "Costs and latency are positions you hold whether you model them or not. At the arena's 0.30 % taker fee, momentum lost 16,501 over the block through 1,187 fills, and the in-sample tuning chose the lookback that lost most out of sample. A latency of one tick decided whether event_ride caught the 36 shares offered at 197.18 during the AAPL ramp or found an empty ask side. Report P&L net of fees against baselines, count the trials you ran, and treat latency as a number of ticks you measure, because your backtest will otherwise invent exactly the trades that pay.",
        ],
        "example": {
            "title": "In the arena",
            "text": "course/systematic-trading/week4_demos/backtest_parquet.py — the lab's backtester. One loop per tick of the tape, the logical clock; the strategy is told the time (now=t) and never asks the machine. The wall clock appears once, to pace a replay, and never changes what is decided.",
            "code": """for i, t in enumerate(tape.ticks):
    if math.isfinite(speed) and t in tape.ts_at:                 # pacing only
        wait = (tape.ts_at[t] - t0_ts) / speed - (time.time() - t0_wall)
        if wait > 0:
            time.sleep(wait)
    ...
    for ev in tape.events_at.get(t, []):                         # 3. events
        strategy.on_event(ev, now=t)
    for sig in strategy.on_tick(now=t, market=view, pf=pf) or []:  # 4. decisions
        pending[t + latency].append(sig)                         #    fill at t + latency""",
        },
    },
    "interview": [
        {
            "q": "What is a backtest for, and what can it not tell you?",
            "a": "It is a cheap way to falsify a strategy: replay recorded events in order, let the strategy see only the past, simulate fills and costs, and see whether it still makes money against a baseline. A loss after honest costs is strong evidence; a profit is only an estimate under the fill model, the cost model and one path of history. It cannot show your own market impact, because the recorded book never reacts to you, nor your queue position, a regime missing from the data, unmodelled latency, or the failures that only happen live, such as reconnects and rejects.",
            "level": "warm-up",
            "skill": "quant.event-driven-backtest",
        },
        {
            "q": "Row store or column store for five years of quotes, and why?",
            "a": "A column store. The workload is append-only and reads a few columns of many rows in time order, such as the bid and ask of one symbol over a window. A column store reads only those columns, compresses each one well because the values are similar, and keeps data sorted by time within symbol so a window is a contiguous slice. A row store reads every column of every matching row and pays an index update on every insert. Orders, positions and accounts are the opposite workload, small and transactional, and belong in a relational row store such as Postgres.",
            "level": "warm-up",
            "skill": "tools.column-store",
        },
        {
            "q": "Design a SQL schema for trades, quotes and book snapshots. Which indexes, and what hurts first as it grows?",
            "a": "One table per message type with typed columns: trades (seq, t, symbol, price, qty, aggressor), quotes (seq, t, symbol, bid, bid_qty, ask, ask_qty), and book snapshots with the depth in a child table keyed by (snapshot, side, level). Keep the event clock, the recording order and, separately, the wall-clock timestamp. Index (symbol, t), equality column first and range second, and check with the query plan that it searches rather than scans. What hurts first is the write path, since every insert updates every index, then the size of the exploded depth table and the cost of as-of joins written as correlated subqueries.",
            "level": "core",
            "skill": "tools.sql-tick-store",
        },
        {
            "q": "What is an as-of join? Write it two ways and name a way it silently goes wrong.",
            "a": "For each row on the left, take the last row on the right whose key is at or before it, usually by symbol: each trade gets the quote in force when it happened. In pandas it is merge_asof(trades, quotes, on='time', by='symbol', direction='backward'); in DuckDB, trades ASOF JOIN quotes ON trades.symbol = quotes.symbol AND trades.time >= quotes.time; in q, aj[`sym`time; trade; quote]. It goes wrong silently when the key is too coarse, so several quotes share a timestamp and an arbitrary one wins, when inputs are unsorted or the key dtypes differ, or when someone uses a forward match inside a backtest, which is look-ahead.",
            "level": "core",
            "skill": "tools.as-of-join",
        },
        {
            "q": "Your Parquet query filters on time and is still slow. What do you check?",
            "a": "First whether the files are sorted by the filter column: predicate pushdown skips a row group only if its min/max statistics exclude the range, and a file sorted by symbol has every row group spanning the whole day. Then whether the partition layout matches the filter, so the reader can skip whole folders, and whether the query names only the columns it needs. Then row-group size, since huge groups prune coarsely and tiny ones bloat the footer, and the number of small files. Finally check the plan in DuckDB or Polars to see whether the filter and the projection were actually pushed into the scan.",
            "level": "core",
            "skill": "tools.parquet",
        },
        {
            "q": "How do you model fills and latency for a strategy that trades on scheduled news?",
            "a": "Fill at the next tick, not the decision tick, against the book recorded at that moment, walking the depth up to the limit price and dropping or resting the remainder by order type; charge the taker fee on the notional. Treat latency as an integer number of ticks and test several values, because on a thin book around an announcement the result is lumpy: on the AAPL earnings ramp an order arriving one tick after the decision filled 36 shares, while zero or two ticks found no ask under the cap. Expect one-sided books and empty levels exactly when the news hits, and never assume the mid.",
            "level": "core",
            "skill": "quant.fill-simulation",
        },
        {
            "q": "The same backtest on the same data gives a different P&L on every run. How do you find the cause?",
            "a": "Make the run reproducible enough to compare: record a digest of the fill list, rerun at two replay speeds and on two machines, and find the first fill that differs. The usual cause is a decision that reads the machine rather than the data: time.time(), datetime.now() or a sleep-based cooldown, so its length in market time depends on CPU speed. Others are unseeded randomness, iteration over an unordered container, threads racing on shared state, or parallel workers merging results in completion order. Fix it by handing the strategy the logical time and an injected clock, and keep the wall clock at the edges only.",
            "level": "senior",
            "skill": "tools.headless-sim",
        },
        {
            "q": "A researcher shows you Sharpe 3 on tick data. How do you try to break it?",
            "a": "Look for leaks first, because they are cheap to find: lag the signal by one tick and see whether the edge degrades a little or collapses, check every as-of join for its key and direction, and check that nothing reads restated or future reference data. Then the fill model: next-tick fills against recorded depth, the real fee schedule, latency in ticks, one-sided books. Then compare with baselines and count the trials behind the chosen parameters, and look at the out-of-sample block they never touched. Finally replay at two speeds and confirm the same fill digest, to rule out a wall-clock dependency.",
            "level": "senior",
            "skill": "quant.look-ahead",
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
