let log = safeLogger(1000, false);
let slog = safeLogger(1000, true);

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

    toString() {
        return `<Vec3(${this.x}, ${this.y}, ${this.z})>`;
    }

    nearZero() {
        // Return true if the vector is close to zero in all dimensions
        const s = Math.pow(10, -8);
        return ((Math.abs(this.x) < s) && (Math.abs(this.y) < s) && (Math.abs(this.z) < s));
    }

    random(min=0.0, max=1.0) {
        return new this.constructor(randomDouble(min, max), randomDouble(min, max), randomDouble(min, max));
    }

    copy() {
        return new this.constructor(this.x, this.y, this.z);
    }

    negative() {
        return new this.constructor(-this.x, -this.y, -this.z);
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

    plus(vec3) {
        return new this.constructor((this.x + vec3.x), (this.y + vec3.y), (this.z + vec3.z));
    }

    plusNum(num) {
        return new this.constructor((this.x + num), (this.y + num), (this.z + num));
    }

    minus(vec3) {
        return new this.constructor((this.x - vec3.x), (this.y - vec3.y), (this.z - vec3.z));
    }

    minusNum(num) {
        return new this.constructor((this.x - num), (this.y - num), (this.z - num));
    }

    times(vec3) {
        return new this.constructor((this.x * vec3.x), (this.y * vec3.y), (this.z * vec3.z));
    }

    timesNum(num) {
        return new this.constructor((this.x * num), (this.y * num), (this.z * num));
    }
    
    divBy(vec3) {
        return new this.constructor((this.x / vec3.x), (this.y / vec3.y), (this.z / vec3.z));
    }

    divByNum(num) {
        return new this.constructor((this.x / num), (this.y / num), (this.z / num));
    }

    dot(vec3) {
        return (this.x * vec3.x) + (this.y * vec3.y) + (this.z * vec3.z);
    }

    cross(vec3) {
        return new this.constructor(
            (this.y * vec3.z) - (this.z * vec3.y),
            (this.z * vec3.x) - (this.x * vec3.z),
            (this.x * vec3.y) - (this.y * vec3.x)
        );
    }

    unitVector() {
        return this.divByNum(this.length());
    }
}

// Vec3 aliases
class Color extends Vec3 {
    get r() { return this.x; }
    set r(newR) { this.x = newR; }
    get g() { return this.y; }
    set g(newG) { this.y = newG; }
    get b() { return this.z; }
    set b(newB) { this.z = newB; }

    toString() {
        return `<Color(${this.r}, ${this.g}, ${this.b})>`;
    }
}

class Point3D extends Vec3 {
    toString() {
        return `<Point3D(${this.x}, ${this.y}, ${this.z})>`;
    }
}

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

    toString() {
        return `<Ray(origin=${this.origin}, direction=${this.direction})>`
    }

    /**
     * Returns the position of this ray at the given time (Number) t
     */
    at(t) {
        return (this.origin.plus(this.direction.timesNum(t)))
    }
}

class HitRecord {
    constructor() {
        this.p = null;      // Point3D
        this.normal = null; // Vec3
        this.matPtr = null; // Will be a Material
        this.t = 0;         // Number
        this.frontFace; // bool, true if this record represents the face of an object facing towards the source of the arry or false if this represents the hit of a face facing away from the source of the ray
    }

    toString() {
        return `<HitRecord(p=${this.p}, normal=${this.normal}, material=${this.matPtr}, t=${this.t}, frontFace=${this.frontFace})>`;
    }

    setFaceNormal(ray, outwardNormal) {
        this.frontFace = ray.direction.dot(outwardNormal) < 0;
        this.normal = this.frontFace ? outwardNormal : outwardNormal.negative();
    }
}

class Hittable {
    hitBy(ray) {
        throw "hitBy is not Implemented for this hittable object.";
    }

    toString() {
        return `<Hittable()>`;
    }
}

class Sphere extends Hittable {
    constructor(center, radius, material) {
        super();
        this.center = center;   // Vec3
        this.r = radius;        // Number
        this.matPtr = material; // Material
    }

    toString() {
        return `<Sphere(center=${this.center}, radius=${this.r}, material=${this.matPtr})>`;
    }

