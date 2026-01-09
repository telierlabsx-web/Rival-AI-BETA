 * CORE CODING PRINCIPLES
 * Rules yang WAJIB diikuti AI saat generate code
 */
const CORE_CODING_PRINCIPLES = `
╔═══════════════════════════════════════════════════════════════╗
║           🎯 PRODUCTION-READY CODE REQUIREMENTS 🎯            ║
╚═══════════════════════════════════════════════════════════════╝

⚡ CRITICAL RULES - NEVER BREAK THESE:

1️⃣ COMPLETENESS:
   ✅ Write FULL, working code - NO placeholders
   ✅ NO "TODO" comments or "implement this later"
   ✅ Every function must be fully implemented
   ✅ Include ALL necessary imports and dependencies
   
2️⃣ ERROR HANDLING:
   ✅ Proper try-catch blocks for async operations
   ✅ Input validation before processing
   ✅ Meaningful error messages
   ✅ Graceful degradation for failures
   
3️⃣ CODE QUALITY:
   ✅ Clean, readable, and maintainable
   ✅ Consistent naming conventions (camelCase for JS, snake_case for Python)
   ✅ Comments for complex logic ONLY
   ✅ Remove debug console.logs (except intentional logging)
   
4️⃣ MODERN PRACTICES:
   ✅ ES6+ syntax (arrow functions, async/await, destructuring)
   ✅ Avoid var, use const/let
   ✅ Type safety when using TypeScript
   ✅ Functional programming patterns where appropriate
   
5️⃣ SECURITY:
   ✅ Sanitize user inputs
   ✅ No hardcoded credentials
   ✅ Use environment variables for sensitive data
   ✅ Prevent XSS, SQL injection, etc.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 RESPONSE FORMAT:

1. Brief intro (1-2 sentences, friendly tone)
2. Complete code in proper code block with language tag
3. Key features list (bullet points)
4. Usage instructions (if needed)
5. Tips for enhancement (optional, 1-2 suggestions)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

/**
 * FRAMEWORK-SPECIFIC GUIDELINES
 */
const FRAMEWORK_GUIDELINES = {
  
  // ============================================================
  // VANILLA HTML/CSS/JS
  // ============================================================
  html: `
🌐 HTML/CSS/JS BEST PRACTICES:

✅ STRUCTURE:
   - Use semantic HTML5 tags (<header>, <main>, <section>, <article>)
   - Proper document structure (DOCTYPE, head, body)
   - Meta tags for responsiveness and charset
   
✅ STYLING:
   - Use Tailwind CDN for quick, modern styling
   - Mobile-first responsive design
   - Consistent spacing and colors
   - Modern font (Inter, Plus Jakarta Sans, Poppins)
   
✅ JAVASCRIPT:
   - DOM manipulation with querySelector
   - Event listeners, not inline onclick
   - Async/await for API calls
   - localStorage for client-side storage
   
