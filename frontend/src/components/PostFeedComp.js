import React from "react";
import { MapPin } from "lucide-react";

const PostsFeedComp = ({ posts }) => {
  return (
    <div className="p-4 space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{post.author.initials}</span>
            </div>
            <div>
              <p className="font-semibold text-sm">{post.author.name}</p>
              <p className="text-xs text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          <p className="text-gray-800 text-sm mb-3">{post.content}</p>
          {post.location && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-800">{post.location}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostsFeedComp;