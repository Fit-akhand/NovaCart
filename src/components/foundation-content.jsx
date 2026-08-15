"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function FoundationContent() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Stage 1 — Modern Foundation
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">NovaCart</h1>
        <p className="max-w-md text-muted-foreground">
          App Router, Tailwind CSS, shadcn/ui, Lucide, and Framer Motion are
          configured. Legacy Pages Router routes remain available during
          migration.
        </p>
      </motion.div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Foundation stack</CardTitle>
          <CardDescription>
            Next.js 16 · React 19 · Tailwind · shadcn/ui
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/signin">Legacy sign in</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/cart">Legacy cart</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/register">Legacy register</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
