import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [surahs, setSurahs] = useState([])
  const [selectedSurah, setSelectedSurah] = useState(1)
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentReciter, setCurrentReciter] = useState('ar.alafasy')

  const reciters = [
    { id: 'ar.alafasy', name: '🎤 Mishari Alafasy' },
    { id: 'ar.abdulsamad', name: '🎤 Abdul Samad' },
    { id: 'ar.quraishi', name: '🎤 Al-Quraishi' },
    { id: 'ar.mojammady', name: '🎤 Mojammady' },
  ]

  // Fetch all Surahs on load
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await axios.get('https://api.alquran.cloud/v1/surah')
        setSurahs(response.data.data)
        // Fetch first surah verses
        fetchVerses(1)
      } catch (error) {
        console.error('Error fetching Surahs:', error)
      }
    }
    fetchSurahs()
  }, [])

  // Fetch verses for selected surah
  const fetchVerses = async (surahNumber) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `https://api.alquran.cloud/v1/surah/${surahNumber}`
      )
      setVerses(response.data.data.ayahs)
    } catch (error) {
      console.error('Error fetching verses:', error)
    }
    setLoading(false)
  }

  const handleSurahChange = (e) => {
    const surahNum = parseInt(e.target.value)
    setSelectedSurah(surahNum)
    fetchVerses(surahNum)
  }

  const playAudio = () => {
    if (playing) return
    
    setPlaying(true)
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${currentReciter}/${selectedSurah}.mp3`
    const audio = new Audio(audioUrl)
    
    audio.onended = () => setPlaying(false)
    audio.onerror = () => {
      console.error('Error playing audio')
      setPlaying(false)
      alert('Audio not available for this reciter')
    }
    
    audio.play()
  }

  const stopAudio = () => {
    setPlaying(false)
    // Note: To properly stop, we'd need to maintain audio ref
  }

  const currentSurah = surahs.find(s => s.number === selectedSurah)

  return (
    <div className="app">
      <header className="header">
        <h1>🕌 Suman</h1>
        <p>Quran Memorization App</p>
      </header>

      <main className="container">
        {/* Surah Selector */}
        <div className="surah-selector">
          <label htmlFor="surah-dropdown">Select Surah:</label>
          <select 
            id="surah-dropdown"
            value={selectedSurah} 
            onChange={handleSurahChange}
            className="dropdown"
          >
            {surahs.map(surah => (
              <option key={surah.number} value={surah.number}>
                {surah.number}. {surah.englishName} - {surah.name}
              </option>
            ))}
          </select>
        </div>

        {/* Current Surah Info */}
        {currentSurah && (
          <div className="surah-info">
            <h2>{currentSurah.englishName}</h2>
            <p className="surah-name">{currentSurah.name}</p>
            <p className="surah-meta">
              {currentSurah.revelationType === 'Meccan' ? '🕌 Meccan' : '🏙️ Medinan'} • 
              {currentSurah.numberOfAyahs} verses
            </p>
          </div>
        )}

        {/* Reciter Selection */}
        <div className="reciter-selector">
          <label htmlFor="reciter-dropdown">Choose Reciter:</label>
          <select 
            id="reciter-dropdown"
            value={currentReciter} 
            onChange={(e) => setCurrentReciter(e.target.value)}
            className="dropdown"
          >
            {reciters.map(reciter => (
              <option key={reciter.id} value={reciter.id}>
                {reciter.name}
              </option>
            ))}
          </select>
        </div>

        {/* Play Button */}
        <div className="audio-controls">
          <button 
            onClick={playAudio}
            disabled={playing}
            className="btn btn-primary"
          >
            {playing ? '▶️ Playing...' : '▶️ Play Audio'}
          </button>
          <button 
            onClick={stopAudio}
            disabled={!playing}
            className="btn btn-secondary"
          >
            ⏹️ Stop
          </button>
        </div>

        {/* Verses Display */}
        <div className="verses-container">
          {loading ? (
            <p className="loading">Loading verses...</p>
          ) : (
            verses.map((verse, index) => (
              <div key={index} className="verse-card">
                <div className="verse-number">Verse {verse.numberInSurah}</div>
                <div className="verse-arabic">{verse.text}</div>
                <div className="verse-english">
                  {/* English translation would go here */}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default App
