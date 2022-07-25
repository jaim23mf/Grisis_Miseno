import { Component, Input, OnInit } from '@angular/core';
import { Engine, Scene, ArcRotateCamera, Vector3,  MeshBuilder,  Color3,  PointerEventTypes, StandardMaterial, HemisphericLight, HighlightLayer, Color4, AbstractMesh, DeepImmutableObject , DynamicTexture, Mesh, SceneSerializer } from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core";

import { AdvancedDynamicTexture ,Button, ColorPicker, Control, InputText, StackPanel, TextBlock  , MultiLine ,RadioGroup,SelectionPanel}  from "@babylonjs/gui";
import { POI } from '../utils/POI';

import "@babylonjs/loaders/glTF"

import { EClass } from '../utils/EClass';
import { SimpleModalService } from "ngx-simple-modal";
import { ModalEdit3dComponent } from '../modal-edit3d/modal-edit3d.component';

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
  var panel = new StackPanel();
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
      advancedTexture.removeControl(panel);
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
	
 //Set width an height for plane
   var planeWidth = 3;
   var planeHeight = 1;

   //Create plane
   var plane = MeshBuilder.CreatePlane("plane", {width:planeWidth, height:planeHeight}, scene);

   //Set width and height for dynamic texture using same multiplier
   var DTWidth = planeWidth * 45;
   var DTHeight = planeHeight * 45;

   //Set text
   var text = "No-Name";
   if(poi != null){text = poi.name}

   //Create dynamic texture
   var dynamicTexture = new DynamicTexture("DynamicTexture", {width:DTWidth, height:DTHeight}, scene);
   //Check width of text for given font type at any size of font
   var ctx = dynamicTexture.getContext();
    var size = 12; //any value will work
   ctx.font = size + "px " + font_type;
   var textWidth = ctx.measureText(text).width;
   
   //Calculate ratio of text width to size of font used
   var ratio = textWidth/size;
 
 //set font to be actually used to write text on dynamic texture
   var font_size = Math.floor(DTWidth / (ratio * 1.5)); //size of multiplier (1) can be adjusted, increase for smaller text
   var font = font_size + "px " + font_type;
 //Draw text
 let titleColor = "White";
   dynamicTexture.drawText(text, null, null, font, "#FFFFFF", null, true,true);
   if(poi != null && poi.titleColor == "Colored") {
    titleColor = "Colored";
    dynamicTexture.drawText(text, null, null, font, "black", "white", true,true);
  }

   //dynamicTexture.wRotationCenter = Math.PI;
   //create material
   var mat = new StandardMaterial("mat", scene);
   //mat.diffuseTexture = dynamicTexture;
   mat.emissiveTexture = dynamicTexture;
   mat.diffuseColor = Color3.Blue();
   //apply material
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
          "name":this.Eclass[i].POIS.name
        }
        });

        window.top!.postMessage({
          "type": "3d.sensor.click",
          "data": {
            "name":this.Eclass[i].POIS.name
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

  panel.dispose();
  panel = new StackPanel();
  panel.spacing = 5;
  panel.width = "300px";
  panel.top = "25px";
  panel.isVertical = true;
  panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  advancedTexture.removeControl(panel);
  advancedTexture.addControl(panel);



  var textBlock = new TextBlock();
  textBlock.text = "Title:";
  textBlock.color = "black"
  textBlock.height = "15px";
  textBlock.fontSize = 15;
  panel.addControl(textBlock);     


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
          //mesh.name = value.text;
          selectedPOI.name = value.text;
          if(w){
            setColorTitle(0);
          }
          else{
            setColorTitle(1);
          }
  });
  panel.addControl(textInputTitle);


  var textBlock = new TextBlock();
  textBlock.text = "Title Position Y:";
  textBlock.color = "black"
  textBlock.height = "15px";
  textBlock.fontSize = 15;
  panel.addControl(textBlock);  

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
  panel.addControl(textInputTitlePos);

  var textBlock = new TextBlock();
  textBlock.text = "Position X:";
  textBlock.color = "black"
  textBlock.height = "15px";
  textBlock.fontSize = 15;
  panel.addControl(textBlock); 


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
  panel.addControl(textInputX);


  var textBlock = new TextBlock();
  textBlock.text = "Position Y:";
  textBlock.color = "black"
  textBlock.height = "15px";
  textBlock.fontSize = 15;

  panel.addControl(textBlock); 


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
  panel.addControl(textInputY);


  var textBlock = new TextBlock();
  textBlock.text = "Position Z:";
  textBlock.color = "black"
  textBlock.height = "15px";
  textBlock.fontSize = 15;
  panel.addControl(textBlock); 

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
  panel.addControl(textInputZ);

  var textBlock = new TextBlock();
  textBlock.text = "Color:";
  textBlock.color = "black"
  textBlock.height = "15px";
  textBlock.top = "20px";
  textBlock.fontSize = 15;

  panel.addControl(textBlock);     

  var picker = new ColorPicker();
  picker.value = currentMesh.material.emissiveColor;
  picker.height = "150px";
  picker.width = "150px";
  picker.paddingTop = "10px";

  picker.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  picker.onValueChangedObservable.add((value) => { // value is a color3
      currentMesh.material.emissiveColor.copyFrom(value);
      currentMesh.material.specularColor.copyFrom(value);
      this.Eclass[id].plane.material.diffuseColor.copyFrom(value);
      this.Eclass[id].lineas.color = value.toHexString();
      selectedPOI.color = value;

  });

  panel.addControl(picker);   

   //Boton Guardar
   /*let button3 =  Button.CreateSimpleButton("but3", "Save");
   button3.width = "75px"
   button3.height = "75px";
   //button2.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
   //button2.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
   button3.top = "50px";
   button3.paddingTop = "25px";
   button3.color = "white";
   button3.cornerRadius = 20;
   button3.background = "blue";
  
   button3.onPointerUpObservable.add(() => {
          saveData(this.POIS);
   });
   panel.addControl(button3);  */

 
  let setColorTitle = (but: any) => {   
    var ctx = this.Eclass[id].text.getContext();

    var size = 12; //any value will work
   ctx.font = size + "px " + font_type;
   var textWidth = ctx.measureText( this.Eclass[id].POIS.name).width;
   
   //Calculate ratio of text width to size of font used
   var ratio = textWidth/size;
 
 //set font to be actually used to write text on dynamic texture
   var font_size = Math.floor((3*45) / (ratio * 1.5)); //size of multiplier (1) can be adjusted, increase for smaller text
   var font = font_size + "px " + font_type;
    switch(but) {
            case 0: 
            w = true;
            c= false;
            //this.Eclass[id].text.color = "White";
            this.Eclass[id].text.drawText(this.Eclass[id].POIS.name, null, null, font, "white","black", true,true);
            this.Eclass[id].POIS.titleColor = "White";

            break
            case 1: 
            //this.Eclass[id].text.color = "White";
            w= false;
            c = true;
            this.Eclass[id].text.drawText(this.Eclass[id].POIS.name, null, null, font, "black", "white", true,true);
            this.Eclass[id].POIS.titleColor = "Colored";
            break
        }
  }
   var colorGroup = new RadioGroup("Title Color:");
   if(this.Eclass[id].POIS.titleColor == "White"){
      w = true;
      c=false;
   }
   else{
      c=true;
      w = false;
   }
	  colorGroup.addRadio("White", setColorTitle, w);
    colorGroup.addRadio("Colored", setColorTitle,c);
    

    var selectBox = new SelectionPanel("sp", [colorGroup]);
    selectBox.width = "120px";
    selectBox.height = "100px";
    selectBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;


    panel.addControl(selectBox);


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
   panel.addControl(button4);  
}

var elemUp = function (name:any) {
  if (startingPoint) {
      startingPoint = null;
      return;
  }

  if(currentMesh!= null && currentMesh.name != name ){
      hl.removeMesh(currentMesh);
      advancedTexture.removeControl(panel);
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

  advancedTexture.removeControl(panel);
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
          this.Eclass[this.elemento-1].plane.material.diffuseColor.copyFrom(poi.color);
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


