function darkMode() {
  function toggleDarkMode() {
    console.log('toggleDarkMode:', toggleDarkMode);
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-mode');
    localStorage.setItem('dark-mode', isDarkMode ? 'on' : 'off');
  }

  const darkModeToggle = document.getElementById('dark-mode-toggle');
  darkModeToggle.addEventListener('change', toggleDarkMode);

  const isDarkMode = localStorage.getItem('dark-mode') === 'on';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
  }
}
darkMode();
