import { z } from 'zod';

export interface SectionTypeDef {
  id: string;
  label: string;
  description: string;
  schema: z.ZodTypeAny;
  defaults: () => unknown;
  render: (data: unknown) => string;
}

export const SECTION_TYPES: Record<string, SectionTypeDef> = {};

export function registerSectionType(def: SectionTypeDef): void {
  SECTION_TYPES[def.id] = def;
}

export function getSectionType(id: string): SectionTypeDef | undefined {
  return SECTION_TYPES[id];
}

export function listSectionTypes(): SectionTypeDef[] {
  return Object.values(SECTION_TYPES);
}
