import Image from 'next/image';
import { PlanForm } from './plan-form';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-card p-8 my-10 rounded-lg shadow-md border border-border">
        <header className="flex flex-col sm:flex-row justify-center items-center mb-8 pb-4 border-b">
          <Image
            src="https://www.dropbox.com/scl/fi/fnot6lk4eky6a51iygybg/.png?rlkey=la54x8gme7xmk8zwo4vvfqrjw&raw=1"
            alt="شعار اتحاد طلاب تحيا مصر - اللجنة المركزية"
            width={100}
            height={100}
            className="object-contain w-24 h-24 sm:w-36 sm:h-36"
            data-ai-hint="logo organization"
          />
          <div className="text-center mx-4">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">اتحاد طلاب تحيا مصر</h1>
            <h2 className="text-lg sm:text-xl text-muted-foreground">اللجنة المركزية للتنظيم</h2>
          </div>
        </header>

        <PlanForm />
      </div>
    </main>
  );
}
