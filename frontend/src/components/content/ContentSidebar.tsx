import { useState } from 'react';
import {
  ContentItem,
  ContentProgress,
  ContentType,
  ContentStatus,
  FileType,
} from '@/types/content.types';

interface ContentSidebarProps {
  contentItems: ContentItem[];
  selectedContent: ContentItem | null;
  progress: ContentProgress | null;
  onSelectContent: (content: ContentItem) => void;
  onCreateFolder: (parent?: ContentItem) => void;
  onUploadFile: (parent?: ContentItem) => void;
  onDeleteContent?: (contentId: string) => void;
  onPublishContent?: (contentId: string) => void;
  isInstructor: boolean;
  loading: boolean;
}

export default function ContentSidebar({
  contentItems,
  selectedContent,
  progress,
  onSelectContent,
  onCreateFolder,
  onUploadFile,
  onDeleteContent,
  onPublishContent,
  isInstructor,
  loading,
}: ContentSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: ContentItem;
  } | null>(null);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleContextMenu = (e: React.MouseEvent, item: ContentItem) => {
    if (!isInstructor) return;

    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const getFileIcon = (item: ContentItem) => {
    if (item.type === ContentType.FOLDER) {
      return expandedFolders.has(item.id) ? '📂' : '📁';
    }

    if (item.type === ContentType.LINK) return '🔗';
    if (item.type === ContentType.TEXT) return '📄';
    if (item.type === ContentType.ASSIGNMENT_LINK) return '📝';
    if (item.type === ContentType.QUIZ_LINK) return '❓';

    // File type icons
    switch (item.file_type) {
      case FileType.PDF:
        return '📕';
      case FileType.VIDEO:
        return '🎥';
      case FileType.AUDIO:
        return '🎵';
      case FileType.IMAGE:
        return '🖼️';
      case FileType.DOCUMENT:
        return '📝';
      case FileType.PRESENTATION:
        return '📊';
      case FileType.SPREADSHEET:
        return '📈';
      case FileType.ARCHIVE:
        return '🗜️';
      case FileType.CODE:
        return '💻';
      default:
        return '📄';
    }
  };

  const getStatusBadge = (item: ContentItem) => {
    if (item.status === ContentStatus.DRAFT) {
      return <span className="text-xs text-gray-500 ml-2">(Draft)</span>;
    }
    if (item.status === ContentStatus.HIDDEN) {
      return <span className="text-xs text-gray-500 ml-2">(Hidden)</span>;
    }
    return null;
  };

  const renderContentItem = (item: ContentItem, depth: number = 0) => {
    const isFolder = item.type === ContentType.FOLDER;
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = selectedContent?.id === item.id;
    const children = contentItems.filter((c) => c.parent_id === item.id);

    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
            isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(item.id);
            } else {
              onSelectContent(item);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          <span className="text-lg">{getFileIcon(item)}</span>
          <span className="flex-1 text-sm truncate">{item.title}</span>
          {getStatusBadge(item)}
          {item.is_graded && <span className="text-xs text-purple-600">⭐ {item.points}pts</span>}
        </div>

        {isFolder && isExpanded && children.length > 0 && (
          <div>{children.map((child) => renderContentItem(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const rootItems = contentItems.filter((item) => !item.parent_id);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Course Content</h2>

        {/* Progress bar for students */}
        {!isInstructor && progress && (
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>
                {progress.completed_items}/{progress.total_content_items}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${progress.completion_percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress.completion_percentage}% Complete</p>
          </div>
        )}

        {/* Instructor actions */}
        {isInstructor && (
          <div className="flex gap-2">
            <button
              onClick={() => onCreateFolder()}
              className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded"
            >
              + Folder
            </button>
            <button
              onClick={() => onUploadFile()}
              className="flex-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded"
            >
              + File
            </button>
          </div>
        )}
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : contentItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No content yet</p>
            {isInstructor && (
              <p className="text-xs mt-2">Click the buttons above to add content</p>
            )}
          </div>
        ) : (
          <div className="py-2">
            {rootItems.map((item) => renderContentItem(item))}
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeContextMenu}></div>
          <div
            className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.item.type === ContentType.FOLDER && (
              <>
                <button
                  onClick={() => {
                    onCreateFolder(contextMenu.item);
                    closeContextMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Add Subfolder
                </button>
                <button
                  onClick={() => {
                    onUploadFile(contextMenu.item);
                    closeContextMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Upload File Here
                </button>
                <div className="border-t border-gray-200 my-1"></div>
              </>
            )}

            {contextMenu.item.status !== ContentStatus.PUBLISHED && onPublishContent && (
              <button
                onClick={() => {
                  onPublishContent(contextMenu.item.id);
                  closeContextMenu();
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Publish
              </button>
            )}

            {onDeleteContent && (
              <button
                onClick={() => {
                  onDeleteContent(contextMenu.item.id);
                  closeContextMenu();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
