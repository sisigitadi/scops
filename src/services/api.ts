import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API Service Configuration & Global Handling.
 * Migrated to TypeScript (v11.1.0) for military-grade communication safety.
 */

type ApiErrorType = 'timeout' | 'network' | 'auth' | 'server' | 'request' | 'unknown';

export interface NormalizedApiError {
  status: number | null;
  code: string | null;
  type: ApiErrorType;
  message: string;
  hint: string;
  technicalMessage: string;
  originalError: any;
}

interface LocalizationEntry {
  message: string;
  hint: string;
}

interface LocalizationDictionary {
  [key: string]: {
    [K in ApiErrorType]: LocalizationEntry;
  };
}

const api = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

function getUiLanguage(): 'id' | 'en' {
  if (typeof window === 'undefined') return 'en';
  // Check global flag
  const globalLang = (window as any).__socops_lang;
  if (globalLang === 'id' || globalLang === 'en') return globalLang;
  
  const persisted = window.localStorage.getItem('socops_lang');
  if (persisted === 'id' || persisted === 'en') return persisted;
  
  return 'en';
}

function localizeApiMessage(language: string, type: ApiErrorType, status: number | null): LocalizationEntry {
  const dictionary: LocalizationDictionary = {
    id: {
      timeout: {
        message: 'Waktu koneksi habis saat menghubungi layanan backend.',
        hint: 'Periksa keterjangkauan layanan, rute proxy, dan latensi respons backend.'
      },
      network: {
        message: 'Komunikasi jaringan/CORS gagal sebelum server merespons.',
        hint: 'Pastikan BFF berjalan, host tujuan dapat diakses, dan kebijakan proxy/CORS mengizinkan request ini.'
      },
      auth: {
        message: 'Autentikasi atau otorisasi gagal pada endpoint layanan.',
        hint: 'Periksa kredensial/token dan kebijakan akses endpoint.'
      },
      server: {
        message: status ? `Layanan backend mengalami gangguan internal (HTTP ${status}).` : 'Layanan backend mengalami gangguan internal.',
        hint: 'Backend merespons error internal. Periksa log server.'
      },
      request: {
        message: status ? `Permintaan tidak valid atau ditolak endpoint (HTTP ${status}).` : 'Permintaan tidak valid atau ditolak endpoint.',
        hint: 'Periksa URL endpoint, payload request, dan field wajib.'
      },
      unknown: {
        message: 'Kegagalan API tidak terduga.',
        hint: 'Periksa log browser dan backend untuk diagnosis lebih lanjut.'
      }
    },
    en: {
      timeout: {
        message: 'Connection timeout while contacting backend service.',
        hint: 'Verify service reachability, proxy routing, and backend response latency.'
      },
      network: {
        message: 'Network/CORS communication failed before receiving a server response.',
        hint: 'Confirm BFF is running, target host is reachable, and reverse-proxy/CORS policy allows this request path.'
      },
      auth: {
        message: 'Authentication or authorization failed on service endpoint.',
        hint: 'Check credentials/token and endpoint access policy.'
      },
      server: {
        message: status ? `Backend service returned an internal error (HTTP ${status}).` : 'Backend service returned an internal error.',
        hint: 'Backend responded with an internal/server error. Check server logs.'
      },
      request: {
        message: status ? `Request is invalid or rejected by endpoint (HTTP ${status}).` : 'Request is invalid or rejected by endpoint.',
        hint: 'Review endpoint URL, request payload, and required fields.'
      },
      unknown: {
        message: 'Unexpected API failure.',
        hint: 'Check browser and backend logs for further diagnosis.'
      }
    }
  };

  const lang = language === 'id' ? 'id' : 'en';
  return dictionary[lang][type] || dictionary[lang].unknown;
}

function normalizeApiError(error: AxiosError<any>): NormalizedApiError {
  const language = getUiLanguage();
  const status = error.response?.status || null;
  const code = error.code || null;
  const rawMessage = error.response?.data?.message || error.message || 'API Communication Failure';

  const isTimeout = code === 'ECONNABORTED' || /timeout/i.test(rawMessage);
  const isNetwork = !error.response && (code === 'ERR_NETWORK' || /network error|failed to fetch|cors/i.test(rawMessage));

  let type: ApiErrorType = 'unknown';
  if (isTimeout) type = 'timeout';
  else if (isNetwork) type = 'network';
  else if (status === 401 || status === 403) type = 'auth';
  else if (status && status >= 500) type = 'server';
  else if (status && status >= 400) type = 'request';

  const localized = localizeApiMessage(language, type, status);

  return {
    status,
    code,
    type,
    message: localized.message,
    hint: localized.hint,
    technicalMessage: rawMessage,
    originalError: error
  };
}

function isDemoRequestContext(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const explicitFlag = window.sessionStorage.getItem('socops_demo_mode');
    if (explicitFlag === '1') return true;
    const rawUser = window.sessionStorage.getItem('socops_user_v2');
    if (!rawUser) return false;
    const user = JSON.parse(rawUser);
    return user?.role === 'demo';
  } catch {
    return false;
  }
}

function getRequestRole(): string {
  if (typeof window === 'undefined') return '';
  try {
    const rawUser = window.sessionStorage.getItem('socops_user_v2');
    if (!rawUser) return '';
    const user = JSON.parse(rawUser);
    return typeof user?.role === 'string' ? user.role : '';
  } catch {
    return '';
  }
}

// Request Interceptor: Inject JWT & Governance Headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('socops_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const role = getRequestRole();
    if (role) {
      config.headers['X-Socops-Role'] = role;
    }
    if (isDemoRequestContext()) {
      config.headers['X-Socops-Demo-Mode'] = '1';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Normalization
api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    const normalizedError = normalizeApiError(error);

    // Handle Token Expiry
    if (error.response?.status === 401) {
      console.warn('[SECURITY] Session Expired. Re-authentication required.');
      // Auto-purge token to trigger redirection in AuthContext
      sessionStorage.removeItem('socops_access_token');
    }

    return Promise.reject(normalizedError);
  }
);

export default api;
