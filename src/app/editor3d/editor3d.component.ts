import { Component, Input, OnInit } from '@angular/core';
import { Engine, Scene, ArcRotateCamera, Vector3,  MeshBuilder,  Color3,  PointerEventTypes, StandardMaterial, HemisphericLight, HighlightLayer, Color4, AbstractMesh, DeepImmutableObject , DynamicTexture, Mesh, SceneSerializer } from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core";

import { AdvancedDynamicTexture ,Button, ColorPicker, Control, InputText, StackPanel, TextBlock  , MultiLine ,RadioGroup,SelectionPanel, Grid}  from "@babylonjs/gui";

//declare let AdvancedDynamicTexture: any ;



import { POI } from '../utils/POI';

import "@babylonjs/loaders/glTF"

import { EClass } from '../utils/EClass';
import { SimpleModalService } from "ngx-simple-modal";
import { ModalEdit3dComponent } from '../modal-edit3d/modal-edit3d.component';
import { gridPixelShader } from '@babylonjs/materials/grid/grid.fragment';

@Component({
  selector: 'app-editor3d',
  templateUrl: './editor3d.component.html',
  styleUrls: ['./editor3d.component.css']
})
export class Editor3dComponent implements OnInit {
  @Input() url: string ="path";
  @Input() name:string = "modelo";
  @Input() data:any = "data";
  @Input() data_save_api:any = "data";
  @Input() mode:any;

  private isChange:boolean = false;

  private elemento:any;
 /* private spheres:any[];
  private POIS:any[];
  private lineas:any[];
  private plano:any[];
  private plano2:any[];
*/
  private Eclass:any[]

  constructor(private simpleModalService:SimpleModalService) { 

    this.elemento = 0 ;
    /*this.spheres = [];
    this.POIS = [] ;
    this.lineas = [] ;
    this.etiquetas = new Map();*/
    this.Eclass = [];
  }

  ngOnInit(): void {

    window.addEventListener("message", (event) => {
      
      if (event.data.type === "3d.model.info.response") {
        changeModel(event.data);
      }

    }, false);

  var font_type = "Arial";
  const view = document.getElementById("renderCanvas") as HTMLCanvasElement
  var engine = new Engine(view, true)
  var scene = new Scene(engine)
  
  
  //Añadimos la Interfaz de usuario
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI",true,scene);
  var grid = new Grid();
  var textInputX = new InputText()
  var textInputY = new InputText()
  var textInputZ = new InputText()
  
  //Botones
  var enabled = false;
  var button1 = Button.CreateSimpleButton("but1", "Enable Add Point");
  
  var enabled_edit = false;
  var button2 = Button.CreateSimpleButton("but2", "Enable Edit Point");
  
  //Selecciona de elemento
  const hl = new HighlightLayer("hl1", scene);
  
  //Camara
  const camera = new ArcRotateCamera("Camera",  Math.PI , Math.PI / 2.5, 50,  Vector3.Zero(), scene);
  
let setCamera = function (){
  if(enabled_edit || enabled){
      camera.detachControl();
  }
  else{
      camera.attachControl(view,true);
  }

}

let setButtons = function(){

  button1.textBlock!.text = enabled?"Disable Add Point":"Enable Add Point";
  button2.textBlock!.text= enabled_edit?"Disable Edit Point":"Enable Edit Point";

  button1.background = enabled?"red":"#0069d9";
  button2.background = enabled_edit?"red":"#0069d9";

  if(!enabled_edit){
      advancedTexture.removeControl(grid);
  }

  if(currentMesh != null)hl.removeMesh(currentMesh);
}

let createScene = () =>{


  scene.useRightHandedSystem = false;
  scene.clearColor = Color4.FromColor3(Color3.White());

  if(this.mode == "editor" && this.isChange == false){
    document.getElementById('change3d')!.style.display = 'block'; 
    document.getElementById('save3d')!.style.display = 'block';
    document.getElementById('exit3d')!.style.display = 'block';
    document.getElementById('saveExit3d')!.style.display = 'block';
  //Boton Añadir
  button1.width = "150px"
  button1.height = "40px";
  button1.top = "-50px";
  button1.left = "20px";
  button1.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  button1.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  button1.color = "white";
  button1.cornerRadius = 5;
  button1.background = "#0069d9";
  button1.onPointerUpObservable.add(function() {
      enabled = !enabled;
      enabled_edit = false;
      setButtons();
      setCamera();
  });
  advancedTexture.addControl(button1);  

  //Boton Editar
  button2.width = "150px"
  button2.height = "40px";
  button2.top = "-50px";
  button2.left = "200px";
  button2.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  button2.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  button2.color = "white";
  button2.cornerRadius = 5;
  button2.background = "#0069d9";
  button2.onPointerUpObservable.add(function() {
      enabled_edit = !enabled_edit;
      enabled = false;
      setCamera();
      setButtons();
  });
  advancedTexture.addControl(button2);  

}

  SceneLoader.Append(this.url, '', scene, function (meshes) {

      //Camara
      camera.attachControl(view,true);
      camera.useAutoRotationBehavior = false;
      camera.wheelPrecision = 25;

     
      var light = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
      light.diffuse = new Color3(1, 1, 1);
      
      light.intensity = 2;

});
  
  scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
    case PointerEventTypes.POINTERDOWN:
              if(pointerInfo.pickInfo!.pickedMesh != null)   { 
                  if(enabled_edit && pointerInfo.pickInfo!.pickedMesh.name.indexOf("autoAdd")>-1){
                      
                    
                      if(currentMesh != null)hl.removeMesh(currentMesh);
                      hl.addMesh(this.Eclass[+pointerInfo.pickInfo!.pickedMesh.id].spheres, Color3.Green());

                      elemDown(pointerInfo.pickInfo!.pickedMesh, pointerInfo.pickInfo!.pickedMesh.id);
                  }
                  else if(pointerInfo.pickInfo!.hit && pointerInfo.pickInfo!.pickedMesh.name.indexOf("plane")>-1 ) {      
                      pointerDown(pointerInfo.pickInfo!.pickedMesh)
                  }
                  else {
                     if(enabled) {
                      addPoint(pointerInfo.pickInfo!.pickedPoint!,null);
                      elemDown(this.Eclass[this.elemento-1].spheres,this.elemento-1);
                    }
                  }

              }
      break;
              case PointerEventTypes.POINTERUP:
                  if(pointerInfo.pickInfo!.pickedMesh != null)   {    
                       elemUp(pointerInfo.pickInfo!.pickedMesh.name);
                  }
      break;
        case PointerEventTypes.POINTERMOVE:          
                  elemMove();
      break;
      }
    });


  return scene;
}

