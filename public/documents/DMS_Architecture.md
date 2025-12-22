# Document Management System (DMS) Logic

## Overview
This document explains the architecture and logic behind the Smart Document Hub implemented for the Caterham Rotary Admin Dashboard.

## Architecture
- **Frontend**: React.js with `AdminDocuments.jsx` as the view controller.
- **Service Layer**: `documentService.js` handles data persistence and business logic.
- **Storage**: Currently utilizes browser `localStorage` for metadata persistence. File content is simulated or served from the `/public/documents` directory.

## Smart Features
1.  **AI Auto-Tagging**:
    The system analyzes the document title and file type on upload:
    - Keywords like "Minutes" or "AGM" trigger tags: `meeting`, `record`.
    - "Insurance" triggers: `finance`, `critical` + Auto-Expiry setting.
    - Images trigger: `media`, `visual`.

2.  **Expiry Tracking**:
    - Critical documents (e.g., Insurance) are automatically assigned an expiry date (1 year by default).
    - The UI displays a warning badge if a document expires within 30 days.

3.  **Secure Sharing**:
    - Generates a unique, randomized sharing link (simulated) for external access.
    - Tracks "Shared" status in the metadata.

4.  **Version Control**:
    - If a document is updated (same ID but different content size), the version number increments automatically.

## Future Enhancements
- Integration with valid Cloud Storage (e.g., AWS S3 or Google Cloud Storage) for real file persistence.
- Server-side text analysis for improved tagging accuracy.
