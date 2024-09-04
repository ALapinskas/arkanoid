import { GameStage } from "jsge";
import { CONST } from "../constants.js";
import { utils } from "jsge";

const isPointRectIntersect = utils.isPointRectIntersect;

export class SettingsStage extends GameStage {
    #menuClickSound;
    #volumeInput;

    init() {
        const [w, h] = this.stageData.canvasDimensions;

        this.optionsMenuContainer;

        this.background = this.draw.rect(0, 0, w, h, this.systemSettings.customSettings.pageBackgroundColor);  

        this.navItem1 = this.draw.text(w/2 - 0, h/2 + 20, "Back", "24px sans", "black"),
        this.navItem2 = this.draw.text(w/2 - 100, h/2 + 20, "Set defaults", "24px sans", "black");
        
        this.#menuClickSound = this.audio.getAudio(CONST.AUDIO.MENU_CLICK_AUDIO);
    }

    start() {
        this.#drawNavigationElements();
        this.registerEventListeners();
    }

    stop() {
        this.unregisterEventListeners();
        this.optionsMenuContainer.remove();
        delete this.optionsMenuContainer;
    }

    #drawNavigationElements() {
        const volumeInputContainer = document.createElement("div"),
            volumeInputLabel = document.createElement("label");

        this.optionsMenuContainer = document.createElement("div");
        this.optionsMenuContainer.style.display = "flex";
        this.optionsMenuContainer.style["flex-flow"] = "column";
        this.optionsMenuContainer.style["justify-content"] = "center";
        this.optionsMenuContainer.style.width = "fit-content";
        this.optionsMenuContainer.style.marginLeft = "auto";
        this.optionsMenuContainer.style.marginRight = "auto";

        this.#volumeInput = document.createElement("input");
        this.#volumeInput["id"] = "volumeInput";
        this.#volumeInput["type"] = "range";
        this.#volumeInput["min"] = 0;
        this.#volumeInput["max"] = 1;
        this.#volumeInput["step"] = 0.01;
        this.#volumeInput["value"] = this.audio.volume;
        this.#volumeInput.style["vertical-align"] = "middle";

        volumeInputLabel["for"] = "volumeInput";
        volumeInputLabel.innerText = "Sound volume: ";

        volumeInputContainer.style["zIndex"] = 2;

        volumeInputContainer.appendChild(volumeInputLabel);
        volumeInputContainer.appendChild(this.#volumeInput);
        this.optionsMenuContainer.appendChild(volumeInputContainer);
        this.optionsMenuContainer.appendChild(volumeInputContainer);
        document.body.appendChild(this.optionsMenuContainer);
        document.getElementsByTagName("canvas")[0].style["position"] = "absolute";
        this.#fixContainerPosition();
    } 

    registerEventListeners() {
        const canvas = this.iSystem.iRender.canvas;
        if (this.systemSettings.customSettings.gameControls.find(el => (el === "mouse"))) {
            document.addEventListener("mousemove", this.mouseHoverEvent);            
            document.addEventListener("click", this.mouseClickEvent);
        } else {
            document.addEventListener("click", this.mouseClickEvent);
        }
        
        document.addEventListener("keydown", this.pressKeyAction);
        this.#volumeInput.addEventListener("input",
            this.#changeVolumeInput,
            false
        );
    }

    #changeVolumeInput = (event) => {
        console.log("value changed");
        console.log(event.target.value);
        this.audio.volume = Number(event.target.value);
    };

    mouseHoverEvent = (event) => {
        const canvas = this.canvasHtmlElement,
            isNav1Traversed = isPointRectIntersect(event.offsetX, event.offsetY, this.navItem1.boundariesBox),
            isNav2Traversed = isPointRectIntersect(event.offsetX, event.offsetY, this.navItem2.boundariesBox);
        if (isNav1Traversed) {
            this.navItem1.strokeStyle = "rgba(255, 255, 255, 0.3)";
        } else {
            this.navItem1.strokeStyle = undefined;
        }

        if (isNav2Traversed) {
            this.navItem2.strokeStyle = "rgba(255, 255, 255, 0.3)";
        } else {
            this.navItem2.strokeStyle = undefined;
        }

        if (isNav1Traversed || isNav2Traversed ) {
            canvas.style.cursor = "pointer";
        } else {
            this.navItem2.strokeStyle = undefined;
            canvas.style.cursor = "default";
        }
    };

    mouseClickEvent = (event) => {
        if (isPointRectIntersect(event.offsetX, event.offsetY, this.navItem1.boundariesBox)) {
            this.#menuClickSound.play();
            this.iSystem.stopGameStage(CONST.STAGE.SETTINGS);
            this.iSystem.startGameStage(CONST.STAGE.START);
        }

        if (isPointRectIntersect(event.offsetX, event.offsetY, this.navItem2.boundariesBox)) {
            this.#menuClickSound.play();
            this.#volumeInput.value = 0.5;
            this.#volumeInput.dispatchEvent(new Event("input", { "bubbles": true }));
        }
    };

    unregisterEventListeners() {
        //const canvas = this.getView(CONST.LAYERS.DEFAULT).canvas;
        if (this.systemSettings.customSettings.gameControls.find(el => (el === "mouse"))) {
            document.removeEventListener("mousemove", this.mouseHoverEvent);            
            document.removeEventListener("click", this.mouseClickEvent);
        } else {
            document.addEventListener("click", this.mouseClickEvent);
        }
        document.removeEventListener("keydown", this.pressKeyAction);
        this.#volumeInput.removeEventListener("input", this.#changeVolumeInput);
    }

    pressKeyAction = (event) => {
        console.log("press key, " + event.code);
    };

    #fixContainerPosition() {
        const h = this.stageData.canvasDimensions[1],
            container = this.optionsMenuContainer;
        
        if (container) {
            container.style.marginTop = Math.round((h - container.clientHeight) / 2) - 50 + "px";
        }
    }
    
    resize() {
        const [w, h] = this.stageData.canvasDimensions;
        
        this.navItem1.x = w/2 - 135;
        this.navItem1.y = h/2 + 20;
    
        this.navItem2.x = w/2 + 20;
        this.navItem2.y = h/2 + 20;
        this.background.width = w;
        this.background.height = h;

        this.#fixContainerPosition();
    }
}