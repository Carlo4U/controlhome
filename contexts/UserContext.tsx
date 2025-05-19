import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api } from '../convex/_generated/api';

// Define the shape of the context
interface UserContextType {
  username: string;
  setUsername: (username: string) => void;
  email: string;
  setEmail: (email: string) => void;
  profileImage: string | null;
  setProfileImage: (uri: string | null) => void;
  fullname: string;
  setFullname: (fullname: string) => void;
  userId: string | null;
  isLoading: boolean;
}

// Create the context with default values
const UserContext = createContext<UserContextType>({
  username: '',
  setUsername: () => {},
  email: '',
  setEmail: () => {},
  profileImage: null,
  setProfileImage: () => {},
  fullname: '',
  setFullname: () => {},
  userId: null,
  isLoading: true,
});

// Create a provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState('User');
  const [email, setEmail] = useState('user@example.com');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullname, setFullname] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the current user from Clerk
  const { isSignedIn, userId: clerkUserId } = useAuth();

  // Get user data from Convex if signed in
  const userData = useQuery(
    api.users.getUserByClerkId,
    isSignedIn && clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  useEffect(() => {
    console.log("UserContext: Auth state changed", { isSignedIn, clerkUserId, userData: userData !== undefined ? "loaded" : "loading" });

    // If userData is defined (query has completed)
    if (userData !== undefined) {
      if (userData) {
        // User exists in Convex
        console.log("UserContext: User data loaded from Convex");
        setUsername(userData.username || 'User');
        setEmail(userData.email || 'user@example.com');
        setProfileImage(userData.image || null);
        setFullname(userData.fullname || '');
        setUserId(userData._id || null);
      } else {
        // User doesn't exist in Convex yet (null result)
        console.log("UserContext: User not found in Convex");
        // Keep default values but update email if available from Clerk
        // This will be the case for new users
      }
      setIsLoading(false);
    } else if (!isSignedIn) {
      // Reset to defaults if not signed in
      console.log("UserContext: User not signed in, using defaults");
      setUsername('User');
      setEmail('user@example.com');
      setProfileImage(null);
      setFullname('');
      setUserId(null);
      setIsLoading(false);
    } else {
      // User is signed in but userData is still loading
      console.log("UserContext: Waiting for user data to load");
      // Keep isLoading true
    }
  }, [userData, isSignedIn, clerkUserId]);

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        email,
        setEmail,
        profileImage,
        setProfileImage,
        fullname,
        setFullname,
        userId,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Create a hook to use the context
export const useUser = () => useContext(UserContext);