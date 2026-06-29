const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Typed API Error ─────────────────────────────────────────────────────────
// Carries a structured flag so callers can branch on email-verification failures
// without string-matching error messages.
export class ApiError extends Error {
  status: number;
  code: string | undefined;
  isEmailNotVerified: boolean;
  isAccountDisabled: boolean;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.isEmailNotVerified =
      status === 403 &&
      (code === 'EMAIL_NOT_VERIFIED' ||
        message.toLowerCase().includes('not verified') ||
        message.toLowerCase().includes('verification required'));
    this.isAccountDisabled =
      status === 403 &&
      (code === 'ACCOUNT_DISABLED' ||
        message.toLowerCase().includes('suspended') ||
        message.toLowerCase().includes('disabled'));
  }
}

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = getHeaders();
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Invalidate session locally and notify listeners of suspension
    if (response.status === 403 && errorData.code === 'ACCOUNT_DISABLED') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('auticare_active_user');
        window.dispatchEvent(
          new CustomEvent('auticare_account_disabled', { detail: errorData.error })
        );
      }
    }

    // Propagate structured error — EMAIL_NOT_VERIFIED code is preserved as a
    // typed flag so overlay components can react without message-string matching.
    throw new ApiError(
      errorData.error || `HTTP error! status: ${response.status}`,
      response.status,
      errorData.code,
    );
  }

  return response.json();
}

// Authentication
export async function register(data: any) {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const res = await request('/auth/register', {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
  });
  if (res.token) {
    localStorage.setItem('token', res.token);
  }
  return res;
}

export async function login(data: any) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (res.token) {
    localStorage.setItem('token', res.token);
  }
  return res;
}

export async function firebaseLogin(data: any) {
  const res = await request('/auth/firebase-login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (res.token) {
    localStorage.setItem('token', res.token);
  }
  return res;
}

export async function checkEmail(email: string) {
  return request('/auth/check-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function getMe() {
  return request('/auth/me');
}

export function logout() {
  localStorage.removeItem('token');
}

// Patients
export async function getPatients() {
  return request('/patients');
}

export async function getPatientSummary(childId: string) {
  return request(`/patients/${childId}/summary`);
}

export async function createPatient(data: any) {
  return request('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Behavior logs
export async function getBehaviorLogs(childId: string, limit = 7) {
  return request(`/logs/${childId}?limit=${limit}`);
}

export async function createBehaviorLog(logData: any) {
  return request('/logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  });
}

// Care notes
export async function getCareNotes(childId: string) {
  return request(`/notes/${childId}`);
}

export async function createCareNote(noteData: any) {
  return request('/notes', {
    method: 'POST',
    body: JSON.stringify(noteData),
  });
}

export async function approveCareNote(noteId: string) {
  return request(`/notes/${noteId}/approve`, {
    method: 'PUT',
  });
}

// AI predictions
export async function getAIPrediction(childId: string, lang = 'en') {
  return request(`/ai/predict/${childId}?lang=${lang}`, {
    method: 'POST',
  });
}

// Genetic report
export async function getGeneticReports(childId: string) {
  return request(`/genetic/${childId}`);
}

export async function uploadGeneticReport(childId: string, manualMarkers: any, notes: string, laboratory?: string) {
  return request('/genetic/upload', {
    method: 'POST',
    body: JSON.stringify({
      childId,
      manualMarkers: JSON.stringify(manualMarkers),
      notes,
      laboratory,
    }),
  });
}

export async function uploadGeneticReportFile(childId: string, file: File, notes: string, laboratory?: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const formData = new FormData();
  formData.append('childId', childId);
  formData.append('reportFile', file);
  formData.append('notes', notes);
  if (laboratory) {
    formData.append('laboratory', laboratory);
  }

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/genetic/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Nutrition plans
export async function getNutritionPlans(childId: string) {
  return request(`/nutrition/${childId}`);
}

export async function generateNutritionPlan(childId: string, geneticReportId: string) {
  return request('/nutrition/generate', {
    method: 'POST',
    body: JSON.stringify({ childId, geneticReportId }),
  });
}

export async function approveNutritionPlan(planId: string, doctorNotes: string, doctorEdits: any) {
  return request(`/nutrition/${planId}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ doctorNotes, doctorEdits }),
  });
}

// Cognitive Games
export async function getGameScores(childId: string) {
  return request(`/games/${childId}`);
}

export async function getGameProgress(childId: string) {
  return request(`/games/${childId}/progress`);
}

export async function submitGameScore(scoreData: any) {
  return request('/games/score', {
    method: 'POST',
    body: JSON.stringify(scoreData),
  });
}

export async function getNotifications(): Promise<{ success: boolean; data: any[]; unread: number }> {
  return request('/notifications');
}

export async function markNotificationAsRead(id: string): Promise<{ success: boolean }> {
  return request(`/notifications/${id}/read`, {
    method: 'PUT',
  });
}

export async function markAllNotificationsAsRead(): Promise<{ success: boolean }> {
  return request('/notifications/read-all', {
    method: 'PUT',
  });
}

export async function getAdminStats() {
  return request('/admin/stats');
}

export async function getAdminUsers(role?: string) {
  const path = role && role !== 'all' ? `/admin/users?role=${role}` : '/admin/users';
  return request(path);
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  return request(`/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ isActive }),
  });
}

export async function getAdminAuditLogs() {
  return request('/admin/audit');
}

// ─── Verification Sync ────────────────────────────────────────────────────────
// Called by the email-not-verified overlay button to ask the backend whether
// the user has clicked their verification link since last login. Returns
// { verified: boolean, user?: object } so the App can refresh currentUser.
export async function syncVerificationStatus(): Promise<{ verified: boolean; user?: any }> {
  return request('/auth/sync-verification-status', { method: 'POST' });
}

export async function updateProfileAvatar(file: File | null) {
  const formData = new FormData();
  if (file) {
    formData.append('avatar', file);
  } else {
    formData.append('clear', 'true');
  }
  return request('/users/profile/avatar', {
    method: 'PATCH',
    body: formData,
  });
}

export async function updatePatientAvatar(patientId: string, file: File | null) {
  const formData = new FormData();
  if (file) {
    formData.append('avatar', file);
  } else {
    formData.append('clear', 'true');
  }
  return request(`/patients/${patientId}/avatar`, {
    method: 'PATCH',
    body: formData,
  });
}

export async function uploadPatientBirthCertificate(patientId: string, file: File) {
  const formData = new FormData();
  formData.append('birthCertificate', file);
  return request(`/patients/${patientId}/birth-certificate`, {
    method: 'POST',
    body: formData,
  });
}

