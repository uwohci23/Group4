import gameBoard from './gameBoard';
import castle from './castle';
import Enemy, { ENEMY_EVENT_TYPES, createEnemyEvent } from './enemy';
import Timer from './timer';
import questionGenerator from './questionGenerator';
import scoreHandler from './scoreHandler';
import DEFAULT_SETTINGS from './defaultSettings';
import { hideElement, showElement } from './domUtils';
import Engine from './engine';
import populateQuestionHistory from './questionHistory';

const GAMESTATES = {
    MENU: 0,
    RUNNING: 1,
    GAMEOVER: 2,
    PAUSED: 3,
};
let selectedEnemyIndex = -1;

/* Setting the background image of the game board to the map that the user selected. */
document.addEventListener("DOMContentLoaded", function () {
    var gameBoardMap = document.querySelector('#game-board');
    var map = localStorage.getItem("map");
    var imagePath = "./images/" + map + ".png";
    //console.log("Setting background image to:", imagePath); // Add this line
    gameBoardMap.style.backgroundImage = "url('" + imagePath + "')";
});


const gamePage = document.querySelector('#game-page');
const gameOverPage = document.querySelector('#game-over-page');

const answerForm = document.querySelector('.answer-form');
const answerInput = document.querySelector('#answer-input');
const gameTimer = document.querySelector('#game-timer');
const restartButton = document.querySelector('#restart-button');
const pauseRestartButton = document.querySelector('#pause-restart-button');
const pauseButton = document.querySelector('.pause-button');
const continueBtn = document.querySelector('#continueBtn');

const selectedDifficulty = localStorage.getItem("difficulty");

const homeButton = document.querySelector('#goHomeBtn');
const gameOverTitle = document.querySelector('#game-over-title');

const settings = { ...DEFAULT_SETTINGS };
const timers = {};
const fieldWidth = gameBoard.width - (castle.width - 70);
const engine = new Engine(update, draw);

let gameState = GAMESTATES.MENU;
let selectedEnemy = null;
let enemies = [];
let questionHistory = [];

// PRIVATE FUNCTIONS

/**
 * It creates an enemy, adds it to the game board, and adds it to the enemies array
 */
function spawnEnemy() {
    const enemy = Enemy({
        position: getRandomSpawnPoint(),
        speed: settings.enemySpeed,
        question: questionGenerator(settings.questionDifficulty),
        fieldWidth,
        handleSelectEnemy,
        damageCastle,
        deleteEnemy,
    });
    settings.enemySpeed += settings.enemySpeedIncrement;
    gameBoard.element.appendChild(enemy.element);
    enemies.push(enemy);
}

/**
 * It returns a random spawn point from the `settings.SPAWN_POINTS` object
 * @returns a random spawn point from the SPAWN_POINTS object.
 */
function getRandomSpawnPoint() {
    // randomly choose an object keys in the POSITION object
    const keys = Object.keys(settings.SPAWN_POINTS);
    return settings.SPAWN_POINTS[keys[Math.floor(Math.random() * keys.length)]];
}

/**
 * It removes the enemy from the enemies array, and if it was the selected enemy, it sets the selected
 * enemy to null
 * @param element - The element that the enemy is in.
 */
function deleteEnemy(element) {
    enemies = enemies.filter((enemy) => {
        if (enemy.element !== element) return true;

        if (selectedEnemy === enemy) {
            selectedEnemy = null;
        }

        questionHistory.push(enemy.getQuestionInfo());

        return false;
    });
}

/**
 * If the player wins, call the gameOver function and pass it the string 'You Win!'
 */
function handleWin() {
    gameOver('You Win!');
}

/**
 * It creates two timers, one for spawning enemies and one for ending the game
 */
function initialiseTimers() {
    // spawn enemy every 2.5 seconds
    timers.spawnTimer = Timer(settings.spawnTimerMs, spawnEnemy);

    // end game after 300000 ms (5 minutes)
    timers.gameTimer = Timer(settings.gameTimerMs, handleWin, {
        autoRestart: false,
    });
}

/**
 * It handles the answer submission by the user
 * @param event - The event object that is passed to the event handler.
 */
