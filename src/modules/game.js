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
const pauseButton = document.querySelector('.pause-button');

const selectedDifficulty = localStorage.getItem("difficulty");

const homeButton = document.querySelector('#home-button');
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
        enemies,
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
        deleteEnemy(selectedEnemy.element); // Remove the enemy from the enemies array

        // Update the enemies list in every remaining enemy
        enemies.forEach(enemy => {
            enemy.updateEnemiesList(enemies);
        });

        selectedEnemy = null;
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
function handleSelectEnemy(event, enemyElement) {
    answerInput.focus();

    if (event) {
        event.stopPropagation();
    }

    const clickedEnemyElement = enemyElement;
    const clickedEnemyIndex = enemies.findIndex(
        (enemy) => enemy.element === clickedEnemyElement
    );

    if (clickedEnemyIndex !== -1 && enemies[clickedEnemyIndex] === selectedEnemy) return;

    if (selectedEnemy) {
        selectedEnemy.toggleSelect();
        const arrowToRemove = selectedEnemy.element.querySelector('#arrow');
        if (arrowToRemove) {
            arrowToRemove.remove();
        }
    }

    const clickedEnemy = enemies[clickedEnemyIndex];
    if (clickedEnemy) { // Check if clickedEnemy is not undefined
        clickedEnemy.toggleSelect();

        const arrow = document.querySelector('#arrow');
        const arrowClone = arrow.cloneNode(true);
        arrowClone.removeAttribute('style');
        arrowClone.setAttribute('id', 'arrow');
        clickedEnemy.element.appendChild(arrowClone);

        selectedEnemy = clickedEnemy;
    }
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
    showElement(gamePage, 'flex');
    gameState = GAMESTATES.RUNNING;
}

/**
 * It sets the game state to paused, disables the answer input, and adds the class 'not-clickable' to
 * all enemies
 */
function pause() {
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
 * When the start button is clicked, hide the start page and show the difficulty select page.
 */
function handleStartButtonClick() {
    hideElement(startPage);
    showElement(difficultySelectPage, 'flex');
}

/**
 * When the user clicks on a difficulty button, hide the difficulty select page and show the game page,
 * then start the game with the selected difficulty
 * @param event - The event object that was triggered.
 */
function handleDifficultySelect(event) {
    const selectedDifficulty = event.target.dataset.difficulty;
    hideElement(difficultySelectPage);
    showElement(gamePage, 'flex');
    start(selectedDifficulty);
}

/**
 * It stops the game, sets the game state to the menu, and shows the start page
 */
function handleHomeButtonClick() {
    if (gameState === GAMESTATES.PAUSED) handlePause();
    engine.stop();
    gameState = GAMESTATES.MENU;
    //hideElement(gamePage);
    showElement(startPage, 'flex');
}

/**
 * It adds event listeners to the buttons and form, and starts the game
 */
function init() {
    //showElement(gamePage, 'flex');
    start(selectedDifficulty);
    restartButton.addEventListener('click', restart);
    pauseButton.addEventListener('click', handlePause);
    answerForm.addEventListener('submit', handleAnswerSubmit);
    homeButton.addEventListener('click', handleHomeButtonClick);
}

export default Object.freeze({
    init,
});
