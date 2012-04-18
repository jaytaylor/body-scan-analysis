/**
 * @author Jay Taylor <outtatime@gmail.com>
 *
 * @date 2011-07-02
 */

if ('undefined' === typeof console) {
    this.console = { log: function() {} };
}

var data = {
    "gridMap": {
        "xAxis": [
            0,
            37,
            80,
            124,
            157
        ],
        "yAxis": [
            0,
            27,
            48,
            69,
            110,
            130,
            150,
            170,
            188,
            208,
            217,
            227,
            248,
            266,
            286,
            308,
            331,
            360,
            384,
            413,
            442
        ]
    },
    "disabledTileIds": [
        0,
        1,
        2,
        3,
        14,
        15,
        16,
        17,
        18,
        63,
        64,
        65,
        66,
        77,
        78,
        79,
        80,
        81
    ],
    "mergeTileIds": [
        [4, 5],
        [8, 9],
        [10, 11],
        [12, 13],
        [19, 40],
        [30, 31],
        [51, 52],
        [61, 82],
        [64, 65],
        [67, 68],
        [69, 70],
        [71, 72],
        [73, 74],
        [75, 76],
        [58, 78]
    ],
};


var x; //drawing context
var width;
var height;
var fg;
var buffer;

//$(document).ready(function() {

    var bgCanvas = document.getElementById("canvasLayer0");//$('.bg')[0];//document.getElementById('canvasLayer0');
    var bgContext = bgCanvas.getContext('2d');

    var fgCanvas = document.getElementById("canvasLayer2");//$('.fg')[0];//document.getElementById('canvasLayer1');
    var fgContext = fgCanvas.getContext('2d');

    var imageLocations = [
        "images/childFront-0.png",
        "images/childFront-1.png",
        "images/childFront-2.png",
        "images/childFront-3.png",
        "images/childFront-4.png"
    ];

    var offset = {top: 20, left: 20};

	var img = new GridImage(
        imageLocations,
        data,
        offset,
        bgCanvas,
        fgCanvas
    );

    _.each(img.data.gridMap.xAxis, function(x) {
        fgContext.moveTo(x + img.bgImage.offset.left, 0 + img.bgImage.offset.top);
        fgContext.lineTo(x + img.bgImage.offset.left, img.bgImage.height + img.bgImage.offset.top);
    });

    _.each(img.data.gridMap.yAxis, function(y) {
        fgContext.moveTo(0 + img.bgImage.offset.left, y + img.bgImage.offset.top);
        fgContext.lineTo(img.bgImage.width + img.bgImage.offset.left, y + img.bgImage.offset.top);
    });

    fgContext.strokeStyle = '#99ffff';
    fgContext.stroke();


    var CanvasMouse = (function(img, undefined) {
        $('#infoBox').append('<div id="coordinates"></div><div id="status"></div>');

        var _canvasOffset = $('.fg').offset(),
            _x,
            _y,
            _canvas = $('.fg')[0],
            _context = _canvas.getContext('2d'),
            _lastTileId,
            _box;

        $('canvas').mousemove(function(e) {
            _x = e.pageX - _canvasOffset.left;
            _y = e.pageY - _canvasOffset.top;
            var tileId = img.coordsToTileId(_x, _y);
            if (null !== tileId && _lastTileId !== tileId &&
                'undefined' !== typeof img.boxAtTileId[tileId]) {
                _box = img.boxAtTileId[tileId];
            }
			//console.log("setting ltid=" + tileId);
            _lastTileId = tileId;

            var tileStr = null !== _lastTileId ? ', tileId=' + _lastTileId : '';
        });
        _canvas.addEventListener('click', function(e) {img.tileClick(e);}, false);
    })(img);

    console.log('done');
//});

