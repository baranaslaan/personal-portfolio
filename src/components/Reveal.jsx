import React from 'react';
import { motion } from 'framer-motion';

export const Reveal = ({ children, delay = 0.2 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} // 30px aşağıdan ve görünmez başlar
      whileInView={{ opacity: 1, y: 0 }} // Görüş alanına girince yerine oturur
      viewport={{ once: true, amount: 0.05 }} // Sadece bir kez ve %5'i görününce çalışır — uzun bölümler (Projects vb.) mobilde de tetiklenebilsin diye düşük tutuldu
      transition={{ 
        duration: 0.8, 
        delay: delay, 
        ease: [0.16, 1, 0.3, 1] // Premium bir "Expo" yavaşlama eğrisi
      }}
    >
      {children}
    </motion.div>
  );
};