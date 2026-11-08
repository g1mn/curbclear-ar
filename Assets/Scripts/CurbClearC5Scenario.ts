// Done Criterion 5: Pin Verdict increments the counter, updates the badge, toast auto-hides after 3.0 s.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {CurbClearLeafInteractor, pillVerdict, pinnedCount, textsUnder, toastText, gapCm, buttonLabel} from "./CurbClearLeafHelpers"

@component
export class CurbClearC5Scenario extends Scenario {
  async run(): Promise<void> {
    const ui = new CurbClearLeafInteractor()
    await sleep(3500) // let any toast from an earlier scenario expire
    expect(toastText()).toBe("")

    const before = pinnedCount()
    const verdict = pillVerdict()
    const gap = gapCm()
    await ui.press("pin")

    expect(pinnedCount()).toBe(before + 1)
    expect(buttonLabel("pin")).toBe("Pin Verdict\nPinned: " + (before + 1))
    const toast = "Pinned #" + (before + 1) + ": " + verdict + " " + gap + " cm"
    expect(toastText()).toBe(toast)
    const badge = textsUnder(findSceneObjectByName("CC_PinBadge"))[0]
    expect(badge.text).toBe("Pinned #" + (before + 1) + ": " + verdict + " " + gap + "cm")

    await sleep(1000)
    expect(toastText()).toBe(toast) // still visible well inside the 3.0 s window
    await sleep(2500) // > 3.0 s since the pin
    expect(toastText()).toBe("")
    expect(badge.text.length > 0).toBe(true) // badge persists
    expect(pinnedCount()).toBe(before + 1)
  }
}
