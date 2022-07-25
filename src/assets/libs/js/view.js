	  
function iniciarView(ruta,modelo,data){
// import * as Potree from "../src/Potree.js";
console.log("Iniciamos POTREE VIEW");

window.viewer = new Potree.Viewer(document.getElementById("potree_render_area"));

//viewer.setEDLEnabled(true);
viewer.setFOV(60);
viewer.setPointBudget(5_000_000);
viewer.loadSettingsFromURL();


viewer.loadGUI().then( () => {
  viewer.setLanguage('en');
  // $("#menu_filters").next().show();
  viewer.toggleSidebar();
});


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
  viewer.loadProject(ruta);
}


}