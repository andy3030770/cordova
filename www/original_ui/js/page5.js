/**
 * Feature 5: Count Universities by Country
 * Exact count (case-insensitive) of universities in a specific country/region
 * Highlight the count number for better visibility
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get elements from page5.html
  const countryInput = document.getElementById('countryCountInput');
  const countBtn = document.getElementById('countCountryBtn');
  const countResultEl = document.getElementById('countryCountResult');

  // Core function: count universities by country and render result
  function countUniversitiesByCountry() {
    // Get and process input value (trim + lowercase for case-insensitive match)
    const targetCountry = countryInput.value.trim().toLowerCase();

    // Input validation
    if (!targetCountry) {
      countResultEl.innerHTML = `<p class="empty-tip">Please enter a country/region name.</p>`;
      return;
    }

    // Check global data load status
    if (window.universities.length === 0) {
      countResultEl.innerHTML = `<p class="empty-tip">Data not loaded yet! Please wait or refresh.</p>`;
      return;
    }

    /**
     * Filter universities by exact country match (case-insensitive)
     * Count the number of matched universities with .length
     */
    const universityCount = window.universities.filter(uni => 
      uni.country.toLowerCase() === targetCountry
    ).length;

    // Render count result (highlight number with custom style)
    countResultEl.innerHTML = `
      <div class="result-card" style="text-align:center;">
        <p class="label">Total Universities in</p>
        <p class="content" style="font-size:16px;">${countryInput.value}</p>
        <p class="count-num">${universityCount}</p>
      </div>
    `;
  }

  // Add click event to count button
  countBtn.addEventListener('click', countUniversitiesByCountry);

  // Optional: support Enter key (better mobile experience)
  countryInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') countUniversitiesByCountry();
  });
});