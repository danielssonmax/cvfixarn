"use client"

import React, { useEffect, useRef, useState } from 'react'

interface PrintPreviewIframeProps {
  htmlContent: string
  onPagedReady?: () => void
}

export function PrintPreviewIframe({ htmlContent, onPagedReady }: PrintPreviewIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isReady, setIsReady] = useState(false)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // Cleanup previous instance
    if (cleanupRef.current) {
      cleanupRef.current()
      cleanupRef.current = null
    }

    // Create the full HTML document with Paged.js
    const fullHtml = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* Reset */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Paged.js page configuration */
    @page {
      size: A4;
      margin: 18mm 15mm;
    }

    /* Page break utilities */
    [data-keep] {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .page-break-before {
      break-before: page;
      page-break-before: always;
    }

    .page-break-after {
      break-after: page;
      page-break-after: always;
    }

    /* Body styling */
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 10pt;
      color: #000000;
      background: #f5f5f5;
      padding: 20px;
    }

    /* CV Container */
    .cv-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      background: white;
    }
    
    /* Paged.js generated pages styling */
    .pagedjs_pages {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 20px;
    }
    
    .pagedjs_page {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* Header */
    .cv-header {
      margin-bottom: 30px;
      border-bottom: 2px solid #000000;
      padding-bottom: 20px;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
    }

    .cv-header-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .cv-name {
      font-size: 28pt;
      font-weight: bold;
      margin-bottom: 10px;
      color: #000000;
      letter-spacing: -0.5px;
      line-height: 1.3;
    }

    .cv-title {
      font-size: 13pt;
      color: #4B5563;
      margin-bottom: 10px;
      margin-top: 0;
      font-weight: normal;
      line-height: 1.5;
    }

    .cv-contact {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      font-size: 10pt;
      color: #6B7280;
      margin-top: 8px;
    }

    .cv-contact-item {
      margin-right: 16px;
    }

    .cv-profile-image {
      width: 120px;
      height: 120px;
      border-radius: 60px;
      object-fit: cover;
      margin-left: 20px;
      flex-shrink: 0;
    }

    /* Sections */
    .cv-section {
      margin-bottom: 24px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .cv-section-title {
      font-size: 13pt;
      font-weight: bold;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid #D1D5DB;
      text-transform: uppercase;
      color: #111827;
      letter-spacing: 0.5px;
    }

    /* Items */
    .cv-item {
      margin-bottom: 16px;
      padding-left: 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .cv-experience-item {
      margin-bottom: 16px;
      padding-left: 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .cv-item-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-bottom: 5px;
      align-items: baseline;
    }

    .cv-item-title {
      font-size: 12pt;
      font-weight: bold;
      color: #111827;
      flex: 1;
      margin-bottom: 4px;
    }

    .cv-item-date {
      font-size: 10pt;
      color: #6B7280;
      font-weight: normal;
      margin-left: 8px;
    }

    .cv-item-company {
      font-size: 11pt;
      margin-bottom: 3px;
      color: #374151;
      font-weight: normal;
    }

    .cv-item-location {
      font-size: 9pt;
      color: #9CA3AF;
      margin-bottom: 6px;
      font-style: italic;
    }

    .cv-item-description {
      font-size: 10pt;
      line-height: 1.5;
      color: #4B5563;
      white-space: pre-wrap;
    }

    /* Skills & Languages */
    .cv-skills-container {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      margin-top: 4px;
    }

    .cv-skill-item {
      font-size: 10pt;
      background-color: #F3F4F6;
      padding: 6px 12px;
      margin-right: 6px;
      margin-bottom: 6px;
      border-radius: 3px;
      color: #374151;
      display: inline-block;
    }

    .cv-language-item {
      font-size: 10pt;
      background-color: #EFF6FF;
      padding: 6px 12px;
      margin-right: 6px;
      margin-bottom: 6px;
      border-radius: 3px;
      color: #1E40AF;
      display: inline-block;
    }

    /* Paged.js generated pages */
    .pagedjs_pages {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .pagedjs_page {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div id="cv-root">${htmlContent}</div>
  
  <script>
    (function() {
      // Load Paged.js only once
      if (!window.__PAGED_LOADED__) {
        var script = document.createElement('script');
        script.src = 'https://unpkg.com/pagedjs/dist/paged.polyfill.js';
        script.onload = function() {
          window.__PAGED_LOADED__ = true;
          initPaged();
        };
        document.head.appendChild(script);
      } else {
        // Already loaded, init immediately
        initPaged();
      }
      
      function initPaged() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', startPaged);
        } else if (document.readyState === 'interactive') {
          // DOM is ready but resources may still be loading
          setTimeout(startPaged, 100);
        } else {
          // Document is fully loaded
          startPaged();
        }
      }
      
      function startPaged() {
        var root = document.getElementById('cv-root');
        if (!root) {
          // Retry after a short delay (can happen in React Strict Mode)
          setTimeout(function() {
            var retryRoot = document.getElementById('cv-root');
            if (retryRoot) {
              startPagedWithRoot(retryRoot);
            }
          }, 200);
          return;
        }
        
        startPagedWithRoot(root);
      }
      
      function startPagedWithRoot(root) {
        // Recursively remove ALL text nodes (whitespace) that could cause getAttribute errors
        function removeTextNodes(element) {
          var nodesToRemove = [];
          for (var i = 0; i < element.childNodes.length; i++) {
            var node = element.childNodes[i];
            if (node.nodeType === 3) { // Text node
              // Only remove if it's just whitespace
              if (!node.nodeValue || node.nodeValue.trim() === '') {
                nodesToRemove.push(node);
              }
            } else if (node.nodeType === 1) { // Element node
              // Recursively clean child elements
              removeTextNodes(node);
            } else {
              // Remove comments, etc
              nodesToRemove.push(node);
            }
          }
          nodesToRemove.forEach(function(node) {
            if (node.parentNode) {
              node.parentNode.removeChild(node);
            }
          });
        }
        
        removeTextNodes(root);
        
        // Define handler only once
        if (!window.__PagedHandler__) {
          window.__PagedHandler__ = class extends window.Paged.Handler {
            constructor(chunker, polisher, caller) {
              super(chunker, polisher, caller);
            }
            
            afterRendered(pages) {
              window.pagedReady = true;
              
              // Notify parent window
              if (window.parent) {
                window.parent.postMessage({ 
                  type: 'paged-ready', 
                  pages: pages.length 
                }, '*');
              }
            }
          };
        }
        
        // Initialize Paged.js preview
        try {
          var paged = new window.Paged.Previewer();
          var content = root.innerHTML;
          
          // Register handler and preview
          // Don't pass handlers array to preview(), register them separately
          window.Paged.registerHandlers(window.__PagedHandler__);
          
          paged.preview(content, [], root).then(function(flow) {
            // Preview initialized successfully
          }).catch(function(error) {
            console.error('Paged.js preview error:', error);
          });
        } catch (error) {
          console.error('Failed to initialize Paged.js:', error);
        }
      }
    })();
  </script>
</body>
</html>
    `

    // Wait for iframe to be ready before writing content
    const initIframe = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(fullHtml)
        iframeDoc.close()
      }
    }

    // If iframe is already loaded, init immediately
    if (iframe.contentDocument?.readyState === 'complete') {
      initIframe()
    } else {
      // Wait for iframe to load
      iframe.onload = initIframe
    }

    // Listen for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'paged-ready') {
        setIsReady(true)
        onPagedReady?.()
      }
    }

    window.addEventListener('message', handleMessage)

    // Cleanup function
    cleanupRef.current = () => {
      window.removeEventListener('message', handleMessage)
      
      // Reset iframe state
      const iframeWin = iframe.contentWindow
      if (iframeWin) {
        try {
          delete (iframeWin as any).__PAGED_LOADED__
          delete (iframeWin as any).__PagedHandler__
          delete (iframeWin as any).pagedReady
        } catch (e) {
          // Ignore errors
        }
      }
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [htmlContent, onPagedReady])

  return (
    <iframe
      ref={iframeRef}
      title="CV Preview"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        background: '#f5f5f5',
      }}
      sandbox="allow-scripts allow-same-origin"
    />
  )
}

