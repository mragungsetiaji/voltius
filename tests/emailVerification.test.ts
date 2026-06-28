import { test, expect } from "vitest";
import {
  checkoutRequiresEmailVerification,
  readJwtEmailVerified,
} from "../src/utils/emailVerification.ts";

function jwtWithPayload(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${encoded}.signature`;
}

test("JWT email verification is false only when the claim is false", () => {
  expect(readJwtEmailVerified(jwtWithPayload({ email_verified: false }))).toBe(false);
  expect(readJwtEmailVerified(jwtWithPayload({ email_verified: true }))).toBe(true);
  expect(readJwtEmailVerified(jwtWithPayload({}))).toBe(true);
  expect(readJwtEmailVerified("not-a-jwt")).toBe(true);
});

test("checkout 403 EMAIL_NOT_VERIFIED requires verification", () => {
  expect(checkoutRequiresEmailVerification(403, { code: "EMAIL_NOT_VERIFIED" })).toBe(true);
  expect(checkoutRequiresEmailVerification(403, { error: "EMAIL_NOT_VERIFIED" })).toBe(true);
  expect(checkoutRequiresEmailVerification(403, { message: "EMAIL_NOT_VERIFIED" })).toBe(true);
  expect(checkoutRequiresEmailVerification(401, { code: "EMAIL_NOT_VERIFIED" })).toBe(false);
  expect(checkoutRequiresEmailVerification(403, { code: "OTHER" })).toBe(false);
});
