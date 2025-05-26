document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent default form submission
      const username = usernameInput.value.trim();

      if (username) {
        localStorage.setItem('casinoUser', username);
        window.location.href = 'lobby.html'; // Redirect to lobby
      } else {
        alert('Please enter a username.');
      }
    });
  }
});
