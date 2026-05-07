import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TrackingClient from "./TrackingClient";

type Props = { params: Promise<{ id: string }> };

export default async function TrackingPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: booking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

    if (!booking) notFound();
    if (booking.user_id !== user.id && user.email !== "resulthub001@gmail.com") {
        redirect("/dashboard");
    }

    return <TrackingClient booking={booking} />;
}
