# Security Specification: ScholarPath ABAC & Zero-Trust Rules

## 1. Data Invariants
1. **User Identity Boundary**: Students can read and write only their own user profile document (`/users/{userId}`) where `request.auth.uid == userId`.
2. **PII Isolation**: Contact and sensitive personal details (matric/inter marks, income range, education profile) are isolated in `/users/{userId}` and only readable by the owner or authenticated admins.
3. **Scholarships Integrity**: Anyone (including unauthenticated visitors searching for opportunities) can read published scholarships (`/scholarships/{scholarshipId}`), but only verified Admins can create, update, verify, or delete scholarship criteria.
4. **Student Subcollections Integrity**: User's saved scholarships, documents, and application drafts exist only under `/users/{userId}/...` and can strictly only be accessed/modified if `request.auth.uid == userId`.
5. **No Self-Assigned Privileges**: Normal users cannot promote themselves to admins or modify the `role` field to `admin`.
6. **Immutable IDs & Timestamps**: IDs cannot be tampered with, string lengths are strictly capped, and unverified shadow fields are prohibited.

## 2. The "Dirty Dozen" Payloads (Must be rejected)
1. **Payload 1 (Identity Spoofing - Profile Write)**: Unauthenticated or User B writes to `/users/UserA`.
2. **Payload 2 (Privilege Escalation)**: Student updates `/users/{userId}` with `role: "admin"`.
3. **Payload 3 (Unauthorized Scholarship Mutation)**: Non-admin student attempts to create or edit `/scholarships/daad-germany-2026`.
4. **Payload 4 (Denial of Wallet - Oversized String)**: Writing a 500KB string into `fullName` or `notes`.
5. **Payload 5 (Path Variable Injection)**: Document ID containing path traversal characters like `../../admin`.
6. **Payload 6 (Shadow Field Injection)**: Attempting to inject `isVerified: true` into a student's document or scholarship directly without authorization.
7. **Payload 7 (Subcollection Cross-Tenant Read)**: User B listing `/users/UserA/savedScholarships`.
8. **Payload 8 (Subcollection Cross-Tenant Write)**: User B creating a document in `/users/UserA/documents`.
9. **Payload 9 (Terminal State Bypass)**: Expired scholarship modified by student.
10. **Payload 10 (Admin Role Injection)**: Ordinary user writing to `/admins/{newAdminUid}`.
11. **Payload 11 (Blanket Unrestricted Query)**: Attempting to query all documents of other users.
12. **Payload 12 (Draft Content Hijacking)**: User B editing User A's generated motivation letter.

## 3. Test Runner Specification
Tests verify that all 12 unauthorized payloads result in `PERMISSION_DENIED`, while valid owner and admin actions are authorized.
