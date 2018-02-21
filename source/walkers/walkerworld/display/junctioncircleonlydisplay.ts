import { WorldPosition } from "../../../world/worldposition";
//import { WorldObject } from "../../world/worldobject";
import { WalkerWorld } from "../../walkerworld/walkerworld";
import { WorldObjectDisplay } from "../../../display/worldobjectdisplay";
import { JunctionOneCircle } from "../../engine/engineobjects/junctiononecircle";
//import { Junction } from "../../walkerworld/junction";
import { CircleDisplayShape } from "../../../display/shapes/circledisplayshape";





//import { JunctionOneCircle } from "../../walkerworld/di";


export class JunctionCircleOnlyDisplay implements WorldObjectDisplay{

    private _junctionOneCircle:JunctionOneCircle;
    private _junctionDisplayCircle:CircleDisplayShape;

    constructor(junctionOneCircle:JunctionOneCircle) {
        //super(worldPosition);
        this.junctionOneCircle = junctionOneCircle;

        this.junctionDisplayCircle = new CircleDisplayShape( this.junctionOneCircle.getCircle() );
        //this.junctionBody = walkerWorld.walkerEngine.getJunctionOneCircle;
        //new JunctionOneCircle(junction.worldId,worldPosition,walkerWorld);

    }


    public drawObject(walkerWorld:WalkerWorld,context:CanvasRenderingContext2D):void{   

        this.junctionDisplayCircle.drawShape(walkerWorld,context);//.drawObject(this,walkerWorld,context);
    }

    
	public get junctionOneCircle(): JunctionOneCircle {
		return this._junctionOneCircle;
	}

	public set junctionOneCircle(value: JunctionOneCircle) {
		this._junctionOneCircle = value;
	}


	public get junctionDisplayCircle(): CircleDisplayShape {
		return this._junctionDisplayCircle;
	}

	public set junctionDisplayCircle(value: CircleDisplayShape) {
		this._junctionDisplayCircle = value;
	}

}