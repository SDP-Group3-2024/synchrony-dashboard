import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-10 text-center">Synchrony Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/scroll-analytics" className="block">
          <Card className="h-full transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Scroll Analytics</CardTitle>
              <CardDescription>Analyze user scrolling behavior and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <p>View detailed metrics on how users interact with content through scrolling patterns.</p>
            </CardContent>
            <CardFooter className="text-sm text-blue-500">
              View Scroll Analytics →
            </CardFooter>
          </Card>
        </Link>
        
        <Link href="/dashboard" className="block">
          <Card className="h-full transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Sankey Diagram</CardTitle>
              <CardDescription>Visualize user journey flows</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Explore user navigation paths through the application with interactive Sankey diagrams.</p>
            </CardContent>
            <CardFooter className="text-sm text-blue-500">
              View Sankey Diagram →
            </CardFooter>
          </Card>
        </Link>
      </div>
    </div>
  );
}
