"use client";

import { motion } from "framer-motion";

export default function CategoryCard({ category }) {
  const Icon = category.icon;

  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-xl cursor-pointer"
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${category.color}`}
      >
        <Icon size={32} />
      </div>

      <h3 className="text-2xl font-bold mt-6">
        {category.name}
      </h3>

      <p className="text-gray-500 mt-3 leading-7">
        {category.description}
      </p>
    </motion.div>
  );
}