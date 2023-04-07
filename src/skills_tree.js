import './styles/skills_tree.css';

let settings = {
    SPAWN_POINTS: {
        FIRST_LANE: { x: -900, y: -165 },
        SECOND_LANE: { x: -900, y: -20 },
        THIRD_LANE: { x: -900, y: 125 },
    },
    POINTS: {
        CORRECT_ANSWER: 10,
        WRONG_ANSWER: -2,
        CASTLE_LIFE_LOST: -10,
    },
    enemySpeed: 60,
    enemySpeedIncrement: 1,
    spawnTimerMs: 3500,
    gameTimerMs: 300000,
    questionDifficulty: 'Medium',
    castleStartingLives: 3,
    lastAnswersToShow: 5,
};

localStorage.setItem("Settings", settings);

function change11() {
    settings.gameTimerMs = 400000;
    alert("Please select a skill to purchase!");
}
function change12() {
    settings.enemySpeed = 55;

}
function change13() {
    settings.castleStartingLives = 4;
    
}
function change22() {
    settings.enemySpeed = 50;
 
}
function change23() {
    settings.castleStartingLives = 5;
  
}
function change31() {
    settings.gameTimerMs = 500000;
 
}
function change32() {
    settings.enemySpeed = 45;

}
function change42() {
    settings.enemySpeed = 40;

}
function getSettings(){
    return settings;
}
export {getSettings};

