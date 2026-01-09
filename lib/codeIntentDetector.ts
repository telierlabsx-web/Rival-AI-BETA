* Code Intent Detector
 * Mendeteksi apakah user meminta AI untuk MEMBUAT code atau hanya bertanya/diskusi
 * 
 * @author Muhamad Rivaldy
 * @company vCrop
 */

export type CodeIntent = 
  | 'CODE_CREATION'      // User minta bikin aplikasi/component/function
  | 'CODE_EXPLANATION'   // User minta penjelasan tentang code
  | 'CODE_DEBUG'         // User minta fix bug atau improve code
  | 'CASUAL_CHAT'        // Chat biasa, ga ada hubungan sama coding
  | 'CODE_QUESTION';     // Nanya tentang konsep programming

export interface IntentDetectionResult {
  intent: CodeIntent;
  confidence: number; // 0-100
  keywords: string[];
  shouldCreateArtifact: boolean;
}

/**
 * Deteksi intent dari pesan user
 */
export const detectCodeIntent = (
  message: string,
  isCanvasMode: boolean = false
): IntentDetectionResult => {
  
  const lowerMsg = message.toLowerCase();
  const matchedKeywords: string[] = [];
  
  // =============================================================
  // 1. CODE CREATION KEYWORDS (User minta bikin sesuatu)
  // =============================================================
  
  const creationKeywords = [
    // Indonesian
    'bikin', 'buatin', 'buat', 'bikinin', 'create', 'develop',
    'build', 'bangun', 'design', 'kembangkan', 'implement',
    'generate', 'code untuk', 'aplikasi', 'website', 'app',
    'function', 'fungsi', 'component', 'komponen', 'class',
    'program', 'sistem', 'script', 'module', 'api',
    'dashboard', 'landing page', 'form', 'button', 'navbar',
    'sidebar', 'modal', 'popup', 'animation', 'game',
    'calculator', 'todo', 'chat app', 'crud', 'authentication',
    'login', 'register', 'database', 'backend', 'frontend',
    
    // Patterns
    'saya mau', 'saya butuh', 'tolong bikin', 'bisa bikin',
    'gimana cara bikin', 'caranya bikin', 'tutorial bikin',
    'step bikin', 'please create', 'can you create', 
    'can you build', 'i need', 'i want', 'make me',
    'help me create', 'help me build'
  ];
  
  const creationScore = creationKeywords.filter(keyword => {
    if (lowerMsg.includes(keyword)) {
      matchedKeywords.push(keyword);
      return true;
    }
    return false;
  }).length;
  
  // =============================================================
  // 2. EXPLANATION KEYWORDS (User minta penjelasan)
  // =============================================================
  
  const explanationKeywords = [
    'jelaskan', 'explain', 'apa itu', 'what is', 'apa artinya',
    'maksudnya', 'meaning of', 'definisi', 'definition',
    'perbedaan', 'difference', 'bedanya', 'vs', 'versus',
    'gimana cara kerja', 'how does', 'bagaimana', 'kenapa',
    'why', 'mengapa', 'konsep', 'concept', 'teori', 'theory'
  ];
  
  const explanationScore = explanationKeywords.filter(keyword => 
    lowerMsg.includes(keyword)
  ).length;
  
  // =============================================================
  // 3. DEBUG/FIX KEYWORDS (User minta perbaiki code)
  // =============================================================
  
  const debugKeywords = [
    'perbaiki', 'fix', 'debug', 'error', 'bug', 'masalah',
    'problem', 'issue', 'tidak jalan', 'ga jalan', 'not working',
    'broken', 'rusak', 'salah', 'wrong', 'improve', 'optimize',
    'tingkatkan', 'refactor', 'lebih baik', 'better way'
  ];
  
  const debugScore = debugKeywords.filter(keyword => 
    lowerMsg.includes(keyword)
  ).length;
  
  // =============================================================
  // 4. CASUAL CHAT KEYWORDS (Chat santai)
  // =============================================================
  
  const casualKeywords = [
    'hai', 'hello', 'hi', 'halo', 'makasih', 'thanks', 'thank you',
    'terima kasih', 'oke', 'ok', 'okay', 'sip', 'mantap', 'keren',
    'bagus', 'nice', 'good', 'great', 'apa kabar', 'how are you',
    'lagi apa', 'what are you', 'siapa kamu', 'who are you'
  ];
  
  const casualScore = casualKeywords.filter(keyword => 
    lowerMsg.includes(keyword)
  ).length;
  
  // =============================================================
  // 5. CODE PRESENCE CHECK
  // =============================================================
  
  // Cek apakah user ngirim code (ada code block atau syntax)
  const hasCodeBlock = message.includes('```') || 
                       message.includes('function') ||
                       message.includes('const ') ||
                       message.includes('let ') ||
                       message.includes('class ') ||
                       message.includes('def ') ||
                       message.includes('import ') ||
                       message.includes('<div') ||
                       message.includes('</');
  
  // =============================================================
  // 6. MESSAGE LENGTH ANALYSIS
  // =============================================================
  
  const messageLength = message.length;
  const wordCount = message.split(/\s+/).length;
  
  // Message pendek cenderung casual
  const isShortMessage = wordCount < 5;
  
  // =============================================================
  // 7. DECISION LOGIC
  // =============================================================
  
  // Kalau casual score tinggi dan message pendek
  if (casualScore > 0 && isShortMessage) {
    return {
      intent: 'CASUAL_CHAT',
      confidence: 90,
      keywords: casualKeywords.filter(k => lowerMsg.includes(k)),
      shouldCreateArtifact: false
    };
  }
  
  // Kalau ada code di message + debug keywords
  if (hasCodeBlock && debugScore > 0) {
    return {
      intent: 'CODE_DEBUG',
      confidence: 85,
      keywords: debugKeywords.filter(k => lowerMsg.includes(k)),
      shouldCreateArtifact: false // Di mode biasa cuma kasih fix di markdown
    };
  }
  
  // Kalau creation score tinggi
  if (creationScore >= 2 || (creationScore >= 1 && isCanvasMode)) {
    return {
      intent: 'CODE_CREATION',
      confidence: 95,
      keywords: matchedKeywords,
      shouldCreateArtifact: isCanvasMode // HANYA di Canvas mode bikin artifact
    };
  }
  
  // Kalau explanation score tinggi
  if (explanationScore > 0) {
    return {
      intent: 'CODE_EXPLANATION',
      confidence: 80,
      keywords: explanationKeywords.filter(k => lowerMsg.includes(k)),
      shouldCreateArtifact: false
    };
  }
  
  // Kalau ada sedikit creation keywords tapi ga cukup confident
  if (creationScore === 1) {
    return {
      intent: 'CODE_QUESTION',
      confidence: 60,
      keywords: matchedKeywords,
      shouldCreateArtifact: false
    };
  }
  
  // Default: anggap pertanyaan coding biasa
  return {
    intent: 'CODE_QUESTION',
    confidence: 50,
    keywords: [],
    shouldCreateArtifact: false
  };
};

