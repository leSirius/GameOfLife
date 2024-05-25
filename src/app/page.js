import GameOfLifeNoSSR from "@/components/game-of-life";
import {Providers} from "@/app/providers";
//import GameOfLife from "@/components/game-of-life";
/*
import dynamic from 'next/dynamic'
const DynamicHeader = dynamic(() => import('@/components/game-of-life')
, {
  ssr:true,
})
*/
export default function Home() {
  return (
    <main>
      <Providers>
        <div className='dark h-screen w-full bg-sky-700'>
          <GameOfLifeNoSSR></GameOfLifeNoSSR>

        </div>
      </Providers>
    </main>
  );
}
