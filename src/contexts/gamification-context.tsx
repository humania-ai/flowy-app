'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Goal {
  id: string
  title: string
  description?: string
  target: number
  current: number
  unit: string
  category: string
  deadline?: Date
  status: 'active' | 'completed' | 'paused'
  createdAt: Date
  updatedAt: Date
  milestones?: GoalMilestone[]
}

interface Habit {
  id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  targetCount: number
  currentStreak: number
  bestStreak: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  completions?: HabitCompletion[]
}

interface GoalMilestone {
  id: string
  title: string
  target: number
  completed: boolean
  createdAt: Date
}

interface HabitCompletion {
  id: string
  habitId: string
  date: Date
  completed: boolean
}

interface GamificationContextType {
  goals: Goal[]
  habits: Habit[]
  flwyBalance: number
  achievements: UserAchievement[]
  rewards: Reward[]
  loading: boolean
  refreshGoals: () => Promise<void>
  refreshHabits: () => Promise<void>
  refreshFlwyBalance: () => Promise<void>
  createGoal: (goal: Partial<Goal>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  createHabit: (habit: Partial<Habit>) => Promise<void>
  completeHabit: (id: string, date: string) => Promise<void>
  redeemReward: (rewardId: string) => Promise<void>
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [flwyBalance, setFlwyBalance] = useState(0)
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
  }

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits')
      if (response.ok) {
        const data = await response.json()
        setHabits(data)
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
    }
  }

  const fetchFlwyBalance = async () => {
    try {
      const response = await fetch('/api/flwy-tokens')
      if (response.ok) {
        const data = await response.json()
        setFlwyBalance(data.balance)
      }
    } catch (error) {
      console.error('Error fetching FLWY balance:', error)
    }
  }

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/rewards')
      if (response.ok) {
        const data = await response.json()
        setRewards(data.rewards)
      }
    } catch (error) {
      console.error('Error fetching rewards:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchGoals(),
        fetchHabits(),
        fetchFlwyBalance(),
        fetchRewards()
      ])
      setLoading(false)
    }

    loadData()
  }, [])

  const createGoal = async (goal: Partial<Goal>) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goal),
      })

      if (response.ok) {
        await fetchGoals()
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      })

      if (response.ok) {
        await fetchGoals()
        await fetchFlwyBalance() // Update balance if completed
      }
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        await fetchGoals()
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const createHabit = async (habit: Partial<Habit>) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(habit),
      })

      if (response.ok) {
        await fetchHabits()
      }
    } catch (error) {
      console.error('Error creating habit:', error)
    }
  }

  const completeHabit = async (id: string, date: string) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, date, completed: true }),
      })

      if (response.ok) {
        await fetchHabits()
        await fetchFlwyBalance() // Update balance for streak
      }
    } catch (error) {
      console.error('Error completing habit:', error)
    }
  }

  const redeemReward = async (rewardId: string) => {
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rewardId }),
      })

      if (response.ok) {
        await fetchFlwyBalance()
        await fetchRewards()
      }
    } catch (error) {
      console.error('Error redeeming reward:', error)
    }
  }

  return (
    <GamificationContext.Provider value={{
      goals,
      habits,
      flwyBalance,
      achievements,
      rewards,
      loading,
      refreshGoals: fetchGoals,
      refreshHabits: fetchHabits,
      refreshFlwyBalance: fetchFlwyBalance,
      createGoal,
      updateGoal,
      deleteGoal,
      createHabit,
      completeHabit,
      redeemReward
    }}>
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider')
  }
  return context
}