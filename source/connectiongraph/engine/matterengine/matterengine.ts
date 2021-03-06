import { MatterTools } from "./mattertools";
import { MatterEvent } from "./events/matterevent";
import { MatterCollisionEvent } from "./events/mattercollisionevent";
import { MatterCompositeEvent } from "./events/mattercompositeevent";
import { MatterTimestampedEvent } from "./events/mattertimestampedevent";
import * as Matter from "matter-js";
import { WorldEngine } from "../worldengine";
import { WorldId } from "../../world/worldid";
import { World } from "../../world/world";
import { MatterCircle } from "./shapes/mattercircle";
import { MatterRectangle } from "./shapes/matterrectangle";
import { WorldPosition } from "../../world/worldposition";
import { CircleEngineShape } from "../shapes/circleengineshape";
import { Drawable } from "../../display/drawable";
import { RectangleEngineShape } from "../shapes/rectangleengineshape";
import { MatterPolygon } from "./shapes/matterpolygon";
import { PolygonEngineShape } from "../shapes/polygonengineshape";
import { CanvasMouse } from "../../display/canvas/canvasmouse";
import { MouseEventHandler } from "../../display/canvas/mouseeventhandler";
import { MatterShape } from "./shapes/mattershape";
import { EngineShape } from "../shapes/engineshape";
import { TextDisplayShape } from "../../display/drawableshapes/textdisplayshape";
import { TextEngineShape } from "../shapes/textengineshape";
import { MatterRectangleText } from "./shapes/matterrectangletext";
import { DrawableConnector } from "../../display/drawableshapes/drawableconnector";
import { EngineConnectorDef } from "../connectors/engineconnectordef";
import { EngineConnector } from "../connectors/engineconnector";
import { MatterConnector } from "./shapes/matterconnector";
import { MatterConnectorDef } from "./shapes/matterconnectordef";
import { WorldEngineParams } from "../worldengineparams";
import { WorldEngineBase } from "../worldenginebase";
import { EngineShapeBase } from "../shapes/engineshapebase";

export  class MatterEngine extends WorldEngineBase implements WorldEngine {
    private _matterTools:MatterTools ;
    private _matterShapes : Map<WorldId,MatterShape>;
    private _collisionEventHandlers : Map<string,MatterCollisionEvent>;
    private _compositeEventHandlers : Map<string,MatterCompositeEvent>;
    private _timestampEventHandlers : Map<string,MatterTimestampedEvent>;
    private matterBodyId2WorldIdMap : Map<number,MatterShape>;
    private _matterMouseConstraint:Matter.Constraint;
    private _engine : Matter.Engine;
    private _mouseAnchor:MatterCircle;
    //private connectorArray:Array<MatterConnector>;


    public static boundsFilter:number = 1;//0x0001;
    
    public constructor(worldEngineParams:WorldEngineParams) {
      super(worldEngineParams);
      let tempMatter:any = Matter;
      tempMatter.Detector.canCollide = EngineShapeBase.checkCollissionTags;

      tempMatter.Detector.canCollidexx = function (filterA:any, filterB:any) {
        let collides =  EngineShapeBase.checkCollissionTags(filterA,filterB);
        /*var collides =
            (filterB.collidesWith.includes(filterA.group) || filterB.group == 0) 
            &&                 
            (filterA.collidesWith.includes(filterB.group) || filterA.group == 0)
         ;
        let statusText =//.innerHTML = 
          //"b="+filterB.groupN+
          //":a="+filterA.groupN+
          ":b="+JSON.stringify(filterB.collidesWithN)+
          ":a="+filterA.collidesWithN.length+
          ":cnew="+cnew+
          ":collides="+collides+" "+JSON.stringify(filterA); 
          */
        return(collides);
      }

        this.matterTools = new MatterTools();
        this.collisionEventHandlers = new Map<string,MatterCollisionEvent>(); 
        this.compositeEventHandlers = new Map<string,MatterCompositeEvent>();
        this.timestampEventHandlers = new Map<string,MatterTimestampedEvent>();
        this.matterShapes = new Map<WorldId,MatterShape>();
        this.matterBodyId2WorldIdMap = new Map<number,MatterShape>();
        //this.connectorArray = new Array<MatterConnector>();

        this.engine = Matter.Engine.create(); 

        if(this.worldEngineParams.updateInterval>500)
        {
          this.engine.timing.timeScale = 400 / this.worldEngineParams.updateInterval;
        }
        
        this.engine.world.gravity.x = 0.0;
        //this.engine.world.gravity.y = 1.0;
        this.engine.world.gravity.y = 0.0;

        this.mouseAnchor = new MatterCircle(
          new WorldId("mouseAnchor"),
          worldEngineParams.mouseDrawableShape,
          5,8,          
          new WorldPosition(-10,-10),
          {restitution:0.9,isSensor:true},
          this
        );

        
        Matter.Body.setStatic(this.mouseAnchor.getBody(),true);
        this.matterMouseConstraint = Matter.Constraint.create({
          label: 'Mouse Constraint', 
          bodyA:this.mouseAnchor.getBody(),      
          bodyB:this.mouseAnchor.getBody(),      
          pointA: { x: -0, y: -0. },
          pointB: { x: -0, y: -0. },
          length:0.1,
          stiffness: 0.1,
        });


        Matter.World.addConstraint(this.engine.world, this.matterMouseConstraint)
        

        this.enableEvents();

    }

