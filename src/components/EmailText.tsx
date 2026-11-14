import { Fragment } from 'react';

/**
 * An email address that may only break before "@" and ".", so on a narrow
 * phone it wraps as "hello / @coach-adam / .example.com", never mid-word.
 */
export default function EmailText({ email }: { email: string }) {
  const parts = email.split(/(?=[@.])/);
  return (
    <span dir="ltr" className="[overflow-wrap:normal]">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {part}
        </Fragment>
      ))}
    </span>
  );
}
