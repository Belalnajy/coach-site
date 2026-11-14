/**
 * Text with signed numbers in it ("−14 كجم", "بنش +30 كجم"). Each number
 * (with its sign and % sign) is isolated left-to-right, so in Arabic the
 * minus stays in front of the number instead of jumping to the other side.
 */
export default function Numeric({ text }: { text: string }) {
  return (
    <>
      {text.split(/([+\-−]?\d[\d.,]*%?)/).map((part, i) =>
        i % 2 ? (
          <bdi key={i} dir="ltr">
            {part}
          </bdi>
        ) : (
          part
        ),
      )}
    </>
  );
}