    public stopEngine():void {
      super.stopEngine();
      Matter.Engine.clear(this.engine);
    }

    public startEngine():void {
      super.startEngine();
      Matter.Engine.run(this.engine);
    }

    public updateFunction()  {      
    }

    public getMouseAnchor():EngineShape {
      return(this.mouseAnchor);
    }

    public addMatterShape(matterShape:MatterShape):void {
      this.matterShapes.set(matterShape.worldId,matterShape);
      Matter.World.add(this.engine.world,[matterShape.getBody()]);
      this.matterBodyId2WorldIdMap.set(matterShape.getBody().id,matterShape);
      
    }

    public addMatterConnector(matterConnector:MatterConnector):void {
      this.addMatterShape(matterConnector);
      //Matter.World.add(this.engine.world,[matterConnector.getBody()]);

      for(let i=0;i<matterConnector.matterConnectorDefArray.length;i++) {
        let connectorDef:MatterConnectorDef = matterConnector.matterConnectorDefArray[i];
        //Matter.World.add(this.engine.world,[connectorDef.matterConstraint]);
        Matter.World.addConstraint(this.engine.world, connectorDef.matterConstraint)

      }

      
    }

    public updateMouseConstraint(world:World,canvasMouse:CanvasMouse,event:MouseEvent,mouseEventHandler:MouseEventHandler):void {
      var newPosition = new WorldPosition(event.x- canvasMouse.offset.x,event.y- canvasMouse.offset.y);
      this.mouseAnchor.translate(newPosition);

      if(mouseEventHandler.getCurrentWorldObject()!=null && this.matterMouseConstraint.bodyB==null)
      {
        //console.log("updateMouseConstraint:getCurrentWorldObject="+mouseEventHandler.getCurrentWorldObject().getWorldId().id+
//          ":Ax="+this.matterMouseConstraint.pointA.x+":Ay="+this.matterMouseConstraint.pointA.y);
        
        if(this.matterShapes.has(mouseEventHandler.getCurrentWorldObject().getWorldId()) )
        {
          let matterShape:MatterShape = this.matterShapes.get(mouseEventHandler.getCurrentWorldObject().getWorldId());
          let bodyB =  matterShape.getBody();
          this.matterMouseConstraint.bodyB = bodyB;
          // TODO do we really want this in the middle?  Should it be where thye grabbed it?!?!
          this.matterMouseConstraint.pointB = { x:0,y:0 };

          //console.log("-----updateMouseConstraint:getCurrentWorldObject="+mouseEventHandler.getCurrentWorldObject().getWorldId().id+
          //":Ax="+this.matterMouseConstraint.pointA.x+":Ay="+this.matterMouseConstraint.pointA.y+
//            "");
          //console.log("-xx-------------:bodyB="+bodyB+":bodyB.position="+JSON.stringify(bodyB.position)+
//            ":MSx="+matterShape.getWorldPosition().x+":MSy="+matterShape.getWorldPosition().y);

        }
      }
      else if(mouseEventHandler.getCurrentWorldObject()==null)
      {
        this.matterMouseConstraint.bodyB = null        
        this.matterMouseConstraint.pointB = null;   
      }
    }

