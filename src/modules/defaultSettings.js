const settings2 = {
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


let DEFAULT_SETTINGS;

if (localStorage.getItem('Settings')) {
    DEFAULT_SETTINGS = JSON.parse(localStorage.getItem('Settings'));
    console.log(DEFAULT_SETTINGS);
} else {
    DEFAULT_SETTINGS = settings2;
}


export default DEFAULT_SETTINGS;
