import { utils } from "jsge";

function isCircleLineIntersect(x, y, r, line) {
    const x1 = line.x1,
        y1 = line.y1,
        x2 = line.x2,
        y2 = line.y2,
        vec1 = {x: x1 - x, y: y1-y}, //new Vector(x, y, x1, y1),
        vec2 = {x: x2 - x, y: y2-y}, //new Vector(x, y, x2, y2),
        vec3 = {x: x2 - x1, y: y2-y1}, //new Vector(x1 ,y1, x2, y2),
        vec4 = {x: x1 - x2, y: y1-y2}, //new Vector(x2, y2, x1, y1),
        vec3Len = Math.sqrt(Math.pow(vec3.x, 2) + Math.pow(vec3.y, 2)),//vec3.length,
        dotP1 = utils.dotProduct(vec1, vec4),
        dotP2 = utils.dotProduct(vec2, vec3);
        // checks if the line is inside the circle,
        // max_dist = Math.max(vec1Len, vec2Len);
    let min_dist;
    
    if (dotP1 > 0 && dotP2 > 0) {
        min_dist = utils.crossProduct(vec1,vec2)/vec3Len;
        if (min_dist < 0) {
            min_dist *= -1;
        }
    } else {
        min_dist = Math.min(vec1.length, vec2.length);
    }
    
    if (min_dist <= r) { // && max_dist >= r) {
        return {x1,y1,x2,y2,min_dist};
    } else {
        return false;
    } 
}

function circleLineCollision(x, y, r, line) {
    const dist = closestDistance(x, y, r, line);

    if (r >= dist) {
        return { x1:line.x1, y1: line.y1,x2:line.x2,y2:line.y2, min_dist:dist};
    } else {
        return false;
    }
}

function circleLineCollision2(x, y, r, line) {
    const x1 = line.x1,
        y1 = line.y1,
        x2 = line.x2,
        y2 = line.y2;

    const A = { x, y },
        B = { x:x1, y:y1 },
        C = { x:x2, y:y2 };

    const vecAB = sub(A, B),
        lenAB = len(vecAB),
        vecAC = sub(A, C),
        lenAC = len(vecAC);

    if (lenAB <= r) {
        return { x:x1, y:y1, d:r - lenAB, corner: true }
    }

    if (lenAC <= r) {
        return { x:x2, y:y2, d:r - lenAC, corner: true }
    }

    const isHorizontal = y1 === y2;

    let D;
    if (isHorizontal) {
        D = { x: x, y: y1 };
    } else {
        D = { x: x1, y: y };
    }

    const vecAD = sub(A, D),
        lenAD = len(vecAD);

    if (lenAD <= r) {
        let isPartOfLine;
        if (isHorizontal) {
            isPartOfLine = D.x > x1 && D.x < x2;
        } else {
            isPartOfLine = D.y > y1 && D.y < y2;
        }
        if (isPartOfLine) {
            return { x:D.x, y:D.y, d:r - lenAD, line,ball:[x,y], isHorizontal, corner: false }
        }
    } else {
        return false;
    }
}
function closestDistance(x, y, r, line) {
    const x1 = line.x1,
        y1 = line.y1,
        x2 = line.x2,
        y2 = line.y2;

    const A = {x:x1,y:y1},
        B = {x:x2,y:y2},
        C = {x, y};
     // Compute vectors AC and AB
     const AC = sub(C, A);
     const AB = sub(B, A);
 
     // Get point D by taking the projection of AC onto AB then adding the offset of A
     const D = add(proj(AC, AB), A);
 
     const AD = sub(D, A);
     // D might not be on AB so calculate k of D down AB (aka solve AD = k * AB)
     // We can use either component, but choose larger value to reduce the chance of dividing by zero
     const k = Math.abs(AB.x) > Math.abs(AB.y) ? AD.x / AB.x : AD.y / AB.y;
 
     // Check if D is off either end of the line segment
     if (k <= 0.0) {
         return Math.sqrt(hypot2(C, A));
     } else if (k >= 1.0) {
         return Math.sqrt(hypot2(C, B));
     }
 
     return Math.sqrt(hypot2(C, D));
}


const add = (a, b) => ({x: a.x + b.x, y: a.y + b.y});
const sub = (a, b) => ({x: a.x - b.x, y: a.y - b.y});
const dot = (a, b) => a.x * b.x + a.y * b.y;
const hypot2 = (a, b) => dot(sub(a, b), sub(a, b));
const len = (a) => (Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2)));

function proj(a, b) {
    const k = dot(a, b) / dot(b, b);
    return {x: k * b.x, y: k * b.y};
}


const ball = {x: 667.9943976945275, y:  126.61301510386431, r: 5},
    surface1 = {x1: 672, x2: 672, y1: 128, y2: 112},
    surface2 = {x1: 672, x2: 700, y1: 128, y2: 128},
    surface3 = {x1: 736, x2: 672, y1: 128, y2: 128};

console.log(circleLineCollision(ball.x,ball.y,ball.r, surface1));
console.log(circleLineCollision(ball.x,ball.y,ball.r, surface2));
console.log(circleLineCollision(ball.x,ball.y,ball.r, surface3));

//console.log(isCircleLineIntersect(ball.x,ball.y,ball.r, surface1));
//console.log(isCircleLineIntersect(ball.x,ball.y,ball.r, surface2));
//console.log(isCircleLineIntersect(ball.x,ball.y,ball.r, surface3));