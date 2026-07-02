'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

interface AiFeedbackType {
  score: number;
  metrics: { complexity: string; performance: string; style: string };
  suggestions: string[];
  optimalCode?: string;
  optimalExplanation?: string;
}

const codingProblems = [
  {
    id: 'reverse',
    title: 'String Reversal',
    difficulty: 'Easy',
    tags: ['Algorithms'],
    description: 'Write a function reverseString(str) that takes a string as input and returns the string reversed.',
    examples: [
      { input: '"hello"', output: '"olleh"' },
      { input: '"Skillzy"', output: '"yzllikS"' }
    ],
    starterCode: {
      javascript: `// Implement a function to reverse a string in JavaScript\nfunction reverseString(str) {\n  // Write your code here\n  return str.split('').reverse().join('');\n}\n\nconsole.log(reverseString("hello"));`,
      python: `# Implement a function to reverse a string in Python\ndef reverse_string(s):\n    # Write your code here\n    return s[::-1]\n\nprint(reverse_string("hello"))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nstring reverseString(const string &s) {\n    string result = s;\n    reverse(result.begin(), result.end());\n    return result;\n}\n\nint main() {\n    cout << reverseString("hello") << endl;\n    return 0;\n}`,
      java: `public class Main {\n    public static String reverseString(String s) {\n        return new StringBuilder(s).reverse().toString();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(reverseString("hello"));\n    }\n}`
    },
    sampleOutput: '"olleh"'
  },
  {
    id: 'palindrome',
    title: 'Palindrome Check',
    difficulty: 'Easy',
    tags: ['Algorithms', 'Strings'],
    description: 'Write a function isPalindrome(str) that returns true if the string reads the same forwards and backwards. Ignore case and non-alphanumeric characters.',
    examples: [
      { input: '"Racecar"', output: 'true' },
      { input: '"A man, a plan, a canal: Panama"', output: 'true' }
    ],
    starterCode: {
      javascript: `// Implement a function to check if a string is a palindrome in JavaScript\nfunction isPalindrome(str) {\n  // Write your code here\n  const filtered = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return filtered === filtered.split('').reverse().join('');\n}\n\nconsole.log(isPalindrome("Racecar"));`,
      python: `# Implement a function to check if a string is a palindrome in Python\ndef is_palindrome(s):\n    # Write your code here\n    filtered = ''.join(ch.lower() for ch in s if ch.isalnum())\n    return filtered == filtered[::-1]\n\nprint(is_palindrome("Racecar"))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nbool isPalindrome(const string &s) {\n    string filtered;\n    for (char c : s) {\n        if (isalnum(c)) filtered.push_back(tolower(c));\n    }\n    string reversed = filtered;\n    reverse(reversed.begin(), reversed.end());\n    return filtered == reversed;\n}\n\nint main() {\n    cout << boolalpha << isPalindrome("Racecar") << endl;\n    return 0;\n}`,
      java: `public class Main {\n    public static boolean isPalindrome(String s) {\n        StringBuilder filtered = new StringBuilder();\n        for (char c : s.toLowerCase().toCharArray()) {\n            if (Character.isLetterOrDigit(c)) filtered.append(c);\n        }\n        return filtered.toString().equals(filtered.reverse().toString());\n    }\n\n    public static void main(String[] args) {\n        System.out.println(isPalindrome("Racecar"));\n    }\n}`
    },
    sampleOutput: 'true'
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'Easy',
    tags: ['Algorithms', 'Loops'],
    description: 'Print the numbers from 1 to n. For multiples of three print "Fizz", for multiples of five print "Buzz", and for multiples of both print "FizzBuzz".',
    examples: [
      { input: '5', output: '1\n2\nFizz\n4\nBuzz' },
      { input: '15', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' }
    ],
    starterCode: {
      javascript: `// Implement FizzBuzz in JavaScript\nfunction fizzBuzz(n) {\n  // Write your code here\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) console.log('FizzBuzz');\n    else if (i % 3 === 0) console.log('Fizz');\n    else if (i % 5 === 0) console.log('Buzz');\n    else console.log(i);\n  }\n}\n\nfizzBuzz(5);`,
      python: `# Implement FizzBuzz in Python\ndef fizz_buzz(n):\n    # Write your code here\n    for i in range(1, n + 1):\n        if i % 15 == 0:\n            print('FizzBuzz')\n        elif i % 3 == 0:\n            print('Fizz')\n        elif i % 5 == 0:\n            print('Buzz')\n        else:\n            print(i)\n\nfizz_buzz(5)`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nvoid fizzBuzz(int n) {\n    for (int i = 1; i <= n; i++) {\n        if (i % 15 == 0) cout << "FizzBuzz";\n        else if (i % 3 == 0) cout << "Fizz";\n        else if (i % 5 == 0) cout << "Buzz";\n        else cout << i;\n        cout << endl;\n    }\n}\n\nint main() {\n    fizzBuzz(5);\n    return 0;\n}`,
      java: `public class Main {\n    public static void fizzBuzz(int n) {\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) System.out.println("FizzBuzz");\n            else if (i % 3 == 0) System.out.println("Fizz");\n            else if (i % 5 == 0) System.out.println("Buzz");\n            else System.out.println(i);\n        }\n    }\n\n    public static void main(String[] args) {\n        fizzBuzz(5);\n    }\n}`
    },
    sampleOutput: '1\n2\nFizz\n4\nBuzz'
  },
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Arrays', 'Hash Table'],
    description: 'Given an array of integers and a target, return the indices of the two numbers that add up to the target.',
    examples: [
      { input: '[2,7,11,15], target=9', output: '[0,1]' },
      { input: '[3,2,4], target=6', output: '[1,2]' }
    ],
    starterCode: {
      javascript: `// Implement Two Sum in JavaScript\nfunction twoSum(nums, target) {\n  // Write your code here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n}\n\nconsole.log(twoSum([2,7,11,15], 9));`,
      python: `# Implement Two Sum in Python\ndef two_sum(nums, target):\n    # Write your code here\n    lookup = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in lookup:\n            return [lookup[complement], i]\n        lookup[num] = i\n\nprint(two_sum([2,7,11,15], 9))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> lookup;\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i];\n        if (lookup.count(complement)) return {lookup[complement], i};\n        lookup[nums[i]] = i;\n    }\n    return {};\n}\n\nint main() {\n    vector<int> nums = {2,7,11,15};\n    auto result = twoSum(nums, 9);\n    cout << result[0] << "," << result[1] << endl;\n    return 0;\n}`,
      java: `import java.util.*;\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> lookup = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (lookup.containsKey(complement)) return new int[] {lookup.get(complement), i};\n            lookup.put(nums[i], i);\n        }\n        return null;\n    }\n\n    public static void main(String[] args) {\n        int[] result = twoSum(new int[] {2,7,11,15}, 9);\n        System.out.println(Arrays.toString(result));\n    }\n}`
    },
    sampleOutput: '[0,1]'
  },
  {
    id: 'anagram',
    title: 'Anagram Check',
    difficulty: 'Easy',
    tags: ['Strings', 'Hash Table'],
    description: 'Given two strings, determine if one is an anagram of the other.',
    examples: [
      { input: '"listen", "silent"', output: 'true' },
      { input: '"hello", "bello"', output: 'false' }
    ],
    starterCode: {
      javascript: `// Implement an anagram checker in JavaScript\nfunction isAnagram(s, t) {\n  // Write your code here\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (const char of s) count[char] = (count[char] || 0) + 1;\n  for (const char of t) {\n    if (!count[char]) return false;\n    count[char]--;\n  }\n  return true;\n}\n\nconsole.log(isAnagram("listen", "silent"));`,
      python: `# Implement an anagram checker in Python\ndef is_anagram(s, t):\n    # Write your code here\n    return sorted(s) == sorted(t)\n\nprint(is_anagram("listen", "silent"))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nbool isAnagram(string s, string t) {\n    sort(s.begin(), s.end());\n    sort(t.begin(), t.end());\n    return s == t;\n}\n\nint main() {\n    cout << boolalpha << isAnagram("listen", "silent") << endl;\n    return 0;\n}`,
      java: `import java.util.*;\npublic class Main {\n    public static boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        int[] counts = new int[26];\n        for (char c : s.toCharArray()) counts[c - 'a']++;\n        for (char c : t.toCharArray()) counts[c - 'a']--;\n        for (int count : counts) if (count != 0) return false;\n        return true;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(isAnagram("listen", "silent"));\n    }\n}`
    },
    sampleOutput: 'true'
  },
  {
    id: 'balanced-brackets',
    title: 'Balanced Brackets',
    difficulty: 'Medium',
    tags: ['Stacks', 'Strings'],
    description: 'Check whether the sequence of brackets is balanced using (), [], and {}.',
    examples: [
      { input: '"()[]{}"', output: 'true' },
      { input: '"([)]"', output: 'false' }
    ],
    starterCode: {
      javascript: `// Implement balanced brackets in JavaScript\nfunction isBalanced(s) {\n  // Write your code here\n  const stack = [];\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  for (const char of s) {\n    if ('([{'.includes(char)) stack.push(char);\n    else if (')]}'.includes(char)) {\n      if (stack.pop() !== pairs[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}\n\nconsole.log(isBalanced("()[]{}"));`,
      python: `# Implement balanced brackets in Python\ndef is_balanced(s):\n    # Write your code here\n    stack = []\n    pairs = {')': '(', ']': '[', '}': '{'}\n    for char in s:\n        if char in '([{':\n            stack.append(char)\n        elif char in ')]}':\n            if not stack or stack.pop() != pairs[char]:\n                return False\n    return not stack\n\nprint(is_balanced("()[]{}"))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nbool isBalanced(const string &s) {\n    stack<char> st;\n    unordered_map<char, char> pairs = {{')','('}, {']','['}, {'}','{'}};\n    for (char c : s) {\n        if (c == '(' || c == '[' || c == '{') st.push(c);\n        else if (pairs.count(c)) {\n            if (st.empty() || st.top() != pairs[c]) return false;\n            st.pop();\n        }\n    }\n    return st.empty();\n}\n\nint main() {\n    cout << boolalpha << isBalanced("()[]{}") << endl;\n    return 0;\n}`,
      java: `import java.util.*;\npublic class Main {\n    public static boolean isBalanced(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');\n        for (char c : s.toCharArray()) {\n            if (c == '(' || c == '[' || c == '{') stack.push(c);\n            else if (pairs.containsKey(c)) {\n                if (stack.isEmpty() || stack.pop() != pairs.get(c)) return false;\n            }\n        }\n        return stack.isEmpty();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(isBalanced("()[]{}"));\n    }\n}`
    },
    sampleOutput: 'true'
  },
  {
    id: 'merge-sorted-arrays',
    title: 'Merge Sorted Arrays',
    difficulty: 'Easy',
    tags: ['Arrays', 'Sorting'],
    description: 'Merge two sorted arrays into a single sorted array.',
    examples: [
      { input: '[1,3,5], [2,4,6]', output: '[1,2,3,4,5,6]' },
      { input: '[0], [0,1]', output: '[0,0,1]' }
    ],
    starterCode: {
      javascript: `// Implement merge sorted arrays in JavaScript\nfunction mergeSorted(a, b) {\n  // Write your code here\n  const result = [];\n  let i = 0;\n  let j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] < b[j]) result.push(a[i++]);\n    else result.push(b[j++]);\n  }\n  return result.concat(a.slice(i)).concat(b.slice(j));\n}\n\nconsole.log(mergeSorted([1,3,5], [2,4,6]));`,
      python: `# Implement merge sorted arrays in Python\ndef merge_sorted(a, b):\n    # Write your code here\n    result = []\n    i = j = 0\n    while i < len(a) and j < len(b):\n        if a[i] < b[j]:\n            result.append(a[i]); i += 1\n        else:\n            result.append(b[j]); j += 1\n    return result + a[i:] + b[j:]\n\nprint(merge_sorted([1,3,5], [2,4,6]))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> mergeSorted(const vector<int>& a, const vector<int>& b) {\n    vector<int> result;\n    int i = 0, j = 0;\n    while (i < a.size() && j < b.size()) {\n        if (a[i] < b[j]) result.push_back(a[i++]);\n        else result.push_back(b[j++]);\n    }\n    while (i < a.size()) result.push_back(a[i++]);\n    while (j < b.size()) result.push_back(b[j++]);\n    return result;\n}\n\nint main() {\n    vector<int> merged = mergeSorted({1,3,5}, {2,4,6});\n    for (int num : merged) cout << num << " ";\n    cout << endl;\n    return 0;\n}`,
      java: `import java.util.*;\npublic class Main {\n    public static List<Integer> mergeSorted(List<Integer> a, List<Integer> b) {\n        List<Integer> result = new ArrayList<>();\n        int i = 0, j = 0;\n        while (i < a.size() && j < b.size()) {\n            if (a.get(i) < b.get(j)) result.add(a.get(i++));\n            else result.add(b.get(j++));\n        }\n        while (i < a.size()) result.add(a.get(i++));\n        while (j < b.size()) result.add(b.get(j++));\n        return result;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(mergeSorted(Arrays.asList(1,3,5), Arrays.asList(2,4,6)));\n    }\n}`
    },
    sampleOutput: '[1,2,3,4,5,6]'
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Number',
    difficulty: 'Easy',
    tags: ['Recursion', 'Dynamic Programming'],
    description: 'Compute the n-th Fibonacci number, where Fibonacci(0)=0 and Fibonacci(1)=1.',
    examples: [
      { input: '5', output: '5' },
      { input: '10', output: '55' }
    ],
    starterCode: {
      javascript: `// Implement Fibonacci in JavaScript\nfunction fibonacci(n) {\n  // Write your code here\n  if (n < 2) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}\n\nconsole.log(fibonacci(5));`,
      python: `# Implement Fibonacci in Python\ndef fibonacci(n):\n    # Write your code here\n    if n < 2:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\nprint(fibonacci(5))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n < 2) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) {\n        int next = a + b;\n        a = b;\n        b = next;\n    }\n    return b;\n}\n\nint main() {\n    cout << fibonacci(5) << endl;\n    return 0;\n}`,
      java: `public class Main {\n    public static int fibonacci(int n) {\n        if (n < 2) return n;\n        int a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            int next = a + b;\n            a = b;\n            b = next;\n        }\n        return b;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(fibonacci(5));\n    }\n}`
    },
    sampleOutput: '5'
  },
  {
    id: 'factorial',
    title: 'Factorial Calculation',
    difficulty: 'Easy',
    tags: ['Recursion', 'Math'],
    description: 'Write a function to compute the factorial of a non-negative integer n.',
    examples: [
      { input: '5', output: '120' },
      { input: '0', output: '1' }
    ],
    starterCode: {
      javascript: `// Implement factorial in JavaScript\nfunction factorial(n) {\n  // Write your code here\n  return n <= 1 ? 1 : n * factorial(n - 1);\n}\n\nconsole.log(factorial(5));`,
      python: `# Implement factorial in Python\ndef factorial(n):\n    # Write your code here\n    return 1 if n <= 1 else n * factorial(n - 1)\n\nprint(factorial(5))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint factorial(int n) {\n    return n <= 1 ? 1 : n * factorial(n - 1);\n}\n\nint main() {\n    cout << factorial(5) << endl;\n    return 0;\n}`,
      java: `public class Main {\n    public static int factorial(int n) {\n        return n <= 1 ? 1 : n * factorial(n - 1);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(factorial(5));\n    }\n}`
    },
    sampleOutput: '120'
  },
  {
    id: 'highest-frequency',
    title: 'Highest Frequency',
    difficulty: 'Easy',
    tags: ['Hash Table', 'Strings'],
    description: 'Find the most frequent character in a string and return it.',
    examples: [
      { input: '"aabbbcc"', output: '"b"' },
      { input: '"level"', output: '"l"' }
    ],
    starterCode: {
      javascript: `// Implement highest frequency character in JavaScript\nfunction highestFrequency(str) {\n  // Write your code here\n  const count = {};\n  let maxChar = str[0];\n  for (const char of str) {\n    count[char] = (count[char] || 0) + 1;\n    if (count[char] > count[maxChar]) maxChar = char;\n  }\n  return maxChar;\n}\n\nconsole.log(highestFrequency("aabbbcc"));`,
      python: `# Implement highest frequency character in Python\ndef highest_frequency(s):\n    # Write your code here\n    counts = {}\n    max_char = s[0]\n    for char in s:\n        counts[char] = counts.get(char, 0) + 1\n        if counts[char] > counts[max_char]:\n            max_char = char\n    return max_char\n\nprint(highest_frequency("aabbbcc"))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nchar highestFrequency(const string &s) {\n    unordered_map<char, int> count;\n    char maxChar = s[0];\n    for (char c : s) {\n        count[c]++;\n        if (count[c] > count[maxChar]) maxChar = c;\n    }\n    return maxChar;\n}\n\nint main() {\n    cout << highestFrequency("aabbbcc") << endl;\n    return 0;\n}`,
      java: `import java.util.*;\npublic class Main {\n    public static char highestFrequency(String s) {\n        Map<Character, Integer> count = new HashMap<>();\n        char maxChar = s.charAt(0);\n        for (char c : s.toCharArray()) {\n            count.put(c, count.getOrDefault(c, 0) + 1);\n            if (count.get(c) > count.get(maxChar)) maxChar = c;\n        }\n        return maxChar;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(highestFrequency("aabbbcc"));\n    }\n}`
    },
    sampleOutput: '"b"'
  },
  {
    id: 'unique-chars',
    title: 'Unique Characters',
    difficulty: 'Easy',
    tags: ['Strings', 'Hash Table'],
    description: 'Check whether a string has all unique characters.',
    examples: [
      { input: '"abc"', output: 'true' },
      { input: '"hello"', output: 'false' }
    ],
    starterCode: {
      javascript: `// Implement unique character check in JavaScript\nfunction hasUniqueChars(str) {\n  // Write your code here\n  const seen = new Set();\n  for (const char of str) {\n    if (seen.has(char)) return false;\n    seen.add(char);\n  }\n  return true;\n}\n\nconsole.log(hasUniqueChars("abc"));`,
      python: `# Implement unique character check in Python\ndef has_unique_chars(s):\n    # Write your code here\n    return len(set(s)) == len(s)\n\nprint(has_unique_chars("abc"))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nbool hasUniqueChars(const string &s) {\n    unordered_set<char> seen;\n    for (char c : s) {\n        if (seen.count(c)) return false;\n        seen.insert(c);\n    }\n    return true;\n}\n\nint main() {\n    cout << boolalpha << hasUniqueChars("abc") << endl;\n    return 0;\n}`,
      java: `import java.util.*;\npublic class Main {\n    public static boolean hasUniqueChars(String s) {\n        Set<Character> seen = new HashSet<>();\n        for (char c : s.toCharArray()) {\n            if (!seen.add(c)) return false;\n        }\n        return true;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(hasUniqueChars("abc"));\n    }\n}`
    },
    sampleOutput: 'true'
  },
  {
    id: 'count-vowels',
    title: 'Count Vowels',
    difficulty: 'Easy',
    tags: ['Strings'],
    description: 'Count the number of vowels in a string.',
    examples: [
      { input: '"hello"', output: '2' },
      { input: '"Skillzy"', output: '1' }
    ],
    starterCode: {
      javascript: `// Implement vowel counting in JavaScript\nfunction countVowels(str) {\n  // Write your code here\n  return (str.match(/[aeiou]/gi) || []).length;\n}\n\nconsole.log(countVowels("hello"));`,
      python: `# Implement vowel counting in Python\ndef count_vowels(s):\n    # Write your code here\n    return sum(1 for ch in s.lower() if ch in 'aeiou')\n\nprint(count_vowels("hello"))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint countVowels(const string &s) {\n    int count = 0;\n    for (char c : s) {\n        char lower = tolower(c);\n        if (string("aeiou").find(lower) != string::npos) count++;\n    }\n    return count;\n}\n\nint main() {\n    cout << countVowels("hello") << endl;\n    return 0;\n}`,
      java: `public class Main {\n    public static int countVowels(String s) {\n        int count = 0;\n        for (char c : s.toLowerCase().toCharArray()) {\n            if ("aeiou".indexOf(c) >= 0) count++;\n        }\n        return count;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(countVowels("hello"));\n    }\n}`
    },
    sampleOutput: '2'
  },
  {
    id: 'second-largest',
    title: 'Second Largest Number',
    difficulty: 'Easy',
    tags: ['Arrays', 'Math'],
    description: 'Return the second largest number from an unsorted array.',
    examples: [
      { input: '[2,7,11,15]', output: '11' },
      { input: '[5,5,4,3]', output: '4' }
    ],
    starterCode: {
      javascript: `// Implement second largest number in JavaScript\nfunction secondLargest(nums) {\n  // Write your code here\n  let largest = -Infinity;
  let second = -Infinity;\n  for (const num of nums) {\n    if (num > largest) {\n      second = largest;\n      largest = num;\n    } else if (num > second && num < largest) {\n      second = num;\n    }\n  }\n  return second;\n}\n\nconsole.log(secondLargest([2,7,11,15]));`,
      python: `# Implement second largest number in Python\ndef second_largest(nums):\n    # Write your code here\n    first = second = float('-inf')\n    for num in nums:\n        if num > first:\n            second = first\n            first = num\n        elif num > second and num < first:\n            second = num\n    return second\n\nprint(second_largest([2,7,11,15]))`,
      cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint secondLargest(const vector<int>& nums) {\n    int first = INT_MIN, second = INT_MIN;\n    for (int num : nums) {\n        if (num > first) {\n            second = first;\n            first = num;\n        } else if (num > second && num < first) {\n            second = num;\n        }\n    }\n    return second;\n}\n\nint main() {\n    cout << secondLargest({2,7,11,15}) << endl;\n    return 0;\n}`,
      java: `import java.util.*;\npublic class Main {\n    public static int secondLargest(int[] nums) {\n        int first = Integer.MIN_VALUE;\n        int second = Integer.MIN_VALUE;\n        for (int num : nums) {\n            if (num > first) {\n                second = first;\n                first = num;\n            } else if (num > second && num < first) {\n                second = num;\n            }\n        }\n        return second;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(secondLargest(new int[] {2,7,11,15}));\n    }\n}`
    },
    sampleOutput: '11'
  }
];

const problemFeedback: Record<string, AiFeedbackType> = {
  reverse: {
    score: 94,
    metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Excellent Runtime', style: 'Highly Readable' },
    suggestions: [
      'Good use of native JavaScript methods (`split`, `reverse`, `join`) which execute rapidly.',
      'Note: This creates an intermediate array of size N, resulting in O(N) auxiliary space complexity.',
      'To optimize to O(1) auxiliary space, reverse the string in-place using a two-pointer swaps technique.'
    ],
    optimalExplanation: 'An optimal solution reverses the string in-place using two pointers starting at the beginning and end of the string, swapping characters until they meet. This reduces space complexity from O(N) to O(1).',
    optimalCode: `function reverseStringInPlace(arr) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left < right) {\n    let temp = arr[left];\n    arr[left] = arr[right];\n    arr[right] = temp;\n    left++;\n    right--;\n  }\n  return arr;\n}`
  },
  palindrome: {
    score: 91,
    metrics: { complexity: 'O(N) Time • O(1) Extra Space', performance: 'Very Good Runtime', style: 'Clear and Concise' },
    suggestions: [
      'Filtering non-alphanumeric characters before comparison keeps the logic robust against punctuation.',
      'A two-pointer approach can avoid creating a reversed copy of the string and reduce memory usage.',
      'Keep your character normalization separate from the comparison logic for easier testing.'
    ],
    optimalExplanation: 'An optimal palindrome check uses two pointers to compare characters from both ends while skipping non-alphanumeric characters. This avoids full string reversal and keeps extra space constant.',
    optimalCode: `function isPalindrome(str) {\n  let left = 0;\n  let right = str.length - 1;\n  while (left < right) {\n    while (left < right && !/[a-z0-9]/i.test(str[left])) left++;\n    while (left < right && !/[a-z0-9]/i.test(str[right])) right--;\n    if (left < right && str[left].toLowerCase() !== str[right].toLowerCase()) return false;\n    left++;\n    right--;\n  }\n  return true;\n}`
  },
  fizzbuzz: {
    score: 89,
    metrics: { complexity: 'O(N) Time • O(1) Space', performance: 'Strong Runtime', style: 'Well-Structured' },
    suggestions: [
      'Your loop logic correctly handles Fizz, Buzz, and FizzBuzz order with clear conditionals.',
      'Using modulo checks in decreasing specificity avoids incorrect output for numbers divisible by both 3 and 5.',
      'If you need to return values instead of printing, collect results in an array and return it for easier unit testing.'
    ],
    optimalExplanation: 'The optimal FizzBuzz implementation loops once from 1 to n and uses conditional ordering so that multiples of both 3 and 5 are handled first.',
    optimalCode: `function fizzBuzz(n) {\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) console.log('FizzBuzz');\n    else if (i % 3 === 0) console.log('Fizz');\n    else if (i % 5 === 0) console.log('Buzz');\n    else console.log(i);\n  }\n}`
  },
  'two-sum': {
    score: 92,
    metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Excellent Runtime', style: 'Interview Ready' },
    suggestions: [
      'Using a hash table avoids the quadratic search of every pair.',
      'Make sure to handle duplicate entries carefully when the complement is equal to the current number.',
      'Consider returning early as soon as the matching pair is found for best performance.'
    ],
    optimalExplanation: 'The best Two Sum solution uses one pass through the array while storing seen numbers in a hash map, so complements are found in constant time.',
    optimalCode: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n}`
  },
  anagram: {
    score: 90,
    metrics: { complexity: 'O(N log N) Time • O(1) Extra Space', performance: 'Very Good Runtime', style: 'Straightforward' },
    suggestions: [
      'Sorting both strings is a simple solution, but a character count is more efficient in practice.',
      'Normalize case and ignore whitespace if the prompt allows it.',
      'Character frequency maps are the most memory-efficient for large alphabets.'
    ],
    optimalExplanation: 'An efficient anagram check counts character frequency for each string and compares the resulting maps, avoiding the cost of sorting.',
    optimalCode: `function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const counts = {};\n  for (const char of s) counts[char] = (counts[char] || 0) + 1;\n  for (const char of t) {\n    if (!counts[char]) return false;\n    counts[char]--;\n  }\n  return true;\n}`
  },
  'balanced-brackets': {
    score: 88,
    metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Solid Runtime', style: 'Robust' },
    suggestions: [
      'A stack is the canonical approach for balanced bracket validation.',
      'Always verify that the stack is empty at the end to avoid unclosed brackets.',
      'Use a mapping from closing to opening characters to make the compare logic concise.'
    ],
    optimalExplanation: 'The best balanced brackets solution pushes opening chars onto a stack and validates each closing char against the last open bracket.',
    optimalCode: `function isBalanced(s) {\n  const stack = [];\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  for (const char of s) {\n    if ('([{'.includes(char)) stack.push(char);\n    else if (pairs[char]) {\n      if (stack.pop() !== pairs[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}`
  },
  'merge-sorted-arrays': {
    score: 90,
    metrics: { complexity: 'O(N + M) Time • O(N + M) Space', performance: 'Efficient Runtime', style: 'Clean' },
    suggestions: [
      'Two-pointer merging is the simplest and fastest way to combine sorted arrays.',
      'Avoid extra sorting by preserving the order while copying the remaining elements.',
      'This algorithm is stable and works well for large sorted inputs.'
    ],
    optimalExplanation: 'Merge sorted arrays by advancing two pointers and selecting the smaller current element until both arrays are exhausted.',
    optimalCode: `function mergeSorted(a, b) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] < b[j]) result.push(a[i++]);\n    else result.push(b[j++]);\n  }\n  return result.concat(a.slice(i)).concat(b.slice(j));\n}`
  },
  fibonacci: {
    score: 87,
    metrics: { complexity: 'O(N) Time • O(1) Space', performance: 'Good Runtime', style: 'Iterative' },
    suggestions: [
      'An iterative approach avoids recursion depth issues for larger n.',
      'Use constant memory by tracking only the last two Fibonacci numbers.',
      'Memoization can also help if the prompt asks for repeated calls.'
    ],
    optimalExplanation: 'The optimal Fibonacci implementation uses a loop and two variables to compute the n-th value in linear time with constant space.',
    optimalCode: `function fibonacci(n) {\n  if (n < 2) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}`
  },
  factorial: {
    score: 85,
    metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Good Runtime', style: 'Recursive' },
    suggestions: [
      'Recursive factorial is concise, but iterative solution avoids call-stack limits for large n.',
      'Validate the base case for n=0 explicitly.',
      'For languages without tail-call optimization, iterative loops are safer.'
    ],
    optimalExplanation: 'A factorial can be computed recursively with a simple base case, but iterative accumulation is more stack-safe for larger inputs.',
    optimalCode: `function factorial(n) {\n  let result = 1;\n  for (let i = 2; i <= n; i++) result *= i;\n  return result;\n}`
  },
  'highest-frequency': {
    score: 89,
    metrics: { complexity: 'O(N) Time • O(K) Space', performance: 'Strong Runtime', style: 'Practical' },
    suggestions: [
      'A frequency map is the canonical solution for highest-frequency character.',
      'Keep track of the current maximum as you build counts to avoid a second pass if desired.',
      'Decide how to break ties when multiple characters are equally frequent.'
    ],
    optimalExplanation: 'Track character counts in a hash map while iterating, then return the character with the highest count.',
    optimalCode: `function highestFrequency(str) {\n  const counts = {};\n  let maxChar = str[0];\n  for (const char of str) {\n    counts[char] = (counts[char] || 0) + 1;\n    if (counts[char] > counts[maxChar]) maxChar = char;\n  }\n  return maxChar;\n}`
  },
  'unique-chars': {
    score: 90,
    metrics: { complexity: 'O(N) Time • O(N) Space', performance: 'Fast Runtime', style: 'Simple' },
    suggestions: [
      'A set-based approach is ideal for verifying uniqueness in a single pass.',
      'Return false immediately when a duplicate is found.',
      'Consider whether the problem should ignore case or spaces in your implementation.'
    ],
    optimalExplanation: 'Use a set to record characters as you traverse the string; duplicates can be detected instantly.',
    optimalCode: `function hasUniqueChars(str) {\n  const seen = new Set();\n  for (const char of str) {\n    if (seen.has(char)) return false;\n    seen.add(char);\n  }\n  return true;\n}`
  },
  'count-vowels': {
    score: 88,
    metrics: { complexity: 'O(N) Time • O(1) Space', performance: 'Excellent Runtime', style: 'Concise' },
    suggestions: [
      'Regular expressions make vowel counting compact and readable.',
      'Lowercasing once before counting reduces repeated conversions.',
      'Consider supporting both uppercase and lowercase vowels for robust input handling.'
    ],
    optimalExplanation: 'Count vowels by scanning the string once and incrementing for each character in the vowel set.',
    optimalCode: `function countVowels(str) {\n  return (str.match(/[aeiou]/gi) || []).length;\n}`
  },
  'second-largest': {
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
};

