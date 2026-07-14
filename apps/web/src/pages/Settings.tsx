import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Shield, Globe, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { api } from '../lib/api'
import { queryKeys } from '../lib/query-keys'
import type { Domain } from '../types'

function SortableDomainItem({ domain, onDelete }: { domain: Domain; onDelete: (id: string, name: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: domain.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    backgroundColor: isDragging ? 'var(--tw-colors-gray-50)' : undefined,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 transition-colors ${isDragging ? 'bg-gray-100 dark:bg-gray-800 shadow-sm relative z-10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{domain.name}</span>
      </div>
      <button
        onClick={() => onDelete(domain.id, domain.name)}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
        title="Delete domain"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
  )
}

export default function Settings() {
  const queryClient = useQueryClient()

  const [newDomain, setNewDomain] = useState('')
  const [domainError, setDomainError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' })

  const { data: domainsData, isLoading: domainsLoading } = useQuery({
    queryKey: queryKeys.domains.list(),
    queryFn: api.domains.list,
  })
  const domains = domainsData?.domains || []

  const addDomainMutation = useMutation({
    mutationFn: api.domains.create,
    onSuccess: () => {
      setNewDomain('')
      setDomainError('')
      queryClient.invalidateQueries({ queryKey: queryKeys.domains.list() })
    },
    onError: (err: Error) => setDomainError(err.message),
  })

  const deleteDomainMutation = useMutation({
    mutationFn: api.domains.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.domains.list() }),
  })

  const reorderDomainsMutation = useMutation({
    mutationFn: api.domains.reorder,
    onMutate: async (newDomainIds) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.domains.list() })
      const previousData = queryClient.getQueryData(queryKeys.domains.list()) as { domains: Domain[] } | undefined

      if (previousData) {
        const domainMap = new Map(previousData.domains.map(d => [d.id, d]))
        const newDomains = newDomainIds.map(id => domainMap.get(id)).filter(Boolean) as Domain[]
        queryClient.setQueryData(queryKeys.domains.list(), { domains: newDomains })
      }
      return { previousData }
    },
    onError: (_err, _newDomainIds, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.domains.list(), context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.domains.list() })
    },
  })

  const changePwdMutation = useMutation({
    mutationFn: () => api.auth.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setPwdMsg({ type: 'success', text: 'Password changed successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwdMsg({ type: '', text: '' }), 5000)
    },
    onError: (err: Error) => setPwdMsg({ type: 'error', text: err.message }),
  })

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDomain) return
    addDomainMutation.mutate(newDomain)
  }

  const handleDeleteDomain = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? Existing emails will not be deleted.`)) {
      deleteDomainMutation.mutate(id)
    }
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return setPwdMsg({ type: 'error', text: 'New passwords do not match' })
    }
    if (newPassword.length < 6) {
      return setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters' })
    }
    setPwdMsg({ type: '', text: '' })
    changePwdMutation.mutate()
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = domains.findIndex((d) => d.id === active.id)
      const newIndex = domains.findIndex((d) => d.id === over.id)

      const newDomains = arrayMove(domains, oldIndex, newIndex)
      const newDomainIds = newDomains.map(d => d.id)

      reorderDomainsMutation.mutate(newDomainIds)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50/50 dark:bg-gray-950 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 pt-0">
      <div className="flex flex-col flex-1 space-y-6 pt-4">

        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-8">Settings</h1>
        </div>

        {/* Domain Management Card */}
        <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Domain Management</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Manage the domains available for receiving emails.</p>
          </div>

          <div className="p-6">
            <div className="mb-6 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
              {domainsLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">Loading domains...</div>
              ) : domains.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No domains added yet.</div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    <SortableContext
                      items={domains.map(d => d.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {domains.map(d => (
                        <SortableDomainItem
                          key={d.id}
                          domain={d}
                          onDelete={handleDeleteDomain}
                        />
                      ))}
                    </SortableContext>
                  </ul>
                </DndContext>
              )}
            </div>

            <form onSubmit={handleAddDomain} className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  placeholder="e.g. example.com"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={addDomainMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {addDomainMutation.isPending ? 'Adding...' : 'Add Domain'}
              </button>
            </form>
            {domainError && <p className="text-sm text-red-500 mt-2">{domainError}</p>}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Update your administrator password.</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password" required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                />
              </div>

              {pwdMsg.text && (
                <div className={`p-3 rounded-lg text-sm ${pwdMsg.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'}`}>
                  {pwdMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={changePwdMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {changePwdMutation.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
