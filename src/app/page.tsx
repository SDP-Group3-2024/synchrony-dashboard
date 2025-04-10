import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">Synchrony Dashboard</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A comprehensive analytics platform for monitoring and visualizing user interactions across your web applications.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/page-analytics/%20root" className="block">
          <Card className="h-full transition-all hover:shadow-lg hover:border-blue-400">
            <CardHeader className="space-y-1">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <Image 
                  src="/window.svg" 
                  alt="Page icon" 
                  width={24} 
                  height={24}
                  className="opacity-70"
                />
              </div>
              <CardTitle>Page Analytics</CardTitle>
              <CardDescription>Detailed insights for individual pages</CardDescription>
            </CardHeader>
            <CardContent>
              <p>View comprehensive metrics about specific pages including scroll depth, click patterns, and performance metrics.</p>
            </CardContent>
            <CardFooter className="text-sm text-blue-500">
              View Page Analytics →
            </CardFooter>
          </Card>
        </Link>
        
        <Link href="/dashboard" className="block">
          <Card className="h-full transition-all hover:shadow-lg hover:border-blue-400">
            <CardHeader className="space-y-1">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <Image 
                  src="/globe.svg" 
                  alt="Flow icon" 
                  width={24} 
                  height={24}
                  className="opacity-70"
                />
              </div>
              <CardTitle>User Journey Flow</CardTitle>
              <CardDescription>Visualize user navigation paths</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Explore how users navigate through your application with interactive Sankey diagrams showing page-to-page transitions.</p>
            </CardContent>
            <CardFooter className="text-sm text-blue-500">
              View User Journey Flow →
            </CardFooter>
          </Card>
        </Link>
        
        <Link href="/about" className="block">
          <Card className="h-full transition-all hover:shadow-lg hover:border-blue-400">
            <CardHeader className="space-y-1">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-3">
                <Image 
                  src="/file.svg" 
                  alt="Documentation icon" 
                  width={24} 
                  height={24}
                  className="opacity-70"
                />
              </div>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>Learn how to use the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Get started with Synchrony Dashboard, understand the metrics, and learn how to interpret the visualizations.</p>
            </CardContent>
            <CardFooter className="text-sm text-blue-500">
              Read Documentation →
            </CardFooter>
          </Card>
        </Link>
      </div>
      
      <div className="mt-16 p-8 bg-slate-50 rounded-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Jump right in and explore your website analytics with these quick actions:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>View Root Page Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>See how users interact with your home page, including scroll depth, click patterns, and load times.</p>
            </CardContent>
            <CardFooter>
              <Link href="/page-analytics/%20root" className="text-blue-500 font-medium">
                Go to Root Page Analytics →
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>Analyze User Flows</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Understand how users navigate between pages with interactive Sankey diagrams showing transition patterns.</p>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="text-blue-500 font-medium">
                Go to User Flows →
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}