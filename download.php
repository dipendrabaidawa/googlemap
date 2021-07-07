<?php

/* header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream'); */
/* $json_content = $_POST['json_data'];
var_dump($json_content);
$decode = json_decode($json_content);

foreach ($decode as $row) {
    echo $row->image;
    header('Content-Description: File Transfer');
    header('Content-Type: image/jpeg');
    $image = file_get_contents($row->image);
    echo $image;
} */

// exit;

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