import { GameStage } from "jsge";
import { CONST } from "../constants.js";
import { utils } from "jsge";

const CORNER_SHIFT = Math.PI/16;
const isPointRectIntersect = utils.isPointRectIntersect;

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

export class ArkanoidStage extends GameStage {

    #paddle;

    #ballDirection = Math.PI / 6;
    #barSpeed = 5;
    #ballSpeed = 6; /// 6 is max speed without bugs!
    #ballMoveInterval = 20; // ms
    #ballRadius = 5;
    #ball;

    #moveInterval;
    #isStickyBar = false;
    #isBallSticked = true;
    #keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false, Space: false };
    #tilemapKey = "blocksMap";
    #ballImageKey  = "ball-key";
    #paddleImageKey = "paddle-key";
    #greenBlocks;

    #collisionAudio = [];

    constructor() {
        super();
    }

    register() {
        this.iLoader.addImage(this.#ballImageKey, "/assets/images/ball.png");
        this.iLoader.addImage(this.#paddleImageKey, "/assets/images/paddle.png");
        this.iLoader.addTileMap(this.#tilemapKey, "/assets/level1.tmj");
        this.iLoader.addImage(CONST.IMAGE.PADDLE_BLUE, "/assets/images/paddleBlu.png");

        this.iLoader.addAudio(CONST.AUDIO.IMPACT_TIN_0, "/assets/audio/impactTin_medium_000.ogg");
        this.iLoader.addAudio(CONST.AUDIO.IMPACT_TIN_1, "/assets/audio/impactTin_medium_001.ogg");
        this.iLoader.addAudio(CONST.AUDIO.IMPACT_TIN_2, "/assets/audio/impactTin_medium_002.ogg");
        this.iLoader.addAudio(CONST.AUDIO.IMPACT_TIN_3, "/assets/audio/impactTin_medium_003.ogg");
    }

    init() {
        const [w, h] = this.stageData.worldDimensions,
            [canvasW, canvasH] = this.stageData.canvasDimensions;

        const background = this.draw.rect(0, 0, w, h, this.systemSettings.customSettings.gameBackgroundColor);

        this.#greenBlocks = this.draw.tiledLayer("green_blocks", this.#tilemapKey, true);

        this.#collisionAudio.push(this.iLoader.getAudio(CONST.AUDIO.IMPACT_TIN_0));
        this.#collisionAudio.push(this.iLoader.getAudio(CONST.AUDIO.IMPACT_TIN_1));
        this.#collisionAudio.push(this.iLoader.getAudio(CONST.AUDIO.IMPACT_TIN_2));
        this.#collisionAudio.push(this.iLoader.getAudio(CONST.AUDIO.IMPACT_TIN_3));

        this.#paddle = this.draw.image(w/2, h - 20, 64, 14, this.#paddleImageKey, 0);
        this.#ball = this.draw.image(this.#paddle.x, this.#paddle.y - this.#paddle.height / 2 - this.#ballRadius, 16, 16, this.#ballImageKey, 1, {r:this.#ballRadius});
    }
    start() {
        this.registerEventListeners();
    }

    stop() {
        this.unregisterEventListeners();
    }

    registerEventListeners() {
        //const canvas = this.getView(CONST.LAYERS.DEFAULT).canvas;
        if (this.systemSettings.customSettings.gameControls.find(el => (el === "mouse"))) {
            document.addEventListener("mousemove", this.#mouseHoverEvent);            
            document.addEventListener("click", this.#mouseClickEvent);
        } else {
            document.addEventListener("click", this.#mouseClickEvent);
            window.addEventListener("orientationchange", this.resize);
        }
        document.addEventListener("keydown", this.#pressKeyAction);
        document.addEventListener("keyup", this.#removeKeyAction);
    }
    #mouseHoverEvent = (event) => {
        
    };

    #mouseClickEvent = (event) => {

    };

    unregisterEventListeners() {
        //const canvas = this.getView(CONST.LAYERS.DEFAULT).canvas;
        if (this.systemSettings.customSettings.gameControls.find(el => (el === "mouse"))) {
            document.removeEventListener("mousemove", this.#mouseHoverEvent);            
            document.removeEventListener("click", this.#mouseClickEvent);
        } else {
            document.removeEventListener("click", this.#mouseClickEvent); 
            window.removeEventListener("orientationchange", this.resize);
        }
        document.removeEventListener("keydown", this.#pressKeyAction);
        document.removeEventListener("keyup", this.#removeKeyAction);
        document.body.style.cursor = "default";
    }

    
    #pressKeyAction = (event) => {
        const code = event.code;
        let keyPressed = this.#keyPressed,
            newXCoord = this.#paddle.x;

        keyPressed[code] = true;
        if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]) {
            newXCoord = newXCoord - this.#barSpeed;
        }
        if (keyPressed["ArrowRight"] || keyPressed["KeyD"]) {
            newXCoord = newXCoord + this.#barSpeed;
        }
        if (!this.isBoundariesCollision(newXCoord, this.#paddle.y, this.#paddle)) {
            this.#paddle.x = newXCoord;
            if (this.#isBallSticked) {
                this.#ball.x = newXCoord;
            }
        }
        if (keyPressed["Space"]) {
            console.log("space pressed");
            if (this.#isBallSticked) {
                this.#isBallSticked = false;
                this.#pushBall();
            }
        }
        //if (keyPressed["ArrowDown"] || keyPressed["KeyS"]) {
        //    
        //}
    };

    #isCircleToBoundariesCollision(x, y, r) {
        const mapObjects = this.stageData.getRawBoundaries(),
            [mapOffsetX, mapOffsetY] = this.stageData.worldOffset,
            xWithOffset = x - mapOffsetX,
            yWithOffset = y - mapOffsetY,
            len = this.stageData.boundariesLen;
        
        let intersect = [], intersectLen = 0;
        for (let i = 0; i < len; i+=4) {
            const x1 = mapObjects[i],
                y1 = mapObjects[i + 1],
                x2 = mapObjects[i + 2],
                y2 = mapObjects[i + 3];

            if (x1 === 0 && y1 === 0 && x2 === 0 && y2 === 0) {
                continue;
            } else {
                const newIntersect = circleLineCollision(xWithOffset, yWithOffset, r, { x1, y1, x2, y2 });
                
                if (newIntersect) {
                    if (intersectLen === 0) {
                        intersectLen = newIntersect.min_dist;
                        intersect = [newIntersect];
                    } else if (newIntersect.min_dist < intersectLen) {
                        intersectLen = newIntersect.min_dist;
                        intersect = [newIntersect];
                    } else if (newIntersect.min_dist === intersectLen) {
                        intersect.push(newIntersect);
                    }
                    
                    //console.log("rotation: ", rotation);
                    //console.log("polygon: ", polygonWithOffsetAndRotation);
                    //return newIntersect;
                }
            }
        }

        return intersectLen > 0 ? intersect : false;
    }

    #pushBall() {
        this.#moveInterval = setInterval(() => {
            this.moveBall(this.#ballDirection);
        }, this.#ballMoveInterval);
    }

    moveBall(direction) {
        const deviationX = this.#ballSpeed * Math.cos(-direction),
            deviationY = this.#ballSpeed * Math.sin(-direction),
            newCoordX = this.#ball.x + deviationX,
            newCoordY = this.#ball.y + deviationY,
            rand = Math.floor((Math.random()*4) + 0);
            
            
        let newDirection;
        if (this.isObjectsCollision(newCoordX, newCoordY, this.#ball, [this.#paddle])) {
            console.log("paddle collision");
            console.log(newCoordX);
            console.log(newCoordY)
            switch(true) {
                case this.#ballDirection === 0:
                    newDirection = Math.PI;
                    console.log("moving right, change to left");
                    break;
                case this.#ballDirection > 0 && this.#ballDirection < Math.PI/2:
                    console.log("moving from bottom to right top, change to top left");
                    newDirection = -this.#ballDirection;
                case this.#ballDirection === Math.PI/2:
                    newDirection = -this.#ballDirection;
                    console.log("moving top, change to bottom");
                    break;
                case this.#ballDirection > Math.PI/2 && this.#ballDirection < Math.PI:
                    newDirection = - this.#ballDirection;
                    console.log("moving from bottom to left top, change to bottom left");
                    break;
                case this.#ballDirection === Math.PI || this.#ballDirection === -Math.PI:
                    newDirection = 0;
                    console.log("moving to right, change to left");
                    break;
                case this.#ballDirection > -Math.PI  && this.#ballDirection < -Math.PI/2:
                    newDirection = -this.#ballDirection;
                    console.log("moving from top to left bottom, change to top left");
                    
                    break;
                case this.#ballDirection < 0  && this.#ballDirection > -Math.PI/2:
                    newDirection = -this.#ballDirection;
                    console.log("moving from top to right bottom, change to top left");
                    break;
                case this.#ballDirection === -Math.PI/2:
                    newDirection = -this.#ballDirection;
                    console.log("moving bottom, change to top");
                    break;

            }
            this.#ballDirection = newDirection; 
            this.#collisionAudio[rand].play();
            return;
        }

        let collisionSurface = this.#isCircleToBoundariesCollision(newCoordX, newCoordY, this.#ballRadius);
        if (!collisionSurface) {
            this.#ball.x = newCoordX; 
            this.#ball.y = newCoordY;
            //this.stageData.centerCameraPosition(newCoordX, newCoordY);
        } else {
            let isHorizontal = false,
                isWorldSurface = false;
            if (collisionSurface.length > 1) {
                collisionSurface.sort((a,b)=> a.x1 !== a.x2);
                const surface1 = collisionSurface[0],
                    surface2 = collisionSurface[1];
                    
                if (surface1.x1 === surface1.x2 && surface2.y1 === surface2.y2 && surface1.y2 > surface1.y1 && surface2.x2 > surface2.x1) {
                    console.log("=====>>>right top corner");
                    switch(true) {
                        case this.#ballDirection >= Math.PI/2 && this.#ballDirection < Math.PI:
                            console.log("moving from bottom right to left top, change to top right");
                            newDirection = this.#ballDirection - Math.PI/2 + CORNER_SHIFT;
                            break;
                        case this.#ballDirection > -Math.PI/2  && this.#ballDirection < 0:
                            newDirection = this.#ballDirection + CORNER_SHIFT;
                            console.log("moving from top left to right bottom, change to right bottom");
                            break;
                        case this.#ballDirection <= -Math.PI/2 && this.#ballDirection > -Math.PI:
                            newDirection = this.#ballDirection + Math.PI/2 - CORNER_SHIFT;
                            console.log("moving from top right to left bottom, change to bottom right");
                            break;
                        default:
                            console.warn("unknown corner hit!!!");
                            console.log("corner hit");
                            console.log(collisionSurface);
                            clearInterval(this.#moveInterval);
                            this.iSystem.stopGameStage(CONST.STAGE.GAME);
    
                    }
                } else if (surface1.x1 === surface1.x2 && surface2.y1 === surface2.y2 && surface1.y1 > surface1.y2 && surface2.x2 > surface2.x1) {
                    console.log("=====>>>left top corner");
                    switch(true) {
                        case this.#ballDirection >= 0 && this.#ballDirection < Math.PI/2:
                            console.log("moving from bottom left to right top, change to top left");
                            newDirection = this.#ballDirection + Math.PI/2 + CORNER_SHIFT;
                            break;
                        case this.#ballDirection > -Math.PI/2  && this.#ballDirection < 0:
                            newDirection = this.#ballDirection - Math.PI/2 - CORNER_SHIFT;
                            console.log("moving from top left to right bottom, change to left bottom");
                            break;
                        case this.#ballDirection <= -Math.PI/2 && this.#ballDirection > -Math.PI:
                            newDirection = -this.#ballDirection - CORNER_SHIFT;
                            console.log("moving from top right to left bottom, change to bottom left");
                            break;
                        default:
                            console.warn("unknown corner hit!!!");
                            console.log("corner hit");
                            console.log(collisionSurface);
                            clearInterval(this.#moveInterval);
                            this.iSystem.stopGameStage(CONST.STAGE.GAME);
    
                    }
                } else if (surface1.x1 === surface1.x2 && surface2.y1 === surface2.y2 && surface1.y2 > surface1.y1 && surface2.x1 > surface2.x2) {
                    console.log("=====>>>>right bottom corner");
                    switch(true) {
                        case this.#ballDirection >= 0 && this.#ballDirection < Math.PI/2:
                            console.log("moving from bottom left to right top, change to top right");
                            newDirection = this.#ballDirection - CORNER_SHIFT;
                            break;
                        case this.#ballDirection >= Math.PI/2 && this.#ballDirection < Math.PI:
                            newDirection = this.#ballDirection - Math.PI/2 - CORNER_SHIFT;
                            console.log("moving from bottom right to left top, change to top right");
                            break;
                        case this.#ballDirection > -Math.PI  && this.#ballDirection < -Math.PI/2:
                            newDirection = this.#ballDirection + Math.PI/2 + CORNER_SHIFT;
                            console.log("moving from top right to left bottom, change to right bottom");
                            break;
                        default:
                            console.warn("unknown corner hit!!!");
                            console.log("corner hit");
                            console.log(collisionSurface);
                            clearInterval(this.#moveInterval);
                            console.log("direction:", this.#ballDirection);
                            this.iSystem.stopGameStage(CONST.STAGE.GAME);
    
                    }
                } else if (surface1.x1 === surface1.x2 && surface2.y1 === surface2.y2 && surface1.y1 > surface1.y2 && surface2.x1 > surface2.x2) {
                    console.log("=====>>>>>left bottom corner");
                    switch(true) {
                        case this.#ballDirection >= 0 && this.#ballDirection < Math.PI/2:
                            console.log("moving from bottom left to right top, change to top left");
                            newDirection = this.#ballDirection + Math.PI/2 + CORNER_SHIFT;
                            break;
                        case this.#ballDirection >= Math.PI/2 && this.#ballDirection < Math.PI:
                            newDirection = -this.#ballDirection - CORNER_SHIFT;
                            console.log("moving from bottom right to left top, change to bottom left");
                            break;
                        case this.#ballDirection > -Math.PI/2  && this.#ballDirection < 0:
                            newDirection = this.#ballDirection - CORNER_SHIFT;
                            console.log("moving from top left to right bottom, change to right bottom");
                            break;
                        default:
                            console.warn("unknown corner hit!!!");
                            console.log("corner hit");
                            console.log(collisionSurface);
                            clearInterval(this.#moveInterval);
                            this.iSystem.stopGameStage(CONST.STAGE.GAME);
                    }
                } else {
                    console.warn("unknown corner hit!!!");
                    console.log("corner hit");
                    console.log(collisionSurface);
                    clearInterval(this.#moveInterval);
                    this.iSystem.stopGameStage(CONST.STAGE.GAME);
                    throw new Error("Multiple block collision!");
                }
                
            } else {
                collisionSurface = collisionSurface[0];
                isHorizontal = this.#isHorizontal(collisionSurface);
                
                let isBottomToTop = false,
                    isLeftToRight = false,
                    xShift = 0,
                    yShift = 0;

                console.log("isHorizontal?: ", isHorizontal);
                console.log(collisionSurface);
                
                if (isHorizontal) {
                    const isBottom = collisionSurface.y1 === this.systemSettings.customSettings.height;
                    if (isBottom) {
                        console.warn("bottom reached!");
                    }
                    const isTop = collisionSurface.y1 === 0;
                    if (isTop) {
                        isWorldSurface = true;
                    }
                }

                if (collisionSurface.x1 === 0 || collisionSurface.x1 === this.systemSettings.customSettings.width) {
                    isWorldSurface = true;
                }

                switch(true) {
                    case this.#ballDirection >= 0 && this.#ballDirection < Math.PI/2:
                        if (isHorizontal) {
                            console.log("moving from bottom to right top, change to bottom right");
                            newDirection = -this.#ballDirection;
                            isBottomToTop = true;
                            yShift += this.#ballRadius;
                        } else {
                            console.log("moving from bottom to right top, change to top left");
                            newDirection = Math.PI - this.#ballDirection;
                            isLeftToRight = true;
                            xShift += this.#ballRadius;
                        }
                        
                        break;
                    case this.#ballDirection >= Math.PI/2 && this.#ballDirection < Math.PI:
                        if (isHorizontal) {
                            newDirection = -this.#ballDirection;
                            console.log("moving from bottom to left top, change to bottom left");
                            isBottomToTop = true;
                            yShift += this.#ballRadius;
                        } else {
                            newDirection = Math.PI - this.#ballDirection;
                            console.log("moving from bottom to left top, change to top right");
                            xShift -= this.#ballRadius;
                        }
                        
                        break;
                    case this.#ballDirection >= -Math.PI  && this.#ballDirection < -Math.PI/2:
                        if (isHorizontal) {
                            newDirection = -this.#ballDirection;
                            console.log("moving from top to left bottom, change to top left");
                            yShift -= this.#ballRadius;
                        } else {
                            newDirection = -Math.PI + (-this.#ballDirection);
                            console.log("moving from top to left bottom, change to bottom right");
                            xShift -= (this.#ballRadius + 1);
                        }
                        
                        break;
                    case this.#ballDirection < 0  && this.#ballDirection > -Math.PI/2:
                        if (isHorizontal) {
                            newDirection = -this.#ballDirection;
                            yShift -= this.#ballRadius;
                            console.log("moving from top to right bottom, change to top right");
                        } else {
                            newDirection = -Math.PI + (-this.#ballDirection);
                            console.log("moving from top to right bottom, change to bottom left");
                            isLeftToRight = true;
                            xShift += this.#ballRadius;
                        }
                        
                        break;
                }
                console.log("old dir: ", this.#ballDirection);
                if (isWorldSurface === false) {
                    let blockIndex;

                    const tilemap = this.#greenBlocks.tilemap,
                        tWidth = tilemap.tilewidth,
                        tHeight = tilemap.tileheight,
                        data = this.#greenBlocks.layerData,
                        newCoordXWithShift = newCoordX + xShift,
                        newCoordYWithShift = newCoordY - yShift,
                        modX = newCoordXWithShift % tWidth,
                        modY = newCoordYWithShift % tHeight;
                    console.log("brick collision");
                    console.log("x", newCoordXWithShift);
                    console.log("y: ", newCoordYWithShift);
                    console.log("modX", modX);
                    console.log("modY: ", modY);
                    let removeSurface,
                        roundX = newCoordXWithShift - modX,
                        roundY = newCoordYWithShift - modY;
                    
                    console.log("roundX", roundX);
                    console.log("roundY: ", roundY);
                        
                    if (isHorizontal) {
                        if (isBottomToTop) { // reached top surface
                            //roundY = (modY + modDevY) > tHeight ? roundY :roundY - tHeight;
                            blockIndex = data.width * (roundY / tHeight) + (roundX / tWidth);
                            console.log("=====>>>>> top surface reached");
                        } else { // reached bottom surface
                            //roundY = roundY + tHeight;
                            blockIndex = data.width * (roundY / tHeight) + (roundX / tWidth);
                            console.log("=====>>>>> bottom surface reached");
                        }
                        removeSurface = this.draw.rect(roundX, roundY, 32, 16, "rgba(194,24,7,1)");
                    } else {
                        if (isLeftToRight) { // reached right surface
                            //roundX = (modX + modDevX) < tWidth ? roundX : roundX + tWidth;
                            blockIndex = data.width * (roundY / tHeight) + (roundX / tWidth);
                            console.log("=====>>>>> right surface reached");
                        } else { // reached left surface
                            //roundX = (modX + modDevX) > tWidth ? roundX : roundX - tWidth;
                            blockIndex = data.width * (roundY / tHeight) + (roundX / tWidth);
                            console.log("=====>>>>> left surface reached");
                        }
                        console.log("r x: ", roundX);
                        console.log("r y: ", roundY);
                        removeSurface = this.draw.rect(roundX, roundY, 32, 16, "rgba(194,24,7,1)");
                    }

                    console.log("block index: ", blockIndex);
                    console.log("data block: ", this.#greenBlocks.layerData.data[blockIndex]);
                    if (this.#greenBlocks.layerData.data[blockIndex] === 0) {
                        clearInterval(this.#moveInterval);
                        this.iSystem.stopGameStage(CONST.STAGE.GAME);
                        throw new Error("Empty block collision!");
                    }
                    this.#greenBlocks.layerData.data[blockIndex] = 0;
                    //this.#greenBlocks.layerData = data;
                    console.log("data block after replacement: ", this.#greenBlocks.layerData.data[blockIndex]);
                    setTimeout(() => {
                        removeSurface.destroy();
                    }, 500);
                }
                
                console.log("recalculate direction");
                console.log("new dir: ", newDirection);
            }
            this.#collisionAudio[rand].play();
            this.#ballDirection = newDirection;
        }
    }

    #isHorizontal = (surface) => {
        return surface.y1 === surface.y2;
    }

    #removeKeyAction = (event) => {
        const code = event.code;
        this.#keyPressed[code] = false;
    };

    resize = () => {
        const [w, h] = this.stageData.canvasDimensions;
        
        
    }

}