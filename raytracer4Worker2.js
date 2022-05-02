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

    get(num) {
        switch (num) {
            case 0: return this.x;
            case 1: return this.y;
            case 2: return this.z;
            default: throw new Error(`${num} is not a valid index of the vector.`);
        }
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

    timesEqNum(num) {
        this.x *= num;
        this.y *= num;
        this.z *= num;
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

    minusedByNum(vec3) {
        return new this.constructor((num - this.x), (num - this.y), (num - this.z));
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
    constructor(origin, direction, time=0.0) {
        this.origin = origin;
        this.direction = direction;
        this.time = time; // The ONE time at which this Ray exists
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
        this.u = 0;         // Number
        this.v = 0;         // Number
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
        throw Error("hitBy is not Implemented for this hittable object.");
    }

    boundingBox(tim0, time1) {
        throw Error("boundingBox is not Implemented for this hittable object.");
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

    boundingBox(time0, time1) {
        this.outputBox = new AABB(this.center.minus(new Vec3(this.r, this.r, this.r)),
                                  this.center.plus( new Vec3(this.r, this.r, this.r)));
        return true;
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
        this.getSphereUv(outwardNormal, hitRecord);
        hitRecord.matPtr = this.matPtr;

        return true;
    }

    getSphereUv(p, hitRecord) {
        // p: a given point on the sphere of radius one, centered at the origin.
        // u: returned value [0,1] of angle around the Y axis from X=-1.
        // v: returned value [0,1] of angle from Y=-1 to Y=+1.
        //     <1 0 0> yields <0.50 0.50>       <-1  0  0> yields <0.00 0.50>
        //     <0 1 0> yields <0.50 1.00>       < 0 -1  0> yields <0.50 0.00>
        //     <0 0 1> yields <0.25 0.50>       < 0  0 -1> yields <0.75 0.50>

        let theta = Math.acos(p.negative().y);
        let phi = Math.atan2(p.negative().z, p.x) + PI;

        hitRecord.u = phi / (2 * PI);
        hitRecord.v = theta / PI;
    }
}

class MovingSphere extends Hittable {
    constructor(center0, center1, time0, time1, radius, material) {
        super();
        this.center0 = center0; // Vec3
        this.center1 = center1; // Vec3
        this.time0 = time0;     // Number
        this.time1 = time1;     // Number
        this.r = radius;   // Number
        this.matPtr = material; // Material
    }

    center(time) {
        return this.center0.plus(this.center1.minus(this.center0).timesNum((time - this.time0) / (this.time1 - this.time0)));
    }

    boundingBox(time0, time1) {
        let box0 = new AABB(this.center(time0).minus(new Vec3(this.r, this.r, this.r)),
                            this.center(time0).plus( new Vec3(this.r, this.r, this.r)));

        let box1 = new AABB(this.center(time1).minus(new Vec3(this.r, this.r, this.r)),
                            this.center(time1).plus( new Vec3(this.r, this.r, this.r)));
        this.outputBox = surroundingBox(box0, box1);
        return true;
    }

    hitBy(ray, tMin, tMax, hitRecord) {
        let oc = ray.origin.minus(this.center(ray.time));
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
        let outwardNormal = hitRecord.p.minus(this.center(ray.time)).divByNum(this.r);
        hitRecord.setFaceNormal(ray, outwardNormal);
        hitRecord.matPtr = this.matPtr;

        return true;
    }
}

class XYRect extends Hittable {
    constructor(x0, x1, y0, y1, k, material) {
        super();
        this.x0 = x0;
        this.x1 = x1;
        this.y0 = y0;
        this.y1 = y1;
        this.k = k;
        this.mp = material;
    }

    hitBy(ray, tMin, tMax, hitRecord) {
        let t = (this.k - ray.origin.z) / ray.direction.z;

        if (t < tMin || t > tMax) return false;

        let x = ray.origin.x + t * ray.direction.x;
        let y = ray.origin.y + t * ray.direction.y;

        if (x < this.x0 || x > this.x1 || y < this.y0 || y > this.y1) return false;

        hitRecord.u = (x - this.x0) / (this.x1 - this.x0);
        hitRecord.v = (y - this.y0) / (this.y1 - this.y0);
        hitRecord.t = t;

        let outwardNormal = new Vec3(0, 0, 1);
        hitRecord.setFaceNormal(ray, outwardNormal);
        hitRecord.matPtr = this.mp;
        hitRecord.p = ray.at(t);
        return true;
    }

    boundingBox(time0, time1) {
        this.outputBox = new AABB(new Point3D(this.x0, this.y0, this.k - 0.0001), new Point3D(this.x1, this.y1, this.k + 0.0001));
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

    boundingBox(time0, time1) {
        if (this.hittables.length === 0) return false;

        let tempBox = new AABB();
        let firstBox = true;

        for (let hittable of this.hittables) {
            if (!hittable.boundingBox(time0, time1)) return false;
            this.outputBox = firstBox ? tempBox : surroundingBox(this.outputBox, tempBox);
            firstBox = false;
        }
        return true;
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

    emitted(u, v, p) {
        return new Color(0, 0, 0);
    }
}

class Lambertian extends Material {
    constructor(albedo) {
        super();
        if (albedo instanceof Vec3) {
            this.albedo = new SolidColor(albedo);
        } else {
            this.albedo = albedo;
        }
    }

    toString() {
        return `<Lambertian(albedo=${this.albedo})>`
    }

    scatter(rIn, hitRecord) {
        let scatterDirection = hitRecord.normal.plus(randomUnitVector());

        if (scatterDirection.nearZero()) {
            scatterDirection = hitRecord.normal;
        }

        this.scattered = new Ray(hitRecord.p, scatterDirection, rIn.time);
        this.attenuation = this.albedo.value(hitRecord.u, hitRecord.v, hitRecord.p);
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

        this.scattered = new Ray(hitRecord.p, reflected.plus(randomInUnitSphere().timesNum(this.fuzz)), rIn.time);
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

        this.scattered = new Ray(hitRecord.p, direction, rIn.time);

        return true;
    }
}

class DiffuseLight extends Material {
    constructor(texture) {
        super();
        if (texture instanceof Vec3) {
            // Texture is actually just a color right now, so make it into a Texture
            this.emit = new SolidColor(texture);
        } else {
            this.emit = texture;
        }
    }

    scatter(rIn, hitRecord) {
        return false;
    }

    emitted(u, v, p) {
        return this.emit.value(u, v, p);
    }
}


// Represents an Axis-Aligned Bounding Box
class AABB extends Hittable {
    constructor(a, b) {
        super();
        if (a === undefined) a = new Vec3();
        if (b === undefined) b = new Vec3();
        this.min = a; // Point3D
        this.max = b; // Point3D
    }

    hitBy(ray, tMin, tMax) {
        for (let a = 0; a < 3; a++) {
            let invD = 1.0 / ray.direction.get(a);
            let t0 = (this.min.get(a) - ray.origin.get(a)) * invD;
            let t1 = (this.max.get(a) - ray.origin.get(a)) * invD;

            if (invD < 0.0) {
                // Swap the two
                [t0, t1] = [t1, t0];
            }

            tMin = t0 > tMin ? t0 : tMin;
            tMax = t1 < tMax ? t1: tMax;
            if (tMax <= tMin) {
                return false;
            }
        }
        return true;
    }
}

class BvhNode extends Hittable {
    constructor(hittableList, time0=null, time1=null, start=null, end=null) {
        super();
        if (Array.isArray(hittableList)) {
            this.hittables = hittableList;
        } else if (hittableList instanceof HittableList) {
            this.hittables = hittableList.hittables;
        } else {
            throw new Error(`hittableList "${hittableList}" is not of a valid type!`);
        }

        this.start = start = start ?? 0; // Number : index of hittableList that this node starts at
        this.end = end = end ?? this.hittables.length;     // Number : index of hittableList that this nod ends at
        this.time0 = time0 = time0 ?? 0; // Number
        this.time1 = time1 = time1 ?? 0; // Number

        // Things we will calculated below
        this.box; // Bounding box
        this.left; // Left Child
        this.right; // Right Child

        let axis = randomInt(0, 2); // Pick random axis (0=x, 1=y, 2=z)

        let comparator;
        switch (axis) {
            case 0: comparator = boxXCompare; break;
            case 1: comparator = boxYCompare; break;
            case 2: comparator = boxZCompare; break;
            default: throw new Error(`Unknown Axis "${axis}"`);
        }

        // Get length of this 
        let hittableSpan = end - start;

        if (hittableSpan === 1) {
            // If only one object in array, then both boxes are that one object
            this.right = this.hittables[start];
            this.left = this.right;
        } else if (hittableSpan === 2) {
            // If only 2 objects are in the array, then choose which one is left and right
            if (comparator(this.hittables[start], this.hittables[start + 1])) {
                this.left = this.hittables[start];
                this.right = this.hittables[start + 1];
            } else {
                this.left = this.hittables[start + 1];
                this.right = this.hittables[start];
            }
        } else {
            // Sort the array from this node's start to end without touching other parts of the array
            const hittablesToSort = this.hittables.slice(start, end);
            hittablesToSort.sort(comparator);
            this.hittables.splice(start, hittableSpan, ...hittablesToSort);

            let mid = start + Math.floor(hittableSpan / 2);
            this.left = new BvhNode(this.hittables, time0, time1, start, mid);
            this.right = new BvhNode(this.hittables, time0, time1, mid, end);
        }

        if (!this.left.boundingBox(time0, time1) || !this.right.boundingBox(time0, time1)) {
            throw new Error("No bounding box in BvhNode constructor!");
        }

        this.box = surroundingBox(this.left.outputBox, this.right.outputBox);
    }

    hitBy(ray, tMin, tMax, hitRecord) {
        if (!this.box.hitBy(ray, tMin, tMax)) {
            return false;
        }

        let hitLeft = this.left.hitBy(ray, tMin, tMax, hitRecord);
        let hitRight = this.right.hitBy(ray, tMin, hitLeft ? hitRecord.t : tMax, hitRecord);

        return hitLeft || hitRight;
    }

    boundingBox(time0, time1) {
        this.outputBox = this.box;
        return true;
    }
}

class Texture {
    value(u, v, p) {
        throw new Error(`"value" method of Texture has not been written for this object.`);
    }
}

class SolidColor extends Texture {
    constructor(r=null, g=null, b=null) {
        super();

        // Can give nothing for all black texture, just r if r is a Color, or r,
        // g, and b if you want the color to be that specific rgb
        if (g === null && b === null) {
            if (r === null) {
                this.colorValue = new Color();
            } else {
                this.colorValue = r;
            }
        } else {
            this.colorValue = new Color(r, g, b);
        }
    }

    value(u, v, p) {
        return this.colorValue;
    }
}

class CheckerTexture extends Texture {
    constructor(even, odd) {
        super();
        if (!(even instanceof Texture)) {
            even = new SolidColor(even);
        }

        if (!(odd instanceof Texture)) {
            odd = new SolidColor(odd);
        }

        this.even = even;
        this.odd = odd;
    }

    value(u, v, p) {
        let sines = Math.sin(10 * p.x) * Math.sin(10 * p.y) * Math.sin(10 * p.z);

        if (sines < 0) {
            return this.odd.value(u, v, p);
        } else {
            return this.even.value(u, v, p);
        }
    }
}

class ImageTexture extends Texture {
    constructor(image=null) {
        super();
        this.width = image.width;
        this.height = image.height;
        this.image = image.data ?? image.image ?? null; // The image in [r, g, b, a, r1, g1, b1, a1, ...] format
        this.image = this.image.data ?? this.image;

        this.bytesPerPixel = 4; // Every pixel is 4 positions long
        this.bytesPerScanline = this.bytesPerPixel * this.width;
    }

    // Lookes up a pixel from the image based on uv coordinate
    value(u, v, p) {
        // If we have no texture data, then return solid red as a debugging aid.
        if (this.image == null) {
            return new Color(1,0,0);
        }

        // Clamp input texture coordinates to [0,1] x [1,0]
        u = clamp(u, 0.0, 1.0);
        v = 1.0 - clamp(v, 0.0, 1.0);  // Flip V to image coordinates

        let i = Math.floor(u * this.width);
        let j = Math.floor(v * this.height);

        // Clamp integer mapping, since actual coordinates should be less than 1.0
        if (i >= this.width)  i = this.width - 1;
        if (j >= this.height) j = this.height - 1;

        let colorScale = 1.0 / 255.0;

        let pixel = j * this.bytesPerScanline + i * this.bytesPerPixel;

        return new Color(colorScale * this.image[pixel], colorScale * this.image[pixel + 1], colorScale * this.image[pixel + 2]);
    }
}

class Perlin {
    constructor(pointCount=256) {
        this.pointCount = pointCount;

        this.ranvec = [];
        for (let i = 0; i < this.pointCount; i++) {
            this.ranvec.push(Vec3.prototype.random(-1, 1).unitVector());
        }

        this.permX = this.perlinGeneratePerm();
        this.permY = this.perlinGeneratePerm();
        this.permZ = this.perlinGeneratePerm();
    }
    
    noise(p) {
        let u = p.x - Math.floor(p.x);
        let v = p.y - Math.floor(p.y);
        let w = p.z - Math.floor(p.z);

        let i = Math.floor(p.x);
        let j = Math.floor(p.y);
        let k = Math.floor(p.z);

        let c = [];
        for (let di=0; di < 2; di++) {
            c.push([]);
            for (let dj=0; dj < 2; dj++) {
                c[di].push([]);
                for (let dk=0; dk < 2; dk++) {
                    c[di][dj].push(
                        this.ranvec[this.permX[(i + di) & 255] ^ 
                                    this.permY[(j + dj) & 255] ^
                                    this.permZ[(k + dk) & 255]
                        ]
                    );
                }
            }
        }

        return this.perlinInterp(c, u, v, w);
    }

    // Helper Functions

    perlinGeneratePerm() {
        let p = [];
        for (let i = 0; i < this.pointCount; i++) {
            p.push(i);
        }

        this.permute(p, this.pointCount);

        return p;
    }

    permute(p, n) {
        for (let i = n-1; i > 0; i--) {
            let target = randomInt(0, i);
            let tmp = p[i];
            p[i] = p[target];
            p[target] = tmp;
        }
    }

    perlinInterp(c, u, v, w) {
        let uu = u*u*(3-2*u);
        let vv = v*v*(3-2*v);
        let ww = w*w*(3-2*w);
        let accum = 0.0;

        for (let i=0; i < 2; i++) {
            for (let j=0; j < 2; j++) {
                for (let k=0; k < 2; k++) {
                    let weight = new Vec3(u - i, v - j, w - k);
                    accum +=  (i*uu + (1-i)*(1-uu))
                            * (j*vv + (1-j)*(1-vv))
                            * (k*ww + (1-k)*(1-ww))
                            * c[i][j][k].dot(weight);
                }
            }
        }
        return accum;
    }

    turb(p, depth=7) {
        let accum = 0.0;
        let tempP = p;
        let weight = 1.0;

        for (let i = 0; i < depth; i++) {
            accum += weight * this.noise(tempP);
            weight *= 0.5;
            tempP.timesEqNum(2);
        }

        return Math.abs(accum);
    }
}

class NoiseTexture extends Texture {
    constructor(scale=0) {
        super();
        this.scale = scale;
        this.noise = new Perlin();
    }

    value(u, v, p) {
        return (new Color(1, 1, 1)).timesEqNum(0.5).timesEqNum(1 + Math.sin(this.scale * p.z + 10 * this.noise.turb(p)));
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
            focusDist,
            time0 = 0,
            time1 = 0
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

        this.time0 = time0;
        this.time1 = time1;
    }

    getRay(s, t) {
        let rd = randomInUnitDisk().timesNum(this.lensRadius);
        let offset = this.u.timesNum(rd.x).plus(this.v.timesNum(rd.y));

        let direction = this.lowerLeftCorner.plus(this.horizontal.timesNum(s)).plus(this.vertical.timesNum(t)).minus(this.origin).minus(offset);
        return new Ray(this.origin.plus(offset), direction, randomDouble(this.time0, this.time1));
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
    return Math.floor(randomDouble(min, max + 1.0));
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

function surroundingBox(box0, box1) {
    let small = new Point3D(Math.min(box0.min.x, box1.min.x),
                            Math.min(box0.min.y, box1.min.y),
                            Math.min(box0.min.z, box1.min.z)
    );

    let big = new Point3D(Math.max(box0.max.x, box1.max.x),
                          Math.max(box0.max.y, box1.max.y),
                          Math.max(box0.max.z, box1.max.z)
    );
    return new AABB(small, big);
}

function boxCompare(a, b, axis) {
    if (!a.boundingBox(0, 0) || !b.boundingBox(0, 0)) {
        throw new Error("No bounding box in BvhNode constructor!");
    }

    return a.outputBox.min.get(axis) < b.outputBox.min.get(axis);
}

function boxXCompare(a, b) {
    return boxCompare(a, b, 0);
}

function boxYCompare(a, b) {
    return boxCompare(a, b, 1);
}

function boxZCompare(a, b) {
    return boxCompare(a, b, 2);
}

// ----------------------------------------------------------------------------
// Render

function rayColor(ray, background, world, depth) {
    let hitRecord = new HitRecord();

    if (depth <= 0) {
        return new Color(0.0, 0.0, 0.0);
    }

    // If the ray hits nothing, return the background color.

    if (!world.hitBy(ray, 0.001, Infinity, hitRecord)) {
        return background;
    }

    let emitted = hitRecord.matPtr.emitted(hitRecord.u, hitRecord.v, hitRecord.p);

    if (!hitRecord.matPtr.scatter(ray, hitRecord)) {
        return emitted;
    }

    let res = emitted.plus(hitRecord.matPtr.attenuation.times(rayColor(hitRecord.matPtr.scattered, background, world, depth - 1)))
    return res;
}

/**
 * The main function that renders the current scene.
 */
function main(renderPattern=null, images=null) {

    // Image Dimensions
    const ASPECT_RATIO = 16.0 / 9.0;
    const IMAGE_WIDTH = 400.0;
    const IMAGE_HEIGHT = Math.round(IMAGE_WIDTH / ASPECT_RATIO);
    const MAX_DEPTH = 50;

    const newlyRenderedPixels = [];

    // Helper Function that writes a pixel to the context
    function writePixel(imageX, imageY, r, g, b) {
        newlyRenderedPixels.push([imageX, imageY, [r, g, b]]);
    }

    // World

    let world;
    let lookfrom, lookat;
    let fieldOfView = 20.0;
    let aperture = 0.1;
    let samples_per_pixel = 100;
    let background = new Color(0, 0, 0);

    switch (0) {
        case 1:
            world = randomScene();
            background = new Color(0.70, 0.80, 1.00);
            lookfrom = new Point3D(13, 2, 3);
            lookat = new Point3D(0, 0, 0);
            fieldOfView = 20.0;
            aperture = 0.1;
            break
        case 2:
            world = twoSpheres();
            background = new Color(0.70, 0.80, 1.00);
            lookfrom = new Point3D(13, 2, 3);
            lookat = new Point3D(0, 0, 0);
            fieldOfView = 20.0;
            break;

        case 3:
            world = twoPerlinSpheres();
            background = new Color(0.70, 0.80, 1.00);
            lookfrom = new Point3D(13, 2, 3);
            lookat = new Point3D(0, 0, 0);
            fieldOfView = 20.0;
            break;

        case 4:
            world = earth(images.earthmap);
            background = new Color(0.70, 0.80, 1.00);
            lookfrom = new Point3D(13, 2, 3);
            lookat = new Point3D(0, 0, 0);
            vfov = 20.0;
            break;
        
        default:
        case 5:
            world = earthLight(images.earthmap);
            samples_per_pixel = 500;
            background = new Color(0, 0, 0);
            lookfrom = new Point3D(26, 3, 6);
            lookat = new Point3D(0, 2, 0);
            vfov = 20.0;
            break;
    }

    const vup = new Vec3(0, 1, 0);
    const distToFocus = 10;
    const time0 = 0;
    const time1 = 1;

    //world = new BvhNode(world, time0, time1);

    // Camera
    const camera = new Camera(lookfrom, lookat, vup, fieldOfView, ASPECT_RATIO, aperture, distToFocus, time0, time1);


    // --- Render

    function renderPixel(x, y) {
        let pixelColor = new Color(0, 0, 0);

        // Take a bunch of samples around the pixel to do antialiasing
        for (let s = 0; s < samples_per_pixel; ++s) {
            let u = (x + randomDouble(0, 1.0)) / (IMAGE_WIDTH - 1);
            let v = (y + randomDouble(0, 1.0)) / (IMAGE_HEIGHT - 1);
            pixelColor.plusEq(rayColor(camera.getRay(u, v), background, world, MAX_DEPTH));
        }

        // Figure out value of the antialiased pixel
        let [r, g, b] = [pixelColor.r, pixelColor.g, pixelColor.b];

        // Divide the color by the number of samples and gamma-correct for
        // gamma=2.0
        const scale = 1.0 / samples_per_pixel;
        r = Math.sqrt(r * scale);
        g = Math.sqrt(g * scale);
        b = Math.sqrt(b * scale);

        writePixel(x, y, 255 * clamp(r, 0.0, 1.0), 255 * clamp(g, 0.0, 1.0), 255 * clamp(b, 0.0, 1.0));
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
    let images = event.data.images;

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

    main(renderPattern, images);
}

// Helper Functions

function earthLight(earthmap) {
    let world = new HittableList();

    let earthTexture = new ImageTexture(earthmap);
    world.add(new Sphere(new Point3D(0, -1000, 0), 1000, new Lambertian(earthTexture)));
    world.add(new Sphere(new Point3D(0, 2, 0), 2, new Lambertian(earthTexture)));

    let difflight = new DiffuseLight(new Color(5, 5, 5)); // Light is over 1, 1, 1 so that it produces enough light to light up the other objects in the scene
    world.add(new XYRect(3, 5, 1, 3, -2, difflight));

    world.add(new Sphere(new Point3D(-4, 4, 4), 1, difflight));

    return world;
}

function earth(earthmap) {
    if (earthmap == undefined) {
        throw new Error("earthmap was undefined!");
    }

    let world = new HittableList();

    let earthTexture = new ImageTexture(earthmap);
    let earthSurface = new Lambertian(earthTexture);

    world.add(new Sphere(new Point3D(0, 0, 0), 2, earthSurface));

    return world;
}

function twoPerlinSpheres() {
    let world = new HittableList();

    const checker = new NoiseTexture(4);

    world.add(new Sphere(new Point3D(0, -1000, 0), 1000, new Lambertian(checker)));
    world.add(new Sphere(new Point3D(0,  2, 0), 2, new Lambertian(checker)));

    return world;
}

function twoSpheres() {
    let world = new HittableList();

    const checker = new CheckerTexture(new Color(0.2, 0.3, 0.1), new Color(0.9, 0.9, 0.9));

    world.add(new Sphere(new Point3D(0, -10, 0), 10, new Lambertian(checker)));
    world.add(new Sphere(new Point3D(0,  10, 0), 10, new Lambertian(checker)));

    return world;
}

function randomScene() {
    let world = new HittableList();

    const checker = new CheckerTexture(new Color(0.2, 0.3, 0.1), new Color(0.9, 0.9, 0.9));
    world.add(new Sphere(new Point3D(0, -1000, 0), 1000, new Lambertian(checker)));

    let randomAmount = 11;
    for (let i = -randomAmount; i < randomAmount; ++i) {
        for (let j = -randomAmount; j < randomAmount; ++j) {
            let mat = randomDouble();
            let center = new Point3D(i + (0.9 * randomDouble()), 0.2, j + (0.9 * randomDouble()));

            if (center.minus(new Point3D(4, 0.2, 0)).length() > 0.9) {
                if (mat < 0.8) {
                    // diffuse
                    let albedo = Vec3.prototype.random().times(Vec3.prototype.random());
                    let sphereMaterial = new Lambertian(albedo);
                    let center2 = center.plus(new Vec3(0, randomDouble(0, 0.5), 0));
                    world.add(new MovingSphere(center, center2, 0.0, 1.0, 0.2, sphereMaterial));
                } else if (mat < 0.95) {
                    // metal
                    let albedo = Vec3.prototype.random(0.5, 1);
                    let fuzz = randomDouble(0, 0.5);
                    let sphereMaterial = new Metal(albedo, fuzz);
                    world.add(new Sphere(center, 0.2, sphereMaterial));
                } else {
                    // glass
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