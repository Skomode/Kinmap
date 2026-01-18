import React from "react";
import { X } from "lucide-react";

const CommentItemComp = ({ comment, currentUser, onDelete }) => {
  const author = comment.authorId || {};

  const isAuthor = currentUser?._id === author._id;

  return (
    <div className="flex items-start gap-2">
      <img
        src={author.profilePicture || "https://i.ibb.co/4pDNDk1/default-circle.png"}
        alt={author.firstName || "Usuario"}
        className="w-8 h-8 rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "https://i.ibb.co/4pDNDk1/default-circle.png";
        }}
      />
      <div className="flex-1 bg-gray-100 rounded px-2 py-1 text-sm">
        <div className="flex justify-between items-center">
          <span className="font-medium">
            {isAuthor ? "Yo" : `${author.firstName} ${author.lastName}`}
          </span>
          {isAuthor && onDelete && (
            <button onClick={() => onDelete(comment._id)}>
              <X className="w-3 h-3 text-gray-500 hover:text-red-600" />
            </button>
          )}
        </div>
        <p>{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentItemComp;
