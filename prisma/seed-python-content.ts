import { PrismaClient, LessonStepType, AssignmentType, AssignmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to create a unique ID for steps
function makeStepId(lessonId: string, type: string) {
  return `${lessonId.substring(0, 18)}-${type}`;
}

// Generates highly detailed, student-friendly textbook articles for all 106 lessons dynamically
function generatePythonTextbookContent(lessonTitle: string, moduleTitle: string): string {
  let keyExplanations = "";
  let codeSample = "";
  let commonMistakes = "";
  
  if (moduleTitle.includes('Introduction')) {
    keyExplanations = `Python is a high-level, interpreted, dynamically typed programming language created by Guido van Rossum in 1991.
    * **Simplicity**: Python is designed to be highly readable, using clean indentation rather than brackets or semi-colons.
    * **Interpreted Nature**: Python code is processed at runtime by the interpreter line by line. There is no separate compile step needed before running.
    * **Multi-Paradigm**: Python supports Procedural, Functional, and Object-Oriented programming paradigms.`;
    codeSample = `# Printing output in Python
print("Hello, Python!")

# Defining variables dynamically
language = "Python"
version = 3.12
print(f"Learning {language} version {version}")`;
    commonMistakes = `* **SyntaxError: invalid syntax**: Often caused by missing colons at the end of function declarations or control statements.
* **IndentationError**: Mixing spaces and tabs or having inconsistent spaces. Python requires consistent 4 spaces by default.`;
  }
  else if (moduleTitle.includes('Variables')) {
    keyExplanations = `Variables in Python are names that point to objects in the computer's memory.
    * **Dynamic Typing**: Python dynamically determines the variable type at runtime. You do not declare variable types explicitly (e.g. no 'int' or 'string' keywords).
    * **Object References**: When you write \`x = 10\`, Python creates an integer object 10 in memory, and points the name \`x\` to it. If you reassign \`x = "hello"\`, the pointer changes.
    * **Data Types**: Common built-in types include Integers, Floats, Strings, Booleans, and NoneType.`;
    codeSample = `# Variable assignments and type verification
x = 42
print(type(x))  # Output: <class 'int'>

x = "Forty-Two"
print(type(x))  # Output: <class 'str'>`;
    commonMistakes = `* **NameError: name 'x' is not defined**: Caused by referencing a variable before it has been assigned a value.
* **TypeErrors during operations**: Trying to concatenate different types, such as adding a string to an integer (\`"age: " + 10\`). Use explicit casting (\`str(10)\`) instead.`;
  }
  else if (moduleTitle.includes('Operators')) {
    keyExplanations = `Operators are symbols that perform calculations or comparisons on values:
    * **Arithmetic**: \`+\` (addition), \`-\` (subtraction), \`*\` (multiplication), \`/\` (float division), \`//\` (floor division), \`%\` (modulo), and \`**\` (exponentiation).
    * **Comparison**: \`==\` (equal to), \`!=\` (not equal to), \`>\` (greater than), and \`<\` (less than).
    * **Logical**: \`and\` (both true), \`or\` (at least one true), and \`not\` (negation).
    * **Identity & Membership**: \`is\` compares object memory references; \`in\` checks if a value exists inside a collection.`;
    codeSample = `# Arithmetic vs Floor Division
print(5 / 2)  # Output: 2.5
print(5 // 2) # Output: 2

# Membership Checking
fruits = ["apple", "banana"]
print("apple" in fruits) # Output: True`;
    commonMistakes = `* **Using = instead of ==**: A single \`=\` is for variable assignment; double \`==\` is for checking equality.
* **Precedence confusion**: Assuming left-to-right calculation without considering PEMDAS rules. Always use parentheses to group arithmetic operations.`;
  }
  else if (moduleTitle.includes('Strings')) {
    keyExplanations = `Strings in Python are immutable sequences of Unicode characters:
    * **Immutability**: Once a string is created, its characters cannot be modified in-place. Operations return a new string object instead.
    * **Indexing**: Access characters using 0-based indexing (\`s[0]\` is first). Negative indices check from the end (\`s[-1]\` is last).
    * **Slicing**: Extract sub-strings using the syntax \`s[start:stop:step]\`.`;
    codeSample = `# String slicing examples
msg = "PythonCoding"
print(msg[0:6])   # Output: "Python"
print(msg[::-1])  # Output: "gnidoCnohtyP" (Reverse string)

# Formatting with f-strings
name = "Student"
print(f"Welcome, {name}!")`;
    commonMistakes = `* **TypeError: 'str' object does not support item assignment**: Trying to do \`s[0] = 'H'\`. You must construct a new string instead.
* **IndexError: string index out of range**: Accessing an index that exceeds the length of the string.`;
  }
  else if (moduleTitle.includes('Collections')) {
    keyExplanations = `Collections are built-in containers that hold multiple values:
    * **Lists**: Ordered, mutable, dynamic arrays: \`[1, 2, 3]\`.
    * **Tuples**: Ordered, immutable sequences: \`(1, 2, 3)\`.
    * **Sets**: Unordered collections of unique, hashable items: \`{1, 2, 3}\`.
    * **Dictionaries**: Key-value mappings: \`{"name": "Alice", "age": 25}\`.`;
    codeSample = `# Dictionary and List comprehension
numbers = [1, 2, 3, 4]
squares = [n**2 for n in numbers if n % 2 == 0]
print(squares)  # Output: [4, 16]

# Set operations
set_a = {1, 2, 3}
set_b = {3, 4, 5}
print(set_a.union(set_b)) # Output: {1, 2, 3, 4, 5}`;
    commonMistakes = `* **KeyError**: Referencing a dictionary key that doesn't exist. Use \`dict.get(key, default)\` to avoid crashes.
* **Mutating a collection while iterating**: Modifying lists directly inside a \`for\` loop over that same list, causing skipped elements or infinite loops.`;
  }
  else if (moduleTitle.includes('Control Flow')) {
    keyExplanations = `Control flow allows programs to execute different code blocks based on condition evaluations:
    * **if / elif / else**: Evaluates boolean conditions sequentially from top to bottom.
    * **Match-Case**: Introduced in Python 3.10, this is Python's switch-case equivalent supporting structural pattern matching.
    * **Ternary Expression**: Inline condition evaluations: \`val = x if cond else y\`.`;
    codeSample = `# Match-case pattern matching
status_code = 404
match status_code:
    case 200:
        print("Success")
    case 404:
        print("Not Found")
    case _:
        print("Unknown Status")`;
    commonMistakes = `* **Forgetting the colon**: Every \`if\`, \`elif\`, \`else\`, or \`case\` statement must end with a \`:\`.
* **Incorrect Indentation**: Code inside conditional blocks must be indented consistently.`;
  }
  else if (moduleTitle.includes('Loops')) {
    keyExplanations = `Loops repeat block execution until criteria are met:
    * **for loops**: Iterate over iterables (lists, ranges, collections) sequentially.
    * **while loops**: Run repeatedly as long as a boolean condition holds true.
    * **Loop Controls**: \`break\` exits the loop immediately; \`continue\` skips the current iteration; \`pass\` serves as a null statement placeholder.`;
    codeSample = `# Looping with enumerate
colors = ["red", "green", "blue"]
for index, color in enumerate(colors):
    print(f"Index {index}: {color}")`;
    commonMistakes = `* **Infinite while loops**: Forgetting to update the loop condition variable inside the loop body, causing the program to hang.
* **Index Errors**: Looping over a list index using \`range(len(lst))\` but mutating the list size inside the loop.`;
  }
  else if (moduleTitle.includes('Functions')) {
    keyExplanations = `Functions are modular blocks of reusable code defined with the \`def\` keyword:
    * **Arguments**: Positional, keyword, default parameters, and variable-length arguments (\`*args\` and \`**kwargs\`).
    * **Lambda**: Anonymous, single-expression inline functions: \`lambda x: x + 1\`.
    * **Decorators**: Functions that wrap other functions to modify their behavior without changing their source code.`;
    codeSample = `# Function with default arguments and *args
def greet(message="Hello", *names):
    for name in names:
        print(f"{message}, {name}!")

greet("Hi", "Alice", "Bob")`;
    commonMistakes = `* **Using mutable default arguments**: Using lists or dictionaries as default arguments (e.g. \`def append_to(val, lst=[])\`). Since defaults are created once at compile time, the list persists across multiple calls! Use \`None\` instead.`;
  }
  else if (moduleTitle.includes('Exception')) {
    keyExplanations = `Exceptions represent runtime errors that stop execution. We handle them to protect programs from crashing:
    * **try**: Holds code that might trigger an exception.
    * **except**: Catches and handles the exception.
    * **else**: Runs only if no exceptions were thrown.
    * **finally**: Always runs, regardless of whether exceptions were thrown or caught.`;
    codeSample = `# Safe division try-except-finally
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error caught: {e}")
finally:
    print("Execution completed.")`;
    commonMistakes = `* **Catching all exceptions**: Using a bare \`except:\` block. This catches critical errors like keyboard interruptions (Ctrl+C). Always specify concrete exceptions (e.g., \`except ValueError:\`).`;
  }
  else {
    // Object Oriented Programming
    keyExplanations = `Object-Oriented Programming (OOP) organizes software around classes and objects:
    * **Class**: A user-defined blueprint for creating objects.
    * **Object**: An instance of a Class containing data and methods.
    * **OOP Pillars**:
      1. *Inheritance*: Subclasses inherit properties of parent classes.
      2. *Polymorphism*: Method overriding enables standard interfaces for different types.
      3. *Encapsulation*: Hiding object details (using double underscores like \`__variable\` for private members).
      4. *Abstraction*: Hiding complex logic behind simple interfaces.`;
    codeSample = `# Class definition and constructor
class Animal:
    def __init__(self, name):
        self.name = name

    def make_sound(self):
        pass

class Dog(Animal):
    def make_sound(self):
        return "Woof!"

my_dog = Dog("Rex")
print(my_dog.make_sound()) # Output: "Woof!"`;
    commonMistakes = `* **Forgetting 'self'**: Every instance method in a class must take \`self\` as its first parameter. Forgetting this results in a \`TypeError: method() takes 0 positional arguments but 1 was given\`.
* **Confusing class variables with instance variables**: Defining class variables outside the constructor that accidentally share state across all instances.`;
  }

  // Fleshing out lesson specific textbook descriptions
  return `# Textbook Guide: ${lessonTitle}

Welcome to this comprehensive tutorial on **${lessonTitle}** under **${moduleTitle}**. Here, we break down the core theoretical definitions, present real-world examples, write code demonstrations, and outline common mistakes you must avoid.

---

## 📖 Theoretical Concepts

Here are the key academic and industry principles you must understand:

${keyExplanations}

---

## 💻 Code Demonstration

Below is a clean, practical code snippet illustrating this topic in Python:

\`\`\`python
${codeSample}
\`\`\`

---

## 🐞 Common Mistakes & Gotchas

Be on the lookout for these frequent developer errors:

${commonMistakes}

---

### 📝 Next Steps
1. Practice writing this code structure in a local Python editor.
2. Observe how modifying variables, types, or syntax changes compilation output.
3. Advance to the next lesson or click the interactive coding lab!`;
}

async function main() {
  console.log('🌱 Starting Python Course Content Seeding...');

  // 1. Locate the Python Programming Course
  const course = await prisma.course.findFirst({
    where: { slug: 'python-programming-course' }
  });

  if (!course) {
    console.error('Error: Python Programming Course not found in database!');
    process.exit(1);
  }
  console.log(`Found Course: "${course.title}" (ID: ${course.id})`);

  // 2. Fetch all modules and lessons
  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    include: {
      lessons: {
        include: {
          steps: true
        }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });

  console.log(`Fetched ${modules.length} modules.`);

  // 3. Define content maps for key coding labs
  const labsMap: Record<string, {
    title: string;
    starterCode: string;
    solutionCode: string;
    instructions: string;
    testCode: string;
  }> = {
    "Variables": {
      title: "Lab - Creating and Summing Variables",
      starterCode: `def sum_variables():
    # TODO: Create a variable 'x' with the value 10
    # TODO: Create a variable 'y' with the value 20
    # Return their sum
    pass
`,
      solutionCode: `def sum_variables():
    x = 10
    y = 20
    return x + y
`,
      instructions: `### Interactive Lab: Creating Variables

In this lab, you will practice basic variable creation and assignment:
1. Define a variable \`x\` and assign it the integer value \`10\`.
2. Define a variable \`y\` and assign it the integer value \`20\`.
3. Return the sum of \`x\` and \`y\`.`,
      testCode: `
try:
    if 'sum_variables' not in globals():
        raise NameError("Function sum_variables is not defined")
    act = sum_variables()
    passed = act == 30
    print(f"[TEST_CASE] 0 | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed:
        print("TEST_RESULTS: 1/1 passed")
    else:
        print("TEST_FAILURE: 1 test case failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Dynamic Typing": {
      title: "Lab - Identifying Variable Types",
      starterCode: `def get_type_string(val):
    # TODO: Return a string representing the type of 'val'.
    # Return "int" for integers, "float" for floats, "str" for strings, and "bool" for booleans.
    pass
`,
      solutionCode: `def get_type_string(val):
    if isinstance(val, bool):
        return "bool"
    elif isinstance(val, int):
        return "int"
    elif isinstance(val, float):
        return "float"
    elif isinstance(val, str):
        return "str"
    return "unknown"
`,
      instructions: `### Interactive Lab: Dynamic Typing

Python is dynamically typed. Write a helper function \`get_type_string\` that:
1. Returns \`"int"\` if \`val\` is an integer.
2. Returns \`"float"\` if \`val\` is a decimal/float.
3. Returns \`"str"\` if \`val\` is a string.
4. Returns \`"bool"\` if \`val\` is a boolean.

*Hint: Use \`isinstance(val, type)\` or \`type(val)\`.*`,
      testCode: `
try:
    if 'get_type_string' not in globals():
        raise NameError("Function get_type_string is not defined")
    cases = [
        { "input": 42, "expected": "int" },
        { "input": 3.14, "expected": "float" },
        { "input": "hello", "expected": "str" },
        { "input": True, "expected": "bool" }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = get_type_string(c["input"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Arithmetic Operators": {
      title: "Lab - Writing a Simple Calculator",
      starterCode: `def simple_calculator(a, b, op):
    # TODO: Perform calculation 'a op b' and return the result.
    # Supported operators are '+', '-', '*', '/'.
    # If division by zero is attempted, return "error".
    # If operation is not supported, return "invalid".
    pass
`,
      solutionCode: `def simple_calculator(a, b, op):
    if op == '+': return a + b
    elif op == '-': return a - b
    elif op == '*': return a * b
    elif op == '/':
        if b == 0: return "error"
        return a / b
    return "invalid"
`,
      instructions: `### Interactive Lab: Simple Calculator

Implement a function \`simple_calculator(a, b, op)\` that:
1. Calculates addition (\`+\`), subtraction (\`-\`), multiplication (\`*\`), and division (\`/\`).
2. Safely handles division by zero by returning the string \`"error"\`.
3. Handles unsupported operators by returning the string \`"invalid"\`.`,
      testCode: `
try:
    if 'simple_calculator' not in globals():
        raise NameError("Function simple_calculator is not defined")
    cases = [
        { "a": 10, "b": 5, "op": "+", "expected": 15 },
        { "a": 10, "b": 5, "op": "/", "expected": 2 },
        { "a": 10, "b": 0, "op": "/", "expected": "error" },
        { "a": 10, "b": 5, "op": "%", "expected": "invalid" }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = simple_calculator(c["a"], c["b"], c["op"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "String Slicing": {
      title: "Lab - Extractor Middle Substring",
      starterCode: `def get_middle_three(s):
    # TODO: Return exactly three characters centered around the middle of string 's'.
    # You can assume string length is odd and at least 3.
    pass
`,
      solutionCode: `def get_middle_three(s):
    mid = len(s) // 2
    return s[mid-1 : mid+2]
`,
      instructions: `### Interactive Lab: String Slicing

Slicing allows you to extract sections of strings using indices. Write a function \`get_middle_three(s)\` that:
1. Finds the middle index of string \`s\`.
2. Uses string slicing to return exactly three characters centered around the middle.
   * For example, given \`"Candy"\`, the middle is \`"a"\`, so it returns \`"and"\`.`,
      testCode: `
try:
    if 'get_middle_three' not in globals():
        raise NameError("Function get_middle_three is not defined")
    cases = [
        { "input": "Candy", "expected": "and" },
        { "input": "solving", "expected": "lvi" },
        { "input": "abc", "expected": "abc" }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = get_middle_three(c["input"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Lists": {
      title: "Lab - Array Extremes Difference",
      starterCode: `def min_max_diff(nums):
    # TODO: Find the minimum and maximum integers in the list 'nums'.
    # Return their difference (max_value - min_value).
    # Return 0 if the list is empty.
    pass
`,
      solutionCode: `def min_max_diff(nums):
    if not nums:
        return 0
    return max(nums) - min(nums)
`,
      instructions: `### Interactive Lab: Lists Operations

Write a function \`min_max_diff(nums)\` that takes a list of integers and:
1. Finds the maximum value in the list.
2. Finds the minimum value in the list.
3. Returns the difference (\`max - min\`).
4. Handles empty lists by returning \`0\`.`,
      testCode: `
try:
    if 'min_max_diff' not in globals():
        raise NameError("Function min_max_diff is not defined")
    cases = [
        { "input": [1, 5, 3, 9, 2], "expected": 8 },
        { "input": [-10, 0, 10], "expected": 20 },
        { "input": [], "expected": 0 }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = min_max_diff(c["input"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Dictionaries": {
      title: "Lab - Character Counter",
      starterCode: `def char_frequency(s):
    # TODO: Return a dictionary containing the frequency counts of each character in string 's'.
    pass
`,
      solutionCode: `def char_frequency(s):
    freq = {}
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    return freq
`,
      instructions: `### Interactive Lab: Dictionary Construction

Dictionaries match keys to values. Write a function \`char_frequency(s)\` that:
1. Loops through string \`s\`.
2. Computes the frequency count of each character.
3. Returns a dictionary where keys are unique characters and values are their respective counts.`,
      testCode: `
try:
    if 'char_frequency' not in globals():
        raise NameError("Function char_frequency is not defined")
    cases = [
        { "input": "aba", "expected": { "a": 2, "b": 1 } },
        { "input": "c", "expected": { "c": 1 } },
        { "input": "", "expected": {} }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = char_frequency(c["input"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "if-else statement": {
      title: "Lab - Leap Year Checker",
      starterCode: `def is_leap_year(year):
    # TODO: Return True if 'year' is a leap year, otherwise False.
    # A year is a leap year if it is divisible by 4, but not by 100, unless it is also divisible by 400.
    pass
`,
      solutionCode: `def is_leap_year(year):
    if year % 400 == 0:
        return True
    if year % 100 == 0:
        return False
    return year % 4 == 0
`,
      instructions: `### Interactive Lab: Conditional Branches

Implement the leap year checker function \`is_leap_year(year)\` in Python:
1. Return \`True\` if the year is leap, else \`False\`.
2. Apply standard leap rules: divisible by 400 is leap; otherwise divisible by 100 is not leap; otherwise divisible by 4 is leap.`,
      testCode: `
try:
    if 'is_leap_year' not in globals():
        raise NameError("Function is_leap_year is not defined")
    cases = [
        { "year": 2000, "expected": True },
        { "year": 1900, "expected": False },
        { "year": 2024, "expected": True },
        { "year": 2023, "expected": False }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = is_leap_year(c["year"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "for loops": {
      title: "Lab - Summing Digits",
      starterCode: `def sum_digits(num):
    # TODO: Sum the absolute digits of the integer 'num' and return the result.
    # For example, 123 returns 6. -45 returns 9.
    pass
`,
      solutionCode: `def sum_digits(num):
    return sum(int(digit) for digit in str(abs(num)))
`,
      instructions: `### Interactive Lab: Iterating with For Loops

Loops allow you to iterate over sequences. Write a function \`sum_digits(num)\` that:
1. Converts the absolute value of integer \`num\` into digits.
2. Iterates over the digits using a \`for\` loop.
3. Computes and returns their sum.`,
      testCode: `
try:
    if 'sum_digits' not in globals():
        raise NameError("Function sum_digits is not defined")
    cases = [
        { "input": 123, "expected": 6 },
        { "input": -45, "expected": 9 },
        { "input": 0, "expected": 0 }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = sum_digits(c["input"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Defining Functions": {
      title: "Lab - Prime Number Checker",
      starterCode: `def is_prime(n):
    # TODO: Return True if n is a prime number, otherwise False.
    # Prime numbers are integers greater than 1 that have no positive divisors other than 1 and themselves.
    pass
`,
      solutionCode: `def is_prime(n):
    if n <= 1: return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0: return False
    return True
`,
      instructions: `### Interactive Lab: Defining Custom Functions

Write a prime number checker function \`is_prime(n)\` that:
1. Returns \`False\` for values less than or equal to 1.
2. Uses loop math to search for positive divisors between 2 and the square root of \`n\`.
3. Returns \`True\` if no divisors are found.`,
      testCode: `
try:
    if 'is_prime' not in globals():
        raise NameError("Function is_prime is not defined")
    cases = [
        { "n": 2, "expected": True },
        { "n": 4, "expected": False },
        { "n": 17, "expected": True },
        { "n": 1, "expected": False }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = is_prime(c["n"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "try statement": {
      title: "Lab - Safe Division Exceptions",
      starterCode: `def safe_divide(x, y):
    # TODO: Divide x by y. Catch ZeroDivisionError and return "division_by_zero_error".
    # Return the float result if successful.
    pass
`,
      solutionCode: `def safe_divide(x, y):
    try:
        return x / y
    except ZeroDivisionError:
        return "division_by_zero_error"
`,
      instructions: `### Interactive Lab: Exception Handling

Handle potential runtime crashes using try-except structures. Write a function \`safe_divide(x, y)\` that:
1. Performs division \`x / y\`.
2. Catches \`ZeroDivisionError\` if \`y\` is 0 and returns \`"division_by_zero_error"\`.`,
      testCode: `
try:
    if 'safe_divide' not in globals():
        raise NameError("Function safe_divide is not defined")
    cases = [
        { "x": 10, "y": 2, "expected": 5.0 },
        { "x": 10, "y": 0, "expected": "division_by_zero_error" }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = safe_divide(c["x"], c["y"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Constructors": {
      title: "Lab - Person Class Initialization",
      starterCode: `# Define a Person class with constructor __init__

class Person:
    # TODO: Write constructor taking name and age parameters.
    # TODO: Write a get_greeting method returning "Hello, my name is [name] and I am [age] years old."
    pass
`,
      solutionCode: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    def get_greeting(self):
        return f"Hello, my name is {self.name} and I am {self.age} years old."
`,
      instructions: `### Interactive Lab: Classes and Constructors

Constructors initialize objects. Complete the \`Person\` class:
1. Write \`__init__(self, name, age)\` saving parameters to instance variables.
2. Write \`get_greeting(self)\` formatting a name and age output string.`,
      testCode: `
try:
    if 'Person' not in globals():
        raise NameError("Class Person is not defined")
    p = Person("Aarav", 22)
    act = p.get_greeting()
    passed = act == "Hello, my name is Aarav and I am 22 years old."
    print(f"[TEST_CASE] 0 | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed:
        print("TEST_RESULTS: 1/1 passed")
    else:
        print("TEST_FAILURE: Output does not match expected format")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    }
  };

  let totalStepsSeeded = 0;
  let totalAssignmentsSeeded = 0;

  for (const mod of modules) {
    console.log(`Processing Module: "${mod.title}"...`);
    for (const les of mod.lessons) {
      const labConfig = labsMap[les.title];
      
      const hasTextStep = les.steps.some(s => s.stepType === LessonStepType.text);
      const hasLabStep = les.steps.some(s => s.stepType === LessonStepType.lab);

      // A. Seed Coding Lab Step
      if (labConfig && !hasLabStep) {
        console.log(`  Seeding Lab for Lesson: "${les.title}"`);
        const labStepId = makeStepId(les.id, 'lab');
        
        await prisma.lessonStep.upsert({
          where: { id: labStepId },
          update: {
            textContent: generatePythonTextbookContent(les.title, mod.title)
          },
          create: {
            id: labStepId,
            lessonId: les.id,
            stepType: LessonStepType.lab,
            sortOrder: 2,
            title: labConfig.title,
            labLanguage: 'python',
            labStarterCode: labConfig.starterCode,
            labSolutionCode: labConfig.solutionCode,
            labInstructions: labConfig.instructions,
            labTestCode: { python: labConfig.testCode },
            textContent: generatePythonTextbookContent(les.title, mod.title),
            metadata: {
              examples: [
                { input: "See instructions", output: "Matches verification rules" }
              ]
            }
          }
        });
        totalStepsSeeded++;

        // 3. Create backing Assignment for the lab
        await prisma.assignment.upsert({
          where: { id: labStepId },
          update: {},
          create: {
            id: labStepId,
            courseId: course.id,
            moduleId: mod.id,
            title: labConfig.title,
            assignmentType: 'coding',
            status: AssignmentStatus.active,
            maxScore: 100,
            starterCode: labConfig.starterCode,
            language: 'python'
          }
        });
        totalAssignmentsSeeded++;
      }
      
      // B. If no lab is configured, and no text/intro step exists, create a default high-quality Text Step
      else if (!labConfig && !hasTextStep) {
        console.log(`  Seeding Text Step for Lesson: "${les.title}"`);
        const textStepId = makeStepId(les.id, 'text');
        
        await prisma.lessonStep.upsert({
          where: { id: textStepId },
          update: {
            textContent: generatePythonTextbookContent(les.title, mod.title)
          },
          create: {
            id: textStepId,
            lessonId: les.id,
            stepType: LessonStepType.text,
            sortOrder: 1,
            title: `Step 1: Understanding ${les.title}`,
            textContent: generatePythonTextbookContent(les.title, mod.title)
          }
        });
        totalStepsSeeded++;
      }
    }
  }

  console.log('🎉 Python Course Seeding Completed!');
  console.log(`Seeded ${totalStepsSeeded} new Lesson Steps.`);
  console.log(`Seeded ${totalAssignmentsSeeded} new Assignments.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
