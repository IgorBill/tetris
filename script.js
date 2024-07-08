
const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
let playfield;
let cells;
let isPaused = false;
let timedId;
let isGameOver = false;
let overlay = document.querySelector('.overlay');
let btnRestart = document.querySelector('.btn-restart');
let timeGame = document.querySelector('.time-game');
let score = 0;
let scoreElemet = document.querySelector('.score');
let scoreTotal = document.querySelector('.score-total');

let btnPause = document.querySelector('.btn-pause');
let btnLeft = document.querySelector('.btn-left');
let btnRight = document.querySelector('.btn-right');
let btnDown = document.querySelector('.btn-down');
let btnRotate = document.querySelector('.btn-rotate');

const TETROMINO_NAMES = [
    'O',
    'L',
    'J',
    'T',
    'I',
    'S',
    'Z',
]

const TETROMINOES = {
    'O' : [
            [1, 1],
            [1, 1]
        ],
    'L' : [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
    'J' : [
            [0, 1, 1],
            [0, 1, 0],
            [0, 1, 0]
        ],
    'T' : [
            [0, 0, 0],
            [0, 1, 0],
            [1, 1, 1]
        ],
    'I' : [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
    'S' : [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
    'Z' : [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
}

//опис фігури
let tetromino = {
    name: '',
    matrix: [],
    column: 0,
    row: 0
}

// COMMON
function convertPositionToIndex(row, column){
    return row * PLAYFIELD_COLUMNS + column;
}

function randomFigure(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function init() {
    score = 0;
    scoreElemet.innerHTML = 0;
    scoreTotal.innerHTML = 0;
    isGameOver = false;
    generatePlayfield();
    cells = document.querySelectorAll('.tetris div');

    generateTetromino();
    moveDown();
    // draw();
}

// GENERATION
function generateTetromino() {
    const nameTetro  = randomFigure(TETROMINO_NAMES);
    const matrix = TETROMINOES[nameTetro];

    const columnTetro = Math.floor( PLAYFIELD_COLUMNS / 2 - matrix.length / 2 );
    const rowTetro = -2;

    tetromino = {
        name: nameTetro,
        matrix: matrix,
        column : columnTetro,
        row: rowTetro,
    }
}

function generatePlayfield() {
    for (let i = 0; i < PLAYFIELD_COLUMNS * PLAYFIELD_ROWS; i++) {
        const div = document.createElement('div');
        document.querySelector('.tetris').append(div);
    }

    playfield = new Array(PLAYFIELD_ROWS).fill()
                        .map( ()=> new Array(PLAYFIELD_COLUMNS). fill(0) );
    console.table(playfield);
}

//KEYBOARDS & CLICKS
btnRestart.addEventListener('click', function() {
    document.querySelector('.tetris').innerHTML = '';
    overlay.style.display = 'none';

    init();
})

document.addEventListener('keydown', onKeyDown);
btnPause.addEventListener('click', togglePaused);
btnRotate.addEventListener('click', rotate);
btnDown.addEventListener('click', moveTetrominoDown);
btnLeft.addEventListener('click', moveTetrominoLeft);
btnRight.addEventListener('click', moveTetrominoRight);

function onKeyDown(event) {
    if (event.key == 'Escape') {
        togglePaused();
    }

    if(!isPaused) {
        if (event.key == 'ArrowUp') {
            rotate();
        }
    
        if (event.key == 'ArrowLeft') {
            console.log(event);
            moveTetrominoLeft();
        }
    
        if (event.key == 'ArrowRight') {
            console.log(event);
            moveTetrominoRight();
        }
    
        if (event.key == 'ArrowDown') {        
            moveTetrominoDown();
        }

        if (event.key == ' ') {        
            dropTetrominoDown();
        }
    }

    draw();
}
function moveTetrominoDown() {
    tetromino.row += 1;
    if(!isValid()) {
        tetromino.row -= 1;
        placeTetromino();
    }
    draw();
}
function moveTetrominoLeft() {
    tetromino.column -= 1;
    if(!isValid()) {
        tetromino.column += 1;
    }
    draw();
}
function moveTetrominoRight() {
    tetromino.column += 1;
    if(!isValid()) {
        tetromino.column -= 1;
    }
    draw();
}

function draw() {
    cells.forEach( el => el.removeAttribute('class') );
    drawPlayField();
    drawTetromino();
}

//щоб падало резко до низу
function dropTetrominoDown() {
    while(isValid()) {
        tetromino.row++;
    }

    tetromino.row--;
}

function togglePaused() {
    if(isPaused) {
        startLoop();
    } else {
        stopLoop();
    }

    isPaused = !isPaused;
}

// ROTATE

//temp Код для прикладу обертання фігур
// let showRotated = [
//     [1,2,3],
//     [4,5,6],
//     [7,8,9],
// ]
//

function rotate() {    
    rotateTetromino();
    draw();
}

function rotateTetromino() {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    //temp Код для прикладу обертання фігур
    // showRotated = rotateMatrix(showRotated);
    //
    tetromino.matrix = rotatedMatrix;
    // якщо не може перевернутись, то повертаємось до попереднього расположення
    if(!isValid()) {
        tetromino.matrix = oldMatrix;
    }
}

function rotateMatrix(matrixTetromino) {
    const N = matrixTetromino.length;
    const rotateMatrix = [];

    for(let i = 0; i < N; i++) {
        rotateMatrix[i] = [];
        for(let j = 0; j < N; j++) {
            rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
        }
    }

    return rotateMatrix;
}

// COLLISIONS (щоб фігура не виходила за рамки)

function isValid() {
    const matrixSize = tetromino.matrix.length;
    for(let row = 0; row < matrixSize; row++) {
        for(let column = 0; column < matrixSize; column++) {
            if(isOutsideOfGameboard(row, column)) {return false};
            if(hasCollisions(row, column)) {return false};
        }
    }

    return true;
}
// коли фігура не поміщається на полі
function isOutsideOfTopGameboard(row) {
    return tetromino.row + row < 0;
}

function isOutsideOfGameboard(row, column) {
    return tetromino.matrix[row][column] &&
           (tetromino.row + row >= PLAYFIELD_ROWS || 
           tetromino.column + column < 0 ||
           tetromino.column + column >= PLAYFIELD_COLUMNS);

    // return col < 0 || 
    //        col > PLAYFIELD_COLUMNS - tetromino.matrix.length ||
    //        row > PLAYFIELD_ROWS - tetromino.matrix.length;
} 

function hasCollisions(row, column) {
    return tetromino.matrix[row][column] && playfield[tetromino.row + row]?.[tetromino.column + column]
}

// DRAW

function drawTetromino() {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;

    for(let row = 0; row < tetrominoMatrixSize; row++) {
        for(let column = 0; column < tetrominoMatrixSize; column++) {
            //temp Код для прикладу обертання фігур
            // const cellIndex = convertPositionToIndex(tetromino.row + row, tetromino.column + column);
            // cells[cellIndex].innerHTML = showRotated[row][column];
            //
            if(isOutsideOfTopGameboard(row)) { continue };
            if (!tetromino.matrix[row][column]) { continue };

            const cellIndex = convertPositionToIndex(tetromino.row + row, tetromino.column + column);
            cells[cellIndex].classList.add(name);
        }
    }
}

function drawPlayField() {
    for(let row = 0; row < PLAYFIELD_ROWS; row++) {
        for(let column = 0; column < PLAYFIELD_COLUMNS; column++) {
            if(!playfield[row][column]) continue;
            const nameFigure = playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);

            cells[cellIndex].classList.add(nameFigure);
        }
    }    
}

function countScore(destroyRow) {
    if(destroyRow == 1) {
        score += 10;
    }
    if(destroyRow == 2) {
        score += 30;
    }
    if(destroyRow == 3) {
        score += 50;
    }
    if(destroyRow == 4) {
        score += 100;
    }

    scoreElemet.innerHTML = score;
    scoreTotal.innerHTML = score;
}

function placeTetromino() {
    const tetrominoMatrixSize = tetromino.matrix.length;
    for(let row = 0; row < tetrominoMatrixSize; row++) {
        for(let column = 0; column < tetrominoMatrixSize; column++) {  
            if(isOutsideOfTopGameboard(row))  {
                isGameOver = true;
                overlay.style.display = 'flex';
                // виводимо рахунок гри
                timeGameStop();
                timeGame.innerHTML = i + 'sec';
                return;
            }        
            if (tetromino.matrix[row][column]) {
                playfield[tetromino.row + row][tetromino.column + column] = tetromino.name;
            }
        }
    }
    console.log(playfield);
    generateTetromino();

    //заповненні ряди
    let filledRows = findFilledRows();
    // console.log(filledRows);
    removeFillRow(filledRows);
    countScore(filledRows.length);
    generateTetromino();
}

//функція пошуку заповнених рядків
function findFilledRows() {
    const fillRows = [];
    for(let row = 0; row < PLAYFIELD_ROWS; row++) {
        let fillColumns =0;
        for(let column = 0; column < PLAYFIELD_COLUMNS; column++) {  
            if(playfield[row][column] != 0) {
                fillColumns++;
            }
        }
        // якщо всі елементи заповнені
        if(PLAYFIELD_COLUMNS == fillColumns) {
            fillRows.push(row);
        }
    }

    return fillRows;
}

//видалення рядків
function removeFillRow(filledRows) {
    //в filledRows приходе массив с запоненими рядками напр [19, 17]
    for(let i = 0; i < filledRows.length; i++) {
        const row = filledRows[i];
        dropRowsAbove(row);
    }
}

function dropRowsAbove(rowDelete) {
    for(let row = rowDelete; row > 0; row--) {
        playfield[row] = playfield[row - 1];        
    }
    playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function moveDown() {
    moveTetrominoDown();
    draw();
    stopLoop();
    startLoop();
}


function startLoop() {
    // requestAnimationFrame изучить
    timedId = setTimeout( ()=> requestAnimationFrame(moveDown), 500 );
}

function stopLoop() {
    clearTimeout(timedId);

    timedId = null;
}

let i = 0;
let tiGameId = null;
function timeGameStart() {
    tiGameId = setInterval(function() {
        i++;
    }, 1000)
}
function timeGameStop() {
    clearInterval(tiGameId)
}

timeGameStart();

init();