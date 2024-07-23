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
          const elements = document.querySelectorAll('.sc-bgzEgf.haEiYC, .sc-bgzEgf.lavrwa');
          const data = Array.from(elements).map(el => {
            const time = el.querySelector('.sc-dDPqvT')?.innerText || '';
            let version = el.querySelector('.sc-dMVFSy:nth-of-type(3) .sc-jwKbUx')?.innerText || '';
            let country = el.querySelector('.sc-jKQSiE')?.title || '';
            const duration = el.querySelector('.sc-dMVFSy:nth-of-type(5) .sc-jwKbUx')?.innerText || '';
            let plays = el.querySelector('.sc-dMVFSy:nth-of-type(6) .sc-jwKbUx')?.innerText || '';
            const link = el.querySelector('.sc-hHTYSt')?.href || '';
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
          const firstButton = document.querySelector('.sc-fTrzCy:first-of-type'); // Adjust based on your pagination logic
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
          const nextButton = document.querySelector('.sc-fTrzCy:nth-last-of-type(2)'); // Adjust based on your pagination logic
          if (nextButton) {
            nextButton.click();
          }
        },
      }, () => {
        resolve();
      });
    });
  }

  async function isFirstPageActive(tabId) {
    return new Promise(resolve => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {

          const firstPageButton = document.querySelector('.sc-fTrzCy:first-of-type');
          
          if (firstPageButton) {
            return firstPageButton.classList.contains('htdkXN');
          } else {
            return false;
          }
          
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

          const firstPageButton = document.querySelector('.sc-fTrzCy:nth-last-of-type(2)');
          
          if (firstPageButton) {
            return firstPageButton.classList.contains('htdkXN');
          } else {
            return false;
          }

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
    + "time,version,country,duration(s),plays,link\n"
    + data.map(e => `"${e.time}","${e.version}","${e.country}","${parseDuration(e.duration)}","${e.plays}","${e.link}"`).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link); 
  link.click();
}


// Lets save duration in seconds, so it will be ez to see average in excel
function parseDuration(duration) {
  try {
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else {
      return 0;
    }
  } catch (error) {
    console.error('Error parsing duration:', error);
    return 0; // Return 0 or handle error case
  }
}

// Event listener for the Scan button
document.getElementById('scanButton').addEventListener('click', scanPlaytestsPage);
