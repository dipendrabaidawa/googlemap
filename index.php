<?php
if (isset($_POST['json_data'])) {

    $json_content = $_POST['json_data'];
    $records = json_decode($json_content);
    
    $rootPath = getcwd()."/images/";
    $zip = new ZipArchive();
    $zip_filename = 'result.zip';
    $zip->open($zip_filename, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($rootPath),
        RecursiveIteratorIterator::LEAVES_ONLY
    );
    
    foreach ($files as $name => $file)
    {
        // Skip directories (they would be added automatically)
        if (!$file->isDir())
        {
            // Get real and relative path for current file
            $filePath = $file->getRealPath();
    
            $relativePath = substr($filePath, strlen($rootPath) );
            
            foreach($records as $record) {
                $imagepathinfo = pathinfo($record->image);
    
                if ( strpos( $filePath, $imagepathinfo['basename'] ) ) {
                    
                    // Add current file to archive
                    $zip->addFile($filePath, $relativePath);
                }
            }
        }
    }
    $json_file = "result.json";
    file_put_contents($json_file, $json_content);
    $zip->addfile($json_file);
    
    $zip->close();
    
    header("Content-type: application/zip"); 
    header("Content-Disposition: attachment; filename=$zip_filename");
    header("Content-length: " . filesize($zip_filename));
    header("Pragma: no-cache"); 
    header("Expires: 0"); 
    readfile("$zip_filename");
    
    
    unlink($zip_filename); unlink($json_file);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="css/ol.css">
    <link rel="stylesheet" href="css/jquery-ui.min.css">
    <link rel="stylesheet" href="css/index.css">
    <script src="js/jquery-3.6.0.min.js"></script>
    <script src="js/jquery-ui.min.js"></script>
    <script src="js/ol.js"></script>

</head>
<body>
<ul id="nav">
    <li><a class="active" href="#home">Nav Bar</a></li>
    <li style="float:right">
        <div style="text-align:center;">
            <input type="file" id="geojson" name="file" style="display: inline-block;"/>
            <a id="nav_upload" href="#about" style="display: inline-block;">Upload</a>
            <a id="nav_download" href="#about" style="display: inline-block;">Download</a>
        </div>

    </li>
</ul>
<div id="top" class="top">
    <div  class="center">
        <div class="selector">
            <label for="plant">Plant</label>
            <select name="plant" id="plant">
                <option>Select a plant</option>
                <!--<option value="saab">Saab</option>
                <option value="mercedes">Mercedes</option>
                <option value="audi">Audi</option>-->
            </select>
        </div>

        <div class="selector">
            <label for="sector" style="margin-left: 20px;">sector</label>
            <select name="sector" id="sector">
                <option>Select a sector</option>
                <!--<option value="saab">Saab</option>
                <option value="mercedes">Mercedes</option>
                <option value="audi">Audi</option>-->
            </select>
        </div>

        <div class="selector">
            <label for="row" style="margin-left: 20px;">row</label>
            <select name="row" id="row">
                <option>Select a row</option>
                <!--<option value="saab">Saab</option>
                <option value="mercedes">Mercedes</option>
                <option value="audi">Audi</option>-->
            </select>
        </div>

    </div>
</div>
<div id="map" class="map">
</div>
<div id="bottom" class="bottom">
    <div class="slideshow-container">

        <!-- Full-width images with number and caption text -->
        <div class="mySlides fade">
          <!--  <div style="width: 100%;height: 100%;">
                <div id="div-left">
                    <a class="prev">&#10094;</a>
                </div>
                <div id="div-middle">
                    <img id="img" src="images/noimage.png" style="max-width: 100%;max-height: 100%;">
                </div>
                <div id="div-right">
                    <a class="next">&#10095;</a>
                </div>
            </div>-->
            <a class="prev">&#10094;</a>
            <img id="img" src="images/noimage.png" style="width: 300px;height: 300px;margin-left: 20px;">
            <a class="next">&#10095;</a>
        </div>

            <div style="text-align: center;">
                <input type="file" id="file" name="file" />
                <!-- <button id="btn_upload_image" style="margin-top: 5px;">Upload Image</button> -->
            </div>
    </div>
    <br>
</div>
<div id="hidden_form" style="display: none;"></div>
<div id="dialog" class="modal">

    <!-- Modal content -->
    <div class="modal-content">
        <span class="close">&times;</span>
        <div class="modal-part">
            <div class="modal-row">
                <div style="width: 40%; display: table-cell; ">
                    <div>
                        Left Div
                    </div>
                    <div style="text-align: center;">
                      <img id="v_img" src="images/noimage.png" style=" max-width: 100%;max-height: 100%;display: block;">
                      <canvas id="dialog_img" style="display: none;"></canvas>
                    </div>
                </div>
                <div style="display: table-cell;">
                    <div style="text-align: center;">
                        <table style="width: 100%;">
                            <tr>
                                <td>
                                    Sector
                                </td>
                                <td>
                                    <input  id="in_sector" type="text" name="sector">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Row
                                </td>
                                <td>
                                    <input  id="in_row" type="number" name="row" >
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Line
                                </td>
                                <td>
                                    <input  id="in_line" type="number" name="line">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Module
                                </td>
                                <td>
                                    <input id="in_module" type="text" name="module">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Coordinates
                                </td>
                                <td>
                                    <input id="in_coordinates" type="text" name="coordinates">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Delta
                                </td>
                                <td>
                                    <input id="in_delta" type="text" name="delta">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Irradiation
                                </td>
                                <td>
                                    <input id="in_irradiation" type="text" name="irradiation">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Informations
                                </td>
                                <td>
                                    <input id="in_notification" type="text" name="notification">
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div>
                                        <div class="radio">
                                            Level Selection
                                        </div>

                                        <div class="radio">
                                            <input type="radio" id="lev1" name="level" value="1" checked><label for="lev1">lev1</label>
                                            <input type="radio" id="lev2" name="level" value="2"><label for="lev2">lev2</label>
                                        </div>
                                        <div class="radio">
                                            <input type="radio" id="lev3" name="level" value="3"><label for="lev3">lev3</label>
                                            <input type="radio" id="lev4" name="level" value="4"><label for="lev4">lev4</label>
                                        </div>
                                        <div class="radio">
                                            <input type="radio" id="lev5" name="level" value="5"><label for="lev5">lev5</label>
                                            <input type="radio" id="lev6" name="level" value="6"><label for="lev6">lev6</label>
                                        </div>
                                        <div class="radio">
                                            <input type="radio" id="missing" name="level" value="-1"><label for="missing">Missing</label>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style="text-align: center;padding-right: 30px;">
                                        <div style="text-align: right;">
                                            <button id="btn_draw_new_box">Draw new box&nbsp;</button>
                                        </div>
                                        <div style="text-align: right;margin-top: 10px;">
                                            <button id="btn_delete_all_box">Delete all box&nbsp;&nbsp;</button>
                                        </div>
                                        <div style="text-align: right;margin-top: 10px;">
                                            <button id="btn_delete">Delete</button>
                                            <button id="btn_save">Save</button>
                                        </div>
                                    </div>
                                </td>
                            </tr>


                        </table>
                    </div>

                </div>
            </div>
        </div>
    </div>

</div>

<script src="js/index.js"></script>
</body>
</html>