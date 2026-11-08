// Copyright (c) CurbClear AR.
// CurbClearVerdictUI -- compact world-anchored verdict pill (UIKit BackPlate + one Text).
//
// Owns:  the pill visuals (<= 4 "words": "PASS +17 cm").
// Public API: setVerdict(text, color).   Emits: none.  Passive view -- holds no domain state.
// Layout: world-fixed, faces +Z (toward the user). Light text only (additive display).

import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"

// Type-scale (single source of truth for this file; see specs-build-ui patterns -> Typography)
const TEXT_SIZE_HEADLINE1 = 150
const CONTENT_Z = 0.6

@component
export class CurbClearVerdictUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">CurbClearVerdictUI – 3D verdict pill</span>')
  @ui.separator

  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Pill width in cm")
  @widget(new SliderWidget(10, 50, 0.5))
  widthCm: number = 52
  @input
  @hint("Pill height in cm")
  @widget(new SliderWidget(2, 15, 0.5))
  heightCm: number = 11
  @input
  @hint("Distance from the user in cm; text size scales with it so it reads the same")
  @widget(new SliderWidget(50, 300, 5))
  viewDistanceCm: number = 200
  @input
  @hint("Initial pill text before the first state is pushed")
  initialText: string = "PASS +17 cm"
  @ui.group_end

  private label!: Text

  onAwake(): void {
    this.sceneObject.createComponent("Component.Canvas")
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate
    plate.size = new vec2(this.widthCm, this.heightCm)
    plate.style = "dark" // darker plate: verdict-colored text reads with high contrast

    const content = global.scene.createSceneObject("Content")
    content.setParent(this.sceneObject)
    content.getTransform().setLocalPosition(new vec3(0, 0, CONTENT_Z))

    this.label = content.createComponent("Component.Text") as Text
    this.label.text = this.initialText
    this.label.depthTest = true
    this.label.size = TEXT_SIZE_HEADLINE1 * (this.viewDistanceCm / 110)
    ;(this.label as Text & {weight?: number}).weight = 700
    this.label.horizontalAlignment = HorizontalAlignment.Center
    this.label.verticalAlignment = VerticalAlignment.Center
    this.label.horizontalOverflow = HorizontalOverflow.Overflow
    this.label.verticalOverflow = VerticalOverflow.Overflow
    const hw = this.widthCm / 2
    const hh = this.heightCm / 2
    this.label.layoutRect = Rect.create(-hw, hw, -hh, hh)
  }

  setVerdict(text: string, color: vec4): void {
    if (!this.label) return
    this.label.text = text
    this.label.textFill.color = color
  }
}
