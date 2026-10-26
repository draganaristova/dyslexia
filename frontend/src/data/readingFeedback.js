
function tokenize(text) {
  return String(text || "").toLocaleLowerCase("mk-MK").match(/[\p{L}\p{N}]+/gu) || [];
}

const numberVariants = {
  "0": ["нула"],
  "1": ["еден", "една", "едно"],
  "2": ["два", "две"],
  "3": ["три"],
  "4": ["четири"],
  "5": ["пет"],
  "6": ["шест"],
  "7": ["седум"],
  "8": ["осум"],
  "9": ["девет"],
  "10": ["десет"]
};

function wordsMatch(expected, recognized) {
  if (expected === recognized) return true;
  if (numberVariants[recognized]?.includes(expected)) return true;
  if (numberVariants[expected]?.includes(recognized)) return true;
  return false;
}

export function evaluateReading(expected, recognized) {
  const expectedWords = tokenize(expected);
  const spokenWords = tokenize(recognized);

  if (!expectedWords.length || !spokenWords.length) return null;

  const m = expectedWords.length;
  const n = spokenWords.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = wordsMatch(expectedWords[i], spokenWords[j])
        ? 1 + dp[i + 1][j + 1]
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const matchedIndices = new Set();
  let i = 0;
  let j = 0;

  while (i < m && j < n) {
    if (wordsMatch(expectedWords[i], spokenWords[j])) {
      matchedIndices.add(i);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }

  const matched = matchedIndices.size;
  const accuracy = Math.round((matched / m) * 100);
  const practiceWords = expectedWords.filter((_, index) => !matchedIndices.has(index));

  let message;

  if (accuracy === 100 && spokenWords.length === m) {
    message = "Браво! Ги препозна сите зборови! 🌟";
  } else if (accuracy >= 70) {
    message = "Одличен обид! Ајде да ги вежбаме и останатите зборови. 💚";
  } else {
    message = "Убаво што се обиде! Можеме полека да пробаме повторно. 🌱";
  }

  return { accuracy, matched, total: m, practiceWords, message };
}
