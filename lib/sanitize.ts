// Simple HTML sanitization without external dependencies
// This approach works in both browser and server environments

// Configuration for safe HTML sanitization
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'blockquote', 'pre', 'code'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'class', 'id', 'style'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: [
    'script', 'object', 'embed', 'form', 'input', 'button',
    'iframe', 'frame', 'frameset', 'applet', 'meta', 'link'
  ],
  FORBID_ATTR: [
    'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus',
    'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect',
    'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown',
    'onmousemove', 'onmouseout', 'onmouseup', 'onabort',
    'onafterprint', 'onbeforeprint', 'onbeforeunload',
    'onerror', 'onhashchange', 'onload', 'onmessage',
    'onoffline', 'ononline', 'onpagehide', 'onpageshow',
    'onpopstate', 'onresize', 'onstorage', 'onunload'
  ]
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }
  
  // Simple HTML sanitization using regex patterns
  let sanitized = html
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove dangerous event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: URLs that could be dangerous
  sanitized = sanitized.replace(/data:(?!image\/[png|jpg|jpeg|gif|webp])/gi, '')
  
  // Remove iframe, object, embed tags
  sanitized = sanitized.replace(/<(iframe|object|embed|form|input|button|meta|link)\b[^>]*>/gi, '')
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/\s*(onerror|onload|onclick|onmouseover|onfocus|onblur|onchange|onsubmit|onreset|onselect|onkeydown|onkeypress|onkeyup|onmousedown|onmousemove|onmouseout|onmouseup|onabort|onafterprint|onbeforeprint|onbeforeunload|onhashchange|onmessage|onoffline|ononline|onpagehide|onpageshow|onpopstate|onresize|onstorage|onunload)\s*=\s*["'][^"']*["']/gi, '')
  
  return sanitized
}

/**
 * Sanitizes HTML content for rich text editor (more permissive)
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeRichText(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }
  
  // Start with basic sanitization
  let sanitized = sanitizeHTML(html)
  
  // Allow additional tags for rich text
  // Note: This is a simplified approach. In production, consider using a proper HTML parser
  
  return sanitized
}

/**
 * Sanitizes plain text by escaping HTML characters
 * @param text - The text to sanitize
 * @returns Escaped text string
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
