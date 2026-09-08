"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";

import { useAuth } from "@/lib/hooks/useAuth";

import LandingComposition from "./marketing/landing/LandingComposition";

interface MarketingLandingPageProps {
  onStartWritingAction: () => void;
  libraryCount: number;
  hideNav?: boolean;
}

export default function MarketingLandingPage({
  onStartWritingAction,
  hideNav = false,
}: MarketingLandingPageProps) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    track("landing_viewed");
  }, []);

  const startWriting = user
    ? onStartWritingAction
    : () => router.push("/make-ebook/signin?mode=signup");

  return <LandingComposition onStartWriting={startWriting} hideNav={hideNav} />;
}