this.elemento = 0 ;

this.Eclass = [];
let addPoint = (vector:Vector3, poi:POI|null) =>{
  var oMat = new StandardMaterial("ground", scene);
  oMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
  oMat.specularColor = Color3.Blue();
  oMat.emissiveColor = Color3.Blue();
 this.Eclass.push(new EClass());
  var autoSphere = MeshBuilder.CreateSphere("autoAdd-Element-"+this.elemento, {diameter:1}, scene);
      autoSphere.material = oMat;
      autoSphere.id = this.elemento.toString();
      autoSphere.position.y = vector.y;
      autoSphere.position.x = vector.x;
      autoSphere.position.z = vector.z;
      //this.spheres.push(autoSphere);
      this.Eclass[this.elemento].spheres = autoSphere;

      var punto = MeshBuilder.CreateSphere("punto-"+this.elemento, {diameter:0.01}, scene);
      //autoSphere.material = oMat;
      punto.id = this.elemento.toString();
      punto.position.y = vector.y;
      punto.position.x = vector.x*4;
      punto.position.z = vector.z;

   
 //Set font type
	

   var text = "No-Name";
   if(poi != null){text = poi.name}

   var DTHeight = 1.5 * 25; //or set as wished
   var planeHeight = 1;

   //Calcultae ratio
   var ratio = planeHeight/DTHeight;

   var temp = new DynamicTexture("DynamicTexture", 64, scene);
   var tmpctx = temp.getContext();
   tmpctx.font =  "25px " + font_type;;
   let DTWidth= tmpctx.measureText(text).width + 8;
   console.log(DTWidth);

   //Set width an height for plane
   var planeWidth = DTWidth * ratio;

   //Create plane
   var plane = MeshBuilder.CreatePlane("plane", {width:planeWidth, height:planeHeight}, scene);

   //Set width and height for dynamic texture using same multiplier
   //var DTWidth = planeWidth * 45;
   //var DTHeight = planeHeight * 45;

   //Set text
   

   //Create dynamic texture
   var dynamicTexture = new DynamicTexture("DynamicTexture", {width:DTWidth, height:DTHeight}, scene,false);
   //Check width of text for given font type at any size of font
   var ctx = dynamicTexture.getContext();
    var size = 12; //any value will work
   ctx.font = size + "px " + font_type;
   var textWidth = ctx.measureText(text).width;
   
   //Calculate ratio of text width to size of font used
   var ratio = textWidth/size;
 
 //set font to be actually used to write text on dynamic texture
   var font_size = 25;//Math.floor(DTWidth / (ratio * 1.5)); //size of multiplier (1) can be adjusted, increase for smaller text
   var font = font_size + "px " + font_type;
 //Draw text
 let titleColor = "#ffffff";
   if(poi != null) {
    titleColor = poi.titleColor;
    let color:Color3 = new Color3(poi.color.r,poi.color.g,poi.color.b);
    console.log(color.toHexString());
    dynamicTexture.drawText(text, null, null, font, poi.titleColor, color.toHexString(),true,true);
  }
  else{
    dynamicTexture.drawText(text, null, null, font, "#ffffff", null,true,true);

  }

   //dynamicTexture.wRotationCenter = Math.PI;
   //create material
   var mat = new StandardMaterial("mat", scene);
   mat.diffuseTexture = dynamicTexture;
   //mat.diffuseColor = Color3.Blue();
   plane.material = mat;

   let seis = punto.position.y <0 ? -6:6;
   if(poi != null){
    seis = poi.titlePos?poi.titlePos:6;
   }

      plane.position.x = punto.position.x ;
      plane.position.y = punto.position.y + seis;
      plane.position.z = punto.position.z ;  

      /*BACK*/
      var plane2 = MeshBuilder.CreatePlane("plane", {width:planeWidth, height:planeHeight}, scene);
      var dynamicTexture2 = dynamicTexture;
      plane2.material = mat;

      plane2.position.x = plane.position.x ;
      plane2.position.y = plane.position.y ;
      plane2.position.z = plane.position.z ;  
      plane2.rotation.y = Math.PI;
      /* */ 
      
      var line = new MultiLine();
      line.lineWidth = 2;
      line.color = "blue";
      //if(poi != null ){line.color = poi.lineColor;}

      line.add(plane);
      line.add(punto, autoSphere);

      advancedTexture.addControl(line);

      this.Eclass[this.elemento].POIS =  new POI("autoAdd-Element-"+this.elemento,vector.x,vector.y,vector.z,this.elemento,titleColor);
      this.Eclass[this.elemento].lineas = line;
      this.Eclass[this.elemento].plane = plane;
      this.Eclass[this.elemento].plane2 = plane2;
      this.Eclass[this.elemento].text = dynamicTexture;
      this.Eclass[this.elemento].text2 = dynamicTexture2;
      this.Eclass[this.elemento].POIS.titlePos = seis;
    this.elemento++;
}

