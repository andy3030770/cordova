/**
 * Feature 2: Random University Recommendation
 * FIX: Use global waitForUniData to solve data load timing conflict
 * Support refresh (click button to get new random university)
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get elements from page2.html
  const randomUniEl = document.getElementById('randomUniversityCard');
  const refreshBtn = document.getElementById('refreshRandomBtn');
  // Use result card as tip container (show load/error info)
  const tipEl = randomUniEl;

  // Core function: generate and render random university
  function renderRandomUniversity() {
    // Generate random index (0 to total universities - 1)
    const randomIndex = Math.floor(Math.random() * window.universities.length);
    // Get random university object from global array
    const randomUniversity = window.universities[randomIndex];
    // Render rich info (use global format function)
    randomUniEl.innerHTML = `<div class="result-card">${window.formatUniversityInfo(randomUniversity)}</div>`;
  }

  // Global wait for data load, then render
  window.waitForUniData(renderRandomUniversity, tipEl);

  // Add click event to refresh button: get new random university
  refreshBtn.addEventListener('click', function() {
    // Recheck data before refresh (prevent rare case)
    if (window.universities && window.universities.length > 0) {
      renderRandomUniversity();
    } else {
      window.waitForUniData(renderRandomUniversity, tipEl);
    }
  });
});