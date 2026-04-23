## Fixing issue
Investigate and fix this issue end-to-end in the current codebase.

Problem:
- Error: [paste the exact error message]
- Optional: [describe the broken behavior in 1-2 sentences]
- Optional file/location: [path, component, route, or screenshot hint]

Instructions:
- Infer the tech stack, relevant libraries, versions, and architecture from the repository itself. Do not ask me for stack details unless the repo truly does not contain them.
- Start by locating the code path that produces the error.
- Read the relevant local implementation before changing anything.
- Read the relevant official documentation carefully before fixing it.
- Do not rely only on base-library docs if this repo uses a wrapper, adapter, framework integration, or generated client. Verify the exact API contract used in this project.
- If needed, inspect installed package types/source to confirm the real contract.
- Find the root cause, not just a workaround.
- Implement the smallest correct fix in the codebase.
- Preserve existing patterns and avoid unrelated refactors.
- Verify the fix with the most relevant checks available in the repo, such as typecheck, tests, lint, or build.
- If unrelated errors block full verification, separate them clearly from the issue being fixed.

In your final response, include:
1. Root cause
2. What you changed
3. What you verified
4. Remaining risks, assumptions, or unrelated errors
