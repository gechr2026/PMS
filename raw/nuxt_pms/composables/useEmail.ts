// =============================================================
// useEmail — wrapper for /functions/v1/send-email
// Admin-only — calls SMTP through the edge function
// =============================================================

export interface SendEmailBody {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
}

export interface SendEmailResponse {
    success: true;
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
}

export const useEmail = () => {
    const { request } = usePmsApi();

    const send = (body: SendEmailBody) =>
        request<SendEmailResponse>('/send-email', { method: 'POST', body });

    return { send };
};