let pointerDown = (mesh: AbstractMesh)=>{

  for(let i=0 ; i<this.Eclass.length;i++){
    if(this.Eclass[i].plane == mesh || this.Eclass[i].plane2 == mesh){
      //alert("PopUp! --> " + i + " -- " + this.Eclass[i].POIS.name);
      window.postMessage({
        "type": "3d.sensor.click",
        "data": {
          "name":this.Eclass[i].POIS.name,
          "sensorId" : this.Eclass[i].POIS.sensoId
        }
        });

        window.top!.postMessage({
          "type": "3d.sensor.click",
          "data": {
            "name":this.Eclass[i].POIS.name,
            "sensorId" : this.Eclass[i].POIS.sensoId
          }
          });
    }
  }
};

///
var currentMesh: any;
var startingPoint: DeepImmutableObject<Vector3> | null;
let w:any= false; 
let c:any = false;

let elemDown =  (mesh: any,id: any) => {
  currentMesh = mesh;
  startingPoint = getGroundPosition();
  //let selectedPOI = this.POIS[id];
  let selectedPOI = this.Eclass[id].POIS;

  grid.dispose();
  /*panel.spacing = 5;
  panel.width = "300px";
  panel.top = "25px";
  panel.isVertical = true;
  panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  advancedTexture.removeControl(panel);
  advancedTexture.addControl(panel);*/


  grid = new Grid();
  //panel.addControl(grid);
  grid.height = "800px";
  grid.top = "25px";
  grid.left = "50px";
  //grid.conten = "5px";
  grid.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  grid.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  advancedTexture.removeControl(grid);
  advancedTexture.addControl(grid);

  grid.addColumnDefinition(20,true);
  grid.addColumnDefinition(150,true);
  grid.addColumnDefinition(20,true);
  grid.addRowDefinition(25,true);//0
  grid.addRowDefinition(25,true);//1
  grid.addRowDefinition(25,true);//2
  grid.addRowDefinition(25,true);//3
  grid.addRowDefinition(25,true);//4
  grid.addRowDefinition(25,true);//5
  grid.addRowDefinition(25,true);//6
  grid.addRowDefinition(150,true);//7
  grid.addRowDefinition(25,true);//8
  grid.addRowDefinition(150,true);//9
  grid.addRowDefinition(25,true);//10
  grid.addRowDefinition(25,true);//11
  grid.addRowDefinition(25,true);//12
  grid.addRowDefinition(25,true);//13
  grid.addRowDefinition(25,true);//14
  grid.addRowDefinition(25,true);//15
  grid.addRowDefinition(80,true);//16



  var textBlock = new TextBlock();
  textBlock.text = "Title:";
  textBlock.color = "black"
  textBlock.height = "15px";
  textBlock.fontSize = 15;
  grid.addControl(textBlock,0,1);     


  var textInputTitle = new InputText()
  textInputTitle.width = "100px";
  textInputTitle.maxWidth = "100px";
  textInputTitle.height = "20px";
  textInputTitle.text = selectedPOI.name;
  textInputTitle.color = "black";
  textInputTitle.background = "white";
  textInputTitle.focusedBackground = "green";
  textInputTitle.fontSize = 15;

  textInputTitle.onTextChangedObservable.add((value)=>{
          selectedPOI.name = value.text;

          setColorTitle(selectedPOI.titleColor);
  });


  var textBlock = new TextBlock();
  textBlock.text = "Sensor ID:";
  textBlock.color = "black"
  textBlock.height = "15px";
  textBlock.fontSize = 15;

  grid.addControl(textInputTitle,1,1);
  grid.addControl(textBlock,2,1);    


  var textInputSensorId = new InputText()
  textInputSensorId.width = "100px";
  textInputSensorId.maxWidth = "100px";
  textInputSensorId.height = "20px";
  textInputSensorId.text = selectedPOI.sensorId;
  textInputSensorId.color = "black";
  textInputSensorId.background = "white";
  textInputSensorId.focusedBackground = "green";
  textInputSensorId.fontSize = 15;

  textInputSensorId.onTextChangedObservable.add((value)=>{
          selectedPOI.sensorId = value.text;
  });
  grid.addControl(textInputSensorId,3,1);





  var textBlock = new TextBlock();
  textBlock.text = "Title Position Y:";
  textBlock.color = "black"
  textBlock.height = "15px";
  textBlock.fontSize = 15;
  grid.addControl(textBlock,4,1);  




  let buttonLYS =  Button.CreateSimpleButton("buttonLYS", "+");
  buttonLYS.width = "20px"
  buttonLYS.height = "20px";
  //button4.top = "50px";
  buttonLYS.color = "black";
  buttonLYS.cornerRadius = 5;
  buttonLYS.background = "white";
  buttonLYS.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

  grid.addControl(buttonLYS,5,0);  

  let buttonLYR =  Button.CreateSimpleButton("buttonLYR", "-");
  buttonLYR.width = "20px"
  buttonLYR.height = "20px";
  //button4.top = "50px";
  buttonLYR.color = "black";
  buttonLYR.cornerRadius = 5;
  buttonLYR.background = "white";
 
  //panel.addControl(buttonLYR);  
  grid.addControl(buttonLYR,5,2);  

  var textInputTitlePos = new InputText()
  textInputTitlePos.width = "100px";
  textInputTitlePos.maxWidth = "100px";
  textInputTitlePos.height = "20px";
  textInputTitlePos.text = selectedPOI.titlePos?selectedPOI.titlePos:6;
  textInputTitlePos.color = "black";
  textInputTitlePos.background = "white";
  textInputTitlePos.focusedBackground = "green";
  textInputTitlePos.fontSize = 15;
  textInputTitlePos.onTextChangedObservable.add((value) =>{
          //mesh.name = value.text;
          let a:number = +value.text;
          selectedPOI.titlePos = a;
          this.Eclass[id].plane.position.y= selectedPOI.y + a;
          this.Eclass[id].plane2.position.y= selectedPOI.y + a;

  });

  buttonLYS.onPointerUpObservable.add(() => {
    let a:number = +textInputTitlePos.text;
    a++;
    textInputTitlePos.text = a.toString();

    selectedPOI.titlePos = a;
    this.Eclass[id].plane.position.y= selectedPOI.y + a;
    this.Eclass[id].plane2.position.y= selectedPOI.y + a;
  });

  buttonLYR.onPointerUpObservable.add(() => {
    let a:number = +textInputTitlePos.text;
    a--;
    textInputTitlePos.text = a.toString();

    selectedPOI.titlePos = a;
    this.Eclass[id].plane.position.y= selectedPOI.y + a;
    this.Eclass[id].plane2.position.y= selectedPOI.y + a;
  });
  //panel.addControl(textInputTitlePos);
  grid.addControl(textInputTitlePos,5,1);  


  var textBlock = new TextBlock();
  textBlock.text = "Label Color:";
  textBlock.color = "black"
  textBlock.height = "15px";
  textBlock.top = "5px";
  textBlock.fontSize = 15;

  //panel.addControl(textBlock);     
  grid.addControl(textBlock,6,1);  
  var picker = new ColorPicker();
  picker.value = currentMesh.material.emissiveColor;
  picker.height = "150px";
  picker.width = "150px";
  picker.paddingTop = "10px";

  picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  picker.onValueChangedObservable.add((value) => { // value is a color3
      //currentMesh.material.emissiveColor.copyFrom(value);
      //currentMesh.material.specularColor.copyFrom(value);
      this.Eclass[id].plane.material.diffuseColor.copyFrom(value);
      this.Eclass[id].lineas.color = value.toHexString();
      selectedPOI.color = value;
      setColorTitle(this.Eclass[id].POIS.titleColor);
  });

  //panel.addControl(picker);   
  grid.addControl(picker,7,1);  


 
   var textBlock = new TextBlock();
   textBlock.text = "Text Color:";
   textBlock.color = "black"
   textBlock.height = "15px";
   textBlock.top = "5px";
   textBlock.fontSize = 15;
 
   grid.addControl(textBlock,8,1);     
 
   var pickerText = new ColorPicker();
   pickerText.value = this.Eclass[id].POIS.titleColor;
   pickerText.height = "150px";
   pickerText.width = "150px";
   pickerText.paddingTop = "10px";
 
   pickerText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
   pickerText.onValueChangedObservable.add((value) => { // value is a color3
        selectedPOI.titleColor = value;
        setColorTitle(value.toHexString());
   });
 
   grid.addControl(pickerText,9,1);   



   var textBlock = new TextBlock();
   textBlock.text = "Position X:";
   textBlock.color = "black"
   textBlock.height = "15px";
   textBlock.fontSize = 15;
   grid.addControl(textBlock,10,1); 
 
 
   let buttonPXS =  Button.CreateSimpleButton("buttonPXS", "+");
   buttonPXS.width = "20px"
   buttonPXS.height = "20px";
   //button4.top = "50px";
   buttonPXS.color = "black";
   buttonPXS.cornerRadius = 5;
   buttonPXS.background = "white";
  
   grid.addControl(buttonPXS,11,0);  
 
   let buttonPXR =  Button.CreateSimpleButton("buttonPXR", "-");
   buttonPXR.width = "20px"
   buttonPXR.height = "20px";
   //button4.top = "50px";
   buttonPXR.color = "black";
   buttonPXR.cornerRadius = 5;
   buttonPXR.background = "white";
  
   grid.addControl(buttonPXR,11,2);  

   textInputX.width = "100px";
   textInputX.maxWidth = "100px";
   textInputX.height = "20px";
   textInputX.text = mesh.position.x;
   textInputX.color = "black";
   textInputX.background = "white";
   textInputX.focusedBackground = "green";
   textInputX.fontSize = 15;
 
   textInputX.onTextChangedObservable.add(function(value){
       mesh.position.x = +value.text;
       selectedPOI.x = +value.text;
       //startingPoint = mesh.position;
   });

   buttonPXS.onPointerUpObservable.add(() => {
    let a:number = +textInputX.text;
    a = a + 0.1;
    textInputX.text = a.toString();
    mesh.position.x = a;
    selectedPOI.x = a;
  });

  buttonPXR.onPointerUpObservable.add(() => {
    let a:number = +textInputX.text;
    a = a - 0.1;
    textInputX.text = a.toString();
    mesh.position.x = a;
    selectedPOI.x = a;
  });
   grid.addControl(textInputX,11,1);

   var textBlock = new TextBlock();
   textBlock.text = "Position Y:";
   textBlock.color = "black"
   textBlock.height = "15px";
   textBlock.fontSize = 15;
 
   grid.addControl(textBlock,12,1); 
 
   let buttonPYS =  Button.CreateSimpleButton("buttonPYS", "+");
   buttonPYS.width = "20px"
   buttonPYS.height = "20px";
   //button4.top = "50px";
   buttonPYS.color = "black";
   buttonPYS.cornerRadius = 5;
   buttonPYS.background = "white";
  
   grid.addControl(buttonPYS,13,0);  
 
   let buttonPYR =  Button.CreateSimpleButton("buttonPYR", "-");
   buttonPYR.width = "20px"
   buttonPYR.height = "20px";
   //button4.top = "50px";
   buttonPYR.color = "black";
   buttonPYR.cornerRadius = 5;
   buttonPYR.background = "white";
  
   grid.addControl(buttonPYR,13,2);  
 
   textInputY.width = "100px";
   textInputY.maxWidth = "100px";
   textInputY.height = "20px";
   textInputY.text = mesh.position.y;
   textInputY.color = "black";
   textInputY.background = "white";
   textInputY.focusedBackground = "green";
   textInputY.fontSize = 15;
 
   textInputY.onTextChangedObservable.add(function(value){
       mesh.position.y = +value.text;
       selectedPOI.y = +value.text;
       //startingPoint = mesh.position;
   });

   buttonPYS.onPointerUpObservable.add(() => {
    let a:number = +textInputY.text;
    a = a + 0.1;
    textInputY.text = a.toString();
    mesh.position.y = a;
    selectedPOI.y = a;
  });

  buttonPYR.onPointerUpObservable.add(() => {
    let a:number = +textInputY.text;
    a = a - 0.1;
    textInputY.text = a.toString();
    mesh.position.y = a;
    selectedPOI.y = a;
  });
   grid.addControl(textInputY,13,1);
 
 
   var textBlock = new TextBlock();
   textBlock.text = "Position Z:";
   textBlock.color = "black"
   textBlock.height = "15px";
   textBlock.fontSize = 15;
   grid.addControl(textBlock,14,1); 
 

   let buttonPZS =  Button.CreateSimpleButton("buttonPZS", "+");
   buttonPZS.width = "20px"
   buttonPZS.height = "20px";
   //button4.top = "50px";
   buttonPZS.color = "black";
   buttonPZS.cornerRadius = 5;
   buttonPZS.background = "white";
  
   grid.addControl(buttonPZS,15,0);  
 
   let buttonPZR =  Button.CreateSimpleButton("buttonPZR", "-");
   buttonPZR.width = "20px"
   buttonPZR.height = "20px";
   //button4.top = "50px";
   buttonPZR.color = "black";
   buttonPZR.cornerRadius = 5;
   buttonPZR.background = "white";
  
   grid.addControl(buttonPZR,15,2);  

   textInputZ.width = "100px";
   textInputZ.maxWidth = "100px";
   textInputZ.height = "20px";
   textInputZ.text = mesh.position.z;
   textInputZ.color = "black";
   textInputZ.background = "white";
   textInputZ.fontSize = 15;
   textInputZ.focusedBackground = "green";
   textInputZ.onTextChangedObservable.add(function(value){
       mesh.position.z = +value.text;
       selectedPOI.z = +value.text;
       //startingPoint = mesh.position;
   });


   buttonPZS.onPointerUpObservable.add(() => {
    let a:number = +textInputZ.text;
    a = a + 0.1;
    textInputZ.text = a.toString();
    mesh.position.z = a;
    selectedPOI.z = a;
  });

  buttonPZR.onPointerUpObservable.add(() => {
    let a:number = +textInputZ.text;
    a = a - 0.1;
    textInputZ.text = a.toString();
    mesh.position.z = a;
    selectedPOI.z = a;
  });

   grid.addControl(textInputZ,15,1);


  let setColorTitle = (color: any) => {   

    var DTHeight = 1.5 * 25; //or set as wished
    var planeHeight = 1;
 
    //Calcultae ratio
    var ratio = planeHeight/DTHeight;
 
    var temp = new DynamicTexture("DynamicTexture", 64, scene);
    var tmpctx = temp.getContext();
    tmpctx.font =  "25px " + font_type;;
    let DTWidth= tmpctx.measureText(this.Eclass[id].POIS.name).width + 8;
    console.log(DTWidth);
 
    //Set width an height for plane
    var planeWidth = DTWidth * ratio;

    //this.Eclass[id].plane2.scaling.x = planeWidth;
    var plane = MeshBuilder.CreatePlane("plane", {width:planeWidth, height:planeHeight}, scene);

    plane.position.x = this.Eclass[id].plane.position.x ;
    plane.position.y = this.Eclass[id].plane.position.y;
    plane.position.z = this.Eclass[id].plane.position.z ;  

      /*BACK*/
      var plane2 = MeshBuilder.CreatePlane("plane", {width:planeWidth, height:planeHeight}, scene);

      plane2.position.x = plane.position.x ;
      plane2.position.y = plane.position.y ;
      plane2.position.z = plane.position.z ;  
      plane2.rotation.y = Math.PI;

   

//////
    var dynamicTexture = new DynamicTexture("DynamicTexture", {width:DTWidth, height:DTHeight}, scene,false);
    //Check width of text for given font type at any size of font
    var ctx = dynamicTexture.getContext();
    var size = 12; //any value will work
    ctx.font = size + "px " + font_type;

///

    var size = 12; //any value will work
    ctx.font = size + "px " + font_type;
   
   var mat = new StandardMaterial("mat", scene);
   mat.diffuseTexture = this.Eclass[id].text;
   var font_size = 25;
   var font = font_size + "px " + font_type;

   this.Eclass[id].text = dynamicTexture;

   this.Eclass[id].text.drawText(this.Eclass[id].POIS.name, null, null, font, color,this.Eclass[id].lineas.color , true,true);
   this.Eclass[id].POIS.titleColor = color;
    console.log(color);

    plane.material = mat;
    plane2.material = mat;

    this.Eclass[id].plane.dispose();
    this.Eclass[id].plane2.dispose();

    this.Eclass[id].plane = plane;
    this.Eclass[id].plane2 = plane2;

    this.Eclass[id].lineas.add(plane);

    this.Eclass[id].plane.material = mat;
  }


   let button4 =  Button.CreateSimpleButton("but4", "Remove");
   button4.width = "75px"
   button4.height = "75px";
   //button4.top = "50px";
   button4.paddingTop = "25px";
   button4.color = "white";
   button4.cornerRadius = 5;
   button4.background = "red";
   button4.onPointerUpObservable.add(function() {
          removePOI(mesh,id);
   });
   grid.addControl(button4,16,1);  
}

