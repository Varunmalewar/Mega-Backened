# TODO: Fix updateProfile to prevent nullifying fields when partially updating

## Steps:
1. Modify the updateProfile function in controllers/Profile.js to only update fields that are provided in req.body
2. For User model (firstName, lastName): Conditionally update only if present in req.body
3. For Profile model (dateOfBirth, about, contactNumber, gender): Conditionally update only if present in req.body
4. Test the fix by updating only the "about" field and verify firstName and lastName are not set to null or empty
5. Verify the updated user details are returned correctly
