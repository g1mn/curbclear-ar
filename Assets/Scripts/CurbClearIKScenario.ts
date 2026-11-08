// IK reachability: a real user's arm must reach the dock buttons. A trigger that fails to converge is a finding.
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {createIKInteractor} from "Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar"
import {findButton, pinnedCount, profileCm} from "./CurbClearLeafHelpers"

@component
export class CurbClearIKScenario extends Scenario {
  private readonly _ik = createIKInteractor()

  async run(): Promise<void> {
    await sleep(1500)
    const start = profileCm()
    await this._ik.trigger(findButton("profile"))
    await sleep(300)
    expect(profileCm()).not.toBe(start)
    // Two more presses complete the 3-step cycle back to the start profile.
    await this._ik.trigger(findButton("profile"))
    await sleep(300)
    await this._ik.trigger(findButton("profile"))
    await sleep(300)
    expect(profileCm()).toBe(start)

    const pins = pinnedCount()
    await this._ik.trigger(findButton("pin"))
    await sleep(300)
    expect(pinnedCount()).toBe(pins + 1)
  }
}
