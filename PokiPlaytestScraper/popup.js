document.getElementById('scanButton').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scanData,
  }, (results) => {
    document.getElementById('dataCount').textContent = `Data found: ${results[0].result}`;
  });
});

document.getElementById('exportButton').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: exportData,
  });
});

function scanData() {
  const elements = document.querySelectorAll('.sc-erbdlo.iuyuvj, .sc-erbdlo.jqnghv');
  return elements.length;
}

function exportData() {
  const elements = document.querySelectorAll('.sc-erbdlo.iuyuvj, .sc-erbdlo.jqnghv');
  const data = Array.from(elements).map(el => {
    const time = el.querySelector('.sc-MAqyW')?.innerText || '';
    
    let version = el.querySelector('.jFZqEi:nth-of-type(3)')?.innerText;
    if (!version) {
      version = el.querySelector('.jEvyKD:nth-of-type(3)')?.innerText || '';
    }

    let country = el.querySelector('.hqzFzW')?.title;
    if (!country) {
      country = el.querySelector('.jEvyKD .hqzFzW')?.title || '';
    }

    const duration = el.querySelector('.jFZqEi:nth-of-type(5)')?.innerText || el.querySelector('.jEvyKD:nth-of-type(5)')?.innerText || '';

    let plays = el.querySelector('.jFZqEi:nth-of-type(6)')?.innerText;
    if (!plays) {
      plays = el.querySelector('.jEvyKD:nth-of-type(6)')?.innerText || '';
    }

    const link = el.querySelector('.irHIXF')?.href || '';
    return { time, version, country, duration, plays, link };
  });

  const csvContent = "data:text/csv;charset=utf-8," 
    + "time,version,country,duration,plays,link\n"
    + data.map(e => `"${e.time}","${e.version}","${e.country}","${e.duration}","${e.plays}","${e.link}"`).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "playtest_data.csv");
  document.body.appendChild(link); 
  link.click();
}




