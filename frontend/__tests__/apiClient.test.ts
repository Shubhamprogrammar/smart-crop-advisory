import axios from "axios";
import { ApiRequestError, unwrap } from "../lib/apiClient";

describe("unwrap (API envelope handling)", () => {
  it("returns data from a success envelope", async () => {
    const promise = Promise.resolve({
      data: { success: true as const, message: "ok", data: { id: "f1" } },
    });
    await expect(unwrap(promise)).resolves.toEqual({ id: "f1" });
  });

  it("throws ApiRequestError when the envelope reports failure", async () => {
    const promise = Promise.resolve({
      data: { success: false as const, message: "Something went wrong", error: { code: 500 } },
    });
    await expect(unwrap(promise)).rejects.toThrow(ApiRequestError);
    await expect(unwrap(promise)).rejects.toThrow("Something went wrong");
  });

  it("maps an axios error into ApiRequestError with server message and status", async () => {
    const promise = Promise.reject(
      new axios.AxiosError(
        "Request failed",
        "ERR_BAD_REQUEST",
        undefined,
        undefined,
        { status: 401, data: { success: false, message: "Invalid credentials" } } as never
      )
    );
    await expect(unwrap(promise)).rejects.toThrow("Invalid credentials");
    try {
      await unwrap(promise);
    } catch (err) {
      expect(err).toBeInstanceOf(ApiRequestError);
      expect((err as ApiRequestError).status).toBe(401);
    }
  });

  it("rethrows non-axios errors unchanged", async () => {
    const boom = new Error("boom");
    const promise = Promise.reject(boom);
    await expect(unwrap(promise)).rejects.toBe(boom);
  });
});
