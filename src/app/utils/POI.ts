import { Color3 } from "@babylonjs/core";



export class POI{
    name:string;
    sensorId:string;
    private title:string;
    x:number;
    y:number;
    z:number;
    titlePos:number;
    color:Color3;
    link:string;
    id:number;
    titleColor:string;

    constructor(title: string,x:number,y:number,z:number,id:number,titleColor:string) {
        this.name = "No-Name";
        this.sensorId = title;
        this.title = title;
        this.x = x ; 
        this.y = y ;
        this.z = z;
        this.titlePos = 6;
        this.color = Color3.Blue();
        this.link = '';
        this.id = id;
        this.titleColor = titleColor;
      }
}