
if (typeof(Worker) !== undefined) {
    let w = new Worker("./raytracer2Worker.js");

    let sizeNotSet = true;
    function drawToCanvas(data) {
        const [[IMAGE_WIDTH, IMAGE_HEIGHT], newlyRenderedPixels] = data;

        const canvas = document.querySelector("#raytracer-out-canvas");
        if (canvas === null) { return; } // No Canvas = don't draw ever again
        const context = canvas.getContext('2d');

        // Set the size of the canvas, but resetting the size clears the canvas
        //  so only do it the first time (before any of the pixels have been drawn)
        if (sizeNotSet) {
            canvas.width = IMAGE_WIDTH;
            canvas.height = IMAGE_HEIGHT;
            sizeNotSet = false;
        }

        for (let [x, y, [r, g, b]] of newlyRenderedPixels) {
            context.fillStyle = `rgb(${r}, ${g}, ${b})`;

            // Need to inverse y because the image was rendered with the y-axis going up but canvas
            //  has the y-axis go down
            context.fillRect(x, IMAGE_HEIGHT - y - 1, 1, 1);
        }
    }

    w.onmessage = (event) => {
        drawToCanvas(event.data);
    }

} else {
    alert("Web workers are not supported by your browser so the ray tracing can't happen.");
}
