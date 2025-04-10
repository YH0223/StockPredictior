'use client'

import { useEffect, useState } from 'react'
import supabase from '../lib/supabase'
import { useRouter } from 'next/navigation'

const Home = () => {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login') // 로그인 안 되어 있으면 로그인 페이지로 리디렉션
      } else {
        setUser(session.user) // session.user에서 user를 설정

        // 세션 만료 시간을 현재 시간 + 1시간 (3600000ms)
        const expirationTime = new Date().getTime() + 60 * 60 * 1000 // 1시간 후
        localStorage.setItem('sessionExpirationTime', expirationTime.toString())
      }
    }

    fetchSession()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()  // Supabase에서 로그아웃
    localStorage.removeItem('sessionExpirationTime') // 만료된 세션 제거
    router.push('/login')  // 로그아웃 후 로그인 페이지로 리디렉션
  }

  return (
    <div>
      <h1>메인 화면</h1>
      {user && (
        <div>
          <p>환영합니다, {user.email}님!</p>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      )}
    </div>
  )
}

export default Home
