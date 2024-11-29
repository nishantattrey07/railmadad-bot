'use client';

import { useState } from 'react';
import searchUUID from 'app/actions/searchComplaint';
import useLanguageStore from '@/lib/Stores/LanguageStore';
import { multiLang } from '@/lib/constants';

export default function SearchTicket() {
  const { language } = useLanguageStore();
  const [inputValue, setInputValue] = useState('');
  const [complaintData, setComplaintData] = useState(null);
  const [error, setError] = useState(null);
  const [showProgress, setShowProgress] = useState(false);

  async function handleSubmit(e) {
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
    } finally {
      setShowProgress(false); // Hide loading spinner after data fetch
    }

    setInputValue(''); // Clear input after submission
  }

  // Inline Loading Spinner Component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center mt-8">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-14 p-6">
        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            {multiLang[language].seachTicket}
          </h1>
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={multiLang[language].askUUID}
              className="flex-1 border-2 border-gray-300 p-2 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              {multiLang[language].NavbarSearch}
            </button>
          </form>

          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>

        {/* Loading Spinner and Complaint Details */}
        {showProgress ? (
          <LoadingSpinner />
        ) : (
          complaintData && (
            <div className="bg-white p-6 rounded-lg shadow-md mt-8 w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Complaint Details
              </h2>
              <div className="space-y-2">
                <p>
                  <strong className="text-gray-700">{multiLang[language].PNR}</strong>{' '}
                  {complaintData.PNR}
                </p>
                <p>
                  <strong className="text-gray-700">{multiLang[language].UUID}</strong>{' '}
                  {complaintData.uuid}
                </p>
                <p>
                  <strong className="text-gray-700">{multiLang[language].CreatedAt}</strong>{' '}
                  {new Date(complaintData.created_at).toLocaleString()}
                </p>
                <p>
                  <strong className="text-gray-700">{multiLang[language].Status}</strong>{' '}
                  {complaintData.status}
                </p>
                <p>
                  <strong className="text-gray-700">{multiLang[language].Department}</strong>{' '}
                  {complaintData.department}
                </p>
                <p>
                  <strong className="text-gray-700">{multiLang[language].Subtype}</strong>{' '}
                  {complaintData.subtype}
                </p>
                <p>
                  <strong className="text-gray-700">{multiLang[language].AISummary}</strong>{' '}
                  {complaintData.oneLineAI}
                </p>
                <p>
                  <strong className="text-gray-700">{multiLang[language].OriginalQ}</strong>{' '}
                  {complaintData.originalQuery}
                </p>
                <p>
                  <strong className="text-gray-700">{multiLang[language].Severity}</strong>{' '}
                  {complaintData.severity}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
