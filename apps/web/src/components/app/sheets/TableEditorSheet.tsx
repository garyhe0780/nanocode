import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '~/components/ui/sheet';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { useCreateTable } from '~/hooks/use-tables';

type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'email' | 'phone' | 'url';

interface Field {
  id: string;
  name: string;
  slug: string;
  type: FieldType;
  isPrimary: boolean;
  isRequired: boolean;
  defaultValue?: string;
}

interface TableEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  onSuccess?: () => void;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
];

function generateId() {
  return Math.random().toString(36).substring(2, 11);
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function TableEditorSheet({
  open,
  onOpenChange,
  workspaceSlug,
  onSuccess,
}: TableEditorSheetProps) {
  const [tableName, setTableName] = useState('');
  const [tableSlug, setTableSlug] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const createTable = useCreateTable();

  useEffect(() => {
    if (open) {
      setFields([
        {
          id: generateId(),
          name: 'id',
          slug: 'id',
          type: 'number',
          isPrimary: true,
          isRequired: true,
        },
      ]);
      setTableName('');
      setTableSlug('');
    }
  }, [open]);

  function handleNameChange(name: string) {
    setTableName(name);
    if (!tableSlug || tableSlug === slugify(tableName)) {
      setTableSlug(slugify(name));
    }
  }

  function handleSlugChange(slug: string) {
    setTableSlug(slugify(slug));
  }

  function addField() {
    const newField: Field = {
      id: generateId(),
      name: '',
      slug: '',
      type: 'text',
      isPrimary: false,
      isRequired: false,
    };
    setFields([...fields, newField]);
  }

  function updateField(index: number, updates: Partial<Field>) {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };

    if (updates.name !== undefined) {
      const currentSlug = newFields[index].slug;
      const expectedAutoSlug = slugify(updates.name);
      if (currentSlug === slugify(newFields[index].name.slice(0, -1)) || !currentSlug) {
        newFields[index].slug = expectedAutoSlug;
      }
    }

    if (updates.isPrimary === true) {
      newFields.forEach((f, i) => {
        if (i !== index) f.isPrimary = false;
      });
    }

    setFields(newFields);
  }

  function deleteField(index: number) {
    if (fields.length <= 1) return;
    setFields(fields.filter((_, i) => i !== index));
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...fields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);
    setDraggedIndex(index);
    setFields(newFields);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tableName.trim() || !tableSlug.trim()) return;
    if (fields.length === 0) return;

    for (const field of fields) {
      if (!field.name.trim() || !field.slug.trim()) return;
    }

    await createTable.mutateAsync({
      workspaceSlug,
      name: tableName.trim(),
      slug: tableSlug.trim(),
      fields: fields.map((f) => ({
        name: f.name.trim(),
        slug: f.slug.trim(),
        type: f.type,
        isPrimary: f.isPrimary,
        isRequired: f.isRequired,
      })),
    });

    onSuccess?.();
    onOpenChange(false);
  }

  const loading = createTable.isPending;
  const isValid =
    tableName.trim() &&
    tableSlug.trim() &&
    fields.length > 0 &&
    fields.every((f) => f.name.trim() && f.slug.trim());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={{ width: '640px', maxWidth: '640px' }} className="flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Create Table</SheetTitle>
            <SheetDescription>
              Define your table structure by adding fields and their types.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-auto px-6 py-4">
            {/* Table Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Table Name</label>
                <Input
                  value={tableName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Users"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={tableSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="e.g. users"
                  className="w-full"
                />
              </div>
            </div>

            {/* Field Editor */}
            <div className="border border-border/50 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[32px_1.5fr_140px_80px_80px_40px] gap-2 px-3 py-2 bg-muted/50 border-b border-border/50 text-xs font-medium text-muted-foreground">
                <div></div>
                <div>Field Name</div>
                <div>Type</div>
                <div className="text-center">Primary</div>
                <div className="text-center">Required</div>
                <div></div>
              </div>

              {/* Fields */}
              <div className="divide-y divide-border/30">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    draggable={!field.isPrimary}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`grid grid-cols-[32px_1.5fr_140px_80px_80px_40px] gap-2 px-3 py-2 items-center group ${
                      draggedIndex === index ? 'opacity-50 bg-muted' : ''
                    } ${field.isPrimary ? '' : 'hover:bg-muted/30'}`}
                  >
                    {/* Drag Handle */}
                    <div className="w-8 h-8 flex items-center justify-center cursor-grab">
                      {!field.isPrimary && (
                        <svg
                          className="w-4 h-4 text-muted-foreground/50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8h16M4 16h16"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Field Name */}
                    <div>
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          updateField(index, { name: e.target.value })
                        }
                        placeholder="Field name"
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Field Type */}
                    <div>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(index, { type: e.target.value as FieldType })
                        }
                        className="h-8 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
                      >
                        {FIELD_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Primary Key */}
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          updateField(index, { isPrimary: !field.isPrimary })
                        }
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          field.isPrimary
                            ? 'bg-foreground border-foreground'
                            : 'border-muted-foreground/30 hover:border-muted-foreground/50'
                        }`}
                      >
                        {field.isPrimary && (
                          <svg
                            className="w-3 h-3 text-background"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Required */}
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          updateField(index, { isRequired: !field.isRequired })
                        }
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          field.isRequired
                            ? 'bg-foreground border-foreground'
                            : 'border-muted-foreground/30 hover:border-muted-foreground/50'
                        }`}
                      >
                        {field.isRequired && (
                          <svg
                            className="w-3 h-3 text-background"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Delete */}
                    <div className="w-10 flex items-center justify-center">
                      {fields.length > 1 && !field.isPrimary && (
                        <button
                          type="button"
                          onClick={() => deleteField(index)}
                          className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/50 hover:text-destructive transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Field Button */}
            <button
              type="button"
              onClick={addField}
              className="mt-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Field
            </button>
          </div>

          {/* Footer */}
          <SheetFooter className="px-6 py-4 border-t border-border gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isValid}>
              {loading ? <Spinner /> : null}
              Create Table
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
