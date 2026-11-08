// Copyright (c) CurbClear AR.
// CurbClearBadgeUI -- world-anchored "Pinned #N: PASS 102cm" badge at the floor gate.
//
// Owns:  the badge visuals. Built lazily on the first show() so it is truly absent in the default state
//        (a BackPlate disabled before OnStart never initializes, so we create it on demand instead).
// Public API: show(text, color).   Emits: none.  Passive view -- holds no domain state.

import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"

const TEXT_SIZE_HEADLINE2 = 48
const CONTENT_Z = 0.6

@component
export class CurbClearBadgeUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">CurbClearBadgeUI – pinned marker badge</span>')
  @ui.separator

  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Badge width in cm")
  @widget(new SliderWidget(8, 40, 0.5))
  widthCm: number = 22
  @input
  @hint("Badge height in cm")
  @widget(new SliderWidget(2, 10, 0.5))
  heightCm: number = 4.5
  @input
  @hint("Distance from the user in cm; text size scales with it")
  @widget(new SliderWidget(50, 300, 5))
  viewDistanceCm: number = 130
  @ui.group_end

  private label: Text | null = null

  onAwake(): void {
    this.sceneObject.createComponent("Component.Canvas")
  }

  show(text: string, color: vec4): void {
    if (!this.label) this.build()
    const l = this.label as Text
    l.text = text
    l.textFill.color = color
  }

  private build(): void {
    const plate = this.sceneObject.createComponent(BackPlate.getTypeName()) as BackPlate
    plate.size = new vec2(this.widthCm * 1.25, this.heightCm * 1.15)

    const content = global.scene.createSceneObject("Content")
    content.setParent(this.sceneObject)
    content.getTransform().setLocalPosition(new vec3(0, 0, CONTENT_Z))
    const t = content.createComponent("Component.Text") as Text
    t.depthTest = true
    t.size = TEXT_SIZE_HEADLINE2 * 1.35 * (this.viewDistanceCm / 110)
    ;(t as Text & {weight?: number}).weight = 700
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    const hw = this.widthCm * 0.625
    const hh = this.heightCm * 0.575
    t.layoutRect = Rect.create(-hw, hw, -hh, hh)
    this.label = t
  }
}
