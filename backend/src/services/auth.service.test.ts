import { jest } from "@jest/globals";
import User from "../models/user.model";
import { registerUser } from "../services/auth.service";
import bcrypt from "bcrypt";

// Mock bcrypt ensuring compatibility
jest.mock("bcrypt", () => {
  const mHash = jest.fn();
  const mCompare = jest.fn();
  return {
    __esModule: true,
    default: {
      hash: mHash,
      compare: mCompare,
    },
    hash: mHash,
    compare: mCompare,
  };
});

describe("Auth Service - registerUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should hash the password and save the user", async () => {
    // A. ARRANGE
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };

    // Configure bcrypt mock
    (bcrypt.hash as any).mockResolvedValue("hashed_password");

    // Mock save method using SpyOn on Prototype
    const mockSave = jest
      .spyOn(User.prototype, "save")
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });

    // B. ACT
    const result = await registerUser(userData);

    // C. ASSERT
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

    // Validate result contains hashed password
    expect(result.password).toBe("hashed_password");
    expect(result.username).toBe("testuser");

    expect(mockSave).toHaveBeenCalled();
  });
});
