// Copyright (c) CurbClear AR.
// CurbClearGateView -- drives the authored 1:1 Floor Clearance Gate primitives.
//
// Owns:  sizing/placing the authored posts, floor rail, buffer strips, threshold bar and arch
//        (all in cm, gate-root local space; the root sits on the floor) and tinting them by verdict.
// Expects @inputs: the 7 authored SceneObjects below, each carrying a RenderMeshVisual.
// Must not: decide verdicts or hold state -- CurbClearMain pushes apply(width, gap, color).
//
// Local space: +X right, +Y up from the floor, +Z toward the user.

@component
export class CurbClearGateView extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">CurbClearGateView – 1:1 floor gate</span>')
  @ui.separator

  @ui.label('<span style="color: #60A5FA;">References</span>')
  @ui.group_start("References")
  @input
  @hint("Left obstacle boundary post (cylinder)")
  leftPost!: SceneObject
  @input
  @hint("Right obstacle boundary post (cylinder)")
  rightPost!: SceneObject
  @input
  @hint("Inner floor rail whose width equals the active profile")
  floorRail!: SceneObject
  @input
  @hint("Left 5 cm safety buffer strip")
  bufferLeft!: SceneObject
  @input
  @hint("Right 5 cm safety buffer strip")
  bufferRight!: SceneObject
  @input
  @hint("Ground threshold bar across the profile width")
  thresholdBar!: SceneObject
  @input
  @hint("Low arch lintel across the profile width")
  arch!: SceneObject
  @ui.group_end

  @ui.separator
  @ui.label('<span style="color: #60A5FA;">Settings</span>')
  @ui.group_start("Settings")
  @input
  @hint("Obstacle post height in cm")
  @widget(new SliderWidget(20, 120, 1))
  postHeightCm: number = 55
  @input
  @hint("Obstacle post diameter in cm")
  @widget(new SliderWidget(2, 15, 0.5))
  postDiameterCm: number = 5
  @input
  @hint("Length of the floor corridor along the walking direction, in cm")
  @widget(new SliderWidget(20, 200, 5))
  corridorLengthCm: number = 60
  @input
  @hint("Width of each side safety buffer strip in cm")
  @widget(new SliderWidget(1, 15, 0.5))
  bufferStripCm: number = 5
  @input
  @hint("Height of the arch lintel above the floor in cm")
  @widget(new SliderWidget(10, 120, 1))
  archHeightCm: number = 25
  @input('vec4', '{0.9,0.9,0.95,1}')
  @widget(new ColorWidget())
  @hint("Color of the two obstacle posts")
  postColor: vec4
  @input
  @hint("Dimension-line label text size (scaled for a ~200 cm view distance)")
  @widget(new SliderWidget(60, 320, 5))
  gapLabelSize: number = 280
  @ui.group_end

  private capL: SceneObject | null = null
  private capR: SceneObject | null = null
  private dimLine: SceneObject | null = null
  private gapLabel: Text | null = null

  // No OnStart gate: CurbClearMain may call apply() before this component's own OnStart runs.
  private wired(): boolean {
    const refs = [this.leftPost, this.rightPost, this.floorRail, this.bufferLeft, this.bufferRight, this.thresholdBar, this.arch]
    if (refs.every((r) => !!r)) return true
    console.error("[CurbClear] GateView: a required @input is not wired")
    return false
  }

  /** Per-object unique material so tinting one part never recolors the shared asset. */
  private tintable(obj: SceneObject): Material | null {
    const rmv = obj.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
    if (!rmv) return null
    if (!(rmv as any).__ccCloned) {
      rmv.mainMaterial = rmv.mainMaterial.clone()
      ;(rmv as any).__ccCloned = true
    }
    return rmv.mainMaterial
  }

  private setColor(obj: SceneObject, c: vec4): void {
    const m = this.tintable(obj)
    if (m) m.mainPass.baseColor = c
  }

  /** Runtime-made helper (cap / dimension line) reusing a source primitive's mesh and a cloned material. */
  private make(name: string, src: SceneObject): SceneObject {
    const so = global.scene.createSceneObject(name)
    so.setParent(this.sceneObject)
    const s = src.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
    const r = so.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
    r.mesh = s.mesh
    r.mainMaterial = s.mainMaterial.clone()
    ;(r as any).__ccCloned = true
    return so
  }

  private ensureExtras(): void {
    if (this.dimLine) return
    this.capL = this.make("CC_CapLeft", this.leftPost)
    this.capR = this.make("CC_CapRight", this.leftPost)
    this.dimLine = this.make("CC_DimLine", this.floorRail)
    const lab = global.scene.createSceneObject("CC_GapLabel")
    lab.setParent(this.sceneObject)
    const t = lab.createComponent("Component.Text") as Text
    t.depthTest = true
    t.size = this.gapLabelSize
    ;(t as Text & {weight?: number}).weight = 700
    t.textFill.color = new vec4(1, 1, 1, 1)
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    t.layoutRect = Rect.create(-15, 15, -4, 4)
    t.outlineSettings.enabled = true
    t.outlineSettings.size = 0.35
    t.outlineSettings.fill.color = new vec4(0, 0, 0, 1)
    this.gapLabel = t
    this.gapLabelObj = lab
  }
  private gapLabelObj: SceneObject | null = null

  /** Scale the primitive's mesh to an exact size in cm and place its center. */
  private fit(obj: SceneObject, size: vec3, center: vec3): void {
    const rmv = obj.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
    const t = obj.getTransform()
    const ext = rmv.mesh.aabbMax.sub(rmv.mesh.aabbMin)
    const sx = ext.x > 0 ? size.x / ext.x : 1
    const sy = ext.y > 0 ? size.y / ext.y : 1
    const sz = ext.z > 0 ? size.z / ext.z : 1
    t.setLocalScale(new vec3(sx, sy, sz))
    // Account for a mesh whose AABB center is not at its origin.
    const mid = rmv.mesh.aabbMax.add(rmv.mesh.aabbMin).uniformScale(0.5)
    t.setLocalPosition(center.sub(new vec3(mid.x * sx, mid.y * sy, mid.z * sz)))
  }

  /** widthCm = active profile width, gapCm = measured obstacle gap, tint = verdict color. */
  apply(widthCm: number, gapCm: number, tint: vec4): void {
    if (!this.wired()) return
    const d = this.postDiameterCm
    const h = this.postHeightCm
    const L = this.corridorLengthCm
    const b = this.bufferStripCm

    // Posts: inner edges mark the measured gap.
    const postX = gapCm / 2 + d / 2

    // Floor rail: exactly the profile width, along the walking direction.
    this.fit(this.floorRail, new vec3(widthCm, 0.6, L), new vec3(0, 0.3, 0))
    // Side safety buffer strips sit just outside the frame.
    this.fit(this.bufferLeft, new vec3(b, 0.6, L), new vec3(-(widthCm / 2 + b / 2), 0.3, 0))
    this.fit(this.bufferRight, new vec3(b, 0.6, L), new vec3(widthCm / 2 + b / 2, 0.3, 0))
    // Ground threshold bar + low arch lintel across the profile width.
    this.fit(this.thresholdBar, new vec3(widthCm, 1.5, 3), new vec3(0, 0.75, 0))
    this.fit(this.arch, new vec3(widthCm, 2.5, 2.5), new vec3(0, this.archHeightCm, 0))

    // White post bodies (below), thin verdict-colored caps on top, dimension line between the posts.
    const capH = 2
    this.ensureExtras()
    this.fit(this.leftPost, new vec3(d, h - capH, d), new vec3(-postX, (h - capH) / 2, 0))
    this.fit(this.rightPost, new vec3(d, h - capH, d), new vec3(postX, (h - capH) / 2, 0))
    this.fit(this.capL!, new vec3(d, capH, d), new vec3(-postX, h - capH / 2, 0))
    this.fit(this.capR!, new vec3(d, capH, d), new vec3(postX, h - capH / 2, 0))
    this.fit(this.dimLine!, new vec3(gapCm, 1.6, 1.6), new vec3(0, h - capH / 2, 0))
    this.gapLabelObj!.getTransform().setLocalPosition(new vec3(0, h + 7, 0))
    this.gapLabel!.text = gapCm + " cm"
    this.setColor(this.capL!, tint)
    this.setColor(this.capR!, tint)
    this.setColor(this.dimLine!, tint)
    this.setColor(this.leftPost, this.postColor)
    this.setColor(this.rightPost, this.postColor)
    this.setColor(this.floorRail, tint)
    this.setColor(this.thresholdBar, tint)
    this.setColor(this.arch, tint)
    const dim = new vec4(tint.x * 0.6, tint.y * 0.6, tint.z * 0.6, 1)
    this.setColor(this.bufferLeft, dim)
    this.setColor(this.bufferRight, dim)
  }
}
