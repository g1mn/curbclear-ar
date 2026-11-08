import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {CurbClearC1Scenario} from "./CurbClearC1Scenario"
import {CurbClearC2Scenario} from "./CurbClearC2Scenario"
import {CurbClearC3Scenario} from "./CurbClearC3Scenario"
import {CurbClearC4Scenario} from "./CurbClearC4Scenario"
import {CurbClearC5Scenario} from "./CurbClearC5Scenario"
import {CurbClearIKScenario} from "./CurbClearIKScenario"

@component
export class LeafIndex extends BaseScriptComponent {
  // Order matters: C1 asserts the untouched start state, so it runs first. C5 pins last-ish (pins persist).
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "curbclear-c1-initial-state", typename: CurbClearC1Scenario.getTypeName()},
    {id: "curbclear-c2-profile-cycle", typename: CurbClearC2Scenario.getTypeName()},
    {id: "curbclear-c3-gap-cycle", typename: CurbClearC3Scenario.getTypeName()},
    {id: "curbclear-c4-cross-check", typename: CurbClearC4Scenario.getTypeName()},
    {id: "curbclear-c5-pin-verdict", typename: CurbClearC5Scenario.getTypeName()},
    {id: "curbclear-ik-reachability", typename: CurbClearIKScenario.getTypeName()},
  ]
}
