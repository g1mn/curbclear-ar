// Copyright (c) CurbClear AR. Pure, deterministic logic -- NO Lens Studio APIs in this file.
//
// Owns:  verdict rule, profile/gap tables, state machine (profile cycle, gap cycle, pin list),
//        text formatting, and a self-test covering the design-brief Done Criteria 1-5 (logic part).
// Must not: touch the scene, timers, or UI. CurbClearMain.ts drives it and renders the result.
//
// Units: centimeters.

export type Verdict = "PASS" | "TIGHT" | "BLOCKED"

export interface Profile {
  name: string
  widthCm: number
}
export interface GapSample {
  name: string
  gapCm: number
}

// Cycle order is part of the spec: 85 -> 95 -> 75 -> 85 and 102 -> 88 -> 72 -> 80 -> 102.
export const PROFILES: Profile[] = [
  {name: "Standard Chair", widthCm: 85},
  {name: "Power / Stroller", widthCm: 95},
  {name: "Indoor Compact", widthCm: 75},
]
export const GAPS: GapSample[] = [
  {name: "Doorway", gapCm: 102},
  {name: "Bollard Pair", gapCm: 88},
  {name: "Scooter Block", gapCm: 72},
  {name: "Narrow Hall", gapCm: 80},
]

// Comfort margin on top of the profile width for a PASS (5 cm per side).
export const PASS_MARGIN_CM = 10

export const VERDICT_HEX: Record<Verdict, string> = {
  PASS: "#10B981",
  TIGHT: "#F59E0B",
  BLOCKED: "#EF4444",
}

/** PASS: G >= W + 10.  TIGHT: W <= G < W + 10.  BLOCKED: G < W. */
export function computeVerdict(widthCm: number, gapCm: number): Verdict {
  if (gapCm < widthCm) return "BLOCKED"
  if (gapCm >= widthCm + PASS_MARGIN_CM) return "PASS"
  return "TIGHT"
}

/** Margin shown on the pill: G minus W. */
export function marginCm(widthCm: number, gapCm: number): number {
  return gapCm - widthCm
}

/** e.g. "PASS +17 cm" (3 words). */
export function formatPill(widthCm: number, gapCm: number): string {
  const m = marginCm(widthCm, gapCm)
  const sign = m >= 0 ? "+" : "-"
  return computeVerdict(widthCm, gapCm) + " " + sign + Math.abs(m) + " cm"
}

export interface PinRecord {
  index: number // 1-based
  verdict: Verdict
  gapCm: number
  widthCm: number
}

export function formatPinBadge(p: PinRecord): string {
  return "Pinned #" + p.index + ": " + p.verdict + " " + p.gapCm + "cm"
}

export interface Snapshot {
  profileName: string
  widthCm: number
  gapName: string
  gapCm: number
  verdict: Verdict
  marginCm: number
  pinnedCount: number
  lastPin: PinRecord | null
}

export class CurbClearState {
  private profileIndex = 0 // Standard Chair 85
  private gapIndex = 0 // Doorway 102
  private pins: PinRecord[] = []

  snapshot(): Snapshot {
    const p = PROFILES[this.profileIndex]
    const g = GAPS[this.gapIndex]
    return {
      profileName: p.name,
      widthCm: p.widthCm,
      gapName: g.name,
      gapCm: g.gapCm,
      verdict: computeVerdict(p.widthCm, g.gapCm),
      marginCm: marginCm(p.widthCm, g.gapCm),
      pinnedCount: this.pins.length,
      lastPin: this.pins.length > 0 ? this.pins[this.pins.length - 1] : null,
    }
  }

  cycleProfile(): Snapshot {
    this.profileIndex = (this.profileIndex + 1) % PROFILES.length
    return this.snapshot()
  }

  cycleGap(): Snapshot {
    this.gapIndex = (this.gapIndex + 1) % GAPS.length
    return this.snapshot()
  }

  /** Records the current verdict as a persistent pin and returns it. */
  pin(): PinRecord {
    const s = this.snapshot()
    const rec: PinRecord = {index: this.pins.length + 1, verdict: s.verdict, gapCm: s.gapCm, widthCm: s.widthCm}
    this.pins.push(rec)
    return rec
  }

  /** Test helper: jump to a profile/gap by index without cycling. */
  setIndices(profileIndex: number, gapIndex: number): void {
    this.profileIndex = profileIndex
    this.gapIndex = gapIndex
  }
}

/** Runs the logic part of Done Criteria 1-5. Returns failure messages (empty = all pass). */
export function runSelfTests(): string[] {
  const fails: string[] = []
  const eq = (label: string, got: unknown, want: unknown) => {
    if (got !== want) fails.push(label + ": got " + String(got) + ", want " + String(want))
  }

  // Criterion 1: initial state 85 cm profile, 102 cm gap, PASS.
  const s = new CurbClearState()
  let snap = s.snapshot()
  eq("C1 width", snap.widthCm, 85)
  eq("C1 gap", snap.gapCm, 102)
  eq("C1 verdict", snap.verdict, "PASS")

  // Criterion 2: profile cycle 85 -> 95 -> 75 -> 85.
  eq("C2 p1", s.cycleProfile().widthCm, 95)
  eq("C2 p2", s.cycleProfile().widthCm, 75)
  eq("C2 p3", s.cycleProfile().widthCm, 85)

  // Criterion 3: under 85 cm, gap steps 102 PASS, 88 TIGHT, 72 BLOCKED.
  eq("C3 g0", computeVerdict(85, 102), "PASS")
  snap = s.cycleGap()
  eq("C3 g1 gap", snap.gapCm, 88)
  eq("C3 g1 verdict", snap.verdict, "TIGHT")
  snap = s.cycleGap()
  eq("C3 g2 gap", snap.gapCm, 72)
  eq("C3 g2 verdict", snap.verdict, "BLOCKED")

  // Criterion 4: at 80 cm gap -> 75 TIGHT (+5), 85 BLOCKED (-5), 95 BLOCKED (-15).
  eq("C4 75", computeVerdict(75, 80), "TIGHT")
  eq("C4 75 margin", marginCm(75, 80), 5)
  eq("C4 85", computeVerdict(85, 80), "BLOCKED")
  eq("C4 85 margin", marginCm(85, 80), -5)
  eq("C4 95", computeVerdict(95, 80), "BLOCKED")
  eq("C4 95 margin", marginCm(95, 80), -15)
  snap = s.cycleGap() // 72 -> 80
  eq("C4 gap cycles to 80", snap.gapCm, 80)

  // Criterion 5: pinning increments the counter.
  const before = s.snapshot().pinnedCount
  const rec = s.pin()
  eq("C5 count", s.snapshot().pinnedCount, before + 1)
  eq("C5 index", rec.index, before + 1)

  // Boundary checks on the rule itself.
  eq("B PASS edge", computeVerdict(85, 95), "PASS")
  eq("B TIGHT edge", computeVerdict(85, 94), "TIGHT")
  eq("B TIGHT low", computeVerdict(85, 85), "TIGHT")
  eq("B BLOCKED edge", computeVerdict(85, 84), "BLOCKED")
  eq("B pill", formatPill(85, 102), "PASS +17 cm")
  return fails
}
