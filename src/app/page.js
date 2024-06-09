// import GameOfLifeNoSSR from "@/components/game-of-life";
import {Providers} from "@/app/providers";

import dynamic from 'next/dynamic'
const GameOfLifeNoSSR = dynamic(() => import('@/components/game-of-life')
, {
  ssr:false,
});

export default function Home() {

  return (
    <main>
      <Providers>
        <div className='dark h-screen w-full bg-sky-700 flex'>
          <GameOfLifeNoSSR></GameOfLifeNoSSR>
        </div>
      </Providers>
    </main>
  );
}
