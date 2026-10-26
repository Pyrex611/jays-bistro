/** Line-art WhatsApp glyph (speech bubble + handset), drawn to match the category icon set. */
export default function WhatsAppIcon({ size = 22, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 3.3a8.7 8.7 0 0 0-7.5 13.1L3.3 20.7l4.4-1.2A8.7 8.7 0 1 0 12 3.3Z" />
      <path d="M9.3 8.6c.3-.5.8-.4 1 0l.7 1.5c.1.3 0 .6-.2.8l-.5.5c.7 1.3 1.7 2.2 3 2.9l.5-.5c.3-.3.6-.3.9-.2l1.5.7c.4.2.4.7.1 1.1-.7.9-1.7 1.2-2.7.8-2.7-1-4.5-2.9-5.3-5.2-.2-.9.1-1.7 1-2.4Z" />
    </svg>
  );
}
