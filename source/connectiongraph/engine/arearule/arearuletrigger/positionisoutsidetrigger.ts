import { AreaRuleTrigger } from "./arearuletrigger";
import { EngineShape } from "../../shapes/engineshape";
import { AreaRuleObject } from "../arearuleobject/arearuleobject";

export class PostionIsOutsideTrigger implements AreaRuleTrigger  {
    public fireRuleTrigger(areaRuleObject:AreaRuleObject,shape:EngineShape):boolean {
        return(!areaRuleObject.areaEngineShape.containsWorldPosition(shape.getWorldPosition()));
    }

}