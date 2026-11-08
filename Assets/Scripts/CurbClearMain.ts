// Copyright (c) CurbClear AR.
// CurbClearMain -- orchestrator for the CurbClear AR floor clearance gate.
//
// Owns:  the CurbClearState instance (single source of truth), wiring dock events -> state -> views,
//        and the 3.0 s auto-hiding pin toast (DelayedCallbackEvent).
// Expects @inputs: gate (CurbClearGateView), verdictUI, badgeUI, dockUI (all wired in the scene).
// Must not: create text/UI (lives in *UI.ts modules), or compute verdicts (see CurbClearLogic.ts).
//
// Every state change logs one "[CurbClear] STATE ..." line so previews can be checked from the logger.

import {
  CurbClearState,
  Snapshot,
  PinRecord,
  VERDICT_HEX,
  Verdict,
  formatPill,
  formatPinBadge,
  runSelfTests,
} from "./CurbClearLogic"
import {CurbClearGateView} from "./CurbClearGateView"
import {CurbClearVerdictUI} from "./CurbClearVerdictUI"
import {CurbClearBadgeUI} from "./CurbClearBadgeUI"
import {CurbClearDockUI} from "./CurbClearDockUI"

function hexToVec4(hex: string): vec4 {
  const n = parseInt(hex.replace("#", ""), 16)
  return new vec4(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1)
}

@component
export class CurbClearMain extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">CurbClearMain – state machine + wiring</span>')
  @ui.separator

  @ui.label('<span style="color: #60A5FA;">References</span>')
  @ui.group_start("References")
  @input
  @hint("Floor gate view (drives the authored 3D primitives)")
  gate!: CurbClearGateView
  @input
  @hint("Verdict pill UI above the gate")
  verdictUI!: CurbClearVerdictUI
  @input
  @hint("Pinned marker badge UI at the floor gate")
  badgeUI!: CurbClearBadgeUI
  @input
  @hint("Peripheral 3-button dock UI")
  dockUI!: CurbClearDockUI
  @ui.group_end

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Seconds before the pin confirmation toast auto-hides")
  @widget(new SliderWidget(0.5, 10, 0.5))
  toastSeconds: number = 3.0
  @input
  @hint("Debug: on start, fire a scripted Profile/Test Gap/Pin sequence through the dock events and log each state")
  debugAutoDemo: boolean = false
  @ui.group_end

  private state = new CurbClearState()
  private toastTimer!: DelayedCallbackEvent

  onAwake(): void {
    this.toastTimer = this.createEvent("DelayedCallbackEvent")
    this.toastTimer.bind(() => {
      this.dockUI.hideToast()
      console.log("[CurbClear] TOAST hidden after " + this.toastSeconds + "s")
    })
    this.createEvent("OnStartEvent").bind(() => this.onStart())
  }

  private onStart(): void {
    if (!this.gate || !this.verdictUI || !this.badgeUI || !this.dockUI) {
      console.error("[CurbClear] Main: a required @input is not wired (gate/verdictUI/badgeUI/dockUI)")
      return
    }

    const fails = runSelfTests()
    console.log("[CurbClear] SELFTEST " + (fails.length === 0 ? "PASS (criteria 1-5 logic)" : "FAIL: " + fails.join(" | ")))

    this.dockUI.onProfile.add(() => {
      console.log("[CurbClear] EVENT Profile pressed")
      this.render(this.state.cycleProfile())
    })
    this.dockUI.onTestGap.add(() => {
      console.log("[CurbClear] EVENT Test Gap pressed")
      this.render(this.state.cycleGap())
    })
    this.dockUI.onPin.add(() => {
      console.log("[CurbClear] EVENT Pin Verdict pressed")
      this.onPin()
    })

    this.render(this.state.snapshot())
    if (this.debugAutoDemo) this.runDemo()
  }

  /** Scripted walk through Done Criteria 2-5, entering via the dock's public events. */
  private runDemo(): void {
    console.log("[CurbClear] DEMO start")
    const d = this.dockUI
    d.debugPress("profile") // 95
    d.debugPress("profile") // 75
    d.debugPress("profile") // 85
    d.debugPress("gap") // 88 TIGHT
    d.debugPress("gap") // 72 BLOCKED
    d.debugPress("gap") // 80 -> 85 BLOCKED -5
    d.debugPress("profile") // 95 BLOCKED -15
    d.debugPress("profile") // 75 TIGHT +5
    d.debugPress("profile") // 85
    d.debugPress("pin") // Pinned #1
    console.log("[CurbClear] DEMO end")
  }

  private onPin(): void {
    const rec: PinRecord = this.state.pin()
    const snap = this.state.snapshot()
    this.badgeUI.show(formatPinBadge(rec), hexToVec4(VERDICT_HEX[rec.verdict]))
    this.dockUI.setPinned(snap.pinnedCount)
    this.dockUI.showToast("Pinned #" + rec.index + ": " + rec.verdict + " " + rec.gapCm + " cm")
    this.toastTimer.reset(this.toastSeconds) // re-pinning restarts the 3.0 s countdown
    console.log("[CurbClear] PIN #" + rec.index + " " + rec.verdict + " gap=" + rec.gapCm + " width=" + rec.widthCm + " toast shown, hides in " + this.toastSeconds + "s")
  }

  private render(s: Snapshot): void {
    const color = hexToVec4(VERDICT_HEX[s.verdict as Verdict])
    this.gate.apply(s.widthCm, s.gapCm, color)
    this.verdictUI.setVerdict(formatPill(s.widthCm, s.gapCm), color)
    this.dockUI.setProfile(s.widthCm)
    this.dockUI.setGap(s.gapCm)
    this.dockUI.setPinned(s.pinnedCount)
    console.log(
      "[CurbClear] STATE profile=" + s.widthCm + " gap=" + s.gapCm + " verdict=" + s.verdict +
        " margin=" + s.marginCm + " pinned=" + s.pinnedCount + " pill=\"" + formatPill(s.widthCm, s.gapCm) + "\""
    )
  }
}
