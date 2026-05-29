export function BlantonBottleArt({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/blantons-bottle.png"
      alt=""
      className={className}
      aria-hidden
    />
  );
}
