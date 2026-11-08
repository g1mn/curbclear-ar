---
status: final
---

# Design brief: CurbClear AR

<!-- Filled in by plan-lens from the learner's interview. Use the learner's words. Mark any value they didn't choose as (default). -->

Target: SPECS 27 in Lens Studio 5.23.2. Lens Studio works in centimeters, so sizes and positions are in cm, with the meter value in parentheses. Camera is the origin; -Z is forward, -Y is down.

## The one spatial moment
A wheelchair user or accessibility auditor looks at the ground 200 cm (2.0 m) ahead and sees a true 1:1 real-size clearance gate (75, 85 or 95 cm wide) resting on the floor between two obstacle boundary posts. With both hands free on the wheels, they see at a glance whether the gap fits their mobility profile: the floor corridor and arch glow Emerald Green (PASS), Amber (TIGHT) or Coral Red (BLOCKED), with one short verdict pill of at most 3 words (for example "PASS +17 cm") floating above the gate.

## Why it belongs on glasses
- Uses: draws in the world (a real-size gate on the floor where the obstacle is) and leaves your body free (hands stay on push-rims, canes or handles, eyes stay up).
- Why it's better than the phone or laptop version: pushing a wheelchair or guiding a mobility aid occupies both hands. A phone forces the user to stop, hold a device and translate numbers into space. Glasses draw the exact width of the user's chair in the real world ahead.

## Product or overlay
- Type: overlay (it responds to a real gap ahead).
- What the real version would sense: the real width of a doorway, bollard pair or sidewalk gap.
- Stand-in for the preview: the Lens does not measure anything. Button 2 [Test Gap] cycles the posts through four hard-coded gaps (102, 88, 72, 80 cm). The posts can also be pinch-dragged by mouse in Interactive Preview. Keep the stand-in obvious in the scene.

## Where things live
- Where the user is looking during the main task: at the floor ahead, at the gate and posts. Central field of view (eye level, Y = 0) stays 100% clear so the user always sees real hazards. Nothing is head-locked across the center. Central clear band: Y = -15 cm to +30 cm (-0.15 m to +0.30 m).
- All content stays in the comfortable range of 50 cm to 300 cm (0.5 m to 3.0 m).
- 1:1 Floor Clearance Gate: Z = -200 cm, Y = -45 cm (floor level), centered on X = 0 (Z = -2.0 m, Y = -0.45 m). The whole gate sits at 200 cm so both posts stay inside the SPECS 27 preview frame (about +/-16 degrees horizontally, about +/-60 cm visible at 200 cm) for the 102 cm and 88 cm gaps; the post outer edges reach +/-56 cm at the 102 cm gap.
  - Inner clearance frame: a flat floor rail (Box or Plane) whose width matches the active profile (75, 85 or 95 cm; default 85 cm, so X spans -42.5 cm to +42.5 cm), plus a ground threshold bar and a low arch (25 cm above the floor). Key spec also adds two 5 cm side safety buffer strips (+10 cm total comfort margin). Corridor length 60 cm.
  - Left and right obstacle boundary posts: two vertical cylinders, height 55 cm (0.55 m), diameter 5 cm (0.05 m), white bodies (53 cm) with a thin 2 cm cap on top in the verdict color. Post inner edges mark the measured gap (102, 88, 72 or 80 cm).
  - Dimension line: a thin 1.6 cm bar in the verdict color between the two posts at post-top height (Y = +10 cm, 55 cm above the floor), with a live label of the gap ("102 cm", "88 cm", "72 cm", "80 cm") centered above it (white, bold, label center 62 cm above the floor). It updates on every Test Gap press and every post move. This is the money shot.
  - Spatial verdict pill: world position X = 0, Y = +35 cm, Z = -200 cm (80 cm above the floor), floating above the dimension label, 52 cm x 11 cm dark plate, at most 3 words, format "PASS +17 cm", "TIGHT +3 cm", "BLOCKED -13 cm" (verdict color text, margin = G minus W). It is above the central band and not in the middle of the view.
