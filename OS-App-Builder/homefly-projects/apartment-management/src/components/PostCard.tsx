import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

interface PostCardProps {
  post: {
    id: string
    author: {
      name: string
      avatar: string
      unit: string
    }
    content: string
    images?: string[]
    timestamp: string
    likes: number
    comments: number
    isLiked: boolean
  }
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className="glass-dark rounded-2xl p-6 mb-6 hover:bg-gray-800/40 transition-all duration-300 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-600/50"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">
              {post.author.name}
            </h3>
            <p className="text-xs text-gray-400">
              Unit {post.author.unit} • {post.timestamp}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-full">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-100 text-sm leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.images.map((image, index) => (
              <div key={index} className="relative overflow-hidden rounded-xl group">
                <img
                  src={image}
                  alt=""
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
        <span>{likesCount} likes</span>
        <span>{post.comments} comments</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
        <div className="flex items-center space-x-1">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
              isLiked 
                ? 'text-red-500 bg-red-500/10' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
            } ${isAnimating ? 'like-animation' : ''}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">Like</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-200">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Comment</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-500/10 transition-all duration-200">
            <Share2 className="w-4 h-4" />
            <span className="text-xs font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}