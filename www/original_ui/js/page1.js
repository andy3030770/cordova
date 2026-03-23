/**
 * Feature 1: Show All Hong Kong Universities
 * FIX: Use global waitForUniData to solve data load timing conflict
 * Strict filter + sort for Hong Kong universities
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get elements from page1.html
  const hkListEl = document.getElementById('hkUniversitiesList');
  // Use list container as tip container (show load/error info)
  const tipEl = hkListEl;

  // Core function: filter + render HK universities
  function renderHKUniversities() {
    // Strict filter for Hong Kong universities (null safety + exact match)
    const hongKongUniversities = window.universities.filter(uni => 
      uni.country && uni.country.trim() === "Hong Kong"
    );

    // Empty data tip if no HK unis found
    if (hongKongUniversities.length === 0) {
      hkListEl.innerHTML = `<p class="empty-tip">No Hong Kong universities found </p>`;
      return;
    }

    // Sort HK unis by name (better readability) + render rich list
    hongKongUniversities.sort((a, b) => a.name.localeCompare(b.name));
    hkListEl.innerHTML = hongKongUniversities.map(uni => `
      <div class="list-item">
        ${window.formatUniversityInfo(uni)}
      </div>
    `).join(''); // Join array to string (avoid comma in HTML)
  }

  // Global wait for data load, then render
  window.waitForUniData(renderHKUniversities, tipEl);
});