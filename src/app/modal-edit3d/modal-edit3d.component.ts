import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter } from '@angular/core';
import { SimpleModalComponent } from "ngx-simple-modal";

export interface ConfirmModel {
  title:string;
  message:string;
  type:number;
}
@Component({
  selector: 'app-modal-edit3d',
  templateUrl: './modal-edit3d.component.html',
  styleUrls: ['./modal-edit3d.component.css']
})
export class ModalEdit3dComponent extends SimpleModalComponent<ConfirmModel, any> implements ConfirmModel {

  title: string = "";
  message: string="";
  type: number=0;

  constructor() {
    super();
   }
  ngOnInit(): void {
  }




confirm() {
  // we set modal result as true on click on confirm button,
  // then we can get modal result from caller code
 /* if(this.type == 0){
  window.postMessage({
    "type": "3d.model.change" // For 3d
    });

  } 
  else{
  window.postMessage({
    "type": "3d.pointcloud.change" // For pointscloud
  });
}*/

  this.result = true;
  this.close();
}



}
