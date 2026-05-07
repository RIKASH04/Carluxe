import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            const isAdmin = data.user.email === "resulthub001@gmail.com";
            return NextResponse.redirect(`${origin}${isAdmin ? "/admin" : "/dashboard"}`);
        }
    }

    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
