$(document).ready(function () {

    let Words = [];
    let DisplayWords = [];

    let Keyword = '';
    let KeyWordSet;
   
    const MAX_KEYWORD_LENGTH = 15;
    const MIN_KEYWORD_LENGTH = 4;


    function ResetAll() {

        //Очистка поля со словами
        ResetShowDisplayWordsSection();

    }

    function ResetShowDisplayWordsSection() {
        searchResult.empty();
    }


    let keywordPlace = $('#key-word');
    //Поиск слов по ключевому слову
    $('#get-words-form').submit(function () {

        ResetAll()

        Keyword = $('#get-keyword').val().toLowerCase().trim()

        if (!CheckInputValue()) {
            return false;
        }

        KeyWordSet = new Set(Keyword.split(''))

        keywordPlace.empty();
        AddKeywordToView();

        StartLoading();

        $.ajax({
            type: 'GET',
            url: window.location.pathname,
            dataType: 'json',
            data: {
                handler: "WordsResult",
                keyWord: Keyword
            },
            success: function (data) {

                AfterGettingResults(data)
            }
        })

        return false;
    });

    function AddKeywordToView() {
        let htmlText = '';
        for (let i = 0; i < Keyword.length; i++) {
            htmlText += '<div class="key-word-letter"> <div class="kw-letter-symbol" >' + Keyword[i] + '</div ><div class="kw-letter-underline"></div><div class="kw-letter-number">' + GetLetterFromKeywordSet(Keyword[i]) + '</div></div >';
        }
        keywordPlace.html(htmlText);
    }

    function GetLetterFromKeywordSet(letter) {
        let i = 0;
        for (let value of KeyWordSet.keys()) {
            if (value === letter) {
                return (i + 1);
            }
            i++;
        }
    }

    let loading = $('.container-fluid-loading');
    //Начало загрузки
    function StartLoading() {
        loading.css('display', 'block');
    }

    //Конец загрузки
    function EndLoading() {
        loading.css('display', 'none');
    }

    /*KEY WORD-------------------------------------------------------------------------------------------*/

    //Валидация для ключевого слова
    function CheckInputValue() {

        if (!CheckMinKeyWordLength()) {
            return false;
        }

        if (Keyword.length > MAX_KEYWORD_LENGTH) {
            $('#input-Keyword-error').text("Максимум 15 букв")
            return false;
        }

        let expr = /^[а-яa-z]+$/i

        if (!expr.test(Keyword)) {

            EditKeyValue();
            $('#get-keyword').val(Keyword)

            return CheckMinKeyWordLength();
        }

        return true;

    }

    //Проверка на минимальную длину ключевого слова
    function CheckMinKeyWordLength() {

        if (Keyword.length < MIN_KEYWORD_LENGTH) {
            $('#input-Keyword-error').text("Минимум 4 буквы")
            return false;
        }

        return true
    }

    //Редактирование ключеваого слова
    function EditKeyValue() {
        let exprInt = /^\d+$/i

        let keyValueArr = Keyword.split('')

        keyValueArr = keyValueArr.filter(function (item) {
            return !exprInt.test(item);
        });

        let temp = keyValueArr.join('');
        Keyword = temp;

        return;
    }

    /*KEY WORD-------------------------------------------------------------------------------------------*/



    //Действия после получения набора слов из базы данных
    function AfterGettingResults(data) {

        if (InsertData(data)) {

            ShowDisplayWords();
            CreateListWordsForFillword();
            CreateListWordsForSudoku();
            CreateListWordsForCrossword();
            CreateListWordsForChess();
            //console.log("конец AfterGettingResults")

        }
        else {

            console.log("Ошибка")
        }

        EndLoading();
    }


    /*WORDS START----------------------------------------------------------------------------------------*/
    function InsertData(data) {

        var tempArr = CreateWordsSet(data)

        Words = [];

        for (var i = 3; ; i++) {

            temp = tempArr.filter(item => item.length == i);

            if (temp.length !== 0) {
                Words['|' + i + '|'] = temp
            }

            if (i == MAX_KEYWORD_LENGTH) {
                break;
            }
        }

        return CreateDisplayWordsArray()
    }

    //Создание массива всех слов из полученных данных
    function CreateWordsSet(data) {
        let WordsSet = []

        for (var i = 0; i < data.length; i++) {
            WordsSet[i] = data[i].word
        }

        return WordsSet;
    }

    const MAX_SYMBOLS_COUNT = 60
    let MAX_WORDS_SYMBOLS_FOR_KEY_WORD = 0;
    let currenSymbols = 0;

    //Создание массива исппользуемых слов
    function CreateDisplayWordsArray() {   
        DisplayWords = [];
        currenSymbols = 0;

        let notAddedWords = 0;
        let temp = 0;

        let added = 5
        notAddedWords += AddFirstWords(3, added);

        added = 4 + notAddedWords;
        temp = AddFirstWords(4, added);
        if (temp == added) {
            //Error(id,Невозможно собрать судоку)
            return false;
        }

        if (temp == 0) {
            MAX_WORDS_SYMBOLS_FOR_KEY_WORD = 8;
        }
        else {
            MAX_WORDS_SYMBOLS_FOR_KEY_WORD = 9 - temp;
        }


        if (MAX_WORDS_SYMBOLS_FOR_KEY_WORD <= 4) {
            //Error(id,Невозможно собрать кроссворд)
            return false;
        }

        added = 3;
        let at = false;
        for (let i = 5; i < MAX_WORDS_SYMBOLS_FOR_KEY_WORD + 1; i++) {

            let lTemp = AddFirstWords(i, added)

            if (lTemp == added && ((i + 1) == (MAX_WORDS_SYMBOLS_FOR_KEY_WORD + 1)) && !at) {
                //Error(id,Невозможно собрать кроссворд)
                return false;
            }

            if (lTemp < added && !at) {
                at = true;
            }


            if (currenSymbols >= MAX_SYMBOLS_COUNT) {
                break;
            }
        }

        AddOtherWords();

        return true;
    }

    //Добавление слов в массив DisplayWords
    function AddFirstWords(count, added) {

        if (Words['|' + count + '|'] == undefined) {
            return added;
        }

        let tempArr = Words['|' + count + '|'].slice();

        if (tempArr.length !== 0) {

            Shuffle(tempArr)

            for (var i = 0; i < tempArr.length; i++) {

                if (currenSymbols >= MAX_SYMBOLS_COUNT) {
                    return -1;
                }

                DisplayWords.push(tempArr[i]);
                currenSymbols += count
                added--;

                if (added == 0) {
                    break;
                }
            }
        }

        return added;
    }

    //Добавление оставшихся слов
    function AddOtherWords() {

        if (currenSymbols < MAX_SYMBOLS_COUNT) {
            let tmp;

            for (var i = MAX_WORDS_SYMBOLS_FOR_KEY_WORD + 1; i <= 15; i++) {
                tmp = AddFirstWords(i, 3)

                if (tmp == -1) {
                    break;
                }
            }
        }

    }

    /*WORDS END------------------------------------------------------------------------------------------*/


    /*WORDS DISPLAY--------------------------------------------------------------------------------------*/

    let searchResult = $('#search-result');
    let letterClasses = ['letter', 'letter letter-selected'];

    //Отображение слов
    function ShowDisplayWords() {

        ResetShowDisplayWordsSection();

        let res = '';
        let insertedClass = '';
        let rundomLetterSelection = getRandomInt(3) + 2;

        DisplayWords.forEach(function (item, i) {

            let htmlText = '<div class="word-res">';

            for (let j = 0; j < item.length; j++) {

                if (rundomLetterSelection == 0) {
                    insertedClass = letterClasses[1];
                    rundomLetterSelection = getRandomInt(3) + 2;
                }
                else {
                    insertedClass = letterClasses[0]
                    rundomLetterSelection--;
                }

                htmlText += '<div class="word-letter"><div class="' + insertedClass + '">' + item[j] + '</div ><div class="number">' + WordPosition(item[j]) + '</div></div>'

            }

            htmlText += '</div>';

            res += htmlText
        });

        searchResult.append(res);

    }

    //Поиск номера слова
    function WordPosition(letter) {

        let i = 0;

        for (let key of KeyWordSet.keys()) {

            i++;

            if (key === letter) {
                return i;
            }
            
        }

        return -1;
    }

    /*WORDS DISPLAY--------------------------------------------------------------------------------------*/



    /*FILLWORD DISPLAY-----------------------------------------------------------------------------------*/

    let wordsForFillword = [];
    let fillwordCells = $('#table-fillword tr > td > span')

    const FILLWORD_ROWS = 4
    const FILLWORD_COLUMNS = 7;
    const MAX_VERTICAL_WORDS = 3;

    let fillwordMatrix = [
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],]

    
    let fillwordDirection = ['RIGHT', 'DOWN']
    let hotizontalWords = [];
    let verticalWords = [];
    let tempFillwordArray = [];
    let usedColumns = [];
    let exeptedColumn = 0;
    let currentInsertedVerticalWords = 0;

    function ResetFillword() {
        hotizontalWords = [];
        verticalWords = [];
        tempFillwordArray = [];
        currentInsertedVerticalWords = 0;
        exeptedColumn = 0;
        ResetUsedColimns();
        ResetFillwordView();
        ResetFillwordMatrix();
    }

    //Создание списка слов для филворда
    function CreateListWordsForFillword() {
        wordsForFillword = [];
        wordsForFillword = DisplayWords.filter(function (word) {
            return word.length <= 6;
        });
        CreateFillword();
    }

    //Создание филворда
    function CreateFillword() {
        ResetFillword();

        tempFillwordArray = wordsForFillword.slice();

        SetHorizontalWords();
        SetVerticalWords();
        FillEmptyValue();
        BringOutToView();
        DisplaySelectedWords();

        console.log(hotizontalWords);
        console.log(verticalWords);
    }

    //Вставка горизонтальных слов
    function SetHorizontalWords() {
        Shuffle(tempFillwordArray);

        let currentRow = 0;
        let randomStart = 0;

        for (let i = 0; i < 2; i++) {
            hotizontalWords[i] = tempFillwordArray[tempFillwordArray.length - 1 ];
            tempFillwordArray.splice(tempFillwordArray.length - 1, 1);
        }

        exeptedColumn = getRandomInt(2);
        if (exeptedColumn === 1) {
            exeptedColumn = FILLWORD_COLUMNS - 1;
        }

        for (let i = 0; i < hotizontalWords.length; i++) {
            if (exeptedColumn === 0) {
                randomStart = getRandomInt(FillwordStarPosition(FILLWORD_COLUMNS, hotizontalWords[i]));
                if (randomStart === 0) {
                    randomStart++;
                }
                AddWordToFillword(hotizontalWords[i], randomStart, currentRow, fillwordDirection[0]);
            }
            else if (exeptedColumn === 6) {
                randomStart = getRandomInt(FillwordStarPosition(FILLWORD_COLUMNS, hotizontalWords[i]));
                if (randomStart + (hotizontalWords[i].length - 1) === 6) {
                    randomStart--;
                }
                AddWordToFillword(hotizontalWords[i], randomStart, currentRow, fillwordDirection[0]);
            }

            if (i === 0) {
                currentRow = getRandomInt(FILLWORD_ROWS);
                if (currentRow === 0) {
                    currentRow++;
                }
            }        
        } 
    }

    //Вставка вертикальных слов
    function SetVerticalWords() {
        let tempArrayForVerticalWords = tempFillwordArray.filter(function (word) {
            return word.length <= FILLWORD_ROWS;
        });

        for (let i = 0; i < tempArrayForVerticalWords.length; i++) {
            InsertVerticalWord(tempArrayForVerticalWords[i]);
            if (currentInsertedVerticalWords === MAX_VERTICAL_WORDS) {
                break;
            }
        }
    }

    //Поиск слова для вставки по вертикали
    function InsertVerticalWord(word) {
        let column = [];
        let result;
        let appropriateWord = '';

        for (let z = 0; z < FILLWORD_COLUMNS; z++) {
            if (usedColumns[z]) {
                continue;
            }

            column = [];

            for (let i = 0; i < FILLWORD_ROWS; i++) {
                column[i] = fillwordMatrix[i][z];
            }

            result = CheckForEmptySpace(column);

            if (result === 0) {
                AddWordToFillword(word, z, getRandomInt(FillwordStarPosition(FILLWORD_ROWS, word)), fillwordDirection[1]);
                usedColumns[z] = true;
                currentInsertedVerticalWords++;
                verticalWords[verticalWords.length] = word;
                return true;
            }
            else if (result === -1) {
                appropriateWord = CheckingForAppropriateWord(word, column)
                if (appropriateWord !== '') {
                    AddWordToFillword(appropriateWord[0], z, appropriateWord[1], fillwordDirection[1]);
                    usedColumns[z] = true;
                    currentInsertedVerticalWords++;
                    verticalWords[verticalWords.length] = word;
                    return true;
                }

            }
        }
        return false;    
    }

    //Нахождения подходящего слова для вставки в филворд
    function CheckingForAppropriateWord(word, column) {
        let shift = FillwordStarPosition(FILLWORD_ROWS, word);
        let currentShift = -1;

        let hits = 0;
        let isHere = false;

        for (let i = 0; i <= shift; i++) {
            hits = 0;
            currentShift++;
            for (let j = i, s = 0; s < word.length; j++, s++) {

                if (column[j] === word[s] || column[j] === '') {
                    hits++;
                    continue;
                }
                if ((FILLWORD_ROWS - (word.length + i)) > 0) {
                    break;
                }
                return '';
            }

            if (hits >= word.length) {
                isHere = true;
                break;
            }
        }

        if (!isHere) {
            return '';
        }

        return [word, currentShift];
    }

    //Проверка на пустые значения в таблице филворда
    function CheckForEmptySpace(array) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] !== '') {
                return -1;
            }
        }
        return 0;
    }

    //Поиск индекса начала слова в филворде
    function FillwordStarPosition(excludingValue,word) {
        return excludingValue - word.length;
    }

    //Сброс матрицы
    function ResetFillwordMatrix() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 7; j++) {
                fillwordMatrix[i][j] = '';
            }
        }
    }

    //Сброс значений заполненных столбцов
    function ResetUsedColimns() {
        usedColumns = [];
        for (let i = 0; i < FILLWORD_COLUMNS; i++) {
            usedColumns[i] = false;
        }
    }

    //Добавление слова в таблицу
    function AddWordToFillword(word, startX, startY, direction) {
        if (direction === fillwordDirection[0]) {
            for (let i = 0; i < word.length; i++) {
                fillwordMatrix[startY][startX] = word[i];
                startX++;
            }
        }

        if (direction === fillwordDirection[1]) {
            for (let i = 0; i < word.length; i++) {
                fillwordMatrix[startY][startX] = word[i];
                startY++;
            }
        }      
    }

    //Вывод слов на сайт
    function BringOutToView() {
        let cellsCounter = 0;
        for (let i = 0; i < FILLWORD_ROWS; i++) {
            for (let j = 0; j < FILLWORD_COLUMNS; j++) {
                fillwordCells[cellsCounter].innerText = fillwordMatrix[i][j];
                cellsCounter++;
            }
        }
    }

    //Сброс представления филворда на сайте
    function ResetFillwordView() {
        for (let i = 0; i < fillwordCells.length; i++) {
            fillwordCells[i].innerText = '';
        }
    }

    //Заполнение пустых значений в таблице филворда
    function FillEmptyValue() {
        for (let i = 0; i < FILLWORD_ROWS; i++) {
            for (let j = 0; j < FILLWORD_COLUMNS; j++) {
                if (fillwordMatrix[i][j] === '') {
                    fillwordMatrix[i][j] = GetRandomLetterOfKeyword();
                }
            }
        }
    }

    //Получение случайной буквы из ключевого слова
    function GetRandomLetterOfKeyword() {
        let counter = getRandomInt(KeyWordSet.size);
        let it = 0;
        for (let letter of KeyWordSet.keys()) {
            if (it === counter) {
                return letter;
            }
            it++;
        }     
    }

    let horizontalValuesList = $('#horizontal-fillword-words');
    let verticalValuesList = $('#vertical-fillword-words');

    //Отображение вставленных слов
    function DisplaySelectedWords(){
        horizontalValuesList.empty();
        verticalValuesList.empty();

        for (let i = 0; i < verticalWords.length; i++) {
            verticalValuesList.append('<li>' + verticalWords[i] + '</li>');
        }

        for (let i = 0; i < hotizontalWords.length; i++) {
            horizontalValuesList.append('<li>' + hotizontalWords[i] + '</li>');
        }
    }

    /*FILLWORD DISPLAY-----------------------------------------------------------------------------------*/



    /*SUDOKU START---------------------------------------------------------------------------------------*/

    let WordsForSudoku = []
    let sudokuList = $('#sudoku-values .options-container:eq(0)');
    let tableSudoku = $('#table-sudoku tr > td > span');

    //Создание списка слов для судоку
    function CreateListWordsForSudoku() {
        WordsForSudoku = [];
        WordsForSudoku = DisplayWords.filter(function (item) {
            return item.length == 4;
        })

        sudokuList.empty();

        for (let i = 0; i < WordsForSudoku.length; i++) {
            sudokuList.append('<div class="option"><input type="radio" class="radio"  id="' + WordsForSudoku[i] + '" name="sudokuItem" /> <label for=' + WordsForSudoku[i] + '>' + WordsForSudoku[i] + '</label> </div >');
        }

        SetSudoku(WordsForSudoku[0])

        return false;
    }

    //Очистка значений таблицы судоку
    function ClearSudokuTable() {
        for (let i = 0; i < tableSudoku.length; i++) {
            tableSudoku[i].innerText = '';
        }
    }

    //Формирование значений для судоку
    function SetSudoku(value) {
        ClearSudokuTable()
        selectedSudoku.text(value)

        const ROWS = 4
        const COLUMS = 4
        const DONTMOVE = 1

        let valueArr = value.split('');

        tableSudoku[0].innerText = valueArr[0];
        tableSudoku[5].innerText = valueArr[0];
        tableSudoku[10].innerText = valueArr[1];
        tableSudoku[15].innerText = valueArr[2];
        tableSudoku[12].innerText = valueArr[3];

        let curRowValues = []
        let tempArr = []
        let currentRow = 0;

        for (let i = 0, z = 0; i < ROWS; i++) {

            for (let j = 0; j < COLUMS; j++) {
                curRowValues[j] = tableSudoku[z].innerText.toLowerCase();
                z++;
            }

            tempArr = []

            valueArr.forEach(function (item, index) {
                tempArr[index] = item;
            });

            let temp;
            let index;

            for (let a = 0; a < ROWS; a++) {

                temp = curRowValues[a];

                for (let b = 0; b < COLUMS; b++) {

                    if (temp == tempArr[b]) {

                        index = tempArr.indexOf(temp);
                        tempArr.splice(index, 1);
                        break;

                    }
                }
            }

            if (i != DONTMOVE) {
                tempArr.push(tempArr.shift());
            }

            for (let c = COLUMS * currentRow, fC = 0, tt = 0; tt < COLUMS; c++ , tt++) {

                if (tableSudoku[c].innerText == '') {
                    tableSudoku[c].innerText = tempArr[fC]
                    fC++;
                }
            }

            currentRow++;
        }
    }

    /*SUDOKU END-----------------------------------------------------------------------------------------*/



    /*CROSSWORD START------------------------------------------------------------------------------------*/

    let WordsForCrossword = []
    let crosswordList = $('#crossword-values .options-container:eq(0)');
    let RightWordsForCrosswordCopy = [];

    //Создание списка слов для кроссворда
    function CreateListWordsForCrossword() {
        WordsForCrossword = []
        WordsForCrossword = DisplayWords.filter(function (item) {
            return item.length >= 5 && item.length <= MAX_WORDS_SYMBOLS_FOR_KEY_WORD;
        });

        RightWordsForCrosswordCopy = DisplayWords.filter(function (item) {
            return item.length <= 7;
        });

        crosswordList.empty();

        for (let i = 0; i < WordsForCrossword.length; i++) {
            crosswordList.append('<div class="option"><input type="radio" class="radio"  id="' + WordsForCrossword[i] + '" name="sudokuItem" /> <label for=' + WordsForCrossword[i] + '>' + WordsForCrossword[i] + '</label> </div >');
        }

        CreateCrossword(WordsForCrossword[0]);

        return false;
    }

    let tableCrossword = $('#table-crossword tr > td > span');
    let tableCrosswordTd = $('#table-crossword tr > td');
    let tableCurrentPosition = 0;

    //Создание кроссворда
    function CreateCrossword(secretWord) {
        tableCurrentPosition = 0;
        selectedCrossword.text(secretWord);

        let RightWordsForCrossword = RightWordsForCrosswordCopy.slice();

        let delIndx = RightWordsForCrossword.indexOf(secretWord);
        RightWordsForCrossword.splice(delIndx, 1);

        Shuffle(RightWordsForCrossword);

        for (let i = 0; i < secretWord.length; i++) {
            let completed = AddRowToCrossword(secretWord[i], RightWordsForCrossword)

            if (!completed) {
                console.log("Не удалось создать кроссворд")
                return false;
            }

            if (i == (secretWord.length - 1) && i != 6) {
                HideRemainingCells(i)
            }
        }

        return true;
    }

    //Спрятать оставшиеся неиспользуемые клетки
    function HideRemainingCells(startRow) {
        for (var i = startRow + 1; i < 8; i++) {
            for (var j = 0; j < 7; j++) {
                tableCrosswordTd[tableCurrentPosition].classList.add('tdInactive')
                tableCurrentPosition++;
            }
        }
    }

    //Заполнение строки в кроссворде
    function AddRowToCrossword(letter, array) {
        let word;
        let indxLetter;

        for (var i = 0; i < array.length; i++) {

            word = array[i];
            indxLetter = FindIndexes(letter, word);

            if (indxLetter == -1 || indxLetter > 3 || (word.length - (indxLetter + 1)) > 3) {
                continue;
            }

            array.splice(i, 1);

            let wordStart = 3 - indxLetter;
            let wordEnd = wordStart + (word.length - 1);

            for (var j = 0, l = 0; j < 7; j++) {
                if (j >= wordStart && j <= wordEnd) {
                    tableCrossword[tableCurrentPosition].innerText = word[l]
                    tableCrosswordTd[tableCurrentPosition].classList.remove('tdInactive')
                    l++;
                }
                else {
                    tableCrossword[tableCurrentPosition].innerText = '';
                    tableCrosswordTd[tableCurrentPosition].classList.add('tdInactive');
                }

                tableCurrentPosition++;
            }
            return true;
        }
        return false;
    }

    //Поиск буквы в слове
    function FindIndexes(letter, word) {
        let result = [];
        let indx = word.indexOf(letter);

        while (indx != -1) {
            result.push(indx);
            indx = word.indexOf(letter, indx + 1);

            if (indx > 3) {
                break;
            }
        }

        if (result.length == 1) {
            return result[0];
        }
        else if (result.length == 0) {
            return - 1;
        }
        else if (result.length > 1) {
            return result[getRandomInt(result.length)]
        }

        return -1;
    }

    /*CROSSWORD END--------------------------------------------------------------------------------------*/



    /*CHESS START----------------------------------------------------------------------------------------*/

    let WordsForChess = []
    let Rook_Direction = Object.freeze(['RIGHT', 'LEFT', 'UP', 'DOWN'])
    let Bishop_Direction = Object.freeze(['RIGHT-DOWN', 'LEFT-UP', 'LEFT-DOWN', 'RIGHT-UP'])

    let ChessMatrix = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],]

    //Сброс матрицы
    function ResetChessMatrix() {
        for (var i = 0; i < ChessMatrix.length; i++) {
            for (var j = 0; j < ChessMatrix[i].length; j++) {
                ChessMatrix[i][j] = 0;
            }
        }
    }

    let chessList = $('#chess-values .options-container:eq(0)');
    let tableChessTd = $('#table-chess tr > td > span');

    //Создание списка допустимых слов для шахмат
    function CreateListWordsForChess() {
        console.log('CreateListWordsForChess');

        ResetChessMatrix()

        WordsForChess = DisplayWords.filter(function (item) {
            return item.length >= 5 && item.length <= 8;
        });

        chessList.empty();

        for (var i = 0; i < WordsForChess.length; i++) {
            chessList.append('<div class="option"><input type="radio" class="radio"  id="' + WordsForChess[i] + '" name="sudokuItem" /> <label for=' + WordsForChess[i] + '>' + WordsForChess[i] + '</label> </div >');
        }

        CreateChess(WordsForChess[0], 'rook');
    }

    let figureX;
    let figureY;

    const ROOK = $("#rook");
    const BISHOP = $("#bishop");

    let CURRENT_FIGURE;

    //Перевод индекса двумерного массива в одномерный
    function TwoDimensionalArrayIndexToOneDimensional(X, Y) {

        if (Y == 0) {
            return X;
        }

        if (Y > 0) {
            return (8 * Y) + X
        }

        return -1;
    }

    //Выбор шахматной фогуры
    function SetFigureActive(figure) {

        switch (figure) {
            case 'rook': {
                BISHOP.removeClass('chess-figure-active')
                ROOK.toggleClass('chess-figure-active')
                break;
            }
            case 'bishop': {
                ROOK.removeClass('chess-figure-active')
                BISHOP.toggleClass('chess-figure-active')
                break;
            }
            default:
        }
    }

    //Создание шахмат
    function CreateChess(word, figure) {


        if (CURRENT_FIGURE != figure) {

            CURRENT_FIGURE = figure;
            SetFigureActive(figure)

        }

        tableChessTd.empty();
        ResetChessMatrix()
        selectedChess.text(word);

        figureX = getRandomInt(8);
        figureY = getRandomInt(8);

        if (figure == 'rook') {
            Rook(word);
            return
        }

        if (figure == 'bishop') {
            Bishop(word)
            return
        }

        Rook(word);
        return
    }

    /*BISHOP START---------------------------------------------------------------------------------------*/

    //Слон
    function Bishop(word) {

        let lastX = figureX;
        let lastY = figureY;

        let needFill = false;

        Bishop_PrepareField()

        let letter;
        let choice = 4;

        let res = Bishop_CheckStartPosition(figureX, figureY);

        if (res == -1) {
            res = getRandomInt(choice);
            needFill = true;
        }

        ChessMatrix[figureY][figureX] = -5;
        tableChessTd[TwoDimensionalArrayIndexToOneDimensional(figureX, figureY)].innerHTML = '<i class="fas fa-chess-bishop fa-lg"></i>';


        Bishop_ShiftFigure(res, word[0]);

        if (needFill) {

            if (res == 0 || res == 1) {

                if (lastX !== 7 && lastY !== 0) {

                    for (var i = lastY - 1, j = lastX + 1; ; i-- , j++) {
                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 0 || j == 7) {
                            break;
                        }
                    }

                }

                if (lastX !== 0 && lastY !== 7) {

                    for (var i = lastY + 1, j = lastX - 1; ; i++ , j--) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 7 || j == 0) {
                            break;
                        }
                    }
                }

            }

            if (res == 2 || res == 3) {
                if (lastX !== 0 && lastY != 0) {

                    for (var i = lastY - 1, j = lastX - 1; ; i-- , j--) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 0 || j == 0) {
                            break;
                        }
                    }

                }

                if (lastX !== 7 && lastY != 7) {

                    for (var i = lastY + 1, j = lastX + 1; ; i++ , j++) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 7 || j == 7) {
                            break;
                        }
                    }

                }
            }
        }


        for (var i = 1; i < word.length; i++) {
            letter = word[i];

            if (res == 0 || res == 1) {
                res = getRandomInt(2) + 2;
            }
            else if (res == 2 || res == 3) {
                res = getRandomInt(2);
            }

            Bishop_ShiftFigure(res, letter)

        }
    }

    //Проверка стартовой позиции фигуры
    function Bishop_CheckStartPosition(X, Y) {

        if ((X == 0 && Y == 0) || (X == 1 && Y == 0) || (X == 0 && Y == 1)) {
            return 0;
        }
        else if ((X == 7 && Y == 7) || (X == 7 && Y == 6) || (X == 6 && Y == 7)) {
            return 1;
        }
        else if ((X == 7 && Y == 0) || (X == 6 && Y == 0) || (X == 7 && Y == 1)) {
            return 2;
        }
        else if ((X == 0 && Y == 7) || (X == 0 && Y == 6) || (X == 1 && Y == 7)) {
            return 3
        }

        return -1;

    }

    //Подготовка поля
    function Bishop_PrepareField() {
        ChessMatrix[0][0] = -2;
        ChessMatrix[7][0] = -2;
        ChessMatrix[7][7] = -2;
        ChessMatrix[0][7] = -2;

        ChessMatrix[0][1] = -2;
        ChessMatrix[1][0] = -2;
        ChessMatrix[6][0] = -2;
        ChessMatrix[7][1] = -2;

        ChessMatrix[0][6] = -2;
        ChessMatrix[1][7] = -2;
        ChessMatrix[6][7] = -2;
        ChessMatrix[7][6] = -2;
    }

    //Сдвиг фигуры
    function Bishop_ShiftFigure(direction, letter) {

        let shift;

        switch (Bishop_Direction[direction]) {
            case 'RIGHT-UP': {

                shift = Bishop_CheckDiagonalBishop('RIGHT-UP')

                if (shift === -1) {

                    shift = Bishop_CheckDiagonalBishop('LEFT-DOWN')
                }

                if (shift === -1) {
                    console.log('Не удалось')
                    return false;
                }


                figureY = shift[0]
                figureX = shift[1]

                ChessMatrix[figureY][figureX] = -5;
                tableChessTd[TwoDimensionalArrayIndexToOneDimensional(figureX, figureY)].innerHTML = letter;


                Bishop_FillDiagonal('RIGHT-UP')

                break;
            }

            case 'LEFT-DOWN': {

                shift = Bishop_CheckDiagonalBishop('LEFT-DOWN')

                if (shift === -1) {

                    shift = Bishop_CheckDiagonalBishop('RIGHT-UP')
                }

                if (shift === -1) {
                    console.log('Не удалось')
                    return false;
                }


                figureY = shift[0]
                figureX = shift[1]

                ChessMatrix[figureY][figureX] = -5;
                tableChessTd[TwoDimensionalArrayIndexToOneDimensional(figureX, figureY)].innerHTML = letter;


                Bishop_FillDiagonal('LEFT-DOWN')

                break;
            }

            case 'LEFT-UP': {

                shift = Bishop_CheckDiagonalBishop('LEFT-UP')

                if (shift === -1) {

                    shift = Bishop_CheckDiagonalBishop('RIGHT-DOWN')
                }

                if (shift === -1) {
                    console.log('Не удалось')
                    return false;
                }


                figureY = shift[0]
                figureX = shift[1]

                ChessMatrix[figureY][figureX] = -5;
                tableChessTd[TwoDimensionalArrayIndexToOneDimensional(figureX, figureY)].innerHTML = letter;


                Bishop_FillDiagonal('LEFT-UP')

                break;
            }

            case 'RIGHT-DOWN': {

                shift = Bishop_CheckDiagonalBishop('RIGHT-DOWN')

                if (shift === -1) {

                    shift = Bishop_CheckDiagonalBishop('LEFT-UP')
                }

                if (shift === -1) {
                    console.log('Не удалось')
                    return false;
                }


                figureY = shift[0]
                figureX = shift[1]

                ChessMatrix[figureY][figureX] = -5;
                tableChessTd[TwoDimensionalArrayIndexToOneDimensional(figureX, figureY)].innerHTML = letter;


                Bishop_FillDiagonal('RIGHT-DOWN')

                break;
            }

        }
    }

    //Нахождение клетки для вставки буквы
    function Bishop_CheckDiagonalBishop(direction) {

        switch (direction) {
            case 'RIGHT-UP': {

                if (figureX == 7 || figureY == 0) {
                    return -1;
                }
                else {
                    return Bishop_FindIndexesForChess(figureX, figureY, 'RIGHT-UP')
                }

                break;
            }

            case 'LEFT-DOWN': {

                if (figureX == 0 || figureY == 7) {
                    return -1;
                }
                else {
                    return Bishop_FindIndexesForChess(figureX, figureY, 'LEFT-DOWN')
                }

                break;
            }

            case 'LEFT-UP': {

                if (figureX == 0 || figureY == 0) {
                    return -1;
                }
                else {
                    return Bishop_FindIndexesForChess(figureX, figureY, 'LEFT-UP')
                }

                break;
            }

            case 'RIGHT-DOWN': {

                if (figureX == 7 || figureY == 7) {
                    return -1;
                }
                else {
                    return Bishop_FindIndexesForChess(figureX, figureY, 'RIGHT-DOWN')
                }

                break;
            }

        }

        return -1;
    }

    //Нахождение клеток для вставки букв
    function Bishop_FindIndexesForChess(X, Y, direction) {

        let result = [];

        switch (direction) {
            case 'RIGHT-UP': {

                for (var i = Y - 1, j = X + 1; ; i-- , j++) {
                    if (ChessMatrix[i][j] == 0) {
                        result.push([i, j]);
                    }

                    if (i == 0 || j == 7) {
                        break;
                    }
                }

                break;
            }

            case 'LEFT-DOWN': {

                for (var i = Y + 1, j = X - 1; ; i++ , j--) {

                    if (ChessMatrix[i][j] == 0) {
                        result.push([i, j]);
                    }

                    if (i == 7 || j == 0) {
                        break;
                    }
                }

                break;
            }

            case 'LEFT-UP': {

                for (var i = Y - 1, j = X - 1; ; i-- , j--) {

                    if (ChessMatrix[i][j] == 0) {
                        result.push([i, j]);
                    }

                    if (i == 0 || j == 0) {
                        break;
                    }
                }

                break;
            }

            case 'RIGHT-DOWN': {

                for (var i = Y + 1, j = X + 1; ; i++ , j++) {

                    if (ChessMatrix[i][j] == 0) {
                        result.push([i, j]);
                    }

                    if (i == 7 || j == 7) {
                        break;
                    }
                }

                break;
            }

        }

        if (result.length == 0) {
            return -1;
        }

        return result[getRandomInt(result.length)];
    }

    //Заливка клеток с неподходящими значениями
    function Bishop_FillDiagonal(direction) {

        switch (direction) {
            case 'RIGHT-UP':
            case 'LEFT-DOWN': {

                if (figureX !== 7 && figureY !== 0) {

                    for (var i = figureY - 1, j = figureX + 1; ; i-- , j++) {
                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 0 || j == 7) {
                            break;
                        }
                    }

                }

                if (figureX !== 0 && figureY !== 7) {

                    for (var i = figureY + 1, j = figureX - 1; ; i++ , j--) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 7 || j == 0) {
                            break;
                        }
                    }
                }

                break;
            }

            case 'LEFT-UP':
            case 'RIGHT-DOWN': {

                if (figureX !== 0 && figureY != 0) {

                    for (var i = figureY - 1, j = figureX - 1; ; i-- , j--) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 0 || j == 0) {
                            break;
                        }
                    }

                }

                if (figureX !== 7 && figureY != 7) {

                    for (var i = figureY + 1, j = figureX + 1; ; i++ , j++) {

                        if (ChessMatrix[i][j] == 0) {
                            ChessMatrix[i][j] = -2
                        }

                        if (i == 7 || j == 7) {
                            break;
                        }
                    }

                }

                break;
            }

        }

    }

    /*BISHOP END-----------------------------------------------------------------------------------------*/



    /*ROOK START-----------------------------------------------------------------------------------------*/

    //Ладья
    function Rook(word) {

        let lastX = figureX;
        let lastY = figureY;

        ChessMatrix[figureY][figureX] = -5;
        tableChessTd[TwoDimensionalArrayIndexToOneDimensional(figureX, figureY)].innerHTML = '<i class="fas fa-chess-rook fa-lg"></i>';

        let letter;
        let choice = 4;

        let tempRand = getRandomInt(choice);

        Rook_ShiftFigure(tempRand, word[0]);

        if (tempRand == 0 || tempRand == 1) {

            for (var i = 0; i < 8; i++) {
                if (ChessMatrix[i][lastX] != -5) {
                    ChessMatrix[i][lastX] = -2;
                }

            }
        }

        if (tempRand == 2 || tempRand == 3) {

            for (var i = 0; i < 8; i++) {
                if (ChessMatrix[lastY][i] != -5) {
                    ChessMatrix[lastY][i] = -2;
                }

            }
        }

        for (var i = 1; i < word.length; i++) {
            letter = word[i];

            if (tempRand == 0 || tempRand == 1) {
                tempRand = getRandomInt(2) + 2;
            }
            else if (tempRand == 2 || tempRand == 3) {
                tempRand = getRandomInt(2);
            }

            Rook_ShiftFigure(tempRand, letter)

        }
    }

    //Перемещение фигуры
    function Rook_ShiftFigure(direction, letter) {

        let shift;

        switch (Rook_Direction[direction]) {
            case 'RIGHT': {

                shift = Rook_CheckRowOrColumRook('RIGHT')

                if (shift == -1) {

                    shift = Rook_CheckRowOrColumRook('LEFT')
                }

                if (shift == -1) {
                    console.log('Не удалось')
                    return false;
                }

                ChessMatrix[figureY][shift] = -5;
                tableChessTd[TwoDimensionalArrayIndexToOneDimensional(shift, figureY)].innerText = letter;

                Rook_FillRowOrColum('X')

                figureX = shift

                break;
            }

            case 'LEFT': {

                shift = Rook_CheckRowOrColumRook('LEFT')

                if (shift == -1) {

                    shift = Rook_CheckRowOrColumRook('RIGHT')
                }

                if (shift == -1) {
                    console.log('Не удалось')
                    return false;
                }

                ChessMatrix[figureY][shift] = -5;
                tableChessTd[TwoDimensionalArrayIndexToOneDimensional(shift, figureY)].innerText = letter;

                Rook_FillRowOrColum('X')

                figureX = shift

                break;
            }

            case 'UP': {

                shift = Rook_CheckRowOrColumRook('UP')

                if (shift == -1) {

                    shift = Rook_CheckRowOrColumRook('DOWN')
                }

                if (shift == -1) {
                    console.log('Не удалось')
                    return false;
                }

                ChessMatrix[shift][figureX] = -5;
                tableChessTd[TwoDimensionalArrayIndexToOneDimensional(figureX, shift)].innerText = letter;

                Rook_FillRowOrColum('Y')

                figureY = shift

                break;
            }

            case 'DOWN': {

                shift = Rook_CheckRowOrColumRook('DOWN')

                if (shift == -1) {

                    shift = Rook_CheckRowOrColumRook('UP')
                }

                if (shift == -1) {
                    console.log('Не удалось')
                    return false;
                }

                ChessMatrix[shift][figureX] = -5;
                tableChessTd[TwoDimensionalArrayIndexToOneDimensional(figureX, shift)].innerText = letter;

                Rook_FillRowOrColum('Y')

                figureY = shift

                break;
            }

        }
    }

    //Нахождение клетки для вставки буквы
    function Rook_CheckRowOrColumRook(direction) {

        switch (direction) {
            case 'RIGHT': {

                if (figureX == 7) {
                    return -1;
                }
                else {
                    return Rook_FindIndexesForChess('X', figureX, 'RIGHT')
                }

                break;
            }

            case 'LEFT': {

                if (figureX == 0) {
                    return -1;
                }
                else {
                    return Rook_FindIndexesForChess('X', figureX, 'LEFT')
                }

                break;
            }

            case 'UP': {

                if (figureY == 0) {
                    return -1;
                }
                else {
                    return Rook_FindIndexesForChess('Y', figureY, 'UP')
                }

                break;
            }

            case 'DOWN': {

                if (figureY == 7) {
                    return -1;
                }
                else {
                    return Rook_FindIndexesForChess('Y', figureY, 'DOWN')
                }

                break;
            }

        }

        return -1;
    }

    //Нахождение клеток для вставки букв
    function Rook_FindIndexesForChess(axis, startIndex, direction) {

        let result = [];

        switch (axis) {

            case 'X': {

                switch (direction) {

                    case 'RIGHT': {

                        for (var i = startIndex + 1; i < 8; i++) {
                            if (ChessMatrix[figureY][i] != -2 && ChessMatrix[figureY][i] != -5) {
                                result.push(i);
                            }
                        }

                        if (result.length == 0) {
                            return -1;
                        }

                        return result[getRandomInt(result.length)];

                        break;
                    }

                    case 'LEFT': {

                        for (var i = startIndex - 1; i >= 0; i--) {
                            if (ChessMatrix[figureY][i] != -2 && ChessMatrix[figureY][i] != -5) {
                                result.push(i);
                            }
                        }

                        if (result.length == 0) {
                            return -1;
                        }

                        return result[getRandomInt(result.length)];

                        break;
                    }
                }

                break;
            }

            case 'Y': {

                switch (direction) {

                    case 'UP': {

                        for (var i = startIndex - 1; i >= 0; i--) {
                            if (ChessMatrix[i][figureX] != -2 && ChessMatrix[i][figureX] != -5) {
                                result.push(i);
                            }
                        }

                        if (result.length == 0) {
                            return -1;
                        }

                        return result[getRandomInt(result.length)];

                        break;
                    }

                    case 'DOWN': {

                        for (var i = startIndex + 1; i < 8; i++) {
                            if (ChessMatrix[i][figureX] != -2 && ChessMatrix[i][figureX] != -5) {
                                result.push(i);
                            }
                        }

                        if (result.length == 0) {
                            return -1;
                        }

                        return result[getRandomInt(result.length)];

                        break;
                    }
                }

                break;
            }

        }

        return -1;
    }

    //Заливка клеток с неподходящими значениями
    function Rook_FillRowOrColum(axis) {

        if (axis == 'X') {
            for (var i = 0; i < 8; i++) {
                if (ChessMatrix[figureY][i] != -5) {
                    ChessMatrix[figureY][i] = -2;
                }

            }
            return;
        }

        if (axis == 'Y') {
            for (var i = 0; i < 8; i++) {
                if (ChessMatrix[i][figureX] != -5) {
                    ChessMatrix[i][figureX] = -2;
                }

            }
            return;
        }

    }

    /*ROOK END-------------------------------------------------------------------------------------------*/

    /*CHESS END------------------------------------------------------------------------------------------*/




    //Получение рандомного числа
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    //Перемешивание массива
    function Shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }


    /*EVENTS---------------------------------------------------------------------------------------------*/

    /*SHARED*/

    let optionsContainers = $('.select-box > .options-container');

    $('body').on('mouseleave', '.select-box', function () {
        optionsContainers.removeClass("active");
    });

    /*SHARED*/

   

    /*FILLWORD*/
    
    $('#update-fillword').on('click', function () {
        CreateFillword();
    });

    /*FILLWORD*/

    /*SUDOKU*/
    const selectedSudoku = $("#sudoku-values .selected");
    const optionsContainerSudoku = $("#sudoku-values  .options-container");

    $(selectedSudoku).on('click', function () {
        optionsContainerSudoku.toggleClass('active');
    });

    $(optionsContainerSudoku).on('click', '.option', function () {
        let val = $(this).find('label').text();
        console.log(selectedSudoku.text(val));
        optionsContainerSudoku.removeClass("active");
        SetSudoku(val);
    });

    /*SUDOKU*/



    /*CROSSWORD*/
    const selectedCrossword = $("#crossword-values .selected");
    const optionsContainerCrossword = $("#crossword-values  .options-container");

    $(selectedCrossword).on('click', function () {
        optionsContainerCrossword.toggleClass('active');
    });

    $(optionsContainerCrossword).on('click', '.option', function () {
        let val = $(this).find('label').text();
        optionsContainerCrossword.removeClass("active");
        CreateCrossword(val);
    });

    $('#crossword-repeat-btn').on('click', function () {
        CreateCrossword(selectedCrossword.text());
    });

    /*CROSSWORD*/



    /*CHESS*/
    const selectedChess = $("#chess-values .selected");
    const optionsContainerChess = $("#chess-values  .options-container");

    $(selectedChess).on('click', function () {
        optionsContainerChess.toggleClass('active');
    });

    $(optionsContainerChess).on('click', '.option', function () {
        let val = $(this).find('label').text();
        optionsContainerChess.removeClass("active");
        CreateChess(val, CURRENT_FIGURE);
    });

    $('#chess-repeat-btn').on('click', function () {
        CreateChess(selectedChess.text(), CURRENT_FIGURE);
    });

    $('#rook').on('click', function () {
        CreateChess(selectedChess.text(), 'rook');
    });

    $('#bishop').on('click', function () {
        CreateChess(selectedChess.text(), 'bishop');
    });

    /*CHESS*/



    /*DISPLAY WORDS*/

    let searchResultSection = $('#search-result')

    //Выделение буквы
    $(searchResultSection).on('click', '.word-letter', function () {

        $(this).find('.letter').toggleClass('letter-selected');
    });

    //Подбор новых слов
    $('#change-display-words').on('click', function () {
        CreateDisplayWordsArray();
        ShowDisplayWords();
    });

    /*DISPLAY WORDS*/

    //Выбор слова для кросворда
    //$('#crossword-values').on('click', 'li', function () {
    //    CreateCrossword($(this).text())
    //});

    //Выбор слова для шахмат
    /*$('#chess-values').on('click', 'li', function () {
        CreateChess($(this).text())
    });*/


});