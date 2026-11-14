/** "Hi {coach}" + { coach: "Adam" } → "Hi Adam". Unknown keys are left as they are. */
export const fill = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
