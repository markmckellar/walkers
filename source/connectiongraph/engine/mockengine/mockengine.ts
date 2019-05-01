import { WorldEngine } from "../worldengine";
import { Drawable } from "../../display/drawable";
import { WorldId } from "../../world/worldid";
import { WorldPosition } from "../../world/worldposition";
import { CircleEngineShape } from "../shapes/circleengineshape";
import { RectangleEngineShape } from "../shapes/rectangleengineshape";
import { MockCircle } from "./shapes/mockcircle";
import { MockRectangle } from "./shapes/mockrectangle";
import { MockPolygon } from "./shapes/mockpolygon";
import { PolygonEngineShape } from "../shapes/polygonengineshape";
import { CanvasMouse } from "../../display/canvas/canvasmouse";
import { MouseEventHandler } from "../../display/canvas/mouseeventhandler";
import { World } from "../../world/world";
import { CircleDisplayShape } from "../../display/drawableshapes/circledisplayshape";
import { EngineShape } from "../shapes/engineshape";
import { TextDisplayShape } from "../../display/drawableshapes/textdisplayshape";
import { TextEngineShape } from "../shapes/textengineshape";
import { MockRectangleText } from "./shapes/mockrectangletext";
import { DrawableConnector } from "../../display/drawableshapes/drawableconnector";
import { EngineConnectorDef } from "../connectors/engineconnectordef";
import { EngineConnector } from "../connectors/engineconnector";
import { MockConnectorDef } from "./shapes/mockconnectordef";
import { MockConnector } from "./shapes/mockconnector";

export class MockEngine implements WorldEngine {
  private _mouseAnchor: MockCircle;
  private _connectorArray:Array<MockConnector>;
  private intervalId:any;
  public constructor() {
    this.mouseAnchor = new MockCircle(
      new WorldId("mouseAnchor"),
      new CircleDisplayShape(),
      5,
      8,
      new WorldPosition(-10,-10),
      { restitution: 0.9, isSensor: true },
      this
    );
    this.connectorArray = new Array<MockConnector>();
  }
  public getMouseAnchor(): EngineShape {
    return this.mouseAnchor;
  }

  public createBounds(width:number,height:number,options:any):void {
  }

  public stopEngine():void {
    console.log("clearing for:"+this.intervalId);
    clearInterval(this.intervalId);
  }

  public startEngine():void {
    let self = this;

    self.intervalId = setInterval(
      function() {
        for(let i=0;i<self.connectorArray.length;i++)
        {
          let connector = self.connectorArray[i];
          for(let j=0;j<connector.getEngineConnectorDefArray().length;j++)
          {
            let connectorDef = connector.getEngineConnectorDefArray()[j];
            connectorDef.connectorPositioner.positionConnectorShape(connector,connectorDef);
          }
        }
      },
      1000/30);
  }

  public createCircle(
    worldId: WorldId,
    drawable: Drawable,
    radius: number,
    numberOfSides: number,
    worldPosition: WorldPosition,
    options: any
  ): CircleEngineShape {
    let circle: MockCircle = new MockCircle(
      worldId,
      drawable,
      radius,
      numberOfSides,
      worldPosition,
      options,
      this
    );
    return circle;
  }

  public createRectangle(
    worldId: WorldId,
    drawable: Drawable,
    width: number,
    height: number,
    worldPosition: WorldPosition,
    options: any
  ): RectangleEngineShape {
    let rectangle: MockRectangle = new MockRectangle(
      worldId,
      drawable,
      width,
      height,
      worldPosition,
      options,
      this
    );
    return rectangle;
  }

  public createConnector(worldId:WorldId,drawableConnector:DrawableConnector,connectorShape:EngineShape,
    engineConnectorDefArray:Array<EngineConnectorDef>,
    options:any):EngineConnector {

      let mockConnectorDefArrayDef:Array<MockConnectorDef> = new Array<MockConnectorDef>();
      
      for(let i=0;i<engineConnectorDefArray.length;i++) 
        mockConnectorDefArrayDef.push(new MockConnectorDef(this,engineConnectorDefArray[i]));
      
      let connector = new MockConnector(
        worldId,
        drawableConnector,
        connectorShape,
        mockConnectorDefArrayDef,
        options,
        this);
        this.connectorArray.push(connector);
    return(connector);
  }

  public createTextBox(worldId:WorldId,textDisplayShape:TextDisplayShape,width:number,height:number,worldPosition:WorldPosition,options:any):TextEngineShape {
  //createTextBox(worldId:WorldId,textDisplayShape:TextDisplayShape,width:number,height:number,worldPosition:WorldPosition,options:any):RectangleEngineShape {
    let rectangleText:MockRectangleText = new MockRectangleText (
      worldId,
      textDisplayShape,
      width,height,worldPosition,
      options,
      this
    );
    return(rectangleText);
  }

  public createPolygon(
    worldId: WorldId,
    drawable: Drawable,
    numberOfSides: number,
    radius: number,
    worldPosition: WorldPosition,
    options: any
  ): PolygonEngineShape {
    let ploygon: PolygonEngineShape = new MockPolygon(
      worldId,
      drawable,
      numberOfSides,
      radius,
      worldPosition,
      options,
      this
    );
    return ploygon;
  }

  public pointerDownEngineEvent(
    world: World,
    canvasMouse: CanvasMouse,
    event: MouseEvent,
    mouseEventHandler: MouseEventHandler
  ): void {}

  public pointerMoveEngineEvent(
    world: World,
    canvasMouse: CanvasMouse,
    event: MouseEvent,
    mouseEventHandler: MouseEventHandler
  ): void {
    var newPosition = new WorldPosition(
      event.x - canvasMouse.offset.x,
      event.y - canvasMouse.offset.y
    );
    this.mouseAnchor.translate(newPosition);

    if (mouseEventHandler.getCurrentWorldObject() != null) {
      var deltaPosition = mouseEventHandler
        .getMouseStatus()
        .startPosition.getDelta(mouseEventHandler.getMouseStatus().position);

      let newX =
        mouseEventHandler.getMouseStatus().startPosition.x -
        deltaPosition.x +
        mouseEventHandler.getMouseStatus().clickOffset.x;

      let newY =
        mouseEventHandler.getMouseStatus().startPosition.y -
        deltaPosition.y +
        mouseEventHandler.getMouseStatus().clickOffset.y;

      mouseEventHandler
        .getCurrentWorldObject()
        .setWorldPosition(new WorldPosition(newX, newY));
    }
  }

  public pointerUpEngineEvent(
    world: World,
    canvasMouse: CanvasMouse,
    event: MouseEvent,
    mouseEventHandler: MouseEventHandler
  ): void {}

  public get mouseAnchor(): MockCircle {
    return this._mouseAnchor;
  }

  public set mouseAnchor(value: MockCircle) {
    this._mouseAnchor = value;
  }


    /**
     * Getter connectorArray
     * @return {Array<MockConnector>}
     */
	public get connectorArray(): Array<MockConnector> {
		return this._connectorArray;
	}

    /**
     * Setter connectorArray
     * @param {Array<MockConnector>} value
     */
	public set connectorArray(value: Array<MockConnector>) {
		this._connectorArray = value;
	}


}