import { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, getUserProfile } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false); // ✅ Finish loading if no user
        return;
      }

      try {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(firebaseUser);
        setRole(profile?.role || null);
      } catch (err) {
        console.error("❌ Failed to load user profile:", err);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false); // ✅ Finish loading after user/profile check
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
