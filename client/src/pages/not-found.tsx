import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col gap-6 items-center justify-center min-h-[calc(100vh-4rem)] px-6">
        <div className="text-center space-y-4">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground text-lg max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link href="/">
          <Button size="lg" data-testid="button-go-home">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
