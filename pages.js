// This file provides the page definitions i.e. the html for the pages
import {main as raytracerPage1Main} from "./raytracer1.js";


// Functions that actually render the JS
function raytracerPage1() {
    let html = `
        <div id="raytracer-main">
            <div>
                After following the first 6 chapters of "Ray Tracing in One Weekend" by Peter
                Shirley, I have created a small raytracer capable of rendering spheres in
                various positions and differing colors. Bellow you can see two spheres, one
                extremely large one colored green and the another, much smaller, one colored
                based on its surface norms.
            </div>

            <div class="canvas-area center">
                <canvas id="raytracer-out-canvas"></canvas>
            </div>
        </div>
    `;

    let css_filenames = [];
    let js_filenames = [];
    let callbacks = [
        () => {
            const canvas = document.getElementById("raytracer-out-canvas");
            raytracerPage1Main(canvas);
        }
    ];
    return [html, css_filenames, js_filenames, callbacks];
}


// Map keys to the pages
const pageMap = {
    "home":raytracerPage1,
    "raytracer1":raytracerPage1
}

export {pageMap};