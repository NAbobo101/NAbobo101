document.addEventListener('DOMContentLoaded', () => {
  // Logout Button Listener
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('casinoUser');
      window.location.href = 'index.html'; // Redirect to login page
    });
  }

  // Lobby Initialization Code
  const username = localStorage.getItem('casinoUser');
  const welcomeMessage = document.getElementById('welcomeMessage');

  if (!username) { // Check if username is not found or is empty (null, undefined, empty string)
    window.location.href = 'index.html';
  } else {
    if (welcomeMessage) {
      welcomeMessage.textContent = "Welcome, " + username + "!";
    }
  }
});
