# OLP — Orbit Log Packet, version 2

The binary format behind the blog's log card. A packet is passed as hex in the card's URL:

```
https://mohanverse.dev/blogs/downlink.html?p=<hex>
```

`blogs/encode.html` builds packets; `blogs/downlink.html` decodes and renders them.
The codec is in `blogs/shared/olp.js` and the orbit list in `blogs/shared/orbits.js`.

## Layout

All numbers are big-endian (like CCSDS telemetry).

### Header (24 bytes)

| Offset | Size | Field | Type | Notes |
|---|---|---|---|---|
| 0 | 4 | Callsign | ASCII | `MOMO` |
| 4 | 1 | Version | uint8 | `2` |
| 5 | 2 | Universal log | uint16 | Counts every log, across all orbits |
| 7 | 1 | Orbit | uint8 | Code from the orbit table below |
| 8 | 2 | Orbit entry | uint16 | Counts logs within that orbit |
| 10 | 4 | Time | uint32 | Seconds since the mission epoch, 1999-12-28 00:00 UTC. MET day = seconds ÷ 86,400 |
| 14 | 4 | Latitude × 10,000,000 | int32 | 7 decimals (~1 cm), the scaling MAVLink and u-blox GPS use |
| 18 | 4 | Longitude × 10,000,000 | int32 | Same |
| 22 | 1 | Time zone | uint8 | Code from the zone table below |
| 23 | 1 | Flags | uint8 | Reserved, `0` |

Coordinates are exact: the encoder keeps whatever precision the device reports, and the card
and map show that spot publicly. The card prints 5 decimals (~1 m).

### Text fields (optional, any order, decoder accepts each once)

Each field is `type (1 byte) · length (1 byte) · UTF-8 text (length bytes)`, max 255 bytes.

| Type | Field | Notes |
|---|---|---|
| `0x10` | Place | City and country, filled by the encoder from the coordinates (BigDataCloud), e.g. "Dublin, Ireland" |
| `0x11` | Weather | Condition and temperature at that hour, filled by the encoder (Open-Meteo), e.g. "Clear · 15°C" |
| `0x12` | Status | |
| `0x13` | Objective | |

Unknown types are skipped, so new fields can be added without breaking old cards.
The encoder writes them in type order.

### Checksum (2 bytes)

CRC-16/CCITT-FALSE (polynomial `0x1021`, initial value `0xFFFF`) over every byte before it.
Running the same CRC over the whole packet, checksum included, gives `0` for a good packet.
The card shows `CRC FAIL — PACKET CORRUPTED` otherwise. This catches accidents (a truncated
link, a typo); it is not a signature.

## Tables

### Orbits

| Code | Orbit | Covers |
|---|---|---|
| 1 | 🌱 Terraform | Growing things |
| 2 | 🫀 Life Support | Fitness, health |
| 3 | 🥫 Rations | Food, cooking |
| 4 | 🗺️ Expeditions | Travel, exploring |
| 5 | 🎶 Off-Duty | Music |
| 6 | 🔧 Engineering | Tech, building, career |
| 7 | 🧭 Navigation | Reflection, self-growth |

Codes are permanent: never reuse or renumber one. Code 8 was "Signal" for a few hours before it
was dropped; packets carrying it render as `ORBIT 8`.

### Time zones

| Code | Zone |
|---|---|
| 0 | UTC |
| 1 | Europe/Dublin |
| 2 | Asia/Kolkata |
| 3 | Europe/London |

## Example

"YouTube Without the Algorithm" — log 002, Engineering entry 001, 20 Oct 2026 15:50 Irish time, Dublin (53.403794, −6.251816):

```
4D 4F 4D 4F 02 00 02 06 00 01 32 6F 82 18 1F D4 C5 B4 FC 46 0C 70 01 00    header
10 0F  "Dublin, Ireland"                                                   place
12 2C  "Signal acquired: 79 channels, zero algorithm"                      status
13 3B  "Rebuild my YouTube: 788 subscriptions → a 79-channel feed"         objective
2F 60                                                                      CRC
```

150 bytes. Time `0x326F8218` = 846,168,600 s → MET day 9,793, 14:50 UTC.
Latitude `0x1FD4C5B4` = 534,037,940 → 53.4037940; longitude `0xFC460C70` = −62,518,160 → −6.2518160.

## History

- **Version 1** (20 Oct 2026, never published): coordinates as int16 × 100 (~1 km). Dropped for version 2;
  the card shows `UNKNOWN PACKET VERSION 1` for those packets.

## What the card adds (not stored)

The card makes no outside requests: place and weather are looked up once by the encoder and stored in the packet.


- **Local time and date**: from the time and zone.
- **Map link**: the coordinates open `blogs/map.html` at that place and moment.
