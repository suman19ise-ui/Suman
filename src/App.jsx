import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [surahs, setSurahs] = useState([])
  const [selectedSurah, setSelectedSurah] = useState(1)
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentReciter, setCurrentReciter] = useState('ar.alafasy')
  const audioRef = useRef(null)

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
        console.log('Fetching Surahs...')
        const response = await axios.get('https://api.alquran.cloud/v1/surah')
        console.log('Surahs loaded:', response.data.data.length)
        setSurahs(response.data.data)
        // Fetch first surah verses
        fetchVerses(1)
      } catch (error) {
        console.error('Error fetching Surahs:', error)
        alert('Failed to load Surahs. Check your internet connection.')
      }
    }
    fetchSurahs()
  }, [])

  // Fetch verses for selected surah
  const fetchVerses = async (surahNumber) => {
    setLoading(true)
    try {
      console.log('Fetching verses for Surah:', surahNumber)
      const response = await axios.get(
        `https://api.alquran.cloud/v1/surah/${surahNumber}`
      )
      console.log('Verses loaded:', response.data.data.ayahs.length)
      setVerses(response.data.data.ayahs)
    } catch (error) {
      console.error('Error fetching verses:', error)
      alert('Failed to load verses.')
    }
    setLoading(false)
  }

  const handleSurahChange = (e) => {
    const surahNum = parseInt(e.target.value)
    console.log('Surah changed to:', surahNum)
    setSelectedSurah(surahNum)
    stopAudio()
    fetchVerses(surahNum)
  }

  const playAudio = () => {
    if (playing) {
      console.log('Already playing')
      return
    }
    
    console.log('Play button clicked')
    console.log('Reciter:', currentReciter)
    console.log('Surah:', selectedSurah)
    
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${currentReciter}/${selectedSurah}.mp3`
    console.log('Audio URL:', audioUrl)
    
    // Stop previous audio if any
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    
    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.src = audioUrl
    
    audio.onloadstart = () => {
      console.log('Audio loading...')
    }
    
    audio.oncanplay = () => {
      console.log('Audio ready to play')
      audio.play().catch(err => {
        console.error('Play error:', err)
        setPlaying(false)
        alert('Could not play audio: ' + err.message)
      })
    }
    
    audio.onplay = () => {
      console.log('Audio playing!')
      setPlaying(true)
    }
    
    audio.onended = () => {
      console.log('Audio ended')
      setPlaying(false)
      audioRef.current = null
    }
    
    audio.onerror = (e) => {
      console.error('Audio error:', e, audio.error)
      setPlaying(false)
      audioRef.current = null
      alert('Audio not available for this reciter. Try another one.')
    }
    
    audio.onabort = () => {
      console.log('Audio aborted')
      setPlaying(false)
      audioRef.current = null
    }
    
    audioRef.current = audio
    audio.load()
  }

  const stopAudio = () => {
    console.log('Stop button clicked')
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setPlaying(false)
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
            onChange={(e) => {
              console.log('Reciter changed to:', e.target.value)
              setCurrentReciter(e.target.value)
              stopAudio()
            }}
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
            {playing ? '⏳ Playing...' : '▶️ Play Audio'}
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
          ) : verses.length === 0 ? (
            <p className="loading">No verses loaded yet</p>
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
