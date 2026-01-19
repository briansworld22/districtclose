'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/ui/alert';

interface PropertyFormData {
  property_address: string;
  sale_price: number;
  is_tenanted: boolean;
  target_settlement_date: string;
}

interface PropertyFormProps {
  data: PropertyFormData;
  onChange: (data: PropertyFormData) => void;
}

export function PropertyForm({ data, onChange }: PropertyFormProps) {
  const [showTopaWarning, setShowTopaWarning] = useState(data.is_tenanted);

  const handleTenantChange = (checked: boolean) => {
    setShowTopaWarning(checked);
    onChange({ ...data, is_tenanted: checked });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Property Information
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter the details of the property for this transaction.
        </p>
      </div>

      <Input
        label="Property Address"
        value={data.property_address}
        onChange={(e) => onChange({ ...data, property_address: e.target.value })}
        placeholder="1234 Main St NW, Washington, DC 20001"
        required
      />

      <Input
        label="Sale Price"
        type="number"
        value={data.sale_price || ''}
        onChange={(e) => onChange({ ...data, sale_price: Number(e.target.value) })}
        placeholder="450000"
        helperText="Enter the agreed upon sale price"
        required
      />

      <Input
        label="Target Settlement Date"
        type="date"
        value={data.target_settlement_date}
        onChange={(e) => onChange({ ...data, target_settlement_date: e.target.value })}
        helperText="When do you expect to close?"
      />

      <div className="pt-4 border-t border-gray-100">
        <Checkbox
          label="Is the property currently occupied by a tenant?"
          description="This affects TOPA requirements under DC law"
          checked={data.is_tenanted}
          onChange={(e) => handleTenantChange(e.target.checked)}
        />
      </div>

      {showTopaWarning && (
        <Alert variant="warning" title="TOPA Notice Required">
          This transaction involves a tenanted property and requires further
          regulatory review under DC TOPA (Tenant Opportunity to Purchase Act)
          laws. The tenant(s) must be given the opportunity to purchase the
          property before it can be sold to a third party.
        </Alert>
      )}
    </div>
  );
}
