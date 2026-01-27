# Convex Validation Error Fix

## Problem
The `createDiploma` mutation was failing with:
```
ArgumentValidationError: Value does not match validator.
Path: .ownerId
Value: "user_demo_001"
Validator: v.id("users")
```

The issue was that the mutation expected a valid Convex user ID (`v.id("users")`), but the code was passing a plain string `"user_demo_001"` which is not a valid Convex ID format.

## Solution

### 1. Created User Management Module
**File: `convex/users.ts`**
- Added functions to manage users:
  - `getByEmail`: Query to get user by email
  - `getOrCreate`: Mutation to get existing user or create new one
  - `updatePublicKey`: Update user's public key
  - `updateDeviceToken`: Update user's device token for push notifications

### 2. Updated createDiploma Mutation
**File: `convex/universities.ts`**
- Changed argument from `ownerId: v.id("users")` to `ownerEmail: v.string()`
- Added logic to get or create user based on email:
  ```typescript
  const existingUser = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", args.ownerEmail))
    .first();

  let ownerId: any;
  if (!existingUser) {
    ownerId = await ctx.db.insert("users", {
      email: args.ownerEmail,
      createdAt: Date.now(),
    });
  } else {
    ownerId = existingUser._id;
  }
  ```

### 3. Updated Upload Page
**File: `app/upload/page.tsx`**
- Added `studentEmail` field to form state
- Added email input field in the form
- Changed mutation call from `ownerId` to `ownerEmail`:
  ```typescript
  const result = await createDiploma({
    universityId,
    ownerEmail: formData.studentEmail,
    data: formData,
  });
  ```

### 4. Updated University Portal
**File: `app/university/page.tsx`**
- Added `studentEmail` field to CreateDiplomaModal form state
- Added email input field in the modal form
- Updated onSubmit handler to pass correct parameters:
  ```typescript
  await createDiploma({
    universityId,
    ownerEmail: data.studentEmail,
    data: data,
  });
  ```

## Benefits
1. **Automatic User Creation**: Users are automatically created when a diploma is issued
2. **Email-based Identification**: Uses email as the primary identifier, which is more user-friendly
3. **No Manual ID Management**: Developers don't need to manage user IDs manually
4. **Consistent Data**: Ensures all diplomas have valid user references

## Testing
To test the fix:
1. Navigate to the Upload Diploma page
2. Fill in the form including the new Student Email field
3. Submit the form
4. The diploma should be created successfully without validation errors

The same applies to the University Portal's Create Diploma modal.