    public pointerDownEngineEvent(world:World,canvasMouse:CanvasMouse,event:MouseEvent,mouseEventHandler:MouseEventHandler):void {
      this.updateMouseConstraint(world,canvasMouse,event,mouseEventHandler);
      
    }

    public pointerMoveEngineEvent(world:World,canvasMouse:CanvasMouse,event:MouseEvent,mouseEventHandler:MouseEventHandler):void {
      this.updateMouseConstraint(world,canvasMouse,event,mouseEventHandler);
    }

    public pointerUpEngineEvent(world:World,canvasMouse:CanvasMouse,event:MouseEvent,mouseEventHandler:MouseEventHandler):void {
      this.updateMouseConstraint(world,canvasMouse,event,mouseEventHandler);
      
    }

    public createCircle(worldId:WorldId,drawable:Drawable,radius:number,numberOfSides:number,worldPosition:WorldPosition,options:any):CircleEngineShape {
      let circle:MatterCircle = new MatterCircle(
        worldId,
        drawable,
        radius,numberOfSides,worldPosition,
        {restitution:0.9},
        this
      );
      return(circle);
    }

    public createConnector(worldId:WorldId,drawableConnector:DrawableConnector,connectorShape:EngineShape,
      engineConnectorDefArray:Array<EngineConnectorDef>,
      options:any):EngineConnector {
        let matterConnectorDefArray:Array<MatterConnectorDef> = new Array<MatterConnectorDef>();
        for(let i=0;i<engineConnectorDefArray.length;i++) 
          matterConnectorDefArray.push(new MatterConnectorDef(this,engineConnectorDefArray[i]));
        
        let connector = new MatterConnector(
          worldId,
          drawableConnector,
          connectorShape,
          matterConnectorDefArray,
          options,
          this);
      this.connectorArray.push(connector);
      return(connector);
    }


    public createRectangle(worldId:WorldId,drawable:Drawable,width:number,height:number,worldPosition:WorldPosition,options:any):RectangleEngineShape {
      let rectangle:MatterRectangle = new MatterRectangle (
        worldId,
        drawable,
        width,height,worldPosition,
        options,
        this
      );
      return(rectangle);
    }

    public createTextBox(worldId:WorldId,textDisplayShape:TextDisplayShape,width:number,height:number,worldPosition:WorldPosition,options:any):TextEngineShape {
      let rectangleText:MatterRectangleText = new MatterRectangleText (
        worldId,
        textDisplayShape,
        width,height,worldPosition,
        options,
        this
      );
      //Matter.Body.setInertia(rectangle.getBody(),Infinity);
      //Matter.Body.setStatic(rectangle.getBody(),true);

      //rectangle.getBody().inertia = Infinity;
      return(rectangleText);
    }


    public createPolygon(worldId:WorldId,drawable:Drawable,numberOfSides:number,radius:number,worldPosition:WorldPosition,options:any):PolygonEngineShape {
      let ploygon:PolygonEngineShape = new MatterPolygon(
        worldId,
        drawable,
        numberOfSides,
        radius,
        worldPosition,
        options,
        this); 
      return(ploygon);
    }   


    
    public getCollisionFilterWorldStructure() {
      let collisionFilter = {
        collisionTags:[this.getWorldStructureCollisionTag()],
        group:1,
        collidesWith:[-1]
      };
      return(collisionFilter);
    }

    public createBounds(width:number,height:number,options:any):void {
      options['collisionFilter'] = this.getCollisionFilterWorldStructure();
      let wallBoundsRect = Matter.Bodies.rectangle(width/2,height/2,width,height,options);
      let walls:Matter.Body = MatterTools.createBoundObject(wallBoundsRect,1,10,options);
      //walls.collisionFilter.category = MatterEngine.boundsFilter;
      walls.restitution = 1.0;
      Matter.Body.setStatic(walls,true);
      Matter.World.add(this.engine.world, [walls]);
    }

    private geTimestampedEventMapId(name:string,eventType:MatterEvent):string {
      return(name+":"+eventType);
    }

    private getCompositeEventMapId(name:string,eventType:MatterEvent):string {
      return(name+":"+eventType);
    }

    public registerCompositeEvent(name:string,eventType:MatterEvent,event:MatterCompositeEvent):void {
      this.compositeEventHandlers.set(this.getCompositeEventMapId(name,eventType),event);    
      console.log("MatterEngine:registerCompositeEvent:.keys.length="+this.compositeEventHandlers.keys.length);
    }