var elemUp = function (name:any) {
  if (startingPoint) {
      startingPoint = null;
      return;
  }

  if(currentMesh!= null && currentMesh.name != name ){
      hl.removeMesh(currentMesh);
      advancedTexture.removeControl(grid);
  }
}

var elemMove = function () {
      if (!startingPoint) {
          return;
      }
      var current = getGroundPosition();
      if (!current) {
          return;
      }

      var diff = current.subtract(startingPoint);

      currentMesh.position.addInPlace(diff);

      textInputX.text = currentMesh.position.x.toString();
      textInputY.text = currentMesh.position.y.toString();
      textInputZ.text = currentMesh.position.z.toString();

      startingPoint = current;
}


var removePOI =  (mesh:any,id:any) =>{
  currentMesh = null;
  startingPoint = null;

  //this.etiquetas[id].dispose();
//this.lineas[id].dispose();
this.Eclass[id].lineas.dispose();
this.Eclass[id].plane.dispose();
this.Eclass[id].plane2.dispose();

  scene.removeMesh(mesh);

  //this.spheres[id] = null;
  this.Eclass[id] = null;
  //this.lineas[id] = null;
  //this.etiquetas[id] = null;
  mesh.dispose();

  advancedTexture.removeControl(grid);
}

var getGroundPosition = function () {
  var pickinfo = scene.pick(scene.pointerX, scene.pointerY);
  if (pickinfo!.hit) {
      return pickinfo!.pickedPoint;
  }

  return null;
}


