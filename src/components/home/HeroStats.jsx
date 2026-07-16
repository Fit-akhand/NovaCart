"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "15K+",
    title: "Happy Customers",
  },
  {
    value: "1200+",
    title: "Products",
  },
  {
    value: "4.9★",
    title: "Average Rating",
  },
];

export default function HeroStats() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: .6 }}
      className="grid grid-cols-3 gap-8 mt-14"
    >
      {stats.map((item) => (
        <div key={item.title}>
          <h2 className="text-3xl font-bold text-blue-600">
            {item.value}
          </h2>

          <p className="text-gray-500 mt-2">
            {item.title}
          </p>
        </div>
      ))}
    </motion.div>
  );
}