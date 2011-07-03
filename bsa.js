/**
 * @author Jay Taylor <outtatime@gmail.com>
 *
 * @date 2011-07-02
 */

if ('undefined' === typeof console) {
    this.console = { log: function() {} };
}

var x; //drawing context
var width;
var height;
var fg;
var buffer;

$(document).ready(function() {

    var bgCanvas = $('.bg')[0];//document.getElementById('canvasLayer0');
    var bgContext = bgCanvas.getContext('2d');

    var fgCanvas = $('.fg')[0];//document.getElementById('canvasLayer1');
    var fgContext = fgCanvas.getContext('2d');

	var img = new Image();
	img.src = "childFront.png";

    img.offset = {top: 0, left: 0};

    img.onload = function() {
        bgContext.drawImage(img, img.offset.top, img.offset.left, img.width, img.height);
		Pixastic.process(img, "coloradjust", {red:0.5,green:0,blue:0});
    }

    img.data = {
        "gridMap": {
            "xAxis": [
                0,
                38,
                80,
                124,
                157
            ],
            "yAxis": [
                0,
                27,
                48,
                69,
                130,
                150,
                170,
                188,
                208,
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
            12,
            13,
            14,
            15,
            16,
            57,
            58,
            59,
            69,
            70,
            71,
            72,
            73
        ],
        "mergeTileIds": [
            [3, 4],
            [17, 36],
            [60, 61],
            [55, 74]
        ],
    };

    img.coordsToTileId = function(x, y) {
        var foundTile = null,
            xAxis = this.data.gridMap.xAxis,
            yAxis = this.data.gridMap.yAxis;
        // Special case for tile 0.
        if (x > xAxis[0] && x <= xAxis[1] && y > yAxis[0] && y <= xAxis[1]) {
            return 0;
        }
        for (var xLine=xAxis[1], i=1; null === foundTile && i < xAxis.length; xLine=xAxis[++i]) {
            for (var yLine=yAxis[1], j=1; null === foundTile && j < yAxis.length; yLine=yAxis[++j]) {
                var tileId = (xAxis.indexOf(xLine) - 1) * yAxis.length + (yAxis.indexOf(yLine) - 1);
                if (null === foundTile &&
                    x < xLine && x >= xAxis[xAxis.indexOf(xLine) - 1] &&
                    y < yLine && y >= yAxis[yAxis.indexOf(yLine) - 1]) {
                    // Don't want disabled tiles.
                    if (-1 !== img.data.disabledTileIds.indexOf(tileId)) {
                        tileId = null;
                    }
                    return tileId;
                }
            }
        }
        return null;
    };

    img.tileIdToBox = function(tileId) {
        var xAxis = this.data.gridMap.xAxis,
            yAxis = this.data.gridMap.yAxis;
        // Special case for tile 0.
        if (0 === tileId) {
            var box = {
                topLeft: {
                    x: xAxis[0],
                    y: yAxis[0]
                },
                bottomRight: {
                    x: xAxis[1],
                    y: yAxis[1]
                },
            };
            return box;
        }
        for (var xLine=xAxis[1], i=1; i < xAxis.length; xLine=xAxis[++i]) {
            for (var yLine=yAxis[1], j=1; j < yAxis.length; yLine=yAxis[++j]) {
                var tid = (xAxis.indexOf(xLine) - 1) * yAxis.length + (yAxis.indexOf(yLine) - 1);
                if (tid === tileId) {
                    var box = {
                        topLeft: {
                            x: xAxis[xAxis.indexOf(xLine) - 1],
                            y: yAxis[yAxis.indexOf(yLine) - 1]
                        },
                        bottomRight: {
                            x: xLine,
                            y: yLine
                        },
                    };
                    return box;
                }
            }
        }
        return null;
    };

    img.state = (function(img) {
        var state = {};
        var maxTileId = img.coordsToTileId(
            img.data.gridMap.xAxis[img.data.gridMap.xAxis.length - 1] - 1,
            img.data.gridMap.yAxis[img.data.gridMap.yAxis.length - 1] - 1
        );
        while (maxTileId >= 0) {
            state[maxTileId--] = 0;
        }
        return state;
    })(img);

    _.each(img.data.gridMap.xAxis, function(x) {
        fgContext.moveTo(x + img.offset.left, 0 + img.offset.top);
        fgContext.lineTo(x + img.offset.left, img.height + img.offset.top);
    });

    _.each(img.data.gridMap.yAxis, function(y) {
        fgContext.moveTo(0 + img.offset.left, y + img.offset.top);
        fgContext.lineTo(img.width + img.offset.left, y + img.offset.top);
    });

    fgContext.strokeStyle = '#99ffff';
    fgContext.stroke();


    var CanvasMouse = (function(img, undefined) {
        $('#content').append('<div id="coordinates"></div>');

        var _canvasOffset = $('canvas').offset(),
            _x,
            _y,
            _canvas = $('.fg')[0],
            _context = _canvas.getContext('2d'),
            _lastTileId,
            _box;

        $('canvas').mousemove(function(e) {
            _x = e.pageX - _canvasOffset.left;
            _y = e.pageY - _canvasOffset.top;
            //_box = null;
            var tileId = img.coordsToTileId(_x, _y);
            if (null !== tileId && _lastTileId !== tileId) {
                //_canvas.width = _canvas.width; // Reset canvas contents.
                _box = img.tileIdToBox(tileId);
            }
            _lastTileId = tileId;

            var tileStr = null !== _lastTileId ? ', tileId=' + _lastTileId : '';
            $('#coordinates').html(_x + ', ' + _y + ' px' + tileStr);
        });

        return {
            canvas: function() {
                return _canvas;
            },
            getBox: function() {
                return _box;
            },
            getTileId: function() {
                return _lastTileId;
            },
            getLastCoordinates: function() {
                return [_x, _y];
            }
        };
    })(img);

    CanvasMouse.canvas().addEventListener('click', tileClick, false);

    function tileClick(e) {
        var box = CanvasMouse.getBox();
        var tileId = CanvasMouse.getTileId();
        console.log(box);
        if (null !== box) {
            if (0 === img.state[tileId]) {
                img.state[tileId] = 1;
                fgContext.fillRect
            (
                box.topLeft.x,
                box.topLeft.y,
                box.bottomRight.x - box.topLeft.x,
                box.bottomRight.y - box.topLeft.y
            );
            } else {
                img.state[tileId] = 0;
                fgContext.clearRect
            (
                box.topLeft.x,
                box.topLeft.y,
                box.bottomRight.x - box.topLeft.x,
                box.bottomRight.y - box.topLeft.y
            );
            }
        }
    }

    console.log('done');
});

