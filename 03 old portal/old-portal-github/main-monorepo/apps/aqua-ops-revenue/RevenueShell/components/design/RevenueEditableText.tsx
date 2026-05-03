import React from 'react';

interface EditableTextProps {
  textKey?: string;
  fallback: string;
  className?: string;
  as?: any;
}

export function EditableText({ textKey, fallback, className, as: Component = 'span' }: EditableTextProps) {
  // Simple stub that just renders the text for now
  return <Component className={className}>{fallback}</Component>;
}
