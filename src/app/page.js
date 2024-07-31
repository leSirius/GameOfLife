
import {Providers} from "@/app/providers";
import GameOfLife from "@/components/game-of-life";

/*
import dynamic from 'next/dynamic'
const GameOfLifeNoSSR = dynamic(() => import('@/components/game-of-life')
, {
  ssr:false,
});
 */

export default function Home() {
  return (
    <main>
      <Providers>
        <div className='dark h-screen w-full bg-sky-700 flex'>
          <GameOfLife></GameOfLife>
        </div>

      </Providers>
    </main>
  );
}
