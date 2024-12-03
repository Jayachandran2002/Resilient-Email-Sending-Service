const EmailService = require("./services/emailService");
const { MockProvider } = require("./providers");

(async () => {
    const provider1 = new MockProvider("Provider1", 0.8);
    const provider2 = new MockProvider("Provider2", 0.7);

    const emailService = new EmailService([provider1, provider2]);

    const email = { recipient: "test@example.com", subject: "Hello", body: "This is a test email." };

    const result = await emailService.send(email, "unique-key-123");
    console.log(result);
})();
