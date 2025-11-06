
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { EditableDataForm } from './components/EditableDataForm';
import { Chatbot } from './components/Chatbot';
import { fetchWebNews, extractDataFromDocument } from './services/geminiService';
import { ExtractedData, WebNewsData } from './types';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [newsData, setNewsData] = useState<WebNewsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(true);

  useEffect(() => {
    // Proactively check for the API key on component mount.
    // This provides immediate feedback to the user if the environment is not configured.
    if (!process.env.API_KEY) {
      setIsApiKeyConfigured(false);
    }
  }, []);


  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setExtractedData(null);
    setNewsData(null);
    setError(null);
    setNewsError(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const getMimeType = (file: File): string => {
    if (file.type) {
        return file.type;
    }
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'application/pdf';
        case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'eml':
            return 'message/rfc822';
        case 'msg':
            return 'application/vnd.ms-outlook';
        default:
            return '';
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setIsNewsLoading(true);
    setError(null);
    setNewsError(null);
    setExtractedData(null);
    setNewsData(null);

    try {
      const base64Data = await fileToBase64(selectedFile);
      const mimeType = getMimeType(selectedFile);

      if (!mimeType) {
          setError(`Unsupported file type. Could not determine MIME type for "${selectedFile.name}".`);
          setIsLoading(false);
          setIsNewsLoading(false);
          return;
      }
      
      const data = await extractDataFromDocument(base64Data, mimeType);
      setExtractedData(data);
      setIsLoading(false);

      if (data && data.anagrafica.entityName) {
         try {
            const news = await fetchWebNews(data.anagrafica.entityName);
            setNewsData(news);
        } catch (err) {
            console.error("Failed to fetch news:", err);
            let rawMessage = '';
            if (err instanceof Error) {
                rawMessage = err.message;
            } else if (typeof err === 'object' && err !== null) {
                try {
                    const errorObj = err as any;
                    if (errorObj.error && errorObj.error.message) {
                        rawMessage = errorObj.error.message;
                    } else {
                        rawMessage = JSON.stringify(err);
                    }
                } catch {
                    rawMessage = 'Could not parse news fetch error.';
                }
            } else {
                rawMessage = 'An unknown error occurred while fetching news.';
            }

            if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429')) {
                setNewsError('Could not fetch news due to API rate limits. Please check your plan and billing details.');
            } else {
                setNewsError('Failed to fetch news and web information.');
            }
        } finally {
            setIsNewsLoading(false);
        }
      } else {
        setIsNewsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
      setIsNewsLoading(false);
    }
  };

  const handleDataUpdate = (updatedData: ExtractedData) => {
    setExtractedData(updatedData);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!isApiKeyConfigured ? (
          <ErrorMessage
            title="Configuration Required"
            message="The Gemini API key is not configured. Please set up the API_KEY in your environment to use this application."
          />
        ) : (
          <>
            <FileUpload
              onFileSelect={handleFileSelect}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
            {isLoading && <Loader />}
            {error && <ErrorMessage title="Processing Error" message={error} />}
            {extractedData && (
                <div className="mt-8">
                    <EditableDataForm
                        data={extractedData}
                        onUpdate={handleDataUpdate}
                        newsData={newsData}
                        isNewsLoading={isNewsLoading}
                        newsError={newsError}
                    />
                </div>
            )}
          </>
        )}
      </main>
      {extractedData && <Chatbot data={extractedData} />}
    </div>
  );
};

export default App;
