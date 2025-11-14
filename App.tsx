
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { EditableDataForm } from './components/EditableDataForm';
import { Chatbot } from './components/Chatbot';
import { fetchWebNews, extractDataFromDocument } from './services/geminiService';
import { ExtractedData, WebNewsData } from './types';

// Declare global variables for email parsing libraries loaded from CDN
declare global {
  interface Window {
    emlformat: any;
    MsgReader: any;
  }
}


const App: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [newsData, setNewsData] = useState<WebNewsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(true);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyConfigured(false);
    }
  }, []);


  const handleFilesAdd = (newFiles: File[]) => {
    setSelectedFiles(prevFiles => {
        const existingFileNames = new Set(prevFiles.map(f => f.name));
        const uniqueNewFiles = Array.from(newFiles).filter(f => !existingFileNames.has(f.name));
        if (uniqueNewFiles.length > 0) {
            setExtractedData(null);
            setNewsData(null);
            setError(null);
            setNewsError(null);
        }
        return [...prevFiles, ...uniqueNewFiles];
    });
  };

  const handleFileRemove = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };
  
  const handleClearFiles = () => {
      setSelectedFiles([]);
      setExtractedData(null);
      setNewsData(null);
      setError(null);
      setNewsError(null);
  }

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
    if (file.type && file.type !== 'application/octet-stream') {
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
        case 'txt':
            return 'text/plain';
        default:
            return 'application/octet-stream';
    }
  }

  /**
   * Processes uploaded files, extracting attachments from email (.eml, .msg) files.
   * Returns a flattened list of all files to be analyzed.
   */
  const processAndFlattenFiles = async (files: File[]): Promise<File[]> => {
    const processedFiles: File[] = [];

    for (const file of files) {
        const extension = file.name.split('.').pop()?.toLowerCase();

        try {
            if (extension === 'eml') {
                const arrayBuffer = await file.arrayBuffer();
                const data = new Uint8Array(arrayBuffer);

                const emlformat = window.emlformat;
                if (!emlformat || typeof emlformat.parse !== 'function') {
                    throw new Error('The eml-format library did not load correctly. The original file will be processed as-is.');
                }
                
                const parsedEml = await new Promise<any>((resolve, reject) => {
                    emlformat.parse(data, (err: any, parsedData: any) => {
                        if (err) return reject(err);
                        resolve(parsedData);
                    });
                });
                
                const emailBody = parsedEml.text || parsedEml.html || 'No text body found in email.';
                processedFiles.push(new File([emailBody], `${file.name}_body.txt`, { type: 'text/plain' }));

                if (parsedEml.attachments) {
                    for (const attachment of parsedEml.attachments) {
                        processedFiles.push(new File([attachment.content], attachment.filename, { type: attachment.contentType }));
                    }
                }
            } else if (extension === 'msg') {
                const arrayBuffer = await file.arrayBuffer();
                
                const MsgReader = window.MsgReader as any;
                // FIX: Defensively check for MsgReader and its default property.
                // This prevents a crash if the library script fails to load.
                const MsgReaderConstructor = MsgReader?.default || MsgReader;

                if (typeof MsgReaderConstructor !== 'function') {
                    throw new Error('The msg-reader library did not load correctly. The original file will be processed as-is.');
                }
                
                const msgReader = new MsgReaderConstructor(arrayBuffer);
                const fileData = msgReader.getFileData();

                if (fileData.error) throw new Error(fileData.error);
                
                const emailBody = fileData.body || 'No text body found in email.';
                processedFiles.push(new File([emailBody], `${file.name}_body.txt`, { type: 'text/plain' }));

                if (fileData.attachments) {
                    for (const attachment of fileData.attachments) {
                        const attachmentContent = msgReader.getAttachment(attachment);
                        processedFiles.push(new File([attachmentContent.content], attachment.fileName, { type: 'application/octet-stream' }));
                    }
                }
            } else {
                processedFiles.push(file);
            }
        } catch (err) {
            console.error(`Failed to process email file "${file.name}":`, err);
            // FIX: If parsing fails (e.g., CDN script for eml-format fails to load),
            // implement a fallback. For .eml files (which are text-based), read the raw
            // content as text/plain. This prevents sending an unsupported MIME type
            // like 'message/rfc822' to the model and allows it to process the text body.
            if (extension === 'eml') {
                const fileAsText = await file.text();
                processedFiles.push(new File([fileAsText], file.name, { type: 'text/plain' }));
            } else {
                // For other binary formats like .msg, the best fallback is to push the original file.
                // The API will reject it with a clear error, which is better than sending garbage data.
                processedFiles.push(file);
            }
        }
    }

    return processedFiles;
  };


  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    setIsNewsLoading(true);
    setError(null);
    setNewsError(null);
    setExtractedData(null);
    setNewsData(null);

    try {
      // Process files to expand email attachments
      const filesToAnalyze = await processAndFlattenFiles(selectedFiles);

      const fileProcessingPromises = filesToAnalyze.map(async (file) => {
        // For files that were converted from emails, the MIME type is already set.
        // For others, we need to determine it.
        const base64Data = await fileToBase64(file);
        const mimeType = getMimeType(file);

        // If the email fallback was used, the MIME type will be text/plain.
        // We should honor that instead of re-calculating it.
        const finalMimeType = file.type !== 'application/octet-stream' ? file.type : mimeType;

        if (!finalMimeType) {
            throw new Error(`Unsupported file type. Could not determine MIME type for "${file.name}".`);
        }
        return { base64Data, mimeType: finalMimeType };
      });
      
      const filesToProcess = await Promise.all(fileProcessingPromises);
      
      const data = await extractDataFromDocument(filesToProcess);
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
    <div className="min-h-screen">
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
              files={selectedFiles}
              onFilesAdd={handleFilesAdd}
              onFileRemove={handleFileRemove}
              onClearFiles={handleClearFiles}
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
