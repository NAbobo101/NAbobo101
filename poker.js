document.addEventListener('DOMContentLoaded', () => {
  // I. Constants & Variables
  const SUITS = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
  const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']; // T=10
  const STARTING_CHIPS = 1000;
  const CHIPS_STORAGE_KEY = 'pokerChips';

  // DOM Elements
  const playerCard1El = document.getElementById('playerCard1');
  const playerCard2El = document.getElementById('playerCard2');
  const playerChipsEl = document.getElementById('playerChips');
  const communityCard1El = document.getElementById('communityCard1');
  const communityCard2El = document.getElementById('communityCard2');
  const communityCard3El = document.getElementById('communityCard3');
  const communityCard4El = document.getElementById('communityCard4');
  const communityCard5El = document.getElementById('communityCard5');
  const bot1ChipsEl = document.getElementById('bot1Chips');
  const bot1Card1El = document.getElementById('bot1Card1'); // For showing cards at showdown
  const bot1Card2El = document.getElementById('bot1Card2'); // For showing cards at showdown
  const checkButton = document.getElementById('checkButton');
  const callButton = document.getElementById('callButton');
  const betButton = document.getElementById('betButton');
  const foldButton = document.getElementById('foldButton');
  const betAmountInput = document.getElementById('betAmount');
  const potSizeEl = document.getElementById('potSize');
  const pokerMessageEl = document.getElementById('pokerMessage');
  const newRoundButton = document.getElementById('newRoundButton');

  const communityCardEls = [communityCard1El, communityCard2El, communityCard3El, communityCard4El, communityCard5El];

  // Game State
  let deck;
  let playerCards = [];
  let bot1Cards = [];
  let communityCards = [];
  let playerChipCount = STARTING_CHIPS;
  let bot1ChipCount = STARTING_CHIPS;
  let potSize = 0;
  let currentBet = 0;
  let activePlayer = 0; // 0 for player, 1 for bot
  let gamePhase = ''; // 'preflop', 'flop', 'turn', 'river', 'showdown'

  // II. Initialization
  function initPoker() {
    loadChips();
    updateUI(); // Initial UI update

    checkButton.addEventListener('click', handleCheck);
    callButton.addEventListener('click', handleCall);
    betButton.addEventListener('click', handleBet);
    foldButton.addEventListener('click', handleFold);
    newRoundButton.addEventListener('click', startNewRound);

    startNewRound();
  }

  function loadChips() {
    const savedPlayerChips = localStorage.getItem(CHIPS_STORAGE_KEY + '_player');
    const savedBotChips = localStorage.getItem(CHIPS_STORAGE_KEY + '_bot');
    if (savedPlayerChips !== null) {
      playerChipCount = parseInt(savedPlayerChips, 10);
    }
    if (savedBotChips !== null) {
      bot1ChipCount = parseInt(savedBotChips, 10);
    }
    if (isNaN(playerChipCount) || playerChipCount <= 0) playerChipCount = STARTING_CHIPS;
    if (isNaN(bot1ChipCount) || bot1ChipCount <= 0) bot1ChipCount = STARTING_CHIPS;
    saveChips();
  }

  function saveChips() {
    localStorage.setItem(CHIPS_STORAGE_KEY + '_player', playerChipCount.toString());
    localStorage.setItem(CHIPS_STORAGE_KEY + '_bot', bot1ChipCount.toString());
  }

  // III. Core Game Functions
  function createDeck() {
    const newDeck = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        newDeck.push({ suit, rank });
      }
    }
    return newDeck;
  }

  function shuffleDeck(deckToShuffle) {
    for (let i = deckToShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deckToShuffle[i], deckToShuffle[j]] = [deckToShuffle[j], deckToShuffle[i]];
    }
    return deckToShuffle;
  }

  function dealCard(deckToDealFrom) {
    return deckToDealFrom.pop();
  }

  function startNewRound() {
    if (playerChipCount <= 0) {
      pokerMessageEl.textContent = "Game Over! You are out of chips.";
      disableAllActions();
      newRoundButton.style.display = "none"; // Keep it hidden
      return;
    }
    if (bot1ChipCount <= 0) {
      pokerMessageEl.textContent = "Game Over! Bot is out of chips. You win!";
      disableAllActions();
      newRoundButton.style.display = "none"; // Keep it hidden
      return;
    }

    potSize = 0;
    currentBet = 0;
    communityCards = [];
    deck = shuffleDeck(createDeck());

    playerCards = [dealCard(deck), dealCard(deck)];
    bot1Cards = [dealCard(deck), dealCard(deck)];

    gamePhase = 'preflop';
    activePlayer = 0; // Player starts

    // Small and Big blind (simplified: player posts 5, bot posts 10)
    const smallBlind = 5;
    const bigBlind = 10;

    if (playerChipCount >= bigBlind && bot1ChipCount >= bigBlind) {
        playerChipCount -= smallBlind;
        potSize += smallBlind;
        pokerMessageEl.textContent = `You posted small blind ${smallBlind}. `;
        
        bot1ChipCount -= bigBlind;
        potSize += bigBlind;
        pokerMessageEl.textContent += `Bot posted big blind ${bigBlind}. `;
        currentBet = bigBlind;

    } else {
        // Handle case where players can't afford blinds (simplified: end game or all-in)
        pokerMessageEl.textContent = "Not enough chips for blinds. Game cannot start.";
        disableAllActions();
        return;
    }


    newRoundButton.style.display = 'none';
    if (bot1Card1El) bot1Card1El.textContent = 'X';
    if (bot1Card2El) bot1Card2El.textContent = 'X';
    
    pokerMessageEl.textContent += " Your turn.";
    updateUI();
  }

  function updateUI() {
    playerChipsEl.textContent = playerChipCount;
    bot1ChipsEl.textContent = bot1ChipCount;
    potSizeEl.textContent = potSize;

    playerCard1El.textContent = playerCards.length > 0 ? `${playerCards[0].rank}${playerCards[0].suit}` : '?';
    playerCard2El.textContent = playerCards.length > 1 ? `${playerCards[1].rank}${playerCards[1].suit}` : '?';

    communityCardEls.forEach((el, index) => {
      if (communityCards[index]) {
        el.textContent = `${communityCards[index].rank}${communityCards[index].suit}`;
      } else {
        el.textContent = '?';
      }
    });

    // Action buttons logic
    checkButton.disabled = activePlayer !== 0 || currentBet > 0; // Can only check if no bet and player's turn
    callButton.disabled = activePlayer !== 0 || currentBet === 0; // Can only call if there's a bet and player's turn
    betButton.disabled = activePlayer !== 0; // Can bet/raise if player's turn
    foldButton.disabled = activePlayer !== 0;

    if (gamePhase === 'showdown') {
        disableAllActions();
        newRoundButton.style.display = 'block';
        if (bot1Card1El && bot1Cards.length > 0) bot1Card1El.textContent = `${bot1Cards[0].rank}${bot1Cards[0].suit}`;
        if (bot1Card2El && bot1Cards.length > 1) bot1Card2El.textContent = `${bot1Cards[1].rank}${bot1Cards[1].suit}`;
    } else if (activePlayer === 0) { // Player's turn
        enablePlayerActions();
        pokerMessageEl.textContent = `Your turn. Current bet to call: ${currentBet}. Pot: ${potSize}.`;
    } else { // Bot's turn
        disableAllActions();
        pokerMessageEl.textContent = "Bot's turn...";
    }
  }
  
  function disableAllActions() {
    checkButton.disabled = true;
    callButton.disabled = true;
    betButton.disabled = true;
    foldButton.disabled = true;
  }

  function enablePlayerActions() {
      // Re-evaluate based on currentBet for player
      checkButton.disabled = currentBet > 0;
      callButton.disabled = currentBet === 0;
      betButton.disabled = false; // Player can always choose to bet or raise (if currentBet > 0, it's a raise)
      foldButton.disabled = false;
  }


  function handleFold() {
    pokerMessageEl.textContent = "You folded.";
    botWinsPot();
  }

  function handleCheck() {
    if (currentBet > 0) {
      pokerMessageEl.textContent = "Cannot check, there is a bet. Call or Raise.";
      return;
    }
    pokerMessageEl.textContent = "You checked.";
    activePlayer = 1;
    updateUI();
    setTimeout(botTurn, 1000); // Simulate bot thinking
  }

  function handleCall() {
    const callAmount = currentBet; // The amount to match
    if (playerChipCount < callAmount) {
      pokerMessageEl.textContent = "Not enough chips to call.";
      return;
    }
    playerChipCount -= callAmount;
    potSize += callAmount;
    pokerMessageEl.textContent = `You called ${callAmount}.`;
    
    // If player calls, it means the betting round might end or proceed to next phase
    // depending on whether the bot raised or initiated the bet.
    // For simplicity, if player calls bot's bet, we advance.
    // If player calls a bet that they initiated (e.g. bot re-raised), we also advance.
    activePlayer = 1; // Give bot a chance to act or proceed
    updateUI();
    setTimeout(() => {
        // If player called the bot's bet, this betting round is over.
        // Or if this was the last action of a betting round.
        // This logic needs to be more robust for multiple raises.
        // For now, assume calling ends the player's turn in this betting round.
        advanceGamePhase();
    }, 1000);
  }

  function handleBet() {
    const betValue = parseInt(betAmountInput.value, 10);
    if (isNaN(betValue) || betValue <= 0) {
      pokerMessageEl.textContent = "Invalid bet amount.";
      return;
    }
    if (betValue < currentBet && playerChipCount > (currentBet + betValue) ) { // Must bet at least the current bet (raise) or meet it
        pokerMessageEl.textContent = `Minimum raise is to ${currentBet * 2} (or go all-in).`;
        return;
    }
     if (betValue > playerChipCount) {
      pokerMessageEl.textContent = "Not enough chips.";
      return;
    }

    const amountToAddToPot = betValue; // If currentBet is 0, this is a new bet. If currentBet > 0, this is total new bet.
    const actualBetIncrease = betValue - currentBet; // How much MORE than currentBet is being put.

    if (actualBetIncrease < 0 && playerChipCount > betValue) { // Trying to bet less than currentBet, but not all-in
        pokerMessageEl.textContent = `You must call ${currentBet} or raise.`;
        return;
    }
    
    playerChipCount -= amountToAddToPot; // Player puts in the full amount of their new bet/raise
    potSize += amountToAddToPot;
    currentBet = amountToAddToPot; // The new current bet is what the player just put in.

    pokerMessageEl.textContent = `You bet ${amountToAddToPot}.`;
    activePlayer = 1;
    updateUI();
    setTimeout(botTurn, 1000);
  }

  function botTurn() {
    if (gamePhase === 'showdown') return; // No actions in showdown
    activePlayer = 1;
    updateUI(); // Show "Bot's turn..."

    setTimeout(() => { // Simulate bot thinking
        let actionTaken = false;
        // Bot AI (Simplified)
        if (currentBet === 0) { // Bot can check or bet
            if (Math.random() < 0.3 && bot1ChipCount > 10) { // 30% chance to bet
                const botBetAmount = 10; // Simplified bet
                if (bot1ChipCount >= botBetAmount) {
                    bot1ChipCount -= botBetAmount;
                    potSize += botBetAmount;
                    currentBet = botBetAmount;
                    pokerMessageEl.textContent = `Bot bets ${botBetAmount}.`;
                    actionTaken = true;
                }
            }
            if (!actionTaken) { // Default to check
                pokerMessageEl.textContent = "Bot checks.";
                actionTaken = true;
                // If bot checks and player checked, advance phase
                if(currentBet === 0) { // Player also checked
                    activePlayer = 0;
                    advanceGamePhase();
                    return;
                }
            }
        } else { // Bot must call, raise, or fold
            const amountToCall = currentBet; // Bot needs to match this from its own perspective
            if (Math.random() < 0.5 && gamePhase !== 'river') { // 50% chance to fold (less likely on river)
                pokerMessageEl.textContent = "Bot folds.";
                playerWinsPot();
                actionTaken = true;
            } else if (Math.random() < 0.8 || bot1ChipCount < amountToCall) { // 80% chance to call (or forced to call if not enough to raise/fold makes no sense)
                if (bot1ChipCount >= amountToCall) {
                    bot1ChipCount -= amountToCall;
                    potSize += amountToCall;
                    pokerMessageEl.textContent = `Bot calls ${amountToCall}.`;
                    actionTaken = true;
                    // Since bot called player's bet, this betting round ends.
                    activePlayer = 0; // Player starts next round of betting or showdown
                    advanceGamePhase();
                    return;
                } else { // Not enough to call, bot goes all-in
                    potSize += bot1ChipCount;
                    pokerMessageEl.textContent = `Bot calls all-in with ${bot1ChipCount}.`;
                    bot1ChipCount = 0;
                    actionTaken = true;
                    activePlayer = 0;
                    advanceGamePhase(); // Still advance, player might win if bot was short
                    return;
                }
            } else if (bot1ChipCount > amountToCall + 10) { // 10% chance to raise (simplified raise amount)
                const botRaiseAmount = amountToCall + 10; // Bot raises by 10 over current bet
                bot1ChipCount -= botRaiseAmount;
                potSize += botRaiseAmount;
                currentBet = botRaiseAmount; // The new current bet for the player
                pokerMessageEl.textContent = `Bot raises to ${currentBet}.`;
                actionTaken = true;
            } else { // Default to call if other conditions not met (e.g. not enough to raise properly)
                 if (bot1ChipCount >= amountToCall) {
                    bot1ChipCount -= amountToCall;
                    potSize += amountToCall;
                    pokerMessageEl.textContent = `Bot calls ${amountToCall}.`;
                    actionTaken = true;
                    activePlayer = 0;
                    advanceGamePhase();
                    return;
                } else { // All-in call
                    potSize += bot1ChipCount;
                    pokerMessageEl.textContent = `Bot calls all-in with ${bot1ChipCount}.`;
                    bot1ChipCount = 0;
                    actionTaken = true;
                    activePlayer = 0;
                    advanceGamePhase();
                    return;
                }
            }
        }

        if (actionTaken && gamePhase !== 'showdown' && activePlayer === 1) { // If bot made a bet/raise, it's player's turn
            activePlayer = 0;
        }
        updateUI();
        if (playerChipCount <= 0 || bot1ChipCount <= 0 && gamePhase !== 'showdown') {
            // If a player is all-in, proceed to showdown after current betting round.
            // This simplified logic might need more states if e.g. player bets, bot raises all-in, player needs to call again.
            // For now, if bot makes a move and one is all-in, we might fast-forward if no more betting is possible.
            if (gamePhase !== 'river' && gamePhase !== 'showdown') {
                // Rush through remaining cards if someone is all-in and called
                if( (playerChipCount === 0 || bot1ChipCount === 0) && currentBet !== 0){
                    let tempPhase = gamePhase;
                    while(tempPhase !== 'river'){
                        if (tempPhase === 'preflop') { communityCards.push(dealCard(deck), dealCard(deck), dealCard(deck)); tempPhase = 'flop'; }
                        else if (tempPhase === 'flop') { communityCards.push(dealCard(deck)); tempPhase = 'turn'; }
                        else if (tempPhase === 'turn') { communityCards.push(dealCard(deck)); tempPhase = 'river'; }
                    }
                    gamePhase = 'river'; // update the main gamePhase
                }
            }
            determineWinner(); // or advance to showdown
        }

    }, 1500); // Bot thinking time
  }

  function advanceGamePhase() {
    currentBet = 0; // Reset current bet for the new phase
    activePlayer = 0; // Player typically starts the betting round

    if (gamePhase === 'preflop') {
      gamePhase = 'flop';
      communityCards.push(dealCard(deck), dealCard(deck), dealCard(deck));
      pokerMessageEl.textContent = "Flop dealt. Your turn.";
    } else if (gamePhase === 'flop') {
      gamePhase = 'turn';
      communityCards.push(dealCard(deck));
      pokerMessageEl.textContent = "Turn dealt. Your turn.";
    } else if (gamePhase === 'turn') {
      gamePhase = 'river';
      communityCards.push(dealCard(deck));
      pokerMessageEl.textContent = "River dealt. Your turn.";
    } else if (gamePhase === 'river') {
      gamePhase = 'showdown';
      determineWinner();
      updateUI(); // update UI before determineWinner message
      return; // Winner determination handles next steps
    } else if (gamePhase === 'showdown'){
        // Round is over, newRoundButton should be visible via updateUI
        updateUI();
        return;
    }

    // If a player is all-in, and the other called, skip betting for subsequent rounds
    if (playerChipCount === 0 || bot1ChipCount === 0) {
        // If one player is all-in, and the call has been made, automatically deal remaining cards.
        // This assumes the current betting round is concluded by the all-in call.
        let tempPhase = gamePhase; // to avoid infinite loop if already river
        while(tempPhase !== 'river' && tempPhase !== 'showdown'){
            if (tempPhase === 'preflop') { if(communityCards.length < 3) communityCards.push(dealCard(deck), dealCard(deck), dealCard(deck)); tempPhase = 'flop'; pokerMessageEl.textContent = "Flop dealt. ";}
            else if (tempPhase === 'flop') { if(communityCards.length < 4) communityCards.push(dealCard(deck)); tempPhase = 'turn'; pokerMessageEl.textContent += "Turn dealt. "; }
            else if (tempPhase === 'turn') { if(communityCards.length < 5) communityCards.push(dealCard(deck)); tempPhase = 'river'; pokerMessageEl.textContent += "River dealt. "; }
        }
        gamePhase = 'river'; // Ensure gamePhase is updated
        determineWinner();
    }
    updateUI();
  }
  
  function getRankValue(rank) {
    if (RANKS.indexOf(rank) > -1) return RANKS.indexOf(rank);
    return 0; // Should not happen
  }

  function determineWinner() {
    gamePhase = 'showdown'; // Ensure phase is set for UI
    
    // Reveal bot's cards in UI
    if (bot1Card1El && bot1Cards.length > 0) bot1Card1El.textContent = `${bot1Cards[0].rank}${bot1Cards[0].suit}`;
    if (bot1Card2El && bot1Cards.length > 1) bot1Card2El.textContent = `${bot1Cards[1].rank}${bot1Cards[1].suit}`;

    // Placeholder: Simple high card comparison (from player's 2 cards and bot's 2 cards only)
    // This is NOT a full poker hand evaluation.
    const allPlayerCards = [...playerCards, ...communityCards];
    const allBotCards = [...bot1Cards, ...communityCards];

    // Extremely simplified: find highest card in hand (ignoring community cards for this simplification)
    // This will be very inaccurate for real poker.
    let playerBestRank = -1;
    playerCards.forEach(card => {
      if (getRankValue(card.rank) > playerBestRank) playerBestRank = getRankValue(card.rank);
    });

    let botBestRank = -1;
    bot1Cards.forEach(card => {
      if (getRankValue(card.rank) > botBestRank) botBestRank = getRankValue(card.rank);
    });
    
    // A slightly better placeholder: find the highest card among all 7 (2 private + 5 community)
    allPlayerCards.forEach(card => {
        if (getRankValue(card.rank) > playerBestRank) playerBestRank = getRankValue(card.rank);
    });
    allBotCards.forEach(card => {
        if (getRankValue(card.rank) > botBestRank) botBestRank = getRankValue(card.rank);
    });


    let winnerMessage = "";
    if (playerBestRank > botBestRank) {
      winnerMessage = `You win with high card ${RANKS[playerBestRank]}! Pot: ${potSize}`;
      playerChipCount += potSize;
    } else if (botBestRank > playerBestRank) {
      winnerMessage = `Bot wins with high card ${RANKS[botBestRank]}! Pot: ${potSize}`;
      bot1ChipCount += potSize;
    } else {
      winnerMessage = `It's a tie! Pot ${potSize} split.`;
      playerChipCount += Math.floor(potSize / 2);
      bot1ChipCount += Math.ceil(potSize / 2);
    }
    potSize = 0;
    pokerMessageEl.textContent = winnerMessage;
    saveChips();
    updateUI(); // Update chip counts, show New Round button
    newRoundButton.style.display = 'block';
  }

  function playerWinsPot() {
    pokerMessageEl.textContent = `Bot folds. You win the pot of ${potSize}!`;
    playerChipCount += potSize;
    potSize = 0;
    gamePhase = 'showdown'; // End of round
    saveChips();
    updateUI();
    newRoundButton.style.display = 'block';
  }

  function botWinsPot() { // Called when player folds
    pokerMessageEl.textContent = `You folded. Bot wins the pot of ${potSize}.`;
    bot1ChipCount += potSize;
    potSize = 0;
    gamePhase = 'showdown'; // End of round
    saveChips();
    updateUI();
    newRoundButton.style.display = 'block';
  }

  // IV. Event Listeners & Initial Call
  initPoker();
});
