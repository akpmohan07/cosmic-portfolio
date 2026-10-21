// OLP (Orbit Log Packet), version 2: encode and decode. Spec: docs/olp.md
// Shared by downlink.html (reads packets) and encode.html (builds them).
var OLP = (function () {
  var VERSION = 2;
  var HEADER = 24;                                  // bytes before the text fields
  var COORD = 1e7;                                  // lat/lon stored as int32 x 10^7 (~1 cm)
  var EPOCH = Date.UTC(1999, 11, 28);               // mission epoch: birth, 1999-12-28 00:00 UTC
  var ZONES = { 0: "UTC", 1: "Europe/Dublin", 2: "Asia/Kolkata", 3: "Europe/London" };
  var TEXT = { place: 0x10, weather: 0x11, status: 0x12, objective: 0x13 };
  var TEXT_NAMES = {};
  Object.keys(TEXT).forEach(function (k) { TEXT_NAMES[TEXT[k]] = k; });

  // CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF). Over a whole packet, including its CRC, it gives 0.
  function crc16(bytes) {
    var crc = 0xFFFF;
    for (var i = 0; i < bytes.length; i++) {
      crc ^= bytes[i] << 8;
      for (var j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    return crc;
  }

  function toHex(bytes, sep) {
    return Array.from(bytes, function (b) { return b.toString(16).toUpperCase().padStart(2, "0"); }).join(sep || "");
  }

  // Hex string (spaces and other separators ignored) -> bytes, or null
  function fromHex(s) {
    var clean = String(s || "").replace(/[^0-9a-f]/gi, "");
    if (!clean || clean.length % 2) return null;
    return new Uint8Array(clean.match(/../g).map(function (h) { return parseInt(h, 16); }));
  }

  // bytes -> { callsign, log, orbit, entry, met, lat, lon, zone, flags, text, bytes } or { error, bytes }
  function decode(b) {
    if (!b) return { error: "NO SIGNAL" };
    if (b.length < HEADER + 2) return { error: "PACKET TOO SHORT", bytes: b };
    if (crc16(b) !== 0) return { error: "CRC FAIL — PACKET CORRUPTED", bytes: b };
    var v = new DataView(b.buffer, b.byteOffset, b.byteLength);
    if (v.getUint8(4) !== VERSION) return { error: "UNKNOWN PACKET VERSION " + v.getUint8(4), bytes: b };

    var p = {
      bytes: b,
      callsign: String.fromCharCode.apply(null, b.slice(0, 4)).trim(),
      log: v.getUint16(5),
      orbit: v.getUint8(7),
      entry: v.getUint16(8),
      met: v.getUint32(10),
      lat: v.getInt32(14) / COORD,
      lon: v.getInt32(18) / COORD,
      zone: v.getUint8(22),
      flags: v.getUint8(23),
      text: {}
    };
    var utf8 = new TextDecoder();
    for (var i = HEADER; i < b.length - 2;) {
      var type = b[i], len = b[i + 1];
      if (i + 2 + len > b.length - 2) return { error: "MALFORMED TEXT FIELD", bytes: b };
      if (TEXT_NAMES[type]) p.text[TEXT_NAMES[type]] = utf8.decode(b.slice(i + 2, i + 2 + len));
      i += 2 + len;
    }
    return p;
  }

  // { callsign, log, orbit, entry, met, lat, lon, zone, text } -> bytes. Inputs are assumed validated;
  // lat/lon keep up to 7 decimals; text fields over 255 bytes throw.
  function encode(f) {
    var utf8 = new TextEncoder(), texts = [];
    Object.keys(TEXT).forEach(function (name) {
      var t = utf8.encode(String((f.text && f.text[name]) || "").trim());
      if (t.length > 255) throw new Error(name + " is longer than 255 bytes");
      if (t.length) texts.push([TEXT[name], t]);
    });
    var size = HEADER + texts.reduce(function (s, t) { return s + 2 + t[1].length; }, 0) + 2;
    var buf = new Uint8Array(size), v = new DataView(buf.buffer);
    buf.set(utf8.encode(String(f.callsign || "MOMO").padEnd(4).slice(0, 4)), 0);
    v.setUint8(4, VERSION);
    v.setUint16(5, f.log);
    v.setUint8(7, f.orbit);
    v.setUint16(8, f.entry);
    v.setUint32(10, f.met);
    v.setInt32(14, Math.round(f.lat * COORD));
    v.setInt32(18, Math.round(f.lon * COORD));
    v.setUint8(22, f.zone || 0);
    v.setUint8(23, 0);
    var o = HEADER;
    texts.forEach(function (t) { buf[o] = t[0]; buf[o + 1] = t[1].length; buf.set(t[1], o + 2); o += 2 + t[1].length; });
    v.setUint16(o, crc16(buf.subarray(0, o)));
    return buf;
  }

  return { VERSION: VERSION, HEADER: HEADER, EPOCH: EPOCH, ZONES: ZONES, TEXT: TEXT,
           crc16: crc16, toHex: toHex, fromHex: fromHex, decode: decode, encode: encode };
})();
