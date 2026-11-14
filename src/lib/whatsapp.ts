import type { Locale } from '../../site.config/types.ts';
import { dict, fill } from './i18n.ts';

/**
 * Builds the booking message and the wa.me link. Pure functions: the form
 * resolves ids to labels and passes plain text in, so this can be tested
 * without the config.
 *
 * WhatsApp renders *text* as bold. User-typed text is cleaned of the
 * characters that would break that formatting or the layout (asterisks,
 * underscores, tildes, backticks, stray line breaks in one-line fields).
 */

export interface BookingMessageInput {
  lang: Locale;
  /** Short name used in the greeting, e.g. "Adam" / "كابتن آدم". */
  coachName: string;
  name: string;
  /** Package name, or undefined when the visitor has not decided. */
  packageName?: string;
  /** Formatted price, e.g. "1,200 EGP per month". */
  packagePrice?: string;
  goal?: string;
  /** Day label, or undefined for "any day". */
  day?: string;
  /** Time slot label, or undefined for "any time". */
  slot?: string;
  note?: string;
}

const MAX_NAME = 60;
const MAX_NOTE = 500;

/** One line of user text: no WhatsApp formatting characters, no line breaks, trimmed. */
export const cleanLine = (value: string, max = MAX_NAME): string =>
  value
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

/** A short paragraph of user text: keeps single line breaks, drops formatting characters. */
export const cleanNote = (value: string): string =>
  value
    .replace(/[*_~`]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim()
    .slice(0, MAX_NOTE);

export const buildBookingMessage = (input: BookingMessageInput): string => {
  const m = dict(input.lang).message;
  const row = (label: string, value: string) => `*${label}:* ${value}`;
  const pkg = input.packageName
    ? input.packagePrice
      ? `${cleanLine(input.packageName, 80)} (${cleanLine(input.packagePrice, 60)})`
      : cleanLine(input.packageName, 80)
    : m.undecided;
  const lines = [
    fill(m.greeting, { coach: cleanLine(input.coachName) }),
    m.intro,
    '',
    row(m.name, cleanLine(input.name) || '—'),
    row(m.package, pkg),
  ];
  if (input.goal) lines.push(row(m.goal, cleanLine(input.goal, 80)));
  lines.push(row(m.day, input.day ? cleanLine(input.day) : m.anyDay));
  lines.push(row(m.slot, input.slot ? cleanLine(input.slot) : m.anySlot));
  const note = input.note ? cleanNote(input.note) : '';
  if (note) lines.push(`*${m.note}:*`, note);
  lines.push('', m.thanks);
  return lines.join('\n');
};

/** wa.me link with the text percent-encoded (UTF-8), so Arabic and line breaks survive. */
export const whatsappUrl = (phone: string, text?: string): string => {
  const digits = phone.replace(/\D/g, '');
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
};
