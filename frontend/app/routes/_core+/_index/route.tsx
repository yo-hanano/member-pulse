import { Button, Card } from "@heroui/react";

export default function Home() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          HeroUI ベースのメイン画面を運用しています。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="secondary">
          <Card.Header className="text-sm font-medium">Customers</Card.Header>
          <Card.Content className="pt-0 text-3xl font-semibold">1,284</Card.Content>
        </Card>
        <Card variant="secondary">
          <Card.Header className="text-sm font-medium">Products</Card.Header>
          <Card.Content className="pt-0 text-3xl font-semibold">243</Card.Content>
        </Card>
        <Card variant="secondary">
          <Card.Header className="text-sm font-medium">Employees</Card.Header>
          <Card.Content className="pt-0 text-3xl font-semibold">42</Card.Content>
        </Card>
      </div>

      <Card variant="default">
        <Card.Content className="flex flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Migration Checkpoint</p>
            <p className="text-muted-foreground text-sm">
              ダッシュボード骨格と認証ガードの移植が完了しています。
            </p>
          </div>
          <Button variant="primary">Click Me</Button>
        </Card.Content>
      </Card>
    </section>
  );
}
