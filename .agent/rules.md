# User Rules

## Tool Usage Protocols

### Browser & Verification
- **NO VISUAL POP-UPS**: Do NOT use the `browser_subagent` (visual browser) for standard checks (text verification, link checking, code reading). It steals focus and is annoying.
- **USE BACKGROUND TOOLS**: Always prioritize `read_url_content` or `curl` for verification.
- **EXCEPTION**: Only use the visual browser if checking specific **visual layout** issues (CSS, alignment, overlap) AND there is no other way.
