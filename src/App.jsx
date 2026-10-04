import { useState, useEffect } from 'react'
import './index.css'

// Helper to format dates
const formatDate = (dateString) => {
  const options = { weekday: 'short', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

const getStartOfWeek = (dateString) => {
  const d = new Date(dateString)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff)).toISOString().split('T')[0]
}

const generatePlan = () => {
  const plan = []
  const start = new Date('2026-10-05')
  const end = new Date('2026-12-05')
  let id = 1

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    let type = 'Rest'
    let title = 'Rest & Recover'
    let details = []
    let diet = ['Sattu Sharbat', '1 scoop Whey Protein']
    let exercise = []
    let isCheckIn = false

    const dayOfWeek = d.getDay()

    // Base weekly schedule
    if (dateStr >= '2026-10-05' && dateStr <= '2026-10-11') {
      if (dateStr === '2026-10-05') { type = 'Run'; title = '5K Easy'; details = ['HR < 150', '~45 mins']; diet.push('Pre-run: Banana'); }
      if (dateStr === '2026-10-06') { exercise = ['15-min Home Strength: Goblet Squats, RDLs, Plank']; }
      if (dateStr === '2026-10-08') { type = 'Run'; title = '4K Easy + Strides'; details = ['~35 mins']; diet.push('Pre-run: Toast with jam'); }
      if (dateStr === '2026-10-11') { type = 'Run'; title = '8K Easy Long'; details = ['~1h 10m', '4:1 Run/Walk']; diet.push('Gel @ 40m'); }
    }
    else if (dateStr >= '2026-10-14' && dateStr <= '2026-10-26') {
      type = 'Trek'
      title = 'Annapurna Trek'
      details = ['Walk and acclimatize']
      diet = ['Eat Dal Bhat', '1 Protein Bar on trail', '1 scoop Whey at night']
    }
    else if (dateStr === '2026-10-12') { type = 'Run'; title = '3K Shakeout'; details = ['~25 mins']; }
    else if (dateStr === '2026-10-13') { title = 'Travel/Prep'; diet = ['Hydrate well']; }
    else if (dateStr >= '2026-10-29' && dateStr <= '2026-11-15') {
      if (dayOfWeek === 4) {
        type = 'Run'
        if (dateStr === '2026-10-29') title = '5K Very Easy'
        else if (dateStr === '2026-11-05') title = '6K Tempo (4x2m @ 6:35)'
        else if (dateStr === '2026-11-12') title = '7K Easy'
        diet.push('Pre-run snack')
      }
      else if (dayOfWeek === 1) {
        type = 'Run'
        title = '5K Easy'
        diet.push('Pre-run snack')
      }
      else if (dayOfWeek === 0) {
        type = 'Run'
        if (dateStr === '2026-11-01') title = '8K Easy Long'
        else if (dateStr === '2026-11-08') {
          title = '11K LONG (CHECK-IN DAY)'
          isCheckIn = true
        }
        else if (dateStr === '2026-11-15') title = '14K Peak Long Run'
        diet.push('Pre-run snack', 'Gel every 40m')
      }
      else if (dayOfWeek === 2 || dayOfWeek === 5) {
        exercise = ['15-min Strength Routine (Squats, RDLs, Core)']
      }
    }
    else if (dateStr >= '2026-11-16' && dateStr <= '2026-12-05') {
      if (dateStr >= '2026-11-18' && dateStr <= '2026-11-27') {
        type = 'Rest'
        title = 'Wedding'
        details = ['Manage stress']
        if (dateStr === '2026-11-21' || dateStr === '2026-11-25') {
          type = 'Run'
          title = 'Optional 3K Easy'
        }
      } else {
        if (dayOfWeek === 1) { type = 'Run'; title = '4K Easy'; }
        if (dateStr === '2026-11-29') { type = 'Run'; title = '8K Easy Long'; diet.push('Gel @ 40m'); }
        if (dateStr === '2026-12-03') { type = 'Run'; title = '3K Shakeout'; }
      }
    }

    if (dateStr === '2026-12-05') {
      type = 'Run'
      title = 'RACE DAY: HALF MARATHON'
      details = ['Goal: 2:30:00', '4:1 Run/Walk strategy']
      diet = ['Pre-race breakfast 2hrs before', 'Electrolytes every 20m', 'Gel @ 40, 80, 120m']
      exercise = []
    }

    plan.push({
      id: id++,
      date: dateStr,
      type,
      title,
      details,
      diet,
      exercise,
      status: 'pending', // 'pending', 'done', 'missed'
      isCheckIn
    })
  }
  return plan
}

