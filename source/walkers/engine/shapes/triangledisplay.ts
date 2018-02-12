import { WorldShape } from "../shapes/worldshape";
import { WorldPosition } from "../../walkerworld/worldposition";
import { World } from "../../walkerworld/world";
import { WorldObjectDisplay } from "../worldobjectdisplay";


export class TriangleDisplay extends WorldShape
{
	constructor(shapeName:string,width:number,height:number,offsetFromOrigin: WorldPosition)
	{
		super(
			shapeName,			
			TriangleDisplay.getTrianglePositionList(width,height),
			offsetFromOrigin
		);
		
	}
	
	public static getTrianglePositionList(width:number,height:number):Array<WorldPosition> {
		let pointList = new Array<WorldPosition>();
		
		pointList.push(new WorldPosition(0,-(height/2)));
		pointList.push(new WorldPosition(width/2,height/2));
		pointList.push(new WorldPosition(-(width/2),height/2));
		pointList.push(new WorldPosition(0,-(height/2)));
		
		return(pointList);;
	}
	
	
	public drawShape(worldObjectDisplay:WorldObjectDisplay,world:World,context:CanvasRenderingContext2D,):void
	{
		//super.drawNode(canvasHolder,node);
		//this.shape.drawShape(canvasHolder,node,this.displayInfo);
	}
}
