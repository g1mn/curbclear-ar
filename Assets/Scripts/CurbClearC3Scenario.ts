// Done Criterion 3: under 85 cm, gap cycles 102 PASS -> 88 TIGHT -> 72 BLOCKED -> 80 (-> 102).
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {CurbClearLeafInteractor, buttonLabel, expectGateAccents, expectPostHeights, expectVerdictColors, gapLabelText, pillText, pillVerdict, widthOf, worldPos} from "./CurbClearLeafHelpers"

@component
export class CurbClearC3Scenario extends Scenario {
  async run(): Promise<void> {
    const ui = new CurbClearLeafInteractor()
    await sleep(1500)
    await ui.setProfile(85)
    await ui.setGap(102)

    const steps: [number, string, string][] = [
      [102, "PASS", "PASS +17 cm"],
      [88, "TIGHT", "TIGHT +3 cm"],
      [72, "BLOCKED", "BLOCKED -13 cm"],
      [80, "BLOCKED", "BLOCKED -5 cm"],
    ]
    for (let n = 0; n < steps.length; n++) {
      const [gap, verdict, pill] = steps[n]
      if (n > 0) await ui.press("gap")
      expect(buttonLabel("gap")).toBe("Test Gap\n" + gap + " cm")
      expect(pillVerdict()).toBe(verdict)
      expect(pillText().text).toBe(pill)
      expectVerdictColors(verdict, expect)
      expectGateAccents(verdict, expect)
      expectPostHeights(expect)
      expect(gapLabelText()).toBe(gap + " cm")
      const sep = worldPos("CC_RightPost").x - worldPos("CC_LeftPost").x
      expect(sep - widthOf("CC_RightPost")).toBeCloseTo(gap, 1)
    }
    await ui.setGap(102) // leave the Lens in its start state
  }
}
