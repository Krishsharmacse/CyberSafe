/* 
  CyberSafe Extension - Content Script
  Actively scans anchor tags in the DOM, forwards them to the localhost:3000 engine, 
  and injects visual warnings if the heuristics flag them as high risk.
*/

(() => {
  console.log('[CyberSafe Sidebar] Extension loaded. Initializing page scan...');

  async function scanLinks() {
  const links = document.querySelectorAll('a[href]');
  const urlMap = new Map();

  // Deduplicate and filter links
  links.forEach(link => {
    try {
      const href = link.getAttribute('href');
      // Skip empty, anchor links, or javascript
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      
      // Resolve to absolute URL
      const url = new URL(href, window.location.origin).href;
      
      if (!urlMap.has(url)) {
        urlMap.set(url, []);
      }
      urlMap.get(url).push(link);
    } catch (e) {
      // Ignore invalid URLs
    }
  });

  const uniqueUrls = Array.from(urlMap.keys());
  if (uniqueUrls.length === 0) return;

  console.log(`[CyberSafe] Extracted ${uniqueUrls.length} unique URLs for analysis.`);

  try {
    // Send URLs to the background service worker to escape CORS restrictions
    const response = await chrome.runtime.sendMessage({
      type: 'SCAN_URLS',
      urls: uniqueUrls
    });

    if (!response || !response.success) {
      throw new Error(response ? response.error : 'Background script failed to respond');
    }

    const data = response.data;
    const results = data.results || [];
    
    let threatCount = 0;

    results.forEach(result => {
      // If the engine flags it as suspicious
      if (result.isSuspicious) {
        threatCount++;
        const elements = urlMap.get(result.url) || [];
        
        elements.forEach(el => {
          // Add visual styling to the link itself with inline styles (bypasses CSP)
          el.style.textDecoration = 'underline wavy #ef4444';
          el.style.textDecorationThickness = '2px';
          el.style.textUnderlineOffset = '3px';
          el.style.transition = 'background-color 0.2s';
          
          // Add hover effect
          el.addEventListener('mouseenter', () => {
            el.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          });
          el.addEventListener('mouseleave', () => {
            el.style.backgroundColor = 'transparent';
          });
          
          // Double check we haven't already tagged it
          if (!el.hasAttribute('data-cybersafe-scanned')) {
            el.setAttribute('data-cybersafe-scanned', 'true');
            
            // Create the warning marker with inline styles
            const marker = document.createElement('span');
            marker.innerHTML = '⚠️ SUSPICIOUS LINK';
            marker.title = `CyberSafe Warning: Risk Score ${result.score}/100.\nReasons: ${result.patterns.join(', ')}`;
            
            // Apply inline styles to marker
            marker.style.display = 'inline-flex';
            marker.style.alignItems = 'center';
            marker.style.gap = '4px';
            marker.style.marginLeft = '6px';
            marker.style.padding = '2px 6px';
            marker.style.backgroundColor = '#fef2f2';
            marker.style.border = '1px solid #ef4444';
            marker.style.borderRadius = '4px';
            marker.style.color = '#dc2626';
            marker.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
            marker.style.fontSize = '11px';
            marker.style.fontWeight = 'bold';
            marker.style.lineHeight = '1';
            marker.style.textDecoration = 'none';
            marker.style.cursor = 'help';
            marker.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.2)';
            marker.style.zIndex = '999999';
            marker.style.verticalAlign = 'middle';
            marker.style.transition = 'all 0.2s ease';
            
            // Hover effect on marker
            marker.addEventListener('mouseenter', () => {
              marker.style.backgroundColor = '#fee2e2';
              marker.style.transform = 'scale(1.05)';
              marker.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.4)';
            });
            marker.addEventListener('mouseleave', () => {
              marker.style.backgroundColor = '#fef2f2';
              marker.style.transform = 'scale(1)';
              marker.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.2)';
            });
            
            // Insert immediately after the link
            if (el.nextSibling) {
              el.parentNode.insertBefore(marker, el.nextSibling);
            } else {
              el.parentNode.appendChild(marker);
            }
          }
        });
      }
    });

    if (threatCount > 0) {
      console.warn(`[CyberSafe] Alert! Found ${threatCount} suspicious URL definitions on this page!`);
      // Update chrome extension badge if possible
      chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', count: threatCount }).catch(() => {});
    } else {
      console.log('[CyberSafe] Scan complete. No active threats detected.');
    }

  } catch (err) {
    console.error('[CyberSafe] Network error connecting to localhost:3000 engine.', err);
  }
}

  // Initial scan
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanLinks);
  } else {
    setTimeout(scanLinks, 500);
  }

  // Set up MutationObserver to detect dynamically added links (console scripts, React updates)
  let scanTimeout = null;
  const observer = new MutationObserver((mutations) => {
    // Check if any added nodes are links or contain links
    const hasNewLinks = mutations.some(m => 
      Array.from(m.addedNodes).some(node => 
        (node.nodeName === 'A') || (node.querySelectorAll && node.querySelectorAll('a').length > 0)
      )
    );

    if (hasNewLinks) {
      if (scanTimeout) clearTimeout(scanTimeout);
      scanTimeout = setTimeout(scanLinks, 800);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
