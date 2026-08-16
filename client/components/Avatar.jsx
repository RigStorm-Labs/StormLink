import { initials } from '@/lib/constants';

export default function Avatar({ name = '', image, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={name} className={`${sizes[size]} rounded-full border border-white/20 object-cover`} />;
  }
  return (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-sky-500/60 to-violet-600/60 font-display font-semibold text-white`}
    >
      {initials(name) || '?'}
    </div>
  );
}
