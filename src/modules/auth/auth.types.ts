export interface SignupBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

// Shape returned to the React Native client
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
  };
}
