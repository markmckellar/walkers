import { World } from "./world";
import { WorldId } from "./worldid";
import { Junction } from "./junction";
import { DefaultJunction } from "./defaultjunction";
import { Walker } from "./walker";
import { Path } from "./path";
import { WorldPosition } from "./worldposition";



export class WorldUpdate {
    private _walkerName: string;
    private _processDate: Date;
    private _junctionName: string;
    private _walkerInfo: Object;
    private _junctionInfo: Object;
	private _pathInfo: Object;
	private _walkerWorldId:WorldId;
	private _junctionWorldId:WorldId;
	
	public constructor(junctionName:string,walkerName:string,processDate:Date,
		junctionInfo:Object,walkerInfo:Object,pathInfo:Object){
        this.junctionName = junctionName;
        this.walkerName = walkerName;
        this.processDate = processDate;
        this.walkerInfo = walkerInfo;
        this.junctionInfo = junctionInfo;
		this.pathInfo = pathInfo;
		
		this._junctionWorldId = new WorldId(this._junctionName);
		this._walkerWorldId = new WorldId(this._walkerName);
	}

	public static datePlus(milliseconds:number):Date {
		let date:Date = new Date();
		date.setMilliseconds(date.getMilliseconds()+milliseconds);
		//console.log("WorldUpdate:datePlus="+date)
		return(date);
	}
	
	public getJunction(world:World):Junction {
		let junction:Junction = null;
		if(!world.hasJunction(this.junctionWorldId)) {
			junction = new DefaultJunction(this.junctionWorldId);
			world.addJunction(junction,new WorldPosition(10,10));
		} 
		junction = world.getJunction(this.junctionWorldId);
		return(junction);
	}

	public getWalker(world:World,junction:Junction):Walker {
		let walker:Walker = null;
		if(!world.hasWalker(this.walkerWorldId)) {
			walker = new Walker(this.walkerWorldId,junction);
			world.addWalker(walker);
		} 
		walker = world.getWalker(this.walkerWorldId);
		return(walker);
	}

	public getPath(world:World,startJunction:Junction,endJunction:Junction):Path {
		let path:Path = null;
		if(!world.hasPath(startJunction,endJunction)) {
			path = new Path(startJunction,endJunction);
			world.addPath(path);
		} 
		path = world.getPath(startJunction,endJunction);
		//console.log("WorldUpdate:haspath="+world.hasPath(startJunction,endJunction));
		//console.log("WorldUpdate:path="+path);
		//console.log("WorldUpdate:pathjson="+JSON.stringify(path));
		return(path);
	}

    public isReadyToBeProcessed(checkDate:Date):boolean {
        return( this.processDate.getTime()<=(checkDate.getTime()) );
    }

	public get junctionName(): string {
		return this._junctionName;
	}

	public set junctionName(value: string) {
		this._junctionName = value;
	}

	public get walkerName(): string {
		return this._walkerName;
	}


	public get junctionWorldId(): WorldId {
		return this._junctionWorldId;
	}

	public set junctionWorldId(value: WorldId) {
		this._junctionWorldId = value;
	}
	public set walkerName(value: string) {
		this._walkerName = value;
	}

	public get processDate(): Date {
		return this._processDate;
	}

	public set processDate(value: Date) {
		this._processDate = value;
	}
    
	public get walkerInfo(): Object {
		return this._walkerInfo;
	}

	public set walkerInfo(value: Object) {
		this._walkerInfo = value;
	}
    

	public get junctionInfo(): Object {
		return this._junctionInfo;
	}

	public set junctionInfo(value: Object) {
		this._junctionInfo = value;
	}

	public get pathInfo(): Object {
		return this._pathInfo;
	}

	public set pathInfo(value: Object) {
		this._pathInfo = value;
	}


	public get walkerWorldId(): WorldId {
		return this._walkerWorldId;
	}

	public set walkerWorldId(value: WorldId) {
		this._walkerWorldId = value;
	}
	
    
}