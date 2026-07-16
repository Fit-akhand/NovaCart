"use client";

import { motion } from "framer-motion";
import Button from "../common/Button";
import HeroStats from "./HeroStats";

export default function HeroContent() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-medium">
        🚀 New Collection 2026
      </span>

      <h1 className="mt-6 text-5xl lg:text-7xl font-black leading-tight">
        Shop
        <span className="text-blue-600"> Smarter.</span>
        <br />
        Live Better.
      </h1>

      <p className="mt-8 text-lg text-gray-500 leading-8 max-w-xl">
        Discover premium electronics, fashion, lifestyle and
        everyday essentials with secure checkout, fast delivery
        and trusted shopping.
      </p>

      <div className="flex gap-5 mt-10">

        <Button size="lg">
          Shop Now
        </Button>

        <Button variant="outline" size="lg">
          Explore Deals
        </Button>

      </div>

      <HeroStats />
    </motion.div>
  );
}