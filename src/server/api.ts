import { Hono, Context, Next } from 'hono';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type Bindings = {
  VITE_SUPABASE_URL?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

export type Variables = {
  user: any;
  role: string;
  supabaseUser: any;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

// Environment variable resolver for Vercel Serverless (process.env) and Edge (c.env / process.env)
export function getEnv(c: Context<AppEnv>, key: keyof Bindings | string): string {
  const envObj = (c.env as any) || {};
  return (
    (typeof process !== 'undefined' ? (process.env as any)?.[key] : '') ||
    envObj[key] ||
    ''
  );
}

export function getSupabase(c: Context<AppEnv>) {
  const url = getEnv(c, 'VITE_SUPABASE_URL') || getEnv(c, 'SUPABASE_URL');
  const serviceKey = getEnv(c, 'SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = getEnv(c, 'VITE_SUPABASE_ANON_KEY');

  const adminClient: SupabaseClient | null = (url && (serviceKey || anonKey))
    ? createClient(url, serviceKey || anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  const anonClient: SupabaseClient | null = (url && anonKey)
    ? createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

  return { adminClient, anonClient, url, serviceKey, anonKey };
}

function formatUserProfile(p: any, role: string = 'user') {
  return {
    id: p.id,
    uid: p.uid,
    fullName: p.full_name || p.fullName || '',
    email: p.email,
    passwordHash: '',
    whatsappNumber: p.whatsapp_number || p.whatsappNumber || null,
    verificationStatus: p.verification_status || p.verificationStatus || 'unverified',
    rejectionReason: p.rejection_reason || p.rejectionReason || null,
    avatarUrl: p.avatar_url || p.avatarUrl || null,
    walletBalance: Number(p.wallet_balance || p.walletBalance || 0),
    role: (role as any) || 'user',
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
    updatedAt: p.updated_at || p.updatedAt || new Date().toISOString(),
  };
}

function formatVerificationRequest(r: any, avatarUrl?: string | null) {
  return {
    id: r.id,
    userId: r.user_id || r.userId,
    uid: r.uid,
    fullName: r.full_name || r.fullName,
    email: r.email,
    whatsappNumber: r.whatsapp_number || r.whatsappNumber,
    status: r.status,
    rejectionReason: r.rejection_reason || r.rejectionReason || null,
    submittedAt: r.submitted_at || r.submittedAt || r.created_at,
    reviewedBy: r.reviewed_by || r.reviewedBy || null,
    reviewedAt: r.reviewed_at || r.reviewedAt || null,
    avatarUrl: avatarUrl || r.avatarUrl || null,
  };
}

async function generateUniqueUID(supabase: SupabaseClient | null): Promise<string> {
  for (let i = 0; i < 50; i++) {
    const num = Math.floor(100000 + Math.random() * 900000);
    const candidate = `NX-${num}`;
    if (supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('uid')
        .eq('uid', candidate)
        .maybeSingle();
      if (!data) return candidate;
    } else {
      return candidate;
    }
  }
  return `NX-${Date.now().toString().slice(-6)}`;
}

// Authentication middleware for Hono routes
async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  const token = authHeader.split(' ')[1];
  const { adminClient } = getSupabase(c);

  if (adminClient) {
    try {
      const { data: authData, error: authError } = await adminClient.auth.getUser(token);
      if (!authError && authData?.user) {
        const userId = authData.user.id;
        const { data: profile } = await adminClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        const { data: roleData } = await adminClient
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        const role = roleData?.role || (profile?.email?.includes('admin') ? 'admin' : 'user');
        if (profile) {
          c.set('user', formatUserProfile(profile, role));
          c.set('role', role);
          c.set('supabaseUser', authData.user);
          return await next();
        }
      }
    } catch (e) {
      // ignore and proceed
    }
  }

  return c.json({ error: 'Session expired or invalid' }, 401);
}

// Admin guard middleware
async function adminGuard(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authentication required' }, 401);
  }
  const token = authHeader.split(' ')[1];
  const { adminClient } = getSupabase(c);

  if (adminClient) {
    try {
      const { data: authData, error: authError } = await adminClient.auth.getUser(token);
      if (!authError && authData?.user) {
        const userId = authData.user.id;
        const { data: profile } = await adminClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        const { data: roleData } = await adminClient
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        const role = roleData?.role || (profile?.email?.includes('admin') ? 'admin' : 'user');
        if (role !== 'admin') {
          return c.json({ error: 'Forbidden: Admin access required' }, 403);
        }

        if (profile) {
          c.set('user', formatUserProfile(profile, role));
          c.set('role', role);
          c.set('supabaseUser', authData.user);
          return await next();
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return c.json({ error: 'Session expired or invalid' }, 401);
}

export function createApiRouter() {
  const api = new Hono<AppEnv>().basePath('/api');

  // --------------------------------------------------------------------------
  // 1. PUBLIC SETTINGS
  // --------------------------------------------------------------------------
  api.get('/settings', async (c) => {
    const { adminClient } = getSupabase(c);
    const defaults = {
      official_whatsapp_group_url: 'https://chat.whatsapp.com/GHY74nxK9201Lkjq',
      official_support_whatsapp: 'https://wa.me/18005550199',
      official_support_instagram: 'https://instagram.com/nexaearn_official',
      official_support_email: 'support@nexaearn.com',
      platform_name: 'Nexa Earn',
      verification_bonus: 50.00,
      welcome_notice: 'Welcome to Nexa Earn! Complete your WhatsApp community verification to unlock all portal features.'
    };

    if (adminClient) {
      try {
        const { data: rows } = await adminClient.from('app_settings').select('*');
        if (rows && rows.length > 0) {
          const map: Record<string, any> = {};
          rows.forEach((r: any) => {
            map[r.key] = r.value;
          });
          return c.json({
            official_whatsapp_group_url: map.official_whatsapp_group_url || defaults.official_whatsapp_group_url,
            official_support_whatsapp: map.official_support_whatsapp || defaults.official_support_whatsapp,
            official_support_instagram: map.official_support_instagram || defaults.official_support_instagram,
            official_support_email: map.official_support_email || defaults.official_support_email,
            platform_name: map.platform_name || defaults.platform_name,
            verification_bonus: Number(map.verification_bonus_amount || map.verification_bonus || defaults.verification_bonus),
            welcome_notice: map.welcome_notice || defaults.welcome_notice
          });
        }
      } catch (e) {
        // fallback to defaults
      }
    }

    return c.json(defaults);
  });

  // --------------------------------------------------------------------------
  // 2. AUTHENTICATION (REGISTER)
  // --------------------------------------------------------------------------
  api.post('/auth/register', async (c) => {
    try {
      const body = await c.req.json();
      const { fullName, email, password } = body;

      if (!fullName || !email || !password) {
        return c.json({ error: 'Full Name, Email and Password are required' }, 400);
      }

      const cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return c.json({ error: 'Invalid email address format' }, 400);
      }

      if (password.length < 6) {
        return c.json({ error: 'Password must be at least 6 characters' }, 400);
      }

      const { adminClient, anonClient } = getSupabase(c);
      if (!adminClient) {
        return c.json({ error: 'Database service is not configured' }, 503);
      }

      // Check duplicate email in profiles
      const { data: existingProf } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingProf) {
        return c.json({ error: 'An account with this email already exists' }, 409);
      }

      // Create user in Supabase Authentication
      const { data: authCreated, error: createError } = await adminClient.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
        },
      });

      if (createError) {
        const isDup =
          createError.message?.toLowerCase().includes('already') ||
          createError.message?.toLowerCase().includes('registered') ||
          (createError as any).status === 422;
        return c.json(
          { error: isDup ? 'An account with this email already exists' : createError.message },
          isDup ? 409 : 400
        );
      }

      const supabaseUserId = authCreated.user.id;
      const uid = await generateUniqueUID(adminClient);

      // Check or insert profile
      let { data: profile } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', supabaseUserId)
        .maybeSingle();

      if (!profile) {
        const { data: newProf, error: profErr } = await adminClient
          .from('profiles')
          .insert({
            id: supabaseUserId,
            uid,
            full_name: fullName.trim(),
            email: cleanEmail,
            verification_status: 'unverified',
            wallet_balance: 0.00,
          })
          .select()
          .single();

        if (profErr) {
          console.error('Error creating profile:', profErr);
        }
        profile = newProf || {
          id: supabaseUserId,
          uid,
          full_name: fullName.trim(),
          email: cleanEmail,
          verification_status: 'unverified',
          wallet_balance: 0.00,
        };
      }

      // Ensure user role
      await adminClient
        .from('user_roles')
        .upsert({ user_id: supabaseUserId, role: 'user' }, { onConflict: 'user_id,role' });

      // Sign in to generate JWT access token
      let sessionToken = '';
      let sessionObj: any = null;
      if (anonClient) {
        const { data: loginData } = await anonClient.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });
        if (loginData?.session) {
          sessionToken = loginData.session.access_token;
          sessionObj = loginData.session;
        }
      }

      const safeUser = formatUserProfile(profile, 'user');
      return c.json(
        {
          message: 'Account successfully registered with Supabase',
          user: safeUser,
          role: 'user',
          token: sessionToken,
          session: sessionObj,
        },
        201
      );
    } catch (err: any) {
      console.error('Registration error:', err);
      return c.json({ error: 'Internal server error during registration' }, 500);
    }
  });

  // --------------------------------------------------------------------------
  // 3. AUTHENTICATION (LOGIN)
  // --------------------------------------------------------------------------
  api.post('/auth/login', async (c) => {
    try {
      const body = await c.req.json();
      const { email, password } = body;

      if (!email || !password) {
        return c.json({ error: 'Email and password are required' }, 400);
      }

      const cleanEmail = email.trim().toLowerCase();
      const { adminClient, anonClient } = getSupabase(c);

      if (!anonClient || !adminClient) {
        return c.json({ error: 'Database service is not configured' }, 503);
      }

      const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authError || !authData?.user) {
        return c.json({ error: authError?.message || 'Invalid email or password' }, 401);
      }

      const supabaseUserId = authData.user.id;

      let { data: profile } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', supabaseUserId)
        .maybeSingle();

      const { data: roleRow } = await adminClient
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUserId)
        .maybeSingle();

      const role = roleRow?.role || (cleanEmail.includes('admin') ? 'admin' : 'user');

      if (!profile) {
        const uid = await generateUniqueUID(adminClient);
        const fullName = authData.user.user_metadata?.full_name || cleanEmail.split('@')[0];
        const { data: newProf } = await adminClient
          .from('profiles')
          .insert({
            id: supabaseUserId,
            uid,
            full_name: fullName,
            email: cleanEmail,
            verification_status: 'unverified',
            wallet_balance: 0.00,
          })
          .select()
          .single();
        profile = newProf;
      }

      const safeUser = formatUserProfile(profile, role);
      const token = authData.session?.access_token || '';

      return c.json({
        message: 'Login successful',
        user: safeUser,
        role,
        token,
        session: {
          access_token: authData.session?.access_token,
          refresh_token: authData.session?.refresh_token,
          expires_at: authData.session?.expires_at,
        },
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return c.json({ error: 'Internal server error during login' }, 500);
    }
  });

  // --------------------------------------------------------------------------
  // 4. AUTHENTICATION (CURRENT USER / ME)
  // --------------------------------------------------------------------------
  api.get('/auth/me', authMiddleware, async (c) => {
    const user = c.get('user');
    const role = c.get('role');
    return c.json({ user, role });
  });

  // --------------------------------------------------------------------------
  // 5. AUTHENTICATION (LOGOUT)
  // --------------------------------------------------------------------------
  api.post('/auth/logout', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { adminClient } = getSupabase(c);
      if (adminClient) {
        try {
          await adminClient.auth.admin.signOut(token);
        } catch (e) {
          // ignore
        }
      }
    }
    return c.json({ message: 'Logged out successfully' });
  });

  // --------------------------------------------------------------------------
  // 6. ACCOUNT VERIFICATION (SUBMIT WHATSAPP NUMBER)
  // --------------------------------------------------------------------------
  api.post('/verification/submit', authMiddleware, async (c) => {
    try {
      const user = c.get('user') as any;
      const body = await c.req.json();
      const { whatsappNumber } = body;

      if (!whatsappNumber || typeof whatsappNumber !== 'string') {
        return c.json({ error: 'Please enter a valid WhatsApp number' }, 400);
      }

      const cleanNumber = whatsappNumber.trim().replace(/[^\d+]/g, '');
      if (cleanNumber.length < 7 || cleanNumber.length > 20) {
        return c.json(
          { error: 'WhatsApp number must be between 7 and 20 digits, including country code' },
          400
        );
      }

      const { adminClient } = getSupabase(c);
      if (!adminClient) return c.json({ error: 'Database service unavailable' }, 503);

      const now = new Date().toISOString();

      // Enforce uniqueness: check duplicate in profiles
      const { data: dupProfile } = await adminClient
        .from('profiles')
        .select('id, uid')
        .eq('whatsapp_number', cleanNumber)
        .neq('id', user.id)
        .maybeSingle();

      if (dupProfile) {
        return c.json(
          {
            error:
              'This WhatsApp number is already registered with another account. Each account requires a unique WhatsApp number.',
          },
          400
        );
      }

      // Enforce uniqueness: check duplicate in verification_requests
      const { data: dupReq } = await adminClient
        .from('verification_requests')
        .select('id, user_id')
        .eq('whatsapp_number', cleanNumber)
        .neq('user_id', user.id)
        .maybeSingle();

      if (dupReq) {
        return c.json(
          { error: 'This WhatsApp number has already been submitted by another user.' },
          400
        );
      }

      // Check existing request
      const { data: existingReq } = await adminClient
        .from('verification_requests')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingReq) {
        await adminClient
          .from('verification_requests')
          .update({
            whatsapp_number: cleanNumber,
            status: 'pending',
            rejection_reason: null,
            submitted_at: now,
            updated_at: now,
          })
          .eq('id', existingReq.id);
      } else {
        await adminClient.from('verification_requests').insert({
          user_id: user.id,
          uid: user.uid,
          full_name: user.fullName,
          email: user.email,
          whatsapp_number: cleanNumber,
          status: 'pending',
          submitted_at: now,
        });
      }

      // Update profile
      const { data: updatedProf } = await adminClient
        .from('profiles')
        .update({
          whatsapp_number: cleanNumber,
          verification_status: 'pending',
          rejection_reason: null,
          updated_at: now,
        })
        .eq('id', user.id)
        .select()
        .single();

      return c.json({
        message: 'Verification request submitted successfully. Admin review is pending.',
        user: formatUserProfile(updatedProf, user.role),
        verificationStatus: 'pending',
      });
    } catch (err: any) {
      console.error('Submit verification error:', err);
      return c.json({ error: 'Failed to submit verification request' }, 500);
    }
  });

  // --------------------------------------------------------------------------
  // 7. ACCOUNT VERIFICATION (GET MY STATUS)
  // --------------------------------------------------------------------------
  api.get('/verification/my-status', authMiddleware, async (c) => {
    const user = c.get('user') as any;
    const { adminClient } = getSupabase(c);

    if (adminClient) {
      try {
        const { data: reqInfo } = await adminClient
          .from('verification_requests')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        return c.json({
          status: user.verificationStatus,
          whatsappNumber: user.whatsappNumber,
          rejectionReason: user.rejectionReason,
          submittedAt: reqInfo ? reqInfo.submitted_at : null,
          reviewedAt: reqInfo ? reqInfo.reviewed_at : null,
        });
      } catch (e) {
        // fallback
      }
    }

    return c.json({
      status: user.verificationStatus,
      whatsappNumber: user.whatsappNumber,
      rejectionReason: user.rejectionReason,
      submittedAt: null,
      reviewedAt: null,
    });
  });

  // --------------------------------------------------------------------------
  // 8. USER PROFILE UPDATE
  // --------------------------------------------------------------------------
  api.put('/user/profile', authMiddleware, async (c) => {
    try {
      const user = c.get('user') as any;
      const body = await c.req.json();
      const { fullName, avatarUrl } = body;
      const { adminClient } = getSupabase(c);

      if (!adminClient) return c.json({ error: 'Database service unavailable' }, 503);

      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (fullName && typeof fullName === 'string') updates.full_name = fullName.trim();
      if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

      const { data: updated, error } = await adminClient
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return c.json({
        message: 'Profile updated successfully',
        user: formatUserProfile(updated, user.role),
      });
    } catch (err) {
      return c.json({ error: 'Failed to update profile' }, 500);
    }
  });

  // --------------------------------------------------------------------------
  // 9. USER WALLET & LEDGER
  // --------------------------------------------------------------------------
  api.get('/user/wallet', authMiddleware, async (c) => {
    const user = c.get('user') as any;
    const { adminClient } = getSupabase(c);

    if (adminClient) {
      try {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('wallet_balance, verification_status')
          .eq('id', user.id)
          .single();

        const { data: txRows } = await adminClient
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        return c.json({
          balance: Number(profile?.wallet_balance || 0),
          currency: 'USD',
          verificationStatus: profile?.verification_status || user.verificationStatus,
          transactions: (txRows || []).map((t: any) => ({
            id: t.id,
            userId: t.user_id,
            type: t.type,
            amount: Number(t.amount),
            status: t.status,
            description: t.description,
            createdAt: t.created_at,
          })),
        });
      } catch (e) {
        // fallback
      }
    }

    return c.json({
      balance: user.walletBalance,
      currency: 'USD',
      verificationStatus: user.verificationStatus,
      transactions: [],
    });
  });

  // --------------------------------------------------------------------------
  // 10. ADMIN USERS DIRECTORY
  // --------------------------------------------------------------------------
  api.get('/admin/users', adminGuard, async (c) => {
    try {
      const query = (c.req.query('q') || '').toLowerCase().trim();
      const statusFilter = (c.req.query('status') || '').toLowerCase().trim();
      const { adminClient } = getSupabase(c);

      if (!adminClient) return c.json({ error: 'Database service unavailable' }, 503);

      let builder = adminClient
        .from('profiles')
        .select(`*, user_roles ( role )`)
        .order('created_at', { ascending: false });

      if (statusFilter && ['unverified', 'pending', 'approved', 'rejected'].includes(statusFilter)) {
        builder = builder.eq('verification_status', statusFilter);
      }

      const { data: rows, error } = await builder;
      if (error) throw error;

      let results = (rows || []).map((p: any) => {
        const role = p.user_roles?.[0]?.role || (p.email?.includes('admin') ? 'admin' : 'user');
        return formatUserProfile(p, role);
      });

      if (query) {
        results = results.filter(
          (u) =>
            u.uid.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            (u.whatsappNumber && u.whatsappNumber.toLowerCase().includes(query)) ||
            u.fullName.toLowerCase().includes(query)
        );
      }

      return c.json({ users: results, total: results.length });
    } catch (err) {
      console.error('Fetch admin users error:', err);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }
  });

  // --------------------------------------------------------------------------
  // 11. ADMIN VERIFICATION REQUESTS
  // --------------------------------------------------------------------------
  api.get('/admin/verifications', adminGuard, async (c) => {
    try {
      const filter = (c.req.query('status') || 'all').toLowerCase();
      const { adminClient } = getSupabase(c);

      if (!adminClient) return c.json({ error: 'Database service unavailable' }, 503);

      let builder = adminClient
        .from('verification_requests')
        .select(`*, profiles:user_id ( avatar_url, wallet_balance, created_at )`)
        .order('submitted_at', { ascending: false });

      if (filter && filter !== 'all') {
        builder = builder.eq('status', filter);
      }

      const { data: rows, error } = await builder;
      if (error) throw error;

      const list = (rows || []).map((r: any) =>
        formatVerificationRequest(r, r.profiles?.avatar_url)
      );
      return c.json({ requests: list });
    } catch (err) {
      console.error('Fetch verifications error:', err);
      return c.json({ error: 'Failed to fetch verification requests' }, 500);
    }
  });

  // --------------------------------------------------------------------------
  // 12. ADMIN APPROVE VERIFICATION REQUEST
  // --------------------------------------------------------------------------
  api.post('/admin/verification/:id/approve', adminGuard, async (c) => {
    try {
      const admin = c.get('user') as any;
      const id = c.req.param('id');
      const now = new Date().toISOString();
      const { adminClient } = getSupabase(c);

      if (!adminClient) return c.json({ error: 'Database service unavailable' }, 503);

      const { data: request } = await adminClient
        .from('verification_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!request) return c.json({ error: 'Verification request not found' }, 404);

      if (request.status === 'approved') {
        return c.json({ error: 'This verification request is already approved' }, 400);
      }

      const targetUserId = request.user_id;

      const { data: targetProfile } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (!targetProfile) return c.json({ error: 'Target user profile not found' }, 404);

      const { data: settingBonus } = await adminClient
        .from('app_settings')
        .select('value')
        .eq('key', 'verification_bonus_amount')
        .maybeSingle();

      const bonusAmount = Number(settingBonus?.value || 50.0);

      // Update verification request
      await adminClient
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_by: admin.id,
          reviewed_at: now,
          rejection_reason: null,
          updated_at: now,
        })
        .eq('id', id);

      // Update profile
      const newBalance = Number((Number(targetProfile.wallet_balance || 0) + bonusAmount).toFixed(2));
      const { data: updatedProfile } = await adminClient
        .from('profiles')
        .update({
          verification_status: 'approved',
          rejection_reason: null,
          wallet_balance: newBalance,
          updated_at: now,
        })
        .eq('id', targetUserId)
        .select()
        .single();

      // Log transaction
      await adminClient.from('transactions').insert({
        user_id: targetUserId,
        type: 'verification_bonus',
        amount: bonusAmount,
        status: 'completed',
        description: 'Account Verification Approval Bonus',
      });

      // Log audit
      await adminClient.from('audit_logs').insert({
        admin_id: admin.id,
        admin_email: admin.email,
        action: 'VERIFICATION_APPROVED',
        target_uid: targetProfile.uid,
        target_user_id: targetUserId,
        details: {
          whatsappNumber: request.whatsapp_number,
          bonusAwarded: bonusAmount,
          approvedAt: now,
        },
      });

      return c.json({
        message: `Account verification approved for ${targetProfile.full_name} (${targetProfile.uid})`,
        request: formatVerificationRequest({
          ...request,
          status: 'approved',
          reviewed_by: admin.id,
          reviewed_at: now,
        }),
        user: formatUserProfile(updatedProfile),
      });
    } catch (err) {
      console.error('Approve verification error:', err);
      return c.json({ error: 'Failed to approve verification' }, 500);
    }
  });

  // --------------------------------------------------------------------------
  // 13. ADMIN REJECT VERIFICATION REQUEST
  // --------------------------------------------------------------------------
  api.post('/admin/verification/:id/reject', adminGuard, async (c) => {
    try {
      const admin = c.get('user') as any;
      const id = c.req.param('id');
      const body = await c.req.json().catch(() => ({}));
      const reason = body?.reason;
      const now = new Date().toISOString();
      const finalReason =
        reason && typeof reason === 'string' && reason.trim()
          ? reason.trim()
          : 'Did not join the official WhatsApp group or invalid number provided.';

      const { adminClient } = getSupabase(c);
      if (!adminClient) return c.json({ error: 'Database service unavailable' }, 503);

      const { data: request } = await adminClient
        .from('verification_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!request) return c.json({ error: 'Verification request not found' }, 404);

      const targetUserId = request.user_id;

      await adminClient
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_by: admin.id,
          reviewed_at: now,
          rejection_reason: finalReason,
          updated_at: now,
        })
        .eq('id', id);

      await adminClient
        .from('profiles')
        .update({
          verification_status: 'rejected',
          rejection_reason: finalReason,
          updated_at: now,
        })
        .eq('id', targetUserId);

      await adminClient.from('audit_logs').insert({
        admin_id: admin.id,
        admin_email: admin.email,
        action: 'VERIFICATION_REJECTED',
        target_uid: request.uid,
        target_user_id: targetUserId,
        details: {
          whatsappNumber: request.whatsapp_number,
          reason: finalReason,
          rejectedAt: now,
        },
      });

      return c.json({
        message: `Account verification rejected for ${request.full_name}`,
        request: formatVerificationRequest({
          ...request,
          status: 'rejected',
          rejection_reason: finalReason,
        }),
        reason: finalReason,
      });
    } catch (err) {
      console.error('Reject verification error:', err);
      return c.json({ error: 'Failed to reject verification' }, 500);
    }
  });

  // --------------------------------------------------------------------------
  // 14. ADMIN APPLICATION SETTINGS (PUT)
  // --------------------------------------------------------------------------
  api.put('/admin/settings', adminGuard, async (c) => {
    try {
      const admin = c.get('user') as any;
      const updates = await c.req.json();
      const now = new Date().toISOString();
      const { adminClient } = getSupabase(c);

      if (adminClient) {
        for (const [key, value] of Object.entries(updates)) {
          if (value !== undefined) {
            await adminClient.from('app_settings').upsert(
              {
                key,
                value: String(value),
                updated_by: admin.id,
                updated_at: now,
              },
              { onConflict: 'key' }
            );
          }
        }

        await adminClient.from('audit_logs').insert({
          admin_id: admin.id,
          admin_email: admin.email,
          action: 'SETTINGS_CHANGED',
          details: { updatedKeys: Object.keys(updates) },
        });
      }

      return c.json({
        message: 'Application settings updated successfully in Supabase',
        settings: updates,
      });
    } catch (err) {
      return c.json({ error: 'Failed to update application settings' }, 500);
    }
  });

  // --------------------------------------------------------------------------
  // 15. ADMIN AUDIT LOGS
  // --------------------------------------------------------------------------
  api.get('/admin/audit-logs', adminGuard, async (c) => {
    try {
      const { adminClient } = getSupabase(c);
      if (adminClient) {
        const { data: rows } = await adminClient
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        const logs = (rows || []).map((l: any) => ({
          id: l.id,
          adminId: l.admin_id,
          adminEmail: l.admin_email,
          action: l.action,
          targetUid: l.target_uid,
          targetUserId: l.target_user_id,
          details: l.details || {},
          createdAt: l.created_at,
        }));
        return c.json({ logs });
      }
      return c.json({ logs: [] });
    } catch (err) {
      return c.json({ error: 'Failed to fetch audit logs' }, 500);
    }
  });

  return api;
}
