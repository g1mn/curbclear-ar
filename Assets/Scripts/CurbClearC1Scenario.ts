// Done Criterion 1: initial state + clear central FOV. Must run FIRST in LeafIndex (asserts absolute start state).
import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {buttonSizeCm, expectGateAccents, expectPostHeights, expectVerdictColors, gapCm, gapLabelText, pillText, pillVerdict, profileCm, widthOf, worldPos} from "./CurbClearLeafHelpers"

function visit(o: SceneObject, f: (o: SceneObject) => void) {
  f(o)
  for (let i = 0; i < o.getChildrenCount(); i++) visit(o.getChild(i), f)
}

@component
export class CurbClearC1Scenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)

    expect(profileCm()).toBe(85)
    expect(gapCm()).toBe(102)
    expect(widthOf("CC_FloorRail")).toBeCloseTo(85, 1)
    expect(pillVerdict()).toBe("PASS")
    expect(pillText().text).toBe("PASS +17 cm")
    expectVerdictColors("PASS", expect)
    // Post separation = gap + one post diameter (posts' inner edges mark the gap).
    const sep = worldPos("CC_RightPost").x - worldPos("CC_LeftPost").x
    expect(sep - widthOf("CC_RightPost")).toBeCloseTo(102, 1)

    // Brief final values: 55 cm verdict-capped posts, live gap label, dock buttons >= 12 x 6 cm, pill <= 3 words.
    expectPostHeights(expect)
    expectGateAccents("PASS", expect)
    expect(gapLabelText()).toBe("102 cm")
    for (const k of ["profile", "gap", "pin"] as const) {
      const sz = buttonSizeCm(k)
      expect(sz.w >= 12 - 0.01).toBe(true)
      expect(sz.h >= 6 - 0.01).toBe(true)
    }
    expect(pillText().text.trim().split(/\s+/).length <= 3).toBe(true)

    // Central FOV: no UI panel (pill, dock buttons, pin badge, toast) spans eye level (Y = 0).
    // Gate geometry (posts, caps, dimension line) stands for the real obstacle and may cross it.
    const GATE_GEOMETRY = ["CC_LeftPost", "CC_RightPost", "CC_CapLeft", "CC_CapRight", "CC_DimLine"]
    const check = (o: SceneObject) => {
      if (!o.enabled || GATE_GEOMETRY.indexOf(o.name) >= 0) return
      const rmv = o.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
      if (rmv) expect(rmv.worldAabbMin().y > 0 || rmv.worldAabbMax().y < 0).toBe(true)
      if (o.getComponent("Component.Text")) expect(Math.abs(o.getTransform().getWorldPosition().y) > 1).toBe(true)
    }
    visit(findSceneObjectByName("CurbClear"), check)
    visit(findSceneObjectByName("CC_Dock"), check)
    visit(findSceneObjectByName("CC_Toast"), check)

    // Final gate placement: X = 0, Z = -200, floor Y = -45.
    expect(worldPos("CC_Gate").x).toBeCloseTo(0, 1)
    expect(worldPos("CC_Gate").z).toBeCloseTo(-200, 1)
    expect(worldPos("CC_Gate").y).toBeCloseTo(-45, 1)
  }
}
