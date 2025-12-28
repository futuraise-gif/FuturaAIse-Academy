import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { contentService } from '@/services/contentService';
import {
  ContentItem,
  ContentProgress,
  ContentType,
  ContentStatus,
} from '@/types/content.types';
import { useAuthStore } from '@/store/authStore';
import ContentSidebar from '@/components/content/ContentSidebar';
import ContentViewer from '@/components/content/ContentViewer';
import CreateContentModal from '@/components/content/CreateContentModal';
import UploadFileModal from '@/components/content/UploadFileModal';
import { UserRole } from '@/types';

export default function ContentModule() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuthStore();

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [progress, setProgress] = useState<ContentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);

  const isInstructor = user?.role === UserRole.INSTRUCTOR || user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (courseId) {
      loadContent();
      if (!isInstructor) {
        loadProgress();
      }
    }
  }, [courseId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { content } = await contentService.getContentItems(courseId!, isInstructor);
      setContentItems(content);

      // Auto-select first item if nothing selected
      if (content.length > 0 && !selectedContent) {
        setSelectedContent(content[0]);
      }
    } catch (error: any) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const { progress: data } = await contentService.getStudentProgress(courseId!);
      setProgress(data);
    } catch (error: any) {
      console.error('Failed to load progress:', error);
    }
  };

  const handleContentCreated = () => {
    setShowCreateModal(false);
    setShowUploadModal(false);
    setParentId(null);
    loadContent();
  };

  const handleSelectContent = (content: ContentItem) => {
    setSelectedContent(content);

    // Track access for students
    if (!isInstructor) {
      contentService.trackAccess(courseId!, content.id).catch(console.error);
    }
  };

  const handleCreateFolder = (parent?: ContentItem) => {
    setParentId(parent?.id || null);
    setShowCreateModal(true);
  };

  const handleUploadFile = (parent?: ContentItem) => {
    setParentId(parent?.id || null);
    setShowUploadModal(true);
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return;

    try {
      await contentService.deleteContentItem(courseId!, contentId);

      // Clear selection if deleted item was selected
      if (selectedContent?.id === contentId) {
        setSelectedContent(null);
      }

      loadContent();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete content');
    }
  };

  const handlePublishContent = async (contentId: string) => {
    try {
      await contentService.publishContentItem(courseId!, contentId);
      loadContent();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to publish content');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ContentSidebar
        contentItems={contentItems}
        selectedContent={selectedContent}
        progress={progress}
        onSelectContent={handleSelectContent}
        onCreateFolder={handleCreateFolder}
        onUploadFile={handleUploadFile}
        onDeleteContent={isInstructor ? handleDeleteContent : undefined}
        onPublishContent={isInstructor ? handlePublishContent : undefined}
        isInstructor={isInstructor}
        loading={loading}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : selectedContent ? (
          <ContentViewer
            content={selectedContent}
            courseId={courseId!}
            onContentUpdated={loadContent}
            onProgressUpdated={loadProgress}
            isInstructor={isInstructor}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg mb-2">No content selected</p>
            <p className="text-sm">Select an item from the sidebar to view</p>
            {isInstructor && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Create Content
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateContentModal
          courseId={courseId!}
          parentId={parentId}
          onClose={() => {
            setShowCreateModal(false);
            setParentId(null);
          }}
          onSuccess={handleContentCreated}
        />
      )}

      {showUploadModal && (
        <UploadFileModal
          courseId={courseId!}
          parentId={parentId}
          onClose={() => {
            setShowUploadModal(false);
            setParentId(null);
          }}
          onSuccess={handleContentCreated}
        />
      )}
    </div>
  );
}
