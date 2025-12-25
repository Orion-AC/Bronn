import { cn } from '../lib/utils';

type ShowPoweredByProps = {
  show: boolean;
  position?: 'sticky' | 'absolute' | 'static';
};

/**
 * ShowPoweredBy component - DISABLED for Bronn white-label deployment.
 * This component is intentionally hidden to maintain Bronn branding.
 */
const ShowPoweredBy = ({ show, position = 'sticky' }: ShowPoweredByProps) => {
  // Always return null for white-label deployment
  return null;
};

ShowPoweredBy.displayName = 'ShowPoweredBy';
export { ShowPoweredBy };