    public deregisterCompositeEvent(name:string,eventType:MatterEvent,event:MatterCompositeEvent):void {
      this.compositeEventHandlers.delete(this.getCompositeEventMapId(name,eventType));    
    }


    public registerTimestampedEvent(name:string,eventType:MatterEvent,event:MatterTimestampedEvent):void {
      this.timestampEventHandlers.set(this.geTimestampedEventMapId(name,eventType),event);    
      console.log("MatterEngine:registerTimestampedEvent:.keys.length="+this.timestampEventHandlers.keys.length);
    }

    public deregisterTimestampedEvent(name:string,eventType:MatterEvent,event:MatterTimestampedEvent):void {
      this.timestampEventHandlers.delete(this.geTimestampedEventMapId(name,eventType));    
    }

    private getCollisionEventMapId(body:Matter.Body,eventType:MatterEvent):string {
      return(body.id+":"+eventType);
    }

    public registerCollisionEvent(body:Matter.Body,eventType:MatterEvent,event:MatterCollisionEvent):void {
      this.collisionEventHandlers.set(this.getCollisionEventMapId(body,eventType),event);    
    }

    public deregisterCollisionEvent(body:Matter.Body,eventType:MatterEvent,event:MatterCollisionEvent):void {
      this.collisionEventHandlers.delete(this.getCollisionEventMapId(body,eventType));    
    }

    public hasCollisionHandler(body:Matter.Body,eventType:MatterEvent):boolean {
      return(this.collisionEventHandlers.has(this.getCollisionEventMapId(body,eventType)))
    }

    public getCollisionHandler(body:Matter.Body,eventType:MatterEvent):MatterCollisionEvent {
      return( this.collisionEventHandlers.get(this.getCollisionEventMapId(body,eventType)) );
    }

    public initRendererEvents(render:Matter.Render):void {
      let me:MatterEngine = this;

      Matter.Events.on(render,MatterEvent.beforeRender,
        function(event:Matter.IEventTimestamped<Matter.Engine>)
        { me.processTimestampedEvent(MatterEvent.beforeRender,event) } );    

      Matter.Events.on(render,MatterEvent.afterRender,
        function(event:Matter.IEventTimestamped<Matter.Engine>)
        { me.processTimestampedEvent(MatterEvent.afterRender,event) } );   
    }
  
    public disableEvents(matterEngine:MatterEngine):void {
      // TODO what does the function passed to deregistger an event even mean?!?!?
      Matter.Events.off(this,MatterEvent.beforeUpdate,function(event) {});
      Matter.Events.off(this,MatterEvent.collisionActive,function(event) {});	
      Matter.Events.off(this,MatterEvent.collisionEnd,function(event) {});		
      Matter.Events.off(this,MatterEvent.collisionStart,function(event) {});		      
    }

    private processCollisionPairsEvent(eventType:MatterEvent,event: Matter.IEventCollision<Matter.Engine>):void {
      var pairs:Matter.IPair[] = event.pairs;
      for(let i=0;i<pairs.length;i++){
        // TODO this is the collision loop...  we can probably drop from 4 hash lookps to 2
        if(this.hasCollisionHandler(pairs[i].bodyA,eventType))
          this.getCollisionHandler(pairs[i].bodyA,eventType)(this,eventType,event);

        if(this.hasCollisionHandler(pairs[i].bodyB,eventType))
          this.getCollisionHandler(pairs[i].bodyB,eventType)(this,eventType,event);
/*
        let shapeA = this.matterBodyId2WorldIdMap.get(pairs[i].bodyA.id);
        let shapeB = this.matterBodyId2WorldIdMap.get(pairs[i].bodyB.id);
        if(shapeA && shapeB) 
          if(shapeA.checkCollissionTags(shapeB))
          {
              console.log(shapeA.getWorldId().id+" and "+shapeB.getWorldId().id+" hit");
          }
  */      
      }
    }

    private processTimestampedEvent(eventType:MatterEvent,event:Matter.IEventTimestamped<Matter.Engine>):void  {      
      //console.log("MatterEngine:processTimestampedEvent:keys.length="+ Array.from(  this.timestampEventHandlers.keys() ).length);

      let keys = Array.from(  this.timestampEventHandlers.keys() );
      //console.log("MatterEngine:processTimestampedEvent:keys.length="+keys.length);
      for(let i=0;i<keys.length;i++ ){
        let name:string = keys[i];
        //console.log("-----MasterEngine:processTimestampedEvent:looking at:name="+name);
        
        if(name.endsWith(eventType)) {
          //console.log("----------MatterEngine:processTimestampedEvent:has:name="+name);
          let handler:MatterTimestampedEvent =  this.timestampEventHandlers.get(name);
          handler(this,eventType,event);
        }          
      }
    }
  
