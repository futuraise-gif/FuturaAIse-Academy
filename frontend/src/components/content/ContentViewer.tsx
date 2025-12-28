import { useState, useEffect } from 'react';
import { ContentItem, ContentType, FileType, ContentAccess } from '@/types/content.types';
import { contentService } from '@/services/contentService';
import { formatDistanceToNow } from 'date-fns';

interface ContentViewerProps {
  content: ContentItem;
  courseId: string;
  onContentUpdated: () => void;
  onProgressUpdated: () => void;
  isInstructor: boolean;
}

export default function ContentViewer({
  content,
  courseId,
  onContentUpdated,
  onProgressUpdated,
  isInstructor,
}: ContentViewerProps) {
  const [access, setAccess] = useState<ContentAccess | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    if (!isInstructor && content.type === ContentType.FILE) {
      loadAccess();
    }
  }, [content.id]);

  const loadAccess = async () => {
    try {
      const { access: data } = await contentService.getMyContentAccess(courseId, content.id);
      setAccess(data);
    } catch (error) {
      console.error('Failed to load access:', error);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await contentService.updateContentAccess(courseId, content.id, {
        is_completed: true,
        completion_percentage: 100,
      });
      loadAccess();
      onProgressUpdated();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to mark as complete');
    }
  };

  const handleVideoProgress = async (currentTime: number) => {
    setVideoProgress(currentTime);

    // Update progress every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      try {
        await contentService.updateContentAccess(courseId, content.id, {
          video_progress: Math.floor(currentTime),
        });
      } catch (error) {
        console.error('Failed to update video progress:', error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderContent = () => {
    switch (content.type) {
      case ContentType.FOLDER:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold">{content.title}</h3>
            {content.description && (
              <p className="text-sm mt-2 text-gray-600 max-w-md text-center">{content.description}</p>
            )}
            <p className="text-sm mt-4">Select a file to view its contents</p>
          </div>
        );

      case ContentType.FILE:
        return (
          <div className="h-full flex flex-col">
            {/* File header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.title}</h2>
                  {content.description && (
                    <p className="text-gray-600 mb-3">{content.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📄 {content.file_name}</span>
                    <span>📦 {formatFileSize(content.file_size!)}</span>
                    {access && (
                      <span
                        className={
                          access.is_completed
                            ? 'text-green-600 font-medium'
                            : 'text-yellow-600 font-medium'
                        }
                      >
                        {access.is_completed ? '✓ Completed' : '⏱ In Progress'}
                      </span>
                    )}
                  </div>
                </div>

                {!isInstructor && !access?.is_completed && (
                  <button
                    onClick={handleMarkComplete}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>

            {/* File viewer */}
            <div className="flex-1 overflow-auto bg-gray-100 p-6">
              {content.file_type === FileType.PDF && (
                <iframe
                  src={content.file_url}
                  className="w-full h-full border-0 rounded-lg bg-white"
                  title={content.title}
                />
              )}

              {content.file_type === FileType.VIDEO && (
                <video
                  src={content.file_url}
                  controls
                  className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
                  onTimeUpdate={(e) => handleVideoProgress(e.currentTarget.currentTime)}
                >
                  Your browser does not support the video tag.
                </video>
              )}

              {content.file_type === FileType.AUDIO && (
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🎵</div>
                    <h3 className="text-xl font-semibold">{content.title}</h3>
                  </div>
                  <audio src={content.file_url} controls className="w-full">
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              )}

              {content.file_type === FileType.IMAGE && (
                <div className="flex justify-center">
                  <img
                    src={content.file_url}
                    alt={content.title}
                    className="max-w-full max-h-full rounded-lg shadow-lg"
                  />
                </div>
              )}

              {[FileType.DOCUMENT, FileType.PRESENTATION, FileType.SPREADSHEET].includes(
                content.file_type!
              ) && (
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-center">
                  <div className="text-6xl mb-4">
                    {content.file_type === FileType.DOCUMENT && '📝'}
                    {content.file_type === FileType.PRESENTATION && '📊'}
                    {content.file_type === FileType.SPREADSHEET && '📈'}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{content.title}</h3>
                  <p className="text-gray-600 mb-6">
                    This file format requires download to view
                  </p>
                  <a
                    href={content.file_url}
                    download={content.file_name}
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                  >
                    Download {content.file_name}
                  </a>
                </div>
              )}

              {[FileType.ARCHIVE, FileType.CODE, FileType.OTHER].includes(content.file_type!) && (
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold mb-4">{content.title}</h3>
                  <p className="text-gray-600 mb-6">Download this file to view it</p>
                  <a
                    href={content.file_url}
                    download={content.file_name}
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                  >
                    Download {content.file_name}
                  </a>
                </div>
              )}
            </div>
          </div>
        );

      case ContentType.LINK:
        return (
          <div className="p-6 h-full flex flex-col">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.title}</h2>
              {content.description && (
                <p className="text-gray-600 mb-4">{content.description}</p>
              )}
              <a
                href={content.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                🔗 Open Link
              </a>
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-sm">
              <iframe
                src={content.external_url}
                className="w-full h-full border-0 rounded-lg"
                title={content.title}
              />
            </div>
          </div>
        );

      case ContentType.TEXT:
        return (
          <div className="p-6 overflow-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.title}</h2>
              <div className="prose max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap">{content.text_content}</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Unsupported content type</p>
          </div>
        );
    }
  };

  return <div className="h-full">{renderContent()}</div>;
}
