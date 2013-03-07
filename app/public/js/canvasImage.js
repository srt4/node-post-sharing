/**
 * Light layer on top of a canvas element to represent an image displayed
 * within.  Pass in a canvas element and an Image object and you'll see the
 * image within the canvas element.  Use the provided methods (e.g. blur) to
 * manipulate it.
 *
 * @constructor
 * @param {HTMLElement} element HTML canvas element.
 * @param {Image} image Image object.
 */
var CanvasImage = function (element, image) {
    this.image = image;
    this.element = element;
    this.element.width = this.image.width;
    this.element.height = this.image.height;
    this.context = this.element.getContext("2d");
    this.context.drawImage(this.image, 0, 0);
};
CanvasImage.prototype = {
    /**
     * Runs a blur filter over the image.
     *
     * @param {int} strength Strength of the blur.
     */
    blur:function (strength) {
        this.context.globalAlpha = 0.5; // Higher alpha made it more smooth
        // Add blur layers by strength to x and y
        // 2 made it a bit faster without noticeable quality loss
        for (var y = -strength; y <= strength; y += 2) {
            for (var x = -strength; x <= strength; x += 2) {
                // Apply layers
                this.context.drawImage(this.element, x, y);
                // Add an extra layer, prevents it from rendering lines
                // on top of the images (does makes it slower though)
                if (x >= 0 && y >= 0) {
                    this.context.drawImage(this.element, -(x - 1), -(y - 1));
                }
            }
        }
        this.context.globalAlpha = 1.0;
    }
};

/**
 * Initialise an image on the page and blur it.
 */
window.onload = function () {
    $(".blur").each(function () {
        var that = this;
        var preload = new Image;
        preload.onload = function () {
            var cImage = new CanvasImage(that, this);
            cImage.blur(2);
        };
        preload.src = $(this).attr("src")
    });
};