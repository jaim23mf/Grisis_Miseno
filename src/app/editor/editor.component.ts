import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { PBRMetallicRoughnessMaterial } from '@babylonjs/core';
import { SimpleModalService } from 'ngx-simple-modal';
import { ModalEdit3dComponent } from '../modal-edit3d/modal-edit3d.component';

declare function iniciarView(ruta:any,modelo:any,data:any):any;
declare function iniciarEdit(ruta:any,modelo:any,data_save_api:any,data:any):any;
declare function savePotree():any;

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

    iniciarEdit(this.url, this.name,this.data_save_api,this.data);}
    else{
      console.log("?");
    iniciarView(this.url,this.name,this.data); 
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
                window.postMessage({
                  "type": "3d.pointcloud.change" // For pointscloud
                });
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
    iniciarEdit(this.url, this.name,this.data_save_api,this.data);
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
          savePotree();
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
            savePotree();
            window.postMessage({
              "type": "pointscloud.close" // For 3d
              });
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
                window.postMessage({
                  "type": "pointscloud.close" // For 3d
                  });
                  window.top!.postMessage({
                    "type": "pointscloud.close" // For 3d
                    });
            }
  
        });
  
  }
}

