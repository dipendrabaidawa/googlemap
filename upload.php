<?php

/* Getting file name */
$filename = $_FILES['file']['name'];
$path = $_POST["path"];

/* Location */
//$location = "images/".$filename;

$location = $path.$filename;
$uploadOk = 1;

if ($uploadOk == 0)
   echo 0;
else {
   /* Upload file */
   if (move_uploaded_file($_FILES['file']['tmp_name'], $location))
      echo $location;
   else
      echo 0;
}
?>