/**
 * Helper: Cek apakah harus generate artifact based on intent + mode
 */
export const shouldGenerateArtifact = (
  intent: CodeIntent,
  isCanvasMode: boolean,
  messageLength: number
): boolean => {
  // RULE 1: Hanya Canvas mode yang bisa bikin artifact
  if (!isCanvasMode) return false;
  
  // RULE 2: Hanya CODE_CREATION yang bikin artifact
  if (intent !== 'CODE_CREATION') return false;
  
  // RULE 3: Message harus cukup jelas (minimal 10 karakter)
  if (messageLength < 10) return false;
  
  return true;
};

/**
 * Helper: Get prompt enhancement based on intent
 */
export const getPromptEnhancement = (intent: CodeIntent): string => {
  switch (intent) {
    case 'CODE_CREATION':
      return `
🚀 USER WANTS YOU TO CREATE CODE/APPLICATION!

CRITICAL REQUIREMENTS:
1. Generate COMPLETE, PRODUCTION-READY code
2. NO placeholders, NO "TODO" comments
3. Include ALL necessary imports and dependencies
4. Add proper error handling
5. Make it visually appealing (use Tailwind CSS if HTML)
6. Ensure code is FULLY WORKING and can run immediately

STRUCTURE YOUR RESPONSE:
- Brief intro (1-2 sentences)
- Complete code in code block
- Setup/usage instructions if needed
- Tips for enhancement (optional)

QUALITY CHECKLIST:
✅ Full implementation
✅ Clean, readable code
✅ Best practices followed
✅ Comments for complex parts
✅ Handles edge cases
`;

    case 'CODE_DEBUG':
      return `
🔧 USER NEEDS HELP FIXING CODE!

PROVIDE:
1. Clear explanation of the issue
2. Complete fixed code (not just the broken part)
3. Explain what was wrong and why your fix works
4. Suggest improvements if applicable

Keep explanation concise but helpful.
`;

    case 'CODE_EXPLANATION':
      return `
📚 USER WANTS TO LEARN!

EXPLAIN:
1. Core concept clearly
2. Use simple examples
3. Compare with similar concepts if relevant
4. Provide practical use cases

Keep it conversational and easy to understand.
`;

    default:
      return '';
  }
};
