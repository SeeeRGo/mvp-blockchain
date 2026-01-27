"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Component to initialize the demo university in the database
 * This should be included in your app layout or main page to ensure
 * the demo university exists before users try to create diplomas
 */
export default function DatabaseInitializer() {
  const ensureDemoUniversity = useMutation(api.universities.ensureDemoUniversity);

  useEffect(() => {
    // Initialize demo university on component mount
    const init = async () => {
      try {
        await ensureDemoUniversity();
        console.log("Demo university initialized successfully");
      } catch (error) {
        console.error("Failed to initialize demo university:", error);
      }
    };

    init();
  }, [ensureDemoUniversity]);

  // This component doesn't render anything
  return null;
}
