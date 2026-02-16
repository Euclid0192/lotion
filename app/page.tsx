import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <h1 className="text-blue-500">Hello Lotion - my Notion clone</h1>
      <Button className="bg-emerald-500 text-white" variant="ghost">
        Test shadcn button
      </Button>
    </div>
  );
}
