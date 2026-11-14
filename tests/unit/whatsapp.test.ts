import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildBookingMessage, cleanLine, cleanNote, whatsappUrl } from '../../src/lib/whatsapp.ts';

test('Arabic booking message: greeting, bold labels, every choice, thanks', () => {
  const text = buildBookingMessage({
    lang: 'ar',
    coachName: 'كابتن آدم',
    name: 'سارة',
    packageName: 'متابعة أونلاين شهرية',
    packagePrice: '1,200 ج.م شهرياً',
    goal: 'خسارة الدهون',
    day: 'الأحد',
    slot: 'مساءً (5 – 10)',
    note: 'عندي إصابة قديمة في الركبة',
  });
  assert.equal(
    text,
    [
      'مرحباً كابتن آدم،',
      'أود الحجز من خلال موقعك:',
      '',
      '*الاسم:* سارة',
      '*الباقة:* متابعة أونلاين شهرية (1,200 ج.م شهرياً)',
      '*الهدف:* خسارة الدهون',
      '*اليوم المفضل:* الأحد',
      '*الوقت المفضل:* مساءً (5 – 10)',
      '*ملاحظة:*',
      'عندي إصابة قديمة في الركبة',
      '',
      'شكراً!',
    ].join('\n'),
  );
});

test('English booking message with undecided package and any day/time', () => {
  const text = buildBookingMessage({ lang: 'en', coachName: 'Adam', name: '  Sarah  ' });
  assert.equal(
    text,
    [
      'Hi Adam,',
      'I’d like to book through your website:',
      '',
      '*Name:* Sarah',
      '*Program:* Not sure yet, I’d like your advice',
      '*Preferred day:* Any day',
      '*Preferred time:* Any time',
      '',
      'Thanks!',
    ].join('\n'),
  );
});

test('user text cannot break WhatsApp formatting or the layout', () => {
  assert.equal(cleanLine('*Sa_rah~`\n  N.'), 'Sarah N.');
  assert.equal(cleanLine('x'.repeat(200)).length, 60);
  assert.equal(cleanNote('line one  \n\n\n\n*line* two'), 'line one\n\nline two');
  const text = buildBookingMessage({ lang: 'en', coachName: 'Adam', name: '*bold*', note: '   ' });
  assert.ok(text.includes('*Name:* bold'));
  assert.ok(!text.includes('*Note:*'), 'an empty note adds no line');
});

test('wa.me link: digits only, UTF-8 percent-encoding of Arabic, line breaks and symbols', () => {
  assert.equal(whatsappUrl('+20 100 000-0000'), 'https://wa.me/201000000000');
  const url = whatsappUrl('201000000000', 'مرحباً\n*الاسم:* سارة & 100%?');
  assert.equal(
    url,
    'https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%0A*%D8%A7%D9%84%D8%A7%D8%B3%D9%85%3A*%20%D8%B3%D8%A7%D8%B1%D8%A9%20%26%20100%25%3F',
  );
  // Round trip: what WhatsApp decodes is exactly what was built.
  const message = buildBookingMessage({ lang: 'ar', coachName: 'كابتن آدم', name: 'سارة', day: 'الأحد' });
  const encoded = new URL(whatsappUrl('201000000000', message));
  assert.equal(encoded.searchParams.get('text'), message);
  assert.ok(!/[\s&#]/.test(encoded.search.slice(6)), 'no raw spaces, ampersands or hashes in the query');
});

test('English link encodes apostrophes-safe text and keeps it intact', () => {
  const message = buildBookingMessage({ lang: 'en', coachName: 'Adam', name: 'O’Neil & Co', packageName: 'Monthly online coaching', packagePrice: '1,200 EGP per month' });
  const url = new URL(whatsappUrl('201000000000', message));
  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.pathname, '/201000000000');
  assert.equal(url.searchParams.get('text'), message);
  assert.ok(message.includes('*Program:* Monthly online coaching (1,200 EGP per month)'));
});
