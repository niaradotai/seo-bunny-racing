import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';

// Define the types for props
interface PageProps {
  params: { id: string };
}

// Generate dynamic metadata for the page
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Fetch race data
  const raceData = await fetchRaceData(params.id);
  
  // Determine winner website and score
  const winnerName = raceData?.urls && raceData.winnerIndex !== undefined && raceData.urls.length > raceData.winnerIndex
    ? raceData.urls[raceData.winnerIndex].replace(/(^\w+:|^)\/\//, "").split("/")[0]
    : 'Unknown Website';
  
  const winnerScore = raceData?.scores && raceData.winnerIndex !== undefined && raceData.scores.length > raceData.winnerIndex
    ? Math.round(raceData.scores[raceData.winnerIndex])
    : 0;
  
  // Base URL for absolute URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo-bunny-racing.vercel.app';
  
  const ogImageUrl = `${baseUrl}/api/og?winner=${encodeURIComponent(winnerName)}&score=${winnerScore}&count=${raceData?.urls?.length || 1}&id=${params.id}`;

  return {
    title: `${winnerName} wins SEO Bunny Racing with ${winnerScore} points!`,
    description: `Check out the SEO PageSpeed race results where ${winnerName} won with a score of ${winnerScore}. Race your own websites now!`,
    openGraph: {
      title: `${winnerName} wins SEO Bunny Racing with ${winnerScore} points!`,
      description: `Check out the SEO PageSpeed race results where ${winnerName} won with a score of ${winnerScore}. Race your own websites now!`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'SEO Bunny Racing Results',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${winnerName} wins SEO Bunny Racing!`,
      description: `Check out the SEO PageSpeed race results where ${winnerName} won with a score of ${winnerScore}.`,
      images: [ogImageUrl],
    },
  };
}

// Function to fetch race data from API
async function fetchRaceData(id: string) {
  try {
    // Use server-side fetch for the initial load
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://seo-bunny-racing.vercel.app';
    const res = await fetch(`${baseUrl}/api/share/${id}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) {
      throw new Error('Failed to fetch race data');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching shared race data:', error);
    return null;
  }
}

// Shared page component
export default async function SharePage({ params }: PageProps) {
  const raceData = await fetchRaceData(params.id);
  
  if (!raceData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-4">Race Results Not Found</h1>
        <p className="mb-8">The shared race results could not be found or may have expired.</p>
        <a 
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
        >
          Start Your Own Race
        </a>
      </div>
    );
  }
  
  const winnerIndex = raceData.winnerIndex;
  const winnerUrl = raceData.urls[winnerIndex];
  const winnerScore = Math.round(raceData.scores[winnerIndex]);
  const raceDate = new Date(raceData.timestamp).toLocaleString();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-3xl w-full mx-auto">
        <div className="bg-gray-800 rounded-lg p-8 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">SEO Bunny Racing Results</h1>
          
          <div className="bg-gray-700 p-6 rounded-lg mb-8 border-2 border-yellow-500">
            <h2 className="text-xl font-bold text-center mb-2 text-yellow-300">🏆 WINNER 🏆</h2>
            <div className="flex items-center justify-center mb-4">
              <div className="text-5xl mr-4">
                🐰
              </div>
              <div>
                <p className="text-xl font-bold">{winnerUrl.replace(/(^\w+:|^)\/\//, "").split("/")[0]}</p>
                <p className="text-green-400 font-bold text-2xl">Score: {winnerScore}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">All Results</h3>
            <div className="bg-gray-700 rounded-lg p-4">
              {raceData.urls.map((url: string, i: number) => (
                <div 
                  key={i} 
                  className={`flex justify-between items-center p-3 ${i === winnerIndex ? 'bg-yellow-900 bg-opacity-30' : i % 2 === 0 ? 'bg-gray-800' : ''} rounded my-1`}
                >
                  <div className="flex items-center">
                    <span className="mr-2 font-bold">{i + 1}.</span>
                    <span>{url.replace(/(^\w+:|^)\/\//, "").split("/")[0]}</span>
                  </div>
                  <span className="font-mono">{Math.round(raceData.scores[i])}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-gray-400 text-sm mb-6">
            <p>Race completed on {raceDate}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 text-center"
            >
              Race Your Own Websites
            </a>
            
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${winnerUrl.replace(/(^\w+:|^)\/\//, "").split("/")[0]} wins SEO Bunny Racing!`,
                    text: `Check out these SEO PageSpeed race results where ${winnerUrl.replace(/(^\w+:|^)\/\//, "").split("/")[0]} won with a score of ${winnerScore}!`,
                    url: window.location.href,
                  })
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 text-center"
            >
              Share Results
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>
          Game created by <a href="https://niara.ai" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">Niara.ai</a>. 🐰 Happy Easter!
        </p>
      </div>
    </div>
  );
}