const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  program: string;
  captcha_token?: string;
}

export interface ApiResponse {
  success: boolean;
  detail?: string;
  errors?: Record<string, string[]>;
}

export async function submitContactForm(data: ContactFormData): Promise<ApiResponse> {
  const response = await fetch(`${API_URL}/contact/submit/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}
