import { WorldShape } from "./shapes/worldshape";
import { WalkerWorld } from "../walkerworld/walkerworld";
import { WorldObjectDisplay } from "./worldobjectdisplay";
import { CircleDisplayShape } from "./shapes/circledisplayshape";
import { WorldPosition } from "../world/worldposition";
import { WorldObject } from "../world/worldobject";






export class WorldObjectDisplayFactory {
   // private _shapePoints:Array<WorldShape>;  
    
    public constructor() {
    }

    public static getWorldObjectDisplay(someKinaTag:string):WorldObjectDisplay {

        someKinaTag = "junction";
        /*
        let options:Object =
            {
                shapes:
                [
                    {
                        worldObjectShape:function(){new CircleDisplayShape("default",40,8,new WorldPosition(0,0))},
                        fgcolor:"ff0000ff",
                        bgcolor:"0000ffff",
                        lineWidth:4,
                    },
                    {
                        worldObjectShape:function(){new CircleDisplayShape("junctionCircle",40,8,new WorldPosition(0,0))},
                        fgcolor:"ff0000ff",
                        bgcolor:"0000ffff",
                        lineWidth:4,
                    },
                ],
            };
        */
        // constructor(position:WorldPosition,shapes:Map<string,WorldShape>) {
        // public abstract drawObject(worldObjectDisplay:WorldObjectDisplay,world:World):void;

        let shapes:Map<string,WorldShape> = new Map<string,WorldShape>();
        shapes.set("junctionBody",new CircleDisplayShape("junctionBody",40,8,new WorldPosition(0,0)));

        let wod:WorldObjectDisplay = 
        new(class extends WorldObjectDisplay {
            public drawObject(walkerWorld:WalkerWorld,worldObject:WorldObject,context:CanvasRenderingContext2D):void{                
                }
            } )(new WorldPosition(0,0),shapes);

        return(wod);

    }
}