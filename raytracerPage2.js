import {main as raytracerPage2Main} from "./raytracer2.js";

export function raytracerPage2() {
    let html = `
        <div id="raytracer-main">
            <p>
                After following the next 6 chapters of "Ray Tracing in One Weekend" by Peter
                Shirley and thus finishing the book.
            </p>

            <div class="canvas-area center">
                <canvas id="raytracer-out-canvas"></canvas>
            </div>

            <ul>
                <li>My Goals</li>
                <ul>
                    
                </ul>
                <li>My Results</li>
                <li>My Work</li>
                <li>What I Learned</li>
            </ul>
        </div>
    `;

    let css_filenames = [];
    let js_filenames = [];
    let callbacks = [
        () => {
            const canvas = document.getElementById("raytracer-out-canvas");
            raytracerPage2Main(canvas);
        }
    ];
    return [html, css_filenames, js_filenames, callbacks];
}