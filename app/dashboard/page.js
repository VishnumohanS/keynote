"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter } from "lucide-react"
import NoteCard from "@/components/NoteCard"
import NoteForm from "@/components/NoteForm"

export default function DashboardPage() {
  const router = useRouter()
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [user, setUser] = useState(null)

  const topics = ["Scales", "Chords", "Harmvbn ony", "Rhythm", "Melody", "Theory", "Composition", "Analysis", "Other"]

  useEffect(() => {
    checkAuth()
    fetchNotes()
  }, [])

  useEffect(() => {
    filterNotes()
  }, [notes, searchTerm, selectedTopic])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push("/login")
      }
    } catch (error) {
      router.push("/login")
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes")
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      } else if (response.status === 401) {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterNotes = () => {
    let filtered = notes

    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedTopic) {
      filtered = filtered.filter((note) => note.topic === selectedTopic)
    }

    setFilteredNotes(filtered)
  }

  const handleSaveNote = (savedNote) => {
    if (editingNote) {
      setNotes(notes.map((note) => (note._id === savedNote._id ? savedNote : note)))
    } else {
      setNotes([savedNote, ...notes])
    }
    setShowForm(false)
    setEditingNote(null)
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setShowForm(true)
  }

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotes(notes.filter((note) => note._id !== noteId))
      } else {
        alert("Failed to delete note")
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      alert("Failed to delete note")
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingNote(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Manage your music theory notes and continue your learning journey.</p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Topic Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="input-field pl-10 pr-8"
            >
              <option value="">All Topics</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Note Button */}
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Note</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">{notes.length}</div>
          <div className="text-sm text-gray-600">Total Notes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">{new Set(notes.map((note) => note.topic)).size}</div>
          <div className="text-sm text-gray-600">Topics Covered</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">{filteredNotes.length}</div>
          <div className="text-sm text-gray-600">Filtered Results</div>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {notes.length === 0 ? "No notes yet" : "No notes match your search"}
          </h3>
          <p className="text-gray-600 mb-6">
            {notes.length === 0
              ? "Start building your music theory knowledge by creating your first note."
              : "Try adjusting your search terms or filters."}
          </p>
          {notes.length === 0 && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Create Your First Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note._id} note={note} onEdit={handleEditNote} onDelete={handleDeleteNote} />
          ))}
        </div>
      )}

      {/* Note Form Modal */}
      <NoteForm note={editingNote} onSave={handleSaveNote} onCancel={handleCancelForm} isOpen={showForm} />
    </div>
  )
}
