const { validateUserPayload } = require("../utils/validators");
const Users = require("../models/users");
const admin = require("firebase-admin");

// Create user (manager-only; username unique)
// Also creates user in Firebase Authentication
async function createUser(req, res) {
  try {
    const body = req.body;
    const errors = validateUserPayload(body);
    if (errors.length) return res.status(400).json({ errors });

    // Email and password are required for Firebase Auth
    const email = body.email;
    const password = body.password || "Password123!"; // Default password if not provided

    if (!email) {
      return res
        .status(400)
        .json({ error: "Email is required to create user authentication" });
    }

    let uid = body.uid;

    // Create user in Firebase Authentication if no uid provided
    if (!uid) {
      try {
        const userRecord = await admin.auth().createUser({
          email: email,
          password: password,
          displayName: body.name,
          disabled: false,
        });
        uid = userRecord.uid;
        console.log("Firebase Auth user created:", uid);
      } catch (authError) {
        console.error("Firebase Auth error:", authError);
        if (authError.code === "auth/email-already-exists") {
          return res
            .status(400)
            .json({ error: "Email already exists in authentication system" });
        }
        return res
          .status(400)
          .json({ error: `Failed to create auth user: ${authError.message}` });
      }
    }

    // Create user document in Firestore
    const userData = {
      ...body,
      uid: uid,
    };
    delete userData.password; // Don't store password in Firestore
    delete userData.email; // Optionally store email or not

    await Users.create(userData);

    return res.status(201).json({
      ok: true,
      uid: uid,
      message: "User created successfully. Default password: " + password,
    });
  } catch (err) {
    console.error("Create user error:", err);
    const msg = err && err.message ? err.message : "Failed to create user";
    return res.status(400).json({ error: msg });
  }
}

// List users (manager-only)
async function listUsers(_req, res) {
  try {
    const data = await Users.list();
    return res.json(data);
  } catch (err) {
    console.error("List users error:", err);
    return res.status(500).json({ error: "Failed to list users" });
  }
}

// List users public info (any authenticated user) - returns only id and name
async function listUsersPublic(_req, res) {
  try {
    const data = await Users.list();
    // Return only public info: id and name
    const publicData = data.map((user) => ({
      id: user.id,
      name: user.name,
      isManager: user.isManager,
    }));
    return res.json(publicData);
  } catch (err) {
    console.error("List users public error:", err);
    return res.status(500).json({ error: "Failed to list users" });
  }
}

// Get user (self or manager)
async function getUser(req, res) {
  try {
    const uid = req.params.uid;
    if (!req.role.isManager && uid !== req.user.uid) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const user = await Users.getById(uid);
    if (!user) return res.status(404).json({ error: "Not found" });
    return res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ error: "Failed to get user" });
  }
}

// Update user (manager-only)
async function updateUser(req, res) {
  try {
    const uid = req.params.uid;
    const payload = req.body || {};
    delete payload.userName; // immutable
    delete payload.password; // don't update password this way
    delete payload.email; // don't update email this way

    await Users.update(uid, payload);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ error: "Failed to update user" });
  }
}

// Delete user (manager-only)
// Also deletes user from Firebase Authentication
async function deleteUser(req, res) {
  try {
    const uid = req.params.uid;

    // Delete from Firestore first
    const ok = await Users.remove(uid);
    if (!ok) return res.status(404).json({ error: "Not found" });

    // Try to delete from Firebase Auth (may fail if user doesn't exist there)
    try {
      await admin.auth().deleteUser(uid);
      console.log("Firebase Auth user deleted:", uid);
    } catch (authError) {
      // Log but don't fail - user might not exist in Auth
      console.warn("Could not delete from Firebase Auth:", authError.message);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ error: "Failed to delete user" });
  }
}

// Reset user password (manager-only)
async function resetPassword(req, res) {
  try {
    const uid = req.params.uid;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    await admin.auth().updateUser(uid, {
      password: newPassword,
    });

    return res.json({ ok: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
}

module.exports = {
  createUser,
  listUsers,
  listUsersPublic,
  getUser,
  updateUser,
  deleteUser,
  resetPassword,
};
