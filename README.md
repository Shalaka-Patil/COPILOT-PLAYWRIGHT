# Playwright Automation Project

A JavaScript-based test automation framework using Playwright.

## Project Structure

```
├── tests/                  # Test files
├── playwright.config.js    # Playwright configuration
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

## Prerequisites

- Node.js (v18 or higher)
- npm

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

- **Run all tests:**
  ```bash
  npm test
  ```

- **Run tests in headed mode:**
  ```bash
  npm run test:headed
  ```

- **Run tests with UI mode:**
  ```bash
  npm run test:ui
  ```

- **Debug tests:**
  ```bash
  npm run test:debug
  ```

- **Generate test code:**
  ```bash
  npm run codegen
  ```

## Configuration

Edit `playwright.config.js` to:
- Configure base URL
- Enable/disable specific browsers (Chrome, Firefox, Safari)
- Set viewport sizes for mobile testing
- Configure retry behavior and parallel execution
- Customize reporting options

## CI/CD

The configuration automatically adapts for CI environments:
- Sets retries to 2
- Disables parallel execution (1 worker)
- Fails on `test.only` usage

## Learn More

- [Playwright Documentation](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-test)
- [Best Practices](https://playwright.dev/docs/best-practices)
