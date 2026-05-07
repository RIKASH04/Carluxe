import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");
    if (user.email !== "resulthub001@gmail.com") redirect("/dashboard");

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const [
        { count: totalUsers },
        { count: totalBookings },
        { count: todayBookings },
        { data: recentBookings },
    ] = await Promise.all([
        supabase.from("bookings").select("*", { count: "exact", head: true }).neq("user_id", ""),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }).eq("booking_date", today),
        supabase
            .from("bookings")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50),
    ]);

    return (
        <AdminClient
            initialStats={{
                totalUsers: totalUsers ?? 0,
                totalBookings: totalBookings ?? 0,
                todayBookings: todayBookings ?? 0,
            }}
            initialBookings={recentBookings || []}
        />
    );
}
