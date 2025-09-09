import { CalendarCheck2 } from 'lucide-react';
import { PlanForm } from './plan-form';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-block p-4 bg-primary rounded-full mb-4 shadow-lg">
            <CalendarCheck2 className="text-primary-foreground h-12 w-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
            Planify Egypt
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            مرحباً بك في أداة تخطيط الفعاليات والأنشطة الطلابية. قم بتعبئة النموذج
            لتقديم خطتك الشهرية.
          </p>
        </header>
        <PlanForm />
      </div>
    </main>
  );
}
