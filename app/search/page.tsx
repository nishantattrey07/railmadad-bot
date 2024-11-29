'use client';
import { useState } from 'react';
import searchUUID from 'app/actions/searchComplaint';
import { Complaintread } from '@/lib/schema';

export default function SearchTicket() {
  const [inputValue, setInputValue] = useState('');
  const [complaintData, setComplaintData] = useState<Complaintread | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setComplaintData(null);
    setError(null);
    setShowProgress(true);

    try {
      const result = await searchUUID(inputValue);
      if (Array.isArray(result) && result.length > 0) {
        setComplaintData(result[0]);
      } else {
        setError('No data found');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
    }

    setInputValue(''); // Clear input after submission
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Search Ticket
          </h1>
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter UUID"
              className="flex-1 border-2 border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Search
            </button>
          </form>

          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>

        {/* Complaint Details */}
        {complaintData && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-8 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Complaint Details
            </h2>
            <div className="space-y-2">
              <p>
                <strong className="text-gray-700">PNR:</strong>{' '}
                {complaintData.PNR}
              </p>
              <p>
                <strong className="text-gray-700">UUID:</strong>{' '}
                {complaintData.uuid}
              </p>
              <p>
                <strong className="text-gray-700">Created at:</strong>{' '}
                {new Date(complaintData.created_at).toLocaleString()}
              </p>
              <p>
                <strong className="text-gray-700">Status:</strong>{' '}
                {complaintData.status}
              </p>
              <p>
                <strong className="text-gray-700">Department:</strong>{' '}
                {complaintData.department}
              </p>
              <p>
                <strong className="text-gray-700">Subtype:</strong>{' '}
                {complaintData.subtype}
              </p>
              <p>
                <strong className="text-gray-700">AI Summary:</strong>{' '}
                {complaintData.oneLineAI}
              </p>
              <p>
                <strong className="text-gray-700">Original Query:</strong>{' '}
                {complaintData.originalQuery}
              </p>
              <p>
                <strong className="text-gray-700">Severity:</strong>{' '}
                {complaintData.severity}
              </p>
              {complaintData.image && <img src={`data:image/jpeg;base64,${complaintData.image}`} alt='image of the complaint' />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
