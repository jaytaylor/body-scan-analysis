<?php
require_once 'createImageFileList.inc.php';
?><!doctype html>
    <head>
        <title>BSA</title>
        <link rel="stylesheet" type="text/css" href="bsa.css" />
    </head>
    <body>

    <div id="container">
        <menu id="controls">
            <li><button type="button" onclick="activateX()">x</button></li>
        </menu>
        <div id="viewport">
            <canvas id="canvasLayer0" class="layer bg" width="700" height="500">
            </canvas>

            <canvas id="canvasLayer1" class="layer phase-1" width="700" height="500">
            </canvas>

            <canvas id="canvasLayer2" class="layer fg" width="700" height="500">
                <p>Your browser doesn't support canvas.</p>
            </canvas>
        </div>

        <div id="content"></div>
    </div>
        <!--<div><img src="viewer.png" /></div>-->

        <script type="text/javascript" src="javascript/jquery/1.6.1/jquery.min.js"></script>
        <script type="text/javascript" src="javascript/jquery-json/2.2/jquery.json-2.2.min.js"></script>
        <script type="text/javascript" src="javascript/underscore/1.1.6/underscore-min.js"></script>
        <script type="text/javascript" src="pixastic.core.js"></script>
        <script type="text/javascript" src="pixastic.jquery.js"></script>
        <script type="text/javascript" src="actions/coloradjust.js"></script>
        <script type="text/javascript" src="javascript/jetUtils.js"></script>
        <script type="text/javascript" src="javascript/Class.js"></script>
        <script type="text/javascript" src="GridImage.js"></script>

        <script type="text/javascript">
            var images = <?php echo createImageFileList(); ?>;
        </script>

        <script type="text/javascript" src="mapper.js"></script>

    </body>
</html>
