import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-primary opacity-25" />
        <div className="relative rounded-full h-12 w-12 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,187,136,0.3)] animate-pulse">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>
      <div className="text-sm font-medium text-gray-400 animate-pulse">Loading workspace...</div>
    </div>
  );
}
