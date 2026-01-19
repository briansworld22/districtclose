'use client';

import { useState } from 'react';
import { FolderOpen, Check, AlertCircle } from 'lucide-react';
import { DocumentCard } from './document-card';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import type { Document, UserRole } from '@/types/database';

interface DocumentChecklistProps {
  documents: Document[];
  userRole: UserRole;
  onDocumentUpdate?: (documentId: string, url: string, provider: 'google_drive' | 'dropbox') => void;
}

export function DocumentChecklist({
  documents,
  userRole,
  onDocumentUpdate,
}: DocumentChecklistProps) {
  const [connectModal, setConnectModal] = useState<{ isOpen: boolean; document: Document | null }>({
    isOpen: false,
    document: null,
  });
  const [linkUrl, setLinkUrl] = useState('');

  // Filter documents based on visibility
  const visibleDocuments = documents.filter((doc) => {
    if (userRole === 'buyer') return doc.visible_to_buyer;
    if (userRole === 'seller') return doc.visible_to_seller;
    return true;
  });

  const requiredDocs = visibleDocuments.filter((d) => d.is_required);
  const linkedRequired = requiredDocs.filter((d) => d.status === 'linked');
  const missingRequired = requiredDocs.filter((d) => d.status === 'missing');

  const handleConnect = (document: Document) => {
    setConnectModal({ isOpen: true, document });
    setLinkUrl('');
  };

  const handleSubmitLink = () => {
    if (!connectModal.document || !linkUrl) return;

    // Detect provider from URL
    let provider: 'google_drive' | 'dropbox' = 'google_drive';
    if (linkUrl.includes('dropbox.com')) {
      provider = 'dropbox';
    }

    onDocumentUpdate?.(connectModal.document.id, linkUrl, provider);
    setConnectModal({ isOpen: false, document: null });
    setLinkUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Document Checklist</h3>
              <p className="text-sm text-gray-500">
                {linkedRequired.length} of {requiredDocs.length} required documents linked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {missingRequired.length > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{missingRequired.length} missing</span>
              </div>
            )}
            {missingRequired.length === 0 && requiredDocs.length > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" />
                <span className="text-sm">All required docs linked</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Storage Integration Info */}
      <Alert variant="info" title="Connect Your Documents">
        Link documents from Google Drive or Dropbox. Click &quot;Connect&quot; on any document
        to add a link from your cloud storage.
      </Alert>

      {/* Required Documents */}
      {requiredDocs.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Required Documents</h4>
          {requiredDocs
            .sort((a, b) => {
              if (a.status === 'missing' && b.status !== 'missing') return -1;
              if (a.status !== 'missing' && b.status === 'missing') return 1;
              return 0;
            })
            .map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onConnect={() => handleConnect(doc)}
              />
            ))}
        </div>
      )}

      {/* Optional Documents */}
      {visibleDocuments.filter((d) => !d.is_required).length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Additional Documents</h4>
          {visibleDocuments
            .filter((d) => !d.is_required)
            .map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onConnect={() => handleConnect(doc)}
              />
            ))}
        </div>
      )}

      {visibleDocuments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No documents to display yet.
        </div>
      )}

      {/* Connect Document Modal */}
      <Modal
        isOpen={connectModal.isOpen}
        onClose={() => setConnectModal({ isOpen: false, document: null })}
        title="Connect Document"
        description={`Link ${connectModal.document?.name} from your cloud storage`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => window.open('https://drive.google.com', '_blank')}
            >
              <svg className="h-6 w-6" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
              <span className="font-medium">Google Drive</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => window.open('https://dropbox.com', '_blank')}
            >
              <svg className="h-6 w-6" viewBox="0 0 43 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 0L0 8.108l8.75 7.027L21.25 8.108 12.5 0z" fill="#0061FF"/>
                <path d="M0 22.162l12.5 8.108 8.75-7.027-12.5-7.027L0 22.162z" fill="#0061FF"/>
                <path d="M21.25 23.243l8.75 7.027 12.5-8.108-8.75-7.027-12.5 8.108z" fill="#0061FF"/>
                <path d="M42.5 8.108L30 0l-8.75 8.108 12.5 7.027 8.75-7.027z" fill="#0061FF"/>
                <path d="M21.28 24.875l-8.78 7.027-3.75-2.432v2.73l12.53 7.527 12.53-7.527v-2.73l-3.75 2.432-8.78-7.027z" fill="#0061FF"/>
              </svg>
              <span className="font-medium">Dropbox</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Paste your document link
              </span>
            </div>
          </div>

          <Input
            placeholder="https://drive.google.com/file/..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setConnectModal({ isOpen: false, document: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitLink} disabled={!linkUrl}>
              Connect Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
