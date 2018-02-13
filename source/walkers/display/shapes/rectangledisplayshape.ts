import { WorldShape } from "../shapes/worldshape";
import { WorldPosition } from "../../world/worldposition";
import { WalkerWorld } from "../../walkerworld/walkerworld";
import { WorldObjectDisplay } from "../worldobjectdisplay";


export class RectangleDisplayShape extends WorldShape
{
	constructor(shapeName:string,width:number,height:number,offsetFromOrigin: WorldPosition)
	{
		super(
			shapeName,			
			RectangleDisplayShape.getRectanglePositionList(width,height),
			offsetFromOrigin
		);
		
	}

	public static getRectanglePositionList(width:number,height:number):Array<WorldPosition> {
		let pointList = new Array<WorldPosition>();
		
		pointList.push(new WorldPosition(-(width/2),-(height/2)));
		pointList.push(new WorldPosition((width/2),-(height/2)));
		pointList.push(new WorldPosition((width/2),(height/2)));
		pointList.push(new WorldPosition(-(width/2),(height/2)));	
		pointList.push(new WorldPosition(-(width/2),-(height/2)));
	
		return(pointList);;
	}
	

	
	public drawShape(worldObjectDisplay:WorldObjectDisplay,walkerWorld:WalkerWorld,context:CanvasRenderingContext2D,):void
	{
		//super.drawNode(canvasHolder,node);
		//this.shape.drawShape(canvasHolder,node,this.displayInfo);
	}
}