    private processCompositeEvent(eventType:MatterEvent,event: Matter.IEventComposite<Matter.Composite>):void  {  


      let keys = Array.from(  this.compositeEventHandlers.keys() );
      //console.log("MatterEngine:processCompositeEvent:yes.length="+keys.length);
      for(let i=0;i<keys.length;i++ ){
        let name:string = keys[i];
        //console.log("-----MasterEngine:processCompositeEvent:looking at:name="+name);
        
        if(name.endsWith(eventType)) {
          //console.log("----------MatterEngine:processCompositeEvent:has:name="+name);
          let handler:MatterCompositeEvent =  this.compositeEventHandlers.get(name);
          handler(this,eventType,event);
        }          
      }
    
      }
  
    public enableEvents():void {
      console.log("World:event:enableEvents")
      let me:MatterEngine = this;

      Matter.Events.on(this.engine,MatterEvent.collisionStart,
        function(event:Matter.IEventCollision<Matter.Engine>)
        { me.processCollisionPairsEvent(MatterEvent.collisionStart,event) } ); 
      
      Matter.Events.on(this.engine,MatterEvent.collisionEnd,
        function(event:Matter.IEventCollision<Matter.Engine>)
        { me.processCollisionPairsEvent(MatterEvent.collisionEnd,event) } ); 
      
      Matter.Events.on(this.engine,MatterEvent.collisionEnd,
        function(event:Matter.IEventCollision<Matter.Engine>)
        { me.processCollisionPairsEvent(MatterEvent.collisionEnd,event) } ); 
            
      Matter.Events.on(this.engine,MatterEvent.beforeUpdate,
        function(event:Matter.IEventTimestamped<Matter.Engine>)
        { me.processTimestampedEvent(MatterEvent.collisionEnd,event) } ); 
  
      Matter.Events.on(this.engine,MatterEvent.afterUpdate,
        function(event:Matter.IEventComposite<Matter.Composite>)
        { me.processCompositeEvent(MatterEvent.afterUpdate,event) } ); 
    
      Matter.Events.on(this.engine,MatterEvent.beforeAdd,
        function(event:Matter.IEventComposite<Matter.Composite>)
        { me.processCompositeEvent(MatterEvent.beforeAdd,event) } ); 
  
      Matter.Events.on(this.engine,MatterEvent.afterAdd,
        function(event:Matter.IEventComposite<Matter.Composite>)
        { me.processCompositeEvent(MatterEvent.afterAdd,event) } ); 

  }

  public get engine(): Matter.Engine {
		return this._engine;
	}

	public set engine(value: Matter.Engine) {
		this._engine = value;
  }
  
	public get matterTools(): MatterTools  {
		return this._matterTools;
	}

	public set matterTools(value: MatterTools ) {
		this._matterTools = value;
	}

	public get collisionEventHandlers(): Map<string,MatterCollisionEvent> {
		return this._collisionEventHandlers;
	}

	public set collisionEventHandlers(value: Map<string,MatterCollisionEvent>) {
		this._collisionEventHandlers = value;
	}
  

	public get compositeEventHandlers(): Map<string,MatterCompositeEvent> {
		return this._compositeEventHandlers;
	}

	public set compositeEventHandlers(value: Map<string,MatterCompositeEvent>) {
		this._compositeEventHandlers = value;
  }
  

	public get timestampEventHandlers(): Map<string,MatterTimestampedEvent> {
		return this._timestampEventHandlers;
	}

	public set timestampEventHandlers(value: Map<string,MatterTimestampedEvent>) {
		this._timestampEventHandlers = value;
	}


	public get matterMouseConstraint(): Matter.Constraint {
		return this._matterMouseConstraint;
	}

	public set matterMouseConstraint(value: Matter.Constraint) {
		this._matterMouseConstraint = value;
	}


	public get matterShapes(): Map<WorldId,MatterShape> {
		return this._matterShapes;
	}

