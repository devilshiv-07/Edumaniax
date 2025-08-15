import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const ComputersContext = createContext();

export const ComputersProvider = ({ children }) => {
    const { user } = useAuth();
    const token = user?.token; 
    const userClass = user?.userClass;
    const server = import.meta.env.VITE_API_URL;

    const [progress, setProgress] = useState([]);

    // Fetch progress for logged-in user
    const fetchComputersChallenges = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${server}/computers/get-challenges`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProgress(res.data.progress || []);
            return { success: true };
        } catch (err) {
            console.error("Error fetching progress:", err);
            return {
                success: false,
                message: err.response?.data?.error || "Failed to fetch progress",
            };
        }
    };

    // Mark a challenge complete
    const completeComputersChallenge = async (moduleIndex, challengeIndex) => {
        if (!user) return;
        if (!userClass) return;


        const isAlreadyCompleted = progress?.some(
            (entry) =>
                entry.userClass === userClass &&
                entry.moduleIndex === moduleIndex &&
                entry.challengeIndex === challengeIndex &&
                entry.completed
        );

        if (isAlreadyCompleted) {
            return;
        }
        try {
            const res = await axios.post(
                `${server}/computers/challenge-complete`,
                { userClass, moduleIndex, challengeIndex },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // Optimistically update progress
            if (res.data?.progress) {
                setProgress((prev) => [...prev, res.data.progress]);
                toast.success("Challenge completed!");
            }

            return { success: true };
        } catch (err) {
            console.error("Error marking challenge complete:", err);
            return {
                success: false,
                message: err.response?.data?.error || "Failed to mark complete",
            };
        }
    };

    useEffect(() => {
        if (token && user) {
            fetchComputersChallenges();
        }
    }, [token, user]);

    useEffect(() => {
        if (!user) {
            setProgress([]); // 🔁 Reset progress when user logs out
        }
    }, [user]);

    return (
        <ComputersContext.Provider
            value={{
                progress,
                fetchComputersChallenges,
                completeComputersChallenge,
            }}
        >
            {children}
        </ComputersContext.Provider>
    );
};

export const useComputers = () => useContext(ComputersContext);
