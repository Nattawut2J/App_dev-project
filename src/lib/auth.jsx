import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  userRole: 'user',
  signOut: async () => {},
})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('user')
  const [roleLoading, setRoleLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setUserRole('user')
      return
    }
    setRoleLoading(true)
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setUserRole(data?.role || 'user')
        setRoleLoading(false)
      })
  }, [user])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = useMemo(
    () => ({
      user,
      session,
      loading: loading || roleLoading,
      userRole,
      signOut,
    }),
    [user, session, loading, roleLoading, userRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
