
// import * as Potree from "../src/Potree.js";

var modeloName = "";
var data_save_api="";
var url = "";
var data = "";


function iniciarEdit(ruta,modelo,data_save_api,data){
this.modeloName = modelo;
this.data_save_api = data_save_api;
this.url = ruta;
this.data = data;

window.viewer = new Potree.Viewer(document.getElementById("potree_render_area"));

clearViewer(viewer);

let sidebarContainer = $('.potree_menu_toggle');

if(sidebarContainer.length >0)sidebarContainer[0].remove();
//sidebarContainer.remove();
  viewer.loadGUI().then( () => {
    viewer.setLanguage('en');
    // $("#menu_filters").next().show();
    viewer.toggleSidebar();
  });



console.log(data_save_api);

viewer.loadSettingsFromURL();



console.log("POTREE LOAD --"+data.type);

if(data.type == "Potree"){

  Potree.loadProject(viewer,data,function(e){
    viewer.scene.addPointCloud(e.pointcloud);
    //e.pointcloud.position.z = 0;
    let material = e.pointcloud.material;
    window.pointcloud = e.pointcloud;
    viewer.fitToScreen();
  // material.size = 0.8;
    material.pointSizeType = Potree.PointSizeType.ADAPTIVE;


  });

}
else{
  viewer.loadProject(ruta, "", function(e){
    viewer.scene.addPointCloud(e.pointcloud);
    //e.pointcloud.position.z = 0;
    let material = e.pointcloud.material;
    window.pointcloud = e.pointcloud;
    viewer.fitToScreen();
  // material.size = 0.8;
    material.pointSizeType = Potree.PointSizeType.ADAPTIVE;

  });
}


}

function savePotree(){
  let data = Potree.saveProject(viewer,url,modeloName,data_save_api);
  console.log(data);
  console.log(modeloName);
}




 function clearViewer(viewer) { let scene = new Potree.Scene(); viewer.setScene(scene); }