// Validates the action prerequisite graph and runs the evidence-gating
// walkthroughs. Run with: npm run check:actions
//
// Fails (exit 1) on any problem, so it can be used as a guard after editing
// lib/actions-catalog.ts.

import { ACTIONS } from "../lib/actions-catalog";
import {
  findCycle,
  findMissingPrerequisites,
  findUnreachable,
  getEnquiryView,
  getOpensNext,
  minimumCostToComplete,
  type EnquiryState,
} from "../lib/action-graph";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const MAX = 11;
const stateOf = (id: string, done: string[], week = MAX): EnquiryState => {
  const action = ACTIONS.find((a) => a.id === id)!;
  return getEnquiryView(action, new Set(done), week).state;
};
const visibleIds = (done: string[], week = MAX) =>
  ACTIONS.filter((a) => {
    const s = stateOf(a.id, done, week);
    return s === "available" || s === "waiting";
  }).map((a) => a.id);

// ---- 1. Graph validation ----------------------------------------------------
const missing = findMissingPrerequisites();
check("every referenced prerequisite exists", missing.length === 0, missing.map((m) => `${m.actionId}→${m.missing}`).join(", "));
const cycle = findCycle();
check("no prerequisite cycles", cycle === null, cycle?.join(" → "));
const unreachable = findUnreachable();
check("every action reachable from the initially available set", unreachable.length === 0, unreachable.join(", "));
check("action ids are unique", new Set(ACTIONS.map((a) => a.id)).size === ACTIONS.length);
check(
  "no retired car-park CCTV action",
  !ACTIONS.some((a) => /car[- ]?park/i.test(a.id) || /car[- ]?park cctv/i.test(a.label))
);

// ---- 2. Minimum cost of the endgame ----------------------------------------
const endgame = minimumCostToComplete("endgame-arrest-burgess-butt");
console.log(`\nEndgame minimum cost (computed): ${endgame.total} points across ${endgame.actionIds.length} actions`);
for (const id of endgame.actionIds) console.log(`   ${ACTIONS.find((a) => a.id === id)!.cost}  ${id}`);
check("endgame minimum cost is 17", endgame.total === 17, `computed ${endgame.total}`);
console.log("");

// ---- 3. Walkthroughs --------------------------------------------------------
const noPrereq = ACTIONS.filter((a) => !a.prerequisiteActionIds?.length).map((a) => a.id);
const fresh = visibleIds([]);
check(
  "fresh team sees exactly the no-prerequisite actions",
  fresh.length === noPrereq.length && noPrereq.every((id) => fresh.includes(id)),
  `${fresh.length} visible vs ${noPrereq.length} with no prerequisites`
);

{
  const view = getEnquiryView(ACTIONS.find((a) => a.id === "toolmark-review-mason-wooley")!, new Set(["forensic-report-mason"]), MAX);
  const mason = view.waitingOn.find((w) => w.id === "forensic-report-mason");
  const wooley = view.waitingOn.find((w) => w.id === "forensic-report-wooley");
  check(
    "Mason report only → comparative review greyed, Wooley report outstanding",
    view.state === "waiting" && mason?.met === true && wooley?.met === false,
    `state=${view.state}`
  );
  check("…and not shown before any report is pulled", stateOf("toolmark-review-mason-wooley", []) === "hidden");
}

{
  const before = new Set(visibleIds([]));
  const after = visibleIds(["bus-cctv-butt"]).filter((id) => !before.has(id) && id !== "bus-cctv-butt");
  const bus = ACTIONS.find((a) => a.id === "bus-cctv-butt")!;
  check(
    "bus records done → high street CCTV available, nothing further visible",
    after.length === 1 && after[0] === "highstreet-cctv-butt" && stateOf("highstreet-cctv-butt", ["bus-cctv-butt"]) === "available",
    `newly visible: ${after.join(", ") || "none"}`
  );
  check(
    "…Paget Street and the endgame stay hidden",
    stateOf("doorbell-paget-street-butt", ["bus-cctv-butt"]) === "hidden" && stateOf("endgame-arrest-burgess-butt", ["bus-cctv-butt"]) === "hidden"
  );
  const opens = getOpensNext(bus.id, new Set(["bus-cctv-butt"]));
  check("…and the strip lists only high street CCTV", opens.length === 1 && opens[0].action.id === "highstreet-cctv-butt");
}

