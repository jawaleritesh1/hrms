# Workflow & Diagnosis Rules

## 1. Project Tracking & Documentation
*   **Disabled**: Project tracking, task updating in JSON files (`tasks.json`, `daily-log.json`, `daily-status-feed.json`, `project-memory.json`), and Excel sync (`HRMS_Project_Management.xlsx`) are stopped and disabled per user instruction. Do not update or run sync-excel for these files.

## 2. Issue Diagnosis and Verification Workflow
*   **Trigger:** Whenever the user reports an issue or bug.
*   **Required Action Workflow:**
    1.  **Verify the Issue** – First, investigate whether the reported problem actually exists. Do not assume user observations are always correct or immediately start making changes.
    2.  **Find the Root Cause** – If confirmed, identify the actual root cause instead of treating only the visible symptom.
    3.  **Explain Your Findings** – Briefly explain, in simple terms, what the problem is, why it is happening, and what you plan to change to fix it.
    4.  **Wait for Confirmation** – Do not start editing code files, committing, or pushing changes until the user explicitly confirms that the diagnosis and proposed approach are correct.
    5.  **Implement the Fix** – After approval, make the necessary changes.
    6.  **Let the User Verify** – Once changes are complete, stop and let the user test whether the issue has actually been resolved.
    7.  **Finalize Only After Confirmation** – Only after the user confirms the fix is working should you commit the changes and push them to the repository.
