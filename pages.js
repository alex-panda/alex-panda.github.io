// This file provides the page definitions i.e. the html for the pages
import {main as raytracerPage1Main} from "./raytracer1.js";


// Functions that actually render the JS
function raytracerPage1() {
    let html = `
        <div id="raytracer-main">
            <p>
                After following the first 6 chapters of "Ray Tracing in One Weekend" by Peter
                Shirley, I have created a small raytracer capable of rendering spheres in
                various positions and differing colors. Below, you can see two spheres: one
                extremely large one colored green and another much smaller one colored
                based on its surface norms.
            </p>

            <div class="canvas-area center">
                <canvas id="raytracer-out-canvas"></canvas>
            </div>

            <p>
                Both of the above spheres (with a blue to white gradient
                background) were rendered in real time starting from the moment
                you opened this page of the website.
            </p>

            <p>
                Below is the source code for the raytracer that rendered the above image:
            </p>

            <code><pre>
// ----------------------------------------------------------------------------
// Helper Classes

class Vec3 {
    constructor(x=0, y=0, z=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get r() { return this.x; }
    set r(newR) { this.x = newR; }
    get g() { return this.y; }
    set g(newG) { this.y = newG; }
    get b() { return this.z; }
    set b(newB) { this.z = newB; }

    copy() {
        return new Vec3(this.x, this.y, this.z);
    }

    negative() {
        return new Vec3(-this.x, -this.y, -this.z);
    }

    minusEq(vec3) {
        this.x -= vec3.x;
        this.y -= vec3.y;
        this.z -= vec3.z;
        return this;
    }

    plusEq(vec3) {
        this.x += vec3.x;
        this.y += vec3.y;
        this.z += vec3.z;
        return this;
    }

    timesEq(vec3) {
        this.x *= vec3.x;
        this.y *= vec3.y;
        this.z *= vec3.z;
        return this;
    }

    divEq(vec3) {
        this.x /= vec3.x;
        this.y /= vec3.y;
        this.z /= vec3.z;
        return this;
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() {
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
    }

    toString() {
        return \`<Vec3(\${this.x}, \${this.y}, \${this.z})>\`;
    }

    toColorString() {
        return \`rgb(\${Math.floor(255.99 * this.r)},
                \${Math.floor(255.99 * this.g)}, \${Math.floor(255.99 * this.b)})\`
    }

    plus(vec3) {
        return new Vec3((this.x + vec3.x), (this.y + vec3.y), (this.z + vec3.z));
    }

    plusNum(num) {
        return new Vec3((this.x + num), (this.y + num), (this.z + num));
    }

    minus(vec3) {
        return new Vec3((this.x - vec3.x), (this.y - vec3.y), (this.z - vec3.z));
    }

    minusNum(num) {
        return new Vec3((this.x - num), (this.y - num), (this.z - num));
    }

    minusedByNum(num) {
        return new Vec3((num - this.x), (num - this.y), (num - this.z));
    }

    times(vec3) {
        return new Vec3((this.x * vec3.x), (this.y * vec3.y), (this.z * vec3.z));
    }

    timesNum(num) {
        return new Vec3((this.x * num), (this.y * num), (this.z * num));
    }
    
    divBy(vec3) {
        return new Vec3((this.x / vec3.x), (this.y /vec3.y), (this.z /vec3.z));
    }

    divByNum(num) {
        return new Vec3((this.x / num), (this.y / num), (this.z / num));
    }

    dot(vec3) {
        return (this.x * vec3.x) + (this.y * vec3.y) + (this.z * vec3.z);
    }

    cross(vec3) {
        return new Vec3(
            this.y * vec3.z - this.z * vec3.y,
            this.z * vec3.x - this.x * vec3.z,
            this.x * vec3.y - this.y * vec3.x
        );
    }

    unitVector() {
        return this.divByNum(this.length());
    }
}

// Vec3 aliases
const Color = Vec3;
const Point3D = Vec3;

const WHITE = new Color(1.0, 1.0, 1.0);
const BLACK = new Color(0.0, 0.0, 0.0);

/**
 * A class that represents a ray of light.
 */
class Ray {
    constructor({origin, direction}) {
        this.origin = origin;
        this.direction = direction;
    }

    /**
     * Returns the position of this ray at the given time (Number) t
     */
    at(t) {
        return (this.origin.plus(this.direction.timesNum(t)))
    }
}

class HitRecord {
    constructor({}={}) {
        this.p = new Point3D(0, 0, 0);   // Point3D
        this.normal = new Vec3(0, 0, 0); // Vec3
        this.t = 0;                      // Number

        // bool, true if this record represents the face of an object facing
        // towards the source of the arry or false if this represents the hit of
        // a face facing away from the source of the ray
        this.frontFace;
    }

    setFaceNormal(ray, outwardNormal) {
        this.frontFace = ray.direction.dot(outwardNormal) < 0;
        this.normal = this.frontFace ? outwardNormal : outwardNormal.negative();
    }

    become(hitRecord) {
        this.p = hitRecord.p;
        this.normal = hitRecord.normal;
        this.t = hitRecord.t;
        this.frontFace = hitRecord.frontFace;
    }
}

class Hittable {
    hitBy(ray) {
        throw "hitBy is not Implemented for this hittable object.";
    }
}

class Sphere extends Hittable {
    constructor({center, radius}={}) {
        super();
        this.center = center; // Vec3
        this.r = radius; // Number
    }

    hitBy(ray, tMin, tMax, hitRecord) {
        let oc = ray.origin.minus(this.center);
        let a = ray.direction.lengthSquared();
        let halfB = oc.dot(ray.direction);
        let c = oc.lengthSquared() - (this.r * this.r);

        let discriminant = (halfB * halfB) - (a * c);
        if (discriminant < 0) { return false; }
        let sqrtd = Math.sqrt(discriminant);

        // find the nearest root that lies in the acceptable range.
        let root = (-halfB - sqrtd) / a;
        if ((root < tMin) || (tMax < root)) {
            let root = (-halfB + sqrtd) / a;
            if ((root < tMin) || (tMax < root)) {
                return false;
            }
        }
        hitRecord.t = root;
        hitRecord.p = ray.at(hitRecord.t);
        let outwardNormal = hitRecord.p.minus(this.center).divByNum(this.r);
        hitRecord.setFaceNormal(ray, outwardNormal);

        return true;
    }
}

class HittableList {
    constructor({}={}) {
        this.hittables = [];
    }
    
    hitBy(ray, tMin, tMax, hitRecord) {
        let tempHitRecord = new HitRecord();

        let hitAnything = false;
        let closestSoFar = tMax;

        this.hittables.forEach((hittable) => {
            if (hittable.hitBy(ray, tMin, closestSoFar, tempHitRecord)) {
                hitAnything = true;
                closestSoFar = tempHitRecord.t;
                hitRecord.become(tempHitRecord);
            }
        });

        return hitAnything;
    }
}

// ----------------------------------------------------------------------------
// Constants

const INFINITY = Infinity;
const PI = 3.1415926535897932385;

// ----------------------------------------------------------------------------
// Render

function rayColor(ray, world) {
    let hitRecord = new HitRecord();
    if (world.hitBy(ray, 0, INFINITY, hitRecord)) {
        return ((hitRecord.normal.plus(WHITE)).timesNum(0.5));
    }

    // Background
    let unitDirection = ray.direction.unitVector();
    let t = 0.5 * (unitDirection.y + 1.0);
    return WHITE.timesNum(1.0 - t).plus((new Color(0.5, 0.7, 1.0)).timesNum(t));
}

/**
 * The main function. It asyncronously waits for every row of the raytraced
 * image to be rendered, then writes the resulting colors to the canvas.
 * 
 * Uses async so that the rendering is non-blocking and thus the internet
 * browser will not seize up.
 */
async function main(canvas) {
    if (canvas === undefined) {
        return;
    }

    const context = canvas.getContext('2d');

    // Helper Function that writes a pixel to the context
    function writePixel(imageX, imageY, color) {
        context.fillStyle = color;
        context.fillRect(imageX, imageY, 1, 1); // draw the pixel
    }

    // Image
    const ASPECT_RATIO = 16.0 / 9.0;
    const IMAGE_WIDTH = 400.0;
    const IMAGE_HEIGHT = IMAGE_WIDTH / ASPECT_RATIO;

    // Make sure that the canvas is the correct width and height
    canvas.width = IMAGE_WIDTH;
    canvas.height = IMAGE_HEIGHT;

    // World
    let world = new HittableList();
    world.hittables.push(new Sphere({center:new Point3D(0, 0, -1), radius:0.5}));
    world.hittables.push(new Sphere({center:new Point3D(0, -100.5, -1), radius:100}));

    // Camera
    const viewportHeight = 2.0;
    const viewportWidth = 2.0 * viewportHeight;
    const focalLength = 1.0;

    const origin = new Point3D(0.0, 0.0, 0.0);
    const horizontal = new Vec3(viewportWidth, 0.0, 0.0);
    const vertical = new Vec3(0.0, viewportHeight, 0.0);
    const lowerLeftCorner = origin.minus(horizontal.divByNum(2.0))
            .minus(vertical.divByNum(2.0)).minus(new Vec3(0, 0, focalLength));

    // --- Render

    // Clear the canvas
    context.save();
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.restore();

    /**
     * Renders a row of pixels of the picture.
     */
    async function rowColors(y) {
        y = y + 1;
        let colors = [];
        for (let x = 0; x < IMAGE_WIDTH; ++x) {
            let u = x / (IMAGE_WIDTH - 1);
            let v = y / (IMAGE_HEIGHT - 1);
            let ray = new Ray({
                origin:origin,
                direction:lowerLeftCorner.plus(horizontal.timesNum(u))
                        .plus(vertical.timesNum(v))
            });
            let raycolor = rayColor(ray, world).toColorString();

            // Have to do IMAGE_HEIGHT - y because raytracer assumes that
            // positive y goes upward, but on canvas it goes downward
            writePixel(x, IMAGE_HEIGHT - y, raycolor);
        }
        return colors;
    }

    let rows = [];
    // Use async to calculate each row
    for (let y = IMAGE_HEIGHT - 1; y >= 0; --y) {
        rows.push(rowColors(y));
    }

    // Make this function wait asyncronously for every pixel to be drawn before ending
    await Promise.all(rows);
}
            </pre></code>

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