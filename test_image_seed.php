<?php
$text = urlencode("Nasi Goreng");
$url = "https://placehold.co/400x400?text=$text";
$img = file_get_contents($url);
file_put_contents("test.png", $img);
