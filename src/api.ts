const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Authentication
export async function register(data: any) {
  const res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
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

export async function uploadGeneticReport(childId: string, manualMarkers: any, notes: string) {
  return request('/genetic/upload', {
    method: 'POST',
    body: JSON.stringify({
      childId,
      manualMarkers: JSON.stringify(manualMarkers),
      notes,
    }),
  });
}

export async function uploadGeneticReportFile(childId: string, file: File, notes: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const formData = new FormData();
  formData.append('childId', childId);
  formData.append('reportFile', file);
  formData.append('notes', notes);

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



