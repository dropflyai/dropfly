import { useState } from 'react'
import { Image, Smile, MapPin, Calendar } from 'lucide-react'

interface CreatePostProps {
  user: {
    name: string
    avatar: string
  }
  onSubmit: (content: string, images?: File[]) => void
}

export default function CreatePost({ user, onSubmit }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() || selectedImages.length > 0) {
      onSubmit(content, selectedImages)
      setContent('')
      setSelectedImages([])
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files))
    }
  }

  return (
    <div className="glass-dark rounded-2xl p-6 mb-6 border border-gray-700/50">
      <div className="flex space-x-4">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-600/50"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in the community?"
              className="w-full border-none resize-none bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm leading-relaxed min-h-[80px]"
              rows={3}
            />
            
            {/* Image Preview */}
            {selectedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="rounded-xl object-cover w-full h-32"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/50">
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer p-2 rounded-full hover:bg-blue-500/10 transition-colors group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Image className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </label>
                
                <button type="button" className="p-2 rounded-full hover:bg-yellow-500/10 transition-colors group">
                  <Smile className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                </button>
                
                <button type="button" className="p-2 rounded-full hover:bg-green-500/10 transition-colors group">
                  <MapPin className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                </button>
                
                <button type="button" className="p-2 rounded-full hover:bg-purple-500/10 transition-colors group">
                  <Calendar className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!content.trim() && selectedImages.length === 0}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-full font-medium transition-all duration-200 btn-hover disabled:transform-none disabled:shadow-none"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}