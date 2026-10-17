import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (body: unknown, status: number, origin: string) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin'
  }
});

const roles = ['super_admin', 'admin', 'catalog_manager', 'order_manager'] as const;
type AdminRole = typeof roles[number];
const isAdminRole = (value: unknown): value is AdminRole => roles.some((role) => role === value);

Deno.serve(async (request) => {
  const configuredOrigin = Deno.env.get('ADMIN_ALLOWED_ORIGIN');
  const requestOrigin = request.headers.get('origin');
  if (!configuredOrigin) return new Response('Admin invitation service is not configured.', { status: 503 });
  if (requestOrigin && requestOrigin !== configuredOrigin) return new Response('Origin is not allowed.', { status: 403 });

  if (request.method === 'OPTIONS') return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': configuredOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      Vary: 'Origin'
    }
  });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, configuredOrigin);

  const authorization = request.headers.get('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!token) return json({ error: 'A valid administrator session is required.' }, 401, configuredOrigin);
  if (!url || !anonKey || !serviceRoleKey) return json({ error: 'Invitation service is not configured.' }, 503, configuredOrigin);

  const callerClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: authError } = await callerClient.auth.getUser(token);
  if (authError || !user) return json({ error: 'A valid administrator session is required.' }, 401, configuredOrigin);

  const service = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: caller, error: callerError } = await service.from('admin_users')
    .select('id,name,email,role')
    .eq('auth_user_id', user.id)
    .maybeSingle();
  if (callerError) {
    console.error('Unable to validate administrator role.');
    return json({ error: 'Unable to validate administrator permissions.' }, 500, configuredOrigin);
  }
  if (!caller || caller.role !== 'super_admin') {
    return json({ error: 'Only a super administrator may invite administrators.' }, 403, configuredOrigin);
  }

  let payload: unknown;
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 4096) return json({ error: 'Request is too large.' }, 413, configuredOrigin);
    const body = await request.text();
    if (body.length > 4096) return json({ error: 'Request is too large.' }, 413, configuredOrigin);
    payload = JSON.parse(body);
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400, configuredOrigin);
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return json({ error: 'Invalid invitation details.' }, 400, configuredOrigin);
  }
  const { name, email, role } = payload as Record<string, unknown>;
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 120
    || typeof email !== 'string' || email.length > 254
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    || !isAdminRole(role)) {
    return json({ error: 'Name, email, or administrator role is invalid.' }, 400, configuredOrigin);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const { data: existing, error: existingError } = await service.from('admin_users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();
  if (existingError) {
    console.error('Unable to check for an existing administrator.');
    return json({ error: 'Unable to check existing administrator accounts.' }, 500, configuredOrigin);
  }
  if (existing) return json({ error: 'An administrator account already uses this email.' }, 409, configuredOrigin);

  const { data: invitation, error: invitationError } = await service.auth.admin.inviteUserByEmail(normalizedEmail, {
    data: { name: name.trim() }
  });
  if (invitationError || !invitation.user) {
    console.error('Unable to send administrator invitation.');
    return json({ error: 'Unable to send the invitation. Check Auth email delivery and whether this email already has an account.' }, 400, configuredOrigin);
  }

  const authUserId = invitation.user.id;
  const { data: adminUser, error: insertError } = await service.from('admin_users')
    .insert({ auth_user_id: authUserId, name: name.trim(), email: normalizedEmail, role })
    .select('id,auth_user_id,name,email,role,avatar_url,last_login_at,created_at')
    .single();
  if (insertError || !adminUser) {
    const { error: cleanupError } = await service.auth.admin.deleteUser(authUserId);
    if (cleanupError) console.error('Could not clean up an invitation after administrator record creation failed.');
    console.error('Unable to create administrator record.');
    return json({ error: 'The invitation was created, but its administrator record could not be saved.' }, 500, configuredOrigin);
  }

  const { error: logError } = await service.from('admin_activity_logs').insert({
    admin_id: caller.id,
    admin_name: caller.name,
    admin_role: caller.role,
    action: 'دعوة مستخدم إداري',
    target_type: 'auth',
    target_id: adminUser.id,
    target_title: adminUser.name,
    details: `تم إرسال دعوة إلى ${adminUser.email} بدور ${adminUser.role}`
  });
  if (logError) {
    const { error: adminCleanupError } = await service.from('admin_users').delete().eq('id', adminUser.id);
    const { error: authCleanupError } = await service.auth.admin.deleteUser(authUserId);
    if (adminCleanupError || authCleanupError) console.error('Could not roll back an administrator invitation after audit logging failed.');
    console.error('Unable to record administrator invitation in the audit log.');
    return json({ error: 'The invitation could not be recorded in the audit log.' }, 500, configuredOrigin);
  }

  return json({ adminUser }, 201, configuredOrigin);
});
