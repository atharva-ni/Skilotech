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
        { input: '"hello"', output: '"olleh"', explanation: 'The characters of "hello" reversed give "olleh".' },
        { input: '"Skilotech"', output: '"hcetolikS"', explanation: 'Case is preserved when reversing.' }
      ],
      constraints: [
        '1 <= str.length <= 10^5',
        'str consists of printable ASCII characters'
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
    { input: "Skilotech", expected: "hcetolikS" }
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
        { "input": "Skilotech", "expected": "hcetolikS" }
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
        cpp: `int main() {\n    struct TestCase { std::string input; std::string expected; };\n    std::vector<TestCase> cases = {\n        { "hello", "olleh" },\n        { "Skilotech", "hcetolikS" }\n    };\n    int passedCount = 0;\n    for (int i = 0; i < cases.size(); i++) {\n        std::string act = reverseString(cases[i].input);\n        bool passed = act == cases[i].expected;\n        if (passed) passedCount++;\n        std::cout << "[TEST_CASE] " << i << " | " << (passed ? "PASS" : "FAIL") << " | Actual: \"" << act << "\"\n";\n    }\n    if (passedCount == cases.size()) std::cout << "TEST_RESULTS: " << passedCount << "/" << cases.size() << " passed\n";\n    else std::cout << "TEST_FAILURE: " << (cases.size() - passedCount) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        String[] inputs = { "hello", "Skilotech" };\n        String[] expecteds = { "olleh", "hcetolikS" };\n        int passedCount = 0;\n        for (int i = 0; i < inputs.length; i++) {\n            try {\n                String act = StudentSolution.reverseString(inputs[i]);\n                boolean passed = act != null && act.equals(expecteds[i]);\n                if (passed) passedCount++;\n                System.out.println("[TEST_CASE] " + i + " | " + (passed ? "PASS" : "FAIL") + " | Actual: \"" + act + "\"");\n            } catch (Exception e) {\n                System.out.println("[TEST_CASE] " + i + " | FAIL | Actual: Error: " + e.getMessage());\n            }\n        }\n        if (passedCount == inputs.length) System.out.println("TEST_RESULTS: " + passedCount + "/" + inputs.length + " passed");\n        else System.out.println("TEST_FAILURE: " + (inputs.length - passedCount) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 94,
        metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Excellent Runtime', style: 'Highly Readable' },
        suggestions: [
          'To reverse a sequence of elements without using built-in methods, you can swap elements from both ends moving towards the center.',
          'For example, if you have an array [A, B, C, D], you swap A and D to get [D, B, C, A], then swap B and C to get [D, C, B, A]. This works similarly for characters in a string.',
          'Good use of native JavaScript methods (`split`, `reverse`, `join`) which execute rapidly.',
          'Note: This creates an intermediate array of size N, resulting O(N) auxiliary space complexity. To optimize to O(1) auxiliary space, reverse the string in-place using a two-pointer swaps technique.'
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
        { input: '"Racecar"', output: 'true', explanation: '"racecar" reads the same forward and backward.' },
        { input: '"A man, a plan, a canal: Panama"', output: 'true', explanation: 'After removing non-alphanumeric characters and lowercasing: "amanaplanacanalpanama" is a palindrome.' }
      ],
      constraints: [
        '1 <= str.length <= 2 * 10^5',
        'str consists of printable ASCII characters'
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
        cpp: `int main() {\n    struct TestCase { std::string input; bool expected; };\n    std::vector<TestCase> cases = {\n        { "racecar", true },\n        { "hello", false }\n    };\n    int passedCount = 0;\n    for (int i = 0; i < cases.size(); i++) {\n        bool act = isPalindrome(cases[i].input);\n        bool passed = act == cases[i].expected;\n        if (passed) passedCount++;\n        std::cout << "[TEST_CASE] " << i << " | " << (passed ? "PASS" : "FAIL") << " | Actual: " << (act ? "true" : "false") << "\n";\n    }\n    if (passedCount == cases.size()) std::cout << "TEST_RESULTS: " << passedCount << "/" << cases.size() << " passed\n";\n    else std::cout << "TEST_FAILURE: " << (cases.size() - passedCount) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        String[] inputs = { "racecar", "hello" };\n        boolean[] expecteds = { true, false };\n        int passedCount = 0;\n        for (int i = 0; i < inputs.length; i++) {\n            try {\n                boolean act = StudentSolution.isPalindrome(inputs[i]);\n                boolean passed = act == expecteds[i];\n                if (passed) passedCount++;\n                System.out.println("[TEST_CASE] " + i + " | " + (passed ? "PASS" : "FAIL") + " | Actual: " + act);\n            } catch (Exception e) {\n                System.out.println("[TEST_CASE] " + i + " | FAIL | Actual: Error: " + e.getMessage());\n            }\n        }\n        if (passedCount == inputs.length) System.out.println("TEST_RESULTS: " + passedCount + "/" + inputs.length + " passed");\n        else System.out.println("TEST_FAILURE: " + (inputs.length - passedCount) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 91,
        metrics: { complexity: 'O(N) Time • O(1) Extra Space', performance: 'Very Good Runtime', style: 'Clear and Concise' },
        suggestions: [
          'To check symmetry, you can use two pointers moving from opposite ends.',
          'For example, in the word "radar", the first and last letters are both "r". The second and fourth are both "a". If they ever mismatch, it is not symmetric. This lets you determine palindrome status in one pass.',
          'Filtering non-alphanumeric characters before comparison keeps the logic robust against punctuation.',
          'A two-pointer approach can avoid creating a reversed copy of the string and reduce memory usage.'
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
        { input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]', explanation: '3 is a multiple of 3 → "Fizz", 5 is a multiple of 5 → "Buzz".' },
        { input: 'n = 15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', explanation: '15 is divisible by both 3 and 5 → "FizzBuzz".' }
      ],
      constraints: [
        '1 <= n <= 10^4'
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
        cpp: `int main() {\n    std::vector<std::string> expected1 = { "1", "2", "Fizz", "4", "Buzz" };\n    std::vector<std::string> act1 = fizzBuzz(5);\n    bool p1 = act1 == expected1;\n    std::cout << "[TEST_CASE] 0 | " << (p1 ? "PASS" : "FAIL") << " | Actual: size=" << act1.size() << "\n";\n    \n    std::vector<std::string> act2 = fizzBuzz(15);\n    bool p2 = act2.size() >= 15 && act2[14] == "FizzBuzz";\n    std::cout << "[TEST_CASE] 1 | " << (p2 ? "PASS" : "FAIL") << " | Actual: 15th=" << (act2.size() >= 15 ? act2[14] : "N/A") << "\n";\n    \n    int passed = (p1 ? 1 : 0) + (p2 ? 1 : 0);\n    if (passed == 2) std::cout << "TEST_RESULTS: 2/2 passed\n";\n    else std::cout << "TEST_FAILURE: " << (2 - passed) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        int passed = 0;\n        try {\n            java.util.List<String> act1 = StudentSolution.fizzBuzz(5);\n            boolean p1 = act1 != null && act1.size() == 5 && act1.get(2).equals("Fizz") && act1.get(4).equals("Buzz");\n            if (p1) passed++;\n            System.out.println("[TEST_CASE] 0 | " + (p1 ? "PASS" : "FAIL") + " | Actual: size=" + (act1 != null ? act1.size() : "null"));\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 0 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        try {\n            java.util.List<String> act2 = StudentSolution.fizzBuzz(15);\n            boolean p2 = act2 != null && act2.size() == 15 && act2.get(14).equals("FizzBuzz");\n            if (p2) passed++;\n            System.out.println("[TEST_CASE] 1 | " + (p2 ? "PASS" : "FAIL") + " | Actual: 15th=" + (act2 != null && act2.size() >= 15 ? act2.get(14) : "N/A"));\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 1 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        if (passed == 2) System.out.println("TEST_RESULTS: 2/2 passed");\n        else System.out.println("TEST_FAILURE: " + (2 - passed) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 89,
        metrics: { complexity: 'O(N) Time • O(1) Space', performance: 'Strong Runtime', style: 'Well-Structured' },
        suggestions: [
          'Order of checks is critical here. Think of a condition like checking if a number is divisible by 15.',
          'Since 15 is divisible by both 3 and 5, checking for 15 first prevents a number like 15 from mistakenly outputting "Fizz" or "Buzz" instead of "FizzBuzz".',
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
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
        { input: 'nums = [3,3], target = 6', output: '[0,1]' }
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.'
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
        cpp: `int main() {\n    std::vector<int> nums1 = {2, 7, 11, 15};\n    std::vector<int> act1 = twoSum(nums1, 9);\n    std::sort(act1.begin(), act1.end());\n    bool p1 = act1.size() == 2 && act1[0] == 0 && act1[1] == 1;\n    std::cout << "[TEST_CASE] 0 | " << (p1 ? "PASS" : "FAIL") << " | Actual: size=" << act1.size() << "\n";\n\n    std::vector<int> nums2 = {3, 2, 4};\n    std::vector<int> act2 = twoSum(nums2, 6);\n    std::sort(act2.begin(), act2.end());\n    bool p2 = act2.size() == 2 && act2[0] == 1 && act2[1] == 2;\n    std::cout << "[TEST_CASE] 1 | " << (p2 ? "PASS" : "FAIL") << " | Actual: size=" << act2.size() << "\n";\n\n    int passed = (p1 ? 1 : 0) + (p2 ? 1 : 0);\n    if (passed == 2) std::cout << "TEST_RESULTS: 2/2 passed\n";\n    else std::cout << "TEST_FAILURE: " << (2 - passed) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        int passed = 0;\n        try {\n            int[] nums1 = {2, 7, 11, 15};\n            int[] act1 = StudentSolution.twoSum(nums1, 9);\n            java.util.Arrays.sort(act1);\n            boolean p1 = act1 != null && act1.length == 2 && act1[0] == 0 && act1[1] == 1;\n            if (p1) passed++;\n            System.out.println("[TEST_CASE] 0 | " + (p1 ? "PASS" : "FAIL") + " | Actual: length=" + (act1 != null ? act1.length : "null"));\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 0 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        try {\n            int[] nums2 = {3, 2, 4};\n            int[] act2 = StudentSolution.twoSum(nums2, 6);\n            java.util.Arrays.sort(act2);\n            boolean p2 = act2 != null && act2.length == 2 && act2[0] == 1 && act2[1] == 2;\n            if (p2) passed++;\n            System.out.println("[TEST_CASE] 1 | " + (p2 ? "PASS" : "FAIL") + " | Actual: length=" + (act2 != null ? act2.length : "null"));\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 1 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        if (passed == 2) System.out.println("TEST_RESULTS: 2/2 passed");\n        else System.out.println("TEST_FAILURE: " + (2 - passed) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 92,
        metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Excellent Runtime', style: 'Interview Ready' },
        suggestions: [
          'Instead of searching every pair with nested loops, you can remember values you have seen.',
          'For example, if target is 10 and you see 3, you know you need 7. By storing each visited number and its index in a dictionary/map as you go, you can check if the complement 7 was already seen in a single step.',
          'Using a hash table avoids the quadratic search of every pair.',
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
      description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
      examples: [
        { input: 's = "listen", t = "silent"', output: 'true', explanation: '"silent" uses the exact same letters as "listen".' },
        { input: 's = "hello", t = "bello"', output: 'false', explanation: '"bello" contains \'b\' which is not in "hello".' }
      ],
      constraints: [
        '1 <= s.length, t.length <= 5 * 10^4',
        's and t consist of lowercase English letters'
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
        cpp: `int main() {\n    bool act1 = isAnagram("listen", "silent");\n    bool act2 = isAnagram("hello", "billion");\n    bool p1 = act1 == true;\n    bool p2 = act2 == false;\n    std::cout << "[TEST_CASE] 0 | " << (p1 ? "PASS" : "FAIL") << " | Actual: " << (act1 ? "true" : "false") << "\n";\n    std::cout << "[TEST_CASE] 1 | " << (p2 ? "PASS" : "FAIL") << " | Actual: " << (act2 ? "true" : "false") << "\n";\n    int passed = (p1 ? 1 : 0) + (p2 ? 1 : 0);\n    if (passed == 2) std::cout << "TEST_RESULTS: 2/2 passed\n";\n    else std::cout << "TEST_FAILURE: " << (2 - passed) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        int passed = 0;\n        try {\n            boolean act1 = StudentSolution.isAnagram("listen", "silent");\n            boolean p1 = act1 == true;\n            if (p1) passed++;\n            System.out.println("[TEST_CASE] 0 | " + (p1 ? "PASS" : "FAIL") + " | Actual: " + act1);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 0 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        try {\n            boolean act2 = StudentSolution.isAnagram("hello", "billion");\n            boolean p2 = act2 == false;\n            if (p2) passed++;\n            System.out.println("[TEST_CASE] 1 | " + (p2 ? "PASS" : "FAIL") + " | Actual: " + act2);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 1 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        if (passed == 2) System.out.println("TEST_RESULTS: 2/2 passed");\n        else System.out.println("TEST_FAILURE: " + (2 - passed) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 90,
        metrics: { complexity: 'O(N log N) Time • O(1) Extra Space', performance: 'Very Good Runtime', style: 'Straightforward' },
        suggestions: [
          'An anagram check is like checking if two recipes have the exact same ingredients in the exact same amounts.',
          'For example, for "listen" and "silent", count the frequency of each letter. Both contain one "l", one "i", one "s", one "t", one "e", one "n". A hash table/object is perfect for tracking these counts.',
          'Sorting both strings is a simple solution, but a character count is more efficient in practice.',
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
      description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
      examples: [
        { input: 's = "()[]{}"', output: 'true' },
        { input: 's = "([)]"', output: 'false', explanation: 'The bracket \'[\' is closed by \')\' instead of \']\'.' },
        { input: 's = "{[]}"', output: 'true' }
      ],
      constraints: [
        '1 <= s.length <= 10^4',
        's consists of parentheses only: \'()[]{}\'' 
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
        cpp: `int main() {\n    bool act1 = isBalanced("{[()]}");\n    bool act2 = isBalanced("{[(])}");\n    bool p1 = act1 == true;\n    bool p2 = act2 == false;\n    std::cout << "[TEST_CASE] 0 | " << (p1 ? "PASS" : "FAIL") << " | Actual: " << (act1 ? "true" : "false") << "\n";\n    std::cout << "[TEST_CASE] 1 | " << (p2 ? "PASS" : "FAIL") << " | Actual: " << (act2 ? "true" : "false") << "\n";\n    int passed = (p1 ? 1 : 0) + (p2 ? 1 : 0);\n    if (passed == 2) std::cout << "TEST_RESULTS: 2/2 passed\n";\n    else std::cout << "TEST_FAILURE: " << (2 - passed) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        int passed = 0;\n        try {\n            boolean act1 = StudentSolution.isBalanced("{[()]}");\n            boolean p1 = act1 == true;\n            if (p1) passed++;\n            System.out.println("[TEST_CASE] 0 | " + (p1 ? "PASS" : "FAIL") + " | Actual: " + act1);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 0 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        try {\n            boolean act2 = StudentSolution.isBalanced("{[(])}");\n            boolean p2 = act2 == false;\n            if (p2) passed++;\n            System.out.println("[TEST_CASE] 1 | " + (p2 ? "PASS" : "FAIL") + " | Actual: " + act2);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 1 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        if (passed == 2) System.out.println("TEST_RESULTS: 2/2 passed");\n        else System.out.println("TEST_FAILURE: " + (2 - passed) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 88,
        metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Solid Runtime', style: 'Robust' },
        suggestions: [
          'Use a stack structure to track openings. Think of it like cafeteria trays: the last one put on is the first one taken off.',
          'When you see a closing bracket like }, it must match the most recently opened bracket at the top of your stack (e.g. {). If it matches, pop it; if it doesn\'t or the stack is empty, it is unbalanced.',
          'A stack is the canonical approach for balanced bracket validation.',
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
      description: 'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order. Merge nums1 and nums2 into a single array sorted in non-decreasing order and return it.',
      examples: [
        { input: 'nums1 = [1,3,5], nums2 = [2,4,6]', output: '[1,2,3,4,5,6]', explanation: 'The arrays we are merging are [1,3,5] and [2,4,6]. The result of the merge is [1,2,3,4,5,6].' },
        { input: 'nums1 = [0], nums2 = [0,1]', output: '[0,0,1]' }
      ],
      constraints: [
        '0 <= nums1.length, nums2.length <= 200',
        '-10^9 <= nums1[i], nums2[i] <= 10^9',
        'nums1 and nums2 are sorted in non-decreasing order'
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
        cpp: `int main() {\n    std::vector<int> a = {1, 3, 5};\n    std::vector<int> b = {2, 4, 6};\n    std::vector<int> expected = {1, 2, 3, 4, 5, 6};\n    std::vector<int> act = mergeSorted(a, b);\n    bool p1 = act == expected;\n    std::cout << "[TEST_CASE] 0 | " << (p1 ? "PASS" : "FAIL") << " | Actual: size=" << act.size() << "\n";\n    if (p1) std::cout << "TEST_RESULTS: 1/1 passed\n";\n    else std::cout << "TEST_FAILURE: 1 test case failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        int passed = 0;\n        try {\n            int[] a = {1, 3, 5};\n            int[] b = {2, 4, 6};\n            int[] expected = {1, 2, 3, 4, 5, 6};\n            int[] act = StudentSolution.mergeSorted(a, b);\n            boolean p1 = java.util.Arrays.equals(act, expected);\n            if (p1) passed++;\n            System.out.println("[TEST_CASE] 0 | " + (p1 ? "PASS" : "FAIL") + " | Actual: size=" + (act != null ? act.length : "null"));\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 0 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        if (passed == 1) System.out.println("TEST_RESULTS: 1/1 passed");\n        else System.out.println("TEST_FAILURE: 1 test case failed");\n    }\n}`
      },
      aiFeedback: {
        score: 90,
        metrics: { complexity: 'O(N + M) Time • O(N + M) Space', performance: 'Efficient Runtime', style: 'Clean' },
        suggestions: [
          'Compare elements from both arrays using two markers.',
          'For example, if comparing [1, 5] and [2, 6], compare 1 and 2 (pick 1), then compare 5 and 2 (pick 2), then 5 and 6 (pick 5). This builds a single sorted list efficiently without re-sorting.',
          'Two-pointer merging is the simplest and fastest way to combine sorted arrays.',
          'Avoid extra sorting by preserving the order while copying the remaining elements.'
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
      description: 'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is:\n\nF(0) = 0, F(1) = 1\nF(n) = F(n - 1) + F(n - 2), for n > 1\n\nGiven n, calculate F(n).',
      examples: [
        { input: 'n = 2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.' },
        { input: 'n = 5', output: '5', explanation: 'F(5) = F(4) + F(3) = 3 + 2 = 5.' },
        { input: 'n = 10', output: '55' }
      ],
      constraints: [
        '0 <= n <= 30'
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
        cpp: `int main() {\n    int act1 = fibonacci(5);\n    int act2 = fibonacci(10);\n    bool p1 = act1 == 5;\n    bool p2 = act2 == 55;\n    std::cout << "[TEST_CASE] 0 | " << (p1 ? "PASS" : "FAIL") << " | Actual: " << act1 << "\n";\n    std::cout << "[TEST_CASE] 1 | " << (p2 ? "PASS" : "FAIL") << " | Actual: " << act2 << "\n";\n    int passed = (p1 ? 1 : 0) + (p2 ? 1 : 0);\n    if (passed == 2) std::cout << "TEST_RESULTS: 2/2 passed\n";\n    else std::cout << "TEST_FAILURE: " << (2 - passed) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        int passed = 0;\n        try {\n            int act1 = StudentSolution.fibonacci(5);\n            boolean p1 = act1 == 5;\n            if (p1) passed++;\n            System.out.println("[TEST_CASE] 0 | " + (p1 ? "PASS" : "FAIL") + " | Actual: " + act1);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 0 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        try {\n            int act2 = StudentSolution.fibonacci(10);\n            boolean p2 = act2 == 55;\n            if (p2) passed++;\n            System.out.println("[TEST_CASE] 1 | " + (p2 ? "PASS" : "FAIL") + " | Actual: " + act2);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 1 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        if (passed == 2) System.out.println("TEST_RESULTS: 2/2 passed");\n        else System.out.println("TEST_FAILURE: " + (2 - passed) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 87,
        metrics: { complexity: 'O(N) Time • O(1) Space', performance: 'Good Runtime', style: 'Iterative' },
        suggestions: [
          'Instead of repeatedly recalculating values, you can build up from the bottom.',
          'For example, F(2) = F(1) + F(0) = 1 + 0 = 1. F(3) = F(2) + F(1) = 1 + 1 = 2. F(4) = F(3) + F(2) = 2 + 1 = 3. By keeping track of just the last two calculated numbers in variables, you avoid duplicate recursion.',
          'An iterative approach avoids recursion depth issues for larger n.',
          'Use constant memory by tracking only the last two Fibonacci numbers.'
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
      description: 'Given a non-negative integer n, compute and return n! (n factorial).\n\nThe factorial of n is the product of all positive integers less than or equal to n. By convention, 0! = 1.',
      examples: [
        { input: 'n = 5', output: '120', explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120.' },
        { input: 'n = 0', output: '1', explanation: 'By convention, 0! is defined as 1.' }
      ],
      constraints: [
        '0 <= n <= 20',
        'The answer is guaranteed to fit in a 64-bit integer'
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
        cpp: `int main() {\n    int act1 = factorial(5);\n    int act2 = factorial(0);\n    bool p1 = act1 == 120;\n    bool p2 = act2 == 1;\n    std::cout << "[TEST_CASE] 0 | " << (p1 ? "PASS" : "FAIL") << " | Actual: " << act1 << "\n";\n    std::cout << "[TEST_CASE] 1 | " << (p2 ? "PASS" : "FAIL") << " | Actual: " << act2 << "\n";\n    int passed = (p1 ? 1 : 0) + (p2 ? 1 : 0);\n    if (passed == 2) std::cout << "TEST_RESULTS: 2/2 passed\n";\n    else std::cout << "TEST_FAILURE: " << (2 - passed) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        int passed = 0;\n        try {\n            int act1 = StudentSolution.factorial(5);\n            boolean p1 = act1 == 120;\n            if (p1) passed++;\n            System.out.println("[TEST_CASE] 0 | " + (p1 ? "PASS" : "FAIL") + " | Actual: " + act1);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 0 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        try {\n            int act2 = StudentSolution.factorial(0);\n            boolean p2 = act2 == 1;\n            if (p2) passed++;\n            System.out.println("[TEST_CASE] 1 | " + (p2 ? "PASS" : "FAIL") + " | Actual: " + act2);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 1 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        if (passed == 2) System.out.println("TEST_RESULTS: 2/2 passed");\n        else System.out.println("TEST_FAILURE: " + (2 - passed) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 85,
        metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Good Runtime', style: 'Recursive' },
        suggestions: [
          'A factorial calculates the product of decreasing numbers.',
          'For example, 4! = 4 * 3 * 2 * 1 = 24. You can calculate this by running a loop that multiplies a running product starting from 1 up to n.',
          'Recursive factorial is concise, but iterative solution avoids call-stack limits for large n.',
          'Validate the base case for n=0 explicitly.'
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
      description: 'Given a string s, return the character that appears most frequently. If there are multiple characters with the same highest frequency, return the one that appears first.',
      examples: [
        { input: 's = "aabbbcc"', output: '"b"', explanation: '\'b\' appears 3 times, which is more than any other character.' },
        { input: 's = "level"', output: '"l"', explanation: '\'l\' and \'e\' both appear 2 times, but \'l\' appears first.' }
      ],
      constraints: [
        '1 <= s.length <= 10^5',
        's consists of lowercase English letters'
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
        cpp: `int main() {\n    char act1 = highestFrequency("aabbbcc");\n    char act2 = highestFrequency("level");\n    bool p1 = act1 == 'b';\n    bool p2 = act2 == 'l' || act2 == 'e';\n    std::cout << "[TEST_CASE] 0 | " << (p1 ? "PASS" : "FAIL") << " | Actual: \"" << act1 << "\"\n";\n    std::cout << "[TEST_CASE] 1 | " << (p2 ? "PASS" : "FAIL") << " | Actual: \"" << act2 << "\"\n";\n    int passed = (p1 ? 1 : 0) + (p2 ? 1 : 0);\n    if (passed == 2) std::cout << "TEST_RESULTS: 2/2 passed\n";\n    else std::cout << "TEST_FAILURE: " << (2 - passed) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        int passed = 0;\n        try {\n            char act1 = StudentSolution.highestFrequency("aabbbcc");\n            boolean p1 = act1 == 'b';\n            if (p1) passed++;\n            System.out.println("[TEST_CASE] 0 | " + (p1 ? "PASS" : "FAIL") + " | Actual: \"" + act1 + "\"");\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 0 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        try {\n            char act2 = StudentSolution.highestFrequency("level");\n            boolean p2 = act2 == 'l' || act2 == 'e';\n            if (p2) passed++;\n            System.out.println("[TEST_CASE] 1 | " + (p2 ? "PASS" : "FAIL") + " | Actual: \"" + act2 + "\"");\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 1 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        if (passed == 2) System.out.println("TEST_RESULTS: 2/2 passed");\n        else System.out.println("TEST_FAILURE: " + (2 - passed) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 89,
        metrics: { complexity: 'O(N) Time • O(K) Space', performance: 'Strong Runtime', style: 'Practical' },
        suggestions: [
          'Use a frequency table to count occurrences.',
          'For example, in "success", "s" appears 3 times, "u" 1 time, "c" 2 times, and "e" 1 time. Walk through the string, update your counts in a hash map, and keep track of which character has reached the highest count so far.',
          'A frequency map is the canonical solution for highest-frequency character.',
          'Keep track of the current maximum as you build counts to avoid a second pass if desired.'
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
      description: 'Implement a function that determines if a string has all unique characters. Return true if all characters are distinct, false otherwise.',
      examples: [
        { input: 's = "abc"', output: 'true', explanation: 'All characters a, b, c are unique.' },
        { input: 's = "hello"', output: 'false', explanation: 'The character \'l\' appears more than once.' }
      ],
      constraints: [
        '0 <= s.length <= 10^5',
        's consists of printable ASCII characters'
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
        cpp: `int main() {\n    bool act1 = hasUniqueChars("abcdef");\n    bool act2 = hasUniqueChars("abcdea");\n    bool p1 = act1 == true;\n    bool p2 = act2 == false;\n    std::cout << "[TEST_CASE] 0 | " << (p1 ? "PASS" : "FAIL") << " | Actual: " << (act1 ? "true" : "false") << "\n";\n    std::cout << "[TEST_CASE] 1 | " << (p2 ? "PASS" : "FAIL") << " | Actual: " << (act2 ? "true" : "false") << "\n";\n    int passed = (p1 ? 1 : 0) + (p2 ? 1 : 0);\n    if (passed == 2) std::cout << "TEST_RESULTS: 2/2 passed\n";\n    else std::cout << "TEST_FAILURE: " << (2 - passed) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        int passed = 0;\n        try {\n            boolean act1 = StudentSolution.hasUniqueChars("abcdef");\n            boolean p1 = act1 == true;\n            if (p1) passed++;\n            System.out.println("[TEST_CASE] 0 | " + (p1 ? "PASS" : "FAIL") + " | Actual: " + act1);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 0 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        try {\n            boolean act2 = StudentSolution.hasUniqueChars("abcdea");\n            boolean p2 = act2 == false;\n            if (p2) passed++;\n            System.out.println("[TEST_CASE] 1 | " + (p2 ? "PASS" : "FAIL") + " | Actual: " + act2);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 1 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        if (passed == 2) System.out.println("TEST_RESULTS: 2/2 passed");\n        else System.out.println("TEST_FAILURE: " + (2 - passed) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 90,
        metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Fast Runtime', style: 'Simple' },
        suggestions: [
          'A Set is a collection that stores unique items.',
          'If you add characters from "hello" one by one to a set: "h", "e", "l" are added. When you try to add the second "l", you find it is already in the set, proving the string has duplicate characters.',
          'A set-based approach is ideal for verifying uniqueness in a single pass.',
          'Return false immediately when a duplicate is found.'
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
      description: 'Given a string s, count and return the total number of vowels (a, e, i, o, u) in the string. Both uppercase and lowercase vowels should be counted.',
      examples: [
        { input: 's = "hello"', output: '2', explanation: 'The vowels are \'e\' and \'o\', totaling 2.' },
        { input: 's = "Skilotech"', output: '3', explanation: 'The vowels are \'i\', \'o\', and \'e\'.' }
      ],
      constraints: [
        '0 <= s.length <= 10^5',
        's consists of English letters (both upper and lowercase)'
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
    { input: "Skilotech", expected: 3 }
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
        { "input": "Skilotech", "expected": 3 }
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
        cpp: `int main() {\n    int act1 = countVowels("hello");\n    int act2 = countVowels("xyz");\n    bool p1 = act1 == 2;\n    bool p2 = act2 == 0;\n    std::cout << "[TEST_CASE] 0 | " << (p1 ? "PASS" : "FAIL") << " | Actual: " << act1 << "\n";\n    std::cout << "[TEST_CASE] 1 | " << (p2 ? "PASS" : "FAIL") << " | Actual: " << act2 << "\n";\n    int passed = (p1 ? 1 : 0) + (p2 ? 1 : 0);\n    if (passed == 2) std::cout << "TEST_RESULTS: 2/2 passed\n";\n    else std::cout << "TEST_FAILURE: " << (2 - passed) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        int passed = 0;\n        try {\n            int act1 = StudentSolution.countVowels("hello");\n            boolean p1 = act1 == 2;\n            if (p1) passed++;\n            System.out.println("[TEST_CASE] 0 | " + (p1 ? "PASS" : "FAIL") + " | Actual: " + act1);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 0 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        try {\n            int act2 = StudentSolution.countVowels("xyz");\n            boolean p2 = act2 == 0;\n            if (p2) passed++;\n            System.out.println("[TEST_CASE] 1 | " + (p2 ? "PASS" : "FAIL") + " | Actual: " + act2);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 1 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        if (passed == 2) System.out.println("TEST_RESULTS: 2/2 passed");\n        else System.out.println("TEST_FAILURE: " + (2 - passed) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 88,
        metrics: { complexity: 'O(N) Time • O(1) Space', performance: 'Excellent Runtime', style: 'Concise' },
        suggestions: [
          'Loop through each character and check if it belongs to the set of vowels (a, e, i, o, u, A, E, I, O, U).',
          'You can do this with an array lookup or a string index check for each letter, incrementing a count whenever a match is found.',
          'Regular expressions make vowel counting compact and readable.',
          'Lowercasing once before counting reduces repeated conversions.'
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
      description: 'Given an integer array nums, return the second largest distinct number in the array. You may assume the array always contains at least two distinct values.',
      examples: [
        { input: 'nums = [2,7,11,15]', output: '11', explanation: 'The largest is 15 and the second largest is 11.' },
        { input: 'nums = [5,5,4,3]', output: '4', explanation: 'The largest distinct value is 5, the second largest distinct value is 4.' }
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        'The array contains at least two distinct values'
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
        cpp: `int main() {\n    std::vector<int> nums1 = {10, 5, 20, 20, 15};\n    std::vector<int> nums2 = {1, 2, 3};\n    int act1 = secondLargest(nums1);\n    int act2 = secondLargest(nums2);\n    bool p1 = act1 == 15;\n    bool p2 = act2 == 2;\n    std::cout << "[TEST_CASE] 0 | " << (p1 ? "PASS" : "FAIL") << " | Actual: " << act1 << "\n";\n    std::cout << "[TEST_CASE] 1 | " << (p2 ? "PASS" : "FAIL") << " | Actual: " << act2 << "\n";\n    int passed = (p1 ? 1 : 0) + (p2 ? 1 : 0);\n    if (passed == 2) std::cout << "TEST_RESULTS: 2/2 passed\n";\n    else std::cout << "TEST_FAILURE: " << (2 - passed) << " test cases failed\n";\n    return 0;\n}`,
        java: `public class Main {\n    public static void main(String[] args) {\n        int passed = 0;\n        try {\n            int[] nums1 = {10, 5, 20, 20, 15};\n            int act1 = StudentSolution.secondLargest(nums1);\n            boolean p1 = act1 == 15;\n            if (p1) passed++;\n            System.out.println("[TEST_CASE] 0 | " + (p1 ? "PASS" : "FAIL") + " | Actual: " + act1);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 0 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        try {\n            int[] nums2 = {1, 2, 3};\n            int act2 = StudentSolution.secondLargest(nums2);\n            boolean p2 = act2 == 2;\n            if (p2) passed++;\n            System.out.println("[TEST_CASE] 1 | " + (p2 ? "PASS" : "FAIL") + " | Actual: " + act2);\n        } catch (Exception e) {\n            System.out.println("[TEST_CASE] 1 | FAIL | Actual: Error: " + e.getMessage());\n        }\n        if (passed == 2) System.out.println("TEST_RESULTS: 2/2 passed");\n        else System.out.println("TEST_FAILURE: " + (2 - passed) + " test cases failed");\n    }\n}`
      },
      aiFeedback: {
        score: 86,
        metrics: { complexity: 'O(N) Time • O(1) Space', performance: 'Efficient Runtime', style: 'Robust' },
        suggestions: [
          'Keep track of two variables: largest and secondLargest.',
          'As you look at each number, if it is larger than largest, then the previous largest becomes the new secondLargest, and the current number becomes the new largest.',
          'If it is only larger than secondLargest (but smaller than largest), update only secondLargest.',
          'Track both the largest and second-largest values in one pass.'
        ],
        optimalExplanation: 'Keep the two highest distinct values while iterating the array once to find the second largest efficiently.',
        optimalCode: `function secondLargest(nums) {\n  let largest = -Infinity;\n  let second = -Infinity;\n  for (const num of nums) {\n    if (num > largest) {\n      second = largest;\n      largest = num;\n    } else if (num > second && num < largest) {\n      second = num;\n    }\n  }\n  return second;\n}`
      }
    }
  ];

  // 1. Standalone Coding Problems
  const instructor = await prisma.user.findFirst({
    where: { role: 'instructor' }
  });
  if (instructor) {
    const courseId = 'coding-practice-lab';
    await prisma.course.upsert({
      where: { id: courseId },
      update: {},
      create: {
        id: courseId,
        title: 'Coding Labs Practice',
        slug: 'coding-labs-practice',
        description: 'Practice challenges for coding labs',
        instructorId: instructor.id,
        status: 'published',
      }
    });
  }

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
        aiFeedback: prob.aiFeedback || {},
        examples: prob.examples,
        constraints: prob.constraints || [],
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
        aiFeedback: prob.aiFeedback || {},
        examples: prob.examples,
        constraints: prob.constraints || [],
        sampleOutput: prob.sampleOutput,
        sortOrder: prob.sortOrder,
      }
    });

    if (instructor) {
      await prisma.assignment.upsert({
        where: { id: prob.slug },
        update: {
          title: prob.title,
          description: prob.description,
        },
        create: {
          id: prob.slug,
          courseId: 'coding-practice-lab',
          title: prob.title,
          description: prob.description,
          assignmentType: 'coding',
          status: 'active',
          maxScore: 100,
        }
      });
    }
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
