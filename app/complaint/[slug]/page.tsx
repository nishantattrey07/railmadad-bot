'use client';
import { useState, useEffect } from 'react';
import searchUUID from 'app/actions/searchComplaint';
import { Complaintread } from '@/lib/schema';
import { uuid } from 'drizzle-orm/pg-core';

// New server action for submitting feedback
import { submitFeedback } from 'app/actions/submitFeedback';

// FeedbackForm component
const FeedbackForm = ({ uuid, onSubmit }: { uuid: string, onSubmit: () => void }) => {
    const [feedback, setFeedback] = useState('');
    const [stars, setStars] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitFeedback(uuid, feedback, stars);
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Please provide your feedback</h3>
            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
                placeholder="Your feedback..."
                required
            />
            <div className="mb-2">
                <label className="block mb-1">Rating (1-5 stars):</label>
                <input
                    type='text'
                    min="1"
                    max="5"
                    value={stars}
                    onChange={(e) => setStars(Number(e.target.value))}
                    className="p-2 border rounded"
                    required
                />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Submit Feedback
            </button>
        </form>
    );
};

export default function SearchTicket({ params }: { params: { slug: string } }) {
    const [complaintData, setComplaintData] = useState<Complaintread | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                const result = await searchUUID(params.slug);
                if (Array.isArray(result) && result.length > 0) {
                    setComplaintData(result[0]);
                    setShowFeedbackForm(result[0].status === 'resolved' && result[0].feedback === null);
                } else if (result === 'no data found') {
                    setError('No data found for the given UUID');
                } else {
                    setError('An unexpected error occurred');
                }
            } catch (err) {
                setError('An error occurred while fetching data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [params.slug]);

    const handleFeedbackSubmit = () => {
        setShowFeedbackForm(false);
        // Optionally, you can refetch the data here to show the updated feedback
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <h1 className="text-2xl font-bold mb-4">Search Result for UUID: {params.slug}</h1>

            {loading && (
                <div className="mt-4">
                    <p>Loading...</p>
                </div>
            )}

            {error && (
                <div className="mt-4 text-red-500">
                    <p>{error}</p>
                </div>
            )}

            {complaintData && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-8 w-full max-w-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Complaint Details
                    </h2>
                    <div className="space-y-2">
                        <p><strong className="text-gray-700">PNR:</strong> {complaintData.PNR}</p>
                        <p><strong className="text-gray-700">UUID:</strong> {complaintData.uuid}</p>
                        <p><strong className="text-gray-700">Created at:</strong> {new Date(complaintData.created_at).toLocaleString()}</p>
                        <p><strong className="text-gray-700">Status:</strong> {complaintData.status}</p>
                        <p><strong className="text-gray-700">Department:</strong> {complaintData.department}</p>
                        <p><strong className="text-gray-700">Subtype:</strong> {complaintData.subtype}</p>
                        <p><strong className="text-gray-700">AI Summary:</strong> {complaintData.oneLineAI}</p>
                        <p><strong className="text-gray-700">Original Query:</strong> {complaintData.originalQuery}</p>
                        <p><strong className="text-gray-700">Severity:</strong> {complaintData.severity}</p>
                        {complaintData.image && <img src={`data:image/jpeg;base64,${complaintData.image}`} alt='image of the complaint' />}
                    </div>

                    {showFeedbackForm && (
                        <FeedbackForm uuid={complaintData.uuid} onSubmit={handleFeedbackSubmit} />
                    )}
                </div>
            )}
        </div>
    );
}