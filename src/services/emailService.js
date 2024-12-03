const { delay } = require("../utils/delay");

class EmailService {
    constructor(providers, options = {}) {
        this.providers = providers;
        this.retryLimit = options.retryLimit || 3;
        this.backoffFactor = options.backoffFactor || 200;
        this.rateLimit = options.rateLimit || 5;
        this.circuitBreakerThreshold = options.circuitBreakerThreshold || 5;
        this.circuitBreakerResetTime = options.circuitBreakerResetTime || 60000;
        this.sentEmails = new Set();
        this.queue = [];
        this.circuitBreakerState = new Map();
        this.status = {};
        this.initializeCircuitBreaker();
    }

    initializeCircuitBreaker() {
        this.providers.forEach(provider => {
            this.circuitBreakerState.set(provider.name, { failures: 0, lastFailure: null });
        });
    }

    async send(email, idempotencyKey) {
        if (this.sentEmails.has(idempotencyKey)) {
            console.log("Duplicate email detected, skipping...");
            return { status: "skipped", reason: "Duplicate email" };
        }
        this.queue.push({ email, idempotencyKey });
        return this.processQueue();
    }

    async processQueue() {
        if (this.queue.length > this.rateLimit) {
            console.log("Rate limit exceeded, delaying...");
            await delay(1000);
        }

        const { email, idempotencyKey } = this.queue.shift();
        for (const provider of this.providers) {
            if (this.isCircuitOpen(provider)) {
                console.log(`Circuit open for provider ${provider.name}, skipping...`);
                continue;
            }

            let attempt = 0;
            while (attempt < this.retryLimit) {
                try {
                    console.log(`Attempting to send email via ${provider.name}...`);
                    await provider.send(email);
                    this.sentEmails.add(idempotencyKey);
                    this.updateStatus(idempotencyKey, provider.name, "success");
                    return { status: "success", provider: provider.name };
                } catch (err) {
                    attempt++;
                    console.log(`Attempt ${attempt} failed with provider ${provider.name}: ${err.message}`);
                    await delay(this.backoffFactor * 2 ** attempt);
                }
            }
            this.recordFailure(provider.name);
        }

        this.updateStatus(idempotencyKey, null, "failure");
        return { status: "failure", reason: "All providers failed" };
    }

    updateStatus(idempotencyKey, provider, status) {
        this.status[idempotencyKey] = { provider, status, timestamp: new Date() };
    }

    recordFailure(providerName) {
        const state = this.circuitBreakerState.get(providerName);
        state.failures++;
        state.lastFailure = Date.now();
        if (state.failures >= this.circuitBreakerThreshold) {
            console.log(`Circuit breaker activated for provider ${providerName}`);
        }
    }

    isCircuitOpen(provider) {
        const state = this.circuitBreakerState.get(provider.name);
        if (state.failures < this.circuitBreakerThreshold) return false;
        const timeSinceLastFailure = Date.now() - state.lastFailure;
        if (timeSinceLastFailure > this.circuitBreakerResetTime) {
            console.log(`Circuit breaker resetting for provider ${provider.name}`);
            state.failures = 0;
            return false;
        }
        return true;
    }
}

module.exports = EmailService;
