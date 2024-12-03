const EmailService = require("../src/services/emailService");
const { MockProvider } = require("../src/providers");

describe("EmailService", () => {
    let emailService, provider1, provider2;

    beforeEach(() => {
        provider1 = new MockProvider("Provider1", 1.0);
        provider2 = new MockProvider("Provider2", 0.0);
        emailService = new EmailService([provider1, provider2]);
    });

    test("should send email successfully with the first provider", async () => {
        const email = { recipient: "test@example.com", subject: "Test", body: "Hello" };
        const result = await emailService.send(email, "unique-key");
        expect(result.status).toBe("success");
        expect(result.provider).toBe("Provider1");
    });

    test("should fallback to second provider on failure", async () => {
        provider1.successRate = 0.0;
        provider2.successRate = 1.0;

        const email = { recipient: "test@example.com", subject: "Test", body: "Hello" };
        const result = await emailService.send(email, "unique-key-2");
        expect(result.status).toBe("success");
        expect(result.provider).toBe("Provider2");
    });

    test("should track status of email sends", async () => {
        const email = { recipient: "test@example.com", subject: "Test", body: "Hello" };
        await emailService.send(email, "unique-key-3");
        expect(emailService.status["unique-key-3"]).toHaveProperty("status", "success");
    });
});
