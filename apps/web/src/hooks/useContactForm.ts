import { useState } from "react";
import { api } from "@/api/client";

interface ContactData {
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  subject?: string;
  projectType?: string;
}

export function useContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: ContactData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.submitContact(data);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, isSubmitted, error, clearError: () => setError(null) };
}