/// Load Data
let loadData = async () =>{

  let json = this.data;


      for(let i = 0 ; i<json.length;i++){
          let poi = json[i];
          addPoint(new Vector3(poi.x,poi.y,poi.z),poi);
          //this.POIS[this.elemento-1].name = poi.name;
          //this.POIS[this.elemento-1].color = poi.color;
          this.Eclass[this.elemento-1].POIS.name = poi.name;
          this.Eclass[this.elemento-1].POIS.color = poi.color;
          //this.spheres[this.elemento-1].material.emissiveColor.copyFrom(poi.color);
          //this.spheres[this.elemento-1].material.specularColor.copyFrom(poi.color);
          this.Eclass[this.elemento-1].spheres.material.emissiveColor.copyFrom(poi.color);
          this.Eclass[this.elemento-1].spheres.material.specularColor.copyFrom(poi.color);
          //this.Eclass[this.elemento-1].plane.material.diffuseColor.copyFrom(poi.color);
          let color = new Color3(poi.color.r,poi.color.g,poi.color.b)
          this.Eclass[this.elemento-1].lineas.color = color.toHexString();
      }
}

 let changeModel = (eventData:any)=>{
  this.mode = "editor";
  this.url = eventData.data.url;
  this.name = eventData.data.name;
  this.isChange = true;
  //scene.dispose();
  //engine.dispose();
  
  //engine = new Engine(view,true);
  //scene = new Scene(engine)
  console.log(scene.meshes);

  for(let i=0;i<scene.meshes.length ; ){
    scene.meshes[0].dispose();
  }

  for(let i=0; i<this.Eclass.length;i++){
    this.Eclass[i].spheres.dispose();
    this.Eclass[i].lineas.dispose();
    this.Eclass[i].plane.dispose();
    this.Eclass[i].plane2.dispose();
  }

  console.log(this.Eclass);
  this.Eclass = [];
  this.elemento = 0;
  createScene();
}


