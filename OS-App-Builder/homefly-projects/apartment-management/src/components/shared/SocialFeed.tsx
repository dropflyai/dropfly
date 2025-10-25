'use client'

import React, { useState } from 'react'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Camera, 
  MapPin, 
  MoreHorizontal,
  Plus,
  Send,
  Smile,
  X,
  Image as ImageIcon,
  Video
} from 'lucide-react'
// ProMediaEditor removed - apartment system only

interface Post {
  id: string
  author: {
    name: string
    avatar: string
    role: string
  }
  content: string
  image?: string
  isVideo?: boolean
  timestamp: string
  likes: number
  comments: number
  liked: boolean
}

export default function SocialFeed({ communityType = 'apartment' }: { communityType?: string }) {
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showPhotoEditor, setShowPhotoEditor] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Sarah Thompson',
        avatar: '👩',
        role: 'Property Manager'
      },
      content: 'Reminder: Pool area will be closed tomorrow morning for routine maintenance. Should be reopened by noon. Thank you for your patience! 🏊‍♀️',
      timestamp: '2 hours ago',
      likes: 15,
      comments: 3,
      liked: false
    },
    {
      id: '2',
      author: {
        name: 'Mike Johnson',
        avatar: '👨',
        role: 'Resident • Unit 4B'
      },
      content: 'Just wanted to thank maintenance for fixing my AC so quickly! You guys are the best! 🙏',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      timestamp: '5 hours ago',
      likes: 28,
      comments: 7,
      liked: true
    },
    {
      id: '3',
      author: {
        name: 'Emma Davis',
        avatar: '👩‍🦰',
        role: 'Resident • Unit 2A'
      },
      content: 'Beautiful sunset view from the rooftop terrace tonight! This is why I love living here 🌅',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      timestamp: '1 day ago',
      likes: 45,
      comments: 12,
      liked: false
    },
    {
      id: '4',
      author: {
        name: 'Community Board',
        avatar: '🏢',
        role: 'Official'
      },
      content: 'Don\'t forget! Community BBQ this Saturday at 6 PM in the courtyard. Bring your family and friends! Food and drinks provided. See you there! 🍔🌭',
      timestamp: '2 days ago',
      likes: 67,
      comments: 23,
      liked: true
    }
  ])

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        }
      }
      return post
    }))
  }

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        avatar: '😊',
        role: 'Resident'
      },
      content: newPostContent,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      liked: false
    }

    setPosts([newPost, ...posts])
    setNewPostContent('')
    setShowCreatePost(false)
  }

  const handleMediaPost = (mediaData: string, caption: string, filters: any) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        avatar: '😊',
        role: 'Resident'
      },
      content: caption,
      image: mediaData,
      isVideo: filters.isVideo || false,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      liked: false
    }

    setPosts([newPost, ...posts])
  }

  return (
    <div className="relative">
      {/* Sticky Create Post Toolbar */}
      <div className="sticky top-0 z-10 mb-6">
        <div className="max-w-xl mx-auto">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                😊
              </div>
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2 text-left text-white/60 transition-colors text-sm"
              >
                What's happening in the {communityType === 'hoa' ? 'neighborhood' : 'community'}?
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => {
                    console.log('Camera button clicked, opening PhotoEditor')
                    setShowPhotoEditor(true)
                  }}
                  className="flex items-center space-x-1 text-white/60 hover:text-white transition-colors text-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>Photo/Video</span>
                </button>
                <button className="flex items-center space-x-1 text-white/60 hover:text-white transition-colors text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </button>
              </div>
              
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:scale-105"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed - Centered */}
      <div className="max-w-xl mx-auto">
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/8 transition-all duration-300">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                    {post.author.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-medium text-sm">{post.author.name}</h3>
                    <p className="text-white/50 text-xs">{post.author.role} • {post.timestamp}</p>
                  </div>
                </div>
                <button className="text-white/40 hover:text-white/60 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Post Content */}
              <p className="text-white/90 mb-3 text-sm leading-relaxed">{post.content}</p>

              {/* Post Media - Instagram Style */}
              {post.image && (
                <div className="mb-3 rounded-xl overflow-hidden aspect-square">
                  {post.isVideo ? (
                    <video 
                      src={post.image} 
                      className="w-full h-full object-cover" 
                      controls
                      playsInline
                    />
                  ) : (
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                    />
                  )}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                      post.liked 
                        ? 'bg-pink-500/20 text-pink-400' 
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">{post.likes}</span>
                  </button>

                  <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">{post.comments}</span>
                  </button>
                </div>

                <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/20 rounded-3xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create Post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                😊
              </div>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`Share something with your ${communityType === 'hoa' ? 'neighbors' : 'community'}...`}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 h-32 resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <ImageIcon className="w-5 h-5 text-white/60" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <Smile className="w-5 h-5 text-white/60" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <MapPin className="w-5 h-5 text-white/60" />
                </button>
              </div>
              
              <button
                onClick={handleCreatePost}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 px-6 py-2 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Editor removed - apartment system only */}
    </div>
  )
}