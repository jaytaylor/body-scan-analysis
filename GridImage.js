/**
 * @author Jay Taylor <outtatime@gmail.com>
 *
 * @date 2011-07-02
 *
 * Dependencies: jquery, underscore.js, html5
 */

if ('undefined' === typeof console) {
    this.console = { log: function() {} };
}

var message = "";

var GridImage = Class.extend({
    initRegions: function() {

    },

    init: function(srcImages, data, offset, bgCanvas, fgCanvas) {
        this.data = data;
        this.offset = offset;

        this.bgCanvas = bgCanvas;
        this.fgCanvas = fgCanvas;

        this.bgContext = this.bgCanvas.getContext('2d');
        this.fgContext = this.fgCanvas.getContext('2d');

        this.images = [];
        _.each(srcImages, function(src) {
            var idx = this.images.push(new Image()) - 1;
            this.images[idx].src = src;
            this.images[idx].offset = this.offset;
        }, this);

        this.bgImage = this.images[0];

        this.state = {};
        this.boxAtTileId = {};
        this._initState();

        // Fill a merge object for easy accessibility from here on out.
        this.data.mergeInfo = {};
        _.each(data.mergeTileIds, function(list) {
            _.each(list, function(tileId) {
                this.data.mergeInfo[tileId] = list;
            }, this);
        }, this);

        //this.stage = new Kinetic.Stage(this.fgCanvas);

        var thiz = this;
        this.bgImage.onload = function() {
            //thiz.stage.setDrawStage(function() {
            thiz.bgContext.drawImage(
                thiz.bgImage,
                thiz.bgImage.offset.top,
                thiz.bgImage.offset.left
            );
                /*function writeMessage(){
                    thiz.fgContext.font = "18pt Calibri";
                    thiz.fgContext.fillStyle = "black";
                    thiz.fgContext.fillText(message, 10, 25);
                }
                _.each(thiz.state, function(tileId) {
                    thiz.stage.beginRegion();
                    thiz.fgContext.beginPath();
                    var box = thiz.boxAtTileId[tileId];
                    thiz.fgContext.rect(
                        box.topLeft.x,
                        box.topLeft.y,
                        box.width,
                        box.height
                    );

    thiz.fgContext.strokeRect(
                        box.topLeft.x,
                        box.topLeft.y,
                        box.width,
                        box.height
    );
    thiz.fgContext.strokeStyle = '#99ffff';
    thiz.fgContext.stroke();
                    thiz.fgContext.closePath();
                    thiz.i = "iiiiiii";
                    thiz.stage.addRegionEventListener("onmouseout", function() {
                        console.log("outoutout TYPE = " + (typeof e) + ", " + thiz.i);
                    });
                    thiz.stage.addRegionEventListener("onmouseover", function() {
                        console.log("TYPE = " + (typeof e));
                    });
                    thiz.stage.addRegionEventListener("onmousedown", function() {
                        console.log("down TYPE = " + (typeof e));
                    });
                    thiz.stage.addRegionEventListener("onmouseup", function() {
                        console.log("up TYPE = " + (typeof e));
                    });
                    thiz.stage.closeRegion();
                });
                message = "hey";
                writeMessage();
            });*/
        }

        return this;
    },

    _initState: function() {
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
    },

    coordsToTileId: function(x, y) {
        x -= this.offset.left;
        y -= this.offset.top;
        var xAxis = this.data.gridMap.xAxis,
            yAxis = this.data.gridMap.yAxis;
        // Special case for tile 0.
        if (x > xAxis[0] && x <= xAxis[1] && y > yAxis[0] && y <= xAxis[1]) {
            // tileId = 0.
            $('#coordinates').html('(' + x + ', ' + y + ') ' + ', #0');
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
                    $('#coordinates').html('(' + x + ', ' + y + ') #' + tileId);
                    if (-1 !== this.data.disabledTileIds.indexOf(tileId)) {
                        //console.log("found disabled tile: " + tileId);
                        tileId = null;
                    }
                    //console.log("returning " + tileId);
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
                    x: xAxis[0] + this.offset.left,
                    y: yAxis[0] + this.offset.top
                },
                bottomRight: {
                    x: xAxis[1] + this.offset.left,
                    y: yAxis[1] + this.offset.top
                },
                width: (xAxis[1] - xAxis[0]),
                height: (yAxis[1] - yAxis[0])
            };
            return box;
        } else {
            for (var xLine=xAxis[1], i=1; i < xAxis.length; xLine=xAxis[++i]) {
                for (var yLine=yAxis[1], j=1; j < yAxis.length; yLine=yAxis[++j]) {
                    var tid = (xAxis.indexOf(xLine) - 1) * yAxis.length + (yAxis.indexOf(yLine) - 1);
                    if (tid === tileId) {
                        var box = {
                            topLeft: {
                                x: xAxis[xAxis.indexOf(xLine) - 1] + this.offset.left,
                                y: yAxis[yAxis.indexOf(yLine) - 1] + this.offset.top
                            },
                            bottomRight: {
                                x: xLine + this.offset.left,
                                y: yLine + this.offset.top
                            },
                            width: (xAxis[1] - xAxis[0]),
                            height: (yAxis[1] - yAxis[0])
                        };
                        return box;
                    }
                }
            }
            return null;
        }
    },

    fillTile: function(tileId, srcImage, context) {
        var tileIds = [tileId];
        if ('undefined' !== typeof this.data.mergeInfo[tileId]) {
            tileIds = this.data.mergeInfo[tileId];
        }
        _.each(tileIds, function(tileId) {
            //console.log("filling tileId=" + tileId);
            //console.log(context);
            var box = this.boxAtTileId[tileId];
            context.drawImage(
                srcImage,
                box.topLeft.x - this.offset.left,
                box.topLeft.y - this.offset.top,
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
        var tileId = this.coordsToTileId(e.clientX, e.clientY);
        console.log('tile clicked, tileId= ' + tileId);
        var box = this.boxAtTileId[tileId];
        console.log(box);
        if (null != tileId && null !== box) {
            this.state[tileId] = ++this.state[tileId] % 4;
            if (0 === this.state[tileId]) {
                this.clearTile(tileId, this.fgContext);
            } else {
                this.fillTile(tileId, this.images[this.state[tileId]], this.fgContext);
            }
        }
        this.updateStatus();
        var stateId = this.state[tileId];
        return stateId;
    },

    sums: function() {
        var numTilesMarked = 0,
            totalScore = 0,
            light = 0,
            medium = 0,
            dark = 0;
        console.log(this.state);
        for (var tileId in this.state) {
            totalScore += this.state[tileId];
            if (this.state[tileId] > 0) {
                ++numTilesMarked;
                switch(this.state[tileId]) {
                    case 1:
                        ++light;
                        break;
                    case 2:
                        ++medium;
                        break;
                    case 3:
                        ++dark;
                        break;
                }
            }
        };
        return {
            'numTilesMarked': numTilesMarked,
            'totalScore': totalScore,
            'light': light,
            'medium': medium,
            'dark': dark
        };
    },

    updateStatus: function() {
        var info = this.sums();
        $('#status').html(
            '<br /><table>' +
            '<tr><th>count light</th><td>' + info.light + '</td></tr>' +
            '<tr><th>count medium</th><td>' + info.medium + '</td></tr>' +
            '<tr><th>count dark</th><td>' + info.dark + '</td></tr>' +
            '<tr><th>#marked</th><td>' + info.numTilesMarked + '</td></tr>' +
            '<tr><th>score</th><td>' + info.totalScore + '</td></tr></table>'
        );
    }

});

