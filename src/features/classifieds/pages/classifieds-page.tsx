import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassifiedsList } from '../components/classifieds-list';
import { CategoryManagement } from '../components/category-management';

export function ClassifiedsPage() {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="classifieds" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="classifieds">Classificados</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="classifieds" className="space-y-6">
          <ClassifiedsList />
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CategoryManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}