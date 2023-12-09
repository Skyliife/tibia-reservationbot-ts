import ValidationService from "../bookingservice/validation.service";
const validationService = new ValidationService();
describe("ValidationService", () => {
  test("isTimeFormatValid should return true for valid time format", () => {
    const validTime = "12:34";

    const result = (validationService as ValidationService)["isTimeFormatValid"](validTime);

    expect(result).toBe(true);
  });

  test("isTimeFormatValid should throw an error for invalid time format", () => {
    const invalidTime = "25:00";

    expect(() => {
      validationService["isTimeFormatValid"](invalidTime);
    }).toThrow(/Your input time .* has not the right format/);
  });
});
