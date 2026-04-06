document.addEventListener('DOMContentLoaded', () => {
  const statusText = document.getElementById('status-text');
  const pulseIndicator = document.getElementById('pulse-indicator');
  const engineStatusArea = document.querySelector('.status-indicator');
  const forceScanBtn = document.getElementById('force-scan-btn');

  // Ping the local server to check if our API is alive
  fetch('http://localhost:3000/api/scan', { method: 'OPTIONS' })
    .then(res => {
      if (res.ok) {
        statusText.textContent = 'ONLINE';
      } else {
        throw new Error('Dead');
      }
    })
    .catch(() => {
      engineStatusArea.classList.remove('status-indicator');
      engineStatusArea.classList.add('status-indicator', 'error-text');
      pulseIndicator.classList.remove('pulse');
      pulseIndicator.classList.add('pulse', 'error-pulse');
      statusText.textContent = 'OFFLINE';
    });

  forceScanBtn.addEventListener('click', () => {
    // Inject and execute our content script on the current active tab manually
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        });
        
        // Visual feedback
        const originalText = forceScanBtn.textContent;
        forceScanBtn.textContent = 'SCAN INITIATED...';
        setTimeout(() => {
          forceScanBtn.textContent = originalText;
        }, 1500);
      }
    });
  });
});
