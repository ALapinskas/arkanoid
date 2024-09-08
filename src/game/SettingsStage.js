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
            volumeInputLabel = document.createElement("label"),
            speedContainer = document.createElement("div"),
            speedLabel = document.createElement("span"),
            speedInput1 = document.createElement("input"),
            speedInput1Label = document.createElement("label"),
            speedInput2 = document.createElement("input"),
            speedInput2Label = document.createElement("label"),
            speedInput3 = document.createElement("input"),
            speedInput3Label = document.createElement("label"),
            speedInput4 = document.createElement("input"),
            speedInput4Label = document.createElement("label"),
            speedInput5 = document.createElement("input"),
            speedInput5Label = document.createElement("label"),
            immutableContainer = document.createElement("div"),
            immutableInput = document.createElement("input"),
            immutableLabel = document.createElement('label'),
            defaultSpeed = this.systemSettings.customSettings.defaultBallSpeed;

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
        
        speedLabel.innerText = "Скорость шарика:";
        speedInput1.type = "radio";
        speedInput1.name = "speedInput";
        speedInput1.value = "1";
        speedInput1.id = "speedInput1";
        speedInput1.checked = defaultSpeed === 1;
        speedInput1Label.innerText = "1";
        speedInput1Label.for = "speedInput1";

        speedInput2.type = "radio";
        speedInput2.name = "speedInput";
        speedInput2.value = "2";
        speedInput2.id = "speedInput2";
        speedInput2.checked = defaultSpeed === 2;
        speedInput2Label.innerText = "2";
        speedInput2Label.for = "speedInput2";

        speedInput3.type = "radio";
        speedInput3.name = "speedInput";
        speedInput3.value = "3";
        speedInput3.id = "speedInput3";
        speedInput3.checked = defaultSpeed === 3;
        speedInput3Label.innerText = "3";
        speedInput3Label.for = "speedInput3";

        speedInput4.type = "radio";
        speedInput4.name = "speedInput";
        speedInput4.value = "4";
        speedInput4.id = "speedInput4";
        speedInput4.checked = defaultSpeed === 4;
        speedInput4Label.innerText = "4";
        speedInput4Label.for = "speedInput4";

        speedInput5.type = "radio";
        speedInput5.name = "speedInput";
        speedInput5.value = "5";
        speedInput5.id = "speedInput5";
        speedInput5.checked = defaultSpeed === 5;
        speedInput5Label.innerText = "5";
        speedInput5Label.for = "speedInput5";

        speedContainer.appendChild(speedLabel);
        speedContainer.appendChild(speedInput1);
        speedContainer.appendChild(speedInput1Label);
        speedContainer.appendChild(speedInput2);
        speedContainer.appendChild(speedInput2Label);
        speedContainer.appendChild(speedInput3);
        speedContainer.appendChild(speedInput3Label);
        speedContainer.appendChild(speedInput4);
        speedContainer.appendChild(speedInput4Label);
        speedContainer.appendChild(speedInput5);
        speedContainer.appendChild(speedInput5Label);
        speedContainer.style["zIndex"] = 2;

        this.optionsMenuContainer.appendChild(speedContainer);

        immutableLabel.innerText = "Бессмертие:";
        immutableInput.type = "checkbox";
        immutableInput.id = "immutable";
        immutableInput.checked = this.systemSettings.customSettings.immutable;

        immutableContainer.appendChild(immutableLabel);
        immutableContainer.appendChild(immutableInput);
        immutableContainer.style["zIndex"] = 2;

        this.optionsMenuContainer.appendChild(immutableContainer);

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
            this.systemSettings.customSettings.immutable = document.getElementById("immutable").checked;
            this.systemSettings.customSettings.defaultBallSpeed = parseInt(document.querySelector('input[name="speedInput"]:checked').value);
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