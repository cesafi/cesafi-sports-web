'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { mangoGrotesque, roboto } from '@/lib/fonts';

interface ComingSoonProps {
  readonly title: string;
  readonly description: string;
  readonly features?: readonly string[];
  readonly estimatedLaunch?: string;
}

export default function ComingSoon({
  title,
  description,
  features = [],
  estimatedLaunch
}: ComingSoonProps) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-border shadow-lg">
          <CardHeader className="pb-6 text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Construction className="text-primary h-8 w-8" />
            </div>
            <CardTitle className={`${mangoGrotesque.className} text-foreground text-3xl font-bold`}>
              {title}
            </CardTitle>
            <p className={`${roboto.className} text-muted-foreground mt-2 text-lg`}>
              {description}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {features.length > 0 && (
              <div>
                <h3
                  className={`${mangoGrotesque.className} text-foreground mb-3 text-lg font-semibold`}
                >
                  What to Expect
                </h3>
                <div className="space-y-2">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <div className="bg-primary h-2 w-2 rounded-full" />
                      <span className={`${roboto.className} text-muted-foreground`}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {estimatedLaunch && (
              <div className="text-center">
                <Badge variant="outline" className="text-sm">
                  Estimated Launch: {estimatedLaunch}
                </Badge>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/schedule" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  View Schedule
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
