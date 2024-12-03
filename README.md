# Resilient Email Sending Service
A robust email sending service in JavaScript with features like retry logic, provider fallback, idempotency, rate limiting, and circuit breaker pattern.

## Features
- 📧 Retry Mechanism: Retries email sends with exponential backoff.
- 🔄 Provider Fallback: Switches to alternative providers if one fails.
- 🔑 Idempotency: Prevents duplicate email sends using unique keys.
- 🚦 Rate Limiting: Limits the number of emails sent per second.
- 🔌 Circuit Breaker Pattern: Avoids overusing failing providers.
- 📜 Simple Logging: Logs actions for monitoring and debugging.
## Getting Started
1. Prerequisites
Node.js (version 14 or later)
2. Installation
Clone this repository and install dependencies:
``` bash
git clone https://github.com/your-username/resilient-email-service.git
cd resilient-email-service
npm install
```

## Usage
1. Setup Providers
Create mock providers with a success rate:

```javascript
Copy code
const { MockProvider } = require("./src/providers");

const provider1 = new MockProvider("Provider1", 0.8); // 80% success rate
const provider2 = new MockProvider("Provider2", 0.7); // 70% success rate
```
2. Initialize Email Service
Initialize the EmailService with the configured providers:

```javascript

const EmailService = require("./src/services/emailService");
const emailService = new EmailService([provider1, provider2]);
```
3. Send an Email
Send an email using the service:

```javascript
const email = {
    recipient: "test@example.com",
    subject: "Hello",
    body: "This is a test email.",
};

const idempotencyKey = "unique-key-123"; // Unique key for deduplication

(async () => {
    const result = await emailService.send(email, idempotencyKey);
    console.log(result);
})();
```
## Configuration
Modify the default configuration in ```config/default.js:```

```javascript
module.exports = {
    retryLimit: 3,                  // Max retry attempts
    backoffFactor: 200,             // Base delay for retries (ms)
    rateLimit: 5,                   // Max emails per second
    circuitBreakerThreshold: 5,     // Failures before circuit breaker trips
    circuitBreakerResetTime: 60000, // Circuit breaker reset time (ms)
};
```
## Testing
Run unit tests using Jest:

```bash
npm test
```
Example test structure:

```emailService.test.js:``` Tests for the core email service functionality.

## Enhancements
- Add support for real email providers like SendGrid or AWS SES.
- Implement a persistent queue using a database or file system.
- Integrate structured logging with tools like winston or pino.

## Contact
contact me via email at ```sjayachandran.bsc@gmail.com```
