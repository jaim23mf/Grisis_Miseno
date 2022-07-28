import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { EditorComponent} from './editor/editor.component';
import { Editor3dComponent } from './editor3d/editor3d.component';
import { SimpleModalModule } from 'ngx-simple-modal';
import { ModalEdit3dComponent } from './modal-edit3d/modal-edit3d.component';
import { HttpClientModule } from '@angular/common/http';
declare global {
  interface Window {
    pointcloud?: any;
    viewer?:any;
  }
}
@NgModule({
  
  declarations: [
    AppComponent,
    EditorComponent,
    Editor3dComponent,
    ModalEdit3dComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    SimpleModalModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
  
})
export class AppModule { }
