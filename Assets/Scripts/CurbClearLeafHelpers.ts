// LEAF helpers for CurbClear AR scenarios: button lookup by label, state readers, state normalizers.
// All dock buttons are named "Item" in the scene, so they are identified by their label text prefix.
// Scenarios share live Lens state: use normalize*() first and assert deltas / cycles, not absolute leftovers.

import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"

export type ButtonKey = "profile" | "gap" | "pin"
const PREFIX: Record<ButtonKey, string> = {profile: "Profile", gap: "Test Gap", pin: "Pin Verdict"}

export const VERDICT_RGB: Record<string, [number, number, number]> = {
  PASS: [0x10, 0xb9, 0x81],
  TIGHT: [0xf5, 0x9e, 0x0b],
  BLOCKED: [0xef, 0x44, 0x44],
}

export function textsUnder(root: SceneObject, out: Text[] = []): Text[] {
  const t = root.getComponent("Component.Text") as Text
  if (t) out.push(t)
  for (let i = 0; i < root.getChildrenCount(); i++) textsUnder(root.getChild(i), out)
  return out
}

function buttonText(i: Interactable): string {
  const t = textsUnder(i.getSceneObject())[0]
  return t ? t.text : ""
}

export function findButton(key: ButtonKey): Interactable {
  const b = findInteractablesByName("Item", undefined, true).find((i) => buttonText(i).startsWith(PREFIX[key]))
  if (!b) throw new Error(`CurbClear button "${PREFIX[key]}" not found`)
  return b
}

/** Dock texts: the three button labels (the toast lives outside the dock, see toastText). */
function dockTexts(): Text[] {
  return textsUnder(findSceneObjectByName("CC_Dock"))
}
export function buttonLabel(key: ButtonKey): string {
  const t = dockTexts().find((x) => x.text.startsWith(PREFIX[key]))
  if (!t) throw new Error(`label for ${key} not found`)
  return t.text
}
export function toastText(): string {
  const t = textsUnder(findSceneObjectByName("CC_Toast"))[0]
  return t ? t.text : ""
}

const num = (s: string, re: RegExp): number => {
  const m = s.match(re)
  if (!m) throw new Error(`cannot parse "${s}"`)
  return parseInt(m[1], 10)
}
export const profileCm = () => num(buttonLabel("profile"), /(\d+) cm/)
export const gapCm = () => num(buttonLabel("gap"), /(\d+) cm/)
export const pinnedCount = () => num(buttonLabel("pin"), /Pinned: (\d+)/)

export function pillText(): Text {
  return textsUnder(findSceneObjectByName("CC_VerdictPill"))[0]
}
export function pillVerdict(): string {
  return pillText().text.split(" ")[0]
}

/** Mesh extent along X times world scale = real width in cm. */
export function widthOf(name: string): number {
  const rmv = findSceneObjectByName(name).getComponent("Component.RenderMeshVisual") as RenderMeshVisual
  return (rmv.mesh.aabbMax.x - rmv.mesh.aabbMin.x) * rmv.getSceneObject().getTransform().getWorldScale().x
}
export function worldPos(name: string): vec3 {
  return findSceneObjectByName(name).getTransform().getWorldPosition()
}
export function baseColor(name: string): vec4 {
  const rmv = findSceneObjectByName(name).getComponent("Component.RenderMeshVisual") as RenderMeshVisual
  return rmv.mainMaterial.mainPass.baseColor
}

export class CurbClearLeafInteractor extends DefaultLeafInteractor {
  async press(key: ButtonKey): Promise<void> {
    await this.trigger(findButton(key))
    await sleep(250)
  }
  /** Cycle until the profile reads `cm` (max 3 presses). */
  async setProfile(cm: number): Promise<void> {
    for (let n = 0; n < 3 && profileCm() !== cm; n++) await this.press("profile")
  }
  /** Cycle until the gap reads `cm` (max 4 presses). */
  async setGap(cm: number): Promise<void> {
    for (let n = 0; n < 4 && gapCm() !== cm; n++) await this.press("gap")
  }
}

/** Gate rail/arch/threshold and the pill text must all carry the verdict color. */
export function expectVerdictColors(verdict: string, expect: (v: any) => any): void {
  const want = VERDICT_RGB[verdict]
  const cols = [baseColor("CC_FloorRail"), baseColor("CC_Arch"), baseColor("CC_ThresholdBar"), pillText().textFill.color]
  for (const c of cols) {
    expect(c.x).toBeCloseTo(want[0] / 255, 2)
    expect(c.y).toBeCloseTo(want[1] / 255, 2)
    expect(c.z).toBeCloseTo(want[2] / 255, 2)
  }
}

/** Dimension-line label (live gap, e.g. "102 cm") under the gate. */
export function gapLabelText(): string {
  const t = textsUnder(findSceneObjectByName("CC_GapLabel"))[0]
  return t ? t.text : ""
}
/** Real-world button size in cm (UIKit Button size x world scale). */
export function buttonSizeCm(key: ButtonKey): {w: number; h: number} {
  const so = findButton(key).getSceneObject()
  const b = so.getComponent(Button.getTypeName()) as Button
  const sc = so.getTransform().getWorldScale()
  return {w: b.size.x * sc.x, h: b.size.y * sc.y}
}
/** World-space vertical extent of a mesh object. */
export function worldY(name: string): {min: number; max: number} {
  const rmv = findSceneObjectByName(name).getComponent("Component.RenderMeshVisual") as RenderMeshVisual
  return {min: rmv.worldAabbMin().y, max: rmv.worldAabbMax().y}
}
/** Post caps + dimension line must carry the verdict color. */
export function expectGateAccents(verdict: string, expect: (v: any) => any): void {
  const want = VERDICT_RGB[verdict]
  for (const n of ["CC_CapLeft", "CC_CapRight", "CC_DimLine"]) {
    const c = baseColor(n)
    expect(c.x).toBeCloseTo(want[0] / 255, 2)
    expect(c.y).toBeCloseTo(want[1] / 255, 2)
    expect(c.z).toBeCloseTo(want[2] / 255, 2)
  }
}
/** Brief final values: 55 cm posts (body + 2 cm cap) standing on the floor at Y = -45. */
export function expectPostHeights(expect: (v: any) => any): void {
  for (const [body, cap] of [["CC_LeftPost", "CC_CapLeft"], ["CC_RightPost", "CC_CapRight"]]) {
    expect(worldY(body).min).toBeCloseTo(-45, 1)
    expect(worldY(cap).max - worldY(body).min).toBeCloseTo(55, 1)
  }
}
