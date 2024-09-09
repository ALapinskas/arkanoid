import { GameStage } from "jsge";
import { utils } from "jsge";
import { CONST } from "../constants.js";

const isPointRectIntersect = utils.isPointRectIntersect;
const LEFT_SHIFT = -70;

export class StartStage extends GameStage {
    #menuClickMediaElement;
    register() {
        this.iLoader.addAudio(CONST.AUDIO.MENU_CLICK_AUDIO, "./assets/audio/select_001.ogg");
    }

    init() {
        const [w, h] = this.stageData.canvasDimensions;
        //Logger.debug("init page");
        this.background = this.draw.rect(0, 0, w, h, this.systemSettings.customSettings.pageBackgroundColor);

        this.navItemSingle = this.draw.text(w/2 + LEFT_SHIFT, h/2 - 40, "Играть", "24px sans", "black");
        this.navItemOptions = this.draw.text(w/2 + LEFT_SHIFT, h/2, "Настройки", "24px sans", "black");
        
        this.audio.registerAudio(CONST.AUDIO.MENU_CLICK_AUDIO);
        this.#menuClickMediaElement = this.audio.getAudio(CONST.AUDIO.MENU_CLICK_AUDIO);
    }

    start() {
        
        this.registerEventListeners();
        //this.#drawHelpInfo();
    }

    stop() {
        this.unregisterEventListeners();
        //this.helpContainer.remove();
        delete this.helpContainer;
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
    }
    #mouseHoverEvent = (event) => {
        const isNavSingle = isPointRectIntersect(event.offsetX, event.offsetY, this.navItemSingle.boundariesBox),
            isNavOptions = isPointRectIntersect(event.offsetX, event.offsetY, this.navItemOptions.boundariesBox);
        if (isNavSingle) {
            this.navItemSingle.strokeStyle = "rgba(0, 0, 0, 0.3)";
        } else {
            this.navItemSingle.strokeStyle = undefined;
        }

        if (isNavOptions) {
            this.navItemOptions.strokeStyle = "rgba(0, 0, 0, 0.3)";
        } else {
            this.navItemOptions.strokeStyle = undefined;
        }

        if (isNavSingle || isNavOptions) {
            document.body.style.cursor = "pointer";
        } else {
            document.body.style.cursor = "default";
        }

        
    };

    #mouseClickEvent = (event) => {

        if (isPointRectIntersect(event.offsetX, event.offsetY, this.navItemSingle.boundariesBox)) {
            this.#menuClickMediaElement.play();
            this.iSystem.stopGameStage(CONST.STAGE.START);
            this.iSystem.startGameStage(CONST.STAGE.GAME);
        }

        if (isPointRectIntersect(event.offsetX, event.offsetY, this.navItemOptions.boundariesBox)) {
            this.#menuClickMediaElement.play();
            this.iSystem.stopGameStage(CONST.STAGE.START);
            this.iSystem.startGameStage(CONST.STAGE.SETTINGS);
        }
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
        document.body.style.cursor = "default";
    }

    #drawHelpInfo = () => {
        this.helpContainer = document.createElement("div");
        this.helpContainer.style.display = "flex";
        this.helpContainer.style["flex-flow"] = "column";
        this.helpContainer.style["justify-content"] = "center";
        this.helpContainer.style.width = "fit-content";
        this.helpContainer.style.marginLeft = "auto";
        this.helpContainer.style.marginRight = "auto";

        const container = document.createElement("div");
        container.style.zIndex = "2";

        const helpTextPar1 = document.createElement("p"),
            helpTextPar2 = document.createElement("p"),
            helpTextPar3 = document.createElement("p");

        helpTextPar1.innerText = "";
        helpTextPar2.innerHTML = 

        helpTextPar3.innerText = "В меню настроек можно изменить стартовую скорость шарика и включить бессмертие.";

        container.appendChild(helpTextPar1);
        container.appendChild(helpTextPar2);
        container.appendChild(helpTextPar3);

        this.helpContainer.appendChild(container);
        document.body.appendChild(this.helpContainer);
        document.getElementsByTagName("canvas")[0].style["position"] = "absolute";
    }


    resize = () => {
        const [w, h] = this.stageData.canvasDimensions;
        this.navItemSingle.x = w/2 + LEFT_SHIFT;
        this.navItemSingle.y = h/2 - 40;

        this.navItemOptions.x = w/2 + LEFT_SHIFT;
        this.navItemOptions.y = h/2;

        this.background.width = w;
        this.background.height = h;

        const container = this.helpContainer;
        
        if (container) {
            container.style.marginTop = Math.round((h - container.clientHeight) / 2) - 200 + "px";
        }
    }
}