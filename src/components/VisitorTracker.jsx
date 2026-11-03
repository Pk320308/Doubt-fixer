'use client'

import { useEffect } from 'react'

export default function VisitorTracker() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    // 1. Don't track in local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return
    }

    // 2. Prevent spam: Check if visit was already recorded in current browser session
    if (sessionStorage.getItem('df_visit_recorded')) {
      return
    }

    // 3. Prevent spam: If the user visited less than 45 minutes ago, skip notification
    const lastVisit = localStorage.getItem('df_last_visit_time')
    const now = Date.now()
    if (lastVisit && now - parseInt(lastVisit, 10) < 45 * 60 * 1000) {
      sessionStorage.setItem('df_visit_recorded', 'true')
      return
    }

    const trackVisit = async () => {
      try {
        // Detect Device & OS
        const ua = navigator.userAgent
        let device = 'Desktop'
        if (/android/i.test(ua)) device = 'Android Mobile'
        else if (/iphone/i.test(ua)) device = 'iPhone'
        else if (/ipad/i.test(ua)) device = 'iPad'
        else if (/mobile/i.test(ua)) device = 'Mobile Device'
        else if (/macintosh/i.test(ua)) device = 'Mac Desktop'
        else if (/windows/i.test(ua)) device = 'Windows PC'
        else if (/linux/i.test(ua)) device = 'Linux PC'

        // Detect Browser
        let browser = 'Browser'
        if (/edg/i.test(ua)) browser = 'Edge'
        else if (/chrome|crios/i.test(ua)) browser = 'Chrome'
        else if (/firefox|fxios/i.test(ua)) browser = 'Firefox'
        else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari'
        else if (/opera|opr/i.test(ua)) browser = 'Opera'

        // Detect Referrer
        const referrer = document.referrer ? new URL(document.referrer).hostname : 'Direct Visit / Bookmark'

        // Fetch Free Geolocation (ipwho.is or ipapi.co)
        let locationData = { city: 'Unknown City', region: 'India', country: '' }
        try {
          const res = await fetch('https://ipwho.is/', { cache: 'no-store' })
          const geo = await res.json()
          if (geo && geo.success !== false) {
            locationData = {
              city: geo.city || '',
              region: geo.region || '',
              country: geo.country || 'India'
            }
          }
        } catch {
          // Fallback to ipapi.co if ipwho fails
          try {
            const fallbackRes = await fetch('https://ipapi.co/json/')
            const fallbackGeo = await fallbackRes.json()
            if (fallbackGeo) {
              locationData = {
                city: fallbackGeo.city || '',
                region: fallbackGeo.region || '',
                country: fallbackGeo.country_name || 'India'
              }
            }
          } catch {
            // Silently use defaults if offline / ad-blocked
          }
        }

        // Send to Notification API
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'visit',
            data: {
              ...locationData,
              device,
              browser,
              referrer,
              page: window.location.pathname || '/'
            }
          })
        })

        // Mark as recorded
        sessionStorage.setItem('df_visit_recorded', 'true')
        localStorage.setItem('df_last_visit_time', now.toString())
      } catch (err) {
        console.warn('Visitor tracking error:', err)
      }
    }

    // Small delay (2 seconds) so page loads instantly before triggering background tracking
    const timer = setTimeout(trackVisit, 2000)
    return () => clearTimeout(timer)
  }, [])

  return null
}
