import { CodeIntent } from './codeIntentDetector';

/**
 * Enhanced Coding Prompt System
 * Provides comprehensive guidelines for AI code generation
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

const FRAMEWORK_GUIDELINES: Record<string, string> = {
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
`,

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
`,

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
`
};

const ANTI_PATTERNS = `
🚫 NEVER DO THESE:

❌ NO PLACEHOLDERS
❌ NO TODO COMMENTS
❌ NO INCOMPLETE CODE
❌ NO HARDCODED CREDENTIALS
❌ ALWAYS ADD ERROR HANDLING
`;

export const getEnhancedCodingPrompt = (
  intent: CodeIntent,
  userMessage: string,
  isCanvasMode: boolean = false
): string => {
  
  const detectedFramework = detectFramework(userMessage);
  
  let enhancedPrompt = CORE_CODING_PRINCIPLES;
  
  if (detectedFramework && FRAMEWORK_GUIDELINES[detectedFramework]) {
    enhancedPrompt += '\n\n' + FRAMEWORK_GUIDELINES[detectedFramework];
  }
  
  enhancedPrompt += '\n\n' + ANTI_PATTERNS;
  
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

const detectFramework = (message: string): string | null => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('react') || lowerMsg.includes('jsx') || lowerMsg.includes('component')) {
    return 'react';
  }
  
  if (lowerMsg.includes('node') || lowerMsg.includes('express') || lowerMsg.includes('api') || 
      lowerMsg.includes('backend') || lowerMsg.includes('server')) {
    return 'nodejs';
  }
  
  if (lowerMsg.includes('python') || lowerMsg.includes('django') || lowerMsg.includes('flask') ||
      lowerMsg.includes('.py')) {
    return 'python';
  }
  
  if (lowerMsg.includes('html') || lowerMsg.includes('website') || lowerMsg.includes('web page') ||
      lowerMsg.includes('landing page') || lowerMsg.includes('halaman web')) {
    return 'html';
  }
  
  return 'html';
};

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

export const validateCodeQuality = (code: string): {
  isValid: boolean;
  issues: string[];
  score: number;
} => {
  const issues: string[] = [];
  let score = 100;
  
  if (code.includes('TODO') || code.includes('FIXME') || code.includes('implement')) {
    issues.push('⚠️ Contains placeholder comments (TODO/FIXME)');
    score -= 30;
  }
  
  if (code.match(/api[_-]?key\s*=\s*["'][^"']+["']/i) || 
      code.match(/password\s*=\s*["'][^"']+["']/i)) {
    issues.push('🚨 Contains hardcoded credentials');
    score -= 50;
  }
  
  const consoleLogCount = (code.match(/console\.log/g) || []).length;
  if (consoleLogCount > 3) {
    issues.push('⚠️ Too many console.log statements (debugging code?)');
    score -= 10;
  }
  
  if (code.includes('var ')) {
    issues.push('⚠️ Uses var instead of const/let');
    score -= 10;
  }
  
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
