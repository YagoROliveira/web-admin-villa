import { createFileRoute } from '@tanstack/react-router';
import { ClassifiedsPage } from '@/features/classifieds';
import { requirePermission } from '@/lib/route-guards';

export const Route = createFileRoute('/_authenticated/classifieds/')({
  beforeLoad: requirePermission('wallet.classifieds.view'),
  component: ClassifiedsPage,
});