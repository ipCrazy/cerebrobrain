import  { Schema, Document , model , models } from "mongoose";
import bcrypt from "bcryptjs";


interface User extends Document {
  name: string;
  email: string;
  password: string;
}

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  const user = this as User;

  if (!user.isModified("password")) {
    return next();
  }

  console.log("--- REGISTRATION DEBUG: PRE-SAVE ---");
  // KLJUČNO: Pogledaj OVU VREDNOST!
  console.log("Password property BEFORE hashing in pre-save hook:", user.password); // OPREZ: NIKADA U PROD!
  console.log("Does it look like a bcrypt hash already? (Starts with $2a$ or $2b$)");


  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  console.log("Password property AFTER hashing in pre-save hook:", user.password);
  console.log("--- END REGISTRATION DEBUG: PRE-SAVE ---");

  next();
});

// Kreiraj i exportuj model samo ako vec ne postoji

const UserModel = models.User || model<User>("User", userSchema);

// Dodaj funkciju za dobijanje korisnika po ID-u
export async function getUserById(userId: string) {
  try {
    const user = await UserModel.findById(userId).exec();
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

export default UserModel;