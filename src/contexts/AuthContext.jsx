import { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged } from "../firebase";

const AuthContext = createContext();

const MECHANIC_EMAIL = "protocolnetwork18052687686@gmail.com";

// Force role based on email
const assignRole = (email) =>
  email?.trim().toLowerCase() === MECHANIC_EMAIL ? "mechanic" : "customer";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      setRole(assignRole(firebaseUser.email)); // ✅ always force role from email
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
