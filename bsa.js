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

$(document).ready(function() {

	var BSAImage = Class.extend({
		init: function(srcImages, data) {
			this.images = [];
            _.each(srcImages, function(src) {
                var sz = this.images.push(new Image());
			    this.images[--sz].src = src;
            }, this);

            this.bgImage = this.images[0];

			this.data = data;

            this.state = {};
            this.boxAtTileId = {};

            // Calculate the maximum possible tile id.
            var tileId = this.coordsToTileId(
                this.data.gridMap.xAxis[this.data.gridMap.xAxis.length - 1] - 1,
                this.data.gridMap.yAxis[this.data.gridMap.yAxis.length - 1] - 1
            );
            while (tileId >= 0) {
                var box = this._tileIdToBox(tileId)
                if (null !== box) {
                    this.boxAtTileId[tileId] = box;
                }
                this.state[tileId--] = 0;
            }

            // Fill a merge object for easy use.
            this.data.mergeInfo = {};
            _.each(data.mergeTileIds, function(list) {
                _.each(list, function(tileId) {
                    this.data.mergeInfo[tileId] = list;
                }, this);
            }, this);

            return this;
		},

        coordsToTileId: function(x, y) {
            var xAxis = this.data.gridMap.xAxis,
                yAxis = this.data.gridMap.yAxis;
            // Special case for tile 0.
            if (x > xAxis[0] && x <= xAxis[1] && y > yAxis[0] && y <= xAxis[1]) {
                // tileId = 0.
                $('#coordinates').html(x + ', ' + y + ' px' + ', #0');
                if (-1 !== this.data.disabledTileIds.indexOf(0)) {
                    return null;
                } else {
                    return 0;
                }
            }
            for (var xLine = xAxis[1], i = 1; i < xAxis.length; xLine = xAxis[++i]) {
                for (var yLine = yAxis[1], j = 1; j < yAxis.length; yLine = yAxis[++j]) {
                    var tileId = (xAxis.indexOf(xLine) - 1) * yAxis.length + (yAxis.indexOf(yLine) - 1);
                    if (x < xLine && x >= xAxis[xAxis.indexOf(xLine) - 1] &&
                        y < yLine && y >= yAxis[yAxis.indexOf(yLine) - 1]) {
                        // Don't want disabled tiles.
                        $('#coordinates').html(x + ', ' + y + ' px' + ', #' + tileId);
                        if (-1 !== this.data.disabledTileIds.indexOf(tileId)) {
                            console.log("found disabled tile: " + tileId);
                            tileId = null;
                        }
                        return tileId;
                    }
                }
            }
            return null;
        },

        /**
         * This is used for pre-computing.  Should not be invoked externally.
         * @todo hide this so it's not externall accessible.
         */
        _tileIdToBox: function(tileId) {
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
        },

        fillTile: function(tileId, destImage, context) {
            var tileIds = [tileId];
            if ('undefined' !== typeof this.data.mergeInfo[tileId]) {
                tileIds = this.data.mergeInfo[tileId];
            }
            _.each(tileIds, function(tileId) {
                console.log(tileId);
                console.log(context);
                var box = this.boxAtTileId[tileId];
                context.drawImage(
                    destImage,
                    box.topLeft.x,
                    box.topLeft.y,
                    box.bottomRight.x - box.topLeft.x,
                    box.bottomRight.y - box.topLeft.y,
                    box.topLeft.x,
                    box.topLeft.y,
                    box.bottomRight.x - box.topLeft.x,
                    box.bottomRight.y - box.topLeft.y
                );
            }, this);
        },

        clearTile: function(tileId, context) {
            var tileIds = [tileId];
            if ('undefined' !== typeof this.data.mergeInfo[tileId]) {
                tileIds = this.data.mergeInfo[tileId];
            }
            _.each(tileIds, function(tileId) {
                var box = this.boxAtTileId[tileId];
                context.clearRect(
                    box.topLeft.x,
                    box.topLeft.y,
                    box.bottomRight.x - box.topLeft.x,
                    box.bottomRight.y - box.topLeft.y
                );
            }, this);
        },

        tileClick: function(e) {
            var box = CanvasMouse.getBox();
            var tileId = CanvasMouse.getTileId();
            //console.log(box);
            console.log(this);
            if (null != tileId && null !== box) {
                this.state[tileId] = ++this.state[tileId] % 4;
                if (0 === this.state[tileId]) {
                    img.clearTile(tileId, fgContext);
                } else {
                    img.fillTile(tileId, this.images[this.state[tileId]], fgContext);
                }
            }
        }

	});

    var bgCanvas = $('.bg')[0];//document.getElementById('canvasLayer0');
    var bgContext = bgCanvas.getContext('2d');

    var fgCanvas = $('.fg')[0];//document.getElementById('canvasLayer1');
    var fgContext = fgCanvas.getContext('2d');

    var imageLocations = [
        "childFront.png",
        "childFront-1.png",
        "childFront-2.png",
        "childFront-3.png",
        "childFront-4.png"
    ];
	var img = new BSAImage(imageLocations, data);

    _.each(img.images, function(image) {
        image.offset = {top: 0, left: 0};
    });

    img.bgImage.onload = function() {
        bgContext.drawImage(img.bgImage, img.bgImage.offset.top, img.bgImage.offset.left, img.bgImage.width, img.bgImage.height);
    }

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

        return {
            canvas: function() {
                return _canvas;
            },
            getBox: function() {
                return _box;
            },
            getTileId: function() {
				//console.log('gettileId:' + _lastTileId);
                return _lastTileId;
            },
            getLastCoordinates: function() {
                return [_x, _y];
            }
        };
    })(img);

    console.log('done');
});

