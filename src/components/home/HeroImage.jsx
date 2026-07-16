"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroImage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .8 }}
      className="relative flex justify-center"
    >
      <Image
        src="/images/hero.png"
        alt="NovaCart Hero"
        width={650}
        height={650}
        priority
      />

      <motion.div
        animate={{
          y: [0, -12, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
        }}
        className="absolute top-8 right-10 bg-white shadow-xl rounded-2xl p-5"
      >
        <p className="font-bold text-blue-600">
          ⭐ 4.9 Rating
        </p>
      </motion.div>

      <motion.div
        animate={{
          y: [0, 12, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
        }}
        className="absolute bottom-10 left-5 bg-white shadow-xl rounded-2xl p-5"
      >
        <p className="font-bold text-green-600">
          🚚 Fast Delivery
        </p>
      </motion.div>
    </motion.div>
  );
}