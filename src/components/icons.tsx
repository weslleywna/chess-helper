import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const FirstIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M17 18l-6-6 6-6" />
    <path d="M7 6v12" />
  </Icon>
);

export const PrevIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M15 18l-6-6 6-6" />
  </Icon>
);

export const NextIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 18l6-6-6-6" />
  </Icon>
);

export const LastIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 18l6-6-6-6" />
    <path d="M17 6v12" />
  </Icon>
);

export const FlipIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 4v16" />
    <path d="M3 8l4-4 4 4" />
    <path d="M17 20V4" />
    <path d="M21 16l-4 4-4-4" />
  </Icon>
);

export const ResetIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </Icon>
);

export const UploadIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 15V3" />
    <path d="M7 8l5-5 5 5" />
    <path d="M5 21h14" />
  </Icon>
);

export const EditIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Icon>
);

export const CopyIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
);

export const BulbIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
  </Icon>
);

export const UndoIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </Icon>
);

export const PlayIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 4l14 8-14 8z" />
  </Icon>
);

export const EraseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 20H8.5L3.6 15.1a2 2 0 0 1 0-2.8L13 3l8 8-7.5 7.5" />
    <path d="M7 11l7 7" />
  </Icon>
);

export const SearchIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
);

const KNIGHT_BODY = 'M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21';
const KNIGHT_HEAD =
  'M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3';

/** Cavalo do logotipo (silhueta das peças "cburnett"). */
export const KnightLogo = (props: IconProps) => (
  <svg viewBox="0 0 45 45" width="28" height="28" aria-hidden="true" {...props}>
    <g fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={KNIGHT_BODY} />
      <path d={KNIGHT_HEAD} />
    </g>
    <g fill="var(--logo-detail, #000)" stroke="var(--logo-detail, #000)" strokeWidth="1.5">
      <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" />
      <path d="M15 15.5a.5 1.5 0 1 1-1 0 .5 1.5 0 1 1 1 0z" transform="matrix(.866 .5 -.5 .866 9.693 -5.173)" />
    </g>
  </svg>
);
