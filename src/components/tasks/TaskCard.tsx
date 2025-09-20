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
    <Card className="shadow-soft bg-card-gradient border-0 hover:shadow-feature transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <CardTitle className="text-lg">{task.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
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
          <Badge className={statusInfo.color}>
            {statusInfo.label}
          </Badge>
          <Badge className={priorityInfo.color}>
            {priorityInfo.label}
          </Badge>
          {task.category && (
            <Badge variant="outline">{task.category}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {task.description && (
          <CardDescription className="mb-4">
            {task.description}
          </CardDescription>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          {task.due_date && (
            <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive' : ''}`}>
              <Calendar className="h-4 w-4" />
              <span>Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
              {isOverdue && <span className="text-xs">(Overdue)</span>}
            </div>
          )}
          
          {task.estimated_hours && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Estimated: {task.estimated_hours}h
                {task.actual_hours && ` / Actual: ${task.actual_hours}h`}
              </span>
            </div>
          )}

          {task.assigned_to && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Assigned to: {task.assigned_to}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};