import { PlayerProvider } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import PlayerBar from './components/PlayerBar';
import LyricsPanel from './components/LyricsPanel';
import './styles/global.css';

export default function App() {
  return (
    <PlayerProvider>
      <div className="app-shell">
        <Sidebar />
        <MainContent />
        <LyricsPanel />
        <PlayerBar />
      </div>
    </PlayerProvider>
  );
}
