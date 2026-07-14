import * as React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items, className, ...props }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1.5 text-sm text-gray-400', className)}
      {...props}
    >
      <div className="flex items-center text-gray-500 hover:text-white transition-colors">
        <Home className="h-3.5 w-3.5" />
      </div>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-3.5 w-3.5 text-gray-600 flex-shrink-0" />
          {item.href && !item.active ? (
            <a href={item.href} className="hover:text-white transition-colors font-medium">
              {item.label}
            </a>
          ) : (
            <span
              className={cn(
                'font-medium truncate',
                item.active ? 'text-primary text-glow font-semibold' : '',
              )}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
