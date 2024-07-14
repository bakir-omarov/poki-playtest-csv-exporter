let tab;

// Function to query the active tab and initiate the scanning process
async function scanPlaytestsPage() {
  // Query the active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  tab = tabs[0];

  // Check if the tab URL matches the expected pattern
  if (!tab.url.startsWith('https://app.poki.dev/') || !tab.url.endsWith('/playtests')) {
    alert('Please go to Playtests page in Poki dashboard!');
    return;
  }

  let allData = [];
  let totalPages = 0;
  let totalDataCount = 0;

  async function scanCurrentPage() {
    return new Promise(resolve => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const elements = document.querySelectorAll('.sc-erbdlo.iuyuvj, .sc-erbdlo.jqnghv');
          const data = Array.from(elements).map(el => {
            const time = el.querySelector('.sc-MAqyW')?.innerText || '';
            let version = el.querySelector('.jFZqEi:nth-of-type(3)')?.innerText || el.querySelector('.jEvyKD:nth-of-type(3)')?.innerText || '';
            let country = el.querySelector('.hqzFzW')?.title || el.querySelector('.jEvyKD .hqzFzW')?.title || '';
            const duration = el.querySelector('.jFZqEi:nth-of-type(5)')?.innerText || el.querySelector('.jEvyKD:nth-of-type(5)')?.innerText || '';
            let plays = el.querySelector('.jFZqEi:nth-of-type(6)')?.innerText || el.querySelector('.jEvyKD:nth-of-type(6)')?.innerText || '';
            const link = el.querySelector('.irHIXF')?.href || '';
            return { time, version, country, duration, plays, link };
          });
          return data;
        },
      }, (results) => {
        const data = results[0].result;
        allData = allData.concat(data); // Store scanned data
        resolve(data.length); // Return count of elements scanned on this page
      });
    });
  }

  async function goToFirstPage() {
    return new Promise(resolve => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const firstButton = document.querySelector('.sc-hKnpzZ.kcJGqg:first-of-type'); // Adjust based on your pagination logic
          if (firstButton) {
            firstButton.click();
          }
        },
      }, () => {
        resolve();
      });
    });
  }

  async function goToNextPage() {
    return new Promise(resolve => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const nextButton = document.querySelector('.sc-hKnpzZ.kcJGqg:nth-last-of-type(2)'); // Adjust based on your pagination logic
          if (nextButton) {
            nextButton.click();
          }
        },
      }, () => {
        resolve();
      });
    });
  }

  async function isFirstPageActive() {
    return new Promise(resolve => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const firstPageButton = document.querySelector('.sc-hKnpzZ.kcJGqg:first-of-type');
          return firstPageButton !== null;
        },
      }, (results) => {
        resolve(results[0].result);
      });
    });
  }

  async function isNextPageActive() {
    return new Promise(resolve => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const nextPageButton = document.querySelector('.sc-hKnpzZ.kcJGqg:nth-last-of-type(2)');
          return nextPageButton !== null;
        },
      }, (results) => {
        resolve(results[0].result);
      });
    });
  }

  async function scanPages() {
    let currentPage = 1;

    // Check if we're already on the first page, if not, navigate to it
    const isFirstActive = await isFirstPageActive();

    if (isFirstActive) {
      await goToFirstPage(); // Navigate to the first page
    }

    // Scan each page until no next page is available
    while (true) {
      const count = await scanCurrentPage(); // Scan current page and get count of data
      totalDataCount += count;
      totalPages++;

      // Check if there's a next page, if not, break the loop
      const isNextActive = await isNextPageActive();
      if (!isNextActive) {
        break;
      }

      // Navigate to the next page
      await goToNextPage();
    }

    // After scanning, update UI based on data availability
    if (totalDataCount > 0) {
      updateUI(allData);
    } else {
      alert('No data found on the Playtests page.');
    }
  }

  scanPages();
}

// Function to update UI after scanning
function updateUI(data) {
  const versionDropdown = document.getElementById('versionDropdown');
  const exportButton = document.getElementById('exportButton');
  const exportAllButton = document.getElementById('exportAllButton');

  // Clear previous options
  versionDropdown.innerHTML = '';

  // Populate dropdown with unique versions
  const versions = [...new Set(data.map(item => item.version))];
  versions.forEach(version => {
    const option = document.createElement('option');
    option.text = version;
    versionDropdown.add(option);
  });

  // Show dropdown and buttons
  versionDropdown.style.display = 'block';
  exportButton.style.display = 'block';
  exportAllButton.style.display = 'block';

  // Export selected version
  exportButton.addEventListener('click', () => {
    const selectedVersion = versionDropdown.value;
    const filteredData = data.filter(item => item.version === selectedVersion);
    exportToCSV(filteredData, 'playtest_data.csv');
  });

  // Export all data
  exportAllButton.addEventListener('click', () => {
    exportToCSV(data, 'all_playtest_data.csv');
  });
}

// Function to export data to CSV
function exportToCSV(data, filename) {
  const csvContent = "data:text/csv;charset=utf-8," 
    + "time,version,country,duration,plays,link\n"
    + data.map(e => `"${e.time}","${e.version}","${e.country}","${e.duration}","${e.plays}","${e.link}"`).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link); 
  link.click();
}

// Event listener for the Scan button
document.getElementById('scanButton').addEventListener('click', scanPlaytestsPage);
