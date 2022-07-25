import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Editor';
  showMe = false;
  showMp = false;
  readApi;
  saveApi;
  mode;
  json ='';
  data = '';
  name = '';
  url = '';
  constructor(private elementRef:ElementRef) {
    this.readApi = this.elementRef.nativeElement.getAttribute('data-read-api');
    this.saveApi = this.elementRef.nativeElement.getAttribute('data-write-api');
    this.mode = this.elementRef.nativeElement.getAttribute('data-mode');

    console.log(this.saveApi);
    
  
  }
  ngOnInit(): void {

    fetch(this.readApi).then(res => res.json())
    .then(jsonData => {
      this.json = jsonData;
      console.log(this.json);
      this.readJson(this.json);
    });
  }

  readJson(data: any){
    this.data = data.data;
    this.url = data.url;
    this.name = data.name;
    if(data.modelType == "3d"){
      this.showMe = true;
    }
    else{
      this.showMp = true;
    }

  }

}
