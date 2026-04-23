// src/hooks/useDashboardData.ts

import { useEffect, useState } from "react";
import { fetchUserProfile } from "../services/userApiService";

/**
 * Defines the structure of data returned by the custom hook.
 */
export interface DashboardState {
    data: string | null;
    loading: boolean;
    error: string | null;
}

/**
 * Custom Hook to manage state and fetch user data.
 * This abstracts all side effects, ensuring the component remains a pure presenter.
 * @returns An object containing the current state (data, loading status, error).
 */
export const useDashboardData = (): DashboardState => {
    // Initialize state with strict typing
    const [state, setState] = useState<DashboardState>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const loadUserData = async () => {
            setState(prev => ({ ...prev, loading: true, error: null })); // Start loading and clear old errors
            
            // 1. Retrieve token and handle missing state immediately
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                setState({ data: null, loading: false, error: "Authentication token is missing." });
                return;
            }

            try {
                // 2. Execute the clean API call service
                const resultMessage = await fetchUserProfile();
                
                if (resultMessage) {
                    setState({ data: resultMessage, loading: false, error: null });
                } else {
                     // Handle case where API succeeds but message is unexpectedly null
                    throw new Error("Received an empty profile message.");
                }

            } catch (err: unknown) {
                // 3. Unified error handling path for all failures
                console.error("Dashboard data fetch failed:", err);
                const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
                setState({
                    data: null,
                    loading: false,
                    error: `Failed to load user profile. ${errorMessage}`,
                });

            } finally {
                 // Ensure loading status is always reset upon completion (success or failure)
                setState(prev => ({ ...prev, loading: false })); 
            }
        };

        loadUserData();
    }, []); // Runs only once on mount

    return state;
};
