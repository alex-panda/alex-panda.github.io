/**
 * Returns a random integer value in [min, max]
 */
function randomInt(min=0, max=1) {
    return (min + Math.round((max - min) * Math.random()));
}

if (typeof(Worker) !== undefined) {

    function startWorker(workerLocation, outCanvasId, renderPattern=null, x=0, y=0, width=0, height=0) {
        let w = new Worker(workerLocation);

        let sizeNotSet = true;
        function drawToCanvas(data) {
            const [[IMAGE_WIDTH, IMAGE_HEIGHT], newlyRenderedPixels, doneRayTracing] = data;

            const canvas = document.querySelector(outCanvasId);
            if (canvas === null) { return; } // No Canvas = don't draw ever again
            const context = canvas.getContext('2d');

            // Set the size of the canvas, but resetting the size clears the canvas
            //  so only do it the first time (before any of the pixels have been drawn)
            if (sizeNotSet) {
                canvas.width = IMAGE_WIDTH + width;
                canvas.height = IMAGE_HEIGHT + height;
                sizeNotSet = false;
            }

            for (let [pixX, pixY, [r, g, b]] of newlyRenderedPixels) {
                context.fillStyle = `rgb(${r}, ${g}, ${b})`;

                // Need to inverse y because the image was rendered with the y-axis going up but canvas
                //  has the y-axis go down
                context.fillRect(pixX + x, (IMAGE_HEIGHT - pixY) + y, 1, 1);
            }

            if (doneRayTracing) {
                // There are no more pixels to render after this because the
                // worker has finished ray tracing so just terminate the
                // webworker and be done.
                w.terminate();
                return;
            }
        }

        w.onmessage = (event) => {
            drawToCanvas(event.data);
        }

        w.postMessage({renderPattern:renderPattern});
    }

    /*
    // This is when motion blur was first introduced
    startWorker("./raytracer3Worker1.js", "#raytracer-out-canvas1", 
            {
                numRows:randomInt(1, 8), numCols:randomInt(1, 8), 
                pattern:"random"
            }, 0, -1, 0, 0);
    */


    // This is after the Axis-Aligned bounding boxes were implemented
    startWorker("./raytracer3Worker2.js", "#raytracer-out-canvas1", 
            {
                numRows:randomInt(1, 8), numCols:randomInt(1, 8), 
                pattern:"random"
            }, 0, -1, 0, 0);

} else {
    alert("Web workers are not supported by your browser so the ray tracing can't happen.");
}
