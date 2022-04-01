// ----------------------------------------------------------------------------
// Constants

const INFINITY = Infinity;
const PI = 3.1415926535897932385;

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

    nearZero() {
        // Return true if the vector is close to zero in all dimensions
        const s = 1 * Math.pow(10, -8);
        return ((Math.abs(this.x) < s) && (Math.abs(this.y) < s) && (Math.abs(this.z) < s));
    }

    random(min=0.0, max=1.0) {
        return new Vec3(randomDouble(min, max), randomDouble(min, max), randomDouble(min, max));
    }

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
        return `<Vec3(${this.x}, ${this.y}, ${this.z})>`;
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
    constructor(origin, direction) {
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
        this.frontFace; // bool, true if this record represents the face of an object facing towards the source of the arry or false if this represents the hit of a face facing away from the source of the ray
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
    constructor({center, radius, material}={}) {
        super();
        this.center = center;   // Vec3
        this.r = radius;        // Number
        this.matPtr = material; // Material
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
        hitRecord.matPtr = this.matPtr;

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

class Camera {
    constructor() {
        this.aspectRatio = 16.0 / 9.0;
        this.viewportHeight = 2.0;
        this.viewportWidth = this.aspectRatio * this.viewportHeight;
        this.focalLength = 1.0;

        this.origin = new Vec3(0.0, 0.0, 0.0);
        this.horizontal = new Vec3(this.viewportWidth, 0.0, 0.0);
        this.vertical = new Vec3(0.0, this.viewportHeight, 0.0);
        this.lowerLeftCorner = this.origin.minus(this.horizontal.divByNum(2.0)).minus(this.vertical.divByNum(2.0)).minus(new Vec3(0, 0, this.focalLength));
    }

    getRay(u, v) {
        return new Ray(
            this.origin,
            this.lowerLeftCorner.plus(this.horizontal.timesNum(u)).plus(this.vertical.timesNum(v))
        );
    }
}

// ----------------------------------------------------------------------------
// Helper Functions

/**
 * Returns a random decimal value number in [min, max)
 * 
 * If neither min nor max are specified, the range is assumed to be [0, 1)
 */
function randomDouble(min=0.0, max=0.1) {
    return (min + ((max - min) * Math.random()));
}

/**
 * Clamps the value x in the range [min, max]
 */
function clamp(x, min, max) {
    if (x < min) return min;
    if (x > max) return max;
    return x;
}

function randomInUnitSphere() {
    while (true) {
        let p = Vec3.prototype.random(-1.0, 1.0);
        if (p.lengthSquared() >= 1.0) continue;
        return p;
    } 
}

function randomUnitVector() {
    return randomInUnitSphere().unitVector();
}

function randomInHemisphere(normal) {
    let inUnitSphere = randomInUnitSphere();
    if (inUnitSphere.dot(normal) > 0.0) { // In the same hemisphure as the normal
        return inUnitSphere;
    } else {
        return inUnitSphere.negative();
    }
}

// ----------------------------------------------------------------------------
// Render

function rayColor(ray, world, depth) {
    let hitRecord = new HitRecord();

    if (depth <= 0) {
        return new Color(0.0, 0.0, 0.0);
    }

    if (world.hitBy(ray, 0.001, INFINITY, hitRecord)) {
        // Use this line for more accurate, newer Lambertian Reflection
        let target = hitRecord.p.plus(hitRecord.normal).plusEq(randomUnitVector());

        // Use this line less accurate, but more intuitive way of calculating reflection
        //  the difference between this method of calculating reflection and the
        //  one from the line above is slight but visible in complex scenes
        //let target = hitRecord.p.plus(randomInHemisphere(hitRecord.normal));
        return rayColor(new Ray(hitRecord.p, target.minus(hitRecord.p)), world, depth - 1).timesNum(0.5);
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
function main(renderPattern) {
    // Image Dimensions
    const ASPECT_RATIO = 16.0 / 9.0;
    const IMAGE_WIDTH = 400.0;
    const IMAGE_HEIGHT = IMAGE_WIDTH / ASPECT_RATIO;
    const SAMPLES_PER_PIXEL = 100;
    const MAX_DEPTH = 50;

    const newlyRenderedPixels = [];

    // Helper Function that writes a pixel to the context
    function writePixel(imageX, imageY, r, g, b) {
        newlyRenderedPixels.push([imageX, imageY, [r, g, b]]);
    }

    // World
    let world = new HittableList();
    world.hittables.push(new Sphere({center:new Point3D(0, 0, -1), radius:0.5}));
    world.hittables.push(new Sphere({center:new Point3D(0, -100.5, -1), radius:100}));

    // Camera
    const camera = new Camera();

    // --- Render

    function renderPixel(x, y) {
        let pixelColor = new Color(0, 0, 0);

        // Take a bunch of samples around the pixel to do antialiasing
        for (let s = 0; s < SAMPLES_PER_PIXEL; ++s) {
            let u = (x + randomDouble(0, 1.0)) / (IMAGE_WIDTH - 1);
            let v = (y + randomDouble(0, 1.0)) / (IMAGE_HEIGHT - 1);
            let r = camera.getRay(u, v);
            pixelColor.plusEq(rayColor(r, world, MAX_DEPTH));
        }

        // Figure out value of the antialiased pixel
        let [r, g, b] = [pixelColor.r, pixelColor.g, pixelColor.b];

        // Divide the color by the number of samples and gamma-correct for
        // gamma=2.0
        const scale = 1.0 / SAMPLES_PER_PIXEL;
        r = Math.sqrt(r * scale);
        g = Math.sqrt(g * scale);
        b = Math.sqrt(b * scale);

        writePixel(x, y, 256 * clamp(r, 0.0, 1.0), 256 * clamp(g, 0.0, 1.0), 256 * clamp(b, 0.0, 1.0));
    }

    let renderPatternGens;
    if (false) {
    } else {
        renderPatternGens = function () {

            let renderBox = function* (top, left, bottom, right) {
                for (let x = left; x <= right; x++) {
                    for (let y = top; y <= bottom; y++) {
                        yield;
                        renderPixel(x, y);
                    }
                }
                return;
            }

            // Initialize the render generators
            const renderGens = [];
            // Box is rendered inclusive so the pixels on the edges are all rendered
            renderGens.push(renderBox(0, 0, IMAGE_HEIGHT, IMAGE_WIDTH));
            return renderGens;
        }
    }

    const renderGens = renderPatternGens();

    /**
     *  Posts the message so that the JavaScript file that called this Worker
     *  can show the updated image to the user.
     */
    function drawImage(lastDraw=false) {
        postMessage([[IMAGE_WIDTH, IMAGE_HEIGHT], newlyRenderedPixels, lastDraw]);
        newlyRenderedPixels.splice(0, newlyRenderedPixels.length);
    }

    // Render the image
    let moreToRender = true;
    let renderCnt = 0;
    while (moreToRender) {
        moreToRender = false;

        // Render Next Batch of Pixels
        let i = 0;
        while (i < renderGens.length) {
            if (renderGens[i].next().done) {
                renderGens.splice(i, 1);
                continue;
            } else {
                moreToRender = true;
            }

            i++;
        }

        // Show the updated image to the user after so many batches have been
        // rendered
        renderCnt -= 1;
        if (renderCnt < 0) {
            drawImage();
            renderCnt = 10;
        }
    }
    drawImage(true); // make sure final image is drawn
}

this.onmessage = (data) => {
    main(data.renderPattern);
}



