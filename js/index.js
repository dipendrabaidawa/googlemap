/**
 * Created by GIS-STAR on 6/22/2021.
 */
var markerSource = new ol.source.Vector();
var markerLayer = new ol.layer.Vector({
    source: markerSource,
    style: new ol.style.Style({
      /*  fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2,
        }),*/
        image: new ol.style.Icon({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: 'marker/marker.png'
        })
    }),
})

var selectSource = new ol.source.Vector();
var selectLayer = new ol.layer.Vector({
    source: selectSource,
    style:new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({color: 'blue'})
        })
    }),
})


var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}'
            })
        }),
        markerLayer,selectLayer
    ],
    view: new ol.View({
        center: [0, 0],
        zoom: 2
    })
});

/*
var modify = new ol.interaction.Modify({source: markerSource});
map.addInteraction(modify);
*/

var draw, snap; // global so we can remove them later
var featureID = -1;

function addInteractions() {
    draw = new ol.interaction.Draw({
        source: markerSource,
        type: "Point",
        stopClick:true
    });
    map.addInteraction(draw);

    draw.on('drawend', function (e) {
        var currentFeature = e.feature;//this is the feature fired the event
        var f=currentFeature,
            properties=f.getProperties(),
            geometry=f.getGeometry().clone().transform("EPSG:3857","EPSG:4326"),
            coordinates=geometry.getCoordinates();

        currentFeature.setProperties({
            sector:"",
            row:"",
            line:"",
            module:"",
            delta:"",
            irradiation:"",
            notification: "",
            level:"",
            image:"images/noimage.png",
            coords: coordinates[0]+" "+coordinates[1],
        })
        featureID=markerSource.getFeatures().length;

        $("#img").attr("src","images/noimage.png");
        selectSource.clear();
        var feature=new ol.Feature(currentFeature.getGeometry());

        selectSource.addFeature(feature);

    });

    snap = new ol.interaction.Snap({source: markerSource});
    map.addInteraction(snap);
}

addInteractions();

jQuery(function($) {

    var _oldShow = $.fn.show;

    $.fn.show = function(speed, oldCallback) {
        return $(this).each(function() {
            var obj         = $(this),
                newCallback = function() {
                    if ($.isFunction(oldCallback)) {
                        oldCallback.apply(obj);
                    }
                    obj.trigger('afterShow');
                };
            // you can trigger a before show if you want
            obj.trigger('beforeShow');
            // now use the old function to show the element passing the new callback
            _oldShow.apply(obj, [speed, newCallback]);
        });
    }
});

function readTheFile(file) {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.readAsDataURL(file);
  });
}

function loadTheImage(image) {
    const img = document.getElementById("img");
    img.src = image;
}

