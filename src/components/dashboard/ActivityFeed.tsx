import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Building2, 
  Users, 
  DollarSign,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'task' | 'financial' | 'business_plan' | 'investor' | 'team';
  title: string;
  description: string;
  company_name?: string;
  created_at: string;
  status?: string;
  priority?: string;
  actionUrl?: string;
}

export const ActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentActivity();
    }
  }, [user]);

  const fetchRecentActivity = async () => {
    try {
      // Get user's companies first
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user?.id);

      const companyIds = companies?.map(c => c.id) || [];
      const companyMap = companies?.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {}) || {};

      // Fetch recent activities from different tables
      const [tasksRes, financialRes, businessPlansRes, investorRes, teamRes] = await Promise.all([
        // Recent tasks
        supabase
          .from('tasks')
          .select('id, title, status, priority, company_id, created_at')
          .in('company_id', companyIds)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Recent financial data
        supabase
          .from('financial_data')
          .select('id, period_type, revenue, company_id, created_at')
          .in('company_id', companyIds)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Recent business plans
        supabase
          .from('business_plans')
          .select('id, title, status, company_id, created_at')
          .in('company_id', companyIds)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Recent investor matches
        supabase
          .from('investor_matches')
          .select('id, status, company_id, created_at')
          .in('company_id', companyIds)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Recent team additions
        supabase
          .from('team_members')
          .select('id, name, role, company_id, created_at')
          .in('company_id', companyIds)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      // Process and combine activities
      const allActivities: ActivityItem[] = [];

      // Process tasks
      tasksRes.data?.forEach(task => {
        allActivities.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.title,
          description: `Task ${task.status}`,
          company_name: companyMap[task.company_id],
          created_at: task.created_at,
          status: task.status,
          priority: task.priority,
          actionUrl: '/tasks'
        });
      });

      // Process financial data
      financialRes.data?.forEach(fd => {
        allActivities.push({
          id: `financial-${fd.id}`,
          type: 'financial',
          title: `Financial data added`,
          description: `${fd.period_type} revenue: $${(fd.revenue || 0).toLocaleString()}`,
          company_name: companyMap[fd.company_id],
          created_at: fd.created_at,
          actionUrl: '/financial'
        });
      });

      // Process business plans
      businessPlansRes.data?.forEach(bp => {
        allActivities.push({
          id: `business-plan-${bp.id}`,
          type: 'business_plan',
          title: bp.title,
          description: `Business plan ${bp.status}`,
          company_name: companyMap[bp.company_id],
          created_at: bp.created_at,
          status: bp.status,
          actionUrl: '/business-plan'
        });
      });

      // Process investor matches
      investorRes.data?.forEach(inv => {
        allActivities.push({
          id: `investor-${inv.id}`,
          type: 'investor',
          title: `New investor match`,
          description: `Match status: ${inv.status}`,
          company_name: companyMap[inv.company_id],
          created_at: inv.created_at,
          status: inv.status,
          actionUrl: '/investors'
        });
      });

      // Process team members
      teamRes.data?.forEach(tm => {
        allActivities.push({
          id: `team-${tm.id}`,
          type: 'team',
          title: `${tm.name} joined`,
          description: `New ${tm.role}`,
          company_name: companyMap[tm.company_id],
          created_at: tm.created_at,
          actionUrl: '/team'
        });
      });

      // Sort by date and take most recent
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return CheckCircle;
      case 'financial':
        return DollarSign;
      case 'business_plan':
        return Building2;
      case 'investor':
        return TrendingUp;
      case 'team':
        return Users;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500';
      case 'todo':
        return 'bg-gray-500/10 text-gray-500';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'published':
        return 'bg-green-500/10 text-green-500';
      case 'potential':
        return 'bg-blue-500/10 text-blue-500';
      case 'contacted':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft bg-card-gradient border-0">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft bg-card-gradient border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        {activity.company_name && (
                          <Badge variant="outline" className="text-xs">
                            {activity.company_name}
                          </Badge>
                        )}
                        {activity.status && (
                          <Badge variant="secondary" className={`text-xs ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                      {activity.actionUrl && (
                        <Link to={activity.actionUrl}>
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};