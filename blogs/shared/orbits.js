// The blog's orbits (series), shared by every page in blogs/.
//   code   stored in OLP-1 packets, so never reuse or renumber one
//   key    used in ?orbit= on log.html / terminal.html
// To rename an orbit, change its name here only.
var ORBIT_LIST = [
  { code: 1, key: "terraform",   name: "Terraform",    emoji: "🌱", color: "#7ee0a8" },  // growing things
  { code: 2, key: "lifesupport", name: "Life Support", emoji: "🫀", color: "#ff8fa3" },  // fitness, health
  { code: 3, key: "rations",     name: "Rations",      emoji: "🥫", color: "#ffa36b" },  // food, cooking
  { code: 4, key: "expeditions", name: "Expeditions",  emoji: "🗺️", color: "#5fd9c8" },  // travel, exploring
  { code: 5, key: "offduty",     name: "Off-Duty",     emoji: "🎶", color: "#c4a1ff" },  // music
  { code: 6, key: "engineering", name: "Engineering",  emoji: "🔧", color: "#ffd56b" },  // tech, building, career
  { code: 7, key: "navigation",  name: "Navigation",   emoji: "🧭", color: "#8fa8ff" }   // reflection, self-growth
];

function orbitByCode(code) {
  return ORBIT_LIST.find(function (o) { return o.code === code; }) || null;
}

function orbitByKey(key) {
  var k = String(key || "").toLowerCase().replace(/[^a-z]/g, "");
  return ORBIT_LIST.find(function (o) { return o.key === k; }) || null;
}
