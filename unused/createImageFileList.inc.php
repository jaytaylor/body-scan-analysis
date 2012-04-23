<?php

function createImageFileList() {
    if (!array_key_exists('image', $_REQUEST)) {
        die('[];</script>missing `image` parameter');
    }

    $imageBase = preg_replace('/[^a-zA-Z0-9_-]+/', '', $_REQUEST['image']);

    if (!strlen($imageBase)) {
        die('[];</script>invalid `image` parameter');
    }

    $imageList = glob('images/' . $imageBase . '*');

    asort($imageList);

    return '"' . str_replace('"', '\\"', json_encode($imageList)) . '"';
}
