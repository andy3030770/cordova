/**
 * Feature 4: Open University Official Website
 * ULTIMATE FIX: Only EXACT FULL NAME match (case-insensitive) can open website
 * No fuzzy match, no partial name match → 100% accurate jump
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get elements from page4.html
  const webInput = document.getElementById('webSearchInput');
  const openWebBtn = document.getElementById('openWebBtn');
  const webResultEl = document.getElementById('webResultTip');
  const tipEl = webResultEl;

  // Core function: ONLY exact full name match → open official website
  function openUniversityWebsite() {
    // Get input value: trim space + convert to lowercase (only case-insensitive)
    const inputFullName = webInput.value.trim().toLowerCase();
    const originalInput = webInput.value.trim();

    // Step 1: Input validation (empty input)
    if (!originalInput) {
      webResultEl.innerHTML = `<p class="empty-tip">Please enter the full name of the university.</p>`;
      return;
    }

    // Step 2: Exact full name match (case-insensitive, NO partial match)
    // Only match when input is exactly the same as university name in API
    const foundUniversity = window.universities.find(uni => 
      uni.name && uni.name.trim().toLowerCase() === inputFullName
    );

    // Step 3: No match → show clear tip (non-full name/incorrect name)
    if (!foundUniversity) {
      webResultEl.innerHTML = `
        <p class="empty-tip">University not found! ❌</p>
        <p class="empty-tip" style="margin-top:8px;font-size:13px;">Please enter the <strong>exact full name</strong> (case-insensitive).</p>
      `;
      return;
    }

    // Step 4: Exact match found → get official URL and open
    const officialWebUrl = foundUniversity.web_pages && foundUniversity.web_pages[0] 
      ? foundUniversity.web_pages[0] 
      : "No Official Website Available";

    // Open URL in new tab (Cordova/ browser compatible)
    if (officialWebUrl !== "No Official Website Available") {
      window.open(officialWebUrl, "_blank");
    }

    // Step 5: Show success feedback with exact university name
    webResultEl.innerHTML = `
      <div class="result-card">
        <p class="label">Success! Exact Match Found</p>
        <p class="content">Opening official website for:<br><strong>${foundUniversity.name}</strong></p>
        <p style="margin-top:10px;"><a href="${officialWebUrl}" target="_blank" class="web-link">${officialWebUrl}</a></p>
      </div>
    `;
  }

  // Global wait for data load first, then bind events (unified experience)
  window.waitForUniData(() => {
    // Bind click event to open button
    openWebBtn.addEventListener('click', openUniversityWebsite);
    // Support Enter key for mobile convenience
    webInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') openUniversityWebsite();
    });
  }, tipEl);
});