import BlurText from '@/components/react-bits/BlurText/BlurText';
import FadeContent from '@/components/react-bits/FadeContent/FadeContent';
import SpotlightCard from '@/components/react-bits/SpotlightCard/SpotlightCard';

export function BrandHeadline({ text }) {
  return <BlurText text={text} />;
}
export function BrandReveal({ children, className }) {
  return <FadeContent className={className}>{children}</FadeContent>;
}
export function BrandCard({ children, className }) {
  return <SpotlightCard className={className}>{children}</SpotlightCard>;
}
