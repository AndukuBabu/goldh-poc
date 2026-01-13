# GOLDH Master Operational Rules (v1.6)

## SECTION I: Governance & Approval
1. **Human-in-the-Loop:** Every change MUST be confirmed with the user before proceeding. No auto-commits.
2. **Plan-Act-Reflect:** Output a `PLAN.md` before acting; provide a "Reflection" summary after completion.

## SECTION II: Visual & Tabular Standards (Screen-Ready)
3. **Text-Based Architecture:** Use "Box-and-Arrow" ASCII/Markdown diagrams for system overviews. These must be wrapped in code blocks for fixed-width alignment.
4. **Strict Markdown Tables:** All functional logic, workflows, and data mappings MUST use Markdown tables.
   - Use bold headers and clear separators.
   - No dense paragraphs for "Step-by-Step" instructions.
5. **Universal Compatibility:** All UI and documentation must be Mobile-First and responsive.

## SECTION III: Documentation Structure
6. **Infrastructure Core:** Maintain `/docs/INFRASTRUCTURE.md` using the "Text-Architecture" format.
7. **Feature-Level Docs:** Use `/docs/features/[name].md`. Every file must include:
   - **C-Suite Snapshot:** Executive summaries for CEO (Strategy), CFO (Costs), and Marketing (Value).
   - **Workflow Tables:** Use the Step | Action | Result format for every user journey.
   - **Technical Section:** Data Dictionary (Tables) and API logic.
8. **Shadow Docs:** Log bugs/gotchas in `TROUBLESHOOTING.md` if resolution takes > 2 mins.

## SECTION IV: QA, Security & Financials
9. **QA Rigor:** Maintain `/QA/` test cases in tabular format.
10. **Cost Forecasting:** Use a "Financial Table" for 10k/100k user projections in `INFRASTRUCTURE.md`.
11. **Secret Guardrail:** Use `<PLACEHOLDERS>` for all keys/tokens.
12. **Export Ready:** Use standard Markdown + YAML frontmatter for high-fidelity exports.