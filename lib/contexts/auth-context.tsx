"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePrivy, User } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: {
    id?: string;
    walletAddress?: string;
    email?: string;
  } | null;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  connectWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const {
    ready,
    authenticated,
    user: privyUser,
    login: privyLogin,
    logout: privyLogout,
    connectWallet: privyConnectWallet,
  } = usePrivy();

  console.log("Privy State:", { ready, authenticated, user: privyUser });

  const [state, setState] = useState<AuthState>({
    isLoading: false,
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    if (!ready) return;

    setState((prev) => ({
      ...prev,
      isAuthenticated: authenticated,
      user:
        authenticated && privyUser
          ? {
              id: privyUser.id,
              walletAddress: privyUser.wallet?.address,
              email: privyUser.email?.address,
            }
          : null,
    }));
  }, [ready, authenticated, privyUser]);

  const login = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      await privyLogin();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      await privyLogout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const connectWallet = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      await privyConnectWallet();
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        connectWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