var boxDrawing = null;
$(document ).ready(function() {
    if (window.history.replaceState ) {
        window.history.replaceState( null, null, window.location.href );
    }

    $( ".modal-content" ).draggable();

    $('#dialog')
        .bind('beforeShow', function() {

        })
        .bind('afterShow', function() {
            var divWidth = $("#v_img").outerWidth();
            var divHeight = $("#v_img").outerHeight();
            $("#dialog_img").outerWidth(divWidth).outerHeight(divHeight);
            $('#v_img').css('display','none');
            $("#dialog_img").css('display','block');

            const canvas = document.getElementById('dialog_img');
            canvas.height=canvas.width;

            console.log("initialize");
            boxDrawing=null;

            boxDrawing=new Drawing(canvas,$("#img").attr("src"));

            var features=markerSource.getFeatures();
            $('#in_coordinates').val(features[featureID].getProperties()['coords'])
            console.log("featureID: ", featureID, features[featureID].getProperties()['coords'])
        })
        .bind('show',function () {
            alert('show');
        })

    $("#img").click(function () {
        $( ".modal-content" ).draggable({ disabled: false });
        $('#dialog').show(100);
    });

    $("#btn_upload_image").click(function () {
        var features=markerSource.getFeatures();
        if(features.length==0 || featureID<0)
            return;

        var selectedFeature=features[featureID];

        var fd = new FormData();
        var files = $('#file')[0].files[0];
        fd.append('file', files);
        fd.append('path','images/');

        $.ajax({
            url: 'upload.php',
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            success: function(response){
                if(response != 0){

                    $("#img").attr("src", response);

                    selectedFeature.setProperties({image:response});

                    alert('file uploaded');

                }
                else{
                    alert("Upload failed");
                }
            },
        });

    });

    $("#btn_save").click(function () {

        var features=markerSource.getFeatures();
        if(features.length==0 || featureID<0)
            return;

        var selectedFeature=features[featureID];

        var selectedRadio=$( "input[type=radio][name=level]:checked" ).val();
        if(typeof selectedRadio==="undefined")
            selectedRadio="";
        selectedFeature.setProperties({
            sector:$("#in_sector").val(),
            row:$("#in_row").val(),
            line:$("#in_line").val(),
            module:$("#in_module").val(),
            delta:$("#in_delta").val(),
            irradiation:$("#in_irradiation").val(),
            notification:$("#in_notification").val(),
            level:selectedRadio,

        });
        console.log("Selected Features: ", selectedFeature);

        var fd = new FormData();
        var files = document.getElementById('dialog_img').toDataURL();
        var filepath = document.getElementById("file").value;
        var filename = filepath.split("\\").pop();
        fd.append('file', files);
        fd.append('path','images/');
        fd.append('filename', filename);

        $.ajax({
            url: 'upload.php',
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            success: function(response){
                if(response != 0){

                    $("#img").attr("src", response);

                    selectedFeature.setProperties({image:response});

                    alert('file uploaded');

                }
                else{
                    alert("Upload failed");
                }
            },
        });
    })


    $("#file").change(function (event) {
        console.log("here");
        const file = [...event.target.files].pop();
       // alert(file);
        readTheFile(file)
            .then((image) => loadTheImage(image))
    })



    $("#btn_delete").click(function () {
        var features=markerSource.getFeatures();
        let i = 0;
        for (i = 0; i < features.length; ++ i) {
            var coords = features[i].getProperties()['coords'];
            if (coords == $('#in_coordinates').val()) break;
        }
        if (i != features.length) {
            features.splice(i, 1)
            markerSource.clear();
            markerSource.addFeatures(features);
            featureID=features.length-1;
            selectMarker(features,featureID);
        }

        $("#in_sector").val("");
        $("#in_row").val("");
        $("#in_line").val("");
        $("#in_coordinates").val("");
        $("#in_module").val("");
        $("#in_delta").val("");
        $("#in_irradiation").val("");
        $("#in_notification").val("");
        $( ".radio input[type=radio][name=level]").each(function (index,element) {
          $(element).prop("checked", false);
        });
    })
    $("#btn_draw_new_box").click(function () {
        $( ".modal-content" ).draggable({ disabled: true });
        boxDrawing.setBoxing(true);
    })

    $("#btn_delete_all_box").click(function () {

        if(boxDrawing!=null){
            boxDrawing.deleteBoxes();
        }

    })

    $(".close").click(function () {
        $("#dialog").hide();
        if(boxDrawing!=null) {
            boxDrawing.clear();
            boxDrawing.setBoxing(false);
        }
    })

    $("#nav_upload").click(function () {
        var fd = new FormData();
        var files = $('#geojson')[0].files[0];
        fd.append('file', files);
        fd.append('path','json/');

        $.ajax({
            url: 'upload_geojson.php',
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            success: function(response){
                if(response != 0){
                    alert('file uploaded');
                    markerSource.clear();
                    console.log("path", response)
                    var features=[];
                    $.ajax(response).then(function(res) {

                        console.log("OBJ RESPONSE: ", res)
                        const obj = res
                        for(var i=0;i<obj.length;i++){
                            var row=obj[i];
                            var properties={
                                sector:row.sector,
                                row:row.row,
                                line:row.line,
                                module:row.module,
                                coords:row.coords,
                                delta:row.delta,
                                irradiation:row.irradiation,
                                level:row.status,
                                notification: row.information,
                                image:row.image
                            }
                            var coords=row.coords;
                            coords = coords.split(" ");
                            coords=[Number(coords[0].toString()),Number(coords[1].toString())];
                            var pt=new ol.geom.Point(coords);
                            pt=pt.clone().transform("EPSG:4326","EPSG:3857");
                            console.log("properties", properties)
                            var f=new ol.Feature({geometry:pt});
                            f.setProperties(properties);
                            features.push(f);
                        }
                        markerSource.addFeatures(features);
                        featureID=features.length-1;
                        selectMarker(features,featureID);
                      /* var format= new ol.format.GeoJSON();
                       var features = format.readFeatures(res,{featureProjection: 'EPSG:3857'});
                       markerSource.addFeatures(features);
                       featureID=features.length-1;
                       selectMarker(features,featureID);*/
                    });

                }
                else{
                    alert("Upload failed");
                }
            },
        });
    })

    $("#nav_download").click(function () {
        var writer = new ol.format.GeoJSON();
        var opt={
            dataProjection:"EPSG:4326",
            featureProjection:"EPSG:3857"
        }

      /*  var geojsonStr = writer.writeFeatures(markerSource.getFeatures(),opt);
        var jsonObj = JSON.parse(geojsonStr);
        var jsonPretty = JSON.stringify(jsonObj, null, '\t');*/

        var features=markerSource.getFeatures();

        var outPuts=[];

        for(var i=0;i<features.length;i++){
            var f=features[i];
            var properties=f.getProperties();
            var geometry=f.getGeometry().clone().transform("EPSG:3857","EPSG:4326");
            var coordinates=geometry.getCoordinates();
            console.log(coordinates.toString());

            outPuts.push({
                sector:properties.sector,
                row:parseInt(properties.row, 10),
                line:parseInt(properties.line, 10),
                module:properties.module,
                coords:coordinates[0]+" "+coordinates[1],
                delta:properties.delta,
                irradiation:properties.irradiation,
                information: properties.notification,
                status:parseInt(properties.level, 10),
                image: properties.image
            })

        }

        var jsonPretty = JSON.stringify(outPuts, null, '\t');

        const textToBLOB = new Blob([jsonPretty], { type: 'text/plain' });
        const sFileName = 'result.json';	   // The file to save the data.

        var newLink = document.createElement("a");
        newLink.download = sFileName;

        if (window.webkitURL != null) {
            newLink.href = window.webkitURL.createObjectURL(textToBLOB);
        }
        else {
            newLink.href = window.URL.createObjectURL(textToBLOB);
            newLink.style.display = "none";
            document.body.appendChild(newLink);
        }
        newLink.click();
    })
    $(".prev").click(function () {
        var markerFeatures=markerSource.getFeatures();
        if(markerFeatures.length==0) return;

        featureID--;
        if(featureID<0)
            featureID=markerFeatures.length-1

        selectMarker(markerFeatures,featureID);

    })
    $(".next").click(function () {
        var markerFeatures=markerSource.getFeatures();
        if(markerFeatures.length==0) return;

        featureID++;
        if(featureID>=markerFeatures.length){
            featureID=0;
        }
        selectMarker(markerFeatures,featureID);

    })
});
const selectMarker=(markerFeatures,featureID)=>{
    var selectedFeature=markerFeatures[featureID];
    var properties=selectedFeature.getProperties();
    var imgSrc=properties["image"];
    $("#img").attr("src", imgSrc);
    $('#in_sector').val(properties['sector'])
    $('#in_row').val(properties['row'])
    $('#in_line').val(properties['line'])
    $('#in_module').val(properties['module'])
    $('#in_coordinates').val(properties['coords'])
    $('#in_delta').val(properties['delta'])
    $('#in_irradiation').val(properties['irradiation'])
    $('#in_notification').val(properties['notification'])
    var value = properties['level'];
    var radio = $("input[name=level][value=" + value + "]")
    console.log("radio value: ", value, radio, properties['coords'])
    radio.prop('checked', true);
    selectSource.clear();
    var feature=new ol.Feature(selectedFeature.getGeometry());
    selectSource.addFeature(feature);
}


