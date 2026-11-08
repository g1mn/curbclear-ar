// Done Criterion 4: at the 80 cm gap, 75 cm is TIGHT (+5), 85 cm BLOCKED (-5), 95 cm BLOCKED (-15).
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {CurbClearLeafInteractor, expectGateAccents, expectVerdictColors, gapCm, pillText, pillVerdict} from "./CurbClearLeafHelpers"

@component
export class CurbClearC4Scenario extends Scenario {
  async run(): Promise<void> {
    const ui = new CurbClearLeafInteractor()
    await sleep(1500)
    await ui.setGap(80)
    expect(gapCm()).toBe(80)

    const cases: [number, string, string][] = [
      [75, "TIGHT", "TIGHT +5 cm"],
      [85, "BLOCKED", "BLOCKED -5 cm"],
      [95, "BLOCKED", "BLOCKED -15 cm"],
    ]
    for (const [w, verdict, pill] of cases) {
      await ui.setProfile(w)
      expect(pillVerdict()).toBe(verdict)
      expect(pillText().text).toBe(pill)
      expectVerdictColors(verdict, expect)
      expectGateAccents(verdict, expect)
    }
    await ui.setProfile(85)
    await ui.setGap(102)
  }
}
