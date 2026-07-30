# SentinelAI - Development Rules

## Objective

These rules must be followed throughout the development of SentinelAI.

---

# General Rules

* Keep the code clean and easy to understand.
* Build one module at a time.
* Do not change the project architecture without discussion.
* Reuse existing code whenever possible.
* Write modular and maintainable code.

---

# Frontend Rules

* Use React with TypeScript.
* Keep components small and reusable.
* Separate UI from business logic.
* Call the backend only through API services.

---

# Backend Rules

* Use FastAPI.
* Keep business logic inside services.
* Validate all user input.
* Return structured JSON responses.
* Handle errors properly.

---

# Database Rules

* Use PostgreSQL.
* Keep table names simple and meaningful.
* Avoid duplicate data.
* Use relationships where appropriate.

---

# AI Rules

* Use Ollama as the default AI provider.
* The AI should only assist users.
* AI must never perform critical actions automatically.
* Keep the AI provider separate from business logic.

---

# Security Rules

* Use JWT Authentication.
* Use Role-Based Access Control (RBAC).
* Validate every API request.
* Log important security events.
* Never store sensitive information in source code.

---

# Git Rules

* Make small commits.
* Use meaningful commit messages.
* Test before committing.

---

# Development Process

For every module:

1. Design
2. Build
3. Test
4. Review
5. Merge

Do not start the next module until the current one is working.

---

# Goal

Build a clean, secure, maintainable, and production-quality Enterprise AI Security Platform.
