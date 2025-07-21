
// Simple language detection based on character sets
export const detectLanguage = (text: string): string => {
  // Arabic characters
  const arabicRegex = /[\u0600-\u06FF]/;
  if (arabicRegex.test(text)) return 'ar';
  
  // Hebrew characters
  const hebrewRegex = /[\u0590-\u05FF]/;
  if (hebrewRegex.test(text)) return 'he';
  
  // Persian/Farsi characters
  const persianRegex = /[\u06A0-\u06FF]/;
  if (persianRegex.test(text)) return 'fa';
  
  // Default to LTR
  return 'en';
};

// Check if text direction should be RTL
export const isRTLLanguage = (language: string): boolean => {
  return ['ar', 'he', 'fa'].includes(language);
};
