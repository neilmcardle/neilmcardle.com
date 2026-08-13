'use client';

import { LessonReader } from './LessonReader';

interface Section {
  title: string;
  index: number;
}

interface LessonReaderWrapperProps {
  title: string;
  module: number;
  phase: string;
  sections: Section[];
  mdxContent: React.ReactNode;
}

export function LessonReaderWrapper({
  title,
  module,
  phase,
  sections,
  mdxContent,
}: LessonReaderWrapperProps) {
  return (
    <LessonReader
      title={title}
      module={module}
      phase={phase}
      sections={sections}
      mdxContent={mdxContent}
    />
  );
}
