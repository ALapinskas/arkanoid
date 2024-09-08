import { System, SystemSettings } from "jsge";
import { settings } from "./configs.js";
import { ArkanoidStage } from "./game/ArkanoidStage.js";
import { StartStage } from "./game/StartStage.js";
import { CONST } from "./constants.js";
import { SettingsStage } from "./game/SettingsStage.js";

SystemSettings.customSettings = settings;
SystemSettings.worldSize.width = settings.width;
SystemSettings.worldSize.height = settings.height;
SystemSettings.canvasMaxSize.width = settings.width;
SystemSettings.canvasMaxSize.height = settings.height;
//SystemSettings.gameOptions.debug.boundaries.drawLayerBoundaries = true;
//SystemSettings.gameOptions.debug.boundaries.drawObjectBoundaries = true;

document.addEventListener("DOMContentLoaded", function(event) {

    const app = new System(SystemSettings, document.getElementById("game_map"));

    app.registerStage(CONST.STAGE.START, StartStage);
    app.registerStage(CONST.STAGE.GAME, ArkanoidStage);
    app.registerStage(CONST.STAGE.SETTINGS, SettingsStage);

    app.preloadAllData().then(() => {
        app.iSystem.startGameStage(CONST.STAGE.START);
    });
});