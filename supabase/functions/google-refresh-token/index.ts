import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { userId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Получить refresh token
    const { data: settings } = await supabase
      .from("user_settings")
      .select("google_refresh_token")
      .eq("user_id", userId)
      .single();

    if (!settings?.google_refresh_token) {
      return new Response(JSON.stringify({ error: "No refresh token" }), {
        status: 400, headers: CORS,
      });
    }

    // Обновить access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: settings.google_refresh_token,
        client_id:     Deno.env.get("GOOGLE_CLIENT_ID")!,
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
        grant_type:    "refresh_token",
      }),
    });

    const tokens = await tokenRes.json();

    // Сохранить новый access token
    await supabase.from("user_settings").update({
      google_access_token: tokens.access_token,
      google_token_expiry: Date.now() + tokens.expires_in * 1000,
    }).eq("user_id", userId);

    return new Response(JSON.stringify({ access_token: tokens.access_token }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});