✅ MUST INCLUDE:
   - Viewport meta tag
   - UTF-8 charset
   - Tailwind CDN (https://cdn.tailwindcss.com)
   - Modern, clean UI design
`,

  // ============================================================
  // REACT
  // ============================================================
  react: `
⚛️ REACT BEST PRACTICES:

✅ COMPONENT STRUCTURE:
   - Functional components only (NO class components)
   - React Hooks (useState, useEffect, useCallback, useMemo)
   - Custom hooks for reusable logic
   - Props destructuring in function parameters
   
✅ STATE MANAGEMENT:
   - useState for local state
   - useReducer for complex state
   - Context API for global state (if needed)
   - Avoid prop drilling - use composition
   
✅ PERFORMANCE:
   - useMemo for expensive computations
   - useCallback for function references
   - React.memo for component memoization
   - Lazy loading with React.lazy and Suspense
   
✅ CODE ORGANIZATION:
   \`\`\`jsx
   import React, { useState, useEffect } from 'react';
   
   const MyComponent = ({ prop1, prop2 }) => {
     // 1. Hooks
     const [state, setState] = useState(initialValue);
     
     // 2. Side effects
     useEffect(() => {
       // effect logic
     }, [dependencies]);
     
     // 3. Event handlers
     const handleClick = () => {
       // handler logic
     };
     
     // 4. Render
     return (
       <div>
         {/* JSX */}
       </div>
     );
   };
   
   export default MyComponent;
   \`\`\`
`,

  // ============================================================
  // NODE.JS / EXPRESS
  // ============================================================
  nodejs: `
🟢 NODE.JS / EXPRESS BEST PRACTICES:

✅ SERVER STRUCTURE:
   - Express.js for routing
   - Middleware for authentication, logging, error handling
   - Environment variables with dotenv
   - Proper folder structure (routes/, controllers/, models/)
   
✅ API DESIGN:
   - RESTful endpoints
   - Proper HTTP methods (GET, POST, PUT, DELETE)
   - Status codes (200, 201, 400, 401, 404, 500)
   - JSON responses with consistent format
   
✅ SECURITY:
   - helmet for HTTP headers
   - cors for cross-origin requests
   - express-validator for input validation
   - bcrypt for password hashing
   - jsonwebtoken for authentication
   
✅ ERROR HANDLING:
   - Async error wrapper middleware
   - Centralized error handler
   - Meaningful error messages
   - Never expose stack traces in production
   
✅ EXAMPLE STRUCTURE:
   \`\`\`javascript
   const express = require('express');
   const cors = require('cors');
   const helmet = require('helmet');
   
   const app = express();
   
   // Middleware
   app.use(helmet());
   app.use(cors());
   app.use(express.json());
   
   // Routes
   app.post('/api/endpoint', async (req, res) => {
     try {
       // Validation
       // Business logic
       // Response
       res.status(200).json({ success: true, data: result });
     } catch (error) {
       res.status(500).json({ success: false, error: error.message });
     }
   });
   
   // Error handler
   app.use((err, req, res, next) => {
     res.status(err.status || 500).json({
       success: false,
       error: err.message
     });
   });
   
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
   \`\`\`
`,

  // ============================================================
  // PYTHON
  // ============================================================
  python: `
🐍 PYTHON BEST PRACTICES:

✅ CODE STYLE:
   - PEP 8 standards
   - snake_case for functions and variables
   - PascalCase for classes
   - Type hints for function parameters and returns
   
✅ STRUCTURE:
   - Docstrings for functions and classes
   - if __name__ == "__main__": for scripts
   - Virtual environments (venv)
   - requirements.txt for dependencies
   
✅ ERROR HANDLING:
   - Specific exceptions (ValueError, TypeError, etc.)
   - try-except-finally blocks
   - Custom exception classes when needed
   
✅ MODERN PYTHON:
   - f-strings for formatting
   - List comprehensions
   - Context managers (with statements)
   - Dataclasses for data structures
   
✅ EXAMPLE:
   \`\`\`python
   from typing import List, Optional
   import os
   
   def process_data(items: List[str], limit: int = 10) -> dict:
       """
       Process data items and return results.
       
       Args:
           items: List of items to process
           limit: Maximum number of items to process
           
       Returns:
           Dictionary containing processed results
           
       Raises:
           ValueError: If items list is empty
       """
       if not items:
           raise ValueError("Items list cannot be empty")
       
       results = {
           'processed': [],
           'count': 0
       }
       
       for item in items[:limit]:
           # Processing logic
           results['processed'].append(item.upper())
           results['count'] += 1
       
       return results
   
   if __name__ == "__main__":
       data = ["item1", "item2", "item3"]
       result = process_data(data)
       print(f"Processed {result['count']} items")
   \`\`\`
`
};

/**
 * ANTI-PATTERNS - Things to AVOID
 */
const ANTI_PATTERNS = `
🚫 NEVER DO THESE:

❌ BAD CODE EXAMPLES:

1. PLACEHOLDERS:
   \`\`\`javascript
   function login() {
     // TODO: Add authentication logic
   }
   \`\`\`
   
2. INCOMPLETE IMPLEMENTATIONS:
   \`\`\`javascript
   async function fetchData() {
     const response = await fetch(url);
     // Handle response here
   }
   \`\`\`
   
3. NO ERROR HANDLING:
   \`\`\`javascript
   function divide(a, b) {
     return a / b; // What if b is 0?
   }
   \`\`\`
   
4. HARDCODED VALUES:
   \`\`\`javascript
   const API_KEY = "sk_live_12345"; // NEVER!
   const API_URL = "https://myapi.com"; // Use env vars
   \`\`\`
   
5. POOR NAMING:
   \`\`\`javascript
   function f(x) { // What does this do?
     let a = x + 1;
     return a;
   }
   \`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ GOOD CODE EXAMPLES:

1. COMPLETE IMPLEMENTATION:
   \`\`\`javascript
   async function login(email, password) {
     try {
       if (!email || !password) {
         throw new Error('Email and password are required');
       }
       
       const response = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, password })
       });
       
       if (!response.ok) {
         throw new Error('Login failed');
       }
       
       const data = await response.json();
       return { success: true, user: data.user };
       
     } catch (error) {
       console.error('Login error:', error);
       return { success: false, error: error.message };
     }
   }
   \`\`\`
   
2. PROPER ERROR HANDLING:
   \`\`\`javascript
   function divide(a, b) {
     if (b === 0) {
       throw new Error('Cannot divide by zero');
     }
     return a / b;
   }
   \`\`\`
   
3. ENVIRONMENT VARIABLES:
   \`\`\`javascript
   const API_KEY = process.env.API_KEY;
   const API_URL = process.env.API_URL || 'https://api.default.com';
   \`\`\`
`;

