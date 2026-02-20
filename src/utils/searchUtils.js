/**
 * Calculate the Levenshtein distance between two strings.
 * This measures the minimum number of single-character edits (insertions, deletions, or substitutions)
 * required to change one word into the other.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number} The distance
 */
export const calculateLevenshteinDistance = (a, b) => {
 if (a.length === 0) return b.length;
 if (b.length === 0) return a.length;

 const matrix = [];

 // increment along the first column of each row
 for (let i = 0; i <= b.length; i++) {
  matrix[i] = [i];
 }

 // increment each column in the first row
 for (let j = 0; j <= a.length; j++) {
  matrix[0][j] = j;
 }

 // Fill in the rest of the matrix
 for (let i = 1; i <= b.length; i++) {
  for (let j = 1; j <= a.length; j++) {
   if (b.charAt(i - 1) === a.charAt(j - 1)) {
    matrix[i][j] = matrix[i - 1][j - 1];
   } else {
    matrix[i][j] = Math.min(
     matrix[i - 1][j - 1] + 1, // substitution
     Math.min(
      matrix[i][j - 1] + 1, // insertion
      matrix[i - 1][j] + 1, // deletion
     ),
    );
   }
  }
 }

 return matrix[b.length][a.length];
};

/**
 * Check if the query matches the text using fuzzy logic.
 *
 * @param {string} text The text to search within (e.g. restaurant name)
 * @param {string} query The search query
 * @param {number} threshold Maximum allowed distance (default 3)
 * @returns {boolean} True if match found
 */
export const fuzzyMatch = (text, query, threshold = 3) => {
 if (!text || !query) return false;

 const lowerText = text.toLowerCase();
 const lowerQuery = query.toLowerCase();

 // 1. Exact substring match (fast path)
 if (lowerText.includes(lowerQuery)) return true;

 // 2. Fuzzy match
 // Only apply fuzzy match if the query is at least 3 characters long to avoid noise
 if (lowerQuery.length < 3) return false;

 // Check full string distance (handles cases like "Monel Restaurant" matching "Monal Restaurant")
 if (calculateLevenshteinDistance(lowerQuery, lowerText) <= threshold) {
  return true;
 }

 const words = lowerText.split(/\s+/);
 for (const word of words) {
  if (calculateLevenshteinDistance(lowerQuery, word) <= threshold) {
   return true;
  }
 }

 return false;
};
