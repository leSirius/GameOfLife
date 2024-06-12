// 'use client'
import {Providers} from "@/app/providers";
import Server from "@/components/server";

// import GameOfLifeNoSSR from "@/components/game-of-life";

import dynamic from 'next/dynamic'
const GameOfLifeNoSSR = dynamic(() => import('@/components/game-of-life')
, {
  ssr:true,
});

export default function Home() {
  return (
    <main>
      <Providers>
        <div className='dark h-screen w-full bg-sky-700 flex'>
          <GameOfLifeNoSSR></GameOfLifeNoSSR>
        </div>
        <Server></Server>
      </Providers>
    </main>
  );
}
