import User from "@/models/User";

export async function findUserByEmail(email) {
  return await User.findOne({ email }).select("+password +refreshToken");
}

export async function findUserByUsername(username) {
  return await User.findOne({ username });
}

export async function findUserById(id) {
  return await User.findById(id).select("+password +refreshToken");
}

export async function createUser(userData) {
  return await User.create(userData);
}

export async function saveRefreshToken(userId, refreshToken) {
  return await User.findByIdAndUpdate(
    userId,
    { refreshToken },
    { new: true }
  );
}

export async function verifyUser(userId) {
  return await User.findByIdAndUpdate(
    userId,
    { isVerified: true },
    { new: true }
  );
}

export async function updateLastLogin(userId) {
  return await User.findByIdAndUpdate(
    userId,
    { lastLogin: new Date() },
    { new: true }
  );
}