const initialPlan = generatePlan()

function App() {
  const [view, setView] = useState('calendar')
  const [plan, setPlan] = useState(() => {
    const saved = localStorage.getItem('marathonPlan')
    return saved ? JSON.parse(saved) : initialPlan
  })
  const [selectedDate, setSelectedDate] = useState('2026-10-05')
  const [swapTarget, setSwapTarget] = useState('')
  const [syncStatus, setSyncStatus] = useState('Connect Garmin')

  // Save to local storage whenever plan changes
  useEffect(() => {
    localStorage.setItem('marathonPlan', JSON.stringify(plan))
  }, [plan])
  
  const todayPlan = plan.find(p => p.date === selectedDate)

  // Get other dates in the same week for the swap dropdown
  const weekDates = []
  if (todayPlan) {
    const startOfWeek = getStartOfWeek(selectedDate)
    for (let i=0; i<7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(d.getDate() + i)
      const ds = d.toISOString().split('T')[0]
      if (ds !== selectedDate && ds >= '2026-10-05' && ds <= '2026-12-05') {
        weekDates.push({ date: ds, label: formatDate(ds) })
      }
    }
  }

  const setStatus = (id, newStatus) => {
    setPlan(plan.map(p => p.id === id ? { ...p, status: newStatus } : p))
  }

  const handleSync = () => {
    setSyncStatus('Syncing...')
    setTimeout(() => setSyncStatus('Synced via Agent!'), 1500)
  }

  const exportLogs = () => {
    const logs = plan.filter(p => p.status !== 'pending').map(p => ({
      date: p.date,
      type: p.type,
      title: p.title,
      status: p.status
    }))
    
    const jsonStr = JSON.stringify(logs, null, 2)
    const blob = new Blob([jsonStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `training_logs_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const performSwap = () => {
    if (!swapTarget) return
    setPlan(prevPlan => {
      const newPlan = [...prevPlan]
      const idx1 = newPlan.findIndex(p => p.date === selectedDate)
      const idx2 = newPlan.findIndex(p => p.date === swapTarget)
      
      if (idx1 !== -1 && idx2 !== -1) {
        const tempType = newPlan[idx1].type
        const tempTitle = newPlan[idx1].title
        const tempDetails = newPlan[idx1].details
        const tempDiet = newPlan[idx1].diet
        const tempExercise = newPlan[idx1].exercise
        const tempCheckIn = newPlan[idx1].isCheckIn

        newPlan[idx1].type = newPlan[idx2].type
        newPlan[idx1].title = newPlan[idx2].title
        newPlan[idx1].details = newPlan[idx2].details
        newPlan[idx1].diet = newPlan[idx2].diet
        newPlan[idx1].exercise = newPlan[idx2].exercise
        newPlan[idx1].isCheckIn = newPlan[idx2].isCheckIn

        newPlan[idx2].type = tempType
        newPlan[idx2].title = tempTitle
        newPlan[idx2].details = tempDetails
        newPlan[idx2].diet = tempDiet
        newPlan[idx2].exercise = tempExercise
        newPlan[idx2].isCheckIn = tempCheckIn
      }
      return newPlan
    })
    setSelectedDate(swapTarget)
    setSwapTarget('')
  }

  const runDays = plan.filter(p => p.type === 'Run')
  const completedCount = runDays.filter(p => p.status === 'done').length
  const progressPercent = Math.round((completedCount / runDays.length) * 100)

  const renderCalendarMonth = (year, month, monthName) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    
    const blanks = Array.from({ length: firstDay }, (_, i) => <div key={`blank-${i}`} className="calendar-day-cell empty"></div>)
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      const dayData = plan.find(p => p.date === dateStr)
      
      const isSelected = selectedDate === dateStr
      let classes = "calendar-day-cell"
      if (dayData && dayData.type !== 'Rest') classes += " has-event"
      if (dayData && dayData.status === 'done') classes += " completed"
      if (dayData && dayData.status === 'missed') classes += " missed"
      if (dayData && dayData.isCheckIn) classes += " checkin-day"
      if (isSelected) classes += " selected"

      return (
        <div 
          key={dayNum} 
          className={classes}
          onClick={() => { setSelectedDate(dateStr); setView('today'); }}
        >
          <span className="cal-day-num">{dayNum}</span>
          {dayData && dayData.type !== 'Rest' && (
            <div className={`cal-indicator ${dayData.type.toLowerCase()}`}></div>
          )}
          {dayData && dayData.isCheckIn && (
            <div className="cal-checkin-badge">⭐ Check-in</div>
          )}
        </div>
      )
    })

    return (
      <div className="calendar-month" key={month}>
        <h3>{monthName} {year}</h3>
        <div className="calendar-days-header">
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        <div className="calendar-grid-month">
          {blanks}
          {days}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>My 2:30 HM Journey</h1>
        <div>
           <button onClick={handleSync} className="sketchy-btn sync-btn" style={{ fontSize: '0.9rem', marginRight: '10px' }}>
             {syncStatus}
           </button>
           <button onClick={exportLogs} className="sketchy-btn" style={{ fontSize: '0.9rem', background: 'var(--highlight)' }}>
             Download Logs
           </button>
        </div>
      </div>
      
      <div className="nav-tabs">
        <button className={`sketchy-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
          View Calendar
        </button>
        <button className={`sketchy-btn ${view === 'today' ? 'active' : ''}`} onClick={() => setView('today')}>
          Day Details
        </button>
      </div>

      {view === 'today' && todayPlan && (
        <div className="today-view">
          <div className="today-date">{formatDate(todayPlan.date)} {todayPlan.isCheckIn && '⭐ (CHECK-IN DAY)'}</div>
          
          <div className="shift-controls sketchy-box" style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px', padding: '10px' }}>
             <span style={{fontWeight: 'bold'}}>Shift Schedule:</span>
             <select 
               className="sketchy-btn" 
               style={{background: 'white'}}
               value={swapTarget} 
               onChange={(e) => setSwapTarget(e.target.value)}
             >
               <option value="">Select a day this week...</option>
               {weekDates.map(w => (
                 <option key={w.date} value={w.date}>{w.label}</option>
               ))}
             </select>
             <button className="sketchy-btn" onClick={performSwap} disabled={!swapTarget} style={{ fontSize: '0.9rem', padding: '4px 10px' }}>
               Swap!
             </button>
          </div>

          <div className="sketchy-box today-card">
            <h2>{todayPlan.title}</h2>
            <div className={`status-badge ${todayPlan.type.toLowerCase()}`}>
              {todayPlan.type}
            </div>
            
            {todayPlan.details.length > 0 && (
              <>
                <h3 className="section-title">Focus</h3>
                <ul className="details-list">
                  {todayPlan.details.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </>
            )}

            {todayPlan.exercise.length > 0 && (
              <>
                <h3 className="section-title">Strength</h3>
                <ul className="details-list">
                  {todayPlan.exercise.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </>
            )}

            {todayPlan.diet.length > 0 && (
              <>
                <h3 className="section-title">Diet & Fueling</h3>
                <ul className="details-list">
                  {todayPlan.diet.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </>
            )}

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
              <button 
                className={`sketchy-btn ${todayPlan.status === 'done' ? 'success' : ''}`}
                onClick={() => setStatus(todayPlan.id, todayPlan.status === 'done' ? 'pending' : 'done')}
              >
                {todayPlan.status === 'done' ? '✓ Completed' : 'Mark as Done'}
              </button>
              
              <button 
                className={`sketchy-btn`}
                style={{ background: todayPlan.status === 'missed' ? 'var(--accent)' : 'white', color: todayPlan.status === 'missed' ? 'white' : 'var(--ink)' }}
                onClick={() => setStatus(todayPlan.id, todayPlan.status === 'missed' ? 'pending' : 'missed')}
              >
                {todayPlan.status === 'missed' ? '✕ Missed' : 'Mark as Missed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'calendar' && (
        <div>
          <div className="progress-container sketchy-box">
            <h2>Running Progress: {progressPercent || 0}%</h2>
            <div className="progress-bar-outline">
              <div className="progress-bar-fill" style={{ width: `${progressPercent || 0}%` }}></div>
            </div>
            <p>{completedCount} of {runDays.length} run days completed.</p>
          </div>

          <div className="sketchy-box">
             {renderCalendarMonth(2026, 9, 'October')}
             {renderCalendarMonth(2026, 10, 'November')}
             {renderCalendarMonth(2026, 11, 'December')}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
