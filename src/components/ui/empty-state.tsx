import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) => {
  return (
    <Card className="shadow-soft border text-center overflow-hidden">
      <div className="bg-primary/5 p-12">
        <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
          <Icon className="h-16 w-16 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          {description}
        </p>
        {children && <div className="mb-6">{children}</div>}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {action && (
            <Button
              onClick={action.onClick}
              size="lg"
              className="bg-primary-gradient hover:opacity-90 shadow-elegant"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              size="lg"
              variant="outline"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
