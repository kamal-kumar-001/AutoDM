'use client';

import * as React from 'react';
import { DashboardLayout } from '../components/dashboard/layout';
import {
  Button,
  Input,
  Label,
  Textarea,
  toast,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@autodm/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, MessageSquare, TrendingUp, Sparkles, MousePointerClick } from 'lucide-react';

// Zod Validation Schema
const schema = z.object({
  name: z.string().min(3, 'Name must contain at least 3 characters'),
  triggerKeyword: z.string().min(1, 'Keyword is required'),
  responseMessage: z.string().min(10, 'Response must contain at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export default function HomePage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      triggerKeyword: '',
      responseMessage: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Form Submitted:', data);
    toast.success('Automation trigger created successfully!', {
      description: `Keyword "${data.triggerKeyword}" will now prompt response.`,
    });
    reset();
  };

  return (
    <DashboardLayout>
      {/* Welcome Hero Area */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent">
          Creator Workspace
        </h1>
        <p className="text-gray-400 max-w-xl">
          Welcome to the foundation of your Instagram automation workspace. Explore the design
          systems, interactions, and shortcut configurations below.
        </p>
      </div>

      {/* Grid of Glass Cards (Quick Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card-interactive border-gradient p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 font-medium">DM Conversations</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">14,282</h3>
            <div className="flex items-center space-x-1 mt-1 text-xs text-primary font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>+18.4% this month</span>
            </div>
          </div>
        </div>

        <div className="glass-card-interactive border-gradient p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 font-medium">Active Keywords</span>
            <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">48</h3>
            <p className="text-xs text-gray-500 mt-1">Across 3 linked accounts</p>
          </div>
        </div>

        <div className="glass-card-interactive border-gradient p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 font-medium">Automation Rate</span>
            <div className="p-2 rounded-lg bg-accent-emerald/10 text-accent-emerald">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">98.2%</h3>
            <div className="flex items-center space-x-1 mt-1 text-xs text-accent-emerald font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>Optimal response speed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid for Demos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Library Demo */}
        <div className="glass-card p-6 rounded-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Create Mock Automation</h2>
            <p className="text-xs text-gray-400 mt-1">
              Demonstrates React Hook Form, Zod schema validation, and loading button transitions.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Trigger Name</Label>
              <Input
                id="name"
                placeholder="e.g. Ebook Campaign"
                {...register('name')}
                className={errors.name ? 'border-red-500/50 focus-visible:ring-red-500' : ''}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="triggerKeyword">Trigger Keyword</Label>
              <Input
                id="triggerKeyword"
                placeholder="e.g. INFO"
                {...register('triggerKeyword')}
                className={
                  errors.triggerKeyword ? 'border-red-500/50 focus-visible:ring-red-500' : ''
                }
              />
              {errors.triggerKeyword && (
                <p className="text-xs text-red-400">{errors.triggerKeyword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="responseMessage">Response Message</Label>
              <Textarea
                id="responseMessage"
                placeholder="Write the auto-reply message..."
                {...register('responseMessage')}
                className={
                  errors.responseMessage ? 'border-red-500/50 focus-visible:ring-red-500' : ''
                }
              />
              {errors.responseMessage && (
                <p className="text-xs text-red-400">{errors.responseMessage.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Generating...' : 'Save Campaign'}
            </Button>
          </form>
        </div>

        {/* UI Interactivity Demo */}
        <div className="glass-card p-6 rounded-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white">Design & Toast Library</h2>
              <p className="text-xs text-gray-400 mt-1">
                Trigger animated alerts and popups to inspect standard alert systems.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={() =>
                  toast.message('Info Update', {
                    description: 'You have 3 incoming message requests queued.',
                  })
                }
              >
                Trigger Info Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  toast.warning('System Warning', {
                    description: 'Prisma client database sync is in progress.',
                  })
                }
              >
                Trigger Warn Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  toast.error('Critical Error', {
                    description: 'Instagram integration token has expired.',
                  })
                }
              >
                Trigger Error Toast
              </Button>
              <Button variant="secondary" onClick={() => toast.success('Process Completed')}>
                Trigger Success
              </Button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Dialog Modal Primitive</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Radix UI Dialog wrapper styled with clean slide-in transitions.
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full space-x-2">
                  <MousePointerClick className="h-4 w-4 text-primary" />
                  <span>Launch Settings Modal</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Configure Webhook Endpoints</DialogTitle>
                  <DialogDescription>
                    Configure secondary webhooks to receive real-time updates when keywords trigger.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="webhook">Endpoint URL</Label>
                    <Input id="webhook" placeholder="https://api.yourdomain.com/webhook" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDialogOpen(false);
                      toast.success('Webhook saved successfully!');
                    }}
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
