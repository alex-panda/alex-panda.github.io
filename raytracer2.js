/**
 * Returns a random integer value in [min, max]
 */
function randomInt(min=0, max=1) {
    return (min + Math.round((max - min) * Math.random()));
}

if (typeof(Worker) !== undefined) {

    function startWorker(workerLocation, outCanvasId, renderPattern=null) {
        let w = new Worker(workerLocation);

        let sizeNotSet = true;
        function drawToCanvas(data) {
            const [[IMAGE_WIDTH, IMAGE_HEIGHT], newlyRenderedPixels] = data;

            const canvas = document.querySelector(outCanvasId);
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

        w.postMessage({renderPattern:renderPattern});
    }

    // This one renders a sphere on a surface to show off reflections and
    // resulting shadows 
    //startWorker("./raytracer2Worker1.js", "#raytracer-out-canvas");

    // Renders 3 spheres, showing off the ability of objects to have different
    // materials such as reflective metals, fuzzy-reflective metals, and matte
    // materials
    //startWorker("./raytracer2Worker2.js", "#raytracer-out-canvas");

    startWorker("./raytracer2Worker3.js", "#raytracer-out-canvas", 
            {
                numRows:randomInt(1, 12), numCols:randomInt(1, 12), 
                pattern:"random"
            });

} else {
    alert("Web workers are not supported by your browser so the ray tracing can't happen.");
}
