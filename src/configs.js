import { utils } from "jsge";

const isMobile = utils.isMobile;

export const settings = {
    pageBackgroundColor: "rgba(235, 249, 255, 1)",
    gameBackgroundColor: "rgba(194, 197, 204, 1)",
    ballColor: "rgba(10, 10, 10, 1)",
    worldBoundariesColor: "rgba(0, 0, 0, 1)",
    gameControls:[isMobile() ? false : "mouse"],
    width: 800,
    height: 640
}