function handleAnswerSubmit(event) {
    event.preventDefault();

    if (!selectedEnemy || answerInput.value.trim() === '') return;

    const correctAnswer = selectedEnemy.question.answer.toString();

    const enemyEvent = createEnemyEvent(
        ENEMY_EVENT_TYPES.QUESTION_ANSWERED,
        answerInput.value
    );

    selectedEnemy.addEvent(enemyEvent);

    if (enemyEvent.answer.value === correctAnswer) {
        enemyEvent.answer.isCorrect = true;
        selectedEnemy.handleDelete();

        const selectedIndex = enemies.indexOf(selectedEnemy);
        const nextEnemy = enemies[selectedIndex + 1] || enemies[0];

        if (nextEnemy) {
            handleSelectEnemy({ currentTarget: nextEnemy.element });
        } else {
            selectedEnemy = null;
        }

        scoreHandler.addPoints(settings.POINTS.CORRECT_ANSWER);
    } else {
        enemyEvent.answer.isCorrect = false;
        scoreHandler.addPoints(settings.POINTS.WRONG_ANSWER);
    }

    answerInput.value = '';
}



/**
 * If the user clicks on an enemy, select it
 * @param event - The event object that was triggered by the click.
 * @param enemyElement - The enemy element that was clicked.
 * @returns the value of the variable selectedEnemy.
 */
function handleSelectEnemy(event) {
    answerInput.focus();

    const clickedEnemy = enemies.find(
        (enemy) => enemy.element === event.currentTarget
    );

    if (clickedEnemy === selectedEnemy) return;

    if (selectedEnemy) selectedEnemy.toggleSelect();

    clickedEnemy.toggleSelect();

    selectedEnemy = clickedEnemy;
}

/**
 * This function adds points to the score and damages the castle.
 * @param amount - The amount of damage to be done to the castle.
 */
function damageCastle(amount) {
    scoreHandler.addPoints(settings.POINTS.CASTLE_LIFE_LOST);
    castle.damage(amount, gameOver);
}

/**
 * It sets the game state to GAMEOVER, populates the question history, and shows the game over page
 * @param titleText - The text to display in the game over title.
 */
function gameOver(titleText) {
    gameState = GAMESTATES.GAMEOVER;
    populateQuestionHistory(questionHistory, settings.lastAnswersToShow);
    //hideElement(gamePage);
    gameOverTitle.textContent = titleText || 'Game Over';
    showElement(gameOverPage, 'flex');
}

/**
 * It resets the game
 */
function reset() {
    settings.enemySpeed = DEFAULT_SETTINGS.enemySpeed;
    initialiseTimers();
    scoreHandler.reset();
    answerInput.value = '';
    castle.setup(settings.castleStartingLives);
    enemies.forEach((enemy) => enemy.handleDelete());
    questionHistory = [];
}

/**
 * It resets the game, sets the difficulty, sets the game state to running, and starts the engine
 * @param selectedDifficulty - The difficulty of the questions to be asked.
 */
function start(selectedDifficulty) {
    reset();
    settings.questionDifficulty = selectedDifficulty;
    gameState = GAMESTATES.RUNNING;
    engine.start();
}

/**
 * Restart() hides the game over page and shows the game page, and then sets the game state to running
 */
function restart() {
    reset();
    hideElement(gameOverPage);
    //showElement(gamePage, 'flex');
    gameState = GAMESTATES.RUNNING;
}
/**
 * Restart() hides the game over page and shows the game page, and then sets the game state to running
 */
function restart2() {
    settings.enemySpeed = DEFAULT_SETTINGS.enemySpeed;
    initialiseTimers();
    scoreHandler.reset();
    answerInput.value = '';
    castle.setup(settings.castleStartingLives);
    enemies.forEach((enemy) => enemy.handleDelete());
    questionHistory = [];

    engine.start();
    pauseButton.textContent = "Pause";
    gameState = GAMESTATES.RUNNING;
    answerInput.disabled = false;
    enemies.forEach((enemy) => enemy.element.classList.remove('not-clickable'));
    hideElement(document.querySelector('#pauseMenu'));
    gameState = GAMESTATES.RUNNING;
}

/**
 * It sets the game state to paused, disables the answer input, and adds the class 'not-clickable' to
 * all enemies
 */
function pause() {
    showElement(pauseMenu, 'flex');
    gameState = GAMESTATES.PAUSED;
    answerInput.disabled = true;
    enemies.forEach((enemy) => enemy.element.classList.add('not-clickable'));
}

/**
 * It sets the game state to running, enables the answer input, and removes the not-clickable class
 * from all enemies
 */
function unPause() {
    gameState = GAMESTATES.RUNNING;
    answerInput.disabled = false;
    enemies.forEach((enemy) => enemy.element.classList.remove('not-clickable'));
    hideElement(document.querySelector('#pauseMenu'));
}

