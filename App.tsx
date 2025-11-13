
import React, { useState, useEffect } from 'react';
import { fetchMoroccoTime, TimeData } from './services/geminiService';
import { GroundingChunk } from './types';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400"></div>
        <p className="text-lg text-slate-300">Finding the time in Morocco...</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center bg-red-900/20 border border-red-500 rounded-lg p-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3>
        <p className="text-red-400 mt-2">{message}</p>
    </div>
);

const SourceList: React.FC<{ sources: GroundingChunk[] }> = ({ sources }) => {
    const validSources = sources.filter(source => source.web && source.web.uri);

    if (validSources.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-slate-300 text-center mb-4">Sources</h3>
            <ul className="space-y-3">
                {validSources.map((source, index) => (
                    <li key={index}>
                        <a 
                            href={source.web!.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center space-x-3 bg-slate-800/50 hover:bg-slate-700/70 p-3 rounded-lg transition-all duration-300 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="text-slate-300 group-hover:text-cyan-300 truncate transition-colors">
                                {source.web!.title || 'Untitled Source'}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const TimeDisplay: React.FC<{ time: string }> = ({ time }) => {
    const [timePart, periodPart] = time.split(' ');
    
    return (
        <div className="text-center">
            <h2 className="text-slate-400 text-2xl font-medium tracking-wide">The time in Morocco is</h2>
            <div className="my-4 relative">
                <p className="text-7xl md:text-9xl font-bold tracking-tighter text-slate-100 flex items-baseline justify-center">
                    <span>{timePart}</span>
                    {periodPart && <span className="text-4xl md:text-6xl font-semibold text-cyan-400 ml-3">{periodPart}</span>}
                </p>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [timeData, setTimeData] = useState<TimeData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getTime = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchMoroccoTime();
                setTimeData(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred.");
                }
            } finally {
                setLoading(false);
            }
        };

        getTime();
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30">
            <main className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center flex-grow">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                        Morocco Time Now
                    </h1>
                </header>
                
                <div className="w-full max-w-2xl bg-slate-800/40 rounded-2xl shadow-2xl shadow-cyan-500/10 p-8 md:p-12 border border-slate-700">
                    {loading && <LoadingSpinner />}
                    {error && <ErrorDisplay message={error} />}
                    {timeData && <TimeDisplay time={timeData.time} />}
                </div>
                
                {timeData && timeData.sources.length > 0 && <SourceList sources={timeData.sources} />}
            </main>
            <footer className="text-center p-4 text-slate-500 text-sm">
                Powered by Google Gemini
            </footer>
        </div>
    );
};

export default App;
