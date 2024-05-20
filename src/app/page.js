import GameOfLife from "@/components/game-of-life";
export default function Home() {
  return (
    <main>
      <div className='h-screen w-full bg-sky-700'>
        <GameOfLife></GameOfLife>
      </div>
    </main>
  );
}
