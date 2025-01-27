import { GradientGraph } from "@/components/charts/gradient-graph";
import { LineGraph } from "@/components/charts/line-graph";
import { PieGraph } from "@/components/charts/pie-graph";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    // <div className="flex min-h-screen flex-col place-items-baseline justify-center">
    <div>
      <div className="grid grid-cols-3 gap-4 p-4">
        <GradientGraph />
        <LineGraph />
        <PieGraph />
      </div>
      <div>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
      </div>
    </div>
  );
}
