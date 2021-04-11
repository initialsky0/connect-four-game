function getCSSVar(varName) {
   // Get actual value for css variable
   return getComputedStyle(document.documentElement).getPropertyValue(varName).slice(1);
}

function dispPlayerText(player, pName1, pName2) {
   // Determine what to display based on current player
   const playerText = $('.player');
   playerText[0].textContent = player ? pName1 : pName2;
   $(playerText[0]).css('color', player ? 'var(--p1-color)' : 'var(--p2-color)');
   playerText[1].textContent = player ? 'blue' : 'red';
   $(playerText[1]).css('color', player ? 'var(--p1-color)' : 'var(--p2-color)');
}

function getPlayerInfo(player, playerName, event) {
   // function to obtain player name, and hide the form after info is updated
   event.preventDefault();
   playerName.player1 = $( 'input' ).eq(0).val();
   playerName.player2 = $( 'input' ).eq(1).val();

   // Handle text to display and hidden
   $('.player-text')[0].hidden = false;
   dispPlayerText(player, playerName.player1, playerName.player2);
   $('.start-text')[0].hidden = true;
   $('#btn-restart').css('display', 'block');
}

function checkFour(col, row) {
   // Function to check for 4 chip in a row based on position of current chip placed, 
   // and return true if conditions are met (the player wins) 
   if(!row) return;
   const colorToCheck = $(`.${row} .${col}`).css('background-color');

   const checkXPos = (col) => {
      // +x
      const colNum = parseInt(col.split('-')[1]) + 1;
      if(colNum < 7) {
         const newCol = 'col-' + colNum;
         if(colorToCheck === $(`.${row} .${newCol}`).css('background-color')) {
            return 1 + checkXPos(newCol);
         }
      }
      return 0;
   }

   const checkXNeg = (col) => {
      // -x
      const colNum = parseInt(col.split('-')[1]) - 1;
      if(colNum >= 0) {
         const newCol = 'col-' + colNum;
         if(colorToCheck === $(`.${row} .${newCol}`).css('background-color')) {
            return 1 + checkXNeg(newCol);
         }
      }
      return 0;
   }

   const checkYNeg = (row) => {
      // -y only, bc there is no way to connect with +y
      const rowNum = parseInt(row.split('-')[1]) - 1;
      if(rowNum >= 0) {
         const newRow = 'row-' + rowNum;
         if(colorToCheck === $(`.${newRow} .${col}`).css('background-color')) {
            return 1 + checkYNeg(newRow);
         }
      }
      return 0;
   }

   const checkXYPosUp = (row, col) => {
      // diagnal / up
      const rowNum = parseInt(row.split('-')[1]) + 1;
      const colNum = parseInt(col.split('-')[1]) + 1;
      if(colNum < 7 && rowNum < 6) {
         const newRow = 'row-' + rowNum;
         const newCol = 'col-' + colNum;
         if(colorToCheck === $(`.${newRow} .${newCol}`).css('background-color')) {
            return 1 + checkXYPosUp(newRow, newCol);
         }
      }
      return 0;
   }

   const checkXYPosDown = (row, col) => {
      // diagnal / down
      const rowNum = parseInt(row.split('-')[1]) - 1;
      const colNum = parseInt(col.split('-')[1]) - 1;
      if(colNum >= 0 && rowNum >= 0) {
         const newRow = 'row-' + rowNum;
         const newCol = 'col-' + colNum;
         if(colorToCheck === $(`.${newRow} .${newCol}`).css('background-color')) {
            return 1 + checkXYPosDown(newRow, newCol);
         }
      }
      return 0;
   }

   const checkXYNegDown = (row, col) => {
      // diagnal \ down
      const rowNum = parseInt(row.split('-')[1]) - 1;
      const colNum = parseInt(col.split('-')[1]) + 1;
      if(colNum < 7 && rowNum >= 0) {
         const newRow = 'row-' + rowNum;
         const newCol = 'col-' + colNum;
         if(colorToCheck === $(`.${newRow} .${newCol}`).css('background-color')) {
            return 1 + checkXYNegDown(newRow, newCol);
         }
      }
      return 0;
   }

   const checkXYNegUp = (row, col) => {
      // diagnal \ up
      const rowNum = parseInt(row.split('-')[1]) + 1;
      const colNum = parseInt(col.split('-')[1]) - 1;
      if(colNum >= 0 && rowNum < 6) {
         const newRow = 'row-' + rowNum;
         const newCol = 'col-' + colNum;
         if(colorToCheck === $(`.${newRow} .${newCol}`).css('background-color')) {
            return 1 + checkXYNegUp(newRow, newCol);
         }
      }
      return 0;
   }

   // Check for 4
   // console.log('X: ', 1 + checkXPos(col) + checkXNeg(col));
   // console.log('Y: ', 1 + checkYNeg(row));
   // console.log('+XY', 1 + checkXYPosUp(row, col) + checkXYPosDown(row, col));
   // console.log('-XY', 1 + checkXYNegDown(row, col) + checkXYNegUp(row, col));
   return (
      (1 + checkXPos(col) + checkXNeg(col)) > 3 || 
      (1 + checkYNeg(row)) > 3 || 
      (1 + checkXYPosUp(row, col) + checkXYPosDown(row, col)) > 3 || 
      (1 + checkXYNegDown(row, col) + checkXYNegUp(row, col)) > 3
   ) ? true : false;
}

