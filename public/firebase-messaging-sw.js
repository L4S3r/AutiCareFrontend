import { getMessaging, register, onRegistered } from "firebase/messaging";
import { app } from "@/config/firebase";

export async function syncWebNotificationToken() {
    try {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

        const messaging = getMessaging(app);

        // 1. Request native browser notification permissions
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("🔔 Browser notification permissions denied by user.");
            return;
        }

        // 2. Register the callback listener to catch the app's unique Installation ID
        onRegistered(messaging, async (installationId) => {
            console.log("🌐 [FID Caught] Unique App Instance Identifier:", installationId);

            // 3. Post the Installation ID straight to your existing backend route
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/fcm-token`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ fcmToken: installationId }) // MongoDB saves this seamlessly
            });
        });

        // 4. Execute the secure instance registration routine
        await register(messaging);

    } catch (err) {
        console.error("✖ FID Instance synchronization failed:", err);
    }
}