import { motion } from 'motion/react';
import AIChatbot from '../../AIChatbot';
import { aquaAiViewUI as ui } from './ui';

export const AquaAiView: React.FC = () => {
  return (
    <motion.div
      key={ui.page.motionKey}
      initial={ui.page.animation.initial}
      animate={ui.page.animation.animate}
      className={ui.page.layout}
    >
      <AIChatbot />
    </motion.div>
  );
};