{
  // Everything up to a property search is on file; vary only which suspect was searched.
  const upTo = ["forensic-report-mason", "forensic-report-wooley", "toolmark-review-mason-wooley", "pull-interview-burgess-mason"];
  const nigel = getOpensNext("property-search-wooley", new Set([...upTo, "property-search-wooley"]));
  const swayne = getOpensNext("property-search-swayne", new Set([...upTo, "property-search-swayne"]));
  check("property search on Nigel opens nothing", nigel.length === 0, nigel.map((e) => e.action.id).join(", "));
  check("property search on Swayne opens nothing", swayne.length === 0, swayne.map((e) => e.action.id).join(", "));
  const burgess = getOpensNext("property-search-burgess", new Set([...upTo, "property-search-burgess"]));
  const ids = burgess.map((e) => e.action.id).sort();
  const expected = ["cellsite-burgess-butt", "cellsite-burgess-mason", "cellsite-burgess-wooley", "interim-interview-burgess"];
  check(
    "property search naming Burgess opens the interim interview and the three cell site reports",
    JSON.stringify(ids) === JSON.stringify(expected) && burgess.every((e) => e.kind === "available"),
    ids.join(", ")
  );
}

{
  const all = ACTIONS.filter((a) => a.id !== "endgame-arrest-burgess-butt").map((a) => a.id);
  check("a team that has done everything else can take the endgame", stateOf("endgame-arrest-burgess-butt", all) === "available");
  const needsOne = endgame.actionIds.filter((id) => id !== "endgame-arrest-burgess-butt");
  check(
    "endgame appears greyed only once a single prerequisite remains",
    stateOf("endgame-arrest-burgess-butt", needsOne.slice(0, needsOne.length - 1)) !== "hidden" &&
      stateOf("endgame-arrest-burgess-butt", needsOne.slice(0, 2)) === "hidden"
  );
}

// Saved progress: an action already completed never goes back to locked or hidden,
// even if it was taken before its (new) prerequisites were done.
{
  const legacy = ["highstreet-cctv-butt", "doorbell-paget-street-butt", "cellsite-nigel-butt", "toolmark-review-mason-wooley"];
  const stillDone = legacy.every((id) => stateOf(id, legacy) === "done");
  check("completed actions stay done when their new prerequisites were never met", stillDone);
}

// Each of the eight new prerequisites, exactly as specified.
const NEW: Record<string, string[]> = {
  "toolmark-review-mason-wooley": ["forensic-report-mason", "forensic-report-wooley"],
  "forensic-dna": ["forensic-report-wooley"],
  "highstreet-cctv-butt": ["bus-cctv-butt"],
  "doorbell-paget-street-butt": ["highstreet-cctv-butt"],
  "anpr-sweep-hollen-marsh-2019": ["traffic-cam-hollen-marsh"],
  "anpr-sweep-featherton-2022": ["anpr-haddad-marsh-road"],
  "cellsite-nigel-butt": ["pull-interview-wooley"],
  "cellsite-swayne-porterhouse": ["pull-interview-swayne"],
};
for (const [id, prereqs] of Object.entries(NEW)) {
  const actual = ACTIONS.find((a) => a.id === id)?.prerequisiteActionIds ?? [];
  check(`new prerequisite: ${id}`, JSON.stringify([...actual].sort()) === JSON.stringify([...prereqs].sort()), actual.join(", "));
}

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
