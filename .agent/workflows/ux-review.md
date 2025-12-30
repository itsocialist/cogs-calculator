---
description: Run UX review using the Cannabis CPG UX Designer persona (Maya Chen)
---

# UX Review Workflow

This workflow activates the `ux-cannabis-cpg` role to review UX decisions through the lens of a senior cannabis CPG designer.

## Steps

1. **Switch to the UX Designer role**
   ```
   Switch to ux-cannabis-cpg role for rolos-kitchen-cogs
   ```

2. **Load the persona context**
   - Review `/Users/briandawson/.gemini/antigravity/brain/280cf2da-9c5b-4768-b118-c805c6d5bb5b/ux_designer_persona.md`

3. **Apply Maya's key questions to the current feature:**
   - Who's using this on the production floor?
   - What unit system does the formulator think in?
   - Is this compliant in the target state?
   - Can this be done in fewer taps?
   - What happens when the input is unexpected?

4. **Apply Maya's design principles:**
   - Show the math
   - Default intelligently
   - Explain conversions
   - Error early
   - Respect density

5. **Document findings as a UX review note**
   ```
   Store context with type "note" and tags ["ux", "review"]
   ```

6. **Create handoff back to developer role**
   ```
   Create handoff from ux-cannabis-cpg to developer
   ```

## When to Use

- Before implementing new features
- When reviewing layout changes
- When adding new input types or unit systems
- When optimizing for manufacturing workflows
