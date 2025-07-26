import { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged } from "../firebase";

const AuthContext = createContext();

const MECHANIC_EMAIL = "protocolnetwork18052687686@gmail.com";

// Force role based on email every time
const assignRole = (email) =>
  email?.trim().toLowerCase() === MECHANIC_EMAIL ? "mechanic" : "customer";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      const userEmail = firebaseUser.email;
      setUser(firebaseUser);
      setRole(assignRole(userEmail)); // ✅ Force role by email
      setLoading(false);
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
