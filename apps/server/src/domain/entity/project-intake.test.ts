import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createProjectIntake, hashResumeToken } from "./project-intake.js";

describe("ProjectIntake", () => {
  it("issues a hashed private resume token for a public draft", () => {
    const { intake, resumeToken } = createProjectIntake({ category: "photography" });
    assert.ok(resumeToken);
    assert.notEqual(intake.resumeTokenHash, resumeToken);
    assert.equal(intake.resumeTokenHash, hashResumeToken(resumeToken));
    assert.equal(intake.status, "draft");
  });

  it("binds a client draft to its owner without a public resume token", () => {
    const { intake, resumeToken } = createProjectIntake({ ownerId: "client-42", category: "cleaning" });
    assert.equal(resumeToken, undefined);
    assert.equal(intake.resumeTokenHash, undefined);
    assert.equal(intake.ownerId, "client-42");
  });
});