class Drawing {
    constructor(canvas,image) {
        //this.isDrawing = false;
        this.isBox=false;
        this.boxes=[];

        canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        canvas.addEventListener('mouseup', (event) => this.handleMouseUp(event));
        canvas.addEventListener('mouseout', (event) => this.handleMouseOut(event));

        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');



        this.context.lineWidth=2;

        // calculate where the canvas is on the window
        // (used to help calculate mouseX/mouseY)

        var $canvas=$("#dialog_img");
        var canvasOffset=$canvas.offset();
        this.offsetX=canvasOffset.left;
        this.offsetY=canvasOffset.top;
        this.scrollX=$canvas.scrollLeft();
        this.scrollY=$canvas.scrollTop();

        // this flage is true when the user is dragging the mouse
        this.isDown=false;

        // these vars will hold the starting mouse position
        this.startX=-1;
        this.startY=-1;

        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);

        this.loadTheImage(image);

    }
    setBoxing(isBox){
        this.isBox=isBox;
    }
    handleMouseDown(e){
        e.preventDefault();
        e.stopPropagation();

        // save the starting x/y of the rectangle
        this.startX=parseInt(e.clientX-this.offsetX);
        this.startY=parseInt(e.clientY-this.offsetY);

        // set a flag indicating the drag has begun
        this.isDown=true;
    }

    handleMouseMove(e){

        e.preventDefault();
        e.stopPropagation();

        // if we're not dragging, just return
        if(!this.isDown || !this.isBox){return;}

        // get the current mouse position
        var mouseX=parseInt(e.clientX-this.offsetX);
        var mouseY=parseInt(e.clientY-this.offsetY);

        // calculate the rectangle width/height based
        // on starting vs current mouse position
        var width=mouseX-this.startX;
        var height=mouseY-this.startY;

        // draw a new rect from the start position
        // to the current mouse position
        this.context.beginPath();
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.context.drawImage(this.image, 0, 0, this.image.width,this.image.height,  0, 0, this.canvas.width, this.canvas.height);

        var _self=this;


        $( ".radio input[type=radio][name=level]").each(function (index,element) {
            var selectedValue=-1;
            if($(element).prop("checked")) {
                selectedValue=$(element).val();
                selectedValue=parseInt(selectedValue);
                switch (selectedValue){
                    case 1:_self.context.strokeStyle = "#ffffff";break;
                    case 2:_self.context.strokeStyle = "#d2d2d2";break;
                    case 3:_self.context.strokeStyle = "#88b187";break;
                    case 4:_self.context.strokeStyle = "#9059d2";break;
                    case 5:_self.context.strokeStyle = "#d4a850";break;
                    case 6:_self.context.strokeStyle = "#f11616";break;
                    case -1:_self.context.strokeStyle = "#000000";break;
                    default:_self.context.strokeStyle = "blue";break;
                }

            }

        });

        this.context.strokeRect(this.startX,this.startY,width,height);
        this.context.closePath();

    }
    drawBoxes() {
        this.context.beginPath();
        for(var i=0;i<this.boxes.length-1;i++) {
            var box=this.boxes[i];
            this.context.strokeStyle=box.getColor;
            this.context.strokeRect(box.getX,box.getY,box.getWidth,box.getHeight);
        }
        this.context.closePath();
    }
    deleteBoxes(){
        this.boxes=[];
        this.context.beginPath();
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.context.drawImage(this.image, 0, 0, this.image.width,this.image.height,  0, 0, this.canvas.width, this.canvas.height);
        this.context.closePath();
    }
    handleMouseUp(e){
        e.preventDefault();
        e.stopPropagation();

        if(this.isDown && this.isBox){
            var mouseX=parseInt(e.clientX-this.offsetX);
            var mouseY=parseInt(e.clientY-this.offsetY);
            var width=mouseX-this.startX;
            var height=mouseY-this.startY;
            this.boxes.push(new Box(this.startX,this.startY,width,height,this.context.strokeStyle));
            this.drawBoxes();

        }
        // the drag is over, clear the dragging flag
        this.isDown=false;


    }
    handleMouseOut(e){
        e.preventDefault();
        e.stopPropagation();

        // the drag is over, clear the dragging flag
        this.isDown=false;
    }

   /* startDrawing() {
        this.isDrawing = true;
    }
    stopDrawing() {
        this.isDrawing = false;
    }
    draw(event) {
        if (this.isDrawing && this.isBox) {
            this.context.fillRect(event.pageX - this.offsetLeft, event.pageY-this.offsetTop, 2, 2);
        }
    }*/
    clear(){
        this.boxes=[];

    }
    save() {
        const data = this.canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = data;
        a.download = 'image.png';
        a.click();
    }

    loadTheImage(image) {
        const img = new Image();
        const canvas = this.canvas;
        var _self=this;
        img.onload = function () {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, img.width,    img.height,  0, 0, canvas.width, canvas.height);
            context.strokeRect(0,0,canvas.width,canvas.height);
            console.log(canvas.width+":"+canvas.height);
            _self.image=img;
        };
        img.src = image;
    }
}

class Box {
    constructor(x,y,width,height,color){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;
        this.color=color;

    }
    get getX(){
        return this.x;
    }
    get getY(){
        return this.y;
    }
    get getWidth(){
        return this.width;
    }
    get getHeight(){
        return this.height;
    }
    set setX(x){
        this.x=x;
    }
    set setY(y){
        this.y=y;
    }
    set setWidth(width){
        this.width=width;
    }
    set setHeight(height){
        this.height=height;
    }
    get getColor(){
        return this.color;
    }
    set setColor(color){
        this.color=color;
    }
}
