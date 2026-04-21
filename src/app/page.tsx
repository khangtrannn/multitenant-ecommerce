import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function Home() {
  return (
    <div className="p-4">
      <Button variant="elevated">Hello World</Button>
      <Input placeholder="Hello Input" />
    </div>
  )
}
