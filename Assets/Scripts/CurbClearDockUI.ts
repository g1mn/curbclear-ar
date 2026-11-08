// Copyright (c) CurbClear AR.
// CurbClearDockUI -- lower-peripheral pinch dock: ONLY 3 large UIKit Buttons (Profile, Test Gap, Pin Verdict)
// plus a one-line toast row above them (empty = hidden).
//
// Owns:  button visuals/labels and the toast text. Passive view -- holds no domain state.
// Public API: setProfile(widthCm), setGap(gapCm), setPinned(count), showToast(msg), hideToast().
// Emits: onProfile, onTestGap, onPin  (UIKit Button onTriggerUp: SIK pinch on glasses, mouse click in Preview).
// Layout: FlexLayout column [toast row, button row]; no hand-placed offsets.

import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexAlign, FlexDirection, FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import Event, {PublicApi} from "SpectaclesInteractionKit.lspkg/Utils/Event"

const TEXT_SIZE_HEADLINE1 = 100
const TEXT_SIZE_HEADLINE2 = 48
const BUTTON_LABEL_Z = 0.08
const LAYOUT_Z_LIFT = 0.02
const TOAST_Y_CM = 55
const TOAST_Z_CM = -200

@component
export class CurbClearDockUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">CurbClearDockUI – 3-button pinch dock</span>')
  @ui.separator

  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Button width in cm")
  @widget(new SliderWidget(8, 24, 0.5))
  buttonWidthCm: number = 13
  @input
  @hint("Button height in cm")
  @widget(new SliderWidget(3, 12, 0.5))
  buttonHeightCm: number = 7
  @input
  @hint("Gap between buttons in cm")
  @widget(new SliderWidget(1, 10, 0.5))
  buttonGapCm: number = 2.5
  @input
  @hint("Distance from the user in cm; text size scales with it")
  @widget(new SliderWidget(40, 200, 5))
  viewDistanceCm: number = 70
  @input('vec4', '{1,1,1,1}')
  @widget(new ColorWidget())
  @hint("Button label color (keep light: the display is additive)")
  labelColor: vec4
  @ui.group_end

  private _onProfile = new Event<void>()
  private _onTestGap = new Event<void>()
  private _onPin = new Event<void>()
  get onProfile(): PublicApi<void> {
    return this._onProfile.publicApi()
  }
  get onTestGap(): PublicApi<void> {
    return this._onTestGap.publicApi()
  }
  get onPin(): PublicApi<void> {
    return this._onPin.publicApi()
  }

  private profileLabel!: Text
  private gapLabel!: Text
  private pinLabel!: Text
  private toast!: Text

  onAwake(): void {
    this.sceneObject.createComponent("Component.Canvas")
    const w = this.buttonWidthCm * 3 + this.buttonGapCm * 2
    const toastH = 3
    const h = toastH + this.buttonHeightCm

    const column = this.makeFlex(this.sceneObject, FlexDirection.Column, w, h, 0, FlexJustify.Start)

    // Toast row (empty spacer in the flex column; the text itself is re-parented below).
    this.flexChild(column, w, toastH, (row) => {
      this.toast = this.makeText(row, "", w - 2, toastH / 2, TEXT_SIZE_HEADLINE2, this.labelColor, 0)
    })

    // Button row.
    const buttons = this.makeFlex(column, FlexDirection.Row, w, this.buttonHeightCm, this.buttonGapCm, FlexJustify.Center)
    this.profileLabel = this.addButton(buttons, "Profile\n85 cm", () => this._onProfile.invoke())
    this.gapLabel = this.addButton(buttons, "Test Gap\n102 cm", () => this._onTestGap.invoke())
    this.pinLabel = this.addButton(buttons, "Pin Verdict\nPinned: 0", () => this._onPin.invoke())

    // The preview frame ends just under the buttons and the rail fills the space above them, so the toast floats
    // above the verdict pill (clear sky, above the central band): world (0, 55, -200), white, pill-sized text.
    const so = this.toast.sceneObject
    so.name = "CC_Toast"
    so.setParent(this.sceneObject.getParent())
    so.getTransform().setWorldPosition(new vec3(0, TOAST_Y_CM, TOAST_Z_CM))
    so.getTransform().setWorldRotation(quat.quatIdentity())
    this.toast.size = 160
    this.toast.layoutRect = Rect.create(-30, 30, -4, 4)
  }

  /** Test hook: fires the same public events a Button release would (used by CurbClearMain.debugAutoDemo). */
  debugPress(which: "profile" | "gap" | "pin"): void {
    if (which === "profile") this._onProfile.invoke()
    else if (which === "gap") this._onTestGap.invoke()
    else this._onPin.invoke()
  }

  setProfile(widthCm: number): void {
    this.profileLabel.text = "Profile\n" + widthCm + " cm"
  }
  setGap(gapCm: number): void {
    this.gapLabel.text = "Test Gap\n" + gapCm + " cm"
  }
  setPinned(count: number): void {
    this.pinLabel.text = "Pin Verdict\nPinned: " + count
  }
  showToast(msg: string): void {
    this.toast.text = msg
  }
  hideToast(): void {
    this.toast.text = ""
  }

  // ---- helpers (see specs-build-ui references/helpers.md) ----

  private obj(parent: SceneObject, name: string): SceneObject {
    const so = global.scene.createSceneObject(name)
    so.setParent(parent)
    return so
  }

  private makeFlex(
    parent: SceneObject,
    direction: FlexDirection,
    width: number,
    height: number,
    gap: number,
    justify: FlexJustify
  ): SceneObject {
    const container = this.obj(parent, "Flex")
    const p = container.getTransform().getLocalPosition()
    container.getTransform().setLocalPosition(new vec3(p.x, p.y, p.z + LAYOUT_Z_LIFT))
    const flex = container.createComponent(FlexLayout.getTypeName()) as FlexLayout
    const item = container.createComponent(FlexItem.getTypeName()) as FlexItem
    if (width > 0) item.overrideWidth = width
    if (height > 0) item.overrideHeight = height
    flex.onInitialized.add(() => {
      flex.width = width
      flex.height = height
      flex.direction = direction
      if (direction === FlexDirection.Row) flex.columnGap = gap
      else flex.rowGap = gap
      flex.justifyContent = justify
      flex.alignItems = FlexAlign.Center
    })
    // Children are picked up by FlexLayout's autoDiscoverItemsOnStart (everything is built in onAwake).
    return container
  }

  private flexChild(parent: SceneObject, w: number, h: number, builder: (child: SceneObject) => void): SceneObject {
    const child = this.obj(parent, "Item")
    const item = child.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideWidth = w
    item.overrideHeight = h
    item.flexGrow = 0
    item.flexShrink = 0
    builder(child)
    return child
  }

  private makeText(parent: SceneObject, text: string, widthCm: number, halfH: number, size: number, color: vec4, z: number): Text {
    const so = this.obj(parent, "Text")
    so.getTransform().setLocalPosition(new vec3(0, 0, z))
    const t = so.createComponent("Component.Text") as Text
    t.text = text
    t.depthTest = true
    t.size = size * (this.viewDistanceCm / 110)
    ;(t as Text & {weight?: number}).weight = 700
    t.textFill.color = color
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(-widthCm / 2, widthCm / 2, -halfH, halfH)
    return t
  }

  private addButton(parent: SceneObject, label: string, onClick: () => void): Text {
    let text!: Text
    this.flexChild(parent, this.buttonWidthCm, this.buttonHeightCm, (so) => {
      const btn = so.createComponent(Button.getTypeName()) as Button
      btn.size = new vec3(this.buttonWidthCm, this.buttonHeightCm, 1) // before init
      text = this.makeText(
        so,
        label,
        this.buttonWidthCm - 0.5,
        this.buttonHeightCm / 2 - 0.3,
        TEXT_SIZE_HEADLINE1,
        this.labelColor,
        BUTTON_LABEL_Z
      )
      btn.onTriggerUp.add(onClick)
    })
    return text
  }
}