- Peripheral pinch dock: Z = -110 cm, Y = -30.5 cm (Z = -1.1 m, Y = -0.305 m), angled 15 degrees toward the user in the lower periphery, with only 3 large pinch buttons, each 15 cm x 7.5 cm (0.15 m x 0.075 m), spaced 3 cm (0.03 m) apart (button centers at X = -18, 0, +18 cm; row spans X = -25.5 to +25.5 cm). On screen the buttons sit just below the gate's floor rail with no overlap and all 3 are inside the frame. The interview minimum was 12 cm x 6 cm; the larger size is used. Labels: "Profile", "Test Gap", "Pin Verdict" plus a second line with the live value.
- Pinned marker badge: a compact world-anchored badge at the floor gate, for example "Pinned #1: PASS 102cm". The badge plate is 27.5 cm x 5.2 cm with text about 35 percent larger than the first build so it reads in a video frame.
- Confirmation toast position: white text floating above the verdict pill at X = 0, Y = +55 cm, Z = -200 cm (100 cm above the floor, above the central band). The preview frame ends just under the dock buttons and the floor rail fills the space above them, so any toast placed in the dock area is clipped or overlaps the rail.

## Hands and input
- Button 1 [Profile: 85cm]: pinch to cycle three profiles: Standard Chair (85 cm), Power / Stroller (95 cm), Indoor Compact (75 cm), then back to 85 cm. It resizes the floor gate in real time (85, 95, 75 cm) and recalculates the verdict against the current gap. The button label updates.
- Button 2 [Test Gap: 102cm]: pinch to cycle the posts through four test gaps: 102 cm (Doorway), 88 cm (Bollard Pair), 72 cm (Scooter Block), 80 cm (Narrow Hall). It updates the live gap measurement. The left and right posts can also be pinch-dragged directly in Interactive Preview.
- Button 3 [Pin Verdict]: pinch to drop a persistent compact world-anchored marker at the floor gate, increment the session audit counter ("Pinned: 1") and show a 1-line confirmation toast that auto-hides after 3.0 seconds.
- Targets are big and highlight when aimed at.
- Voice (if any) and the button that does the same job: no voice.

## Key spec
Verdict rule (a deterministic geometry check). Let W = required profile width (75, 85 or 95 cm) and G = measured obstacle gap in cm.

| Verdict | Rule | Color |
|---|---|---|
| PASS | G >= W + 10 cm (at least 5 cm buffer on each side) | Emerald Green `#10B981` |
| TIGHT | W <= G < W + 10 cm (fits, but less than 5 cm per side: proceed slowly) | Amber `#F59E0B` |
| BLOCKED | G < W (narrower than the mobility aid: stop and reroute) | Coral Red `#EF4444` |

- The floor corridor, the arch and the verdict pill all take the verdict color.
- Verdict pill: at most 3 words, for example "PASS +17 cm", "TIGHT +3 cm" or "BLOCKED -13 cm". The margin shown is G minus W. The gap itself is shown by the dimension line label.
- Confirmation toast (Button 3): 1 line, auto-hides after 3.0 seconds (DelayedCallbackEvent).
- Profile by gap cross-matrix at G = 80 cm: 75 cm is TIGHT (+5 cm), 85 cm is BLOCKED (-5 cm), 95 cm is BLOCKED (-15 cm).

