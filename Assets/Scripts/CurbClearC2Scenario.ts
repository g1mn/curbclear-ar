// Done Criterion 2: profile cycling 85 -> 95 -> 75 -> 85 with 1:1 floor rail width and label updates.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {CurbClearLeafInteractor, buttonLabel, profileCm, widthOf} from "./CurbClearLeafHelpers"

@component
export class CurbClearC2Scenario extends Scenario {
  async run(): Promise<void> {
    const ui = new CurbClearLeafInteractor()
    await sleep(1500)
    await ui.setProfile(85) // normalize; the cycle below then returns here

    for (const want of [95, 75, 85]) {
      await ui.press("profile")
      expect(profileCm()).toBe(want)
      expect(buttonLabel("profile")).toBe("Profile\n" + want + " cm")
      expect(widthOf("CC_FloorRail")).toBeCloseTo(want, 1)
      expect(widthOf("CC_ThresholdBar")).toBeCloseTo(want, 1)
      expect(widthOf("CC_Arch")).toBeCloseTo(want, 1)
    }
  }
}
