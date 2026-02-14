export type UserRole = "AUTHOR" | "BUYER" | "ADMIN";

export interface RegisterPayload {
  // user table fields
  name: string;
  email: string;
  password?: string;
  role: UserRole;

  // Profile Table Fields (Optional based on migration)
  bio?: string;
  location?: string;
  specialty?: string;
  years_experience?: number | string; // Handled as string from input, converted to number
  phone_contact?: string;
  profile_picture?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: "ACTIVE" | "INACTIVE";
  };
  token?: string; // If your backend returns a token on registration
}
