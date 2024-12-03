class MockProvider {
    constructor(name, successRate = 0.9) {
        this.name = name;
        this.successRate = successRate;
    }

    async send(email) {
        if (Math.random() > this.successRate) {
            throw new Error(`${this.name} failed to send email`);
        }
        console.log(`${this.name} successfully sent email to ${email.recipient}`);
    }
}

module.exports = MockProvider;
