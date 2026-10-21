// The blog's orbits (series), shared by the pages in blogs/.
// The code is stored in log packets, so never reuse or renumber one.
// To rename an orbit, change its name here only.
var ORBIT_LIST = [
  { code: 1, name: "Terraform",    emoji: "🌱" },  // growing things
  { code: 2, name: "Life Support", emoji: "🫀" },  // fitness, health
  { code: 3, name: "Rations",      emoji: "🥫" },  // food, cooking
  { code: 4, name: "Expeditions",  emoji: "🗺️" },  // travel, exploring
  { code: 5, name: "Off-Duty",     emoji: "🎶" },  // music
  { code: 6, name: "Engineering",  emoji: "🔧" },  // tech, building, career
  { code: 7, name: "Navigation",   emoji: "🧭" }   // reflection, self-growth
];

function orbitByCode(code) {
  return ORBIT_LIST.find(function (o) { return o.code === code; }) || null;
}
