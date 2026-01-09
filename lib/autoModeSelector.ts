export type AIMode = 'fast' | 'expert';

export const detectQueryComplexity = (message: string): AIMode => {
  
  // 1. Cek panjang pesan
  if (message.length > 150) {
    return 'expert';
  }
  
  // 2. Keywords yang butuh expert mode
  const expertKeywords = [
    'jelaskan detail',
    'explain detail',
    'analisa',
    'analyze',
    'bandingkan',
    'compare',
    'riset',
    'research',
    'mendalam',
    'kompleks',
    'rumit',
    'bagaimana cara',
    'how to',
    'tutorial',
    'pelajari'
  ];
  
  // 3. Keywords coding
  const codeKeywords = [
    'code',
    'kode',
    'function',
    'fungsi',
    'bug',
    'error',
    'debug',
    'class',
    'component',
    'bikin',
    'buat',
    'create',
    'develop',
    'api',
    'database',
    'backend',
    'frontend'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  const needsExpert = expertKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  const hasCode = codeKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  if (needsExpert || hasCode) {
    return 'expert';
  }
  
  return 'fast';
};