type Language = 'javascript' | 'python' | 'cpp' | 'java';

interface TestResult {
  passed: boolean;
  summary: string;
  passedCount: number;
  totalCount: number;
}

interface ExecutionOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeMs: number;
  usedDocker: boolean;
  isTimeout: boolean;
  testResults: TestResult | null;
}

function CodingLabInner() {
  const searchParams = useSearchParams();
  const stepId = searchParams.get('stepId');

  const [language, setLanguage] = useState<Language>('javascript');
  const [selectedProblemId, setSelectedProblemId] = useState('reverse');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'console' | 'report'>('console');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AiFeedbackType | null>(null);
  const [execOutput, setExecOutput] = useState<ExecutionOutput | null>(null);

  // Dynamic step loading (when launched from a lesson lab step)
  const [dbStep, setDbStep] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState(false);
  const [isStepMode, setIsStepMode] = useState(false);

  const activeProblem = codingProblems.find((p) => p.id === selectedProblemId) ?? codingProblems[0];

  // Load DB step if stepId is present in URL
  useEffect(() => {
    if (stepId) {
      setIsStepMode(true);
      setLoadingStep(true);
      fetch(`/api/steps/${stepId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.step) {
            const s = data.step;
            setDbStep(s);
            // Detect language from labLanguage field
            const lang = (s.labLanguage as Language) || 'javascript';
            setLanguage(lang);
            setCode(s.labStarterCode || '');
          }
        })
        .catch((err) => {
          console.error('Failed to load step:', err);
          toast.error('Failed to load lab step');
        })
        .finally(() => setLoadingStep(false));
    }
  }, [stepId]);

  // Update code when problem or language changes (free-practice mode only)
  useEffect(() => {
    if (!isStepMode) {
      setCode(activeProblem.starterCode[language]);
      setExecOutput(null);
      setAiFeedback(null);
      setShowAiFeedback(false);
      setActiveTab('console');
    }
  }, [activeProblem, language, isStepMode]);

  const callCompileApi = async (isSubmit: boolean): Promise<ExecutionOutput | null> => {
    try {
      const body: Record<string, any> = { code, language, isSubmit };
      if (isStepMode && stepId) {
        body.stepId = stepId;
      } else {
        body.problemId = selectedProblemId;
      }

      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Compilation failed');
      return data as ExecutionOutput;
    } catch (err: any) {
      toast.error(err.message || 'Execution service error');
      return null;
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setActiveTab('console');
    setExecOutput(null);
    const result = await callCompileApi(false);
    setIsRunning(false);
    if (result) setExecOutput(result);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveTab('report');
    setExecOutput(null);
    const result = await callCompileApi(true);
    setIsSubmitting(false);
    if (result) {
      setExecOutput(result);
      // Show AI feedback panel after submission
      const feedback = problemFeedback[isStepMode ? (stepId ?? '') : selectedProblemId] ?? {
        score: 82,
        metrics: { complexity: 'O(N) Time', performance: 'Good Runtime', style: 'Readable' },
        suggestions: ['Great work! Review edge cases and consider space optimizations.'],
        optimalExplanation: 'Review the problem constraints and choose the simplest correct approach.',
        optimalCode: code,
      };
      setAiFeedback(feedback);
      setShowAiFeedback(true);

      if (result.testResults?.passed) {
        toast.success(`✅ All ${result.testResults.passedCount} tests passed!`);
      } else if (result.testResults) {
        toast.error(`❌ ${result.testResults.summary}`);
      }
    }
  };

  const consoleOutput = execOutput
    ? [
        execOutput.stdout ? `📤 Output:\n${execOutput.stdout}` : '',
        execOutput.stderr ? `⚠️  Errors:\n${execOutput.stderr}` : '',
        `⏱  Execution: ${execOutput.timeMs}ms`,
        execOutput.usedDocker ? '🐳 Ran in Docker Sandbox' : '💻 Ran Locally (fallback)',
        execOutput.isTimeout ? '⏰ TIMEOUT: Execution exceeded limit' : '',
      ]
        .filter(Boolean)
        .join('\n\n')
    : 'Click "Run Code" to see console output here.';

  // Compute Monaco language identifier
  const monacoLang = language === 'cpp' ? 'cpp' : language;

  if (loadingStep) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--border-primary)', borderTop: '3px solid var(--accent-primary)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading lab environment...</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: showAiFeedback ? '3fr 5fr 3.5fr' : '1fr 2fr',
      gap: 'var(--spacing-md)',
      height: 'calc(100vh - var(--header-height) - 48px)',
      margin: '-12px',
      overflow: 'hidden'
    }}>
      {/* Left Pane: Problem Description */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', borderRadius: 0, borderTop: 'none', borderBottom: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 16px 0' }}>

          {/* Step mode: show step details from DB */}
          {isStepMode && dbStep ? (
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '8px', display: 'inline-block' }}>
                💻 LESSON LAB
              </span>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: '0 0 8px 0' }}>
                {dbStep.title}
              </h2>
              {dbStep.labInstructions && (
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {dbStep.labInstructions}
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>{activeProblem.title}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Badge variant={activeProblem.difficulty === 'Easy' ? 'success' : 'warning'}>{activeProblem.difficulty}</Badge>
                  {activeProblem.tags.map((tag) => (
                    <Badge key={tag} variant="primary">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* Problem selector grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                {codingProblems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => setSelectedProblemId(problem.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: problem.id === selectedProblemId ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                      background: problem.id === selectedProblemId ? 'var(--bg-secondary)' : 'transparent',
                      color: problem.id === selectedProblemId ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    {problem.title}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Problem description & examples (free practice mode) */}
        {!isStepMode && (
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {activeProblem.description}
            </p>
            {activeProblem.examples.map((example, index) => (
              <div key={index} style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                <strong>Example {index + 1}:</strong>
                <pre style={{ marginTop: '4px', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                  Input: {example.input}{'\n'}
                  Output: {example.output}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Middle Pane: Monaco Editor + Output */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 'var(--spacing-md)', overflow: 'hidden' }}>
        {/* Editor Toolbar */}
        <div className="card" style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 16px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                className="input select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                style={{ width: '150px', padding: '4px 8px' }}
                disabled={isStepMode}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              {isStepMode && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', background: 'var(--bg-glass)', padding: '2px 8px', borderRadius: '99px', border: '1px solid var(--border-primary)' }}>
                  📖 Lesson Lab
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" size="sm" onClick={handleRun} disabled={isRunning || isSubmitting}>
                {isRunning ? '⏳ Running...' : '▶ Run Code'}
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
                {isSubmitting ? '⏳ Submitting...' : '🚀 Submit'}
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={monacoLang}
              value={code}
              onChange={(val) => setCode(val ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                suggest: { showKeywords: true },
                quickSuggestions: true,
              }}
            />
          </div>
        </div>

        {/* Output / Submission Report Pane */}
        <div className="card" style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 0 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)', padding: '0 8px' }}>
            {(['console', 'report'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 16px', fontSize: 'var(--font-size-xs)', fontWeight: 600,
                  color: activeTab === tab ? 'var(--accent-primary-hover)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {tab === 'console' ? '📟 Console Output' : '📊 Submission Report'}
                {tab === 'report' && execOutput?.testResults && (
                  <span style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: execOutput.testResults.passed ? 'var(--success)' : 'var(--danger)',
                  }} />
                )}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', background: '#070a13', padding: '16px' }}>
            {activeTab === 'console' ? (
              <pre style={{ margin: 0, color: '#94a3b8', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {consoleOutput}
              </pre>
            ) : (
              <div>
                {!execOutput && !isSubmitting && (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: 'var(--font-size-sm)' }}>No submission yet.</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      Click <strong>Submit</strong> to run tests and get your AI optimization report.
                    </p>
                  </div>
                )}
                {isSubmitting && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '2rem 0' }}>
                    <span style={{ fontSize: '1.5rem', animation: 'float 2s infinite' }}>🤖</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      Running test cases and generating AI review...
                    </span>
                  </div>
                )}
                {execOutput && !isSubmitting && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Test Results Banner */}
                    {execOutput.testResults && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px', borderRadius: 'var(--radius-md)',
                        background: execOutput.testResults.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${execOutput.testResults.passed ? 'var(--success)' : 'var(--danger)'}`,
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>{execOutput.testResults.passed ? '✅' : '❌'}</span>
                        <div>
                          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: execOutput.testResults.passed ? 'var(--success)' : 'var(--danger)' }}>
                            {execOutput.testResults.passed ? 'Accepted' : 'Wrong Answer'}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                            {execOutput.testResults.summary}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Performance Stats */}
                    <div style={{ display: 'flex', gap: '24px' }}>
                      {[
                        { label: 'Runtime', value: `${execOutput.timeMs}ms` },
                        { label: 'Execution', value: execOutput.usedDocker ? '🐳 Docker' : '💻 Local' },
                        { label: 'Exit Code', value: String(execOutput.exitCode) },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{label}</div>
                          <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* AI Feedback preview */}
                    {aiFeedback && (
                      <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '12px' }}>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '6px' }}>
                          🤖 AI Optimization Score
                        </p>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
                          {aiFeedback.score}/100
                        </div>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          See full analysis in the right panel →
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Pane: AI Feedback */}
      {showAiFeedback && aiFeedback && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', borderRadius: 0, borderTop: 'none', borderBottom: 'none', animation: 'slideInLeft 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>🤖 AI Feedback</h3>
            <button onClick={() => setShowAiFeedback(false)} style={{ background: 'transparent', color: 'var(--text-tertiary)', fontSize: '1.25rem', border: 'none', cursor: 'pointer' }}>×</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
            <span style={{ fontSize: '2rem' }}>🎯</span>
            <div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--success)' }}>{aiFeedback.score}/100</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Optimization Score</div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '8px' }}>Metrics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
              {Object.entries(aiFeedback.metrics).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k}:</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-primary-hover)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '8px' }}>Suggestions</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, listStyle: 'none' }}>
              {aiFeedback.suggestions.map((s, i) => (
                <li key={i} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', padding: '8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)', lineHeight: 1.5 }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {aiFeedback.optimalExplanation && (
            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '6px' }}>Optimal Approach</h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                {aiFeedback.optimalExplanation}
              </p>
              {aiFeedback.optimalCode && (
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '6px' }}>Optimal Implementation</div>
                  <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '11px', color: '#a78bfa', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                    {aiFeedback.optimalCode}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CodingLab() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid var(--border-primary)', borderTop: '3px solid var(--accent-primary)', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Initializing editor...</p>
      </div>
    }>
      <CodingLabInner />
    </Suspense>
  );
}

