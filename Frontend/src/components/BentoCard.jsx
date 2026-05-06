import { motion } from 'framer-motion';

export default function BentoCard({
  children,
  className = '',
  colSpan = 1,
  rowSpan = 1,
  variant = 'default', // 'default' | 'primary' | 'secondary'
  noPadding = false,
  id,
}) {
  const spanClasses = [
    colSpan === 2 ? 'md:col-span-2' : '',
    colSpan === 3 ? 'lg:col-span-3' : '',
    colSpan === 4 ? 'xl:col-span-4' : '',
    rowSpan === 2 ? 'md:row-span-2' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const variantClasses = {
    default: 'bg-white border-black/5',
    primary: 'bg-primary text-white border-primary-light',
    secondary: 'bg-secondary border-secondary-dark/30',
  };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`
        rounded-3xl border shadow-sm
        hover:shadow-lg hover:-translate-y-1
        transition-all duration-300 ease-out
        ${noPadding ? '' : 'p-5 sm:p-6'}
        ${variantClasses[variant]}
        ${spanClasses}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