## When things show
- Default state shows only the 1:1 floor gate with its dimension line and gap label, the verdict pill and the 3 large pinch buttons.
- Verdict pill and gate color: always on, updated the moment the profile or the gap changes.
- Confirmation toast: shows when Button 3 is pinched, hides after 3.0 seconds so text never lingers.
- Pinned marker badge: stays after it is dropped.
- If something needs attention out of view: none.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Criterion 1 (Initial setup and clear FOV): On Lens start, the 1:1 floor gate sits at Z = -2.0 m, Y = -0.45 m with the 85 cm Standard profile and a 102 cm gap (PASS, green), and the central eye level (Y = 0) has no blocking UI panels.
2. Criterion 2 (1:1 profile scaling): Triggering Button 1 (Profile) cycles 85 cm -> 95 cm -> 75 cm -> 85 cm and updates the world-space width of the inner clearance frame (0.85 m, 0.95 m, 0.75 m) and the button label.
3. Criterion 3 (3-state verdict transitions): Under the 85 cm profile, triggering Button 2 (Test Gap) steps through 102 cm (PASS / Green), 88 cm (TIGHT / Amber) and 72 cm (BLOCKED / Red), updating the post separation, the gate color and the 3D verdict text.
4. Criterion 4 (Profile by gap cross-validation): At the 80 cm gap (Narrow Hall), switching profiles evaluates 75 cm as TIGHT (+5 cm margin) and both 85 cm and 95 cm as BLOCKED (-5 cm and -15 cm).
5. Criterion 5 (Pinning and auto-hide toast): Triggering Button 3 (Pin Verdict) increments the pinned counter ("Pinned: 1"), updates the spatial marker badge, and shows a confirmation toast that automatically hides after 3.0 seconds.

## Out of scope
- Measuring real gaps: no depth sensing, camera vision or object recognition. Gaps are hard-coded or dragged by hand.
- Voice control, custom gestures, saving pins between sessions, and sharing with other people.
- Any compliance certification (ADA or otherwise): the verdict is a guide only.

## Risks and open questions
- Interview answer 6.4 said the 80 cm gap is PASS under the 75 cm profile, but the learner's own rule (PASS needs G >= W + 10) makes it TIGHT (+5 cm); this brief uses TIGHT, as in the key spec.
- Floor placement versus the narrow view: the gate (Y = -45 cm at 200 cm, about 13 degrees below eye level) and the dock (Y = -30 cm at 110 cm, about 16 degrees below) sit in the lower part of the view when looking straight ahead. In the preview the lens frame ends about 22 degrees below eye level, so there is only a thin band under the gate's near edge; the dock was sized and placed to fit exactly in it. This depends on the real camera height, which only real glasses can confirm ("feel unproven").
- The learner's central-clear band is given two ways (Y = 0 in the interview, Y = -15 cm to +30 cm in the key spec); both are kept clear.
- The frame width is ambiguous: Criterion 2 says the frame width equals the profile (85, 95, 75 cm), while the layout adds two 5 cm buffer strips. Build the frame at exactly the profile width and draw the strips as separate side strips.
- The dock at 110 cm is near the glasses' roughly 100 cm focus plane; the gate at 200 cm is farther, so focus differs slightly between them on real glasses (feel unproven).
- The 55 cm posts rise to Y = +10 cm, so they cross eye level (Y = 0) and the central clear band. They are thin neutral posts that mark a real obstacle, not UI panels; the verdict pill and the labels stay out of the band.
- Preview environment: Preview 1 stays on "Plane". The bundled rooms (Sunlit Room, Evening Room, Colorful Home) put furniture (a sideboard and framed art, or a table and chairs) at the gate position and have no clear floor, doorway or corridor in view of the default camera, so the gate would sit inside furniture and the money shot would be unreadable. Evening Room is also dark. Plane gives a clean floor grid. Preview camera pose used: default, position (0, 0, 0), rotation (0, 0, 0), no wheelchair-height offset needed because the floor is placed at Y = -45 cm relative to the camera.
- "1:1 real size" cannot be checked against real objects in the preview; it can only be checked as scene sizes in cm.
- The button 2 and 3 names differ between the interview ("Cycle Gap / Measure", "Pin Spot") and the key spec ("Test Gap", "Pin Verdict"); the key spec names are used.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task. Final layout: gate at Z = -200 cm, Y = -45 cm; dock at Z = -110 cm, Y = -30.5 cm; Preview 1 on Plane with the default camera pose.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