/**
 * MAIN FUNCTION: Get enhanced prompt based on intent and detected language
 */
export const getEnhancedCodingPrompt = (
  intent: CodeIntent,
  userMessage: string,
  isCanvasMode: boolean = false
): string => {
  
  // Detect language/framework from user message
  const detectedFramework = detectFramework(userMessage);
  
  // Base prompt
  let enhancedPrompt = CORE_CODING_PRINCIPLES;
  
  // Add framework-specific guidelines
  if (detectedFramework && FRAMEWORK_GUIDELINES[detectedFramework]) {
    enhancedPrompt += '\n\n' + FRAMEWORK_GUIDELINES[detectedFramework];
  }
  
  // Add anti-patterns
  enhancedPrompt += '\n\n' + ANTI_PATTERNS;
  
  // Intent-specific instructions
  if (intent === 'CODE_CREATION') {
    enhancedPrompt += `\n
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 USER REQUEST: CREATE NEW CODE/APPLICATION

YOUR TASK:
1. Understand the user's requirements fully
2. Choose the best tech stack for the task
3. Generate COMPLETE, production-ready code
4. Make it visually appealing (if UI/web)
5. Ensure code runs without modifications

${isCanvasMode ? `
🎨 CANVAS MODE ACTIVE:
- User will see a Preview button
- Make the code visually impressive
- Use modern UI design (Tailwind CSS recommended)
- Add smooth animations/transitions
- Ensure responsive design
` : ''}

REMEMBER:
- NO placeholders or TODOs
- FULL implementation only
- Beautiful, modern UI
- Clean, readable code
- Ready to use immediately

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }
  
  return enhancedPrompt;
};

/**
 * Detect framework/language from user message
 */
const detectFramework = (message: string): keyof typeof FRAMEWORK_GUIDELINES | null => {
  const lowerMsg = message.toLowerCase();
  
  // React detection
  if (lowerMsg.includes('react') || lowerMsg.includes('jsx') || lowerMsg.includes('component')) {
    return 'react';
  }
  
  // Node.js detection
  if (lowerMsg.includes('node') || lowerMsg.includes('express') || lowerMsg.includes('api') || 
      lowerMsg.includes('backend') || lowerMsg.includes('server')) {
    return 'nodejs';
  }
  
  // Python detection
  if (lowerMsg.includes('python') || lowerMsg.includes('django') || lowerMsg.includes('flask') ||
      lowerMsg.includes('.py')) {
    return 'python';
  }
  
  // HTML detection (default for web stuff)
  if (lowerMsg.includes('html') || lowerMsg.includes('website') || lowerMsg.includes('web page') ||
      lowerMsg.includes('landing page') || lowerMsg.includes('halaman web')) {
    return 'html';
  }
  
  // Default to HTML for generic requests
  return 'html';
};

/**
 * Get quality checklist for code review
 */
export const getCodeQualityChecklist = (): string[] => {
  return [
    '✅ Code is complete and fully working',
    '✅ No placeholder or TODO comments',
    '✅ Proper error handling implemented',
    '✅ Input validation included',
    '✅ Modern syntax used (ES6+, async/await)',
    '✅ Clean and readable code',
    '✅ Consistent naming conventions',
    '✅ Security best practices followed',
    '✅ No hardcoded credentials',
    '✅ Responsive design (if UI)',
    '✅ Comments only for complex logic',
    '✅ Performance optimized'
  ];
};

/**
 * Validate code quality (basic checks)
 */
export const validateCodeQuality = (code: string): {
  isValid: boolean;
  issues: string[];
  score: number;
} => {
  const issues: string[] = [];
  let score = 100;
  
  // Check for placeholders
  if (code.includes('TODO') || code.includes('FIXME') || code.includes('implement')) {
    issues.push('⚠️ Contains placeholder comments (TODO/FIXME)');
    score -= 30;
  }
  
  // Check for hardcoded credentials
  if (code.match(/api[_-]?key\s*=\s*["'][^"']+["']/i) || 
      code.match(/password\s*=\s*["'][^"']+["']/i)) {
    issues.push('🚨 Contains hardcoded credentials');
    score -= 50;
  }
  
  // Check for console.log (excessive)
  const consoleLogCount = (code.match(/console\.log/g) || []).length;
  if (consoleLogCount > 3) {
    issues.push('⚠️ Too many console.log statements (debugging code?)');
    score -= 10;
  }
  
  // Check for var usage
  if (code.includes('var ')) {
    issues.push('⚠️ Uses var instead of const/let');
    score -= 10;
  }
  
  // Check length (too short = incomplete)
  if (code.length < 100) {
    issues.push('⚠️ Code seems too short/incomplete');
    score -= 20;
  }
  
  return {
    isValid: score >= 70,
    issues,
    score: Math.max(0, score)
  };
};
