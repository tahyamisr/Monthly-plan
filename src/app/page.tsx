import Image from 'next/image';
import { PlanForm } from './plan-form';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-white p-8 my-10 rounded-lg shadow-md border border-gray-200">
        <header className="flex flex-col sm:flex-row justify-around items-center mb-8 pb-4 border-b">
          <Image
            src="https://www.dropbox.com/scl/fi/cdpfbk7nlzbn5mb13nmbt/.jpg?rlkey=5gaov2yymvxp4isbw9crxiuza&raw=1"
            alt="شعار اتحاد طلاب تحيا مصر - اللجنة المركزية"
            width={144}
            height={144}
            className="object-contain mb-4 sm:mb-0"
            data-ai-hint="logo organization"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">اتحاد طلاب تحيا مصر</h1>
            <h2 className="text-xl text-gray-600">اللجنة المركزية للتنظيم</h2>
          </div>
          <Image
            src="https://www.dropbox.com/scl/fi/fnot6lk4eky6a51iygybg/.png?rlkey=la54x8gme7xmk8zwo4vvfqrjw&raw=1"
            alt="شعار اتحاد طلاب تحيا مصر"
            width={144}
            height={144}
            className="object-contain mt-4 sm:mt-0"
            data-ai-hint="logo organization"
          />
        </header>

        <PlanForm />
      </div>
    </main>
  );
}
