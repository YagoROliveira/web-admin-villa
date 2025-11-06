import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, CheckCircle, XCircle, Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ClassifiedStatus, ClassifiedStatusLabels, ClassifiedStatusColors } from '../types';
import { Classified } from '../types';
import { useClassifieds } from '../hooks/use-classifieds';

interface DeleteDialogState {
  open: boolean;
  classifiedId: number | null;
  classifiedTitle: string;
}

interface RejectDialogState {
  open: boolean;
  classifiedId: number | null;
  classifiedTitle: string;
  reason: string;
}

export function ClassifiedsList() {
  const {
    classifieds,
    categories,
    loading,
    error,
    filters,
    total,
    currentPage,
    totalPages,
    loadClassifieds,
    loadCategories,
    approveClassified,
    rejectClassified,
    deleteClassified,
    setFilters,
    refreshClassifieds
  } = useClassifieds();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    classifiedId: null,
    classifiedTitle: ''
  });
  const [rejectDialog, setRejectDialog] = useState<RejectDialogState>({
    open: false,
    classifiedId: null,
    classifiedTitle: '',
    reason: ''
  });

  useEffect(() => {
    loadCategories();
    loadClassifieds();
  }, [loadCategories, loadClassifieds]);

  const handleSearch = () => {
    setFilters({ search: searchTerm, page: 1 });
    loadClassifieds({ search: searchTerm, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    const statusFilter = status === 'all' ? undefined : status as ClassifiedStatus;
    setFilters({ status: statusFilter, page: 1 });
    loadClassifieds({ status: statusFilter, page: 1 });
  };

  const handleCategoryFilter = (categoryId: string) => {
    const categoryFilter = categoryId === 'all' ? undefined : parseInt(categoryId);
    setFilters({ categoryId: categoryFilter, page: 1 });
    loadClassifieds({ categoryId: categoryFilter, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
    loadClassifieds({ page });
  };

  const handleApprove = async (id: number) => {
    await approveClassified(id);
    refreshClassifieds();
  };

  const handleReject = async () => {
    if (rejectDialog.classifiedId && rejectDialog.reason.trim()) {
      await rejectClassified(rejectDialog.classifiedId, rejectDialog.reason);
      setRejectDialog({ open: false, classifiedId: null, classifiedTitle: '', reason: '' });
      refreshClassifieds();
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.classifiedId) {
      await deleteClassified(deleteDialog.classifiedId);
      setDeleteDialog({ open: false, classifiedId: null, classifiedTitle: '' });
      refreshClassifieds();
    }
  };

  const openRejectDialog = (classified: Classified) => {
    setRejectDialog({
      open: true,
      classifiedId: classified.id,
      classifiedTitle: classified.title,
      reason: ''
    });
  };

  const openDeleteDialog = (classified: Classified) => {
    setDeleteDialog({
      open: true,
      classifiedId: classified.id,
      classifiedTitle: classified.title
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Classificados</h1>
          <p className="text-muted-foreground">
            Gerencie todos os classificados do sistema
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Classificado
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {classifieds.filter(c => c.status === ClassifiedStatus.PENDING_APPROVAL).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {classifieds.filter(c => c.status === ClassifiedStatus.ACTIVE).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pausados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {classifieds.filter(c => c.status === ClassifiedStatus.PAUSED).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por título, descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Select value={filters.status || 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value={ClassifiedStatus.PENDING_APPROVAL}>Pendente</SelectItem>
                <SelectItem value={ClassifiedStatus.ACTIVE}>Ativo</SelectItem>
                <SelectItem value={ClassifiedStatus.REJECTED}>Rejeitado</SelectItem>
                <SelectItem value={ClassifiedStatus.PAUSED}>Pausado</SelectItem>
                <SelectItem value={ClassifiedStatus.EXPIRED}>Expirado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.categoryId?.toString() || 'all'}
              onValueChange={handleCategoryFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Visualizações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : classifieds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Nenhum classificado encontrado
                  </TableCell>
                </TableRow>
              ) : (
                classifieds.map((classified) => (
                  <TableRow key={classified.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{classified.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {classified.description?.substring(0, 60)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{classified.category?.icon}</span>
                        <div>
                          <div className="font-medium">{classified.category?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {classified.subcategory?.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(classified.price)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ backgroundColor: ClassifiedStatusColors[classified.status] }}>
                        {ClassifiedStatusLabels[classified.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {classified.user?.firstName} {classified.user?.lastName}
                    </TableCell>
                    <TableCell>{formatDate(classified.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {classified.viewCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Ações
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {classified.status === ClassifiedStatus.PENDING_APPROVAL && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(classified.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprovar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openRejectDialog(classified)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejeitar
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(classified)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-3">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialog.open} onOpenChange={(open) =>
        setRejectDialog(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Classificado</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a rejeitar o classificado "{rejectDialog.classifiedTitle}".
              Por favor, informe o motivo da rejeição:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da rejeição</Label>
            <Textarea
              id="reason"
              placeholder="Descreva o motivo da rejeição..."
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!rejectDialog.reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) =>
        setDeleteDialog(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Classificado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o classificado "{deleteDialog.classifiedTitle}"?
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