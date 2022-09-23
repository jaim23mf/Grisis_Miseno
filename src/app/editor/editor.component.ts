import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { PBRMetallicRoughnessMaterial } from '@babylonjs/core';
import { SimpleModalService } from 'ngx-simple-modal';
import { ModalEdit3dComponent } from '../modal-edit3d/modal-edit3d.component';

//declare function iniciarView(ruta:any,modelo:any,data:any):any;
declare let Potree:any;
declare let $:any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})


export class EditorComponent implements OnInit {
  @Input() url: string ="path";
  @Input() name:string = "modelo";
  @Input() data:any = "data";
  @Input() data_save_api:any = "data";
  @Input() mode:any;
  constructor(private simpleModalService:SimpleModalService) {
    
   }

  ngOnInit(): void {
    window.addEventListener("message", (event) => {
      
      if (event.data.type === "3d.pointcloud.info.response") {
        this.changeModel(event.data);
      }

    }, false);
  }

  ngAfterViewInit():void{
    console.log("MODO--" + this.mode);
    if(this.mode == "editor"){
      var tag = document.createElement("div");
      tag.id = 'potree_sidebar_container'
     document.getElementById('potree_container')?.append(tag);
     document.getElementById('saveExit')!.style.display = 'block';
     document.getElementById('save')!.style.display = 'block';
     document.getElementById('change')!.style.display = 'block';
     document.getElementById('exit')!.style.display = 'block';

  this.iniciarEdit();


  //let viewer = new Potree.Viewer(document.getElementById("potree_render_area"));

  }
    else{
      console.log("?");
    this.iniciarView(); 
    }
  }

  /**Editor**/
  iniciarEdit(){
    //this.name = modelo;
    //this.data_save_api = data_save_api;
    //this.url = ruta;
    //this.data = data;
    
    window.viewer = new Potree.Viewer(document.getElementById("potree_render_area"));
    
    this.clearViewer(window.viewer);
    
    let sidebarContainer = $('.potree_menu_toggle');
    
    if(sidebarContainer.length >0)sidebarContainer[0].remove();
    //sidebarContainer.remove();
      window.viewer.loadGUI().then( () => {
        window.viewer.setLanguage('en');
        // $("#menu_filters").next().show();
        window.viewer.toggleSidebar();
      });

      window.viewer.loadSettingsFromURL();

    if(this.data.type == "Potree"){
    
      Potree.loadProject(window.viewer,this.data,this.url,function(e:any){
        window.viewer.scene.addPointCloud(e.pointcloud);
        //e.pointcloud.position.z = 0;
        let material = e.pointcloud.material;
        window.pointcloud = e.pointcloud;
        window.viewer.fitToScreen();
      // material.size = 0.8;
        material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
    
    
      });
    
    }
    else{
      window.viewer.loadProject(this.url, "", function(e:any){
        window.viewer.scene.addPointCloud(e.pointcloud);
        //e.pointcloud.position.z = 0;
        let material = e.pointcloud.material;
        window.pointcloud = e.pointcloud;
        window.viewer.fitToScreen();
      // material.size = 0.8;
        material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
    
      });
    }
    
    
    }

    clearViewer(viewer:any) { 
      let scene = new Potree.Scene(); 
      viewer.setScene(scene); 
    }
    
    savePotree(){
      let data = Potree.saveProject(window.viewer,this.url,this.name,this.data_save_api);
    }

    /**VIEWER **/
    iniciarView(){
      // import * as Potree from "../src/Potree.js";
      console.log("Iniciamos POTREE VIEW");
      
      window.viewer = new Potree.Viewer(document.getElementById("potree_render_area"));
      
      //viewer.setEDLEnabled(true);
      window.viewer.setFOV(60);
      window.viewer.setPointBudget(5_000_000);
      window.viewer.loadSettingsFromURL();
      
      
      window.viewer.loadGUI().then( () => {
        window.viewer.setLanguage('en');
        // $("#menu_filters").next().show();
        window.viewer.toggleSidebar();
      });
      
      
      if(this.data.type == "Potree"){
      
        Potree.loadProject(window.viewer,this.data,this.url,function(e:any){
          window.viewer.scene.addPointCloud(e.pointcloud);
          //e.pointcloud.position.z = 0;
          let material = e.pointcloud.material;
          window.pointcloud = e.pointcloud;
          window.viewer.fitToScreen();
        // material.size = 0.8;
          material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
        });
      
      }
      else{
        window.viewer.loadProject(this.url);
      }
      
      
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
                /*window.postMessage({
                  "type": "3d.pointcloud.change" // For pointscloud
                });*/
                window.top!.postMessage({
                  "type": "3d.pointcloud.change" // For pointscloud
                });
            }
            else {
              
            }
        });
  
  }

  changeModel = (eventData:any)=>{
    this.mode = "editor";
    this.url = eventData.data.url;
    this.name = eventData.data.name;
    this.data = {};
    this.iniciarEdit();
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
          this.savePotree();
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
            this.savePotree();
            /*window.postMessage({
              "type": "pointscloud.close" // For 3d
              });*/
              window.top!.postMessage({
                "type": "pointscloud.close" // For 3d
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
                /*window.postMessage({
                  "type": "pointscloud.close" // For 3d
                  });*/
                  window.top!.postMessage({
                    "type": "pointscloud.close" // For 3d
                    });
            }
  
        });
  
  }
}

