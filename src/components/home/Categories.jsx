"use client";

import { motion } from "framer-motion";
import CategoryCard from "./CategoryCard";
import { categories } from "./categoryData";

export default function Categories() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-blue-600 font-semibold">
            SHOP BY CATEGORY
          </p>

          <h2 className="text-5xl font-bold mt-4">
            Browse Popular Categories
          </h2>

          <p className="text-gray-500 mt-6 max-w-xl">
            Discover products from our carefully curated
            collections designed for every lifestyle.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      </div>
    </section>
  );
}