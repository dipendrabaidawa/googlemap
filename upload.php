<?php

/* Getting file name */
// $filename = $_FILES['file']['name'];
$path = $_POST["path"];
$img = $_POST['file'];

$sector = $_POST['sector'];
$line = $_POST['line'];
$row = $_POST['row'];
$module = $_POST['module'];

$img = str_replace('data:image/png;base64,', '', $img);
$img = str_replace(' ', '+', $img);
$data = base64_decode($img);
$dir =  $path . "/$sector-$row-$line-$module/";
if( is_dir($dir) === false )
{
    mkdir($dir);
}
$file = $path . "/$sector-$row-$line-$module/" . $_POST['filename'];

$success = file_put_contents($file, $data);

if($success) {
   echo $file;
} else {
   echo 0;
}
// header('Location: '.$_POST['return_url']);
/* Location */
//$location = "images/".$filename;
/* 
$location = $path.$filename;
$uploadOk = 1;

if ($uploadOk == 0)
   echo 0;
else {
   
   if (move_uploaded_file($_FILES['file']['tmp_name'], $location))
      echo $location;
   else
      echo 0;
} */
?>
