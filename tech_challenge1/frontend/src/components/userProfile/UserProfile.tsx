import React, { useState, useEffect } from "react";
import styles from "./UserProfile.module.css";
import { usersAPI } from "../../api";
import LoadingSpinner from "../LoadingSpinner";
import ErrorPage from "../ErrorPage";

interface User {
  uuid: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface UserProfileProps {
  userId?: string; // If not provided, shows current user
}

export default function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = userId
          ? await usersAPI.getById(userId)
          : await usersAPI.getMe();
        setUser(data.user || data);
      } catch (err: any) {
        console.error("Error fetching user:", err);

        // Fallback to mock user data if backend is not available
        if (
          err.code === "ECONNREFUSED" ||
          err.message?.includes("Network Error")
        ) {
          console.log("Backend not available, using mock user data");
          setUser({
            uuid: userId || "demo-user",
            name: "Demo User",
            email: "demo@example.com",
            role: "user",
            createdAt: new Date().toISOString(),
          });
        } else {
          setError(err.response?.data?.error || "Failed to load user profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return <LoadingSpinner message="Loading user profile..." />;
  }

  if (error || !user) {
    return (
      <ErrorPage title="Profile Error" message={error || "User not found"} />
    );
  }

  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
        <div>
          <h1>{user.name}</h1>
          <p className={styles.role}>{user.role}</p>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.field}>
          <label>Email:</label>
          <span>{user.email}</span>
        </div>
        <div className={styles.field}>
          <label>User ID:</label>
          <span>{user.uuid}</span>
        </div>
        {user.createdAt && (
          <div className={styles.field}>
            <label>Joined:</label>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
