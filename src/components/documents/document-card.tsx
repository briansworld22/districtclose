'use client';

import { FileText, ExternalLink, Link2, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getDocumentStatusColor, getDocumentStatusLabel } from '@/utils/documents';
import type { Document } from '@/types/database';

interface DocumentCardProps {
  document: Document;
  onConnect?: () => void;
}

export function DocumentCard({ document, onConnect }: DocumentCardProps) {
  const getStatusIcon = () => {
    switch (document.status) {
      case 'linked':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'pending_review':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div
      className={cn(
        'relative border rounded-lg p-4 transition-all',
        document.status === 'linked'
          ? 'bg-green-50/30 border-green-200'
          : document.status === 'missing' && document.is_required
          ? 'bg-red-50/30 border-red-200'
          : 'bg-white border-gray-200'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
          <FileText className="h-5 w-5 text-gray-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-gray-900">{document.name}</h4>
            {document.is_required && (
              <Badge variant="danger" size="sm">Required</Badge>
            )}
          </div>

          {document.description && (
            <p className="text-sm text-gray-500 mt-1">{document.description}</p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className={cn('text-sm', getDocumentStatusColor(document.status))}>
                {getDocumentStatusLabel(document.status)}
              </span>
            </div>

            {document.external_provider && (
              <span className="text-xs text-gray-400 capitalize">
                via {document.external_provider.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {document.status === 'linked' && document.external_url ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(document.external_url!, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onConnect}
            >
              <Link2 className="h-4 w-4 mr-1" />
              Connect
            </Button>
          )}

          {document.official_form_url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(document.official_form_url!, '_blank')}
            >
              <FileText className="h-4 w-4 mr-1" />
              Official Form
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
