# Shared Types

This directory contains shared TypeScript types and constants used across the frontend and backend.

## Usage

Import types in your frontend code:

```typescript
import { JobStatus, SeparationJob, SeparatedTracks } from '@shared/types';
```

## Files

- `types.ts` - Shared TypeScript interfaces and enums
- `constants.ts` - Shared constants (API endpoints, config values)

## Note

While the backend is in Python, these TypeScript types serve as the source of truth for the API contract. The Python Pydantic models in `backend/app/models/schemas.py` should mirror these types.
