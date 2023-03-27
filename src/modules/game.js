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

document.addEventListener("DOMContentLoaded", function () {
    var gameBoardMap = document.querySelector('#game-board');
    var map = localStorage.getItem("map");
    var imagePath = "./images/" + map + ".png";
    console.log("Setting background image to:", imagePath); // Add this line
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

function getRandomSpawnPoint() {
    // randomly choose an object keys in the POSITION object
    const keys = Object.keys(settings.SPAWN_POINTS);
    return settings.SPAWN_POINTS[keys[Math.floor(Math.random() * keys.length)]];
}

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

function handleWin() {
    gameOver('You Win!');
}

function initialiseTimers() {
    // spawn enemy every 2.5 seconds
    timers.spawnTimer = Timer(settings.spawnTimerMs, spawnEnemy);

    // end game after 300000 ms (5 minutes)
    timers.gameTimer = Timer(settings.gameTimerMs, handleWin, {
        autoRestart: false,
    });
}

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

function damageCastle(amount) {
    scoreHandler.addPoints(settings.POINTS.CASTLE_LIFE_LOST);
    castle.damage(amount, gameOver);
}

function gameOver(titleText) {
    gameState = GAMESTATES.GAMEOVER;
    populateQuestionHistory(questionHistory, settings.lastAnswersToShow);
    //hideElement(gamePage);
    gameOverTitle.textContent = titleText || 'Game Over';
    showElement(gameOverPage, 'flex');
}

function reset() {
    settings.enemySpeed = DEFAULT_SETTINGS.enemySpeed;
    initialiseTimers();
    scoreHandler.reset();
    answerInput.value = '';
    castle.setup(settings.castleStartingLives);
    enemies.forEach((enemy) => enemy.handleDelete());
    questionHistory = [];
}

function start(selectedDifficulty) {
    reset();
    settings.questionDifficulty = selectedDifficulty;
    gameState = GAMESTATES.RUNNING;
    engine.start();
}

function restart() {
    reset();
    hideElement(gameOverPage);
    showElement(gamePage, 'flex');
    gameState = GAMESTATES.RUNNING;
}

function pause() {
    gameState = GAMESTATES.PAUSED;
    answerInput.disabled = true;
    enemies.forEach((enemy) => enemy.element.classList.add('not-clickable'));
}

function unPause() {
    gameState = GAMESTATES.RUNNING;
    answerInput.disabled = false;
    enemies.forEach((enemy) => enemy.element.classList.remove('not-clickable'));
}

function update(deltaTime) {
    if (gameState !== GAMESTATES.RUNNING) return;

    Object.keys(timers).forEach((key) => timers[key].tick(deltaTime));

    enemies.forEach((enemy) => enemy.update(deltaTime));
}

function draw() {
    gameTimer.textContent = timers.gameTimer.getHumanTimeRemaining();

    enemies.forEach((enemy) => enemy.draw());
}

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

function handleStartButtonClick() {
    hideElement(startPage);
    showElement(difficultySelectPage, 'flex');
}

function handleDifficultySelect(event) {
    const selectedDifficulty = event.target.dataset.difficulty;
    hideElement(difficultySelectPage);
    showElement(gamePage, 'flex');
    start(selectedDifficulty);
}

function handleHomeButtonClick() {
    if (gameState === GAMESTATES.PAUSED) handlePause();
    engine.stop();
    gameState = GAMESTATES.MENU;
    //hideElement(gamePage);
    showElement(startPage, 'flex');
}

// PUBLIC FUNCTIONS

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
