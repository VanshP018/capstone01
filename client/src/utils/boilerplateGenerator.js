/**
 * Generate dynamic boilerplate code based on question structure
 * Extracts function signature from sample testcase
 */

export const generateBoilerplate = (question) => {
  if (!question || !question.sample_testcase) {
    return getDefaultBoilerplate();
  }

  const { input } = question.sample_testcase;
  
  // Determine function parameters and logic based on input structure
  let functionSignature = 'def solution(';
  let functionBody = '';
  let testCode = '';

  // Handle different input types
  if (typeof input === 'object' && !Array.isArray(input)) {
    // Input is an object with multiple parameters (e.g., {n, nums}, {nums, target})
    const params = Object.keys(input);
    functionSignature += params.join(', ') + '):\n';
    
    functionBody += `    # Write your code here\n`;
    functionBody += `    pass\n`;
    
    // Test code
    testCode = `\nif __name__ == "__main__":\n`;
    testCode += `    result = solution(${params.map(p => `${JSON.stringify(input[p])}`).join(', ')})\n`;
    testCode += `    print(result)\n`;
    
  } else if (Array.isArray(input)) {
    // Input is an array
    functionSignature += 'nums):\n';
    
    functionBody += `    # Write your code here\n`;
    functionBody += `    pass\n`;
    
    testCode = `\nif __name__ == "__main__":\n`;
    testCode += `    result = solution(${JSON.stringify(input)})\n`;
    testCode += `    print(result)\n`;
    
  } else if (typeof input === 'string') {
    // Input is a string
    functionSignature += 's):\n';
    
    functionBody += `    # Write your code here\n`;
    functionBody += `    pass\n`;
    
    testCode = `\nif __name__ == "__main__":\n`;
    testCode += `    result = solution("${input}")\n`;
    testCode += `    print(result)\n`;
    
  } else if (typeof input === 'number') {
    // Input is a number
    functionSignature += 'n):\n';
    
    functionBody += `    # Write your code here\n`;
    functionBody += `    pass\n`;
    
    testCode = `\nif __name__ == "__main__":\n`;
    testCode += `    result = solution(${input})\n`;
    testCode += `    print(result)\n`;
  }

  return functionSignature + functionBody + testCode;
};

const getDefaultBoilerplate = () => {
  return `def solution():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    result = solution()\n    print(result)\n`;
};
