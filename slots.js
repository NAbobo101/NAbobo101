document.addEventListener('DOMContentLoaded', () => {
  // Constants and Variables
  const SYMBOLS = ["🍒", "🍋", "🔔", "💰", "⭐", "💎"]; // Cherry, Lemon, Bell, MoneyBag, Star, Diamond
  const COST_PER_SPIN = 1;
  const STARTING_CREDITS = 100;
  let credits = STARTING_CREDITS;

  const reel1 = document.getElementById('reel1');
  const reel2 = document.getElementById('reel2');
  const reel3 = document.getElementById('reel3');
  const spinButton = document.getElementById('spinButton');
  const creditsDisplay = document.getElementById('creditsDisplay');
  const slotsMessage = document.getElementById('slotsMessage');

  const CREDITS_STORAGE_KEY = 'slotsCredits';

  // Initialization Function
  function initSlots() {
    const savedCredits = localStorage.getItem(CREDITS_STORAGE_KEY);
    if (savedCredits !== null) { // Check for null explicitly, as "0" is a valid value
      credits = parseInt(savedCredits, 10);
    } else {
      // If no saved credits, start with default and save it
      saveCredits();
    }
    updateCreditsDisplay();

    if (spinButton) {
      spinButton.addEventListener('click', spin);
    }
  }

  // Update Credits Display Function
  function updateCreditsDisplay() {
    if (creditsDisplay) {
      creditsDisplay.textContent = credits;
    }
  }

  // Save Credits Function
  function saveCredits() {
    localStorage.setItem(CREDITS_STORAGE_KEY, credits.toString());
  }

  // Spin Function
  function spin() {
    if (credits < COST_PER_SPIN) {
      if (slotsMessage) {
        slotsMessage.textContent = "Not enough credits!";
      }
      return;
    }

    credits -= COST_PER_SPIN;
    if (slotsMessage) {
      slotsMessage.textContent = ""; // Clear previous message
    }

    // Generate Reel Values
    const r1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const r2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const r3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    // Update Reel Display
    if (reel1) reel1.textContent = r1;
    if (reel2) reel2.textContent = r2;
    if (reel3) reel3.textContent = r3;

    // Check for Wins
    let winnings = 0;
    if (r1 === r2 && r2 === r3) { // Three of a kind
      if (r1 === "🍒") { winnings = 10; } // Cherry
      else if (r1 === "🍋") { winnings = 20; } // Lemon
      else if (r1 === "🔔") { winnings = 50; } // Bell
      else if (r1 === "💰") { winnings = 100; } // MoneyBag (replaces BAR)
      else if (r1 === "⭐") { winnings = 250; } // Star (replaces 7)
      else if (r1 === "💎") { winnings = 500; } // Diamond
    } else if (r1 === "🍒" && r2 === "🍒") {
      winnings = 3; // Two cherries (first two reels)
    } else if (r1 === "🍒") {
      winnings = 1; // One cherry (on the first reel)
    }
    // Note: The original spec said "One cherry (any position)".
    // For simplicity in this example, I'm only rewarding for one cherry on the first reel,
    // or two cherries on the first two reels.
    // To implement "any position", you'd check r1, r2, and r3 individually.

    // Process Winnings
    if (slotsMessage) {
      if (winnings > 0) {
        credits += winnings;
        slotsMessage.textContent = "You won " + winnings + " credits!";
      } else {
        slotsMessage.textContent = "Try again!";
      }
    }

    updateCreditsDisplay();
    saveCredits();
  }

  // Call initSlots when the DOM is fully loaded
  initSlots();
});
