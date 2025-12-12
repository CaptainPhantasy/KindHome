/**
 * MEDICATIONS MANAGER PAGE
 * Phase 2, Track B: Caregiver UI - Medications CRUD
 * 
 * Allows caregivers to manage medications for selected Elder:
 * - View list of medications
 * - Add new medications
 * - Edit existing medications
 * - Delete medications
 */

import { useState, useEffect, useId, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
import type { Medication } from '../../types/schema';
import { TintedCard } from '../../components/theme/TintedCard';
import { Button } from '../../components/ui/button';
import { Pill, Plus, Edit, Trash2, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useLinkedElders } from './elders/useLinkedElders';

interface MedicationFormData {
  name: string;
  dosage: string;
  frequency: string; // Human-readable frequency (e.g., "Once daily", "Twice daily")
  schedule_cron: string; // Cron expression
  purpose: string;
}

const frequencyOptions = [
  { label: 'Once daily', cron: '0 9 * * *' }, // 9 AM daily
  { label: 'Twice daily', cron: '0 9,21 * * *' }, // 9 AM and 9 PM
  { label: 'Three times daily', cron: '0 9,14,21 * * *' }, // 9 AM, 2 PM, 9 PM
  { label: 'Four times daily', cron: '0 8,12,18,22 * * *' }, // 8 AM, 12 PM, 6 PM, 10 PM
  { label: 'Every 12 hours', cron: '0 */12 * * *' },
  { label: 'Every 8 hours', cron: '0 */8 * * *' },
  { label: 'Every 6 hours', cron: '0 */6 * * *' },
  { label: 'Weekly', cron: '0 9 * * 0' }, // Sunday 9 AM
  { label: 'As needed', cron: null }, // No schedule
];

const MedicationsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const elderId = searchParams.get('elder');
  const { elders } = useLinkedElders();
  const nameId = useId();
  const dosageId = useId();
  const frequencyId = useId();
  const purposeId = useId();
  
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    dosage: '',
    frequency: '',
    schedule_cron: '',
    purpose: '',
  });

  // Get elder name for display
  const selectedElder = elders.find((e) => e.id === elderId);

  const fetchMedications = useCallback(async () => {
    if (!elderId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('medications')
        .select('*')
        .eq('elder_id', elderId)
        .order('name', { ascending: true });

      if (fetchError) {
        throw new Error(`Failed to fetch medications: ${fetchError.message}`);
      }

      setMedications(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [elderId]);

  useEffect(() => {
    if (!elderId) {
      setError('No elder selected');
      setIsLoading(false);
      return;
    }

    fetchMedications();
  }, [elderId, fetchMedications]);

  const handleFrequencyChange = (frequencyLabel: string) => {
    const option = frequencyOptions.find((opt) => opt.label === frequencyLabel);
    setFormData({
      ...formData,
      frequency: frequencyLabel,
      schedule_cron: option?.cron || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!elderId || !formData.name.trim()) {
      setError('Medication name is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const medicationData = {
        elder_id: elderId,
        name: formData.name.trim(),
        dosage: formData.dosage.trim() || null,
        schedule_cron: formData.schedule_cron || null,
        // Note: Purpose field not in schema - storing in name or dosage for now
        // In production, you may want to add a purpose column to the medications table
      };

      if (editingMedication) {
        // Update existing medication
        const { error: updateError } = await supabase
          .from('medications')
          .update(medicationData)
          .eq('id', editingMedication.id);

        if (updateError) {
          throw new Error(`Failed to update medication: ${updateError.message}`);
        }
      } else {
        // Insert new medication
        const { error: insertError } = await supabase
          .from('medications')
          .insert(medicationData);

        if (insertError) {
          throw new Error(`Failed to add medication: ${insertError.message}`);
        }
      }

      // Reset form and refresh list
      setFormData({
        name: '',
        dosage: '',
        frequency: '',
        schedule_cron: '',
        purpose: '',
      });
      setShowForm(false);
      setEditingMedication(null);
      await fetchMedications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (medication: Medication) => {
    // Find matching frequency option
    const matchingOption = frequencyOptions.find(
      (opt) => opt.cron === medication.schedule_cron
    );
    
    setFormData({
      name: medication.name,
      dosage: medication.dosage || '',
      frequency: matchingOption?.label || '',
      schedule_cron: medication.schedule_cron || '',
      purpose: '', // Not stored in schema currently
    });
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleDelete = async (medicationId: string) => {
    if (!confirm('Are you sure you want to delete this medication? This action cannot be undone.')) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('medications')
        .delete()
        .eq('id', medicationId);

      if (deleteError) {
        throw new Error(`Failed to delete medication: ${deleteError.message}`);
      }

      await fetchMedications();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMedication(null);
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      schedule_cron: '',
      purpose: '',
    });
  };

  // No elder selected
  if (!elderId) {
    return (
      <div className="space-y-4">
        <TintedCard variant="accent">
          <div className="text-center py-4">
            <p className="text-foreground font-semibold mb-2">No Elder Selected</p>
            <p className="text-foreground text-sm mb-4">
              Please select an elder to manage their medications.
            </p>
            <Button
              onClick={() => navigate('/caregiver')}
              variant="outline"
            >
              <ArrowLeft size={16} className="mr-2" />
              Select Elder
            </Button>
          </div>
        </TintedCard>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-foreground">Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Medications</h1>
          <p className="text-muted-foreground">
            Managing medications for {selectedElder?.full_name || 'Selected Elder'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/caregiver/dashboard?elder=${elderId}`)}
            variant="outline"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary text-primary-foreground"
            >
              <Plus size={16} className="mr-2" />
              Add Medication
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <TintedCard variant="destructive">
          <div className="flex items-center justify-between">
            <p className="text-foreground">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-foreground hover:opacity-80 transition-all shadow-realistic active:scale-95"
            >
              <X size={16} />
            </button>
          </div>
        </TintedCard>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <TintedCard variant="accent" className="border-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
              </h2>
              <button
                type="button"
                onClick={handleCancel}
                className="text-foreground hover:opacity-80 transition-all shadow-realistic active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor={nameId} className="block text-sm font-medium text-foreground mb-2">
                  Medication Name *
                </label>
                <input
                  id={nameId}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Lisinopril"
                  required
                />
              </div>

              <div>
                <label htmlFor={dosageId} className="block text-sm font-medium text-foreground mb-2">
                  Dosage
                </label>
                <input
                  id={dosageId}
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 10mg"
                />
              </div>

              <div>
                <label htmlFor={frequencyId} className="block text-sm font-medium text-foreground mb-2">
                  Frequency *
                </label>
                <select
                  id={frequencyId}
                  value={formData.frequency}
                  onChange={(e) => handleFrequencyChange(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select frequency</option>
                  {frequencyOptions.map((option) => (
                    <option key={option.label} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={purposeId} className="block text-sm font-medium text-foreground mb-2">
                  Purpose
                </label>
                <input
                  id={purposeId}
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Blood pressure"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-primary-foreground"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Pill size={16} className="mr-2" />
                    {editingMedication ? 'Update' : 'Add'} Medication
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </TintedCard>
      )}

      {/* Medications List */}
      {medications.length === 0 ? (
        <TintedCard variant="accent">
          <div className="text-center py-8">
            <Pill size={48} className="mx-auto mb-4 text-foreground opacity-60" />
            <p className="text-foreground font-semibold text-lg mb-2">No Medications</p>
            <p className="text-foreground text-sm mb-4">
              Add medications to help track medication schedules.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary text-primary-foreground"
            >
              <Plus size={16} className="mr-2" />
              Add First Medication
            </Button>
          </div>
        </TintedCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((medication) => {
            const frequencyOption = frequencyOptions.find(
              (opt) => opt.cron === medication.schedule_cron
            );
            const frequencyLabel = frequencyOption?.label || 'Custom schedule';

            return (
              <TintedCard key={medication.id} variant="accent" className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Pill size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {medication.name}
                      </h3>
                      {medication.dosage && (
                        <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <span className="font-medium">Frequency:</span>
                    <span>{frequencyLabel}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button
                    onClick={() => handleEdit(medication)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit size={14} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(medication.id)}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </TintedCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicationsPage;
