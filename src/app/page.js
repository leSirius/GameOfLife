import GameOfLife from "@/components/game-of-life";
import {Providers} from "@/app/providers";
export default function Home() {
  return (
    <main>
      <Providers>
        <div className='dark h-screen w-full bg-sky-700'>
          <GameOfLife></GameOfLife>
        </div>
      </Providers>
    </main>
  );
}
