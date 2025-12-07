'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface SupportFormProps {
    userEmail: string;
    restaurantName: string;
}

export default function SupportForm({ userEmail, restaurantName }: SupportFormProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        subject: '',
        message: '',
    });
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 2 * 1024 * 1024) {
                toast.error('Il file non può superare i 2MB');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            const data = new FormData();
            data.append('email', userEmail);
            data.append('restaurantName', restaurantName);
            data.append('subject', formData.subject);
            data.append('message', formData.message);
            if (file) {
                data.append('attachment', file);
            }

            const response = await fetch('/api/support', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Errore durante l\'invio');
            }

            setStatus('success');
            setFormData({ subject: '', message: '' });
            setFile(null);
            // Reset success message after 3 seconds
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error: unknown) {
            console.error('Submit error:', error);
            setStatus('error');
            const message = error instanceof Error ? error.message : 'Unknown error';
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Centro Assistenza 🆘
                </h2>
                <p className="text-gray-500 text-sm">
                    Hai bisogno di aiuto? Contattaci direttamente da qui.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Oggetto
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--tenant-primary,#8B0000)] focus:border-[var(--tenant-primary,#8B0000)] transition-all"
                        placeholder="Es. Problema con il menu..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Messaggio
                    </label>
                    <textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--tenant-primary,#8B0000)] focus:border-[var(--tenant-primary,#8B0000)] transition-all resize-y"
                        placeholder="Descrivi il tuo problema..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Allegato (Max 2MB)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                        />
                        {file && (
                            <button
                                type="button"
                                onClick={() => setFile(null)}
                                className="text-red-500 text-sm hover:underline"
                            >
                                Rimuovi
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-6 rounded-xl text-white font-bold transition-all ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {loading ? 'Invio in corso...' : 'Invia Richiesta'}
                    </button>
                </div>

                {status === 'success' && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                        ✅ Richiesta inviata con successo! Ti risponderemo al più presto.
                    </div>
                )}

                {status === 'error' && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                        ❌ {errorMessage || 'Si è verificato un errore.'}
                    </div>
                )}
            </form>
        </div>
    );
}