/// Save Data 



let saveData = async (data:any) =>{
      
      let jsonFile = [];
      for(let i = 0; i<data.length ; i++){
          if(data[i] != null){
              jsonFile.push(data[i]);
          }
      }
      let spheres_aux = [];
      let cont = 0;
      for(let i = 0; i<this.Eclass.length ; i++){
          if(this.Eclass[i] != null){
            this.Eclass[i].spheres.id = cont;
              spheres_aux.push(this.Eclass[i].spheres);
              cont++;
          }
      }

      this.elemento = jsonFile.length;
      //this.Eclass[].POIS = jsonFile;

      for(let i = 0;jsonFile.length<i;i++){
        this.Eclass[i].POIS = jsonFile[i];
      }

      //this.spheres = spheres_aux;
      for(let i = 0;spheres_aux.length<i;i++){
        this.Eclass[i].spheres = spheres_aux[i];
      }


      let bodeRes = {
        "url": this.url, // URL of the model
        "name": this.name, // name of the model
        "modelType": "3d", // can be 3d or pointscloud
        "data":  JSON.stringify(jsonFile)
      }

     let res = await fetch(this.data_save_api, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodeRes)
      })

      console.log( JSON.stringify(jsonFile));    
}

let _scene = createScene();
loadData();

engine.runRenderLoop(() => {
  _scene.render();
})

