'use client';

import { Users, Building2, Briefcase, CheckSquare, Calendar, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string;
  industry?: string;
  value?: number;
  stage?: string;
  priority?: string;
  completed?: boolean;
  dueDate?: string;
  expectedCloseDate?: string;
  createdAt: string;
}

interface SearchResponse {
  contacts: { total: number; results: SearchResult[] };
  companies: { total: number; results: SearchResult[] };
  deals: { total: number; results: SearchResult[] };
  tasks: { total: number; results: SearchResult[] };
}

interface SearchResultsDropdownProps {
  results: SearchResponse;
  selectedIndex: number;
  onResultClick: (result: SearchResult) => void;
}

export function SearchResultsDropdown({ results, selectedIndex, onResultClick }: SearchResultsDropdownProps) {
  // Flatten all results for keyboard navigation
  const allResults = [
    ...results.contacts.results.map((r) => ({ ...r, type: 'contact' as const })),
    ...results.companies.results.map((r) => ({ ...r, type: 'company' as const })),
    ...results.deals.results.map((r) => ({ ...r, type: 'deal' as const })),
    ...results.tasks.results.map((r) => ({ ...r, type: 'task' as const })),
  ];

  const getResultIndex = (type: string, indexInType: number) => {
    let offset = 0;
    if (type === 'company') offset = results.contacts.results.length;
    else if (type === 'deal') offset = results.contacts.results.length + results.companies.results.length;
    else if (type === 'task') offset = results.contacts.results.length + results.companies.results.length + results.deals.results.length;
    return offset + indexInType;
  };

  const isSelected = (type: string, indexInType: number) => {
    return getResultIndex(type, indexInType) === selectedIndex;
  };

  return (
    <div className="p-2">
      {/* Contacts Section */}
      {results.contacts.results.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Users className="h-4 w-4" />
            Contacts ({results.contacts.total})
          </div>
          <div className="space-y-1">
            {results.contacts.results.map((contact, index) => (
              <button
                key={contact.id}
                onClick={() => onResultClick(contact)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  isSelected('contact', index)
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-medium text-primary">
                    {contact.firstName?.[0]}{contact.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {contact.firstName} {contact.lastName}
                    </span>
                    <Badge
                      variant={contact.status === 'customer' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {contact.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {contact.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Companies Section */}
      {results.companies.results.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Building2 className="h-4 w-4" />
            Companies ({results.companies.total})
          </div>
          <div className="space-y-1">
            {results.companies.results.map((company, index) => (
              <button
                key={company.id}
                onClick={() => onResultClick(company)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  isSelected('company', index)
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{company.name}</div>
                  {company.industry && (
                    <div className="text-sm text-muted-foreground truncate">
                      {company.industry}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Deals Section */}
      {results.deals.results.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Briefcase className="h-4 w-4" />
            Deals ({results.deals.total})
          </div>
          <div className="space-y-1">
            {results.deals.results.map((deal, index) => (
              <button
                key={deal.id}
                onClick={() => onResultClick(deal)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  isSelected('deal', index)
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{deal.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {deal.stage}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {deal.value?.toLocaleString()}
                    </span>
                    {deal.expectedCloseDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(deal.expectedCloseDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Section */}
      {results.tasks.results.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <CheckSquare className="h-4 w-4" />
            Tasks ({results.tasks.total})
          </div>
          <div className="space-y-1">
            {results.tasks.results.map((task, index) => (
              <button
                key={task.id}
                onClick={() => onResultClick(task)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  isSelected('task', index)
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CheckSquare className={`h-5 w-5 text-primary ${task.completed ? 'line-through' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </span>
                    <Badge
                      variant={
                        task.priority === 'high'
                          ? 'destructive'
                          : task.priority === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