	public set matterShapes(value: Map<WorldId,MatterShape>) {
		this._matterShapes = value;
	}

  public get mouseAnchor(): MatterCircle {
		return this._mouseAnchor;
	}

	public set mouseAnchor(value: MatterCircle) {
		this._mouseAnchor = value;
	}
/****
 * 
 * https://codepen.io/anon/pen/qGWpJa?editors=1010
   <div id="collideStatus">-</div>
<div id="container">
  <canvas id="maincanvas"></canvas>
</div>https://codepen.io/swendude/pen/pRoYEY?editors=1010



  var greent=1234567;redt=7654321;bluet=1234321;
  // Monkeypatch for the Matter.detector.Detector.canCollide method
  Matter.Detector.canCollide = function (filterA, filterB) {
    var cnew = testIt(filterA, filterB);
    var cnewN = testIt(filterA, filterB);
    var collides =
        (filterB.collidesWith.includes(filterA.group) || filterB.group == 0) 
        &&                 
        (filterA.collidesWith.includes(filterB.group) || filterA.group == 0)
     ;
    statusText.innerHTML = 
      //"b="+filterB.groupN+
      //":a="+filterA.groupN+
      ":b="+JSON.stringify(filterB.collidesWithN)+
      ":a="+filterA.collidesWithN.length+
      ":cnew="+cnew+
      ":cnewn="+cnewN+
      ":collides="+collides+" "+JSON.stringify(filterA); 
    return(collides||cnewN);
  }
  
  function testItN(filterA, filterB) {
    if(!filterA.collidesWithN || !filterB.collidesWithN) return(false);
    for(var i=0;i<filterB.collidesWithN.length;i++) {
      if(filterA.collidesWithN.includes(filterB.groupN))
         return(true);
    }
   return(false);
  }
  
  function testIt(filterA, filterB) {
    for(var i=0;i<filterB.collidesWith.length;i++) {
      if(filterA.collidesWith.includes(filterB.group))
         return(true);
    }
   return(false);
  }
  
  // module aliases
  var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Vector = Matter.Vector,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint;
  
  // create an engine
  var engine = Engine.create();
  
  // create a renderer
  var container = document.getElementById("container");
  var canvas = document.getElementById("maincanvas");
  var statusText =  document.getElementById("collideStatus");
  
  var render = Render.create({
    element: container,
    canvas: canvas,
    engine: engine,
    options: {
      height: 800,
      width: 800,
      wireframes: false
    }
  });
  
  // This makes collision much easier to test
  engine.world.gravity = {
    x: 0,
    y: 0
  };
  
  // Add a mouseconstraint to test
  var mc = MouseConstraint.create(engine, {
    element: render.canvas,
    collisionFilter: {
      group: 0,
      collidesWith: []
    }
  });
  Composite.add(engine.world, mc);
  
  var bodies1 = []
  var bodies2 = []
  var bodies3 = []
  var xpos = 30
  var ypos = 30
  for (var i = 0; i < 5; i++) {
    bodies1.push(Bodies.circle(xpos, ypos, 10, {
      collisionFilter: {
        groupN:"green",collidesWithN: ["green"],
        group: greent,
        collidesWith: [0, greent]
      },
      render: {
        fillStyle: "green"
      }
    }));
    xpos += 30;
  }
  for (var i = 0; i < 5; i++) {
    bodies2.push(Bodies.circle(xpos, ypos, 10, {
      collisionFilter: {
        groupN:"red",collidesWithN: ["red"],
        group: redt,
        collidesWith: [0, redt]
      },
      render: {
        fillStyle: "red"
      }
    }));
    xpos += 30;
  }
  for (var i = 0; i < 5; i++) {
    bodies3.push(Bodies.circle(xpos, ypos, 10, {
      collisionFilter: {
        groupN:"blue",collidesWithN: ["blue"],
        group: bluet,
        collidesWith: [0, bluet,greent]
      },
      render: {
        fillStyle: "blue"
      }
    }));
    xpos += 30;
  }
  var composite1 = Composite.create();
  Composite.add(composite1, bodies1);
  var composite2 = Composite.create();
  Composite.add(composite2, bodies2);
  var composite3 = Composite.create();
  Composite.add(composite3, bodies3);
  
  Composite.add(engine.world, [composite1, composite2,composite3]);
  
  Engine.run(engine);
  Render.run(render);
  ****/
}