    hitBy(ray, tMin, tMax, hitRecord) {
        let oc = ray.origin.minus(this.center);
        let a = ray.direction.lengthSquared();
        let halfB = oc.dot(ray.direction);
        let c = oc.lengthSquared() - (this.r * this.r);

        let discriminant = (halfB * halfB) - (a * c);
        if (discriminant < 0) { return false; }
        let sqrtD = Math.sqrt(discriminant);

        // find the nearest root that lies in the acceptable range to determine
        //  if the sphere was hit
        let root = (-halfB - sqrtD) / a;
        if ((root < tMin) || (tMax < root)) {
            root = (-halfB + sqrtD) / a;
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
    constructor() {
        this.hittables = [];
    }

    toString() {
        return `<HittableList(hittables=[${this.hittables}])>`;
    }

    add(hittable) {
        this.hittables.push(hittable);
    }
    
    hitBy(ray, tMin, tMax, hitRecord) {
        let hitAnything = false;
        let closestSoFar = tMax;

        for (let hittable of this.hittables) {
            if (hittable.hitBy(ray, tMin, closestSoFar, hitRecord)) {
                hitAnything = true;
                closestSoFar = hitRecord.t;
            }
        }

        return hitAnything;
    }
}

class Material {
    scatter(rIn, hitRecord) {
        throw Error('Method "scatter" is not implemented for this class.');
    }

    toString() {
        return `<Material()>`
    }
}

class Lambertian extends Material {
    constructor(albedo) {
        super();
        this.albedo = albedo; // Color of the Material
    }

    toString() {
        return `<Lambertian(albedo=${this.albedo})>`
    }

    scatter(rIn, hitRecord) {
        let scatterDirection = hitRecord.normal.plus(randomUnitVector());

        if (scatterDirection.nearZero()) {
            scatterDirection = hitRecord.normal;
        }

        this.scattered = new Ray(hitRecord.p, scatterDirection);
        this.attenuation = this.albedo;
        return true;
    }
}

class Metal extends Material {
    constructor(albedo, fuzz) {
        super();
        this.albedo = albedo; // Color of the metal
        this.fuzz = (fuzz < 1) ? fuzz : 1;
    }

    toString() {
        return `<Metal(albedo=${this.albedo}, fuzz=${this.fuzz})>`
    }

    scatter(rIn, hitRecord) {
        let reflected = reflect(rIn.direction.unitVector(), hitRecord.normal);

        this.scattered = new Ray(hitRecord.p, reflected.plus(randomInUnitSphere().timesNum(this.fuzz)));
        this.attenuation = this.albedo;
        return (this.scattered.direction.dot(hitRecord.normal) > 0);
    }
}

class Dielectric extends Material {
    constructor(indexOfRefraction) {
        super();
        this.ir = indexOfRefraction;
    }

    toString() {
        return `<Dialectric(indexOfRefraction=${this.ir})>`
    }

    reflectance(cosine, refIdx) {
        let r0 = (1 - refIdx) / (1 + refIdx);
        r0 = r0 * r0;
        return r0 + (1 - r0) * Math.pow((1 - cosine), 5);
    }

    scatter(rIn, hitRecord) {
        this.attenuation = new Color(1.0, 1.0, 1.0);
        let refractionRatio = hitRecord.frontFace ? (1.0 / this.ir) : this.ir;

        let unitDirection = rIn.direction.unitVector();
        let cosTheta = Math.min(unitDirection.negative().dot(hitRecord.normal), 1.0);
        let sinTheta = Math.sqrt(1.0 - (cosTheta * cosTheta));

        let cannotRefract = refractionRatio * sinTheta > 1.0;
        let direction;

        if (cannotRefract || (this.reflectance(cosTheta, refractionRatio) > randomDouble(0.0, 1.0))) {
            direction = reflect(unitDirection, hitRecord.normal);
        } else {
            direction = refract(unitDirection, hitRecord.normal, refractionRatio);
        }

        this.scattered = new Ray(hitRecord.p, direction);

        return true;
    }
}

class Camera {
    constructor(
            lookfrom,
            lookat,
            vup,
            vfov, // Vertical field of view in degrees
            aspectRatio,
            aperture,
            focusDist
        ) {

        let theta = degreesToRadians(vfov);
        let h = Math.tan(theta/2);
        this.viewportHeight = 2.0 * h;
        this.viewportWidth = aspectRatio * this.viewportHeight;

        this.w = lookfrom.minus(lookat).unitVector();
        this.u = vup.cross(this.w).unitVector();
        this.v = this.w.cross(this.u);

        this.origin = lookfrom;
        this.horizontal = this.u.timesNum(this.viewportWidth).timesNum(focusDist);
        this.vertical = this.v.timesNum(this.viewportHeight).timesNum(focusDist);
        this.lowerLeftCorner = this.origin.minus(this.horizontal.divByNum(2)).minus(this.vertical.divByNum(2)).minus(this.w.timesNum(focusDist));

        this.lensRadius = aperture / 2;
    }

    getRay(s, t) {
        let rd = randomInUnitDisk().timesNum(this.lensRadius);
        let offset = this.u.timesNum(rd.x).plus(this.v.timesNum(rd.y));

        let direction = this.lowerLeftCorner.plus(this.horizontal.timesNum(s)).plus(this.vertical.timesNum(t)).minus(this.origin).minus(offset);
        return new Ray(this.origin.plus(offset), direction);
    }
}

// ----------------------------------------------------------------------------
// Helper Functions

function degreesToRadians(degrees) {
    return degrees * (PI / 180);
}

/**
 * Returns a random decimal value number in [min, max)
 * 
 * If neither min nor max are specified, the range is assumed to be [0, 1)
 */
function randomDouble(min=0.0, max=1.0) {
    return (min + ((max - min) * Math.random()));
}

/**
 * Returns a random integer value in [min, max]
 */
function randomInt(min=0, max=1.0) {
    return Math.round(randomDouble(min, max));
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

function reflect(v, n) {
    return v.minus(n.timesNum(v.dot(n) * 2));
}

function refract(uv, n, etaiOverEtat) {
    let cosTheta = Math.min(uv.negative().dot(n), 1.0);
    const rOutPerp = uv.plus(n.timesNum(cosTheta)).timesNum(etaiOverEtat);
    const rOutParallel = n.timesNum(-Math.sqrt(Math.abs(1.0 - rOutPerp.lengthSquared())));

    return rOutPerp.plus(rOutParallel);
}

function inBox(x, y, left, right, top, bottom) {
    return (left <= x && x <= right && top <= y && y <= bottom);
}

function randomInUnitDisk() {
    while (true) {
        let p = new Vec3(randomDouble(-1,1), randomDouble(-1,1), 0);
        if (p.lengthSquared() >= 1) continue;
        return p;

    }
}

// ----------------------------------------------------------------------------
// Render

function rayColor(ray, world, depth) {
    let hitRecord = new HitRecord();

    if (depth <= 0) {
        return new Color(0.0, 0.0, 0.0);
    }

    if (world.hitBy(ray, 0.001, Infinity, hitRecord)) {
        if (hitRecord.matPtr.scatter(ray, hitRecord)) {
            return hitRecord.matPtr.attenuation.times(rayColor(hitRecord.matPtr.scattered, world, depth - 1));
        }
        return new Color(0.0, 0.0, 0.0);
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
function main(renderPattern=null) {

    // Image Dimensions
    const ASPECT_RATIO = 16.0 / 9.0;
    const IMAGE_WIDTH = 400.0;
    const IMAGE_HEIGHT = Math.round(IMAGE_WIDTH / ASPECT_RATIO);
    const SAMPLES_PER_PIXEL = 50;
    const MAX_DEPTH = 50;

    const newlyRenderedPixels = [];

    // Helper Function that writes a pixel to the context
    function writePixel(imageX, imageY, r, g, b) {
        newlyRenderedPixels.push([imageX, imageY, [r, g, b]]);
    }

    // World
    /*
    let world = new HittableList();

    let materialGround = new Lambertian(new Color(0.8, 0.8, 0.0));
    let materialCenter = new Lambertian(new Color(0.1, 0.2, 0.5));
    let materialLeft = new Dielectric(1.5);
    let materialRight = new Metal(new Color(0.8, 0.6, 0.2), 0,0);

    world.add(new Sphere(new Point3D(0.0, -100.5, -1.0), 100.0, materialGround));
    world.add(new Sphere(new Point3D(0.0, 0.0, -1.0), 0.5, materialCenter));
    world.add(new Sphere(new Point3D(-1.0, 0.0, -1.0), 0.5, materialLeft));
    world.add(new Sphere(new Point3D(-1.0, 0.0, -1.0), -0.45, materialLeft));
    world.add(new Sphere(new Point3D(1.0, 0.0, -1.0), 0.5, materialRight));
    */

    let world = randomScene();

    // Camera

    const lookfrom = new Point3D(13, 2, 3);
    const lookat = new Point3D(0, 0, 0);
    const vup = new Vec3(0, 1, 0);
    const fieldOfView = 20;
    const aperture = 0.2;
    const distToFocus = 10;

    const camera = new Camera(lookfrom, lookat, vup, fieldOfView, ASPECT_RATIO, aperture, distToFocus);

    /*
    const lookfrom = new Point3D(-4, 1, 2);
    const lookat = new Point3D(0, 0, -1);
    const vup = new Vec3(0, 1, 0);
    const fieldOfView = 20;
    const distToFocus = lookfrom.minus(lookat).length();
    const aperture = 1.0

    const camera = new Camera(lookfrom, lookat, vup, fieldOfView, ASPECT_RATIO, aperture, distToFocus);
    */

    // --- Render

    function renderPixel(x, y) {
        let pixelColor = new Color(0, 0, 0);

        // Take a bunch of samples around the pixel to do antialiasing
        for (let s = 0; s < SAMPLES_PER_PIXEL; ++s) {
            let u = (x + randomDouble(0, 1.0)) / (IMAGE_WIDTH - 1);
            let v = (y + randomDouble(0, 1.0)) / (IMAGE_HEIGHT - 1);
            pixelColor.plusEq(rayColor(camera.getRay(u, v), world, MAX_DEPTH));
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

    if (!(renderPattern instanceof Function)) {
        // A simple default rendering pattern that renders the image from left
        // to right, column by column
        renderPattern = function* (imageWidth, imageHeight) { 
            for (let x = 0; x <= imageWidth; x++) {
                for (let y = 0; y <= imageHeight; y++) {
                    yield [[x, y]];
                }
            }
        }
    }

    // A The function takes in the width and height of the image and will be continually
    //  called to get a list of [x, y] values to be rendered before posting the newly-drawn
    //  pixels
    const renderPointsGen = renderPattern(IMAGE_WIDTH, IMAGE_HEIGHT);

    // Render the image
    while (true) {

        // Get next batch of pixel [x, y] coords to be rendered
        let ret = renderPointsGen.next();

        let pixels = ret.value;

        if (ret.done) {
            postMessage([[IMAGE_WIDTH, IMAGE_HEIGHT], [], true]);
            break;
        } 

        // render the pixels
        for (let [x, y] of pixels) {

            // If a pixel is not in the image then don't render it
            if (inBox(x, y, 0, IMAGE_WIDTH, 0, IMAGE_HEIGHT)) {
                renderPixel(x, y);
            }
        }

        // Post the pixels to be drawn to the image
        postMessage([[IMAGE_WIDTH, IMAGE_HEIGHT], newlyRenderedPixels, false]);
        newlyRenderedPixels.splice(0, newlyRenderedPixels.length);
    }
}

this.onmessage = (event) => {
    let renderPattern = event.data.renderPattern;

    if (renderPattern !== undefined && renderPattern !== null) {
        let numRows = (renderPattern.numRows === undefined) ? 1 : renderPattern.numRows;
        let numCols = (renderPattern.numCols === undefined) ? 1 : renderPattern.numCols;
        numRows = (numRows < 1) ? 1 : numRows;
        numCols = (numCols < 1) ? 1 : numRows;

        let pattern = renderPattern.pattern.toLowerCase();

        if (pattern === "random") {
            let patterns = [
                "random-points",
                "outside-in",
                "iter-box" // proxy for left-up-row below so 1/3 chance of happening
            ];
            pattern = patterns[randomInt(0, patterns.length - 1)];

            if (pattern === "iter-box") {
                patterns = [
                    "left-up-row", "right-up-row", "left-down-row", "right-down-row",
                    "left-up-col", "right-up-col", "left-down-col", "right-down-col"
                ];
                pattern = patterns[randomInt(0, patterns.length - 1)];
            }
        }

        switch (pattern) {
            case "random-points":
                renderPattern = boxesPattern(numRows, numCols, randomPointsInBox);
                break;
            case "outside-in":
                renderPattern = boxesPattern(numRows, numCols, pointsFromOutsideIn);
                break;

            case "left-up-row":
            case "right-up-row":
            case "left-down-row":
            case "right-down-row":
            case "left-up-col":
            case "right-up-col":
            case "left-down-col":
            case "right-down-col":
                let [toRight, toBottom, row] = [pattern.includes("right"), pattern.includes("down"), pattern.includes("row")];
                renderPattern = boxesPattern(numRows, numCols, iterBoxGen(toRight, toBottom, row));
                break;

            default:
                renderPattern = null;
        }
    }

    main(renderPattern);
}

// Helper Functions
function randomScene() {
    let world = new HittableList();

    const ground_mt = new Lambertian(new Color(0.5, 0.5, 0.5));
    world.add(new Sphere(new Point3D(0, -1000, 0), 1000, ground_mt));

    let randomAmount = 11;
    for (let i = -randomAmount; i < randomAmount; ++i) {
        for (let j = -randomAmount; j < randomAmount; ++j) {
            let mat = randomDouble();
            let center = new Point3D(i + (0.9 * randomDouble()), 0.2, j + (0.9 * randomDouble()));

            if (center.minus(new Point3D(4, 0.2, 0)).length() > 0.9) {
                if (mat < 0.8) {
                    let albedo = Vec3.prototype.random().times(Vec3.prototype.random());
                    let sphereMaterial = new Lambertian(albedo);
                    world.add(new Sphere(center, 0.2, sphereMaterial));
                } else if (mat < 0.95) {
                    let albedo = Vec3.prototype.random(0.5, 1);
                    let fuzz = randomDouble(0, 0.5);
                    let sphereMaterial = new Metal(albedo, fuzz);
                    world.add(new Sphere(center, 0.2, sphereMaterial));
                } else {
                    let sphereMaterial = new Dielectric(1.5);
                    world.add(new Sphere(center, 0.2, sphereMaterial));
                }
            }
        }
    }

    const mat1 = new Dielectric(1.5);
    world.add(new Sphere(new Point3D(0, 1, 0), 1, mat1));

    const mat2 = new Lambertian(new Color(0.4, 0.2, 0.1));
    world.add(new Sphere(new Point3D(-4, 1, 0), 1, mat2));

    const mat3 = new Metal(new Color(0.7, 0.6, 0.5), 0);
    world.add(new Sphere(new Point3D(4, 1, 0), 1, mat3));

    return world;
}


// ---------------------------------------------------------------------------
// Render Patterns

function divImage(numCols, numRows, imageWidth, imageHeight, callback) {
    if (imageWidth < numCols) numCols = imageWidth;
    if (imageHeight < numRows) numRows = imageHeight;

    const boxWidth = Math.ceil(imageWidth / numCols);
    const boxHeight = Math.ceil(imageHeight / numRows);

    for (let y = 0; y < imageHeight; y += boxHeight) {
        for (let x = 0; x < imageWidth; x += boxWidth) {
            let [left, right, top, bottom] = [x, x + boxWidth, y, y + boxHeight];

            // Gaurantee that the square is inside the Image (although might be slightly smaller than other squares)
            //left = clamp(left, 0, imageWidth);
            //right = clamp(right, 0, imageWidth);
            //top = clamp(top, 0, imageHeight);
            //bottom = clamp(bottom, 0, imageHeight);

            // Gaurantee that the standard Graphics coordinate system is in use
            // with positive y going down and negative y going up
            if (left > right) [left, right] = [right, left];
            if (top > bottom) [top, bottom] = [bottom, top];

            // Call the callback with the dimensions of the current box
            callback(left, right, top, bottom);
        }
    }
}

function* iterBox(left, right, top, bottom, leftToRight=true, topToBottom=true, rowMajor=true) {
    let [colStart, colEnd, colDelta] = leftToRight ? [left, right + 1, 1] : [right, left - 1, -1];
    let [rowStart, rowEnd, rowDelta] = topToBottom ? [top, bottom + 1, 1] : [bottom, top - 1, -1];

    if (rowMajor) {
        for (let row = rowStart; row !== rowEnd; row += rowDelta) {
            for (let col = colStart; col !== colEnd; col += colDelta) {
                yield [col, row];
            }
        }
    } else {
        for (let col = colStart; col !== colEnd; col += colDelta) {
            for (let row = rowStart; row !== rowEnd; row += rowDelta) {
                yield [col, row];
            }
        }
    }
}

function iterBoxGen(leftToRight=true, topToBottom=true, rowMajor=true) {
    function iterBoxWrapper(left, right, top, bottom) {
        return iterBox(left, right, top, bottom, leftToRight, topToBottom, rowMajor);
    }
    return iterBoxWrapper;
}

function* pointsFromOutsideIn(left, right, top, bottom) {
    // Don't know why but need to shift box to not miss left and top edges on
    // left and top sides of full image
    left--; right--; top--; bottom--;

    let x = left; 
    let y = bottom; 

    let direction = 0; // 0 = left-right, 1 = bottom-top, 2 = right-left, 3 = top-bottom

    function move(x, y, direction) {
        switch (direction) {
            case 0: x++; break;
            case 1: y--; break;
            case 2: x--; break;
            case 3: y++; break;
        }
        return [x, y];
    }

    function shrinkBox(direction, left, right, top, bottom) {
        switch (direction) {
            case 0: top++; break;
            case 1: left++; break;
            case 2: bottom--; break;
            case 3: right--; break;
        }
        return [left, right, top, bottom];
    }

    while (true) {
        yield [x, y];

        let [nextX, nextY] = move(x, y, direction);

        if (!inBox(nextX, nextY, left, right, top, bottom)) {
            [left, right, top, bottom] = shrinkBox(direction, left, right, top, bottom);
            direction = (direction + 1) % 4;

            [nextX, nextY] = move(x, y, direction);

            if (!inBox(nextX, nextY, left, right, top, bottom)) {
                break;
            }
        }

        [x, y] = [nextX, nextY];
    }
}

function* randomPointsInBox(left, right, top, bottom) {
    const points = [];

    for (let y = top; y < bottom; y++) {
        for (let x = left; x < right; x++) {
            points.push([x, y]);
        }
    }

    while (0 < points.length) {
        let i = randomInt(0, points.length - 1);
        yield points.splice(i, 1)[0];
    }
}

function boxesPattern(numRows, numCols, genTemplate) {
    function* boxesPatternGen(imageWidth, imageHeight) {
        const renderGens = [];

        divImage(numRows, numCols, imageWidth, imageHeight, (left, right, top, bottom) => {
            renderGens.push(genTemplate(left, right, top, bottom));
        });

        while (0 < renderGens.length) {
            const yieldPoints = [];

            let i = 0;
            while (i < renderGens.length) {
                let ret = renderGens[i].next();

                if (ret.done) {
                    renderGens.splice(i, 1);
                    continue;
                }

                yieldPoints.push(ret.value);
                i++;
            }

            yield yieldPoints;
        }
    }
    return boxesPatternGen;
}



/**
 * Helper function that only allows you to log something using it a set number
 * of times, that way the website does not break because you tried to log something
 * 100000000000 times because this only lets you log it numTimes number of times before
 * it does not log anything else
 */
function safeLogger(numTimes=10, logToString=false) {
    function log() {
        if (numTimes > 0) {
            if (logToString) {
                let args = [];
                for (let arg of arguments) {
                    args.push(arg.toString());
                }
                console.log(...args);
            } else {
                console.log(...arguments);
            }
            numTimes--;
        }

        if (arguments.length === 1) {
            return arguments[0];
        }
    }
    return log;
}