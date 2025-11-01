import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Clock, MoreHorizontal, User, CheckCircle2, Circle, AlertCircle, Pause } from 'lucide-react';
import { format } from 'date-fns';

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
}

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: string) => void;
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  todo: { label: 'To Do', icon: Circle, color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'bg-blue-500/10 text-blue-500' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'bg-green-500/10 text-green-500' },
  blocked: { label: 'Blocked', icon: AlertCircle, color: 'bg-red-500/10 text-red-500' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-500/10 text-gray-500' },
  medium: { label: 'Medium', color: 'bg-blue-500/10 text-blue-500' },
  high: { label: 'High', color: 'bg-orange-500/10 text-orange-500' },
  urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-500' },
};

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  const statusInfo = statusConfig[task.status] || statusConfig.todo;
  const priorityInfo = priorityConfig[task.priority] || priorityConfig.medium;
  const StatusIcon = statusInfo.icon;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <Card className="shadow-card border hover:shadow-feature transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded ${statusInfo.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
              </div>
              <CardTitle className="text-base font-semibold leading-tight">{task.title}</CardTitle>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange?.(task.id, 'completed')}>
                Mark Complete
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(task.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={`${priorityInfo.color} text-xs`}>
            {priorityInfo.label}
          </Badge>
          {task.category && (
            <Badge variant="outline" className="text-xs">{task.category}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="space-y-2">
          {task.due_date && (
            <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
              <Calendar className="h-3.5 w-3.5" />
              <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs py-0 px-1.5">Overdue</Badge>
              )}
            </div>
          )}
          
          {task.estimated_hours && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Est: {task.estimated_hours}h
                {task.actual_hours && ` • Act: ${task.actual_hours}h`}
              </span>
            </div>
          )}

          {task.assigned_to && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{task.assigned_to}</span>
            </div>
          )}
        </div>
        
        {task.status !== 'completed' && (
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => onStatusChange?.(task.id, 'completed')}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Mark Complete
          </Button>
        )}
      </CardContent>
    </Card>
  );
};