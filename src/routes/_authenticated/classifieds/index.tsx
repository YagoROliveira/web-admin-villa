import { createFileRoute } from '@tanstack/react-router';
import { ClassifiedsPage } from '@/features/classifieds';

export const Route = createFileRoute('/_authenticated/classifieds/')({
  component: ClassifiedsPage,
});