window.addEventListener("resize", function ()
{
  engine.resize();
});


}


saveDataP = async (data:any)=>{
      
  let jsonFile = [];
  for(let i = 0; i<data.length ; i++){
      if(data[i].POIS != null){
          jsonFile.push(data[i].POIS);
      }
  }
  let spheres_aux = [];
  let cont = 0;
  for(let i = 0; i<this.Eclass.length ; i++){
    if(this.Eclass[i] != null){
      this.Eclass[i].spheres.id = cont;
        spheres_aux.push(this.Eclass[i].spheres);
        cont++;
    }
}

this.elemento = jsonFile.length;
//this.Eclass[].POIS = jsonFile;

for(let i = 0;jsonFile.length<i;i++){
  this.Eclass[i].POIS = jsonFile[i];
}

//this.spheres = spheres_aux;
for(let i = 0;spheres_aux.length<i;i++){
  this.Eclass[i].spheres = spheres_aux[i];
}


let bodeRes = {
  "url": this.url, // URL of the model
  "name": this.name, // name of the model
  "modelType": "3d", // can be 3d or pointscloud
  "data":  JSON.stringify(jsonFile)
}


let res = await fetch(this.data_save_api, {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json'
  },
  body:  JSON.stringify(bodeRes)
})

  console.log( JSON.stringify(jsonFile));    
}


