import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClassifiedCategory, ClassifiedSubcategory } from '../types';
import { useClassifieds } from '../hooks/use-classifieds';

interface CategoryFormData {
  name: string;
  icon: string;
  description?: string;
  isActive: boolean;
}

interface SubcategoryFormData {
  name: string;
  description?: string;
  isActive: boolean;
  customFields?: CustomField[];
}

interface CustomField {
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date';
  required: boolean;
  options?: string[];
}

const initialCategoryForm: CategoryFormData = {
  name: '',
  icon: '',
  description: '',
  isActive: true
};

const initialSubcategoryForm: SubcategoryFormData = {
  name: '',
  description: '',
  isActive: true,
  customFields: []
};

export function CategoryManagement() {
  const { categories, loadCategories } = useClassifieds();
  const [selectedCategory, setSelectedCategory] = useState<ClassifiedCategory | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ClassifiedCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<ClassifiedSubcategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>(initialCategoryForm);
  const [subcategoryForm, setSubcategoryForm] = useState<SubcategoryFormData>(initialSubcategoryForm);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'subcategory'; id: number; name: string } | null>(null);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCategorySubmit = async () => {
    try {
      if (editingCategory) {
        // TODO: Implementar atualização de categoria
        console.log('Updating category:', { ...editingCategory, ...categoryForm });
      } else {
        // TODO: Implementar criação de categoria
        console.log('Creating category:', categoryForm);
      }
      setCategoryDialogOpen(false);
      setCategoryForm(initialCategoryForm);
      setEditingCategory(null);
      // Recarregar categorias
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleSubcategorySubmit = async () => {
    try {
      if (editingSubcategory) {
        // TODO: Implementar atualização de subcategoria
        console.log('Updating subcategory:', { ...editingSubcategory, ...subcategoryForm });
      } else {
        // TODO: Implementar criação de subcategoria
        console.log('Creating subcategory:', { ...subcategoryForm, categoryId: selectedCategory?.id });
      }
      setSubcategoryDialogOpen(false);
      setSubcategoryForm(initialSubcategoryForm);
      setEditingSubcategory(null);
      // Recarregar categorias
      loadCategories();
    } catch (error) {
      console.error('Error saving subcategory:', error);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'category') {
        // TODO: Implementar exclusão de categoria
        console.log('Deleting category:', itemToDelete.id);
      } else {
        // TODO: Implementar exclusão de subcategoria
        console.log('Deleting subcategory:', itemToDelete.id);
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      // Recarregar categorias
      loadCategories();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openCategoryDialog = (category?: ClassifiedCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        icon: category.icon || '',
        description: category.description || '',
        isActive: category.isActive
      });
    } else {
      setEditingCategory(null);
      setCategoryForm(initialCategoryForm);
    }
    setCategoryDialogOpen(true);
  };

  const openSubcategoryDialog = (subcategory?: ClassifiedSubcategory) => {
    if (subcategory) {
      setEditingSubcategory(subcategory);
      setSubcategoryForm({
        name: subcategory.name,
        description: subcategory.description || '',
        isActive: subcategory.isActive,
        customFields: subcategory.customFields || []
      });
    } else {
      setEditingSubcategory(null);
      setSubcategoryForm(initialSubcategoryForm);
    }
    setSubcategoryDialogOpen(true);
  };

  const openDeleteDialog = (type: 'category' | 'subcategory', id: number, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const addCustomField = () => {
    setSubcategoryForm(prev => ({
      ...prev,
      customFields: [
        ...(prev.customFields || []),
        { name: '', type: 'text', required: false }
      ]
    }));
  };

  const removeCustomField = (index: number) => {
    setSubcategoryForm(prev => ({
      ...prev,
      customFields: prev.customFields?.filter((_, i) => i !== index) || []
    }));
  };

  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    setSubcategoryForm(prev => ({
      ...prev,
      customFields: prev.customFields?.map((cf, i) =>
        i === index ? { ...cf, ...field } : cf
      ) || []
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Categorias</h1>
          <p className="text-muted-foreground">
            Configure as categorias e subcategorias dos classificados
          </p>
        </div>
        <Button onClick={() => openCategoryDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedCategory?.id === category.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-gray-50'
                    }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <div className="font-semibold">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-muted-foreground">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCategoryDialog(category);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog('category', category.id, category.name);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subcategories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Subcategorias
                {selectedCategory && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    de {selectedCategory.name}
                  </span>
                )}
              </span>
              {selectedCategory && (
                <Button
                  size="sm"
                  onClick={() => openSubcategoryDialog()}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nova
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCategory ? (
              <div className="space-y-3">
                {selectedCategory.subcategories?.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{subcategory.name}</div>
                        {subcategory.description && (
                          <div className="text-sm text-muted-foreground">
                            {subcategory.description}
                          </div>
                        )}
                        {subcategory.customFields && subcategory.customFields.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {subcategory.customFields.length} campo(s) personalizado(s)
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={subcategory.isActive ? 'default' : 'secondary'}>
                          {subcategory.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSubcategoryDialog(subcategory)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog('subcategory', subcategory.id, subcategory.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )) || []}
                {(!selectedCategory.subcategories || selectedCategory.subcategories.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhuma subcategoria encontrada
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Selecione uma categoria para ver as subcategorias
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Edite as informações da categoria'
                : 'Crie uma nova categoria para os classificados'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Nome</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Imóveis, Veículos, Empregos..."
              />
            </div>
            <div>
              <Label htmlFor="category-icon">Ícone (Emoji)</Label>
              <Input
                id="category-icon"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="Ex: 🏠, 🚗, 💼..."
              />
            </div>
            <div>
              <Label htmlFor="category-description">Descrição</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional da categoria..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="category-active"
                checked={categoryForm.isActive}
                onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="category-active">Categoria ativa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCategorySubmit} disabled={!categoryForm.name.trim()}>
              {editingCategory ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
            </DialogTitle>
            <DialogDescription>
              {editingSubcategory
                ? 'Edite as informações da subcategoria'
                : `Crie uma nova subcategoria para ${selectedCategory?.name}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subcategory-name">Nome</Label>
              <Input
                id="subcategory-name"
                value={subcategoryForm.name}
                onChange={(e) => setSubcategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Casas - Venda, Apartamentos - Aluguel..."
              />
            </div>
            <div>
              <Label htmlFor="subcategory-description">Descrição</Label>
              <Textarea
                id="subcategory-description"
                value={subcategoryForm.description}
                onChange={(e) => setSubcategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional da subcategoria..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="subcategory-active"
                checked={subcategoryForm.isActive}
                onCheckedChange={(checked) => setSubcategoryForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="subcategory-active">Subcategoria ativa</Label>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Campos Personalizados</Label>
                <Button variant="outline" size="sm" onClick={addCustomField}>
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Campo
                </Button>
              </div>
              {subcategoryForm.customFields?.map((field, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Campo {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomField(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Nome do campo"
                      value={field.name}
                      onChange={(e) => updateCustomField(index, { name: e.target.value })}
                    />
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={field.type}
                      onChange={(e) => updateCustomField(index, { type: e.target.value as any })}
                    >
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="date">Data</option>
                      <option value="select">Seleção</option>
                      <option value="boolean">Sim/Não</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) => updateCustomField(index, { required: checked })}
                    />
                    <Label className="text-sm">Campo obrigatório</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubcategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubcategorySubmit} disabled={!subcategoryForm.name.trim()}>
              {editingSubcategory ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deletar {itemToDelete?.type === 'category' ? 'Categoria' : 'Subcategoria'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar "{itemToDelete?.name}"?
              {itemToDelete?.type === 'category' && (
                <span className="block text-red-600 mt-2">
                  Atenção: Deletar uma categoria também removerá todas as suas subcategorias e classificados associados.
                </span>
              )}
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}