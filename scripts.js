const allEmojis = [
      '🍕','🎲','🐱','🚗','🌵','🎈','🍔','🍟','🍎','🍉','🍦','🍩','🍪','🍫','🍿','🥨','🥕','🍇','🍓','🍒',
      '🍋','🍊','🍌','🍍','🥝','🥑','🍆','🥔','🥐','🍞','🧀','🍗','🍖','🍤','🍣','🍜','🍚','🍛','🍰','🎂'
    ];
    let emojis = [];
    let board = [];
    let firstPick = null;
    let lockBoard = true;
    let timerInterval = null;
    let timerStart = null;
    let score = 0;
    let pairs = 6; // default for easy

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function createBoard() {
      shuffle(allEmojis);
      emojis = allEmojis.slice(0, pairs);
      const doubled = [...emojis, ...emojis];
      shuffle(doubled);
      board = doubled.map((emoji, idx) => ({
        id: idx,
        emoji,
        flipped: true,
        matched: false
      }));
    }

    function renderBoard() {
      const gameBoard = document.getElementById('game-board');
      gameBoard.innerHTML = '';
      gameBoard.style.gridTemplateColumns = 'repeat(6, 60px)';
      board.forEach((card, idx) => {
        const box = document.createElement('div');
        box.className = 'box' + (card.flipped ? ' flipped' : '') + (card.matched ? ' matched' : '');
        box.dataset.idx = idx;
        box.innerHTML = `<span class="emoji">${card.emoji}</span>`;
        box.onclick = () => handleBoxClick(idx);
        gameBoard.appendChild(box);
      });
    }

    function updateTimerDisplay(seconds) {
      document.getElementById('timer').textContent = `Time: ${seconds.toFixed(1)}s`;
    }

    function updateScoreDisplay() {
      document.getElementById('score').textContent = `Score: ${score}`;
    }

    function startTimer() {
      timerStart = Date.now();
      updateTimerDisplay(0);
      timerInterval = setInterval(() => {
        const elapsed = (Date.now() - timerStart) / 1000;
        updateTimerDisplay(elapsed);
      }, 100);
    }

    function stopTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    function checkAllMatched() {
      if (board.every(card => card.matched)) {
        stopTimer();
        setTimeout(() => {
          alert(`You finished! Time: ${document.getElementById('timer').textContent.replace('Time: ','')}, Score: ${score}`);
          location.reload();
        }, 300);
      }
    }

    function handleBoxClick(idx) {
      if (lockBoard) return;
      const card = board[idx];
      if (card.flipped || card.matched) return;

      card.flipped = true;
      renderBoard();

      if (firstPick === null) {
        firstPick = idx;
        // Do not lock the board here, allow next pick
      } else {
        lockBoard = true;
        if (board[firstPick].emoji === card.emoji) {
          // Match: keep both open and mark as matched
          board[firstPick].matched = true;
          card.matched = true;
          board[firstPick].flipped = true;
          card.flipped = true;
          score += 2;
          updateScoreDisplay();
          firstPick = null;
          lockBoard = false;
          renderBoard();
          checkAllMatched();
        } else {
          score -= 1;
          updateScoreDisplay();
          setTimeout(() => {
            board[firstPick].flipped = false;
            card.flipped = false;
            firstPick = null;
            lockBoard = false;
            renderBoard();
          }, 600);
        }
      }
    }

    function startGame(difficulty) {
      // Set pairs based on difficulty
      if (difficulty === 'easy') pairs = 6;
      else if (difficulty === 'medium') pairs = 9;
      else if (difficulty === 'hard') pairs = 12;

      score = 0;
      updateScoreDisplay();
      document.getElementById('start-screen').style.display = 'none';
      document.getElementById('timer').style.display = '';
      document.getElementById('score').style.display = '';
      createBoard();
      renderBoard();
      updateTimerDisplay(0);
      stopTimer();
      lockBoard = true;
      setTimeout(() => {
        board.forEach(card => card.flipped = false);
        lockBoard = false;
        renderBoard();
        startTimer(); // Start timer after boxes are hidden
      }, 4000);
    }