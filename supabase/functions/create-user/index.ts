import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CreateUserRequest = {
  fullName?: unknown;
  email?: unknown;
  password?: unknown;
  roleId?: unknown;
  isActive?: unknown;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ message: "Método no permitido." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("Authorization");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ message: "Configuración incompleta del servidor." }, 500);
  }

  if (!authorization) {
    return jsonResponse({ message: "Sesión requerida." }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user: caller },
    error: callerError,
  } = await userClient.auth.getUser();

  if (callerError || !caller) {
    return jsonResponse({ message: "Sesión inválida." }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerProfile, error: callerProfileError } = await adminClient
    .from("profiles")
    .select("id, role_id, is_active")
    .eq("id", caller.id)
    .single();

  if (callerProfileError || !callerProfile?.is_active) {
    return jsonResponse({ message: "Usuario administrador no válido." }, 403);
  }

  const { data: callerRole, error: callerRoleError } = await adminClient
    .from("roles")
    .select("key, is_active")
    .eq("id", callerProfile.role_id)
    .single();

  if (
    callerRoleError ||
    !callerRole?.is_active ||
    callerRole.key !== "admin"
  ) {
    return jsonResponse({ message: "No tienes permiso para crear usuarios." }, 403);
  }

  let body: CreateUserRequest;

  try {
    body = (await request.json()) as CreateUserRequest;
  } catch {
    return jsonResponse({ message: "Solicitud inválida." }, 400);
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const roleId = typeof body.roleId === "string" ? body.roleId : "";
  const isActive = body.isActive !== false;

  if (fullName.length < 3) {
    return jsonResponse({ message: "El nombre completo no es válido." }, 400);
  }

  if (!email.includes("@")) {
    return jsonResponse({ message: "El correo no es válido." }, 400);
  }

  if (password.length < 8) {
    return jsonResponse(
      { message: "La contraseña debe tener al menos 8 caracteres." },
      400,
    );
  }

  const { data: selectedRole, error: selectedRoleError } = await adminClient
    .from("roles")
    .select("id, is_active")
    .eq("id", roleId)
    .single();

  if (selectedRoleError || !selectedRole?.is_active) {
    return jsonResponse({ message: "El rol seleccionado no es válido." }, 400);
  }

  const { data: authData, error: createAuthError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (createAuthError || !authData.user) {
    const message = createAuthError?.message.includes("already")
      ? "Ya existe un usuario con ese correo."
      : createAuthError?.message || "No se pudo crear el acceso del usuario.";

    return jsonResponse({ message }, 400);
  }

  const now = new Date().toISOString();

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .upsert(
      {
        id: authData.user.id,
        full_name: fullName,
        email,
        role_id: roleId,
        is_active: isActive,
        must_change_password: true,
        updated_at: now,
      },
      { onConflict: "id" },
    )
    .select(
      "id, full_name, email, role_id, is_active, created_at, updated_at",
    )
    .single();

  if (profileError || !profile) {
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return jsonResponse(
      { message: "No se pudo crear el perfil operativo del usuario." },
      500,
    );
  }

  return jsonResponse(
    {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      roleId: profile.role_id,
      isActive: profile.is_active,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
    201,
  );
});
