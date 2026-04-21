# Copilot instructions for this repository

## Tutorial identity
This repository follows this tutorial exactly:

- Tutorial: Build and Deploy a Multi-Vendor E-Commerce Marketplace
- Instructor: Code With Antonio
- Repository reference: code-with-antonio/next15-multitenant-ecommerce

The tutorial is built chapter by chapter.
Each chapter represents a partial state of the app, not the final app.

You must treat the current repository state as intentionally incomplete.

## Main rule
I am coding along with the tutorial to learn.

Your job is to help me make only the next small tutorial-aligned change.
Do not generate the final implementation.
Do not fill in future features.
Do not infer missing advanced architecture from the full project idea.

## Current tutorial scope
Current chapter: 02 Customization

For this chapter, assume the work is limited to basic customization only, such as:
- simple UI changes
- styling changes
- layout adjustments
- small configuration edits
- small component edits that are already implied by the current code

Do not suggest:
- backend logic
- database models
- Payload collections
- Stripe logic
- Stripe Connect logic
- tenant domain logic
- checkout logic
- product/review/library systems
- advanced server actions
- caching strategies
- app-wide refactors
- production-grade abstractions
- code for future chapters

## Suggestion boundary
Only suggest code that is directly supported by:
1. the current file
2. nearby imports and components
3. patterns already visible in this branch
4. the narrow goal of chapter 02 customization

If something is not clearly required by the current file or this chapter, do not suggest it.

## Completion style
Prefer:
- small edits over large generated blocks
- modifying existing code over creating many new files
- simple tutorial-style code over reusable abstractions
- readable code over optimized code
- consistency with nearby files over generic best practices

## Anti-spoiler rule
Never autocomplete code that belongs to a later chapter, even if it seems useful.
If a future-step implementation is possible, do not suggest it unless I explicitly ask for it.

## When uncertain
If unsure whether something belongs to chapter 02:
- choose the simpler suggestion
- avoid adding new architecture
- avoid creating new data flow
- avoid new dependencies

## Output preference
When possible, prefer:
- the next line
- the next function change
- the next small JSX update
instead of a complete file rewrite.