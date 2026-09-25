export default function Mark({
  size = 28,
  title,
}: {
  size?: number;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        d="M4.5 8.5Q9.5 17.5 13.5 25.5Q18.5 15 22.5 8.2C24.3 5 29 5.6 28.2 9C27.6 11.8 23.8 11.6 22.5 8.2"
        stroke="currentColor"
        strokeWidth={4.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
