import { PrismaClient, ProblemDifficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding coding problems and lab test cases...');

  // 1. Standalone Coding Problems
  const problems = [
    {
      slug: 'reverse',
      title: 'String Reversal',
      difficulty: ProblemDifficulty.easy,
      tags: ['Algorithms'],
      description: 'Write a function reverseString(str) that takes a string as input and returns the string reversed.',
      examples: [
        { input: '"hello"', output: '"olleh"' },
        { input: '"Skillzy"', output: '"yzllikS"' }
      ],
      sampleOutput: '"olleh"',
      sortOrder: 1,
      starterCode: {
        javascript: `// Implement a function to reverse a string\nfunction reverseString(str) {\n  // Write your code here\n\n}`,
        python: `# Implement a function to reverse a string\ndef reverse_string(s):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nstring reverseString(const string &s) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `public class Main {\n    public static String reverseString(String s) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof reverseString !== 'function') throw new Error("Function reverseString is not defined");
  const cases = [
    { input: "hello", expected: "olleh" },
    { input: "Skillzy", expected: "yzllikS" }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = reverseString(c.input);
      const passed = act === c.expected;
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: "\${act}"\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch(err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'reverse_string' not in globals() and 'reverseString' not in globals():
        raise NameError("Function reverse_string or reverseString is not defined")
    func = reverse_string if 'reverse_string' in globals() else reverseString
    cases = [
        { "input": "hello", "expected": "olleh" },
        { "input": "Skillzy", "expected": "yzllikS" }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = func(c["input"])
            passed = act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: \\"{act}\\"")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 94,
        metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Excellent Runtime', style: 'Highly Readable' },
        suggestions: [
          'Good use of native JavaScript methods (`split`, `reverse`, `join`) which execute rapidly.',
          'Note: This creates an intermediate array of size N, resulting in O(N) auxiliary space complexity.',
          'To optimize to O(1) auxiliary space, reverse the string in-place using a two-pointer swaps technique.'
        ],
        optimalExplanation: 'An optimal solution reverses the string in-place using two pointers starting at the beginning and end of the string, swapping characters until they meet. This reduces space complexity from O(N) to O(1).',
        optimalCode: `function reverseStringInPlace(arr) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left < right) {\n    let temp = arr[left];\n    arr[left] = arr[right];\n    arr[right] = temp;\n    left++;\n    right--;\n  }\n  return arr;\n}`
      }
    },
    {
      slug: 'palindrome',
      title: 'Palindrome Check',
      difficulty: ProblemDifficulty.easy,
      tags: ['Algorithms', 'Strings'],
      description: 'Write a function isPalindrome(str) that returns true if the string reads the same forwards and backwards. Ignore case and non-alphanumeric characters.',
      examples: [
        { input: '"Racecar"', output: 'true' },
        { input: '"A man, a plan, a canal: Panama"', output: 'true' }
      ],
      sampleOutput: 'true',
      sortOrder: 2,
      starterCode: {
        javascript: `// Check if a string is a palindrome\nfunction isPalindrome(str) {\n  // Write your code here\n\n}`,
        python: `# Check if a string is a palindrome\ndef is_palindrome(s):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nbool isPalindrome(const string &s) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `public class Main {\n    public static boolean isPalindrome(String s) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof isPalindrome !== 'function') throw new Error("Function isPalindrome is not defined");
  const cases = [
    { input: "Racecar", expected: true },
    { input: "hello", expected: false }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = isPalindrome(c.input);
      const passed = act === c.expected;
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: \${act}\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch(err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'is_palindrome' not in globals() and 'isPalindrome' not in globals():
        raise NameError("Function is_palindrome or isPalindrome is not defined")
    func = is_palindrome if 'is_palindrome' in globals() else isPalindrome
    cases = [
        { "input": "Racecar", "expected": True },
        { "input": "hello", "expected": False }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = func(c["input"])
            passed = act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 91,
        metrics: { complexity: 'O(N) Time • O(1) Extra Space', performance: 'Very Good Runtime', style: 'Clear and Concise' },
        suggestions: [
          'Filtering non-alphanumeric characters before comparison keeps the logic robust against punctuation.',
          'A two-pointer approach can avoid creating a reversed copy of the string and reduce memory usage.',
          'Keep your character normalization separate from the comparison logic for easier testing.'
        ],
        optimalExplanation: 'An optimal palindrome check uses two pointers to compare characters from both ends while skipping non-alphanumeric characters. This avoids full string reversal and keeps extra space constant.',
        optimalCode: `function isPalindrome(str) {\n  let left = 0;\n  let right = str.length - 1;\n  while (left < right) {\n    while (left < right && !/[a-z0-9]/i.test(str[left])) left++;\n    while (left < right && !/[a-z0-9]/i.test(str[right])) right--;\n    if (left < right && str[left].toLowerCase() !== str[right].toLowerCase()) return false;\n    left++;\n    right--;\n  }\n  return true;\n}`
      }
    },
    {
      slug: 'fizzbuzz',
      title: 'FizzBuzz',
      difficulty: ProblemDifficulty.easy,
      tags: ['Algorithms', 'Loops'],
      description: 'Write a function fizzBuzz(n) that returns an array of strings from 1 to n. For multiples of three use "Fizz", for multiples of five use "Buzz", and for multiples of both use "FizzBuzz".',
      examples: [
        { input: '5', output: '["1","2","Fizz","4","Buzz"]' },
        { input: '15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' }
      ],
      sampleOutput: '["1","2","Fizz","4","Buzz"]',
      sortOrder: 3,
      starterCode: {
        javascript: `// Implement FizzBuzz - return an array of strings\nfunction fizzBuzz(n) {\n  // Write your code here\n\n}`,
        python: `# Implement FizzBuzz - return a list of strings\ndef fizz_buzz(n):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nvector<string> fizzBuzz(int n) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `import java.util.*;\npublic class Main {\n    public static List<String> fizzBuzz(int n) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof fizzBuzz !== 'function') throw new Error("Function fizzBuzz is not defined");
  const originalLog = console.log;
  let logs = [];
  console.log = (...args) => logs.push(args.join(' '));
  try {
    fizzBuzz(5);
  } finally {
    console.log = originalLog;
  }
  const act = logs.join('\\n');
  const expected = "1\\n2\\nFizz\\n4\\nBuzz";
  const passed = act.trim() === expected.trim();
  console.log(\`[TEST_CASE] 0 | \${passed ? 'PASS' : 'FAIL'} | Actual: "\${act.replace(/\\n/g, '\\\\n')}"\`);
  if (passed) console.log("TEST_RESULTS: 1/1 passed");
  else console.log("TEST_FAILURE: stdout output did not match expected FizzBuzz");
} catch(err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'fizz_buzz' not in globals() and 'fizzBuzz' not in globals():
        raise NameError("Function fizz_buzz or fizzBuzz is not defined")
    import sys, io
    old_stdout = sys.stdout
    new_stdout = io.StringIO()
    sys.stdout = new_stdout
    try:
        fizz_buzz_fn = fizz_buzz if 'fizz_buzz' in globals() else fizzBuzz
        fizz_buzz_fn(5)
    finally:
        sys.stdout = old_stdout
    act = new_stdout.getvalue().strip()
    expected = "1\\n2\\nFizz\\n4\\nBuzz"
    passed = act == expected
    print(f"[TEST_CASE] 0 | {'PASS' if passed else 'FAIL'} | Actual: \\"{act.replace('\\n', '\\\\n')}\\"")
    if passed:
        print("TEST_RESULTS: 1/1 passed")
    else:
        print("TEST_FAILURE: stdout output did not match expected FizzBuzz")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 89,
        metrics: { complexity: 'O(N) Time • O(1) Space', performance: 'Strong Runtime', style: 'Well-Structured' },
        suggestions: [
          'Your loop logic correctly handles Fizz, Buzz, and FizzBuzz order with clear conditionals.',
          'Using modulo checks in decreasing specificity avoids incorrect output for numbers divisible by both 3 and 5.',
          'If you need to return values instead of printing, collect results in an array and return it for easier unit testing.'
        ],
        optimalExplanation: 'The optimal FizzBuzz implementation loops once from 1 to n and uses conditional ordering so that multiples of both 3 and 5 are handled first.',
        optimalCode: `function fizzBuzz(n) {\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) console.log('FizzBuzz');\n    else if (i % 3 === 0) console.log('Fizz');\n    else if (i % 5 === 0) console.log('Buzz');\n    else console.log(i);\n  }\n}`
      }
    },
    {
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: ProblemDifficulty.easy,
      tags: ['Arrays', 'Hash Table'],
      description: 'Given an array of integers and a target, return the indices of the two numbers that add up to the target.',
      examples: [
        { input: '[2,7,11,15], target=9', output: '[0,1]' },
        { input: '[3,2,4], target=6', output: '[1,2]' }
      ],
      sampleOutput: '[0,1]',
      sortOrder: 4,
      starterCode: {
        javascript: `// Return indices of two numbers that add up to target\nfunction twoSum(nums, target) {\n  // Write your code here\n\n}`,
        python: `# Return indices of two numbers that add up to target\ndef two_sum(nums, target):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `import java.util.*;\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof twoSum !== 'function') throw new Error("Function twoSum is not defined");
  const cases = [
    { nums: [2, 7, 11, 15], target: 9, expected: [0, 1] },
    { nums: [3, 2, 4], target: 6, expected: [1, 2] }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = twoSum(c.nums, c.target);
      const passed = Array.isArray(act) && act[0] === c.expected[0] && act[1] === c.expected[1];
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: [\${act ? act.join(',') : ''}]\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'two_sum' not in globals() and 'twoSum' not in globals():
        raise NameError("Function two_sum or twoSum is not defined")
    func = two_sum if 'two_sum' in globals() else twoSum
    cases = [
        { "nums": [2, 7, 11, 15], "target": 9, "expected": [0, 1] },
        { "nums": [3, 2, 4], "target": 6, "expected": [1, 2] }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = func(c["nums"], c["target"])
            passed = isinstance(act, list) and len(act) == 2 and act[0] == c["expected"][0] and act[1] == c["expected"][1]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 92,
        metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Excellent Runtime', style: 'Interview Ready' },
        suggestions: [
          'Using a hash table avoids the quadratic search of every pair.',
          'Make sure to handle duplicate entries carefully when the complement is equal to the current number.',
          'Consider returning early as soon as the matching pair is found for best performance.'
        ],
        optimalExplanation: 'The best Two Sum solution uses one pass through the array while storing seen numbers in a hash map, so complements are found in constant time.',
        optimalCode: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n}`
      }
    },
    {
      slug: 'anagram',
      title: 'Anagram Check',
      difficulty: ProblemDifficulty.easy,
      tags: ['Strings', 'Hash Table'],
      description: 'Given two strings, determine if one is an anagram of the other.',
      examples: [
        { input: '"listen", "silent"', output: 'true' },
        { input: '"hello", "bello"', output: 'false' }
      ],
      sampleOutput: 'true',
      sortOrder: 5,
      starterCode: {
        javascript: `// Check if two strings are anagrams\nfunction isAnagram(s, t) {\n  // Write your code here\n\n}`,
        python: `# Check if two strings are anagrams\ndef is_anagram(s, t):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nbool isAnagram(string s, string t) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `import java.util.*;\npublic class Main {\n    public static boolean isAnagram(String s, String t) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof isAnagram !== 'function') throw new Error("Function isAnagram is not defined");
  const cases = [
    { s: "listen", t: "silent", expected: true },
    { s: "hello", t: "bello", expected: false }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = isAnagram(c.s, c.t);
      const passed = act === c.expected;
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: \${act}\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'is_anagram' not in globals() and 'isAnagram' not in globals():
        raise NameError("Function is_anagram or isAnagram is not defined")
    func = is_anagram if 'is_anagram' in globals() else isAnagram
    cases = [
        { "s": "listen", "t": "silent", "expected": True },
        { "s": "hello", "t": "bello", "expected": False }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = func(c["s"], c["t"])
            passed = act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 90,
        metrics: { complexity: 'O(N log N) Time • O(1) Extra Space', performance: 'Very Good Runtime', style: 'Straightforward' },
        suggestions: [
          'Sorting both strings is a simple solution, but a character count is more efficient in practice.',
          'Normalize case and ignore whitespace if the prompt allows it.',
          'Character frequency maps are the most memory-efficient for large alphabets.'
        ],
        optimalExplanation: 'An efficient anagram check counts character frequency for each string and compares the resulting maps, avoiding the cost of sorting.',
        optimalCode: `function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const counts = {};\n  for (const char of s) counts[char] = (counts[char] || 0) + 1;\n  for (const char of t) {\n    if (!counts[char]) return false;\n    counts[char]--;\n  }\n  return true;\n}`
      }
    },
    {
      slug: 'balanced-brackets',
      title: 'Balanced Brackets',
      difficulty: ProblemDifficulty.medium,
      tags: ['Stacks', 'Strings'],
      description: 'Check whether the sequence of brackets is balanced using (), [], and {}.',
      examples: [
        { input: '"()[]{}"', output: 'true' },
        { input: '"([)]"', output: 'false' }
      ],
      sampleOutput: 'true',
      sortOrder: 6,
      starterCode: {
        javascript: `// Check if brackets are balanced\nfunction isBalanced(s) {\n  // Write your code here\n\n}`,
        python: `# Check if brackets are balanced\ndef is_balanced(s):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nbool isBalanced(const string &s) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `import java.util.*;\npublic class Main {\n    public static boolean isBalanced(String s) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof isBalanced !== 'function') throw new Error("Function isBalanced is not defined");
  const cases = [
    { input: "()[]{}", expected: true },
    { input: "([)]", expected: false }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = isBalanced(c.input);
      const passed = act === c.expected;
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: \${act}\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'is_balanced' not in globals() and 'isBalanced' not in globals():
        raise NameError("Function is_balanced or isBalanced is not defined")
    func = is_balanced if 'is_balanced' in globals() else isBalanced
    cases = [
        { "input": "()[]{}", "expected": True },
        { "input": "([)]", "expected": False }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = func(c["input"])
            passed = act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 88,
        metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Solid Runtime', style: 'Robust' },
        suggestions: [
          'A stack is the canonical approach for balanced bracket validation.',
          'Always verify that the stack is empty at the end to avoid unclosed brackets.',
          'Use a mapping from closing to opening characters to make the compare logic concise.'
        ],
        optimalExplanation: 'The best balanced brackets solution pushes opening chars onto a stack and validates each closing char against the last open bracket.',
        optimalCode: `function isBalanced(s) {\n  const stack = [];\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  for (const char of s) {\n    if ('([{'.includes(char)) stack.push(char);\n    else if (pairs[char]) {\n      if (stack.pop() !== pairs[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}`
      }
    },
    {
      slug: 'merge-sorted-arrays',
      title: 'Merge Sorted Arrays',
      difficulty: ProblemDifficulty.easy,
      tags: ['Arrays', 'Sorting'],
      description: 'Merge two sorted arrays into a single sorted array.',
      examples: [
        { input: '[1,3,5], [2,4,6]', output: '[1,2,3,4,5,6]' },
        { input: '[0], [0,1]', output: '[0,0,1]' }
      ],
      sampleOutput: '[1,2,3,4,5,6]',
      sortOrder: 7,
      starterCode: {
        javascript: `// Merge two sorted arrays into one sorted array\nfunction mergeSorted(a, b) {\n  // Write your code here\n\n}`,
        python: `# Merge two sorted arrays into one sorted array\ndef merge_sorted(a, b):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> mergeSorted(const vector<int>& a, const vector<int>& b) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `import java.util.*;\npublic class Main {\n    public static List<Integer> mergeSorted(List<Integer> a, List<Integer> b) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof mergeSorted !== 'function') throw new Error("Function mergeSorted is not defined");
  const cases = [
    { a: [1, 3, 5], b: [2, 4, 6], expected: [1, 2, 3, 4, 5, 6] },
    { a: [0], b: [0, 1], expected: [0, 0, 1] }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = mergeSorted(c.a, c.b);
      const passed = Array.isArray(act) && JSON.stringify(act) === JSON.stringify(c.expected);
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: [\${act ? act.join(',') : ''}]\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'merge_sorted' not in globals() and 'mergeSorted' not in globals():
        raise NameError("Function merge_sorted or mergeSorted is not defined")
    func = merge_sorted if 'merge_sorted' in globals() else mergeSorted
    cases = [
        { "a": [1, 3, 5], "b": [2, 4, 6], "expected": [1, 2, 3, 4, 5, 6] },
        { "a": [0], "b": [0, 1], "expected": [0, 0, 1] }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = func(c["a"], c["b"])
            passed = isinstance(act, list) and act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 90,
        metrics: { complexity: 'O(N + M) Time • O(N + M) Space', performance: 'Efficient Runtime', style: 'Clean' },
        suggestions: [
          'Two-pointer merging is the simplest and fastest way to combine sorted arrays.',
          'Avoid extra sorting by preserving the order while copying the remaining elements.',
          'This algorithm is stable and works well for large sorted inputs.'
        ],
        optimalExplanation: 'Merge sorted arrays by advancing two pointers and selecting the smaller current element until both arrays are exhausted.',
        optimalCode: `function mergeSorted(a, b) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] < b[j]) result.push(a[i++]);\n    else result.push(b[j++]);\n  }\n  return result.concat(a.slice(i)).concat(b.slice(j));\n}`
      }
    },
    {
      slug: 'fibonacci',
      title: 'Fibonacci Number',
      difficulty: ProblemDifficulty.easy,
      tags: ['Recursion', 'Dynamic Programming'],
      description: 'Compute the n-th Fibonacci number, where Fibonacci(0)=0 and Fibonacci(1)=1.',
      examples: [
        { input: '5', output: '5' },
        { input: '10', output: '55' }
      ],
      sampleOutput: '5',
      sortOrder: 8,
      starterCode: {
        javascript: `// Return the n-th Fibonacci number\nfunction fibonacci(n) {\n  // Write your code here\n\n}`,
        python: `# Return the n-th Fibonacci number\ndef fibonacci(n):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint fibonacci(int n) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `public class Main {\n    public static int fibonacci(int n) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof fibonacci !== 'function') throw new Error("Function fibonacci is not defined");
  const cases = [
    { input: 5, expected: 5 },
    { input: 10, expected: 55 }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = fibonacci(c.input);
      const passed = act === c.expected;
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: \${act}\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'fibonacci' not in globals():
        raise NameError("Function fibonacci is not defined")
    cases = [
        { "input": 5, "expected": 5 },
        { "input": 10, "expected": 55 }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = fibonacci(c["input"])
            passed = act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 87,
        metrics: { complexity: 'O(N) Time • O(1) Space', performance: 'Good Runtime', style: 'Iterative' },
        suggestions: [
          'An iterative approach avoids recursion depth issues for larger n.',
          'Use constant memory by tracking only the last two Fibonacci numbers.',
          'Memoization can also help if the prompt asks for repeated calls.'
        ],
        optimalExplanation: 'The optimal Fibonacci implementation uses a loop and two variables to compute the n-th value in linear time with constant space.',
        optimalCode: `function fibonacci(n) {\n  if (n < 2) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}`
      }
    },
    {
      slug: 'factorial',
      title: 'Factorial Calculation',
      difficulty: ProblemDifficulty.easy,
      tags: ['Recursion', 'Math'],
      description: 'Write a function to compute the factorial of a non-negative integer n.',
      examples: [
        { input: '5', output: '120' },
        { input: '0', output: '1' }
      ],
      sampleOutput: '120',
      sortOrder: 9,
      starterCode: {
        javascript: `// Compute the factorial of n\nfunction factorial(n) {\n  // Write your code here\n\n}`,
        python: `# Compute the factorial of n\ndef factorial(n):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint factorial(int n) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `public class Main {\n    public static int factorial(int n) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof factorial !== 'function') throw new Error("Function factorial is not defined");
  const cases = [
    { input: 5, expected: 120 },
    { input: 0, expected: 1 }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = factorial(c.input);
      const passed = act === c.expected;
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: \${act}\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'factorial' not in globals():
        raise NameError("Function factorial is not defined")
    cases = [
        { "input": 5, "expected": 120 },
        { "input": 0, "expected": 1 }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = factorial(c["input"])
            passed = act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 85,
        metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Good Runtime', style: 'Recursive' },
        suggestions: [
          'Recursive factorial is concise, but iterative solution avoids call-stack limits for large n.',
          'Validate the base case for n=0 explicitly.',
          'For languages without tail-call optimization, iterative loops are safer.'
        ],
        optimalExplanation: 'A factorial can be computed recursively with a simple base case, but iterative accumulation is more stack-safe for larger inputs.',
        optimalCode: `function factorial(n) {\n  let result = 1;\n  for (let i = 2; i <= n; i++) result *= i;\n  return result;\n}`
      }
    },
    {
      slug: 'highest-frequency',
      title: 'Highest Frequency',
      difficulty: ProblemDifficulty.easy,
      tags: ['Hash Table', 'Strings'],
      description: 'Find the most frequent character in a string and return it.',
      examples: [
        { input: '"aabbbcc"', output: '"b"' },
        { input: '"level"', output: '"l"' }
      ],
      sampleOutput: '"b"',
      sortOrder: 10,
      starterCode: {
        javascript: `// Return the most frequent character\nfunction highestFrequency(str) {\n  // Write your code here\n\n}`,
        python: `# Return the most frequent character\ndef highest_frequency(s):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nchar highestFrequency(const string &s) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `import java.util.*;\npublic class Main {\n    public static char highestFrequency(String s) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof highestFrequency !== 'function') throw new Error("Function highestFrequency is not defined");
  const cases = [
    { input: "aabbbcc", expected: "b" },
    { input: "level", expected: "l" }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = highestFrequency(c.input);
      const passed = act === c.expected;
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: "\${act}"\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'highest_frequency' not in globals() and 'highestFrequency' not in globals():
        raise NameError("Function highest_frequency or highestFrequency is not defined")
    func = highest_frequency if 'highest_frequency' in globals() else highestFrequency
    cases = [
        { "input": "aabbbcc", "expected": "b" },
        { "input": "level", "expected": "l" }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = func(c["input"])
            passed = act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: \\"{act}\\"")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 89,
        metrics: { complexity: 'O(N) Time • O(K) Space', performance: 'Strong Runtime', style: 'Practical' },
        suggestions: [
          'A frequency map is the canonical solution for highest-frequency character.',
          'Keep track of the current maximum as you build counts to avoid a second pass if desired.',
          'Decide how to break ties when multiple characters are equally frequent.'
        ],
        optimalExplanation: 'Track character counts in a hash map while iterating, then return the character with the highest count.',
        optimalCode: `function highestFrequency(str) {\n  const counts = {};\n  let maxChar = str[0];\n  for (const char of str) {\n    counts[char] = (counts[char] || 0) + 1;\n    if (counts[char] > counts[maxChar]) maxChar = char;\n  }\n  return maxChar;\n}`
      }
    },
    {
      slug: 'unique-chars',
      title: 'Unique Characters',
      difficulty: ProblemDifficulty.easy,
      tags: ['Strings', 'Hash Table'],
      description: 'Check whether a string has all unique characters.',
      examples: [
        { input: '"abc"', output: 'true' },
        { input: '"hello"', output: 'false' }
      ],
      sampleOutput: 'true',
      sortOrder: 11,
      starterCode: {
        javascript: `// Check if all characters are unique\nfunction hasUniqueChars(str) {\n  // Write your code here\n\n}`,
        python: `# Check if all characters are unique\ndef has_unique_chars(s):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nbool hasUniqueChars(const string &s) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `import java.util.*;\npublic class Main {\n    public static boolean hasUniqueChars(String s) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof hasUniqueChars !== 'function') throw new Error("Function hasUniqueChars is not defined");
  const cases = [
    { input: "abc", expected: true },
    { input: "hello", expected: false }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = hasUniqueChars(c.input);
      const passed = act === c.expected;
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: \${act}\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'has_unique_chars' not in globals() and 'hasUniqueChars' not in globals():
        raise NameError("Function has_unique_chars or hasUniqueChars is not defined")
    func = has_unique_chars if 'has_unique_chars' in globals() else hasUniqueChars
    cases = [
        { "input": "abc", "expected": True },
        { "input": "hello", "expected": False }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = func(c["input"])
            passed = act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 90,
        metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Fast Runtime', style: 'Simple' },
        suggestions: [
          'A set-based approach is ideal for verifying uniqueness in a single pass.',
          'Return false immediately when a duplicate is found.',
          'Consider whether the problem should ignore case or spaces in your implementation.'
        ],
        optimalExplanation: 'Use a set to record characters as you traverse the string; duplicates can be detected instantly.',
        optimalCode: `function hasUniqueChars(str) {\n  const seen = new Set();\n  for (const char of str) {\n    if (seen.has(char)) return false;\n    seen.add(char);\n  }\n  return true;\n}`
      }
    },
    {
      slug: 'count-vowels',
      title: 'Count Vowels',
      difficulty: ProblemDifficulty.easy,
      tags: ['Strings'],
      description: 'Count the number of vowels in a string.',
      examples: [
        { input: '"hello"', output: '2' },
        { input: '"Skillzy"', output: '1' }
      ],
      sampleOutput: '2',
      sortOrder: 12,
      starterCode: {
        javascript: `// Count vowels in a string\nfunction countVowels(str) {\n  // Write your code here\n\n}`,
        python: `# Count vowels in a string\ndef count_vowels(s):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint countVowels(const string &s) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `public class Main {\n    public static int countVowels(String s) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof countVowels !== 'function') throw new Error("Function countVowels is not defined");
  const cases = [
    { input: "hello", expected: 2 },
    { input: "Skillzy", expected: 1 }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = countVowels(c.input);
      const passed = act === c.expected;
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: \${act}\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'count_vowels' not in globals() and 'countVowels' not in globals():
        raise NameError("Function count_vowels or countVowels is not defined")
    func = count_vowels if 'count_vowels' in globals() else countVowels
    cases = [
        { "input": "hello", "expected": 2 },
        { "input": "Skillzy", "expected": 1 }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = func(c["input"])
            passed = act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 88,
        metrics: { complexity: 'O(N) Time • O(1) Space', performance: 'Excellent Runtime', style: 'Concise' },
        suggestions: [
          'Regular expressions make vowel counting compact and readable.',
          'Lowercasing once before counting reduces repeated conversions.',
          'Consider supporting both uppercase and lowercase vowels for robust input handling.'
        ],
        optimalExplanation: 'Count vowels by scanning the string once and incrementing for each character in the vowel set.',
        optimalCode: `function countVowels(str) {\n  return (str.match(/[aeiou]/gi) || []).length;\n}`
      }
    },
    {
      slug: 'second-largest',
      title: 'Second Largest Number',
      difficulty: ProblemDifficulty.easy,
      tags: ['Arrays', 'Math'],
      description: 'Return the second largest number from an unsorted array.',
      examples: [
        { input: '[2,7,11,15]', output: '11' },
        { input: '[5,5,4,3]', output: '4' }
      ],
      sampleOutput: '11',
      sortOrder: 13,
      starterCode: {
        javascript: `// Return the second largest number\nfunction secondLargest(nums) {\n  // Write your code here\n\n}`,
        python: `# Return the second largest number\ndef second_largest(nums):\n    # Write your code here\n    pass`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint secondLargest(const vector<int>& nums) {\n    // Write your code here\n\n}\n\nint main() {\n    return 0;\n}`,
        java: `import java.util.*;\npublic class Main {\n    public static int secondLargest(int[] nums) {\n        // Write your code here\n\n    }\n\n    public static void main(String[] args) {\n    }\n}`
      },
      testCode: {
        javascript: `
try {
  if (typeof secondLargest !== 'function') throw new Error("Function secondLargest is not defined");
  const cases = [
    { input: [2, 7, 11, 15], expected: 11 },
    { input: [5, 5, 4, 3], expected: 4 }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = secondLargest(c.input);
      const passed = act === c.expected;
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: \${act}\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: `
try:
    if 'second_largest' not in globals() and 'secondLargest' not in globals():
        raise NameError("Function second_largest or secondLargest is not defined")
    func = second_largest if 'second_largest' in globals() else secondLargest
    cases = [
        { "input": [2, 7, 11, 15], "expected": 11 },
        { "input": [5, 5, 4, 3], "expected": 4 }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = func(c["input"])
            passed = act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`,
        cpp: '',
        java: ''
      },
      aiFeedback: {
        score: 86,
        metrics: { complexity: 'O(N) Time • O(1) Space', performance: 'Efficient Runtime', style: 'Robust' },
        suggestions: [
          'Track both the largest and second-largest values in one pass.',
          'Handle duplicate maximum values carefully so the second largest is not the same as the maximum.',
          'Watch out for arrays with fewer than two distinct values depending on the prompt.'
        ],
        optimalExplanation: 'Keep the two highest distinct values while iterating the array once to find the second largest efficiently.',
        optimalCode: `function secondLargest(nums) {\n  let largest = -Infinity;\n  let second = -Infinity;\n  for (const num of nums) {\n    if (num > largest) {\n      second = largest;\n      largest = num;\n    } else if (num > second && num < largest) {\n      second = num;\n    }\n  }\n  return second;\n}`
      }
    }
  ];

  for (const prob of problems) {
    console.log(`Upserting coding problem: ${prob.title}...`);
    await prisma.codingProblem.upsert({
      where: { slug: prob.slug },
      update: {
        title: prob.title,
        difficulty: prob.difficulty,
        tags: prob.tags,
        description: prob.description,
        starterCode: prob.starterCode,
        testCode: prob.testCode,
        aiFeedback: prob.aiFeedback,
        examples: prob.examples,
        sampleOutput: prob.sampleOutput,
        sortOrder: prob.sortOrder,
      },
      create: {
        slug: prob.slug,
        title: prob.title,
        difficulty: prob.difficulty,
        tags: prob.tags,
        description: prob.description,
        starterCode: prob.starterCode,
        testCode: prob.testCode,
        aiFeedback: prob.aiFeedback,
        examples: prob.examples,
        sampleOutput: prob.sampleOutput,
        sortOrder: prob.sortOrder,
      }
    });
  }

  // 2. Update LessonStep records with their test cases
  const stepTests = [
    {
      title: 'Step 4: Interactive Architecture Quiz',
      testCode: {
        javascript: `
try {
  const { getClientRole, getHTTPMethodForCreation } = module.exports;
  if (typeof getClientRole !== 'function') throw new Error("getClientRole is not exported");
  if (typeof getHTTPMethodForCreation !== 'function') throw new Error("getHTTPMethodForCreation is not exported");
  
  const cases = [
    { fn: () => getClientRole(), expected: "render_ui", name: "getClientRole()" },
    { fn: () => getHTTPMethodForCreation(), expected: "POST", name: "getHTTPMethodForCreation()" }
  ];
  let passedCount = 0;
  cases.forEach((c, idx) => {
    try {
      const act = c.fn();
      const passed = act === c.expected;
      if (passed) passedCount++;
      console.log(\`[TEST_CASE] \${idx} | \${passed ? 'PASS' : 'FAIL'} | Actual: "\${act}"\`);
    } catch(e) {
      console.log(\`[TEST_CASE] \${idx} | FAIL | Actual: Error: \${e.message}\`);
    }
  });
  if (passedCount === cases.length) console.log(\`TEST_RESULTS: \${passedCount}/\${cases.length} passed\`);
  else console.log(\`TEST_FAILURE: \${cases.length - passedCount} test cases failed\`);
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: ''
      },
      examples: [
        { input: 'getClientRole()', output: '"render_ui"' },
        { input: 'getHTTPMethodForCreation()', output: '"POST"' }
      ]
    },
    {
      title: 'Step 3: Lab — Creating your first GET endpoint',
      testCode: {
        javascript: `
const http = require('http');
try {
  const { createExpressApp } = module.exports;
  if (typeof createExpressApp !== 'function') throw new Error("createExpressApp is not exported");
  const app = createExpressApp();
  const server = app.listen(0, () => {
    const port = server.address().port;
    http.get(\`http://localhost:\${port}/ping\`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        server.close();
        const passed = res.statusCode === 200 && data === 'pong';
        console.log(\`[TEST_CASE] 0 | \${passed ? 'PASS' : 'FAIL'} | Actual: "\${data}" (status \${res.statusCode})\`);
        if (passed) {
          console.log("TEST_RESULTS: 1/1 passed");
          process.exit(0);
        } else {
          console.log("TEST_FAILURE: Route /ping did not return 'pong'");
          process.exit(1);
        }
      });
    }).on('error', (err) => {
      server.close();
      console.log(\`[TEST_CASE] 0 | FAIL | Actual: Request Error: \${err.message}\`);
      console.log("TEST_FAILURE: HTTP Request failed");
      process.exit(1);
    });
  });
} catch (err) {
  console.error("TEST_FAILURE: " + err.message);
  process.exit(1);
}
`,
        python: ''
      },
      examples: [
        { input: 'GET /ping', output: '"pong" (HTTP status 200)' }
      ]
    },
    {
      title: 'Step 3: Lab — Implementing Binary Search',
      testCode: {
        javascript: '',
        python: `
try:
    if 'binary_search' not in globals():
        raise NameError("Function binary_search is not defined")
    cases = [
        { "arr": [1, 2, 3, 4, 5], "target": 3, "expected": 2 },
        { "arr": [1, 2, 3, 4, 5], "target": 6, "expected": -1 }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        try:
            act = binary_search(c["arr"], c["target"])
            passed = act == c["expected"]
            if passed: passed_count += 1
            print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
        except Exception as e:
            print(f"[TEST_CASE] {idx} | FAIL | Actual: Error: {str(e)}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as err:
    import sys
    print(f"TEST_FAILURE: {err}", file=sys.stderr)
    sys.exit(1)
`
      },
      examples: [
        { input: 'binary_search([1, 2, 3, 4, 5], 3)', output: '2' },
        { input: 'binary_search([1, 2, 3, 4, 5], 6)', output: '-1' }
      ]
    }
  ];

  for (const stepTest of stepTests) {
    console.log(`Updating LessonStep by title: "${stepTest.title}"...`);
    // Find the step by title
    const existingStep = await prisma.lessonStep.findFirst({
      where: { title: stepTest.title }
    });

    if (existingStep) {
      let updatedMetadata = existingStep.metadata as any;
      if (typeof updatedMetadata !== 'object' || updatedMetadata === null) {
        updatedMetadata = {};
      }
      updatedMetadata.examples = stepTest.examples;

      await prisma.lessonStep.update({
        where: { id: existingStep.id },
        data: {
          labTestCode: stepTest.testCode,
          metadata: updatedMetadata
        }
      });
      console.log(`Successfully updated LessonStep: ${existingStep.id}`);
    } else {
      console.warn(`LessonStep with title "${stepTest.title}" not found in DB, skipping update.`);
    }
  }

  console.log('🌱 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