function putChip(player, col, boardRow) {
   // place chip based on column, and return an obj of current player and chip row
   if(!boardRow.length) return { currentPlayer: player, row: '' };
   const rows = [...boardRow];
   const currentRow = rows.pop();
   const lastChip = $(currentRow).children('.' + col);
   if($(lastChip).css('background-color') === getCSSVar('--blank-color')) {
      player 
         ? $(lastChip).css('background-color', 'var(--p1-color)')
         : $(lastChip).css('background-color', 'var(--p2-color)');
      return { currentPlayer: !player, row: currentRow.className };
   } else {
      return putChip(player, col, rows);
   }
}

function clickChip(player, event) {
   // handles onclick for chips 
   // Another way to get column number is by using table index with jquery: 
   // console.log($(event.target).index()); 
   const boardRow = $('#game-board tr');
   const col = event.target.className.split(' ')[0];
   const { currentPlayer, row } = putChip(player, col, boardRow);
   const victory = checkFour(col, row);
   if(victory) {
      $('#game-board td').off('click');
      $('.player-text')[0].hidden = true;
      $('h2')[0].textContent = `${$('.player')[0].textContent} Won! Click the restart button to play again!`;
   }
   return { player :currentPlayer, placed: row ? 1 : 0 };
}

function main() {
   // Player state
   let currentPlayer = true;
   const playerName = {
      player1: '',
      player2: ''
   };

   // Board assets
   let chipCount = 0;
   const boardChips =  $('#game-board td');
   
   // On click function for each chip
   const handleChipClick = event => {
      const { player, placed } = clickChip(currentPlayer, event);
      currentPlayer = player;
      chipCount += placed;
      dispPlayerText(currentPlayer, playerName.player1, playerName.player2);
      if(chipCount === 42 && $('.player-text')[0].hidden !== true) {
         // Condition when draw
         $('#game-board td').off('click');
         $('.player-text')[0].hidden = true;
         $('h2')[0].textContent = `It's a draw! Click the restart button to play again!`;
      }
   }

   // Get player info and start the game
   $('#player-info').submit(event => {
      getPlayerInfo(currentPlayer, playerName, event);
      boardChips.click(handleChipClick);
   });

   // Restart button
   $('#btn-restart').click(() => {
      currentPlayer = true;
      chipCount = 0;
      $('.player-text')[0].hidden = false;
      dispPlayerText(currentPlayer, playerName.player1, playerName.player2);
      $('h2')[0].textContent = 'The object of this game is to connect four of your chips in a row!';
      boardChips.css('background-color', 'var(--blank-color)');
      
      // Check if chip click listener is on
      if(!$._data($('#game-board td')[0], 'events')) boardChips.click(handleChipClick);
   });
}

main();