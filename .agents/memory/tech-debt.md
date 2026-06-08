# Technical Debt & Pending Fixes

## Remaining Static Mock Data
As of the latest iteration, the following features still use static mock data or placeholders because backend support is pending. These need to be replaced with real APIs in the future:

1. **Send to Friends List (`SendSheet.tsx`)**
   - **Current State**: Uses a hardcoded `MOCK_FRIENDS` array.
   - **Required Fix**: Fetch the user's actual `following` list from the backend (`GET /social/:id/following`) via `authStore` or `chatStore`.

2. **Profile Default Reels (`profile.tsx`)**
   - **Current State**: Displays `defaultMockReels` (6 dummy thumbnail images) if a user hasn't posted any reels.
   - **Required Fix**: Remove `defaultMockReels`. Implement a clean "No reels posted yet" empty state UI.

3. **Referral List (`referral-list.tsx`)**
   - **Current State**: Shows a hardcoded list of referred users.
   - **Required Fix**: Build a referral system backend and connect to it, or default to an empty state "No friends referred yet".

4. **Music Picker (`music-picker.tsx` & `story-editor.tsx`)**
   - **Current State**: Uses a hardcoded `MOCK_SONGS` array.
   - **Required Fix**: Decide whether to build a `Music` table in the backend to provide a dynamic music library or keep using a hardcoded "Platform Provided Library" for demo purposes.

5. **Rewards & Analytics (`rewards.tsx`)**
   - **Current State**: Displays dummy calculated charts and revenue splits.
   - **Required Fix**: Replace dummy calculations with actual `coinsEarned` from the real `userProfile`, and implement a robust analytics engine for the other metrics.
