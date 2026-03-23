/**
 * Feature 3: Search University by Name
 * OPTIMIZE: Use global waitForUniData for unified experience
 * Exact name match FIRST, then fuzzy match → 100% accurate search
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get elements from page3.html
  const searchInput = document.getElementById('nameSearchInput');
  const searchBtn = document.getElementById('nameSearchBtn');
  const searchResultEl = document.getElementById('nameSearchResult');
  const tipEl = searchResultEl;

  // Core function: handle name search (EXACT MATCH FIRST)
  function handleNameSearch() {
    // Get input value, trim space, convert to lowercase (case-insensitive)
    const searchKeyword = searchInput.value.trim().toLowerCase();
    const originalKeyword = searchInput.value.trim();

    // Validate input: show tip if input is empty
    if (!searchKeyword) {
      searchResultEl.innerHTML = `<p class="empty-tip">Please enter a university name to search.</p>`;
      return;
    }

    // Step 1: EXACT MATCH (case-insensitive) → HIGHEST PRIORITY
    const exactMatches = window.universities.filter(uni => 
      uni.name && uni.name.trim().toLowerCase() === searchKeyword
    );

    // Step 2: FUZZY MATCH (only if no exact matches)
    const fuzzyMatches = window.universities.filter(uni => 
      uni.name && uni.name.trim().toLowerCase().includes(searchKeyword) &&
      uni.name.trim().toLowerCase() !== searchKeyword
    );

    // Combine results: Exact matches first, then fuzzy matches
    const matchedUniversities = exactMatches.length > 0 ? exactMatches : fuzzyMatches;

    // Render result: show empty tip if no match found
    if (matchedUniversities.length === 0) {
      searchResultEl.innerHTML = `<p class="empty-tip">No universities matched with "${originalKeyword}".</p>`;
      return;
    }

    // Render matched results (rich info for each university)
    searchResultEl.innerHTML = matchedUniversities.map(uni => `
      <div class="list-item">
        ${window.formatUniversityInfo(uni)}
      </div>
    `).join('');
  }

  // Wait for data first, then bind events (avoid null data)
  window.waitForUniData(() => {
    // Add click event to search button
    searchBtn.addEventListener('click', handleNameSearch);
    // Support Enter key to search (better mobile experience)
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') handleNameSearch();
    });
  }, tipEl);
});