import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, CheckCircle2, Clock, AlertTriangle, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { TaskDashboardSkeleton } from '@/components/skeletons';
import { TaskForm } from './TaskForm';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  business_plan_id?: string;
  completed_at?: string;
  dependencies?: string[];
}

interface TaskSuggestion {
  title: string;
  description: string;
  priority: string;
  category: string;
}

interface Company {
  id: string;
  name: string;
}

export const TaskDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSuggestingTasks, setIsSuggestingTasks] = useState(false);
  const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCompany) {
      fetchTasks();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user?.id);

      if (error) throw error;

      setCompanies(data || []);
      if (data && data.length > 0) {
        setSelectedCompany(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!selectedCompany) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('company_id', selectedCompany)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    }
  };

  const handleTaskCreated = () => {
    fetchTasks();
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;
      
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      toast.success('Task deleted');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleGetAISuggestions = async () => {
    setIsSuggestingTasks(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-tasks', {
        body: {
          companyId: selectedCompany,
          context: `Current task count: ${tasks.length}. Please suggest tasks to help grow and manage the business.`
        }
      });

      if (error) throw error;

      setTaskSuggestions(data.suggestions || []);
      setShowSuggestions(true);
      toast.success('AI task suggestions generated!');
    } catch (error: any) {
      console.error('Error getting task suggestions:', error);
      toast.error(error.message || 'Failed to get task suggestions');
    } finally {
      setIsSuggestingTasks(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: TaskSuggestion) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: suggestion.title,
          description: suggestion.description,
          priority: suggestion.priority,
          category: suggestion.category,
          status: 'todo',
          company_id: selectedCompany
        });

      if (error) throw error;
      
      toast.success('Task created from suggestion');
      fetchTasks();
      
      // Remove accepted suggestion
      setTaskSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
      if (taskSuggestions.length <= 1) {
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error creating task from suggestion:', error);
      toast.error('Failed to create task');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(tasks.map(task => task.category).filter(Boolean))] as string[];

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  ).length;

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || searchTerm !== '';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  };

  if (isLoading) {
    return <TaskDashboardSkeleton />;
  }

  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Company Found</h2>
          <p className="text-muted-foreground">You need to create a company first to manage tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <div className="bg-executive-gradient text-primary-foreground border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Task Management
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                Organize and track your project tasks efficiently
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="ghost"
                onClick={handleGetAISuggestions}
                disabled={isSuggestingTasks}
                className="text-primary-foreground hover:bg-white/10"
              >
                {isSuggestingTasks ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI Suggestions
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingTask(null);
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-primary hover:bg-white/90">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                  </DialogHeader>
                  <TaskForm
                    companyId={selectedCompany}
                    task={editingTask}
                    onTaskCreated={handleTaskCreated}
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setEditingTask(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</p>
                <p className="text-2xl font-bold tracking-tight">{totalTasks}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-0">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                <p className="text-2xl font-bold tracking-tight text-green-600">{completedTasks}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">In Progress</p>
                <p className="text-2xl font-bold tracking-tight text-blue-600">{inProgressTasks}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                {overdueTasks > 0 && (
                  <Badge variant="secondary" className="bg-red-50 text-red-700 border-0">
                    Attention
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Overdue</p>
                <p className="text-2xl font-bold tracking-tight text-red-600">{overdueTasks}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card border mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Filter & Search</CardTitle>
            <CardDescription>Refine your task list with filters and search</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              categories={categories}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        {showSuggestions && taskSuggestions.length > 0 && (
          <Card className="shadow-card border border-primary/20 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">AI Task Suggestions</CardTitle>
                    <CardDescription>
                      AI-generated recommendations based on your company profile
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSuggestions(false)}
                >
                  Dismiss
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taskSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {suggestion.description}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="capitalize">
                            Priority: {suggestion.priority}
                          </Badge>
                          <Badge variant="secondary">
                            {suggestion.category}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleAcceptSuggestion(suggestion)}
                        className="bg-primary hover:bg-primary/90 shrink-0"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {hasActiveFilters ? `Filtered Tasks (${filteredTasks.length})` : `All Tasks (${totalTasks})`}
            </h2>
          </div>
          {filteredTasks.length === 0 ? (
            tasks.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Tasks Yet"
                description="Create your first task to get started with project management and track your progress."
                action={{
                  label: 'Create First Task',
                  onClick: () => setIsDialogOpen(true),
                }}
              />
            ) : (
              <Card className="shadow-card border">
                <CardContent className="text-center py-16">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No tasks match your filters</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters to see more tasks
                  </p>
                </CardContent>
              </Card>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};