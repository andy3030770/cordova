// Global variable: store all university data (accessible by all pages)
window.universities = [];

// Public API URL (provided by user, returns JSON format university data)
const API_URL = "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";

// Global config for data retry (all pages use the same)
window.DATA_RETRY_CONFIG = {
  MAX_RETRY: 10,    // Max retry times
  RETRY_INTERVAL: 500 // Retry interval (500ms)
};

/**
 * Global utility function: Wait for university data to load
 * Reused by ALL pages to solve timing conflict
 * @param {Function} callback - Execute after data loaded
 * @param {HTMLElement} tipEl - Element to show load/error tip
 */
window.waitForUniData = function(callback, tipEl) {
  let retryCount = 0;

  function checkData() {
    // Data loaded: execute callback
    if (window.universities && window.universities.length > 0) {
      tipEl.innerHTML = "";
      callback();
      return;
    }

    // Retry if not reach max times
    retryCount++;
    if (retryCount <= window.DATA_RETRY_CONFIG.MAX_RETRY) {
      tipEl.innerHTML = `<p class="empty-tip">Loading data... (${retryCount}/${window.DATA_RETRY_CONFIG.MAX_RETRY})</p>`;
      setTimeout(checkData, window.DATA_RETRY_CONFIG.RETRY_INTERVAL);
    } else {
      // Timeout: show guide
      tipEl.innerHTML = `
        <p class="empty-tip">Data load failed! 🚨</p>
        <p class="empty-tip" style="margin-top:8px;">Back to Home and re-enter this page</p>
      `;
    }
  }

  checkData();
};

/**
 * Load global university data once when the app starts
 * ADD: 10s timeout for API request (prevent stuck)
 */
(async function loadGlobalUniversityData() {
  try {
    // Send GET request with 10s timeout (fetch native timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    window.universities = await response.json();
    console.log("Global university data loaded successfully. Total universities: " + window.universities.length);
  } catch (error) {
    console.error("Error loading global university data: ", error);
    document.body.innerHTML += `<p class="empty-tip">Data load failed! Please refresh the app and try again.</p>`;
  }
})();

/**
 * Global utility function: format university info for rich display
 * Reused by all sub pages to avoid duplicate code
 * @param {Object} uni - Single university object from the global array
 * @returns {String} HTML string with formatted university info
 */
window.formatUniversityInfo = function(uni) {
  // Get all available fields from JSON, set default if field is missing (avoid undefined)
  const uniName = uni.name || "No University Name";
  const country = uni.country || "No Country/Region";
  const countryCode = uni.alpha_two_code || "N/A";
  const officialDomain = uni.domains[0] || "No Official Domain";
  const officialWeb = uni.web_pages[0] || "No Official Website Available";

  // Return HTML structure for rich info display
  return `
    <p><span class="label">University Name:</span><br><span class="content">${uniName}</span></p>
    <p><span class="label">Country/Region:</span><br><span class="content">${country} (${countryCode})</span></p>
    <p><span class="label">Official Domain:</span><br><span class="content">${officialDomain}</span></p>
    <p><span class="label">Official Website:</span><br><a href="${officialWeb}" target="_blank" class="web-link">${officialWeb}</a></p>
  `;
};