saveData(){
  this.saveDataP(this.Eclass);
  //this.router.navigate(['/selectModel']);

}

showConfirm() {
  let disposable = this.simpleModalService.addModal(ModalEdit3dComponent, {
        title: 'Change Model',
        message: 'Change model, all POIS will be deleted.',
        type: 0,
      })
      .subscribe((data: any)=>{
          //We get modal result
          if(data) {
              console.log(data);
              window.postMessage({
                "type": "3d.model.change" // For 3d
                });

          }

      });

}

showSave(){
  let disposable = this.simpleModalService.addModal(ModalEdit3dComponent, {
    title: 'Save',
    message: 'Save all POIS.',
    type: 0,
  })
  .subscribe((data: any)=>{
      //We get modal result
      if(data) {
          this.saveData();
      }
  });
}

showSaveAndExit(){
  let disposable = this.simpleModalService.addModal(ModalEdit3dComponent, {
    title: 'Save and Exit',
    message: 'Save all POIS and exit.',
    type: 0,
  })
  .subscribe((data: any)=>{
      //We get modal result
      if(data) {
          console.log(data);
          this.saveData();
          window.postMessage({
            "type": "3d.close" // For 3d
            });
            window.top!.postMessage({
              "type": "3d.close" // For 3d
              });
      }

  });
}

showCancel() {
  let disposable = this.simpleModalService.addModal(ModalEdit3dComponent, {
        title: 'Cancel and Exit',
        message: 'Cancel changes and exit, all POIS will be discarded.',
        type: 0,
      })
      .subscribe((data: any)=>{
          //We get modal result
          if(data) {
              console.log(data);
              window.postMessage({
                "type": "3d.close" // For 3d
                });
                window.top!.postMessage({
                  "type": "3d.close" // For 3d
                  });
          }

      });

}

}