function continueUnPause() {
    engine.start();
    pauseButton.textContent = "Pause";
    gameState = GAMESTATES.RUNNING;
    answerInput.disabled = false;
    enemies.forEach((enemy) => enemy.element.classList.remove('not-clickable'));
    hideElement(document.querySelector('#pauseMenu'));
}

/**
 * If the game is running, update all the timers and enemies
 * @param deltaTime - The time in milliseconds since the last update.
 * @returns The function update is being returned.
 */
function update(deltaTime) {
    if (gameState !== GAMESTATES.RUNNING) return;

    Object.keys(timers).forEach((key) => timers[key].tick(deltaTime));

    enemies.forEach((enemy) => enemy.update(deltaTime));
}

/**
 * Draw the game timer and draw each enemy.
 */
function draw() {
    gameTimer.textContent = timers.gameTimer.getHumanTimeRemaining();

    enemies.forEach((enemy) => enemy.draw());
}

/**
 * If the game is running, pause it, and change the text of the pause button to "Continue". If the game
 * is paused, unpause it, and change the text of the pause button to "Pause".
 */
function handlePause() {
    const pauseButtonText = ['Continue', 'Pause'];
    const [first, second] = pauseButtonText;
    if (gameState === GAMESTATES.RUNNING) {
        pause();
        engine.stop();
        pauseButton.textContent = first;
    } else if (gameState === GAMESTATES.PAUSED) {
        engine.start();
        unPause();
        pauseButton.textContent = second;
    }
}

/**
 * It stops the game, sets the game state to the menu, and shows the start page
 */
function handleHomeButtonClick() {
    if (gameState === GAMESTATES.PAUSED) handlePause();
    engine.stop();
    gameState = GAMESTATES.MENU;
    //hideElement(gamePage);
    window.location.replace("../main_menu.html");
}
/**
 * Handles WASD key inputs to select enemies
 * @param event - The event object that is passed to the event handler.
 */
function handleWASD(event) {
    if (gameState !== GAMESTATES.RUNNING || enemies.length === 0) return;

    if (!selectedEnemy) {
        handleSelectEnemy({ currentTarget: enemies[0].element });
        return;
    }

    let currentX = selectedEnemy.getX();
    let currentY = selectedEnemy.getY();

    console.log(currentX);
    console.log(currentY);
    switch (event.key.toLowerCase()) {
        case 'w':
            const enemyAbove = enemies.reduce((closest, enemy) => {
                if (enemy.getY() < currentY && Math.abs(enemy.getX() - currentX) <= 1) {
                    if (!closest || enemy.getY() > closest.getY()) {
                        return enemy;
                    }
                }
                return closest;
            }, null);
            if (enemyAbove) handleSelectEnemy({ currentTarget: enemyAbove.element });
            break;
        case 's':
            const enemyBelow = enemies.reduce((closest, enemy) => {
                if (enemy.getY() > currentY && Math.abs(enemy.getX() - currentX) <= 1) {
                    if (!closest || enemy.getY() < closest.getY()) {
                        return enemy;
                    }
                }
                return closest;
            }, null);
            if (enemyBelow) handleSelectEnemy({ currentTarget: enemyBelow.element });
            break;
        case 'a':
            const enemyLeft = enemies.reduce((closest, enemy) => {
                if (enemy.getX() < currentX && Math.abs(enemy.getY() - currentY) <= 1) {
                    if (!closest || enemy.getX() > closest.getX()) {
                        return enemy;
                    }
                }
                return closest;
            }, null);
            if (enemyLeft) handleSelectEnemy({ currentTarget: enemyLeft.element });
            break;
        case 'd':
            const enemyRight = enemies.reduce((closest, enemy) => {
                if (enemy.getX() > currentX && Math.abs(enemy.getY() - currentY) <= 1) {
                    if (!closest || enemy.getX() < closest.getX()) {
                        return enemy;
                    }
                }
                return closest;
            }, null);
            if (enemyRight) handleSelectEnemy({ currentTarget: enemyRight.element });
            break;
    }
}

/**
 * It adds event listeners to the buttons and form, and starts the game
 */
function init() {
    //showElement(gamePage, 'flex');
    start(selectedDifficulty);
    restartButton.addEventListener('click', restart);
    pauseRestartButton.addEventListener('click', restart2);
    pauseButton.addEventListener('click', handlePause);
    continueBtn.addEventListener('click', continueUnPause);
    answerForm.addEventListener('submit', handleAnswerSubmit);
    homeButton.addEventListener('click', handleHomeButtonClick);
    document.addEventListener('keydown', handleWASD);
}

export default Object.freeze({
    init,
});
